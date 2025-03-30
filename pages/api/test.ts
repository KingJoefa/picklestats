import { NextApiRequest, NextApiResponse } from 'next'
import { PrismaClient } from '@prisma/client'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    // Database connection check
    let dbStatus = "Unknown"
    let dbError = null
    let playerCount = 0
    
    try {
      const prisma = new PrismaClient({
        datasources: {
          db: {
            url: process.env.DATABASE_URL + '?sslmode=require'
          }
        }
      })
      
      // Try a simple query to verify connection
      playerCount = await prisma.player.count()
      dbStatus = "Connected"
      
      await prisma.$disconnect()
    } catch (error) {
      dbStatus = "Error"
      dbError = error instanceof Error ? error.message : String(error)
    }
    
    // Basic API health check with environment info
    return res.status(200).json({
      success: true,
      message: 'API is working correctly',
      timestamp: new Date().toISOString(),
      environment: {
        nodeEnv: process.env.NODE_ENV || 'unknown',
        vercelEnv: process.env.NEXT_PUBLIC_VERCEL_ENV || 'unknown',
        region: process.env.VERCEL_REGION || 'unknown'
      },
      database: {
        status: dbStatus,
        error: dbError,
        playerCount: playerCount,
        connectionDefined: Boolean(process.env.DATABASE_URL)
      },
      request: {
        method: req.method,
        url: req.url,
        headers: {
          host: req.headers.host,
          userAgent: req.headers['user-agent']
        }
      }
    })
  } catch (error) {
    console.error('Error in test endpoint:', error)
    return res.status(500).json({
      success: false,
      message: 'API test failed',
      error: error instanceof Error ? error.message : String(error)
    })
  }
} 