'use client'

import CourtView from '@/components/Court/CourtView'
import StatsSummary from '@/components/Stats/StatsSummary'
import PlayerDebug from '@/components/PlayerDebug'
import Logo from '@/components/Logo/Logo'

export default function Home() {
  return (
    <div className="space-y-8 max-w-6xl mx-auto">
      <div className="flex justify-center mb-8">
        <Logo className="scale-150" variant="header" />
      </div>
      <div className="space-y-8">
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h2 className="text-2xl font-bold mb-6">Score Entry</h2>
          <CourtView />
        </div>

        <div className="bg-white rounded-xl shadow-lg p-6">
          <h2 className="text-2xl font-bold mb-6">Session Stats</h2>
          <StatsSummary />
        </div>
        
        <PlayerDebug />
      </div>
    </div>
  )
} 