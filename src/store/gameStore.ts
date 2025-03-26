import { create } from 'zustand'

export interface Player {
  id: string
  name: string
  profilePicture: string
  stats: {
    matches: number
    wins: number
    losses: number
    winRate: number
  }
}

interface GameState {
  players: {
    team1: [Player | null, Player | null]
    team2: [Player | null, Player | null]
  }
  availablePlayers: Player[]
  score: {
    team1: number
    team2: number
  }
  matchHistory: {
    id: string
    date: Date
    team1: [Player, Player]
    team2: [Player, Player]
    score: {
      team1: number
      team2: number
    }
  }[]
  setScore: (team: 1 | 2, score: number) => void
  setPlayer: (team: 1 | 2, position: 0 | 1, playerId: string | null) => void
  endMatch: (winningTeam: 1 | 2) => void
  fetchPlayers: () => Promise<void>
}

export const useGameStore = create<GameState>((set) => ({
  players: {
    team1: [null, null],
    team2: [null, null],
  },
  availablePlayers: [],
  score: {
    team1: 0,
    team2: 0,
  },
  matchHistory: [],
  setScore: (team, score) =>
    set((state) => ({
      score: {
        ...state.score,
        [team === 1 ? 'team1' : 'team2']: score,
      },
    })),
  setPlayer: (team, position, playerId) =>
    set((state) => {
      const selectedPlayer = playerId ? state.availablePlayers.find(p => p.id === playerId) : null
      const currentTeamKey = team === 1 ? 'team1' : 'team2'

      const newPlayers = {
        ...state.players,
        [currentTeamKey]: [
          position === 0 ? selectedPlayer : state.players[currentTeamKey][0],
          position === 1 ? selectedPlayer : state.players[currentTeamKey][1],
        ],
      }

      return {
        players: newPlayers,
      }
    }),
  endMatch: (winningTeam) =>
    set((state) => {
      const team1Players = state.players.team1
      const team2Players = state.players.team2

      if (
        team1Players[0] &&
        team1Players[1] &&
        team2Players[0] &&
        team2Players[1]
      ) {
        saveMatchToDatabase({
          team1PlayerAId: team1Players[0].id,
          team1PlayerBId: team1Players[1].id,
          team2PlayerAId: team2Players[0].id,
          team2PlayerBId: team2Players[1].id,
          team1ScoreA: state.score.team1,
          team1ScoreB: 0,
          team2ScoreA: state.score.team2,
          team2ScoreB: 0,
          winningTeam,
        }).catch(error => {
          console.error('Error saving match:', error)
        })

        return {
          matchHistory: [
            ...state.matchHistory,
            {
              id: Date.now().toString(),
              date: new Date(),
              team1: team1Players as [Player, Player],
              team2: team2Players as [Player, Player],
              score: { ...state.score },
            },
          ],
          score: { team1: 0, team2: 0 },
          players: {
            team1: [null, null],
            team2: [null, null],
          }
        }
      }
      return state
    }),
  fetchPlayers: async () => {
    try {
      const response = await fetch('/api/players')
      if (!response.ok) {
        throw new Error('Failed to fetch players')
      }
      const players = await response.json()
      set({ availablePlayers: players })
    } catch (error) {
      console.error('Error fetching players:', error)
    }
  }
}))

async function saveMatchToDatabase(matchData: {
  team1PlayerAId: string
  team1PlayerBId: string
  team2PlayerAId: string
  team2PlayerBId: string
  team1ScoreA: number
  team1ScoreB: number
  team2ScoreA: number
  team2ScoreB: number
  winningTeam: number
}) {
  const response = await fetch('/api/matches', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(matchData),
  })

  if (!response.ok) {
    throw new Error('Failed to save match')
  }

  return response.json()
} 