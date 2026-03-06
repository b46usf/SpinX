
/**
 * Login Component
 * Handles login UI rendering and events
 */

import { LoginTemplates } from './templates/LoginTemplates.js';

export class LoginComponent {
  constructor(options = {}) {
    this.GoogleAuth = options.GoogleAuth || window.GoogleAuth;
  }

  render() {
    return LoginTemplates.loginSection();
  }

  initEvents() {
    // Google button is handled by GoogleAuth in setupLoginButton()
  }

  showError(message) {
    const errorEl = document.getElementById('auth-error');
    if (errorEl) { errorEl.textContent = message; errorEl.classList.remove('hidden'); }
  }

  hideError() {
    const errorEl = document.getElementById('auth-error');
    if (errorEl) { errorEl.textContent = ''; errorEl.classList.add('hidden'); }
  }

  show() {
    const section = document.getElementById('login-section');
    if (section) section.classList.remove('hidden');
    this.hideError();
  }

  hide() {
    const section = document.getElementById('login-section');
    if (section) section.classList.add('hidden');
  }
}


