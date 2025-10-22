import React from 'react'
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom'
import { AuthProvider, useAuth } from './context/AuthContext'
import HomePage from './pages/HomePage'
import GameList from './components/GameList'
import Menu from './pages/Menu'
import EventsPage from './pages/EventsPage'
import LoginPage from './pages/LoginPage'
import RegisterPage from './pages/RegisterPage'
import ProfilePage from './pages/ProfilePage'
import GameLogPage from './pages/GameLogPage'
import GameLogFormPage from './pages/GameLogFormPage'
import PlayerFinderPage from './pages/PlayerFinderPage'
import PlayerFinderFormPage from './pages/PlayerFinderFormPage'
import PlayerFinderDetailPage from './pages/PlayerFinderDetailPage'
import ProtectedRoute from './components/ProtectedRoute'

function AppContent() {
  const { user } = useAuth()

  return (
    <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <header className="bg-gradient-to-r from-primary to-secondary text-white shadow-lg">
          <div className="container mx-auto px-4 py-6">
            <h1 className="text-3xl font-bold">Board Game Cafe</h1>
            <p className="text-white/90">Üllői út 46, Budapest 1084</p>
          </div>
        </header>

        {/* Navigation */}
        <nav className="bg-white shadow-md sticky top-0 z-50">
          <div className="container mx-auto px-4">
            <div className="flex justify-between items-center py-4">
              <div>
                <Link to="/" className="text-gray-700 hover:text-primary transition-colors font-medium">
                  🏠 Főoldal
                </Link>
              </div>

              {/* Auth Buttons */}
              <div className="flex items-center gap-3">
                {user ? (
                  <Link
                    to="/profile"
                    className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-primary to-secondary text-white rounded-lg hover:shadow-lg transition-all duration-300"
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
                      className="px-4 py-2 text-primary font-medium hover:text-secondary transition-colors"
                    >
                      Bejelentkezés
                    </Link>
                    <Link
                      to="/register"
                      className="px-4 py-2 bg-gradient-to-r from-primary to-secondary text-white rounded-lg hover:shadow-lg transition-all duration-300 font-medium"
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
            <Route path="/" element={<HomePage />} />
            <Route path="/games" element={<GameList />} />
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
            <Route path="/events" element={<EventsPage />} />
            <Route path="/player-finder" element={<PlayerFinderPage />} />
            <Route
              path="/player-finder/new"
              element={
                <ProtectedRoute>
                  <PlayerFinderFormPage />
                </ProtectedRoute>
              }
            />
            <Route path="/player-finder/:id" element={<PlayerFinderDetailPage />} />
            <Route path="/about" element={<div className="text-center py-12"><h2 className="text-2xl font-bold text-gray-800">Rólunk - Hamarosan</h2></div>} />
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
    <Router basename="/pwa">
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </Router>
  )
}

export default App
