import { NextApiRequest, NextApiResponse } from 'next'
import { PrismaClient } from '@prisma/client'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET') {
    try {
      console.log('Connecting to database with Prisma...')
      
      // Create Prisma client with more explicit error logging
      const prisma = new PrismaClient({
        datasources: {
          db: {
            url: process.env.DATABASE_URL + '?sslmode=require'
          }
        },
        log: ['query', 'info', 'warn', 'error'],
      })

      console.log('Prisma client created successfully')
      
      try {
        console.log('Fetching players from database using Pages Router API...')
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
      } catch (dbError) {
        // Make sure to disconnect on error
        await prisma.$disconnect().catch(() => {}) // Silence disconnect errors
        throw dbError // Re-throw for handling below
      }
    } catch (error) {
      console.error('Error in players API:', error)
      
      // Handle Prisma specific errors
      if (error instanceof Error) {
        if (error.message.includes('Prisma Client initialization')) {
          return res.status(500).json({
            success: false,
            error: 'Database initialization error',
            details: 'The database connection is misconfigured or Prisma Client needs to be generated',
            message: error.message
          })
        }
      }
      
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