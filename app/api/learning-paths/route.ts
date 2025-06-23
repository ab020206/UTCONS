import { NextRequest, NextResponse } from 'next/server';
import connectToDatabase from '@/lib/db';
import LearningPath from '@/lib/models/LearningPath';

export async function GET(req: NextRequest) {
  try {
    const authHeader = req.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }
    const token = authHeader.split(' ')[1];

    if (!token) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    await connectToDatabase();
    
    const learningPaths = await LearningPath.find({});

    return NextResponse.json({ learningPaths });

  } catch (error) {
    console.error('Error fetching learning paths:', error);
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
} 