import { prisma } from '@/lib/prisma'
import { apiConfig, successResponse, errorResponse } from '@/lib/api-config'
import { NextRequest } from 'next/server'
import { Match } from '@prisma/client'

export const { runtime, dynamic } = apiConfig

export async function GET(request: NextRequest) {
  try {
    const url = new URL(request.url)
    const playerIds = url.searchParams.get('players')?.split(',') || []
    
    if (!playerIds.length) {
      return errorResponse('Please select at least one player to view stats', 400)
    }
    
    // Validate player IDs
    const validPlayerIds = await prisma.player.findMany({
      where: {
        id: {
          in: playerIds
        }
      },
      select: { id: true }
    }).catch(err => {
      console.error('Prisma error validating player IDs:', err)
      throw new Error(`Database error validating players: ${err.message || 'Unknown error'}`)
    })
    
    const validIdSet = new Set(validPlayerIds.map(p => p.id))
    const invalidIds = playerIds.filter(id => !validIdSet.has(id))
    
    if (invalidIds.length > 0) {
      return errorResponse(`Invalid player IDs: ${invalidIds.join(', ')}`, 400)
    }
    
    // Get player stats
    const playerStats = await prisma.playerStats.findMany({
      where: {
        playerId: {
          in: playerIds
        }
      },
      include: {
        player: true
      }
    }).catch(err => {
      console.error('Prisma error fetching player stats:', err)
      throw new Error(`Database error fetching stats: ${err.message || 'Unknown error'}`)
    })
    
    // Format stats for response
    const stats = playerStats.map(stat => ({
      id: stat.id,
      player: {
        id: stat.player.id,
        name: stat.player.name,
        profilePicture: stat.player.profilePicture
      },
      totalMatches: stat.totalMatches,
      wins: stat.wins,
      losses: stat.losses,
      winRate: stat.winRate * 100, // Convert to percentage
      pointsScored: stat.pointsScored,
      pointsConceded: stat.pointsConceded
    }))
    
    // Get head-to-head matches if there are 2 players
    let headToHead: Match[] = []
    if (playerIds.length === 2) {
      headToHead = await prisma.match.findMany({
        where: {
          OR: [
            {
              AND: [
                { team1PlayerAId: playerIds[0] },
                { team2PlayerAId: playerIds[1] }
              ]
            },
            {
              AND: [
                { team1PlayerBId: playerIds[0] },
                { team2PlayerBId: playerIds[1] }
              ]
            },
            {
              AND: [
                { team1PlayerAId: playerIds[1] },
                { team2PlayerAId: playerIds[0] }
              ]
            },
            {
              AND: [
                { team1PlayerBId: playerIds[1] },
                { team2PlayerBId: playerIds[0] }
              ]
            }
          ]
        },
        orderBy: {
          date: 'desc'
        },
        take: 5
      }).catch(err => {
        console.error('Prisma error fetching head to head matches:', err)
        // Continue with empty head-to-head data rather than failing the entire request
        return []
      })
    }
    
    return successResponse({ 
      stats, 
      headToHead,
      message: stats.length === 0 ? 'No stats available for the selected players' : undefined
    })
  } catch (error) {
    console.error('Error fetching stats:', error instanceof Error ? error.message : String(error))
    
    let errorMessage = 'Failed to fetch player statistics'
    let statusCode = 500
    
    if (error instanceof Error) {
      if (error.message.includes('database') || error.message.includes('prisma')) {
        errorMessage = 'Database connection error. Please check configuration.'
      } else if (error.message.includes('timeout')) {
        errorMessage = 'Request timed out. Please try again.'
      } else if (error.message.includes('Invalid player')) {
        errorMessage = error.message
        statusCode = 400
      }
    }
    
    return errorResponse(errorMessage, statusCode)
  }
} 