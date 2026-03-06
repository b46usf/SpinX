/**
 * Main Application Entry Point
 * Modular ES6 Module Architecture
 */

// Import all modules
import GoogleAuth from './auth/googleAuth.js';
import { RoleFields } from './components/config/RoleFields.js';
import { ErrorHandler } from './components/utils/ErrorHandler.js';
import { RegisterHandler } from './components/utils/RegisterHandler.js';
import { LoginTemplates } from './components/templates/LoginTemplates.js';
import { RegisterTemplates } from './components/templates/RegisterTemplates.js';
import { ThemeToggle } from './components/ThemeToggle.js';
import { LoginComponent } from './components/LoginComponent.js';
import { RegisterComponent } from './components/RegisterComponent.js';

/**
 * App - Main Application Orchestrator
 */
class App {
  constructor() {
    this.GoogleAuth = GoogleAuth;
    this.themeToggle = null;
    this.loginComponent = null;
    this.registerComponent = null;
    this.appContainer = null;
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
    if (this.GoogleAuth.isLoggedIn()) {
      this.GoogleAuth.routeToDashboard(this.GoogleAuth.getRole());
      return;
    }

    // Initialize components
    this.initComponents();

    // Initialize Google Auth
    await this.GoogleAuth.init();

    // Setup callback
    window.handleGoogleCredentialResponse = async (response) => {
      await this.GoogleAuth.handleCredentialResponse(response);
    };

    // Setup auth change handler
    this.GoogleAuth.onAuthChange((user, extra) => this.handleAuthChange(user, extra));

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
    this.loginComponent = new LoginComponent({ GoogleAuth: this.GoogleAuth });
    this.registerComponent = new RegisterComponent({
      GoogleAuth: this.GoogleAuth,
      onSubmit: async (data) => {
        const result = await this.GoogleAuth.register(data);
        if (!result.success) this.registerComponent.showError(result.message);
      },
      onCancel: () => this.showLoginSection()
    });
  }

  handleAuthChange(user, extra) {
    if (user) {
      // Logged in - redirect handled by module
    } else if (extra?.needRegister) {
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
}

// Initialize app when DOM is ready
document.addEventListener('DOMContentLoaded', async () => {
  const app = new App();
  await app.init();
});

