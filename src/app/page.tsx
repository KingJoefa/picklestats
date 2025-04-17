'use client'

import CourtView from '@/components/Court/CourtView'
import StatsSummary from '@/components/Stats/StatsSummary'
import PlayerDebug from '@/components/PlayerDebug'
import Logo from '@/components/Logo/Logo'
import TeamStreaks from '@/components/Stats/TeamStreaks'
import { useEffect } from 'react'
import { useGameStore } from '@/store/gameStore'

export default function Home() {
  const fetchMatches = useGameStore(state => state.fetchMatches)

  useEffect(() => {
    fetchMatches()
  }, [fetchMatches])

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

        <TeamStreaks />

        <div className="bg-white rounded-xl shadow-lg p-6">
          <h2 className="text-2xl font-bold mb-6">Session Stats</h2>
          <StatsSummary />
        </div>
      </div>
    </div>
  )
} 