/**
 * Footer Component
 * Footer for landing page
 */

// Footer links data - single source of truth
const footerLinks = {
  products: [
    { text: 'Fitur', href: '#features' },
    { text: 'Harga', href: '#pricing' },
    { text: 'Demo', href: '#' },
    { text: 'API', href: '#' }
  ],
  company: [
    { text: 'Tentang Kami', href: '#' },
    { text: 'Blog', href: '#' },
    { text: 'Karir', href: '#' },
    { text: 'Kontak', href: '#' }
  ],
  social: [
    { icon: 'fab fa-instagram', href: '#' },
    { icon: 'fab fa-telegram', href: '#' },
    { icon: 'fab fa-whatsapp', href: '#' }
  ]
};

export const Footer = {
  render: () => {
    const productsLinks = footerLinks.products.map(l => 
      `<li><a href="${l.href}" class="text-gray-400 hover:text-white text-sm transition-colors">${l.text}</a></li>`
    ).join('');
    
    const companyLinks = footerLinks.company.map(l => 
      `<li><a href="${l.href}" class="text-gray-400 hover:text-white text-sm transition-colors">${l.text}</a></li>`
    ).join('');
    
    const socialLinks = footerLinks.social.map(s => 
      `<a href="${s.href}" class="w-10 h-10 rounded-lg bg-gray-800 flex items-center justify-center text-gray-400 hover:text-white hover:bg-indigo-600 transition-all"><i class="${s.icon}"></i></a>`
    ).join('');
    
    return `
      <footer class="bg-gray-900/80 border-t border-gray-800">
        <div class="container mx-auto px-4 py-12">
          <div class="grid md:grid-cols-4 gap-8">
            <div class="md:col-span-2">
              <div class="flex items-center gap-3 mb-4">
                <div class="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-pink-500 flex items-center justify-center">
                  <i class="fas fa-dharmachakra text-white text-lg"></i>
                </div>
                <span class="font-bold text-xl text-white">spin<span class="text-indigo-400">X</span></span>
              </div>
              <p class="text-gray-400 text-sm mb-4 max-w-sm">Lucky Wheel promo platform untuk kantin sekolah. Tingkatkan penjualan dan engage siswa dengan cara yang fun!</p>
              <div class="flex gap-4">
                ${socialLinks}
              </div>
            </div>
            <div>
              <h4 class="text-white font-semibold mb-4">Produk</h4>
              <ul class="space-y-2">
                ${productsLinks}
              </ul>
            </div>
            <div>
              <h4 class="text-white font-semibold mb-4">Perusahaan</h4>
              <ul class="space-y-2">
                ${companyLinks}
              </ul>
            </div>
          </div>
          <div class="border-t border-gray-800 mt-8 pt-8 flex flex-col sm:flex-row justify-between items-center gap-4">
            <p class="text-gray-500 text-sm">© 2024 spinX. All rights reserved.</p>
            <div class="flex gap-4">
              <a href="#" class="text-gray-500 hover:text-white text-sm transition-colors">Privacy Policy</a>
              <a href="#" class="text-gray-500 hover:text-white text-sm transition-colors">Terms of Service</a>
            </div>
          </div>
        </div>
      </footer>
    `;
  }
};

export default Footer;

