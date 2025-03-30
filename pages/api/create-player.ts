import { NextApiRequest, NextApiResponse } from 'next'
import { PrismaClient } from '@prisma/client'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, message: 'Method not allowed' })
  }

  try {
    const { name, profilePicture } = req.body

    if (!name || !profilePicture) {
      return res.status(400).json({ 
        success: false, 
        message: 'Missing required fields: name and profilePicture are required' 
      })
    }

    const prisma = new PrismaClient({
      datasources: {
        db: {
          url: process.env.DATABASE_URL + '?sslmode=require'
        }
      }
    })

    console.log('Creating player:', { name, profilePicture })
    
    const player = await prisma.player.create({
      data: {
        name,
        profilePicture,
      }
    })

    await prisma.$disconnect()

    return res.status(201).json({
      success: true,
      message: 'Player created successfully',
      player
    })
  } catch (error) {
    console.error('Error creating player:', error)
    return res.status(500).json({
      success: false,
      message: 'Failed to create player',
      error: error instanceof Error ? error.message : String(error)
    })
  }
} 