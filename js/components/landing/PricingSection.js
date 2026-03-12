/**
 * Pricing Section Component
 * Cleaner visual hierarchy + safer BE data parsing
 */

import {
  loadPricingData,
  generateFeaturesHTML,
  mapPlanToDisplay
} from './utils/planUtils.js';

export const PricingSection = {
  state: {
    loading: true,
    error: null,
    data: []
  },

  async preload() {
    try {
      this.state.loading = true;
      this.state.data = await loadPricingData();
      this.state.error = null;
      console.log('✅ Pricing loaded:', this.state.data.length, 'plans');
    } catch (error) {
      this.state.error = error.message;
      this.state.data = [];
      console.warn('Pricing failed:', error);
    } finally {
      this.state.loading = false;
    }
  },

  async render() {
    if (this.state.loading && !this.state.data.length) {
      await this.preload();
    }

    const { data, loading } = this.state;
    const plans = data.length ? data.map(plan => this.cleanPlanData(plan)) : [];

    if (loading) return this.renderLoading();
    if (!plans.length) return this.renderError();

    const normalizedPlans = this.sortPlans(plans);
    const plansHTML = normalizedPlans.map(plan => this.generatePlanCard(plan)).join('');
    const comparisonRows = this.getComparisonRows(normalizedPlans);
    const comparisonHTML = comparisonRows.map(row => this.renderComparisonRow(row, normalizedPlans)).join('');

    return `
      <section id="pricing" class="relative overflow-hidden bg-slate-950 py-20 md:py-24">
        <div class="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(16,185,129,0.08),transparent_35%),radial-gradient(circle_at_80%_20%,rgba(99,102,241,0.10),transparent_28%),linear-gradient(to_bottom,rgba(15,23,42,0.98),rgba(2,6,23,1))]"></div>

        <div class="relative z-10 container mx-auto max-w-7xl px-6 lg:px-8">
          <div class="mx-auto mb-14 max-w-3xl text-center">
            <span class="inline-flex items-center gap-2 rounded-full border border-emerald-400/20 bg-emerald-400/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.24em] text-emerald-300">
              <i class="fas fa-layer-group text-[11px]"></i>
              Paket Harga Fleksibel
            </span>
            <h2 class="mt-6 text-4xl font-black leading-tight text-white md:text-5xl">
              Pilih paket yang
              <span class="bg-gradient-to-r from-emerald-300 to-cyan-300 bg-clip-text text-transparent">
                sesuai kebutuhan sekolah
              </span>
            </h2>
            <p class="mt-5 text-base leading-7 text-slate-300 md:text-lg">
              Tampilan dibuat lebih ringkas, mudah dibaca, dan aman untuk data pricing dari backend
              yang formatnya bisa berubah-ubah.
            </p>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-3 gap-6">
            ${plansHTML}
          </div>

          <div class="mt-16 overflow-hidden rounded-3xl border border-white/10 bg-white/[0.04] shadow-[0_20px_80px_rgba(0,0,0,0.25)] backdrop-blur">
            <div class="border-b border-white/10 px-6 py-5 md:px-8">
              <h3 class="text-xl font-bold text-white md:text-2xl">Perbandingan fitur utama</h3>
              <p class="mt-2 text-sm leading-6 text-slate-400 md:text-base">
                Bandingkan batas siswa, fitur utama, dan dukungan untuk tiap paket secara cepat.
              </p>
            </div>

            <div class="overflow-x-auto">
              <table class="min-w-full text-sm text-slate-200">
                <thead class="bg-white/[0.03]">
                  <tr class="border-b border-white/10">
                    <th class="min-w-[220px] px-6 py-4 text-left text-xs font-semibold uppercase tracking-[0.2em] text-slate-400 md:px-8">
                      Fitur
                    </th>
                    ${normalizedPlans.map(plan => `
                      <th class="min-w-[180px] px-5 py-4 text-center md:px-6">
                        <div class="inline-flex flex-col items-center gap-2">
                          <span class="rounded-full ${plan.popular ? 'bg-emerald-400/15 text-emerald-300 border-emerald-400/20' : 'bg-white/5 text-slate-300 border-white/10'} border px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em]">
                            ${plan.popular ? 'Rekomendasi' : 'Paket'}
                          </span>
                          <div class="text-base font-bold text-white md:text-lg">${plan.name}</div>
                          <div class="text-sm text-slate-400">${plan.priceDisplay}${plan.price > 0 ? `<span class="text-slate-500"> ${plan.period}</span>` : ''}</div>
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

          <div class="mt-12 grid gap-4 rounded-3xl border border-emerald-400/15 bg-gradient-to-r from-emerald-500/8 via-cyan-500/5 to-indigo-500/8 p-6 md:grid-cols-3 md:p-8">
            <div class="rounded-2xl border border-white/8 bg-white/[0.03] p-5">
              <div class="mb-3 flex h-11 w-11 items-center justify-center rounded-2xl bg-emerald-400/10 text-emerald-300">
                <i class="fas fa-bolt"></i>
              </div>
              <h4 class="text-base font-semibold text-white">Aktivasi cepat</h4>
              <p class="mt-2 text-sm leading-6 text-slate-400">Paket dapat langsung dipilih tanpa alur yang membingungkan.</p>
            </div>
            <div class="rounded-2xl border border-white/8 bg-white/[0.03] p-5">
              <div class="mb-3 flex h-11 w-11 items-center justify-center rounded-2xl bg-cyan-400/10 text-cyan-300">
                <i class="fas fa-headset"></i>
              </div>
              <h4 class="text-base font-semibold text-white">Support jelas</h4>
              <p class="mt-2 text-sm leading-6 text-slate-400">Informasi bantuan dan benefit ditampilkan lebih rapi dan konsisten.</p>
            </div>
            <div class="rounded-2xl border border-white/8 bg-white/[0.03] p-5">
              <div class="mb-3 flex h-11 w-11 items-center justify-center rounded-2xl bg-indigo-400/10 text-indigo-300">
                <i class="fas fa-shield-alt"></i>
              </div>
              <h4 class="text-base font-semibold text-white">Data lebih aman</h4>
              <p class="mt-2 text-sm leading-6 text-slate-400">Parsing plan kini lebih tahan terhadap data backend yang tidak seragam.</p>
            </div>
          </div>
        </div>
      </section>
    `;
  },

  renderLoading() {
    return `
      <section id="pricing" class="bg-slate-950 py-20 md:py-24">
        <div class="container mx-auto max-w-6xl px-6 lg:px-8">
          <div class="mx-auto mb-12 max-w-2xl text-center">
            <div class="mx-auto h-12 w-44 animate-pulse rounded-full bg-white/5"></div>
            <div class="mx-auto mt-6 h-10 w-3/4 animate-pulse rounded-2xl bg-white/5"></div>
            <div class="mx-auto mt-4 h-6 w-2/3 animate-pulse rounded-xl bg-white/5"></div>
          </div>

          <div class="grid grid-cols-1 gap-6 xl:grid-cols-3">
            ${[1, 2, 3].map(() => `
              <div class="rounded-3xl border border-white/10 bg-white/[0.04] p-6 backdrop-blur">
                <div class="h-6 w-24 animate-pulse rounded-lg bg-white/5"></div>
                <div class="mt-5 h-10 w-32 animate-pulse rounded-xl bg-white/5"></div>
                <div class="mt-3 h-5 w-24 animate-pulse rounded-lg bg-white/5"></div>
                <div class="mt-6 space-y-3">
                  <div class="h-14 animate-pulse rounded-2xl bg-white/5"></div>
                  <div class="h-14 animate-pulse rounded-2xl bg-white/5"></div>
                  <div class="h-14 animate-pulse rounded-2xl bg-white/5"></div>
                  <div class="h-14 animate-pulse rounded-2xl bg-white/5"></div>
                </div>
                <div class="mt-6 h-12 animate-pulse rounded-2xl bg-white/5"></div>
              </div>
            `).join('')}
          </div>
        </div>
      </section>
    `;
  },

  renderError() {
    return `
      <section id="pricing" class="bg-slate-950 py-20 md:py-24">
        <div class="container mx-auto max-w-3xl px-6 lg:px-8">
          <div class="rounded-3xl border border-amber-400/20 bg-amber-500/10 p-8 text-center shadow-[0_20px_60px_rgba(0,0,0,0.25)] backdrop-blur md:p-10">
            <div class="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-amber-400/15 text-amber-300">
              <i class="fas fa-exclamation-triangle text-2xl"></i>
            </div>
            <h2 class="mt-5 text-2xl font-black text-white md:text-3xl">Pricing belum tersedia</h2>
            <p class="mx-auto mt-3 max-w-2xl text-sm leading-7 text-slate-300 md:text-base">
              Data paket belum berhasil dimuat. Silakan hubungi tim support untuk mendapatkan informasi harga terbaru.
            </p>
            <div class="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
              <a
                href="mailto:support@gameumkm.com"
                class="inline-flex items-center justify-center rounded-2xl bg-white px-5 py-3 text-sm font-semibold text-slate-900 transition hover:bg-slate-100"
              >
                <i class="fas fa-envelope mr-2"></i>
                Email Support
              </a>
              <a
                href="https://wa.me/6281234567890?text=Halo%2C%20saya%20ingin%20bertanya%20tentang%20paket%20pricing"
                class="inline-flex items-center justify-center rounded-2xl border border-emerald-400/20 bg-emerald-400/10 px-5 py-3 text-sm font-semibold text-emerald-300 transition hover:bg-emerald-400/15"
              >
                <i class="fab fa-whatsapp mr-2"></i>
                WhatsApp
              </a>
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
        badge: 'border-emerald-400/20 bg-emerald-400/10 text-emerald-300',
        price: 'from-emerald-300 to-cyan-300',
        button: 'bg-emerald-400 text-slate-950 hover:bg-emerald-300',
        ring: 'ring-1 ring-emerald-400/20',
        card: 'border-emerald-400/20 bg-gradient-to-b from-emerald-500/10 to-white/[0.04]'
      };
    }

    if (plan.price <= 0) {
      return {
        badge: 'border-cyan-400/20 bg-cyan-400/10 text-cyan-300',
        price: 'from-cyan-300 to-sky-300',
        button: 'bg-white/8 text-white hover:bg-white/12',
        ring: 'ring-1 ring-white/10',
        card: 'border-white/10 bg-white/[0.04]'
      };
    }

    return {
      badge: 'border-indigo-400/20 bg-indigo-400/10 text-indigo-300',
      price: 'from-indigo-300 to-violet-300',
      button: 'bg-white/8 text-white hover:bg-white/12',
      ring: 'ring-1 ring-white/10',
      card: 'border-white/10 bg-white/[0.04]'
    };
  },

  generatePlanCard(plan) {
    const tone = this.getPlanTone(plan);
    const periodText = plan.period;
    const badgeText = plan.popular ? 'Paling dipilih' : plan.price <= 0 ? 'Mulai gratis' : 'Siap scaling';

    return `
      <article class="group relative flex h-full flex-col rounded-[28px] border ${tone.card} p-6 shadow-[0_18px_60px_rgba(0,0,0,0.22)] backdrop-blur transition duration-300 hover:-translate-y-1">
        <div class="flex items-start justify-between gap-4">
          <div>
            <span class="inline-flex items-center rounded-full border px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] ${tone.badge}">
              ${badgeText}
            </span>
            <h3 class="mt-4 text-2xl font-black text-white">${plan.name}</h3>
            <p class="mt-2 text-sm leading-6 text-slate-400">${plan.description}</p>
          </div>
          ${plan.popular ? `
            <div class="flex h-11 w-11 items-center justify-center rounded-2xl bg-emerald-400/15 text-emerald-300">
              <i class="fas fa-crown"></i>
            </div>
          ` : ''}
        </div>

        <div class="mt-8 rounded-3xl border border-white/8 bg-slate-950/40 p-5 ${tone.ring}">
          <div class="bg-gradient-to-r ${tone.price} bg-clip-text text-4xl font-black text-transparent md:text-5xl">
            ${plan.priceDisplay}
          </div>
          <div class="mt-2 text-sm font-medium uppercase tracking-[0.16em] text-slate-400">
            ${periodText}
          </div>
          <div class="mt-4 inline-flex items-center gap-2 rounded-full bg-white/[0.04] px-3 py-2 text-xs font-medium text-slate-300">
            <i class="fas fa-users text-emerald-300"></i>
            ${plan.maxStudentsDisplay}
          </div>
        </div>

        <div class="mt-6">
          <div class="mb-3 text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
            Fitur utama
          </div>
          <ul class="space-y-3">
            ${generateFeaturesHTML(plan.features)}
          </ul>
        </div>

        <div class="mt-8 pt-2">
          <button
            data-plan="${plan.id}"
            class="select-plan-btn inline-flex w-full items-center justify-center rounded-2xl px-5 py-4 text-sm font-bold transition ${tone.button}"
          >
            <span>${plan.cta || 'Pilih Paket'}</span>
            <i class="fas fa-arrow-right ml-2 text-xs transition group-hover:translate-x-1"></i>
          </button>
        </div>
      </article>
    `;
  },

  getComparisonRows(plans) {
    return [
      {
        label: 'Harga',
        getValue: plan => ({
          type: 'text',
          value: `${plan.priceDisplay}${plan.price > 0 ? ` ${plan.period}` : ''}`
        })
      },
      {
        label: 'Kapasitas siswa',
        getValue: plan => ({
          type: 'text',
          value: plan.maxStudentsDisplay
        })
      },
      {
        label: 'Status paket',
        getValue: plan => ({
          type: 'badge',
          value: plan.popular ? 'Rekomendasi' : plan.price <= 0 ? 'Gratis' : 'Premium'
        })
      },
      ...this.buildFeatureRows(plans)
    ];
  },

  buildFeatureRows(plans) {
    const featureMap = new Map();

    plans.forEach(plan => {
      plan.features.forEach(feature => {
        const key = feature.text.toLowerCase();
        if (!featureMap.has(key)) {
          featureMap.set(key, { label: feature.text });
        }
      });
    });

    return Array.from(featureMap.values()).map(item => ({
      label: item.label,
      getValue: plan => {
        const matched = plan.features.find(feature => feature.text.toLowerCase() === item.label.toLowerCase());
        return {
          type: 'boolean',
          value: matched ? matched.included : false
        };
      }
    }));
  },

  renderComparisonRow(row, plans) {
    return `
      <tr class="border-b border-white/6 last:border-b-0">
        <td class="px-6 py-4 text-sm font-medium text-white md:px-8">${row.label}</td>
        ${plans.map(plan => this.renderComparisonCell(row.getValue(plan))).join('')}
      </tr>
    `;
  },

  renderComparisonCell(cell) {
    if (cell.type === 'boolean') {
      return `
        <td class="px-5 py-4 text-center md:px-6">
          <span class="inline-flex h-8 w-8 items-center justify-center rounded-full ${cell.value ? 'bg-emerald-400/15 text-emerald-300' : 'bg-white/5 text-slate-500'}">
            <i class="fas fa-${cell.value ? 'check' : 'minus'} text-xs"></i>
          </span>
        </td>
      `;
    }

    if (cell.type === 'badge') {
      return `
        <td class="px-5 py-4 text-center md:px-6">
          <span class="inline-flex rounded-full border ${cell.value === 'Rekomendasi' ? 'border-emerald-400/20 bg-emerald-400/10 text-emerald-300' : 'border-white/10 bg-white/5 text-slate-300'} px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em]">
            ${cell.value}
          </span>
        </td>
      `;
    }

    return `
      <td class="px-5 py-4 text-center text-sm text-slate-300 md:px-6">
        ${cell.value}
      </td>
    `;
  },

  initEvents(callbacks = {}) {
    document.addEventListener('click', (e) => {
      if (e.target.matches('.select-plan-btn, .select-plan-btn *')) {
        const btn = e.target.closest('.select-plan-btn');
        const planId = btn.dataset.plan;
        console.log('Plan selected:', planId);
        
        // Direct modal integration - set plan + open
        const badge = document.getElementById('selected-plan-badge');
        const planInput = document.getElementById('selected-plan');
        const modal = document.getElementById('register-modal');
        
        if (badge) {
          const planName = PricingSection.state.data.find(p => p.id === planId)?.name || planId.toUpperCase();
          badge.textContent = planName || 'Starter';
        }
        if (planInput) planInput.value = planId;
        if (modal) modal.classList.remove('hidden');
      }
    });
  }
};

export default PricingSection;
