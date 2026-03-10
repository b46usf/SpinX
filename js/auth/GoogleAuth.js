
/**
 * Google Auth Module
 * Handles Google Sign-In with registration flow
 * Uses AuthApi for all backend calls - single source
 * AuthApi will show Toast notifications for all responses
 * 
 * Note: Toast functions are accessed via global window.Toast
 */

import { AUTH_CONFIG } from './Config.js';
import { authApi } from './AuthApi.js';

// Get Toast functions from global (set by Toast.js)
const getToast = () => window.Toast || null;

class GoogleAuth {
  constructor() {
    this.initialized = false;
    this.currentUser = null;
    this.callbacks = [];
    this.role = null;
    this.googleUser = null;
  }

  // Expose AUTH_CONFIG to window for Google Sign-In
  initConfig() {
    window.AUTH_CONFIG = AUTH_CONFIG;
  }

  async init() {
    if (this.initialized) return;

    return new Promise((resolve) => {
      // Set up the global callback FIRST before initializing GIS
      window.handleGoogleCredentialResponse = (response) => {
        this.handleCredentialResponse(response);
      };

      if (window.google?.accounts?.identity) {
        this.setupGIS();
        this.setupLoginButton();
        this.initialized = true;
        resolve();
      } else {
        window.addEventListener('load', () => {
          this.setupGIS();
          this.setupLoginButton();
          this.initialized = true;
          resolve();
        });
      }
    });
  }

  setupGIS() {
    if (!window.google?.accounts?.id) return;
    
    // Initialize with the global callback
    // Use popup mode instead of FedCM for better compatibility
    google.accounts.id.initialize({
      client_id: window.AUTH_CONFIG?.CLIENT_ID,
      callback: window.handleGoogleCredentialResponse,
      auto_select: false,
      cancel_on_tap_outside: false,
      ux_mode: 'popup',
      use_fedcm_for_prompt: false
    });
  }

  setupLoginButton() {
    const loginBtn = document.getElementById("googleLoginBtn");
    if (loginBtn) {
      loginBtn.addEventListener("click", () => {
        if (window.google?.accounts?.id) {
          google.accounts.id.prompt();
        }
      });
    }
  }

  async handleCredentialResponse(response) {
    const Toast = getToast();
    const loading = Toast ? Toast.loading('Sedang memproses login...') : null;
    
    try {
      const userInfo = this.parseJwt(response.credential);
      this.googleUser = {
        email: userInfo.email,
        name: userInfo.name,
        picture: userInfo.picture,
        sub: userInfo.sub
      };

      // Use AuthApi for backend validation (AuthApi will show toast)
      const authResult = await authApi.login(userInfo);
      
      if (loading) loading.close();
      
      // AuthApi already shows toast, check result for flow control
      if (!authResult.success) {
        // Toast already shown by AuthApi, just return
        return;
      }

      if (authResult.registered) {
        if (authResult.needVerification) {
          // Check telegramLinked status from response
          if (authResult.telegramLinked) {
            // User has linked Telegram - generate OTP (AuthApi will show toast)
            const otpResult = await authApi.generateOTP(authResult.userId, userInfo.email);
            
            if (otpResult.success) {
              this.triggerCallbacks(null, {
                needOTPVerification: true,
                userId: authResult.userId,
                email: userInfo.email,
                otpId: otpResult.otpId,
                googleUser: this.googleUser
              });
            }
            // If failed, AuthApi already showed toast
          } else {
            // User needs to link Telegram first
            this.triggerCallbacks(null, {
              needTelegramLink: true,
              userId: authResult.userId,
              email: userInfo.email,
              telegramLink: authResult.telegramLink,
              googleUser: this.googleUser
            });
          }
          return;
        }

        // Login successful - save user data
        this.currentUser = { ...authResult.user, picture: userInfo.picture };
        this.role = authResult.role;
        localStorage.setItem('user', JSON.stringify(this.currentUser));
        
        // Redirect to dashboard
        this.routeToDashboard(this.role);
      } else {
        // Need to register
        this.triggerCallbacks(null, { needRegister: true, googleUser: this.googleUser });
      }
    } catch (error) {
      if (loading) loading.close();
      console.error('Auth error:', error);
      // Toast already shown by AuthApi catch block
    }
  }

  async register(userData) {
    const Toast = getToast();
    const loading = Toast ? Toast.loading('Sedang mendaftar...') : null;
    
    // Use AuthApi for registration (AuthApi will show toast)
    const result = await authApi.register(this.googleUser, userData);
    
    if (loading) loading.close();
    
    // Check result - toast already shown by AuthApi
    if (result.success) {
      this.currentUser = {
        userId: result.user.userId,
        email: result.user.email,
        name: result.user.name,
        role: result.user.role,
        noWa: result.user.noWa,
        status: result.user.status,
        picture: this.googleUser.picture
      };
      
      // Show Telegram link for verification
      this.triggerCallbacks(null, {
        needTelegramLink: true,
        userId: result.user.userId,
        email: this.googleUser.email,
        telegramLink: result.user.telegramLink,
        googleUser: this.googleUser
      });
      
      return { success: true };
    }
    
    // Toast already shown by AuthApi
    return { success: false, message: result.message };
  }

  // Check if user has linked Telegram (called after user clicks /start in Telegram)
  async checkTelegramLink(userId) {
    try {
      // Try to generate OTP - if Telegram is linked, it will succeed
      // Don't show toast for this check
      const result = await authApi.generateOTP(userId, this.googleUser.email);
      
      if (result.success) {
        return { linked: true, otpId: result.otpId };
      } else if (result.error === 'TELEGRAM_NOT_LINKED') {
        return { linked: false, telegramLink: result.telegramLink };
      }
      
      return { linked: false, error: result.message };
    } catch (error) {
      console.error('Check Telegram link error:', error);
      return { linked: false, error: error.message };
    }
  }

  // Refresh verification status after Telegram link
  async refreshVerificationStatus(userId) {
    try {
      const result = await authApi.generateOTP(userId, this.googleUser.email);
      
      if (result.success) {
        this.triggerCallbacks(null, {
          needOTPVerification: true,
          userId: userId,
          email: this.googleUser.email,
          otpId: result.otpId,
          googleUser: this.googleUser
        });
      }
    } catch (error) {
      console.error('Refresh verification status error:', error);
    }
  }

  parseJwt(token) {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(atob(base64).split('').map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2)).join(''));
    return JSON.parse(jsonPayload);
  }

  routeToDashboard(role) {
    const dashboards = { 
      'admin-system': 'dashboard-admin.html', 
      'admin-sekolah': 'dashboard-admin-sekolah.html',
      'siswa': 'dashboard-siswa.html', 
      'mitra': 'dashboard-mitra.html', 
      'guru': 'dashboard-guru.html' 
    };
    const dashboard = dashboards[role];
    if (dashboard) window.location.href = dashboard;
    else { 
      const Toast = getToast();
      if (Toast) Toast.error('Role Tidak Valid', 'Role pengguna tidak dikenali'); 
      window.location.href = 'index.html'; 
    }
  }

  getScriptUrl() { return AUTH_CONFIG.API_URL; }
  getClientId() { return AUTH_CONFIG.CLIENT_ID; }

  isLoggedIn() {
    const user = localStorage.getItem('user');
    if (user) {
      this.currentUser = JSON.parse(user);
      this.role = this.currentUser.role;
      return true;
    }
    return false;
  }

  getUser() { return this.currentUser; }
  getRole() { return this.role; }
  hasRole(role) { return this.role === role; }

  logout() {
    localStorage.removeItem('user');
    this.currentUser = null;
    this.role = null;
    this.googleUser = null;
    if (window.google?.accounts?.id) window.google.accounts.id.disableAutoSelect();
    window.location.href = 'index.html';
  }

  onAuthChange(callback) {
    this.callbacks.push(callback);
    if (this.isLoggedIn()) callback(this.currentUser);
  }

  triggerCallbacks(user, extra = null) {
    this.callbacks.forEach(cb => cb(user, extra));
  }

  // Legacy methods for backward compatibility
  showError(message) {
    const Toast = getToast();
    if (Toast) Toast.error('Error', message);
  }

  hideError() {
    // No-op, handled by Toast
  }
}

// Create singleton instance
const googleAuth = new GoogleAuth();

// Expose globally for non-module scripts
window.GoogleAuth = googleAuth;

// Expose AUTH_CONFIG to window for Google Sign-In library
window.AUTH_CONFIG = AUTH_CONFIG;

// Export only the singleton instance
export { googleAuth as googleAuthInstance };


