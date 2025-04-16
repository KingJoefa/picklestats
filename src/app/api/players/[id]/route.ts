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

    // Fetch ALL matches for stats
    const allMatches = await prisma.match.findMany({
      where: {
        OR: [
          { team1PlayerAId: id },
          { team1PlayerBId: id },
          { team2PlayerAId: id },
          { team2PlayerBId: id }
        ]
      },
      orderBy: { date: 'desc' },
      include: {
        team1PlayerA: true,
        team1PlayerB: true,
        team2PlayerA: true,
        team2PlayerB: true
      }
    })

    // Calculate stats from all matches
    let wins = 0, losses = 0, pointsScored = 0, pointsConceded = 0;
    allMatches.forEach(match => {
      let team = null;
      if (match.team1PlayerAId === id || match.team1PlayerBId === id) team = 1;
      if (match.team2PlayerAId === id || match.team2PlayerBId === id) team = 2;
      const won = match.winningTeam === team;
      if (won) wins++; else losses++;
      // Sum both A and B scores for each team
      const team1Total = (match.team1ScoreA || 0) + (match.team1ScoreB || 0);
      const team2Total = (match.team2ScoreA || 0) + (match.team2ScoreB || 0);
      if (team === 1) {
        pointsScored += team1Total;
        pointsConceded += team2Total;
      } else if (team === 2) {
        pointsScored += team2Total;
        pointsConceded += team1Total;
      }
    });
    const totalMatches = wins + losses;
    const winRate = totalMatches > 0 ? (wins / totalMatches) * 100 : 0;

    // Calculate Last 10 record
    const last10 = allMatches.slice(0, 10);
    let last10Wins = 0, last10Losses = 0;
    last10.forEach(match => {
      let team = null;
      if (match.team1PlayerAId === id || match.team1PlayerBId === id) team = 1;
      if (match.team2PlayerAId === id || match.team2PlayerBId === id) team = 2;
      const won = match.winningTeam === team;
      if (won) last10Wins++; else last10Losses++;
    });

    // Calculate current streak (win or loss)
    let streakType = null;
    let streakCount = 0;
    for (const match of allMatches) {
      let team = null;
      if (match.team1PlayerAId === id || match.team1PlayerBId === id) team = 1;
      if (match.team2PlayerAId === id || match.team2PlayerBId === id) team = 2;
      const won = match.winningTeam === team;
      if (streakType === null) {
        streakType = won ? 'W' : 'L';
        streakCount = 1;
      } else if ((won && streakType === 'W') || (!won && streakType === 'L')) {
        streakCount++;
      } else {
        break;
      }
    }
    let streak = streakType ? `${streakType}${streakCount}` : 'None';

    // Format recent matches for display (last 10)
    const formattedRecentMatches = last10.map(match => ({
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
    }));

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
      stats: {
        matches: totalMatches,
        wins,
        losses,
        winRate,
        pointsScored,
        pointsConceded,
        last10Record: `${last10Wins}-${last10Losses}`,
        streak
      },
      recentMatches: formattedRecentMatches,
      commonPartners: formattedCommonPartners,
      topOpponents: formattedTopOpponents
    }

    return successResponse({ player: formattedPlayer })
  } catch (error) {
    console.error('Error fetching player by id:', error)
    return new Response(JSON.stringify({ error: 'Internal server error' }), { status: 500 })
  }
} 