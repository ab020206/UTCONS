'use client'

import { useEffect, useState } from 'react'
import { getToken, logout } from '@/lib/auth'
import { useRouter } from 'next/navigation'

export default function StudentDashboard() {
  const [message, setMessage] = useState('')
  const router = useRouter()

  useEffect(() => {
    const token = getToken()
    if (!token) return router.push('/login')

    fetch('/api/student/dashboard', {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(res => res.text())
      .then(setMessage)
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
    <div className="p-6 max-w-2xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold">🎓 Student Dashboard</h2>
        <button
          onClick={handleLogout}
          className="bg-red-600 text-white px-4 py-1.5 rounded hover:bg-red-700"
        >
          Logout
        </button>
      </div>

      <p className="text-gray-700">{message || 'Loading student dashboard...'}</p>
    </div>
  )
}
