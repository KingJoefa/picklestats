'use client'

import { useGameStore } from '@/store/gameStore'

const StatsSummary = () => {
  const { matchHistory } = useGameStore()

  return (
    <div className="bg-white rounded-xl shadow-lg p-6">
      <h2 className="text-2xl font-bold mb-6">Session Stats</h2>
      
      <div className="grid md:grid-cols-3 gap-6">
        <div className="bg-gray-50 rounded-lg p-4">
          <h3 className="text-lg font-semibold mb-2">Current Session</h3>
          <div>
            <p className="text-gray-600">Matches Played</p>
            <p className="text-2xl font-bold">{matchHistory.length}</p>
          </div>
        </div>

        <div className="bg-gray-50 rounded-lg p-4 md:col-span-2">
          <h3 className="text-lg font-semibold mb-2">Recent Matches</h3>
          <div className="space-y-2">
            {matchHistory.length === 0 ? (
              <p className="text-gray-500 text-center italic">
                No matches played yet
              </p>
            ) : (
              matchHistory.slice(-3).map((match) => (
                <div key={match.id} className="text-sm text-gray-600">
                  <p className="font-semibold">
                    {match.team1[0].name} & {match.team1[1].name} vs{' '}
                    {match.team2[0].name} & {match.team2[1].name}
                  </p>
                  <p>
                    Date: {new Date(match.date).toLocaleDateString()}<br />
                    Score: {match.score.team1}-{match.score.team2}
                  </p>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default StatsSummary 