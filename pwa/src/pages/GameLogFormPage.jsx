import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { gameLogService } from '../services/gameLogService'

const GameLogFormPage = () => {
  const { user } = useAuth()
  const navigate = useNavigate()

  // Form state
  const [formData, setFormData] = useState({
    gameSearch: '',
    gameId: '',
    gameTitle: '',
    date: '',
    time: '',
    duration: 60,
    playerCount: 2,
    players: ['', ''],
    winner: '',
    location: 'cafe',
    rating: 5,
    notes: ''
  })

  const [scores, setScores] = useState({}) // {playerName: score}
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [searchResults, setSearchResults] = useState([])
  const [searching, setSearching] = useState(false)

  // Search games
  const handleGameSearch = async (query) => {
    if (!query || query.length < 2) {
      setSearchResults([])
      return
    }

    try {
      setSearching(true)
      const response = await fetch(
        `/jsonapi/node/tarsasjatek?filter[title][operator]=CONTAINS&filter[title][value]=${encodeURIComponent(query)}&page[limit]=10`,
        {
          headers: { 'Accept': 'application/vnd.api+json' }
        }
      )
      const data = await response.json()
      setSearchResults(data.data || [])
    } catch (err) {
      console.error('Game search error:', err)
    } finally {
      setSearching(false)
    }
  }

  // Select game from search results
  const selectGame = (game) => {
    setFormData({
      ...formData,
      gameId: game.id,
      gameTitle: game.attributes.title,
      gameSearch: game.attributes.title
    })
    setSearchResults([])
  }

  // Update player count
  const updatePlayerCount = (count) => {
    const newCount = parseInt(count)
    const newPlayers = [...formData.players]

    if (newCount > formData.playerCount) {
      // Add empty slots
      for (let i = formData.playerCount; i < newCount; i++) {
        newPlayers.push('')
      }
    } else if (newCount < formData.playerCount) {
      // Remove slots
      newPlayers.splice(newCount)
    }

    setFormData({
      ...formData,
      playerCount: newCount,
      players: newPlayers
    })
  }

  // Update player name
  const updatePlayer = (index, name) => {
    const newPlayers = [...formData.players]
    newPlayers[index] = name
    setFormData({ ...formData, players: newPlayers })
  }

  // Update player score
  const updateScore = (playerName, score) => {
    setScores({
      ...scores,
      [playerName]: parseInt(score) || 0
    })
  }

  // Submit form
  const handleSubmit = async (e) => {
    e.preventDefault()
    setError(null)

    // Validation
    if (!formData.gameId) {
      setError('Kérlek válassz egy játékot!')
      return
    }

    if (!formData.date || !formData.time) {
      setError('Kérlek add meg a dátumot és időpontot!')
      return
    }

    const filledPlayers = formData.players.filter(p => p.trim())
    if (filledPlayers.length === 0) {
      setError('Legalább egy játékos nevét add meg!')
      return
    }

    try {
      setLoading(true)

      // Combine date and time
      const dateTime = `${formData.date}T${formData.time}:00`

      // Create title
      const title = `${formData.gameTitle} - ${formData.date}`

      // Prepare game log data
      const gameLogData = {
        title,
        gameId: formData.gameId,
        date: dateTime,
        duration: formData.duration,
        playerCount: formData.playerCount,
        players: filledPlayers,
        winner: formData.winner || null,
        scores: Object.keys(scores).length > 0 ? scores : null,
        location: formData.location,
        rating: formData.rating,
        notes: formData.notes || null
      }

      console.log('Submitting game log:', gameLogData)

      await gameLogService.createGameLog(gameLogData)

      // Success! Redirect to game log page
      navigate('/game-log')
    } catch (err) {
      console.error('Submit error:', err)
      setError(err.message || 'Hiba történt a mentés során')
    } finally {
      setLoading(false)
    }
  }

  if (!user) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-2xl">
        <div className="bg-yellow-50 border-2 border-yellow-200 rounded-xl p-8 text-center">
          <span className="text-6xl block mb-4">🔒</span>
          <h2 className="text-2xl font-bold text-yellow-900 mb-4">
            Bejelentkezés szükséges
          </h2>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold bg-gradient-to-r from-primary-purple to-primary-indigo bg-clip-text text-transparent mb-4">
          ➕ Új játéknapló bejegyzés
        </h1>
        <p className="text-gray-600">
          Rögzítsd a játékélményedet és oszd meg másokkal!
        </p>
      </div>

      {/* Error Message */}
      {error && (
        <div className="mb-6 p-4 bg-red-50 border-2 border-red-200 rounded-xl">
          <div className="flex items-center gap-2 text-red-700">
            <span className="text-xl">⚠️</span>
            <p>{error}</p>
          </div>
        </div>
      )}

      {/* Form */}
      <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-lg p-8 space-y-6">
        {/* Game Search */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Játék keresése *
          </label>
          <div className="relative">
            <input
              type="text"
              value={formData.gameSearch}
              onChange={(e) => {
                setFormData({ ...formData, gameSearch: e.target.value })
                handleGameSearch(e.target.value)
              }}
              placeholder="Kezdd el gépelni a játék nevét..."
              className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-purple focus:border-transparent"
            />
            {searching && (
              <div className="absolute right-4 top-1/2 transform -translate-y-1/2">
                <div className="animate-spin rounded-full h-5 w-5 border-2 border-primary-purple border-t-transparent"></div>
              </div>
            )}
          </div>

          {/* Search Results */}
          {searchResults.length > 0 && (
            <div className="mt-2 bg-white border-2 border-gray-200 rounded-xl shadow-lg max-h-60 overflow-y-auto">
              {searchResults.map((game) => (
                <button
                  key={game.id}
                  type="button"
                  onClick={() => selectGame(game)}
                  className="w-full px-4 py-3 text-left hover:bg-purple-50 transition-colors border-b border-gray-100 last:border-0"
                >
                  <div className="font-medium text-gray-800">
                    {game.attributes.title}
                  </div>
                </button>
              ))}
            </div>
          )}

          {/* Selected Game */}
          {formData.gameId && (
            <div className="mt-2 p-3 bg-green-50 border-2 border-green-200 rounded-xl flex items-center justify-between">
              <span className="text-green-800 font-medium">
                ✓ Kiválasztva: {formData.gameTitle}
              </span>
              <button
                type="button"
                onClick={() => setFormData({ ...formData, gameId: '', gameTitle: '', gameSearch: '' })}
                className="text-red-600 hover:text-red-700 font-medium text-sm"
              >
                Törlés
              </button>
            </div>
          )}
        </div>

        {/* Date and Time */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Dátum *
            </label>
            <input
              type="date"
              value={formData.date}
              onChange={(e) => setFormData({ ...formData, date: e.target.value })}
              className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-purple"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Időpont *
            </label>
            <input
              type="time"
              value={formData.time}
              onChange={(e) => setFormData({ ...formData, time: e.target.value })}
              className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-purple"
              required
            />
          </div>
        </div>

        {/* Duration */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Időtartam: {formData.duration} perc
          </label>
          <input
            type="range"
            min="15"
            max="300"
            step="15"
            value={formData.duration}
            onChange={(e) => setFormData({ ...formData, duration: parseInt(e.target.value) })}
            className="w-full h-2 bg-gray-200 rounded-lg cursor-pointer"
            style={{ accentColor: '#7c3aed' }}
          />
          <div className="flex justify-between text-xs text-gray-500 mt-1">
            <span>15 perc</span>
            <span>5 óra</span>
          </div>
        </div>

        {/* Player Count */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Játékosok száma: {formData.playerCount}
          </label>
          <input
            type="range"
            min="1"
            max="10"
            value={formData.playerCount}
            onChange={(e) => updatePlayerCount(e.target.value)}
            className="w-full h-2 bg-gray-200 rounded-lg cursor-pointer"
            style={{ accentColor: '#7c3aed' }}
          />
        </div>

        {/* Player Names */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Játékosok nevei
          </label>
          <div className="space-y-2">
            {formData.players.map((player, index) => (
              <input
                key={index}
                type="text"
                value={player}
                onChange={(e) => updatePlayer(index, e.target.value)}
                placeholder={`${index + 1}. játékos neve`}
                className="w-full px-4 py-2 border-2 border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-purple"
              />
            ))}
          </div>
        </div>

        {/* Winner */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Nyertes (opcionális)
          </label>
          <select
            value={formData.winner}
            onChange={(e) => setFormData({ ...formData, winner: e.target.value })}
            className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-purple"
          >
            <option value="">Válassz...</option>
            {formData.players.filter(p => p.trim()).map((player, idx) => (
              <option key={idx} value={player}>{player}</option>
            ))}
          </select>
        </div>

        {/* Scores (Optional) */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Pontszámok (opcionális)
          </label>
          <div className="space-y-2">
            {formData.players.filter(p => p.trim()).map((player, index) => (
              <div key={index} className="flex items-center gap-3">
                <span className="w-32 text-gray-700 font-medium">{player}:</span>
                <input
                  type="number"
                  min="0"
                  value={scores[player] || ''}
                  onChange={(e) => updateScore(player, e.target.value)}
                  placeholder="Pontszám"
                  className="flex-1 px-4 py-2 border-2 border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-purple"
                />
              </div>
            ))}
          </div>
        </div>

        {/* Location */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Helyszín
          </label>
          <div className="flex gap-3">
            <button
              type="button"
              onClick={() => setFormData({ ...formData, location: 'cafe' })}
              className={`flex-1 py-3 px-4 rounded-xl font-medium transition-all ${
                formData.location === 'cafe'
                  ? 'bg-gradient-to-r from-primary-purple to-primary-indigo text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              🏪 Board Game Cafe
            </button>
            <button
              type="button"
              onClick={() => setFormData({ ...formData, location: 'home' })}
              className={`flex-1 py-3 px-4 rounded-xl font-medium transition-all ${
                formData.location === 'home'
                  ? 'bg-gradient-to-r from-primary-purple to-primary-indigo text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              🏠 Otthon
            </button>
            <button
              type="button"
              onClick={() => setFormData({ ...formData, location: 'other' })}
              className={`flex-1 py-3 px-4 rounded-xl font-medium transition-all ${
                formData.location === 'other'
                  ? 'bg-gradient-to-r from-primary-purple to-primary-indigo text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              📍 Egyéb
            </button>
          </div>
        </div>

        {/* Rating */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Értékelés
          </label>
          <div className="flex gap-2">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                type="button"
                onClick={() => setFormData({ ...formData, rating: star })}
                className="text-4xl transition-transform hover:scale-110"
              >
                {star <= formData.rating ? '⭐' : '☆'}
              </button>
            ))}
          </div>
        </div>

        {/* Notes */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Megjegyzések (opcionális)
          </label>
          <textarea
            value={formData.notes}
            onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
            placeholder="Oszd meg az élményeidet, taktikákat, érdekes momentumokat..."
            rows="4"
            className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-purple resize-none"
          ></textarea>
        </div>

        {/* Submit Buttons */}
        <div className="flex gap-4 pt-4">
          <button
            type="button"
            onClick={() => navigate('/game-log')}
            className="flex-1 py-3 px-6 border-2 border-gray-300 text-gray-700 font-semibold rounded-xl hover:bg-gray-100 transition-all"
          >
            Mégse
          </button>
          <button
            type="submit"
            disabled={loading}
            className="flex-1 py-3 px-6 bg-gradient-to-r from-primary-purple to-primary-indigo text-white font-semibold rounded-xl hover:shadow-xl hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed transition-all"
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
                Mentés...
              </span>
            ) : (
              '💾 Mentés'
            )}
          </button>
        </div>
      </form>
    </div>
  )
}

export default GameLogFormPage
