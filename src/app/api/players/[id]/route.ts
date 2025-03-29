import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export const runtime = 'edge'
export const dynamic = 'force-dynamic'

interface Match {
  id: string
  date: Date
  winningTeam: number
  team1ScoreA: number
  team2ScoreA: number
}

interface Partner {
  partnerId: string
  partnerName: string
  partnerPicture: string
  matches: number
  wins: number
}

interface Opponent {
  opponentId: string
  opponentName: string
  opponentPicture: string
  matches: number
  wins: number
}

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = params.id
    
    const player = await prisma.player.findUnique({
      where: { id },
      include: {
        stats: true,
        commonPartners: true,
        topOpponents: true,
        matchesTeam1A: {
          include: {
            team1PlayerA: true,
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
            team1PlayerB: true,
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
            team2PlayerA: true,
            team2PlayerB: true
          },
          orderBy: { date: 'desc' },
          take: 5
        },
        matchesTeam2B: {
          include: {
            team1PlayerA: true,
            team1PlayerB: true,
            team2PlayerA: true,
            team2PlayerB: true
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
      ...player.matchesTeam1A,
      ...player.matchesTeam1B,
      ...player.matchesTeam2A,
      ...player.matchesTeam2B
    ]
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 5)
    .map(match => ({
      id: match.id,
      date: match.date,
      winningTeam: match.winningTeam,
      team1ScoreA: match.team1ScoreA,
      team2ScoreA: match.team2ScoreA,
      wasTeam1: match.team1PlayerAId === id || match.team1PlayerBId === id
    }))

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
      commonPartners: player.commonPartners.map((partner: Partner) => ({
        player: {
          id: partner.partnerId,
          name: partner.partnerName,
          profilePicture: partner.partnerPicture
        },
        matches: partner.matches,
        wins: partner.wins
      })),
      topOpponents: player.topOpponents.map((opponent: Opponent) => ({
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

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = params.id
    const data = await request.json()

    if (!data.name) {
      return NextResponse.json(
        { error: 'Name is required' },
        { status: 400 }
      )
    }

    const updatedPlayer = await prisma.player.update({
      where: { id },
      data: {
        name: data.name,
        profilePicture: data.profilePicture || `https://ui-avatars.com/api/?name=${encodeURIComponent(data.name)}&background=random&size=200`
      }
    })

    return NextResponse.json(updatedPlayer)
  } catch (error) {
    console.error('Error updating player:', error)
    return NextResponse.json(
      { error: 'Failed to update player' },
      { status: 500 }
    )
  }
} 