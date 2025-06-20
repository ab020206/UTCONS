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

export async function POST(req: NextRequest) {
  await connectToDB()
  const user = verifyToken(req)

  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  try {
    const { xpEarned, moduleId } = await req.json()

    if (!xpEarned || xpEarned <= 0) {
      return NextResponse.json({ error: 'Invalid XP amount' }, { status: 400 })
    }

    const today = new Date()
    today.setHours(0, 0, 0, 0) // Set to start of day

    // Find or create progress record
    let progress = await Progress.findOne({ student: user.userId })

    if (!progress) {
      progress = new Progress({
        student: user.userId,
        xp: 0,
        streak: 0,
        completedModules: [],
        history: []
      })
    }

    // Update XP
    progress.xp += xpEarned

    // Add module to completed if provided
    if (moduleId && !progress.completedModules.includes(moduleId)) {
      progress.completedModules.push(moduleId)
    }

    // Update streak (simplified logic - you might want more sophisticated streak tracking)
    const yesterday = new Date(today)
    yesterday.setDate(yesterday.getDate() - 1)
    
    const hasActivityYesterday = progress.history.some((h: { date: Date; xp: number }) => {
      const historyDate = new Date(h.date)
      historyDate.setHours(0, 0, 0, 0)
      return historyDate.getTime() === yesterday.getTime() && h.xp > 0
    })

    if (hasActivityYesterday) {
      progress.streak += 1
    } else {
      progress.streak = 1 // Reset streak if no activity yesterday
    }

    // Add today's XP to history
    const existingTodayEntry = progress.history.find((h: { date: Date; xp: number }) => {
      const historyDate = new Date(h.date)
      historyDate.setHours(0, 0, 0, 0)
      return historyDate.getTime() === today.getTime()
    })

    if (existingTodayEntry) {
      existingTodayEntry.xp += xpEarned
    } else {
      progress.history.push({
        date: today,
        xp: xpEarned
      })
    }

    await progress.save()

    return NextResponse.json({
      success: true,
      newXP: progress.xp,
      newStreak: progress.streak,
      completedModules: progress.completedModules
    })

  } catch (error) {
    console.error('Progress update error:', error)
    return NextResponse.json({ error: 'Failed to update progress' }, { status: 500 })
  }
}
