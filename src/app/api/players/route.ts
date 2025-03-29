import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// Make route explicitly dynamic
export const dynamic = 'force-dynamic'
export const revalidate = 0

export async function GET() {
  try {
    const players = await prisma.player.findMany({
      include: {
        stats: true,
        matchesTeam1A: {
          take: 5,
          orderBy: { date: 'desc' }
        },
        matchesTeam1B: {
          take: 5,
          orderBy: { date: 'desc' }
        },
        matchesTeam2A: {
          take: 5,
          orderBy: { date: 'desc' }
        },
        matchesTeam2B: {
          take: 5,
          orderBy: { date: 'desc' }
        }
      }
    })

    return NextResponse.json(players)
  } catch (error) {
    console.error('Error fetching players:', error)
    return NextResponse.json(
      { error: 'Failed to fetch players' },
      { status: 500 }
    )
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    
    // Validate required fields
    if (!body.name || !body.profilePicture) {
      return NextResponse.json(
        { error: 'Name and profile picture are required' },
        { status: 400 }
      )
    }

    // Create new player with default stats
    const player = await prisma.player.create({
      data: {
        name: body.name,
        profilePicture: body.profilePicture,
        stats: {
          create: {
            totalMatches: 0,
            wins: 0,
            losses: 0,
            winRate: 0,
            pointsScored: 0,
            pointsConceded: 0
          }
        }
      },
      include: {
        stats: true
      }
    })

    return NextResponse.json({
      id: player.id,
      name: player.name,
      profilePicture: player.profilePicture,
      stats: player.stats ? {
        totalMatches: player.stats.totalMatches,
        wins: player.stats.wins,
        losses: player.stats.losses,
        winRate: player.stats.winRate
      } : {
        totalMatches: 0,
        wins: 0,
        losses: 0,
        winRate: 0
      }
    }, { status: 201 })
  } catch (error) {
    console.error('Error creating player:', error)
    return NextResponse.json(
      { error: 'Failed to create player' },
      { status: 500 }
    )
  }
} 