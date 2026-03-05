/**
 * Register Component
 * Handles user registration UI with role-based fields
 * Delegates rendering to templates and logic to handlers
 */

class RegisterComponent {
  constructor(options = {}) {
    this.onSubmit = options.onSubmit || (() => {});
    this.onCancel = options.onCancel || (() => {});
    this.googleAuth = options.googleAuth || window.googleAuth;
    this.currentGoogleUser = null;
    
    // Use handler for form logic
    this.handler = new RegisterHandler({
      googleAuth: this.googleAuth
    });
  }

  /**
   * Render registration section HTML
   */
  render() {
    return RegisterTemplates.registerSection();
  }

  /**
   * Initialize event listeners
   */
  initEvents() {
    this.handler.initEvents({
      onSubmit: (formData) => this.handleSubmit(formData),
      onCancel: () => this.handleCancel()
    });
  }

  /**
   * Handle form submission
   */
  handleSubmit(formData) {
    this.onSubmit(formData);
  }

  /**
   * Handle cancel button
   */
  handleCancel() {
    this.reset();
    this.onCancel();
  }

  /**
   * Show register form with Google user data
   */
  show(googleUser) {
    this.currentGoogleUser = googleUser;
    
    // Fill Google info
    const avatarEl = document.getElementById('register-avatar');
    const nameEl = document.getElementById('register-name');
    const emailEl = document.getElementById('register-email');
    
    if (avatarEl) avatarEl.src = googleUser.picture;
    if (nameEl) nameEl.textContent = googleUser.name;
    if (emailEl) emailEl.textContent = googleUser.email;
    
    // Show section
    const section = document.getElementById('register-section');
    if (section) {
      section.classList.remove('hidden');
    }
    
    // Reset form
    this.reset();
  }

  /**
   * Hide register form
   */
  hide() {
    const section = document.getElementById('register-section');
    if (section) {
      section.classList.add('hidden');
    }
    this.reset();
  }

  /**
   * Reset form
   */
  reset() {
    this.handler.reset();
  }

  /**
   * Show error message
   */
  showError(message) {
    this.handler.showError(message);
  }

  /**
   * Hide error message
   */
  hideError() {
    this.handler.hideError();
  }
}

// Export for global use
window.RegisterComponent = RegisterComponent;

