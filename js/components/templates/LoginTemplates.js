
/**
 * Login Form Templates
 * HTML templates for login form - COMPACT & ATTRACTIVE DESIGN
 */

import { AUTH_CONFIG } from '../../auth/Config.js';

export const LoginTemplates = {
  getClientId() {
    return AUTH_CONFIG?.CLIENT_ID || window.AUTH_CONFIG?.CLIENT_ID || '';
  },

  loginSection() {
    return `
      <div class="min-h-screen flex items-center justify-center p-4 relative overflow-hidden">
        <!-- Animated Background -->
        <div class="absolute inset-0 bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900 opacity-50"></div>
        <div class="absolute top-1/4 left-1/4 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl animate-pulse"></div>
        <div class="absolute bottom-1/4 right-1/4 w-96 h-96 bg-pink-500/20 rounded-full blur-3xl animate-pulse" style="animation-delay: 1s;"></div>
        
        <!-- Main Card - COMPACT -->
        <div class="relative w-full max-w-sm">
          <div class="bg-gray-900/80 backdrop-blur-xl rounded-3xl shadow-2xl border border-gray-700/50 p-6 animate-scale-in">
            <!-- Logo & Title -->
            <div class="text-center mb-5">
              <div class="w-16 h-16 mx-auto mb-3 rounded-2xl bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 flex items-center justify-center shadow-lg shadow-purple-500/30 transform hover:scale-110 transition-transform duration-300">
                <i class="fas fa-ticket text-2xl text-white"></i>
              </div>
              <h1 class="text-2xl font-bold bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
                SpinX
              </h1>
              <p class="text-gray-400 text-xs mt-1">Lucky Wheel Festival</p>
            </div>

            <!-- Tagline -->
            <p class="text-gray-400 text-center text-sm mb-5">
              🚀 Masuk & coba keberuntunganmu!
            </p>

            <!-- Google Button -->
            <div class="login-card mb-4">
              <div id="google-login-container">
                <button id="googleLoginBtn" class="google-login w-full">
                  <img src="https://developers.google.com/identity/images/g-logo.png" alt="Google">
                  <span>Masuk dengan Google</span>
                </button>
              </div>
            </div>

            <!-- Error Display -->
            <div id="auth-error" class="hidden mb-4 p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-xs text-center"></div>

            <!-- Footer -->
            <div class="pt-4 border-t border-gray-700/50">
              <p class="text-xs text-gray-500 text-center">
                <i class="fas fa-shield-alt mr-1"></i>Login aman & terjamin
              </p>
            </div>
          </div>

          <!-- Version -->
          <p class="text-center text-gray-600 text-[10px] mt-4">v1.0.0</p>
        </div>
      </div>
    `;
  }
};


