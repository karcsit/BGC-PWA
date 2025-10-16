import React from 'react'
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom'
import { AuthProvider, useAuth } from './context/AuthContext'
import GameList from './components/GameList'
import Menu from './pages/Menu'
import LoginPage from './pages/LoginPage'
import RegisterPage from './pages/RegisterPage'
import ProfilePage from './pages/ProfilePage'
import GameLogPage from './pages/GameLogPage'
import GameLogFormPage from './pages/GameLogFormPage'
import ProtectedRoute from './components/ProtectedRoute'

function AppContent() {
  const { user } = useAuth()

  return (
    <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <header className="bg-gradient-to-r from-primary-purple to-primary-indigo text-white shadow-lg">
          <div className="container mx-auto px-4 py-6">
            <h1 className="text-3xl font-bold">Board Game Cafe</h1>
            <p className="text-purple-100">Üllői út 46, Budapest 1084</p>
          </div>
        </header>

        {/* Navigation */}
        <nav className="bg-white shadow-md sticky top-0 z-50">
          <div className="container mx-auto px-4">
            <div className="flex justify-between items-center py-4">
              <ul className="flex space-x-6">
                <li>
                  <Link to="/" className="text-gray-700 hover:text-primary-purple transition-colors font-medium">
                    🎲 Játékok
                  </Link>
                </li>
                <li>
                  <Link to="/game-log" className="text-gray-700 hover:text-primary-purple transition-colors font-medium">
                    📖 Játéknapló
                  </Link>
                </li>
                <li>
                  <Link to="/menu" className="text-gray-700 hover:text-primary-purple transition-colors font-medium">
                    🍽️ Menü
                  </Link>
                </li>
                <li>
                  <Link to="/booking" className="text-gray-700 hover:text-primary-purple transition-colors font-medium">
                    📅 Foglalás
                  </Link>
                </li>
                <li>
                  <Link to="/events" className="text-gray-700 hover:text-primary-purple transition-colors font-medium">
                    🎉 Események
                  </Link>
                </li>
              </ul>

              {/* Auth Buttons */}
              <div className="flex items-center gap-3">
                {user ? (
                  <Link
                    to="/profile"
                    className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-primary-purple to-primary-indigo text-white rounded-lg hover:shadow-lg transition-all duration-300"
                  >
                    <span className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center font-bold">
                      {user.name.charAt(0).toUpperCase()}
                    </span>
                    <span className="font-medium">{user.name}</span>
                  </Link>
                ) : (
                  <>
                    <Link
                      to="/login"
                      className="px-4 py-2 text-primary-purple font-medium hover:text-primary-indigo transition-colors"
                    >
                      Bejelentkezés
                    </Link>
                    <Link
                      to="/register"
                      className="px-4 py-2 bg-gradient-to-r from-primary-purple to-primary-indigo text-white rounded-lg hover:shadow-lg transition-all duration-300 font-medium"
                    >
                      Regisztráció
                    </Link>
                  </>
                )}
              </div>
            </div>
          </div>
        </nav>

        {/* Main Content */}
        <main className="container mx-auto px-4 py-8">
          <Routes>
            <Route path="/" element={<GameList />} />
            <Route path="/menu" element={<Menu />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route
              path="/profile"
              element={
                <ProtectedRoute>
                  <ProfilePage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/game-log"
              element={
                <ProtectedRoute>
                  <GameLogPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/game-log/new"
              element={
                <ProtectedRoute>
                  <GameLogFormPage />
                </ProtectedRoute>
              }
            />
            <Route path="/booking" element={<div className="text-center py-12"><h2 className="text-2xl font-bold text-gray-800">Asztalfoglalás - Hamarosan</h2></div>} />
            <Route path="/events" element={<div className="text-center py-12"><h2 className="text-2xl font-bold text-gray-800">Események - Hamarosan</h2></div>} />
          </Routes>
        </main>

        {/* Footer */}
        <footer className="bg-gray-800 text-white mt-12 py-8">
          <div className="container mx-auto px-4 text-center">
            <p className="mb-2">&copy; 2025 Board Game Cafe - Minden jog fenntartva</p>
            <p className="text-gray-400">1500 társasjáték | Nyitva: Kedd-Vasárnap 17:00-23:00</p>
          </div>
        </footer>
      </div>
  )
}

function App() {
  return (
    <Router>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </Router>
  )
}

export default App
