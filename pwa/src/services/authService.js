/**
 * Authentication service for Drupal backend
 * Handles login, registration, logout, and session management
 */

// In production, use empty string (same domain, no /web/ prefix)
// In dev, use empty string for Vite proxy
const API_BASE = '' // Works for both dev and production on jatsszokosan.hu

export const authService = {
  /**
   * Login user with username and password
   * @param {string} username
   * @param {string} password
   * @returns {Promise<Object>} User object
   */
  async login(username, password) {
    try {
      const response = await fetch(`${API_BASE}/user/login?_format=json`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include', // Important for cookies
        body: JSON.stringify({
          name: username,
          pass: password
        })
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.message || 'Hibás felhasználónév vagy jelszó')
      }

      const data = await response.json()

      // Fetch the full user entity from JSON:API to get UUID
      // Use filter by drupal_internal__uid instead of direct ID lookup
      const userEntityResponse = await fetch(`${API_BASE}/jsonapi/user/user?filter[drupal_internal__uid]=${data.current_user.uid}`, {
        headers: {
          'Accept': 'application/vnd.api+json',
        },
        credentials: 'include'
      })

      let userUuid = null
      if (userEntityResponse.ok) {
        const userEntityData = await userEntityResponse.json()
        // The response is an array, get the first item
        userUuid = userEntityData.data?.[0]?.id
        console.log('✅ Fetched user UUID:', userUuid)
      } else {
        console.error('❌ Failed to fetch user UUID:', await userEntityResponse.text())
      }

      if (!userUuid) {
        console.error('⚠️ Could not get UUID, this will cause filtering issues!')
      }

      // Enhance user object with UUID
      const enhancedUser = {
        ...data.current_user,
        id: userUuid || data.current_user.uid // Use UUID if available, fallback to uid
      }

      // Store auth data in localStorage
      localStorage.setItem('csrf_token', data.csrf_token)
      localStorage.setItem('logout_token', data.logout_token)
      localStorage.setItem('user', JSON.stringify(enhancedUser))

      console.log('✅ Sikeres bejelentkezés:', enhancedUser)
      console.log('👤 User ID (UUID):', enhancedUser.id)
      console.log('👤 User UID (numeric):', enhancedUser.uid)

      return enhancedUser
    } catch (error) {
      console.error('❌ Login error:', error)
      throw error
    }
  },

  /**
   * Logout current user
   * @returns {Promise<void>}
   */
  async logout() {
    try {
      const logoutToken = localStorage.getItem('logout_token')

      if (logoutToken) {
        await fetch(`${API_BASE}/user/logout?_format=json&token=${logoutToken}`, {
          method: 'POST',
          credentials: 'include'
        })
      }

      // Clear all auth data
      localStorage.removeItem('csrf_token')
      localStorage.removeItem('logout_token')
      localStorage.removeItem('user')

      console.log('✅ Sikeres kijelentkezés')
    } catch (error) {
      console.error('❌ Logout error:', error)
      // Clear local data anyway
      localStorage.removeItem('csrf_token')
      localStorage.removeItem('logout_token')
      localStorage.removeItem('user')
    }
  },

  /**
   * Check if user is currently logged in
   * @returns {Promise<boolean>}
   */
  async checkLoginStatus() {
    try {
      const response = await fetch(`${API_BASE}/user/login_status?_format=json`, {
        credentials: 'include'
      })
      const status = await response.json()
      return status === 1
    } catch (error) {
      console.error('❌ Login status check error:', error)
      return false
    }
  },

  /**
   * Get authentication headers for API requests
   * @returns {Object} Headers object with CSRF token
   */
  getAuthHeaders() {
    const token = localStorage.getItem('csrf_token')
    return token ? {
      'X-CSRF-Token': token,
      'Content-Type': 'application/vnd.api+json'
    } : {
      'Content-Type': 'application/vnd.api+json'
    }
  },

  /**
   * Get current user from localStorage
   * @returns {Object|null} User object or null
   */
  getCurrentUser() {
    const userJson = localStorage.getItem('user')
    return userJson ? JSON.parse(userJson) : null
  },

  /**
   * Check if user is authenticated (has valid token)
   * @returns {boolean}
   */
  isAuthenticated() {
    return !!localStorage.getItem('csrf_token') && !!localStorage.getItem('user')
  },

  /**
   * Fetch a fresh CSRF token from Drupal
   * This is needed because tokens can expire
   * @returns {Promise<string>} Fresh CSRF token
   */
  async refreshCsrfToken() {
    try {
      const response = await fetch(`${API_BASE}/session/token`, {
        credentials: 'include'
      })

      if (!response.ok) {
        throw new Error('Failed to fetch CSRF token')
      }

      const token = await response.text()

      // Update stored token
      localStorage.setItem('csrf_token', token)

      console.log('✅ CSRF token refreshed')
      return token
    } catch (error) {
      console.error('❌ Error refreshing CSRF token:', error)
      throw error
    }
  }
}

/**
 * Get CSRF token from localStorage
 * @returns {string|null} CSRF token or null
 */
export function getCsrfToken() {
  return localStorage.getItem('csrf_token')
}

/**
 * Get a fresh CSRF token (async version)
 * Use this before making POST/PATCH/DELETE requests
 * @returns {Promise<string>} Fresh CSRF token
 */
export async function getFreshCsrfToken() {
  return await authService.refreshCsrfToken()
}
