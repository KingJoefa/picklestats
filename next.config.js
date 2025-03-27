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