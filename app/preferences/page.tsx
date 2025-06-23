'use client'

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { getToken, parseToken } from '@/lib/auth';
import confetti from 'canvas-confetti';

const dummyInterests = [
  'Mathematics', 'Science', 'Art', 'Music', 'Sports', 'Technology', 'Literature', 'History'
];
const dummyStyles = ['Visual', 'Auditory', 'Kinesthetic', 'Reading/Writing'];

export default function PreferencesPage() {
  const [selectedInterests, setSelectedInterests] = useState<string[]>([]);
  const [selectedStyle, setSelectedStyle] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isFirstTime, setIsFirstTime] = useState(false);
  const [animateProgress, setAnimateProgress] = useState(false);
  const router = useRouter();

  // Fetch existing preferences on component mount
  useEffect(() => {
    const fetchPreferences = async () => {
      try {
        const token = getToken();
        if (!token) {
          router.push('/login');
          return;
        }

        // Check if this is first time setup
        const user = parseToken(token);
        if (user?.firstTimeLogin) {
          setIsFirstTime(true);
        }

        const response = await fetch('/api/user/preferences', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if (response.ok) {
          const data = await response.json();
          if (data.preferences) {
            setSelectedInterests(data.preferences.interests || []);
            setSelectedStyle(data.preferences.style || '');
          }
        }
      } catch (err) {
        console.error('Error fetching preferences:', err);
        setError('Failed to load existing preferences');
      } finally {
        setIsLoading(false);
      }
    };

    fetchPreferences();
  }, [router]);

  const toggleInterest = (interest: string) => {
    setSelectedInterests((prev) => {
      const newInterests = prev.includes(interest)
        ? prev.filter((i) => i !== interest)
        : [...prev, interest];
      
      // Trigger animation when reaching milestones
      if (newInterests.length === 3 || newInterests.length === 5) {
        setAnimateProgress(true);
        setTimeout(() => setAnimateProgress(false), 1000);
      }
      
      return newInterests;
    });
  };

  const handleStyleSelect = (style: string) => {
    setSelectedStyle(style);
    // Trigger celebration animation
    confetti({
      particleCount: 50,
      spread: 70,
      origin: { y: 0.6 }
    });
  };

  const handleSubmit = async () => {
    if (selectedInterests.length > 0 && selectedStyle) {
      setIsSubmitted(true);
      setError(null);
      
      // Big celebration animation
      confetti({
        particleCount: 100,
        spread: 160,
        origin: { y: 0.6 }
      });
      
      try {
        const token = getToken();
        if (!token) {
          setError('No authentication token found');
          return;
        }

        const response = await fetch('/api/user/preferences', {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({
            interests: selectedInterests,
            style: selectedStyle
          })
        });

        if (response.ok) {
          // Success - redirect after 3 seconds
          setTimeout(() => {
            router.push('/dashboard/student');
          }, 3000);
        } else {
          const errorData = await response.json();
          setError(errorData.message || 'Failed to save preferences');
          setIsSubmitted(false);
        }
      } catch (err) {
        console.error('Error saving preferences:', err);
        setError('Failed to save preferences');
        setIsSubmitted(false);
      }
    }
  };

  const handleBack = () => {
    router.push('/dashboard/student');
  };

  // Calculate completion percentage
  const completionPercentage = ((selectedInterests.length > 0 ? 1 : 0) + (selectedStyle ? 1 : 0)) * 50;

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-100 via-purple-100 to-pink-100 py-12 px-6 flex flex-col items-center justify-center">
        <div className="w-full max-w-lg bg-white rounded-3xl shadow-2xl p-8 text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-700 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your preferences...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-100 via-purple-100 to-pink-100 py-12 px-6 flex flex-col items-center justify-center">
      <div className="w-full max-w-lg bg-white rounded-3xl shadow-2xl p-8 space-y-8">
        {/* Header */}
        <div className="flex justify-between items-center border-b pb-5">
          <div>
            <h1 className="text-3xl font-extrabold text-purple-700">
              {isFirstTime ? '🎯 Welcome! Set Your Preferences' : '🎯 Edit Your Preferences'}
            </h1>
            {isFirstTime && (
              <p className="text-gray-500 text-sm mt-1">Help us personalize your learning experience</p>
            )}
          </div>
          {!isFirstTime && (
            <button
              onClick={handleBack}
              className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-lg font-medium transition"
            >
              ← Back
            </button>
          )}
        </div>

        {/* Progress Bar */}
        <div className="bg-gray-200 rounded-full h-3 overflow-hidden">
          <div 
            className={`h-full bg-gradient-to-r from-purple-500 to-pink-500 transition-all duration-1000 ease-out ${
              animateProgress ? 'animate-pulse' : ''
            }`}
            style={{ width: `${completionPercentage}%` }}
          ></div>
        </div>
        <p className="text-center text-sm text-gray-600">
          {completionPercentage}% Complete - {selectedInterests.length} interests, {selectedStyle ? '1' : '0'} learning style
        </p>
        
        {error && (
          <div className="bg-red-50 border-l-4 border-red-400 p-4 rounded-lg shadow-sm animate-shake">
            <p className="text-red-700">{error}</p>
          </div>
        )}
        
        {!isSubmitted ? (
          <>
            <div>
              <h2 className="text-xl font-semibold text-purple-800 mb-4 flex items-center">
                🎨 Select your interests: 
                <span className="ml-2 text-sm bg-purple-100 text-purple-700 px-2 py-1 rounded-full">
                  {selectedInterests.length}/8
                </span>
              </h2>
              <div className="flex flex-wrap gap-3">
                {dummyInterests.map((interest) => (
                  <button
                    key={interest}
                    onClick={() => toggleInterest(interest)}
                    className={`px-4 py-2 rounded-xl border transition-all duration-300 font-medium transform hover:scale-105 ${
                      selectedInterests.includes(interest) 
                        ? 'bg-purple-500 text-white shadow-lg scale-105' 
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200 hover:shadow-md'
                    }`}
                  >
                    {interest}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <h2 className="text-xl font-semibold text-purple-800 mb-4 flex items-center">
                🧠 Preferred learning style:
                {selectedStyle && <span className="ml-2 text-sm bg-green-100 text-green-700 px-2 py-1 rounded-full">✓ Selected</span>}
              </h2>
              <div className="flex flex-wrap gap-3">
                {dummyStyles.map((style) => (
                  <button
                    key={style}
                    onClick={() => handleStyleSelect(style)}
                    className={`px-4 py-2 rounded-xl border transition-all duration-300 font-medium transform hover:scale-105 ${
                      selectedStyle === style 
                        ? 'bg-blue-500 text-white shadow-lg scale-105' 
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200 hover:shadow-md'
                    }`}
                  >
                    {style}
                  </button>
                ))}
              </div>
            </div>
            <div className="bg-blue-50 border border-blue-300 rounded-xl p-6 transform hover:scale-105 transition-transform duration-300">
              <h3 className="text-lg font-semibold text-blue-800 mb-3">✨ Your Selection:</h3>
              <p className="text-gray-700"><strong>Interests:</strong> {selectedInterests.length > 0 ? selectedInterests.join(', ') : 'None selected'}</p>
              <p className="text-gray-700 mt-2"><strong>Learning Style:</strong> {selectedStyle || 'None selected'}</p>
            </div>
            <button
              onClick={handleSubmit}
              disabled={selectedInterests.length === 0 || !selectedStyle}
              className="w-full bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 disabled:from-gray-300 disabled:to-gray-400 text-white px-6 py-3 rounded-xl font-semibold transition-all duration-300 transform hover:scale-105 disabled:hover:scale-100 shadow-lg"
            >
              {isFirstTime ? '🚀 Save & Continue to Dashboard' : '💾 Save Preferences'}
            </button>
          </>
        ) : (
          <div className="text-center animate-bounce">
            <div className="text-6xl mb-4 animate-pulse">✅</div>
            <h2 className="text-2xl font-bold text-green-700 mb-2">
              {isFirstTime ? '🎉 Welcome to JioWorld!' : '🎉 Preferences Saved!'}
            </h2>
            <p className="text-gray-600">
              {isFirstTime ? 'Your preferences have been saved. Redirecting to your dashboard...' : 'Your preferences have been updated successfully.'}
            </p>
            <div className="mt-4 text-sm text-gray-500">
              <p>🎯 {selectedInterests.length} interests selected</p>
              <p>🧠 {selectedStyle} learning style configured</p>
            </div>
          </div>
        )}
      </div>

      <style jsx>{`
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          25% { transform: translateX(-5px); }
          75% { transform: translateX(5px); }
        }
        .animate-shake {
          animation: shake 0.5s ease-in-out;
        }
      `}</style>
    </div>
  );
} 