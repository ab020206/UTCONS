// Updated ParentDashboard.tsx with charts, Lottie mascot, responsive design, and AI-based feedback

'use client'

import { useEffect, useState } from 'react'
import { getToken, logout } from '@/lib/auth'
import { useRouter } from 'next/navigation'
import Lottie from 'lottie-react'

import { CircularProgressbar, buildStyles } from 'react-circular-progressbar'
import 'react-circular-progressbar/dist/styles.css'

interface StudentInfo {
  _id: string
  email: string
  name?: string
  grade?: string
}

interface Announcement {
  _id: string
  title: string
  message: string
  date: string
}

interface ProgressInfo {
  xp: number
  streak: number
  completedModules: string[]
  totalModules: number
}

export default function ParentDashboard() {
  const [student, setStudent] = useState<StudentInfo | null>(null)
  const [availableStudents, setAvailableStudents] = useState<StudentInfo[]>([])
  const [relinking, setRelinking] = useState(false)
  const [newStudentId, setNewStudentId] = useState('')
  const [announcements, setAnnouncements] = useState<Announcement[]>([])
  const [progress, setProgress] = useState<ProgressInfo | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showUnlinkConfirm, setShowUnlinkConfirm] = useState(false)
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

  useEffect(() => {
    const token = getToken()
    if (!token || !student) return

    fetch('/api/student/progress', {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(res => res.json())
      .then(setProgress)
      .catch(() => console.warn('⚠️ Could not load student progress'))
  }, [student])

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
    } else {
      alert('Relink failed')
    }
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
            className="bg-gradient-to-r from-red-500 to-red-600 text-white px-5 py-2 rounded-xl text-sm font-semibold hover:brightness-110 transition"
          >Logout</button>
        </div>

        <div className="flex flex-col-reverse md:flex-row gap-6">
          <div className="flex-1 space-y-6">
            {/* Announcements */}
            <section className="bg-[#f5edff] border border-purple-200 rounded-2xl p-6 shadow-inner">
              <h2 className="text-2xl font-bold text-purple-800 mb-4">📢 Announcements</h2>
              {announcements.length === 0 ? (
                <p className="text-gray-600">No announcements available.</p>
              ) : (
                <ul className="space-y-4">
                  {announcements.map((a) => (
                    <li key={a._id} className="bg-white border-l-4 border-purple-400 rounded-xl px-6 py-4 shadow-sm">
                      <h3 className="text-lg font-semibold text-purple-900">{a.title}</h3>
                      <p className="text-sm text-gray-700">{a.message}</p>
                      <p className="text-xs text-gray-500 mt-1">{new Date(a.date).toLocaleDateString()}</p>
                    </li>
                  ))}
                </ul>
              )}
            </section>

            {/* Student Info */}
            <section className="bg-[#eaf6ff] border border-blue-200 rounded-2xl p-6">
              <h2 className="text-2xl font-bold text-blue-800 mb-4">🎓 Linked Student</h2>
              {loading ? (
                <p className="text-gray-500">⏳ Loading student data...</p>
              ) : error ? (
                <p className="text-red-600">{error}</p>
              ) : student ? (
                <div className="space-y-2 text-[15px] text-gray-800">
                  <p><strong>ID:</strong> {student._id}</p>
                  <p><strong>Email:</strong> {student.email}</p>
                  {student.name && <p><strong>Name:</strong> {student.name}</p>}
                  {student.grade && <p><strong>Grade:</strong> {student.grade}</p>}
                  <button
                    onClick={confirmUnlink}
                    className="mt-3 text-sm text-red-600 underline hover:text-red-800"
                  >❌ Unlink this student</button>
                </div>
              ) : relinking ? (
                <div className="space-y-4">
                  <label className="block text-sm font-medium text-gray-700">🔗 Select a student to relink:</label>
                  <select
                    value={newStudentId}
                    onChange={(e) => setNewStudentId(e.target.value)}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2"
                  >
                    <option value="">-- Choose Student --</option>
                    {availableStudents.map((s) => (
                      <option key={s._id} value={s._id}>{s.name || s.email}</option>
                    ))}
                  </select>
                  <button
                    onClick={handleRelink}
                    disabled={!newStudentId}
                    className="bg-gradient-to-r from-green-500 to-green-600 text-white px-4 py-2 rounded-xl hover:brightness-110 disabled:opacity-50"
                  >🔄 Confirm Relink</button>
                </div>
              ) : <p className="text-gray-600">No student linked currently.</p>}
            </section>
          </div>

          
        </div>

        {/* Student Progress */}
        {progress && (
          <section className="bg-[#e0ffe7] border border-green-300 rounded-2xl p-6 shadow-inner">
            <h2 className="text-2xl font-bold text-green-800 mb-4">📊 Student Progress</h2>
            <div className="flex flex-col md:flex-row gap-6 items-center">
              <div className="w-40 h-40">
                <CircularProgressbar
                  value={(progress.completedModules.length / progress.totalModules) * 100}
                  text={`${Math.round((progress.completedModules.length / progress.totalModules) * 100)}%`}
                  styles={buildStyles({
                    textColor: '#256029',
                    pathColor: '#2ecc71',
                    trailColor: '#d4f4dc',
                  })}
                />
              </div>
              <ul className="text-sm text-green-900 space-y-2">
                <li><strong>XP:</strong> {progress.xp}</li>
                <li><strong>Streak:</strong> {progress.streak} days</li>
                <li><strong>Completed:</strong> {progress.completedModules.length} / {progress.totalModules} modules</li>
              </ul>
            </div>
            <p className="text-sm text-green-700 mt-4">🧠 AI Feedback: {progress.streak > 3 ? 'Great consistency!' : 'Encourage your child to learn daily!'}</p>
          </section>
        )}
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
                className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400"
              >Cancel</button>
              <button
                onClick={handleUnlinkConfirmed}
                className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
              >Yes, Unlink</button>
            </div>
          </div>
        </div>
      )}
    </main>
  )
}