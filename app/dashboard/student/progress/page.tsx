'use client'

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { getToken } from '@/lib/auth';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';
import confetti from 'canvas-confetti';

const dummyAchievements = [
  { name: 'First Module', earned: true, date: '2024-01-15', icon: '🎯' },
  { name: '5 Day Streak', earned: true, date: '2024-01-20', icon: '🔥' },
  { name: '100 XP Milestone', earned: true, date: '2024-01-22', icon: '⭐' },
  { name: 'Perfect Week', earned: false, date: null, icon: '🏆' },
  { name: '500 XP Milestone', earned: false, date: null, icon: '💎' },
];

export default function StudentProgressPage() {
  const [progress, setProgress] = useState<any[]>([]);
  const [achievements] = useState(dummyAchievements);
  const [selectedChart, setSelectedChart] = useState('xp');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [progressData, setProgressData] = useState<any>(null);
  const [animateMetrics, setAnimateMetrics] = useState(false);
  const router = useRouter();

  // Fetch real progress data
  useEffect(() => {
    const fetchProgress = async () => {
      try {
        const token = getToken();
        if (!token) {
          router.push('/login');
          return;
        }

        const response = await fetch('/api/student/dashboard', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if (response.ok) {
          const data = await response.json();
          setProgressData(data.user);
          setProgress(data.weeklyProgress || []);
          
          // Trigger animation after data loads
          setTimeout(() => setAnimateMetrics(true), 500);
        } else {
          setError('Failed to load progress data');
        }
      } catch (err) {
        console.error('Error fetching progress:', err);
        setError('Failed to load progress data');
      } finally {
        setIsLoading(false);
      }
    };

    fetchProgress();
  }, [router]);
  
  const totalXP = progressData?.xp || 0;
  const totalModules = progressData?.completedModules?.length || 0;
  const streak = progressData?.streak || 0;
  const averageXP = progress.length > 0 ? Math.round(progress.reduce((sum, p) => sum + p.xp, 0) / progress.length) : 0;

  // Check for milestone achievements
  useEffect(() => {
    if (totalXP >= 100 && totalXP < 200) {
      confetti({
        particleCount: 30,
        spread: 60,
        origin: { y: 0.6 }
      });
    } else if (totalXP >= 500) {
      confetti({
        particleCount: 50,
        spread: 80,
        origin: { y: 0.6 }
      });
    }
  }, [totalXP]);

  const handleBack = () => {
    router.push('/dashboard/student');
  };

  const getBadge = (xp: number) => {
    if (xp >= 1000) return { name: '🏆 Legend', color: 'text-purple-600' };
    if (xp >= 500) return { name: '🥇 Champion', color: 'text-yellow-600' };
    if (xp >= 250) return { name: '🥈 Explorer', color: 'text-gray-600' };
    if (xp >= 100) return { name: '🥉 Learner', color: 'text-orange-600' };
    return { name: '🎯 Newbie', color: 'text-green-600' };
  };

  const badge = getBadge(totalXP);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-100 via-purple-100 to-pink-100 py-12 px-6 flex flex-col items-center justify-center">
        <div className="w-full max-w-4xl bg-white rounded-3xl shadow-2xl p-8 text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-700 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your progress...</p>
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
    <div className="min-h-screen bg-gradient-to-br from-blue-100 via-purple-100 to-pink-100 py-12 px-6 flex flex-col items-center justify-center">
      <div className="w-full max-w-4xl bg-white rounded-3xl shadow-2xl p-8 space-y-8">
        {/* Header */}
        <div className="flex justify-between items-center border-b pb-5">
          <div>
            <h1 className="text-3xl font-extrabold text-purple-700">📊 Progress Tracking</h1>
            <p className="text-gray-500 text-sm mt-1">Track your learning journey and achievements</p>
          </div>
          <button
            onClick={handleBack}
            className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-lg font-medium transition"
          >
            ← Back
          </button>
        </div>

        {/* Current Badge */}
        <div className="bg-gradient-to-r from-purple-50 to-pink-50 border border-purple-300 rounded-xl p-6 text-center">
          <div className="text-4xl mb-2">{badge.name.split(' ')[0]}</div>
          <h2 className={`text-xl font-bold ${badge.color}`}>{badge.name}</h2>
          <p className="text-gray-600 mt-1">Your current achievement level</p>
        </div>
        
        {/* Progress Metrics */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className={`bg-yellow-50 border border-yellow-300 rounded-xl p-6 text-center shadow-sm transform transition-all duration-1000 ${
            animateMetrics ? 'scale-105' : 'scale-100'
          }`}>
            <div className="text-3xl mb-2">⭐</div>
            <h2 className="text-lg font-semibold text-yellow-700">Total XP</h2>
            <p className="text-2xl font-bold text-yellow-800 animate-pulse">{totalXP}</p>
          </div>
          <div className={`bg-purple-50 border border-purple-300 rounded-xl p-6 text-center shadow-sm transform transition-all duration-1000 delay-200 ${
            animateMetrics ? 'scale-105' : 'scale-100'
          }`}>
            <div className="text-3xl mb-2">🔥</div>
            <h2 className="text-lg font-semibold text-purple-700">Current Streak</h2>
            <p className="text-2xl font-bold text-purple-800">{streak} days</p>
          </div>
          <div className={`bg-blue-50 border border-blue-300 rounded-xl p-6 text-center shadow-sm transform transition-all duration-1000 delay-400 ${
            animateMetrics ? 'scale-105' : 'scale-100'
          }`}>
            <div className="text-3xl mb-2">📚</div>
            <h2 className="text-lg font-semibold text-blue-700">Modules Completed</h2>
            <p className="text-2xl font-bold text-blue-800">{totalModules}</p>
          </div>
          <div className={`bg-green-50 border border-green-300 rounded-xl p-6 text-center shadow-sm transform transition-all duration-1000 delay-600 ${
            animateMetrics ? 'scale-105' : 'scale-100'
          }`}>
            <div className="text-3xl mb-2">📈</div>
            <h2 className="text-lg font-semibold text-green-700">Avg XP/Day</h2>
            <p className="text-2xl font-bold text-green-800">{averageXP}</p>
          </div>
        </div>

        {/* Chart Selector */}
        <div className="bg-gray-50 border border-gray-300 rounded-xl p-6">
          <h3 className="font-semibold text-gray-700 mb-4 text-lg">📊 Select Chart Type:</h3>
          <div className="flex gap-3">
            <button
              onClick={() => setSelectedChart('xp')}
              className={`px-4 py-2 rounded-xl transition-all duration-300 font-medium transform hover:scale-105 ${
                selectedChart === 'xp' 
                  ? 'bg-blue-500 text-white shadow-lg scale-105' 
                  : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50 hover:shadow-md'
              }`}
            >
              📈 XP Progress
            </button>
            <button
              onClick={() => setSelectedChart('modules')}
              className={`px-4 py-2 rounded-xl transition-all duration-300 font-medium transform hover:scale-105 ${
                selectedChart === 'modules' 
                  ? 'bg-blue-500 text-white shadow-lg scale-105' 
                  : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50 hover:shadow-md'
              }`}
            >
              📚 Modules Completed
            </button>
          </div>
        </div>

        {/* Progress Chart */}
        <div className="bg-white border border-gray-300 rounded-xl p-6 shadow-sm transform hover:scale-105 transition-transform duration-300">
          <h4 className="text-xl font-bold text-purple-800 mb-4">
            {selectedChart === 'xp' ? '📈 XP Progress This Week' : '📚 Modules Completed This Week'}
          </h4>
          {progress.length > 0 ? (
            <ResponsiveContainer width="100%" height={200}>
              {selectedChart === 'xp' ? (
                <LineChart data={progress}>
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: '#f8fafc', 
                      border: '1px solid #e2e8f0',
                      borderRadius: '8px'
                    }}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="xp" 
                    stroke="#f59e42" 
                    strokeWidth={3}
                    dot={{ fill: '#f59e42', strokeWidth: 2, r: 4 }}
                  />
                </LineChart>
              ) : (
                <BarChart data={progress.map(p => ({ ...p, modules: Math.floor(p.xp / 10) }))}>
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: '#f8fafc', 
                      border: '1px solid #e2e8f0',
                      borderRadius: '8px'
                    }}
                  />
                  <Bar dataKey="modules" fill="#8b5cf6" radius={[4, 4, 0, 0]} />
                </BarChart>
              )}
            </ResponsiveContainer>
          ) : (
            <div className="h-[200px] flex items-center justify-center text-gray-500">
              <div className="text-center">
                <div className="text-4xl mb-2">🎯</div>
                <p>No progress data available yet. Start learning to see your progress!</p>
              </div>
            </div>
          )}
        </div>

        {/* Achievements */}
        <div className="bg-white border border-gray-300 rounded-xl p-6 shadow-sm">
          <h4 className="text-xl font-bold text-green-800 mb-4 flex items-center">
            🏆 Achievements
            <span className="ml-2 text-sm bg-green-100 text-green-700 px-2 py-1 rounded-full">
              {achievements.filter(a => a.earned).length}/{achievements.length}
            </span>
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {achievements.map((achievement, idx) => (
              <div key={idx} className={`p-4 rounded-xl border transform hover:scale-105 transition-all duration-300 ${
                achievement.earned 
                  ? 'bg-green-50 border-green-300 shadow-md' 
                  : 'bg-gray-50 border-gray-300'
              }`}>
                <div className="flex items-center gap-3">
                  <span className="text-3xl">{achievement.icon}</span>
                  <div>
                    <p className={`font-medium text-lg ${
                      achievement.earned ? 'text-green-800' : 'text-gray-600'
                    }`}>
                      {achievement.name}
                    </p>
                    {achievement.earned ? (
                      <p className="text-sm text-green-600 mt-1">✅ Earned: {achievement.date}</p>
                    ) : (
                      <p className="text-sm text-gray-500 mt-1">🔒 Keep learning to unlock!</p>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Motivation Message */}
        <div className="bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-300 rounded-xl p-6 text-center">
          <h3 className="text-lg font-semibold text-blue-800 mb-2">💪 Keep Going!</h3>
          <p className="text-gray-700">
            {streak > 5 
              ? `Amazing! You've maintained a ${streak}-day streak! 🔥` 
              : streak > 0 
                ? `Great start! You're on a ${streak}-day streak. Keep it up! 💪`
                : "Start your learning journey today to build your streak! 🚀"
            }
          </p>
        </div>
      </div>
    </div>
  );
} 