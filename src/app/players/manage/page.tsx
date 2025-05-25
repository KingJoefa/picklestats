'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { API_PATHS } from '@/lib/api-paths'

interface Player {
  id: string
  name: string
  profilePicture: string
  isArchived?: boolean
}

export default function ManagePlayers() {
  const [players, setPlayers] = useState<Player[]>([])
  const [newPlayerName, setNewPlayerName] = useState('')
  const [newPlayerImage, setNewPlayerImage] = useState('')
  const [editingPlayer, setEditingPlayer] = useState<Player | null>(null)
  const router = useRouter()

  useEffect(() => {
    fetchPlayers()
  }, [])

  const fetchPlayers = async () => {
    try {
      const response = await fetch(API_PATHS.PLAYERS_V1)
      if (!response.ok) {
        throw new Error('Failed to fetch players')
      }
      const { data } = await response.json()
      if (Array.isArray(data)) {
        setPlayers(data)
      } else {
        console.error('Invalid players data format:', data)
        setPlayers([])
      }
    } catch (error) {
      console.error('Error fetching players:', error)
      setPlayers([])
    }
  }

  const handleCreatePlayer = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const response = await fetch(API_PATHS.CREATE_PLAYER, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: newPlayerName,
          profilePicture: newPlayerImage || `https://ui-avatars.com/api/?name=${encodeURIComponent(newPlayerName)}&background=random&size=200`,
        }),
      })

      if (response.ok) {
        setNewPlayerName('')
        setNewPlayerImage('')
        fetchPlayers()
      }
    } catch (error) {
      console.error('Error creating player:', error)
    }
  }

  const handleUpdatePlayer = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!editingPlayer) return

    try {
      const response = await fetch(`${API_PATHS.PLAYERS_V1}/${editingPlayer.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: editingPlayer.name,
          profilePicture: editingPlayer.profilePicture,
        }),
      })

      if (response.ok) {
        setEditingPlayer(null)
        fetchPlayers()
      }
    } catch (error) {
      console.error('Error updating player:', error)
    }
  }

  const handleArchivePlayer = async (name: string) => {
    if (!window.confirm(`Are you sure you want to archive ${name}?`)) return;
    try {
      const response = await fetch('/api/players', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name }),
      });
      if (response.ok) {
        fetchPlayers();
      } else {
        const data = await response.json();
        alert(data.error || 'Failed to archive player');
      }
    } catch (error) {
      alert('Failed to archive player');
    }
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-6">Manage Players</h1>

      {/* Create New Player Form */}
      <div className="bg-white p-6 rounded-lg shadow-md mb-8">
        <h2 className="text-xl font-semibold mb-4">Create New Player</h2>
        <form onSubmit={handleCreatePlayer} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Name</label>
            <input
              type="text"
              value={newPlayerName}
              onChange={(e) => setNewPlayerName(e.target.value)}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Profile Picture URL</label>
            <input
              type="url"
              value={newPlayerImage}
              onChange={(e) => setNewPlayerImage(e.target.value)}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              placeholder="https://example.com/image.jpg"
            />
          </div>
          <button
            type="submit"
            className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600"
          >
            Create Player
          </button>
        </form>
      </div>

      {/* Existing Players List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {players.filter(p => !p.isArchived).map((player) => (
          <div key={player.id} className="bg-white p-4 rounded-lg shadow-md">
            <div className="relative w-32 h-32 mx-auto mb-4">
              <Image
                src={player.profilePicture || `https://ui-avatars.com/api/?name=${encodeURIComponent(player.name)}&background=random&size=200`}
                alt={player.name}
                fill
                className="rounded-full object-cover"
              />
            </div>
            {editingPlayer?.id === player.id ? (
              <form onSubmit={handleUpdatePlayer} className="space-y-4">
                <input
                  type="text"
                  value={editingPlayer.name}
                  onChange={(e) => setEditingPlayer({ ...editingPlayer, name: e.target.value })}
                  className="block w-full rounded-md border-gray-300 shadow-sm"
                />
                <input
                  type="url"
                  value={editingPlayer.profilePicture}
                  onChange={(e) => setEditingPlayer({ ...editingPlayer, profilePicture: e.target.value })}
                  className="block w-full rounded-md border-gray-300 shadow-sm"
                />
                <div className="flex space-x-2">
                  <button
                    type="submit"
                    className="bg-green-500 text-white px-3 py-1 rounded-md hover:bg-green-600"
                  >
                    Save
                  </button>
                  <button
                    type="button"
                    onClick={() => setEditingPlayer(null)}
                    className="bg-gray-500 text-white px-3 py-1 rounded-md hover:bg-gray-600"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            ) : (
              <div className="text-center">
                <h3 className="font-semibold text-lg mb-2">{player.name}</h3>
                <button
                  onClick={() => setEditingPlayer(player)}
                  className="bg-blue-500 text-white px-3 py-1 rounded-md hover:bg-blue-600 mr-2"
                >
                  Edit
                </button>
                <button
                  onClick={() => handleArchivePlayer(player.name)}
                  className="bg-yellow-500 text-white px-3 py-1 rounded-md hover:bg-yellow-600"
                >
                  Archive
                </button>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
} 