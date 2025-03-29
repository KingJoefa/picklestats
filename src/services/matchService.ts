import { prisma } from '@/lib/prisma'

export interface MatchData {
  team1PlayerA: { id: string }
  team1PlayerB: { id: string }
  team2PlayerA: { id: string }
  team2PlayerB: { id: string }
  team1ScoreA: string | number
  team1ScoreB: string | number
  team2ScoreA: string | number
  team2ScoreB: string | number
  winningTeam: number
}

export async function createMatch(data: MatchData) {
  return await prisma.$transaction(async (tx) => {
    const match = await tx.match.create({
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
        date: new Date(),
      },
    })

    // Update stats for winning team players
    const winningPlayers = data.winningTeam === 1 
      ? [data.team1PlayerA.id, data.team1PlayerB.id]
      : [data.team2PlayerA.id, data.team2PlayerB.id]

    const team1Points = parseInt(data.team1ScoreA.toString()) + parseInt(data.team1ScoreB.toString())
    const team2Points = parseInt(data.team2ScoreA.toString()) + parseInt(data.team2ScoreB.toString())

    for (const playerId of winningPlayers) {
      await updatePlayerStats(tx, playerId, {
        isWinner: true,
        pointsScored: data.winningTeam === 1 ? team1Points : team2Points,
        pointsConceded: data.winningTeam === 1 ? team2Points : team1Points
      })
    }

    const losingPlayers = data.winningTeam === 1
      ? [data.team2PlayerA.id, data.team2PlayerB.id]
      : [data.team1PlayerA.id, data.team1PlayerB.id]

    for (const playerId of losingPlayers) {
      await updatePlayerStats(tx, playerId, {
        isWinner: false,
        pointsScored: data.winningTeam === 1 ? team2Points : team1Points,
        pointsConceded: data.winningTeam === 1 ? team1Points : team2Points
      })
    }

    return match
  })
}

async function updatePlayerStats(
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
    },
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

export async function getMatches() {
  return await prisma.match.findMany({
    take: 10,
    orderBy: { date: 'desc' },
    include: {
      team1PlayerA: true,
      team1PlayerB: true,
      team2PlayerA: true,
      team2PlayerB: true,
    },
  })
} 