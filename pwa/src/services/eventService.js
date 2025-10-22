const API_BASE = ''

/**
 * Fetch all events from Drupal JSON:API
 */
export async function fetchEvents() {
  try {
    const url = `${API_BASE}/jsonapi/node/esemeny?include=field_event_image,field_event_image.field_media_image,field_participants,field_waitlist&sort=-field_event_date`

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
 */
async function getCsrfToken() {
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

    const response = await fetch(`${API_BASE}/api/event/${eventId}/register`, {
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
