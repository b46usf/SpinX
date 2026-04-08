/**
 * Siswa Dashboard Module
 * Modular dashboard logic for siswa/student role
 * Clean, DRY, best practice
 * Contains game logic (spin wheel)
 */

import { authGuard } from '../core/AuthGuard.js';
import { themeManager } from '../core/ThemeManager.js';
import { initSectionNavigation, switchSection } from '../core/NavigationUtils.js';
import { DOMUtils } from '../core/DOMUtils.js';
import { ToastUtils } from '../core/ToastUtils.js';
import { authApi } from '../auth/AuthApi.js';
import {
  applyTextSkeleton,
  clearTextSkeleton,
  renderListSkeleton,
  renderCardSkeleton,
  clearContainerSkeleton
} from '../components/utils/DashboardSkeleton.js';

/**
 * Wheel Configuration
 * Centralized wheel settings - easy to modify
 */
const WHEEL_CONFIG = {
  size: 300,
  slices: [
    'ZONK', 'ZONK', 'ZONK',
    'DISC5',
    'ZONK',
    'DISC10',
    'ZONK',
    'DISC15',
    'ZONK',
    'DISC20'
  ],
  colors: [
    '#ef4444', '#f97316', '#eab308', '#22c55e',
    '#3b82f6', '#6366f1', '#a855f7', '#ec4899',
    '#14b8a6', '#64748b'
  ]
};

/**
 * Game State
 * Manages current game state
 */
const gameState = {
  spinning: false,
  canvas: null,
  ctx: null
};

class SiswaDashboard {
  constructor() {
    this.currentSection = 'dashboard';
    this.currentUser = null;
    this.customerId = null;
    this.data = {
      stats: {},
      mitra: [],
      pesanan: [],
      activity: [],
      leaderboard: []
    };
    this.gameState = {
      spinning: false,
      canvas: null,
      ctx: null
    };
  }

  renderDashboardShell() {
    const appContainer = document.getElementById('app');
    if (!appContainer) {
      console.error('[SiswaDashboard] #app container not found');
      return false;
    }

    appContainer.innerHTML = `
      <header class="fixed top-0 left-0 right-0 z-40 glass-card border-b border-white/10">
        <div class="flex justify-between items-center px-4 py-3">
          <div class="flex items-center gap-3">
            <div class="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 flex items-center justify-center">
              <i class="fas fa-user-graduate text-white text-sm"></i>
            </div>
            <div>
              <h1 class="text-base font-bold text-white">SpinX <span class="text-gradient">Siswa</span></h1>
              <p class="text-xs text-gray-400" id="kelas-name">-</p>
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
                <h2 class="text-lg font-bold">Welcome, <span id="welcome-name" class="text-gradient"></span>! 🎮</h2>
                <p class="text-xs text-gray-400">Spin voucher, jelajahi mitra, pesan produk</p>
              </div>
              <div class="text-right">
                <p class="text-xs text-gray-500" id="current-date"></p>
              </div>
            </div>
          </div>

          <div class="grid grid-cols-3 gap-3 mb-4">
            <div class="glass-card p-3 text-center animate-fade-in-up delay-1">
              <div class="text-2xl mb-1">🎫</div>
              <div class="text-xl font-bold text-gradient" id="stat-voucher">-</div>
              <div class="text-xs text-gray-400">Voucher</div>
            </div>
            <div class="glass-card p-3 text-center animate-fade-in-up delay-2">
              <div class="text-2xl mb-1">🎯</div>
              <div class="text-xl font-bold text-gradient" id="stat-spin">-</div>
              <div class="text-xs text-gray-400">Spin</div>
            </div>
            <div class="glass-card p-3 text-center animate-fade-in-up delay-3">
              <div class="text-2xl mb-1">💰</div>
              <div class="text-xl font-bold text-gradient" id="stat-poin">-</div>
              <div class="text-xs text-gray-400">Poin</div>
            </div>
          </div>

          <div class="glass-card p-4 mb-4 animate-fade-in-up delay-3">
            <div class="flex items-center justify-between mb-3">
              <h3 class="text-sm font-bold">Lucky Wheel</h3>
              <button id="spin-btn" class="btn btn-primary text-xs py-1 px-2">
                <i class="fas fa-play"></i>Spin
              </button>
            </div>
            <div class="flex justify-center mb-3">
              <canvas id="wheel-canvas" width="300" height="300" class="border-2 border-purple-500/20 rounded-full"></canvas>
            </div>
            <div class="text-center">
              <p class="text-xs text-gray-400" id="spin-result">Siap untuk spin!</p>
            </div>
          </div>

          <div class="glass-card p-4 animate-fade-in-up delay-4">
            <h3 class="text-sm font-bold mb-3 flex items-center gap-2">
              <i class="fas fa-trophy text-yellow-400"></i>
              Leaderboard
            </h3>
            <div class="space-y-2" id="leaderboard-list">
              <div class="text-center py-4 text-gray-500">
                <i class="fas fa-spinner fa-spin text-lg mb-2"></i>
                <p class="text-xs">Memuat leaderboard...</p>
              </div>
            </div>
          </div>
        </section>

        <section id="section-mitra" class="section-content hidden">
          <div class="glass-card p-4 mb-4 animate-fade-in-up">
            <div class="flex items-center justify-between mb-3">
              <h3 class="text-sm font-bold">Mitra Terdekat</h3>
              <button id="refresh-mitra-btn" class="btn btn-secondary text-xs py-1 px-2">
                <i class="fas fa-sync"></i>Refresh
              </button>
            </div>
            <div class="relative mb-4">
              <input type="text" id="mitra-search" placeholder="Cari mitra..." class="input text-sm py-2 pl-9">
              <i class="fas fa-search absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 text-sm"></i>
            </div>
            <div class="space-y-2" id="mitra-list">
              <div class="text-center py-6 text-gray-500">
                <i class="fas fa-spinner fa-spin text-xl mb-2"></i>
                <p class="text-sm">Memuat data mitra...</p>
              </div>
            </div>
          </div>
        </section>

        <section id="section-pesanan" class="section-content hidden">
          <div class="glass-card p-4 mb-4 animate-fade-in-up">
            <div class="flex items-center justify-between mb-3">
              <h3 class="text-sm font-bold">Riwayat Pesanan</h3>
              <button id="new-order-btn" class="btn btn-primary text-xs py-1 px-2">
                <i class="fas fa-plus"></i>Pesan Baru
              </button>
            </div>
            <div class="space-y-2" id="pesanan-list">
              <div class="text-center py-6 text-gray-500">
                <i class="fas fa-spinner fa-spin text-xl mb-2"></i>
                <p class="text-sm">Memuat riwayat pesanan...</p>
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
                <span class="badge badge-primary text-xs">Siswa</span>
              </div>
            </div>
          </div>

          <div class="glass-card p-4 mb-4 animate-fade-in-up delay-1">
            <h3 class="text-sm font-bold mb-3 flex items-center gap-2">
              <i class="fas fa-school text-purple-400"></i>
              Info Sekolah
            </h3>
            <div class="space-y-3">
              <div class="flex items-center justify-between p-3 bg-white/5 rounded-lg">
                <span class="text-sm">Nama Sekolah</span>
                <span class="text-sm text-gray-300" id="sekolah-nama">-</span>
              </div>
              <div class="flex items-center justify-between p-3 bg-white/5 rounded-lg">
                <span class="text-sm">Kelas</span>
                <span class="text-sm text-gray-300" id="sekolah-kelas">-</span>
              </div>
              <div class="flex items-center justify-between p-3 bg-white/5 rounded-lg">
                <span class="text-sm">Total Poin</span>
                <span class="text-sm text-gray-300" id="sekolah-poin">-</span>
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

          <button class="bottom-nav-item flex flex-col items-center justify-center py-2 px-3 rounded-xl transition-all text-gray-400" data-section="mitra">
            <i class="fas fa-store text-lg mb-1"></i>
            <span class="text-xs">Mitra</span>
          </button>

          <button class="bottom-nav-item flex flex-col items-center justify-center py-2 px-3 rounded-xl transition-all text-gray-400" data-section="pesanan">
            <i class="fas fa-shopping-cart text-lg mb-1"></i>
            <span class="text-xs">Pesanan</span>
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

  /**
   * Initialize full siswa dashboard
   */
  async init() {
    // Render the dashboard shell first
    if (!this.renderDashboardShell()) {
      console.error('[SiswaDashboard] Failed to render dashboard shell');
      return;
    }

    // Auth protection - siswa role
    const authResult = authGuard.init('siswa', {
      avatarId: 'user-avatar',
      nameId: 'user-name',
      welcomeId: 'welcome-name',
      logoutId: 'logout-btn'
    });
    if (!authResult) return;

    this.currentUser = authGuard.getUser();
    
    // Final subscription check
    try {
      await window.SubscriptionGuard.verify(this.currentUser);
    } catch (error) {
      // Guard handles toast/redirect
      return;
    }
    
    DOMUtils.setText('kelas-name', this.currentUser.kelas || '-');
    DOMUtils.setText('student-name', this.currentUser.name);
    DOMUtils.setText('student-kelas', this.currentUser.kelas);
    DOMUtils.setText('school-name', this.currentUser.schoolName || 'Sekolah');
    DOMUtils.setText('profile-name', this.currentUser.name);
    DOMUtils.setText('profile-email', this.currentUser.email);

    // Setup UI
    themeManager.init();
    this.setupNavigation();
    this.setupEventListeners();
    this.loadSavedWa();
    this.showInitialSkeletons();

    // Load data
    await this.loadDashboardData();
    this.initGame();
  }

  showSuccess(title, message = '') {
    return ToastUtils.success(title, message);
  }

  showError(title, message = '') {
    return ToastUtils.error(title, message);
  }

  showWarning(title, message = '') {
    return ToastUtils.warning(title, message);
  }

  showInfo(title, message = '') {
    return ToastUtils.info(title, message);
  }

  showInitialSkeletons() {
    applyTextSkeleton([
      { target: 'spin-available', width: '52px' },
      { target: 'voucher-active', width: '52px' },
      { target: 'reward-points', width: '64px' }
    ]);
    renderListSkeleton('activity-list', { items: 4, avatar: 'square', trailing: 'none' });
    renderListSkeleton('leaderboard', { items: 4, avatar: 'circle' });
    renderCardSkeleton('mitra-list', { items: 3, footer: true });
    renderCardSkeleton('pesanan-list', { items: 3, footer: true });
  }

  /**
   * Load saved WhatsApp number
   */
  loadSavedWa() {
    const savedWa = localStorage.getItem('wa');
    const waInput = document.getElementById('wa');
    if (waInput && savedWa) {
      waInput.value = savedWa;
    }
  }

  /**
   * Get or create customer ID
   */
  getCustomerId() {
    if (this.customerId) return this.customerId;

    let cid = localStorage.getItem('cid');
    if (!cid) {
      cid = 'CUST-' + Math.random().toString(36).substring(2, 8);
      localStorage.setItem('cid', cid);
    }
    this.customerId = cid;
    return cid;
  }

  /**
   * Initialize game components
   */
  initGame() {
    gameState.canvas = document.getElementById('wheel');
    if (gameState.canvas) {
      gameState.ctx = gameState.canvas.getContext('2d');
      this.drawWheel();
    }
  }

  /**
   * Draw the wheel
   */
  drawWheel() {
    const ctx = gameState.ctx;
    if (!ctx) return;

    const size = WHEEL_CONFIG.size;
    const slices = WHEEL_CONFIG.slices;
    const center = size / 2;
    const arc = (Math.PI * 2) / slices.length;

    ctx.clearRect(0, 0, size, size);

    slices.forEach((slice, i) => {
      const start = i * arc;
      const end = start + arc;

      ctx.beginPath();
      ctx.moveTo(center, center);
      ctx.arc(center, center, center, start, end);

      ctx.fillStyle = WHEEL_CONFIG.colors[i];
      ctx.fill();

      ctx.strokeStyle = '#fff';
      ctx.stroke();

      ctx.save();
      ctx.translate(center, center);
      ctx.rotate(start + arc / 2);

      ctx.textAlign = 'right';
      ctx.fillStyle = 'white';
      ctx.font = 'bold 16px sans-serif';
      ctx.fillText(slice, center - 20, 5);

      ctx.restore();
    });
  }

  /**
   * Start the game
   */
  startGame() {
    const waInput = document.getElementById('wa');
    const wa = waInput?.value.trim();

    if (!wa) {
      this.showWarning('WhatsApp Diperlukan', 'Silakan isi nomor WhatsApp terlebih dahulu');
      return;
    }

    localStorage.setItem('wa', wa);
    this.showSuccess('Siap Spin!', '🎡 Sekarang Anda bisa memutar roda');

    // Enable spin button
    const spinBtn = document.getElementById('spin-btn');
    if (spinBtn) spinBtn.disabled = false;
  }

  /**
   * Spin the wheel
   */
  async spinWheel() {
    if (gameState.spinning) return;

    const wa = localStorage.getItem('wa');
    if (!wa) {
      this.showWarning('WhatsApp Diperlukan', 'Silakan isi nomor WhatsApp terlebih dahulu');
      return;
    }

    gameState.spinning = true;
    const spinBtn = document.getElementById('spin-btn');
    if (spinBtn) spinBtn.disabled = true;

    try {
      const data = await authApi.spin(wa, this.getCustomerId());

      if (data.error) {
        this.showWarning('Tidak Bisa Spin', 'Anda sudah bermain hari ini. Cobain lagi besok ya!');
        gameState.spinning = false;
        if (spinBtn) spinBtn.disabled = false;
        return;
      }

      this.animateSpin(data);
    } catch (err) {
      console.error(err);
      this.showError('Server Error', 'Terjadi kesalahan. Periksa jaringan Anda.');
      gameState.spinning = false;
      if (spinBtn) spinBtn.disabled = false;
    }
  }

  /**
   * Animate the spin
   * @param {Object} data - Spin result data
   */
  animateSpin(data) {
    const slices = WHEEL_CONFIG.slices;
    const result = data.result;
    const index = slices.indexOf(result);
    const arc = 360 / slices.length;

    const stopAngle = index * arc;
    const spin = 1440 + (360 - stopAngle);
    const duration = 3000;

    let start = null;

    const frame = (t) => {
      if (!start) start = t;

      const progress = t - start;
      const deg = (spin * progress) / duration;

      this.drawRotated(deg);

      if (progress < duration) {
        requestAnimationFrame(frame);
      } else {
        this.showResult(data);
        gameState.spinning = false;
        const spinBtn = document.getElementById('spin-btn');
        if (spinBtn) spinBtn.disabled = false;
      }
    };

    requestAnimationFrame(frame);
  }

  /**
   * Draw rotated wheel
   * @param {number} deg - Rotation in degrees
   */
  drawRotated(deg) {
    const ctx = gameState.ctx;
    if (!ctx) return;

    const size = WHEEL_CONFIG.size;
    const center = size / 2;

    ctx.clearRect(0, 0, size, size);

    ctx.save();
    ctx.translate(center, center);
    ctx.rotate((deg * Math.PI) / 180);
    ctx.translate(-center, -center);

    this.drawWheel();

    ctx.restore();
  }

  /**
   * Show the result
   * @param {Object} data - Result data
   */
  showResult(data) {
    const el = document.getElementById('result');
    if (!el) return;

    if (data.result === 'ZONK') {
      el.innerText = '😢 ZONK';
    } else {
      el.innerHTML = `🎉 Kamu dapat ${data.result}<br>Voucher: ${data.voucher}`;
    }
  }

  /**
   * Setup navigation
   */
  setupNavigation() {
    initSectionNavigation(
      (section) => this.switchSection(section),
      {
        activeClasses: ['active', 'text-purple-400'],
        inactiveClasses: ['text-gray-400']
      }
    );

    // Pesanan tabs
    document.querySelectorAll('.pesanan-tab').forEach(btn => {
      btn.addEventListener('click', (e) => this.switchPesananTab(e.currentTarget.dataset.tab));
    });

    // Kategori mitra (placeholder)
    document.querySelectorAll('.kategori-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        document.querySelectorAll('.kategori-btn').forEach(b => b.classList.remove('active', 'bg-purple-500/30', 'text-purple-400'));
        btn.classList.add('active', 'bg-purple-500/30', 'text-purple-400');
        this.loadMitra(); // Reload with filter
      });
    });
  }

  /**
   * Switch section
   */
  switchSection(section) {
    this.currentSection = section;

    // Update nav
    document.querySelectorAll('.bottom-nav-item').forEach(item => {
      item.classList.toggle('active', item.dataset.section === section);
      item.classList.toggle('text-purple-400', item.dataset.section === section);
      item.classList.toggle('text-gray-400', item.dataset.section !== section);
    });

    // Update sections
    document.querySelectorAll('.section-content').forEach(sec => {
      sec.classList.toggle('hidden', sec.id !== `section-${section}`);
    });

    // Load data
    this.loadSectionData(section);
  }

  /**
   * Load section data
   */
  async loadSectionData(section) {
    switch (section) {
      case 'dashboard':
        await this.loadDashboardData();
        break;
      case 'mitra':
        await this.loadMitra();
        break;
      case 'pesanan':
        await this.loadPesanan();
        break;
      case 'akun':
        this.loadAkunData();
        break;
    }
  }

  /**
   * Load dashboard data
   */
async loadDashboardData() {
    applyTextSkeleton([
      { target: 'spin-available', width: '52px' },
      { target: 'voucher-active', width: '52px' },
      { target: 'reward-points', width: '64px' }
    ]);
    renderListSkeleton('activity-list', { items: 4, avatar: 'square', trailing: 'none' });
    renderListSkeleton('leaderboard', { items: 4, avatar: 'circle' });

    try {
      const result = await authApi.call('getsiswadata', { userId: this.currentUser.id }, false);
      if (result.success) {
        const stats = result.data || result.stats || {};

        // Update quick info
        clearTextSkeleton(['spin-available', 'voucher-active', 'reward-points']);
        document.getElementById('spin-available').textContent = stats.spinAvailable || result.spinAvailable || 0;
        document.getElementById('voucher-active').textContent = stats.voucherActive || result.voucherActive || 0;
        document.getElementById('reward-points').textContent = stats.points || result.points || 0;

        // Activity
        this.renderActivity(result.activity || []);

        // Leaderboard
        this.renderLeaderboard(result.leaderboard || []);
      } else {
        clearTextSkeleton(['spin-available', 'voucher-active', 'reward-points']);
        document.getElementById('spin-available').textContent = 0;
        document.getElementById('voucher-active').textContent = 0;
        document.getElementById('reward-points').textContent = 0;
        this.renderActivity([]);
        this.renderLeaderboard([]);
      }
    } catch (error) {
      showError('Error', 'Gagal memuat data dashboard');
      clearTextSkeleton(['spin-available', 'voucher-active', 'reward-points']);
      document.getElementById('spin-available').textContent = 0;
      document.getElementById('voucher-active').textContent = 0;
      document.getElementById('reward-points').textContent = 0;
      this.renderActivity([]);
      this.renderLeaderboard([]);
    }
  }

  renderActivity(activities) {
    const container = document.getElementById('activity-list');
    clearContainerSkeleton(container);
    if (activities.length === 0) {
      container.innerHTML = '<div class="text-center py-6 text-gray-500"><i class="fas fa-inbox text-lg mb-2"></i><p class="text-sm">Belum ada aktivitas</p></div>';
      return;
    }
    container.innerHTML = activities.map(act => `
      <div class="glass-card p-4 flex items-center gap-3">
        <div class="w-10 h-10 rounded-xl bg-blue-500/20 flex items-center justify-center text-blue-400 text-sm font-bold">${act.icon || '🎫'}</div>
        <div class="flex-1">
          <div class="font-medium text-sm">${act.title}</div>
          <div class="text-xs text-gray-500">${act.subtitle}</div>
        </div>
        <div class="text-xs text-gray-400">${act.time}</div>
      </div>
    `).join('');
  }

  renderLeaderboard(leaderboard) {
    const container = document.getElementById('leaderboard');
    clearContainerSkeleton(container);
    if (leaderboard.length === 0) {
      container.innerHTML = '<div class="text-center py-4 text-gray-500"><i class="fas fa-crown text-lg mb-2"></i><p class="text-xs">Belum ada leaderboard</p></div>';
      return;
    }
    container.innerHTML = leaderboard.slice(0, 10).map((user, idx) => `
      <div class="flex items-center gap-3 p-3 bg-white/5 rounded-lg">
        <div class="w-8 h-8 rounded-full bg-gradient-to-r from-yellow-400 to-orange-400 text-white flex items-center justify-center text-xs font-bold">${idx + 1}</div>
        <div class="flex-1">
          <div class="font-medium text-sm">${user.name}</div>
          <div class="text-xs text-gray-400">${user.kelas}</div>
        </div>
        <div class="text-sm font-bold text-purple-400">${user.score}</div>
      </div>
    `).join('');
  }

  /**
   * Load mitra list
   */
async loadMitra() {
    renderCardSkeleton('mitra-list', { items: 3, footer: true });
    try {
      const result = await authApi.call('getmitra', { role: 'siswa' }, false);
      if (result.success) {
        this.data.mitra = result.mitra || [];
        this.renderMitra();
      } else {
        this.data.mitra = [];
        this.renderMitra();
      }
    } catch (error) {
      this.data.mitra = [];
      this.renderMitra();
      showError('Error', 'Gagal memuat mitra');
    }
  }

  renderMitra() {
    const container = document.getElementById('mitra-list');
    clearContainerSkeleton(container);
    const search = document.getElementById('mitra-search').value.toLowerCase();
    const filtered = this.data.mitra.filter(m => 
      m.nama.toLowerCase().includes(search) || 
      m.kategori.toLowerCase().includes(search)
    );

    if (filtered.length === 0) {
      container.innerHTML = '<div class="text-center py-12 text-gray-500"><i class="fas fa-store-slash text-3xl mb-4 opacity-50"></i><p class="text-lg">Mitra tidak ditemukan</p></div>';
      return;
    }

    container.innerHTML = filtered.map(mitra => `
      <div class="glass-card p-4 cursor-pointer hover:bg-white/10 transition-all rounded-xl" onclick="dashboard.pesanDiMitra('${mitra.id}')">
        <div class="flex items-start gap-4">
          <img src="${mitra.foto || 'data:image/svg+xml;base64,...'}" alt="${mitra.nama}" class="w-20 h-20 rounded-xl object-cover">
          <div class="flex-1">
            <div class="font-bold text-lg mb-1">${mitra.nama}</div>
            <div class="text-sm text-gray-400 mb-2">${mitra.kategori}</div>
            <div class="text-xs text-gray-500">${mitra.alamat?.slice(0, 50)}...</div>
            <div class="flex gap-2 mt-2">
              <span class="badge badge-success text-xs">⭐ ${mitra.rating || 4.5}</span>
              <span class="badge badge-primary text-xs">${mitra.jarak || '1.2km'}</span>
            </div>
          </div>
        </div>
      </div>
    `).join('');
  }

  /**
   * Load pesanan
   */
async loadPesanan() {
    renderCardSkeleton('pesanan-list', { items: 3, footer: true });
    try {
      const result = await authApi.call('getpesanan', { userId: this.currentUser.id }, false);
      if (result.success) {
        this.data.pesanan = result.pesanan || [];
        this.renderPesanan('aktif');
      } else {
        this.data.pesanan = [];
        this.renderPesanan('aktif');
      }
    } catch (error) {
      this.data.pesanan = [];
      this.renderPesanan('aktif');
      showError('Error', 'Gagal memuat pesanan');
    }
  }

  switchPesananTab(tab) {
    document.querySelectorAll('.pesanan-tab').forEach(btn => {
      btn.classList.remove('active', 'bg-green-500/20', 'text-green-400');
      btn.classList.add('bg-gray-500/20', 'text-gray-400');
    });
    const activeBtn = document.querySelector(`.pesanan-tab[data-tab="${tab}"]`);
    activeBtn?.classList.add('active', 'bg-green-500/20', 'text-green-400');
    activeBtn?.classList.remove('bg-gray-500/20', 'text-gray-400');

    this.renderPesanan(tab);
  }

  renderPesanan(status) {
    const filtered = this.data.pesanan.filter(p => p.status === status);
    const container = document.getElementById('pesanan-list');
    clearContainerSkeleton(container);

    if (filtered.length === 0) {
      container.innerHTML = '<div class="text-center py-12 text-gray-500"><i class="fas fa-receipt text-3xl mb-4 opacity-50"></i><p class="text-lg">Belum ada pesanan ' + status + '</p></div>';
      return;
    }

    container.innerHTML = filtered.map(pesan => `
      <div class="glass-card p-4 rounded-xl cursor-pointer hover:bg-white/10" onclick="dashboard.showPesananDetail('${pesan.id}')">
        <div class="flex items-start gap-4">
          <img src="${pesan.mitraFoto}" alt="${pesan.mitraNama}" class="w-16 h-16 rounded-xl">
          <div class="flex-1">
            <div class="font-bold text-lg">${pesan.produk}</div>
            <div class="text-sm text-gray-400 mb-1">${pesan.mitraNama}</div>
            <div class="inline-flex items-center gap-1 text-xs mb-2">
              <i class="fas fa-tag text-green-400"></i> Rp ${pesan.total}
              ${pesan.voucher && `<span class="text-xs bg-green-500/20 text-green-400 px-2 py-1 rounded-full">Voucher</span>`}
            </div>
            <div class="text-xs text-gray-500">Status: <span class="font-bold capitalize">${pesan.status}</span></div>
          </div>
          <div class="text-right">
            <div class="text-sm font-bold text-purple-400 mb-1">QR Ready</div>
            <div class="text-xs text-gray-400">${new Date(pesan.expired).toLocaleString()}</div>
          </div>
        </div>
      </div>
    `).join('');
  }

  /**
   * Load akun data
   */
  loadAkunData() {
    // Data profil sudah dipasang saat init.
  }

  /**
   * Event listeners
   */
  setupEventListeners() {
    // Search mitra
    document.getElementById('mitra-search').addEventListener('input', (e) => {
      this.renderMitra(e.target.value);
    });

    // Menu items
    document.querySelectorAll('.menu-item').forEach(item => {
      item.addEventListener('click', (e) => {
        const action = e.currentTarget.dataset.action;
        this.handleAkunAction(action);
      });
    });

    // Edit profile etc.
    document.getElementById('edit-profile-btn').addEventListener('click', () => showInfo('Edit Profil', 'Fitur segera hadir'));

    // Logout
    document.getElementById('logout-btn').addEventListener('click', () => {
      if (confirm('Logout?')) authGuard.logout();
    });
  }

  handleAkunAction(action) {
    const actions = {
      voucher: () => showInfo('Voucher', 'Lihat di dashboard'),
      'riwayat-spin': () => showInfo('Riwayat Spin', 'Fitur segera hadir'),
      'riwayat-pesanan': () => this.switchSection('pesanan'),
      notifikasi: () => showInfo('Notifikasi', '0 notifikasi baru'),
      bantuan: () => showInfo('Bantuan', 'FAQ & Support')
    };
    actions[action]?.() || showInfo('Menu', action);
  }

  // ... keep existing game methods: initGame, startGame, spinWheel, etc.
}

// Keep existing WHEEL_CONFIG and game methods here...

// Export & Auto-init
export { SiswaDashboard };

document.addEventListener('DOMContentLoaded', () => {
  window.dashboard = new SiswaDashboard();
  window.dashboard.init();
  window.startGame = () => window.dashboard.startGame();
  window.spinWheel = () => window.dashboard.spinWheel();
});

