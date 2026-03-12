/**
 * Pricing Section Component - PRODUCTION MASTERPIECE
 * Stunning responsive design + BE data safe
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
    const plans = data.length ? data.map(this.cleanPlanData) : [];

    if (loading) return this.renderLoading();
    // Always render if we have plans (fallback available)
    if (!plans.length) {
      console.warn('No pricing plans available - critical error');
      return this.renderError();
    }
    
    const plansHTML = plans.map(plan => this.generatePlanCard(plan)).join('');

    return `
      <section id="pricing" class="relative py-24 md:py-32 bg-gradient-to-b from-slate-950 via-slate-900/80 to-black/90 overflow-hidden">
        <div class="absolute inset-0 bg-[radial-gradient(circle_at_20%_80%,rgba(120,119,198,0.3),transparent_50%),radial-gradient(circle_at_80%_20%,rgba(255,255,255,0.1),transparent_50%),radial-gradient(circle,rgba(120,119,198,0.2),transparent_70%)]"></div>
        <div class="relative z-10 container mx-auto px-6 lg:px-8 max-w-7xl">
          <div class="text-center mb-24 lg:mb-32">
            <span class="inline-flex items-center gap-3 px-8 py-4 rounded-2xl bg-gradient-to-r from-indigo-500/10 via-purple-500/10 to-emerald-500/10 border border-indigo-400/30 text-indigo-300 text-lg font-bold shadow-2xl ring-1 ring-indigo-400/20">
              <i class="fas fa-sparkles text-xl text-indigo-400 animate-pulse"></i>
              PAKET PREMIUM TERJANGKAU
            </span>
            <h2 class="text-5xl md:text-7xl lg:text-8xl font-black bg-gradient-to-r from-white via-emerald-50 to-indigo-100 bg-clip-text text-transparent mb-8 leading-none drop-shadow-2xl">
              Pilih <span class="block md:inline text-emerald-400 drop-shadow-lg">Yang Tepat</span>
            </h2>
            <p class="text-2xl md:text-3xl text-gray-300 max-w-4xl mx-auto leading-relaxed">
              Mulai gratis. <strong class="text-white font-bold">Upgrade anytime.</strong> Tanpa biaya tersembunyi - <span class="text-emerald-400">data real-time</span>.
            </p>
          </div>
          
          <div class="grid grid-cols-1 lg:grid-cols-3 gap-8 lg:gap-12">
            ${plansHTML}
          </div>
          
          <!-- Price Comparison Table -->
          <div class="mt-20 lg:mt-28">
            <div class="max-w-6xl mx-auto">
              <div class="text-center mb-12">
                <h3 class="text-3xl lg:text-4xl font-black bg-gradient-to-r from-emerald-400 to-teal-400 bg-clip-text text-transparent mb-4">
                  <i class="fas fa-chart-bar mr-3"></i>Perbandingan Lengkap
                </h3>
                <p class="text-xl text-gray-300 max-w-2xl mx-auto">Pilih plan yang sesuai kebutuhan sekolah Anda</p>
              </div>
              <div class="overflow-x-auto">
                <table class="w-full bg-white/5 backdrop-blur-xl rounded-3xl border border-white/10">
                  <thead>
                    <tr class="divide-x divide-white/10">
                      <th class="px-6 py-6 text-left">
                        <span class="text-2xl font-bold text-white">Fitur</span>
                      </th>
                      <th class="px-6 py-6 text-center bg-gradient-to-r from-emerald-500/10 border-r border-white/20">
                        <div class="text-center">
                          <div class="text-4xl font-black text-emerald-400 mb-2 animate-pulse">GRATIS</div>
                          <div class="text-sm uppercase tracking-wider text-emerald-300">Starter</div>
                        </div>
                      </th>
                      <th class="px-6 py-6 text-center bg-gradient-to-r from-amber-500/20 to-orange-500/20 border-r border-white/20 relative">
                        <div class="absolute inset-0 bg-gradient-to-br from-amber-400 via-orange-400 to-amber-500 -skew-x-3 -rotate-1 transform"></div>
                        <div class="relative z-10">
                          <div class="text-3xl font-black text-yellow-900 mb-2 animate-bounce">Rp 150k</div>
                          <div class="text-xs uppercase tracking-widest text-yellow-800 font-bold bg-yellow-400 px-3 py-1 rounded-full inline-block">⭐ POPULAR</div>
                          <div class="text-xs uppercase tracking-wider text-yellow-700 mt-1">Pro</div>
                        </div>
                      </th>
                      <th class="px-6 py-6 text-center">
                        <div class="text-center">
                          <div class="text-3xl font-black text-indigo-400 mb-2">Rp 500k</div>
                          <div class="text-sm uppercase tracking-wider text-indigo-300">Enterprise</div>
                        </div>
                      </th>
                    </tr>
                  </thead>
                  <tbody class="divide-y divide-white/5">
                    <tr class="hover:bg-white/5">
                      <td class="px-6 py-6 font-semibold text-white">Jumlah Siswa</td>
                      <td class="px-6 py-6 text-center text-emerald-400 font-bold">50</td>
                      <td class="px-6 py-6 text-center text-yellow-400 font-bold">200</td>
                      <td class="px-6 py-6 text-center text-indigo-400 font-bold">Unlimited</td>
                    </tr>
                    <tr class="hover:bg-white/5">
                      <td class="px-6 py-6 font-semibold text-white">Game Wheel</td>
                      <td class="px-6 py-6 text-center">
                        <i class="fas fa-check-circle text-emerald-400 text-lg"></i>
                      </td>
                      <td class="px-6 py-6 text-center">
                        <i class="fas fa-check-circle text-emerald-400 text-lg"></i>
                      </td>
                      <td class="px-6 py-6 text-center">
                        <i class="fas fa-check-circle text-emerald-400 text-lg"></i>
                      </td>
                    </tr>
                    <tr class="hover:bg-white/5">
                      <td class="px-6 py-6 font-semibold text-white">Voucher Unlimited</td>
                      <td class="px-6 py-6 text-center">
                        <i class="fas fa-times-circle text-red-400 text-lg"></i>
                      </td>
                      <td class="px-6 py-6 text-center">
                        <i class="fas fa-check-circle text-emerald-400 text-lg"></i>
                      </td>
                      <td class="px-6 py-6 text-center">
                        <i class="fas fa-check-circle text-emerald-400 text-lg"></i>
                      </td>
                    </tr>
                    <tr class="hover:bg-white/5">
                      <td class="px-6 py-6 font-semibold text-white">Support Prioritas</td>
                      <td class="px-6 py-6 text-center">
                        <i class="fas fa-envelope text-gray-400 text-lg"></i>
                      </td>
                      <td class="px-6 py-6 text-center">
                        <i class="fas fa-headset text-emerald-400 text-lg"></i>
                      </td>
                      <td class="px-6 py-6 text-center">
                        <i class="fas fa-headset text-emerald-400 text-lg animate-spin"></i>
                      </td>
                    </tr>
                    <tr class="hover:bg-white/5">
                      <td class="px-6 py-6 font-semibold text-white">Custom Branding</td>
                      <td class="px-6 py-6 text-center">
                        <i class="fas fa-times-circle text-red-400 text-lg"></i>
                      </td>
                      <td class="px-6 py-6 text-center">
                        <i class="fas fa-times-circle text-red-400 text-lg"></i>
                      </td>
                      <td class="px-6 py-6 text-center">
                        <i class="fas fa-check-circle text-emerald-400 text-lg"></i>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
          
          <div class="text-center mt-28 lg:mt-36">
            <div class="max-w-4xl mx-auto bg-gradient-to-r from-emerald-500/5 via-green-500/5 to-teal-500/5 backdrop-blur-xl p-12 lg:p-16 rounded-3xl border border-emerald-400/20 shadow-2xl ring-2 ring-emerald-500/20">
              <i class="fas fa-shield-alt text-6xl md:text-7xl text-emerald-400 mb-8 mx-auto block drop-shadow-2xl animate-pulse"></i>
              <h3 class="text-3xl md:text-4xl lg:text-5xl font-black text-white mb-6 text-center leading-tight">
                <span class="text-emerald-400">100%</span> Aman & Terjamin
              </h3>
              <div class="grid grid-cols-1 md:grid-cols-3 gap-8">
                <div class="text-center p-6">
                  <i class="fas fa-bolt text-4xl text-emerald-400 mb-4 block"></i>
                  <h4 class="text-xl md:text-2xl font-bold text-white mb-2">Aktivasi Instan</h4>
                  <p class="text-emerald-200 text-lg">Mulai pakai dalam 60 detik</p>
                </div>
                <div class="text-center p-6">
                  <i class="fas fa-headset text-4xl text-emerald-400 mb-4 block"></i>
                  <h4 class="text-xl md:text-2xl font-bold text-white mb-2">Support 24/7</h4>
                  <p class="text-emerald-200 text-lg">Tim ready bantu kapan saja</p>
                </div>
                <div class="text-center p-6">
                  <i class="fas fa-undo-alt text-4xl text-emerald-400 mb-4 block"></i>
                  <h4 class="text-xl md:text-2xl font-bold text-white mb-2">Garansi Uang Kembali</h4>
                  <p class="text-emerald-200 text-lg">7 hari - no questions asked</p>
                </div>
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
        <div class="text-center space-y-8 max-w-md mx-auto">
          <div class="relative">
            <div class="w-28 h-28 border-4 border-indigo-500/20 rounded-full mx-auto shadow-2xl animate-spin-slow"></div>
            <div class="absolute inset-0 w-28 h-28 border-4 border-emerald-500/30 rounded-full mx-auto animate-spin" style="animation-direction: reverse; animation-duration: 2s"></div>
            <div class="absolute inset-0 w-20 h-20 border-4 border-purple-500 rounded-full mx-auto animate-ping"></div>
          </div>
          <div class="space-y-4">
            <h3 class="text-3xl md:text-4xl font-black bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">
              Loading Premium Plans
            </h3>
            <p class="text-xl text-gray-400">Syncing real-time SaaS data...</p>
            <div class="flex justify-center gap-3">
              <div class="w-4 h-4 bg-indigo-400 rounded-full animate-bounce"></div>
              <div class="w-4 h-4 bg-purple-400 rounded-full animate-bounce" style="animation-delay:0.1s"></div>
              <div class="w-4 h-4 bg-emerald-400 rounded-full animate-bounce" style="animation-delay:0.2s"></div>
            </div>
          </div>
        </div>
      </section>
    `;
  },

  renderError() {
    return `
      <section id="pricing" class="min-h-screen flex items-center justify-center py-20 bg-gradient-to-br from-orange-500/10 via-amber-500/5 to-red-500/10">
        <div class="max-w-2xl mx-auto px-6 text-center">
          <div class="bg-gradient-to-r from-amber-400/20 to-red-400/20 border-4 border-amber-400/40 p-12 rounded-3xl shadow-2xl animate-pulse">
            <i class="fas fa-tools text-7xl text-amber-400 mb-8 mx-auto block drop-shadow-2xl"></i>
            <h2 class="text-4xl md:text-5xl font-black bg-gradient-to-r from-amber-600 via-orange-500 to-red-500 bg-clip-text text-transparent mb-6">
              Sistem Maintenance
            </h2>
            <p class="text-2xl md:text-3xl text-gray-200 mb-12 leading-relaxed">
              Update pricing real-time sedang berlangsung. <br><strong class="text-white">Hubungi support langsung!</strong>
            </p>
            <div class="flex flex-col lg:flex-row gap-6 justify-center items-center">
              <a href="mailto:support@gameumkm.com" class="bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white font-bold py-5 px-12 rounded-2xl shadow-2xl hover:shadow-3xl text-xl transition-all duration-300 transform hover:-translate-y-1">
                📧 Email Support
              </a>
              <a href="https://wa.me/6281234567890?text=Halo%2C%20saya%20mau%20tanya%20paket%20pricing" class="bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white font-bold py-5 px-12 rounded-2xl shadow-2xl hover:shadow-3xl text-xl transition-all duration-300 transform hover:-translate-y-1">
                💬 WhatsApp Sekarang
              </a>
            </div>
            <p class="text-lg text-amber-200 mt-12 font-semibold">
              Estimasi selesai: <span class="text-white text-2xl">20 menit</span>
            </p>
          </div>
        </div>
      </section>
    `;
  },

  cleanPlanData(plan) {
    // Use robust mapping from utils (handles BE malformed data)
    console.log('🧹 Cleaning plan data:', plan);
    const cleanPlan = mapPlanToDisplay(plan);
    console.log('✅ Cleaned plan:', cleanPlan);
    return cleanPlan;
  },



  generatePlanCard(plan) {
    const cleanPlan = this.cleanPlanData(plan);
    const isPopular = cleanPlan.popular || cleanPlan.id === 'pro';
    const isFree = cleanPlan.priceDisplay.toLowerCase().includes('gratis');
    
    // Modern glassmorphism card system
    const glassEffect = 'backdrop-blur-xl bg-white/5 border-white/10 hover:border-indigo-400/50 shadow-2xl';
    const cardHeight = 'h-[600px] md:h-[640px] lg:h-[680px]';
    const liftEffect = 'group-hover:-translate-y-3 group-hover:shadow-[0_35px_70px_rgba(0,0,0,0.5)]';

    const popularBadge = isPopular ? `
      <div class="absolute top-6 left-6 z-30">
        <div class="group/badge bg-gradient-to-br from-amber-400 via-orange-400 to-amber-500 shadow-2xl ring-2 ring-amber-400/50 px-6 py-3 rounded-full text-xs font-black uppercase tracking-wider text-gray-900 transform rotate-[-3deg] hover:rotate-0 transition-all duration-300 hover:scale-105">
          <i class="fas fa-crown mr-1 text-amber-600"></i>
          MOST POPULAR
        </div>
      </div>
    ` : '';

    const priceHero = isFree ? `
      <div class="flex flex-col items-center space-y-4 mb-10 p-6 bg-gradient-to-br from-emerald-500/10 to-teal-500/10 rounded-3xl border border-emerald-400/30 shadow-xl">
        <div class="w-28 h-28 bg-gradient-to-br from-emerald-400 to-teal-500 rounded-3xl flex items-center justify-center shadow-2xl ring-8 ring-emerald-200/40">
          <i class="fas fa-infinity text-3xl font-bold text-white drop-shadow-lg"></i>
        </div>
        <div>
          <div class="text-6xl md:text-7xl lg:text-8xl font-black bg-gradient-to-r from-emerald-400 via-teal-400 to-emerald-500 bg-clip-text text-transparent mb-2 drop-shadow-2xl">
            GRATIS
          </div>
          <p class="text-2xl font-bold text-emerald-300 uppercase tracking-wider drop-shadow-lg">SELAYANYA</p>
        </div>
      </div>
    ` : `
      <div class="text-center space-y-4 mb-12">
        <div class="text-6xl md:text-7xl lg:text-8xl font-black bg-gradient-to-r from-emerald-400 via-teal-400 to-indigo-400 bg-clip-text text-transparent drop-shadow-2xl tracking-tight">
          ${cleanPlan.priceDisplay}
        </div>
        <p class="text-2xl font-bold text-white/80 uppercase tracking-widest drop-shadow-lg">${cleanPlan.period}</p>
      </div>
    `;

    return `
      <article class="pricing-card group relative ${glassEffect} ${cardHeight} ${liftEffect} border hover:border-indigo-400/70 flex flex-col overflow-hidden transition-all duration-700 ease-out cursor-pointer hover:shadow-indigo-500/50">
        ${popularBadge}
        
        <!-- Header: Name + Price Hero -->
        <div class="flex-1 flex flex-col justify-center items-center p-8 lg:p-12 text-center space-y-8 pt-20 lg:pt-24">
          <h3 class="text-3xl md:text-4xl lg:text-5xl font-black bg-gradient-to-r from-white via-indigo-50 to-purple-50 bg-clip-text text-transparent drop-shadow-2xl tracking-tight uppercase">
            ${cleanPlan.name.replace(/\w\S*/g, txt => txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase())}
          </h3>
          ${priceHero}
        </div>
        
        <!-- Features Section -->
        <div class="px-6 md:px-8 lg:px-12 py-8 border-t border-white/10 flex-1">
          <ul class="space-y-4 text-lg">
            ${generateFeaturesHTML(cleanPlan.features)}
          </ul>
        </div>
        
        <!-- CTA + Student Count -->
        <div class="p-8 lg:p-12 mt-auto">
          <button data-plan="${cleanPlan.id}" class="${isPopular ? 'bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white shadow-emerald-500/50 hover:shadow-emerald-500/60 ring-emerald-400/50' : 'bg-gradient-to-r from-indigo-500/20 to-purple-500/20 hover:from-indigo-500/30 hover:to-purple-500/30 text-white shadow-indigo-500/30 hover:shadow-indigo-500/40 ring-indigo-400/30'} w-full font-black text-xl py-5 px-8 rounded-2xl uppercase tracking-wider shadow-2xl hover:shadow-3xl hover:scale-[1.02] transition-all duration-500 ring-2 hover:ring-4 focus:outline-none focus:ring-4 focus:ring-offset-2 focus:ring-offset-slate-900 select-plan-btn">
            <span>${cleanPlan.cta || 'Pilih Plan'}</span>
            <i class="fas fa-rocket ml-3 group-hover:translate-x-2 transition-all duration-300"></i>
          </button>
          <p class="text-center mt-6 text-emerald-400 text-lg font-bold uppercase tracking-wider">
            ${cleanPlan.maxStudents >= 500 ? '✅ UNLIMITED STUDENTS' : `${cleanPlan.maxStudents}+ Siswa`}
          </p>
        </div>
      </article>
    `;
  },

  renderLoading() {
    return `
      <section id="pricing" class="min-h-screen flex items-center justify-center py-24">
        <div class="text-center max-w-lg mx-auto p-12">
          <div class="relative w-32 h-32 mx-auto mb-12">
            <div class="absolute inset-0 w-32 h-32 border-4 border-indigo-400/20 rounded-full animate-spin-slow"></div>
            <div class="absolute inset-2 w-28 h-28 border-4 border-emerald-400/40 rounded-full animate-spin" style="animation-direction: reverse"></div>
            <div class="absolute inset-6 w-20 h-20 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full shadow-2xl animate-ping"></div>
          </div>
          <h3 class="text-4xl font-black text-white mb-4 bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text">
            Loading Premium Pricing
          </h3>
          <p class="text-xl text-gray-400 mb-12">Fetching real-time SaaS subscription data...</p>
          <div class="flex justify-center gap-4">
            <div class="w-6 h-6 bg-indigo-400 rounded-full animate-bounce [animation-duration:1s]"></div>
            <div class="w-6 h-6 bg-emerald-400 rounded-full animate-bounce" style="animation-delay:0.2s"></div>
            <div class="w-6 h-6 bg-purple-400 rounded-full animate-bounce" style="animation-delay:0.4s"></div>
          </div>
        </div>
      </section>
    `;
  },

  renderError() {
    return `
      <section id="pricing" class="min-h-screen flex items-center justify-center py-24 bg-gradient-to-br from-amber-500/5 via-orange-400/5 to-red-500/5">
        <div class="max-w-4xl mx-auto px-8 text-center">
          <div class="bg-white/5 backdrop-blur-xl border-4 border-amber-400/30 p-16 lg:p-24 rounded-3xl shadow-2xl max-w-3xl">
            <i class="fas fa-hammer text-8xl text-amber-400 mb-12 drop-shadow-2xl animate-pulse"></i>
            <h2 class="text-5xl lg:text-6xl font-black bg-gradient-to-r from-amber-500 via-orange-500 to-red-500 bg-clip-text text-transparent mb-8">
              Pricing Update in Progress
            </h2>
            <p class="text-2xl lg:text-3xl text-gray-200 mb-16 leading-relaxed max-w-2xl mx-auto">
              Sistem pricing sedang diupgrade dengan data terbaru. <strong>Kontak support untuk penawaran spesial!</strong>
            </p>
            <div class="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-2xl mx-auto">
              <a href="mailto:support@gameumkm.com" class="bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white font-black py-6 px-12 rounded-3xl text-xl shadow-2xl hover:shadow-3xl hover:scale-[1.02] transition-all duration-300 block text-center">
                📧 Email Tim
              </a>
              <a href="https://wa.me/6281234567890?text=Saya%20tertarik%20dengan%20paket%20pricing%2C%20bisa%20jelaskan%3F" class="bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white font-black py-6 px-12 rounded-3xl text-xl shadow-2xl hover:shadow-3xl hover:scale-[1.02] transition-all duration-300 block text-center">
                💬 WhatsApp
              </a>
            </div>
            <p class="text-xl text-amber-300 mt-16 font-semibold">
              <i class="fas fa-clock mr-2"></i>Estimasi selesai: 15 menit
            </p>
          </div>
        </div>
      </section>
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

