/**
 * CTA Section Component
 * Closing section with a clearer action path.
 */

const ctaChecklist = [
  'Paket langsung dipilih tanpa diskusi yang berputar',
  'Data admin cukup diisi sekali untuk mulai aktivasi',
  'Tim kami bantu onboarding sampai sekolah siap live'
];

export const CTASection = {
  render: () => `
    <section id="cta" class="landing-section landing-section--tight landing-anchor" data-nav-section>
      <div class="landing-shell">
        <div class="cta-panel landing-fade" style="--fade-delay: 60ms;">
          <div class="cta-panel__copy">
            <span class="landing-eyebrow landing-fade" style="--fade-delay: 100ms;">
              <span class="landing-eyebrow__dot"></span>
              CTA yang mendorong keputusan sekarang juga
            </span>
            <h2 class="landing-heading">
              Kalau Anda ingin kantin lebih ramai dan voucher lebih sering dipakai,
              aktifkan sekolah Anda sekarang.
            </h2>
            <p class="landing-subheading">
              Tidak perlu diskusi panjang. Pilih paket yang paling pas, kirim data admin,
              dan tim kami bantu sampai program promo siap dijalankan.
            </p>

            <div class="cta-panel__list">
              ${ctaChecklist.map((item) => `
                <div class="cta-panel__list-item">
                  <span><i class="fas fa-check"></i></span>
                  <p>${item}</p>
                </div>
              `).join('')}
            </div>
          </div>

          <div class="cta-panel__actions">
            <div class="cta-contact-card">
              <span class="cta-contact-card__label">Support onboarding</span>
              <strong>Semakin cepat aktif, semakin cepat transaksi bisa bertumbuh</strong>
              <p>Gunakan tombol aktivasi untuk langsung memilih paket dan mengirim data sekolah hari ini.</p>
            </div>

            <div class="cta-panel__buttons">
              <button data-plan="pro" class="cta-start-btn landing-btn landing-btn--primary">
                Aktifkan Sekolah Saya
              </button>
              <a href="#pricing" class="landing-btn landing-btn--secondary">
                Lihat Paket yang Paling Cocok
              </a>
            </div>

            <div class="cta-panel__meta">
              <div>
                <span>Email</span>
                <strong>support@gameumkm.com</strong>
              </div>
              <div>
                <span>Mode implementasi</span>
                <strong>Remote onboarding cepat</strong>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  `,

  initEvents: (callbacks = {}) => {
    document.querySelectorAll('.cta-start-btn').forEach((btn) => {
      btn.addEventListener('click', () => {
        if (callbacks.onSelectPlan) {
          callbacks.onSelectPlan(btn.dataset.plan || 'starter');
        }
      });
    });
  }
};

export default CTASection;
