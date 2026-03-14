/**
 * Landing Page Controller
 * Coordinates the landing page layout and interaction flow.
 */

import {
  Navbar,
  HeroSection,
  FeaturesSection,
  PricingSection,
  TestimonialsSection,
  CTASection,
  Footer,
  RegisterModal,
  ToastContainer
} from '../components/landing/index.js';

class LandingPage {
  constructor() {
    this.container = null;
    this.selectedPlan = 'starter';
  }

  async init(containerId = 'app') {
    this.container = document.getElementById(containerId);
    if (!this.container) {
      console.error('LandingPage: Container not found');
      return;
    }

    await this.render();
    this.initEvents();
  }

  async render() {
    if (!this.container) return;

    await PricingSection.preload();

    this.container.innerHTML = `
      <div class="landing-page">
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

  initEvents() {
    Navbar.initEvents({
      onLogin: () => this.handleLogin()
    });

    PricingSection.initEvents();

    CTASection.initEvents({
      onSelectPlan: (planId) => this.openRegisterModal(planId)
    });

    RegisterModal.initEvents({
      onSuccess: (title, message) => ToastContainer.show('success', title, message),
      onError: (title, message) => ToastContainer.show('error', title, message)
    });

    TestimonialsSection.afterRender();
  }

  openRegisterModal(planId = 'starter') {
    this.selectedPlan = planId;
    PricingSection.openPlanModal(planId);
  }

  handleLogin() {
    if (window.App && window.App.showLoginSection) {
      window.App.showLoginSection();
    } else if (window.showLoginSection) {
      window.showLoginSection();
    } else {
      window.location.href = 'dashboard-admin.html';
    }
  }

  closeRegisterModal() {
    const modal = document.getElementById('register-modal');
    if (modal) modal.classList.add('hidden');
  }

  showToast(type, title, message) {
    ToastContainer.show(type, title, message);
  }
}

const landingPage = new LandingPage();
window.LandingPage = landingPage;
export default landingPage;
