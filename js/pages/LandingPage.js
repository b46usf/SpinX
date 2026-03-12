/**
 * Landing Page Controller - ASYNC FIXED VERSION
 * Manages the complete landing page functionality
 * Now properly awaits PricingSection preload → GUARANTEED VISIBLE
 */

import { Navbar, HeroSection, FeaturesSection, PricingSection, TestimonialsSection, CTASection, Footer, RegisterModal, ToastContainer } from '../components/landing/index.js';

class LandingPage {
  constructor() {
    this.container = null;
    this.selectedPlan = 'starter';
  }

  /**
   * Initialize the landing page - NOW ASYNC
   */
  async init(containerId = 'app') {
    this.container = document.getElementById(containerId);
    if (!this.container) {
      console.error('LandingPage: Container not found');
      return;
    }
    
    await this.render();
    this.initEvents();
  }

  /**
   * Render the complete landing page - ASYNC VERSION
   * 🔥 FIX: PRELOADS PricingSection data FIRST!
   */
  async render() {
    if (!this.container) return;
    
    // 🔥 CRITICAL FIX: Preload pricing data BEFORE render
    console.log('🔄 LandingPage: Preloading pricing data...');
    await PricingSection.preload();
    console.log('✅ LandingPage: Pricing data ready!');
    
    // Now render with GUARANTEED data
    this.container.innerHTML = `
      <div class="landing-hero">
        ${Navbar.render()}
        ${HeroSection.render()}
        ${FeaturesSection.render()}
        ${await PricingSection.render()}
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

    // Pricing section events - no callback needed (direct modal control)

    // CTA section events
    CTASection.initEvents({});

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
    if (window.App && window.App.showLoginSection) {
      window.App.showLoginSection();
    } else if (window.showLoginSection) {
      window.showLoginSection();
    } else {
      window.location.href = 'dashboard-admin.html';
    }
  }



  /**
   * Close register modal
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

// Singleton instance
const landingPage = new LandingPage();
window.LandingPage = landingPage;
export default landingPage;

