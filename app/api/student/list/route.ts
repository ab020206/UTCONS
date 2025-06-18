// app/api/students/list/route.ts
import connectDB from '@/lib/db'
import User from '@/lib/models/User'

export async function GET() {
  try {
    await connectDB()
    const students = await User.find({ role: 'student' }, '_id email')
    return new Response(JSON.stringify(students), { status: 200 })
  } catch (err) {
    console.error('Failed to fetch students:', err)
    return new Response('Internal Server Error', { status: 500 })
  }
}
