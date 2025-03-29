import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { apiConfig, successResponse, errorResponse } from '@/lib/api-config'

export const { runtime, dynamic } = apiConfig

// Simplified GET endpoint
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
        team2ScoreB: true
      }
    })
    return successResponse({ matches })
  } catch (error) {
    return errorResponse('Failed to fetch matches')
  }
}

// Simplified POST endpoint
export async function POST(request: NextRequest) {
  try {
    const data = await request.json()
    
    if (!isValidMatchData(data)) {
      return errorResponse('Missing required fields', 400)
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
        date: new Date()
      },
      select: {
        id: true,
        date: true,
        winningTeam: true,
        team1ScoreA: true,
        team1ScoreB: true,
        team2ScoreA: true,
        team2ScoreB: true
      }
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