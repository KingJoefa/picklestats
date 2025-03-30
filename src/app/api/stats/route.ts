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
      return errorResponse('No players specified', 400)
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
      })
    }
    
    return successResponse({ stats, headToHead })
  } catch (error) {
    console.error('Error fetching stats:', error)
    return errorResponse('Failed to fetch stats')
  }
} 