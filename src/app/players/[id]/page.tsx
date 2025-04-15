'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import { useRouter } from 'next/navigation'

const DEFAULT_AVATAR = '/players/default-avatar.svg'

interface PlayerDetails {
  id: string
  name: string
  profilePicture: string
  stats: {
    totalMatches: number
    wins: number
    losses: number
    winRate: number
    pointsScored: number
    pointsConceded: number
  }
  recentMatches: Array<{
    id: string
    date: string
    wasTeam1: boolean
    team1ScoreA: number
    team2ScoreA: number
    winningTeam: number
  }>
  commonPartners: Array<{
    player: {
      id: string
      name: string
      profilePicture: string
    }
    matches: number
    wins: number
  }>
  topOpponents: Array<{
    player: {
      id: string
      name: string
      profilePicture: string
    }
    matches: number
    wins: number
  }>
}

interface PageProps {
  params: Promise<{ id: string }>
}

export default function PlayerPage({ params }: PageProps) {
  const [player, setPlayer] = useState<PlayerDetails | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  useEffect(() => {
    async function fetchPlayer() {
      try {
        setIsLoading(true)
        setError(null)
        const { id } = await params
        const response = await fetch(`/api/players/${id}`)
        
        if (!response.ok) {
          if (response.status === 404) {
            setError('Player not found')
          } else {
            setError('Failed to fetch player details')
          }
          return
        }

        const data = await response.json()
        setPlayer(data)
      } catch (err) {
        setError('An error occurred while fetching player details')
        console.error('Error fetching player:', err)
      } finally {
        setIsLoading(false)
      }
    }

    fetchPlayer()
  }, [params])

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <div className="text-xl text-red-600 mb-4">{error}</div>
        <button
          onClick={() => router.push('/players')}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          Back to Players
        </button>
      </div>
    )
  }

  if (!player) return null

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="bg-white rounded-lg shadow-lg p-6">
        <div className="flex items-center mb-8">
          <div className="relative w-32 h-32 mr-6">
            <Image
              src={player.profilePicture || DEFAULT_AVATAR}
              alt={player.name || 'Unknown Player'}
              fill
              className="rounded-full object-cover"
            />
          </div>
          <div>
            <h1 className="text-3xl font-bold mb-2">{player.name || 'Unknown Player'}</h1>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-gray-600">Total Matches</p>
                <p className="text-xl font-semibold">{player.stats?.totalMatches ?? 0}</p>
              </div>
              <div>
                <p className="text-gray-600">Win Rate</p>
                <p className="text-xl font-semibold">{player.stats?.winRate ?? 0}%</p>
              </div>
              <div>
                <p className="text-gray-600">Points Scored</p>
                <p className="text-xl font-semibold">{player.stats?.pointsScored ?? 0}</p>
              </div>
              <div>
                <p className="text-gray-600">Points Conceded</p>
                <p className="text-xl font-semibold">{player.stats?.pointsConceded ?? 0}</p>
              </div>
            </div>
          </div>
        </div>

        <div>
          <h2 className="text-2xl font-bold mb-4">Recent Matches</h2>
          <div className="space-y-4">
            {(player.recentMatches ?? []).map(match => (
              <div
                key={match.id}
                className="bg-white rounded-lg shadow-md p-4"
              >
                <div className="text-sm text-gray-500 mb-2">
                  {match.date ? new Date(match.date).toLocaleDateString() : 'Unknown Date'}
                </div>
                <div className="text-lg font-medium">
                  {match.wasTeam1 ? (
                    <>
                      {match.team1ScoreA}-{match.team2ScoreA}
                    </>
                  ) : (
                    <>
                      {match.team1ScoreA}-{match.team2ScoreA}
                    </>
                  )}
                </div>
                <div className="text-sm text-gray-600">
                  {match.winningTeam === (match.wasTeam1 ? 1 : 2) ? (
                    <span className="text-green-600">Won</span>
                  ) : (
                    <span className="text-red-600">Lost</span>
                  )}
                </div>
              </div>
            ))}
          </div>

          <h2 className="text-2xl font-bold mb-4 mt-8">Common Partners</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {(player.commonPartners ?? []).map(partner => (
              <div
                key={partner.player.id}
                className="bg-white rounded-lg shadow-md p-4 flex items-center"
              >
                <div className="relative w-16 h-16 mr-4">
                  <Image
                    src={partner.player?.profilePicture || DEFAULT_AVATAR}
                    alt={partner.player?.name || 'Unknown Partner'}
                    fill
                    className="rounded-full object-cover"
                  />
                </div>
                <div>
                  <h3 className="font-semibold">{partner.player?.name || 'Unknown Partner'}</h3>
                  <p className="text-sm text-gray-600">
                    {partner.matches} matches, {partner.wins} wins together
                  </p>
                </div>
              </div>
            ))}
          </div>

          <h2 className="text-2xl font-bold mb-4 mt-8">Top Opponents</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {(player.topOpponents ?? []).map(opponent => (
              <div
                key={opponent.player.id}
                className="bg-white rounded-lg shadow-md p-4 flex items-center"
              >
                <div className="relative w-16 h-16 mr-4">
                  <Image
                    src={opponent.player?.profilePicture || DEFAULT_AVATAR}
                    alt={opponent.player?.name || 'Unknown Opponent'}
                    fill
                    className="rounded-full object-cover"
                  />
                </div>
                <div>
                  <h3 className="font-semibold">{opponent.player?.name || 'Unknown Opponent'}</h3>
                  <p className="text-sm text-gray-600">
                    {opponent.matches} matches, {opponent.wins} wins against
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
} 