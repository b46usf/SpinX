/**
 * Features Section Component
 * Features showcase for landing page
 */

// Feature data - single source of truth
const featuresData = [
  {
    icon: 'fa-dharmachakra',
    gradient: 'from-red-500 to-orange-500',
    title: 'Lucky Wheel Interaktif',
    description: 'Roda putar menarik dengan animasi halus. Siswa akan tertarik untuk mencoba lagi dan lagi!'
  },
  {
    icon: 'fa-ticket-alt',
    gradient: 'from-green-500 to-teal-500',
    title: 'Sistem Voucher Otomatis',
    description: 'Generate voucher diskon otomatis saat siswa menang. Redeem mudah di kasir!'
  },
  {
    icon: 'fa-chart-line',
    gradient: 'from-blue-500 to-cyan-500',
    title: 'Dashboard Lengkap',
    description: 'Pantau performa promo, jumlah pemain, dan redemption voucher secara real-time.'
  },
  {
    icon: 'fa-users',
    gradient: 'from-purple-500 to-pink-500',
    title: 'Manajemen Siswa',
    description: 'Data siswa terintegrasi dengan database sekolah. Validasi otomatis via NIS.'
  },
  {
    icon: 'fa-mobile-alt',
    gradient: 'from-yellow-500 to-amber-500',
    title: 'Responsive Design',
    description: 'Tampilan optimal di semua device - HP, tablet, maupun laptop.'
  },
  {
    icon: 'fa-headset',
    gradient: 'from-indigo-500 to-blue-500',
    title: 'Bantuan 24/7',
    description: 'Tim support siap membantu kapan saja via Telegram untuk kelancaran promo Anda.'
  }
];

export const FeaturesSection = {
  render: () => {
    const featuresHTML = featuresData.map(feature => `
      <div class="card-hover bg-gray-800/50 border border-gray-700/50 rounded-2xl p-6">
        <div class="feature-icon bg-gradient-to-br ${feature.gradient} text-white mb-4">
          <i class="fas ${feature.icon}"></i>
        </div>
        <h3 class="text-xl font-bold text-white mb-2">${feature.title}</h3>
        <p class="text-gray-400 text-sm">${feature.description}</p>
      </div>
    `).join('');
    
    return `
      <section id="features" class="section-padding bg-gray-900/50">
        <div class="container mx-auto px-4">
          <div class="text-center mb-16">
            <span class="inline-block px-4 py-1 bg-indigo-500/20 text-indigo-400 rounded-full text-sm font-medium mb-4">FITUR UNGGULAN</span>
            <h2 class="text-3xl sm:text-4xl font-bold text-white mb-4">Semua yang Anda Butuhkan untuk <span class="gradient-text">Booster Kantin</span></h2>
            <p class="text-gray-400 max-w-2xl mx-auto">Fitur lengkap untuk menjalankan promo Lucky Wheel di kantin sekolah Anda</p>
          </div>
          <div class="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            ${featuresHTML}
          </div>
        </div>
      </section>
    `;
  }
};

export default FeaturesSection;

