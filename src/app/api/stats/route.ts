import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

interface PlayerStat {
  id: string
  playerId: string
  totalMatches: number
  wins: number
  losses: number
  winRate: number
  pointsScored: number
  pointsConceded: number
  player: {
    id: string
    name: string
    profilePicture: string
  }
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const playerIds = searchParams.get('players')?.split(',') || []
  
  try {
    if (playerIds.length === 0) {
      // Get all player stats
      const stats = await prisma.playerStats.findMany({
        include: {
          player: true
        }
      })
      return NextResponse.json(stats)
    } else {
      // Get stats for specific players
      const stats = await prisma.playerStats.findMany({
        where: {
          playerId: {
            in: playerIds
          }
        },
        include: {
          player: true
        }
      })

      // Format stats before returning
      const formattedStats = stats.map((stat: PlayerStat) => ({
        id: stat.id,
        player: {
          id: stat.player.id,
          name: stat.player.name,
          profilePicture: stat.player.profilePicture
        },
        totalMatches: stat.totalMatches,
        wins: stat.wins,
        losses: stat.losses,
        winRate: stat.winRate,
        pointsScored: stat.pointsScored,
        pointsConceded: stat.pointsConceded
      }))

      // Get head-to-head matches if exactly 2 players selected
      let headToHead = null
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
                  { team1PlayerAId: playerIds[1] },
                  { team2PlayerAId: playerIds[0] }
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
                  { team1PlayerBId: playerIds[1] },
                  { team2PlayerBId: playerIds[0] }
                ]
              }
            ]
          },
          orderBy: {
            date: 'desc'
          }
        })
      }

      return NextResponse.json({ stats: formattedStats, headToHead })
    }
  } catch (error) {
    console.error('Error fetching stats:', error)
    return NextResponse.json(
      { error: 'Failed to fetch stats' },
      { status: 500 }
    )
  }
} 