/**
 * Admin Login Module
 * Handles admin-specific login with Google
 * Validates admin email from VITE_ADMIN_SYS env variable
 * Reuses existing modules (DRY principle)
 * Clean, modular, best practice
 */

import { AUTH_CONFIG } from '../auth/Config.js';

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
    if (this.isLoggedIn() && this.hasRole('admin-system')) {
      this.redirectToDashboard();
      return;
    }

    // Wait for Google SDK to load
    await this.waitForGoogleSDK();

    // Initialize Google Auth
    await this.initGoogleAuth();

    // Render Google button with retry logic
    this.renderGoogleButton();

    this.initialized = true;
  }

  /**
   * Wait for Google Identity Services to load
   */
  waitForGoogleSDK() {
    return new Promise((resolve) => {
      let attempts = 0;
      const check = () => {
        attempts++;
        if (window.google?.accounts?.id) {
          resolve();
        } else if (attempts < 50) {
          setTimeout(check, 100);
        } else {
          console.warn('Google SDK not loaded');
          resolve();
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
   * Render Google login button - Match user login design
   */
  renderGoogleButton() {
    const container = document.getElementById('google-login-container');
    
    if (!container) {
      console.error('Google login container not found');
      return;
    }

    // Clear container first
    container.innerHTML = '';

    if (window.google?.accounts?.id) {
      // Create a wrapper div for the custom button styling
      const buttonWrapper = document.createElement('div');
      buttonWrapper.className = 'google-btn-wrapper';
      
      // Create a custom styled button that triggers Google flow
      const customButton = document.createElement('button');
      customButton.className = 'google-login-btn';
      customButton.id = 'googleLoginBtn';
      customButton.innerHTML = `
        <img src="https://developers.google.com/identity/images/g-logo.png" alt="Google">
        <span>Masuk dengan Google</span>
      `;
      
      // Click handler to trigger Google Sign-In
      customButton.addEventListener('click', () => {
        window.google.accounts.id.prompt();
      });
      
      buttonWrapper.appendChild(customButton);
      container.appendChild(buttonWrapper);

      // Also render Google button but hide it, for proper functionality
      const googleButtonDiv = document.createElement('div');
      googleButtonDiv.id = 'googleBtnWrapper';
      googleButtonDiv.style.cssText = 'position: absolute; opacity: 0; pointer-events: none;';
      container.appendChild(googleButtonDiv);

      // Render Google button in hidden div for token handling
      window.google.accounts.id.renderButton(googleButtonDiv, {
        theme: 'outline',
        size: 'large',
        width: '100%',
        text: 'signin_with'
      });
    } else {
      // Fallback: render manual button if Google SDK not available
      container.innerHTML = `
        <button id="googleLoginBtn" class="google-login-btn" onclick="triggerGoogleLogin()">
          <img src="https://developers.google.com/identity/images/g-logo.png" alt="Google">
          <span>Masuk dengan Google</span>
        </button>
      `;
      
      // Set up global function for manual click
      window.triggerGoogleLogin = () => {
        if (window.google?.accounts?.id) {
          window.google.accounts.id.prompt();
        }
      };
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
      const userEmail = userInfo.email.toLowerCase().trim();
      
      this.googleUser = {
        email: userInfo.email,
        name: userInfo.name,
        picture: userInfo.picture,
        sub: userInfo.sub
      };

      // Check if email is in admin list from VITE_ADMIN_SYS
      const adminEmails = AUTH_CONFIG.ADMIN_SYS_EMAILS || [];
      const isAdminSystem = adminEmails.includes(userEmail);

      if (loading) loading.close();

      if (!isAdminSystem) {
        // Not admin system - show error
        this.showError('Akses ditolak. Email ini tidak terdaftar sebagai administrator sistem.');
        
        if (Toast) {
          Toast.error('Akses Ditolak', 'Anda tidak memiliki akses ke sistem admin.');
        }
        
        return;
      }

      // Admin verified - create user session with admin-system role
      this.currentUser = {
        userId: userInfo.sub,
        email: userInfo.email,
        name: userInfo.name,
        role: 'admin-system',
        picture: userInfo.picture,
        status: 'active'
      };
      this.role = 'admin-system';
      
      // Save to localStorage
      localStorage.setItem('user', JSON.stringify(this.currentUser));

      if (Toast) {
        Toast.success('Login Berhasil', 'Selamat datang Admin Sistem! Mengalihkan ke dashboard...');
      }

      // Redirect to admin dashboard
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
   * Redirect to admin dashboard
   */
  redirectToDashboard() {
    window.location.href = 'dashboard-admin.html';
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

