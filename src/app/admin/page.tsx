'use client'

import { useState } from 'react'
import PlayerDebug from '@/components/PlayerDebug'

export default function AdminPage() {
  const [isRunning, setIsRunning] = useState(false)
  const [result, setResult] = useState<string | null>(null)
  
  const runDirectSeed = async () => {
    setIsRunning(true)
    setResult('Attempting to seed database directly from the frontend...')
    
    try {
      const response = await fetch('/api/admin/seed', {
        method: 'POST'
      })
      
      if (!response.ok) {
        throw new Error(`HTTP error ${response.status}`)
      }
      
      const data = await response.json()
      setResult(JSON.stringify(data, null, 2))
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
        </div>
      </div>
      
      <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
        <h2 className="text-2xl font-bold mb-4">Manual Database Seeding</h2>
        
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
      </div>
      
      <PlayerDebug />
    </div>
  )
} 