import { NextRequest, NextResponse } from 'next/server'
import connectToDatabase from '@/lib/db'
import { parseToken } from '@/lib/auth'
import Progress from '@/lib/models/Progress'
import User from '@/lib/models/User'

export async function GET(req: NextRequest) {
  await connectToDatabase()
  const authHeader = req.headers.get('authorization')
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })
  }
  const token = authHeader.split(' ')[1]
  const user = parseToken(token)

  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const progress = await Progress.findOne({ student: user.userId })

  return NextResponse.json({
    xp: progress?.xp || 0,
    streak: progress?.streak || 0,
    completedModules: progress?.completedModules || [],
    totalModules: 10 // or make this dynamic based on your curriculum
  })
}

export async function POST(req: NextRequest) {
  const authHeader = req.headers.get('authorization')
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })
  }
  const token = authHeader.split(' ')[1]

  if (!token) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })
  }

  try {
    const { userId } = parseToken(token)
    const { xpEarned, moduleId } = await req.json()

    if (!xpEarned || !moduleId) {
      return NextResponse.json({ message: 'Missing xpEarned or moduleId' }, { status: 400 })
    }

    await connectToDatabase()
    const user = await User.findById(userId)

    if (!user) {
      return NextResponse.json({ message: 'User not found' }, { status: 404 })
    }
    
    // Update XP
    user.xp = (user.xp || 0) + xpEarned

    // Update streak
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const lastLogin = user.lastLogin ? new Date(user.lastLogin) : new Date(0)
    lastLogin.setHours(0, 0, 0, 0)

    const diffTime = today.getTime() - lastLogin.getTime()
    const diffDays = diffTime / (1000 * 60 * 60 * 24)

    if (diffDays === 1) {
      user.streak = (user.streak || 0) + 1
    } else if (diffDays > 1) {
      user.streak = 1 // Reset streak
    }
    user.lastLogin = new Date()

    // Add module to completed modules if not already present
    if (!user.completedModules) {
      user.completedModules = []
    }
    if (!user.completedModules.includes(moduleId)) {
      user.completedModules.push(moduleId)
    }

    await user.save()

    return NextResponse.json({
      message: 'Progress updated successfully',
      xp: user.xp,
      streak: user.streak,
      completedModules: user.completedModules,
    })

  } catch (error) {
    console.error('Progress update error:', error)
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 })
  }
}
