
/**
 * Login Form Templates
 * HTML templates for login form
 */

import { AUTH_CONFIG } from '../../auth/Config.js';

export const LoginTemplates = {
  getClientId() {
    // Use AUTH_CONFIG from single source
    return AUTH_CONFIG?.CLIENT_ID || window.AUTH_CONFIG?.CLIENT_ID || '';
  },

  loginSection() {
    return `
      <div id="login-section" class="glass-card p-8 w-full max-w-md text-center animate-scale-in">
        <div class="mb-6">
          <div class="w-20 h-20 mx-auto mb-4 rounded-full bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 flex items-center justify-center animate-float">
            <i class="fas fa-ticket text-4xl text-white"></i>
          </div>
          <h1 class="text-3xl font-bold text-gradient">SpinX Smahada</h1>
          <p class="text-secondary mt-2">Lucky Wheel Festival</p>
        </div>
        <p class="text-secondary mb-6">Masuk dengan Google & coba keberuntunganmu! 🚀</p>
        
        <div class="login-card">
          <!-- Google Sign-In button will be rendered here by JavaScript -->
          <div id="google-login-container">
            <button id="googleLoginBtn" class="google-login">
              <img src="https://developers.google.com/identity/images/g-logo.png" alt="Google">
              <span>Sign in with Google</span>
            </button>
          </div>
        </div>
        <div id="auth-error" class="hidden mt-4 p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm"></div>
        <div class="mt-6 pt-6 border-t border-white/10">
          <p class="text-xs text-muted"><i class="fas fa-shield-alt mr-1"></i>Login aman & terjamin privasinya</p>
        </div>
      </div>
    `;
  }
};


