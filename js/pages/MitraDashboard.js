import { authGuard } from '../core/AuthGuard.js';
import { themeManager } from '../core/ThemeManager.js';
import { authApi } from '../auth/AuthApi.js';
import { showError, showInfo, showSuccess } from '../components/utils/Toast.js';
import {
  applyTextSkeleton,
  clearTextSkeleton,
  renderListSkeleton,
  renderCardSkeleton,
  renderChartSkeleton,
  clearContainerSkeleton
} from '../components/utils/DashboardSkeleton.js';

class MitraDashboard {
  constructor() {
    this.currentSection = 'dashboard';
    this.currentPeriod = 'hari';
    this.currentUser = null;
    this.data = {
      stats: {},
      detail: {},
      transaksi: [],
      statistik: {}
    };
  }

  async init() {
    if (!authGuard.init('mitra', {
      avatarId: 'user-avatar',
      welcomeId: 'welcome-name',
      logoutId: 'logout-btn'
    })) {
      return;
    }

    this.currentUser = authGuard.getUser();
    
    // Final subscription check
    try {
      await window.SubscriptionGuard.verify(this.currentUser);
    } catch (error) {
      // Guard handles toast/redirect
      return;
    }
    
    themeManager.init();
    this.setupProfile();
    this.updateDate();
    this.showInitialSkeletons();
    this.initBottomNav();
    this.initEventListeners();

    await this.loadDashboard();
  }

  setupProfile() {
    const avatarUrl = this.currentUser?.picture || this.currentUser?.foto ||
      `https://ui-avatars.com/api/?name=${encodeURIComponent(this.currentUser?.name || 'M')}&background=random`;

    const avatarIds = ['user-avatar', 'profile-avatar'];
    avatarIds.forEach((id) => {
      const element = document.getElementById(id);
      if (element) {
        element.src = avatarUrl;
      }
    });

    const profileName = document.getElementById('profile-name');
    const profileEmail = document.getElementById('profile-email');
    const mitraName = document.getElementById('mitra-name');

    if (profileName) profileName.textContent = this.currentUser?.name || 'Mitra';
    if (profileEmail) profileEmail.textContent = this.currentUser?.email || '-';
    if (mitraName) mitraName.textContent = this.currentUser?.schoolName || this.currentUser?.name || 'Mitra';
  }

  showInitialSkeletons() {
    applyTextSkeleton([
      { target: 'stat-produk', width: '56px' },
      { target: 'stat-transaksi', width: '56px' },
      { target: 'stat-voucher', width: '56px' },
      { target: 'stat-voucher-hari', width: '56px' },
      { target: 'stat-voucher-minggu', width: '56px' },
      { target: 'mitra-nama', width: '44%' },
      { target: 'mitra-kategori', width: '30%' },
      { target: 'mitra-kontak', width: '34%' },
      { target: 'toko-nama', width: '44%' },
      { target: 'toko-alamat', width: '52%' },
      { target: 'toko-telepon', width: '32%' }
    ]);
    renderListSkeleton('top-produk-list', { items: 3, avatar: 'square' });
    renderListSkeleton('activity-list', { items: 4, avatar: 'circle', trailing: 'none' });
    renderListSkeleton('transaksi-list', { items: 3, avatar: 'square', trailing: 'pill' });
    renderChartSkeleton('diskon-chart', { bars: 7 });
  }

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

  initBottomNav() {
    document.querySelectorAll('.bottom-nav-item').forEach((btn) => {
      btn.addEventListener('click', (event) => {
        this.switchSection(event.currentTarget.dataset.section);
      });
    });
  }

  switchSection(section) {
    this.currentSection = section;

    document.querySelectorAll('.bottom-nav-item').forEach((btn) => {
      const isActive = btn.dataset.section === section;
      btn.classList.toggle('active', isActive);
      btn.classList.toggle('text-green-400', isActive);
      btn.classList.toggle('text-gray-400', !isActive);
    });

    document.querySelectorAll('.section-content').forEach((content) => {
      content.classList.toggle('hidden', content.id !== `section-${section}`);
    });

    switch (section) {
      case 'dashboard':
        this.loadDashboard();
        break;
      case 'transaksi':
        this.loadTransaksi(this.currentPeriod);
        break;
      case 'scan':
        this.loadScan();
        break;
      case 'statistik':
        this.loadStatistik();
        break;
      case 'akun':
        this.loadAkun();
        break;
      default:
        break;
    }
  }

  initEventListeners() {
    document.querySelectorAll('.scan-tab-btn').forEach((btn) => {
      btn.addEventListener('click', (event) => {
        this.switchScanTab(event.currentTarget.dataset.tab);
      });
    });

    ['hari', 'minggu', 'bulan'].forEach((period) => {
      const button = document.getElementById(`filter-${period}`);
      button?.addEventListener('click', () => this.filterTransaksi(period));
    });

    document.getElementById('manual-scan-btn')?.addEventListener('click', () => this.manualScan());
    document.getElementById('edit-profile-btn')?.addEventListener('click', () => showInfo('Edit Profil', 'Fitur segera hadir.'));

    document.querySelectorAll('.menu-item').forEach((item) => {
      item.addEventListener('click', (event) => this.handleAkunAction(event.currentTarget.dataset.action));
    });
  }

  switchScanTab(tab) {
    document.querySelectorAll('.scan-tab-btn').forEach((btn) => {
      const isActive = btn.dataset.tab === tab;
      btn.classList.toggle('active', isActive);
      btn.classList.toggle('bg-green-500/20', isActive);
      btn.classList.toggle('text-green-400', isActive);
      btn.classList.toggle('bg-white/5', !isActive);
      btn.classList.toggle('text-gray-400', !isActive);
    });

    document.querySelectorAll('.scan-content').forEach((content) => {
      content.classList.toggle('hidden', content.id !== `scan-${tab}`);
    });
  }

  async loadDashboard() {
    applyTextSkeleton([
      { target: 'stat-produk', width: '56px' },
      { target: 'stat-transaksi', width: '56px' },
      { target: 'stat-voucher', width: '56px' }
    ]);
    renderListSkeleton('top-produk-list', { items: 3, avatar: 'square' });
    renderListSkeleton('activity-list', { items: 4, avatar: 'circle', trailing: 'none' });

    try {
      const [statsResult, detailResult] = await Promise.all([
        authApi.getMitraStats(),
        authApi.call('getmitrastatsdetail', {}, false)
      ]);

      const statsData = statsResult?.success ? (statsResult.data || {}) : {};
      const detailData = detailResult?.success ? (detailResult.data || {}) : {};
      const mergedStats = { ...statsData, ...(detailData.stats || {}) };

      this.data.stats = mergedStats;
      this.data.detail = detailData;

      this.updateSummaryStats(mergedStats);
      this.renderTopProduk(detailData.topProduk || []);
      this.renderDashboardActivity(detailData.aktivitas || []);
    } catch (error) {
      console.error('Failed to load mitra dashboard:', error);
      this.updateSummaryStats({});
      this.renderTopProduk([]);
      this.renderDashboardActivity([]);
      showError('Error', 'Gagal memuat dashboard mitra.');
    }
  }

  updateSummaryStats(stats = {}) {
    clearTextSkeleton(['stat-produk', 'stat-transaksi', 'stat-voucher']);
    document.getElementById('stat-produk').textContent = stats.produk || 0;
    document.getElementById('stat-transaksi').textContent = stats.transaksi || 0;
    document.getElementById('stat-voucher').textContent = stats.voucherAktif || stats.voucherRedeemed || 0;
  }

  renderTopProduk(items) {
    const container = document.getElementById('top-produk-list');
    if (!container) return;
    clearContainerSkeleton(container);

    if (!items.length) {
      container.innerHTML = '<div class="text-center py-4 text-gray-500"><i class="fas fa-box-open text-lg mb-2"></i><p class="text-xs">Belum ada data produk</p></div>';
      return;
    }

    container.innerHTML = items.slice(0, 5).map((item, index) => `
      <div class="flex items-center gap-3 p-3 bg-white/5 rounded-lg">
        <div class="w-9 h-9 rounded-lg bg-gradient-to-br from-green-500 to-emerald-400 flex items-center justify-center text-white text-xs font-bold">#${index + 1}</div>
        <div class="flex-1 min-w-0">
          <div class="font-medium text-sm">${item.nama || item.name || `Produk ${index + 1}`}</div>
          <div class="text-xs text-gray-400">${item.terjual || 0} terjual</div>
        </div>
      </div>
    `).join('');
  }

  renderDashboardActivity(items) {
    const container = document.getElementById('activity-list');
    if (!container) return;
    clearContainerSkeleton(container);

    if (!items.length) {
      container.innerHTML = '<div class="text-center py-4 text-gray-500"><i class="fas fa-history text-lg mb-2"></i><p class="text-xs">Belum ada aktivitas</p></div>';
      return;
    }

    container.innerHTML = items.slice(0, 6).map((item) => `
      <div class="flex items-center gap-3 p-3 bg-white/5 rounded-lg">
        <div class="w-8 h-8 rounded-full ${item.iconBg || 'bg-green-500/20'} flex items-center justify-center">
          <i class="fas ${item.icon || 'fa-check'} text-xs text-white"></i>
        </div>
        <div class="flex-1 min-w-0">
          <div class="font-medium text-sm">${item.judul || item.title || 'Aktivitas terbaru'}</div>
          <div class="text-xs text-gray-400">${item.waktu || item.time || '-'}</div>
        </div>
      </div>
    `).join('');
  }

  async loadTransaksi(period = 'hari') {
    this.currentPeriod = period;
    renderListSkeleton('transaksi-list', { items: 3, avatar: 'square', trailing: 'pill' });

    try {
      const result = await authApi.call('getmitratransaksi', { period }, false);
      this.data.transaksi = result?.success ? (result.data || []) : [];
      this.renderTransaksi(this.data.transaksi);
    } catch (error) {
      console.error('Failed to load transaksi:', error);
      this.data.transaksi = [];
      this.renderTransaksi([]);
      showError('Error', 'Gagal memuat transaksi.');
    }
  }

  filterTransaksi(period) {
    this.currentPeriod = period;
    ['hari', 'minggu', 'bulan'].forEach((key) => {
      const btn = document.getElementById(`filter-${key}`);
      if (!btn) return;

      const isActive = key === period;
      btn.classList.toggle('bg-green-500/20', isActive);
      btn.classList.toggle('text-green-400', isActive);
      btn.classList.toggle('bg-white/5', !isActive);
      btn.classList.toggle('text-gray-300', !isActive);
    });

    this.loadTransaksi(period);
  }

  renderTransaksi(items) {
    const container = document.getElementById('transaksi-list');
    if (!container) return;
    clearContainerSkeleton(container);

    if (!items.length) {
      container.innerHTML = '<div class="text-center py-6 text-gray-500"><i class="fas fa-receipt text-xl mb-2"></i><p class="text-sm">Belum ada transaksi pada periode ini</p></div>';
      return;
    }

    container.innerHTML = items.map((item) => `
      <div class="glass-card p-3">
        <div class="flex items-center justify-between gap-3 mb-1">
          <span class="text-sm font-medium">${item.siswa || 'Pelanggan'}</span>
          <span class="badge badge-success">${item.diskon || 'Rp 0'}</span>
        </div>
        <div class="text-xs text-gray-400">${item.tanggal || '-'}</div>
        <div class="text-xs text-gray-500">${item.kodeVoucher || '-'}</div>
      </div>
    `).join('');
  }

  loadScan() {
    const status = document.getElementById('scan-status');
    if (status) {
      status.innerHTML = '<i class="fas fa-camera text-yellow-400"></i> Arahkan kamera ke QR code';
    }
  }

  async manualScan() {
    const input = document.getElementById('manual-code');
    const resultEl = document.getElementById('manual-result');
    const code = input?.value.trim();

    if (!resultEl) return;

    if (!code) {
      resultEl.innerHTML = '<span class="text-red-400"><i class="fas fa-exclamation-circle"></i> Masukkan kode voucher</span>';
      return;
    }

    resultEl.innerHTML = '<span class="text-yellow-400"><i class="fas fa-spinner fa-spin"></i> Memvalidasi voucher...</span>';

    try {
      const result = await authApi.call('validatevoucher', { voucher: code }, false);

      if (result?.success) {
        const voucherData = result.data || {};
        resultEl.innerHTML = `<span class="text-green-400"><i class="fas fa-check-circle"></i> ${voucherData.message || 'Voucher valid'}</span>`;
        if (input) input.value = '';
        showSuccess('Voucher Valid', voucherData.message || 'Voucher siap diproses.');
        this.loadDashboard();
        if (this.currentSection === 'transaksi') {
          this.loadTransaksi(this.currentPeriod);
        }
      } else {
        resultEl.innerHTML = `<span class="text-red-400"><i class="fas fa-exclamation-circle"></i> ${result?.message || 'Voucher tidak valid'}</span>`;
      }
    } catch (error) {
      console.error('Manual scan failed:', error);
      resultEl.innerHTML = '<span class="text-red-400"><i class="fas fa-exclamation-circle"></i> Error koneksi</span>';
    }
  }

  async loadStatistik() {
    applyTextSkeleton([
      { target: 'stat-voucher-hari', width: '56px' },
      { target: 'stat-voucher-minggu', width: '56px' },
      { target: 'mitra-nama', width: '44%' },
      { target: 'mitra-kategori', width: '30%' },
      { target: 'mitra-kontak', width: '34%' },
      { target: 'toko-nama', width: '44%' },
      { target: 'toko-alamat', width: '52%' },
      { target: 'toko-telepon', width: '32%' }
    ]);
    renderChartSkeleton('diskon-chart', { bars: 7 });

    try {
      const result = await authApi.call('getmitrastatistik', {}, false);
      const data = result?.success ? (result.data || {}) : {};
      this.data.statistik = data;
      this.renderStatistik(data);
    } catch (error) {
      console.error('Failed to load statistik:', error);
      this.renderStatistik({});
      showError('Error', 'Gagal memuat statistik mitra.');
    }
  }

  renderStatistik(data = {}) {
    clearTextSkeleton([
      'stat-voucher-hari',
      'stat-voucher-minggu',
      'mitra-nama',
      'mitra-kategori',
      'mitra-kontak',
      'toko-nama',
      'toko-alamat',
      'toko-telepon'
    ]);

    document.getElementById('stat-voucher-hari').textContent = data.hari || 0;
    document.getElementById('stat-voucher-minggu').textContent = data.minggu || 0;

    const profile = data.profile || {};
    document.getElementById('mitra-nama').textContent = profile.nama_mitra || '-';
    document.getElementById('mitra-kategori').textContent = profile.kategori || '-';
    document.getElementById('mitra-kontak').textContent = profile.kontak || '-';
    document.getElementById('toko-nama').textContent = profile.nama_mitra || '-';
    document.getElementById('toko-alamat').textContent = profile.alamat || '-';
    document.getElementById('toko-telepon').textContent = profile.kontak || '-';

    const chart = document.getElementById('diskon-chart');
    if (!chart) return;

    const bars = Array.isArray(data.diskonHarian) ? data.diskonHarian : [];
    const maxValue = bars.reduce((max, item) => Math.max(max, Number(item.value) || 0), 0) || 1;
    chart.removeAttribute('aria-busy');
    chart.innerHTML = bars.length
      ? bars.map((item) => `
          <div class="flex-1 flex items-end justify-center h-full">
            <div class="w-3 rounded-t bg-green-500" style="height:${Math.max(12, Math.round(((Number(item.value) || 0) / maxValue) * 100))}%"></div>
          </div>
        `).join('')
      : '<div class="w-full text-center text-xs text-gray-500">Belum ada data diskon</div>';
  }

  loadAkun() {
    if (this.data.statistik?.profile) {
      this.renderStatistik(this.data.statistik);
      return;
    }

    this.loadStatistik();
  }

  handleAkunAction(action) {
    const messages = {
      bank: 'Fitur rekening bank segera hadir.',
      settings: 'Pengaturan mitra segera hadir.'
    };

    showInfo('Menu Mitra', messages[action] || 'Fitur sedang disiapkan.');
  }
}

export { MitraDashboard };

document.addEventListener('DOMContentLoaded', () => {
  const dashboard = new MitraDashboard();
  window.dashboard = dashboard;
  dashboard.init();
});
