/**
 * Telegram Link Section Component
 * Handles Telegram verification flow
 */

export const TelegramLinkSection = {
  render: (extra) => `
    <div class="max-w-sm mx-auto p-5 bg-gray-800/90 backdrop-blur-xl rounded-2xl shadow-2xl border border-gray-700/50 animate-scale-in">
      <div class="text-center mb-4">
        <div class="w-14 h-14 mx-auto mb-3 rounded-2xl bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center shadow-lg">
          <i class="fab fa-telegram text-2xl text-white"></i>
        </div>
        <h2 class="text-lg font-bold text-white">Hubungkan Telegram</h2>
        <p class="text-gray-400 text-xs mt-1">Verifikasi akun Anda via Telegram</p>
      </div>
      <a 
        id="open-telegram"
        href="${extra.telegramLink}" 
        target="_blank"
        class="flex items-center justify-center gap-2 w-full py-3 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white font-semibold rounded-xl transition-all transform hover:scale-[1.02] active:scale-[0.98] shadow-lg text-sm"
      >
        <i class="fab fa-telegram"></i>
        <span>Buka Telegram</span>
      </a>
      <div id="telegram-status" class="mt-3 p-3 bg-gray-700/30 rounded-lg">
        <div class="flex items-center justify-center gap-2 text-xs text-gray-400">
          <span class="w-2 h-2 rounded-full bg-yellow-500 animate-pulse"></span>
          <span>Klik tombol di atas</span>
        </div>
      </div>  
      <button 
        id="refresh-telegram-status"
        class="w-full mt-2 py-2 bg-gray-700/50 hover:bg-gray-600/50 text-gray-400 rounded-lg transition-colors text-xs font-medium"
      >
        <i class="fas fa-sync-alt mr-1"></i>Periksa Status
      </button>
      <div class="text-center mt-3 pt-3 border-t border-gray-700/50">
        <button type="button" id="back-to-login" class="text-gray-500 hover:text-white text-xs transition-colors">
          <i class="fas fa-arrow-left mr-1"></i>Kembali
        </button>
      </div>
  `,
  
  initEvents: (callbacks = {}) => {
    document.getElementById('back-to-login')?.addEventListener('click', callbacks.onBack);
    refreshBtn?.addEventListener('click', callbacks.onRefresh);
    setTimeout(callbacks.onRefresh, 1000);
  },
  
  updateStatus: (status, message) => {
    const statusEl = document.getElementById('telegram-status');
    if (!statusEl) return;
    
    const statusConfig = {
      waiting: `<div class="flex items-center justify-center gap-2 text-xs text-gray-400">
        <span class="w-2 h-2 rounded-full bg-yellow-500 animate-pulse"></span>
        <span>${message || 'Klik tombol di atas'}</span>
      </div>`,
      success: `<div class="flex items-center justify-center gap-2 text-xs text-green-400">
        <i class="fas fa-check-circle"></i>
        <span>${message || 'Terkoneksi! Mengirim OTP...'}</span>
      </div>`,
      not_linked: `<div class="flex items-center justify-center gap-2 text-xs text-yellow-400">
        <span class="w-2 h-2 rounded-full bg-yellow-500 animate-pulse"></span>
        <span>${message || 'Belum terhubung. Klik START di Telegram'}</span>
      </div>`,
      error: `<div class="flex items-center justify-center gap-2 text-xs text-red-400">
        <i class="fas fa-exclamation-circle"></i>
        <span>${message || 'Gagal'}</span>
      </div>`
    };
    
    statusEl.innerHTML = statusConfig[status] || statusConfig.waiting;
  }
};

export default TelegramLinkSection;
