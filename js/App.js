/**
 * Main Application Entry Point - ASYNC FIXED
 * Now properly awaits LandingPage → PricingSection VISIBLE
 */

import './components/utils/Toast.js';
import LandingPage from './pages/LandingPage.js';
import { TelegramLinkSection, OtpSection } from './components/auth/index.js';
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

class App {
  constructor() {
    this.googleAuth = googleAuthInstance;
    this.appContainer = null;
    this.pendingUserData = null;
    this.otpRequested = false;
  }

  async init() {
    await this.waitForToast();
    
    this.appContainer = document.getElementById('app');
    if (!this.appContainer) return;

    // Show Landing Page
    await this.showLandingPage();
    
    // Init Google Auth
    await this.googleAuth.init();
    
    window.handleGoogleCredentialResponse = async (response) => {
      await this.googleAuth.handleCredentialResponse(response);
    };
    
    this.googleAuth.onAuthChange((user, extra) => this.handleAuthChange(user, extra));
    this.initComponents();
  }

  /**
   * Show landing page - NOW ASYNC
   */
  async showLandingPage() {
    if (!this.appContainer) return;
    this.cleanup();
    await LandingPage.init('app');  // 🔥 AWAITS full render + pricing preload!
    window.showLoginSection = () => this.showLoginSection();
  }

  waitForToast() {
    return new Promise((resolve) => {
      let attempts = 0;
      const check = () => {
        if (window.Toast || attempts > 50) {
          resolve();
        } else {
          attempts++;
          setTimeout(check, 100);
        }
      };
      check();
    });
  }

  async showLoginSection() {/* unchanged */}
  handleAuthChange() {/* unchanged */}
  initComponents() {/* unchanged */}
  cleanup() {/* unchanged */}

  // ... rest unchanged
}

// Init
document.addEventListener('DOMContentLoaded', async () => {
  const app = new App();
  window.App = app;
  await app.init();
});

export { App, ThemeToggle };

