import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { apiConfig, successResponse, errorResponse } from '@/lib/api-config'

export const { runtime, dynamic } = apiConfig

// Simplified GET endpoint
export async function GET() {
  try {
    const matches = await prisma.match.findMany({
      take: 5,
      orderBy: { date: 'desc' },
      select: {
        id: true,
        date: true,
        winningTeam: true
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
    
    if (!data.team1PlayerAId || !data.team1PlayerBId || !data.team2PlayerAId || !data.team2PlayerBId) {
      return errorResponse('All player IDs are required', 400)
    }

    const match = await prisma.match.create({
      data: {
        team1PlayerAId: data.team1PlayerAId,
        team1PlayerBId: data.team1PlayerBId,
        team2PlayerAId: data.team2PlayerAId,
        team2PlayerBId: data.team2PlayerBId,
        team1ScoreA: 0,
        team1ScoreB: 0,
        team2ScoreA: 0,
        team2ScoreB: 0,
        winningTeam: 1,
        date: new Date()
      },
      select: {
        id: true,
        date: true,
        winningTeam: true
      }
    })

    return successResponse({ match }, 201)
  } catch (error) {
    return errorResponse('Failed to create match')
  }
} 