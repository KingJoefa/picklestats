'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import Logo from '@/components/Logo/Logo'

const Navbar = () => {
  const pathname = usePathname()

  const isActive = (path: string) => {
    return pathname === path ? 'bg-blue-700' : 'hover:bg-blue-600'
  }

  return (
    <nav className="bg-blue-500 text-white mb-8">
      <div className="max-w-6xl mx-auto px-4">
        <div className="flex items-center h-16">
          <Link href="/" className="mr-8">
            <Logo variant="nav" />
          </Link>
          <div className="flex space-x-4 overflow-x-auto whitespace-nowrap">
            <Link
              href="/"
              className={`px-4 py-2 rounded-md ${isActive('/')}`}
            >
              Score Entry
            </Link>
            <Link
              href="/matches"
              className={`px-4 py-2 rounded-md ${isActive('/matches')}`}
            >
              Match History
            </Link>
            <Link
              href="/players"
              className={`px-4 py-2 rounded-md ${isActive('/players')}`}
            >
              Player Profiles
            </Link>
            <Link
              href="/players/manage"
              className={`px-4 py-2 rounded-md ${isActive('/players/manage')}`}
            >
              Manage Players
            </Link>
          </div>
        </div>
      </div>
    </nav>
  )
}

export default Navbar 