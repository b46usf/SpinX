
/**
 * Main Application Entry Point
 * Modular Architecture using ES6 Modules
 * Supports both Landing Page and Auth flows
 */

// Import Toast FIRST to ensure it's available globally
import './components/utils/Toast.js';

// Import Landing Page
import LandingPage from './pages/LandingPage.js';

// Import Auth Components
import { TelegramLinkSection, OtpSection } from './components/auth/index.js';

// Import all auth modules
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
window.LandingPage = LandingPage;

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
    this.otpRequested = false;
  }

  async init() {
    await this.waitForToast();
    
    this.appContainer = document.getElementById('app');
    if (!this.appContainer) {
      console.error('App container not found');
      return;
    }

    this.initTheme();

    // Check if already logged in
    if (this.googleAuth.isLoggedIn()) {
      this.googleAuth.routeToDashboard(this.googleAuth.getRole());
      return;
    }

    // Show Landing Page first (for index.html)
    this.showLandingPage();
    
    // Initialize Google Auth (but don't show login yet)
    await this.googleAuth.init();

    // Setup callback
    window.handleGoogleCredentialResponse = async (response) => {
      await this.googleAuth.handleCredentialResponse(response);
    };

    // Setup auth change handler
    this.googleAuth.onAuthChange((user, extra) => this.handleAuthChange(user, extra));

    // Initialize components
    this.initComponents();
  }

  /**
   * Show landing page
   */
  showLandingPage() {
    if (!this.appContainer) return;
    this.cleanup();
    LandingPage.init('app');
    window.showLoginSection = () => this.showLoginSection();
  }

  /**
   * Wait for Toast to be available
   */
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

  /**
   * Initialize theme toggle
   */
  initTheme() {
    this.themeToggle = new ThemeToggle();
    this.themeToggle.init();
    const container = document.getElementById('theme-toggle-container');
    if (container) container.appendChild(this.themeToggle.render());
  }

  /**
   * Initialize auth components
   */
  initComponents() {
    this.loginComponent = new LoginComponent({ 
      googleAuth: this.googleAuth 
    });
    
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
    
    this.otpHandler = new OtpHandler({
      onSuccess: () => this.showLoginSection(),
      onResend: () => {
        const input = document.getElementById('otp-code');
        if (input) input.value = '';
      }
    });
  }

  /**
   * Handle auth state changes
   */
  handleAuthChange(user, extra) {
    if (user) {
      // Logged in - redirect handled by module
    } else if (extra?.needTelegramLink) {
      this.showTelegramLinkSection(extra);
    } else if (extra?.needOTPVerification) {
      this.showOtpSection(extra);
    } else if (extra?.needRegister) {
      this.showRegisterSection(extra.googleUser);
    } else {
      this.showLoginSection();
    }
  }

  /**
   * Show login section
   */
  showLoginSection() {
    if (!this.appContainer) return;
    this.cleanup();
    this.appContainer.innerHTML = this.loginComponent.render();
    this.loginComponent.initEvents();
  }

  /**
   * Show register section
   */
  showRegisterSection(googleUser) {
    if (!this.appContainer) return;
    this.cleanup();
    this.appContainer.innerHTML = this.registerComponent.render();
    this.registerComponent.initEvents();
    this.registerComponent.show(googleUser);
  }

  /**
   * Show Telegram link section
   */
  showTelegramLinkSection(extra) {
    if (!this.appContainer) return;
    
    this.cleanup();
    
    // Store pending data
    this.pendingUserData = {
      userId: extra.userId,
      email: extra.email,
      googleUser: extra.googleUser
    };
    
    this.otpRequested = false;
    
    // Use modular component
    this.appContainer.innerHTML = TelegramLinkSection.render(extra);
    
    TelegramLinkSection.initEvents({
      onBack: () => this.showLoginSection(),
      onRefresh: () => this.checkTelegramStatus()
    });
  }

  /**
   * Check Telegram verification status
   */
  async checkTelegramStatus() {
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
        this.otpRequested = true;
        
        TelegramLinkSection.updateStatus('success', result.debug_otp 
          ? `Telegram Terhubung! Kode OTP: ${result.debug_otp}`
          : 'Telegram Terhubung! Mengirim OTP...');
        
        if (Toast) {
          Toast.success('Telegram Terhubung!', result.debug_otp 
            ? 'Kode OTP: ' + result.debug_otp 
            : 'Kode OTP dikirim ke Telegram Anda');
        }
        
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
        TelegramLinkSection.updateStatus('not_linked');
      } else {
        TelegramLinkSection.updateStatus('error', result.message);
      }
    } catch (error) {
      console.error('Check Telegram status error:', error);
      TelegramLinkSection.updateStatus('error', 'Error koneksi');
    }
  }

  /**
   * Get client IP address
   */
  async getClientIP() {
    try {
      const response = await fetch('https://api.ipify.org?format=json');
      const data = await response.json();
      return data.ip || '';
    } catch (error) {
      return '';
    }
  }

  /**
   * Show OTP verification section
   */
  showOtpSection(extra) {
    if (!this.appContainer) return;
    
    this.cleanup();
    
    this.otpHandler.setData(extra.userId, extra.email);
    if (extra.otpId) {
      this.otpHandler.setOtpId(extra.otpId);
    }
    
    this.appContainer.innerHTML = OtpSection.render();
    
    OtpSection.initEvents({
      onBack: () => this.showLoginSection(),
      onResend: () => this.otpHandler.handleResend(),
      onSubmit: (e) => {
        e.preventDefault();
        const otpCode = document.getElementById('otp-code')?.value;
        if (otpCode) {
          this.otpHandler.verify(otpCode);
        }
      }
    });
  }

  /**
   * Cleanup state
   */
  cleanup() {
    this.pendingUserData = null;
    this.otpRequested = false;
  }
}

// Initialize app when DOM is ready
document.addEventListener('DOMContentLoaded', async () => {
  const app = new App();
  window.App = app;
  await app.init();
});

// Export for potential external use
export { App, ThemeToggle };

