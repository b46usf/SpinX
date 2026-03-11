/**
 * Admin Register Module
 * Handles admin registration with simplified form
 * Flow: Get Google user data → Fill form (no_wa only) → Register → Telegram link → OTP verification
 * Reuses existing modules (DRY principle)
 */

import { AUTH_CONFIG } from '../auth/Config.js';
import { authApi } from '../auth/AuthApi.js';

// Get Toast from global
const getToast = () => window.Toast || null;

class AdminRegister {
  constructor() {
    this.initialized = false;
    this.googleUser = null;
    this.registeredUser = null;
  }

  /**
   * Initialize admin register
   */
  async init() {
    // Get stored Google user data
    this.googleUser = this.getStoredGoogleUser();
    
    if (!this.googleUser) {
      // No Google user data - redirect to admin login
      this.redirectToLogin();
      return;
    }

    // Display user info
    this.displayUserInfo();

    // Check for telegram link action
    this.checkTelegramAction();

    // Setup form events
    this.setupFormEvents();

    this.initialized = true;
  }

  /**
   * Get stored Google user data
   */
  getStoredGoogleUser() {
    const stored = localStorage.getItem('admin_google_user');
    if (stored) {
      try {
        return JSON.parse(stored);
      } catch (e) {
        return null;
      }
    }
    return null;
  }

  /**
   * Display user info from Google
   */
  displayUserInfo() {
    const avatarEl = document.getElementById('register-avatar');
    const nameEl = document.getElementById('register-name');
    const emailEl = document.getElementById('register-email');
    const roleEl = document.getElementById('register-role');

    if (avatarEl && this.googleUser.picture) {
      avatarEl.src = this.googleUser.picture;
    }
    if (nameEl) {
      nameEl.textContent = this.googleUser.name || '';
    }
    if (emailEl) {
      emailEl.textContent = this.googleUser.email || '';
    }
    if (roleEl) {
      roleEl.textContent = '👑 Admin Sistem';
    }

    // Pre-fill nama from Google
    const namaInput = document.getElementById('nama');
    if (namaInput && this.googleUser.name) {
      namaInput.value = this.googleUser.name;
    }
  }

  /**
   * Check for telegram link action in URL
   */
  checkTelegramAction() {
    const urlParams = new URLSearchParams(window.location.search);
    const action = urlParams.get('action');
    const link = urlParams.get('link');

    if (action === 'link-telegram' && link) {
      // Show telegram link section
      this.showTelegramLink(decodeURIComponent(link));
    }
  }

  /**
   * Setup form events
   */
  setupFormEvents() {
    const form = document.getElementById('admin-register-form');
    if (form) {
      form.addEventListener('submit', (e) => {
        e.preventDefault();
        this.handleSubmit();
      });
    }

    const cancelBtn = document.getElementById('cancel-register');
    if (cancelBtn) {
      cancelBtn.addEventListener('click', () => {
        this.handleCancel();
      });
    }

    const checkStatusBtn = document.getElementById('check-status-btn');
    if (checkStatusBtn) {
      checkStatusBtn.addEventListener('click', () => {
        this.checkVerificationStatus();
      });
    }
  }

  /**
   * Handle form submission
   */
  async handleSubmit() {
    const Toast = getToast();
    const noWa = document.getElementById('noWa')?.value.trim();
    const nama = document.getElementById('nama')?.value.trim();

    // Validation
    if (!noWa) {
      this.showError('Nomor WhatsApp wajib diisi');
      if (Toast) {
        Toast.error('Error', 'Nomor WhatsApp wajib diisi');
      }
      return;
    }

    if (!nama) {
      this.showError('Nama wajib diisi');
      if (Toast) {
        Toast.error('Error', 'Nama wajib diisi');
      }
      return;
    }

    if (!/^[\d\s\-+()]{10,}$/.test(noWa)) {
      this.showError('Nomor WhatsApp tidak valid');
      if (Toast) {
        Toast.error('Error', 'Nomor WhatsApp tidak valid');
      }
      return;
    }

    const loading = Toast ? Toast.loading('Mendaftarkan admin...') : null;

    try {
      // Prepare registration data
      const userData = {
        name: nama,
        role: 'admin-system',
        noWa: noWa,
        kelas: '-',  // Admin system uses "-"
        sekolah: '-' // Admin system uses "-"
      };

      // Call register API
      const result = await authApi.register(this.googleUser, userData);

      if (loading) loading.close();

      if (result.success) {
        // Registration successful
        this.registeredUser = result.user;
        
        // Store user data for OTP verification
        localStorage.setItem('pending_admin_user', JSON.stringify({
          userId: result.user.userId,
          email: result.user.email,
          name: result.user.name,
          noWa: result.user.noWa,
          role: result.user.role
        }));

        // Show telegram link section
        this.showTelegramLink(result.user.telegramLink);

        if (Toast) {
          Toast.success('Registrasi Berhasil', 'Silakan hubungkan Telegram untuk verifikasi OTP.');
        }
      } else {
        this.showError(result.message || 'Registrasi gagal');
        if (Toast) {
          Toast.error('Error', result.message || 'Registrasi gagal');
        }
      }
    } catch (error) {
      if (loading) loading.close();
      console.error('Admin register error:', error);
      this.showError('Terjadi kesalahan saat registrasi');
      if (Toast) {
        Toast.error('Error', 'Terjadi kesalahan saat registrasi');
      }
    }
  }

  /**
   * Show Telegram link section
   * @param {string} telegramLink - Telegram deep link
   */
  showTelegramLink(telegramLink) {
    // Hide form, show telegram section
    const formSection = document.getElementById('register-form-section');
    const telegramSection = document.getElementById('telegram-section');
    const telegramLinkEl = document.getElementById('telegram-link');

    if (formSection) formSection.classList.add('hidden');
    if (telegramSection) telegramSection.classList.remove('hidden');
    if (telegramLinkEl) telegramLinkEl.href = telegramLink;

    // Store telegram link
    this.telegramLink = telegramLink;
  }

  /**
   * Check verification status
   */
  async checkVerificationStatus() {
    const Toast = getToast();
    const userData = localStorage.getItem('pending_admin_user');
    
    if (!userData) {
      if (Toast) {
        Toast.error('Error', 'Data user tidak ditemukan. Silakan login ulang.');
      }
      return;
    }

    const user = JSON.parse(userData);
    const loading = Toast ? Toast.loading('Memeriksa status verifikasi...') : null;

    try {
      // Get user profile to check status
      const result = await authApi.getProfile(user.userId);

      if (loading) loading.close();

      if (result.success && result.user) {
        if (result.user.status === 'active') {
          // User is verified - go to dashboard
          localStorage.setItem('user', JSON.stringify(result.user));
          localStorage.removeItem('pending_admin_user');
          localStorage.removeItem('admin_google_user');

          if (Toast) {
            Toast.success('Verifikasi Berhasil', 'Akun Anda telah diverifikasi! Mengalihkan ke dashboard...');
          }

          setTimeout(() => {
            window.location.href = 'dashboard-admin.html';
          }, 1500);
        } else {
          // User still pending - prompt to link Telegram
          if (Toast) {
            Toast.warning('Belum Terverifikasi', 'Akun Anda belum diverifikasi. Silakan hubungkan Telegram dan lakukan verifikasi OTP.');
          }
        }
      } else {
        if (Toast) {
          Toast.error('Error', 'Gagal memeriksa status verifikasi');
        }
      }
    } catch (error) {
      if (loading) loading.close();
      console.error('Check status error:', error);
      if (Toast) {
        Toast.error('Error', 'Gagal memeriksa status verifikasi');
      }
    }
  }

  /**
   * Handle cancel button
   */
  handleCancel() {
    // Clear stored data
    localStorage.removeItem('admin_google_user');
    localStorage.removeItem('pending_admin_user');
    
    // Redirect to login
    this.redirectToLogin();
  }

  /**
   * Redirect to admin login
   */
  redirectToLogin() {
    window.location.href = 'adsys.html';
  }

  /**
   * Show error message
   * @param {string} message - Error message
   */
  showError(message) {
    const errorEl = document.getElementById('register-error');
    if (errorEl) {
      errorEl.textContent = message;
      errorEl.classList.remove('hidden');
      
      // Auto hide after 8 seconds
      setTimeout(() => {
        errorEl.classList.add('hidden');
        errorEl.textContent = '';
      }, 8000);
    }
  }

  /**
   * Hide error message
   */
  hideError() {
    const errorEl = document.getElementById('register-error');
    if (errorEl) {
      errorEl.textContent = '';
      errorEl.classList.add('hidden');
    }
  }
}

// Export
export { AdminRegister };

// Also expose globally for non-module scripts
window.AdminRegister = AdminRegister;

