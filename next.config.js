/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
    ],
  },
  // API rewrites to ensure both App Router and Pages Router APIs are accessible
  // and provide backwards compatibility
  async rewrites() {
    return [
      // Legacy client code may still be using /api/players, /api/matches, etc.
      // Redirect these to our v1 Pages Router endpoints for compatibility
      {
        source: '/api/players',
        destination: '/api/v1/players',
        has: [
          {
            type: 'header',
            key: 'x-use-pages-router',
          }
        ]
      },
      {
        source: '/api/matches',
        destination: '/api/v1/matches',
        has: [
          {
            type: 'header',
            key: 'x-use-pages-router',
          }
        ]
      },
      {
        source: '/api/stats',
        destination: '/api/v1/stats',
        has: [
          {
            type: 'header',
            key: 'x-use-pages-router',
          }
        ]
      }
    ]
  },
  // Optimize for development
  webpack: (config, { dev }) => {
    if (dev) {
      config.watchOptions = {
        poll: 5000,         // Reduced polling frequency
        aggregateTimeout: 1000,
        ignored: ['**/*.sqlite', '**/*.sqlite3', '**/*.db', '**/node_modules/**'],
      }
    }
    return config
  },
}

module.exports = nextConfig 