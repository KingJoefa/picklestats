/**
 * API path constants to be used throughout the application
 * This helps maintain consistent API usage as we transition between
 * Pages Router API (v1) and App Router API
 */

// API base paths
export const API_BASE = '/api'
export const API_V1_BASE = '/api/v1'

// Pages Router API (v1) endpoints
export const API_PATHS = {
  // Pages Router (v1) endpoints
  PLAYERS_V1: `${API_V1_BASE}/players`,
  MATCHES_V1: `${API_V1_BASE}/matches`,
  STATS_V1: `${API_V1_BASE}/stats`,
  
  // App Router endpoints
  PLAYERS: `${API_BASE}/players`,
  MATCHES: `${API_BASE}/matches`,
  STATS: `${API_BASE}/stats`,
  
  // Admin endpoints
  ADMIN_SEED: `${API_BASE}/admin/seed`,
  TEST: `${API_BASE}/test`,
  CREATE_PLAYER: `${API_BASE}/create-player`,
}

// Helper for adding custom headers to fetch requests
export const createPagesRouterFetchOptions = (options: RequestInit = {}): RequestInit => {
  return {
    ...options,
    headers: {
      ...options.headers,
      'x-use-pages-router': 'true'
    }
  }
}

// Example usage:
// import { API_PATHS, createPagesRouterFetchOptions } from '@/lib/api-paths'
//
// // Using Pages Router API
// const response = await fetch(API_PATHS.PLAYERS_V1)
//
// // Using App Router API
// const response = await fetch(API_PATHS.PLAYERS)
//
// // Using backwards compatibility with custom header
// const response = await fetch('/api/players', createPagesRouterFetchOptions()) 