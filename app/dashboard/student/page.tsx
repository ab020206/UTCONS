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
import confetti from 'canvas-confetti'

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
  if (xp >= 1000) return { name: '🏆 Legend', color: 'text-purple-600' }
  if (xp >= 500) return { name: '🥇 Champion', color: 'text-yellow-600' }
  if (xp >= 250) return { name: '🥈 Explorer', color: 'text-gray-600' }
  if (xp >= 100) return { name: '🥉 Learner', color: 'text-orange-600' }
  return { name: '🎯 Newbie', color: 'text-green-600' }
}

export default function StudentDashboard() {
  const [message, setMessage] = useState('')
  const [user, setUser] = useState<UserData | null>(null)
  const [weeklyProgress, setWeeklyProgress] = useState<ProgressData[]>([])
  const [animateMetrics, setAnimateMetrics] = useState(false)
  const [isEarningXP, setIsEarningXP] = useState(false)
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
        
        // Trigger animations after data loads
        setTimeout(() => setAnimateMetrics(true), 500);
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

    setIsEarningXP(true)
    
    try {
      const xpEarned = Math.floor(Math.random() * 20) + 10 // Random XP between 10-30
      
      const response = await fetch('/api/student/progress', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          xpEarned,
          moduleId: 'test-module-' + Date.now()
        })
      })

      if (response.ok) {
        // Celebrate XP earning
        confetti({
          particleCount: 30,
          spread: 70,
          origin: { y: 0.6 }
        })
        
        // Refresh the dashboard data
        const dashboardResponse = await fetch('/api/student/dashboard', {
          headers: { Authorization: `Bearer ${token}` },
        })
        if (dashboardResponse.ok) {
          const dashboardData = await dashboardResponse.json()
          setUser(dashboardData.user)
          setWeeklyProgress(dashboardData.weeklyProgress || [])
          
          // Check for milestone achievements
          const newXP = dashboardData.user.xp || 0
          if (newXP >= 100 && newXP < 200) {
            confetti({
              particleCount: 50,
              spread: 80,
              origin: { y: 0.6 }
            })
          } else if (newXP >= 500) {
            confetti({
              particleCount: 80,
              spread: 100,
              origin: { y: 0.6 }
            })
          }
        }
      }
    } catch (error) {
      console.error('Error earning XP:', error)
    } finally {
      setIsEarningXP(false)
    }
  }

  const badge = user ? getBadge(user.xp || 0) : { name: '🎯 Newbie', color: 'text-green-600' }

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
            className="bg-red-500 hover:bg-red-600 text-white px-5 py-2 rounded-lg font-medium transition transform hover:scale-105"
          >
            Logout
          </button>
        </div>

        {/* User Info */}
        {user ? (
          <>
            {/* Navigation to new features */}
            <div className="flex flex-wrap gap-4 mb-6">
              {user.preferences && user.preferences.interests && user.preferences.interests.length > 0 ? (
                <button
                  onClick={() => router.push('/preferences')}
                  className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg font-medium transition transform hover:scale-105 shadow-md"
                >
                  ✏️ Edit Preferences
                </button>
              ) : (
                <button
                  onClick={() => router.push('/preferences')}
                  className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg font-medium transition transform hover:scale-105 shadow-md"
                >
                  🎯 Set Preferences
                </button>
              )}
              <button
                onClick={() => router.push('/dashboard/student/analysis')}
                className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg font-medium transition transform hover:scale-105 shadow-md"
              >
                🔍 Personalized Analysis
              </button>
              <button
                onClick={() => router.push('/dashboard/student/progress')}
                className="bg-yellow-500 hover:bg-yellow-600 text-white px-4 py-2 rounded-lg font-medium transition transform hover:scale-105 shadow-md"
              >
                📊 Progress Tracking
              </button>
            </div>

            <div className="bg-gradient-to-r from-purple-50 to-pink-50 border border-purple-300 rounded-xl p-6 text-center transform hover:scale-105 transition-transform duration-300">
              <h3 className="text-xl font-bold text-purple-700 mb-2">Explore & Learn</h3>
              <p className="text-gray-600 mb-4">Dive into our curated learning paths to gain new skills.</p>
              <button
                  onClick={() => router.push('/dashboard/student/learning-paths')}
                  className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-2 rounded-lg font-semibold transition transform hover:scale-105 shadow-md"
              >
                  🗺️ Browse Learning Paths
              </button>
            </div>

            {/* Current Badge */}
            <div className="bg-gradient-to-r from-purple-50 to-pink-50 border border-purple-300 rounded-xl p-6 text-center transform hover:scale-105 transition-transform duration-300">
              <div className="text-4xl mb-2">{badge.name.split(' ')[0]}</div>
              <h3 className={`text-xl font-bold ${badge.color}`}>{badge.name}</h3>
              <p className="text-gray-600 mt-1">Your current achievement level</p>
            </div>

            <div className={`grid grid-cols-1 sm:grid-cols-2 gap-4 bg-gray-50 p-5 rounded-xl shadow-inner transform transition-all duration-1000 ${
              animateMetrics ? 'scale-105' : 'scale-100'
            }`}>
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
                <span className="text-xl">⭐</span>
                <p className="text-lg font-medium text-gray-700">
                  XP: <span className="font-semibold text-yellow-600 animate-pulse">{user.xp || 0}</span>
                </p>
              </div>
              <div className="flex items-center space-x-3">
                <span className="text-xl">🔥</span>
                <p className="text-lg font-medium text-gray-700">
                  Streak: <span className="font-semibold text-orange-600">{user.streak || 0} days</span>
                </p>
              </div>
            </div>

            {/* Preferences */}
            {user.preferences && (
              <div className="bg-blue-50 border border-blue-300 rounded-xl p-6 mt-6 transform hover:scale-105 transition-transform duration-300">
                <h3 className="text-xl font-semibold text-blue-800 mb-3 flex items-center">
                  🎯 Your Preferences
                  <span className="ml-2 text-sm bg-blue-100 text-blue-700 px-2 py-1 rounded-full">
                    {(user.preferences.interests?.length > 0 ? 1 : 0) + (user.preferences.style ? 1 : 0)}/2 Complete
                  </span>
                </h3>
                <p className="text-lg font-medium text-gray-700">
                  <strong>Interests:</strong>{' '}
                  {user.preferences.interests.length > 0
                    ? user.preferences.interests.join(', ')
                    : 'No interests set'}
                </p>
                <p className="mt-2 text-lg font-medium text-gray-700">
                  <strong>Learning Style:</strong>{' '}
                  {user.preferences.style || 'Not specified'}
                </p>
              </div>
            )}
          </>
        ) : (
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-700 mx-auto mb-4"></div>
            <p className="text-gray-500 italic">Fetching your details...</p>
          </div>
        )}

        {/* Dashboard message */}
        <div className="bg-purple-50 border-l-4 border-purple-400 p-4 rounded-lg shadow-sm transform hover:scale-105 transition-transform duration-300">
          <p className="text-purple-800 font-medium text-base">
            {message || 'Loading dashboard...'}
          </p>
        </div>

        {/* XP Chart */}
        <div className="bg-white p-4 rounded-xl shadow-md transform hover:scale-105 transition-transform duration-300">
          <div className="flex justify-between items-center mb-3">
            <h4 className="text-lg font-bold text-blue-800">📈 XP Progress This Week</h4>
            <button
              onClick={handleEarnXP}
              disabled={isEarningXP}
              className={`bg-green-500 hover:bg-green-600 disabled:bg-gray-400 text-white px-4 py-2 rounded-lg font-medium transition text-sm transform hover:scale-105 ${
                isEarningXP ? 'animate-pulse' : ''
              }`}
            >
              {isEarningXP ? '🎯 Earning XP...' : '🎯 Earn XP (Test)'}
            </button>
          </div>
          {weeklyProgress.length > 0 ? (
            <ResponsiveContainer width="100%" height={200}>
              <LineChart data={weeklyProgress}>
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#f8fafc', 
                    border: '1px solid #e2e8f0',
                    borderRadius: '8px'
                  }}
                />
                <Line 
                  type="monotone" 
                  dataKey="xp" 
                  stroke="#6366f1" 
                  strokeWidth={3}
                  dot={{ fill: '#6366f1', strokeWidth: 2, r: 4 }}
                />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-[200px] flex items-center justify-center text-gray-500">
              <div className="text-center">
                <div className="text-4xl mb-2">🎯</div>
                <p>No progress data available yet. Start learning to see your progress!</p>
              </div>
            </div>
          )}
        </div>

        {/* Motivation Card */}
        <div className="bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-300 rounded-xl p-6 text-center">
          <h3 className="text-lg font-semibold text-blue-800 mb-2">💪 Keep Learning!</h3>
          <p className="text-gray-700">
            {user?.streak && user.streak > 5 
              ? `Amazing! You've maintained a ${user.streak}-day streak! 🔥` 
              : user?.streak && user.streak > 0 
                ? `Great start! You're on a ${user.streak}-day streak. Keep it up! 💪`
                : "Start your learning journey today to build your streak! 🚀"
            }
          </p>
        </div>
      </div>
    </div>
  )
}
