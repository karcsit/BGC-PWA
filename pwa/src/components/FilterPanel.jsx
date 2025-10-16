import React from 'react'

const FilterPanel = ({ filters, onFilterChange }) => {
  const gameType = filters.gameType
  const playerCount = filters.playerCount

  const setGameType = (value) => {
    onFilterChange({ ...filters, gameType: value })
  }

  const setPlayerCount = (value) => {
    onFilterChange({ ...filters, playerCount: value })
  }

  // Game types based on jatek_tipusok_polcrendszerben taxonomy
  const gameTypes = [
    { value: '', label: 'Összes játék' },
    { value: 'partijatekok', label: 'Partijátékok' },
    { value: 'gyors-jatekok', label: 'Gyors játékok' },
    { value: 'csaladi-jatekok', label: 'Családi játékok' },
    { value: 'osszetett-csaladi-jatekok', label: 'Összetett családi játékok' },
    { value: 'tarsasjatekok-tapasztalt-jatekosoknak', label: 'Tapasztalt játékosoknak' },
    { value: 'kartyajatekok', label: 'Kártyajátékok' },
    { value: 'kockajatekok', label: 'Kockajátékok' },
    { value: 'logikai-es-ugyessegi-jatekok', label: 'Logikai és ügyességi játékok' },
    { value: 'szo-es-betujatekok', label: 'Szó- és betűjátékok' },
    { value: 'gyerekjatekok', label: 'Gyerekjátékok' },
    { value: 'jatekok-felnotteknek-18-plusz', label: 'Felnőtt játékok (18+)' },
    { value: 'angol-nyelvu-jatekok', label: 'Angol nyelvű játékok' },
    { value: 'jatekok-2-jatekosnak', label: 'Kétfős játékok' },
    { value: 'spiel-des-jahres', label: 'Spiel des Jahres' },
    { value: 'kennerspiel-des-jahres', label: 'Kennerspiel des Jahres' },
    { value: 'retro-jatekok', label: 'Retro játékok' }
  ]

  return (
    <div className="bg-white rounded-xl shadow-md p-6 mb-6">
      <h2 className="text-xl font-bold text-gray-800 mb-4">Szűrők</h2>

      {/* Game Type Dropdown */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Játék típusa
        </label>
        <select
          value={gameType}
          onChange={(e) => setGameType(e.target.value)}
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-purple focus:border-transparent text-base"
        >
          {gameTypes.map(type => (
            <option key={type.value} value={type.value}>
              {type.label}
            </option>
          ))}
        </select>
      </div>

      {/* Player Count Slider */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-3">
          Játékosszám: <span className="font-bold text-primary-indigo">{playerCount === 8 ? '8+' : playerCount}</span>
        </label>
        <input
          type="range"
          min="1"
          max="8"
          value={playerCount}
          onChange={(e) => setPlayerCount(Number(e.target.value))}
          className="w-full h-3 bg-gray-200 rounded-lg cursor-pointer slider"
          style={{
            accentColor: '#7c3aed'
          }}
        />
        <div className="flex justify-between text-xs text-gray-500 mt-2">
          <span>1</span>
          <span>2</span>
          <span>3</span>
          <span>4</span>
          <span>5</span>
          <span>6</span>
          <span>7</span>
          <span>8+</span>
        </div>
      </div>

      {/* Quick Filter Buttons */}
      <div className="flex flex-wrap gap-3">
        <button
          onClick={() => {
            if (gameType === 'jatekok-2-jatekosnak') {
              setGameType('')
            } else {
              setGameType('jatekok-2-jatekosnak')
            }
          }}
          className={`px-4 py-2 rounded-lg font-medium transition-colors ${
            gameType === 'jatekok-2-jatekosnak'
              ? 'bg-gradient-to-r from-primary-purple to-primary-indigo text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          {gameType === 'jatekok-2-jatekosnak' ? '✓ ' : ''}Kétfős játékok
        </button>
        <button
          onClick={() => {
            if (gameType === 'angol-nyelvu-jatekok') {
              setGameType('')
            } else {
              setGameType('angol-nyelvu-jatekok')
            }
          }}
          className={`px-4 py-2 rounded-lg font-medium transition-colors ${
            gameType === 'angol-nyelvu-jatekok'
              ? 'bg-gradient-to-r from-primary-purple to-primary-indigo text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          {gameType === 'angol-nyelvu-jatekok' ? '✓ ' : ''}Angol nyelvű
        </button>
      </div>

      {/* Active Filters Summary */}
      {(gameType || playerCount > 1) && (
        <div className="mt-4 pt-4 border-t border-gray-200">
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600">
              Aktív szűrők: {[
                gameType && 'Típus',
                playerCount > 1 && 'Létszám'
              ].filter(Boolean).join(', ')}
            </span>
            <button
              onClick={() => {
                onFilterChange({ gameType: '', playerCount: 1 })
              }}
              className="text-sm text-primary-indigo hover:underline"
            >
              Szűrők törlése
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

export default FilterPanel
