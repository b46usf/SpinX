/**
 * Footer Component
 * Compact footer aligned with the refreshed landing page style.
 */

const footerColumns = [
  {
    title: 'Navigasi',
    links: [
      { text: 'Beranda', href: '#home' },
      { text: 'Solusi', href: '#features' },
      { text: 'Paket', href: '#pricing' },
      { text: 'Testimoni', href: '#testimonials' }
    ]
  },
  {
    title: 'Aksi',
    links: [
      { text: 'Aktifkan Sekolah', href: '#cta' },
      { text: 'Pilih Paket', href: '#pricing' },
      { text: 'Lihat Testimoni', href: '#testimonials' },
      { text: 'Support', href: 'mailto:support@gameumkm.com' }
    ]
  }
];

const socialLinks = [
  { icon: 'fas fa-envelope', href: 'mailto:support@gameumkm.com', label: 'Email' },
  { icon: 'fas fa-arrow-trend-up', href: '#pricing', label: 'Pricing' },
  { icon: 'fas fa-headset', href: '#cta', label: 'Contact' }
];

export const Footer = {
  render: () => `
    <footer class="landing-footer">
      <div class="landing-shell">
        <div class="landing-footer__top">
          <div class="landing-footer__brand landing-fade" style="--fade-delay: 60ms;">
            <a href="#home" class="lp-brand lp-brand--footer">
              <span class="lp-brand__mark">
                <i class="fas fa-dharmachakra"></i>
              </span>
              <span class="lp-brand__copy">
                <strong>spinX Booster</strong>
                <small>Promo interaktif yang lebih tertata untuk kantin sekolah.</small>
              </span>
            </a>

            <p>
              spinX membantu sekolah menjalankan promo kantin yang lebih rapi,
              gampang dipahami siswa, dan tetap nyaman dipakai tim operasional sehari-hari.
            </p>

            <div class="landing-footer__social">
              ${socialLinks.map((item) => `
                <a href="${item.href}" aria-label="${item.label}">
                  <i class="${item.icon}"></i>
                </a>
              `).join('')}
            </div>
          </div>

          <div class="landing-footer__columns">
            ${footerColumns.map((column) => `
              <div class="landing-footer__column landing-fade" style="--fade-delay: ${120 + (column.title === 'Aksi' ? 60 : 0)}ms;">
                <h4>${column.title}</h4>
                <ul>
                  ${column.links.map((link) => `
                    <li><a href="${link.href}">${link.text}</a></li>
                  `).join('')}
                </ul>
              </div>
            `).join('')}
          </div>
        </div>

        <div class="landing-footer__bottom">
          <p>Copyright 2026 spinX Booster. Semua hak dilindungi.</p>
          <div class="landing-footer__bottom-links">
            <a href="#pricing">Paket</a>
            <a href="#cta">Kontak</a>
          </div>
        </div>
      </div>
    </footer>
  `
};

export default Footer;
