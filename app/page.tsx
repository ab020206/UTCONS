'use client'

import { useEffect, useState } from 'react'
import { getToken, logout } from '@/lib/auth'
import { useRouter } from 'next/navigation'

const roles = ['Student', 'Teacher', 'Organisation', 'Parent']
const languages = ['English (USA)', 'हिन्दी', 'मराठी']

const translations: Record<string, Record<string, string>> = {
  'English (USA)': {
    createAccount: 'Create Account',
    registerNow: 'Register Now',
    alreadyHave: 'Already have an account?',
    loginHere: 'Login here',
    enterEmail: 'Enter your email',
    createPassword: 'Create a password',
    selectStudent: 'Select linked student',
    noStudents: '⚠️ No students available to link.',
  },
  'हिन्दी': {
    createAccount: 'खाता बनाएं',
    registerNow: 'रजिस्टर करें',
    alreadyHave: 'पहले से खाता है?',
    loginHere: 'यहां लॉगिन करें',
    enterEmail: 'अपना ईमेल दर्ज करें',
    createPassword: 'पासवर्ड बनाएं',
    selectStudent: 'जुड़ा छात्र चुनें',
    noStudents: '⚠️ लिंक करने के लिए कोई छात्र उपलब्ध नहीं है।',
  },
  'मराठी': {
    createAccount: 'खाते तयार करा',
    registerNow: 'नोंदणी करा',
    alreadyHave: 'आधीच खाते आहे?',
    loginHere: 'येथे लॉगिन करा',
    enterEmail: 'तुमचा ईमेल टाका',
    createPassword: 'पासवर्ड तयार करा',
    selectStudent: 'जोडलेला विद्यार्थी निवडा',
    noStudents: '⚠️ लिंक करण्यासाठी विद्यार्थी उपलब्ध नाहीत.',
  },
}

interface Student {
  _id: string
  email: string
}

export default function Home() {
  const router = useRouter()
  const [selectedRole, setSelectedRole] = useState('Student')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [role, setRole] = useState('student')
  const [students, setStudents] = useState<Student[]>([])
  const [selectedStudent, setSelectedStudent] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [showWelcome, setShowWelcome] = useState(false)
  const [language, setLanguage] = useState('English (USA)')

  const t = translations[language]

  useEffect(() => {
    const token = getToken()
    if (token) setIsAuthenticated(true)

    const savedLang = localStorage.getItem('lang')
    if (savedLang) setLanguage(savedLang)
  }, [])

  useEffect(() => {
    setRole(selectedRole.toLowerCase())
  }, [selectedRole])

  useEffect(() => {
    if (role === 'parent') {
      fetch('/api/student/list')
        .then((res) => res.json())
        .then(setStudents)
        .catch(() => setError('Failed to fetch student list.'))
    }
  }, [role])

  const handleLanguageChange = (lang: string) => {
    setLanguage(lang)
    localStorage.setItem('lang', lang)
  }

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    const body: any = { email, password, role }
    if (role === 'parent') body.studentId = selectedStudent

    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })

      if (res.ok) {
        setShowWelcome(true)
        import('canvas-confetti').then((confetti) => {
          const duration = 3000
          const end = Date.now() + duration
          const canvas = document.createElement('canvas')
          canvas.style.position = 'fixed'
          canvas.style.top = '0'
          canvas.style.left = '0'
          canvas.style.width = '100%'
          canvas.style.height = '100%'
          canvas.style.pointerEvents = 'none'
          canvas.style.zIndex = '9999'
          document.body.appendChild(canvas)

          const myConfetti = confetti.create(canvas, { resize: true })
          const frame = () => {
            myConfetti({
              particleCount: 6,
              spread: 360,
              origin: { x: Math.random(), y: Math.random() },
            })
            if (Date.now() < end) requestAnimationFrame(frame)
            else document.body.removeChild(canvas)
          }
          frame()
        })
        setTimeout(() => {
          setShowWelcome(false)
          router.push('/login')
        }, 3000)
      } else {
        const text = await res.text()
        if (res.status === 409 || text.includes('already')) {
          setError('⚠️ User already registered. Try logging in.')
        } else {
          setError('❌ Registration failed. ' + text)
        }
      }
    } catch (err) {
      setError('❌ Something went wrong. Please try again.')
    }
  }

  return (
    <main className="min-h-screen flex flex-col md:flex-row bg-white overflow-hidden">
      {/* 🎉 Welcome */}
      {showWelcome && (
        <div className="fixed inset-0 z-50 bg-black bg-opacity-60 flex items-center justify-center">
          <div className="bg-white bg-opacity-90 rounded-3xl px-8 py-6 text-center shadow-2xl border border-purple-300 animate-pulse max-w-xl">
            <h2 className="text-3xl md:text-4xl font-extrabold text-[#6a0dad] mb-2">🎉 Welcome to JioWorld!</h2>
            <p className="text-gray-700 text-lg font-medium">You're all set to begin your journey 🚀</p>
          </div>
        </div>
      )}

      {/* 🟪 Left Panel */}
      <div className="w-full md:w-1/2 bg-gradient-to-br from-purple-700 to-purple-500 px-6 py-8 text-white flex flex-col justify-between relative">
        <img src="/jio-logo.png" alt="Jio Logo" className="absolute top-4 left-4 w-14 h-14 object-contain" />
        <div className="mt-20 md:mt-32">
          <h2 className="text-3xl md:text-4xl font-bold leading-snug md:leading-snug px-2 md:px-10">
            Start your journey <br />
            with just one click. <br />
            Choose your role <br />
            and <span className="text-yellow-300 font-extrabold">Unlock a World<br />of Learning.</span>
          </h2>
        </div>
        <img src="/landingPage.png" alt="Mascot" className="w-56 md:w-64 mx-auto mt-8 md:mt-12" />
      </div>

      {/* ⬜ Right Panel */}
      <div className="w-full md:w-1/2 bg-white px-4 sm:px-8 py-10 flex flex-col justify-center relative">
        <div className="absolute top-6 right-6 sm:top-6 sm:right-8 flex items-center gap-2 text-sm text-gray-700 z-20">
          <span role="img" aria-label="language" className="text-base sm:text-lg">🌐</span>
          <select
            value={language}
            onChange={(e) => handleLanguageChange(e.target.value)}
            className="border border-gray-300 px-3 py-1.5 rounded-md text-sm bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-300"
          >
            {languages.map((lang) => (
              <option key={lang} value={lang}>
                {lang}
              </option>
            ))}
          </select>
        </div>



        <h1 className="text-2xl md:text-3xl text-center font-extrabold mb-6 text-[#6a0dad]">
          {t.createAccount}
        </h1>

        <div className="flex justify-center flex-wrap gap-2 mb-6">
          {roles.map((r) => (
            <button
              key={r}
              onClick={() => setSelectedRole(r)}
              className={`px-4 py-2 rounded-full text-sm sm:text-base font-medium transition ${
                selectedRole === r ? 'bg-purple-100 text-[#6a0dad]' : 'text-gray-400 hover:text-[#6a0dad] bg-gray-100'
              }`}
            >
              {r}
            </button>
          ))}
        </div>

        <form onSubmit={handleRegister} className="space-y-4 w-full max-w-md mx-auto">
          <input
            type="email"
            className="w-full px-4 py-2 border border-gray-300 text-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-300"
            placeholder={t.enterEmail}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />

          <input
            type="password"
            className="w-full px-4 py-2 border text-gray-700 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-300"
            placeholder={t.createPassword}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />

          {role === 'parent' && (
            students.length > 0 ? (
              <select
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-300"
                value={selectedStudent}
                onChange={(e) => setSelectedStudent(e.target.value)}
                required
              >
                <option value="">{t.selectStudent}</option>
                {students.map((s) => (
                  <option key={s._id} value={s._id}>{s.email}</option>
                ))}
              </select>
            ) : (
              <p className="text-red-500 text-sm">{t.noStudents}</p>
            )
          )}

          {error && <p className="text-red-500 text-sm">{error}</p>}

          <button
            type="submit"
            className="w-full bg-[#6a0dad] hover:bg-[#5809b1] text-white font-semibold py-2 rounded-full transition"
          >
            {t.registerNow}
          </button>
        </form>

        <div className="text-center text-gray-600 mt-6 text-sm">
          {t.alreadyHave}{' '}
          <span
            onClick={() => router.push('/login')}
            className="text-[#6a0dad] font-semibold hover:underline cursor-pointer"
          >
            {t.loginHere}
          </span>
        </div>
      </div>
    </main>
  )
}
