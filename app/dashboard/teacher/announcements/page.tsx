'use client'

import { useState, useEffect, FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { getToken } from '@/lib/auth';

interface Announcement {
    _id: string;
    title: string;
    message: string;
    date: string;
}

export default function AnnouncementsPage() {
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    fetchAnnouncements();
  }, []);

  const fetchAnnouncements = async () => {
    setIsLoading(true);
    try {
      const token = getToken();
      const response = await fetch('/api/teacher/announcements', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (!response.ok) throw new Error('Failed to fetch announcements');
      const data = await response.json();
      setAnnouncements(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);
    try {
      const token = getToken();
      const response = await fetch('/api/teacher/announcements', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ title, message })
      });
      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.message || 'Failed to create announcement');
      }
      setTitle('');
      setMessage('');
      fetchAnnouncements(); // Refresh list
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <header className="bg-white shadow-md">
        <div className="max-w-7xl mx-auto py-4 px-4 sm:px-6 lg:px-8 flex justify-between items-center">
          <h1 className="text-3xl font-extrabold text-indigo-700">Manage Announcements</h1>
          <button onClick={() => router.push('/dashboard/teacher')} className="text-indigo-600 hover:text-indigo-800 font-semibold transition">
            ← Back to Dashboard
          </button>
        </div>
      </header>
      <main className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8 grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Create Announcement Form */}
        <div className="lg:col-span-1 bg-white p-8 rounded-2xl shadow-lg h-fit">
          <h2 className="text-2xl font-bold text-gray-800 mb-6">Create New Announcement</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="title" className="block text-sm font-medium text-gray-700">Title</label>
              <input
                type="text"
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                required
              />
            </div>
            <div>
              <label htmlFor="message" className="block text-sm font-medium text-gray-700">Message</label>
              <textarea
                id="message"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                rows={4}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                required
              ></textarea>
            </div>
            {error && <p className="text-sm text-red-600">{error}</p>}
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-400 text-white font-bold py-2 px-4 rounded-lg transition"
            >
              {isSubmitting ? 'Submitting...' : 'Post Announcement'}
            </button>
          </form>
        </div>

        {/* Existing Announcements */}
        <div className="lg:col-span-2 bg-white p-8 rounded-2xl shadow-lg">
          <h2 className="text-2xl font-bold text-gray-800 mb-6">Existing Announcements</h2>
          {isLoading ? (
            <p>Loading announcements...</p>
          ) : (
            <ul className="space-y-4">
              {announcements.map((a) => (
                <li key={a._id} className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                  <h3 className="text-lg font-bold text-gray-900">{a.title}</h3>
                  <p className="text-gray-700 mt-1">{a.message}</p>
                  <p className="text-xs text-gray-500 mt-2">{new Date(a.date).toLocaleString()}</p>
                </li>
              ))}
            </ul>
          )}
        </div>
      </main>
    </div>
  );
} 