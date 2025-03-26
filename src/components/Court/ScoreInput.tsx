import { useGameStore } from '@/store/gameStore'

interface ScoreInputProps {
  team: 1 | 2
}

const ScoreInput = ({ team }: ScoreInputProps) => {
  const { score, setScore } = useGameStore()

  return (
    <div className="flex items-center gap-4">
      <label className="text-white font-bold text-lg drop-shadow-lg">Score:</label>
      <div className="flex gap-2">
        <input
          type="number"
          min="0"
          max="11"
          value={score[`team${team}`]}
          onChange={(e) => setScore(team, parseInt(e.target.value) || 0)}
          className="w-20 h-12 bg-pink-600 border-2 border-white text-white text-2xl text-center rounded-lg focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-teal-500 font-bold"
        />
      </div>
    </div>
  )
}

export default ScoreInput 