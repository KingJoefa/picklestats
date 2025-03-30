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

    console.log('Initializing Prisma client for player creation...')
    const prisma = new PrismaClient({
      datasources: {
        db: {
          url: process.env.DATABASE_URL + '?sslmode=require'
        }
      },
      log: ['error', 'warn']
    })

    try {
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
    } catch (dbError) {
      // Try to disconnect on error
      await prisma.$disconnect().catch(() => {})
      throw dbError // Re-throw for handling below
    }
  } catch (error) {
    console.error('Error creating player:', error)
    
    // Handle Prisma specific errors with better messaging
    if (error instanceof Error) {
      if (error.message.includes('Prisma Client initialization')) {
        return res.status(500).json({
          success: false,
          message: 'Database connection error',
          error: 'The database connection failed during initialization. Please check your configuration.',
          details: error.message
        })
      }
      
      if (error.message.includes('Unique constraint')) {
        return res.status(409).json({
          success: false,
          message: 'Player already exists',
          error: 'A player with this name already exists'
        })
      }
    }
    
    return res.status(500).json({
      success: false,
      message: 'Failed to create player',
      error: error instanceof Error ? error.message : String(error)
    })
  }
} 