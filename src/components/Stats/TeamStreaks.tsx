import { useEffect, useState } from 'react'
import Image from 'next/image'

const DEFAULT_AVATAR = '/players/default-avatar.svg'
const CARD_GRADIENTS = [
  'from-yellow-400 to-yellow-600', // Gold
  'from-gray-300 to-gray-500',     // Silver
  'from-amber-700 to-amber-400'    // Bronze
]
const CARD_LABELS = [
  '🥇 Longest Current Streak',
  '🥈 2nd Longest Streak',
  '🥉 3rd Longest Streak'
]
const CARD_ICONS = [
  // Gold: two same-size fire emojis
  [<span key="fire-left" className="text-4xl animate-pulse-glow">🔥</span>, <span key="fire-right" className="text-4xl animate-pulse-glow">🔥</span>],
  // Silver: two rocket ships
  [<span key="rocket-left" className="text-3xl animate-pulse-glow">🚀</span>, <span key="rocket-right" className="text-3xl animate-pulse-glow">🚀</span>],
  // Bronze: two party poppers
  [<span key="party-left" className="text-3xl animate-pulse-glow">🎉</span>, <span key="party-right" className="text-3xl animate-pulse-glow">🎉</span>],
]

export default function TeamStreaks() {
  const [streaks, setStreaks] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchStreaks() {
      setLoading(true)
      setError(null)
      try {
        const res = await fetch('/api/stats/streaks')
        if (!res.ok) throw new Error('Failed to fetch streaks')
        const data = await res.json()
        setStreaks(data.data)
      } catch (err: any) {
        setError(err.message || 'Unknown error')
      } finally {
        setLoading(false)
      }
    }
    fetchStreaks()
  }, [])

  return (
    <div className="w-full flex flex-col items-center justify-center min-h-[32rem]">
      <h2 className="text-3xl md:text-4xl font-extrabold mb-8 font-[Montserrat,Arial,sans-serif] tracking-tight text-center">Current Team Streaks</h2>
      {loading ? (
        <div className="text-lg text-gray-500 animate-pulse">Loading streaks...</div>
      ) : error ? (
        <div className="text-red-600 font-semibold">{error}</div>
      ) : streaks.length === 0 ? (
        <div className="text-gray-500 italic">No active streaks found.</div>
      ) : (
        <div className="flex flex-col md:flex-row gap-8 w-full max-w-5xl justify-center items-stretch">
          {streaks.map((streak, i) => (
            <div
              key={i}
              className={`flex-1 bg-gradient-to-br ${CARD_GRADIENTS[i]} rounded-2xl shadow-2xl p-8 flex flex-col items-center transition-transform duration-200 hover:scale-105 group relative min-w-[260px] max-w-[350px]`}
              style={{ minHeight: '24rem' }}
            >
              <div className="text-4xl md:text-5xl font-extrabold text-white mb-4 flex items-center gap-2 font-[Montserrat,Arial,sans-serif] drop-shadow-lg">
                {CARD_ICONS[i][0]}
                <span>{streak.streak} WINS</span>
                {CARD_ICONS[i][1]}
              </div>
              <div className="flex gap-6 mb-4">
                {streak.players.map((player: any, idx: number) => (
                  <div key={player.id || idx} className="flex flex-col items-center">
                    <div className="relative w-20 h-20 md:w-24 md:h-24 rounded-full overflow-hidden border-4 border-white shadow-lg mb-2 bg-gray-200">
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
                    <span className="text-lg md:text-xl font-bold text-white font-[Montserrat,Arial,sans-serif] drop-shadow-sm text-center">
                      {player.name}
                    </span>
                  </div>
                ))}
              </div>
              <div className="mt-auto text-white text-base md:text-lg font-semibold opacity-80 text-center">
                {CARD_LABELS[i]}
              </div>
            </div>
          ))}
        </div>
      )}
      <style jsx global>{`
        @keyframes pulse-glow {
          0%, 100% { filter: drop-shadow(0 0 8px #fff7ae) brightness(1.2); }
          50% { filter: drop-shadow(0 0 24px #ffd700) brightness(1.5); }
        }
        .animate-pulse-glow {
          animation: pulse-glow 2s infinite;
        }
      `}</style>
    </div>
  )
} 