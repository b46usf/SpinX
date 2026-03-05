/**
 * Error Handler Utility
 * Reusable error display functions
 */

class ErrorHandler {
  /**
   * Show error message
   */
  static show(elementId, message) {
    const el = document.getElementById(elementId);
    if (el) {
      el.textContent = message;
      el.classList.remove('hidden');
    }
  }

  /**
   * Hide error message
   */
  static hide(elementId) {
    const el = document.getElementById(elementId);
    if (el) {
      el.textContent = '';
      el.classList.add('hidden');
    }
  }

  /**
   * Show auth error
   */
  static showAuthError(message) {
    this.show('auth-error', message);
  }

  /**
   * Hide auth error
   */
  static hideAuthError() {
    this.hide('auth-error');
  }

  /**
   * Show register error
   */
  static showRegisterError(message) {
    this.show('register-error', message);
  }

  /**
   * Hide register error
   */
  static hideRegisterError() {
    this.hide('register-error');
  }
}

// Export for global use
window.ErrorHandler = ErrorHandler;

