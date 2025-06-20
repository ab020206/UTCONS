import jwt from 'jsonwebtoken'
import { NextRequest } from 'next/server'

interface JwtPayload {
  userId: string
  email: string
  role: 'student' | 'parent' | 'admin'
  firstTimeLogin: boolean
  iat: number
  exp: number
}

export function verifyToken(req: NextRequest): JwtPayload | null {
  try {
    const authHeader = req.headers.get('authorization')
    if (!authHeader?.startsWith('Bearer ')) return null
    const token = authHeader.split(' ')[1]
    return jwt.verify(token, process.env.JWT_SECRET!) as JwtPayload
  } catch {
    return null
  }
}

export function authorizeRoles(...allowedRoles: JwtPayload['role'][]) {
  return (user: { role: string }) => allowedRoles.includes(user.role as JwtPayload['role'])
}

export async function login(email: string, password: string) {
  const res = await fetch('/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  })

  if (!res.ok) {
    const msg = await res.text()
    throw new Error(msg || 'Login failed')
  }

  const data = await res.json()
  // Store token in localStorage only on client side
  if (typeof window !== 'undefined') {
    localStorage.setItem('token', data.token)
  }
  return data
}

export function parseToken(token: string) {
  try {
    const payload = token.split('.')[1]
    if (!payload) {
      console.error('No payload found in token')
      return null
    }
    const decoded = JSON.parse(atob(payload))
    console.log('Parsed token payload:', decoded)
    return decoded
  } catch (error) {
    console.error('Error parsing token:', error)
    return null
  }
}

// Get token from localStorage
export function getToken(): string | null {
  if (typeof window !== 'undefined') {
    return localStorage.getItem('token')
  }
  return null
}

// Remove token from localStorage
export function logout() {
  if (typeof window !== 'undefined') {
    localStorage.removeItem('token')
  }
}
