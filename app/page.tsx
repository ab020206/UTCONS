'use client'

import { useEffect, useState } from 'react'
import { getToken, logout } from '@/lib/auth'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function Home() {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const router = useRouter()

  useEffect(() => {
    const token = getToken()
    setIsAuthenticated(!!token)
  }, [])

  const handleLogout = () => {
    logout()
    setIsAuthenticated(false)
  }

  const goToDashboard = async () => {
    const token = getToken()
    if (!token) return

    try {
      const res = await fetch('/api/profile', {
        headers: { Authorization: `Bearer ${token}` }
      })
      const data = await res.json()
      if (data.role) {
        router.push(`/dashboard/${data.role}`)
      } else {
        logout()
        setIsAuthenticated(false)
      }
    } catch {
      logout()
      setIsAuthenticated(false)
    }
  }

  return (
    <main className="min-h-screen bg-white px-6 py-12 flex items-center justify-center">
      <div className="w-full max-w-3xl bg-white rounded-3xl shadow-xl p-10 flex flex-col items-center gap-8 border border-blue-100">
        {/* Logo / Mascot */}
        <div className="w-20 h-20 rounded-full bg-[#0078d4] flex items-center justify-center text-white text-3xl font-bold">
          T
        </div>

        {/* Title */}
        <h1 className="text-4xl font-extrabold text-[#0078d4] text-center">Welcome to Taru</h1>

        {/* Description */}
        <p className="text-gray-600 text-center max-w-xl">
          Your intelligent gateway to student success. Built for learning, progress, and parental support on Jio PC.
        </p>

        {/* Action Buttons */}
        {isAuthenticated ? (
          <div className="flex flex-col gap-3 w-full max-w-sm">
            <button
              onClick={goToDashboard}
              className="bg-[#0078d4] text-white font-semibold py-3 rounded-xl hover:bg-[#0064b1] transition"
            >
              Go to Dashboard
            </button>
            <button
              onClick={handleLogout}
              className="text-[#0078d4] border border-[#0078d4] font-semibold py-3 rounded-xl hover:bg-blue-50 transition"
            >
              Logout
            </button>
          </div>
        ) : (
          <div className="flex flex-col sm:flex-row gap-4 w-full max-w-sm justify-center">
            <Link
              href="/login"
              className="bg-[#0078d4] text-white font-semibold py-3 rounded-xl w-full text-center hover:bg-[#0064b1] transition"
            >
              Login
            </Link>
            <Link
              href="/register"
              className="border border-[#0078d4] text-[#0078d4] font-semibold py-3 rounded-xl w-full text-center hover:bg-blue-50 transition"
            >
              Register
            </Link>
          </div>
        )}

        {/* Bonus: Motivation */}
        <div className="text-sm text-gray-400 pt-4">
          🚀 Let’s grow smarter, together.
        </div>
      </div>
    </main>
  )
}
