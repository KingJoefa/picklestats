import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

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

      return NextResponse.json({ stats, headToHead })
    }
  } catch (error) {
    console.error('Error fetching stats:', error)
    return NextResponse.json(
      { error: 'Failed to fetch stats' },
      { status: 500 }
    )
  }
} 