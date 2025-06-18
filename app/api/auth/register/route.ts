import connectDB from '@/lib/db'
import User from '@/lib/models/User'
import bcrypt from 'bcryptjs'

export async function POST(req: Request) {
  try {
    const { email, password, role, studentId } = await req.json()
    await connectDB()

    // Check for existing user
    const existing = await User.findOne({ email })
    if (existing) return new Response('User exists', { status: 409 })

    // Validate studentId if role is parent
    if (role === 'parent') {
      if (!studentId) return new Response('Student ID required for parent', { status: 400 })

      const student = await User.findById(studentId)
      if (!student || student.role !== 'student') {
        return new Response('Invalid student ID', { status: 400 })
      }
    }

    const hashedPassword = await bcrypt.hash(password, 10)

    // Create user (include studentId if parent)
    const user = await User.create({
      email,
      password: hashedPassword,
      role,
      ...(role === 'parent' && { studentId }),
    })

    return new Response(JSON.stringify({ message: 'Registered' }), { status: 201 })
  } catch (e) {
    console.error('Register error:', e)
    return new Response('Internal error', { status: 500 })
  }
}
