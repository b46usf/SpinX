/**
 * Mitra Dashboard Module
 * Modular dashboard logic for mitra/partner role
 * Clean, DRY, best practice
 */

import { authGuard } from '../core/AuthGuard.js';
import { themeManager } from '../core/ThemeManager.js';
import { authApi } from '../auth/AuthApi.js';

class MitraDashboard {
  constructor() {
    this.stats = {
      voucherRedeemed: 0,
      totalDiscount: 0,
      customerCount: 0
    };
  }

  /**
   * Initialize mitra dashboard
   */
  init() {
    // Auth protection
    if (!authGuard.init('mitra', {
      avatarId: 'user-avatar',
      nameId: 'user-name',
      welcomeId: 'welcome-name',
      logoutId: 'logout-btn'
    })) {
      return;
    }

    // Initialize theme
    themeManager.init();

    // Load store info
    this.loadStoreInfo();

    // Setup redeem functionality
    this.setupRedeem();

    // Load stats
    this.loadStats();

    // Load history
    this.loadRedeemHistory();
  }

  /**
   * Load store info from user profile
   */
  loadStoreInfo() {
    const user = authGuard.getUser();
    const profile = user?.profile;

    const elements = {
      'store-name': profile?.namaMitra || '-',
      'store-category': profile?.kategori || '-',
      'store-address': profile?.alamat || '-'
    };

    Object.entries(elements).forEach(([id, value]) => {
      const el = document.getElementById(id);
      if (el) el.textContent = value;
    });
  }

  /**
   * Setup redeem functionality
   */
  setupRedeem() {
    const form = document.getElementById('otp-form');
    if (form) {
      form.addEventListener('submit', (e) => {
        e.preventDefault();
        this.redeemVoucher();
      });
    }

    // Also setup button click
    const redeemBtn = document.querySelector('button[onclick="redeemVoucher()"]');
    if (redeemBtn) {
      redeemBtn.addEventListener('click', () => this.redeemVoucher());
    }
  }

  /**
   * Redeem voucher
   */
  async redeemVoucher() {
    const codeInput = document.getElementById('voucher-code');
    const resultEl = document.getElementById('redeem-result');
    const code = codeInput?.value.trim();

    if (!code) {
      if (resultEl) {
        resultEl.innerHTML = '<span class="text-red-400"><i class="fas fa-exclamation-circle"></i> Masukkan kode voucher</span>';
      }
      return;
    }

    if (resultEl) {
      resultEl.innerHTML = '<span class="text-yellow-400"><i class="fas fa-spinner fa-spin"></i> Memvalidasi...</span>';
    }

    try {
      const result = await authApi.redeemVoucher(code);

      if (result.success) {
        if (resultEl) {
          resultEl.innerHTML = `<span class="text-green-400"><i class="fas fa-check-circle"></i> ${result.message}</span>`;
        }
        // Clear input
        if (codeInput) codeInput.value = '';
        // Refresh history
        this.loadRedeemHistory();
      } else {
        if (resultEl) {
          resultEl.innerHTML = `<span class="text-red-400"><i class="fas fa-exclamation-circle"></i> ${result.message}</span>`;
        }
      }
    } catch (error) {
      console.error('Redeem error:', error);
      if (resultEl) {
        resultEl.innerHTML = '<span class="text-red-400"><i class="fas fa-exclamation-circle"></i> Error koneksi</span>';
      }
    }
  }

  /**
   * Load stats
   */
  async loadStats() {
    try {
      const result = await authApi.getMitraStats();
      
      if (result.success) {
        this.updateStats(result.data);
      }
    } catch (error) {
      console.error('Failed to load stats:', error);
    }
  }

  /**
   * Update stats display
   * @param {Object} data - Stats data
   */
  updateStats(data) {
    const elements = {
      'voucher-redeemed': data.voucherRedeemed || 0,
      'total-discount': data.totalDiscount ? `Rp ${this.formatNumber(data.totalDiscount)}` : 'Rp 0',
      'customer-count': data.customerCount || 0
    };

    Object.entries(elements).forEach(([id, value]) => {
      const el = document.getElementById(id);
      if (el) el.textContent = value;
    });
  }

  /**
   * Load redeem history
   */
  async loadRedeemHistory() {
    const container = document.getElementById('redeem-history');
    if (!container) return;

    try {
      const result = await authApi.getRedeemHistory();
      
      if (result.success && result.data?.length > 0) {
        this.renderHistory(result.data);
      } else {
        this.renderEmptyHistory();
      }
    } catch (error) {
      console.error('Failed to load history:', error);
      this.renderEmptyHistory();
    }
  }

  /**
   * Render history
   * @param {Array} history - History list
   */
  renderHistory(history) {
    const container = document.getElementById('redeem-history');
    if (!container) return;

    container.innerHTML = history.map(item => `
      <div class="flex items-center justify-between p-3 bg-white/5 rounded-lg">
        <div class="flex items-center gap-3">
          <div class="w-8 h-8 rounded-full bg-gradient-to-br from-green-400 to-emerald-400 flex items-center justify-center">
            <i class="fas fa-check text-white text-xs"></i>
          </div>
          <div>
            <div class="font-medium text-sm">${item.kode}</div>
            <div class="text-xs text-muted">${item.waktu}</div>
          </div>
        </div>
        <span class="badge badge-success">${item.diskon}</span>
      </div>
    `).join('');
  }

  /**
   * Render empty history
   */
  renderEmptyHistory() {
    const container = document.getElementById('redeem-history');
    if (!container) return;

    container.innerHTML = `
      <p class="text-muted text-center py-8">
        <i class="fas fa-inbox text-3xl mb-3 block opacity-50"></i>
        Belum ada riwayat redeem
      </p>
    `;
  }

  /**
   * Format number
   * @param {number} num - Number to format
   * @returns {string}
   */
  formatNumber(num) {
    return new Intl.NumberFormat('id-ID').format(num);
  }
}

// Export
export { MitraDashboard };

// Auto-init when DOM ready
document.addEventListener('DOMContentLoaded', () => {
  const dashboard = new MitraDashboard();
  dashboard.init();
});

