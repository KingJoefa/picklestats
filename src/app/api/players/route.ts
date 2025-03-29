import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { apiConfig, successResponse, errorResponse } from '@/lib/api-config'

export const { runtime, dynamic } = apiConfig

export async function GET() {
  try {
    const players = await prisma.player.findMany({
      select: {
        id: true,
        name: true,
        profilePicture: true,
        stats: {
          select: {
            totalMatches: true,
            wins: true,
            losses: true,
            winRate: true,
            pointsScored: true,
            pointsConceded: true
          }
        }
      },
      orderBy: {
        name: 'asc'
      }
    })

    return successResponse({
      players: players.map(formatPlayerResponse)
    })
  } catch (error) {
    return errorResponse('Failed to fetch players')
  }
}

export async function POST(request: NextRequest) {
  try {
    const data = await request.json()
    
    if (!isValidPlayerData(data)) {
      return errorResponse('Name and profile picture are required', 400)
    }

    const player = await prisma.player.create({
      data: {
        name: data.name,
        profilePicture: data.profilePicture,
        stats: {
          create: {
            totalMatches: 0,
            wins: 0,
            losses: 0,
            winRate: 0,
            pointsScored: 0,
            pointsConceded: 0
          }
        }
      },
      select: {
        id: true,
        name: true,
        profilePicture: true,
        stats: {
          select: {
            totalMatches: true,
            wins: true,
            losses: true,
            winRate: true,
            pointsScored: true,
            pointsConceded: true
          }
        }
      }
    })

    return successResponse({
      player: formatPlayerResponse(player)
    }, 201)
  } catch (error) {
    return errorResponse('Failed to create player')
  }
}

function isValidPlayerData(data: any): boolean {
  return !!(data.name && data.profilePicture)
}

function formatPlayerResponse(player: any) {
  return {
    id: player.id,
    name: player.name,
    profilePicture: player.profilePicture,
    stats: player.stats ? {
      totalMatches: player.stats.totalMatches,
      wins: player.stats.wins,
      losses: player.stats.losses,
      winRate: player.stats.winRate,
      pointsScored: player.stats.pointsScored,
      pointsConceded: player.stats.pointsConceded
    } : {
      totalMatches: 0,
      wins: 0,
      losses: 0,
      winRate: 0,
      pointsScored: 0,
      pointsConceded: 0
    }
  }
} 