import { NextApiRequest, NextApiResponse } from 'next'
import { PrismaClient, Match } from '@prisma/client'

const prisma = new PrismaClient()

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET') {
    try {
      const { players } = req.query
      const playerIds = typeof players === 'string' ? players.split(',') : []
      
      if (!playerIds.length) {
        return res.status(400).json({ 
          success: false, 
          error: 'Please select at least one player to view stats' 
        })
      }
      
      // Get player stats
      const playerStats = await prisma.playerStats.findMany({
        where: {
          playerId: {
            in: playerIds
          }
        },
        include: {
          player: true
        }
      })
      
      // Format stats for response
      const stats = playerStats.map(stat => ({
        id: stat.id,
        player: {
          id: stat.player.id,
          name: stat.player.name,
          profilePicture: stat.player.profilePicture
        },
        totalMatches: stat.totalMatches,
        wins: stat.wins,
        losses: stat.losses,
        winRate: stat.winRate * 100, // Convert to percentage
        pointsScored: stat.pointsScored,
        pointsConceded: stat.pointsConceded
      }))
      
      // Get head-to-head matches if there are 2 players
      let headToHead: Match[] = []
      if (playerIds.length === 2) {
        headToHead = await prisma.match.findMany({
          where: {
            OR: [
              {
                AND: [
                  { team1PlayerAId: playerIds[0] },
                  { team2PlayerAId: playerIds[1] }
                ]
              },
              {
                AND: [
                  { team1PlayerBId: playerIds[0] },
                  { team2PlayerBId: playerIds[1] }
                ]
              },
              {
                AND: [
                  { team1PlayerAId: playerIds[1] },
                  { team2PlayerAId: playerIds[0] }
                ]
              },
              {
                AND: [
                  { team1PlayerBId: playerIds[1] },
                  { team2PlayerBId: playerIds[0] }
                ]
              }
            ]
          },
          orderBy: {
            date: 'desc'
          },
          take: 5
        })
      }
      
      return res.status(200).json({ 
        success: true,
        stats, 
        headToHead,
        message: stats.length === 0 ? 'No stats available for the selected players' : undefined
      })
    } catch (error) {
      console.error('Error fetching stats:', error)
      return res.status(500).json({ 
        success: false, 
        error: 'Failed to fetch player statistics' 
      })
    }
  } else {
    res.setHeader('Allow', ['GET'])
    res.status(405).end(`Method ${req.method} Not Allowed`)
  }
} 