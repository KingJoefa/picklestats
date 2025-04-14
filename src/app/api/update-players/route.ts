import { prisma } from '@/lib/prisma'
import { NextResponse } from 'next/server'
import { headers } from 'next/headers'

export async function POST() {
  try {
    // Security check - verify the request is coming from Vercel
    const headersList = headers()
    const host = headersList.get('host')
    
    if (!host?.includes('vercel.app')) {
      return NextResponse.json({
        status: 'error',
        message: 'Unauthorized - This endpoint can only be called from Vercel'
      }, { status: 401 })
    }

    // Get all current players
    const currentPlayers = await prisma.player.findMany()
    
    // Keep Zach and Phil
    const playersToKeep = currentPlayers.filter(player => 
      player.name.toLowerCase() === 'zach' || 
      player.name.toLowerCase() === 'phil'
    )

    // Delete all other players
    const playersToDelete = currentPlayers.filter(player => 
      player.name.toLowerCase() !== 'zach' && 
      player.name.toLowerCase() !== 'phil'
    )

    // Delete players in a single transaction
    await prisma.$transaction(
      playersToDelete.map(player => 
        prisma.player.delete({
          where: { id: player.id }
        })
      )
    )

    // Create new players in a single transaction
    const newPlayers = ['Matt', 'Larry', 'Dan', 'Dustin']
    const createdPlayers = await prisma.$transaction(
      newPlayers.map(name => 
        prisma.player.create({
          data: {
            name,
            profilePicture: `https://api.dicebear.com/7.x/initials/svg?seed=${name}`
          }
        })
      )
    )

    // Get final state of all players
    const finalPlayers = await prisma.player.findMany({
      select: {
        id: true,
        name: true,
        profilePicture: true
      },
      orderBy: {
        name: 'asc'
      }
    })

    return NextResponse.json({
      status: 'success',
      message: 'Players updated successfully',
      finalPlayers,
      operations: {
        kept: playersToKeep.length,
        deleted: playersToDelete.length,
        created: createdPlayers.length
      }
    })
  } catch (error) {
    console.error('Error updating players:', error)
    return NextResponse.json({
      status: 'error',
      message: 'Failed to update players',
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
} 