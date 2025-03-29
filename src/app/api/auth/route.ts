import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'

const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'pickleball2024'

export async function POST(request: Request) {
  try {
    const { password } = await request.json()

    if (password === ADMIN_PASSWORD) {
      // Set authentication cookie
      cookies().set('auth', 'true', {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 60 * 60 * 24 // 24 hours
      })

      return NextResponse.json({ success: true })
    }

    return NextResponse.json({ success: false }, { status: 401 })
  } catch (error) {
    return NextResponse.json({ success: false }, { status: 500 })
  }
} 