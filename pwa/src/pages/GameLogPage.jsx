import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { getGameLogStats, formatDate, formatDuration, locationLabels } from '../data/mockGameLogs'
import { gameLogService } from '../services/gameLogService'

const GameLogPage = () => {
  const { user } = useAuth()
  const [activeTab, setActiveTab] = useState('all') // 'all', 'own', 'stats'
  const [gameLogs, setGameLogs] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  // Filter logs based on current user
  const ownLogs = gameLogs.filter(log => {
    // Compare user UUID with log creator UUID
    const currentUserUuid = user?.id // UUID from AuthContext
    const logCreatorUuid = log.createdBy
    return currentUserUuid && logCreatorUuid && currentUserUuid === logCreatorUuid
  })

  const displayedLogs = activeTab === 'own' ? ownLogs : gameLogs
  const stats = getGameLogStats(ownLogs) // Stats should only count own logs

  // Fetch game logs when component mounts or tab changes
  useEffect(() => {
    if (!user) return

    const fetchGameLogs = async () => {
      try {
        setLoading(true)
        setError(null)

        let logs
        if (activeTab === 'own') {
          logs = await gameLogService.getMyGameLogs()
        } else {
          logs = await gameLogService.getAllGameLogs()
        }

        setGameLogs(logs)
      } catch (err) {
        console.error('Failed to fetch game logs:', err)
        setError('Nem sikerült betölteni a játéknaplót')
      } finally {
        setLoading(false)
      }
    }

    fetchGameLogs()
  }, [user, activeTab])

  // If not logged in, show message
  if (!user) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="bg-gradient-to-r from-yellow-50 to-orange-50 border-2 border-yellow-200 rounded-xl p-8 text-center">
          <span className="text-6xl block mb-4">🔒</span>
          <h2 className="text-2xl font-bold text-yellow-900 mb-4">
            Bejelentkezés szükséges
          </h2>
          <p className="text-yellow-800 mb-6">
            A játéknapló funkció használatához be kell jelentkezned.
          </p>
          <Link
            to="/login"
            className="inline-block px-6 py-3 bg-gradient-to-r from-primary-purple to-primary-indigo text-white font-semibold rounded-xl hover:shadow-xl transition-all"
          >
            Bejelentkezés
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      {/* Header */}
      <div className="mb-8 animate-fade-in">
        <h1 className="text-4xl font-bold bg-gradient-to-r from-primary-purple to-primary-indigo bg-clip-text text-transparent mb-4">
          📖 Játéknapló
        </h1>
        <p className="text-gray-600 text-lg">
          Rögzítsd a játékélményeidet és kövesd nyomon statisztikáidat
        </p>
      </div>

      {/* Tab Navigation */}
      <div className="bg-white rounded-xl shadow-md p-2 mb-6 flex gap-2">
        <button
          onClick={() => setActiveTab('all')}
          className={`flex-1 py-3 px-4 rounded-lg font-medium transition-all ${
            activeTab === 'all'
              ? 'bg-gradient-to-r from-primary-purple to-primary-indigo text-white shadow-lg'
              : 'text-gray-700 hover:bg-gray-100'
          }`}
        >
          📚 Összes ({gameLogs.length})
        </button>
        <button
          onClick={() => setActiveTab('own')}
          className={`flex-1 py-3 px-4 rounded-lg font-medium transition-all ${
            activeTab === 'own'
              ? 'bg-gradient-to-r from-primary-purple to-primary-indigo text-white shadow-lg'
              : 'text-gray-700 hover:bg-gray-100'
          }`}
        >
          👤 Saját ({ownLogs.length})
        </button>
        <button
          onClick={() => setActiveTab('stats')}
          className={`flex-1 py-3 px-4 rounded-lg font-medium transition-all ${
            activeTab === 'stats'
              ? 'bg-gradient-to-r from-primary-purple to-primary-indigo text-white shadow-lg'
              : 'text-gray-700 hover:bg-gray-100'
          }`}
        >
          📊 Statisztikák
        </button>
      </div>

      {/* Stats Tab */}
      {activeTab === 'stats' && (
        <div className="space-y-6 animate-fade-in">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Total Games */}
            <div className="bg-gradient-to-br from-purple-50 to-indigo-50 rounded-xl p-6 border-2 border-purple-200">
              <div className="text-4xl mb-2">🎲</div>
              <div className="text-3xl font-bold text-primary-indigo mb-1">
                {stats.totalGames}
              </div>
              <div className="text-sm text-gray-600">Játszott játék</div>
            </div>

            {/* Total Hours */}
            <div className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-xl p-6 border-2 border-blue-200">
              <div className="text-4xl mb-2">⏱️</div>
              <div className="text-3xl font-bold text-blue-600 mb-1">
                {stats.totalHours}
              </div>
              <div className="text-sm text-gray-600">Óra összesen</div>
            </div>

            {/* Most Played */}
            <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-6 border-2 border-green-200">
              <div className="text-4xl mb-2">🏆</div>
              <div className="text-lg font-bold text-green-700 mb-1 truncate">
                {stats.mostPlayedGame}
              </div>
              <div className="text-sm text-gray-600">Legtöbbet játszott</div>
            </div>

            {/* Win Rate */}
            <div className="bg-gradient-to-br from-pink-50 to-rose-50 rounded-xl p-6 border-2 border-pink-200">
              <div className="text-4xl mb-2">🎯</div>
              <div className="text-3xl font-bold text-pink-600 mb-1">
                {stats.winRate}%
              </div>
              <div className="text-sm text-gray-600">Nyerési arány</div>
            </div>
          </div>

          {/* Info Box */}
          <div className="bg-blue-50 border-2 border-blue-200 rounded-xl p-6">
            <div className="flex items-start gap-3">
              <span className="text-3xl">💡</span>
              <div>
                <h3 className="font-bold text-blue-900 mb-2">Hamarosan még több statisztika!</h3>
                <ul className="text-sm text-blue-800 space-y-1">
                  <li>• Havi aktivitás grafikon</li>
                  <li>• Top 10 játék pie chart</li>
                  <li>• Legtöbbet játszott társak listája</li>
                  <li>• Játékidő trendek</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Loading State */}
      {loading && (activeTab === 'all' || activeTab === 'own') && (
        <div className="text-center py-16">
          <div className="inline-block animate-spin rounded-full h-16 w-16 border-b-2 border-primary-purple"></div>
          <p className="mt-4 text-gray-600">Betöltés...</p>
        </div>
      )}

      {/* Error State */}
      {error && (activeTab === 'all' || activeTab === 'own') && (
        <div className="bg-red-50 border-2 border-red-200 rounded-xl p-6 text-center">
          <span className="text-4xl block mb-3">⚠️</span>
          <p className="text-red-800 font-medium">{error}</p>
        </div>
      )}

      {/* Game Logs List */}
      {!loading && !error && (activeTab === 'all' || activeTab === 'own') && (
        <div className="space-y-4 animate-fade-in">
          {displayedLogs.map((log, index) => {
            // Check if this log belongs to current user
            const isOwnLog = user?.id && log.createdBy && user.id === log.createdBy

            return (
            <div
              key={log.id}
              className="bg-white rounded-xl shadow-md hover:shadow-xl transition-all p-6 border border-gray-100"
              style={{
                animation: 'fadeInUp 0.4s ease-out',
                animationDelay: `${index * 0.05}s`,
                animationFillMode: 'both'
              }}
            >
              <div className="flex gap-6">
                {/* Game Image */}
                <div className="flex-shrink-0">
                  <div className="w-24 h-24 bg-gray-200 rounded-lg overflow-hidden">
                    <img
                      src={log.game.image}
                      alt={log.game.title}
                      className="w-full h-full object-cover"
                    />
                  </div>
                </div>

                {/* Content */}
                <div className="flex-1">
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <h3 className="text-2xl font-bold text-gray-800 mb-1">
                        {log.game.title}
                      </h3>
                      <div className="flex items-center gap-2 text-sm text-gray-500">
                        <span>📅 {formatDate(log.date)}</span>
                        <span>•</span>
                        <span>⏱ {formatDuration(log.duration)}</span>
                        <span>•</span>
                        <span>👥 {log.playerCount} játékos</span>
                      </div>
                    </div>
                    <div className="flex gap-1">
                      {'⭐'.repeat(log.rating)}
                    </div>
                  </div>

                  {/* Winner */}
                  <div className="mb-3 flex items-center gap-2">
                    <span className="text-yellow-500 text-xl">🏆</span>
                    <span className="font-semibold text-gray-800">
                      {log.winner} nyert
                    </span>
                  </div>

                  {/* Players & Scores */}
                  <div className="flex flex-wrap gap-2 mb-3">
                    {log.players.map((player) => (
                      <div
                        key={player}
                        className={`px-3 py-1 rounded-full text-sm font-medium ${
                          player === log.winner
                            ? 'bg-gradient-to-r from-yellow-100 to-amber-100 text-yellow-900 border-2 border-yellow-300'
                            : 'bg-gray-100 text-gray-700'
                        }`}
                      >
                        {player}
                        {log.scores[player] !== undefined && (
                          <span className="ml-1 font-bold">
                            {log.scores[player]}
                          </span>
                        )}
                      </div>
                    ))}
                  </div>

                  {/* Location */}
                  <div className="flex items-center gap-2 text-sm text-gray-600 mb-3">
                    <span>📍</span>
                    <span>{locationLabels[log.location]}</span>
                  </div>

                  {/* Author - only show on "all" tab if not own log */}
                  {activeTab === 'all' && !isOwnLog && (
                    <div className="flex items-center gap-2 text-sm text-gray-500 mb-3 italic">
                      <span>✍️</span>
                      <span>Felvette: {log.createdByName || 'Ismeretlen felhasználó'}</span>
                    </div>
                  )}

                  {/* Notes */}
                  {log.notes && (
                    <div className="bg-gray-50 rounded-lg p-3 text-sm text-gray-700 italic">
                      "{log.notes}"
                    </div>
                  )}
                </div>
              </div>
            </div>
            )
          })}

          {displayedLogs.length === 0 && (
            <div className="text-center py-16 bg-gray-50 rounded-xl">
              <span className="text-6xl block mb-4">🎲</span>
              <h3 className="text-xl font-bold text-gray-800 mb-2">
                {activeTab === 'own' ? 'Még nincsenek saját bejegyzéseid' : 'Még nincsenek bejegyzések'}
              </h3>
              <p className="text-gray-600">
                {activeTab === 'own' ? 'Kezdd el rögzíteni a játékélményeidet!' : 'Legyél az első, aki felvesz egy játékot!'}
              </p>
            </div>
          )}
        </div>
      )}

      {/* FAB - New Game Log Button */}
      <Link
        to="/game-log/new"
        className="fixed bottom-8 right-8 w-16 h-16 bg-gradient-to-r from-primary-purple to-primary-indigo text-white rounded-full shadow-2xl flex items-center justify-center text-3xl hover:scale-110 active:scale-95 transition-all z-50"
        title="Új játéknapló bejegyzés"
      >
        +
      </Link>

      {/* Animations */}
      <style>{`
        @keyframes fade-in {
          from { opacity: 0; }
          to { opacity: 1; }
        }

        @keyframes fadeInUp {
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
      `}</style>
    </div>
  )
}

export default GameLogPage
