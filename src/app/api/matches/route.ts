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
    }).catch(err => {
      console.error('Prisma error fetching matches:', err)
      throw new Error(`Database error: ${err.message || 'Unknown error'}`)
    })
    
    if (!matches || matches.length === 0) {
      return successResponse({ 
        data: [],
        message: 'No match history found.'
      })
    }
    
    return successResponse({ data: matches })
  } catch (error) {
    console.error('Error fetching matches:', error instanceof Error ? error.message : String(error))
    
    let errorMessage = 'Failed to fetch matches'
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

export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => {
      throw new Error('Invalid JSON in request body')
    })
    
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
    
    // Validate required fields
    const missingFields = []
    if (!team1PlayerAId) missingFields.push('team1PlayerAId')
    if (!team1PlayerBId) missingFields.push('team1PlayerBId')
    if (!team2PlayerAId) missingFields.push('team2PlayerAId')
    if (!team2PlayerBId) missingFields.push('team2PlayerBId')
    
    if (missingFields.length > 0) {
      return errorResponse(`Missing required fields: ${missingFields.join(', ')}`, 400)
    }
    
    // Validate score and winning team
    if (team1ScoreA === undefined || team1ScoreB === undefined || 
        team2ScoreA === undefined || team2ScoreB === undefined) {
      return errorResponse('All score fields are required', 400)
    }
    
    if (winningTeam !== 1 && winningTeam !== 2) {
      return errorResponse('winningTeam must be either 1 or 2', 400)
    }
    
    // Validate that players exist
    const playerIds = [team1PlayerAId, team1PlayerBId, team2PlayerAId, team2PlayerBId]
    const players = await prisma.player.findMany({
      where: {
        id: {
          in: playerIds
        }
      },
      select: { id: true }
    }).catch(err => {
      console.error('Prisma error validating players:', err)
      throw new Error(`Database error validating players: ${err.message || 'Unknown error'}`)
    })
    
    if (players.length !== 4) {
      const foundIds = new Set(players.map(p => p.id))
      const invalidIds = playerIds.filter(id => !foundIds.has(id))
      return errorResponse(`Invalid player IDs: ${invalidIds.join(', ')}`, 400)
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
    }).catch(err => {
      console.error('Prisma error creating match:', err)
      throw new Error(`Database error creating match: ${err.message || 'Unknown error'}`)
    })
    
    try {
      // Update player stats
      await updatePlayerStats(
        [team1PlayerAId, team1PlayerBId], 
        [team2PlayerAId, team2PlayerBId], 
        winningTeam,
        { team1: team1ScoreA + team1ScoreB, team2: team2ScoreA + team2ScoreB }
      )
    } catch (statsError) {
      // Log the error but don't fail the request since the match was created
      console.error('Error updating player stats:', statsError)
      return successResponse({ 
        match,
        warning: 'Match recorded but player stats could not be updated'
      })
    }
    
    return successResponse({ match })
  } catch (error) {
    console.error('Error creating match:', error instanceof Error ? error.message : String(error))
    
    let errorMessage = 'Failed to create match'
    let statusCode = 500
    
    if (error instanceof Error) {
      if (error.message.includes('database') || error.message.includes('prisma')) {
        errorMessage = 'Database connection error. Please check configuration.'
      } else if (error.message.includes('timeout')) {
        errorMessage = 'Request timed out. Please try again.'
      } else if (error.message.includes('Invalid JSON')) {
        errorMessage = 'Invalid request format. Please check your data.'
        statusCode = 400
      } else if (error.message.includes('Invalid player')) {
        errorMessage = error.message
        statusCode = 400
      }
    }
    
    return errorResponse(errorMessage, statusCode)
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