import { NextRequest } from 'next/server'
import { cookies } from 'next/headers'
import { apiConfig, successResponse, errorResponse } from '@/lib/api-config'

export const { runtime, dynamic } = apiConfig

const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'Maitland'

export async function POST(request: NextRequest) {
  try {
    const { password } = await request.json()

    if (password !== ADMIN_PASSWORD) {
      return errorResponse('Invalid password', 401)
    }

    // Set authentication cookie
    cookies().set('auth', 'true', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 60 * 60 * 24 // 24 hours
    })

    return successResponse({ message: 'Authentication successful' })
  } catch (error) {
    return errorResponse('Authentication failed')
  }
} 