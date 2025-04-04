// This file is temporarily disabled to prevent build errors
// The functionality is available through the Pages Router API at /api/v1/players

// import { prisma } from '@/lib/prisma'
// import { apiConfig, successResponse, errorResponse } from '@/lib/api-config'
// import { NextRequest, NextResponse } from 'next/server'

// export const { runtime, dynamic } = apiConfig

/*
export async function GET(request: NextRequest) {
  try {
    console.log('Fetching players from database...')
    const players = await prisma.player.findMany({
      include: {
        stats: true
      }
    }).catch(err => {
      console.error('Prisma error in players/route.ts:', err)
      throw new Error(`Database error: ${err.message || 'Unknown error'}`)
    })
    
    if (!players || players.length === 0) {
      console.log('No players found in database.')
      return successResponse({ 
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
    
    return successResponse({ data: formattedPlayers })
  } catch (error) {
    console.error('Error fetching players:', error instanceof Error ? error.message : String(error))
    
    let errorMessage = 'Failed to fetch players'
    let statusCode = 500
    
    if (error instanceof Error) {
      if (error.message.includes('database') || error.message.includes('prisma')) {
        errorMessage = 'Database connection error. Please check configuration.'
      } else if (error.message.includes('timeout')) {
        errorMessage = 'Request timed out. Please try again.'
      }
    }
    
    return errorResponse(errorMessage, statusCode)
  }
}
*/

// Using dynamic export to ensure this doesn't cause build-time errors
export const dynamic = 'force-dynamic'

// Simple response to indicate this API is temporarily disabled
export async function GET() {
  return new Response(
    JSON.stringify({
      success: false,
      message: 'This API endpoint is temporarily disabled. Please use /api/v1/players instead.',
      redirectTo: '/api/v1/players'
    }),
    {
      status: 307,
      headers: {
        'Content-Type': 'application/json',
        'Location': '/api/v1/players'
      }
    }
  )
} 