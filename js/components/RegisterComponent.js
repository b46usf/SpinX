/**
 * Register Component
 * Handles registration UI rendering and events
 */

import { RegisterTemplates } from './templates/RegisterTemplates.js';
import { RegisterHandler } from './utils/RegisterHandler.js';

export class RegisterComponent {
  constructor(options = {}) {
    this.googleAuth = options.googleAuth || window.GoogleAuth;
    this._onSubmit = options.onSubmit || (() => {});
    this._onCancel = options.onCancel || (() => {});
    this.registerHandler = new RegisterHandler({ googleAuth: this.googleAuth });
    this.mode = 'standard';
  }

  /**
   * Getter for onSubmit - allows dynamic assignment
   */
  get onSubmit() {
    return this._onSubmit;
  }

  /**
   * Setter for onSubmit - allows dynamic assignment
   */
  set onSubmit(value) {
    this._onSubmit = value;
  }

  /**
   * Getter for onCancel - allows dynamic assignment
   */
  get onCancel() {
    return this._onCancel;
  }

  /**
   * Setter for onCancel - allows dynamic assignment
   */
  set onCancel(value) {
    this._onCancel = value;
  }

  /**
   * Render standard register section (siswa, guru, mitra)
   */
  render() {
    this.mode = 'standard';
    return RegisterTemplates.registerSection();
  }

  /**
   * Render admin system register section (simplified form)
   */
  renderAdmin() {
    this.mode = 'admin-system';
    return RegisterTemplates.registerSectionAdmin();
  }

  /**
   * Render admin school register section
   */
  renderAdminSchool() {
    this.mode = 'admin-school';
    return RegisterTemplates.registerSectionAdminSchool();
  }

  /**
   * Check if current registration is for admin system
   */
  isAdmin() {
    return this.mode === 'admin-system';
  }

  initEvents() {
    // Use arrow functions that call getters - this allows dynamic assignment of onSubmit/onCancel
    this.registerHandler.initEvents({
      onSubmit: (data) => this._onSubmit(data),
      onCancel: () => this._onCancel()
    });
  }

  /**
   * Show register section with Google user data
   * @param {Object} googleUser - Google user info
   * @param {Object|boolean} options - Display options
   */
  show(googleUser, options = {}) {
    const config = typeof options === 'boolean'
      ? { mode: options ? 'admin-system' : 'standard' }
      : options;

    this.mode = config.mode || this.mode || 'standard';
    
    const section = document.getElementById('register-section');
    if (section) section.classList.remove('hidden');
    
    const avatarEl = document.getElementById('register-avatar');
    const nameEl = document.getElementById('register-name');
    const emailEl = document.getElementById('register-email');
    
    if (avatarEl) avatarEl.src = googleUser.picture;
    if (nameEl) nameEl.textContent = googleUser.name;
    if (emailEl) emailEl.textContent = googleUser.email;
    
    this.registerHandler.reset();

    if (this.mode === 'admin-system' || this.mode === 'admin-school') {
      const namaInput = document.getElementById('nama');
      if (namaInput && googleUser.name) {
        namaInput.value = googleUser.name;
      }
    }

    if (this.mode === 'admin-school' && config.school) {
      const schoolIdInput = document.getElementById('school-id');
      const schoolNameInput = document.getElementById('school-name-display');
      const phoneInput = document.getElementById('noWa');

      if (schoolIdInput) schoolIdInput.value = config.school.schoolId || config.school.id || '';
      if (schoolNameInput) schoolNameInput.value = config.school.schoolName || config.school.name || '';
      if (phoneInput && config.school.noWa) phoneInput.value = config.school.noWa;
    }
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

