import { verifyToken } from '@/lib/auth'
import { NextRequest, NextResponse } from 'next/server'
import connectDB from '@/lib/db'
import User from '@/lib/models/User'
import Progress from '@/lib/models/Progress'

export async function GET(req: NextRequest) {
  const decoded = verifyToken(req)
  if (!decoded || decoded.role !== 'student') {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })
  }

  try {
    await connectDB()

    const user = await User.findById(decoded.userId).select('fullName email role preferences')
    if (!user) {
      return NextResponse.json({ message: 'User not found' }, { status: 404 })
    }

    const progress = await Progress.findOne({ student: decoded.userId })

    // Generate weekly progress data for the chart
    const weeklyProgress = generateWeeklyProgress(progress?.history || [])

    return NextResponse.json({
      message: `Welcome back, ${user.fullName}!`,
      user: {
        fullName: user.fullName,
        email: user.email,
        role: user.role,
        preferences: user.preferences || null,
        xp: progress?.xp || 0,
        streak: progress?.streak || 0,
        completedModules: progress?.completedModules || [],
      },
      weeklyProgress
    })
  } catch (error) {
    console.error('Dashboard fetch error:', error)
    return NextResponse.json({ message: 'Server error' }, { status: 500 })
  }
}

function generateWeeklyProgress(history: Array<{ date: Date; xp: number }>) {
  const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
  const today = new Date()
  const weekData = []

  // Generate data for the last 7 days
  for (let i = 6; i >= 0; i--) {
    const date = new Date(today)
    date.setDate(date.getDate() - i)
    
    // Find XP for this specific date
    const dayHistory = history.find(h => {
      const historyDate = new Date(h.date)
      return historyDate.toDateString() === date.toDateString()
    })

    weekData.push({
      date: days[date.getDay()],
      xp: dayHistory?.xp || 0
    })
  }

  return weekData
}
