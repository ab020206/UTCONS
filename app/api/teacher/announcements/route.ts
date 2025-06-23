import { NextRequest, NextResponse } from 'next/server';
import connectToDatabase from '@/lib/db';
import Announcement from '@/lib/models/Announcement';
import { parseToken } from '@/lib/auth';

// GET all announcements
export async function GET(req: NextRequest) {
    const authHeader = req.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }
    
    try {
        await connectToDatabase();
        const announcements = await Announcement.find({}).sort({ date: -1 });
        return NextResponse.json(announcements);
    } catch (error) {
        return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
    }
}

// POST a new announcement
export async function POST(req: NextRequest) {
    const authHeader = req.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }
    const token = authHeader.split(' ')[1];

    if (!token) {
        return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const decoded = parseToken(token);
    if (decoded.role !== 'teacher' && decoded.role !== 'admin') {
        return NextResponse.json({ message: 'Forbidden' }, { status: 403 });
    }

    try {
        const { title, message } = await req.json();
        if (!title || !message) {
            return NextResponse.json({ message: 'Title and message are required' }, { status: 400 });
        }

        await connectToDatabase();
        const newAnnouncement = new Announcement({ title, message });
        await newAnnouncement.save();

        return NextResponse.json(newAnnouncement, { status: 201 });
    } catch (error) {
        return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
    }
} 