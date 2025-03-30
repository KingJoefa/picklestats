import { prisma } from '@/lib/prisma'
import { apiConfig, successResponse, errorResponse } from '@/lib/api-config'
import { NextRequest } from 'next/server'

export const { runtime, dynamic } = apiConfig

export async function GET() {
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
    
    return successResponse({ data: matches })
  } catch (error) {
    console.error('Error fetching matches:', error)
    return errorResponse('Failed to fetch matches')
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
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
    } = body
    
    if (!team1PlayerAId || !team1PlayerBId || !team2PlayerAId || !team2PlayerBId) {
      return errorResponse('All player IDs are required', 400)
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
    
    return successResponse({ match })
  } catch (error) {
    console.error('Error creating match:', error)
    return errorResponse('Failed to create match')
  }
}

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