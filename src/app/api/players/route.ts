import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export const runtime = 'edge'
export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    const players = await prisma.player.findMany({
      include: {
        stats: true,
      },
      orderBy: {
        name: 'asc'
      }
    })

    return NextResponse.json({
      players: players.map(player => ({
        id: player.id,
        name: player.name,
        profilePicture: player.profilePicture,
        stats: player.stats ? {
          totalMatches: player.stats.totalMatches,
          wins: player.stats.wins,
          losses: player.stats.losses,
          winRate: player.stats.winRate,
          pointsScored: player.stats.pointsScored,
          pointsConceded: player.stats.pointsConceded
        } : {
          totalMatches: 0,
          wins: 0,
          losses: 0,
          winRate: 0,
          pointsScored: 0,
          pointsConceded: 0
        }
      }))
    })
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch players' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    if (!body.name || !body.profilePicture) {
      return NextResponse.json(
        { error: 'Name and profile picture are required' },
        { status: 400 }
      )
    }

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
      player: {
        id: player.id,
        name: player.name,
        profilePicture: player.profilePicture,
        stats: {
          totalMatches: 0,
          wins: 0,
          losses: 0,
          winRate: 0,
          pointsScored: 0,
          pointsConceded: 0
        }
      }
    }, { status: 201 })
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to create player' },
      { status: 500 }
    )
  }
} 