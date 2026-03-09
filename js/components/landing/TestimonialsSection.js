/**
 * Testimonials Section Component
 * Customer testimonials for landing page
 */

// Testimonial data - single source of truth
const testimonialsData = [
  {
    name: 'Bpk. Budi',
    role: 'Kantin SMPN 1',
    initials: 'B',
    gradient: 'from-indigo-500 to-purple-500',
    text: '"Sekarang kantin kami rame banget! Siswa-siswa pada excited sama Lucky Wheel-nya. Penjualan naik 30% dalam sebulan!"'
  },
  {
    name: 'Ibu Siti',
    role: 'Kantin SDN Jakarta',
    initials: 'S',
    gradient: 'from-pink-500 to-rose-500',
    text: '"Mudah banget setup-nya. Hanya butuh 5 menit langsung jadi. Tanya jawab sama admin juga responsif banget!"'
  },
  {
    name: 'Pak Agus',
    role: 'Kantin SMAN Bandung',
    initials: 'A',
    gradient: 'from-blue-500 to-cyan-500',
    text: '"Siswa-siswa jadi lebih semangat makan di kantin. Voucher-nya juga canggih, guru bisa monitoring easily."'
  }
];

export const TestimonialsSection = {
  render: () => {
    const testimonialsHTML = testimonialsData.map(t => `
      <div class="testimonial-card rounded-2xl p-6">
        <div class="flex items-center gap-1 mb-4">
          ${Array(5).fill('<i class="fas fa-star text-yellow-400"></i>').join('')}
        </div>
        <p class="text-gray-300 mb-6 text-sm">${t.text}</p>
        <div class="flex items-center gap-3">
          <div class="w-10 h-10 rounded-full bg-gradient-to-br ${t.gradient} flex items-center justify-center text-white font-bold">${t.initials}</div>
          <div>
            <div class="text-white font-medium text-sm">${t.name}</div>
            <div class="text-gray-500 text-xs">${t.role}</div>
          </div>
        </div>
      </div>
    `).join('');
    
    return `
      <section id="testimonials" class="section-padding bg-gray-900/50">
        <div class="container mx-auto px-4">
          <div class="text-center mb-16">
            <span class="inline-block px-4 py-1 bg-indigo-500/20 text-indigo-400 rounded-full text-sm font-medium mb-4">TESTIMONI</span>
            <h2 class="text-3xl sm:text-4xl font-bold text-white mb-4">Apa Kata Mereka?</h2>
            <p class="text-gray-400 max-w-2xl mx-auto">Kepuasan pelanggan adalah prioritas utama kami</p>
          </div>
          <div class="grid md:grid-cols-3 gap-6">
            ${testimonialsHTML}
          </div>
        </div>
      </section>
    `;
  }
};

export default TestimonialsSection;

