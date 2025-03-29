import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export const runtime = 'edge'
export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const matches = await prisma.match.findMany({
      take: 10,
      orderBy: { date: 'desc' },
      include: {
        team1PlayerA: true,
        team1PlayerB: true,
        team2PlayerA: true,
        team2PlayerB: true,
      },
    })
    return NextResponse.json({ matches })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch matches' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const data = await request.json()
    
    // Validate required fields
    if (!data.team1PlayerA?.id || !data.team1PlayerB?.id || 
        !data.team2PlayerA?.id || !data.team2PlayerB?.id || 
        data.team1ScoreA === undefined || data.team1ScoreB === undefined ||
        data.team2ScoreA === undefined || data.team2ScoreB === undefined ||
        data.winningTeam === undefined) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    const match = await prisma.match.create({
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
      include: {
        team1PlayerA: true,
        team1PlayerB: true,
        team2PlayerA: true,
        team2PlayerB: true,
      },
    })

    return NextResponse.json({ match })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create match' }, { status: 500 })
  }
} 