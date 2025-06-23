'use client'

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { getToken, logout } from '@/lib/auth';
import Link from 'next/link';

interface Student {
  _id: string;
  fullName: string;
  email: string;
  xp: number;
  streak: number;
  completedModules: string[];
}

interface Announcement {
    _id: string;
    title: string;
    message: string;
    date: string;
}

export default function TeacherDashboard() {
  const [students, setStudents] = useState<Student[]>([]);
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    const token = getToken();
    if (!token) {
      router.push('/login');
      return;
    }

    const fetchData = async () => {
      try {
        // Fetch students
        const studentsRes = await fetch('/api/teacher/students', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (!studentsRes.ok) throw new Error('Failed to fetch students');
        const studentsData = await studentsRes.json();
        setStudents(studentsData.students);

        // Fetch announcements
        const announcementsRes = await fetch('/api/teacher/announcements', {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        if (!announcementsRes.ok) throw new Error('Failed to fetch announcements');
        const announcementsData = await announcementsRes.json();
        setAnnouncements(announcementsData);

      } catch (err: any) {
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, [router]);

  const handleLogout = () => {
    logout();
    router.push('/');
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
        <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-indigo-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
        <div className="bg-white p-8 rounded-2xl shadow-xl text-center">
            <h2 className="text-2xl font-bold text-red-600 mb-4">An Error Occurred</h2>
            <p className="text-gray-700">{error}</p>
            <p className="text-gray-500 text-sm mt-2">Please try logging out and back in.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <header className="bg-white shadow-md">
        <div className="max-w-7xl mx-auto py-4 px-4 sm:px-6 lg:px-8 flex justify-between items-center">
          <h1 className="text-3xl font-extrabold text-indigo-700">🏫 Teacher Dashboard</h1>
          <button
            onClick={handleLogout}
            className="bg-red-500 hover:bg-red-600 text-white px-5 py-2 rounded-lg font-medium transition transform hover:scale-105"
          >
            Logout
          </button>
        </div>
      </header>
      <main className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Students Section */}
          <section className="lg:col-span-2 bg-white p-8 rounded-2xl shadow-lg">
            <h2 className="text-2xl font-bold text-gray-800 mb-6">All Students ({students.length})</h2>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">XP</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Streak</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Modules Completed</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {students.map((student) => (
                    <tr key={student._id} className="hover:bg-gray-50 transition">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-semibold text-gray-900">{student.fullName}</div>
                        <div className="text-xs text-gray-500">{student.email}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-yellow-600 font-bold">⭐ {student.xp || 0}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-orange-600 font-bold">🔥 {student.streak || 0}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-green-600 font-bold">📚 {student.completedModules?.length || 0}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          {/* Announcements Section */}
          <aside className="space-y-8">
            <div className="bg-white p-8 rounded-2xl shadow-lg">
                <h2 className="text-2xl font-bold text-gray-800 mb-6">Manage Announcements</h2>
                <Link href="/dashboard/teacher/announcements" className="w-full text-center block bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-lg font-semibold transition transform hover:scale-105">
                    Create & View Announcements
                </Link>
            </div>
            <div className="bg-white p-8 rounded-2xl shadow-lg">
                <h3 className="text-xl font-bold text-gray-800 mb-4">Announcements</h3>
                <ul className="space-y-4">
                    {announcements.slice(0, 3).map(a => (
                        <li key={a._id} className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                            <p className="font-semibold text-gray-800">{a.title}</p>
                            <p className="text-sm text-gray-600 truncate">{a.message}</p>
                        </li>
                    ))}
                </ul>
            </div>
          </aside>
        </div>
      </main>
    </div>
  );
}
