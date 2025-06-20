'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { getToken, parseToken, logout } from '@/lib/auth'

interface ContentItem {
  id: string
  title: string
  description: string
  rating: number
  feedbacks: string[]
}

export default function TeacherDashboard() {
  const [teacherName, setTeacherName] = useState('')
  const [content, setContent] = useState<ContentItem[]>([])
  const [newTitle, setNewTitle] = useState('')
  const [newDesc, setNewDesc] = useState('')
  const [error, setError] = useState('')
  const router = useRouter()

  useEffect(() => {
    const token = getToken()
    if (!token) {
      router.push('/login')
      return
    }

    const user = parseToken(token)
    if (!user || user.role !== 'teacher') {
      logout()
      router.push('/login')
      return
    }

    setTeacherName(user.name || 'Teacher')

    // dummy uploaded content
    setContent([
      {
        id: '1',
        title: 'Introduction to Algebra',
        description: 'A basic video lesson with exercises.',
        rating: 4.5,
        feedbacks: ['Great explanation!', 'Needs more examples.'],
      },
      {
        id: '2',
        title: 'Science Chapter 3 Notes',
        description: 'Downloadable PDF with key concepts.',
        rating: 4.2,
        feedbacks: ['Very useful notes!', 'Add diagrams next time.'],
      },
    ])
  }, [router])

  const handleUpload = (e: React.FormEvent) => {
    e.preventDefault()
    if (!newTitle || !newDesc) {
      setError('Please provide both title and description.')
      return
    }
    const newItem: ContentItem = {
      id: String(Date.now()),
      title: newTitle,
      description: newDesc,
      rating: 0,
      feedbacks: [],
    }
    setContent([newItem, ...content])
    setNewTitle('')
    setNewDesc('')
    setError('')
  }

  return (
    <main className="min-h-screen bg-gray-50 px-4 py-8 sm:px-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="bg-white shadow-md rounded-2xl px-6 py-6 mb-8 border-l-8 border-[#6a0dad]">
          <h1 className="text-3xl sm:text-4xl font-bold text-[#6a0dad] mb-1">
            Welcome, {teacherName} 👩‍🏫
          </h1>
          <p className="text-gray-600 text-sm sm:text-base">
            Upload your content and track student ratings & reviews.
          </p>
        </div>

        {/* Upload Form */}
        <div className="bg-white rounded-xl shadow p-6 border border-gray-100 mb-10">
          <h2 className="text-2xl font-semibold text-[#6a0dad] mb-4">📤 Upload New Content</h2>
          <form onSubmit={handleUpload} className="space-y-4">
            <input
              type="text"
              placeholder="Title"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-300"
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
            />
            <textarea
              placeholder="Short description"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-300"
              rows={3}
              value={newDesc}
              onChange={(e) => setNewDesc(e.target.value)}
            />
            {error && <p className="text-red-500 text-sm">{error}</p>}
            <button
              type="submit"
              className="bg-[#6a0dad] text-white font-semibold px-6 py-2 rounded-full hover:bg-[#5809b1] transition"
            >
              Upload Content
            </button>
          </form>
        </div>

        {/* Uploaded Content */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {content.map((item) => (
            <div key={item.id} className="bg-white rounded-xl shadow-md p-4 border border-gray-100">
              <h3 className="text-xl font-bold text-[#6a0dad]">{item.title}</h3>
              <p className="text-gray-700 mt-1 mb-3 text-sm">{item.description}</p>
              <div className="text-sm text-yellow-600 font-medium mb-2">
                ⭐ Rating: {item.rating > 0 ? item.rating.toFixed(1) : 'Not rated yet'}
              </div>
              <div className="text-sm text-gray-600">
                <strong className="text-gray-800">Feedback:</strong>
                <ul className="list-disc list-inside mt-1 space-y-1">
                  {item.feedbacks.length > 0 ? (
                    item.feedbacks.map((f, i) => <li key={i}>{f}</li>)
                  ) : (
                    <li>No feedback yet</li>
                  )}
                </ul>
              </div>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="text-center text-sm text-gray-600 mt-12">
          Want to go back to landing?{' '}
          <span
            onClick={() => router.push('/')}
            className="text-[#6a0dad] font-semibold hover:underline cursor-pointer"
          >
            Go to Home
          </span>
        </div>
      </div>
    </main>
  )
}
