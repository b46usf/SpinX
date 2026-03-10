/**
 * Admin Login Module
 * Handles admin-specific login with Google
 * Reuses existing GoogleAuth, AuthApi modules (DRY principle)
 * Clean, modular, best practice
 */

import { AUTH_CONFIG } from '../auth/Config.js';
import { authApi } from '../auth/AuthApi.js';

// Get Toast from global
const getToast = () => window.Toast || null;

class AdminLogin {
  constructor() {
    this.initialized = false;
    this.currentUser = null;
    this.role = null;
    this.googleUser = null;
  }

  /**
   * Initialize admin login
   */
  async init() {
    // Expose AUTH_CONFIG globally for Google Sign-In
    window.AUTH_CONFIG = AUTH_CONFIG;

    // Check if already logged in as admin - redirect to dashboard
    if (this.isLoggedIn() && (this.hasRole('admin-system') || this.hasRole('admin-sekolah'))) {
      this.redirectToDashboard();
      return;
    }

    // Wait for Google SDK to load
    await this.waitForGoogleSDK();

    // Initialize Google Auth
    await this.initGoogleAuth();

    // Render Google button
    this.renderGoogleButton();

    this.initialized = true;
  }

  /**
   * Wait for Google Identity Services to load
   */
  waitForGoogleSDK() {
    return new Promise((resolve) => {
      const check = () => {
        if (window.google?.accounts?.id) {
          resolve();
        } else {
          setTimeout(check, 100);
        }
      };
      check();
    });
  }

  /**
   * Initialize Google Auth
   */
  async initGoogleAuth() {
    return new Promise((resolve) => {
      // Set up global callback
      window.handleGoogleCredentialResponse = (response) => {
        this.handleCredentialResponse(response);
      };

      if (window.google?.accounts?.id) {
        window.google.accounts.id.initialize({
          client_id: AUTH_CONFIG.CLIENT_ID,
          callback: window.handleGoogleCredentialResponse,
          auto_select: false,
          cancel_on_tap_outside: false,
          ux_mode: 'popup',
          use_fedcm_for_prompt: false
        });
      }

      resolve();
    });
  }

  /**
   * Render Google login button
   */
  renderGoogleButton() {
    const container = document.getElementById('google-login-container');
    const button = document.getElementById('googleLoginBtn');
    
    if (container && button && window.google?.accounts?.id) {
      // Clear container and re-render button
      container.innerHTML = '';
      window.google.accounts.id.renderButton(button, {
        theme: 'outline',
        size: 'large',
        width: '100%',
        text: 'signin_with'
      });

      // Also add click handler as backup
      button.addEventListener('click', () => {
        window.google.accounts.id.prompt();
      });
    }
  }

  /**
   * Handle Google credential response
   * @param {Object} response - Google credential response
   */
  async handleCredentialResponse(response) {
    const Toast = getToast();
    const loading = Toast ? Toast.loading('Memproses login admin...') : null;

    try {
      // Parse JWT token
      const userInfo = this.parseJwt(response.credential);
      this.googleUser = {
        email: userInfo.email,
        name: userInfo.name,
        picture: userInfo.picture,
        sub: userInfo.sub
      };

      // Call backend login API
      const authResult = await authApi.login(userInfo);

      if (loading) loading.close();

      // Check if login was successful
      if (!authResult.success) {
        // Error toast already shown by AuthApi
        return;
      }

      // Check if user has admin role (admin-system or admin-sekolah)
      const isAdminSystem = authResult.role === 'admin-system';
      const isAdminSekolah = authResult.role === 'admin-sekolah';
      
      if (!isAdminSystem && !isAdminSekolah) {
        // Not admin - show error and redirect to regular login
        this.showError('Akses ditolak. Halaman ini hanya untuk administrator.');
        
        if (Toast) {
          Toast.error('Akses Ditolak', 'Anda tidak memiliki akses ke sistem admin.');
        }
        
        // Redirect to regular landing after delay
        setTimeout(() => {
          window.location.href = 'index.html';
        }, 3000);
        
        return;
      }

      // Admin verified - save user data and redirect
      this.currentUser = { ...authResult.user, picture: userInfo.picture };
      this.role = authResult.role;
      
      // Save to localStorage
      localStorage.setItem('user', JSON.stringify(this.currentUser));

      if (Toast) {
        const adminType = isAdminSystem ? 'Admin Sistem' : 'Admin Sekolah';
        Toast.success('Login Berhasil', `Selamat datang ${adminType}! Mengalihkan ke dashboard...`);
      }

      // Redirect to appropriate admin dashboard
      setTimeout(() => {
        this.redirectToDashboard();
      }, 1000);

    } catch (error) {
      if (loading) loading.close();
      console.error('Admin login error:', error);
      
      if (Toast) {
        Toast.error('Error', 'Terjadi kesalahan saat login. Silakan coba lagi.');
      }
    }
  }

  /**
   * Redirect to admin dashboard based on role
   */
  redirectToDashboard() {
    if (this.role === 'admin-system') {
      window.location.href = 'dashboard-admin.html';
    } else if (this.role === 'admin-sekolah') {
      window.location.href = 'dashboard-admin-sekolah.html';
    } else {
      // Fallback
      window.location.href = 'index.html';
    }
  }

  /**
   * Parse JWT token
   * @param {string} token - JWT token
   * @returns {Object} - Decoded token payload
   */
  parseJwt(token) {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    return JSON.parse(jsonPayload);
  }

  /**
   * Check if user is logged in
   * @returns {boolean}
   */
  isLoggedIn() {
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
   * Check if user has admin role
   * @returns {boolean}
   */
  hasRole(role) {
    return this.role === role;
  }

  /**
   * Show error message
   * @param {string} message - Error message
   */
  showError(message) {
    const errorEl = document.getElementById('auth-error');
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
    const errorEl = document.getElementById('auth-error');
    if (errorEl) {
      errorEl.textContent = '';
      errorEl.classList.add('hidden');
    }
  }
}

// Export
export { AdminLogin };

// Also expose globally for non-module scripts
window.AdminLogin = AdminLogin;

