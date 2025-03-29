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