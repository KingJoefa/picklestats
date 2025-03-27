import { useGameStore } from '@/store/gameStore'

interface ScoreInputProps {
  team: 1 | 2
  label: string
}

export default function ScoreInput({ team, label }: ScoreInputProps) {
  const score = useGameStore((state) => state.score)
  const setScore = useGameStore((state) => state.setScore)

  const handleScoreChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    const numValue = value === '' ? 0 : parseInt(value, 10)

    if (isNaN(numValue)) return
    if (numValue < 0) return
    if (numValue > 99) return

    setScore(team, numValue)
  }

  return (
    <div className="flex flex-col items-center gap-2">
      <label className="text-sm font-medium text-white drop-shadow-lg">{label}</label>
      <input
        type="number"
        min="0"
        max="99"
        className="w-20 h-12 bg-pink-600 border-2 border-white text-white text-2xl text-center rounded-lg focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-teal-500 font-bold"
        value={score[`team${team}`] || ''}
        onChange={handleScoreChange}
      />
    </div>
  )
} 