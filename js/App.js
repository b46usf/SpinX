/**
 * Main Application Entry Point
 * Modular Architecture using ES6 Modules
 */

// Import all modules (for type checking and IDE support)
import { googleAuthInstance } from './auth/GoogleAuth.js';
import { AUTH_CONFIG } from './auth/Config.js';
import { ThemeToggle } from './components/ThemeToggle.js';
import { LoginTemplates } from './components/templates/LoginTemplates.js';
import { RegisterTemplates } from './components/templates/RegisterTemplates.js';
import { ErrorHandler } from './components/utils/ErrorHandler.js';
import { RoleFields } from './components/config/RoleFields.js';
import { RegisterHandler } from './components/utils/RegisterHandler.js';
import { OtpHandler, OtpTemplates } from './components/utils/OtpHandler.js';
import { LoginComponent } from './components/LoginComponent.js';
import { RegisterComponent } from './components/RegisterComponent.js';

// Make everything available globally for backward compatibility
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
    this.pendingUserData = null; // Store data for Telegram verification
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

    // Initialize Google Auth FIRST - this sets up the callback
    await this.googleAuth.init();

    // Setup callback BEFORE rendering components
    window.handleGoogleCredentialResponse = async (response) => {
      await this.googleAuth.handleCredentialResponse(response);
    };

    // Setup auth change handler
    this.googleAuth.onAuthChange((user, extra) => this.handleAuthChange(user, extra));

    // Initialize components AFTER Google Auth is ready
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
        if (!result.success) this.registerComponent.showError(result.message);
      },
      onCancel: () => this.showLoginSection()
    });
    
    // Initialize OTP handler
    this.otpHandler = new OtpHandler({
      onSuccess: () => {
        // After successful verification, go to login
        this.showLoginSection();
      },
      onResend: () => {
        // Reset form after resend
        const input = document.getElementById('otp-code');
        if (input) input.value = '';
      }
    });
  }

  handleAuthChange(user, extra) {
    if (user) {
      // Logged in - redirect handled by module
    } else if (extra && extra.needTelegramLink) {
      // Show Telegram link section
      this.showTelegramLinkSection(extra);
    } else if (extra && extra.needOTPVerification) {
      // Show OTP verification
      this.showOtpSection(extra);
    } else if (extra && extra.needRegister) {
      this.showRegisterSection(extra.googleUser);
    } else {
      this.showLoginSection();
    }
  }

  showLoginSection() {
    if (!this.appContainer) return;
    this.appContainer.innerHTML = this.loginComponent.render();
    this.loginComponent.initEvents();
  }

  showRegisterSection(googleUser) {
    if (!this.appContainer) return;
    this.appContainer.innerHTML = this.registerComponent.render();
    this.registerComponent.initEvents();
    this.registerComponent.show(googleUser);
  }

  showTelegramLinkSection(extra) {
    if (!this.appContainer) return;
    
    // Store pending data for refresh
    this.pendingUserData = {
      userId: extra.userId,
      email: extra.email,
      googleUser: extra.googleUser
    };
    
    // Render Telegram link section
    this.appContainer.innerHTML = this.getTelegramLinkTemplate(extra);
    
    // Setup polling to check if Telegram is linked
    this.startTelegramCheck(extra.userId);
    
    // Back to login button
    document.getElementById('back-to-login')?.addEventListener('click', () => {
      this.showLoginSection();
    });
  }

  getTelegramLinkTemplate(extra) {
    return `
      <div class="max-w-md mx-auto p-6 bg-gray-800 rounded-lg shadow-lg">
        <div class="text-center mb-6">
          <div class="w-20 h-20 mx-auto mb-4 rounded-full bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center">
            <i class="fab fa-telegram text-4xl text-white"></i>
          </div>
          <h2 class="text-2xl font-bold text-white mb-2">Hubungkan Telegram</h2>
          <p class="text-gray-400 text-sm">
            Untuk verifikasi OTP, silakan hubungkan akun Telegram Anda terlebih dahulu.
          </p>
        </div>
        
        <div class="bg-gray-700 rounded-lg p-4 mb-6">
          <p class="text-gray-300 text-sm mb-3">Langkah-langkah:</p>
          <ol class="list-decimal list-inside text-gray-300 text-sm space-y-2">
            <li>Klik tombol <strong>"Buka Telegram"</strong> di bawah</li>
            <li>Di Telegram, klik tombol <strong>START</strong></li>
            <li>Tunggu beberapa saat hingga verifikasi selesai</li>
          </ol>
        </div>
        
        <a 
          href="${extra.telegramLink}" 
          target="_blank"
          class="block w-full py-3 bg-blue-500 hover:bg-blue-600 text-white font-semibold rounded-lg text-center transition-colors mb-4"
        >
          <i class="fab fa-telegram mr-2"></i> Buka Telegram
        </a>
        
        <div id="telegram-status" class="text-center text-sm text-gray-400 mb-4">
          Menunggu verifikasi Telegram...
        </div>
        
        <button 
          id="refresh-telegram-status"
          class="w-full py-2 bg-gray-700 hover:bg-gray-600 text-gray-300 rounded-lg transition-colors text-sm"
        >
          <i class="fas fa-sync-alt mr-2"></i> Periksa Status
        </button>
        
        <div class="text-center mt-4">
          <button 
            type="button" 
            id="back-to-login"
            class="text-gray-400 hover:text-white text-sm"
          >
            ← Kembali ke Login
          </button>
        </div>
      </div>
    `;
  }

  startTelegramCheck(userId) {
    const statusEl = document.getElementById('telegram-status');
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
      // Try to generate OTP - if Telegram is linked, it will succeed
      const result = await window.AuthApi.generateOTP(userId, this.pendingUserData.email);
      
      if (result.success) {
        // Telegram is linked! Clear interval and show OTP section
        if (this.telegramCheckInterval) {
          clearInterval(this.telegramCheckInterval);
        }
        
        // Show success message briefly
        if (statusEl) {
          statusEl.innerHTML = '<span class="text-green-400">✅ Telegram terhubung! Mengarahkan ke verifikasi OTP...</span>';
        }
        
        // Show OTP section
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
          statusEl.innerHTML = '<span class="text-yellow-400">⏳ Menunggu koneksi Telegram...</span>';
        }
      } else {
        if (statusEl) {
          statusEl.innerHTML = '<span class="text-red-400">❌ ' + (result.message || 'Gagal memeriksa status') + '</span>';
        }
      }
    } catch (error) {
      console.error('Check Telegram status error:', error);
      if (statusEl) {
        statusEl.innerHTML = '<span class="text-red-400">❌ Gagal memeriksa status</span>';
      }
    }
  }

  showOtpSection(extra) {
    if (!this.appContainer) return;
    
    // Stop any existing telegram check
    if (this.telegramCheckInterval) {
      clearInterval(this.telegramCheckInterval);
    }
    
    // Store OTP data
    this.otpHandler.setData(extra.userId, extra.email);
    if (extra.otpId) {
      this.otpHandler.setOtpId(extra.otpId);
    }
    
    // Render OTP form
    this.appContainer.innerHTML = OtpTemplates.otpSection();
    
    // Update email display
    const emailEl = document.getElementById('otp-email');
    if (emailEl) emailEl.textContent = extra.email;
    
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
}

// Initialize app when DOM is ready
document.addEventListener('DOMContentLoaded', async () => {
  const app = new App();
  await app.init();
});

// Export for potential external use
export { App, ThemeToggle };

