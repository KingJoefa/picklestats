import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export const runtime = 'edge'
export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const playerIds = searchParams.get('players')?.split(',').filter(Boolean) || []

    // Get stats based on query parameters
    const stats = await prisma.playerStats.findMany({
      where: playerIds.length > 0 ? {
        playerId: {
          in: playerIds
        }
      } : undefined,
      include: {
        player: {
          select: {
            id: true,
            name: true,
            profilePicture: true
          }
        }
      },
      orderBy: {
        winRate: 'desc'
      }
    })

    const formattedStats = stats.map(stat => ({
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

    // Get head-to-head stats if exactly 2 players
    let headToHead = null
    if (playerIds.length === 2) {
      const [player1, player2] = playerIds
      const matches = await prisma.match.findMany({
        where: {
          OR: [
            {
              AND: [
                { OR: [{ team1PlayerAId: player1 }, { team1PlayerBId: player1 }] },
                { OR: [{ team2PlayerAId: player2 }, { team2PlayerBId: player2 }] }
              ]
            },
            {
              AND: [
                { OR: [{ team1PlayerAId: player2 }, { team1PlayerBId: player2 }] },
                { OR: [{ team2PlayerAId: player1 }, { team2PlayerBId: player1 }] }
              ]
            }
          ]
        },
        orderBy: {
          date: 'desc'
        },
        take: 5
      })

      headToHead = {
        matches,
        summary: {
          totalMatches: matches.length,
          player1Wins: matches.filter(m => 
            ((m.team1PlayerAId === player1 || m.team1PlayerBId === player1) && m.winningTeam === 1) ||
            ((m.team2PlayerAId === player1 || m.team2PlayerBId === player1) && m.winningTeam === 2)
          ).length,
          player2Wins: matches.filter(m => 
            ((m.team1PlayerAId === player2 || m.team1PlayerBId === player2) && m.winningTeam === 1) ||
            ((m.team2PlayerAId === player2 || m.team2PlayerBId === player2) && m.winningTeam === 2)
          ).length
        }
      }
    }

    return NextResponse.json({
      stats: formattedStats,
      headToHead
    })
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch stats' },
      { status: 500 }
    )
  }
} 