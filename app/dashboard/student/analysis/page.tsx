'use client'

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { getToken } from '@/lib/auth';
import confetti from 'canvas-confetti';

export default function StudentAnalysisPage() {
  const [analysis, setAnalysis] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [animateCards, setAnimateCards] = useState(false);
  const router = useRouter();

  // Fetch analysis data on component mount
  useEffect(() => {
    const fetchAnalysis = async () => {
      try {
        const token = getToken();
        if (!token) {
          router.push('/login');
          return;
        }

        const response = await fetch('/api/student/analysis', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if (response.ok) {
          const data = await response.json();
          setAnalysis(data.analysis);
          
          // Trigger animations after data loads
          setTimeout(() => setAnimateCards(true), 500);
          
          // Celebrate if both preferences and aspirations are set
          if (data.analysis.hasPreferences && data.analysis.hasParentAspiration) {
            confetti({
              particleCount: 40,
              spread: 70,
              origin: { y: 0.6 }
            });
          }
        } else {
          setError('Failed to load analysis data');
        }
      } catch (err) {
        console.error('Error fetching analysis:', err);
        setError('Failed to load analysis data');
      } finally {
        setIsLoading(false);
      }
    };

    fetchAnalysis();
  }, [router]);

  const handleBack = () => {
    router.push('/dashboard/student');
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-100 via-purple-100 to-pink-100 py-12 px-6 flex flex-col items-center justify-center">
        <div className="w-full max-w-2xl bg-white rounded-3xl shadow-2xl p-8 text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-700 mx-auto mb-4"></div>
          <p className="text-gray-600">Analyzing your learning profile...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-100 via-purple-100 to-pink-100 py-12 px-6 flex flex-col items-center justify-center">
        <div className="w-full max-w-2xl bg-white rounded-3xl shadow-2xl p-8 text-center">
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

  if (!analysis) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-100 via-purple-100 to-pink-100 py-12 px-6 flex flex-col items-center justify-center">
        <div className="w-full max-w-2xl bg-white rounded-3xl shadow-2xl p-8 text-center">
          <div className="text-4xl mb-4">🎯</div>
          <p className="text-gray-600">No analysis data available. Please complete your preferences first.</p>
          <button
            onClick={() => router.push('/preferences')}
            className="mt-4 bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg font-medium transition"
          >
            Go to Preferences
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-100 via-purple-100 to-pink-100 py-12 px-6 flex flex-col items-center justify-center">
      <div className="w-full max-w-2xl bg-white rounded-3xl shadow-2xl p-8 space-y-8">
        {/* Header */}
        <div className="flex justify-between items-center border-b pb-5">
          <div>
            <h1 className="text-3xl font-extrabold text-purple-700">🔍 Personalized Analysis & Recommendations</h1>
            <p className="text-gray-500 text-sm mt-1">Your AI-powered learning roadmap</p>
          </div>
          <button
            onClick={handleBack}
            className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-lg font-medium transition"
          >
            ← Back
          </button>
        </div>

        <div className={`bg-blue-50 border border-blue-300 rounded-xl p-6 transform transition-all duration-1000 ${
          animateCards ? 'scale-105' : 'scale-100'
        }`}>
          <h2 className="text-xl font-semibold text-blue-800 mb-4 flex items-center">
            👤 Your Profile Summary
            <span className="ml-2 text-sm bg-blue-100 text-blue-700 px-2 py-1 rounded-full">
              {(analysis.interests?.length > 0 ? 1 : 0) + (analysis.learningStyle ? 1 : 0) + (analysis.parentAspiration ? 1 : 0)}/3 Complete
            </span>
          </h2>
          <div className="space-y-2">
            <p className="text-gray-700 flex items-center">
              <span className="mr-2">🎨</span>
              <strong>Interests:</strong> {analysis.interests.length > 0 ? analysis.interests.join(', ') : 'None selected'}
            </p>
            <p className="text-gray-700 flex items-center">
              <span className="mr-2">🧠</span>
              <strong>Learning Style:</strong> {analysis.learningStyle || 'Not specified'}
            </p>
            <p className="text-gray-700 flex items-center">
              <span className="mr-2">🌟</span>
              <strong>Parent Aspiration:</strong> {analysis.parentAspiration || 'Not specified'}
            </p>
            {analysis.parentName && (
              <p className="text-gray-700 flex items-center">
                <span className="mr-2">👨‍👩‍👧</span>
                <strong>Linked Parent:</strong> {analysis.parentName}
              </p>
            )}
          </div>
        </div>
        
        <div className={`bg-green-50 border border-green-300 rounded-xl p-6 transform transition-all duration-1000 delay-200 ${
          animateCards ? 'scale-105' : 'scale-100'
        }`}>
          <h2 className="text-xl font-semibold text-green-800 mb-4 flex items-center">
            🗺️ Recommended Modules
          </h2>
          <ul className="space-y-3">
            {analysis.recommendedPath.map((item: any, idx: number) => (
              <li key={idx} className="bg-white p-4 rounded-lg border border-green-200 transform hover:scale-105 transition-transform duration-300">
                <Link href={`/dashboard/student/module/${item.moduleId}`} className="flex items-center justify-between">
                  <div>
                    <p className="font-semibold text-green-900">{item.step}</p>
                    <p className="text-sm text-gray-600">{item.description}</p>
                  </div>
                  <span className="text-xl text-green-600">▶️</span>
                </Link>
              </li>
            ))}
          </ul>
          <div className="mt-4 text-center">
              <Link href="/dashboard/student/learning-paths" className="text-purple-600 hover:text-purple-800 font-semibold transition">
                Explore all Learning Paths →
              </Link>
          </div>
        </div>

        <div className={`bg-purple-50 border border-purple-300 rounded-xl p-6 transform transition-all duration-1000 delay-400 ${
          animateCards ? 'scale-105' : 'scale-100'
        }`}>
          <h2 className="text-xl font-semibold text-purple-800 mb-4 flex items-center">
            🤖 AI Insights
            <span className="ml-2 text-sm bg-purple-100 text-purple-700 px-2 py-1 rounded-full">
              Personalized
            </span>
          </h2>
          <p className="text-gray-700 leading-relaxed">{analysis.insights}</p>
        </div>

        <div className={`bg-yellow-50 border border-yellow-300 rounded-xl p-6 transform transition-all duration-1000 delay-600 ${
          animateCards ? 'scale-105' : 'scale-100'
        }`}>
          <h2 className="text-xl font-semibold text-yellow-800 mb-4 flex items-center">
            🚀 Next Steps
            <span className="ml-2 text-sm bg-yellow-100 text-yellow-700 px-2 py-1 rounded-full">
              Action Items
            </span>
          </h2>
          <div className="space-y-4">
            {!analysis.hasPreferences && (
              <div className="flex items-center justify-between bg-white p-4 rounded-lg border border-yellow-200">
                <div>
                  <p className="text-gray-700 font-medium">Complete your preferences to get personalized recommendations.</p>
                  <p className="text-sm text-gray-500 mt-1">This will unlock your full learning potential!</p>
                </div>
                <button
                  onClick={() => router.push('/preferences')}
                  className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg font-medium transition transform hover:scale-105"
                >
                  🎯 Set Preferences
                </button>
              </div>
            )}
            {analysis.hasPreferences && !analysis.hasParentAspiration && (
              <div className="flex items-center justify-between bg-white p-4 rounded-lg border border-yellow-200">
                <div>
                  <p className="text-gray-700 font-medium">Ask your parent to set their career aspiration for you.</p>
                  <p className="text-sm text-gray-500 mt-1">This will enhance your personalized recommendations.</p>
                </div>
                <span className="text-yellow-600 text-sm">⏳ Pending</span>
              </div>
            )}
            {analysis.hasPreferences && analysis.hasParentAspiration && (
              <div className="bg-white p-4 rounded-lg border border-green-200">
                <p className="text-gray-700 font-medium flex items-center">
                  <span className="mr-2">🎉</span>
                  Start with the first incomplete step in your recommended learning path.
                </p>
                <p className="text-sm text-green-600 mt-1">You're all set for success!</p>
              </div>
            )}
          </div>
        </div>

        {/* Status Indicators */}
        <div className="grid grid-cols-2 gap-4">
          <div className={`p-6 rounded-xl transform transition-all duration-1000 delay-800 ${
            animateCards ? 'scale-105' : 'scale-100'
          } ${analysis.hasPreferences ? 'bg-green-50 border border-green-300' : 'bg-red-50 border border-red-300'}`}>
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-semibold text-lg">Preferences Status</h3>
              <span className="text-2xl">{analysis.hasPreferences ? '✅' : '❌'}</span>
            </div>
            <p className={analysis.hasPreferences ? 'text-green-700 font-medium' : 'text-red-700 font-medium'}>
              {analysis.hasPreferences ? 'Complete' : 'Not Set'}
            </p>
            {analysis.hasPreferences && (
              <p className="text-sm text-green-600 mt-1">Great job! 🎉</p>
            )}
          </div>
          <div className={`p-6 rounded-xl transform transition-all duration-1000 delay-1000 ${
            animateCards ? 'scale-105' : 'scale-100'
          } ${analysis.hasParentAspiration ? 'bg-green-50 border border-green-300' : 'bg-yellow-50 border border-yellow-300'}`}>
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-semibold text-lg">Parent Aspiration</h3>
              <span className="text-2xl">{analysis.hasParentAspiration ? '✅' : '⏳'}</span>
            </div>
            <p className={analysis.hasParentAspiration ? 'text-green-700 font-medium' : 'text-yellow-700 font-medium'}>
              {analysis.hasParentAspiration ? 'Set' : 'Pending'}
            </p>
            {analysis.hasParentAspiration && (
              <p className="text-sm text-green-600 mt-1">Perfect! 🌟</p>
            )}
          </div>
        </div>

        {/* Motivation Card */}
        <div className="bg-gradient-to-r from-purple-50 to-pink-50 border border-purple-300 rounded-xl p-6 text-center">
          <h3 className="text-lg font-semibold text-purple-800 mb-2">💪 You're Doing Great!</h3>
          <p className="text-gray-700">
            {analysis.hasPreferences && analysis.hasParentAspiration 
              ? "You have a complete profile! Your personalized learning journey is ready to begin. 🚀"
              : analysis.hasPreferences 
                ? "You're on the right track! Complete your profile to unlock full personalization. 🎯"
                : "Start your journey by setting your preferences. Every step counts! 🌟"
            }
          </p>
        </div>
      </div>
    </div>
  );
} 