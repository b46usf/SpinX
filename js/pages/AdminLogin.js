/**
 * Admin Login Module
 * Handles admin-specific login with Google
 * Validates admin email from VITE_ADMIN_SYS env variable
 * Flow: Login → Check user exists → Register if needed → OTP verification → Dashboard
 * Uses same components as user flow (App.js pattern)
 * Reuses existing modules (DRY principle)
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
    if (this.isLoggedIn() && this.hasRole('admin-system')) {
      this.redirectToDashboard();
      return;
    }

    // Wait for Google SDK to load
    await this.waitForGoogleSDK();

    // Initialize Google Auth FIRST
    await this.initGoogleAuth();

    // Render Google button
    this.renderGoogleButton();
    
    // Setup click handler
    this.setupLoginButton();

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
        if (window.google?.accounts?.id || window.google?.accounts?.identity) {
          resolve();
        } else if (attempts < 50) {
          setTimeout(check, 100);
        } else {
          resolve();
        }
      };
      check();
    });
  }

  /**
   * Initialize Google Auth
   */
  initGoogleAuth() {
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
  }

  /**
   * Render Google login button - Match user login exactly
   */
  renderGoogleButton() {
    if (window.google?.accounts?.id) {
      const existingBtn = document.getElementById('googleLoginBtn');
      if (existingBtn) {
        window.google.accounts.id.renderButton(existingBtn, {
          theme: 'outline',
          size: 'large',
          width: '300'
        });
      } else {
        const container = document.getElementById('google-login-container');
        if (container) {
          window.google.accounts.id.renderButton(container, {
            theme: 'outline',
            size: 'large',
            width: '100%'
          });
        }
      }
    }
  }

  /**
   * Setup login button click handler
   */
  setupLoginButton() {
    setTimeout(() => {
      const loginBtn = document.getElementById('googleLoginBtn');
      if (loginBtn) {
        loginBtn.onclick = () => {
          if (window.google?.accounts?.id) {
            window.google.accounts.id.prompt();
          }
        };
      }
    }, 500);
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
        // Not admin system - show error and redirect to landing
        this.showError('Akses ditolak. Email ini tidak terdaftar sebagai administrator sistem.');
        
        if (Toast) {
          Toast.error('Akses Ditolak', 'Anda tidak memiliki akses ke sistem admin. Mengalihkan ke halaman utama...');
        }
        
        // Redirect to landing page after 2 seconds
        setTimeout(() => {
          window.location.href = 'index.html';
        }, 2000);
        
        return;
      }

      // Admin verified via VITE_ADMIN_SYS
      // Now check if user exists in database via backend
      if (Toast) {
        Toast.loading('Memeriksa data admin...');
      }

      const loginResult = await authApi.login({
        email: userInfo.email,
        name: userInfo.name,
        sub: userInfo.sub
      });

      if (Toast) {
        Toast.close();
      }

      if (loginResult.success) {
        if (loginResult.registered) {
          // User exists and is registered
          if (loginResult.user.status === 'active') {
            // User is active - go to dashboard
            this.currentUser = loginResult.user;
            this.role = loginResult.user.role;
            localStorage.setItem('user', JSON.stringify(this.currentUser));

            if (Toast) {
              Toast.success('Login Berhasil', 'Selamat datang Admin Sistem! Mengalihkan ke dashboard...');
            }

            setTimeout(() => {
              this.redirectToDashboard();
            }, 1000);
          } else {
            // User exists but not active - go to OTP verification (like user flow)
            this.handlePendingUser(loginResult);
          }
        } else {
          // User not registered - show register section (like user flow)
          this.showRegisterSection(this.googleUser);
        }
      } else if (loginResult.registered === false) {
        // User not found in database - show register section (like user flow)
        this.showRegisterSection(this.googleUser);
      } else {
        // Error occurred
        if (Toast) {
          Toast.error('Error', loginResult.message || 'Terjadi kesalahan saat login.');
        }
      }

    } catch (error) {
      if (loading) loading.close();
      console.error('Admin login error:', error);
      
      if (Toast) {
        Toast.error('Error', 'Terjadi kesalahan saat login. Silakan coba lagi.');
      }
    }
  }

  /**
   * Show register section - using App.js pattern (like user flow)
   * @param {Object} googleUser - Google user info
   */
  showRegisterSection(googleUser) {
    const Toast = getToast();
    
    // Store Google user data for registration with admin role
    const registerData = {
      email: googleUser.email,
      name: googleUser.name,
      picture: googleUser.picture,
      sub: googleUser.sub,
      role: 'admin-system',
      isAdminSystem: true // Flag for special handling
    };
    
    localStorage.setItem('admin_google_user', JSON.stringify(registerData));

    if (Toast) {
      Toast.info('Registrasi Diperlukan', 'Silakan lengkapi data admin Anda.');
    }

    // Trigger App to show admin register section
    if (window.App) {
      window.App.showAdminRegisterSection(googleUser);
    } else {
      // Fallback: redirect to index with admin flag
      window.location.href = 'index.html?admin=register';
    }
  }

  /**
   * Handle pending user (exists but not verified)
   * Using App.js pattern like user flow
   * @param {Object} loginResult - Login result from backend
   */
  handlePendingUser(loginResult) {
    const Toast = getToast();
    const user = loginResult.user;
    
    // Store user data for OTP verification
    localStorage.setItem('pending_admin_user', JSON.stringify({
      userId: user.userId,
      email: user.email,
      name: user.name,
      noWa: user.noWa,
      role: user.role
    }));

    if (loginResult.needVerification) {
      if (loginResult.telegramLinked) {
        // Go to OTP verification (like user flow)
        if (Toast) {
          Toast.warning('Verifikasi Diperlukan', 'Akun Anda belum diverifikasi. Silakan masukkan kode OTP.');
        }
        
        // Trigger App to show OTP section if available
        if (window.App) {
          window.App.showOtpSection({
            userId: user.userId,
            email: user.email
          });
        } else {
          // Fallback: redirect to index with admin OTP flag
          window.location.href = 'index.html?admin=otp';
        }
      } else {
        // Go to Telegram linking first (like user flow)
        if (Toast) {
          Toast.warning('Hubungkan Telegram', 'Silakan hubungkan Telegram untuk verifikasi OTP.');
        }
        
        // Trigger App to show telegram link section if available
        if (window.App) {
          window.App.showTelegramLinkSection({
            userId: user.userId,
            email: user.email,
            telegramLink: loginResult.telegramLink
          });
        } else {
          // Fallback: redirect to index with telegram link
          window.location.href = `index.html?admin=telegram&link=${encodeURIComponent(loginResult.telegramLink)}`;
        }
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

