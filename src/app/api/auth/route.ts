import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { apiConfig, successResponse, errorResponse } from '@/lib/api-config'

export const { runtime, dynamic } = apiConfig

const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'Maitland'

export async function POST(request: NextRequest) {
  let password = ''
  const contentType = request.headers.get('content-type') || ''

  if (contentType.includes('application/json')) {
    // Handle JSON body (for API clients)
    const body = await request.json()
    password = body.password || ''
  } else if (contentType.includes('application/x-www-form-urlencoded')) {
    // Handle form POST (from browser)
    const formData = await request.formData()
    password = formData.get('password')?.toString() || ''
  }

  if (password !== ADMIN_PASSWORD) {
    // If form POST, redirect with error
    if (contentType.includes('application/x-www-form-urlencoded')) {
      return NextResponse.redirect(new URL('/login?error=1', request.url))
    }
    // If API, return error JSON
    return errorResponse('Invalid password', 401)
  }

  // Set authentication cookie
  cookies().set('auth', 'true', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 60 * 60 * 24 // 24 hours
  })

  // If form POST, redirect to manage page
  if (contentType.includes('application/x-www-form-urlencoded')) {
    return NextResponse.redirect(new URL('/players/manage', request.url))
  }
  // If API, return success JSON
  return successResponse({ message: 'Authentication successful' })
} 