import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'
export const revalidate = 0

export async function POST(request: Request) {
  try {
    const {
      team1PlayerAId,
      team1PlayerBId,
      team2PlayerAId,
      team2PlayerBId,
      team1ScoreA,
      team1ScoreB,
      team2ScoreA,
      team2ScoreB,
      winningTeam,
    } = await request.json()

    // Validate required fields
    if (
      team1PlayerAId === undefined ||
      team1PlayerBId === undefined ||
      team2PlayerAId === undefined ||
      team2PlayerBId === undefined ||
      team1ScoreA === undefined ||
      team1ScoreB === undefined ||
      team2ScoreA === undefined ||
      team2ScoreB === undefined ||
      winningTeam === undefined
    ) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Create match
    const match = await prisma.match.create({
      data: {
        team1PlayerA: { connect: { id: team1PlayerAId } },
        team1PlayerB: { connect: { id: team1PlayerBId } },
        team2PlayerA: { connect: { id: team2PlayerAId } },
        team2PlayerB: { connect: { id: team2PlayerBId } },
        team1ScoreA,
        team1ScoreB,
        team2ScoreA,
        team2ScoreB,
        winningTeam,
      },
    })

    // Update player stats
    const team1Players = [team1PlayerAId, team1PlayerBId]
    const team2Players = [team2PlayerAId, team2PlayerBId]
    const winningPlayers = winningTeam === 1 ? team1Players : team2Players
    const losingPlayers = winningTeam === 1 ? team2Players : team1Players

    // Update winners
    await Promise.all(
      winningPlayers.map((playerId) =>
        prisma.playerStats.upsert({
          where: { playerId },
          create: {
            playerId,
            matches: 1,
            wins: 1,
            losses: 0,
            winRate: 100,
          },
          update: {
            matches: { increment: 1 },
            wins: { increment: 1 },
            winRate: {
              set: prisma.$raw`ROUND(CAST((wins + 1) AS FLOAT) / (matches + 1) * 100)`,
            },
          },
        })
      )
    )

    // Update losers
    await Promise.all(
      losingPlayers.map((playerId) =>
        prisma.playerStats.upsert({
          where: { playerId },
          create: {
            playerId,
            matches: 1,
            wins: 0,
            losses: 1,
            winRate: 0,
          },
          update: {
            matches: { increment: 1 },
            losses: { increment: 1 },
            winRate: {
              set: prisma.$raw`ROUND(CAST(wins AS FLOAT) / (matches + 1) * 100)`,
            },
          },
        })
      )
    )

    return NextResponse.json(match)
  } catch (error) {
    console.error('Error creating match:', error)
    return NextResponse.json(
      { error: 'Failed to create match' },
      { status: 500 }
    )
  }
}

export async function GET() {
  try {
    const matches = await prisma.match.findMany({
      take: 10,
      orderBy: { createdAt: 'desc' },
      include: {
        team1PlayerA: true,
        team1PlayerB: true,
        team2PlayerA: true,
        team2PlayerB: true,
      },
    })

    return NextResponse.json(matches)
  } catch (error) {
    console.error('Error fetching matches:', error)
    return NextResponse.json(
      { error: 'Failed to fetch matches' },
      { status: 500 }
    )
  }
} 