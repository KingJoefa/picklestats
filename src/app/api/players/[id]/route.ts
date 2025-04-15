import { apiConfig, successResponse } from '@/lib/api-config'
import { prisma } from '@/lib/prisma'
import { NextRequest } from 'next/server'

export const { runtime, dynamic } = apiConfig

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  const { id } = params
  try {
    const player = await prisma.player.findUnique({
      where: { id },
      include: {
        stats: true,
        commonPartners: true,
        topOpponents: true
      }
    })

    if (!player) {
      return new Response(JSON.stringify({ error: 'Player not found' }), { status: 404 })
    }

    // Fetch recent matches where the player participated in any slot
    const recentMatches = await prisma.match.findMany({
      where: {
        OR: [
          { team1PlayerAId: id },
          { team1PlayerBId: id },
          { team2PlayerAId: id },
          { team2PlayerBId: id }
        ]
      },
      orderBy: { date: 'desc' },
      take: 10,
      include: {
        team1PlayerA: true,
        team1PlayerB: true,
        team2PlayerA: true,
        team2PlayerB: true
      }
    })

    // Format matches for the frontend
    const formattedMatches = recentMatches.map(match => ({
      id: match.id,
      date: match.date,
      team1PlayerA: match.team1PlayerA ? {
        id: match.team1PlayerA.id,
        name: match.team1PlayerA.name,
        profilePicture: match.team1PlayerA.profilePicture
      } : null,
      team1PlayerB: match.team1PlayerB ? {
        id: match.team1PlayerB.id,
        name: match.team1PlayerB.name,
        profilePicture: match.team1PlayerB.profilePicture
      } : null,
      team2PlayerA: match.team2PlayerA ? {
        id: match.team2PlayerA.id,
        name: match.team2PlayerA.name,
        profilePicture: match.team2PlayerA.profilePicture
      } : null,
      team2PlayerB: match.team2PlayerB ? {
        id: match.team2PlayerB.id,
        name: match.team2PlayerB.name,
        profilePicture: match.team2PlayerB.profilePicture
      } : null,
      team1ScoreA: match.team1ScoreA,
      team1ScoreB: match.team1ScoreB,
      team2ScoreA: match.team2ScoreA,
      team2ScoreB: match.team2ScoreB,
      winningTeam: match.winningTeam
    }))

    // Format common partners and top opponents
    const formattedCommonPartners = (player.commonPartners || []).map(cp => ({
      player: {
        id: cp.partnerId,
        name: cp.partnerName,
        profilePicture: cp.partnerPicture
      },
      matches: cp.matches,
      wins: cp.wins
    }))
    const formattedTopOpponents = (player.topOpponents || []).map(to => ({
      player: {
        id: to.opponentId,
        name: to.opponentName,
        profilePicture: to.opponentPicture
      },
      matches: to.matches,
      wins: to.wins
    }))

    const formattedPlayer = {
      id: player.id,
      name: player.name,
      profilePicture: player.profilePicture,
      stats: player.stats || {
        totalMatches: 0,
        wins: 0,
        losses: 0,
        winRate: 0,
        pointsScored: 0,
        pointsConceded: 0
      },
      recentMatches: formattedMatches,
      commonPartners: formattedCommonPartners,
      topOpponents: formattedTopOpponents
    }

    return successResponse({ player: formattedPlayer })
  } catch (error) {
    console.error('Error fetching player by id:', error)
    return new Response(JSON.stringify({ error: 'Internal server error' }), { status: 500 })
  }
} 