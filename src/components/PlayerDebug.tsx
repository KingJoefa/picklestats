import { useState, useEffect } from 'react'
import { API_PATHS } from '@/lib/api-paths'

export default function PlayerDebug() {
  const [pagesData, setPagesData] = useState<any>(null)
  const [appData, setAppData] = useState<any>(null)
  const [testData, setTestData] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true)
      setError(null)
      
      try {
        // Test basic API functionality
        const testResponse = await fetch(API_PATHS.TEST)
        const testResult = await testResponse.json()
        setTestData(testResult)
        
        // Try Pages Router API (v1 path)
        const pagesResponse = await fetch(API_PATHS.PLAYERS_V1)
        const pagesResult = await pagesResponse.json()
        setPagesData(pagesResult)
        
        // Try App Router API
        const appResponse = await fetch(API_PATHS.PLAYERS)
        const appResult = await appResponse.json()
        setAppData(appResult)
      } catch (err) {
        console.error('Error fetching data:', err)
        setError('Failed to fetch data: ' + (err instanceof Error ? err.message : String(err)))
      } finally {
        setLoading(false)
      }
    }
    
    fetchData()
  }, [])
  
  return (
    <div className="bg-white rounded-xl shadow-lg p-6 mt-4">
      <h2 className="text-2xl font-bold mb-4">API Debug Information</h2>
      
      {loading && <p className="text-gray-500">Loading API data...</p>}
      
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          <p><strong>Error:</strong> {error}</p>
        </div>
      )}
      
      <div className="space-y-6">
        <div>
          <h3 className="text-lg font-semibold mb-2">Test API Response:</h3>
          <pre className="bg-gray-100 p-4 rounded overflow-auto max-h-40">
            {testData ? JSON.stringify(testData, null, 2) : 'No data'}
          </pre>
        </div>
        
        <div>
          <h3 className="text-lg font-semibold mb-2">Pages Router API Response ({API_PATHS.PLAYERS_V1}):</h3>
          <pre className="bg-gray-100 p-4 rounded overflow-auto max-h-40">
            {pagesData ? JSON.stringify(pagesData, null, 2) : 'No data'}
          </pre>
          <p className="mt-2 text-sm text-gray-600">
            {pagesData?.data?.length 
              ? `Found ${pagesData.data.length} players in Pages Router API (v1)`
              : 'No players found in Pages Router API (v1)'
            }
          </p>
        </div>
        
        <div>
          <h3 className="text-lg font-semibold mb-2">App Router API Response ({API_PATHS.PLAYERS}):</h3>
          <pre className="bg-gray-100 p-4 rounded overflow-auto max-h-40">
            {appData ? JSON.stringify(appData, null, 2) : 'No data'}
          </pre>
          <p className="mt-2 text-sm text-gray-600">
            {appData?.data?.length 
              ? `Found ${appData.data.length} players in App Router API`
              : 'No players found in App Router API'
            }
          </p>
        </div>
      </div>
      
      <div className="mt-6">
        <h3 className="text-lg font-semibold mb-2">Manual Seeding Instructions:</h3>
        <p className="text-gray-700 mb-2">
          If no players are found, try running the manual seeding script locally:
        </p>
        <pre className="bg-gray-800 text-white p-4 rounded">
          npx ts-node prisma/seed-production.ts
        </pre>
      </div>
    </div>
  )
} 