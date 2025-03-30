import { NextApiRequest, NextApiResponse } from 'next'
import { PrismaClient } from '@prisma/client'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const prisma = new PrismaClient({
    datasources: {
      db: {
        url: process.env.DATABASE_URL + '?sslmode=require'
      }
    }
  })
  
  async function updatePlayerStats(
    team1Players: string[], 
    team2Players: string[], 
    winningTeam: number,
    score: { team1: number, team2: number }
  ) {
    // Update team 1 players
    for (const playerId of team1Players) {
      const playerStats = await prisma.playerStats.findUnique({
        where: { playerId }
      })
      
      if (playerStats) {
        await prisma.playerStats.update({
          where: { playerId },
          data: {
            totalMatches: playerStats.totalMatches + 1,
            wins: playerStats.wins + (winningTeam === 1 ? 1 : 0),
            losses: playerStats.losses + (winningTeam === 2 ? 1 : 0),
            winRate: (playerStats.wins + (winningTeam === 1 ? 1 : 0)) / 
                     (playerStats.totalMatches + 1),
            pointsScored: playerStats.pointsScored + score.team1,
            pointsConceded: playerStats.pointsConceded + score.team2
          }
        })
      }
    }
    
    // Update team 2 players
    for (const playerId of team2Players) {
      const playerStats = await prisma.playerStats.findUnique({
        where: { playerId }
      })
      
      if (playerStats) {
        await prisma.playerStats.update({
          where: { playerId },
          data: {
            totalMatches: playerStats.totalMatches + 1,
            wins: playerStats.wins + (winningTeam === 2 ? 1 : 0),
            losses: playerStats.losses + (winningTeam === 1 ? 1 : 0),
            winRate: (playerStats.wins + (winningTeam === 2 ? 1 : 0)) / 
                     (playerStats.totalMatches + 1),
            pointsScored: playerStats.pointsScored + score.team2,
            pointsConceded: playerStats.pointsConceded + score.team1
          }
        })
      }
    }
  }

  // GET endpoint to fetch matches
  if (req.method === 'GET') {
    try {
      const matches = await prisma.match.findMany({
        include: {
          team1PlayerA: true,
          team1PlayerB: true,
          team2PlayerA: true,
          team2PlayerB: true
        },
        orderBy: {
          date: 'desc'
        },
        take: 10
      })
      
      await prisma.$disconnect()
      
      return res.status(200).json({ 
        success: true,
        data: matches 
      })
    } catch (error) {
      console.error('Error fetching matches:', error)
      await prisma.$disconnect()
      
      return res.status(500).json({ 
        success: false, 
        error: 'Failed to fetch matches',
        details: error instanceof Error ? error.message : String(error)
      })
    }
  } 
  // POST endpoint to create a match
  else if (req.method === 'POST') {
    try {
      const { 
        team1PlayerAId, 
        team1PlayerBId, 
        team2PlayerAId, 
        team2PlayerBId, 
        team1ScoreA, 
        team1ScoreB, 
        team2ScoreA, 
        team2ScoreB, 
        winningTeam 
      } = req.body
      
      // Validate required fields
      if (!team1PlayerAId || !team1PlayerBId || !team2PlayerAId || !team2PlayerBId) {
        await prisma.$disconnect()
        return res.status(400).json({ 
          success: false, 
          error: 'All player IDs are required' 
        })
      }
      
      // Create the match
      const match = await prisma.match.create({
        data: {
          team1PlayerAId,
          team1PlayerBId,
          team2PlayerAId,
          team2PlayerBId,
          team1ScoreA,
          team1ScoreB,
          team2ScoreA,
          team2ScoreB,
          winningTeam,
          date: new Date()
        },
        include: {
          team1PlayerA: true,
          team1PlayerB: true,
          team2PlayerA: true,
          team2PlayerB: true
        }
      })
      
      // Update player stats
      await updatePlayerStats(
        [team1PlayerAId, team1PlayerBId], 
        [team2PlayerAId, team2PlayerBId], 
        winningTeam,
        { team1: team1ScoreA + team1ScoreB, team2: team2ScoreA + team2ScoreB }
      )
      
      await prisma.$disconnect()
      
      return res.status(201).json({ 
        success: true,
        match 
      })
    } catch (error) {
      console.error('Error creating match:', error)
      await prisma.$disconnect()
      
      return res.status(500).json({ 
        success: false, 
        error: 'Failed to create match',
        details: error instanceof Error ? error.message : String(error)
      })
    }
  } else {
    await prisma.$disconnect()
    res.setHeader('Allow', ['GET', 'POST'])
    res.status(405).end(`Method ${req.method} Not Allowed`)
  }
} 