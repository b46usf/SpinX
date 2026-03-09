/**
 * CTA Section Component
 * Call-to-action section for landing page
 */

export const CTASection = {
  render: () => `
    <section class="section-padding">
      <div class="container mx-auto px-4">
        <div class="cta-gradient rounded-3xl p-8 sm:p-12 text-center relative overflow-hidden">
          <div class="absolute top-0 left-0 w-32 h-32 bg-white/10 rounded-full -translate-x-16 -translate-y-16"></div>
          <div class="absolute bottom-0 right-0 w-32 h-32 bg-white/10 rounded-full translate-x-16 translate-y-16"></div>
          <div class="relative z-10">
            <h2 class="text-3xl sm:text-4xl font-bold text-white mb-4">Siap Booster Kantin Anda?</h2>
            <p class="text-white/80 mb-8 max-w-xl mx-auto">Mulai sekarang dan rasakan perbedaan dalam bisnis kantin Anda. Gratis tanpa kartu kredit!</p>
            <div class="flex flex-col sm:flex-row gap-4 justify-center">
              <button data-plan="starter" class="cta-start-btn inline-flex items-center justify-center px-8 py-4 bg-white text-indigo-600 font-bold rounded-xl hover:bg-gray-100 transition-all shadow-lg">
                <i class="fas fa-rocket mr-2"></i>Coba Gratis Sekarang
              </button>
              <a href="#pricing" class="inline-flex items-center justify-center px-8 py-4 bg-white/10 border border-white/30 text-white font-semibold rounded-xl hover:bg-white/20 transition-all">
                <i class="fas fa-comments mr-2"></i>Chat via WhatsApp
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  `,
  
  initEvents: (callbacks = {}) => {
    document.querySelectorAll('.cta-start-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        if (callbacks.onSelectPlan) callbacks.onSelectPlan(btn.dataset.plan);
      });
    });
  }
};

export default CTASection;

