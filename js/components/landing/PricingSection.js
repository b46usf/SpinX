/**
 * Pricing Section Component
 * Pricing plans for landing page
 */

// Dynamic pricing from BE SUBSCRIPTION_PLANS sheet
let pricingData = []; // Populated by loadPricingData()

// Static fallback (if BE fails)
const fallbackPlans = [
  { id: 'starter', name: 'Starter', price: 0, priceDisplay: 'Gratis', maxStudents: 50 },
  { id: 'pro', name: 'Pro', price: 150000, priceDisplay: 'Rp 150rb/bulan', maxStudents: 200 },
  { id: 'enterprise', name: 'Enterprise', price: 500000, priceDisplay: 'Rp 500rb/bulan', maxStudents: -1 }
];

// Load pricing data from BE
const loadPricingData = async () => {
  try {
    const result = await authApi.getPricePlans();
    if (result.success && result.plans) {
      pricingData = result.plans;
      return true;
    }
  } catch (e) {
    console.warn('BE pricing fetch failed:', e);
  }
  
  // Fallback
  pricingData = fallbackPlans;
  return false;
};

// Helper to generate feature list HTML
const generateFeaturesList = (features) => {
  return features.map(f => `
    <li class="flex items-center gap-3 ${f.included ? 'text-gray-300' : 'text-gray-500'} text-sm">
      <i class="fas fa-${f.included ? 'check' : 'times'} ${f.included ? 'text-green-400' : 'text-gray-600'}"></i>
      <span>${f.text}</span>
    </li>
  `).join('');
};

export const PricingSection = {
  render: () => {
    const plansHTML = pricingData.map(plan => {
      const popularClass = plan.popular ? 'popular bg-gray-800/50 border-indigo-500/50 transform scale-105' : 'bg-gray-800/50 border-gray-700/50';
      const btnClass = plan.popular 
        ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg shadow-indigo-500/30 hover:shadow-indigo-500/50'
        : 'bg-white/10 border border-white/20 text-white hover:bg-white/20';
      
      return `
        <div class="price-card ${popularClass} rounded-2xl p-6">
          <div class="text-center mb-6">
            <h3 class="text-xl font-bold text-white mb-2">${plan.name}</h3>
            <div class="text-4xl font-bold text-white mb-1">
              ${plan.price === 'Gratis' ? 'Gratis' : `<span class="text-2xl">Rp</span>${plan.price}<span class="text-lg">${plan.period}</span>`}
            </div>
            ${plan.period ? '' : `<p class="text-gray-500 text-sm">Untuk mencoba</p>`}
          </div>
          <ul class="space-y-3 mb-8">
            ${generateFeaturesList(plan.features)}
          </ul>
          <button data-plan="${plan.plan}" class="w-full py-3 ${btnClass} font-semibold rounded-xl transition-all select-plan-btn">${plan.cta}</button>
        </div>
      `;
    }).join('');
    
    return `
      <section id="pricing" class="section-padding">
        <div class="container mx-auto px-4">
          <div class="text-center mb-16">
            <span class="inline-block px-4 py-1 bg-indigo-500/20 text-indigo-400 rounded-full text-sm font-medium mb-4">HARGA TERJANGKAU</span>
            <h2 class="text-3xl sm:text-4xl font-bold text-white mb-4">Paket yang <span class="gradient-text">Tepat Untuk Anda</span></h2>
            <p class="text-gray-400 max-w-2xl mx-auto">Mulai gratis, upgrade kapan saja. Tidak ada biaya tersembunyi.</p>
          </div>
          <div class="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            ${plansHTML}
          </div>
          <div class="text-center mt-8">
            <p class="text-gray-500 text-sm">
              <i class="fas fa-lock mr-1"></i>Pembayaran aman via Transfer Bank - Garansi uang kembali 7 hari
            </p>
          </div>
        </div>
      </section>
    `;
  },
  
  initEvents: (callbacks = {}) => {
    document.querySelectorAll('.select-plan-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        if (callbacks.onSelectPlan) callbacks.onSelectPlan(btn.dataset.plan);
      });
    });
  }
};

export default PricingSection;

