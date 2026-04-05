/**
 * Error Handler Utility
 * Reusable error display functions with Toast integration
 * Uses SweetAlert2 for professional notifications
 *
 * Note: Toast functions are accessed via global window.Toast
 * which is set after Toast.js loads
 */
import { DOMUtils } from '../../core/DOMUtils.js';

// Access Toast functions from global (set by Toast.js)
const getToast = () => window.Toast || null;

export class ErrorHandler {
  /**
   * Show error message in element
   * @param {string} elementId - Element ID to show error in
   * @param {string} message - Error message
   */
  static show(elementId, message) {
    const el = DOMUtils.getElement(elementId);
    if (el) {
      DOMUtils.setText(el, message);
      el.classList.remove('hidden');

      // Auto hide after 5 seconds
      setTimeout(() => {
        el.classList.add('hidden');
        DOMUtils.setText(el, '');
      }, 5000);
    }
  }

  /**
   * Hide error message
   * @param {string} elementId - Element ID to hide
   */
  static hide(elementId) {
    const el = DOMUtils.getElement(elementId);
    if (el) {
      DOMUtils.setText(el, '');
      el.classList.add('hidden');
    }
  }

  /**
   * Show authentication error with Toast
   * @param {string} message - Error message
   */
  static showAuthError(message) {
    this.show('auth-error', message);
    const Toast = getToast();
    if (Toast) Toast.error('Login Error', message);
  }

  /**
   * Hide authentication error
   */
  static hideAuthError() {
    this.hide('auth-error');
  }

  /**
   * Show registration error with Toast
   * @param {string} message - Error message
   */
  static showRegisterError(message) {
    this.show('register-error', message);
    const Toast = getToast();
    if (Toast) Toast.error('Registrasi Error', message);
  }

  /**
   * Hide registration error
   */
  static hideRegisterError() {
    this.hide('register-error');
  }

  /**
   * Generic error handler for API errors
   * @param {string} title - Error title
   * @param {string|object} error - Error message or object
   */
  static handleApiError(title, error) {
    let message = 'Terjadi kesalahan yang tidak diharapkan';
    
    if (typeof error === 'string') {
      message = error;
    } else if (error && error.message) {
      message = error.message;
    } else if (error && error.response && error.response.data && error.response.data.message) {
      message = error.response.data.message;
    }
    
    const Toast = getToast();
    if (Toast) Toast.error(title, message);
    console.error(`${title}:`, error);
  }

  /**
   * Show warning message
   * @param {string} title - Warning title
   * @param {string} message - Warning message
   */
  static showWarning(title, message) {
    const Toast = getToast();
    if (Toast) Toast.warning(title, message);
  }

  /**
   * Show info message
   * @param {string} title - Info title
   * @param {string} message - Info message
   */
  static showInfo(title, message) {
    const Toast = getToast();
    if (Toast) Toast.info(title, message);
  }
}

