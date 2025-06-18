import jwt from 'jsonwebtoken'
import { NextRequest } from 'next/server'
interface JwtPayload {
  userId: string
  role: 'student' | 'parent' | 'admin'
  iat: number
  exp: number
}

export function verifyToken(req: NextRequest): { userId: string; role: JwtPayload['role'] } | null {
  try {
    const authHeader = req.headers.get('authorization')
    if (!authHeader || !authHeader.startsWith('Bearer ')) return null

    const token = authHeader.split(' ')[1]
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as JwtPayload

    return { userId: decoded.userId, role: decoded.role }
  } catch (err) {
    console.error('JWT error:', err)
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
    localStorage.setItem('token', data.token)
    return data
  }
  
  export async function register(email: string, password: string, role: string) {
    const res = await fetch('/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password, role }),
    })
  
    if (!res.ok) {
      const msg = await res.text()
      throw new Error(msg || 'Registration failed')
    }
  
    const data = await res.json()
    return data
  }
  
  export function getToken() {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('token')
    }
    return null
  }
  
  
  export function logout() {
    localStorage.removeItem('token')
  }
  
  export function parseToken(token: string) {
    try {
      return JSON.parse(atob(token.split('.')[1]))
    } catch {
      return null
    }
  }
  