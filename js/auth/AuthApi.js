/**
 * Auth API Service
 * Handles all backend API calls
 */

class AuthApi {
  constructor() {
    this.apiUrl = 'https://script.google.com/macros/s/AKfycbzoapuRNn9OeliSHt3s_DtbzDQ1YNntPFYZ-p5wbYeVbJXrmTlXJuuk-gJZ8kX8CQG2/exec';
  }

  /**
   * Get API URL (from config if available)
   */
  getApiUrl() {
    if (typeof AUTH_CONFIG !== 'undefined' && AUTH_CONFIG.API_URL) {
      return AUTH_CONFIG.API_URL;
    }
    return this.apiUrl;
  }

  /**
   * Get Client ID (from config if available)
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
        body: JSON.stringify(payload)
      });

      return await res.json();
    } catch (error) {
      console.error(`API call failed: ${action}`, error);
      return { success: false, message: 'Koneksi gagal' };
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

