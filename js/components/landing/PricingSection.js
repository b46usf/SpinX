/**
 * Pricing Section Component - PROFESSIONAL RESPONSIVE VERSION
 * Fixed for BE data format + stunning UI/UX
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
    if (this.state.loading && !this.state.data.length) await this.preload();

    const { data, loading, error } = this.state;
    const plans = data.length ? data.map(mapPlanToDisplay) : [];

    if (loading) return this.renderLoading();
    if (error) return this.renderError();
    
    const plansHTML = plans.map(plan => this.generatePlanCard(plan)).join('');

    return `
      <section id="pricing" class="relative py-24 md:py-32 bg-gradient-to-b from-slate-950 via-slate-900 to-black overflow-hidden">
        <div class="absolute inset-0 bg-grid-pattern opacity-10"></div>
        <div class="container relative mx-auto px-6 lg:px-8">
          <div class="text-center mb-20 lg:mb-28">
            <span class="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-gradient-to-r from-indigo-500/20 to-purple-500/20 border border-indigo-500/30 text-indigo-200 text-sm font-semibold shadow-lg">
              <i class="fas fa-bolt text-indigo-400"></i>
              HARGA TERJANGKAU & TRANSPARAN
            </span>
            <h2 class="text-4xl md:text-6xl lg:text-7xl font-black bg-gradient-to-r from-white via-indigo-100 to-purple-200 bg-clip-text text-transparent mb-6 leading-tight">
              Pilih Paket <span class="block md:inline text-emerald-400">Tepat</span>
            </h2>
            <p class="text-xl md:text-2xl text-gray-300 max-w-3xl mx-auto leading-relaxed">
              Mulai gratis. Upgrade kapan saja. <strong class="text-white">Tanpa biaya tersembunyi</strong> - data real-time dari sistem SaaS.
            </p>
          </div>
          
          <div class="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8 lg:gap-12 max-w-7xl mx-auto">
            ${plansHTML}
          </div>
          
          <div class="text-center mt-20 lg:mt-28">
            <div class="inline-flex max-w-2xl mx-auto bg-gradient-to-r from-emerald-500/10 via-green-500/10 to-teal-500/10 p-8 lg:p-12 rounded-3xl border-2 border-emerald-400/30 shadow-2xl ring-2 ring-emerald-500/30">
              <i class="fas fa-shield-check text-4xl md:text-5xl text-emerald-400 mb-6 block mx-auto"></i>
              <h3 class="text-2xl md:text-3xl font-bold text-white mb-4 text-center">
                <i class="fas fa-lock text-emerald-400 mr-3"></i>100% Aman & Terjamin
              </h3>
              <p class="text-lg md:text-xl text-emerald-100 mb-6 max-w-xl mx-auto leading-relaxed">
                Pembayaran via transfer bank terpercaya. Aktivasi instan. <strong>Garansi 7 hari uang kembali</strong>.
              </p>
              <div class="flex flex-wrap gap-4 justify-center text-sm md:text-base text-emerald-200">
                <span><i class="fas fa-bolt mr-2"></i>Aktivasi Instan</span>
                <span><i class="fas fa-headset mr-2"></i>Support 24/7</span>
                <span><i class="fas fa-undo mr-2"></i>Refund 7 Hari</span>
              </div>
            </div>
          </div>
        </div>
      </section>
    `;
  },

  renderLoading() {
    return `
      <section id="pricing" class="min-h-screen flex items-center justify-center py-24 bg-gradient-to-b from-slate-950 to-black">
        <div class="text-center animate-pulse">
          <div class="w-20 h-20 border-4 border-indigo-500/20 border-t-indigo-500 rounded-full mx-auto mb-8 shadow-2xl animate-spin"></div>
          <h3 class="text-2xl md:text-3xl font-bold text-white mb-2">Memuat Paket Harga Premium</h3>
          <p class="text-lg text-gray-400 mb-8">Sinkronisasi data real-time dari SaaS...</p>
          <div class="flex justify-center gap-4">
            <div class="w-3 h-3 bg-indigo-400 rounded-full animate-bounce"></div>
            <div class="w-3 h-3 bg-purple-400 rounded-full animate-bounce" style="animation-delay: 0.1s"></div>
            <div class="w-3 h-3 bg-emerald-400 rounded-full animate-bounce" style="animation-delay: 0.2s"></div>
          </div>
        </div>
      </section>
    `;
  },

  renderError() {
    return `
      <section id="pricing" class="min-h-screen flex items-center justify-center py-20 bg-gradient-to-b from-amber-500/10 to-orange-500/10">
        <div class="container mx-auto px-6 max-w-2xl text-center">
          <div class="inline-flex items-center gap-4 bg-gradient-to-r from-amber-400/20 to-orange-400/20 border-2 border-amber-400/40 p-8 rounded-3xl shadow-2xl">
            <div class="p-4 bg-amber-400/20 rounded-2xl shadow-lg">
              <i class="fas fa-tools text-5xl text-amber-400"></i>
            </div>
            <div>
              <h2 class="text-3xl md:text-4xl font-bold bg-gradient-to-r from-amber-600 to-orange-500 bg-clip-text text-transparent mb-4">
                Maintenance Sistem
              </h2>
              <p class="text-xl md:text-2xl text-gray-200 mb-6 leading-relaxed">
                Paket pricing sedang diupdate. <br>Hubungi tim support untuk informasi terkini.
              </p>
              <div class="flex flex-col sm:flex-row gap-4 justify-center">
                <a href="mailto:support@gameumkm.com" class="bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white font-bold py-4 px-8 rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 text-lg">
                  📧 Email Support
                </a>
                <a href="https://wa.me/6281234567890" class="bg-green-500 hover:bg-green-600 text-white font-bold py-4 px-8 rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 text-lg">
                  💬 WhatsApp
                </a>
              </div>
              <p class="text-gray-400 mt-8 text-sm md:text-base">
                Estimasi selesai: <strong>30 menit</strong>
              </p>
            </div>
          </div>
        </div>
      </section>
    `;
  },

  generatePlanCard(plan) {
    // Clean BE data: fix features string → array
    const cleanPlan = {
      ...plan,
      name: plan.name.charAt(0).toUpperCase() + plan.name.slice(1),
      features: plan.period ? JSON.parse(plan.period.replace(/\\r\\n/g, '')) : []
    };

    const isPopular = cleanPlan.popular || cleanPlan.id === 'pro';
    const isFree = cleanPlan.price === 0;

    const cardBg = isPopular ? 'bg-gradient-to-br from-indigo-500/10 via-purple-500/10 to-emerald-500/10' : 'bg-gradient-to-br from-slate-800/50 to-gray-900/50';
    const borderColor = isPopular ? 'border-indigo-400/60 hover:border-indigo-400' : 'border-slate-700/50 hover:border-indigo-500/50';
    const shadow = isPopular ? 'shadow-[0_25px_50px_-12px_rgba(99,102,241,0.25)] hover:shadow-[0_35px_60px_-12px_rgba(99,102,241,0.35)]' : 'shadow-xl hover:shadow-2xl';

    const btnGradient = isPopular ? 'from-emerald-500 via-teal-500 to-emerald-600 hover:from-emerald-600 hover:via-teal-600 hover:to-emerald-700' : 'from-slate-200/20 via-white/10 to-slate-300/20 hover:from-white/20 hover:to-slate-200/30';
    const btnRing = isPopular ? 'ring-emerald-400/50 focus:ring-emerald-400 ring-2' : 'ring-white/30 focus:ring-indigo-400 ring-1';

    const badge = isPopular ? `
      <div class="absolute top-4 left-4 z-20">
        <div class="flex items-center gap-2 bg-gradient-to-r from-yellow-400 to-orange-500 text-black px-5 py-2 rounded-full text-xs font-bold uppercase tracking-wide shadow-2xl ring-2 ring-white/20 transform rotate-[-2deg]">
          <i class="fas fa-crown text-xs"></i>
          MOST POPULAR
        </div>
      </div>
    ` : '';

    const priceSection = isFree ? `
      <div class="flex flex-col items-center space-y-3 mb-8">
        <div class="w-24 h-24 bg-gradient-to-br from-emerald-400 to-teal-500 rounded-3xl flex items-center justify-center shadow-2xl ring-4 ring-emerald-200/50">
          <i class="fas fa-infinity text-2xl text-white font-bold"></i>
        </div>
        <div class="text-center">
          <span class="text-5xl md:text-6xl lg:text-7xl font-black bg-gradient-to-r from-emerald-400 to-teal-500 bg-clip-text text-transparent block tracking-tight">GRATIS</span>
          <p class="text-sm md:text-base text-emerald-300 font-medium uppercase tracking-wide mt-1">SELAYANYA</p>
        </div>
      </div>
    ` : `
      <div class="text-center mb-8">
        <div class="text-5xl md:text-6xl lg:text-7xl font-black bg-gradient-to-r from-white via-indigo-100 to-purple-200 bg-clip-text text-transparent mb-2 tracking-tight">
          ${cleanPlan.priceDisplay}
        </div>
        <p class="text-lg md:text-xl text-gray-300 font-semibold">${cleanPlan.period}</p>
      </div>
    `;

    return `
      <article class="pricing-card group relative h-[580px] md:h-[620px] lg:h-[660px] flex flex-col overflow-hidden ${shadow} ${cardBg} ${borderColor} hover:shadow-indigo-500/40 transition-all duration-700 ease-out">
        ${badge}
        <div class="flex-1 flex flex-col justify-center items-center p-6 md:p-8 lg:p-10 text-center space-y-6">
          <h3 class="text-2xl md:text-3xl lg:text-4xl font-black bg-gradient-to-r from-white via-gray-100 to-gray-200 bg-clip-text text-transparent drop-shadow-2xl uppercase tracking-wide">
            ${cleanPlan.name.replace(/\\b./g, l => l.toUpperCase())}
          </h3>
          ${priceSection}
        </div>
        
        <div class="p-6 md:p-8 lg:p-10 flex-1">
          <ul class="space-y-3 text-sm md:text-base font-medium">
            ${generateFeaturesHTML(cleanPlan.features)}
          </ul>
        </div>
        
        <div class="p-6 md:p-8 lg:p-10 mt-auto">
          <button data-plan="${cleanPlan.id}" class="${isPopular ? popularBtn : regularBtn} text-lg md:text-xl font-black uppercase tracking-wide shadow-2xl" aria-label="Pilih ${cleanPlan.name}">
            <span class="flex-1">${cleanPlan.cta}</span>
            <i class="fas fa-arrow-right ml-3 text-lg group-hover:translate-x-2 transition-all duration-300"></i>
          </button>
          <p class="text-center mt-6 text-xs md:text-sm font-bold text-emerald-400 tracking-wide uppercase">
            ${cleanPlan.maxStudents === 0 || cleanPlan.maxStudents >= 500 ? '✅ Tak Terbatas Siswa' : `${cleanPlan.maxStudents.toLocaleString()} Siswa Maks`}
          </p>
        </div>
        
        <!-- Subtle glow effect for popular -->
        ${isPopular ? '<div class="absolute inset-0 bg-gradient-to-r from-emerald-400/10 via-transparent to-indigo-400/10 blur-xl opacity-75 group-hover:opacity-100 transition-opacity"></div>' : ''}
      </article>
    `;
  },

  initEvents(callbacks = {}) {
    document.addEventListener('click', (e) => {
      if (e.target.matches('.select-plan-btn, .select-plan-btn *')) {
        const planId = e.target.closest('.select-plan-btn').dataset.plan;
        callbacks.onSelectPlan?.(planId);
        console.log('Plan selected:', planId);
      }
    });
  }
};

export default PricingSection;

