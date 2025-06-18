import { NextRequest } from 'next/server'
import { verifyToken } from '@/lib/auth'

export async function GET(req: NextRequest) {
  const user = verifyToken(req)
  console.log('✅ Verified user:', user)

  if (!user) {
    console.warn('❌ Unauthorized access - no valid token')
    return new Response('Unauthorized', { status: 401 })
  }

  // Optional: Check role before returning data
  if (user.role !== 'parent') {
    return new Response('Forbidden: Only parents can view reports.', { status: 403 })
  }

  // Return fake sample report for now (replace with real logic)
  const fakeReport = {
    student: 'John Doe',
    marks: { math: 92, science: 87 },
    attendance: '96%',
  }

  return Response.json({ message: 'Hello parent!', report: fakeReport })
}
