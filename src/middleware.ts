import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  // Get the pathname
  const pathname = request.nextUrl.pathname

  // Check if we're accessing the manage players page or on the add subdomain
  if (pathname.startsWith('/players/manage') || request.headers.get('host')?.startsWith('add.')) {
    // Check if the user is authenticated
    const isAuthenticated = request.cookies.get('auth')
    
    // If not authenticated and not already on the login page
    if (!isAuthenticated && !request.nextUrl.pathname.startsWith('/login')) {
      return NextResponse.redirect(new URL('/login', request.url))
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
} 