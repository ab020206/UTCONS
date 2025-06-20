'use client'

import { useEffect, useState } from 'react'
import { getToken, logout, parseToken } from '@/lib/auth'
import { useRouter } from 'next/navigation'

interface UserData {
  email: string
  fullName: string
  role: 'student' | 'parent' | 'admin'
}

export default function StudentDashboard() {
  const [message, setMessage] = useState('')
  const [user, setUser] = useState<UserData | null>(null)
  const router = useRouter()

  useEffect(() => {
    const token = getToken()
    if (!token) return router.push('/login')

    const parsed = parseToken(token)
    if (!parsed) {
      logout()
      return router.push('/login')
    }

    if (parsed.firstTimeLogin) {
      return router.push('/setup-name')
    }

    // Fetch full user info from backend
    fetch('/api/student/dashboard', {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(async (res) => {
        if (!res.ok) throw new Error()
        const data = await res.json()
        setUser(data.user)
        setMessage(data.message)
      })
      .catch(() => {
        logout()
        router.push('/login')
      })
  }, [router])

  const handleLogout = () => {
    logout()
    router.push('/')
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-100 via-purple-100 to-pink-100 py-12 px-6 flex flex-col items-center">
      <div className="w-full max-w-3xl bg-white rounded-3xl shadow-2xl p-8 space-y-8">
  
        {/* Header */}
        <div className="flex justify-between items-center border-b pb-5">
          <div>
            <h2 className="text-3xl font-extrabold text-purple-700">🎓 Student Dashboard</h2>
            <p className="text-gray-500 text-sm mt-1">Welcome to your learning hub!</p>
          </div>
          <button
            onClick={handleLogout}
            className="bg-red-500 hover:bg-red-600 text-white px-5 py-2 rounded-lg font-medium transition"
          >
            Logout
          </button>
        </div>
  
        {/* User Info */}
        {user ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-gray-50 p-5 rounded-xl shadow-inner">
            <div className="flex items-center space-x-3">
              <span className="text-xl">👤</span>
              <p className="text-lg font-medium text-gray-700">Name: <span className="font-semibold text-purple-700">{user.fullName}</span></p>
            </div>
            <div className="flex items-center space-x-3">
              <span className="text-xl">📧</span>
              <p className="text-lg font-medium text-gray-700">Email: <span className="font-semibold">{user.email}</span></p>
            </div>
            <div className="flex items-center space-x-3">
              <span className="text-xl">🛡️</span>
              <p className="text-lg font-medium text-gray-700">Role: <span className="font-semibold capitalize">{user.role}</span></p>
            </div>
          </div>
        ) : (
          <p className="text-gray-500 italic">Fetching your details...</p>
        )}
  
        {/* Dashboard message */}
        <div className="bg-purple-50 border-l-4 border-purple-400 p-4 rounded-lg shadow-sm">
          <p className="text-purple-800 font-medium text-base">
            {message || 'Loading dashboard...'}
          </p>
        </div>
      </div>
    </div>
  )
  
}
