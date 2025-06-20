import { verifyToken } from '@/lib/auth'
import { NextRequest, NextResponse } from 'next/server'
import connectDB from '@/lib/db'
import User from '@/lib/models/User'

export async function GET(req: NextRequest) {
  const decoded = verifyToken(req)
  if (!decoded || decoded.role !== 'student') {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })
  }

  try {
    await connectDB()
    const user = await User.findById(decoded.userId).select('fullName email role')

    if (!user) {
      return NextResponse.json({ message: 'User not found' }, { status: 404 })
    }

    return NextResponse.json({
      message: `Welcome back, ${user.fullName}!`,
      user: {
        fullName: user.fullName,
        email: user.email,
        role: user.role,
      },
    })
  } catch (error) {
    console.error('Dashboard fetch error:', error)
    return NextResponse.json({ message: 'Server error' }, { status: 500 })
  }
}
