# JioWorld Learning Platform

A comprehensive educational platform built with Next.js, TypeScript, and MongoDB that provides personalized learning experiences for students, teachers, and parents.

## 🚀 Table of Contents

- [Overview](#overview)
- [Architecture](#architecture)
- [Features](#features)
- [User Roles & Flows](#user-roles--flows)
- [API Documentation](#api-documentation)
- [Database Schema](#database-schema)
- [Development Setup](#development-setup)
- [Adding New Features](#adding-new-features)
- [Deployment](#deployment)

## 📋 Overview

JioWorld Learning Platform is a modern educational application that offers:
- **Multi-role support**: Students, Teachers, Parents, and Organizations
- **Personalized learning paths**: AI-driven recommendations based on interests and preferences
- **Progress tracking**: XP system, streaks, and achievement badges
- **Real-time analytics**: Comprehensive dashboards for all user types
- **Multi-language support**: English, Hindi, and Marathi
- **Responsive design**: Modern UI with Tailwind CSS

## 🏗️ Architecture

### Tech Stack
- **Frontend**: Next.js 15.3.3, React 19, TypeScript
- **Styling**: Tailwind CSS 4
- **Backend**: Next.js API Routes
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: JWT with bcryptjs
- **Charts**: Recharts
- **Animations**: Canvas Confetti, CSS Transitions

### Project Structure
```
Taru_demo/
├── app/                          # Next.js App Router
│   ├── api/                      # API Routes
│   │   ├── auth/                 # Authentication endpoints
│   │   ├── student/              # Student-specific APIs
│   │   ├── teacher/              # Teacher-specific APIs
│   │   ├── parent/               # Parent-specific APIs
│   │   └── user/                 # User management APIs
│   ├── dashboard/                # Role-based dashboards
│   │   ├── student/              # Student dashboard pages
│   │   ├── teacher/              # Teacher dashboard pages
│   │   └── parent/               # Parent dashboard pages
│   ├── login/                    # Authentication pages
│   ├── preferences/              # User preferences setup
│   └── setup-name/               # First-time user setup
├── lib/                          # Core utilities
│   ├── models/                   # MongoDB schemas
│   ├── auth.ts                   # Authentication utilities
│   └── db.ts                     # Database connection
├── scripts/                      # Database seeding scripts
└── public/                       # Static assets
```

## ✨ Features

### 🎓 Student Features
- **Personalized Dashboard**: XP tracking, streaks, and achievement badges
- **Learning Paths**: Curated modules based on interests (Technology, Art, Science, Mathematics)
- **Progress Analytics**: Detailed charts and progress tracking
- **AI-Powered Recommendations**: Personalized module suggestions
- **Achievement System**: Badges and milestones with confetti celebrations

### 👨‍🏫 Teacher Features
- **Student Management**: View all students with progress metrics
- **Announcement System**: Create and manage announcements
- **Progress Monitoring**: Track student XP, streaks, and completed modules
- **Analytics Dashboard**: Overview of class performance

### 👨‍👩‍👧 Parent Features
- **Child Progress Tracking**: Real-time monitoring of learning progress
- **Aspiration Setting**: Define career goals for children
- **Student Linking**: Connect to child's account
- **Announcement Access**: View teacher announcements
- **Progress Reports**: Detailed analytics and AI feedback

### 🌐 Platform Features
- **Multi-language Support**: English, Hindi, Marathi
- **Responsive Design**: Mobile-first approach
- **Real-time Updates**: Live progress tracking
- **Gamification**: XP system, streaks, and achievements

## 👥 User Roles & Flows

### Student Journey
1. **Registration** → Choose role as "Student"
2. **First Login** → Setup name and basic information
3. **Preferences Setup** → Select interests and learning style
4. **Dashboard Access** → View personalized learning hub
5. **Learning Paths** → Explore curated modules
6. **Progress Tracking** → Monitor XP, streaks, and achievements
7. **Analysis** → Get AI-powered recommendations

### Teacher Journey
1. **Registration** → Choose role as "Teacher"
2. **Login** → Access teacher dashboard
3. **Student Management** → View all students and their progress
4. **Announcements** → Create and manage announcements
5. **Analytics** → Monitor class performance

### Parent Journey
1. **Registration** → Choose role as "Parent" and link to student
2. **Login** → Access parent dashboard
3. **Child Monitoring** → View child's progress and achievements
4. **Aspiration Setting** → Define career goals
5. **Announcements** → View teacher communications

## 🔌 API Documentation

### Authentication Endpoints

#### POST `/api/auth/register`
Register a new user
```typescript
{
  email: string,
  password: string,
  role: 'student' | 'parent' | 'teacher' | 'admin',
  studentId?: string // Required for parent role
}
```

#### POST `/api/auth/login`
Authenticate user
```typescript
{
  email: string,
  password: string
}
// Returns: { token: string }
```

### Student Endpoints

#### GET `/api/student/dashboard`
Get student dashboard data
```typescript
// Headers: Authorization: Bearer <token>
// Returns: {
//   user: { fullName, email, role, preferences, xp, streak, completedModules },
//   weeklyProgress: Array<{ date: string, xp: number }>,
//   message: string
// }
```

#### GET `/api/student/analysis`
Get personalized analysis and recommendations
```typescript
// Returns: {
//   analysis: {
//     hasPreferences: boolean,
//     interests: string[],
//     learningStyle: string,
//     hasParentAspiration: boolean,
//     parentName: string,
//     parentAspiration: string,
//     recommendedPath: Array<{ moduleId, step, description }>,
//     insights: string
//   }
// }
```

#### POST `/api/student/progress`
Update student progress
```typescript
{
  xpEarned: number,
  moduleId: string
}
```

### Teacher Endpoints

#### GET `/api/teacher/students`
Get all students with progress data
```typescript
// Returns: {
//   students: Array<{
//     _id: string,
//     fullName: string,
//     email: string,
//     xp: number,
//     streak: number,
//     completedModules: string[]
//   }>
// }
```

#### GET `/api/teacher/announcements`
Get all announcements
```typescript
// Returns: Array<{
//   _id: string,
//   title: string,
//   message: string,
//   date: string
// }>
```

#### POST `/api/teacher/announcements`
Create new announcement
```typescript
{
  title: string,
  message: string
}
```

### Parent Endpoints

#### GET `/api/parent/aspiration`
Get parent aspiration for linked student
```typescript
// Returns: { aspiration: string }
```

#### POST `/api/parent/aspiration`
Set parent aspiration
```typescript
{
  aspiration: string
}
```

#### POST `/api/parent/relink-student`
Link to a different student
```typescript
{
  newStudentId: string
}
```

#### POST `/api/parent/unlink-student`
Unlink current student
```typescript
{
  studentId: string
}
```

### Learning Paths

#### GET `/api/learning-paths`
Get all available learning paths
```typescript
// Returns: {
//   learningPaths: Array<{
//     _id: string,
//     title: string,
//     description: string,
//     interest: string,
//     modules: Array<{
//       moduleId: string,
//       title: string,
//       description: string,
//       xpValue: number
//     }>
//   }>
// }
```

## 🗄️ Database Schema

### User Model
```typescript
interface IUser {
  email: string;
  password: string;
  role: 'student' | 'parent' | 'teacher' | 'admin';
  studentId?: ObjectId; // For parent role
  firstTimeLogin: boolean;
  fullName?: string;
  preferences?: {
    interests: string[];
    style: string;
  };
  aspiration?: string; // For parent role
  xp?: number;
  streak?: number;
  completedModules?: string[];
  lastLogin?: Date;
}
```

### LearningPath Model
```typescript
interface ILearningPath {
  title: string;
  description: string;
  interest: string;
  modules: Array<{
    moduleId: string;
    title: string;
    description: string;
    xpValue: number;
  }>;
}
```

### Progress Model
```typescript
interface Progress {
  student: ObjectId;
  xp: number;
  streak: number;
  completedModules: string[];
  history: Array<{
    date: Date;
    xp: number;
  }>;
}
```

### Announcement Model
```typescript
interface IAnnouncement {
  title: string;
  message: string;
  date: Date;
}
```

## 🛠️ Development Setup

### Prerequisites
- Node.js 18+ 
- MongoDB instance
- npm or yarn

### Environment Variables
Create `.env.local` file:
```env
MONGODB_URI=mongodb://localhost:27017/jioworld
JWT_SECRET=your-super-secret-jwt-key
```

### Installation
```bash
# Clone the repository
git clone <repository-url>
cd Taru_demo

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env.local
# Edit .env.local with your MongoDB URI and JWT secret

# Seed the database with learning paths
node scripts/seed-learning-paths.js

# Start development server
npm run dev
```

### Available Scripts
```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run start        # Start production server
npm run lint         # Run ESLint
```

## 🚀 Adding New Features

### 1. Adding New API Endpoints

Create new route files in `app/api/`:
```typescript
// app/api/new-feature/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { verifyToken } from '@/lib/auth'
import connectDB from '@/lib/db'

export async function GET(req: NextRequest) {
  const decoded = verifyToken(req)
  if (!decoded) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })
  }

  try {
    await connectDB()
    // Your logic here
    return NextResponse.json({ data: 'success' })
  } catch (error) {
    return NextResponse.json({ message: 'Server error' }, { status: 500 })
  }
}
```

### 2. Adding New Database Models

Create new model files in `lib/models/`:
```typescript
// lib/models/NewModel.ts
import mongoose, { Document, Schema, Model } from 'mongoose'

export interface INewModel extends Document {
  // Define your interface
}

const NewModelSchema: Schema<INewModel> = new Schema({
  // Define your schema
})

const NewModel: Model<INewModel> = mongoose.models.NewModel || 
  mongoose.model<INewModel>('NewModel', NewModelSchema)

export default NewModel
```

### 3. Adding New Dashboard Pages

Create new pages in `app/dashboard/[role]/`:
```typescript
// app/dashboard/student/new-feature/page.tsx
'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { getToken } from '@/lib/auth'

export default function NewFeaturePage() {
  // Your component logic
}
```

### 4. Adding New Learning Paths

Update `scripts/seed-learning-paths.js`:
```javascript
const newLearningPath = {
  title: 'New Learning Path',
  description: 'Description here',
  interest: 'NewInterest',
  modules: [
    {
      moduleId: 'new-101',
      title: 'New Module',
      description: 'Module description',
      xpValue: 25
    }
  ]
}

// Add to learningPaths array and run the script
```

### 5. Authentication Flow

For protected routes, use the `verifyToken` function:
```typescript
import { verifyToken } from '@/lib/auth'

const decoded = verifyToken(req)
if (!decoded || !authorizeRoles('student')(decoded)) {
  return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })
}
```

### 6. Frontend Authentication

Use the auth utilities in components:
```typescript
import { getToken, logout, parseToken } from '@/lib/auth'

// Get current token
const token = getToken()

// Parse token for user info
const user = parseToken(token)

// Logout user
logout()
```

## 🎨 UI/UX Guidelines

### Color Scheme
- **Primary**: Purple (#6a0dad)
- **Secondary**: Blue (#3b82f6)
- **Success**: Green (#10b981)
- **Warning**: Yellow (#f59e0b)
- **Error**: Red (#ef4444)

### Component Patterns
- Use Tailwind CSS classes for styling
- Implement responsive design with mobile-first approach
- Add hover effects and transitions for better UX
- Use emojis for visual appeal and quick recognition
- Implement loading states and error handling

### Animation Guidelines
- Use CSS transitions for smooth interactions
- Implement confetti animations for achievements
- Add scale transforms on hover
- Use staggered animations for lists

## 🚀 Deployment

### Vercel Deployment
1. Connect your GitHub repository to Vercel
2. Set environment variables in Vercel dashboard
3. Deploy automatically on push to main branch

### Environment Variables for Production
```env
MONGODB_URI=your-production-mongodb-uri
JWT_SECRET=your-production-jwt-secret
```

### Database Setup
1. Create MongoDB Atlas cluster or use local MongoDB
2. Run the seeding script: `node scripts/seed-learning-paths.js`
3. Ensure proper network access and authentication

## 🔧 Troubleshooting

### Common Issues

1. **MongoDB Connection Error**
   - Check MONGODB_URI in environment variables
   - Ensure MongoDB instance is running
   - Verify network access and authentication

2. **JWT Token Issues**
   - Check JWT_SECRET is set correctly
   - Verify token expiration (default: 1 hour)
   - Clear localStorage if debugging authentication

3. **Build Errors**
   - Run `npm run lint` to check for TypeScript errors
   - Ensure all dependencies are installed
   - Check for missing environment variables

4. **API Route Errors**
   - Verify authentication headers are present
   - Check user role permissions
   - Ensure database connection is established

## 📝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes following the established patterns
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is proprietary software developed for JioWorld Learning Platform.

---

**Note**: This README serves as a comprehensive guide for understanding and extending the JioWorld Learning Platform. For specific implementation details, refer to the individual component files and API route handlers.
