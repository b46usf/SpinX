
/**
 * OTP Verification Handler
 * Handles OTP form display and verification
 * AuthApi will show Toast notifications for all responses
 */

import { authApi } from '../../auth/AuthApi.js';

// Get Toast functions from global (set by Toast.js)
const getToast = () => window.Toast || null;

export class OtpHandler {
  constructor(options = {}) {
    this.userId = options.userId || null;
    this.email = options.email || null;
    this.otpId = null;
    this.onSuccess = options.onSuccess || (() => {});
    this.onResend = options.onResend || (() => {});
  }

  async handleSubmit(e) {
    e.preventDefault();
    
    const Toast = getToast();
    const otpCode = document.getElementById('otp-code')?.value.trim();
    if (!otpCode) {
      if (Toast) Toast.error('Input Required', 'Masukkan kode OTP');
      return;
    }

    const loading = Toast ? Toast.loading('Memverifikasi OTP...') : null;

    try {
      // AuthApi will show toast for the response
      const result = await authApi.verifyOTP(this.otpId, otpCode, this.userId);
      
      if (loading) loading.close();
      
      if (result.success && result.verified) {
        if (Toast) Toast.success('Verifikasi Berhasil', 'Akun Anda sekarang aktif!');
        setTimeout(() => {
          this.onSuccess();
        }, 1500);
      } 
      // Failure toast already shown by AuthApi
    } catch (error) {
      if (loading) loading.close();
      console.error('OTP verification error:', error);
      if (Toast) Toast.error('Error', 'Gagal memverifikasi OTP. Silakan coba lagi.');
    }
  }

  async handleResend() {
    const Toast = getToast();
    const loading = Toast ? Toast.loading('Mengirim ulang OTP...') : null;
    
    try {
      // AuthApi will show toast for the response
      const result = await authApi.generateOTP(this.userId, this.email);
      
      if (loading) loading.close();
      
      if (result.success) {
        this.otpId = result.otpId;
        // Success toast already shown by AuthApi
        this.onResend();
      } 
      // Failure toast already shown by AuthApi
    } catch (error) {
      if (loading) loading.close();
      console.error('Resend OTP error:', error);
      if (Toast) Toast.error('Error', 'Gagal mengirim OTP. Silakan coba lagi.');
    }
  }

  initEvents(options = {}) {
    this.onSuccess = options.onSuccess || this.onSuccess;
    this.onResend = options.onResend || this.onResend;

    document.getElementById('otp-form')?.addEventListener('submit', (e) => this.handleSubmit(e));
    document.getElementById('resend-otp-btn')?.addEventListener('click', () => this.handleResend());
  }

  setData(userId, email) {
    this.userId = userId;
    this.email = email;
  }

  setOtpId(otpId) {
    this.otpId = otpId;
  }
}

// OTP Template
export const OtpTemplates = {
  otpSection: () => `
    <div id="otp-section" class="max-w-sm mx-auto p-5 bg-gray-800/90 backdrop-blur-xl rounded-2xl shadow-2xl border border-gray-700/50 animate-scale-in">
      <div class="text-center mb-4">
        <div class="w-14 h-14 mx-auto mb-3 rounded-2xl bg-gradient-to-br from-green-500 to-emerald-500 flex items-center justify-center shadow-lg">
          <i class="fas fa-shield-alt text-2xl text-white"></i>
        </div>
        <h2 class="text-lg font-bold text-white">Verifikasi OTP</h2>
        <p class="text-gray-400 text-xs mt-1">Kode dikirim ke Telegram Anda</p>
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
        <button 
          type="button" 
          id="resend-otp-btn"
          class="text-green-400 hover:text-green-300 font-medium text-sm transition-colors mt-1"
        >
          <i class="fas fa-redo mr-1"></i>Kirim Ulang
        </button>
      </div>
      
      <div class="text-center mt-4 pt-4 border-t border-gray-700/50">
        <button 
          type="button" 
          id="back-to-login"
          class="text-gray-500 hover:text-white text-xs transition-colors"
        >
          <i class="fas fa-arrow-left mr-1"></i>Kembali
        </button>
      </div>
    </div>
  `
};


