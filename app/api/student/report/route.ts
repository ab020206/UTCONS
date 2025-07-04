import { verifyToken, authorizeRoles } from '@/lib/auth'
import connectDB from '@/lib/db'
import User from '@/lib/models/User'
import Progress from '@/lib/models/Progress'
import { NextRequest } from 'next/server'

export async function GET(req: NextRequest) {
  try {
    // 🔐 Verify JWT token
    const user = verifyToken(req)
    if (!user) return new Response('Unauthorized', { status: 401 })

    // 🔒 Ensure only parents can access this route
    if (!authorizeRoles('parent')(user)) {
      return new Response('Forbidden: Parents only', { status: 403 })
    }

    // 🛢️ Connect to database
    await connectDB()

    // 👨‍👧 Fetch parent and populate linked student
    const parent = await User.findById(user.userId).populate({
      path: 'studentId',
      strictPopulate: false, // Prevents error if not declared in schema
    })

    if (!parent || !parent.studentId) {
      return new Response(JSON.stringify({ error: 'No linked student found' }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' },
      })
    }

    // 📊 Fetch student progress data
    const student = parent.studentId
    const progress = await Progress.findOne({ student: student._id })

    // 📨 Send comprehensive student data including progress
    const responseData = {
      _id: student._id,
      email: student.email,
      fullName: student.fullName,
      role: student.role,
      preferences: student.preferences,
      progress: {
        xp: progress?.xp || 0,
        streak: progress?.streak || 0,
        completedModules: progress?.completedModules || [],
        totalModules: 10,
        history: progress?.history || []
      },
      parentAspiration: parent.aspiration || ''
    }

    return new Response(JSON.stringify(responseData), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    })

  } catch (error) {
    console.error('❌ Error in /api/student/report:', error)
    return new Response('Internal Server Error', { status: 500 })
  }
}
