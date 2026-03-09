/**
 * Register Modal Component
 * Registration modal for landing page
 */

export const RegisterModal = {
  render: (planName = 'Starter - Gratis') => `
    <div id="register-modal" class="fixed inset-0 z-50 hidden">
      <div class="absolute inset-0 bg-black/70 backdrop-blur-sm" onclick="window.LandingPage.closeRegisterModal()"></div>
      <div class="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-md p-4">
        <div class="bg-gray-800 border border-gray-700 rounded-2xl p-6 shadow-2xl animate-scale-in">
          <div class="flex justify-between items-center mb-6">
            <h3 class="text-xl font-bold text-white">Daftar Sekolah</h3>
            <button onclick="window.LandingPage.closeRegisterModal()" class="text-gray-400 hover:text-white"><i class="fas fa-times"></i></button>
          </div>
          <form id="register-form" class="space-y-4">
            <div>
              <label class="block text-gray-400 text-sm mb-2">Nama Sekolah *</label>
              <input type="text" id="school-name" required class="w-full px-4 py-3 bg-gray-700/50 border border-gray-600 rounded-xl text-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20" placeholder="SMA Negeri 1 Jakarta">
            </div>
            <div>
              <label class="block text-gray-400 text-sm mb-2">Email Admin *</label>
              <input type="email" id="school-email" required class="w-full px-4 py-3 bg-gray-700/50 border border-gray-600 rounded-xl text-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20" placeholder="admin@sekolah.sch.id">
            </div>
            <div>
              <label class="block text-gray-400 text-sm mb-2">No. WhatsApp *</label>
              <input type="tel" id="school-phone" required class="w-full px-4 py-3 bg-gray-700/50 border border-gray-600 rounded-xl text-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20" placeholder="081234567890">
            </div>
            <div>
              <label class="block text-gray-400 text-sm mb-2">Paket Yang Dipilih</label>
              <div id="selected-plan-badge" class="inline-block px-3 py-1 bg-indigo-500/20 text-indigo-400 rounded-full text-sm font-medium">${planName}</div>
              <input type="hidden" id="selected-plan" value="starter">
            </div>
            <button type="submit" class="w-full py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-bold rounded-xl shadow-lg hover:shadow-indigo-500/50 transition-all">
              <i class="fas fa-paper-plane mr-2"></i>Daftar Sekarang
            </button>
          </form>
        </div>
      </div>
    </div>
  `,
  
  initEvents: (callbacks = {}) => {
    const form = document.getElementById('register-form');
    if (form) {
      form.addEventListener('submit', async (e) => {
        e.preventDefault();
        const data = {
          action: 'createschool',
          schoolName: document.getElementById('school-name').value,
          email: document.getElementById('school-email').value,
          noWa: document.getElementById('school-phone').value,
          plan: document.getElementById('selected-plan').value
        };
        try {
          const btn = e.target.querySelector('button[type="submit"]');
          btn.disabled = true;
          btn.innerHTML = '<i class="fas fa-spinner fa-spin mr-2"></i>Mendaftarkan...';
          const response = await fetch('/api/proxy', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) });
          const result = await response.json();
          if (result.success) {
            if (callbacks.onSuccess) callbacks.onSuccess('Berhasil!', 'Pendaftaran berhasil. Silakan cek email untuk aktivasi.');
            window.LandingPage.closeRegisterModal();
            form.reset();
          } else {
            if (callbacks.onError) callbacks.onError('Gagal', result.message || 'Terjadi kesalahan');
          }
        } catch (error) {
          if (callbacks.onError) callbacks.onError('Error', 'Koneksi bermasalah. Silakan coba lagi.');
        } finally {
          btn.disabled = false;
          btn.innerHTML = '<i class="fas fa-paper-plane mr-2"></i>Daftar Sekarang';
        }
      });
    }
  }
};

export default RegisterModal;

