import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// Helper to create a unique team key (order-independent)
function getTeamKey(a: string, b: string) {
  return [a, b].sort().join('-')
}

export const dynamic = 'force-dynamic'

export async function GET() {
  // 1. Get all matches, most recent first
  const matches = await prisma.match.findMany({
    orderBy: { date: 'desc' },
    include: {
      team1PlayerA: true,
      team1PlayerB: true,
      team2PlayerA: true,
      team2PlayerB: true,
    },
  })

  // 2. Build streaks for each unique team
  const streaks: Record<string, {
    players: [any, any],
    streak: number,
    lastWinDate: Date,
  }> = {}

  for (const match of matches) {
    // Team 1
    const team1Key = getTeamKey(match.team1PlayerAId, match.team1PlayerBId)
    const team1Won = match.winningTeam === 1
    if (!streaks[team1Key]) {
      streaks[team1Key] = {
        players: [match.team1PlayerA, match.team1PlayerB],
        streak: 0,
        lastWinDate: match.date,
      }
    }
    if (team1Won) {
      if (streaks[team1Key].streak === 0) {
        streaks[team1Key].lastWinDate = match.date
      }
      streaks[team1Key].streak++
    } else {
      streaks[team1Key].streak = 0
    }

    // Team 2
    const team2Key = getTeamKey(match.team2PlayerAId, match.team2PlayerBId)
    const team2Won = match.winningTeam === 2
    if (!streaks[team2Key]) {
      streaks[team2Key] = {
        players: [match.team2PlayerA, match.team2PlayerB],
        streak: 0,
        lastWinDate: match.date,
      }
    }
    if (team2Won) {
      if (streaks[team2Key].streak === 0) {
        streaks[team2Key].lastWinDate = match.date
      }
      streaks[team2Key].streak++
    } else {
      streaks[team2Key].streak = 0
    }
  }

  // 3. Get top 3 current streaks (streak > 0)
  const topStreaks = Object.values(streaks)
    .filter(s => s.streak > 0)
    .sort((a, b) => b.streak - a.streak || b.lastWinDate.getTime() - a.lastWinDate.getTime())
    .slice(0, 3)

  return NextResponse.json({ data: topStreaks })
} 