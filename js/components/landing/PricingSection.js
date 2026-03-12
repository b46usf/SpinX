/**
 * Pricing Section Component - ASYNC FIXED VERSION
 * Now properly awaits data → GUARANTEED VISIBLE
 * Uses DRY utils from planUtils.js
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
      this.state.data = [];
      console.warn('Pricing preload failed - no data:', error);
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
    const plans = data.length ? data.map(mapPlanToDisplay) : [];

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
                Garansi 7 hari • Aktivasi instan • Support 24/7
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
    return `
      <section id="pricing" class="section-padding min-h-screen flex flex-col items-center justify-center py-20">
        <div class="container mx-auto px-4 text-center max-w-2xl">
          <div class="inline-flex items-center gap-3 bg-yellow-500/20 border border-yellow-500/30 px-8 py-6 rounded-3xl mb-8">
            <i class="fas fa-exclamation-triangle text-yellow-400 text-2xl"></i>
            <div>
              <h3 class="font-bold text-xl sm:text-2xl text-yellow-100 mb-2">Paket Harga Belum Tersedia</h3>
              <p class="text-lg sm:text-xl text-yellow-200 mb-4">API pricing sedang maintenance. Hubungi support untuk info terkini.</p>
              <button class="bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 text-white font-bold py-3 px-8 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300">
                📞 Hubungi Support
              </button>
            </div>
          </div>
          <div class="mt-12">
            <p class="text-gray-400 text-lg mb-4">Segera kembali dalam 24 jam...</p>
            <div class="w-24 h-24 border-4 border-yellow-500/30 border-t-yellow-500 rounded-full mx-auto animate-spin"></div>
          </div>
        </div>
      </section>
    `;
  },

  generatePlanCard(plan) {
    const popularClass = plan.popular 
      ? 'relative bg-gradient-to-br from-indigo-600/10 via-purple-600/10 to-pink-600/10 border-2 border-indigo-400 ring-2 ring-indigo-500/20 shadow-xl hover:shadow-2xl hover:shadow-indigo-400/30 min-h-[480px] flex flex-col justify-between p-6 md:p-8 backdrop-blur-xl transition-all duration-300 hover:scale-105 focus-within:ring-4 focus-within:ring-indigo-400/50' 
      : 'bg-gray-900/40 border border-gray-700/50 hover:border-indigo-400/60 hover:bg-gray-900/60 shadow-lg hover:shadow-xl min-h-[480px] flex flex-col justify-between p-6 md:p-8 backdrop-blur-xl transition-all duration-300 hover:scale-105 focus-within:ring-4 focus-within:ring-indigo-400/50';
    
    const btnClass = plan.popular 
      ? 'mt-auto bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white shadow-lg shadow-emerald-400/30 hover:shadow-emerald-400/50 font-bold text-base md:text-lg rounded-xl py-3 px-6 md:px-8 min-h-[52px] flex items-center justify-center gap-2 transition-all duration-300 ring-2 ring-emerald-400/30 hover:ring-emerald-400/50 focus:ring-4 focus:ring-emerald-500 select-plan-btn group'
      : 'mt-auto bg-white/10 border border-white/30 hover:bg-white/20 hover:border-white/50 text-white backdrop-blur-sm shadow-md hover:shadow-lg font-bold text-base md:text-lg rounded-xl py-3 px-6 md:px-8 min-h-[52px] flex items-center justify-center gap-2 transition-all duration-300 ring-2 ring-white/20 hover:ring-white/40 focus:ring-4 focus:ring-indigo-400 select-plan-btn group';

    // Popular badge - mobile friendly positioning
    const popularBadge = plan.popular ? `
      <div class="absolute top-4 left-4 bg-gradient-to-r from-emerald-500 to-teal-500 text-white px-3 py-1.5 rounded-full text-xs md:text-sm font-bold shadow-lg z-10">
        💎 MOST POPULAR
      </div>
    ` : '';

    return `
      <div class="price-card rounded-2xl md:rounded-3xl ${popularClass}">
        ${popularBadge}
        <div class="text-center flex-1 flex flex-col justify-center mb-6 md:mb-8">
          <h3 class="text-xl md:text-2xl lg:text-3xl font-black text-white mb-3 md:mb-4 tracking-tight leading-tight">${plan.name}</h3>
          <div class="text-4xl md:text-5xl lg:text-6xl font-black text-white mb-3 md:mb-4 leading-none">
            ${plan.priceDisplay === 'Gratis' ? 
              '<span class="text-3xl md:text-4xl">🎉 Gratis</span>' : 
              `<span class="text-xl md:text-3xl">Rp</span><span class="ml-1">${plan.priceDisplay}</span><span class="text-lg md:text-2xl opacity-75">${plan.period}</span>`
            }
          </div>
          ${!plan.period ? '<p class="text-gray-400 text-base md:text-lg font-medium">Selamanya</p>' : ''}
        </div>
        
        <ul class="space-y-2 md:space-y-3 mb-6 md:mb-8 flex-1">
          ${generateFeaturesHTML(plan.features)}
        </ul>
        
        <div class="mt-auto">
          <button 
            data-plan="${plan.id}" 
            class="${btnClass}"
            aria-label="Pilih paket ${plan.name}"
          >
            <span class="group-hover:translate-x-1 transition-transform duration-300">${plan.cta}</span>
            <i class="fas fa-arrow-right group-hover:translate-x-1 transition-transform duration-300"></i>
          </div>
        
          <p class="text-center mt-3 text-xs md:text-sm ${plan.maxStudents < 0 ? 'text-emerald-400 font-medium' : 'text-gray-400'}">
            ${plan.maxStudents < 0 ? '✅ Tak terbatas' : `${plan.maxStudents.toLocaleString()} siswa`}
          </p>
        </div>
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


