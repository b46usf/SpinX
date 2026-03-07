/**
 * Auth API Service
 * Handles all backend API calls
 * Uses single source from AUTH_CONFIG in Config.js
 */

class AuthApi {
  constructor() {
    // API URL will be taken from AUTH_CONFIG
  }

  /**
   * Get API URL (from config)
   */
  getApiUrl() {
    if (typeof AUTH_CONFIG !== 'undefined' && AUTH_CONFIG.API_URL) {
      return AUTH_CONFIG.API_URL;
    }
    // Fallback - should not happen if Config.js is loaded
    console.warn('AUTH_CONFIG not found, using fallback API URL');
    return 'https://script.google.com/macros/s/AKfycby-CC0Kvio5cJsA4n4i8-h1XGdAQweITDzMfScw-08u4lufi-CGfPA0kIoxz4JX1JkR/exec';
  }

  /**
   * Get Client ID (from config)
   */
  getClientId() {
    if (typeof AUTH_CONFIG !== 'undefined' && AUTH_CONFIG.CLIENT_ID) {
      return AUTH_CONFIG.CLIENT_ID;
    }
    return '88663261491-uugvuvfgrq20ftg481k1l6evouh98uon.apps.googleusercontent.com';
  }

  /**
   * Generic API call
   */
  async call(action, data = {}) {
    try {
      const payload = { action, ...data };
      
      const res = await fetch(this.getApiUrl(), {
        method: 'POST',
        body: JSON.stringify(payload),
        redirect: 'follow',
        mode: 'cors',
        headers: {
          'Content-Type': 'text/plain;charset=utf-8'
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

  /**
   * Login user
   */
  async login(userInfo) {
    return this.call('login', {
      email: userInfo.email,
      name: userInfo.name,
      sub: userInfo.sub,
      device: 'web',
      ip: ''
    });
  }

  /**
   * Register new user
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
   */
  async verifyNIS(nis) {
    return this.call('verifyNIS', { nis });
  }

  /**
   * Generate OTP
   */
  async generateOTP(userId, noWa) {
    return this.call('generateOTP', { userId, noWa });
  }

  /**
   * Verify OTP
   */
  async verifyOTP(otpId, otpCode, userId) {
    return this.call('verifyOTP', { otpId, otpCode, userId });
  }

  /**
   * Get user profile
   */
  async getProfile(userId) {
    return this.call('getProfile', { userId });
  }
}

// Export singleton
window.AuthApi = new AuthApi();

