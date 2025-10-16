import React, { createContext, useState, useEffect, useContext } from 'react'
import { authService } from '../services/authService'

const AuthContext = createContext()

/**
 * Authentication Context Provider
 * Manages user authentication state across the app
 */
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  // Check if user is already logged in on mount
  useEffect(() => {
    const checkAuth = async () => {
      try {
        // Check localStorage first (faster)
        const localUser = authService.getCurrentUser()

        if (localUser) {
          // Trust localStorage - don't verify with server on every load
          // This prevents constant logouts due to Drupal session expiry
          setUser(localUser)
          console.log('✅ User restored from localStorage:', localUser)

          // Optionally verify in background (don't await)
          authService.checkLoginStatus().then(isLoggedIn => {
            if (!isLoggedIn) {
              console.log('⚠️ Session expired (detected in background)')
              // Don't auto-logout - let user continue until they try to do something
            }
          }).catch(err => {
            console.log('Session check failed:', err)
          })
        }
      } catch (error) {
        console.error('Auth check error:', error)
        setUser(null)
      } finally {
        setLoading(false)
      }
    }

    checkAuth()
  }, [])

  /**
   * Login user
   * @param {string} username
   * @param {string} password
   * @returns {Promise<void>}
   */
  const login = async (username, password) => {
    try {
      setError(null)
      setLoading(true)

      const userData = await authService.login(username, password)
      setUser(userData)

      console.log('✅ Login successful:', userData)
    } catch (err) {
      console.error('❌ Login failed:', err)
      setError(err.message || 'Bejelentkezés sikertelen')
      throw err
    } finally {
      setLoading(false)
    }
  }

  /**
   * Logout user
   * @returns {Promise<void>}
   */
  const logout = async () => {
    try {
      setLoading(true)
      await authService.logout()
      setUser(null)
      setError(null)
      console.log('✅ Logout successful')
    } catch (err) {
      console.error('❌ Logout error:', err)
      // Clear user anyway
      setUser(null)
    } finally {
      setLoading(false)
    }
  }

  /**
   * Clear error message
   */
  const clearError = () => {
    setError(null)
  }

  const value = {
    user,
    loading,
    error,
    login,
    logout,
    clearError,
    isAuthenticated: !!user
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

/**
 * Custom hook to use auth context
 * @returns {Object} Auth context value
 */
export const useAuth = () => {
  const context = useContext(AuthContext)

  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }

  return context
}
