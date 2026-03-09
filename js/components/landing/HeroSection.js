/**
 * Hero Section Component
 * Main hero section with wheel animation for landing page
 */

export const HeroSection = {
  render: () => `
    <section class="relative min-h-screen flex items-center pt-16">
      <div class="container mx-auto px-4 py-20">
        <div class="grid lg:grid-cols-2 gap-12 items-center">
          <div class="text-center lg:text-left relative z-10">
            <div class="inline-flex items-center gap-2 px-4 py-2 bg-indigo-500/20 border border-indigo-500/30 rounded-full mb-6">
              <span class="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>
              <span class="text-indigo-300 text-sm">Sekarang di Kantin Sekolah!</span>
            </div>
            <h1 class="text-4xl sm:text-5xl lg:text-6xl font-bold text-white leading-tight mb-6">
              Booster Bisnis Kantin
              <span class="gradient-text">Sekolah Anda!</span>
            </h1>
            <p class="text-gray-400 text-lg sm:text-xl mb-8 max-w-xl mx-auto lg:mx-0">
              Tingkatkan penjualan kantin dengan Lucky Wheel promo interaktif. Murah, mudah, dan terbukti menambah pelanggan!
            </p>
            <div class="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
              <a href="#pricing" class="inline-flex items-center justify-center px-8 py-4 bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 text-white font-bold rounded-xl shadow-xl shadow-indigo-500/30 hover:shadow-indigo-500/50 transition-all transform hover:scale-105">
                <i class="fas fa-rocket mr-2"></i>Mulai Sekarang
              </a>
              <a href="#features" class="inline-flex items-center justify-center px-8 py-4 bg-white/10 border border-white/20 text-white font-semibold rounded-xl hover:bg-white/20 transition-all">
                <i class="fas fa-play mr-2"></i>Pelajari Lebih Lanjut
              </a>
            </div>
            <div class="grid grid-cols-3 gap-6 mt-12 pt-8 border-t border-white/10">
              <div><div class="text-2xl sm:text-3xl font-bold text-white">500+</div><div class="text-gray-500 text-sm">Sekolah</div></div>
              <div><div class="text-2xl sm:text-3xl font-bold text-white">50rb+</div><div class="text-gray-500 text-sm">Siswa</div></div>
              <div><div class="text-2xl sm:text-3xl font-bold text-white">4.9</div><div class="text-gray-500 text-sm">Rating</div></div>
            </div>
          </div>
          <div class="relative flex justify-center lg:justify-end">
            <div class="wheel-glow"></div>
            <div class="w-80 h-80 sm:w-96 sm:h-96 relative floating">
              <svg viewBox="0 0 400 400" class="w-full h-full transform hover:rotate-12 transition-transform duration-700">
                <defs><filter id="glow"><feGaussianBlur stdDeviation="3" result="coloredBlur"/><feMerge><feMergeNode in="coloredBlur"/><feMergeNode in="SourceGraphic"/></feMerge></filter></defs>
                <circle cx="200" cy="200" r="190" fill="none" stroke="#6366f1" stroke-width="8" filter="url(#glow)"/>
                <circle cx="200" cy="200" r="175" fill="#1a1a2e" stroke="rgba(99,102,241,0.3)" stroke-width="2"/>
                <path d="M200 200 L200 25 A175 175 0 0 1 353 118 Z" fill="#ef4444" opacity="0.8"/>
                <path d="M200 200 L353 118 A175 175 0 0 1 353 282 Z" fill="#f59e0b" opacity="0.8"/>
                <path d="M200 200 L353 282 A175 175 0 0 1 200 375 Z" fill="#10b981" opacity="0.8"/>
                <path d="M200 200 L200 375 A175 175 0 0 1 47 282 Z" fill="#3b82f6" opacity="0.8"/>
                <path d="M200 200 L47 282 A175 175 0 0 1 47 118 Z" fill="#8b5cf6" opacity="0.8"/>
                <path d="M200 200 L47 118 A175 175 0 0 1 200 25 Z" fill="#ec4899" opacity="0.8"/>
                <circle cx="200" cy="200" r="50" fill="url(#centerGradient)" filter="url(#glow)"/>
                <defs><radialGradient id="centerGradient"><stop offset="0%" stop-color="#6366f1"/><stop offset="100%" stop-color="#8b5cf6"/></radialGradient></defs>
                <text x="200" y="195" text-anchor="middle" fill="white" font-size="14" font-weight="bold">spin</text>
                <text x="200" y="215" text-anchor="middle" fill="white" font-size="14" font-weight="bold">X</text>
                <polygon points="200,10 190,40 210,40" fill="#ffffff" filter="url(#glow)"/>
              </svg>
              <div class="absolute -top-4 -right-4 bg-green-500 text-white px-3 py-1 rounded-full text-xs font-bold shadow-lg"><i class="fas fa-gift mr-1"></i> Discount 20%</div>
              <div class="absolute -bottom-2 -left-4 bg-pink-500 text-white px-3 py-1 rounded-full text-xs font-bold shadow-lg"><i class="fas fa-star mr-1"></i> Gratis Spin</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  `
};

export default HeroSection;

