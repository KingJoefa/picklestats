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

export default function PlayerPage({ params }: { params: { id: string } }) {
  const [player, setPlayer] = useState<PlayerDetails | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  useEffect(() => {
    async function fetchPlayer() {
      try {
        setIsLoading(true)
        setError(null)
        console.log('Fetching player:', `/api/players/${params.id}`)
        const response = await fetch(`/api/players/${params.id}`)
        
        if (!response.ok) {
          if (response.status === 404) {
            setError('Player not found')
          } else {
            setError('Failed to fetch player details')
          }
          return
        }

        const data = await response.json()
        console.log('API response:', data)
        setPlayer(data.player)
      } catch (err) {
        setError('An error occurred while fetching player details')
        console.error('Error fetching player:', err)
      } finally {
        setIsLoading(false)
      }
    }

    fetchPlayer()
  }, [params.id])

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

  // Helper to determine if player was on team 1 or 2
  function getPlayerTeam(match: any, playerId: string) {
    if (match.team1PlayerA?.id === playerId || match.team1PlayerB?.id === playerId) return 1;
    if (match.team2PlayerA?.id === playerId || match.team2PlayerB?.id === playerId) return 2;
    return null;
  }

  // Helper to get teammates and opponents
  function getTeammatesAndOpponents(match: any, playerId: string) {
    const team = getPlayerTeam(match, playerId);
    let teammates = [];
    let opponents = [];
    if (team === 1) {
      teammates = [match.team1PlayerA, match.team1PlayerB].filter(p => p && p.id !== playerId);
      opponents = [match.team2PlayerA, match.team2PlayerB].filter(Boolean);
    } else if (team === 2) {
      teammates = [match.team2PlayerA, match.team2PlayerB].filter(p => p && p.id !== playerId);
      opponents = [match.team1PlayerA, match.team1PlayerB].filter(Boolean);
    }
    return { teammates, opponents, team };
  }

  // Calculate stats if not present
  const stats = player?.stats || (() => {
    const matches = player?.recentMatches || [];
    let wins = 0, losses = 0, pointsScored = 0, pointsConceded = 0;
    matches.forEach(match => {
      const { team } = getTeammatesAndOpponents(match, player.id);
      if (!team) return;
      const won = match.winningTeam === team;
      if (won) wins++; else losses++;
      if (team === 1) {
        pointsScored += match.team1ScoreA;
        pointsConceded += match.team2ScoreA;
      } else if (team === 2) {
        pointsScored += match.team2ScoreA;
        pointsConceded += match.team1ScoreA;
      }
    });
    const totalMatches = wins + losses;
    const winRate = totalMatches > 0 ? (wins / totalMatches) * 100 : 0;
    return { totalMatches, wins, losses, winRate, pointsScored, pointsConceded };
  })();

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
                <p className="text-xl font-semibold">{stats.totalMatches ?? 0}</p>
              </div>
              <div>
                <p className="text-gray-600">Win Rate</p>
                <p className="text-xl font-semibold">{stats.winRate?.toFixed(1) ?? 0}%</p>
              </div>
              <div>
                <p className="text-gray-600">Points Scored</p>
                <p className="text-xl font-semibold">{stats.pointsScored ?? 0}</p>
              </div>
              <div>
                <p className="text-gray-600">Points Conceded</p>
                <p className="text-xl font-semibold">{stats.pointsConceded ?? 0}</p>
              </div>
            </div>
          </div>
        </div>

        <div>
          <h2 className="text-2xl font-bold mb-4">Recent Matches</h2>
          <div className="space-y-4">
            {(player.recentMatches ?? []).map(match => {
              const { teammates, opponents, team } = getTeammatesAndOpponents(match, player.id);
              const won = match.winningTeam === team;
              return (
                <div key={match.id} className="bg-white rounded-lg shadow-md p-4">
                  <div className="flex justify-between items-center mb-2">
                    <div className="text-sm text-gray-500">
                      {match.date ? new Date(match.date).toLocaleDateString() : 'Unknown Date'}
                    </div>
                    <div className={won ? 'text-green-600 font-bold' : 'text-red-600 font-bold'}>
                      {won ? 'Won' : 'Lost'}
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-2 items-center mb-2">
                    <span className="font-semibold">Teammate(s):</span>
                    {teammates.length === 0 ? <span>None</span> : teammates.map(tm => (
                      <span key={tm.id} className="flex items-center gap-1">
                        <Image src={tm.profilePicture || DEFAULT_AVATAR} alt={tm.name} width={24} height={24} className="rounded-full" />
                        {tm.name}
                      </span>
                    ))}
                  </div>
                  <div className="flex flex-wrap gap-2 items-center mb-2">
                    <span className="font-semibold">Opponent(s):</span>
                    {opponents.length === 0 ? <span>None</span> : opponents.map(op => (
                      <span key={op.id} className="flex items-center gap-1">
                        <Image src={op.profilePicture || DEFAULT_AVATAR} alt={op.name} width={24} height={24} className="rounded-full" />
                        {op.name}
                      </span>
                    ))}
                  </div>
                  <div className="text-lg font-medium">
                    <span className="font-semibold">Score: </span>
                    Team 1: {match.team1ScoreA ?? '-'} - Team 2: {match.team2ScoreA ?? '-'}
                  </div>
                </div>
              );
            })}
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