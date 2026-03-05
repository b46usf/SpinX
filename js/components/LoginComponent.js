/**
 * Login Component
 * Handles Google Sign-In UI
 * Delegates rendering to templates
 */

class LoginComponent {
  constructor(options = {}) {
    this.onSuccess = options.onSuccess || (() => {});
    this.onRegister = options.onRegister || (() => {});
    this.googleAuth = options.googleAuth || window.googleAuth;
  }

  /**
   * Render login section HTML
   */
  render() {
    return LoginTemplates.loginSection();
  }

  /**
   * Initialize event listeners
   */
  initEvents() {
    // Google button is handled by googleAuth
  }

  /**
   * Show error message
   */
  showError(message) {
    ErrorHandler.showAuthError(message);
  }

  /**
   * Hide error message
   */
  hideError() {
    ErrorHandler.hideAuthError();
  }

  /**
   * Show login section
   */
  show() {
    const section = document.getElementById('login-section');
    if (section) {
      section.classList.remove('hidden');
    }
    this.hideError();
  }

  /**
   * Hide login section
   */
  hide() {
    const section = document.getElementById('login-section');
    if (section) {
      section.classList.add('hidden');
    }
  }
}

// Export for global use
window.LoginComponent = LoginComponent;

