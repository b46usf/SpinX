
/**
 * Auth API Service
 * Handles all backend API calls
 * SINGLE SOURCE - Import this for all API calls
 * Uses AUTH_CONFIG from Config.js - single source of truth
 * Shows Toast notifications for all responses
 * Uses JWT Bearer token for authentication
 */

import { AUTH_CONFIG } from './Config.js';
import { jwtManager } from './JwtManager.js';

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
   * Get Authorization header with Bearer token
   */
  getAuthHeader() {
    return jwtManager.getAuthHeader();
  }

  /**
   * Show Toast notification based on response
   */
  showResponseToast(result, action) {
    const Toast = getToast();
    if (!Toast) return;
    const schoolStatus = (result.schoolStatus || result.school?.rawStatus || result.school?.status || result.reason || '').toString().toLowerCase();
    const hasSchoolStatusModal = window.loginComponent && window.loginComponent.showSchoolStatusModal;
    const shouldShowSchoolStatusModal = (
      result.error === 'SCHOOL_PENDING_APPROVAL' ||
      result.error === 'SCHOOL_RENEWAL_PENDING' ||
      schoolStatus === 'pending_school' ||
      schoolStatus === 'pending_renewal' ||
      schoolStatus === 'renewal_pending'
    );

    if (action === 'login' && result.registered === false) {
      if (result.registerRole === 'admin-sekolah') {
        Toast.info('Lengkapi Data Admin Sekolah', result.message || 'Lanjutkan registrasi admin sekolah.');
      }
      return;
    }

    // Determine which message to show
    if (result.success === true) {
      // Success - show success toast for important actions
      const successMessages = {
        'login': 'Login berhasil!',
        'register': 'Registrasi berhasil!',
        'registerschoolpending': result.message || 'Data sekolah berhasil dikirim.',
        'approveschool': result.message || 'Sekolah berhasil di-approve.',
        'upgradeplan': result.message || 'Subscription sekolah berhasil diperbarui.',
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

      if (shouldShowSchoolStatusModal && !window.showingSchoolModal) {
        window.showingSchoolModal = true;
        if (hasSchoolStatusModal) {
          window.loginComponent.showSchoolStatusModal(result).finally(() => {
            window.showingSchoolModal = false;
          });
        } else {
          Toast.info('Status Sekolah', message);
          window.showingSchoolModal = false;
        }
        return;
      }
      
      // NEW: School subscription invalid → Custom modal
      if (result.error === 'SCHOOL_SUBSCRIPTION_INVALID') {
        if (
          schoolStatus === 'pending_school' ||
          schoolStatus === 'pending_renewal' ||
          schoolStatus === 'renewal_pending'
        ) {
          if (hasSchoolStatusModal) {
            window.loginComponent.showSchoolStatusModal(result);
          } else {
            Toast.info('Status Sekolah', message);
          }
          return;
        }
        // Don't show toast - use custom modal instead
        if (window.loginComponent && window.loginComponent.showSubscriptionModal && !window.showingSubscriptionModal) {
          window.showingSubscriptionModal = true;
          window.loginComponent.showSubscriptionModal(result).finally(() => {
            window.showingSubscriptionModal = false;
          });
        } else {
          Toast.error('Subscription Expired', message);
        }
        return;
      }

      // Special handling for specific errors
      if (result.error === 'TELEGRAM_NOT_LINKED') {
        Toast.warning('Telegram Belum Terhubung', message);
      } else if (result.error === 'USER_PENDING') {
        Toast.warning('Verifikasi Diperlukan', message);
      } else if (result.error === 'SCHOOL_PENDING_APPROVAL') {
        Toast.info('Akun Belum Approved', message);
      } else if (result.error === 'SCHOOL_RENEWAL_PENDING') {
        Toast.info('Renewal Sedang Diproses', message);
      } else if (result.error === 'SCHOOL_INACTIVE') {
        Toast.warning('Status Sekolah Belum Aktif', message);
      } else if (result.error === 'OTP_EXPIRED') {
        Toast.warning('OTP Expired', message);
      } else if (result.error === 'OTP_INVALID') {
        Toast.warning('OTP Salah', message);
      } else if (result.error === 'USER_BLOCKED') {
        Toast.error('Akun Diblokir', message);
      } else if (result.error === 'TOKEN_EXPIRED' || result.error === 'INVALID_TOKEN') {
        Toast.warning('Sesi Habis', 'Silakan login kembali');
        setTimeout(() => {
          jwtManager.clearAuthData();
          window.location.href = 'index.html';
        }, 2000);
      } else {
        Toast.error('Gagal', message);
      }
    }
    // If success is undefined/null, don't show toast (it's probably a query)
  }

  /**
   * Generic API call with JWT authentication
   * @param {string} action - Action name
   * @param {Object} data - Additional data
   * @param {boolean} showToast - Whether to show toast notification (default: true)
   */
  async call(action, data = {}, showToast = true) {
    const Toast = getToast();
    
    try {
      // Get client IP
      const clientIP = await this.getClientIP();
      
      // Get auth header (Bearer token)
      const authHeader = this.getAuthHeader();
      
      const payload = {
        action,
        ...data,
        ip: clientIP
      };

      // GAS web apps often do not expose Authorization headers in doPost(e),
      // so send the bearer token in the JSON body as a fallback.
      if (authHeader) {
        payload.authorization = authHeader;
      }
      
      // Build headers
      const headers = {
        'Content-Type': 'application/json'
      };
      
      // Add Authorization header if available
      if (authHeader) {
        headers['Authorization'] = authHeader;
      }
      
      const res = await fetch(this.getApiUrl(), {
        method: 'POST',
        body: JSON.stringify(payload),
        redirect: 'follow',
        mode: 'cors',
        headers: headers
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

  // Handle token in response (for login action) + subscription check
        if (result.token && action === 'login') {
        // Subscription check for non-admin-system (bypass system admin) - FIXED: Defensive load check
        if (result.user && result.user.role !== 'admin-system') {
          if (window.SubscriptionGuard?.verify) {
            try {
              await window.SubscriptionGuard.verify(result.user);
            } catch (error) {
              console.warn('SubscriptionGuard verify failed:', error.message);
              // Continue login - don't block dashboard (subscription checked in BE)
            }
          } else {
            console.warn('SubscriptionGuard not loaded - bypassing check (backend already validated)');
            // Continue login safely
          }
        }
        
        jwtManager.setAuthData({
          token: result.token,
          tokenExpiresAt: result.tokenExpiresAt,
          tokenExpiresIn: result.tokenExpiresIn,
          user: result.user
        });
      }

      // Handle token refresh response
      if (result.success && result.token && action === 'refreshToken') {
        jwtManager.setAuthData({
          token: result.token,
          tokenExpiresAt: result.tokenExpiresAt,
          tokenExpiresIn: result.tokenExpiresIn
        });
      }

      // Handle requireLogin - token invalid/expired
      if (result.requireLogin) {
        jwtManager.clearAuthData();
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
  async login(userInfo, showToast = true) {
    return this.call('login', {
      email: userInfo.email,
      name: userInfo.name,
      sub: userInfo.sub,
      device: 'web'
    }, showToast);
  }

  /**
   * Register new user
   * @param {Object} googleUser - Google user info
   * @param {Object} userData - Registration data
   */
  async register(googleUser, userData, showToast = true) {
    return this.call('register', {
      email: googleUser.email,
      name: userData.name,
      sub: googleUser.sub,
      role: userData.role,
      noWa: userData.noWa,
      kelas: userData.kelas || '',
      sekolah: userData.sekolah || '',
      foto: googleUser.picture || ''
    }, showToast);
  }

  /**
   * Refresh JWT token
   */
  async refreshToken() {
    return this.call('refreshToken', {}, false);
  }

  /**
   * Verify NIS
   * @param {string} nis - NIS number
   */
  async verifyNIS(nis) {
    return this.call('verifyNIS', { nis }, false); // Don't show toast for queries
  }

  /**
   * Verify Kode Guru
   * @param {string} kodeGuru - Kode Guru
   */
  async verifyKodeGuru(kodeGuru) {
    return this.call('verifykodeguru', { kode_guru: kodeGuru }, false); // Don't show toast for queries
  }

  /**
   * Get unique kelas options
   */
  async getUniqueKelas() {
    return this.call('getuniquekelas', {}, false); // Don't show toast for queries
  }

  /**
   * Get sekolah by kelas
   * @param {string} kelas - Kelas name
   */
  async getSekolahByKelas(kelas) {
    return this.call('getsekolahbykelas', { kelas: kelas }, false); // Don't show toast for queries
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

  /**
   * Get dynamic pricing plans from BE (single source of truth)
   */
  async getPricePlans() {
    return this.call('getpriceplans', {}, false);
  }

  // ==================== School Subscription Actions ====================

  /**
   * Register new school (pending approval)
   */
  async registerSchoolPending(payload, showToast = true) {
    return this.call('registerschoolpending', payload, showToast);
  }

  /**
   * Register school renewal (for expired subscriptions)
   */
  async registerSchoolRenewal(payload, showToast = true) {
    return this.call('registerschoolrenewal', payload, showToast);
  }

  /**
   * Approve pending school (admin-system only)
   */
  async approveSchool(schoolIdOrPayload) {
    const payload = typeof schoolIdOrPayload === 'object' && schoolIdOrPayload !== null
      ? schoolIdOrPayload
      : { schoolId: schoolIdOrPayload };

    return this.call('approveschool', payload);
  }

  /**
   * Reject pending school registration or renewal
   */
  async rejectSchool(schoolIdOrPayload) {
    const payload = typeof schoolIdOrPayload === 'object' && schoolIdOrPayload !== null
      ? schoolIdOrPayload
      : { schoolId: schoolIdOrPayload };

    return this.call('rejectschool', payload);
  }

  /**
   * Reactivate or extend school subscription using current/new plan
   */
  async upgradeSchoolPlan(schoolIdOrPayload, plan) {
    const payload = typeof schoolIdOrPayload === 'object' && schoolIdOrPayload !== null
      ? schoolIdOrPayload
      : { schoolId: schoolIdOrPayload, plan };

    return this.call('upgradeplan', payload);
  }

  // ==================== Admin Actions ====================

  /**
   * Get admin dashboard stats
   */
  async getStats() {
    return this.call('getStats', {}, false);
  }

  /**
   * Get admin system dashboard stats
   */
  async getAdminStats() {
    return this.call('getAdminStats', {}, false);
  }

  /**
   * Get recent activity
   */
  async getRecentActivity() {
    return this.call('getRecentActivity', {}, false);
  }

  /**
   * Get all schools
   */
  async getAllSchools() {
    return this.call('getAllSchools', {}, false);
  }

  /**
   * Get subscription stats
   */
  async getSubscriptionStats() {
    return this.call('getSubscriptionStats', {}, false);
  }

  /**
   * Get subscription status config from backend source-of-truth
   */
  async getSubscriptionStatusConfig() {
    return this.call('getSubscriptionStatusConfig', {}, false);
  }

  /**
   * Get invoices
   */
  async getInvoices() {
    return this.call('getInvoices', {}, false);
  }

  /**
   * Toggle school status
   */
  async toggleSchool(schoolId, status) {
    return this.call('toggleSekolah', { schoolId, status });
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


