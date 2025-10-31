/**
 * Permission helper functions
 */

/**
 * Check if user has a specific role
 * @param {Object} user - User object from AuthContext
 * @param {string} role - Role to check (e.g., 'editor', 'administrator')
 * @returns {boolean}
 */
export function hasRole(user, role) {
  if (!user || !user.roles) return false

  // roles is an array of role names
  return user.roles.includes(role)
}

/**
 * Check if user can manage events (is Editor or Administrator)
 * @param {Object} user - User object from AuthContext
 * @returns {boolean}
 */
export function canManageEvents(user) {
  return hasRole(user, 'editor') || hasRole(user, 'administrator')
}

/**
 * Check if user is authenticated
 * @param {Object} user - User object from AuthContext
 * @returns {boolean}
 */
export function isAuthenticated(user) {
  return !!user && !!user.uid
}
