/**
 * Google Auth Module
 * Handles Google Sign-In with registration flow
 * Delegates to specialized modules
 */

import AUTH_CONFIG from './config.js';

class GoogleAuth {
  constructor() {
    this.initialized = false;
    this.authState = window.AuthState;
    this.authApi = window.AuthApi;
  }

  /**
   * Initialize Google Identity Services
   */
  async init() {
    if (this.initialized) return;

    return new Promise((resolve) => {
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

  /**
   * Setup Google Identity Services
   */
  setupGIS() {
    if (!window.google?.accounts?.id) return;

    google.accounts.id.initialize({
      client_id: AUTH_CONFIG.CLIENT_ID,
      callback: window.handleGoogleCredentialResponse
    });
  }

  /**
   * Setup login button event listener
   */
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

  /**
   * Handle credential response from Google
   */
  async handleCredentialResponse(response) {
    try {
      // Decode JWT to get user info
      const userInfo = JwtParser.extractUserInfo(response.credential);
      
      this.authState.setGoogleUser(userInfo);

      // Send to backend to validate
      const authResult = await this.authApi.login(userInfo);
      
      if (!authResult.success) {
        AuthRouter.showError(authResult.message || 'Login gagal');
        return;
      }

      if (authResult.registered) {
        if (authResult.needVerification) {
          // User exists but needs OTP verification
          this.authState.triggerCallbacks(null, {
            needOTPVerification: true,
            userId: authResult.userId,
            noWa: authResult.noWa,
            googleUser: userInfo
          });
          return;
        }

        // User exists and verified - login and route to dashboard
        const user = {
          ...authResult.user,
          picture: userInfo.picture
        };
        
        this.authState.setUser(user);
        this.authState.triggerCallbacks(user);
        AuthRouter.routeToDashboard(authResult.role);
      } else {
        // New user - show registration form
        this.authState.triggerCallbacks(null, {
          needRegister: true,
          googleUser: userInfo
        });
      }
      
    } catch (error) {
      console.error('Auth error:', error);
      AuthRouter.showError('Login gagal. Silakan coba lagi.');
    }
  }

  /**
   * Register new user
   */
  async register(userData) {
    const googleUser = this.authState.getGoogleUser();
    
    const result = await this.authApi.register(googleUser, userData);
    
    if (result.success) {
      const user = {
        userId: result.user.userId,
        email: result.user.email,
        name: result.user.name,
        role: result.user.role,
        noWa: result.user.noWa,
        status: result.user.status,
        picture: googleUser.picture
      };
      
      this.authState.triggerCallbacks(null, {
        needOTPVerification: true,
        userId: result.user.userId,
        noWa: result.user.noWa,
        googleUser: googleUser
      });
      
      return { success: true };
    }
    
    return { success: false, message: result.message };
  }

  /**
   * Get the API URL for backend calls
   */
  getScriptUrl() {
    return AUTH_CONFIG.API_URL;
  }

  /**
   * Get the Google OAuth Client ID
   */
  getClientId() {
    return AUTH_CONFIG.CLIENT_ID;
  }

  /**
   * Check if user is logged in
   */
  isLoggedIn() {
    return this.authState.isLoggedIn();
  }

  /**
   * Get current user
   */
  getUser() {
    return this.authState.getUser();
  }

  /**
   * Get current role
   */
  getRole() {
    return this.authState.getRole();
  }

  /**
   * Check if user has specific role
   */
  hasRole(role) {
    return this.authState.hasRole(role);
  }

  /**
   * Logout user
   */
  logout() {
    this.authState.clearSession();
    
    if (window.google?.accounts?.id) {
      window.google.accounts.id.disableAutoSelect();
    }
    
    AuthRouter.routeToLogin();
  }

  /**
   * Register callback for auth state changes
   */
  onAuthChange(callback) {
    this.authState.onAuthChange(callback);
  }
}

// Export singleton instance
export default new GoogleAuth();

