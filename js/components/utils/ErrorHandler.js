/**
 * Error Handler Utility
 * Reusable error display functions with Toast integration
 * Uses SweetAlert2 for professional notifications
 */

import { showError, showWarning, showInfo } from './Toast.js';

export class ErrorHandler {
  /**
   * Show error message in element
   * @param {string} elementId - Element ID to show error in
   * @param {string} message - Error message
   */
  static show(elementId, message) {
    const el = document.getElementById(elementId);
    if (el) {
      el.textContent = message;
      el.classList.remove('hidden');
      
      // Auto hide after 5 seconds
      setTimeout(() => {
        el.classList.add('hidden');
        el.textContent = '';
      }, 5000);
    }
  }

  /**
   * Hide error message
   * @param {string} elementId - Element ID to hide
   */
  static hide(elementId) {
    const el = document.getElementById(elementId);
    if (el) {
      el.textContent = '';
      el.classList.add('hidden');
    }
  }

  /**
   * Show authentication error with Toast
   * @param {string} message - Error message
   */
  static showAuthError(message) {
    this.show('auth-error', message);
    showError('Login Error', message);
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
    showError('Registrasi Error', message);
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
    
    showError(title, message);
    console.error(`${title}:`, error);
  }

  /**
   * Show warning message
   * @param {string} title - Warning title
   * @param {string} message - Warning message
   */
  static showWarning(title, message) {
    showWarning(title, message);
  }

  /**
   * Show info message
   * @param {string} title - Info title
   * @param {string} message - Info message
   */
  static showInfo(title, message) {
    showInfo(title, message);
  }
}

