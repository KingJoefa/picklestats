import { NextRequest } from 'next/server'
import { apiConfig, successResponse, errorResponse } from '@/lib/api-config'

export const dynamic = 'force-dynamic'
export const runtime = 'edge'

// Mock data for build time
const MOCK_MATCHES = [
  {
    id: 'mock-1',
    date: new Date().toISOString(),
    winningTeam: 1
  }
]

export async function GET() {
  if (process.env.NODE_ENV === 'production' && process.env.VERCEL_ENV === 'preview') {
    return successResponse({ matches: MOCK_MATCHES })
  }

  try {
    const { prisma } = await import('@/lib/prisma')
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

export async function POST(request: NextRequest) {
  try {
    const { prisma } = await import('@/lib/prisma')
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