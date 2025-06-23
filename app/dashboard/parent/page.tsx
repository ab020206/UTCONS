// Updated ParentDashboard.tsx with charts, Lottie mascot, responsive design, and AI-based feedback

'use client'

import { useEffect, useState } from 'react'
import { getToken, logout } from '@/lib/auth'
import { useRouter } from 'next/navigation'
import Lottie from 'lottie-react'
import confetti from 'canvas-confetti'

import { CircularProgressbar, buildStyles } from 'react-circular-progressbar'
import 'react-circular-progressbar/dist/styles.css'

interface StudentInfo {
  _id: string
  email: string
  fullName?: string
  role: string
  preferences?: {
    interests: string[]
    style: string
  }
  progress?: {
    xp: number
    streak: number
    completedModules: string[]
    totalModules: number
    history: any[]
  }
  parentAspiration?: string
}

interface Announcement {
  _id: string
  title: string
  message: string
  date: string
}

export default function ParentDashboard() {
  const [student, setStudent] = useState<StudentInfo | null>(null)
  const [availableStudents, setAvailableStudents] = useState<StudentInfo[]>([])
  const [relinking, setRelinking] = useState(false)
  const [newStudentId, setNewStudentId] = useState('')
  const [announcements, setAnnouncements] = useState<Announcement[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showUnlinkConfirm, setShowUnlinkConfirm] = useState(false)
  const [animateMetrics, setAnimateMetrics] = useState(false)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const router = useRouter()

  useEffect(() => {
    const token = getToken()
    if (!token) {
      router.push('/login')
      return
    }

    fetch('/api/student/report', {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(async (res) => {
        if (!res.ok) throw new Error('Unauthorized or API error')
        const data = await res.json()
        setStudent(data)
        
        // Trigger animations after data loads
        setTimeout(() => setAnimateMetrics(true), 500);
      })
      .catch((err) => {
        console.error('❌ Error fetching student:', err)
        setError('Session expired or invalid token. Please log in again.')
        logout()
        router.push('/login')
      })
      .finally(() => setLoading(false))
  }, [router])

  useEffect(() => {
    const token = getToken()
    if (!token) return

    fetch('/api/teacher/announcements', {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(res => res.json())
      .then(setAnnouncements)
      .catch(() => console.warn('📢 No announcements found'))

    fetch('/api/student/list', {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(res => res.json())
      .then(setAvailableStudents)
      .catch(() => console.warn('⚠️ Could not load student list'))
  }, [])

  const handleLogout = () => {
    logout()
    router.push('/')
  }

  const confirmUnlink = () => {
    setShowUnlinkConfirm(true)
  }

  const handleUnlinkConfirmed = async () => {
    setShowUnlinkConfirm(false)
    const token = getToken()
    if (!token || !student) return

    const res = await fetch('/api/parent/unlink-student', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({ studentId: student._id }),
    })

    if (res.ok) {
      setStudent(null)
      setRelinking(true)
    } else {
      alert('Unlink failed. Try again.')
    }
  }

  const handleRelink = async () => {
    const token = getToken()
    if (!token || !newStudentId) return

    const res = await fetch('/api/parent/relink-student', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({ newStudentId }),
    })

    if (res.ok) {
      const data = await res.json()
      setStudent(data.student)
      setRelinking(false)
      setNewStudentId('')
      
      // Celebrate successful relink
      confetti({
        particleCount: 40,
        spread: 70,
        origin: { y: 0.6 }
      })
    } else {
      alert('Relink failed')
    }
  }

  const handleRefreshProgress = async () => {
    setIsRefreshing(true)
    const token = getToken()
    if (!token) return

    try {
      const response = await fetch('/api/student/report', {
        headers: { Authorization: `Bearer ${token}` },
      })
      
      if (response.ok) {
        const data = await response.json()
        setStudent(data)
        
        // Celebrate if there's progress
        if (data.progress && data.progress.xp > 0) {
          confetti({
            particleCount: 30,
            spread: 60,
            origin: { y: 0.6 }
          })
        }
      }
    } catch (error) {
      console.error('Error refreshing progress:', error)
    } finally {
      setIsRefreshing(false)
    }
  }

  const getProgressMessage = (progress: any) => {
    if (!progress) return "No progress data available"
    
    const completionRate = (progress.completedModules.length / progress.totalModules) * 100
    const streak = progress.streak || 0
    
    if (completionRate >= 80 && streak >= 5) return "🌟 Outstanding progress! Your child is doing exceptionally well!"
    if (completionRate >= 60 && streak >= 3) return "🎉 Great work! Your child is making excellent progress!"
    if (completionRate >= 40 && streak >= 1) return "👍 Good progress! Keep encouraging daily learning!"
    if (completionRate > 0) return "🚀 Getting started! Every step counts towards success!"
    return "🎯 Ready to begin! Encourage your child to start their learning journey!"
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-[#f3f4ff] to-[#e6f7ff] py-12 px-4 text-[#1f1f1f]">
      <div className="max-w-6xl mx-auto bg-white rounded-3xl shadow-2xl p-6 md:p-10 space-y-10">
        <div className="flex flex-col md:flex-row justify-between items-center gap-6">
          <div>
            <h1 className="text-4xl font-extrabold text-[#6200ea]">👨‍👩‍👧 Parent Dashboard</h1>
            <p className="text-gray-600 text-sm mt-1">Monitor your child's progress and stay informed</p>
          </div>
          <button
            onClick={handleLogout}
            className="bg-gradient-to-r from-red-500 to-red-600 text-white px-5 py-2 rounded-xl text-sm font-semibold hover:brightness-110 transition transform hover:scale-105"
          >Logout</button>
        </div>
        
        {/* Navigation to aspiration form */}
        <div className="my-4 flex gap-4">
          <button
            onClick={() => router.push('/dashboard/parent/aspiration')}
            className="bg-pink-500 hover:bg-pink-600 text-white px-4 py-2 rounded-lg font-medium transition transform hover:scale-105 shadow-md"
          >
            🌟 Set Career Aspiration
          </button>
          <button
            onClick={handleRefreshProgress}
            disabled={isRefreshing}
            className={`bg-blue-500 hover:bg-blue-600 disabled:bg-gray-400 text-white px-4 py-2 rounded-lg font-medium transition transform hover:scale-105 shadow-md ${
              isRefreshing ? 'animate-pulse' : ''
            }`}
          >
            {isRefreshing ? '🔄 Refreshing...' : '🔄 Refresh Progress'}
          </button>
        </div>

        <div className="flex flex-col-reverse md:flex-row gap-6">
          <div className="flex-1 space-y-6">
            {/* Announcements */}
            <section className="bg-[#f5edff] border border-purple-200 rounded-2xl p-6 shadow-inner transform hover:scale-105 transition-transform duration-300">
              <h2 className="text-2xl font-bold text-purple-800 mb-4 flex items-center">
                📢 Announcements
                <span className="ml-2 text-sm bg-purple-100 text-purple-700 px-2 py-1 rounded-full">
                  {announcements.length}
                </span>
              </h2>
              {announcements.length === 0 ? (
                <p className="text-gray-600">No announcements available.</p>
              ) : (
                <ul className="space-y-4">
                  {announcements.map((a, idx) => (
                    <li key={a._id} className={`bg-white border-l-4 border-purple-400 rounded-xl px-6 py-4 shadow-sm transform transition-all duration-500 delay-${idx * 100} ${
                      animateMetrics ? 'scale-105' : 'scale-100'
                    }`}>
                      <h3 className="text-lg font-semibold text-purple-900">{a.title}</h3>
                      <p className="text-sm text-gray-700">{a.message}</p>
                      <p className="text-xs text-gray-500 mt-1">{new Date(a.date).toLocaleDateString()}</p>
                    </li>
                  ))}
                </ul>
              )}
            </section>

            {/* Student Info */}
            <section className="bg-[#eaf6ff] border border-blue-200 rounded-2xl p-6 transform hover:scale-105 transition-transform duration-300">
              <h2 className="text-2xl font-bold text-blue-800 mb-4 flex items-center">
                🎓 Linked Student
                {student && <span className="ml-2 text-sm bg-green-100 text-green-700 px-2 py-1 rounded-full">✓ Connected</span>}
              </h2>
              {loading ? (
                <div className="text-center">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-700 mx-auto mb-4"></div>
                  <p className="text-gray-500">⏳ Loading student data...</p>
                </div>
              ) : error ? (
                <p className="text-red-600">{error}</p>
              ) : student ? (
                <div className="space-y-2 text-[15px] text-gray-800">
                  <p><strong>ID:</strong> {student._id}</p>
                  <p><strong>Email:</strong> {student.email}</p>
                  {student.fullName && <p><strong>Name:</strong> {student.fullName}</p>}
                  <p><strong>Role:</strong> {student.role}</p>
                  {student.preferences && (
                    <div className="mt-3 bg-blue-50 p-3 rounded-lg">
                      <p><strong>Interests:</strong> {student.preferences.interests?.join(', ') || 'None set'}</p>
                      <p><strong>Learning Style:</strong> {student.preferences.style || 'Not set'}</p>
                    </div>
                  )}
                  {student.parentAspiration && (
                    <div className="mt-3 bg-pink-50 p-3 rounded-lg">
                      <p><strong>Your Aspiration:</strong> {student.parentAspiration}</p>
                    </div>
                  )}
                  <button
                    onClick={confirmUnlink}
                    className="mt-3 text-sm text-red-600 underline hover:text-red-800 transition"
                  >❌ Unlink this student</button>
                </div>
              ) : relinking ? (
                <div className="space-y-4">
                  <label className="block text-sm font-medium text-gray-700">🔗 Select a student to relink:</label>
                  <select
                    value={newStudentId}
                    onChange={(e) => setNewStudentId(e.target.value)}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-300 focus:border-transparent"
                  >
                    <option value="">-- Choose Student --</option>
                    {availableStudents.map((s) => (
                      <option key={s._id} value={s._id}>{s.fullName || s.email}</option>
                    ))}
                  </select>
                  <button
                    onClick={handleRelink}
                    disabled={!newStudentId}
                    className="bg-gradient-to-r from-green-500 to-green-600 text-white px-4 py-2 rounded-xl hover:brightness-110 disabled:opacity-50 transition transform hover:scale-105"
                  >🔄 Confirm Relink</button>
                </div>
              ) : <p className="text-gray-600">No student linked currently.</p>}
            </section>
          </div>

          
        </div>

        {/* Student Progress */}
        {student?.progress && (
          <section className="bg-[#e0ffe7] border border-green-300 rounded-2xl p-6 shadow-inner transform hover:scale-105 transition-transform duration-300">
            <h2 className="text-2xl font-bold text-green-800 mb-4 flex items-center">
              📊 Student Progress
              <span className="ml-2 text-sm bg-green-100 text-green-700 px-2 py-1 rounded-full">
                {Math.round((student.progress.completedModules.length / student.progress.totalModules) * 100)}% Complete
              </span>
            </h2>
            <div className="flex flex-col md:flex-row gap-6 items-center">
              <div className={`w-40 h-40 transform transition-all duration-1000 ${
                animateMetrics ? 'scale-110' : 'scale-100'
              }`}>
                <CircularProgressbar
                  value={(student.progress.completedModules.length / student.progress.totalModules) * 100}
                  text={`${Math.round((student.progress.completedModules.length / student.progress.totalModules) * 100)}%`}
                  styles={buildStyles({
                    textColor: '#256029',
                    pathColor: '#2ecc71',
                    trailColor: '#d4f4dc',
                  })}
                />
              </div>
              <div className="space-y-3">
                <div className="flex items-center space-x-3">
                  <span className="text-2xl">⭐</span>
                  <p className="text-lg font-semibold text-green-900">
                    <strong>XP:</strong> <span className="text-yellow-600 animate-pulse">{student.progress.xp}</span>
                  </p>
                </div>
                <div className="flex items-center space-x-3">
                  <span className="text-2xl">🔥</span>
                  <p className="text-lg font-semibold text-green-900">
                    <strong>Streak:</strong> <span className="text-orange-600">{student.progress.streak} days</span>
                  </p>
                </div>
                <div className="flex items-center space-x-3">
                  <span className="text-2xl">📚</span>
                  <p className="text-lg font-semibold text-green-900">
                    <strong>Completed:</strong> {student.progress.completedModules.length} / {student.progress.totalModules} modules
                  </p>
                </div>
              </div>
            </div>
            <div className="mt-6 bg-white p-4 rounded-lg border border-green-200">
              <p className="text-sm text-green-700 font-medium">🧠 AI Feedback: {getProgressMessage(student.progress)}</p>
            </div>
            <p className="text-xs text-gray-600 mt-4">💡 Progress updates when your child earns XP in their dashboard. Click "Refresh Progress" to see the latest updates.</p>
          </section>
        )}

        {/* Motivation Card */}
        <div className="bg-gradient-to-r from-purple-50 to-pink-50 border border-purple-300 rounded-xl p-6 text-center">
          <h3 className="text-lg font-semibold text-purple-800 mb-2">💪 Support Your Child's Journey!</h3>
          <p className="text-gray-700">
            {student?.progress?.streak && student.progress.streak > 5 
              ? `Amazing! Your child has maintained a ${student.progress.streak}-day learning streak! 🔥` 
              : student?.progress?.streak && student.progress.streak > 0 
                ? `Great start! Your child is on a ${student.progress.streak}-day streak. Keep encouraging them! 💪`
                : "Help your child start their learning journey today! Every day of learning counts! 🚀"
            }
          </p>
        </div>
      </div>

      {/* Unlink Modal */}
      {showUnlinkConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 shadow-xl w-[90%] max-w-md text-center">
            <h3 className="text-lg font-bold text-red-600 mb-2">Are you sure you want to unlink?</h3>
            <p className="text-sm text-gray-700 mb-4">This will remove the currently linked student from your account.</p>
            <div className="flex justify-center gap-4">
              <button
                onClick={() => setShowUnlinkConfirm(false)}
                className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400 transition"
              >Cancel</button>
              <button
                onClick={handleUnlinkConfirmed}
                className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition"
              >Yes, Unlink</button>
            </div>
          </div>
        </div>
      )}
    </main>
  )
}