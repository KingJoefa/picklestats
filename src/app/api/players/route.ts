// This file is temporarily disabled to prevent build errors
// The functionality is available through the Pages Router API at /api/v1/players

import { prisma } from '@/lib/prisma'
import { NextResponse } from 'next/server'

// export const { runtime, dynamic } = apiConfig

/*
export async function GET(request: NextRequest) {
  try {
    console.log('Fetching players from database...')
    const players = await prisma.player.findMany({
      include: {
        stats: true
      }
    }).catch(err => {
      console.error('Prisma error in players/route.ts:', err)
      throw new Error(`Database error: ${err.message || 'Unknown error'}`)
    })
    
    if (!players || players.length === 0) {
      console.log('No players found in database.')
      return successResponse({ 
        data: [],
        message: 'No players found in database. Try running the seed script.'
      })
    }
    
    console.log(`Found ${players.length} players.`)
    const formattedPlayers = players.map(player => ({
      id: player.id,
      name: player.name,
      profilePicture: player.profilePicture,
      stats: {
        matches: player.stats?.totalMatches || 0,
        wins: player.stats?.wins || 0,
        losses: player.stats?.losses || 0,
        winRate: player.stats?.winRate || 0
      }
    }))
    
    return successResponse({ data: formattedPlayers })
  } catch (error) {
    console.error('Error fetching players:', error instanceof Error ? error.message : String(error))
    
    let errorMessage = 'Failed to fetch players'
    let statusCode = 500
    
    if (error instanceof Error) {
      if (error.message.includes('database') || error.message.includes('prisma')) {
        errorMessage = 'Database connection error. Please check configuration.'
      } else if (error.message.includes('timeout')) {
        errorMessage = 'Request timed out. Please try again.'
      }
    }
    
    return errorResponse(errorMessage, statusCode)
  }
}
*/

// Using dynamic export to ensure this doesn't cause build-time errors
export const dynamic = 'force-dynamic'

// Simple response to indicate this API is temporarily disabled
export async function GET() {
  try {
    console.log('Fetching players from database...')
    const players = await prisma.player.findMany({
      include: {
        stats: true
      }
    }).catch(err => {
      console.error('Prisma error in players/route.ts:', err)
      throw new Error(`Database error: ${err.message || 'Unknown error'}`)
    })
    
    if (!players || players.length === 0) {
      console.log('No players found in database.')
      return NextResponse.json({ 
        data: [],
        message: 'No players found in database. Try running the seed script.'
      })
    }
    
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
        stats: {
          matches: totalMatches,
          wins,
          losses,
          winRate: winRate,
          pointsScored,
          pointsConceded
        }
      }
    })

    return NextResponse.json({ data: formattedPlayers })
  } catch (error) {
    console.error('Error fetching players:', error instanceof Error ? error.message : String(error))
    
    let errorMessage = 'Failed to fetch players'
    let statusCode = 500
    
    if (error instanceof Error) {
      if (error.message.includes('database') || error.message.includes('prisma')) {
        errorMessage = 'Database connection error. Please check configuration.'
      } else if (error.message.includes('timeout')) {
        errorMessage = 'Request timed out. Please try again.'
      }
    }
    
    return NextResponse.json({ error: errorMessage }, { status: statusCode })
  }
} 