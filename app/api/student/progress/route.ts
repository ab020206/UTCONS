import { NextRequest, NextResponse } from 'next/server'
import connectToDB from '@/lib/db'
import { verifyToken } from '@/lib/auth'
import Progress from '@/lib/models/Progress'

export async function GET(req: NextRequest) {
  await connectToDB()
  const user = verifyToken(req)

  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const progress = await Progress.findOne({ student: user.userId })

  return NextResponse.json({
    xp: progress?.xp || 0,
    streak: progress?.streak || 0,
    completedModules: progress?.completedModules || [],
    totalModules: 10 // or make this dynamic based on your curriculum
  })
}
