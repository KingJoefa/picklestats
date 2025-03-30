import { NextApiRequest, NextApiResponse } from 'next'
import { PrismaClient } from '@prisma/client'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET') {
    try {
      console.log('Fetching players from database using Pages Router API...')
      
      const prisma = new PrismaClient({
        datasources: {
          db: {
            url: process.env.DATABASE_URL + '?sslmode=require'
          }
        }
      })
      
      const players = await prisma.player.findMany({
        include: {
          stats: true
        }
      })
      
      await prisma.$disconnect()
      
      if (!players || players.length === 0) {
        console.log('No players found in database.')
        return res.status(200).json({ 
          success: true,
          data: [],
          message: 'No players found in database. Try running the seed script.'
        })
      }
      
      console.log(`Found ${players.length} players.`)
      const formattedPlayers = players.map(player => ({
        id: player.id,
        name: player.name,
        profilePicture: player.profilePicture,
        stats: {
          matches: player.stats?.totalMatches || 0,
          wins: player.stats?.wins || 0,
          losses: player.stats?.losses || 0,
          winRate: player.stats?.winRate || 0
        }
      }))
      
      return res.status(200).json({ 
        success: true,
        data: formattedPlayers 
      })
    } catch (error) {
      console.error('Error fetching players:', error)
      return res.status(500).json({ 
        success: false, 
        error: 'Failed to fetch players', 
        details: error instanceof Error ? error.message : String(error) 
      })
    }
  } else {
    res.setHeader('Allow', ['GET'])
    res.status(405).end(`Method ${req.method} Not Allowed`)
  }
} 