import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'
export const revalidate = 0

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const player = await prisma.player.findUnique({
      where: { id: params.id },
      include: {
        stats: true,
        commonPartners: true,
        topOpponents: true,
        matchesTeam1A: {
          include: {
            team1PlayerB: true,
            team2PlayerA: true,
            team2PlayerB: true
          },
          orderBy: { date: 'desc' },
          take: 5
        },
        matchesTeam1B: {
          include: {
            team1PlayerA: true,
            team2PlayerA: true,
            team2PlayerB: true
          },
          orderBy: { date: 'desc' },
          take: 5
        },
        matchesTeam2A: {
          include: {
            team1PlayerA: true,
            team1PlayerB: true,
            team2PlayerB: true
          },
          orderBy: { date: 'desc' },
          take: 5
        },
        matchesTeam2B: {
          include: {
            team1PlayerA: true,
            team1PlayerB: true,
            team2PlayerA: true
          },
          orderBy: { date: 'desc' },
          take: 5
        }
      }
    })

    if (!player) {
      return NextResponse.json(
        { error: 'Player not found' },
        { status: 404 }
      )
    }

    // Combine all matches and sort by date
    const recentMatches = [
      ...player.matchesTeam1A.map(match => ({
        id: match.id,
        date: match.date,
        winningTeam: match.winningTeam,
        team1ScoreA: match.team1ScoreA,
        team1ScoreB: match.team1ScoreB,
        team2ScoreA: match.team2ScoreA,
        team2ScoreB: match.team2ScoreB,
        wasTeam1: true,
        team1PlayerA: match.team1PlayerA,
        team1PlayerB: match.team1PlayerB,
        team2PlayerA: match.team2PlayerA,
        team2PlayerB: match.team2PlayerB
      })),
      ...player.matchesTeam1B.map(match => ({
        id: match.id,
        date: match.date,
        winningTeam: match.winningTeam,
        team1ScoreA: match.team1ScoreA,
        team1ScoreB: match.team1ScoreB,
        team2ScoreA: match.team2ScoreA,
        team2ScoreB: match.team2ScoreB,
        wasTeam1: true,
        team1PlayerA: match.team1PlayerA,
        team1PlayerB: match.team1PlayerB,
        team2PlayerA: match.team2PlayerA,
        team2PlayerB: match.team2PlayerB
      })),
      ...player.matchesTeam2A.map(match => ({
        id: match.id,
        date: match.date,
        winningTeam: match.winningTeam,
        team1ScoreA: match.team1ScoreA,
        team1ScoreB: match.team1ScoreB,
        team2ScoreA: match.team2ScoreA,
        team2ScoreB: match.team2ScoreB,
        wasTeam1: false,
        team1PlayerA: match.team1PlayerA,
        team1PlayerB: match.team1PlayerB,
        team2PlayerA: match.team2PlayerA,
        team2PlayerB: match.team2PlayerB
      })),
      ...player.matchesTeam2B.map(match => ({
        id: match.id,
        date: match.date,
        winningTeam: match.winningTeam,
        team1ScoreA: match.team1ScoreA,
        team1ScoreB: match.team1ScoreB,
        team2ScoreA: match.team2ScoreA,
        team2ScoreB: match.team2ScoreB,
        wasTeam1: false,
        team1PlayerA: match.team1PlayerA,
        team1PlayerB: match.team1PlayerB,
        team2PlayerA: match.team2PlayerA,
        team2PlayerB: match.team2PlayerB
      }))
    ].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 5)

    return NextResponse.json({
      id: player.id,
      name: player.name,
      profilePicture: player.profilePicture,
      stats: player.stats ? {
        totalMatches: player.stats.totalMatches,
        wins: player.stats.wins,
        losses: player.stats.losses,
        winRate: player.stats.winRate,
        pointsScored: player.stats.pointsScored,
        pointsConceded: player.stats.pointsConceded
      } : {
        totalMatches: 0,
        wins: 0,
        losses: 0,
        winRate: 0,
        pointsScored: 0,
        pointsConceded: 0
      },
      recentMatches,
      commonPartners: player.commonPartners.map(partner => ({
        player: {
          id: partner.partnerId,
          name: partner.partnerName,
          profilePicture: partner.partnerPicture
        },
        matches: partner.matches,
        wins: partner.wins
      })),
      topOpponents: player.topOpponents.map(opponent => ({
        player: {
          id: opponent.opponentId,
          name: opponent.opponentName,
          profilePicture: opponent.opponentPicture
        },
        matches: opponent.matches,
        wins: opponent.wins
      }))
    })
  } catch (error) {
    console.error('Error fetching player details:', error)
    return NextResponse.json(
      { error: 'Failed to fetch player details' },
      { status: 500 }
    )
  }
} 