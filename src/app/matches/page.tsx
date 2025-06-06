'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { useGameStore } from '@/store/gameStore'
import { API_PATHS } from '@/lib/api-paths'
import PlayerLink from '@/components/Players/PlayerLink'

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
        ? `${API_PATHS.MATCHES_V1}?playerId=${selectedPlayerId}`
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
      
      const { data } = responseData
      if (!Array.isArray(data)) {
        throw new Error('Invalid match data received')
      }
      console.log('Frontend received matches:', { selectedPlayerId, count: data.length, matchIds: data.map((m: any) => m.id) })
      setMatches(data)
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
            <div className="grid md:grid-cols-3 gap-4 items-center justify-items-center">
              <div className="space-y-2 justify-self-end w-full">
                <h3 className="font-semibold">Team 1</h3>
                <div className="space-y-1">
                  <PlayerLink player={match.team1PlayerA} />
                  <PlayerLink player={match.team1PlayerB} />
                </div>
              </div>
              <div className="text-center w-full flex flex-col items-center">
                <div className="text-2xl font-bold">
                  {match.team1ScoreA}-{match.team2ScoreA}
                </div>
                <div className="text-sm text-gray-600">
                  Team {match.winningTeam} Won
                </div>
              </div>
              <div className="space-y-2 justify-self-start w-full">
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
    <div className="min-h-screen bg-gradient-to-br from-pink-100 via-cyan-100 to-blue-200 py-12 px-2 md:px-4 flex justify-center items-start">
      <div className="max-w-6xl w-full mx-auto px-4 py-8">
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
    </div>
  )
} 