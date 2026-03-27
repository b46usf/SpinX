
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

    // NEW: Subscription Modal Events
    const modalClose = document.getElementById('modal-close-btn');
    const modalCloseAction = document.getElementById('modal-close-action');
    if (modalClose) modalClose.addEventListener('click', () => this.hideSubscriptionModal());
    if (modalCloseAction) modalClose.addEventListener('click', () => this.hideSubscriptionModal());
    
    const modalContact = document.getElementById('modal-contact-admin');
    if (modalContact) {
      modalContact.addEventListener('click', () => {
        this.hideSubscriptionModal();
        window.open('https://wa.me/85161609575?text=Hi%20Admin%20SMA%20Hang%20Tuah%202%20Sidoarjo%2C%20subscription%20expired', '_blank');
      });
    }
  }

  /**
   * NEW: Show subscription expiry modal
   */
  showSubscriptionModal(result) {
    const modal = document.getElementById('subscription-expiry-modal');
    const schoolNameEl = document.getElementById('modal-school-name');
    const planEl = document.getElementById('modal-plan');
    const expiresEl = document.getElementById('modal-expires');
    const daysEl = document.getElementById('modal-days-remaining');
    
    if (!modal) return;

    // Populate data
    schoolNameEl.textContent = result.school?.schoolName || 'Sekolah Anda';
    planEl.textContent = result.school?.plan?.toUpperCase() || 'STARTER';
    expiresEl.textContent = new Date(result.details.expiresAt).toLocaleDateString('id-ID', { 
      year: 'numeric', month: 'long', day: 'numeric' 
    });
    daysEl.textContent = `Expired ${Math.abs(result.details.daysRemaining)} hari`;

    modal.classList.remove('hidden');
    document.body.style.overflow = 'hidden';
  }

  hideSubscriptionModal() {
    const modal = document.getElementById('subscription-expiry-modal');
    if (modal) {
      modal.classList.add('hidden');
      document.body.style.overflow = '';
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


