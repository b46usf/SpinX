
/**
 * Login Component
 * Handles login UI rendering and events
 * Now uses reusable Modal component for subscription expiry modal
 */

import { LoginTemplates } from './templates/LoginTemplates.js';
import Modal from './utils/Modal.js';

export class LoginComponent {
  constructor(options = {}) {
    this.googleAuth = options.googleAuth || window.GoogleAuth;
  }

  render() {
    return LoginTemplates.loginSection();
  }

  initEvents() {
    // Re-render Google button after component is rendered
    if (window.google?.accounts?.id) {
      window.google.accounts.id.renderButton(
        document.getElementById("googleLoginBtn"),
        { theme: 'outline', size: 'large', width: '300' }
      );
    }
    
    const loginBtn = document.getElementById("googleLoginBtn");
    if (loginBtn) {
      loginBtn.addEventListener("click", () => {
        if (window.google?.accounts?.id) {
          window.google.accounts.id.prompt();
        }
      });
    }
  }

  /**
   * Show subscription expiry modal using reusable Modal component
   * @param {Object} result - Subscription result data from API
   * @param {Object} result.school - School information { schoolName, plan }
   * @param {Object} result.details - Subscription details { expiresAt, daysRemaining }
   */
  showSubscriptionModal(result) {
    const subscriptionData = {
      schoolName: result.school?.schoolName || 'Sekolah Anda',
      plan: result.school?.plan || 'Starter',
      expiresAt: result.details?.expiresAt || new Date(),
      daysRemaining: result.details?.daysRemaining || 0
    };

    const modalOptions = {
      onContact: () => {
        // Contact admin via WhatsApp
        const schoolName = subscriptionData.schoolName.replace(/\s+/g, '%20');
        window.open(
          `https://wa.me/85161609575?text=Hi%20Admin%20${schoolName}%2C%20subscription%20expired`,
          '_blank'
        );
      },
      onClose: () => {
        // Modal automatically closes
      }
    };

    Modal.subscription(subscriptionData, modalOptions);
  }

  /**
   * Hide subscription modal (for backward compatibility)
   * Note: Modal component handles closing automatically, kept for API compatibility
   */
  hideSubscriptionModal() {
    // Modal component handles closing via SweetAlert2
    const swal = window.Swal || window.SweetAlert2;
    if (swal) {
      swal.close();
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

window.LoginComponent = LoginComponent;


