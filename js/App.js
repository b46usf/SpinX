
/**
 * Main Application Entry Point
 * Modular Architecture using ES6 Modules
 * Uses Toast for notifications
 */

// Import Toast FIRST to ensure it's available globally
import './components/utils/Toast.js';

// Import all modules
import { googleAuthInstance } from './auth/GoogleAuth.js';
import { ThemeToggle } from './components/ThemeToggle.js';
import { LoginTemplates } from './components/templates/LoginTemplates.js';
import { RegisterTemplates } from './components/templates/RegisterTemplates.js';
import { ErrorHandler } from './components/utils/ErrorHandler.js';
import { RoleFields } from './components/config/RoleFields.js';
import { RegisterHandler } from './components/utils/RegisterHandler.js';
import { OtpHandler, OtpTemplates } from './components/utils/OtpHandler.js';
import { LoginComponent } from './components/LoginComponent.js';
import { RegisterComponent } from './components/RegisterComponent.js';

// Get Toast
const getToast = () => window.Toast || null;

// Make everything available globally
window.ThemeToggle = ThemeToggle;
window.LoginTemplates = LoginTemplates;
window.RegisterTemplates = RegisterTemplates;
window.ErrorHandler = ErrorHandler;
window.RoleFields = RoleFields;
window.RegisterHandler = RegisterHandler;
window.OtpHandler = OtpHandler;
window.OtpTemplates = OtpTemplates;
window.LoginComponent = LoginComponent;
window.RegisterComponent = RegisterComponent;

/**
 * Main Application Class
 */
class App {
  constructor() {
    this.googleAuth = googleAuthInstance;
    this.themeToggle = null;
    this.loginComponent = null;
    this.registerComponent = null;
    this.otpHandler = null;
    this.appContainer = null;
    this.pendingUserData = null;
    this.otpRequested = false; // Prevent duplicate OTP requests
  }

  async init() {
    // Wait for Toast to be available
    await this.waitForToast();
    
    this.appContainer = document.getElementById('app');
    if (!this.appContainer) {
      console.error('App container not found');
      return;
    }

    // Initialize theme
    this.initTheme();

    // Check if already logged in
    if (this.googleAuth.isLoggedIn()) {
      this.googleAuth.routeToDashboard(this.googleAuth.getRole());
      return;
    }

    // Initialize Google Auth
    await this.googleAuth.init();

    // Setup callback
    window.handleGoogleCredentialResponse = async (response) => {
      await this.googleAuth.handleCredentialResponse(response);
    };

    // Setup auth change handler
    this.googleAuth.onAuthChange((user, extra) => this.handleAuthChange(user, extra));

    // Initialize components
    this.initComponents();

    // Show login
    this.showLoginSection();
  }

  // Wait for Toast to be available
  waitForToast() {
    return new Promise((resolve) => {
      let attempts = 0;
      const check = () => {
        if (window.Toast) {
          resolve();
        } else if (attempts < 50) {
          attempts++;
          setTimeout(check, 100);
        } else {
          console.warn('Toast not available, continuing anyway');
          resolve();
        }
      };
      check();
    });
  }

  initTheme() {
    this.themeToggle = new ThemeToggle();
    this.themeToggle.init();
    const container = document.getElementById('theme-toggle-container');
    if (container) container.appendChild(this.themeToggle.render());
  }

  initComponents() {
    this.loginComponent = new LoginComponent({ googleAuth: this.googleAuth });
    this.registerComponent = new RegisterComponent({
      googleAuth: this.googleAuth,
      onSubmit: async (data) => {
        const result = await this.googleAuth.register(data);
        if (!result.success) {
          // Error shown in GoogleAuth.register()
        }
      },
      onCancel: () => this.showLoginSection()
    });
    
    // Initialize OTP handler
    this.otpHandler = new OtpHandler({
      onSuccess: () => {
        this.showLoginSection();
      },
      onResend: () => {
        const input = document.getElementById('otp-code');
        if (input) input.value = '';
      }
    });
  }

  handleAuthChange(user, extra) {
    if (user) {
      // Logged in - redirect handled by module
    } else if (extra && extra.needTelegramLink) {
      this.showTelegramLinkSection(extra);
    } else if (extra && extra.needOTPVerification) {
      this.showOtpSection(extra);
    } else if (extra && extra.needRegister) {
      this.showRegisterSection(extra.googleUser);
    } else {
      this.showLoginSection();
    }
  }

  showLoginSection() {
    if (!this.appContainer) return;
    this.cleanup();
    this.appContainer.innerHTML = this.loginComponent.render();
    this.loginComponent.initEvents();
  }

  showRegisterSection(googleUser) {
    if (!this.appContainer) return;
    this.cleanup();
    this.appContainer.innerHTML = this.registerComponent.render();
    this.registerComponent.initEvents();
    this.registerComponent.show(googleUser);
  }

  showTelegramLinkSection(extra) {
    if (!this.appContainer) return;
    
    this.cleanup();
    
    // Store pending data
    this.pendingUserData = {
      userId: extra.userId,
      email: extra.email,
      googleUser: extra.googleUser
    };
    
    // Reset flag
    this.otpRequested = false;
    
    // Render UI - SIMPLE VERSION
    this.appContainer.innerHTML = this.getTelegramLinkTemplate(extra);
    
    // Event listeners
    document.getElementById('back-to-login')?.addEventListener('click', () => {
      this.showLoginSection();
    });
    
    // Refresh/Check button
    document.getElementById('refresh-telegram-status')?.addEventListener('click', () => {
      this.checkTelegramStatus();
    });
    
    // Auto check once when page loads
    setTimeout(() => {
      this.checkTelegramStatus();
    }, 1000);
  }

  getTelegramLinkTemplate(extra) {
    return `
      <div class="max-w-sm mx-auto p-5 bg-gray-800/90 backdrop-blur-xl rounded-2xl shadow-2xl border border-gray-700/50 animate-scale-in">
        <!-- Header -->
        <div class="text-center mb-4">
          <div class="w-14 h-14 mx-auto mb-3 rounded-2xl bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center shadow-lg">
            <i class="fab fa-telegram text-2xl text-white"></i>
          </div>
          <h2 class="text-lg font-bold text-white">Hubungkan Telegram</h2>
          <p class="text-gray-400 text-xs mt-1">Verifikasi akun Anda via Telegram</p>
        </div>
        
        <!-- Telegram Button -->
        <a 
          id="open-telegram"
          href="${extra.telegramLink}" 
          target="_blank"
          class="flex items-center justify-center gap-2 w-full py-3 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white font-semibold rounded-xl transition-all transform hover:scale-[1.02] active:scale-[0.98] shadow-lg text-sm"
        >
          <i class="fab fa-telegram"></i>
          <span>Buka Telegram</span>
        </a>
        
        <!-- Status -->
        <div id="telegram-status" class="mt-3 p-3 bg-gray-700/30 rounded-lg">
          <div class="flex items-center justify-center gap-2 text-xs text-gray-400">
            <span class="w-2 h-2 rounded-full bg-yellow-500 animate-pulse"></span>
            <span>Klik tombol di atas</span>
          </div>
        </div>
        
        <!-- Refresh Button -->
        <button 
          id="refresh-telegram-status"
          class="w-full mt-2 py-2 bg-gray-700/50 hover:bg-gray-600/50 text-gray-400 rounded-lg transition-colors text-xs font-medium"
        >
          <i class="fas fa-sync-alt mr-1"></i>Periksa Status
        </button>
        
        <!-- Back Link -->
        <div class="text-center mt-3 pt-3 border-t border-gray-700/50">
          <button 
            type="button" 
            id="back-to-login"
            class="text-gray-500 hover:text-white text-xs transition-colors"
          >
            <i class="fas fa-arrow-left mr-1"></i>Kembali
          </button>
        </div>
      </div>
    `;
  }

  async checkTelegramStatus() {
    const statusEl = document.getElementById('telegram-status');
    const Toast = getToast();
    
    if (!this.pendingUserData || this.otpRequested) return;
    
    try {
      const clientIP = await this.getClientIP();
      const payload = { 
        action: 'generateOTP', 
        userId: this.pendingUserData.userId, 
        email: this.pendingUserData.email, 
        ip: clientIP 
      };
      
      const res = await fetch(window.AUTH_CONFIG?.API_URL || '/api/proxy', {
        method: 'POST',
        body: JSON.stringify(payload),
        headers: { 'Content-Type': 'application/json' }
      });
      
      const result = await res.json();
      
      if (result.success) {
        // Mark as requested to prevent duplicate
        this.otpRequested = true;
        
        // Update status UI
        if (statusEl) {
          statusEl.innerHTML = `
            <div class="flex items-center justify-center gap-2 text-xs text-green-400">
              <i class="fas fa-check-circle"></i>
              <span>Terkoneksi! Mengirim OTP...</span>
            </div>
          `;
        }
        
        // Show success toast
        if (Toast) {
          if (result.debug_otp) {
            Toast.success('Telegram Terhubung!', 'Kode OTP: ' + result.debug_otp);
          } else {
            Toast.success('Telegram Terhubung!', 'Kode OTP dikirim ke Telegram Anda');
          }
        }
        
        // Redirect to OTP page
        setTimeout(() => {
          this.showOtpSection({
            userId: this.pendingUserData.userId,
            email: this.pendingUserData.email,
            otpId: result.otpId,
            debugOtp: result.debug_otp,
            googleUser: this.pendingUserData.googleUser
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
      console.error('Check Telegram status error:', error);
      if (statusEl) {
        statusEl.innerHTML = `
          <div class="flex items-center justify-center gap-2 text-xs text-red-400">
            <i class="fas fa-exclamation-circle"></i>
            <span>Error koneksi</span>
          </div>
        `;
      }
    }
  }

  // Helper to get client IP
  async getClientIP() {
    try {
      const response = await fetch('https://api.ipify.org?format=json');
      const data = await response.json();
      return data.ip || '';
    } catch (error) {
      return '';
    }
  }

  showOtpSection(extra) {
    if (!this.appContainer) return;
    
    this.cleanup();
    
    // Store OTP data
    this.otpHandler.setData(extra.userId, extra.email);
    if (extra.otpId) {
      this.otpHandler.setOtpId(extra.otpId);
    }
    
    // Render OTP form
    this.appContainer.innerHTML = this.getOtpTemplate();
    
    // Initialize events
    this.otpHandler.initEvents({
      onSuccess: () => {
        this.showLoginSection();
      },
      onResend: () => {
        const input = document.getElementById('otp-code');
        if (input) input.value = '';
      }
    });
    
    // Back to login button
    document.getElementById('back-to-login')?.addEventListener('click', () => {
      this.showLoginSection();
    });
  }

  getOtpTemplate() {
    return `
      <div class="max-w-sm mx-auto p-5 bg-gray-800/90 backdrop-blur-xl rounded-2xl shadow-2xl border border-gray-700/50 animate-scale-in">
        <!-- Header -->
        <div class="text-center mb-4">
          <div class="w-14 h-14 mx-auto mb-3 rounded-2xl bg-gradient-to-br from-green-500 to-emerald-500 flex items-center justify-center shadow-lg">
            <i class="fas fa-shield-alt text-2xl text-white"></i>
          </div>
          <h2 class="text-lg font-bold text-white">Verifikasi OTP</h2>
          <p class="text-gray-400 text-xs mt-1">Masukkan kode dari Telegram</p>
        </div>
        
        <!-- OTP Form -->
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
        
        <!-- Resend -->
        <div class="text-center mt-4">
          <p class="text-gray-500 text-xs">Tidak menerima kode?</p>
          <button 
            type="button" 
            id="resend-otp-btn"
            class="text-green-400 hover:text-green-300 font-medium text-sm transition-colors mt-1"
          >
            <i class="fas fa-redo mr-1"></i>Kirim Ulang
          </button>
        </div>
        
        <!-- Back -->
        <div class="text-center mt-4 pt-4 border-t border-gray-700/50">
          <button 
            type="button" 
            id="back-to-login"
            class="text-gray-500 hover:text-white text-xs transition-colors"
          >
            <i class="fas fa-arrow-left mr-1"></i>Kembali
          </button>
        </div>
      </div>
    `;
  }

  // Cleanup
  cleanup() {
    this.pendingUserData = null;
    this.otpRequested = false;
  }
}

// Initialize app when DOM is ready
document.addEventListener('DOMContentLoaded', async () => {
  const app = new App();
  await app.init();
});

// Export for potential external use
export { App, ThemeToggle };


