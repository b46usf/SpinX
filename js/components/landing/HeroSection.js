/**
 * Hero Section Component
 * Presents the product value proposition with a cleaner dashboard-style layout.
 */

const heroStats = [
  { value: '500+', label: 'Sekolah aktif' },
  { value: '50rb+', label: 'Siswa terjangkau' },
  { value: '87%', label: 'Voucher digunakan' }
];

const heroSignals = [
  'Siswa cepat paham cara ikut promonya',
  'Voucher bisa langsung dipakai di kasir',
  'Tim sekolah bisa memantau hasil tanpa ribet'
];

export const HeroSection = {
  render: () => `
    <section id="home" class="landing-section landing-section--hero landing-anchor hero-section" data-nav-section>
      <div class="landing-shell hero-layout">
        <div class="hero-copy landing-fade" style="--fade-delay: 40ms;">
          <span class="landing-eyebrow landing-fade" style="--fade-delay: 80ms;">
            <span class="landing-eyebrow__dot"></span>
            Cocok untuk promosi kantin sekolah yang ingin lebih rapi
          </span>

          <h1 class="landing-heading hero-title landing-fade" style="--fade-delay: 120ms;">
            Lucky Wheel yang bikin siswa tertarik,
            tapi tetap
            <span class="landing-heading__accent">mudah dijalankan tim sekolah</span>.
          </h1>

          <p class="landing-subheading hero-description landing-fade" style="--fade-delay: 180ms;">
            spinX membantu sekolah menjalankan promo Lucky Wheel dengan tampilan yang rapi,
            alur yang mudah dipahami siswa, dan laporan yang enak dibaca tim sekolah.
          </p>

          <div class="hero-actions landing-fade" style="--fade-delay: 220ms;">
            <a href="#pricing" class="landing-btn landing-btn--primary">Lihat Paket</a>
            <a href="#features" class="landing-btn landing-btn--secondary">Lihat Cara Kerja</a>
          </div>

          <div class="hero-stats">
            ${heroStats.map((stat, index) => `
              <div class="hero-stat landing-fade" style="--fade-delay: ${420 + (index * 70)}ms;">
                <strong>${stat.value}</strong>
                <span>${stat.label}</span>
              </div>
            `).join('')}
          </div>
        </div>

        <div class="hero-visual landing-fade" style="--fade-delay: 160ms;">
          <div class="hero-panel">
            <div class="hero-panel__header">
              <div>
                <span class="hero-panel__label">Preview Flow</span>
                <h2>Promo Harian</h2>
              </div>
              <span class="hero-panel__status">Live</span>
            </div>

            <div class="hero-panel__content">
              <div class="hero-primary-stack">
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

                <div class="hero-signals">
                  ${heroSignals.map((signal, index) => `
                    <div class="hero-signal landing-fade" style="--fade-delay: ${280 + (index * 60)}ms;">
                      <span class="hero-signal__icon"><i class="fas fa-check"></i></span>
                      <span>${signal}</span>
                    </div>
                  `).join('')}
                </div>
              </div>

              <div class="hero-side-stack">
                <div class="hero-metric-card">
                  <span class="hero-metric-card__label">Redeem voucher</span>
                  <strong>87%</strong>
                  <small>Pakai siswa hari ini</small>
                </div>

                <div class="hero-metric-card hero-metric-card--accent">
                  <span class="hero-metric-card__label">Waktu redeem rata-rata</span>
                  <strong>14s</strong>
                  <small>Saat jam istirahat</small>
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
