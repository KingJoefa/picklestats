import { NextApiRequest, NextApiResponse } from 'next'
import { PrismaClient } from '@prisma/client'

// Initial player data to seed
const initialPlayers = [
  { name: 'John Doe', profilePicture: 'https://randomuser.me/api/portraits/men/1.jpg' },
  { name: 'Jane Smith', profilePicture: 'https://randomuser.me/api/portraits/women/2.jpg' },
  { name: 'Mike Johnson', profilePicture: 'https://randomuser.me/api/portraits/men/3.jpg' },
  { name: 'Sarah Williams', profilePicture: 'https://randomuser.me/api/portraits/women/4.jpg' },
  { name: 'Chris Brown', profilePicture: 'https://randomuser.me/api/portraits/men/5.jpg' },
  { name: 'Emily Davis', profilePicture: 'https://randomuser.me/api/portraits/women/6.jpg' },
  { name: 'David Wilson', profilePicture: 'https://randomuser.me/api/portraits/men/7.jpg' },
  { name: 'Jessica Taylor', profilePicture: 'https://randomuser.me/api/portraits/women/8.jpg' },
  { name: 'Daniel Martinez', profilePicture: 'https://randomuser.me/api/portraits/men/9.jpg' },
  { name: 'Lisa Anderson', profilePicture: 'https://randomuser.me/api/portraits/women/10.jpg' },
  { name: 'Robert Thomas', profilePicture: 'https://randomuser.me/api/portraits/men/11.jpg' },
  { name: 'Jennifer Garcia', profilePicture: 'https://randomuser.me/api/portraits/women/12.jpg' },
]

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // Only allow POST requests for this endpoint
  if (req.method !== 'POST') {
    return res.status(405).json({ 
      success: false, 
      message: 'Method not allowed. Only POST requests are accepted.' 
    })
  }

  // In a production environment, you'd want to add authentication here
  // This is just a basic example without proper auth
  
  try {
    const prisma = new PrismaClient({
      datasources: {
        db: {
          url: process.env.DATABASE_URL + '?sslmode=require'
        }
      }
    })

    console.log('Connected to database. Starting seed operation...')
    
    // First check if we already have players
    const existingPlayerCount = await prisma.player.count()
    
    if (existingPlayerCount > 0) {
      await prisma.$disconnect()
      return res.status(200).json({ 
        success: true, 
        message: `Database already has ${existingPlayerCount} players. No need to seed.`,
        existingCount: existingPlayerCount
      })
    }
    
    // Create players
    const createdPlayers = await Promise.all(
      initialPlayers.map(player => 
        prisma.player.create({
          data: player
        })
      )
    )
    
    await prisma.$disconnect()
    
    return res.status(200).json({ 
      success: true, 
      message: `Successfully seeded database with ${createdPlayers.length} players.`,
      players: createdPlayers.map(p => ({ id: p.id, name: p.name }))
    })
  } catch (error) {
    console.error('Error seeding database:', error)
    return res.status(500).json({ 
      success: false, 
      message: 'Failed to seed database',
      error: error instanceof Error ? error.message : String(error)
    })
  }
} 