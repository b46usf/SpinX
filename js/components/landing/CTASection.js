/**
 * CTA Section Component
 * Closing section with a clearer action path.
 */

const ctaChecklist = [
  'Pilih paket yang paling cocok untuk sekolah',
  'Isi data admin sekali, tidak perlu bolak-balik',
  'Tim kami bantu sampai program siap dipakai'
];

export const CTASection = {
  render: () => `
    <section id="cta" class="landing-section landing-section--tight landing-anchor" data-nav-section>
      <div class="landing-shell">
        <div class="cta-panel landing-fade" style="--fade-delay: 60ms;">
          <div class="cta-panel__copy">
            <span class="landing-eyebrow landing-fade" style="--fade-delay: 100ms;">
              <span class="landing-eyebrow__dot"></span>
              Kalau sudah cocok, tinggal lanjut aktivasi
            </span>
            <h2 class="landing-heading">
              Kalau sekolah Anda merasa ini cocok,
              lanjutkan pendaftaran sekarang saja.
            </h2>
            <p class="landing-subheading">
              Formnya singkat. Setelah data masuk, tim kami bantu proses berikutnya
              sampai promo siap dipakai.
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
              <strong>Kalau pertanyaannya sudah terjawab, langkah berikutnya tinggal isi data sekolah</strong>
              <p>Kami akan bantu cek data admin dan lanjutkan proses aktivasi dari sana.</p>
            </div>

            <div class="cta-panel__buttons">
              <button data-plan="pro" class="cta-start-btn landing-btn landing-btn--primary">
                Lanjutkan Aktivasi
              </button>
              <a href="#pricing" class="landing-btn landing-btn--secondary">
                Lihat Paket Lagi
              </a>
            </div>

            <div class="cta-panel__meta">
              <div>
                <span>Email</span>
                <strong>support@gameumkm.com</strong>
              </div>
              <div>
                <span>Mode implementasi</span>
                <strong>Remote onboarding</strong>
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
