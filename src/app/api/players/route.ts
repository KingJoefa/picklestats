import { apiConfig, successResponse } from '@/lib/api-config'

export const { runtime, dynamic } = apiConfig

const MOCK_PLAYERS = [
  {
    id: 'mock-1',
    name: 'Player One',
    profilePicture: 'https://picsum.photos/200',
    stats: {
      matches: 0,
      wins: 0,
      losses: 0,
      winRate: 0
    }
  }
]

export async function GET() {
  return successResponse({ data: MOCK_PLAYERS })
} 