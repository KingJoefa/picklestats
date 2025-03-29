import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { apiConfig, successResponse, errorResponse } from '@/lib/api-config'

export const { runtime, dynamic } = apiConfig

export async function GET() {
  try {
    const matches = await prisma.match.findMany({
      take: 10,
      orderBy: { date: 'desc' },
      select: {
        id: true,
        date: true,
        winningTeam: true,
        team1ScoreA: true,
        team1ScoreB: true,
        team2ScoreA: true,
        team2ScoreB: true,
        team1PlayerA: {
          select: {
            id: true,
            name: true,
            profilePicture: true
          }
        },
        team1PlayerB: {
          select: {
            id: true,
            name: true,
            profilePicture: true
          }
        },
        team2PlayerA: {
          select: {
            id: true,
            name: true,
            profilePicture: true
          }
        },
        team2PlayerB: {
          select: {
            id: true,
            name: true,
            profilePicture: true
          }
        }
      }
    })

    return successResponse({ matches })
  } catch (error) {
    return errorResponse('Failed to fetch matches')
  }
}

export async function POST(request: NextRequest) {
  try {
    const data = await request.json()
    
    if (!isValidMatchData(data)) {
      return errorResponse('Missing required fields', 400)
    }

    const match = await prisma.$transaction(async (tx) => {
      // Create the match
      const newMatch = await tx.match.create({
        data: {
          team1PlayerAId: data.team1PlayerA.id,
          team1PlayerBId: data.team1PlayerB.id,
          team2PlayerAId: data.team2PlayerA.id,
          team2PlayerBId: data.team2PlayerB.id,
          team1ScoreA: parseInt(data.team1ScoreA.toString()),
          team1ScoreB: parseInt(data.team1ScoreB.toString()),
          team2ScoreA: parseInt(data.team2ScoreA.toString()),
          team2ScoreB: parseInt(data.team2ScoreB.toString()),
          winningTeam: data.winningTeam,
          date: new Date()
        },
        select: {
          id: true,
          date: true,
          winningTeam: true,
          team1ScoreA: true,
          team1ScoreB: true,
          team2ScoreA: true,
          team2ScoreB: true,
          team1PlayerA: {
            select: {
              id: true,
              name: true,
              profilePicture: true
            }
          },
          team1PlayerB: {
            select: {
              id: true,
              name: true,
              profilePicture: true
            }
          },
          team2PlayerA: {
            select: {
              id: true,
              name: true,
              profilePicture: true
            }
          },
          team2PlayerB: {
            select: {
              id: true,
              name: true,
              profilePicture: true
            }
          }
        }
      })

      // Update stats for all players
      await updatePlayerStats(tx, data, newMatch)

      return newMatch
    })

    return successResponse({ match })
  } catch (error) {
    return errorResponse('Failed to create match')
  }
}

function isValidMatchData(data: any): boolean {
  return !!(
    data.team1PlayerA?.id &&
    data.team1PlayerB?.id &&
    data.team2PlayerA?.id &&
    data.team2PlayerB?.id &&
    data.team1ScoreA !== undefined &&
    data.team1ScoreB !== undefined &&
    data.team2ScoreA !== undefined &&
    data.team2ScoreB !== undefined &&
    data.winningTeam !== undefined
  )
}

async function updatePlayerStats(tx: any, data: any, match: any) {
  const team1Points = parseInt(data.team1ScoreA.toString()) + parseInt(data.team1ScoreB.toString())
  const team2Points = parseInt(data.team2ScoreA.toString()) + parseInt(data.team2ScoreB.toString())
  
  // Update winning team stats
  const winningPlayers = data.winningTeam === 1 
    ? [data.team1PlayerA.id, data.team1PlayerB.id]
    : [data.team2PlayerA.id, data.team2PlayerB.id]

  for (const playerId of winningPlayers) {
    await updateSinglePlayerStats(tx, playerId, {
      isWinner: true,
      pointsScored: data.winningTeam === 1 ? team1Points : team2Points,
      pointsConceded: data.winningTeam === 1 ? team2Points : team1Points
    })
  }

  // Update losing team stats
  const losingPlayers = data.winningTeam === 1
    ? [data.team2PlayerA.id, data.team2PlayerB.id]
    : [data.team1PlayerA.id, data.team1PlayerB.id]

  for (const playerId of losingPlayers) {
    await updateSinglePlayerStats(tx, playerId, {
      isWinner: false,
      pointsScored: data.winningTeam === 1 ? team2Points : team1Points,
      pointsConceded: data.winningTeam === 1 ? team1Points : team2Points
    })
  }
}

async function updateSinglePlayerStats(
  tx: any,
  playerId: string,
  data: { isWinner: boolean; pointsScored: number; pointsConceded: number }
) {
  await tx.playerStats.upsert({
    where: { playerId },
    create: {
      playerId,
      totalMatches: 1,
      wins: data.isWinner ? 1 : 0,
      losses: data.isWinner ? 0 : 1,
      winRate: data.isWinner ? 100 : 0,
      pointsScored: data.pointsScored,
      pointsConceded: data.pointsConceded
    },
    update: {
      totalMatches: { increment: 1 },
      wins: { increment: data.isWinner ? 1 : 0 },
      losses: { increment: data.isWinner ? 0 : 1 },
      pointsScored: { increment: data.pointsScored },
      pointsConceded: { increment: data.pointsConceded }
    }
  })

  const stats = await tx.playerStats.findUnique({
    where: { playerId }
  })

  if (stats) {
    await tx.playerStats.update({
      where: { playerId },
      data: {
        winRate: Math.round((stats.wins / stats.totalMatches) * 100)
      }
    })
  }
} 