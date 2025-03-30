// This file is temporarily disabled to prevent build errors
// The functionality is available through the Pages Router API at /api/v1/stats

// import { prisma } from '@/lib/prisma'
// import { apiConfig, successResponse, errorResponse } from '@/lib/api-config'
import { NextRequest } from 'next/server'
// import { Match } from '@prisma/client'

// export const { runtime, dynamic } = apiConfig

// Using dynamic export to ensure this doesn't cause build-time errors
export const dynamic = 'force-dynamic'

// Simple response to indicate this API is temporarily disabled
export async function GET(request: NextRequest) {
  const url = new URL(request.url)
  const queryParams = url.searchParams.toString()
  const redirectUrl = `/api/v1/stats${queryParams ? '?' + queryParams : ''}`
  
  return new Response(
    JSON.stringify({
      success: false,
      message: 'This API endpoint is temporarily disabled. Please use /api/v1/stats instead.',
      redirectTo: redirectUrl
    }),
    {
      status: 307,
      headers: {
        'Content-Type': 'application/json',
        'Location': redirectUrl
      }
    }
  )
} 