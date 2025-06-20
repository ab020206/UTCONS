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
      console.log('User after login:', user)
      console.log('firstTimeLogin value:', user?.firstTimeLogin)
      console.log('user role:', user?.role)

      if (!user) {
        throw new Error('Invalid token received')
      }

      if (user?.role === 'student') {
        console.log('User is a student, firstTimeLogin:', user.firstTimeLogin)
        if (user.firstTimeLogin) {
          console.log('Redirecting to setup-name page')
          router.push('/setup-name')
        } else {
          console.log('Redirecting to student dashboard')
          router.push('/dashboard/student')
        }
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
    <div className="max-w-md mx-auto mt-10 p-6 border rounded-md shadow-md bg-white">
      <h2 className="text-2xl font-bold mb-6 text-center">🔐 Login</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Email"
          className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Password"
          className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
        />

        {error && <p className="text-red-500 text-sm">{error}</p>}

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-green-600 text-white py-2 rounded hover:bg-green-700 disabled:opacity-50"
        >
          {loading ? 'Logging in...' : 'Login'}
        </button>
      </form>

      <p className="text-sm text-center mt-4 text-gray-600">
        Don&apos;t have an account?{' '}
        <span
          onClick={() => router.push('/register')}
          className="text-blue-600 hover:underline cursor-pointer"
        >
          Register here
        </span>
      </p>
    </div>
  )
}
