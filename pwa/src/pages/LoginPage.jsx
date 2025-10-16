import React, { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

const LoginPage = () => {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [localError, setLocalError] = useState(null)

  const { login, loading, error: authError } = useAuth()
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLocalError(null)

    // Validation
    if (!username.trim()) {
      setLocalError('Kérlek, add meg a felhasználóneved!')
      return
    }

    if (!password) {
      setLocalError('Kérlek, add meg a jelszavad!')
      return
    }

    try {
      await login(username, password)
      // Redirect to home page on success
      navigate('/')
    } catch (error) {
      // Error is handled by AuthContext
      console.error('Login error:', error)
    }
  }

  const displayError = localError || authError

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-indigo-50 to-pink-50 flex items-center justify-center px-4 py-8">
      <div className="max-w-md w-full">
        {/* Card */}
        <div className="bg-white rounded-2xl shadow-2xl p-8 animate-fade-in-up">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="inline-block p-4 bg-gradient-to-r from-primary-purple to-primary-indigo rounded-full mb-4">
              <span className="text-4xl">🎲</span>
            </div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-primary-purple to-primary-indigo bg-clip-text text-transparent mb-2">
              Üdvözöllek!
            </h1>
            <p className="text-gray-600">
              Jelentkezz be a Board Game Cafe fiókodba
            </p>
          </div>

          {/* Error Message */}
          {displayError && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl animate-shake">
              <div className="flex items-center gap-2 text-red-700">
                <span className="text-xl">⚠️</span>
                <p className="text-sm">{displayError}</p>
              </div>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Username Field */}
            <div>
              <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-2">
                Felhasználónév
              </label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 transform -translate-y-1/2 text-xl">
                  👤
                </span>
                <input
                  type="text"
                  id="username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Add meg a felhasználóneved"
                  className="w-full pl-12 pr-4 py-3 border-2 border-gray-300 rounded-xl
                           focus:outline-none focus:ring-4 focus:ring-purple-200 focus:border-primary-purple
                           transition-all duration-300"
                  disabled={loading}
                />
              </div>
            </div>

            {/* Password Field */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                Jelszó
              </label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 transform -translate-y-1/2 text-xl">
                  🔒
                </span>
                <input
                  type={showPassword ? 'text' : 'password'}
                  id="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Add meg a jelszavad"
                  className="w-full pl-12 pr-12 py-3 border-2 border-gray-300 rounded-xl
                           focus:outline-none focus:ring-4 focus:ring-purple-200 focus:border-primary-purple
                           transition-all duration-300"
                  disabled={loading}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                >
                  {showPassword ? '🙈' : '👁️'}
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-gradient-to-r from-primary-purple to-primary-indigo text-white
                       font-semibold rounded-xl shadow-lg
                       hover:shadow-xl hover:scale-[1.02] active:scale-[0.98]
                       disabled:opacity-50 disabled:cursor-not-allowed
                       transition-all duration-300"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
                  Bejelentkezés...
                </span>
              ) : (
                'Bejelentkezés'
              )}
            </button>
          </form>

          {/* Divider */}
          <div className="my-8 flex items-center">
            <div className="flex-1 border-t border-gray-300"></div>
            <span className="px-4 text-sm text-gray-500">vagy</span>
            <div className="flex-1 border-t border-gray-300"></div>
          </div>

          {/* Register Link */}
          <div className="text-center">
            <p className="text-gray-600 mb-4">
              Még nincs fiókod?
            </p>
            <Link
              to="/register"
              className="inline-block px-6 py-3 border-2 border-primary-purple text-primary-purple
                       font-semibold rounded-xl
                       hover:bg-primary-purple hover:text-white
                       transition-all duration-300"
            >
              📝 Regisztráció indítása
            </Link>
            <p className="text-xs text-gray-500 mt-3">
              A regisztráció a hivatalos Drupal oldalon történik a biztonság érdekében
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center mt-6">
          <Link
            to="/"
            className="text-gray-600 hover:text-primary-purple transition-colors"
          >
            ← Vissza a főoldalra
          </Link>
        </div>
      </div>

      {/* Animations */}
      <style>{`
        @keyframes fade-in-up {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          25% { transform: translateX(-10px); }
          75% { transform: translateX(10px); }
        }

        .animate-fade-in-up {
          animation: fade-in-up 0.6s ease-out;
        }

        .animate-shake {
          animation: shake 0.5s ease-in-out;
        }
      `}</style>
    </div>
  )
}

export default LoginPage
