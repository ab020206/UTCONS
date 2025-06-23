'use client'

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { getToken } from '@/lib/auth';
import { ILearningPath } from '@/lib/models/LearningPath';

export default function LearningPathsPage() {
  const [learningPaths, setLearningPaths] = useState<ILearningPath[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    const fetchLearningPaths = async () => {
      try {
        const token = getToken();
        if (!token) {
          router.push('/login');
          return;
        }

        const response = await fetch('/api/learning-paths', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if (response.ok) {
          const data = await response.json();
          setLearningPaths(data.learningPaths);
        } else {
          setError('Failed to load learning paths');
        }
      } catch (err) {
        console.error('Error fetching learning paths:', err);
        setError('Failed to load learning paths');
      } finally {
        setIsLoading(false);
      }
    };

    fetchLearningPaths();
  }, [router]);

  const handleBack = () => {
    router.push('/dashboard/student');
  };

  const getInterestIcon = (interest: string) => {
    switch (interest) {
      case 'Technology': return '💻';
      case 'Art': return '🎨';
      case 'Science': return '🔬';
      case 'Mathematics': return '🧮';
      default: return '📚';
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-100 via-purple-100 to-pink-100 py-12 px-6 flex flex-col items-center justify-center">
        <div className="w-full max-w-4xl bg-white rounded-3xl shadow-2xl p-8 text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-700 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading Learning Paths...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-100 via-purple-100 to-pink-100 py-12 px-6 flex flex-col items-center justify-center">
        <div className="w-full max-w-4xl bg-white rounded-3xl shadow-2xl p-8 text-center">
          <p className="text-red-600">{error}</p>
          <button
            onClick={handleBack}
            className="mt-4 bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-lg font-medium transition"
          >
            ← Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-100 via-purple-100 to-pink-100 py-12 px-6">
      <div className="max-w-4xl mx-auto bg-white rounded-3xl shadow-2xl p-8 space-y-8">
        <div className="flex justify-between items-center border-b pb-5">
          <div>
            <h1 className="text-3xl font-extrabold text-purple-700">🗺️ Explore Learning Paths</h1>
            <p className="text-gray-500 text-sm mt-1">Discover curated paths to expand your knowledge</p>
          </div>
          <button
            onClick={handleBack}
            className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-lg font-medium transition transform hover:scale-105"
          >
            ← Back to Dashboard
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {learningPaths.map((path) => (
            <div key={String(path._id)} className="bg-gray-50 border border-gray-200 rounded-2xl p-6 shadow-sm transform hover:scale-105 transition-transform duration-300">
              <div className="flex items-start justify-between">
                <div>
                  <h2 className="text-2xl font-bold text-purple-800">{path.title}</h2>
                  <p className="text-gray-600 mt-1">{path.description}</p>
                </div>
                <div className="text-4xl ml-4">{getInterestIcon(path.interest)}</div>
              </div>
              <div className="mt-4">
                <span className="text-sm bg-purple-100 text-purple-700 px-3 py-1 rounded-full font-medium">
                  {path.interest}
                </span>
              </div>
              
              <div className="mt-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-3">Modules:</h3>
                <ul className="space-y-3">
                  {path.modules.map((module) => (
                    <li key={module.moduleId} className="flex items-center gap-3 bg-white p-3 rounded-lg border border-gray-200">
                      <span className="text-lg">▶️</span>
                      <div>
                        <p className="font-medium text-gray-800">{module.title}</p>
                        <p className="text-sm text-gray-500">{module.description}</p>
                      </div>
                      <div className="ml-auto text-sm bg-yellow-100 text-yellow-700 px-2 py-1 rounded-full font-semibold">
                        {module.xpValue} XP
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
} 