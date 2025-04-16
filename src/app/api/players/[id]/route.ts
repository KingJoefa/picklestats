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

    // --- COMMON PARTNERS ---
    const partnerStats: Record<string, { player: any, matches: number, wins: number, losses: number }> = {};
    allMatches.forEach(match => {
      let team = null;
      let partner = null;
      if (match.team1PlayerAId === id) {
        team = 1;
        partner = match.team1PlayerB;
      } else if (match.team1PlayerBId === id) {
        team = 1;
        partner = match.team1PlayerA;
      } else if (match.team2PlayerAId === id) {
        team = 2;
        partner = match.team2PlayerB;
      } else if (match.team2PlayerBId === id) {
        team = 2;
        partner = match.team2PlayerA;
      }
      if (partner && partner.id !== id) {
        const key = partner.id;
        if (!partnerStats[key]) {
          partnerStats[key] = { player: partner, matches: 0, wins: 0, losses: 0 };
        }
        partnerStats[key].matches++;
        const won = match.winningTeam === team;
        if (won) partnerStats[key].wins++;
        else partnerStats[key].losses++;
      }
    });
    const commonPartners = Object.values(partnerStats)
      .sort((a, b) => b.matches - a.matches)
      .slice(0, 3)
      .map(p => ({
        player: p.player,
        matches: p.matches,
        wins: p.wins,
        losses: p.losses,
        winPercentage: p.matches > 0 ? Math.round((p.wins / p.matches) * 1000) / 10 : 0
      }));

    // --- TOP OPPONENTS (INDIVIDUALS) ---
    const opponentStats: Record<string, { player: any, matches: number, wins: number, losses: number }> = {};
    allMatches.forEach(match => {
      let team = null;
      let opponents: any[] = [];
      if (match.team1PlayerAId === id || match.team1PlayerBId === id) {
        team = 1;
        opponents = [match.team2PlayerA, match.team2PlayerB];
      } else if (match.team2PlayerAId === id || match.team2PlayerBId === id) {
        team = 2;
        opponents = [match.team1PlayerA, match.team1PlayerB];
      }
      opponents.forEach(opponent => {
        if (opponent && opponent.id !== id) {
          const key = opponent.id;
          if (!opponentStats[key]) {
            opponentStats[key] = { player: opponent, matches: 0, wins: 0, losses: 0 };
          }
          opponentStats[key].matches++;
          const won = match.winningTeam === team;
          if (won) opponentStats[key].wins++;
          else opponentStats[key].losses++;
        }
      });
    });
    const topOpponents = Object.values(opponentStats)
      .sort((a, b) => b.matches - a.matches)
      .slice(0, 3)
      .map(o => ({
        player: o.player,
        matches: o.matches,
        wins: o.wins,
        losses: o.losses,
        winPercentage: o.matches > 0 ? Math.round((o.wins / o.matches) * 1000) / 10 : 0
      }));

    // --- TOP OPPONENT TEAMS ---
    const teamStats: Record<string, { team: any[], matches: number, wins: number, losses: number }> = {};
    allMatches.forEach(match => {
      let team = null;
      let opponentTeam: any[] = [];
      if (match.team1PlayerAId === id || match.team1PlayerBId === id) {
        team = 1;
        opponentTeam = [match.team2PlayerA, match.team2PlayerB];
      } else if (match.team2PlayerAId === id || match.team2PlayerBId === id) {
        team = 2;
        opponentTeam = [match.team1PlayerA, match.team1PlayerB];
      }
      if (opponentTeam.length === 2 && opponentTeam[0] && opponentTeam[1]) {
        // Sort IDs to avoid duplicate teams with reversed order
        const ids = [opponentTeam[0].id, opponentTeam[1].id].sort();
        const key = ids.join('-');
        if (!teamStats[key]) {
          teamStats[key] = { team: opponentTeam, matches: 0, wins: 0, losses: 0 };
        }
        teamStats[key].matches++;
        const won = match.winningTeam === team;
        if (won) teamStats[key].wins++;
        else teamStats[key].losses++;
      }
    });
    const topOpponentTeams = Object.values(teamStats)
      .sort((a, b) => b.matches - a.matches)
      .slice(0, 3)
      .map(t => ({
        team: t.team,
        matches: t.matches,
        wins: t.wins,
        losses: t.losses,
        winPercentage: t.matches > 0 ? Math.round((t.wins / t.matches) * 1000) / 10 : 0
      }));

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
      commonPartners,
      topOpponents,
      topOpponentTeams
    }

    return successResponse({ player: formattedPlayer })
  } catch (error) {
    console.error('Error fetching player by id:', error)
    return new Response(JSON.stringify({ error: 'Internal server error' }), { status: 500 })
  }
} 