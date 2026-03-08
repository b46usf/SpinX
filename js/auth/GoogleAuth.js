/**
 * Google Auth Module
 * Handles Google Sign-In with registration flow
 * Uses AuthApi for all backend calls - single source
 */

import { AUTH_CONFIG } from './Config.js';
import { authApi } from './AuthApi.js';

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
    // Use popup mode instead of FedCM for better compatibility with GitHub Pages
    google.accounts.id.initialize({
      client_id: window.AUTH_CONFIG?.CLIENT_ID,
      callback: window.handleGoogleCredentialResponse,
      auto_select: false,
      cancel_on_tap_outside: false,
      // Use popup mode - more compatible with various hosting environments
      ux_mode: 'popup',
      // Explicitly disable FedCM 
      use_fedcm_for_prompt: false
    });
  }

  setupLoginButton() {
    const loginBtn = document.getElementById("googleLoginBtn");
    if (loginBtn) {
      loginBtn.addEventListener("click", () => {
        if (window.google?.accounts?.id) {
          // Use renderButton for more reliable popup flow
          google.accounts.id.prompt();
        }
      });
    }
  }

  async handleCredentialResponse(response) {
    try {
      const userInfo = this.parseJwt(response.credential);
      this.googleUser = {
        email: userInfo.email,
        name: userInfo.name,
        picture: userInfo.picture,
        sub: userInfo.sub
      };

      // Use AuthApi for backend validation
      const authResult = await authApi.login(userInfo);
      
      if (!authResult.success) {
        this.showError(authResult.message || 'Login gagal');
        return;
      }

      if (authResult.registered) {
        if (authResult.needVerification) {
          // Generate OTP and show verification form
          const otpResult = await authApi.generateOTP(authResult.userId, userInfo.email);
          
          this.triggerCallbacks(null, {
            needOTPVerification: true,
            userId: authResult.userId,
            email: userInfo.email,
            otpId: otpResult.otpId,
            googleUser: this.googleUser
          });
          return;
        }

        this.currentUser = { ...authResult.user, picture: userInfo.picture };
        this.role = authResult.role;
        localStorage.setItem('user', JSON.stringify(this.currentUser));
        this.triggerCallbacks(this.currentUser);
        this.routeToDashboard(this.role);
      } else {
        this.triggerCallbacks(null, { needRegister: true, googleUser: this.googleUser });
      }
    } catch (error) {
      console.error('Auth error:', error);
      this.showError('Login gagal. Silakan coba lagi.');
    }
  }

  async register(userData) {
    // Use AuthApi for registration
    const result = await authApi.register(this.googleUser, userData);
    
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
      
      // Generate OTP via email
      const otpResult = await authApi.generateOTP(result.user.userId, this.googleUser.email);
      
      this.triggerCallbacks(null, {
        needOTPVerification: true,
        userId: result.user.userId,
        email: this.googleUser.email,
        otpId: otpResult.otpId,
        googleUser: this.googleUser
      });
      return { success: true };
    }
    return { success: false, message: result.message };
  }

  parseJwt(token) {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(atob(base64).split('').map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2)).join(''));
    return JSON.parse(jsonPayload);
  }

  routeToDashboard(role) {
    const dashboards = { 'admin': 'dashboard-admin.html', 'siswa': 'dashboard-siswa.html', 'mitra': 'dashboard-mitra.html', 'guru': 'dashboard-guru.html' };
    const dashboard = dashboards[role];
    if (dashboard) window.location.href = dashboard;
    else { this.showError('Role tidak valid'); window.location.href = 'index.html'; }
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

  showError(message) {
    const errorEl = document.getElementById('auth-error');
    if (errorEl) { errorEl.textContent = message; errorEl.classList.remove('hidden'); }
    else { alert(message); }
  }

  hideError() {
    const errorEl = document.getElementById('auth-error');
    if (errorEl) { errorEl.textContent = ''; errorEl.classList.add('hidden'); }
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

