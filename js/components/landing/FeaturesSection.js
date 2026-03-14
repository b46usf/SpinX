/**
 * Features Section Component
 * Highlights the operational benefits in a more compact layout.
 */

const featuresData = [
  {
    icon: 'fa-dharmachakra',
    tone: 'is-teal',
    metric: 'Seru',
    title: 'Lucky Wheel yang langsung dipahami siswa',
    description: 'Tampilannya cukup menarik untuk mengundang coba, tapi tidak berlebihan untuk lingkungan sekolah.'
  },
  {
    icon: 'fa-ticket',
    tone: 'is-amber',
    metric: 'Praktis',
    title: 'Voucher keluar otomatis setelah siswa menang',
    description: 'Kasir tidak perlu mencatat manual karena hadiah langsung muncul dan bisa dipakai saat itu juga.'
  },
  {
    icon: 'fa-chart-column',
    tone: 'is-sky',
    metric: 'Jelas',
    title: 'Laporan harian yang mudah dibaca',
    description: 'Tim sekolah bisa melihat promo yang jalan, voucher yang terpakai, dan jam ramai tanpa membuka banyak menu.'
  },
  {
    icon: 'fa-users-gear',
    tone: 'is-mint',
    metric: 'Tertib',
    title: 'Akses operator lebih mudah diatur',
    description: 'Role dan data pengguna ditata supaya operasional tetap aman saat dipakai beberapa orang.'
  },
  {
    icon: 'fa-mobile-screen-button',
    tone: 'is-slate',
    metric: 'Nyaman',
    title: 'Tetap enak dibuka dari HP',
    description: 'Layout dibuat ringkas jadi kepala sekolah, admin, atau operator tetap nyaman membaca dari layar kecil.'
  },
  {
    icon: 'fa-headset',
    tone: 'is-cyan',
    metric: 'Dibantu',
    title: 'Onboarding tidak dilepas begitu saja',
    description: 'Kalau sekolah sudah siap, tim Anda tinggal lanjut karena bantuan aktivasi sudah ada alurnya.'
  }
];

const operationsData = [
  { title: 'Dilihat siswa', text: 'Promo langsung terlihat dan cara mainnya cepat dipahami.' },
  { title: 'Dipakai di kasir', text: 'Hadiah tidak berhenti di tampilan, tapi benar-benar bisa dipakai saat transaksi.' },
  { title: 'Mudah dijelaskan', text: 'Tim sekolah lebih enak menjelaskan manfaatnya saat minta persetujuan.' }
];

export const FeaturesSection = {
  render: () => `
    <section id="features" class="landing-section landing-anchor" data-nav-section>
      <div class="landing-shell">
        <div class="landing-section-head landing-section-head--single">
          <div class="landing-fade" style="--fade-delay: 40ms;">
            <span class="landing-eyebrow landing-fade" style="--fade-delay: 80ms;">
              <span class="landing-eyebrow__dot"></span>
              Alur promo yang enak dilihat dan gampang dipahami
            </span>
            <h2 class="landing-heading">
              Semua komponen penting untuk menjalankan promo kantin
              <span class="landing-heading__accent">tanpa bikin operasional jadi ribet</span>
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
