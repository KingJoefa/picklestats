import './globals.css'
import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import Navbar from '@/components/Navigation/Navbar'
import { Toaster } from 'sonner'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'PickleStats - Pickleball Score Tracker',
  description: 'Track your pickleball matches and stats in real-time',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={`${inter.className} min-h-screen bg-gray-100`}>
        <Navbar />
        <main className="container mx-auto px-4 py-8">
          {children}
        </main>
        <Toaster position="top-center" richColors offset={80} />
      </body>
    </html>
  )
} 