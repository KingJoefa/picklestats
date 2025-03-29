import { apiConfig, successResponse } from '@/lib/api-config'

export const { runtime, dynamic } = apiConfig

const MOCK_PLAYER = {
  id: 'mock-1',
  name: 'Mock Player',
  profilePicture: 'https://picsum.photos/200'
}

export async function GET() {
  return successResponse({ player: MOCK_PLAYER })
} 