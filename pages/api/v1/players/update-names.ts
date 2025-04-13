import { NextApiRequest, NextApiResponse } from 'next'
import { PrismaClient } from '@prisma/client'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, message: 'Method not allowed' })
  }

  const prisma = new PrismaClient({
    datasources: {
      db: {
        url: process.env.DATABASE_URL + '?sslmode=require'
      }
    }
  })

  try {
    const players = await prisma.player.findMany({
      orderBy: {
        createdAt: 'asc'
      },
      take: 6
    })

    // Update the first 6 players with new names
    const newNames = [
      'Joseph Farley',
      'Zach Farley',
      'Jared Farley',
      'Jenna Farley',
      'Jill Farley',
      'Jeff Farley'
    ]

    for (let i = 0; i < Math.min(players.length, newNames.length); i++) {
      await prisma.player.update({
        where: { id: players[i].id },
        data: { name: newNames[i] }
      })
    }

    await prisma.$disconnect()

    return res.status(200).json({
      success: true,
      message: 'Player names updated successfully'
    })
  } catch (error) {
    console.error('Error updating player names:', error)
    await prisma.$disconnect()
    
    return res.status(500).json({
      success: false,
      message: 'Failed to update player names',
      error: error instanceof Error ? error.message : String(error)
    })
  }
} 