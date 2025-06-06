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

const DEFAULT_AVATAR = '/players/default-avatar.svg'

interface PlayerAvatarProps {
  player: Player | null
  position: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right'
}

const PlayerAvatar = ({ player, position }: PlayerAvatarProps) => {
  if (!player) return null
  return (
    <div className="relative w-16 h-16 rounded-full overflow-hidden border-2 border-white/30 backdrop-blur-sm">
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
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    fetchPlayers()
  }, [fetchPlayers])

  const validateMatch = () => {
    // Check if all players are selected
    if (!players.team1[0] || !players.team1[1] || !players.team2[0] || !players.team2[1]) {
      toast.error('Missing players', {
        description: 'Please select all player positions to continue',
      })
      return false
    }

    // Check if score is valid (not 0-0)
    if (score.team1 === 0 && score.team2 === 0) {
      toast.error('Invalid score', {
        description: 'The score cannot be 0-0. Please enter valid scores.',
      })
      return false
    }

    // Check duplicate players
    const playerIds = [
      players.team1[0]?.id,
      players.team1[1]?.id,
      players.team2[0]?.id,
      players.team2[1]?.id,
    ]
    
    const uniqueIds = new Set(playerIds)
    if (uniqueIds.size !== 4) {
      toast.error('Duplicate players', {
        description: 'The same player cannot be in multiple positions',
      })
      return false
    }

    return true
  }

  const handleSubmit = async () => {
    if (!validateMatch()) {
      return
    }

    setIsSubmitting(true)
    
    try {
      const winningTeam = score.team1 > score.team2 ? 1 : 2
      await endMatch(winningTeam)
      
      toast.success('Match Recorded! 🎉', {
        description: `Final Score - Team ${winningTeam} wins: ${winningTeam === 1 ? score.team1 : score.team2}-${winningTeam === 1 ? score.team2 : score.team1}`,
        duration: 3000,
        className: 'bg-gradient-to-r from-pink-500 via-teal-400 to-purple-500 text-white border-none',
        style: {
          boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
        }
      })
      
      if (Math.random() > 0.8) {
        setShowPickles(true)
        setTimeout(() => setShowPickles(false), 3000)
      }
    } catch (error) {
      console.error('Error submitting match:', error)
      toast.error('Failed to submit match', {
        description: 'There was an error saving the match. Please try again.',
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="flex flex-col items-center gap-6 p-4 bg-gradient-to-br from-pink-500 to-cyan-400 rounded-lg">
      <div className="flex flex-col md:flex-row gap-8 w-full max-w-4xl">
        <div className="flex-1">
          <h2 className="text-xl font-bold mb-4 text-white drop-shadow-lg">Team 1</h2>
          <div className="space-y-4">
            <PlayerSelect team={1} position={0} />
            <PlayerSelect team={1} position={1} />
            <div className="flex justify-center">
              <ScoreInput team={1} label="Score" />
            </div>
          </div>
        </div>
        <div className="flex-1">
          <h2 className="text-xl font-bold mb-4 text-white drop-shadow-lg">Team 2</h2>
          <div className="space-y-4">
            <PlayerSelect team={2} position={0} />
            <PlayerSelect team={2} position={1} />
            <div className="flex justify-center">
              <ScoreInput team={2} label="Score" />
            </div>
          </div>
        </div>
      </div>

      {/* Court Visualization */}
      <div className="w-full max-w-4xl rounded-2xl shadow-2xl p-8 border-2 border-white/40 backdrop-blur-sm relative overflow-hidden" style={{ background: '#008060' }}>
        <div className="relative aspect-[2/1]">
          <svg
            viewBox="0 0 1000 500"
            className="w-full h-full"
            style={{ filter: 'drop-shadow(0 0 15px rgba(255,255,255,0.3))' }}
          >
            {/* Main Court Outline - 2.2:1 ratio (44ft:20ft) */}
            <rect
              x="100"
              y="100"
              width="800"
              height="363"
              stroke="white"
              strokeWidth="4"
              fill="#008060"
              opacity="0.97"
            />
            
            {/* Net Visualization */}
            <line
              x1="500"
              y1="100"
              x2="500"
              y2="463"
              stroke="white"
              strokeWidth="4"
              opacity="0.9"
            />

            {/* Kitchen Lines - 7ft from net each side */}
            <line
              x1="373"
              y1="100"
              x2="373"
              y2="463"
              stroke="white"
              strokeWidth="2"
              opacity="0.9"
            />
            <line
              x1="627"
              y1="100"
              x2="627"
              y2="463"
              stroke="white"
              strokeWidth="2"
              opacity="0.9"
            />

            {/* Center Service Lines - horizontal T with kitchen lines */}
            <line
              x1="100"
              y1="281"
              x2="373"
              y2="281"
              stroke="white"
              strokeWidth="2"
              opacity="0.9"
            />
            <line
              x1="627"
              y1="281"
              x2="900"
              y2="281"
              stroke="white"
              strokeWidth="2"
              opacity="0.9"
            />
          </svg>

          {/* Player Avatars */}
          {/* Team 1, Player 1 - Top Left */}
          <div className="absolute top-4 left-4">
            <PlayerAvatar player={players.team1[0]} position="top-left" />
          </div>
          
          {/* Team 2, Player 1 - Top Right */}
          <div className="absolute top-4 right-4">
            <PlayerAvatar player={players.team2[0]} position="top-right" />
          </div>
          
          {/* Team 1, Player 2 - Bottom Left */}
          <div className="absolute bottom-4 left-4">
            <PlayerAvatar player={players.team1[1]} position="bottom-left" />
          </div>
          
          {/* Team 2, Player 2 - Bottom Right */}
          <div className="absolute bottom-4 right-4">
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
        disabled={isSubmitting}
        className="bg-gradient-to-r from-pink-500 to-cyan-400 hover:from-pink-600 hover:to-cyan-500 text-white font-bold py-3 px-8 rounded-lg shadow-lg transform hover:scale-105 transition-all duration-200 border-2 border-white/30 backdrop-blur-sm"
      >
        {isSubmitting ? 'Submitting...' : 'Submit Match'}
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