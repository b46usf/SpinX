/**
 * Main Application Component
 * Orchestrates all authentication flow components
 */

class App {
  constructor(options = {}) {
    this.googleAuth = options.googleAuth;
    this.themeToggle = null;
    this.loginComponent = null;
    this.registerComponent = null;
    this.appContainer = null;
  }

  /**
   * Initialize the application
   */
  async init() {
    // Get app container
    this.appContainer = document.getElementById('app');
    if (!this.appContainer) {
      console.error('App container not found');
      return;
    }

    // Wait for googleAuth to be available
    await this.waitForGoogleAuth();
    this.googleAuth = window.googleAuth;

    // Initialize theme toggle first
    this.initThemeToggle();

    // Check if user is already logged in
    if (this.googleAuth.isLoggedIn()) {
      this.googleAuth.routeToDashboard(this.googleAuth.getRole());
      return;
    }

    // Initialize components (but don't render yet)
    this.initComponents();

    // Initialize Google Auth
    await this.googleAuth.init();

    // Setup global callback
    window.handleGoogleCredentialResponse = async (response) => {
      await this.googleAuth.handleCredentialResponse(response);
    };

    // Setup auth change handler
    this.googleAuth.onAuthChange((user, extra) => {
      this.handleAuthChange(user, extra);
    });

    // Show login section by default
    this.showLoginSection();
  }

  /**
   * Wait for googleAuth to be available
   */
  waitForGoogleAuth() {
    return new Promise((resolve) => {
      if (window.googleAuth) {
        resolve();
        return;
      }
      
      const checkInterval = setInterval(() => {
        if (window.googleAuth) {
          clearInterval(checkInterval);
          resolve();
        }
      }, 50);

      // Timeout after 5 seconds
      setTimeout(() => {
        clearInterval(checkInterval);
        console.error('googleAuth not loaded');
        resolve();
      }, 5000);
    });
  }

  /**
   * Initialize theme toggle
   */
  initThemeToggle() {
    this.themeToggle = new ThemeToggle();
    this.themeToggle.init();
    
    // Mount theme toggle to container
    const themeContainer = document.getElementById('theme-toggle-container');
    if (themeContainer) {
      const btn = this.themeToggle.render();
      themeContainer.appendChild(btn);
    }
  }

  /**
   * Initialize all components
   */
  initComponents() {
    // Login Component
    this.loginComponent = new LoginComponent({
      googleAuth: this.googleAuth
    });

    // Register Component
    this.registerComponent = new RegisterComponent({
      googleAuth: this.googleAuth,
      onSubmit: async (formData) => {
        await this.handleRegister(formData);
      },
      onCancel: () => {
        this.showLoginSection();
      }
    });
  }

  /**
   * Handle authentication state changes
   */
  handleAuthChange(user, extra) {
    if (user) {
      // User is logged in - redirect handled by module
    } else if (extra && extra.needRegister) {
      // Show registration form
      this.showRegisterSection(extra.googleUser);
    } else {
      this.showLoginSection();
    }
  }

  /**
   * Handle registration
   */
  async handleRegister(formData) {
    const result = await this.googleAuth.register(formData);
    
    if (!result.success) {
      this.registerComponent.showError(result.message);
    }
    // Success will trigger onAuthChange callback which redirects
  }

  /**
   * Show login section - renders login component HTML
   */
  showLoginSection() {
    if (!this.appContainer) return;
    
    this.appContainer.innerHTML = this.loginComponent.render();
    this.loginComponent.initEvents();
  }

  /**
   * Show register section - renders register component HTML
   */
  showRegisterSection(googleUser) {
    if (!this.appContainer) return;
    
    this.appContainer.innerHTML = this.registerComponent.render();
    this.registerComponent.initEvents();
    this.registerComponent.show(googleUser);
  }
}

// Export for global use
window.App = App;

