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

  // --- Calculate player stats for today ---
  const playerStats: Record<string, {
    player: any,
    games: number,
    wins: number,
    losses: number,
    points: number,
  }> = {}

  todaysMatches.forEach((match: any) => {
    // Get players for both teams
    const team1 = [(match as any)["team1PlayerA"] ?? (match.team1 && match.team1[0]), (match as any)["team1PlayerB"] ?? (match.team1 && match.team1[1])]
    const team2 = [(match as any)["team2PlayerA"] ?? (match.team2 && match.team2[0]), (match as any)["team2PlayerB"] ?? (match.team2 && match.team2[1])]
    const team1Score = (match as any)["team1ScoreA"] !== undefined ? (match as any)["team1ScoreA"] : (match.score?.team1 ?? 0)
    const team2Score = (match as any)["team2ScoreA"] !== undefined ? (match as any)["team2ScoreA"] : (match.score?.team2 ?? 0)
    const winningTeam = (match as any)["winningTeam"] ?? (team1Score > team2Score ? 1 : 2)

    // Team 1
    team1.forEach((player: any) => {
      if (!player) return
      if (!playerStats[player.id]) playerStats[player.id] = { player, games: 0, wins: 0, losses: 0, points: 0 }
      playerStats[player.id].games++
      playerStats[player.id].points += team1Score
      if (winningTeam === 1) playerStats[player.id].wins++
      else playerStats[player.id].losses++
    })
    // Team 2
    team2.forEach((player: any) => {
      if (!player) return
      if (!playerStats[player.id]) playerStats[player.id] = { player, games: 0, wins: 0, losses: 0, points: 0 }
      playerStats[player.id].games++
      playerStats[player.id].points += team2Score
      if (winningTeam === 2) playerStats[player.id].wins++
      else playerStats[player.id].losses++
    })
  })

  // Find top players for each stat
  const mostGames = Object.values(playerStats).sort((a, b) => b.games - a.games)[0]
  const mostWins = Object.values(playerStats).sort((a, b) => b.wins - a.wins)[0]
  const mostLosses = Object.values(playerStats).sort((a, b) => b.losses - a.losses)[0]
  const mostPoints = Object.values(playerStats).sort((a, b) => b.points - a.points)[0]

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
          {mostGames && (
            <div className="mt-4">
              <p className="text-gray-600 text-sm">Most Games Played</p>
              <div className="flex items-center gap-2">
                <PlayerLink player={mostGames.player} />
                <span className="font-bold">{mostGames.games}</span>
              </div>
            </div>
          )}
          {mostWins && (
            <div className="mt-2">
              <p className="text-gray-600 text-sm">Most Wins Today</p>
              <div className="flex items-center gap-2">
                <PlayerLink player={mostWins.player} />
                <span className="font-bold">{mostWins.wins}</span>
              </div>
            </div>
          )}
          {mostLosses && (
            <div className="mt-2">
              <p className="text-gray-600 text-sm">Most Losses Today</p>
              <div className="flex items-center gap-2">
                <PlayerLink player={mostLosses.player} />
                <span className="font-bold">{mostLosses.losses}</span>
              </div>
            </div>
          )}
          {mostPoints && (
            <div className="mt-2">
              <p className="text-gray-600 text-sm">Most Points Scored</p>
              <div className="flex items-center gap-2">
                <PlayerLink player={mostPoints.player} />
                <span className="font-bold">{mostPoints.points}</span>
              </div>
            </div>
          )}
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