/**
 * CTA Section Component
 * Closing section with a clearer action path.
 */

const ctaChecklist = [
  'Pilih paket sesuai kapasitas sekolah',
  'Isi data admin sekolah dalam satu langkah',
  'Lanjut onboarding tanpa alur yang memanjang'
];

export const CTASection = {
  render: () => `
    <section id="cta" class="landing-section landing-section--tight landing-anchor" data-nav-section>
      <div class="landing-shell">
        <div class="cta-panel">
          <div class="cta-panel__copy">
            <span class="landing-eyebrow">
              <span class="landing-eyebrow__dot"></span>
              Siap dipakai tanpa proses yang rumit
            </span>
            <h2 class="landing-heading">
              Butuh landing flow yang lebih rapi untuk mulai aktivasi sekolah?
            </h2>
            <p class="landing-subheading">
              Mulai dari paket yang paling sesuai, lalu tim sekolah bisa langsung masuk ke proses
              pendaftaran dan pendampingan tanpa kebingungan.
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
              <strong>Respon lebih cepat di jam kerja sekolah</strong>
              <p>Gunakan tombol aktivasi untuk langsung memilih paket dan mengirim data sekolah.</p>
            </div>

            <div class="cta-panel__buttons">
              <button data-plan="pro" class="cta-start-btn landing-btn landing-btn--primary">
                Ajukan Aktivasi
              </button>
              <a href="#pricing" class="landing-btn landing-btn--secondary">
                Bandingkan Paket
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
