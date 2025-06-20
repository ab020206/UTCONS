import { NextRequest, NextResponse } from 'next/server'
import { verifyToken } from '@/lib/auth'
import dbConnect from '@/lib/db'
import User from '@/lib/models/User'

export async function POST(req: NextRequest) {
  await dbConnect()

  const user = verifyToken(req)

  if (!user || user.role !== 'parent') {
    return NextResponse.json({ error: 'Forbidden or Invalid Role' }, { status: 403 })
  }

  const { newStudentId } = await req.json()

  if (!newStudentId) {
    return NextResponse.json({ error: 'New student ID missing' }, { status: 400 })
  }

  // Check if the student exists
  const student = await User.findOne({ _id: newStudentId, role: 'student' })

  if (!student) {
    return NextResponse.json({ error: 'Student not found' }, { status: 404 })
  }

  // Update parent's studentId
  const updatedParent = await User.findByIdAndUpdate(
    user.userId,
    { studentId: newStudentId },
    { new: true }
  )

  if (!updatedParent) {
    return NextResponse.json({ error: 'Parent not found' }, { status: 404 })
  }

  // Optionally, return linked student info back to frontend
  return NextResponse.json({
    success: true,
    message: 'Student relinked successfully',
    student: {
      _id: student._id,
      email: student.email,
      name: student.fullName,
    },
  })
}
