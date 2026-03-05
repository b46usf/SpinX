/**
 * Auth State Management
 * Handles user session state
 */

class AuthState {
  constructor() {
    this.currentUser = null;
    this.role = null;
    this.googleUser = null;
    this.callbacks = [];
  }

  /**
   * Set current user
   */
  setUser(user) {
    this.currentUser = user;
    this.role = user?.role || null;
    localStorage.setItem('user', JSON.stringify(user));
  }

  /**
   * Get current user
   */
  getUser() {
    return this.currentUser;
  }

  /**
   * Get current role
   */
  getRole() {
    return this.role;
  }

  /**
   * Set Google user info
   */
  setGoogleUser(googleUser) {
    this.googleUser = googleUser;
  }

  /**
   * Get Google user info
   */
  getGoogleUser() {
    return this.googleUser;
  }

  /**
   * Check if user is logged in
   */
  isLoggedIn() {
    const user = localStorage.getItem('user');
    if (user) {
      this.currentUser = JSON.parse(user);
      this.role = this.currentUser.role;
      return true;
    }
    return false;
  }

  /**
   * Check if user has specific role
   */
  hasRole(role) {
    return this.role === role;
  }

  /**
   * Clear user session
   */
  clearSession() {
    localStorage.removeItem('user');
    this.currentUser = null;
    this.role = null;
    this.googleUser = null;
  }

  /**
   * Register callback for auth state changes
   */
  onAuthChange(callback) {
    this.callbacks.push(callback);
    
    if (this.isLoggedIn()) {
      callback(this.currentUser);
    }
  }

  /**
   * Trigger all registered callbacks
   */
  triggerCallbacks(user, extra = null) {
    this.callbacks.forEach(cb => cb(user, extra));
  }
}

// Export singleton
window.AuthState = new AuthState();

