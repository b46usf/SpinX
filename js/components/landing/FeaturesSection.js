/**
 * Features Section Component
 * Highlights the operational benefits in a more compact layout.
 */

const featuresData = [
  {
    icon: 'fa-dharmachakra',
    tone: 'is-teal',
    metric: 'Attract',
    title: 'Lucky Wheel yang bikin siswa ingin mencoba',
    description: 'Tampilan promo terlihat modern, menarik perhatian, dan tetap terasa aman untuk konteks sekolah.'
  },
  {
    icon: 'fa-ticket',
    tone: 'is-amber',
    metric: 'Convert',
    title: 'Voucher langsung mendorong pembelian',
    description: 'Hadiah promo dibuat otomatis supaya siswa tidak berhenti di rasa penasaran, tetapi lanjut ke transaksi.'
  },
  {
    icon: 'fa-chart-column',
    tone: 'is-sky',
    metric: 'Measure',
    title: 'Dashboard singkat untuk membaca hasil',
    description: 'Lihat performa promo, penukaran voucher, dan jam ramai tanpa laporan panjang yang melelahkan.'
  },
  {
    icon: 'fa-users-gear',
    tone: 'is-mint',
    metric: 'Control',
    title: 'Operasional sekolah tetap tertib',
    description: 'Data siswa, role operator, dan kontrol akses tertata agar promo berjalan rapi tanpa bikin tim repot.'
  },
  {
    icon: 'fa-mobile-screen-button',
    tone: 'is-slate',
    metric: 'Responsive',
    title: 'Tetap nyaman dibuka di semua perangkat',
    description: 'Layout yang padat dan proporsional membuat pengambil keputusan tetap nyaman membaca dari layar kecil.'
  },
  {
    icon: 'fa-headset',
    tone: 'is-cyan',
    metric: 'Close',
    title: 'Onboarding jelas sampai siap live',
    description: 'Begitu sekolah siap lanjut, alur aktivasi dan bantuan teknis sudah tersedia tanpa langkah yang membingungkan.'
  }
];

const operationsData = [
  { title: 'Tarik perhatian', text: 'Promo tampil menonjol dan langsung dipahami siswa dalam sekali lihat.' },
  { title: 'Dorong transaksi', text: 'Voucher dan benefit diarahkan untuk membuat pembelian benar-benar terjadi.' },
  { title: 'Lanjutkan keputusan', text: 'Tim sekolah lebih cepat yakin karena hasil dan alurnya terlihat jelas.' }
];

export const FeaturesSection = {
  render: () => `
    <section id="features" class="landing-section landing-anchor" data-nav-section>
      <div class="landing-shell">
        <div class="landing-section-head landing-section-head--single">
          <div class="landing-fade" style="--fade-delay: 40ms;">
            <span class="landing-eyebrow landing-fade" style="--fade-delay: 80ms;">
              <span class="landing-eyebrow__dot"></span>
              Solusi yang membantu pengunjung cepat yakin
            </span>
            <h2 class="landing-heading">
              Semua komponen penting untuk mengubah minat siswa
              <span class="landing-heading__accent">menjadi transaksi di kantin</span>
            </h2>
          </div>
        </div>

        <div class="feature-grid">
          ${featuresData.map((feature, index) => `
            <article class="feature-card ${feature.tone} landing-fade" style="--fade-delay: ${160 + (index * 60)}ms;">
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
            <div class="operations-band__item landing-fade" style="--fade-delay: ${220 + (index * 70)}ms;">
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
