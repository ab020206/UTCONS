import { NextRequest, NextResponse } from 'next/server';
import connectToDatabase from '@/lib/db';
import LearningPath from '@/lib/models/LearningPath';

export async function GET(req: NextRequest, { params }: { params: { moduleId: string } }) {
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
    
    const { moduleId } = params;

    // Find the learning path that contains the module
    const learningPath = await LearningPath.findOne({ "modules.moduleId": moduleId });

    if (!learningPath) {
      return NextResponse.json({ message: 'Module not found' }, { status: 404 });
    }

    // Find the specific module within the path
    const module = learningPath.modules.find(m => m.moduleId === moduleId);

    if (!module) {
      return NextResponse.json({ message: 'Module not found' }, { status: 404 });
    }

    return NextResponse.json({ module });

  } catch (error) {
    console.error('Error fetching module:', error);
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
} 