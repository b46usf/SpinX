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
    console.log('AUTH_CONFIG:', AUTH_CONFIG);

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

    // Expose for debugging
    window.adminLogin = this;
    
    this.initialized = true;
    console.log('AdminLogin initialized');
  }

  /**
   * Wait for Google Identity Services to load
   */
  waitForGoogleSDK() {
    return new Promise((resolve) => {
      let attempts = 0;
      const check = () => {
        attempts++;
        console.log(`Checking Google SDK... attempt ${attempts}`);
        
        // Check for either identity or id (older/newer Google SDK)
        if (window.google?.accounts?.id || window.google?.accounts?.identity) {
          console.log('Google SDK loaded');
          resolve();
        } else if (attempts < 50) {
          setTimeout(check, 100);
        } else {
          console.warn('Google SDK not loaded after 5 seconds');
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
    // Set up global callback with error handling
    window.handleGoogleCredentialResponse = (response) => {
      console.log('Google credential response received:', response);
      this.handleCredentialResponse(response);
    };

    // Also set up a fallback callback on window for Google to find
    window.googleLoginCallback = (response) => {
      console.log('Google callback triggered via window.googleLoginCallback');
      if (response && response.credential) {
        this.handleCredentialResponse(response);
      } else {
        console.error('Invalid response in callback:', response);
      }
    };

    // Check for Google SDK - handle both older (identity) and newer (id) versions
    if (window.google?.accounts?.id) {
      console.log('Initializing Google Sign-In with client_id:', AUTH_CONFIG.CLIENT_ID);
      
      window.google.accounts.id.initialize({
        client_id: AUTH_CONFIG.CLIENT_ID,
        callback: window.handleGoogleCredentialResponse,
        auto_select: false,
        cancel_on_tap_outside: false,
        ux_mode: 'popup',
        use_fedcm_for_prompt: false
      });
      
      console.log('Google Sign-In initialized (newer SDK)');
    } 
    // Use attachClickHandler for older Google SDK
    else if (window.google?.accounts?.identity) {
      console.log('Initializing Google Sign-In with older SDK');
      
      window.google.accounts.identity.initialize({
        client_id: AUTH_CONFIG.CLIENT_ID,
        callback: window.handleGoogleCredentialResponse
      });
      
      console.log('Google Sign-In initialized (older SDK)');
    } else {
      console.error('Google accounts not available during init');
    }
  }

  /**
   * Setup login button click handler
   */
  setupLoginButton() {
    const loginBtn = document.getElementById('googleLoginBtn');
    if (loginBtn) {
      // Remove any existing listeners to avoid duplicates
      const newBtn = loginBtn.cloneNode(true);
      loginBtn.parentNode.replaceChild(newBtn, loginBtn);
      
      newBtn.addEventListener('click', (e) => {
        e.preventDefault();
        console.log('Google login button clicked');
        
        // Try newer SDK first
        if (window.google?.accounts?.id) {
          console.log('Calling google.accounts.id.prompt()');
          window.google.accounts.id.prompt();
          
          // Also try requestPassthrough for immediate callback
          // This can help in some popup scenarios
        } 
        // Try older SDK
        else if (window.google?.accounts?.identity) {
          console.log('Using older SDK attachClickHandler');
          window.google.accounts.identity.attachClickHandler(newBtn, {},
            (googleUser) => {
              console.log('Google login success via older SDK');
              if (googleUser && googleUser.credential) {
                const response = { credential: googleUser.credential };
                this.handleCredentialResponse(response);
              }
            },
            (error) => {
              console.error('Google login error:', error);
            }
          );
        } else {
          console.error('Google SDK not available on click');
          // Try to reinitialize
          this.initGoogleAuth();
          setTimeout(() => {
            if (window.google?.accounts?.id) {
              window.google.accounts.id.prompt();
            }
          }, 500);
        }
      });
      console.log('Login button click handler set up');
    } else {
      console.error('Login button not found');
    }
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

    // Create a wrapper for positioning
    const buttonWrapper = document.createElement('div');
    buttonWrapper.className = 'google-btn-wrapper';
    buttonWrapper.style.cssText = 'position: relative; width: 100%;';
    
    // Create custom styled button that will trigger Google Sign-In
    const customButton = document.createElement('button');
    customButton.className = 'google-login-btn';
    customButton.id = 'googleLoginBtn';
    customButton.innerHTML = `
      <img src="https://developers.google.com/identity/images/g-logo.png" alt="Google">
      <span>Masuk dengan Google</span>
    `;
    
    buttonWrapper.appendChild(customButton);
    container.appendChild(buttonWrapper);

    // Render the native Google button in a hidden container for callback handling
    const hiddenDiv = document.createElement('div');
    hiddenDiv.id = 'google-hidden-btn';
    hiddenDiv.style.cssText = 'position: absolute; top: 0; left: 0; width: 100%; height: 100%; opacity: 0; pointer-events: none;';
    buttonWrapper.appendChild(hiddenDiv);

    // Try to render the native Google button
    if (window.google?.accounts?.id) {
      window.google.accounts.id.renderButton(hiddenDiv, {
        theme: 'outline',
        size: 'large',
        width: '100%',
        text: 'signin_with'
      });
      console.log('Native Google button rendered in hidden div');
    }
    
    console.log('Google login button rendered');
  }

  /**
   * Setup login button click handler
   */
  setupLoginButton() {
    const loginBtn = document.getElementById('googleLoginBtn');
    const hiddenBtn = document.getElementById('google-hidden-btn');
    
    if (loginBtn) {
      // Click on custom button triggers hidden Google button
      loginBtn.addEventListener('click', (e) => {
        e.preventDefault();
        console.log('Google login button clicked');
        
        // Try to click the hidden Google button first
        if (hiddenBtn && hiddenBtn.querySelector('[role="button"]')) {
          console.log('Clicking hidden Google button');
          hiddenBtn.querySelector('[role="button"]').click();
        }
        // Fallback to prompt
        else if (window.google?.accounts?.id) {
          console.log('Using prompt() as fallback');
          window.google.accounts.id.prompt();
        }
      });
      console.log('Login button click handler set up');
    } else {
      console.error('Login button not found');
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

