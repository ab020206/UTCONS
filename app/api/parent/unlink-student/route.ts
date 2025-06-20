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

  const { studentId } = await req.json()

  if (!studentId) {
    return NextResponse.json({ error: 'Student ID missing' }, { status: 400 })
  }

  const updated = await User.findByIdAndUpdate(
    user.userId,
    { $unset: { studentId: "" } },
    { new: true }
  )

  if (!updated) {
    return NextResponse.json({ error: 'Parent not found' }, { status: 404 })
  }

  return NextResponse.json({ success: true, message: 'Student unlinked successfully' })
}
