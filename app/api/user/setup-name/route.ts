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

export async function PUT(req: Request) {
  try {
    const { fullName } = await req.json()
    console.log('Setup-name API called with fullName:', fullName)
    
    // Verify JWT token from Authorization header
    const authHeader = req.headers.get('authorization')
    if (!authHeader?.startsWith('Bearer ')) {
      console.log('No authorization header found')
      return NextResponse.json({ message: 'Authorization token required' }, { status: 401 })
    }

    const token = authHeader.split(' ')[1]
    const decoded = verifyToken(token)
    
    if (!decoded) {
      console.log('Invalid token')
      return NextResponse.json({ message: 'Invalid or expired token' }, { status: 401 })
    }

    console.log('Token decoded successfully:', { email: decoded.email, role: decoded.role, firstTimeLogin: decoded.firstTimeLogin })

    // Verify user is a student and it's their first time login
    if (decoded.role !== 'student') {
      console.log('User is not a student')
      return NextResponse.json({ message: 'Only students can set up their name' }, { status: 403 })
    }

    await connectDB()

    const user = await User.findOneAndUpdate(
      { 
        email: decoded.email,
        firstTimeLogin: true // Ensure it's actually first time login
      },
      {
        fullName,
        firstTimeLogin: false
      },
      { new: true }
    )

    if (!user) {
      console.log('User not found or already completed setup')
      return NextResponse.json({ message: 'User not found or already completed setup' }, { status: 404 })
    }

    console.log('User updated successfully:', { email: user.email, fullName: user.fullName, firstTimeLogin: user.firstTimeLogin })

    // Generate new JWT token with firstTimeLogin: false
    const newToken = jwt.sign(
      {
        userId: user._id,
        role: user.role,
        email: user.email,
        firstTimeLogin: false, // Updated to false
      },
      process.env.JWT_SECRET!,
      { expiresIn: '1h' }
    )

    return NextResponse.json({ 
      message: 'Name set successfully', 
      token: newToken, // Return new token
      user: {
        email: user.email,
        fullName: user.fullName,
        role: user.role
      }
    })
  } catch (error) {
    console.error('Setup name error:', error)
    return NextResponse.json({ message: 'Error updating name' }, { status: 500 })
  }
}
