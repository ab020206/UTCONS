'use client'

import { useEffect, useState } from 'react'
import { getToken, logout } from '@/lib/auth'
import { useRouter } from 'next/navigation'

interface StudentInfo {
  email: string
  _id: string
  // Add other fields like name, grade etc. if available
}

export default function ParentDashboard() {
  const [student, setStudent] = useState<StudentInfo | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
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
        setStudent(data) // expecting data to be the connected student
      })
      .catch((err) => {
        console.error('❌ Error fetching student:', err)
        setError('Session expired or invalid token. Please log in again.')
        logout()
        router.push('/login')
      })
      .finally(() => setLoading(false))
  }, [router])

  const handleLogout = () => {
    logout()
    router.push('/')
  }

  return (
    <div className="min-h-screen p-6 max-w-3xl mx-auto flex flex-col">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">👨‍👩‍👧 Parent Dashboard</h1>
        <button
          onClick={handleLogout}
          className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
        >
          Logout
        </button>
      </div>

      {/* Content */}
      <div className="flex-1">
        {loading ? (
          <p className="text-gray-500">Loading connected student...</p>
        ) : error ? (
          <p className="text-red-500">{error}</p>
        ) : student ? (
          <div className="bg-white shadow-md p-6 rounded-md space-y-2">
            <h2 className="text-xl font-semibold mb-2">📄 Connected Student Info</h2>
            <p><strong>Student ID:</strong> {student._id}</p>
            <p><strong>Email:</strong> {student.email}</p>
            {/* Add more fields if your student schema has them */}
          </div>
        ) : (
          <p className="text-gray-500">No student linked to this parent.</p>
        )}
      </div>
    </div>
  )
}
