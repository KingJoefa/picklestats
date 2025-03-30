import { useState } from 'react'
import { useGameStore } from '@/store/gameStore'
import type { Player } from '@/store/gameStore'
import { toast } from 'sonner'
import { API_PATHS } from '@/lib/api-paths'

interface PlayerStats {
  id: string
  player: Player
  totalMatches: number
  wins: number
  losses: number
  winRate: number
  pointsScored: number
  pointsConceded: number
}

interface HeadToHeadMatch {
  id: string
  date: string
  team1ScoreA: number
  team1ScoreB: number
  team2ScoreA: number
  team2ScoreB: number
  winningTeam: number
}

const PlayerStatsView = () => {
  const availablePlayers = useGameStore(state => state.availablePlayers)
  const [selectedPlayers, setSelectedPlayers] = useState<string[]>([])
  const [stats, setStats] = useState<PlayerStats[]>([])
  const [headToHead, setHeadToHead] = useState<HeadToHeadMatch[]>([])
  const [loading, setLoading] = useState(false)

  const fetchStats = async () => {
    const toastId = 'stats-loading'
    setLoading(true)
    toast.loading('Loading stats...', { id: toastId })
    
    try {
      if (selectedPlayers.length === 0) {
        toast.error('No players selected', { id: toastId })
        setLoading(false)
        return
      }
      
      const response = await fetch(
        `${API_PATHS.STATS_V1}?players=${selectedPlayers.join(',')}`
      )
      
      if (!response.ok) {
        throw new Error(`Server error: ${response.status}`)
      }
      
      const data = await response.json()
      setStats(data.stats)
      setHeadToHead(data.headToHead || [])
      
      toast.success('Stats loaded', { 
        id: toastId,
        description: `Displaying stats for ${selectedPlayers.length} player${selectedPlayers.length > 1 ? 's' : ''}`
      })
    } catch (error) {
      console.error('Error fetching stats:', error)
      toast.error('Failed to load stats', { 
        id: toastId,
        description: 'Please try again or contact support if the issue persists'
      })
    }
    setLoading(false)
  }

  const handlePlayerSelect = (playerId: string) => {
    if (selectedPlayers.includes(playerId)) {
      setSelectedPlayers(selectedPlayers.filter(id => id !== playerId))
    } else if (selectedPlayers.length < 4) {
      setSelectedPlayers([...selectedPlayers, playerId])
    } else {
      toast.error('Maximum players reached', {
        description: 'You can compare up to 4 players at a time'
      })
    }
  }

  return (
    <div className="bg-white rounded-xl shadow-lg p-6 mt-8">
      <h2 className="text-2xl font-bold mb-6">Player Statistics</h2>
      
      <div className="mb-6">
        <h3 className="text-lg font-semibold mb-2">Select Players to Compare</h3>
        <div className="flex flex-wrap gap-2">
          {availablePlayers.map(player => (
            <button
              key={player.id}
              onClick={() => handlePlayerSelect(player.id)}
              className={`px-4 py-2 rounded-full ${
                selectedPlayers.includes(player.id)
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700'
              }`}
            >
              {player.name}
            </button>
          ))}
        </div>
      </div>

      <button
        onClick={fetchStats}
        disabled={loading || selectedPlayers.length === 0}
        className="btn-primary mb-6"
      >
        {loading ? 'Loading...' : 'View Stats'}
      </button>

      {stats.length > 0 ? (
        <div className="space-y-6">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {stats.map(stat => (
              <div
                key={stat.id}
                className="bg-gray-50 rounded-lg p-4"
              >
                <h4 className="font-semibold text-lg mb-2">{stat.player.name}</h4>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div>
                    <p className="text-gray-600">Matches</p>
                    <p className="font-bold">{stat.totalMatches}</p>
                  </div>
                  <div>
                    <p className="text-gray-600">Win Rate</p>
                    <p className="font-bold">{stat.winRate.toFixed(1)}%</p>
                  </div>
                  <div>
                    <p className="text-gray-600">Points Scored</p>
                    <p className="font-bold">{stat.pointsScored}</p>
                  </div>
                  <div>
                    <p className="text-gray-600">Points Conceded</p>
                    <p className="font-bold">{stat.pointsConceded}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {headToHead.length > 0 && (
            <div>
              <h3 className="text-lg font-semibold mb-4">Head to Head Matches</h3>
              <div className="space-y-2">
                {headToHead.map(match => (
                  <div
                    key={match.id}
                    className="bg-gray-50 rounded-lg p-4"
                  >
                    <p className="text-sm text-gray-600">
                      {new Date(match.date).toLocaleDateString()}
                    </p>
                    <p className="font-medium">
                      Team {match.winningTeam} Won
                    </p>
                    <p>
                      Team 1: {match.team1ScoreA}-{match.team1ScoreB} vs 
                      Team 2: {match.team2ScoreA}-{match.team2ScoreB}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      ) : selectedPlayers.length > 0 && !loading ? (
        <div className="bg-gray-50 p-6 rounded-lg text-center">
          <p className="text-gray-600">No stats available for the selected players.</p>
          <p className="text-sm mt-2">Play some matches to generate statistics!</p>
        </div>
      ) : null}
    </div>
  )
}

export default PlayerStatsView 