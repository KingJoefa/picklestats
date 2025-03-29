import { successResponse } from '@/lib/api-config'

export const dynamic = 'force-dynamic'
export const runtime = 'edge'

// Mock data for build time
const MOCK_MATCHES = [
  {
    id: 'mock-1',
    date: new Date().toISOString(),
    winningTeam: 1
  }
]

export async function GET() {
  return successResponse({ matches: MOCK_MATCHES })
} 