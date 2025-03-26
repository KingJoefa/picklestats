import { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import PlayerForm from '@/components/Players/PlayerForm'

interface PlayerStats {
  totalMatches: number
  wins: number
  losses: number
  winRate: number
}

interface Player {
  id: string
  name: string
  profilePicture: string
  stats: PlayerStats
}

async function getPlayers(): Promise<Player[]> {
  try {
    const res = await fetch('http://localhost:3000/api/players', {
      cache: 'no-store'
    })
    if (!res.ok) {
      throw new Error('Failed to fetch players')
    }
    return res.json()
  } catch (error) {
    console.error('Error fetching players:', error)
    return []
  }
}

export default async function PlayersPage() {
  const players = await getPlayers()

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
              <div className="relative h-48 rounded-t-lg overflow-hidden">
                <Image
                  src={player.profilePicture}
                  alt={player.name}
                  fill
                  className="object-cover"
                />
              </div>
              <div className="p-4">
                <h2 className="text-xl font-semibold mb-2">{player.name}</h2>
                <div className="grid grid-cols-2 gap-4 text-sm text-gray-600">
                  <div>
                    <div>Matches: {player.stats.totalMatches}</div>
                    <div>Win Rate: {(player.stats.winRate * 100).toFixed(1)}%</div>
                  </div>
                  <div>
                    <div>Wins: {player.stats.wins}</div>
                    <div>Losses: {player.stats.losses}</div>
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