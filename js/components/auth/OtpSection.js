/**
 * OTP Section Component
 * Handles OTP verification flow
 */

export const OtpSection = {
  render: () => `
    <div class="max-w-sm mx-auto p-5 bg-gray-800/90 backdrop-blur-xl rounded-2xl shadow-2xl border border-gray-700/50 animate-scale-in">
      <div class="text-center mb-4">
        <div class="w-14 h-14 mx-auto mb-3 rounded-2xl bg-gradient-to-br from-green-500 to-emerald-500 flex items-center justify-center shadow-lg">
          <i class="fas fa-shield-alt text-2xl text-white"></i>
        </div>
        <h2 class="text-lg font-bold text-white">Verifikasi OTP</h2>
        <p class="text-gray-400 text-xs mt-1">Masukkan kode dari Telegram</p>
      </div>
      <form id="otp-form" class="space-y-3">
        <div>
          <input 
            type="text" 
            id="otp-code" 
            maxlength="6"
            class="w-full px-4 py-3 bg-gray-700/50 border border-gray-600 rounded-xl text-white text-center text-2xl tracking-[0.5em] focus:border-green-500 focus:ring-2 focus:ring-green-500/20 font-mono"
            placeholder="------"
            required
            autocomplete="one-time-code"
          />
        </div>
        <button 
          type="submit" 
          id="verify-otp-btn"
          class="w-full py-3 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white font-semibold rounded-xl transition-all transform hover:scale-[1.02] active:scale-[0.98] shadow-lg text-sm"
        >
          <i class="fas fa-check-circle mr-2"></i>Verifikasi
        </button>
      </form>
      <div class="text-center mt-4">
        <p class="text-gray-500 text-xs">Tidak menerima kode?</p>
        <button type="button" id="resend-otp-btn" class="text-green-400 hover:text-green-300 font-medium text-sm transition-colors mt-1">
          <i class="fas fa-redo mr-1"></i>Kirim Ulang
        </button>
      </div>
      <div class="text-center mt-4 pt-4 border-t border-gray-700/50">
        <button type="button" id="back-to-login" class="text-gray-500 hover:text-white text-xs transition-colors">
          <i class="fas fa-arrow-left mr-1"></i>Kembali
        </button>
      </div>
  `,
  
  initEvents: (callbacks = {}) => {
    document.getElementById('back-to-login')?.addEventListener('click', callbacks.onBack);
    document.getElementById('resend-otp-btn')?.addEventListener('click', callbacks.onResend);
    document.getElementById('otp-form')?.addEventListener('submit', callbacks.onSubmit);
  }
};

export default OtpSection;
