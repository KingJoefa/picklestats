'use client'

import { useState } from 'react'
import PlayerDebug from '@/components/PlayerDebug'
import { API_PATHS } from '@/lib/api-paths'

export default function AdminPage() {
  const [isRunning, setIsRunning] = useState(false)
  const [result, setResult] = useState<string | null>(null)
  const [envInfo, setEnvInfo] = useState<string>("")
  
  // Get environment info
  const getEnvInfo = async () => {
    try {
      const response = await fetch('/api/test')
      const data = await response.json()
      setEnvInfo(JSON.stringify(data, null, 2))
    } catch (error) {
      setEnvInfo(`Error fetching environment info: ${error instanceof Error ? error.message : String(error)}`)
    }
  }
  
  // Run on component mount
  useState(() => {
    getEnvInfo()
  })
  
  const runDirectSeed = async () => {
    setIsRunning(true)
    setResult('Attempting to seed database directly from the frontend...')
    
    try {
      const response = await fetch(API_PATHS.ADMIN_SEED, {
        method: 'POST'
      })
      
      const responseText = await response.text()
      
      if (!response.ok) {
        throw new Error(`HTTP error ${response.status}: ${responseText}`)
      }
      
      try {
        const data = JSON.parse(responseText)
        setResult(JSON.stringify(data, null, 2))
      } catch (e) {
        // If response isn't valid JSON, just show the text
        setResult(responseText)
      }
    } catch (error) {
      setResult(`Error: ${error instanceof Error ? error.message : String(error)}`)
    } finally {
      setIsRunning(false)
    }
  }
  
  return (
    <div className="max-w-6xl mx-auto py-8">
      <h1 className="text-3xl font-bold mb-6">Admin Dashboard</h1>
      
      <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
        <h2 className="text-2xl font-bold mb-4">Database Management</h2>
        
        <div className="space-y-4">
          <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-md">
            <h3 className="font-semibold text-yellow-800">Database Connection Issues</h3>
            <p className="text-yellow-700 mt-1">
              If players are not appearing in the application, there may be issues with the database connection. 
              The following information might help diagnose the problem.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 bg-gray-50 rounded-md">
              <h3 className="font-semibold mb-2">Connection String Format</h3>
              <code className="block bg-gray-100 p-2 rounded text-sm overflow-auto whitespace-pre-wrap">
                postgresql://username:password@hostname:port/database?sslmode=require
              </code>
            </div>
            
            <div className="p-4 bg-gray-50 rounded-md">
              <h3 className="font-semibold mb-2">Database Provider</h3>
              <p>Supabase PostgreSQL</p>
            </div>
          </div>
          
          <div className="p-4 bg-gray-50 rounded-md">
            <h3 className="font-semibold mb-2">Environment Information</h3>
            <pre className="bg-gray-100 p-2 rounded text-sm overflow-auto whitespace-pre-wrap h-40">
              {envInfo || "Loading environment information..."}
            </pre>
            <button 
              onClick={getEnvInfo}
              className="mt-2 px-3 py-1 bg-gray-200 text-gray-700 rounded-md text-sm"
            >
              Refresh
            </button>
          </div>
        </div>
      </div>
      
      <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
        <h2 className="text-2xl font-bold mb-4">Manual Database Seeding</h2>
        
        <div className="mb-4 p-4 bg-blue-50 border border-blue-200 rounded-md">
          <p className="text-blue-700">
            The database has been seeded locally using <code>npx ts-node prisma/seed-production.ts</code>. 
            This button is only needed if you want to re-seed the database from the web interface.
          </p>
        </div>
        
        <button
          onClick={runDirectSeed}
          disabled={isRunning}
          className="px-4 py-2 bg-blue-600 text-white rounded-md disabled:opacity-50"
        >
          {isRunning ? 'Running...' : 'Seed Database Directly'}
        </button>
        
        {result && (
          <div className="mt-4">
            <h3 className="font-semibold mb-2">Result:</h3>
            <pre className="bg-gray-100 p-4 rounded overflow-auto max-h-60">
              {result}
            </pre>
          </div>
        )}

        <div className="mt-6 p-4 bg-gray-50 rounded-md">
          <h3 className="font-semibold mb-2">API Endpoints</h3>
          <ul className="list-disc pl-5 space-y-1">
            <li><span className="font-mono text-sm">{API_PATHS.PLAYERS_V1}</span> - List all players (Pages Router)</li>
            <li><span className="font-mono text-sm">{API_PATHS.PLAYERS}</span> - List all players (App Router)</li>
            <li><span className="font-mono text-sm">{API_PATHS.MATCHES_V1}</span> - List matches (Pages Router)</li>
            <li><span className="font-mono text-sm">{API_PATHS.STATS_V1}?players=id1,id2</span> - Compare player stats (Pages Router)</li>
            <li><span className="font-mono text-sm">{API_PATHS.ADMIN_SEED}</span> - Seed the database</li>
          </ul>
        </div>
      </div>
      
      <PlayerDebug />
    </div>
  )
} 