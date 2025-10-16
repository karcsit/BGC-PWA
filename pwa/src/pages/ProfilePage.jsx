import React from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

const ProfilePage = () => {
  const { user, logout, loading } = useAuth()
  const navigate = useNavigate()

  const handleLogout = async () => {
    await logout()
    navigate('/login')
  }

  if (!user) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-2xl">
        <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-6 text-center">
          <span className="text-4xl block mb-4">⚠️</span>
          <p className="text-yellow-800">Nincs bejelentkezve</p>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      {/* Header */}
      <div className="mb-8 animate-fade-in">
        <h1 className="text-4xl font-bold bg-gradient-to-r from-primary-purple to-primary-indigo bg-clip-text text-transparent mb-4">
          👤 Profil
        </h1>
        <p className="text-gray-600 text-lg">
          Üdv, {user.name}!
        </p>
      </div>

      {/* Profile Card */}
      <div className="bg-white rounded-2xl shadow-xl p-8 mb-6 animate-slide-up">
        {/* Avatar and Basic Info */}
        <div className="flex items-center gap-6 mb-8 pb-8 border-b border-gray-200">
          <div className="w-24 h-24 bg-gradient-to-br from-primary-purple to-primary-indigo rounded-full flex items-center justify-center text-white text-4xl font-bold shadow-lg">
            {user.name.charAt(0).toUpperCase()}
          </div>
          <div className="flex-1">
            <h2 className="text-2xl font-bold text-gray-800 mb-1">
              {user.name}
            </h2>
            <p className="text-gray-500">
              User ID: {user.uid}
            </p>
          </div>
        </div>

        {/* Stats Grid (placeholder for future stats) */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <div className="bg-gradient-to-br from-purple-50 to-indigo-50 rounded-xl p-6 text-center">
            <div className="text-3xl mb-2">🎲</div>
            <div className="text-3xl font-bold text-primary-indigo mb-1">0</div>
            <div className="text-sm text-gray-600">Játszott játék</div>
          </div>
          <div className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-xl p-6 text-center">
            <div className="text-3xl mb-2">⏱️</div>
            <div className="text-3xl font-bold text-blue-600 mb-1">0</div>
            <div className="text-sm text-gray-600">Óra összesen</div>
          </div>
          <div className="bg-gradient-to-br from-pink-50 to-rose-50 rounded-xl p-6 text-center">
            <div className="text-3xl mb-2">🏆</div>
            <div className="text-3xl font-bold text-pink-600 mb-1">0</div>
            <div className="text-sm text-gray-600">Győzelem</div>
          </div>
        </div>

        {/* Info Notice */}
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-6">
          <div className="flex items-start gap-3">
            <span className="text-2xl">💡</span>
            <div>
              <h3 className="font-semibold text-blue-900 mb-1">Hamarosan elérhető</h3>
              <p className="text-sm text-blue-700">
                A játéknapló funkcióval rögzítheted a játékokat, és részletes statisztikákat láthatsz majd itt.
              </p>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="space-y-3">
          <h3 className="font-semibold text-gray-700 mb-3">Gyors műveletek</h3>

          <button
            onClick={() => navigate('/')}
            className="w-full flex items-center gap-3 px-6 py-4 bg-gray-50 hover:bg-gray-100
                     rounded-xl transition-all duration-300 group"
          >
            <span className="text-2xl">🎮</span>
            <div className="flex-1 text-left">
              <div className="font-medium text-gray-800 group-hover:text-primary-purple transition-colors">
                Játékok böngészése
              </div>
              <div className="text-sm text-gray-500">Fedezd fel a kínálatunkat</div>
            </div>
            <span className="text-gray-400 group-hover:text-primary-purple transition-colors">→</span>
          </button>

          <button
            onClick={() => navigate('/menu')}
            className="w-full flex items-center gap-3 px-6 py-4 bg-gray-50 hover:bg-gray-100
                     rounded-xl transition-all duration-300 group"
          >
            <span className="text-2xl">🍽️</span>
            <div className="flex-1 text-left">
              <div className="font-medium text-gray-800 group-hover:text-primary-purple transition-colors">
                Étlap & Itallap
              </div>
              <div className="text-sm text-gray-500">Nézd meg kínálatunkat</div>
            </div>
            <span className="text-gray-400 group-hover:text-primary-purple transition-colors">→</span>
          </button>
        </div>

        {/* Logout Button */}
        <div className="mt-8 pt-8 border-t border-gray-200">
          <button
            onClick={handleLogout}
            disabled={loading}
            className="w-full py-3 bg-red-500 text-white font-semibold rounded-xl
                     hover:bg-red-600 active:scale-[0.98]
                     disabled:opacity-50 disabled:cursor-not-allowed
                     transition-all duration-300 shadow-lg hover:shadow-xl"
          >
            {loading ? 'Kijelentkezés...' : '🚪 Kijelentkezés'}
          </button>
        </div>
      </div>

      {/* Animations */}
      <style>{`
        @keyframes fade-in {
          from { opacity: 0; }
          to { opacity: 1; }
        }

        @keyframes slide-up {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .animate-fade-in {
          animation: fade-in 0.6s ease-out;
        }

        .animate-slide-up {
          animation: slide-up 0.6s ease-out;
        }
      `}</style>
    </div>
  )
}

export default ProfilePage
