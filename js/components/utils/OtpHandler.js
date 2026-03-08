/**
 * OTP Verification Handler
 * Handles OTP form display and verification
 * Uses Toast for notifications
 */

import { authApi } from '../../auth/AuthApi.js';
import { showSuccess, showError, showLoading, closeLoading } from './Toast.js';

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
    
    const otpCode = document.getElementById('otp-code')?.value.trim();
    if (!otpCode) {
      await showError('Input Required', 'Masukkan kode OTP');
      return;
    }

    const loading = await showLoading('Memverifikasi OTP...');

    try {
      const result = await authApi.verifyOTP(this.otpId, otpCode, this.userId);
      
      closeLoading();
      
      if (result.success && result.verified) {
        await showSuccess('Verifikasi Berhasil', 'Akun Anda sekarang aktif!');
        setTimeout(() => {
          this.onSuccess();
        }, 1500);
      } else {
        await showError('Verifikasi Gagal', result.message || 'Kode OTP tidak valid');
      }
    } catch (error) {
      closeLoading();
      console.error('OTP verification error:', error);
      await showError('Error', 'Gagal memverifikasi OTP. Silakan coba lagi.');
    }
  }

  async handleResend() {
    const loading = await showLoading('Mengirim ulang OTP...');
    
    try {
      const result = await authApi.generateOTP(this.userId, this.email);
      
      closeLoading();
      
      if (result.success) {
        this.otpId = result.otpId;
        await showSuccess('OTP Terkirim', 'Kode OTP telah dikirim ulang ke Telegram Anda');
        this.onResend();
      } else if (result.error === 'TELEGRAM_NOT_LINKED') {
        await showError('Telegram Belum Terhubung', 'Silakan hubungkan Telegram terlebih dahulu');
        // Optionally redirect to Telegram link
        if (result.telegramLink) {
          setTimeout(() => {
            window.open(result.telegramLink, '_blank');
          }, 2000);
        }
      } else {
        await showError('Gagal Mengirim OTP', result.message || 'Terjadi kesalahan');
      }
    } catch (error) {
      closeLoading();
      console.error('Resend OTP error:', error);
      await showError('Error', 'Gagal mengirim OTP. Silakan coba lagi.');
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
    <div id="otp-section" class="max-w-md mx-auto p-6 bg-gray-800 rounded-lg shadow-lg animate-scale-in">
      <div class="text-center mb-6">
        <div class="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center">
          <i class="fas fa-shield-alt text-2xl text-white"></i>
        </div>
        <h2 class="text-2xl font-bold text-white mb-2">Verifikasi OTP</h2>
        <p class="text-gray-400 text-sm">
          Kami telah mengirim kode OTP ke Telegram Anda.<br>
          Silakan masukkan kode tersebut di bawah.
        </p>
      </div>
      
      <form id="otp-form" class="space-y-4">
        <div>
          <label for="otp-code" class="block text-sm font-medium text-gray-300 mb-2">
            <i class="fas fa-lock mr-2"></i>Kode OTP
          </label>
          <input 
            type="text" 
            id="otp-code" 
            maxlength="6"
            class="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white text-center text-2xl tracking-widest focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
            placeholder="------"
            required
            autocomplete="one-time-code"
          />
        </div>
        
        <button 
          type="submit" 
          id="verify-otp-btn"
          class="w-full py-3 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white font-semibold rounded-lg transition-all transform hover:scale-[1.02] active:scale-[0.98]"
        >
          <i class="fas fa-check-circle mr-2"></i>Verifikasi
        </button>
        
        <div class="text-center">
          <p class="text-gray-400 text-sm mb-2">Tidak menerima kode OTP?</p>
          <button 
            type="button" 
            id="resend-otp-btn"
            class="text-blue-400 hover:text-blue-300 font-medium transition-colors"
          >
            <i class="fas fa-redo mr-1"></i>Kirim ulang OTP
          </button>
        </div>
        
        <div class="text-center mt-4 pt-4 border-t border-gray-700">
          <button 
            type="button" 
            id="back-to-login"
            class="text-gray-400 hover:text-white text-sm transition-colors"
          >
            <i class="fas fa-arrow-left mr-1"></i>Kembali ke Login
          </button>
        </div>
      </form>
    </div>
  `
};

