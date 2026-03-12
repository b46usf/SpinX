/**
 * Pricing Section Component - ASYNC FIXED VERSION
 * Now properly awaits data → GUARANTEED VISIBLE
 * Uses DRY utils from planUtils.js
 */

import { 
  loadPricingData, 
  generateFeaturesHTML, 
  mapPlanToDisplay,
  FALLBACK_PLANS 
} from './utils/planUtils.js';

export const PricingSection = {
  state: {
    loading: true,
    error: null,
    data: []
  },

  /**
   * Preload data (call from LandingPage)
   */
  async preload() {
    try {
      this.state.loading = true;
      this.state.data = await loadPricingData();
      this.state.error = null;
      console.log('✅ PricingSection preloaded:', this.state.data.length, 'plans');
    } catch (error) {
      this.state.error = error.message;
      this.state.data = FALLBACK_PLANS;
      console.warn('Pricing preload fallback:', error);
    } finally {
      this.state.loading = false;
    }
  },

  /**
   * ASYNC RENDER - waits for data!
   */
  async render() {
    // Use cached/preloaded data or load now
    if (this.state.loading && !this.state.data.length) {
      await this.preload();
    }

    const { data, loading, error } = this.state;
    const plans = data.length ? data.map(mapPlanToDisplay) : FALLBACK_PLANS;

    // Loading state
    if (loading) {
      return this.renderLoading();
    }

    // Error state (still shows fallback)
    if (error) {
      return this.renderError(plans);
    }

    // Success - generate plans
    const plansHTML = plans.map(plan => this.generatePlanCard(plan)).join('');

    return `
      <section id="pricing" class="section-padding">
        <div class="container mx-auto px-4">
          <div class="text-center mb-16">
            <span class="inline-block px-4 py-1 bg-indigo-500/20 text-indigo-400 rounded-full text-sm font-medium mb-4 animate-pulse">
              <i class="fas fa-bolt mr-1"></i>HARGA TERJANGKAU
            </span>
            <h2 class="text-3xl sm:text-4xl lg:text-5xl font-bold bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 bg-clip-text text-transparent mb-4">
              Paket yang <span class="block sm:inline">Tepat Untuk Anda</span>
            </h2>
            <p class="text-xl text-gray-300 max-w-2xl mx-auto leading-relaxed">
              Mulai gratis, upgrade kapan saja. <strong>Tidak ada biaya tersembunyi</strong> - data real-time dari sistem.
            </p>
          </div>
          
          <div class="pricing-grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            ${plansHTML}
          </div>
          
          <div class="text-center mt-12">
            <div class="bg-gradient-to-r from-green-500/20 to-emerald-500/20 p-6 rounded-2xl border border-green-500/30 max-w-2xl mx-auto">
              <i class="fas fa-shield-alt text-2xl text-green-400 mb-3 block"></i>
              <p class="text-lg font-semibold text-white mb-2">
                <i class="fas fa-lock mr-2 text-green-400"></i>
                Pembayaran aman via Transfer Bank
              </p>
              <p class="text-gray-300 text-sm">
                Garansi uang kembali 7 hari • Aktivasi instan • Support 24/7
              </p>
            </div>
          </div>
        </div>
      </section>
    `;
  },

  renderLoading() {
    return `
      <section id="pricing" class="section-padding min-h-[600px] flex items-center justify-center">
        <div class="text-center animate-pulse">
          <div class="w-16 h-16 border-4 border-indigo-500/30 border-t-indigo-500 rounded-full mx-auto mb-6 animate-spin"></div>
          <p class="text-xl text-gray-400">Memuat paket harga...</p>
          <p class="text-sm text-gray-500 mt-2">Sinkronisasi data SUBSCRIPTION_PLANS</p>
        </div>
      </section>
    `;
  },

  renderError(plans) {
    const plansHTML = plans.map(plan => this.generatePlanCard(plan)).join('');
    return `
      <section id="pricing" class="section-padding">
        <div class="container mx-auto px-4">
          <div class="text-center mb-16">
            <div class="inline-flex items-center gap-3 bg-yellow-500/20 border border-yellow-500/30 px-6 py-4 rounded-2xl mb-8">
              <i class="fas fa-exclamation-triangle text-yellow-400 text-xl"></i>
              <div>
                <h3 class="font-bold text-lg text-yellow-100">Menggunakan Data Cadangan</h3>
                <p class="text-sm text-yellow-200">BE API sementara unavailable → fallback plans</p>
              </div>
            </div>
            <!-- rest same as success -->
            <h2 class="text-3xl sm:text-4xl font-bold text-white mb-4">Paket Tersedia</h2>
          </div>
          <div class="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            ${plansHTML}
          </div>
          <!-- security note -->
          <div class="text-center mt-8">
            <p class="text-gray-500 text-sm">
              <i class="fas fa-lock mr-1"></i>Terjamin aman - Fallback untuk keandalan maksimal
            </p>
          </div>
        </div>
      </section>
    `;
  },

  generatePlanCard(plan) {
    const popularClass = plan.popular 
      ? 'relative bg-gradient-to-br from-indigo-500/10 to-purple-500/10 border-2 border-indigo-500/50 shadow-2xl shadow-indigo-500/20 hover:shadow-indigo-500/40 transform hover:scale-[1.02] transition-all duration-300' 
      : 'bg-gray-900/50 border border-gray-700/50 hover:border-indigo-500/50 hover:bg-gray-900/70 transition-all duration-300 hover:shadow-lg';
    
    const btnClass = plan.popular 
      ? 'bg-gradient-to-r from-emerald-500 to-teal-500 text-white shadow-lg shadow-emerald-500/30 hover:shadow-emerald-500/50 hover:from-emerald-600 hover:to-teal-600 transform hover:scale-[1.02] active:scale-[0.98]'
      : 'bg-white/10 border-2 border-white/20 text-white backdrop-blur-sm hover:bg-white/20 hover:border-white/40 hover:shadow-lg transition-all duration-300';

    // Popular badge
    const popularBadge = plan.popular ? `
      <div class="absolute -top-3 left-1/2 -translate-x-1/2 bg-gradient-to-r from-emerald-500 to-teal-500 text-white px-4 py-1 rounded-full text-xs font-bold shadow-lg transform rotate-[-3deg]">
        💎 POPULAR
      </div>
    ` : '';

    return `
      <div class="price-card rounded-3xl p-8 ${popularClass} backdrop-blur-xl">
        ${popularBadge}
        <div class="text-center mb-8">
          <h3 class="text-2xl lg:text-3xl font-black text-white mb-4 tracking-tight">${plan.name}</h3>
          <div class="text-5xl lg:text-6xl font-black text-white mb-2 leading-tight">
            ${plan.priceDisplay === 'Gratis' ? 
              '<span class="text-4xl">🎉 Gratis</span>' : 
              `<span class="text-3xl">Rp</span> ${plan.priceDisplay}<span class="text-2xl opacity-75">${plan.period}</span>`
            }
          </div>
          ${!plan.period ? '<p class="text-gray-400 text-lg font-medium">Untuk mulai sekarang</p>' : ''}
        </div>
        
        <ul class="space-y-3 mb-10">
          ${generateFeaturesHTML(plan.features)}
        </ul>
        
        <button 
          data-plan="${plan.id}" 
          class="w-full py-4 px-8 ${btnClass} font-bold text-lg rounded-2xl shadow-xl select-plan-btn group"
          aria-label="Pilih ${plan.name}"
        >
          <span class="group-hover:translate-x-1 transition-transform">${plan.cta}</span>
          <i class="fas fa-arrow-right group-hover:translate-x-1 transition-transform ml-2"></i>
        </button>
        
        ${plan.maxStudents === -1 ? 
          '<p class="text-center mt-4 text-xs text-emerald-400 font-medium">✅ Siswa tak terbatas</p>' : 
          `<p class="text-center mt-4 text-xs text-gray-400">${plan.maxStudents} siswa maksimal</p>`
        }
      </div>
    `;
  },

  /**
   * Event handlers (delegated for dynamic content)
   */
  initEvents(callbacks = {}) {
    // Use event delegation for dynamic buttons
    document.addEventListener('click', (e) => {
      if (e.target.matches('.select-plan-btn, .select-plan-btn *')) {
        const planId = e.target.closest('.select-plan-btn').dataset.plan;
        if (callbacks.onSelectPlan) {
          callbacks.onSelectPlan(planId);
        }
        // Track analytics
        console.log('Plan selected:', planId);
      }
    });
  }
};

export default PricingSection;


