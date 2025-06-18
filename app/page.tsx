'use client'

import { useEffect, useState } from 'react'
import { getToken, logout } from '@/lib/auth'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'

export default function Home() {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const router = useRouter()

  useEffect(() => {
    const token = getToken()
    if (token) setIsAuthenticated(true)
    else setIsAuthenticated(false)
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
    <div className="min-h-screen flex flex-col items-center justify-center p-8 gap-10 text-center">
      <Image
        className="dark:invert"
        src="/next.svg"
        alt="App Logo"
        width={180}
        height={38}
        priority
      />
      <h1 className="text-3xl font-bold">Welcome to Role Auth App</h1>
      <p className="text-gray-500 max-w-md">
        A simple role-based authentication system built with Next.js. Choose your path below.
      </p>

      {isAuthenticated ? (
        <div className="flex flex-col gap-4 mt-6">
          <button
            onClick={goToDashboard}
            className="bg-blue-600 text-white px-5 py-2 rounded hover:bg-blue-700"
          >
            Go to Dashboard
          </button>
          <button
            onClick={handleLogout}
            className="bg-red-600 text-white px-5 py-2 rounded hover:bg-red-700"
          >
            Logout
          </button>
        </div>
      ) : (
        <div className="flex gap-4 mt-6">
          <Link
            href="/login"
            className="bg-blue-600 text-white px-5 py-2 rounded hover:bg-blue-700"
          >
            Login
          </Link>
          <Link
            href="/register"
            className="bg-gray-100 px-5 py-2 rounded hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700"
          >
            Register
          </Link>
        </div>
      )}
    </div>
  )
}
