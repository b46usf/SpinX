/**
 * Features Section Component
 * Highlights the operational benefits in a more compact layout.
 */

const featuresData = [
  {
    icon: 'fa-dharmachakra',
    tone: 'is-teal',
    metric: 'Interaktif',
    title: 'Lucky Wheel yang terasa modern',
    description: 'Visual promo lebih rapi, cukup atraktif untuk siswa, dan tetap cocok untuk lingkungan sekolah.'
  },
  {
    icon: 'fa-ticket',
    tone: 'is-amber',
    metric: 'Otomatis',
    title: 'Voucher langsung siap dipakai',
    description: 'Hadiah promo dibuat otomatis sehingga kasir tidak perlu mencatat manual saat jam sibuk.'
  },
  {
    icon: 'fa-chart-column',
    tone: 'is-sky',
    metric: 'Terukur',
    title: 'Dashboard ringkas untuk keputusan cepat',
    description: 'Pantau performa promo, jumlah penukaran, dan waktu ramai dari tampilan yang mudah dipahami.'
  },
  {
    icon: 'fa-users-gear',
    tone: 'is-mint',
    metric: 'Sinkron',
    title: 'Manajemen siswa lebih tertib',
    description: 'Data siswa, role operator, dan kontrol akses dibuat lebih jelas agar operasional tetap aman.'
  },
  {
    icon: 'fa-mobile-screen-button',
    tone: 'is-slate',
    metric: 'Responsif',
    title: 'Nyaman di HP, tablet, dan desktop',
    description: 'Setiap komponen dibuat lebih padat dan proporsional supaya tetap nyaman dibuka di perangkat kecil.'
  },
  {
    icon: 'fa-headset',
    tone: 'is-cyan',
    metric: 'Didampingi',
    title: 'Onboarding dan support lebih jelas',
    description: 'Tim sekolah mendapatkan alur implementasi yang singkat dengan informasi bantuan yang konsisten.'
  }
];

const operationsData = [
  { title: 'Aktivasi cepat', text: 'Mulai dari paket, isi data sekolah, lalu lanjut onboarding.' },
  { title: 'Kontrol promo', text: 'Atur jam aktif dan benefit promo sesuai kebutuhan kantin.' },
  { title: 'Pantau hasil', text: 'Lihat performa harian tanpa dashboard yang berlebihan.' }
];

export const FeaturesSection = {
  render: () => `
    <section id="features" class="landing-section landing-anchor" data-nav-section>
      <div class="landing-shell">
        <div class="landing-section-head">
          <div>
            <span class="landing-eyebrow">
              <span class="landing-eyebrow__dot"></span>
              Solusi yang lebih compact dan mudah dipakai
            </span>
            <h2 class="landing-heading">
              Semua komponen penting untuk promo kantin
              <span class="landing-heading__accent">diringkas jadi lebih jelas</span>
            </h2>
          </div>

          <p class="landing-subheading landing-section-head__copy">
            Fokus desain baru ini ada pada ritme layout, kepadatan informasi, dan alur yang langsung
            mengarahkan pengguna ke tindakan yang paling penting.
          </p>
        </div>

        <div class="feature-grid">
          ${featuresData.map((feature) => `
            <article class="feature-card ${feature.tone}">
              <div class="feature-card__top">
                <span class="feature-card__icon">
                  <i class="fas ${feature.icon}"></i>
                </span>
                <span class="feature-card__metric">${feature.metric}</span>
              </div>
              <h3>${feature.title}</h3>
              <p>${feature.description}</p>
            </article>
          `).join('')}
        </div>

        <div class="operations-band">
          ${operationsData.map((item, index) => `
            <div class="operations-band__item">
              <span class="operations-band__index">0${index + 1}</span>
              <div>
                <strong>${item.title}</strong>
                <p>${item.text}</p>
              </div>
            </div>
          `).join('')}
        </div>
      </div>
    </section>
  `
};

export default FeaturesSection;
