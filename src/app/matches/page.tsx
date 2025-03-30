'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { useGameStore } from '@/store/gameStore'
import { API_PATHS } from '@/lib/api-paths'

const DEFAULT_AVATAR = '/players/default-avatar.svg'

interface Match {
  id: string
  date: string
  team1PlayerA: { id: string; name: string; profilePicture: string }
  team1PlayerB: { id: string; name: string; profilePicture: string }
  team2PlayerA: { id: string; name: string; profilePicture: string }
  team2PlayerB: { id: string; name: string; profilePicture: string }
  team1ScoreA: number
  team1ScoreB: number
  team2ScoreA: number
  team2ScoreB: number
  winningTeam: number
}

interface PlayerLinkProps {
  player: {
    id: string
    name: string
    profilePicture: string
  } | null
}

const PlayerLink = ({ player }: PlayerLinkProps) => {
  if (!player) return (
    <div className="flex items-center gap-2 text-gray-400 italic">
      <div className="relative w-8 h-8 rounded-full overflow-hidden bg-gray-200">
        <Image
          src={DEFAULT_AVATAR}
          alt="Player not found"
          fill
          className="object-cover opacity-50"
        />
      </div>
      <span>Player not found</span>
    </div>
  )
  
  return (
    <Link href={`/players/${player.id}`} className="flex items-center gap-2 hover:text-blue-600">
      <div className="relative w-8 h-8 rounded-full overflow-hidden">
        <Image
          src={player.profilePicture || DEFAULT_AVATAR}
          alt={player.name}
          fill
          className="object-cover"
          onError={(e) => {
            const target = e.target as HTMLImageElement;
            target.src = DEFAULT_AVATAR;
          }}
        />
      </div>
      <span>{player.name}</span>
    </Link>
  )
}

export default function MatchesPage() {
  const availablePlayers = useGameStore(state => state.availablePlayers)
  const fetchPlayers = useGameStore(state => state.fetchPlayers)
  const [matches, setMatches] = useState<Match[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedPlayerId, setSelectedPlayerId] = useState<string>('')
  const [playerNotFound, setPlayerNotFound] = useState(false)

  useEffect(() => {
    fetchPlayers()
  }, [fetchPlayers])

  const fetchMatches = async () => {
    setLoading(true)
    setError(null)
    setPlayerNotFound(false)
    
    try {
      const url = selectedPlayerId 
        ? `${API_PATHS.PLAYERS_V1}/${selectedPlayerId}`
        : API_PATHS.MATCHES_V1
      const response = await fetch(url)
      
      if (response.status === 404) {
        setPlayerNotFound(true)
        setMatches([])
        return
      }
      
      if (!response.ok) {
        throw new Error('Failed to fetch matches')
      }
      
      const responseData = await response.json()
      
      // If we're fetching player-specific matches, we need to transform the data
      if (selectedPlayerId) {
        if (!responseData.recentMatches || !Array.isArray(responseData.recentMatches)) {
          setMatches([])
          return
        }
        
        const transformedMatches = responseData.recentMatches.map((match: any) => ({
          id: match.id,
          date: match.date,
          team1PlayerA: match.team1PlayerA,
          team1PlayerB: match.team1PlayerB,
          team2PlayerA: match.team2PlayerA,
          team2PlayerB: match.team2PlayerB,
          team1ScoreA: match.team1ScoreA,
          team1ScoreB: match.team1ScoreB,
          team2ScoreA: match.team2ScoreA,
          team2ScoreB: match.team2ScoreB,
          winningTeam: match.winningTeam
        }))
        setMatches(transformedMatches)
      } else {
        const { data } = responseData
        if (!Array.isArray(data)) {
          throw new Error('Invalid match data received')
        }
        setMatches(data)
      }
    } catch (error) {
      console.error('Error fetching matches:', error)
      setError('Failed to load matches. Please try again later.')
      setMatches([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchMatches()
  }, [selectedPlayerId])

  const renderContent = () => {
    if (loading) {
      return (
        <div className="text-center py-8">
          <div className="animate-pulse">
            <div className="h-4 bg-gray-200 rounded w-3/4 mx-auto mb-4"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2 mx-auto"></div>
          </div>
          <div className="text-gray-600 mt-4">Loading matches...</div>
        </div>
      )
    }

    if (error) {
      return (
        <div className="text-center py-8">
          <div className="text-red-600 mb-2">{error}</div>
          <button 
            onClick={fetchMatches}
            className="text-blue-600 hover:underline"
          >
            Try again
          </button>
        </div>
      )
    }

    if (playerNotFound) {
      return (
        <div className="text-center py-8 bg-white rounded-lg shadow-md">
          <div className="text-gray-600 mb-4">Player not found</div>
          <button 
            onClick={() => setSelectedPlayerId('')}
            className="text-blue-600 hover:underline"
          >
            View all matches
          </button>
        </div>
      )
    }

    if (matches.length === 0) {
      return (
        <div className="text-center py-8 bg-white rounded-lg shadow-md">
          <div className="text-gray-600 mb-4">
            {selectedPlayerId 
              ? "This player hasn't completed any matches yet"
              : "No matches found. Start playing to see match history!"}
          </div>
          {selectedPlayerId && (
            <button 
              onClick={() => setSelectedPlayerId('')}
              className="text-blue-600 hover:underline"
            >
              View all matches
            </button>
          )}
        </div>
      )
    }

    return (
      <div className="space-y-4">
        {matches.slice(0, 10).map(match => (
          <div
            key={match.id}
            className="bg-white rounded-lg shadow-md p-6"
          >
            <div className="text-sm text-gray-500 mb-2">
              {new Date(match.date).toLocaleDateString()}
            </div>
            <div className="grid md:grid-cols-3 gap-4 items-center">
              <div className="space-y-2">
                <h3 className="font-semibold">Team 1</h3>
                <div className="space-y-1">
                  <PlayerLink player={match.team1PlayerA} />
                  <PlayerLink player={match.team1PlayerB} />
                </div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold">
                  {match.team1ScoreA}-{match.team2ScoreA}
                </div>
                <div className="text-sm text-gray-600">
                  Team {match.winningTeam} Won
                </div>
              </div>
              <div className="space-y-2">
                <h3 className="font-semibold">Team 2</h3>
                <div className="space-y-1">
                  <PlayerLink player={match.team2PlayerA} />
                  <PlayerLink player={match.team2PlayerB} />
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    )
  }

  return (
    <div className="max-w-6xl mx-auto px-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Match History</h1>
        <div className="w-64">
          <select
            value={selectedPlayerId}
            onChange={(e) => setSelectedPlayerId(e.target.value)}
            className="w-full p-2 border rounded-md bg-white"
          >
            <option value="">All Players</option>
            {availablePlayers.map((player) => (
              <option key={player.id} value={player.id}>
                {player.name}
              </option>
            ))}
          </select>
        </div>
      </div>
      {renderContent()}
    </div>
  )
} 