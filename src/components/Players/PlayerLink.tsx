import Link from 'next/link'
import Image from 'next/image'

const DEFAULT_AVATAR = '/players/default-avatar.svg'

export interface PlayerLinkProps {
  player: {
    id: string
    name: string
    profilePicture: string
  } | null
}

const PlayerLink = ({ player }: PlayerLinkProps) => {
  if (!player) return (
    <div className="flex items-center gap-2 text-gray-400 italic">
      <div className="relative w-8 h-8 rounded-full overflow-hidden bg-gray-200">
        <Image
          src={DEFAULT_AVATAR}
          alt="Player not found"
          fill
          className="object-cover opacity-50"
        />
      </div>
      <span>Player not found</span>
    </div>
  )
  
  return (
    <Link href={`/players/${player.id}`} className="flex items-center gap-2 hover:text-blue-600">
      <div className="relative w-8 h-8 rounded-full overflow-hidden">
        <Image
          src={player.profilePicture || DEFAULT_AVATAR}
          alt={player.name}
          fill
          className="object-cover"
          onError={(e) => {
            const target = e.target as HTMLImageElement;
            target.src = DEFAULT_AVATAR;
          }}
        />
      </div>
      <span>{player.name}</span>
    </Link>
  )
}

export default PlayerLink; 