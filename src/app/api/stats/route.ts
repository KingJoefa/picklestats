import { NextRequest } from 'next/server'
import { apiConfig, successResponse, errorResponse } from '@/lib/api-config'

export const dynamic = 'force-dynamic'
export const runtime = 'edge'

// Mock data for build time
const MOCK_STATS = [
  {
    id: 'mock-1',
    playerId: 'mock-player-1',
    totalMatches: 0,
    wins: 0,
    losses: 0,
    winRate: 0
  }
]

export async function GET(request: NextRequest) {
  if (process.env.NODE_ENV === 'production' && process.env.VERCEL_ENV === 'preview') {
    return successResponse({ stats: MOCK_STATS })
  }

  try {
    const { prisma } = await import('@/lib/prisma')
    const searchParams = request.nextUrl.searchParams
    const playerIds = searchParams.get('players')?.split(',').filter(Boolean) || []

    const stats = await prisma.playerStats.findMany({
      where: playerIds.length > 0 ? {
        playerId: { in: playerIds }
      } : undefined,
      select: {
        id: true,
        playerId: true,
        totalMatches: true,
        wins: true,
        losses: true,
        winRate: true
      },
      orderBy: { winRate: 'desc' }
    })

    return successResponse({ stats })
  } catch (error) {
    return errorResponse('Failed to fetch stats')
  }
}

function formatPlayerStats(stat: any) {
  return {
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
  }
}

async function getHeadToHead(player1: string, player2: string) {
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
    orderBy: { date: 'desc' },
    take: 5,
    select: {
      id: true,
      date: true,
      winningTeam: true,
      team1PlayerAId: true,
      team1PlayerBId: true,
      team2PlayerAId: true,
      team2PlayerBId: true,
      team1ScoreA: true,
      team1ScoreB: true,
      team2ScoreA: true,
      team2ScoreB: true
    }
  })

  return {
    matches,
    summary: {
      totalMatches: matches.length,
      player1Wins: matches.filter(m => isPlayerWinner(m, player1)).length,
      player2Wins: matches.filter(m => isPlayerWinner(m, player2)).length
    }
  }
}

function isPlayerWinner(match: any, playerId: string) {
  const inTeam1 = match.team1PlayerAId === playerId || match.team1PlayerBId === playerId
  return (inTeam1 && match.winningTeam === 1) || (!inTeam1 && match.winningTeam === 2)
} 