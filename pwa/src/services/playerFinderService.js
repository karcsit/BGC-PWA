import { getFreshCsrfToken } from './authService.js'

const API_BASE = import.meta.env.VITE_API_BASE_URL || 'https://jatsszokosan.hu'

// Fetch all player finder posts
export async function fetchPlayerFinderPosts() {
  try {
    const url = `${API_BASE}/jsonapi/node/player_finder?include=field_game,field_game_type,uid&sort=-created`

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
    console.error('Error fetching player finder posts:', error)
    throw error
  }
}

// Fetch a single player finder post by ID
export async function fetchPlayerFinderPost(id) {
  try {
    const url = `${API_BASE}/jsonapi/node/player_finder/${id}?include=field_game,field_game_type,uid`

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
    console.error('Error fetching player finder post:', error)
    throw error
  }
}

// Create a new player finder post
export async function createPlayerFinderPost(postData, csrfToken = null) {
  try {
    // Fetch fresh token if not provided
    if (!csrfToken) {
      console.log('🔄 Fetching fresh CSRF token...')
      csrfToken = await getFreshCsrfToken()
    }

    const url = `${API_BASE}/jsonapi/node/player_finder`

    const payload = {
      data: {
        type: 'node--player_finder',
        attributes: postData.attributes || postData
      }
    }

    // Add relationships if provided
    if (postData.relationships && Object.keys(postData.relationships).length > 0) {
      payload.data.relationships = postData.relationships
    }

    console.log('📤 Creating player finder post with payload:', JSON.stringify(payload, null, 2))
    console.log('🔐 Using CSRF token:', csrfToken ? csrfToken.substring(0, 20) + '...' : 'MISSING')

    const response = await fetch(url, {
      method: 'POST',
      credentials: 'include',
      headers: {
        'Accept': 'application/vnd.api+json',
        'Content-Type': 'application/vnd.api+json',
        'X-CSRF-Token': csrfToken
      },
      body: JSON.stringify(payload)
    })

    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(`HTTP error! status: ${response.status}, ${JSON.stringify(errorData)}`)
    }

    const data = await response.json()
    return data
  } catch (error) {
    console.error('Error creating player finder post:', error)
    throw error
  }
}

// Update a player finder post
export async function updatePlayerFinderPost(id, postData, csrfToken = null) {
  try {
    // Fetch fresh token if not provided
    if (!csrfToken) {
      console.log('🔄 Fetching fresh CSRF token...')
      csrfToken = await getFreshCsrfToken()
    }

    const url = `${API_BASE}/jsonapi/node/player_finder/${id}`

    const payload = {
      data: {
        type: 'node--player_finder',
        id: id,
        attributes: postData.attributes || postData
      }
    }

    // Add relationships if provided
    if (postData.relationships && Object.keys(postData.relationships).length > 0) {
      payload.data.relationships = postData.relationships
    }

    const response = await fetch(url, {
      method: 'PATCH',
      credentials: 'include',
      headers: {
        'Accept': 'application/vnd.api+json',
        'Content-Type': 'application/vnd.api+json',
        'X-CSRF-Token': csrfToken
      },
      body: JSON.stringify(payload)
    })

    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(`HTTP error! status: ${response.status}, ${JSON.stringify(errorData)}`)
    }

    const data = await response.json()
    return data
  } catch (error) {
    console.error('Error updating player finder post:', error)
    throw error
  }
}

// Delete a player finder post
export async function deletePlayerFinderPost(id, csrfToken = null) {
  try {
    // Fetch fresh token if not provided
    if (!csrfToken) {
      console.log('🔄 Fetching fresh CSRF token...')
      csrfToken = await getFreshCsrfToken()
    }

    const url = `${API_BASE}/jsonapi/node/player_finder/${id}`

    const response = await fetch(url, {
      method: 'DELETE',
      credentials: 'include',
      headers: {
        'X-CSRF-Token': csrfToken
      }
    })

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    return true
  } catch (error) {
    console.error('Error deleting player finder post:', error)
    throw error
  }
}

// Fetch applications for a player finder post
export async function fetchApplications(postId) {
  try {
    const url = `${API_BASE}/jsonapi/node/player_finder_application?filter[field_finder_post.id]=${postId}&include=uid&sort=-created`

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
    console.error('Error fetching applications:', error)
    throw error
  }
}

// Create an application
export async function createApplication(applicationData, csrfToken = null) {
  try {
    // Fetch fresh token if not provided
    if (!csrfToken) {
      console.log('🔄 Fetching fresh CSRF token...')
      csrfToken = await getFreshCsrfToken()
    }

    const url = `${API_BASE}/jsonapi/node/player_finder_application`

    const response = await fetch(url, {
      method: 'POST',
      credentials: 'include',
      headers: {
        'Accept': 'application/vnd.api+json',
        'Content-Type': 'application/vnd.api+json',
        'X-CSRF-Token': csrfToken
      },
      body: JSON.stringify({
        data: {
          type: 'node--player_finder_application',
          attributes: {
            title: applicationData.title || 'Application',
            field_message: applicationData.field_message,
            field_application_status: applicationData.field_application_status || 'pending'
          },
          relationships: {
            field_finder_post: {
              data: {
                type: 'node--player_finder',
                id: applicationData.postId
              }
            }
          }
        }
      })
    })

    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(`HTTP error! status: ${response.status}, ${JSON.stringify(errorData)}`)
    }

    const data = await response.json()
    return data
  } catch (error) {
    console.error('Error creating application:', error)
    throw error
  }
}
