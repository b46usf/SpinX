/**
 * Auth API Service
 * Handles all backend API calls
 * SINGLE SOURCE - Import this for all API calls
 * Uses AUTH_CONFIG from Config.js - single source of truth
 */

import { AUTH_CONFIG } from './Config.js';

class AuthApi {
  constructor() {
    // Already initialized via AUTH_CONFIG import
  }

  /**
   * Get API URL (from config)
   */
  getApiUrl() {
    return AUTH_CONFIG.API_URL;
  }

  /**
   * Get Client ID (from config)
   */
  getClientId() {
    return AUTH_CONFIG.CLIENT_ID;
  }

  /**
   * Get client IP address from browser
   */
  async getClientIP() {
    try {
      const response = await fetch('https://api.ipify.org?format=json');
      const data = await response.json();
      return data.ip || '';
    } catch (error) {
      console.error('Failed to get IP:', error);
      return '';
    }
  }

  /**
   * Generic API call
   * @param {string} action - Action name
   * @param {Object} data - Additional data
   */
  async call(action, data = {}) {
    try {
      // Get client IP
      const clientIP = await this.getClientIP();
      
      const payload = { action, ...data, ip: clientIP };
      
      const res = await fetch(this.getApiUrl(), {
        method: 'POST',
        body: JSON.stringify(payload),
        redirect: 'follow',
        mode: 'cors',
        headers: {
          'Content-Type': 'application/json'
        }
      });

      const text = await res.text();
      try {
        return JSON.parse(text);
      } catch (parseError) {
        console.error('Failed to parse response:', text);
        return { success: false, message: 'Invalid server response' };
      }
    } catch (error) {
      console.error(`API call failed: ${action}`, error);
      return { success: false, message: 'Koneksi gagal. Periksa jaringan Anda.' };
    }
  }

  // ==================== Auth Actions ====================

  /**
   * Login user
   * @param {Object} userInfo - User info from Google
   */
  async login(userInfo) {
    return this.call('login', {
      email: userInfo.email,
      name: userInfo.name,
      sub: userInfo.sub,
      device: 'web'
    });
  }

  /**
   * Register new user
   * @param {Object} googleUser - Google user info
   * @param {Object} userData - Registration data
   */
  async register(googleUser, userData) {
    return this.call('register', {
      email: googleUser.email,
      name: googleUser.name,
      sub: googleUser.sub,
      role: userData.role,
      noWa: userData.noWa,
      kelas: userData.kelas || '',
      sekolah: userData.sekolah || '',
      foto: googleUser.picture || ''
    });
  }

  /**
   * Verify NIS
   * @param {string} nis - NIS number
   */
  async verifyNIS(nis) {
    return this.call('verifyNIS', { nis });
  }

  /**
   * Generate OTP
   * @param {string} userId - User ID
   * @param {string} noWa - WhatsApp number
   */
  async generateOTP(userId, noWa) {
    return this.call('generateOTP', { userId, noWa });
  }

  /**
   * Verify OTP
   * @param {string} otpId - OTP ID
   * @param {string} otpCode - OTP code
   * @param {string} userId - User ID
   */
  async verifyOTP(otpId, otpCode, userId) {
    return this.call('verifyOTP', { otpId, otpCode, userId });
  }

  /**
   * Get user profile
   * @param {string} userId - User ID
   */
  async getProfile(userId) {
    return this.call('getProfile', { userId });
  }

  // ==================== Game Actions ====================

  /**
   * Spin the wheel
   * @param {string} wa - WhatsApp number
   * @param {string} cid - Customer ID
   */
  async spin(wa, cid) {
    return this.call('spin', { wa, cid });
  }
}

// Create singleton instance
const authApi = new AuthApi();

// Export singleton
export { authApi };

// Also expose to window for backward compatibility
if (typeof window !== 'undefined') {
  window.AuthApi = authApi;
}

