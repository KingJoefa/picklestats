'use client'

import { useGameStore } from '@/store/gameStore'
import PlayerLink from '@/components/Players/PlayerLink'
import Image from 'next/image'

const DEFAULT_AVATAR = '/players/default-avatar.svg'

const StatsSummary = () => {
  const { matchHistory } = useGameStore()

  // Get current date in America/New_York timezone
  const now = new Date()
  const nyNow = new Date(now.toLocaleString('en-US', { timeZone: 'America/New_York' }))
  const nyYear = nyNow.getFullYear()
  const nyMonth = nyNow.getMonth()
  const nyDate = nyNow.getDate()

  // Filter matches to only those from today in NY time
  const todaysMatches = matchHistory.filter(match => {
    const matchDate = new Date(new Date(match.date).toLocaleString('en-US', { timeZone: 'America/New_York' }))
    return (
      matchDate.getFullYear() === nyYear &&
      matchDate.getMonth() === nyMonth &&
      matchDate.getDate() === nyDate
    )
  })

  return (
    <div className="bg-white rounded-xl shadow-lg p-6">
      <h2 className="text-2xl font-bold mb-6">Session Stats</h2>
      
      <div className="grid md:grid-cols-3 gap-6">
        <div className="bg-gray-50 rounded-lg p-4">
          <h3 className="text-lg font-semibold mb-2">Current Session</h3>
          <div>
            <p className="text-gray-600">Matches Played</p>
            <p className="text-2xl font-bold">{todaysMatches.length}</p>
          </div>
        </div>

        <div className="bg-gray-50 rounded-lg p-4 md:col-span-2">
          <h3 className="text-lg font-semibold mb-2">Recent Matches</h3>
          <div className="space-y-4">
            {todaysMatches.length === 0 ? (
              <p className="text-gray-500 text-center italic">
                No matches played yet
              </p>
            ) : (
              todaysMatches.slice(-3).reverse().map((match) => {
                // Support both DB and local match shapes
                const team1A = (match as any)["team1PlayerA"] ?? (match.team1 && match.team1[0]) ?? null;
                const team1B = (match as any)["team1PlayerB"] ?? (match.team1 && match.team1[1]) ?? null;
                const team2A = (match as any)["team2PlayerA"] ?? (match.team2 && match.team2[0]) ?? null;
                const team2B = (match as any)["team2PlayerB"] ?? (match.team2 && match.team2[1]) ?? null;
                const team1Score = (match as any)["team1ScoreA"] !== undefined ? (match as any)["team1ScoreA"] : (match.score?.team1 ?? 0);
                const team2Score = (match as any)["team2ScoreA"] !== undefined ? (match as any)["team2ScoreA"] : (match.score?.team2 ?? 0);
                const winningTeam = (match as any)["winningTeam"] ?? (team1Score > team2Score ? 1 : 2);
                return (
                  <div key={match.id} className="bg-white rounded-lg shadow-md p-4">
                    <div className="text-sm text-gray-500 mb-2">
                      {new Date(match.date).toLocaleDateString('en-US', { timeZone: 'America/New_York' })}
                    </div>
                    <div className="grid md:grid-cols-3 gap-4 items-center justify-items-center">
                      <div className="space-y-2 justify-self-end w-full">
                        <h3 className="font-semibold">Team 1</h3>
                        <div className="space-y-1">
                          <PlayerLink player={team1A} />
                          <PlayerLink player={team1B} />
                        </div>
                      </div>
                      <div className="text-center w-full flex flex-col items-center">
                        <div className="text-2xl font-bold">
                          {team1Score}-{team2Score}
                        </div>
                        <div className="text-sm text-gray-600">
                          Team {winningTeam} Won
                        </div>
                      </div>
                      <div className="space-y-2 justify-self-start w-full">
                        <h3 className="font-semibold">Team 2</h3>
                        <div className="space-y-1">
                          <PlayerLink player={team2A} />
                          <PlayerLink player={team2B} />
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default StatsSummary 