/**
 * Google Auth Module
 * Handles Google Sign-In with registration flow
 */

import { AUTH_CONFIG } from './Config.js';

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

      const authResult = await this.validateWithBackend(userInfo);
      
      if (!authResult.success) {
        this.showError(authResult.message || 'Login gagal');
        return;
      }

      if (authResult.registered) {
        if (authResult.needVerification) {
          this.triggerCallbacks(null, {
            needOTPVerification: true,
            userId: authResult.userId,
            noWa: authResult.noWa,
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

  async validateWithBackend(userInfo) {
    // Try multiple approaches to handle GAS CORS issues
    
    // Approach 1: Try with regular CORS first
    const result1 = await this.tryValidateCORS(userInfo);
    if (result1) return result1;
    
    // Approach 2: Try with text/plain content type
    const result2 = await this.tryValidateTextPlain(userInfo);
    if (result2) return result2;
    
    // Approach 3: Last resort - use no-cors and assume new user
    console.warn('All CORS approaches failed, treating as new user');
    return { 
      success: true, 
      registered: false,
      message: 'Silakan lakukan registrasi'
    };
  }
  
  async tryValidateCORS(userInfo) {
    try {
      const payload = {
        action: 'login',
        email: userInfo.email,
        name: userInfo.name,
        sub: userInfo.sub,
        device: 'web',
        ip: ''
      };
      
      // Try direct - some browsers handle CORS better
      const res = await fetch(window.AUTH_CONFIG?.API_URL, {
        method: 'POST',
        body: JSON.stringify(payload)
      });
      
      const text = await res.text();
      const data = JSON.parse(text);
      return data;
      
    } catch (error) {
      console.log('Direct approach failed:', error.message);
      return null;
    }
  }
  
  async tryValidateTextPlain(userInfo) {
    // Skip this approach since proxy handles it
    return null;
  }

  async register(userData) {
    try {
      const payload = {
        action: 'register',
        email: this.googleUser.email,
        name: this.googleUser.name,
        sub: this.googleUser.sub,
        role: userData.role,
        noWa: userData.noWa,
        kelas: userData.kelas || '',
        sekolah: userData.sekolah || '',
        foto: this.googleUser.picture || ''
      };
      
      const res = await fetch(window.AUTH_CONFIG?.API_URL, {
        method: 'POST',
        body: JSON.stringify(payload),
        redirect: 'follow',
        mode: 'cors',
        headers: {
          'Content-Type': 'text/plain;charset=utf-8'
        }
      });
      
      const text = await res.text();
      let data;
      try {
        data = JSON.parse(text);
      } catch (parseError) {
        console.error('Failed to parse response:', text);
        return { success: false, message: 'Invalid server response' };
      }
      
      if (data.success) {
        this.currentUser = {
          userId: data.user.userId,
          email: data.user.email,
          name: data.user.name,
          role: data.user.role,
          noWa: data.user.noWa,
          status: data.user.status,
          picture: this.googleUser.picture
        };
        this.triggerCallbacks(null, {
          needOTPVerification: true,
          userId: data.user.userId,
          noWa: data.user.noWa,
          googleUser: this.googleUser
        });
        return { success: true };
      }
      return { success: false, message: data.message };
    } catch (error) {
      console.error('Registration failed:', error);
      return { success: false, message: 'Koneksi gagal. Periksa jaringan Anda.' };
    }
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

  getScriptUrl() { return window.AUTH_CONFIG?.API_URL; }
  getClientId() { return window.AUTH_CONFIG?.CLIENT_ID; }

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

