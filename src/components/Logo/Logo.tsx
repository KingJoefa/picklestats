import React from 'react'

interface LogoProps {
  className?: string
  variant?: 'nav' | 'header'
}

const Logo: React.FC<LogoProps> = ({ className = '', variant = 'nav' }) => {
  const textColors = {
    nav: {
      pickle: 'text-white',
      stats: 'text-white drop-shadow-[0_2px_2px_rgba(0,0,0,0.3)]',
      tagline: 'text-blue-100'
    },
    header: {
      pickle: 'text-gray-800',
      stats: 'text-blue-500',
      tagline: 'text-gray-500'
    }
  }

  const colors = textColors[variant]

  return (
    <div className={`flex items-center ${className}`}>
      <svg
        width="40"
        height="40"
        viewBox="0 0 40 40"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="mr-2"
      >
        {/* Paddle handle */}
        <rect
          x="16"
          y="24"
          width="8"
          height="14"
          rx="2"
          fill="#FBB03B"
          className="drop-shadow-md"
        />
        
        {/* Paddle head */}
        <rect
          x="8"
          y="4"
          width="24"
          height="22"
          rx="4"
          fill="#FF9900"
          className="drop-shadow-lg"
        />
        
        {/* Ball */}
        <circle
          cx="30"
          cy="10"
          r="4"
          fill="#FFFFFF"
          className="animate-bounce"
          style={{ animationDuration: '2s' }}
        />
        
        {/* Holes pattern */}
        <circle cx="14" cy="10" r="1.5" fill="#FFE5B8" />
        <circle cx="20" cy="10" r="1.5" fill="#FFE5B8" />
        <circle cx="26" cy="10" r="1.5" fill="#FFE5B8" />
        <circle cx="14" cy="16" r="1.5" fill="#FFE5B8" />
        <circle cx="20" cy="16" r="1.5" fill="#FFE5B8" />
        <circle cx="26" cy="16" r="1.5" fill="#FFE5B8" />
      </svg>
      <div className="flex flex-col">
        <span className="text-2xl font-bold tracking-tight">
          <span className={colors.pickle}>Pickle</span>
          <span className={colors.stats}>Stats</span>
        </span>
        <span className={`text-xs -mt-1 ${colors.tagline}`}>Track your game</span>
      </div>
    </div>
  )
}

export default Logo 