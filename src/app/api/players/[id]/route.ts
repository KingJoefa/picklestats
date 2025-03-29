import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { apiConfig, successResponse, errorResponse } from '@/lib/api-config'

export const { runtime, dynamic } = apiConfig

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const player = await prisma.player.findUnique({
      where: { id: params.id },
      select: {
        id: true,
        name: true,
        profilePicture: true
      }
    })

    if (!player) {
      return errorResponse('Player not found', 404)
    }

    return successResponse({ player })
  } catch (error) {
    return errorResponse('Failed to fetch player')
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const data = await request.json()

    if (!data.name) {
      return errorResponse('Name is required', 400)
    }

    const player = await prisma.player.update({
      where: { id: params.id },
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

    return successResponse({ player })
  } catch (error) {
    return errorResponse('Failed to update player')
  }
} 