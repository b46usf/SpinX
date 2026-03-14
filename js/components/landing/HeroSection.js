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
  'Siswa langsung tertarik mencoba promo',
  'Voucher mendorong pembelian berulang',
  'Tim sekolah bisa membaca hasil lebih cepat'
];

export const HeroSection = {
  render: () => `
    <section id="home" class="landing-section landing-section--hero landing-anchor hero-section" data-nav-section>
      <div class="landing-shell hero-layout">
        <div class="hero-copy landing-fade" style="--fade-delay: 40ms;">
          <span class="landing-eyebrow landing-fade" style="--fade-delay: 80ms;">
            <span class="landing-eyebrow__dot"></span>
            Dirancang untuk menaikkan transaksi kantin sekolah
          </span>

          <h1 class="landing-heading hero-title landing-fade" style="--fade-delay: 120ms;">
            Ubah rasa penasaran siswa jadi transaksi nyata
            lewat Lucky Wheel yang
            <span class="landing-heading__accent">membuat kantin lebih ramai</span>.
          </h1>

          <p class="landing-subheading hero-description landing-fade" style="--fade-delay: 180ms;">
            spinX membuat promo sekolah terasa modern dan langsung menghasilkan aksi:
            siswa tertarik bermain, voucher memicu pembelian, dan tim sekolah bisa melihat
            dampaknya dari dashboard yang ringkas sejak hari pertama.
          </p>

          <div class="hero-actions landing-fade" style="--fade-delay: 220ms;">
            <a href="#pricing" class="landing-btn landing-btn--primary">Aktifkan Sekarang</a>
            <a href="#features" class="landing-btn landing-btn--secondary">Lihat Alur Demo</a>
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
                <span class="hero-panel__label">Preview closing flow</span>
                <h2>Dashboard promo yang mendorong aksi</h2>
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
