// Shared configuration for all API routes
export const apiConfig = {
  runtime: 'nodejs' as const, // More stable with Prisma than edge runtime
  dynamic: 'force-dynamic' as const,
  headers: {
    'Content-Type': 'application/json',
    'Cache-Control': 'no-store, max-age=0'
  }
}

// Standard error response helper
export function errorResponse(message: string, status: number = 500) {
  return new Response(
    JSON.stringify({ success: false, error: message }),
    {
      status,
      headers: apiConfig.headers
    }
  )
}

// Standard success response helper
export function successResponse(data: any, status: number = 200) {
  return new Response(
    JSON.stringify({ success: true, ...data }),
    {
      status,
      headers: apiConfig.headers
    }
  )
} 