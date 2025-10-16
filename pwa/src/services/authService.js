/**
 * Authentication service for Drupal backend
 * Handles login, registration, logout, and session management
 */

const API_BASE = '' // Using Vite proxy, no need for full URL

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

      // Store auth data in localStorage
      localStorage.setItem('csrf_token', data.csrf_token)
      localStorage.setItem('logout_token', data.logout_token)
      localStorage.setItem('user', JSON.stringify(data.current_user))

      console.log('✅ Sikeres bejelentkezés:', data.current_user)

      return data.current_user
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
  }
}
