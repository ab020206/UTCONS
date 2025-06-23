import { NextRequest, NextResponse } from 'next/server';
import connectToDatabase from '@/lib/db';
import User from '@/lib/models/User';
import { parseToken } from '@/lib/auth';

export async function GET(req: NextRequest) {
  const authHeader = req.headers.get('authorization');
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }
  const token = authHeader.split(' ')[1];

  if (!token) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }

  try {
    const decoded = parseToken(token);
    if (decoded.role !== 'teacher' && decoded.role !== 'admin') {
      return NextResponse.json({ message: 'Forbidden' }, { status: 403 });
    }

    await connectToDatabase();
    
    // Fetch all users with the 'student' role
    const students = await User.find({ role: 'student' }).select(
      'fullName email xp streak completedModules'
    ).lean();

    return NextResponse.json({ students });

  } catch (error) {
    console.error('Error fetching students:', error);
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
} 