'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'

interface Student {
  _id: string
  email: string
}

export default function RegisterPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [role, setRole] = useState('student')
  const [students, setStudents] = useState<Student[]>([])
  const [selectedStudent, setSelectedStudent] = useState('')
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  useEffect(() => {
    if (role === 'parent') {
      fetch('/api/student/list')
        .then(res => res.json())
        .then(setStudents)
        .catch(() => setError('Failed to fetch student list.'))
    }
  }, [role])

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    const body: any = { email, password, role }
    if (role === 'parent') body.studentId = selectedStudent

    const res = await fetch('/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    })

    if (res.ok) {
      alert('✅ Registered successfully')
      router.push('/login')
    } else {
      const text = await res.text()
      setError('❌ Registration failed: ' + text)
    }
  }

  return (
    <main className="min-h-screen bg-white flex items-center justify-center px-6 py-10">
      <div className="w-full max-w-md bg-white border border-blue-100 shadow-xl rounded-3xl p-8 space-y-6">
        <div className="text-center">
          <h2 className="text-3xl font-bold text-[#0078d4]">Create Your Taru Account</h2>
          <p className="text-gray-500 text-sm mt-1">Register as a student or link with your child as a parent.</p>
        </div>

        <form onSubmit={handleRegister} className="space-y-4">
          <input
            type="email"
            className="w-full px-4 py-3 border rounded-md focus:outline-none focus:ring-2 focus:ring-[#0078d4]"
            placeholder="Enter your email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />

          <input
            type="password"
            className="w-full px-4 py-3 border rounded-md focus:outline-none focus:ring-2 focus:ring-[#0078d4]"
            placeholder="Create a password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />

          <select
            className="w-full px-4 py-3 border rounded-md focus:outline-none focus:ring-2 focus:ring-[#0078d4]"
            value={role}
            onChange={(e) => setRole(e.target.value)}
          >
            <option value="student">I’m a Student</option>
            <option value="parent">I’m a Parent</option>
          </select>

          {role === 'parent' && (
            <>
              {students.length > 0 ? (
                <select
                  className="w-full px-4 py-3 border rounded-md focus:outline-none focus:ring-2 focus:ring-[#0078d4]"
                  value={selectedStudent}
                  onChange={(e) => setSelectedStudent(e.target.value)}
                  required
                >
                  <option value="">Select linked student</option>
                  {students.map((student) => (
                    <option key={student._id} value={student._id}>
                      {student.email}
                    </option>
                  ))}
                </select>
              ) : (
                <p className="text-red-500 text-sm">
                  ⚠️ No students available to link. Please ensure at least one student is registered.
                </p>
              )}
            </>
          )}

          {error && <p className="text-red-500 text-sm">{error}</p>}

          <button
            type="submit"
            className="w-full bg-[#0078d4] text-white font-semibold py-3 rounded-md hover:bg-[#0064b1] transition"
          >
            Register
          </button>
        </form>

        <div className="text-center text-sm text-gray-600">
          Already have an account?{' '}
          <span
            onClick={() => router.push('/login')}
            className="text-[#0078d4] font-semibold hover:underline cursor-pointer"
          >
            Login here
          </span>
        </div>
      </div>
    </main>
  )
}
