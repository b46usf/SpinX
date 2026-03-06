
/**
 * Register Component
 * Handles registration UI rendering and events
 */

import { RegisterTemplates } from './templates/RegisterTemplates.js';
import { RegisterHandler } from './utils/RegisterHandler.js';

export class RegisterComponent {
  constructor(options = {}) {
    this.GoogleAuth = options.GoogleAuth || window.GoogleAuth;
    this.onSubmit = options.onSubmit || (() => {});
    this.onCancel = options.onCancel || (() => {});
    this.registerHandler = new RegisterHandler({ GoogleAuth: this.GoogleAuth });
  }

  render() {
    return RegisterTemplates.registerSection();
  }

  initEvents() {
    this.registerHandler.initEvents({
      onSubmit: this.onSubmit,
      onCancel: this.onCancel
    });
  }

  show(googleUser) {
    const section = document.getElementById('register-section');
    if (section) section.classList.remove('hidden');
    
    const avatarEl = document.getElementById('register-avatar');
    const nameEl = document.getElementById('register-name');
    const emailEl = document.getElementById('register-email');
    
    if (avatarEl) avatarEl.src = googleUser.picture;
    if (nameEl) nameEl.textContent = googleUser.name;
    if (emailEl) emailEl.textContent = googleUser.email;
    
    this.registerHandler.reset();
  }

  hide() {
    const section = document.getElementById('register-section');
    if (section) section.classList.add('hidden');
    this.registerHandler.reset();
  }

  showError(message) {
    this.registerHandler.showError(message);
  }

  hideError() {
    this.registerHandler.hideError();
  }
}


