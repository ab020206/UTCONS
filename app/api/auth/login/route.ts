// /app/api/auth/login/route.ts
import { NextResponse } from 'next/server'
import User from '@/lib/models/User'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import connectDB from '@/lib/db'

export async function POST(req: Request) {
  try {
    const { email, password } = await req.json()
    await connectDB()

    const user = await User.findOne({ email })
    if (!user) return NextResponse.json({ message: 'User not found' }, { status: 404 })

    const isMatch = await bcrypt.compare(password, user.password)
    if (!isMatch) return NextResponse.json({ message: 'Invalid credentials' }, { status: 401 })

    console.log('User found for login:', {
      email: user.email,
      role: user.role,
      firstTimeLogin: user.firstTimeLogin,
      fullName: user.fullName
    })

    const token = jwt.sign(
      {
        userId: user._id,
        role: user.role,
        email: user.email,
        firstTimeLogin: user.firstTimeLogin, // ✅ Include this
      },
      process.env.JWT_SECRET!,
      { expiresIn: '1h' }
    )

    console.log('JWT token payload:', {
      userId: user._id,
      role: user.role,
      email: user.email,
      firstTimeLogin: user.firstTimeLogin,
    })

    return NextResponse.json({ token })
  } catch (error) {
    return NextResponse.json({ message: 'Server error' }, { status: 500 })
  }
}
