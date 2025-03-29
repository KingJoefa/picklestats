import { NextRequest, NextResponse } from 'next/server'
import { createMatch, getMatches } from '@/services/matchService'
import { dynamic, runtime, revalidate } from './route.config'

export { dynamic, runtime, revalidate }

export async function POST(req: NextRequest) {
  if (req.method !== 'POST') {
    return NextResponse.json({ error: 'Method not allowed' }, { status: 405 })
  }

  try {
    const data = await req.json()

    // Validate required fields
    if (
      !data.team1PlayerA?.id ||
      !data.team1PlayerB?.id ||
      !data.team2PlayerA?.id ||
      !data.team2PlayerB?.id ||
      data.team1ScoreA === undefined ||
      data.team1ScoreB === undefined ||
      data.team2ScoreA === undefined ||
      data.team2ScoreB === undefined ||
      data.winningTeam === undefined
    ) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    const match = await createMatch(data)
    return NextResponse.json({ success: true, match })
  } catch (error) {
    console.error('Error creating match:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to create match' },
      { status: 500 }
    )
  }
}

export async function GET(req: NextRequest) {
  if (req.method !== 'GET') {
    return NextResponse.json({ error: 'Method not allowed' }, { status: 405 })
  }

  try {
    const matches = await getMatches()
    return NextResponse.json({ success: true, matches })
  } catch (error) {
    console.error('Error fetching matches:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch matches' },
      { status: 500 }
    )
  }
} 