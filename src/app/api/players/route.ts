import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { apiConfig, successResponse, errorResponse } from '@/lib/api-config'

export const { runtime, dynamic } = apiConfig

export async function GET() {
  try {
    const players = await prisma.player.findMany({
      select: {
        id: true,
        name: true,
        profilePicture: true
      },
      orderBy: {
        name: 'asc'
      }
    })

    return successResponse({ players })
  } catch (error) {
    return errorResponse('Failed to fetch players')
  }
}

export async function POST(request: NextRequest) {
  try {
    const data = await request.json()
    
    if (!isValidPlayerData(data)) {
      return errorResponse('Name is required', 400)
    }

    const player = await prisma.player.create({
      data: {
        name: data.name,
        profilePicture: data.profilePicture || `https://ui-avatars.com/api/?name=${encodeURIComponent(data.name)}&background=random&size=200`
      },
      select: {
        id: true,
        name: true,
        profilePicture: true
      }
    })

    return successResponse({ player }, 201)
  } catch (error) {
    return errorResponse('Failed to create player')
  }
}

function isValidPlayerData(data: any): boolean {
  return !!data.name
} 