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
      }
      else if (user?.role === 'teacher') {
        router.push('/dashboard/teacher')
      }
      else if (user?.role === 'organisation') {
        router.push('/dashboard/organisation')
      }
      else {
        throw new Error('Unknown user role')
      }
    } catch (err: any) {
      setError(err.message || 'Login failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="min-h-screen flex flex-col md:flex-row overflow-hidden bg-white">
      {/* Left Panel */}
      <div className="w-full md:w-1/2 bg-gradient-to-br from-purple-700 to-purple-500 p-6 sm:p-10 md:p-12 text-white flex flex-col justify-between relative">
        <img
          src="/jio-logo.png"
          alt="Jio Logo"
          className="absolute top-4 sm:top-6 left-4 sm:left-6 w-12 sm:w-16 h-auto object-contain z-10"
        />
        <div className="mt-24 sm:mt-32 md:mt-20 px-2 sm:px-4 md:px-8 max-w-xl">
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold leading-snug">
            Welcome back to <br />
            <span className="text-yellow-300 font-extrabold">JioWorld Learning!</span><br />
            Log in to continue your journey 🚀
          </h2>
        </div>
        <img
          src="/landingPage.png"
          alt="Mascot"
          className="w-48 sm:w-64 mx-auto h-auto mt-10 md:mt-6"
        />
      </div>

      {/* Right Panel */}
      <div className="w-full md:w-1/2 bg-white px-4 sm:px-6 md:px-10 py-10 flex flex-col justify-center relative">
        <h1 className="text-2xl sm:text-3xl text-center font-extrabold mb-6 sm:mb-8 text-[#6a0dad]">
          Login to Your Account
        </h1>

        <form onSubmit={handleSubmit} className="space-y-4 w-full max-w-md mx-auto">
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Enter your email"
            required
            className="w-full px-4 py-3 border border-gray-300 rounded-lg text-base text-gray-700 focus:outline-none focus:ring-2 focus:ring-purple-300"
          />
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Enter your password"
            required
            className="w-full px-4 py-3 border border-gray-300 rounded-lg text-base text-gray-700 focus:outline-none focus:ring-2 focus:ring-purple-300"
          />

          {error && <p className="text-red-500 text-sm">{error}</p>}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#6a0dad] text-white font-semibold py-3 rounded-full hover:bg-[#5809b1] transition disabled:opacity-50"
          >
            {loading ? 'Logging in...' : 'Login'}
          </button>
        </form>

        <div className="text-center text-sm text-gray-600 mt-6">
          Don’t have an account?{' '}
          <span
            onClick={() => router.push('/')}
            className="text-[#6a0dad] font-semibold hover:underline cursor-pointer"
          >
            Register here
          </span>
        </div>

      </div>
    </main>
  )
}
