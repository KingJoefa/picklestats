import { NextApiRequest, NextApiResponse } from 'next'
import { PrismaClient } from '@prisma/client'

interface FormattedPlayer {
  id: string;
  name: string;
  profilePicture: string;
  isArchived: boolean;
  stats: {
    matches: number;
    wins: number;
    losses: number;
    winRate: number;
    pointsScored: number;
    pointsConceded: number;
  };
}

interface PlayerWithArchived {
  id: string;
  name: string;
  profilePicture: string;
  isArchived: boolean;
  stats: any;
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET') {
    try {
      console.log('Connecting to database with Prisma...')
      
      // Create Prisma client with more explicit error logging
      const prisma = new PrismaClient({
        datasources: {
          db: {
            url: process.env.DATABASE_URL + '?sslmode=require'
          }
        },
        log: ['query', 'info', 'warn', 'error'],
      })

      console.log('Prisma client created successfully')
      
      try {
        console.log('Fetching players from database using Pages Router API...')
        const players = (await prisma.player.findMany({
          include: {
            stats: true
          }
        })) as unknown as PlayerWithArchived[]
        
        await prisma.$disconnect()
        
        if (!players || players.length === 0) {
          console.log('No players found in database.')
          return res.status(200).json({ 
            success: true,
            data: [],
            message: 'No players found in database. Try running the seed script.'
          })
        }
        
        console.log(`Found ${players.length} players.`)
        
        // For each player, fetch ALL matches and aggregate stats
        const playerIds = players.map(p => p.id)
        const matchesByPlayer: { [key: string]: any[] } = {};
        for (const playerId of playerIds) {
          const matches = await prisma.match.findMany({
            where: {
              OR: [
                { team1PlayerAId: playerId },
                { team1PlayerBId: playerId },
                { team2PlayerAId: playerId },
                { team2PlayerBId: playerId }
              ]
            },
            orderBy: { date: 'desc' },
            include: {
              team1PlayerA: true,
              team1PlayerB: true,
              team2PlayerA: true,
              team2PlayerB: true
            }
          })
          matchesByPlayer[playerId] = matches
        }

        const formattedPlayers = players.map(player => {
          const matches = matchesByPlayer[player.id] || [];
          let wins = 0, losses = 0, pointsScored = 0, pointsConceded = 0;
          matches.forEach(match => {
            let team = null;
            if (match.team1PlayerAId === player.id || match.team1PlayerBId === player.id) team = 1;
            if (match.team2PlayerAId === player.id || match.team2PlayerBId === player.id) team = 2;
            const won = match.winningTeam === team;
            if (won) wins++; else losses++;
            // Sum both A and B scores for each team
            const team1Total = (match.team1ScoreA || 0) + (match.team1ScoreB || 0);
            const team2Total = (match.team2ScoreA || 0) + (match.team2ScoreB || 0);
            if (team === 1) {
              pointsScored += team1Total;
              pointsConceded += team2Total;
            } else if (team === 2) {
              pointsScored += team2Total;
              pointsConceded += team1Total;
            }
          });
          const totalMatches = wins + losses;
          const winRate = totalMatches > 0 ? (wins / totalMatches) * 100 : 0;
          return {
            id: player.id,
            name: player.name,
            profilePicture: player.profilePicture,
            isArchived: player.isArchived,
            stats: {
              matches: totalMatches,
              wins,
              losses,
              winRate: winRate,
              pointsScored,
              pointsConceded
            }
          } as FormattedPlayer;
        });

        // Filter out archived players
        const activePlayers = formattedPlayers.filter(player => !player.isArchived);

        // Sort players: first by games played (descending), then alphabetically by name
        activePlayers.sort((a, b) => {
          if (b.stats.matches !== a.stats.matches) {
            return b.stats.matches - a.stats.matches;
          }
          return a.name.localeCompare(b.name);
        });
        
        return res.status(200).json({ 
          success: true,
          data: activePlayers 
        })
      } catch (dbError) {
        // Make sure to disconnect on error
        await prisma.$disconnect().catch(() => {}) // Silence disconnect errors
        throw dbError // Re-throw for handling below
      }
    } catch (error) {
      console.error('Error in players API:', error)
      return res.status(500).json({ 
        success: false, 
        error: 'Failed to fetch players',
        details: error instanceof Error ? error.message : String(error)
      })
    }
  }
  
  return res.status(405).json({ success: false, message: 'Method not allowed' })
} 