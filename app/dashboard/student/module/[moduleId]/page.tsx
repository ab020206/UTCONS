'use client'

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { getToken } from '@/lib/auth';
import { IModule } from '@/lib/models/LearningPath';
import confetti from 'canvas-confetti';

export default function ModulePage() {
  const [module, setModule] = useState<IModule | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isCompleting, setIsCompleting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const params = useParams();
  const moduleId = params.moduleId as string;

  useEffect(() => {
    if (!moduleId) return;

    const fetchModule = async () => {
      try {
        const token = getToken();
        if (!token) {
          router.push('/login');
          return;
        }

        const response = await fetch(`/api/module/${moduleId}`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if (response.ok) {
          const data = await response.json();
          setModule(data.module);
        } else {
          setError('Failed to load module');
        }
      } catch (err) {
        console.error('Error fetching module:', err);
        setError('Failed to load module');
      } finally {
        setIsLoading(false);
      }
    };

    fetchModule();
  }, [moduleId, router]);

  const handleCompleteModule = async () => {
    if (!module) return;
    setIsCompleting(true);

    try {
      const token = getToken();
      if (!token) {
        router.push('/login');
        return;
      }

      const response = await fetch('/api/student/progress', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          xpEarned: module.xpValue,
          moduleId: module.moduleId,
        }),
      });

      if (response.ok) {
        // Celebrate completion
        confetti({
          particleCount: 150,
          spread: 180,
          origin: { y: 0.6 },
          zIndex: 1000,
        });
        
        // Redirect back to analysis page after a delay
        setTimeout(() => {
          router.push('/dashboard/student/analysis');
        }, 3000);

      } else {
        const errorData = await response.json();
        setError(errorData.message || 'Failed to complete module');
        setIsCompleting(false);
      }
    } catch (err) {
      console.error('Error completing module:', err);
      setError('Failed to complete module');
      setIsCompleting(false);
    }
  };

  const handleBack = () => {
    router.back();
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-100 via-purple-100 to-pink-100 py-12 px-6 flex items-center justify-center">
        <div className="w-full max-w-2xl bg-white rounded-3xl shadow-2xl p-8 text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-700 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading Module...</p>
        </div>
      </div>
    );
  }

  if (error || !module) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-100 via-purple-100 to-pink-100 py-12 px-6 flex items-center justify-center">
        <div className="w-full max-w-2xl bg-white rounded-3xl shadow-2xl p-8 text-center">
          <p className="text-red-600 mb-4">{error || 'Could not load the module.'}</p>
          <button
            onClick={handleBack}
            className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-lg font-medium transition"
          >
            ← Go Back
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-100 via-purple-100 to-pink-100 py-12 px-6 flex items-center justify-center">
      <div className="w-full max-w-2xl bg-white rounded-3xl shadow-2xl p-8 space-y-8">
        <div className="flex justify-between items-center border-b pb-5">
          <div>
            <h1 className="text-3xl font-extrabold text-purple-700">{module.title}</h1>
            <p className="text-gray-500 text-sm mt-1">Interactive Learning Module</p>
          </div>
          <div className="bg-yellow-100 text-yellow-700 px-3 py-1 rounded-full font-semibold">
            {module.xpValue} XP
          </div>
        </div>
        
        <div className="prose lg:prose-xl text-gray-700">
          <p>{module.description}</p>
          {/* Dummy content to make it look like a real module */}
          <p>This is where the interactive content, video, or text for the module would be displayed. For now, we're focusing on the completion mechanism.</p>
          <p>Imagine a short quiz or a video player here!</p>
        </div>

        <button
          onClick={handleCompleteModule}
          disabled={isCompleting}
          className={`w-full bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 disabled:from-gray-300 disabled:to-gray-400 text-white px-6 py-3 rounded-xl font-semibold transition-all duration-300 transform hover:scale-105 disabled:hover:scale-100 shadow-lg ${
            isCompleting ? 'animate-pulse' : ''
          }`}
        >
          {isCompleting ? '🎉 Completing...' : '✅ Mark as Complete & Claim XP'}
        </button>
      </div>
    </div>
  );
} 