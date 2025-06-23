import { NextRequest, NextResponse } from 'next/server'
import { parseToken } from '@/lib/auth'
import connectToDatabase from '@/lib/db'
import User from '@/lib/models/User'
import LearningPath, { ILearningPath } from '@/lib/models/LearningPath'

export async function GET(req: NextRequest) {
  const authHeader = req.headers.get('authorization');
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }
  const token = authHeader.split(' ')[1];

  if (!token) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })
  }

  try {
    const { userId } = parseToken(token)
    await connectToDatabase()

    const student = await User.findById(userId).lean()
    if (!student) {
      return NextResponse.json({ message: 'Student not found' }, { status: 404 })
    }

    let parentName: string | null = null
    let parentAspiration: string | null = null

    // Find the parent and their aspiration
    const parent = await User.findOne({ studentId: student._id, role: 'parent' }).lean();
    if (parent) {
      parentName = parent.fullName || null;
      parentAspiration = parent.aspiration || null;
    }

    // Fetch all relevant learning paths based on student interests
    const interests = student.preferences?.interests || [];
    const learningPaths = await LearningPath.find({ interest: { $in: interests } }).lean<ILearningPath[]>();

    // Create a recommended path
    const completedModules = student.completedModules || [];
    const recommendedModules = learningPaths
      .flatMap(path => path.modules)
      .filter(module => !completedModules.includes(module.moduleId)) // Filter out completed modules
      .slice(0, 5); // Take the first 5 uncompleted modules as recommendations

    // Generate AI insights
    let insights = `Based on your interest in ${interests.join(', ')}, we've curated a list of modules to get you started.`;
    if (parentAspiration) {
        insights += ` To align with your parent's aspiration of you becoming a ${parentAspiration}, we're prioritizing modules that build foundational skills in relevant areas.`
    }
    insights += ` As you complete modules, your recommendations will adapt.`


    const analysis = {
      hasPreferences: (student.preferences?.interests?.length || 0) > 0 && !!student.preferences?.style,
      interests: interests,
      learningStyle: student.preferences?.style,
      hasParentAspiration: !!parentAspiration,
      parentName: parentName,
      parentAspiration: parentAspiration,
      recommendedPath: recommendedModules.map(module => ({
        moduleId: module.moduleId,
        step: module.title,
        description: module.description,
        done: false, // This is a recommended path, so nothing is "done" yet in this context
      })),
      insights,
    }

    return NextResponse.json({ analysis })
  } catch (error) {
    console.error('Error fetching student analysis:', error)
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 })
  }
} 