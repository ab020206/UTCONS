'use client'

import { useEffect, useState } from 'react'
import { getToken, logout, parseToken } from '@/lib/auth'
import { useRouter } from 'next/navigation'
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from 'recharts'

interface Preferences {
  interests: string[]
  style: string
}

interface UserData {
  email: string
  fullName: string
  role: 'student' | 'parent' | 'admin'
  xp?: number
  streak?: number
  preferences?: Preferences
}

interface ProgressData {
  date: string
  xp: number
}

const getBadge = (xp: number) => {
  if (xp >= 1000) return '🏆 Legend'
  if (xp >= 500) return '🥇 Champion'
  if (xp >= 250) return '🥈 Explorer'
  if (xp >= 100) return '🥉 Learner'
  return '🎯 Newbie'
}

export default function StudentDashboard() {
  const [message, setMessage] = useState('')
  const [user, setUser] = useState<UserData | null>(null)
  const [weeklyProgress, setWeeklyProgress] = useState<ProgressData[]>([])
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

    fetch('/api/student/dashboard', {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(async (res) => {
        if (!res.ok) throw new Error()
        const data = await res.json()
        setUser(data.user)
        setMessage(data.message)
        setWeeklyProgress(data.weeklyProgress || [])
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

  const handleEarnXP = async () => {
    const token = getToken()
    if (!token) return

    try {
      const response = await fetch('/api/student/progress', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          xpEarned: Math.floor(Math.random() * 20) + 10, // Random XP between 10-30
          moduleId: 'test-module-' + Date.now()
        })
      })

      if (response.ok) {
        const data = await response.json()
        // Refresh the dashboard data
        const dashboardResponse = await fetch('/api/student/dashboard', {
          headers: { Authorization: `Bearer ${token}` },
        })
        if (dashboardResponse.ok) {
          const dashboardData = await dashboardResponse.json()
          setUser(dashboardData.user)
          setWeeklyProgress(dashboardData.weeklyProgress || [])
        }
      }
    } catch (error) {
      console.error('Error earning XP:', error)
    }
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
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-gray-50 p-5 rounded-xl shadow-inner">
              <div className="flex items-center space-x-3">
                <span className="text-xl">👤</span>
                <p className="text-lg font-medium text-gray-700">
                  Name: <span className="font-semibold text-purple-700">{user.fullName}</span>
                </p>
              </div>
              <div className="flex items-center space-x-3">
                <span className="text-xl">📧</span>
                <p className="text-lg font-medium text-gray-700">
                  Email: <span className="font-semibold">{user.email}</span>
                </p>
              </div>
              <div className="flex items-center space-x-3">
                <span className="text-xl">🛡️</span>
                <p className="text-lg font-medium text-gray-700">
                  Role: <span className="font-semibold capitalize">{user.role}</span>
                </p>
              </div>
              <div className="flex items-center space-x-3">
                <span className="text-xl">🎖️</span>
                <p className="text-lg font-medium text-gray-700">
                  Badge: <span className="font-semibold text-green-700">{getBadge(user.xp || 0)}</span>
                </p>
              </div>
              <div className="flex items-center space-x-3">
                <span className="text-xl">🔥</span>
                <p className="text-lg font-medium text-gray-700">
                  Streak: <span className="font-semibold">{user.streak || 0} days</span>
                </p>
              </div>
            </div>

            {/* Preferences */}
            {user.preferences && (
              <div className="bg-blue-50 border border-blue-300 rounded-xl p-6 mt-6">
                <h3 className="text-xl font-semibold text-blue-800 mb-3">🎯 Your Preferences</h3>
                <p>
                  <strong>Interests:</strong>{' '}
                  {user.preferences.interests.length > 0
                    ? user.preferences.interests.join(', ')
                    : 'No interests set'}
                </p>
                <p className="mt-2">
                  <strong>Learning Style:</strong>{' '}
                  {user.preferences.style || 'Not specified'}
                </p>
              </div>
            )}
          </>
        ) : (
          <p className="text-gray-500 italic">Fetching your details...</p>
        )}

        {/* Dashboard message */}
        <div className="bg-purple-50 border-l-4 border-purple-400 p-4 rounded-lg shadow-sm">
          <p className="text-purple-800 font-medium text-base">
            {message || 'Loading dashboard...'}
          </p>
        </div>

        {/* XP Chart */}
        <div className="bg-white p-4 rounded-xl shadow-md">
          <div className="flex justify-between items-center mb-3">
            <h4 className="text-lg font-bold text-blue-800">📈 XP Progress This Week</h4>
            <button
              onClick={handleEarnXP}
              className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg font-medium transition text-sm"
            >
              🎯 Earn XP (Test)
            </button>
          </div>
          {weeklyProgress.length > 0 ? (
            <ResponsiveContainer width="100%" height={200}>
              <LineChart data={weeklyProgress}>
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Line type="monotone" dataKey="xp" stroke="#6366f1" strokeWidth={3} />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-[200px] flex items-center justify-center text-gray-500">
              <p>No progress data available yet. Start learning to see your progress!</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
