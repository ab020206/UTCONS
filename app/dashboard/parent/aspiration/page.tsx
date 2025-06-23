'use client'

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { getToken } from '@/lib/auth';
import confetti from 'canvas-confetti';

const dummyAspirations = [
  'Doctor', 'Engineer', 'Artist', 'Scientist', 'Entrepreneur', 'Sportsperson', 'Musician', 'Other'
];

export default function ParentAspirationPage() {
  const [selectedAspiration, setSelectedAspiration] = useState('');
  const [customAspiration, setCustomAspiration] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [animateProgress, setAnimateProgress] = useState(false);
  const router = useRouter();

  // Fetch existing aspiration on component mount
  useEffect(() => {
    const fetchAspiration = async () => {
      try {
        const token = getToken();
        if (!token) {
          router.push('/login');
          return;
        }

        const response = await fetch('/api/parent/aspiration', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if (response.ok) {
          const data = await response.json();
          if (data.aspiration) {
            // Check if it's a custom aspiration
            if (dummyAspirations.includes(data.aspiration)) {
              setSelectedAspiration(data.aspiration);
            } else {
              setSelectedAspiration('Other');
              setCustomAspiration(data.aspiration);
            }
          }
        }
      } catch (err) {
        console.error('Error fetching aspiration:', err);
        setError('Failed to load existing aspiration');
      } finally {
        setIsLoading(false);
      }
    };

    fetchAspiration();
  }, [router]);

  const handleSelect = (asp: string) => {
    setSelectedAspiration(asp);
    if (asp !== 'Other') {
      setCustomAspiration('');
      // Trigger celebration animation
      confetti({
        particleCount: 30,
        spread: 60,
        origin: { y: 0.6 }
      });
    }
  };

  const handleSubmit = async () => {
    if (selectedAspiration && (selectedAspiration !== 'Other' || customAspiration)) {
      setIsSubmitted(true);
      setError(null);
      
      // Big celebration animation
      confetti({
        particleCount: 80,
        spread: 120,
        origin: { y: 0.6 }
      });
      
      try {
        const token = getToken();
        if (!token) {
          setError('No authentication token found');
          return;
        }

        const aspirationValue = selectedAspiration === 'Other' ? customAspiration : selectedAspiration;

        const response = await fetch('/api/parent/aspiration', {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({
            aspiration: aspirationValue
          })
        });

        if (response.ok) {
          // Success - redirect after 3 seconds
          setTimeout(() => {
            router.push('/dashboard/parent');
          }, 3000);
        } else {
          const errorData = await response.json();
          setError(errorData.message || 'Failed to save aspiration');
          setIsSubmitted(false);
        }
      } catch (err) {
        console.error('Error saving aspiration:', err);
        setError('Failed to save aspiration');
        setIsSubmitted(false);
      }
    }
  };

  const handleBack = () => {
    router.push('/dashboard/parent');
  };

  // Calculate completion percentage
  const completionPercentage = selectedAspiration ? 100 : 0;

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#f3f4ff] to-[#e6f7ff] py-12 px-6 flex flex-col items-center justify-center">
        <div className="w-full max-w-lg bg-white rounded-3xl shadow-2xl p-8 text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-700 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your aspiration...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#f3f4ff] to-[#e6f7ff] py-12 px-6 flex flex-col items-center justify-center">
      <div className="w-full max-w-lg bg-white rounded-3xl shadow-2xl p-8 space-y-8">
        {/* Header */}
        <div className="flex justify-between items-center border-b pb-5">
          <div>
            <h1 className="text-3xl font-extrabold text-[#6200ea]">🌟 Parent Aspiration Form</h1>
            <p className="text-gray-500 text-sm mt-1">Help shape your child's future</p>
          </div>
          <button
            onClick={handleBack}
            className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-lg font-medium transition"
          >
            ← Back
          </button>
        </div>

        {/* Progress Bar */}
        <div className="bg-gray-200 rounded-full h-3 overflow-hidden">
          <div 
            className={`h-full bg-gradient-to-r from-pink-500 to-purple-500 transition-all duration-1000 ease-out ${
              animateProgress ? 'animate-pulse' : ''
            }`}
            style={{ width: `${completionPercentage}%` }}
          ></div>
        </div>
        <p className="text-center text-sm text-gray-600">
          {completionPercentage}% Complete - {selectedAspiration ? 'Aspiration selected' : 'No aspiration selected'}
        </p>
        
        {error && (
          <div className="bg-red-50 border-l-4 border-red-400 p-4 rounded-lg shadow-sm animate-shake">
            <p className="text-red-700">{error}</p>
          </div>
        )}
        
        {!isSubmitted ? (
          <>
            <div>
              <h2 className="text-xl font-semibold text-[#6200ea] mb-4 flex items-center">
                🎯 What is your aspiration for your child's career?
                {selectedAspiration && <span className="ml-2 text-sm bg-green-100 text-green-700 px-2 py-1 rounded-full">✓ Selected</span>}
              </h2>
              <div className="flex flex-wrap gap-3 mb-6">
                {dummyAspirations.map((asp) => (
                  <button
                    key={asp}
                    onClick={() => handleSelect(asp)}
                    className={`px-4 py-2 rounded-xl border transition-all duration-300 font-medium transform hover:scale-105 ${
                      selectedAspiration === asp 
                        ? 'bg-pink-500 text-white shadow-lg scale-105' 
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200 hover:shadow-md'
                    }`}
                  >
                    {asp}
                  </button>
                ))}
              </div>
              {selectedAspiration === 'Other' && (
                <div className="transform hover:scale-105 transition-transform duration-300">
                  <input
                    type="text"
                    value={customAspiration}
                    onChange={(e) => setCustomAspiration(e.target.value)}
                    placeholder="Enter your aspiration"
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-pink-300 focus:border-transparent"
                  />
                </div>
              )}
            </div>
            <div className="bg-pink-50 border border-pink-300 rounded-xl p-6 transform hover:scale-105 transition-transform duration-300">
              <h3 className="text-lg font-semibold text-pink-800 mb-3">✨ Your Aspiration:</h3>
              <p className="text-gray-700">
                {selectedAspiration === 'Other' ? customAspiration || 'Not specified' : selectedAspiration || 'Not selected'}
              </p>
            </div>
            <button
              onClick={handleSubmit}
              disabled={!selectedAspiration || (selectedAspiration === 'Other' && !customAspiration)}
              className="w-full bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 disabled:from-gray-300 disabled:to-gray-400 text-white px-6 py-3 rounded-xl font-semibold transition-all duration-300 transform hover:scale-105 disabled:hover:scale-100 shadow-lg"
            >
              💾 Save Aspiration
            </button>
          </>
        ) : (
          <div className="text-center animate-bounce">
            <div className="text-6xl mb-4 animate-pulse">✅</div>
            <h2 className="text-2xl font-bold text-green-700 mb-2">🎉 Aspiration Saved!</h2>
            <p className="text-gray-600">Redirecting to dashboard...</p>
            <div className="mt-4 text-sm text-gray-500">
              <p>🌟 Your aspiration: {selectedAspiration === 'Other' ? customAspiration : selectedAspiration}</p>
              <p>👨‍👩‍👧 This will help personalize your child's learning journey</p>
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