/**
 * Hero Section Component
 * Presents the product value proposition with a cleaner dashboard-style layout.
 */

const heroStats = [
  { value: '500+', label: 'Sekolah aktif' },
  { value: '50rb+', label: 'Siswa terlayani' },
  { value: '87%', label: 'Voucher terpakai' }
];

const heroSignals = [
  'Aktivasi cepat tanpa setup berlapis',
  'Voucher promo langsung siap dipakai',
  'Dashboard ringkas untuk tim sekolah'
];

export const HeroSection = {
  render: () => `
    <section id="home" class="landing-section landing-section--hero landing-anchor hero-section" data-nav-section>
      <div class="landing-shell hero-layout">
        <div class="hero-copy">
          <span class="landing-eyebrow">
            <span class="landing-eyebrow__dot"></span>
            Platform promo yang rapi untuk operasional kantin sekolah
          </span>

          <h1 class="landing-heading hero-title">
            Promo Lucky Wheel yang terlihat menarik,
            <span class="landing-heading__accent">tetap terasa profesional</span>
            saat dijalankan di sekolah.
          </h1>

          <p class="landing-subheading hero-description">
            spinX membantu tim sekolah mengelola promo interaktif dengan alur yang lebih singkat,
            tampilan lebih proporsional, dan monitoring yang mudah dipahami dari hari pertama.
          </p>

          <div class="hero-actions">
            <a href="#pricing" class="landing-btn landing-btn--primary">Lihat Paket</a>
            <a href="#features" class="landing-btn landing-btn--secondary">Pelajari Solusi</a>
          </div>

          <div class="hero-signals">
            ${heroSignals.map((signal) => `
              <div class="hero-signal">
                <span class="hero-signal__icon"><i class="fas fa-check"></i></span>
                <span>${signal}</span>
              </div>
            `).join('')}
          </div>

          <div class="hero-stats">
            ${heroStats.map((stat) => `
              <div class="hero-stat">
                <strong>${stat.value}</strong>
                <span>${stat.label}</span>
              </div>
            `).join('')}
          </div>
        </div>

        <div class="hero-visual">
          <div class="hero-panel">
            <div class="hero-panel__header">
              <div>
                <span class="hero-panel__label">Preview operasional</span>
                <h2>Dashboard promo harian</h2>
              </div>
              <span class="hero-panel__status">Live</span>
            </div>

            <div class="hero-panel__content">
              <div class="hero-wheel-card">
                <div class="hero-wheel-card__meta">
                  <span>Lucky Wheel aktif</span>
                  <strong>08:00 - 16:00</strong>
                </div>

                <div class="hero-wheel">
                  <div class="hero-wheel__pointer"></div>
                  <div class="hero-wheel__center">
                    <span>spinX</span>
                    <small>promo</small>
                  </div>
                </div>

                <div class="hero-wheel-card__steps">
                  <span>Scan</span>
                  <span>Spin</span>
                  <span>Redeem</span>
                </div>
              </div>

              <div class="hero-side-stack">
                <div class="hero-metric-card">
                  <span class="hero-metric-card__label">Redeem voucher</span>
                  <strong>87%</strong>
                  <small>Naik 18% dibanding minggu lalu</small>
                </div>

                <div class="hero-metric-card hero-metric-card--accent">
                  <span class="hero-metric-card__label">Antrian tetap lancar</span>
                  <strong>14 dtk</strong>
                  <small>Rata-rata proses redeem di kasir</small>
                </div>

                <div class="hero-activity-card">
                  <div class="hero-activity-card__head">
                    <span>Aktivitas terbaru</span>
                    <strong>Hari ini</strong>
                  </div>

                  <div class="hero-activity-card__list">
                    <div class="hero-activity-item">
                      <span class="hero-activity-item__badge">A1</span>
                      <div>
                        <strong>Voucher 20% berhasil dipakai</strong>
                        <small>Kantin SMPN 3 - 10:42 WIB</small>
                      </div>
                    </div>
                    <div class="hero-activity-item">
                      <span class="hero-activity-item__badge">B7</span>
                      <div>
                        <strong>Promo baru aktif untuk jam istirahat</strong>
                        <small>Otomatis berjalan - 09:55 WIB</small>
                      </div>
                    </div>
                    <div class="hero-activity-item">
                      <span class="hero-activity-item__badge">C4</span>
                      <div>
                        <strong>Dashboard siswa sinkron kembali</strong>
                        <small>Data siap dipantau bendahara</small>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  `
};

export default HeroSection;
