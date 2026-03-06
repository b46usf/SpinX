/**
 * Main Application Entry Point
 * Modular Architecture using ES6 Modules
 */

// Import all modules (for type checking and IDE support)
import { googleAuthInstance } from './auth/GoogleAuth.js';
import { ThemeToggle } from './components/ThemeToggle.js';
import { LoginTemplates } from './components/templates/LoginTemplates.js';
import { RegisterTemplates } from './components/templates/RegisterTemplates.js';
import { ErrorHandler } from './components/utils/ErrorHandler.js';
import { RoleFields } from './components/config/RoleFields.js';
import { RegisterHandler } from './components/utils/RegisterHandler.js';
import { LoginComponent } from './components/LoginComponent.js';
import { RegisterComponent } from './components/RegisterComponent.js';

// Make everything available globally for backward compatibility
// Note: Don't reassign GoogleAuth here - it's already set by the GoogleAuth module
// Note: AUTH_CONFIG is also set by GoogleAuth.js
window.ThemeToggle = ThemeToggle;
window.LoginTemplates = LoginTemplates;
window.RegisterTemplates = RegisterTemplates;
window.ErrorHandler = ErrorHandler;
window.RoleFields = RoleFields;
window.RegisterHandler = RegisterHandler;
window.LoginComponent = LoginComponent;
window.RegisterComponent = RegisterComponent;

/**
 * Main Application Class
 */
class App {
  constructor() {
    // Use the singleton instance from GoogleAuth module
    this.googleAuth = googleAuthInstance;
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
  }

  handleAuthChange(user, extra) {
    if (user) {
      // Logged in - redirect handled by module
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
}

// Initialize app when DOM is ready
document.addEventListener('DOMContentLoaded', async () => {
  const app = new App();
  await app.init();
});

// Export for potential external use
export { App, ThemeToggle };

