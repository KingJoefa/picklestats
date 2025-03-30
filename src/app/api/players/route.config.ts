// This file ensures the route is not processed during build time

export const dynamic = 'force-dynamic'
export const runtime = 'edge'

// This technique helps prevent build-time errors when using Prisma 
// with the App Router, especially in serverless environments 