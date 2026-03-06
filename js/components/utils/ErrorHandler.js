/**
 * Error Handler Utility
 * Reusable error display functions
 */

export class ErrorHandler {
  static show(elementId, message) {
    const el = document.getElementById(elementId);
    if (el) { el.textContent = message; el.classList.remove('hidden'); }
  }

  static hide(elementId) {
    const el = document.getElementById(elementId);
    if (el) { el.textContent = ''; el.classList.add('hidden'); }
  }

  static showAuthError(message) { this.show('auth-error', message); }
  static hideAuthError() { this.hide('auth-error'); }
  static showRegisterError(message) { this.show('register-error', message); }
  static hideRegisterError() { this.hide('register-error'); }
}

