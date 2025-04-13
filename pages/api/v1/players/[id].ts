import { NextApiRequest, NextApiResponse } from 'next'
import { PrismaClient } from '@prisma/client'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { id } = req.query
  
  if (typeof id !== 'string') {
    return res.status(400).json({ success: false, message: 'Invalid player ID' })
  }

  if (req.method !== 'PUT') {
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
    const { name, profilePicture } = req.body

    if (!name) {
      return res.status(400).json({ 
        success: false, 
        message: 'Name is required' 
      })
    }

    const updatedPlayer = await prisma.player.update({
      where: { id },
      data: {
        name,
        ...(profilePicture && { profilePicture })
      }
    })

    await prisma.$disconnect()

    return res.status(200).json({
      success: true,
      message: 'Player updated successfully',
      player: updatedPlayer
    })
  } catch (error) {
    console.error('Error updating player:', error)
    await prisma.$disconnect()
    
    if (error instanceof Error && error.message.includes('Record to update not found')) {
      return res.status(404).json({
        success: false,
        message: 'Player not found'
      })
    }
    
    return res.status(500).json({
      success: false,
      message: 'Failed to update player',
      error: error instanceof Error ? error.message : String(error)
    })
  }
} 