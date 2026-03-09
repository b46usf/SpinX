/**
 * Pricing Section Component
 * Pricing plans for landing page
 */

// Pricing data - single source of truth
const pricingData = [
  {
    plan: 'starter',
    name: 'Starter',
    price: 'Gratis',
    period: '',
    features: [
      { text: '50 siswa aktif', included: true },
      { text: 'Lucky Wheel basic', included: true },
      { text: '5 jenis voucher', included: true },
      { text: 'Dashboard simple', included: true },
      { text: 'Export data', included: false },
      { text: 'Priority support', included: false }
    ],
    cta: 'Mulai Gratis',
    popular: false
  },
  {
    plan: 'pro',
    name: 'Pro',
    price: '150',
    period: '/bulan',
    features: [
      { text: '200 siswa aktif', included: true },
      { text: 'Lucky Wheel premium', included: true },
      { text: '10 jenis voucher', included: true },
      { text: 'Dashboard lengkap', included: true },
      { text: 'Export data Excel', included: true },
      { text: 'Priority support', included: true }
    ],
    cta: 'Pilih Pro',
    popular: true
  },
  {
    plan: 'enterprise',
    name: 'Enterprise',
    price: '500',
    period: '/bulan',
    features: [
      { text: 'Siswa unlimited', included: true },
      { text: 'Lucky Wheel custom', included: true },
      { text: 'Voucher tak terbatas', included: true },
      { text: 'Dashboard advance', included: true },
      { text: 'API Access', included: true },
      { text: 'Dedicated support', included: true }
    ],
    cta: 'Hubungi Sales',
    popular: false
  }
];

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

