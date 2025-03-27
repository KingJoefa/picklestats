import { useState } from 'react'
import { useGameStore } from '@/store/gameStore'
import type { Player } from '@/store/gameStore'

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
    setLoading(true)
    try {
      const response = await fetch(
        `/api/stats?players=${selectedPlayers.join(',')}`
      )
      const data = await response.json()
      setStats(data.stats)
      setHeadToHead(data.headToHead || [])
    } catch (error) {
      console.error('Error fetching stats:', error)
    }
    setLoading(false)
  }

  const handlePlayerSelect = (playerId: string) => {
    if (selectedPlayers.includes(playerId)) {
      setSelectedPlayers(selectedPlayers.filter(id => id !== playerId))
    } else if (selectedPlayers.length < 4) {
      setSelectedPlayers([...selectedPlayers, playerId])
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

      {stats.length > 0 && (
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
      )}
    </div>
  )
}

export default PlayerStatsView 