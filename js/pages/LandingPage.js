/**
 * Landing Page Controller
 * Manages the complete landing page functionality
 */

import { Navbar, HeroSection, FeaturesSection, PricingSection, TestimonialsSection, CTASection, Footer, RegisterModal, ToastContainer } from '../components/landing/index.js';

class LandingPage {
  constructor() {
    this.container = null;
    this.selectedPlan = 'starter';
  }

  /**
   * Initialize the landing page
   */
  init(containerId = 'app') {
    this.container = document.getElementById(containerId);
    if (!this.container) {
      console.error('LandingPage: Container not found');
      return;
    }
    this.render();
    this.initEvents();
  }

  /**
   * Render the complete landing page
   */
  render() {
    if (!this.container) return;
    
    this.container.innerHTML = `
      <div class="landing-hero">
        ${Navbar.render()}
        ${HeroSection.render()}
        ${FeaturesSection.render()}
        ${PricingSection.render()}
        ${TestimonialsSection.render()}
        ${CTASection.render()}
        ${Footer.render()}
        ${RegisterModal.render()}
        ${ToastContainer.render()}
      </div>
    `;
  }

  /**
   * Initialize event listeners
   */
  initEvents() {
    // Navbar events
    Navbar.initEvents({
      onLogin: () => this.handleLogin()
    });

    // Pricing section events
    PricingSection.initEvents({
      onSelectPlan: (plan) => this.selectPlan(plan)
    });

    // CTA section events
    CTASection.initEvents({
      onSelectPlan: (plan) => this.selectPlan(plan)
    });

    // Register modal events
    RegisterModal.initEvents({
      onSuccess: (title, message) => ToastContainer.show('success', title, message),
      onError: (title, message) => ToastContainer.show('error', title, message)
    });

    // Initialize carousel after render
    TestimonialsSection.afterRender();
  }

  /**
   * Handle login button click
   */
  handleLogin() {
    // Trigger the auth app login
    // This will be set by App.js
    if (window.App && window.App.showLoginSection) {
      window.App.showLoginSection();
    } else if (window.showLoginSection) {
      window.showLoginSection();
    } else {
      // Fallback: redirect to dashboard login
      window.location.href = 'dashboard-admin.html';
    }
  }

  /**
   * Select a plan and open register modal
   */
  selectPlan(plan) {
    const planNames = {
      'starter': 'Starter - Gratis',
      'pro': 'Pro - Rp 150rb/bulan',
      'enterprise': 'Enterprise - Rp 500rb/bulan'
    };
    
    this.selectedPlan = plan;
    
    // Update modal content if it exists
    const badge = document.getElementById('selected-plan-badge');
    const planInput = document.getElementById('selected-plan');
    const modal = document.getElementById('register-modal');
    
    if (badge) badge.textContent = planNames[plan] || 'Starter - Gratis';
    if (planInput) planInput.value = plan;
    if (modal) modal.classList.remove('hidden');
  }

  /**
   * Close register modal (called from onclick)
   */
  closeRegisterModal() {
    const modal = document.getElementById('register-modal');
    if (modal) modal.classList.add('hidden');
  }

  /**
   * Show toast notification
   */
  showToast(type, title, message) {
    ToastContainer.show(type, title, message);
  }
}

// Create and export singleton instance
const landingPage = new LandingPage();

// Make available globally for onclick handlers
window.LandingPage = landingPage;

// Export for module usage
export default landingPage;

