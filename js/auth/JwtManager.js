/**
 * JWT Manager Module
 * Handles JWT token storage, retrieval, and refresh
 * Integrates with AuthState for unified session management
 * Uses localStorage with encryption support
 */

import { AUTH_CONFIG } from './Config.js';

class JwtManager {
  constructor() {
    // Storage keys
    this.TOKEN_KEY = 'jwt_token';
    this.TOKEN_EXPIRY_KEY = 'jwt_token_expiry';
    this.USER_KEY = 'jwt_user';
    
    // Token refresh threshold (1 hour before expiry)
    this.REFRESH_THRESHOLD = 3600;
    
    // Callbacks for auth state changes
    this.listeners = [];
  }

  /**
   * Get the stored JWT token
   * @returns {string|null}
   */
  getToken() {
    return localStorage.getItem(this.TOKEN_KEY);
  }

  /**
   * Get the token expiry timestamp
   * @returns {number|null}
   */
  getTokenExpiry() {
    const expiry = localStorage.getItem(this.TOKEN_EXPIRY_KEY);
    return expiry ? parseInt(expiry, 10) : null;
  }

  /**
   * Get stored user data
   * @returns {Object|null}
   */
  getUser() {
    const userStr = localStorage.getItem(this.USER_KEY);
    if (userStr) {
      try {
        return JSON.parse(userStr);
      } catch (e) {
        return null;
      }
    }
    return null;
  }

  /**
   * Store JWT token and user data
   * @param {Object} data - Token and user data from login response
   */
  setAuthData(data) {
    if (data.token) {
      localStorage.setItem(this.TOKEN_KEY, data.token);
    }
    
    if (data.tokenExpiresAt) {
      const expiry = new Date(data.tokenExpiresAt).getTime();
      localStorage.setItem(this.TOKEN_EXPIRY_KEY, expiry.toString());
    }
    
    if (data.user) {
      localStorage.setItem(this.USER_KEY, JSON.stringify(data.user));
      // Also update AuthState
      if (window.AuthState) {
        window.AuthState.setUser(data.user);
      }
    }
    
    // Notify listeners
    this.notifyListeners(data.user);
  }

  /**
   * Clear all auth data (logout)
   */
  clearAuthData() {
    localStorage.removeItem(this.TOKEN_KEY);
    localStorage.removeItem(this.TOKEN_EXPIRY_KEY);
    localStorage.removeItem(this.USER_KEY);
    
    // Also clear AuthState
    if (window.AuthState) {
      window.AuthState.clearSession();
    }
    
    // Notify listeners
    this.notifyListeners(null);
  }

  /**
   * Check if token is valid (exists and not expired)
   * @returns {boolean}
   */
  isTokenValid() {
    const token = this.getToken();
    const expiry = this.getTokenExpiry();
    
    if (!token || !expiry) {
      return false;
    }
    
    const now = Date.now();
    return now < expiry;
  }

  /**
   * Check if token is about to expire
   * @returns {boolean}
   */
  isTokenExpiringSoon() {
    const expiry = this.getTokenExpiry();
    
    if (!expiry) {
      return true;
    }
    
    const now = Date.now();
    const timeUntilExpiry = (expiry - now) / 1000; // Convert to seconds
    
    return timeUntilExpiry < this.REFRESH_THRESHOLD;
  }

  /**
   * Get Authorization header value
   * @returns {string}
   */
  getAuthHeader() {
    const token = this.getToken();
    if (!token) {
      return '';
    }
    return `Bearer ${token}`;
  }

  /**
   * Refresh the JWT token
   * @returns {Promise<boolean>}
   */
  async refreshToken() {
    const currentToken = this.getToken();
    
    if (!currentToken) {
      return false;
    }
    
    try {
      const response = await fetch(AUTH_CONFIG.API_URL, {
        method: 'POST',
        body: JSON.stringify({
          action: 'refreshToken',
          authorization: this.getAuthHeader()
        }),
        headers: {
          'Content-Type': 'application/json',
          'Authorization': this.getAuthHeader()
        }
      });
      
      const result = await response.json();
      
      if (result.success && result.token) {
        // Update stored token
        localStorage.setItem(this.TOKEN_KEY, result.token);
        
        if (result.tokenExpiresAt) {
          const expiry = new Date(result.tokenExpiresAt).getTime();
          localStorage.setItem(this.TOKEN_EXPIRY_KEY, expiry.toString());
        }
        
        return true;
      }
      
      // Token refresh failed, clear auth data
      if (result.requireLogin) {
        this.clearAuthData();
      }
      
      return false;
    } catch (error) {
      console.error('Token refresh failed:', error);
      return false;
    }
  }

  /**
   * Ensure valid token (refresh if needed)
   * @returns {Promise<boolean>}
   */
  async ensureValidToken() {
    if (!this.isTokenValid()) {
      return false;
    }
    
    if (this.isTokenExpiringSoon()) {
      // Try to refresh token
      const refreshed = await this.refreshToken();
      if (!refreshed) {
        // If refresh failed, check if current token is still valid
        return this.isTokenValid();
      }
    }
    
    return true;
  }

  /**
   * Add listener for auth state changes
   * @param {Function} callback
   */
  addAuthListener(callback) {
    this.listeners.push(callback);
  }

  /**
   * Remove listener
   * @param {Function} callback
   */
  removeAuthListener(callback) {
    const index = this.listeners.indexOf(callback);
    if (index > -1) {
      this.listeners.splice(index, 1);
    }
  }

  /**
   * Notify all listeners
   * @param {Object} user
   */
  notifyListeners(user) {
    this.listeners.forEach(callback => {
      try {
        callback(user);
      } catch (e) {
        console.error('Auth listener error:', e);
      }
    });
  }

  /**
   * Decode JWT token (without validation)
   * @param {string} token
   * @returns {Object|null}
   */
  decodeToken(token) {
    if (!token) return null;
    
    try {
      const parts = token.split('.');
      if (parts.length !== 3) return null;
      
      const base64Url = parts[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const jsonPayload = decodeURIComponent(
        atob(base64)
          .split('')
          .map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
          .join('')
      );
      return JSON.parse(jsonPayload);
    } catch (e) {
      return null;
    }
  }

  /**
   * Get token payload
   * @returns {Object|null}
   */
  getTokenPayload() {
    const token = this.getToken();
    return this.decodeToken(token);
  }

  /**
   * Get user role from token
   * @returns {string|null}
   */
  getUserRole() {
    const payload = this.getTokenPayload();
    return payload?.role || null;
  }

  /**
   * Check if user has specific role
   * @param {string} role
   * @returns {boolean}
   */
  hasRole(role) {
    return this.getUserRole() === role;
  }

  /**
   * Get user ID from token
   * @returns {string|null}
   */
  getUserId() {
    const payload = this.getTokenPayload();
    return payload?.sub || null;
  }

  /**
   * Get user email from token
   * @returns {string|null}
   */
  getUserEmail() {
    const payload = this.getTokenPayload();
    return payload?.email || null;
  }
}

// Create singleton instance
const jwtManager = new JwtManager();

// Export
export { jwtManager };

// Also expose globally for backward compatibility
window.jwtManager = jwtManager;

