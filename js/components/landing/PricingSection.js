/**
 * Pricing Section Component
 * Compact pricing layout with fixed plan-to-modal interaction.
 */

import {
  loadPricingData,
  generateFeaturesHTML,
  mapPlanToDisplay
} from './utils/planUtils.js';

const pricingHighlights = [
  {
    icon: 'fa-bolt',
    title: 'Mulainya lebih cepat',
    text: 'Dari pilih paket ke isi data sekolah alurnya singkat dan jelas.'
  },
  {
    icon: 'fa-shield-halved',
    title: 'Isi paket gampang dibaca',
    text: 'Yang didapat di tiap paket bisa langsung dibandingkan.'
  },
  {
    icon: 'fa-headset',
    title: 'Kalau cocok, langsung lanjut',
    text: 'Begitu sekolah yakin, tinggal klik paket lalu isi data aktivasi.'
  }
];

export const PricingSection = {
  state: {
    loading: true,
    error: null,
    data: [],
    eventsBound: false
  },

  async preload() {
    try {
      this.state.loading = true;
      this.state.data = await loadPricingData();
      this.state.error = null;
    } catch (error) {
      this.state.error = error.message;
      this.state.data = [];
      console.warn('Pricing failed:', error);
    } finally {
      this.state.loading = false;
    }
  },

  getNormalizedPlans() {
    return this.state.data.length
      ? this.state.data.map((plan) => this.cleanPlanData(plan))
      : [];
  },

  findPlanById(planId) {
    return this.getNormalizedPlans().find((plan) => plan.id === planId) || null;
  },

  async render() {
    if (this.state.loading && !this.state.data.length) {
      await this.preload();
    }

    const { loading } = this.state;
    const plans = this.sortPlans(this.getNormalizedPlans());

    if (loading) return this.renderLoading();
    if (!plans.length) return this.renderError();

    const plansHTML = plans.map((plan) => this.generatePlanCard(plan)).join('');
    const comparisonRows = this.getComparisonRows(plans);
    const comparisonHTML = comparisonRows
      .map((row) => this.renderComparisonRow(row, plans))
      .join('');

    return `
      <section id="pricing" class="landing-section landing-anchor pricing-section" data-nav-section>
        <div class="landing-shell">
          <div class="landing-section-head pricing-section__head">
            <div class="landing-fade" style="--fade-delay: 40ms;">
              <span class="landing-eyebrow landing-fade" style="--fade-delay: 80ms;">
                <span class="landing-eyebrow__dot"></span>
                Paket yang gampang dipilih sesuai kebutuhan sekolah
              </span>
              <h2 class="landing-heading">
                Pilih paket yang paling pas,
                <span class="landing-heading__accent">lalu lanjut aktivasi tanpa langkah yang bikin bingung</span>
              </h2>
            </div>

            <div class="pricing-summary-card landing-fade" style="--fade-delay: 140ms;">
              <span class="pricing-summary-card__label">Ringkasan cepat</span>
              <strong>Dari sini sekolah sudah bisa langsung lanjut daftar</strong>
              <p>Pilih paket yang dirasa cocok, isi data admin sekali, lalu tim kami bantu sampai siap dipakai.</p>
            </div>
          </div>

          <div class="pricing-plan-grid">
            ${plansHTML}
          </div>

          <div class="pricing-highlights">
            ${pricingHighlights.map((item, index) => `
              <div class="pricing-highlight landing-fade" style="--fade-delay: ${180 + (index * 60)}ms;">
                <span class="pricing-highlight__icon"><i class="fas ${item.icon}"></i></span>
                <div>
                  <strong>${item.title}</strong>
                  <p>${item.text}</p>
                </div>
              </div>
            `).join('')}
          </div>

          <div class="pricing-comparison landing-fade" style="--fade-delay: 280ms;">
            <div class="pricing-comparison__head">
              <div>
                <span class="landing-eyebrow">
                  <span class="landing-eyebrow__dot"></span>
                  Perbandingan fitur utama
                </span>
                <h3>Bandingkan isi paketnya dulu, lalu pilih yang paling masuk untuk sekolah</h3>
              </div>
            </div>

            <div class="pricing-comparison__table-wrap">
              <table class="pricing-table">
                <thead>
                  <tr>
                    <th>Fitur</th>
                    ${plans.map((plan) => `
                      <th>
                        <div class="pricing-table__plan">
                          <span class="pricing-table__badge ${plan.popular ? 'is-popular' : ''}">
                            ${plan.popular ? 'Paling direkomendasikan' : 'Paket'}
                          </span>
                          <strong>${plan.name}</strong>
                        </div>
                      </th>
                    `).join('')}
                  </tr>
                </thead>
                <tbody>
                  ${comparisonHTML}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </section>
    `;
  },

  renderLoading() {
    return `
      <section id="pricing" class="landing-section landing-anchor pricing-section" data-nav-section>
        <div class="landing-shell">
          <div class="landing-loading-card">
            <div class="landing-loading-card__head"></div>
            <div class="landing-loading-card__subhead"></div>
          </div>

          <div class="pricing-plan-grid">
            ${Array.from({ length: 3 }, () => `
              <div class="landing-loading-card landing-loading-card--plan">
                <div class="landing-loading-card__pill"></div>
                <div class="landing-loading-card__title"></div>
                <div class="landing-loading-card__subhead"></div>
                <div class="landing-loading-card__price"></div>
                <div class="landing-loading-card__list"></div>
                <div class="landing-loading-card__button"></div>
              </div>
            `).join('')}
          </div>
        </div>
      </section>
    `;
  },

  renderError() {
    return `
      <section id="pricing" class="landing-section landing-anchor pricing-section" data-nav-section>
        <div class="landing-shell">
          <div class="pricing-error-card">
            <span class="pricing-error-card__icon"><i class="fas fa-circle-exclamation"></i></span>
            <h2>Data paket belum tersedia saat ini</h2>
            <p>
              Informasi pricing belum berhasil dimuat. Anda masih bisa menghubungi tim support
              untuk mendapatkan paket terbaru dan opsi implementasi yang sesuai.
            </p>
            <div class="pricing-error-card__actions">
              <a href="mailto:support@gameumkm.com" class="landing-btn landing-btn--primary">Email Support</a>
              <a href="#cta" class="landing-btn landing-btn--secondary">Lihat Kontak</a>
            </div>
          </div>
        </div>
      </section>
    `;
  },

  cleanPlanData(plan) {
    return mapPlanToDisplay(plan);
  },

  sortPlans(plans = []) {
    const order = { starter: 1, pro: 2, enterprise: 3 };
    return [...plans].sort((a, b) => (order[a.id] || 99) - (order[b.id] || 99));
  },

  getPlanTone(plan) {
    if (plan.popular) {
      return {
        icon: 'fa-crown',
        badge: 'Paling sering dipilih',
        helper: 'Cocok untuk promo yang sudah rutin dipakai',
        cardClass: 'is-popular'
      };
    }

    if (plan.price <= 0) {
      return {
        icon: 'fa-seedling',
        badge: 'Mulai dulu',
        helper: 'Cocok untuk coba alurnya lebih dulu',
        cardClass: 'is-starter'
      };
    }

    return {
      icon: 'fa-building',
      badge: 'Kapasitas lebih besar',
      helper: 'Cocok untuk sekolah yang butuh ruang lebih',
      cardClass: 'is-enterprise'
    };
  },

  generatePlanCard(plan) {
    const tone = this.getPlanTone(plan);

    return `
      <article class="pricing-plan ${tone.cardClass} landing-fade" style="--fade-delay: ${plan.popular ? '140ms' : plan.price <= 0 ? '80ms' : '200ms'};">
        <div class="pricing-plan__header">
          <div>
            <span class="pricing-plan__badge">${tone.badge}</span>
            <h3>${plan.name}</h3>
          </div>
          <span class="pricing-plan__icon"><i class="fas ${tone.icon}"></i></span>
        </div>

        <p class="pricing-plan__description">${plan.description}</p>

        <div class="pricing-plan__price">
          <strong>${plan.fullPriceDisplay}</strong>
          <span>${plan.period}</span>
        </div>

        <div class="pricing-plan__meta">
          <span><i class="fas fa-users"></i>${plan.capacityDisplay || plan.maxUsersDisplay}</span>
          <span><i class="fas fa-bolt"></i>${tone.helper}</span>
        </div>

        <div class="pricing-plan__feature-head">Fitur utama yang langsung didapat</div>
        <ul class="pricing-plan__features">
          ${generateFeaturesHTML(plan.features)}
        </ul>

        <button
          data-plan="${plan.id}"
          class="select-plan-btn landing-btn ${plan.popular ? 'landing-btn--primary' : 'landing-btn--secondary'}"
        >
          ${plan.cta || 'Aktifkan Paket'}
        </button>
      </article>
    `;
  },

  getComparisonRows(plans) {
    return [
      {
        label: 'Harga',
        getValue: (plan) => ({ type: 'text', value: plan.fullPriceDisplay })
      },
      {
        label: 'Kapasitas pengguna',
        getValue: (plan) => ({ type: 'text', value: plan.capacityDisplay || plan.maxUsersDisplay })
      },
      {
        label: 'Status paket',
        getValue: (plan) => ({
          type: 'badge',
          value: plan.popular ? 'Rekomendasi' : plan.price <= 0 ? 'Starter' : 'Lanjutan'
        })
      },
      ...this.buildFeatureRows(plans)
    ];
  },

  buildFeatureRows(plans) {
    const featureMap = new Map();

    plans.forEach((plan) => {
      plan.features.forEach((feature) => {
        const key = feature.text.toLowerCase();
        if (!featureMap.has(key)) {
          featureMap.set(key, { label: feature.text });
        }
      });
    });

    return Array.from(featureMap.values()).map((item) => ({
      label: item.label,
      getValue: (plan) => {
        const matched = plan.features.find(
          (feature) => feature.text.toLowerCase() === item.label.toLowerCase()
        );

        return {
          type: 'boolean',
          value: matched ? matched.included : false
        };
      }
    }));
  },

  renderComparisonRow(row, plans) {
    return `
      <tr>
        <td class="pricing-table__label">${row.label}</td>
        ${plans.map((plan) => this.renderComparisonCell(row.getValue(plan))).join('')}
      </tr>
    `;
  },

  renderComparisonCell(cell) {
    if (cell.type === 'boolean') {
      return `
        <td>
          <span class="pricing-table__boolean ${cell.value ? 'is-yes' : 'is-no'}">
            <i class="fas fa-${cell.value ? 'check' : 'minus'}"></i>
          </span>
        </td>
      `;
    }

    if (cell.type === 'badge') {
      return `
        <td>
          <span class="pricing-table__status ${cell.value === 'Rekomendasi' ? 'is-popular' : ''}">
            ${cell.value}
          </span>
        </td>
      `;
    }

    return `<td class="pricing-table__text">${cell.value}</td>`;
  },

  openPlanModal(planId = 'starter') {
    const fallbackPlan = this.sortPlans(this.getNormalizedPlans())[0];
    const plan = this.findPlanById(planId) || fallbackPlan;
    const modal = document.getElementById('register-modal');
    const badge = document.getElementById('selected-plan-badge');
    const planInput = document.getElementById('selected-plan');

    if (!modal || !plan) return;

    if (badge) {
      badge.textContent = `${plan.name} - ${plan.fullPriceDisplay}`;
    }

    if (planInput) {
      planInput.value = plan.id;
    }

    modal.classList.remove('hidden');
  },

  initEvents() {
    if (this.state.eventsBound) return;
    this.state.eventsBound = true;

    document.addEventListener('click', (event) => {
      const button = event.target.closest('.select-plan-btn');
      if (!button) return;

      this.openPlanModal(button.dataset.plan);
    });
  }
};

export default PricingSection;
