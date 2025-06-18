import { verifyToken } from '@/lib/auth'
import { NextRequest } from 'next/server'

export async function GET(req: NextRequest) {
  const user = verifyToken(req)
  if (!user || user.role !== 'student') {
    return new Response('Unauthorized', { status: 401 })
  }

  return new Response('Welcome to the student dashboard!')
}
