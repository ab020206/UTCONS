'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { getToken, parseToken } from '@/lib/auth'

const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('')

export default function SetupNamePage() {
  const [name, setName] = useState<string[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const router = useRouter()

  useEffect(() => {
    const token = getToken()
    if (!token) {
      router.push('/login')
      return
    }

    const user = parseToken(token)
    if (!user) {
      router.push('/login')
      return
    }

    if (user.role !== 'student') {
      router.push('/dashboard/parent')
      return
    }

    if (!user.firstTimeLogin) {
      router.push('/dashboard/student')
      return
    }

    setIsAuthenticated(true)
  }, [router])

  const handleLetterClick = (letter: string) => {
    setName([...name, letter])
  }

  const handleBackspace = () => {
    if (name.length > 0) {
      setName(name.slice(0, -1))
    }
  }

  const handleSubmit = async (e: React.MouseEvent) => {
    e.preventDefault() // Prevent page refresh
    const fullName = name.join('')
    setLoading(true)
    setError(null)
    
    console.log('Submitting name:', fullName)
    
    try {
      const token = getToken()
      if (!token) {
        setError('No authentication token found. Please login again.')
        return
      }

      console.log('Making API request to /api/user/setup-name')
      const res = await fetch('/api/user/setup-name', {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ fullName })
      })
  
      console.log('API response status:', res.status)
      console.log('API response ok:', res.ok)
      
      if (res.ok) {
        const data = await res.json()
        console.log('Name setup successful:', data)
        
        // Update the stored token with the new one (firstTimeLogin: false)
        if (data.token) {
          localStorage.setItem('token', data.token)
          console.log('Updated token stored')
        }
        
        console.log('About to redirect to /dashboard/student')
        
        // Try router.push first
        router.push('/dashboard/student')
        console.log('Router.push called')
        
        // Fallback: force redirect after a short delay
        setTimeout(() => {
          console.log('Fallback redirect triggered')
          window.location.href = '/dashboard/student'
        }, 1000)
      } else {
        const errorData = await res.json()
        console.log('API error:', errorData)
        setError(errorData.message || 'Failed to save name')
      }
    } catch (err) {
      console.error('Setup name error:', err)
      setError('Something went wrong. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  if (!isAuthenticated) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>
  }
  

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-100 to-purple-200 flex flex-col items-center justify-center px-4">
  <h1 className="text-4xl font-extrabold mb-4 text-center text-purple-800">
    🎮 Create Your Cool Name!
  </h1>
  <p className="mb-6 text-lg text-gray-700 text-center">
    Tap the letters below to build your name. (Repeat letters allowed!)
  </p>

  {/* Name display */}
  <div className="flex items-center gap-2 mb-6 flex-wrap justify-center">
    <div className="flex gap-1 bg-white px-6 py-3 rounded-2xl shadow-lg min-w-[250px] text-center transition-all">
      {name.length === 0 ? (
        <span className="text-gray-400 italic">Your name appears here...</span>
      ) : (
        name.map((letter, idx) => (
          <span key={idx} className="font-bold text-2xl text-blue-700">
            {letter}
          </span>
        ))
      )}
    </div>
    {name.length > 0 && (
      <button
        onClick={handleBackspace}
        className="text-sm bg-red-500 text-white px-3 py-2 rounded-lg hover:bg-red-600 shadow"
      >
        ⬅ Backspace
      </button>
    )}
  </div>

  {/* Letters grid */}
  <div className="grid grid-cols-7 gap-3 mb-8">
    {alphabet.map((letter) => (
      <button
        key={letter}
        onClick={() => handleLetterClick(letter)}
        className="w-12 h-12 text-xl font-semibold bg-white text-gray-800 border rounded-full shadow hover:bg-blue-100 transition"
      >
        {letter}
      </button>
    ))}
  </div>

  {/* Error */}
  {error && (
    <p className="text-red-500 text-sm mb-4 text-center font-medium">
      ⚠️ {error}
    </p>
  )}

  {/* Submit button */}
  <button
    onClick={handleSubmit}
    disabled={name.length < 3 || loading}
    className="bg-green-600 text-white text-lg px-8 py-3 rounded-full shadow-md hover:bg-green-700 disabled:opacity-50 transition"
  >
    {loading ? 'Saving...' : '✅ Finish & Go to Dashboard'}
  </button>
</div>

  )
}
