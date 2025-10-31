const API_BASE = ''

/**
 * Fetch all events from Drupal JSON:API
 */
export async function fetchEvents() {
  try {
    const url = `${API_BASE}/jsonapi/node/esemeny?include=field_event_image,field_participants,field_waitlist&sort=-field_event_date`

    const response = await fetch(url, {
      credentials: 'include',
      headers: {
        'Accept': 'application/vnd.api+json',
      }
    })

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    const data = await response.json()
    return data
  } catch (error) {
    console.error('Error fetching events:', error)
    throw error
  }
}

/**
 * Get CSRF token for authenticated requests
 * First try to get from localStorage (login token),
 * fallback to session token
 */
async function getCsrfToken() {
  // Try to get stored token from login
  const storedToken = localStorage.getItem('csrf_token')
  if (storedToken) {
    console.log('✅ Using stored CSRF token from login')
    return storedToken
  }

  // Fallback to session token (for anonymous users)
  console.log('⚠️ No stored token, fetching session token')
  const response = await fetch(`${API_BASE}/session/token`, {
    credentials: 'include'
  })
  return await response.text()
}

/**
 * Register current user for an event
 */
export async function registerForEvent(eventId) {
  try {
    const csrfToken = await getCsrfToken()

    console.log('🔐 Registering with CSRF token:', csrfToken.substring(0, 10) + '...')

    const response = await fetch(`${API_BASE}/api/event/${eventId}/register`, {
      method: 'POST',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
        'X-CSRF-Token': csrfToken,
      }
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error('❌ Registration failed:', response.status, errorText)
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    return await response.json()
  } catch (error) {
    console.error('Error registering for event:', error)
    throw error
  }
}

/**
 * Unregister current user from an event
 */
export async function unregisterFromEvent(eventId) {
  try {
    const csrfToken = await getCsrfToken()

    const response = await fetch(`${API_BASE}/api/event/${eventId}/unregister`, {
      method: 'POST',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
        'X-CSRF-Token': csrfToken,
      }
    })

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    return await response.json()
  } catch (error) {
    console.error('Error unregistering from event:', error)
    throw error
  }
}

/**
 * Get registration status for current user and event
 */
export async function getEventStatus(eventId) {
  try {
    const response = await fetch(`${API_BASE}/api/event/${eventId}/status`, {
      credentials: 'include',
      headers: {
        'Accept': 'application/json',
      }
    })

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    return await response.json()
  } catch (error) {
    console.error('Error getting event status:', error)
    throw error
  }
}

/**
 * Get participants list for an event
 * @param {string} eventId - UUID of the event
 * @returns {Promise<Object>} Participants data with names
 */
export async function getEventParticipants(eventId) {
  try {
    const response = await fetch(`${API_BASE}/api/event/${eventId}/participants`, {
      credentials: 'include',
      headers: {
        'Accept': 'application/json',
      }
    })

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    return await response.json()
  } catch (error) {
    console.error('Error getting event participants:', error)
    throw error
  }
}

/**
 * Create a new event (Editor/Admin only)
 * @param {Object} eventData - Event data
 * @returns {Promise<Object>}
 */
export async function createEvent(eventData) {
  try {
    const csrfToken = await getCsrfToken()

    const body = {
      data: {
        type: 'node--esemeny',
        attributes: {
          title: eventData.title,
          body: {
            value: eventData.description,
            format: 'basic_html'
          },
          field_event_date: eventData.eventDate,
          field_location: eventData.location || 'Board Game Cafe',
          field_max_participants: parseInt(eventData.maxParticipants),
          field_event_type: eventData.eventType || 'tarsasjatek_este'
        }
      }
    }

    // Add image if provided
    if (eventData.imageId) {
      body.data.relationships = {
        field_event_image: {
          data: {
            type: 'file--file',
            id: eventData.imageId
          }
        }
      }
    }

    console.log('📝 Creating event:', body)

    const response = await fetch(`${API_BASE}/jsonapi/node/esemeny`, {
      method: 'POST',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/vnd.api+json',
        'Accept': 'application/vnd.api+json',
        'X-CSRF-Token': csrfToken,
      },
      body: JSON.stringify(body)
    })

    if (!response.ok) {
      const error = await response.json()
      console.error('❌ Event creation failed:', error)
      throw new Error(error.errors?.[0]?.detail || 'Failed to create event')
    }

    return await response.json()
  } catch (error) {
    console.error('Error creating event:', error)
    throw error
  }
}

/**
 * Update an existing event (Editor/Admin only)
 * @param {string} eventId - UUID of the event
 * @param {Object} eventData - Updated event data
 * @returns {Promise<Object>}
 */
export async function updateEvent(eventId, eventData) {
  try {
    const csrfToken = await getCsrfToken()

    const body = {
      data: {
        type: 'node--esemeny',
        id: eventId,
        attributes: {
          title: eventData.title,
          body: {
            value: eventData.description,
            format: 'basic_html'
          },
          field_event_date: eventData.eventDate,
          field_location: eventData.location || 'Board Game Cafe',
          field_max_participants: parseInt(eventData.maxParticipants),
          field_event_type: eventData.eventType || 'tarsasjatek_este'
        }
      }
    }

    // Add image if provided
    if (eventData.imageId) {
      body.data.relationships = {
        field_event_image: {
          data: {
            type: 'file--file',
            id: eventData.imageId
          }
        }
      }
    }

    console.log('📝 Updating event:', eventId, body)

    const response = await fetch(`${API_BASE}/jsonapi/node/esemeny/${eventId}`, {
      method: 'PATCH',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/vnd.api+json',
        'Accept': 'application/vnd.api+json',
        'X-CSRF-Token': csrfToken,
      },
      body: JSON.stringify(body)
    })

    if (!response.ok) {
      const error = await response.json()
      console.error('❌ Event update failed:', error)
      throw new Error(error.errors?.[0]?.detail || 'Failed to update event')
    }

    return await response.json()
  } catch (error) {
    console.error('Error updating event:', error)
    throw error
  }
}

/**
 * Delete an event (Editor/Admin only)
 * @param {string} eventId - UUID of the event
 * @returns {Promise<void>}
 */
export async function deleteEvent(eventId) {
  try {
    const csrfToken = await getCsrfToken()

    console.log('🗑️ Deleting event:', eventId)

    const response = await fetch(`${API_BASE}/jsonapi/node/esemeny/${eventId}`, {
      method: 'DELETE',
      credentials: 'include',
      headers: {
        'X-CSRF-Token': csrfToken,
      }
    })

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    console.log('✅ Event deleted successfully')
  } catch (error) {
    console.error('Error deleting event:', error)
    throw error
  }
}
