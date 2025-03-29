import { apiConfig, successResponse } from '@/lib/api-config'

export const { runtime, dynamic } = apiConfig

const MOCK_STATS = [
  {
    id: 'mock-1',
    player: {
      id: 'mock-1',
      name: 'Player One',
      profilePicture: 'https://picsum.photos/200'
    },
    totalMatches: 0,
    wins: 0,
    losses: 0,
    winRate: 0,
    pointsScored: 0,
    pointsConceded: 0
  }
]

const MOCK_HEAD_TO_HEAD = [
  {
    id: 'match-1',
    date: new Date().toISOString(),
    team1ScoreA: 11,
    team1ScoreB: 0,
    team2ScoreA: 9,
    team2ScoreB: 0,
    winningTeam: 1
  }
]

export async function GET() {
  return successResponse({ 
    stats: MOCK_STATS,
    headToHead: MOCK_HEAD_TO_HEAD
  })
} 