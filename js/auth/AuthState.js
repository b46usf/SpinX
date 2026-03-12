/**
 * Auth State Management
 * Handles user session state
 * Now integrates with JwtManager for JWT-based authentication
 */

import { jwtManager } from './JwtManager.js';

class AuthState {
  constructor() {
    this.currentUser = null;
    this.role = null;
    this.googleUser = null;
    this.callbacks = [];
    
    // Initialize from JWT Manager (for page reload)
    this._initFromJwt();
  }

  /**
   * Initialize from JWT storage
   */
  _initFromJwt() {
    const user = jwtManager.getUser();
    if (user) {
      this.currentUser = user;
      this.role = user.role || null;
    }
  }

  /**
   * Set current user (also updates JWT storage)
   */
  setUser(user) {
    this.currentUser = user;
    this.role = user?.role || null;
    
    // Also store in localStorage for backward compatibility
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
   * Check if user is logged in (using JWT)
   */
  isLoggedIn() {
    // Check JWT Manager first
    if (jwtManager.isTokenValid()) {
      const user = jwtManager.getUser();
      if (user) {
        this.currentUser = user;
        this.role = user.role;
        return true;
      }
    }
    
    // Fallback to legacy localStorage check
    const user = localStorage.getItem('user');
    if (user) {
      try {
        this.currentUser = JSON.parse(user);
        this.role = this.currentUser.role;
        return true;
      } catch (e) {
        return false;
      }
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
   * Clear user session (logout)
   */
  clearSession() {
    // Clear localStorage (legacy)
    localStorage.removeItem('user');
    localStorage.removeItem('admin_google_user');
    localStorage.removeItem('pending_admin_user');
    
    // Clear JWT Manager
    jwtManager.clearAuthData();
    
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
    
    // Also register with JWT Manager
    jwtManager.addAuthListener(callback);
  }

  /**
   * Trigger all registered callbacks
   */
  triggerCallbacks(user, extra = null) {
    this.callbacks.forEach(cb => cb(user, extra));
  }

  /**
   * Get token info
   */
  getTokenInfo() {
    return {
      token: jwtManager.getToken(),
      expiry: jwtManager.getTokenExpiry(),
      isValid: jwtManager.isTokenValid(),
      isExpiringSoon: jwtManager.isTokenExpiringSoon()
    };
  }

  /**
   * Refresh token
   */
  async refreshToken() {
    return jwtManager.refreshToken();
  }
}

// Export singleton (initialized)
window.AuthState = new AuthState();

