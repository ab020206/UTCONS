'use client'

import { useState } from 'react'
import { login, parseToken } from '@/lib/auth'
import { useRouter } from 'next/navigation'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setLoading(true)

    try {
      const data = await login(email, password)
      const user = parseToken(data.token)

      if (!user) throw new Error('Invalid token received')

      if (user?.role === 'student') {
        user.firstTimeLogin
          ? router.push('/setup-name')
          : router.push('/dashboard/student')
      } else if (user?.role === 'parent') {
        router.push('/dashboard/parent')
      } else {
        throw new Error('Unknown user role')
      }
    } catch (err: any) {
      setError(err.message || 'Login failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="min-h-screen flex items-center justify-center bg-white px-6 py-10">
      <div className="w-full max-w-md bg-white border border-blue-100 rounded-3xl shadow-xl p-8 space-y-6">
        <div className="text-center">
          <div className="text-3xl font-bold text-[#0078d4]">Welcome to Taru</div>
          <p className="text-gray-500 text-sm mt-1">Login to access your personalized dashboard</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Enter your email"
            required
            className="w-full px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#0078d4]"
          />
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Enter your password"
            required
            className="w-full px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#0078d4]"
          />

          {error && <p className="text-red-500 text-sm">{error}</p>}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#0078d4] text-white py-3 rounded-md font-semibold hover:bg-[#0064b1] transition disabled:opacity-50"
          >
            {loading ? 'Logging in...' : 'Login'}
          </button>
        </form>

        <div className="text-center text-sm text-gray-600">
          Don't have an account?{' '}
          <span
            onClick={() => router.push('/register')}
            className="text-[#0078d4] font-semibold hover:underline cursor-pointer"
          >
            Register here
          </span>
        </div>
      </div>
    </main>
  )
}
