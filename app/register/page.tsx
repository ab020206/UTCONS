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
  const router = useRouter()

  useEffect(() => {
    if (role === 'parent') {
      fetch('/api/student/list')
        .then(res => res.json())
        .then(setStudents)
        .catch(() => alert('Failed to fetch student list'))
    }
  }, [role])

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()

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
      alert('❌ Registration failed: ' + text)
    }
  }

  return (
    <div className="max-w-md mx-auto mt-10 p-6 border rounded-md shadow-md space-y-4">
      <h2 className="text-xl font-bold">Register</h2>
      <form onSubmit={handleRegister} className="space-y-4">
        <input
          type="email"
          className="w-full p-2 border rounded"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <input
          type="password"
          className="w-full p-2 border rounded"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />

        <select
          className="w-full p-2 border rounded"
          value={role}
          onChange={(e) => setRole(e.target.value)}
        >
          <option value="student">Student</option>
          <option value="parent">Parent</option>
        </select>

        {role === 'parent' && (
          <>
            {students.length > 0 ? (
              <select
                className="w-full p-2 border rounded"
                value={selectedStudent}
                onChange={(e) => setSelectedStudent(e.target.value)}
                required
              >
                <option value="">Select a student</option>
                {students.map((student) => (
                  <option key={student._id} value={student._id}>
                    {student.email}
                  </option>
                ))}
              </select>
            ) : (
              <p className="text-red-600 text-sm">
                ⚠️ No students found. Please ensure at least one student is registered first.
              </p>
            )}
          </>
        )}

        <button
          type="submit"
          className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700"
        >
          Register
        </button>
      </form>
    </div>
  )
}
