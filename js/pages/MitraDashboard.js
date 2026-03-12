/**
 * Mitra Dashboard Module
 * Modular dashboard logic for mitra/partner role
 * Clean, DRY, best practice
 */

import { authGuard } from '../core/AuthGuard.js';
import { themeManager } from '../core/ThemeManager.js';
import { authApi } from '../auth/AuthApi.js';
import { showLoading, showSuccess, showError } from '../components/utils/Toast.js';

class MitraDashboard {
  constructor() {
    this.currentSection = 'dashboard';
    this.stats = {
      voucherRedeemed: 0,
      totalDiscount: 0,
      customerCount: 0,
      produk: 0,
      transaksi: 0,
      voucherAktif: 0
    };
    this.qrStream = null;
  }

  /**
   * Initialize mitra dashboard
   */
  async init() {
    // Auth protection
    if (!authGuard.init('mitra', {
      avatarId: 'user-avatar',
      nameId: 'user-name', 
      welcomeId: 'welcome-name',
      logoutId: 'logout-btn',
      profileIds: ['profile-name', 'profile-email', 'mitra-nama', 'mitra-kategori', 'mitra-kontak', 'toko-nama', 'toko-alamat', 'toko-telepon']
    })) {
      return;
    }

    // Update mitra name in header
    const mitraNameEl = document.getElementById('mitra-name');
    if (mitraNameEl) {
      const user = authGuard.getUser();
      mitraNameEl.textContent = user?.profile?.namaMitra || 'Mitra';
    }

    // Theme + date
    themeManager.init();
    this.updateDate();

    // Bottom nav
    this.initBottomNav();

    // Load dashboard (default)
    this.loadDashboard();

    // Event listeners
    this.initEventListeners();
  }

  /**
   * Update current date
   */
  updateDate() {
    const dateEl = document.getElementById('current-date');
    if (dateEl) {
      dateEl.textContent = new Date().toLocaleDateString('id-ID', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    }
  }

  /**
   * Initialize bottom navigation
   */
  initBottomNav() {
    document.querySelectorAll('.bottom-nav-item').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const section = e.currentTarget.dataset.section;
        this.switchSection(section);
      });
    });
  }

  /**
   * Switch between sections
   */
  switchSection(section) {
    // Update nav
    document.querySelectorAll('.bottom-nav-item').forEach(btn => {
      btn.classList.remove('active');
    });
    document.querySelector(`[data-section="${section}"]`).classList.add('active');

    // Hide all sections
    document.querySelectorAll('.section-content').forEach(s => {
      s.classList.add('hidden');
    });

    // Show target section
    document.getElementById(`section-${section}`).classList.remove('hidden');

    // Load section data
    this.currentSection = section;
    this[`load${this.capitalize(section)}`]();
  }

  /**
   * Capitalize string
   */
  capitalize(str) {
    return str.charAt(0).toUpperCase() + str.slice(1);
  }

  /**
   * Initialize event listeners
   */
  initEventListeners() {
    // Manual scan (Scan tab)
    const manualBtn = document.getElementById('manual-scan-btn');
    if (manualBtn) {
      manualBtn.addEventListener('click', () => this.manualScan());
    }

    // Scan camera toggle
    document.querySelectorAll('.scan-tab-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const tab = e.currentTarget.dataset.tab;
        this.switchScanTab(tab);
      });
    });

    // Transaksi filters
    ['hari', 'minggu', 'bulan'].forEach(period => {
      const btn = document.getElementById(`filter-${period}`);
      if (btn) {
        btn.addEventListener('click', () => this.filterTransaksi(period));
      }
    });

    // Akun menu actions
    document.querySelectorAll('.menu-item').forEach(item => {
      item.addEventListener('click', (e) => {
        const action = e.currentTarget.dataset.action;
        this.handleAkunAction(action);
      });
    });
  }

  /**
   * Switch scan tabs (camera/manual)
   */
  switchScanTab(tab) {
    document.querySelectorAll('.scan-tab-btn').forEach(btn => btn.classList.remove('active'));
    document.querySelectorAll('.scan-content').forEach(content => content.classList.add('hidden'));
    
    document.querySelector(`[data-tab="${tab}"]`).classList.add('active');
    document.getElementById(`scan-${tab}`).classList.remove('hidden');
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

  /**
   * Load Dashboard section (default)
   */
  async loadDashboard() {
    const topProdukList = document.getElementById('top-produk-list');
    const activityList = document.getElementById('activity-list');
    
    // Mock data - replace with API
    topProdukList.innerHTML = `
      <div class="flex items-center gap-3 p-3 bg-white/5 rounded-lg">
        <div class="w-8 h-8 rounded-lg bg-gradient-to-br from-yellow-400 to-orange-400 flex items-center justify-center text-white font-bold text-xs">#1</div>
        <div class="flex-1">
          <div class="font-medium text-sm">Mie Goreng</div>
          <div class="text-xs text-gray-400">25 terjual</div>
        </div>
      </div>
      <div class="flex items-center gap-3 p-3 bg-white/5 rounded-lg">
        <div class="w-8 h-8 rounded-lg bg-gradient-to-br from-yellow-500 to-orange-500 flex items-center justify-center text-white font-bold text-xs">#2</div>
        <div class="flex-1">
          <div class="font-medium text-sm">Es Teh</div>
          <div class="text-xs text-gray-400">18 terjual</div>
        </div>
      </div>
    `;

    activityList.innerHTML = `
      <div class="flex items-center gap-3 p-3 bg-white/5 rounded-lg">
        <div class="w-8 h-8 rounded-full bg-green-500/20 flex items-center justify-center">
          <i class="fas fa-check text-green-400 text-xs"></i>
        </div>
        <div class="flex-1">
          <div class="font-medium text-sm">Voucher SPIN001 ditebus</div>
          <div class="text-xs text-gray-400">2 menit lalu</div>
        </div>
      </div>
      <div class="flex items-center gap-3 p-3 bg-white/5 rounded-lg">
        <div class="w-8 h-8 rounded-full bg-blue-500/20 flex items-center justify-center">
          <i class="fas fa-plus text-blue-400 text-xs"></i>
        </div>
        <div class="flex-1">
          <div class="font-medium text-sm">Produk baru ditambahkan</div>
          <div class="text-xs text-gray-400">1 jam lalu</div>
        </div>
      </div>
    `;

    // Update stats with mock
    setTimeout(() => {
      document.getElementById('stat-produk').textContent = '47';
      document.getElementById('stat-transaksi').textContent = '12';
      document.getElementById('stat-voucher').textContent = '8';
    }, 500);
  }

  /**
   * Load Transaksi (mock)
   */
  async loadTransaksi() {
    const container = document.getElementById('transaksi-list');
    container.innerHTML = `
      <div class="glass-card p-3">
        <div class="flex items-center justify-between mb-1">
          <span class="text-sm font-medium">Budi S.</span>
          <span class="badge badge-success">Rp 5.000</span>
        </div>
        <div class="text-xs text-gray-400">Hari ini 14:32</div>
        <div class="text-xs text-gray-500">VOUCHER123</div>
      </div>
      <div class="glass-card p-3">
        <div class="flex items-center justify-between mb-1">
          <span class="text-sm font-medium">Sari K.</span>
          <span class="badge badge-success">Rp 10.000</span>
        </div>
        <div class="text-xs text-gray-400">Hari ini 13:45</div>
        <div class="text-xs text-gray-500">DISKON50</div>
      </div>
    `;
  }

  /**
   * Load Scan (init camera)
   */
  async loadScan() {
    // Camera logic here
    document.getElementById('scan-status').innerHTML = 
      '<i class="fas fa-camera text-yellow-400"></i> Arahkan kamera ke QR code';
  }

  /**
   * Load Statistik (mock charts)
   */
  async loadStatistik() {
    document.getElementById('stat-voucher-hari').textContent = '5';
    document.getElementById('stat-voucher-minggu').textContent = '28';
    
    // Simple chart
    const container = document.getElementById('diskon-chart');
    container.innerHTML = `
      <div style="flex:1"><div class="w-3 bg-green-500 rounded-t" style="height:30%"></div></div>
      <div style="flex:1"><div class="w-3 bg-green-500 rounded-t" style="height:60%"></div></div>
      <div style="flex:1"><div class="w-3 bg-green-500 rounded-t" style="height:80%"></div></div>
      <div style="flex:1"><div class="w-3 bg-green-500 rounded-t bg-green-600" style="height:100%"></div></div>
    `;
  }

  /**
   * Load Akun (profile)
   */
  loadAkun() {
    // Data from authGuard
  }
}

// Export
export { MitraDashboard };

// Auto-init when DOM ready
document.addEventListener('DOMContentLoaded', () => {
  new MitraDashboard().init();
});


