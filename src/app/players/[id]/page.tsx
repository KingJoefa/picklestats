'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import Link from 'next/link'

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
    winningTeam: number
    team1ScoreA: number
    team1ScoreB: number
    team2ScoreA: number
    team2ScoreB: number
    wasTeam1: boolean
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
    losses: number
  }>
}

export default function PlayerPage({ params }: { params: { id: string } }) {
  const [player, setPlayer] = useState<PlayerDetails | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchPlayerDetails = async () => {
      try {
        const response = await fetch(`/api/players/${params.id}`)
        const data = await response.json()
        setPlayer(data)
      } catch (error) {
        console.error('Error fetching player details:', error)
      }
      setLoading(false)
    }

    fetchPlayerDetails()
  }, [params.id])

  if (loading || !player) {
    return <div>Loading player details...</div>
  }

  return (
    <div className="max-w-6xl mx-auto px-4">
      <div className="bg-white rounded-lg shadow-md p-6 mb-8">
        <div className="flex items-center space-x-4">
          <div className="relative w-24 h-24 rounded-full overflow-hidden">
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
          <div>
            <h1 className="text-3xl font-bold">{player.name}</h1>
            <div className="mt-2 text-gray-600">
              {player.stats.totalMatches} matches played
            </div>
          </div>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-8">
        <div>
          <h2 className="text-2xl font-bold mb-4">Statistics</h2>
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <div className="text-gray-600">Win Rate</div>
                <div className="text-2xl font-bold">
                  {(player.stats.winRate * 100).toFixed(1)}%
                </div>
              </div>
              <div>
                <div className="text-gray-600">Record</div>
                <div className="text-2xl font-bold">
                  {player.stats.wins}-{player.stats.losses}
                </div>
              </div>
              <div>
                <div className="text-gray-600">Points Scored</div>
                <div className="text-2xl font-bold">
                  {player.stats.pointsScored}
                </div>
              </div>
              <div>
                <div className="text-gray-600">Points Conceded</div>
                <div className="text-2xl font-bold">
                  {player.stats.pointsConceded}
                </div>
              </div>
            </div>
          </div>

          <h2 className="text-2xl font-bold mb-4 mt-8">Common Partners</h2>
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="space-y-4">
              {player.commonPartners.map(partner => (
                <Link
                  key={partner.player.id}
                  href={`/players/${partner.player.id}`}
                  className="flex items-center justify-between hover:bg-gray-50 p-2 rounded"
                >
                  <div className="flex items-center space-x-3">
                    <div className="relative w-10 h-10 rounded-full overflow-hidden">
                      <Image
                        src={partner.player.profilePicture}
                        alt={partner.player.name}
                        fill
                        className="object-cover"
                      />
                    </div>
                    <span>{partner.player.name}</span>
                  </div>
                  <div className="text-gray-600">
                    {partner.wins}/{partner.matches} wins
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </div>

        <div>
          <h2 className="text-2xl font-bold mb-4">Recent Matches</h2>
          <div className="space-y-4">
            {player.recentMatches.map(match => (
              <div
                key={match.id}
                className="bg-white rounded-lg shadow-md p-4"
              >
                <div className="text-sm text-gray-500 mb-2">
                  {new Date(match.date).toLocaleDateString()}
                </div>
                <div className="text-lg font-medium">
                  {match.wasTeam1 ? (
                    <>
                      Team 1: {match.team1ScoreA}-{match.team1ScoreB}
                      <span className="text-gray-500"> vs </span>
                      Team 2: {match.team2ScoreA}-{match.team2ScoreB}
                    </>
                  ) : (
                    <>
                      Team 1: {match.team1ScoreA}-{match.team1ScoreB}
                      <span className="text-gray-500"> vs </span>
                      Team 2: {match.team2ScoreA}-{match.team2ScoreB}
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

          <h2 className="text-2xl font-bold mb-4 mt-8">Top Opponents</h2>
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="space-y-4">
              {player.topOpponents.map(opponent => (
                <Link
                  key={opponent.player.id}
                  href={`/players/${opponent.player.id}`}
                  className="flex items-center justify-between hover:bg-gray-50 p-2 rounded"
                >
                  <div className="flex items-center space-x-3">
                    <div className="relative w-10 h-10 rounded-full overflow-hidden">
                      <Image
                        src={opponent.player.profilePicture}
                        alt={opponent.player.name}
                        fill
                        className="object-cover"
                      />
                    </div>
                    <span>{opponent.player.name}</span>
                  </div>
                  <div className="text-gray-600">
                    {opponent.wins}-{opponent.losses}
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
} 