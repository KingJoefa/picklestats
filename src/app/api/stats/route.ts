import { apiConfig, successResponse } from '@/lib/api-config'

export const { runtime, dynamic } = apiConfig

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

export async function GET() {
  return successResponse({ stats: MOCK_STATS })
} 