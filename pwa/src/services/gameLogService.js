/**
 * Game Log API Service
 * Handles CRUD operations for game logs using Drupal JSON:API
 */

import { authService } from './authService'

// In production, use absolute path to bypass /web/pwa/ base
// In dev, use empty string for Vite proxy
const API_BASE = import.meta.env.DEV ? '' : '/web'

export const gameLogService = {
  /**
   * Create a new game log entry
   * @param {Object} gameLogData
   * @returns {Promise<Object>}
   */
  async createGameLog(gameLogData) {
    try {
      const headers = authService.getAuthHeaders()

      // Format date for Drupal
      // If Drupal expects date-only (Y-m-d), extract just the date part
      const formattedDate = gameLogData.date.split('T')[0] // Extract: 2025-10-15

      const body = JSON.stringify({
        data: {
          type: 'node--game_log',
          attributes: {
            title: gameLogData.title,
            field_date: formattedDate,
            field_duration: parseInt(gameLogData.duration),
            field_player_count: parseInt(gameLogData.playerCount),
            field_players: gameLogData.players,
            field_winner: gameLogData.winner || null,
            field_scores: gameLogData.scores ? JSON.stringify(gameLogData.scores) : null,
            field_notes: gameLogData.notes || null,
            field_location: gameLogData.location || 'cafe',
            field_rating: gameLogData.rating ? parseInt(gameLogData.rating) : null,
          },
          relationships: {
            field_game: {
              data: {
                type: 'node--tarsasjatek',
                id: gameLogData.gameId
              }
            }
          }
        }
      })

      console.log('🔑 Request headers:', headers)
      console.log('📦 Request body:', body)
      console.log('🍪 CSRF Token from localStorage:', localStorage.getItem('csrf_token'))
      console.log('👤 User from localStorage:', localStorage.getItem('user'))

      const response = await fetch(`${API_BASE}/jsonapi/node/game_log`, {
        method: 'POST',
        headers: headers,
        credentials: 'include',
        body: body
      })

      if (!response.ok) {
        const error = await response.json()
        console.error('Game log creation error:', error)
        console.error('Full error details:', JSON.stringify(error, null, 2))
        if (error.errors?.[0]) {
          console.error('First error:', error.errors[0])
        }
        throw new Error(error.errors?.[0]?.detail || 'Nem sikerült létrehozni a bejegyzést')
      }

      const data = await response.json()
      console.log('✅ Game log created:', data)
      return data
    } catch (error) {
      console.error('❌ Create game log error:', error)
      throw error
    }
  },

  /**
   * Get all game logs for current user
   * @returns {Promise<Array>}
   */
  async getMyGameLogs() {
    try {
      const user = authService.getCurrentUser()
      if (!user) {
        throw new Error('User not authenticated')
      }

      const response = await fetch(
        `${API_BASE}/jsonapi/node/game_log?filter[uid.id]=${user.uid}&include=field_game,field_game.field_a_jatek_kepe,field_game.field_a_jatek_kepe.field_media_image&sort=-created`,
        {
          headers: {
            'Accept': 'application/vnd.api+json',
          },
          credentials: 'include'
        }
      )

      if (!response.ok) {
        throw new Error('Failed to fetch game logs')
      }

      const data = await response.json()
      return this.transformGameLogs(data)
    } catch (error) {
      console.error('❌ Fetch game logs error:', error)
      throw error
    }
  },

  /**
   * Get all game logs (not just current user)
   * @returns {Promise<Array>}
   */
  async getAllGameLogs() {
    try {
      const response = await fetch(
        `${API_BASE}/jsonapi/node/game_log?include=field_game,field_game.field_a_jatek_kepe,field_game.field_a_jatek_kepe.field_media_image,uid&sort=-created&page[limit]=50`,
        {
          headers: {
            'Accept': 'application/vnd.api+json',
          },
          credentials: 'include'
        }
      )

      if (!response.ok) {
        throw new Error('Failed to fetch game logs')
      }

      const data = await response.json()
      return this.transformGameLogs(data)
    } catch (error) {
      console.error('❌ Fetch all game logs error:', error)
      throw error
    }
  },

  /**
   * Transform Drupal JSON:API response to frontend format
   * @param {Object} drupalData
   * @returns {Array}
   */
  transformGameLogs(drupalData) {
    if (!drupalData.data || drupalData.data.length === 0) {
      return []
    }

    const included = drupalData.included || []

    console.log('🔍 Drupal response has included?', included.length > 0 ? `YES (${included.length} items)` : 'NO')

    return drupalData.data.map(item => {
      // Find related game
      const gameRelationship = item.relationships?.field_game?.data
      const game = gameRelationship ? included.find(inc => inc.id === gameRelationship.id) : null

      // Find game image
      let gameImage = null
      if (game) {
        const mediaRelationship = game.relationships?.field_a_jatek_kepe?.data
        // field_a_jatek_kepe is an array, get first item
        const mediaData = Array.isArray(mediaRelationship) ? mediaRelationship[0] : mediaRelationship
        const media = mediaData ? included.find(inc => inc.id === mediaData.id) : null

        if (media) {
          const imageRelationship = media.relationships?.field_media_image?.data
          const image = imageRelationship ? included.find(inc => inc.id === imageRelationship.id) : null

          if (image?.attributes?.uri?.url) {
            gameImage = `https://dr11.webgraf.hu/web${image.attributes.uri.url}`
          }
        }
      }

      // If no image found in included but we have game ID, construct fallback
      if (!gameImage && gameRelationship?.id) {
        // We could fetch the game separately, but for now use placeholder
        console.log('⚠️ No image found for game:', gameRelationship.id)
      }

      // Parse scores JSON
      let scores = {}
      try {
        if (item.attributes.field_scores) {
          scores = JSON.parse(item.attributes.field_scores)
        }
      } catch (e) {
        console.warn('Failed to parse scores:', e)
      }

      return {
        id: item.id,
        game: {
          id: game?.id || gameRelationship?.id || null,
          title: game?.attributes?.title || item.attributes?.title?.split(' - ')[0] || 'Ismeretlen játék',
          image: gameImage || 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="100" height="100"%3E%3Crect width="100" height="100" fill="%23e5e7eb"/%3E%3Ctext x="50%25" y="50%25" dominant-baseline="middle" text-anchor="middle" font-family="sans-serif" font-size="40" fill="%239ca3af"%3E🎲%3C/text%3E%3C/svg%3E'
        },
        date: item.attributes.field_date,
        duration: item.attributes.field_duration,
        playerCount: item.attributes.field_player_count,
        players: item.attributes.field_players || [],
        winner: item.attributes.field_winner,
        scores: scores,
        location: item.attributes.field_location,
        rating: item.attributes.field_rating,
        notes: item.attributes.field_notes,
        createdBy: item.relationships?.uid?.data?.id,
        createdAt: item.attributes.created
      }
    })
  }
}
