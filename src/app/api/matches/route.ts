import { NextResponse } from 'next/server'
import { createMatch, getMatches } from '@/services/matchService'

// Make route explicitly dynamic
export const dynamic = 'force-dynamic'
export const revalidate = 0

export async function POST(request: Request) {
  try {
    const data = await request.json()

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
    return NextResponse.json({ match })
  } catch (error) {
    console.error('Error creating match:', error)
    return NextResponse.json(
      { error: 'Failed to create match' },
      { status: 500 }
    )
  }
}

export async function GET() {
  try {
    const matches = await getMatches()
    return NextResponse.json(matches)
  } catch (error) {
    console.error('Error fetching matches:', error)
    return NextResponse.json(
      { error: 'Failed to fetch matches' },
      { status: 500 }
    )
  }
} 