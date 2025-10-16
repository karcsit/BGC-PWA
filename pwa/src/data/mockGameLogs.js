// Mock data for Game Logs (testing purposes)

export const mockGameLogs = [
  {
    id: '1',
    game: {
      id: 'catan-123',
      title: 'Catan',
      image: '/api/placeholder/100/100'
    },
    date: '2025-01-15T18:30:00',
    duration: 90,
    playerCount: 4,
    players: ['Gábor', 'Anna', 'Péter', 'Kata'],
    winner: 'Gábor',
    scores: {
      'Gábor': 10,
      'Anna': 8,
      'Péter': 7,
      'Kata': 6
    },
    location: 'cafe',
    rating: 5,
    notes: 'Nagyon szoros játék volt! Gábor az utolsó körben nyert.',
    photos: [],
    createdBy: 'user-1',
    createdAt: '2025-01-15T21:00:00'
  },
  {
    id: '2',
    game: {
      id: 'ticket-456',
      title: 'Ticket to Ride Europe',
      image: '/api/placeholder/100/100'
    },
    date: '2025-01-14T19:00:00',
    duration: 75,
    playerCount: 3,
    players: ['Gábor', 'Anna', 'Péter'],
    winner: 'Anna',
    scores: {
      'Gábor': 89,
      'Anna': 102,
      'Péter': 78
    },
    location: 'home',
    rating: 4,
    notes: 'Anna dominált a leghosszabb vonattal.',
    photos: [],
    createdBy: 'user-1',
    createdAt: '2025-01-14T21:30:00'
  },
  {
    id: '3',
    game: {
      id: 'azul-789',
      title: 'Azul',
      image: '/api/placeholder/100/100'
    },
    date: '2025-01-13T17:00:00',
    duration: 45,
    playerCount: 2,
    players: ['Gábor', 'Kata'],
    winner: 'Kata',
    scores: {
      'Gábor': 68,
      'Kata': 75
    },
    location: 'cafe',
    rating: 5,
    notes: 'Gyors és szórakoztató volt!',
    photos: [],
    createdBy: 'user-1',
    createdAt: '2025-01-13T18:00:00'
  },
  {
    id: '4',
    game: {
      id: 'wingspan-101',
      title: 'Wingspan',
      image: '/api/placeholder/100/100'
    },
    date: '2025-01-12T20:00:00',
    duration: 120,
    playerCount: 4,
    players: ['Gábor', 'Anna', 'Péter', 'Eszter'],
    winner: 'Péter',
    scores: {
      'Gábor': 78,
      'Anna': 82,
      'Péter': 91,
      'Eszter': 69
    },
    location: 'cafe',
    rating: 5,
    notes: 'Péter nagyon jó stratégiával játszott. Gyönyörű játék!',
    photos: [],
    createdBy: 'user-1',
    createdAt: '2025-01-12T23:00:00'
  },
  {
    id: '5',
    game: {
      id: 'splendor-202',
      title: 'Splendor',
      image: '/api/placeholder/100/100'
    },
    date: '2025-01-10T18:00:00',
    duration: 30,
    playerCount: 3,
    players: ['Gábor', 'Anna', 'Kata'],
    winner: 'Gábor',
    scores: {
      'Gábor': 15,
      'Anna': 12,
      'Kata': 11
    },
    location: 'cafe',
    rating: 4,
    notes: 'Gyors parti, jó bemelegítés volt.',
    photos: [],
    createdBy: 'user-1',
    createdAt: '2025-01-10T18:45:00'
  }
]

// Helper functions
export const getGameLogStats = (logs) => {
  return {
    totalGames: logs.length,
    totalHours: Math.round(logs.reduce((sum, log) => sum + log.duration, 0) / 60),
    mostPlayedGame: getMostPlayedGame(logs),
    winRate: calculateWinRate(logs, 'Gábor') // Example for current user
  }
}

const getMostPlayedGame = (logs) => {
  const gameCounts = {}
  logs.forEach(log => {
    const gameTitle = log.game.title
    gameCounts[gameTitle] = (gameCounts[gameTitle] || 0) + 1
  })

  const entries = Object.entries(gameCounts)
  if (entries.length === 0) return 'N/A'

  return entries.reduce((a, b) => a[1] > b[1] ? a : b)[0]
}

const calculateWinRate = (logs, playerName) => {
  if (logs.length === 0) return 0
  const wins = logs.filter(log => log.winner === playerName).length
  return Math.round((wins / logs.length) * 100)
}

export const formatDuration = (minutes) => {
  const hours = Math.floor(minutes / 60)
  const mins = minutes % 60

  if (hours === 0) {
    return `${mins} perc`
  } else if (mins === 0) {
    return `${hours} óra`
  } else {
    return `${hours}h ${mins}m`
  }
}

export const formatDate = (dateString) => {
  const date = new Date(dateString)
  const now = new Date()
  const diffDays = Math.floor((now - date) / (1000 * 60 * 60 * 24))

  if (diffDays === 0) return 'Ma'
  if (diffDays === 1) return 'Tegnap'
  if (diffDays < 7) return `${diffDays} napja`

  return date.toLocaleDateString('hu-HU', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  })
}

export const locationLabels = {
  cafe: 'Board Game Cafe',
  home: 'Otthon',
  other: 'Egyéb'
}
