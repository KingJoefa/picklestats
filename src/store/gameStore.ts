import { create } from 'zustand'
import { toast } from 'sonner'

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

      if (!team1Players[0] || !team1Players[1] || !team2Players[0] || !team2Players[1]) {
        toast.error('Cannot submit match', {
          description: 'All player positions must be filled',
          duration: 3000
        })
        return state
      }

      const matchData = {
        team1PlayerAId: team1Players[0].id,
        team1PlayerBId: team1Players[1].id,
        team2PlayerAId: team2Players[0].id,
        team2PlayerBId: team2Players[1].id,
        team1ScoreA: state.score.team1,
        team1ScoreB: state.score.team1,
        team2ScoreA: state.score.team2,
        team2ScoreB: state.score.team2,
        winningTeam
      }
      
      fetch('/api/matches', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(matchData)
      })
      .then(response => {
        if (!response.ok) {
          throw new Error(`Server error: ${response.status}`)
        }
        toast.success('Match recorded!', {
          description: `Team ${winningTeam} won (${winningTeam === 1 ? state.score.team1 : state.score.team2}-${winningTeam === 1 ? state.score.team2 : state.score.team1})`,
          duration: 3000
        })
        return response.json()
      })
      .catch(error => {
        console.error('Error submitting match:', error)
        toast.error('Failed to save match', {
          description: 'The match was not saved to the database. Please try again.',
          duration: 5000
        })
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
    }),
  fetchPlayers: async () => {
    try {
      toast.loading('Loading players...', { id: 'loading-players' })
      
      const response = await fetch('/api/players')
      if (!response.ok) {
        const errorText = await response.text()
        console.error(`Failed to fetch players: ${response.status} - ${errorText}`)
        toast.error('Could not load players', {
          id: 'loading-players',
          description: 'Please check your connection and try again'
        })
        throw new Error(`Failed to fetch players: ${response.status}`)
      }
      
      const { data } = await response.json()
      if (Array.isArray(data)) {
        set({ availablePlayers: data })
        toast.success('Players loaded', { id: 'loading-players' })
      } else {
        console.error('Invalid players data format:', data)
        toast.error('Data format error', {
          id: 'loading-players',
          description: 'Please contact support if this issue persists'
        })
        set({ availablePlayers: [] })
      }
    } catch (error) {
      console.error('Error fetching players:', error)
      toast.error('Error loading players', {
        id: 'loading-players',
        description: 'Please refresh the page to try again'
      })
      set({ availablePlayers: [] })
    }
  }
})) 