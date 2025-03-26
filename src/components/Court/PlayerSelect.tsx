import { useGameStore, type Player } from '@/store/gameStore'
import * as Select from '@radix-ui/react-select'

interface PlayerSelectProps {
  team: 1 | 2
  position: 0 | 1
}

const PlayerSelect = ({ team, position }: PlayerSelectProps) => {
  const { availablePlayers, players, setPlayer } = useGameStore()
  const currentPlayer = players[`team${team}`][position]

  // Get all currently selected players except for the current position
  const selectedPlayers = [
    ...players.team1,
    ...players.team2
  ].filter((p): p is Player => p !== null && p !== currentPlayer)

  // Check if a player is already selected in another position
  const isPlayerSelected = (playerId: string) => {
    return selectedPlayers.some(p => p.id === playerId)
  }

  return (
    <Select.Root
      value={currentPlayer?.id || ''}
      onValueChange={(playerId) => {
        const selectedPlayer = availablePlayers.find(p => p.id === playerId)
        if (selectedPlayer) {
          setPlayer(team, position, selectedPlayer.id)
        }
      }}
    >
      <Select.Trigger className="w-full bg-pink-600 border-2 border-white text-white px-4 py-2 rounded flex items-center justify-between hover:bg-pink-700">
        <Select.Value>
          {currentPlayer?.name || `Select Player ${position + 1}`}
        </Select.Value>
        <Select.Icon>
          <ChevronDownIcon />
        </Select.Icon>
      </Select.Trigger>

      <Select.Portal>
        <Select.Content className="bg-pink-600 border-2 border-white rounded-lg shadow-xl overflow-hidden min-w-[200px] z-50">
          <Select.ScrollUpButton className="flex items-center justify-center h-6 bg-pink-700 text-white cursor-default">
            <ChevronUpIcon />
          </Select.ScrollUpButton>
          
          <Select.Viewport>
            <Select.Group>
              {availablePlayers.map((player) => {
                const isDisabled = isPlayerSelected(player.id)
                return (
                  <Select.Item
                    key={player.id}
                    value={player.id}
                    disabled={isDisabled}
                    className={`text-white px-4 py-2 hover:bg-pink-700 focus:bg-pink-700 focus:outline-none cursor-pointer data-[highlighted]:bg-pink-700 ${
                      isDisabled ? 'opacity-50 cursor-not-allowed' : ''
                    }`}
                  >
                    <Select.ItemText>{player.name}</Select.ItemText>
                  </Select.Item>
                )
              })}
            </Select.Group>
          </Select.Viewport>

          <Select.ScrollDownButton className="flex items-center justify-center h-6 bg-pink-700 text-white cursor-default">
            <ChevronDownIcon />
          </Select.ScrollDownButton>
        </Select.Content>
      </Select.Portal>
    </Select.Root>
  )
}

const ChevronDownIcon = () => (
  <svg width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M2 4L6 8L10 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
)

const ChevronUpIcon = () => (
  <svg width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M2 8L6 4L10 8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
)

export default PlayerSelect 