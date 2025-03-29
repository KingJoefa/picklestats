import { apiConfig, successResponse } from '@/lib/api-config'

export const { runtime, dynamic } = apiConfig

// Mock data for build time
const MOCK_MATCHES = [
  {
    id: 'mock-1',
    date: new Date().toISOString(),
    winningTeam: 1,
    team1PlayerA: { id: 'mock-1', name: 'Player One', profilePicture: 'https://picsum.photos/200' },
    team1PlayerB: { id: 'mock-2', name: 'Player Two', profilePicture: 'https://picsum.photos/200' },
    team2PlayerA: { id: 'mock-3', name: 'Player Three', profilePicture: 'https://picsum.photos/200' },
    team2PlayerB: { id: 'mock-4', name: 'Player Four', profilePicture: 'https://picsum.photos/200' },
    team1ScoreA: 11,
    team1ScoreB: 0,
    team2ScoreA: 9,
    team2ScoreB: 0
  }
]

export async function GET() {
  return successResponse({ matches: MOCK_MATCHES })
} 