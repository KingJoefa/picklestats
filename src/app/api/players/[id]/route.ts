import { apiConfig, successResponse } from '@/lib/api-config'

export const { runtime, dynamic } = apiConfig

const MOCK_PLAYER = {
  id: 'mock-1',
  name: 'Player One',
  profilePicture: 'https://picsum.photos/200',
  stats: {
    totalMatches: 0,
    wins: 0,
    losses: 0,
    winRate: 0,
    pointsScored: 0,
    pointsConceded: 0
  },
  recentMatches: [
    {
      id: 'match-1',
      date: new Date().toISOString(),
      wasTeam1: true,
      team1ScoreA: 11,
      team2ScoreA: 9,
      winningTeam: 1
    }
  ],
  commonPartners: [
    {
      player: {
        id: 'mock-2',
        name: 'Player Two',
        profilePicture: 'https://picsum.photos/200'
      },
      matches: 1,
      wins: 1
    }
  ],
  topOpponents: [
    {
      player: {
        id: 'mock-3',
        name: 'Player Three',
        profilePicture: 'https://picsum.photos/200'
      },
      matches: 1,
      wins: 0
    }
  ]
}

export async function GET() {
  return successResponse({ player: MOCK_PLAYER })
} 