import { NextApiRequest, NextApiResponse } from 'next'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    // Basic API health check
    return res.status(200).json({
      success: true,
      message: 'API is working correctly',
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV || 'unknown',
      query: req.query,
      method: req.method
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