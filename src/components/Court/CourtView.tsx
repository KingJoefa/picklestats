'use client'

import { motion } from 'framer-motion'
import Image from 'next/image'
import { useGameStore } from '@/store/gameStore'
import type { Player } from '@/store/gameStore'
import { useEffect, useState } from 'react'
import PlayerSelect from './PlayerSelect'
import ScoreInput from './ScoreInput'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'

interface PlayerAvatarProps {
  player: Player | null
  position: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right'
}

const PlayerAvatar = ({ player, position }: PlayerAvatarProps) => {
  if (!player) return null
  return (
    <div className="w-16 h-16 rounded-full bg-white/20 backdrop-blur-sm border-2 border-white flex items-center justify-center text-white font-bold">
      {player.name.charAt(0)}
    </div>
  )
}

interface PlayerSlotProps {
  player: Player | null
  onClick: () => void
  position: number
  onPlayerSelect: (playerId: string | null) => void
}

const PlayerSlot = ({ player, position, onPlayerSelect }: PlayerSlotProps) => {
  const availablePlayers = useGameStore(state => state.availablePlayers)

  return (
    <div className="player-slot cursor-pointer bg-white/90 backdrop-blur-sm">
      <p className="text-center text-gray-500 mb-2">
        Position {position}
      </p>
      <select
        value={player?.id || ''}
        onChange={(e) => onPlayerSelect(e.target.value || null)}
        className="w-full p-2 border rounded-md bg-white"
      >
        <option value="">Select Player</option>
        {availablePlayers.map((p) => (
          <option key={p.id} value={p.id}>
            {p.name}
          </option>
        ))}
      </select>
    </div>
  )
}

const CourtView = () => {
  const { players, score, setScore, endMatch, fetchPlayers } = useGameStore()
  const [showPickles, setShowPickles] = useState(false)

  useEffect(() => {
    fetchPlayers()
  }, [fetchPlayers])

  const handleSubmit = async () => {
    const winningTeam = score.team1 > score.team2 ? 1 : 2
    await endMatch(winningTeam)
    
    if (score.team1 === 0 || score.team2 === 0) {
      setShowPickles(true)
      setTimeout(() => setShowPickles(false), 3000)
    }
    
    toast.success('Match submitted successfully!', {
      description: `Final Score - Team 1: ${score.team1}, Team 2: ${score.team2}`,
    })
  }

  return (
    <div className="flex flex-col items-center gap-6 p-4 bg-gradient-to-br from-pink-500 via-teal-400 to-purple-500 rounded-lg">
      <div className="flex flex-col md:flex-row gap-8 w-full max-w-4xl">
        <div className="flex-1">
          <h2 className="text-xl font-bold mb-4 text-white drop-shadow-lg">Team 1</h2>
          <div className="space-y-4">
            <PlayerSelect team={1} position={0} />
            <PlayerSelect team={1} position={1} />
            <ScoreInput team={1} />
          </div>
        </div>
        <div className="flex-1">
          <h2 className="text-xl font-bold mb-4 text-white drop-shadow-lg">Team 2</h2>
          <div className="space-y-4">
            <PlayerSelect team={2} position={0} />
            <PlayerSelect team={2} position={1} />
            <ScoreInput team={2} />
          </div>
        </div>
      </div>

      {/* Court Visualization */}
      <div className="w-full max-w-4xl bg-gradient-to-b from-teal-600 to-teal-800 rounded-lg shadow-2xl p-8 border-4 border-white/30 backdrop-blur-sm relative overflow-hidden">
        <div className="relative aspect-[2/1]">
          <svg
            viewBox="0 0 1000 500"
            className="w-full h-full"
            style={{ filter: 'drop-shadow(0 0 15px rgba(255,255,255,0.3))' }}
          >
            {/* Main Court Outline */}
            <rect
              x="100"
              y="50"
              width="800"
              height="400"
              stroke="white"
              strokeWidth="4"
              fill="none"
              opacity="0.9"
            />
            
            {/* Net Visualization */}
            <rect
              x="495"
              y="50"
              width="10"
              height="400"
              fill="rgba(255,255,255,0.4)"
            />
          </svg>

          {/* Player Avatars */}
          <div className="absolute top-[25%] left-[20%]">
            <PlayerAvatar player={players.team1[0]} position="top-left" />
          </div>
          <div className="absolute top-[25%] right-[20%]">
            <PlayerAvatar player={players.team2[0]} position="top-right" />
          </div>
          <div className="absolute bottom-[25%] left-[20%]">
            <PlayerAvatar player={players.team1[1]} position="bottom-left" />
          </div>
          <div className="absolute bottom-[25%] right-[20%]">
            <PlayerAvatar player={players.team2[1]} position="bottom-right" />
          </div>

          {/* Pickle Celebration */}
          {showPickles && (
            <div className="absolute inset-0 pointer-events-none">
              {[...Array(20)].map((_, i) => (
                <div
                  key={i}
                  className="absolute animate-pickle"
                  style={{
                    left: `${Math.random() * 100}%`,
                    top: `${Math.random() * 100}%`,
                    animation: `pickle-fly ${1 + Math.random() * 2}s ease-out forwards`,
                    transform: `rotate(${Math.random() * 360}deg)`,
                  }}
                >
                  🥒
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <Button
        onClick={handleSubmit}
        className="bg-gradient-to-r from-pink-500 via-teal-400 to-purple-500 hover:from-pink-600 hover:via-teal-500 hover:to-purple-600 text-white font-bold py-3 px-8 rounded-lg shadow-lg transform hover:scale-105 transition-all duration-200 border-2 border-white/30 backdrop-blur-sm"
      >
        Submit Match
      </Button>

      <style jsx>{`
        @keyframes pickle-fly {
          0% {
            transform: scale(0) rotate(0deg);
            opacity: 0;
          }
          10% {
            opacity: 1;
            transform: scale(1.5) rotate(45deg);
          }
          100% {
            transform: scale(1) rotate(360deg) translate(${Math.random() > 0.5 ? '-' : ''}100vw, ${Math.random() > 0.5 ? '-' : ''}100vh);
            opacity: 0;
          }
        }
      `}</style>
    </div>
  )
}

export default CourtView 