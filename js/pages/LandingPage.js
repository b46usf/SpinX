/**
 * Landing Page Controller
 * Renders the landing page fast, then hydrates lower sections progressively.
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
    this.loadingSections = new Map();
    this.loadedSections = new Set();
    this.sectionObserver = null;
    this.sectionDefinitions = this.createSectionDefinitions();
  }

  createSectionDefinitions() {
    return [
      {
        id: 'features',
        type: 'section',
        eager: true,
        render: async () => FeaturesSection.render()
      },
      {
        id: 'pricing',
        type: 'section',
        eager: true,
        render: async () => PricingSection.render()
      },
      {
        id: 'testimonials',
        type: 'section',
        render: async () => TestimonialsSection.render(),
        afterRender: () => TestimonialsSection.afterRender()
      },
      {
        id: 'cta',
        type: 'section',
        render: async () => CTASection.render(),
        afterRender: () => {
          CTASection.initEvents({
            onSelectPlan: (planId) => this.openRegisterModal(planId)
          });
        }
      },
      {
        id: 'footer',
        type: 'footer',
        render: async () => Footer.render()
      }
    ];
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

    this.container.innerHTML = `
      <div class="landing-page">
        ${Navbar.render()}
        ${HeroSection.render()}
        ${this.sectionDefinitions.map((section) => this.renderLazyHost(section)).join('')}
        ${RegisterModal.render()}
        ${ToastContainer.render()}
      </div>
    `;
  }

  renderLazyHost(section) {
    if (section.type === 'footer') {
      return `
        <div class="landing-lazy-host landing-lazy-host--footer" data-lazy-section="${section.id}">
          ${this.renderSectionSkeleton(section.id)}
        </div>
      `;
    }

    return `
      <section
        id="${section.id}"
        class="landing-section landing-anchor landing-lazy-host landing-lazy-host--${section.id}"
        data-nav-section
        data-lazy-section="${section.id}"
      >
        ${this.renderSectionSkeleton(section.id)}
      </section>
    `;
  }

  renderSectionSkeleton(sectionId) {
    if (sectionId === 'features') {
      return `
        <div class="landing-shell">
          <div class="landing-skeleton-block landing-skeleton-block--section">
            <div class="landing-skeleton-line landing-skeleton-line--pill"></div>
            <div class="landing-skeleton-line landing-skeleton-line--title"></div>
          </div>
          <div class="landing-skeleton-grid landing-skeleton-grid--cards">
            ${Array.from({ length: 6 }, () => `
              <div class="landing-skeleton-card">
                <div class="landing-skeleton-line landing-skeleton-line--icon"></div>
                <div class="landing-skeleton-line landing-skeleton-line--card-title"></div>
                <div class="landing-skeleton-line"></div>
                <div class="landing-skeleton-line landing-skeleton-line--short"></div>
              </div>
            `).join('')}
          </div>
        </div>
      `;
    }

    if (sectionId === 'pricing') {
      return `
        <div class="landing-shell">
          <div class="landing-skeleton-layout">
            <div class="landing-skeleton-block landing-skeleton-block--section">
              <div class="landing-skeleton-line landing-skeleton-line--pill"></div>
              <div class="landing-skeleton-line landing-skeleton-line--title"></div>
              <div class="landing-skeleton-line landing-skeleton-line--medium"></div>
            </div>
            <div class="landing-skeleton-card landing-skeleton-card--summary">
              <div class="landing-skeleton-line landing-skeleton-line--pill"></div>
              <div class="landing-skeleton-line landing-skeleton-line--card-title"></div>
              <div class="landing-skeleton-line"></div>
            </div>
          </div>
          <div class="landing-skeleton-grid landing-skeleton-grid--pricing">
            ${Array.from({ length: 3 }, () => `
              <div class="landing-skeleton-card landing-skeleton-card--pricing">
                <div class="landing-skeleton-line landing-skeleton-line--pill"></div>
                <div class="landing-skeleton-line landing-skeleton-line--card-title"></div>
                <div class="landing-skeleton-line landing-skeleton-line--price"></div>
                <div class="landing-skeleton-line"></div>
                <div class="landing-skeleton-line"></div>
                <div class="landing-skeleton-line landing-skeleton-line--button"></div>
              </div>
            `).join('')}
          </div>
        </div>
      `;
    }

    if (sectionId === 'testimonials') {
      return `
        <div class="landing-shell">
          <div class="landing-skeleton-block landing-skeleton-block--section">
            <div class="landing-skeleton-line landing-skeleton-line--pill"></div>
            <div class="landing-skeleton-line landing-skeleton-line--title"></div>
          </div>
          <div class="landing-skeleton-grid landing-skeleton-grid--cards">
            ${Array.from({ length: 3 }, () => `
              <div class="landing-skeleton-card">
                <div class="landing-skeleton-line landing-skeleton-line--medium"></div>
                <div class="landing-skeleton-line"></div>
                <div class="landing-skeleton-line"></div>
                <div class="landing-skeleton-line landing-skeleton-line--short"></div>
              </div>
            `).join('')}
          </div>
        </div>
      `;
    }

    if (sectionId === 'cta') {
      return `
        <div class="landing-shell">
          <div class="landing-skeleton-card landing-skeleton-card--cta">
            <div class="landing-skeleton-line landing-skeleton-line--pill"></div>
            <div class="landing-skeleton-line landing-skeleton-line--title"></div>
            <div class="landing-skeleton-line"></div>
            <div class="landing-skeleton-line landing-skeleton-line--button"></div>
          </div>
        </div>
      `;
    }

    return `
      <div class="landing-shell">
        <div class="landing-skeleton-grid landing-skeleton-grid--footer">
          ${Array.from({ length: 3 }, () => `
            <div class="landing-skeleton-card">
              <div class="landing-skeleton-line landing-skeleton-line--card-title"></div>
              <div class="landing-skeleton-line"></div>
              <div class="landing-skeleton-line landing-skeleton-line--short"></div>
            </div>
          `).join('')}
        </div>
      </div>
    `;
  }

  initEvents() {
    Navbar.initEvents({
      onLogin: () => this.handleLogin()
    });

    PricingSection.initEvents();

    RegisterModal.initEvents({
      onSuccess: (title, message) => ToastContainer.show('success', title, message),
      onError: (title, message) => ToastContainer.show('error', title, message)
    });

    this.initLazySections();
  }

  initLazySections() {
    const hosts = Array.from(this.container.querySelectorAll('[data-lazy-section]'));
    if (!hosts.length) return;

    if (this.sectionObserver) {
      this.sectionObserver.disconnect();
    }

    this.sectionObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;

          const sectionId = entry.target.dataset.lazySection;
          this.loadSection(sectionId);
          this.sectionObserver?.unobserve(entry.target);
        });
      },
      {
        rootMargin: '280px 0px 280px 0px',
        threshold: 0.01
      }
    );

    hosts.forEach((host) => this.sectionObserver.observe(host));

    window.requestAnimationFrame(() => {
      this.loadSection('features');
      window.setTimeout(() => this.loadSection('pricing'), 40);
    });
  }

  getSectionDefinition(sectionId) {
    return this.sectionDefinitions.find((section) => section.id === sectionId) || null;
  }

  getSectionHost(sectionId) {
    return this.container?.querySelector(`[data-lazy-section="${sectionId}"]`) || null;
  }

  async loadSection(sectionId) {
    if (this.loadedSections.has(sectionId)) return;

    const existingPromise = this.loadingSections.get(sectionId);
    if (existingPromise) return existingPromise;

    const section = this.getSectionDefinition(sectionId);
    const host = this.getSectionHost(sectionId);

    if (!section || !host) return;

    const loadPromise = Promise.resolve()
      .then(() => section.render())
      .then((markup) => {
        const currentHost = this.getSectionHost(sectionId);
        if (!currentHost) return;

        currentHost.outerHTML = markup;
        this.loadedSections.add(sectionId);
        this.loadingSections.delete(sectionId);

        if (section.afterRender) {
          section.afterRender();
        }

        window.dispatchEvent(
          new CustomEvent('landing:section-loaded', {
            detail: { id: sectionId }
          })
        );
      })
      .catch((error) => {
        this.loadingSections.delete(sectionId);
        console.error(`LandingPage: failed to load section "${sectionId}"`, error);
      });

    this.loadingSections.set(sectionId, loadPromise);
    return loadPromise;
  }

  async openRegisterModal(planId = 'starter') {
    this.selectedPlan = planId;

    if (PricingSection.state.loading && !PricingSection.state.data.length) {
      await PricingSection.preload();
    }

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
