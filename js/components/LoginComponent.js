
/**
 * Login Component
 * Handles login UI rendering and events
 */

import { LoginTemplates } from './templates/LoginTemplates.js';

export class LoginComponent {
  constructor(options = {}) {
    this.googleAuth = options.googleAuth || window.GoogleAuth;
  }

  render() {
    return LoginTemplates.loginSection();
  }

  initEvents() {
    // Re-render Google button after component is rendered
    // This is needed because innerHTML replaces the DOM elements
    if (window.google?.accounts?.id) {
      // Reinitialize Google Auth to render the button
      window.google.accounts.id.renderButton(
        document.getElementById("googleLoginBtn"),
        { theme: 'outline', size: 'large', width: '100%' }
      );
    }
    
    // Also add click handler for the custom button as backup
    const loginBtn = document.getElementById("googleLoginBtn");
    if (loginBtn) {
      loginBtn.addEventListener("click", () => {
        if (window.google?.accounts?.id) {
          window.google.accounts.id.prompt();
        }
      });
    }
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


