
/**
 * Auth API Service
 * Handles all backend API calls
 * SINGLE SOURCE - Import this for all API calls
 * Uses AUTH_CONFIG from Config.js - single source of truth
 * Shows Toast notifications for all responses
 */

import { AUTH_CONFIG } from './Config.js';

// Get Toast functions from global
const getToast = () => window.Toast || null;

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
   * Show Toast notification based on response
   */
  showResponseToast(result, action) {
    const Toast = getToast();
    if (!Toast) return;

    // Determine which message to show
    if (result.success === true) {
      // Success - show success toast for important actions
      const successMessages = {
        'login': 'Login berhasil!',
        'register': 'Registrasi berhasil!',
        'generateOTP': 'OTP telah dikirim!',
        'verifyOTP': 'Verifikasi berhasil!',
        'spin': 'Berhasil!'
      };
      
      const message = successMessages[action] || result.message || 'Berhasil';
      Toast.success('Sukses', message);
    } else if (result.success === false) {
      // Error from server
      const errorMessages = {
        'login': result.message || 'Login gagal',
        'register': result.message || 'Registrasi gagal',
        'generateOTP': result.message || 'Gagal mengirim OTP',
        'verifyOTP': result.message || 'Verifikasi gagal',
        'spin': result.message || 'Gagal bermain'
      };
      
      const message = errorMessages[action] || result.message || 'Terjadi kesalahan';
      
      // Special handling for specific errors
      if (result.error === 'TELEGRAM_NOT_LINKED') {
        Toast.warning('Telegram Belum Terhubung', message);
      } else if (result.error === 'OTP_EXPIRED') {
        Toast.warning('OTP Expired', message);
      } else if (result.error === 'OTP_INVALID') {
        Toast.warning('OTP Salah', message);
      } else if (result.error === 'USER_BLOCKED') {
        Toast.error('Akun Diblokir', message);
      } else {
        Toast.error('Gagal', message);
      }
    }
    // If success is undefined/null, don't show toast (it's probably a query)
  }

  /**
   * Generic API call
   * @param {string} action - Action name
   * @param {Object} data - Additional data
   * @param {boolean} showToast - Whether to show toast notification (default: true)
   */
  async call(action, data = {}, showToast = true) {
    const Toast = getToast();
    
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
      let result;
      try {
        result = JSON.parse(text);
      } catch (parseError) {
        console.error('Failed to parse response:', text);
        
        if (showToast && Toast) {
          Toast.error('Error', 'Respons server tidak valid');
        }
        
        return { 
          success: false, 
          message: 'Respons server tidak valid',
          raw: text 
        };
      }

      // Show Toast notification for the response
      if (showToast) {
        this.showResponseToast(result, action);
      }

      return result;
      
    } catch (error) {
      console.error(`API call failed: ${action}`, error);
      
      if (showToast && Toast) {
        Toast.error('Koneksi Gagal', 'Tidak dapat terhubung ke server. Periksa jaringan Anda.');
      }
      
      return { 
        success: false, 
        message: 'Koneksi gagal. Periksa jaringan Anda.',
        error: error.message 
      };
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
      name: userData.name,
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
    return this.call('verifyNIS', { nis }, false); // Don't show toast for queries
  }

  /**
   * Generate OTP
   * @param {string} userId - User ID
   * @param {string} email - Email address
   */
  async generateOTP(userId, email) {
    return this.call('generateOTP', { userId, email });
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
    return this.call('getProfile', { userId }, false); // Don't show toast for queries
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

  // ==================== Admin Actions ====================

  /**
   * Get admin dashboard stats
   */
  async getStats() {
    return this.call('getStats', {}, false);
  }

  /**
   * Get recent activity
   */
  async getRecentActivity() {
    return this.call('getRecentActivity', {}, false);
  }

  // ==================== Guru Actions ====================

  /**
   * Get students activity for guru
   */
  async getStudentsActivity() {
    return this.call('getStudentsActivity', {}, false);
  }

  /**
   * Get top vouchers
   */
  async getTopVouchers() {
    return this.call('getTopVouchers', {}, false);
  }

  // ==================== Mitra Actions ====================

  /**
   * Get mitra dashboard stats
   */
  async getMitraStats() {
    return this.call('getMitraStats', {}, false);
  }

  /**
   * Redeem voucher
   * @param {string} code - Voucher code
   */
  async redeemVoucher(code) {
    return this.call('redeemVoucher', { kode: code });
  }

  /**
   * Get redeem history
   */
  async getRedeemHistory() {
    return this.call('getRedeemHistory', {}, false);
  }

  // ==================== Siswa Actions ====================

  /**
   * Get student vouchers
   */
  async getVouchers() {
    return this.call('getVouchers', {}, false);
  }

  /**
   * Get play count
   */
  async getPlayCount() {
    return this.call('getPlayCount', {}, false);
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


