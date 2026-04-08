import { authGuard } from '../core/AuthGuard.js';
import { themeManager } from '../core/ThemeManager.js';
import { initSectionNavigation, switchSection } from '../core/NavigationUtils.js';
import { DOMUtils } from '../core/DOMUtils.js';
import { ToastUtils } from '../core/ToastUtils.js';
import { authApi } from '../auth/AuthApi.js';
import { WebSocketClient } from '../core/WebSocketClient.js';
import { NotificationManager } from '../core/NotificationManager.js';
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
    this.webSocketClient = null;
    this.notificationManager = null;
    this.data = {
      stats: {},
      detail: {},
      transaksi: [],
      statistik: {}
    };
  }

  renderDashboardShell() {
    const appContainer = document.getElementById('app');
    if (!appContainer) {
      console.error('[MitraDashboard] #app container not found');
      return false;
    }

    appContainer.innerHTML = `
      <header class="fixed top-0 left-0 right-0 z-40 glass-card border-b border-white/10">
        <div class="flex justify-between items-center px-4 py-3">
          <div class="flex items-center gap-3">
            <div class="w-9 h-9 rounded-xl bg-gradient-to-br from-green-500 to-emerald-500 flex items-center justify-center">
              <i class="fas fa-store text-white text-sm"></i>
            </div>
            <div>
              <h1 class="text-base font-bold text-white">SpinX <span class="text-gradient">Mitra</span></h1>
              <p class="text-xs text-gray-400" id="mitra-name">Mitra</p>
            </div>
          </div>

          <div class="flex items-center gap-2">
            <button id="notif-btn" class="w-9 h-9 rounded-xl bg-white/5 hover:bg-white/10 flex items-center justify-center text-gray-300 transition-colors">
              <i class="fas fa-bell"></i>
            </button>
            <img id="user-avatar" src="" alt="Avatar" class="w-9 h-9 rounded-full border-2 border-indigo-500">
          </div>
        </div>
      </header>

      <main class="pt-16 px-4 pb-4">
        <section id="section-dashboard" class="section-content">
          <div class="glass-card p-4 mb-4 animate-fade-in-up">
            <div class="flex items-center justify-between">
              <div>
                <h2 class="text-lg font-bold">Welcome, <span id="welcome-name" class="text-gradient"></span>! 🏪</h2>
                <p class="text-xs text-gray-400">Kelola voucher, scan QR, lihat transaksi</p>
              </div>
              <div class="text-right">
                <p class="text-xs text-gray-500" id="current-date"></p>
              </div>
            </div>
          </div>

          <div class="grid grid-cols-3 gap-3 mb-4">
            <div class="glass-card p-3 text-center animate-fade-in-up delay-1">
              <div class="text-2xl mb-1">💰</div>
              <div class="text-xl font-bold text-gradient" id="stat-pendapatan">-</div>
              <div class="text-xs text-gray-400">Pendapatan</div>
            </div>
            <div class="glass-card p-3 text-center animate-fade-in-up delay-2">
              <div class="text-2xl mb-1">🎫</div>
              <div class="text-xl font-bold text-gradient" id="stat-voucher">-</div>
              <div class="text-xs text-gray-400">Voucher</div>
            </div>
            <div class="glass-card p-3 text-center animate-fade-in-up delay-3">
              <div class="text-2xl mb-1">📊</div>
              <div class="text-xl font-bold text-gradient" id="stat-transaksi">-</div>
              <div class="text-xs text-gray-400">Transaksi</div>
            </div>
          </div>

          <div class="glass-card p-4 mb-4 animate-fade-in-up delay-3">
            <div class="flex items-center justify-between mb-3">
              <h3 class="text-sm font-bold">Performa Hari Ini</h3>
              <select id="period-select" class="bg-white/5 border border-white/10 rounded-lg px-2 py-1 text-xs">
                <option value="hari">Hari Ini</option>
                <option value="minggu">Minggu Ini</option>
                <option value="bulan">Bulan Ini</option>
              </select>
            </div>
            <div class="grid grid-cols-2 gap-3" id="performance-stats">
              <div class="text-center p-3 bg-white/5 rounded-lg">
                <div class="text-lg font-bold text-green-400" id="stat-hari-pendapatan">-</div>
                <div class="text-xs text-gray-400">Pendapatan</div>
              </div>
              <div class="text-center p-3 bg-white/5 rounded-lg">
                <div class="text-lg font-bold text-blue-400" id="stat-hari-transaksi">-</div>
                <div class="text-xs text-gray-400">Transaksi</div>
              </div>
            </div>
          </div>

          <div class="glass-card p-4 animate-fade-in-up delay-4">
            <h3 class="text-sm font-bold mb-3 flex items-center gap-2">
              <i class="fas fa-clock text-cyan-400"></i>
              Aktivitas Terbaru
            </h3>
            <div class="space-y-2" id="activity-list">
              <div class="text-center py-4 text-gray-500">
                <i class="fas fa-spinner fa-spin text-lg mb-2"></i>
                <p class="text-xs">Memuat aktivitas...</p>
              </div>
            </div>
          </div>
        </section>

        <section id="section-transaksi" class="section-content hidden">
          <div class="glass-card p-4 mb-4 animate-fade-in-up">
            <div class="flex items-center justify-between mb-3">
              <h3 class="text-sm font-bold">Riwayat Transaksi</h3>
              <button id="export-transaksi-btn" class="btn btn-secondary text-xs py-1 px-2">
                <i class="fas fa-download"></i>Export
              </button>
            </div>
            <div class="relative mb-4">
              <input type="text" id="transaksi-search" placeholder="Cari transaksi..." class="input text-sm py-2 pl-9">
              <i class="fas fa-search absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 text-sm"></i>
            </div>
            <div class="space-y-2" id="transaksi-list">
              <div class="text-center py-6 text-gray-500">
                <i class="fas fa-spinner fa-spin text-xl mb-2"></i>
                <p class="text-sm">Memuat transaksi...</p>
              </div>
            </div>
          </div>
        </section>

        <section id="section-scan" class="section-content hidden">
          <div class="glass-card p-4 mb-4 animate-fade-in-up">
            <div class="flex items-center justify-between mb-3">
              <h3 class="text-sm font-bold">Scan QR Code</h3>
              <button id="scan-qr-btn" class="btn btn-primary text-xs py-1 px-2">
                <i class="fas fa-qrcode"></i>Scan QR
              </button>
            </div>
            <div class="text-center py-8">
              <div class="w-32 h-32 mx-auto mb-4 bg-white/5 rounded-lg flex items-center justify-center">
                <i class="fas fa-qrcode text-4xl text-gray-400"></i>
              </div>
              <p class="text-sm text-gray-400">Klik tombol scan untuk memindai QR code voucher</p>
            </div>
          </div>
        </section>

        <section id="section-statistik" class="section-content hidden">
          <div class="glass-card p-4 mb-4 animate-fade-in-up">
            <h3 class="text-sm font-bold mb-3">Statistik Penjualan</h3>
            <div class="space-y-3" id="statistik-charts">
              <div class="text-center py-6 text-gray-500">
                <i class="fas fa-chart-bar text-2xl mb-2"></i>
                <p class="text-sm">Memuat statistik...</p>
              </div>
            </div>
          </div>
        </section>

        <section id="section-akun" class="section-content hidden">
          <div class="glass-card p-4 mb-4 animate-fade-in-up">
            <div class="flex items-center gap-4 mb-4">
              <img id="profile-avatar" src="" alt="Profile" class="w-16 h-16 rounded-full border-2 border-indigo-500">
              <div>
                <h2 class="text-lg font-bold" id="profile-name">-</h2>
                <p class="text-sm text-gray-400" id="profile-email">-</p>
                <span class="badge badge-success text-xs">Mitra</span>
              </div>
            </div>
          </div>

          <div class="glass-card p-4 mb-4 animate-fade-in-up delay-1">
            <h3 class="text-sm font-bold mb-3 flex items-center gap-2">
              <i class="fas fa-store text-green-400"></i>
              Info Toko
            </h3>
            <div class="space-y-3">
              <div class="flex items-center justify-between p-3 bg-white/5 rounded-lg">
                <span class="text-sm">Nama Toko</span>
                <span class="text-sm text-gray-300" id="toko-nama">-</span>
              </div>
              <div class="flex items-center justify-between p-3 bg-white/5 rounded-lg">
                <span class="text-sm">Kategori</span>
                <span class="text-sm text-gray-300" id="toko-kategori">-</span>
              </div>
              <div class="flex items-center justify-between p-3 bg-white/5 rounded-lg">
                <span class="text-sm">Total Pendapatan</span>
                <span class="text-sm text-gray-300" id="toko-pendapatan">-</span>
              </div>
            </div>
          </div>

          <button id="logout-btn" class="w-full glass-card p-4 flex items-center gap-3 text-red-400 hover:bg-red-500/10 transition-colors rounded-lg">
            <div class="w-10 h-10 rounded-lg bg-red-500/20 flex items-center justify-center">
              <i class="fas fa-sign-out-alt"></i>
            </div>
            <div class="font-medium">Logout</div>
          </button>
        </section>
      </main>

      <nav class="fixed bottom-0 left-0 right-0 z-50 glass-card border-t border-white/10">
        <div class="flex justify-around items-center px-2 py-2">
          <button class="bottom-nav-item active flex flex-col items-center justify-center py-2 px-3 rounded-xl transition-all" data-section="dashboard">
            <i class="fas fa-th-large text-lg mb-1"></i>
            <span class="text-xs">Dashboard</span>
          </button>

          <button class="bottom-nav-item flex flex-col items-center justify-center py-2 px-3 rounded-xl transition-all text-gray-400" data-section="transaksi">
            <i class="fas fa-receipt text-lg mb-1"></i>
            <span class="text-xs">Transaksi</span>
          </button>

          <button class="bottom-nav-item flex flex-col items-center justify-center py-2 px-3 rounded-xl transition-all text-gray-400" data-section="scan">
            <i class="fas fa-qrcode text-lg mb-1"></i>
            <span class="text-xs">Scan</span>
          </button>

          <button class="bottom-nav-item flex flex-col items-center justify-center py-2 px-3 rounded-xl transition-all text-gray-400" data-section="statistik">
            <i class="fas fa-chart-bar text-lg mb-1"></i>
            <span class="text-xs">Statistik</span>
          </button>

          <button class="bottom-nav-item flex flex-col items-center justify-center py-2 px-3 rounded-xl transition-all text-gray-400" data-section="akun">
            <i class="fas fa-user-cog text-lg mb-1"></i>
            <span class="text-xs">Akun</span>
          </button>
        </div>
      </nav>
    `;
    return true;
  }

  async init() {
    if (!this.renderDashboardShell()) {
      console.error('[MitraDashboard] Failed to render dashboard shell');
      return;
    }

    if (!authGuard.init('mitra', {
      avatarId: 'user-avatar',
      nameId: 'user-name',
      welcomeId: 'welcome-name',
      logoutId: 'logout-btn'
    })) {
      return;
    }

    this.currentUser = authGuard.getUser();

    try {
      await window.SubscriptionGuard?.verify?.(this.currentUser);
    } catch (error) {
      return;
    }

    themeManager.init();
    this.initWebSocket();
    this.initNotifications();
    this.setupProfile();
    this.updateDate();
    this.showInitialSkeletons();
    this.initBottomNav();
    this.initEventListeners();

    await this.loadDashboard();
  }

  /**
   * Initialize WebSocket connection for real-time updates
   */
  initWebSocket() {
    this.webSocketClient = new WebSocketClient();
    
    // Listen for real-time updates
    this.webSocketClient.on('notification', (notification) => {
      this.notificationManager.addNotification(notification);
    });

    this.webSocketClient.on('data:update', (update) => {
      this.handleDataUpdate(update);
    });

    this.webSocketClient.on('session:update', (update) => {
      this.handleSessionUpdate(update);
    });
  }

  /**
   * Initialize notification manager
   */
  initNotifications() {
    this.notificationManager = new NotificationManager();
  }

  /**
   * Handle real-time data updates
   */
  handleDataUpdate(update) {
    switch (update.type) {
      case 'voucher_redeemed':
        this.updateVoucherStats(update.data);
        break;
      case 'transaction_update':
        this.updateTransactionData(update.data);
        break;
      case 'product_update':
        this.updateProductData(update.data);
        break;
    }
  }

  /**
   * Handle session updates
   */
  handleSessionUpdate(update) {
    if (update.type === 'logout' || update.type === 'expired') {
      // Handle session expiry
      ToastUtils.error('Sesi Anda telah berakhir', 'Silakan login kembali.');
      setTimeout(() => {
        window.location.href = '/';
      }, 2000);
    }
  }

  /**
   * Update voucher statistics in real-time
   */
  updateVoucherStats(data) {
    if (data.totalRedeemed !== undefined) {
      DOMUtils.setText('stat-voucher', data.totalRedeemed);
    }
    if (data.todayRedeemed !== undefined) {
      DOMUtils.setText('stat-voucher-hari', data.todayRedeemed);
    }
    if (data.weekRedeemed !== undefined) {
      DOMUtils.setText('stat-voucher-minggu', data.weekRedeemed);
    }
  }

  /**
   * Update transaction data in real-time
   */
  updateTransactionData(data) {
    if (this.currentSection === 'transaksi') {
      this.loadTransaksi();
    }
  }

  /**
   * Update product data in real-time
   */
  updateProductData(data) {
    if (this.currentSection === 'produk') {
      this.loadProduk();
    }
  }

  setupProfile() {
    // Avatar and name are handled by authGuard.init()
    // Only set profile section data
    DOMUtils.setText('profile-name', this.currentUser?.name || 'Mitra');
    DOMUtils.setText('profile-email', this.currentUser?.email || '-');
    DOMUtils.setText('mitra-name', this.currentUser?.schoolName || this.currentUser?.name || 'Mitra');
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
    DOMUtils.setText('current-date', new Date().toLocaleDateString('id-ID', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    }));
  }

  initBottomNav() {
    initSectionNavigation(
      (section) => this.switchSection(section),
      {
        activeClasses: ['active', 'text-green-400'],
        inactiveClasses: ['text-gray-400']
      }
    );
  }

  switchSection(section) {
    this.currentSection = section;

    switchSection(section, {
      activeClasses: ['active', 'text-green-400'],
      inactiveClasses: ['text-gray-400']
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
    document.getElementById('edit-profile-btn')?.addEventListener('click', () => ToastUtils.info('Edit Profil', 'Fitur segera hadir.'));

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
      ToastUtils.error('Error', 'Gagal memuat dashboard mitra.');
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
      ToastUtils.error('Error', 'Gagal memuat transaksi.');
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
        ToastUtils.success('Voucher Valid', voucherData.message || 'Voucher siap diproses.');
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
      ToastUtils.error('Error', 'Gagal memuat statistik mitra.');
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

    ToastUtils.info('Menu Mitra', messages[action] || 'Fitur sedang disiapkan.');
  }
}

export { MitraDashboard };

document.addEventListener('DOMContentLoaded', () => {
  const dashboard = new MitraDashboard();
  window.dashboard = dashboard;
  dashboard.init();
});
