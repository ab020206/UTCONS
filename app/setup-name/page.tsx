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
    <div className="min-h-screen bg-white flex flex-col items-center justify-center px-4">
      <img src="/jio-logo.png" alt="Jio Logo" className="absolute top-15 left-10 w-30 h-30 object-contain z-10" />
      <h1 className="text-6xl font-extrabold mb-4 text-center">
      <span className="text-black">What is your </span>
      <span className="text-blue-600">Full Name?</span>
      </h1>

      <p className="mb-6 text-lg text-gray-700 text-center">
       <br />
      </p>
  

      {/* Colorful Draggable Letters */}
      <div className="flex justify-center w-full mb-8">
        <div className="flex flex-wrap justify-center gap-4 max-w-3xl">
          {alphabet.map((letter, i) => (
            <div
              key={letter}
              draggable
              onDragStart={(e) => e.dataTransfer.setData('text/plain', letter)}
              className="w-16 h-16 flex items-center justify-center text-2xl font-extrabold text-white rounded-full shadow-[0_4px_12px_rgba(0,0,0,0.2)] cursor-grab active:cursor-grabbing transition-transform transform hover:scale-110 relative overflow-hidden"
              style={{
                background: `radial-gradient(circle at top left, hsla(${(i * 30) % 360}, 70%, 80%, 0.8), hsl(${(i * 30) % 360}, 70%, 55%))`,
              }}
            >
              {/* Glossy white shine */}
              <div className="absolute top-1 left-1 w-5 h-5 bg-white opacity-40 rounded-full blur-sm pointer-events-none" />
              <div className="absolute top-2 left-3 w-2 h-2 bg-white opacity-25 rounded-full blur-[2px] pointer-events-none" />
              {letter}
            </div>
          ))}
        </div>
      </div>



      {/* Drop Zone for Name */}
      <div
        onDrop={(e) => {
          e.preventDefault()
          const letter = e.dataTransfer.getData('text/plain')
          if (letter) setName([...name, letter])
        }}
        onDragOver={(e) => e.preventDefault()}
        className="flex items-center gap-2 mb-6 flex-wrap justify-center min-h-[80px] bg-white px-6 py-4 rounded-2xl shadow-lg min-w-[250px] text-center transition-all"
      >
        {name.length === 0 ? (
          <span className="text-gray-400 italic">Drag letters here...</span>
        ) : (
          name.map((letter, idx) => (
            <span
              key={idx}
              className="font-bold text-2xl text-blue-700 cursor-pointer hover:text-red-500"
              onClick={() =>
                setName(name.filter((_, i) => i !== idx))
              }
              title="Click to remove"
            >
              {letter}
            </span>
          ))
        )}
      </div>
  
      {/* Error */}
      {error && (
        <p className="text-red-500 text-sm mb-4 text-center font-medium">
          ⚠️ {error}
        </p>
      )}
  
      {/* Submit & Backspace */}
      <div className="flex gap-4">
        {name.length > 0 && (
          <button
            onClick={handleBackspace}
            className="text-sm bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 shadow"
          >
            ⬅ Backspace
          </button>
        )}
        <button
          onClick={handleSubmit}
          disabled={name.length < 3 || loading}
          className="bg-green-600 text-white text-lg px-8 py-3 rounded-full shadow-md hover:bg-green-700 disabled:opacity-50 transition"
        >
          {loading ? 'Saving...' : '✅ Finish & Go to Dashboard'}
        </button>
      </div>
    </div>
  )
  
}
