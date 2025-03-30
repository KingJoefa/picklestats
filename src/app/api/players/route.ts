import { prisma } from '@/lib/prisma'
import { apiConfig, successResponse, errorResponse } from '@/lib/api-config'

export const { runtime, dynamic } = apiConfig

export async function GET() {
  try {
    const players = await prisma.player.findMany({
      include: {
        stats: true
      }
    })
    
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
    console.error('Error fetching players:', error)
    return errorResponse('Failed to fetch players')
  }
} 