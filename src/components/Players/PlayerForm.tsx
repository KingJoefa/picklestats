'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

interface PlayerFormProps {
  onClose: () => void
}

export default function PlayerForm({ onClose }: PlayerFormProps) {
  const router = useRouter()
  const [formData, setFormData] = useState({
    name: '',
    profilePicture: '',
  })
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      const response = await fetch('/api/players', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      })

      if (!response.ok) {
        throw new Error('Failed to create player')
      }

      router.refresh()
      onClose()
    } catch (error) {
      console.error('Error creating player:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md">
        <h2 className="text-2xl font-bold mb-4">Add New Player</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700">
              Name
            </label>
            <input
              type="text"
              id="name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:ring-blue-500"
              required
            />
          </div>
          <div>
            <label htmlFor="profilePicture" className="block text-sm font-medium text-gray-700">
              Profile Picture URL
            </label>
            <input
              type="url"
              id="profilePicture"
              value={formData.profilePicture}
              onChange={(e) => setFormData({ ...formData, profilePicture: e.target.value })}
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:ring-blue-500"
              placeholder="https://example.com/image.jpg"
              required
            />
            <p className="mt-1 text-sm text-gray-500">
              For testing, you can use: https://picsum.photos/400/300
            </p>
          </div>
          <div className="flex justify-end space-x-3 mt-6">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 disabled:opacity-50"
            >
              {isSubmitting ? 'Creating...' : 'Create Player'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
} 