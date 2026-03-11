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
    
    // Show loading - use Toast.closeLoading() to close later
    if (Toast) {
      Toast.loading('Memproses login admin...');
    }

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

      // Close loading toast
      if (Toast) {
        Toast.closeLoading();
      }

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
        Toast.closeLoading();
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
      // Close loading toast
      if (Toast) {
        Toast.closeLoading();
      }
      
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
    
    // Show loading first
    if (Toast) {
      Toast.loading('Memuat formulir registrasi...');
    }
    
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

    // Hide login card and show register section FIRST
    const loginCard = document.querySelector('.relative.max-w-sm');
    if (loginCard) {
      loginCard.classList.add('hidden');
    }
    
    // Show register section using RegisterComponent
    if (window.registerComponent) {
      const appContainer = document.getElementById('app');
      if (appContainer) {
        appContainer.innerHTML = window.registerComponent.renderAdmin();
        window.registerComponent.initEvents();
        window.registerComponent.show(googleUser, true);
      }
    } else {
      // Fallback: redirect to index with admin flag
      window.location.href = 'index.html?admin=register';
      return;
    }

    // Close loading toast and show info toast with auto-close timer (4 seconds)
    if (Toast) {
      Toast.closeLoading();
      // Use setTimeout to ensure loading is fully closed before showing info
      setTimeout(() => {
        Toast.info('Registrasi Diperlukan', 'Silakan lengkapi data admin Anda.', 4000);
      }, 100);
    }
  }

  /**
   * Show Telegram link section after successful registration
   * @param {Object} result - Registration result from backend
   */
  showTelegramLink(result) {
    const Toast = getToast();
    
    // Store pending user data
    this.pendingUserData = {
      userId: result.user.userId,
      email: result.user.email,
      googleUser: this.googleUser
    };
    
    // Clear app container and show Telegram link section
    const appContainer = document.getElementById('app');
    if (appContainer) {
      appContainer.innerHTML = `
        <div class="max-w-sm mx-auto p-5 bg-gray-800/90 backdrop-blur-xl rounded-2xl shadow-2xl border border-gray-700/50 animate-scale-in">
          <div class="text-center mb-4">
            <div class="w-14 h-14 mx-auto mb-3 rounded-2xl bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center shadow-lg">
              <i class="fab fa-telegram text-2xl text-white"></i>
            </div>
            <h2 class="text-lg font-bold text-white">Hubungkan Telegram</h2>
            <p class="text-gray-400 text-xs mt-1">Verifikasi akun Anda via Telegram</p>
          </div>
          <a 
            id="open-telegram"
            href="${result.user.telegramLink}" 
            target="_blank"
            class="flex items-center justify-center gap-2 w-full py-3 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white font-semibold rounded-xl transition-all transform hover:scale-[1.02] active:scale-[0.98] shadow-lg text-sm"
          >
            <i class="fab fa-telegram"></i>
            <span>Buka Telegram</span>
          </a>
          <div id="telegram-status" class="mt-3 p-3 bg-gray-700/30 rounded-lg">
            <div class="flex items-center justify-center gap-2 text-xs text-gray-400">
              <span class="w-2 h-2 rounded-full bg-yellow-500 animate-pulse"></span>
              <span>Klik tombol di atas</span>
            </div>
          </div>
          <button 
            id="refresh-telegram-status"
            class="w-full mt-2 py-2 bg-gray-700/50 hover:bg-gray-600/50 text-gray-400 rounded-lg transition-colors text-xs font-medium"
          >
            <i class="fas fa-sync-alt mr-1"></i>Periksa Status
          </button>
        </div>
      `;
      
      // Add event listeners
      document.getElementById('refresh-telegram-status')?.addEventListener('click', () => this.checkTelegramStatus());
      setTimeout(() => this.checkTelegramStatus(), 1000);
    }
    
    if (Toast) {
      Toast.success('Registrasi Berhasil', 'Silakan hubungkan Telegram untuk verifikasi.');
    }
  }

  /**
   * Check Telegram verification status
   */
  async checkTelegramStatus() {
    const Toast = getToast();
    
    if (!this.pendingUserData) return;
    
    // Show loading
    if (Toast) {
      Toast.loading('Memeriksa status Telegram...');
    }
    
    try {
      const payload = { 
        action: 'generateOTP', 
        userId: this.pendingUserData.userId, 
        email: this.pendingUserData.email
      };
      
      const res = await fetch(AUTH_CONFIG.API_URL, {
        method: 'POST',
        body: JSON.stringify(payload),
        headers: { 'Content-Type': 'application/json' }
      });
      
      const result = await res.json();
      
      // Close loading toast
      if (Toast) {
        Toast.closeLoading();
      }
      
      const statusEl = document.getElementById('telegram-status');
      
      if (result.success) {
        if (statusEl) {
          statusEl.innerHTML = `
            <div class="flex items-center justify-center gap-2 text-xs text-green-400">
              <i class="fas fa-check-circle"></i>
              <span>Terkoneksi! Mengirim OTP...</span>
            </div>
          `;
        }
        
        if (Toast) {
          Toast.success('Telegram Terhubung!', 'Kode OTP dikirim ke Telegram Anda');
        }
        
        // Show OTP section after 2 seconds
        setTimeout(() => {
          this.showOtpSection({
            userId: this.pendingUserData.userId,
            email: this.pendingUserData.email,
            otpId: result.otpId
          });
        }, 2000);
        
      } else if (result.error === 'TELEGRAM_NOT_LINKED') {
        if (statusEl) {
          statusEl.innerHTML = `
            <div class="flex items-center justify-center gap-2 text-xs text-yellow-400">
              <span class="w-2 h-2 rounded-full bg-yellow-500 animate-pulse"></span>
              <span>Belum terhubung. Klik START di Telegram</span>
            </div>
          `;
        }
      } else {
        if (statusEl) {
          statusEl.innerHTML = `
            <div class="flex items-center justify-center gap-2 text-xs text-red-400">
              <i class="fas fa-exclamation-circle"></i>
              <span>${result.message || 'Gagal'}</span>
            </div>
          `;
        }
      }
    } catch (error) {
      // Close loading toast
      if (Toast) {
        Toast.closeLoading();
      }
      console.error('Check Telegram status error:', error);
    }
  }

  /**
   * Show OTP verification section
   * @param {Object} extra - OTP data (userId, email, otpId)
   */
  showOtpSection(extra) {
    const appContainer = document.getElementById('app');
    const Toast = getToast();
    
    // Store OTP data
    this.otpData = {
      userId: extra.userId,
      email: extra.email,
      otpId: extra.otpId
    };
    
    if (appContainer) {
      appContainer.innerHTML = `
        <div class="max-w-sm mx-auto p-5 bg-gray-800/90 backdrop-blur-xl rounded-2xl shadow-2xl border border-gray-700/50 animate-scale-in">
          <div class="text-center mb-4">
            <div class="w-14 h-14 mx-auto mb-3 rounded-2xl bg-gradient-to-br from-green-500 to-emerald-500 flex items-center justify-center shadow-lg">
              <i class="fas fa-shield-alt text-2xl text-white"></i>
            </div>
            <h2 class="text-lg font-bold text-white">Verifikasi OTP</h2>
            <p class="text-gray-400 text-xs mt-1">Masukkan kode dari Telegram</p>
          </div>
          <form id="otp-form" class="space-y-3">
            <div>
              <input 
                type="text" 
                id="otp-code" 
                maxlength="6"
                class="w-full px-4 py-3 bg-gray-700/50 border border-gray-600 rounded-xl text-white text-center text-2xl tracking-[0.5em] focus:border-green-500 focus:ring-2 focus:ring-green-500/20 font-mono"
                placeholder="------"
                required
                autocomplete="one-time-code"
              />
            </div>
            <button 
              type="submit" 
              id="verify-otp-btn"
              class="w-full py-3 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white font-semibold rounded-xl transition-all transform hover:scale-[1.02] active:scale-[0.98] shadow-lg text-sm"
            >
              <i class="fas fa-check-circle mr-2"></i>Verifikasi
            </button>
          </form>
          <div class="text-center mt-4">
            <p class="text-gray-500 text-xs">Tidak menerima kode?</p>
            <button type="button" id="resend-otp-btn" class="text-green-400 hover:text-green-300 font-medium text-sm transition-colors mt-1">
              <i class="fas fa-redo mr-1"></i>Kirim Ulang
            </button>
          </div>
        </div>
      `;
      
      // Add event listeners
      document.getElementById('otp-form')?.addEventListener('submit', (e) => {
        e.preventDefault();
        this.handleOtpVerify();
      });
      
      document.getElementById('resend-otp-btn')?.addEventListener('click', () => this.handleOtpResend());
    }
  }

  /**
   * Handle OTP verification
   */
  async handleOtpVerify() {
    const Toast = getToast();
    const otpCode = document.getElementById('otp-code')?.value.trim();
    
    if (!otpCode) {
      if (Toast) Toast.error('Input Required', 'Masukkan kode OTP');
      return;
    }
    
    // Show loading
    if (Toast) {
      Toast.loading('Memverifikasi OTP...');
    }
    
    try {
      const payload = {
        action: 'verifyOTP',
        otpId: this.otpData.otpId,
        otpCode: otpCode,
        userId: this.otpData.userId
      };
      
      const res = await fetch(AUTH_CONFIG.API_URL, {
        method: 'POST',
        body: JSON.stringify(payload),
        headers: { 'Content-Type': 'application/json' }
      });
      
      const result = await res.json();
      
      // Close loading toast
      if (Toast) {
        Toast.closeLoading();
      }
      
      if (result.success && result.verified) {
        if (Toast) {
          Toast.success('Verifikasi Berhasil', 'Akun Anda sekarang aktif! Silakan login ulang.');
        }
        
        // Save user session
        this.currentUser = {
          userId: this.otpData.userId,
          email: this.otpData.email,
          role: 'admin-system',
          status: 'active'
        };
        localStorage.setItem('user', JSON.stringify(this.currentUser));
        
        // Clear admin_google_user since registration is complete
        localStorage.removeItem('admin_google_user');
        
        // Redirect back to login page after 2 seconds (like user flow)
        setTimeout(() => {
          window.location.href = 'adsys.html';
        }, 2000);
      } else {
        if (Toast) {
          Toast.error('Verifikasi Gagal', result.message || 'Kode OTP tidak valid');
        }
      }
    } catch (error) {
      // Close loading toast
      if (Toast) {
        Toast.closeLoading();
      }
      
      console.error('OTP verification error:', error);
      if (Toast) {
        Toast.error('Error', 'Gagal memverifikasi OTP');
      }
    }
  }

  /**
   * Handle OTP resend
   */
  async handleOtpResend() {
    const Toast = getToast();
    
    // Show loading
    if (Toast) {
      Toast.loading('Mengirim ulang OTP...');
    }
    
    try {
      const payload = {
        action: 'generateOTP',
        userId: this.otpData.userId,
        email: this.otpData.email
      };
      
      const res = await fetch(AUTH_CONFIG.API_URL, {
        method: 'POST',
        body: JSON.stringify(payload),
        headers: { 'Content-Type': 'application/json' }
      });
      
      const result = await res.json();
      
      // Close loading toast
      if (Toast) {
        Toast.closeLoading();
      }
      
      if (result.success) {
        this.otpData.otpId = result.otpId;
        if (Toast) {
          Toast.success('OTP Dikirim', 'Kode OTP baru dikirim ke Telegram Anda');
        }
        // Clear OTP input
        const input = document.getElementById('otp-code');
        if (input) input.value = '';
      } else {
        if (Toast) {
          Toast.error('Gagal', result.message || 'Gagal mengirim OTP');
        }
      }
    } catch (error) {
      // Close loading toast
      if (Toast) {
        Toast.closeLoading();
      }
      
      console.error('Resend OTP error:', error);
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

