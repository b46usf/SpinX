/**
 * OTP Verification Handler
 * Handles OTP form display and verification
 */

import { authApi } from '../../auth/AuthApi.js';
import { ErrorHandler } from '../utils/ErrorHandler.js';

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
      this.showError('Masukkan kode OTP');
      return;
    }

    this.showLoading('Memverifikasi OTP...');

    try {
      const result = await authApi.verifyOTP(this.otpId, otpCode, this.userId);
      
      if (result.success && result.verified) {
        this.showSuccess('Verifikasi berhasil! Mengarahkan ke login...');
        setTimeout(() => {
          this.onSuccess();
        }, 1500);
      } else {
        this.showError(result.message || 'Kode OTP tidak valid');
      }
    } catch (error) {
      console.error('OTP verification error:', error);
      this.showError('Gagal memverifikasi OTP. Silakan coba lagi.');
    }
  }

  async handleResend() {
    this.showLoading('Mengirim ulang OTP...');
    
    try {
      const result = await authApi.generateOTP(this.userId, this.email);
      
      if (result.success) {
        this.otpId = result.otpId;
        this.showSuccess('OTP telah dikirim ulang ke Telegram Anda');
        this.onResend();
      } else if (result.error === 'TELEGRAM_NOT_LINKED') {
        this.showError('Telegram belum terhubung. Silakan hubungkan Telegram terlebih dahulu.');
        // Optionally redirect to Telegram link
        if (result.telegramLink) {
          setTimeout(() => {
            window.open(result.telegramLink, '_blank');
          }, 2000);
        }
      } else {
        this.showError(result.message || 'Gagal mengirim OTP');
      }
    } catch (error) {
      console.error('Resend OTP error:', error);
      this.showError('Gagal mengirim OTP. Silakan coba lagi.');
    }
  }

  showError(message) {
    const errorEl = document.getElementById('otp-error');
    if (errorEl) {
      errorEl.textContent = message;
      errorEl.classList.remove('hidden');
    }
    this.hideLoading();
  }

  showSuccess(message) {
    const errorEl = document.getElementById('otp-error');
    if (errorEl) {
      errorEl.textContent = message;
      errorEl.className = 'mt-2 p-2 rounded text-sm bg-green-500/20 text-green-400';
      errorEl.classList.remove('hidden');
    }
  }

  hideError() {
    const errorEl = document.getElementById('otp-error');
    if (errorEl) {
      errorEl.textContent = '';
      errorEl.classList.add('hidden');
    }
  }

  showLoading(message) {
    const btn = document.getElementById('verify-otp-btn');
    const loadingEl = document.getElementById('otp-loading');
    if (btn) btn.disabled = true;
    if (loadingEl) {
      loadingEl.textContent = message;
      loadingEl.classList.remove('hidden');
    }
  }

  hideLoading() {
    const btn = document.getElementById('verify-otp-btn');
    const loadingEl = document.getElementById('otp-loading');
    if (btn) btn.disabled = false;
    if (loadingEl) loadingEl.classList.add('hidden');
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
    <div id="otp-section" class="max-w-md mx-auto p-6 bg-gray-800 rounded-lg shadow-lg">
      <h2 class="text-2xl font-bold text-center mb-4 text-white">Verifikasi OTP</h2>
      <p class="text-gray-400 text-center mb-6">
        Kami telah mengirim kode OTP ke Telegram Anda.<br>
        Silakan masukkan kode tersebut di bawah.
      </p>
      
      <form id="otp-form" class="space-y-4">
        <div>
          <label for="otp-code" class="block text-sm font-medium text-gray-300 mb-1">
            Kode OTP
          </label>
          <input 
            type="text" 
            id="otp-code" 
            maxlength="6"
            class="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white text-center text-2xl tracking-widest"
            placeholder="------"
            required
          />
        </div>
        
        <div id="otp-error" class="hidden mt-2 p-2 rounded text-sm bg-red-500/20 text-red-400"></div>
        <div id="otp-loading" class="hidden mt-2 p-2 rounded text-sm bg-blue-500/20 text-blue-400"></div>
        
        <button 
          type="submit" 
          id="verify-otp-btn"
          class="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-colors"
        >
          Verifikasi
        </button>
        
        <div class="text-center">
          <button 
            type="button" 
            id="resend-otp-btn"
            class="text-blue-400 hover:text-blue-300 text-sm"
          >
            Kirim ulang OTP
          </button>
        </div>
        
        <div class="text-center mt-4">
          <button 
            type="button" 
            id="back-to-login"
            class="text-gray-400 hover:text-white text-sm"
          >
            ← Kembali ke Login
          </button>
        </div>
      </form>
    </div>
  `
};

