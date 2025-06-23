import { NextResponse } from 'next/server'
import connectDB from '@/lib/db'
import User from '@/lib/models/User'
import jwt from 'jsonwebtoken'

interface JwtPayload {
  userId: string
  email: string
  role: 'student' | 'parent' | 'admin'
  firstTimeLogin: boolean
  iat: number
  exp: number
}

function verifyToken(token: string): JwtPayload | null {
  try {
    return jwt.verify(token, process.env.JWT_SECRET!) as JwtPayload
  } catch {
    return null
  }
}

// GET - Fetch user preferences
export async function GET(req: Request) {
  try {
    const authHeader = req.headers.get('authorization')
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json({ message: 'Authorization token required' }, { status: 401 })
    }

    const token = authHeader.split(' ')[1]
    const decoded = verifyToken(token)
    
    if (!decoded) {
      return NextResponse.json({ message: 'Invalid or expired token' }, { status: 401 })
    }

    await connectDB()

    const user = await User.findOne({ email: decoded.email })
    if (!user) {
      return NextResponse.json({ message: 'User not found' }, { status: 404 })
    }

    return NextResponse.json({ 
      preferences: user.preferences || { interests: [], style: '' }
    })
  } catch (error) {
    console.error('Fetch preferences error:', error)
    return NextResponse.json({ message: 'Error fetching preferences' }, { status: 500 })
  }
}

// PUT - Save user preferences
export async function PUT(req: Request) {
  try {
    const { interests, style } = await req.json()
    
    const authHeader = req.headers.get('authorization')
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json({ message: 'Authorization token required' }, { status: 401 })
    }

    const token = authHeader.split(' ')[1]
    const decoded = verifyToken(token)
    
    if (!decoded) {
      return NextResponse.json({ message: 'Invalid or expired token' }, { status: 401 })
    }

    // Verify user is a student
    if (decoded.role !== 'student') {
      return NextResponse.json({ message: 'Only students can set preferences' }, { status: 403 })
    }

    await connectDB()

    const user = await User.findOneAndUpdate(
      { email: decoded.email },
      {
        preferences: {
          interests: interests || [],
          style: style || ''
        }
      },
      { new: true }
    )

    if (!user) {
      return NextResponse.json({ message: 'User not found' }, { status: 404 })
    }

    return NextResponse.json({ 
      message: 'Preferences saved successfully',
      preferences: user.preferences
    })
  } catch (error) {
    console.error('Save preferences error:', error)
    return NextResponse.json({ message: 'Error saving preferences' }, { status: 500 })
  }
} 