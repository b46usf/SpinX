/**
 * Main Application Entry Point
 * Modular Architecture using ES6 Modules
 * Uses Toast for notifications
 */

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

// Get showInfo from global window.Toast (set by Toast.js)
// This avoids ES6 module import issues with SweetAlert2
const getShowInfo = () => {
  const Toast = window.Toast;
  return Toast ? Toast.info : () => {};
};

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
    this.telegramCheckInterval = null;
  }

  async init() {
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
    
    // Render with improved UI
    this.appContainer.innerHTML = this.getTelegramLinkTemplate(extra);
    
    // Setup polling
    this.startTelegramCheck(extra.userId);
    
    // Event listeners
    document.getElementById('back-to-login')?.addEventListener('click', () => {
      this.showLoginSection();
    });
    
    document.getElementById('open-telegram')?.addEventListener('click', () => {
      const showInfo = getShowInfo();
      showInfo('Buka Telegram', 'Klik START di bot Telegram untuk menghubungkan akun');
    });
  }

  getTelegramLinkTemplate(extra) {
    return `
      <div class="max-w-md mx-auto p-6 bg-gray-800 rounded-xl shadow-2xl animate-scale-in">
        <div class="text-center mb-6">
          <div class="w-20 h-20 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center shadow-lg">
            <i class="fab fa-telegram text-4xl text-white"></i>
          </div>
          <h2 class="text-2xl font-bold text-white mb-2">Hubungkan Telegram</h2>
          <p class="text-gray-400 text-sm">
            Untuk verifikasi OTP, silakan hubungkan akun Telegram Anda terlebih dahulu.
          </p>
        </div>
        
        <div class="bg-gray-700/50 rounded-xl p-4 mb-6 space-y-3">
          <p class="text-gray-300 text-sm font-medium mb-3">
            <i class="fas fa-list-ol mr-2 text-blue-400"></i>Langkah-langkah:
          </p>
          <ol class="list-decimal list-inside text-gray-300 text-sm space-y-2">
            <li>Klik tombol <strong class="text-blue-400">"Buka Telegram"</strong> di bawah</li>
            <li>Di Telegram, klik tombol <strong class="text-green-400">START</strong></li>
            <li>Tunggu hingga verifikasi selesai</li>
          </ol>
        </div>
        
        <a 
          id="open-telegram"
          href="${extra.telegramLink}" 
          target="_blank"
          class="flex items-center justify-center gap-3 w-full py-4 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white font-semibold rounded-xl transition-all transform hover:scale-[1.02] active:scale-[0.98] shadow-lg"
        >
          <i class="fab fa-telegram text-xl"></i>
          <span>Buka Telegram</span>
        </a>
        
        <div id="telegram-status" class="mt-4 p-3 bg-gray-700/30 rounded-lg">
          <div class="flex items-center justify-center gap-2 text-sm text-gray-400">
            <span class="w-2 h-2 rounded-full bg-yellow-500 animate-pulse"></span>
            <span>Menunggu verifikasi Telegram...</span>
          </div>
        </div>
        
        <button 
          id="refresh-telegram-status"
          class="w-full mt-3 py-2.5 bg-gray-700 hover:bg-gray-600 text-gray-300 rounded-lg transition-colors text-sm font-medium"
        >
          <i class="fas fa-sync-alt mr-2"></i>Periksa Status
        </button>
        
        <div class="text-center mt-4 pt-4 border-t border-gray-700">
          <button 
            type="button" 
            id="back-to-login"
            class="text-gray-400 hover:text-white text-sm transition-colors"
          >
            <i class="fas fa-arrow-left mr-1"></i>Kembali ke Login
          </button>
        </div>
      </div>
    `;
  }

  startTelegramCheck(userId) {
    const refreshBtn = document.getElementById('refresh-telegram-status');
    
    if (refreshBtn) {
      refreshBtn.addEventListener('click', () => {
        this.checkTelegramStatus(userId);
      });
    }
    
    // Auto check every 5 seconds
    this.telegramCheckInterval = setInterval(() => {
      this.checkTelegramStatus(userId);
    }, 5000);
  }

  async checkTelegramStatus(userId) {
    const statusEl = document.getElementById('telegram-status');
    
    if (!this.pendingUserData) return;
    
    try {
      const result = await window.AuthApi.generateOTP(userId, this.pendingUserData.email);
      
      if (result.success) {
        // Telegram linked!
        if (this.telegramCheckInterval) {
          clearInterval(this.telegramCheckInterval);
        }
        
        if (statusEl) {
          statusEl.innerHTML = `
            <div class="flex items-center justify-center gap-2 text-sm text-green-400">
              <i class="fas fa-check-circle"></i>
              <span>Telegram terhubung! Mengarahkan ke verifikasi OTP...</span>
            </div>
          `;
        }
        
        setTimeout(() => {
          this.showOtpSection({
            userId: this.pendingUserData.userId,
            email: this.pendingUserData.email,
            otpId: result.otpId,
            googleUser: this.pendingUserData.googleUser
          });
        }, 1500);
        
      } else if (result.error === 'TELEGRAM_NOT_LINKED') {
        if (statusEl) {
          statusEl.innerHTML = `
            <div class="flex items-center justify-center gap-2 text-sm text-yellow-400">
              <span class="w-2 h-2 rounded-full bg-yellow-500 animate-pulse"></span>
              <span>Menunggu koneksi Telegram...</span>
            </div>
          `;
        }
      } else {
        if (statusEl) {
          statusEl.innerHTML = `
            <div class="flex items-center justify-center gap-2 text-sm text-red-400">
              <i class="fas fa-exclamation-circle"></i>
              <span>${result.message || 'Gagal memeriksa status'}</span>
            </div>
          `;
        }
      }
    } catch (error) {
      console.error('Check Telegram status error:', error);
      if (statusEl) {
        statusEl.innerHTML = `
          <div class="flex items-center justify-center gap-2 text-sm text-red-400">
            <i class="fas fa-exclamation-circle"></i>
            <span>Gagal memeriksa status</span>
          </div>
        `;
      }
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
    this.appContainer.innerHTML = OtpTemplates.otpSection();
    
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

  // Cleanup interval on section change
  cleanup() {
    if (this.telegramCheckInterval) {
      clearInterval(this.telegramCheckInterval);
      this.telegramCheckInterval = null;
    }
    this.pendingUserData = null;
  }
}

// Initialize app when DOM is ready
document.addEventListener('DOMContentLoaded', async () => {
  const app = new App();
  await app.init();
});

// Export for potential external use
export { App, ThemeToggle };

