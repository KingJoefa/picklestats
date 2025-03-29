import { NextResponse } from 'next/server'
import { PrismaClient, Prisma } from '@prisma/client'

const prisma = new PrismaClient()

type TransactionClient = Omit<
  PrismaClient,
  '$connect' | '$disconnect' | '$on' | '$transaction' | '$use'
>

export const dynamic = 'force-dynamic'
export const revalidate = 0

export async function POST(request: Request) {
  try {
    const data = await request.json()
    const {
      team1PlayerA,
      team1PlayerB,
      team2PlayerA,
      team2PlayerB,
      team1ScoreA,
      team1ScoreB,
      team2ScoreA,
      team2ScoreB,
      winningTeam,
    } = data

    // Validate required fields
    if (
      !team1PlayerA?.id ||
      !team1PlayerB?.id ||
      !team2PlayerA?.id ||
      !team2PlayerB?.id ||
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

    const result = await prisma.$transaction(async (tx) => {
      // Create the match
      const match = await tx.match.create({
        data: {
          team1PlayerAId: team1PlayerA.id,
          team1PlayerBId: team1PlayerB.id,
          team2PlayerAId: team2PlayerA.id,
          team2PlayerBId: team2PlayerB.id,
          team1ScoreA: parseInt(team1ScoreA),
          team1ScoreB: parseInt(team1ScoreB),
          team2ScoreA: parseInt(team2ScoreA),
          team2ScoreB: parseInt(team2ScoreB),
          winningTeam,
        },
      })

      // Update stats for winning team players
      const winningPlayers = winningTeam === 1 
        ? [team1PlayerA.id, team1PlayerB.id]
        : [team2PlayerA.id, team2PlayerB.id]

      // Calculate points for each team
      const team1Points = parseInt(team1ScoreA) + parseInt(team1ScoreB)
      const team2Points = parseInt(team2ScoreA) + parseInt(team2ScoreB)

      for (const playerId of winningPlayers) {
        await tx.playerStats.upsert({
          where: { playerId },
          create: {
            playerId,
            totalMatches: 1,
            wins: 1,
            losses: 0,
            winRate: 100,
            pointsScored: winningTeam === 1 ? team1Points : team2Points,
            pointsConceded: winningTeam === 1 ? team2Points : team1Points
          },
          update: {
            totalMatches: { increment: 1 },
            wins: { increment: 1 },
            pointsScored: { increment: winningTeam === 1 ? team1Points : team2Points },
            pointsConceded: { increment: winningTeam === 1 ? team2Points : team1Points }
          },
        })

        // Update win rate separately
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

      // Update stats for losing team players
      const losingPlayers = winningTeam === 1
        ? [team2PlayerA.id, team2PlayerB.id]
        : [team1PlayerA.id, team1PlayerB.id]

      for (const playerId of losingPlayers) {
        await tx.playerStats.upsert({
          where: { playerId },
          create: {
            playerId,
            totalMatches: 1,
            wins: 0,
            losses: 1,
            winRate: 0,
            pointsScored: winningTeam === 1 ? team2Points : team1Points,
            pointsConceded: winningTeam === 1 ? team1Points : team2Points
          },
          update: {
            totalMatches: { increment: 1 },
            losses: { increment: 1 },
            pointsScored: { increment: winningTeam === 1 ? team2Points : team1Points },
            pointsConceded: { increment: winningTeam === 1 ? team1Points : team2Points }
          },
        })

        // Update win rate separately
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

      return match
    })

    return NextResponse.json({ match: result })
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