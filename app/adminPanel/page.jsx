'use client'
import React, { useState, useEffect } from 'react'
import Admin from '../components/Admin'

const Page = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [password, setPassword] = useState('')

  useEffect(() => {
    // Check if password exists in localStorage
    const storedPassword = localStorage.getItem('adminPassword')
    if (storedPassword === '1357924680') {
      setIsAuthenticated(true)
    }
  }, [])

  const handleLogin = () => {
    if (password === '1357924680') {
      localStorage.setItem('adminPassword', password)
      setIsAuthenticated(true)
    } else {
      alert('كلمة المرور غير صحيحة')
    }
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-900 to-blue-950 flex items-center justify-center p-4">
        <div className="bg-white/10 backdrop-blur-xl p-8 rounded-2xl border border-white/20 w-full max-w-md">
          <h1 className="text-2xl text-white font-arabicUI3 text-center mb-6">تسجيل الدخول للوحة التحكم</h1>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="كلمة المرور"
            className="w-full p-3 rounded-xl mb-4 bg-white/5 border border-white/10 text-white"
          />
          <button
            onClick={handleLogin}
            className="w-full bg-blue-500 text-white py-3 rounded-xl font-arabicUI3"
          >
            دخول
          </button>
        </div>
      </div>
    )
  }
 
  return (
    <div>
      <Admin />
    </div>
  )
}

export default Page