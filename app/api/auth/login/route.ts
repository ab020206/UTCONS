import connectDB from '@/lib/db'
import User from '@/lib/models/User'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'

export async function POST(req: Request) {
  try {
    const { email, password } = await req.json()
    await connectDB()

    const user = await User.findOne({ email })
    if (!user) return new Response('User not found', { status: 404 })

    const isPasswordCorrect = await bcrypt.compare(password, user.password)
    if (!isPasswordCorrect) return new Response('Invalid credentials', { status: 401 })

    const token = jwt.sign(
      { userId: user._id, role: user.role },
      process.env.JWT_SECRET!,
      { expiresIn: '2h' }
    )

    return new Response(JSON.stringify({ token }), { status: 200 })
  } catch (error) {
    console.error('Login Error:', error)
    return new Response('Internal Server Error', { status: 500 })
  }
}
