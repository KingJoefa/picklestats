'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import PlayerForm from '@/components/Players/PlayerForm'

const DEFAULT_AVATAR = '/players/default-avatar.svg'

interface PlayerStats {
  matches: number
  wins: number
  losses: number
  winRate: number
  pointsScored: number
  pointsConceded: number
}

interface Player {
  id: string
  name: string
  profilePicture: string
  stats: PlayerStats
}

export default function PlayersPage() {
  const [players, setPlayers] = useState<Player[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchPlayers = async () => {
      try {
        const res = await fetch('/api/players')
        if (!res.ok) {
          throw new Error('Failed to fetch players')
        }
        const data = await res.json()
        setPlayers(data.data)
      } catch (error) {
        console.error('Error fetching players:', error)
      }
      setLoading(false)
    }

    fetchPlayers()
  }, [])

  if (loading) {
    return <div>Loading players...</div>
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Player Profiles</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {players && players.length > 0 ? (
          players.map((player: Player) => (
            <Link
              key={player.id}
              href={`/players/${player.id}`}
              className="block bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow duration-200"
            >
              <div className="flex justify-center mt-4">
                <div className="relative w-32 h-32">
                  <Image
                    src={player.profilePicture || DEFAULT_AVATAR}
                    alt={player.name}
                    fill
                    className="object-cover object-center rounded-full border border-gray-200"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.src = DEFAULT_AVATAR;
                    }}
                  />
                </div>
              </div>
              <div className="p-4">
                <h2 className="text-xl font-semibold mb-2">{player.name}</h2>
                <div className="grid grid-cols-2 gap-4 text-sm text-gray-600">
                  <div>
                    <div>Matches: {player.stats?.matches ?? 0}</div>
                    <div>Win Rate: {player.stats?.winRate?.toFixed(1) ?? '0.0'}%</div>
                  </div>
                  <div>
                    <div>Wins: {player.stats?.wins ?? 0}</div>
                    <div>Losses: {player.stats?.losses ?? 0}</div>
                  </div>
                  <div>
                    <div>Points Scored: {player.stats?.pointsScored ?? 0}</div>
                    <div>Points Conceded: {player.stats?.pointsConceded ?? 0}</div>
                  </div>
                </div>
              </div>
            </Link>
          ))
        ) : (
          <div className="col-span-full text-center text-gray-500">
            No players found. Please try again later.
          </div>
        )}
      </div>
    </div>
  )
} 