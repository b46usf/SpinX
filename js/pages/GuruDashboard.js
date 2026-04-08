/**
 * Guru Dashboard Module
 * Modular dashboard logic for guru/teacher role
 * Clean, DRY, best practice
 */

import { authGuard } from '../core/AuthGuard.js';
import { themeManager } from '../core/ThemeManager.js';
import { initSectionNavigation, switchSection, initTabNavigation, switchTab } from '../core/NavigationUtils.js';
import { DOMUtils } from '../core/DOMUtils.js';
import { ToastUtils } from '../core/ToastUtils.js';
import { authApi } from '../auth/AuthApi.js';
import {
  applyTextSkeleton,
  clearTextSkeleton,
  renderListSkeleton,
  clearContainerSkeleton
} from '../components/utils/DashboardSkeleton.js';

const Toast = ToastUtils;

class GuruDashboard {
  constructor() {
    this.currentSection = 'dashboard';
    this.currentUser = null;
    this.kelasId = null;
    this.data = {
      stats: {},
      siswa: [],
      kelas: [],
      rewards: {}
    };
  }

  renderDashboardShell() {
    const appContainer = document.getElementById('app');
    if (!appContainer) {
      console.error('[GuruDashboard] #app container not found');
      return false;
    }

    appContainer.innerHTML = `
      <header class="fixed top-0 left-0 right-0 z-40 glass-card border-b border-white/10">
        <div class="flex justify-between items-center px-4 py-3">
          <div class="flex items-center gap-3">
            <div class="w-9 h-9 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
              <i class="fas fa-chalkboard-teacher text-white text-sm"></i>
            </div>
            <div>
              <h1 class="text-base font-bold text-white">SpinX <span class="text-gradient">Guru</span></h1>
              <p class="text-xs text-gray-400" id="kelas-name">Kelas</p>
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
                <h2 class="text-lg font-bold">Welcome, <span id="welcome-name" class="text-gradient"></span>! 📚</h2>
                <p class="text-xs text-gray-400">Kelola siswa dan beri reward</p>
              </div>
              <div class="text-right">
                <p class="text-xs text-gray-500" id="current-date"></p>
              </div>
            </div>
          </div>

          <div class="grid grid-cols-3 gap-3 mb-4">
            <div class="glass-card p-3 text-center animate-fade-in-up delay-1">
              <div class="text-2xl mb-1">👨‍🎓</div>
              <div class="text-xl font-bold text-gradient" id="stat-siswa">-</div>
              <div class="text-xs text-gray-400">Siswa</div>
            </div>
            <div class="glass-card p-3 text-center animate-fade-in-up delay-2">
              <div class="text-2xl mb-1">🎮</div>
              <div class="text-xl font-bold text-gradient" id="stat-spin">-</div>
              <div class="text-xs text-gray-400">Spin Hari Ini</div>
            </div>
            <div class="glass-card p-3 text-center animate-fade-in-up delay-3">
              <div class="text-2xl mb-1">🎫</div>
              <div class="text-xl font-bold text-gradient" id="stat-voucher">-</div>
              <div class="text-xs text-gray-400">Voucher</div>
            </div>
          </div>

          <div class="glass-card p-4 mb-4 animate-fade-in-up delay-3">
            <h3 class="text-sm font-bold mb-3 flex items-center gap-2">
              <i class="fas fa-trophy text-yellow-400"></i>
              Top Siswa
            </h3>
            <div class="space-y-2" id="top-siswa-list">
              <div class="text-center py-4 text-gray-500">
                <i class="fas fa-spinner fa-spin text-lg mb-2"></i>
                <p class="text-xs">Memuat...</p>
              </div>
            </div>
          </div>

          <div class="glass-card p-4 animate-fade-in-up delay-4">
            <h3 class="text-sm font-bold mb-3 flex items-center gap-2">
              <i class="fas fa-history text-cyan-400"></i>
              Aktivitas Terbaru
            </h3>
            <div class="space-y-2" id="activity-list">
              <div class="text-center py-4 text-gray-500">
                <i class="fas fa-spinner fa-spin text-lg mb-2"></i>
                <p class="text-xs">Memuat...</p>
              </div>
            </div>
          </div>
        </section>

        <section id="section-siswa" class="section-content hidden">
          <div class="glass-card p-4 mb-4 animate-fade-in-up">
            <div class="flex items-center justify-between mb-3">
              <h3 class="text-sm font-bold">Daftar Siswa</h3>
              <button id="add-siswa-btn" class="btn btn-primary text-xs py-1 px-2">
                <i class="fas fa-plus"></i>Tambah Siswa
              </button>
            </div>
            <div class="relative mb-4">
              <input type="text" id="siswa-search" placeholder="Cari siswa..." class="input text-sm py-2 pl-9">
              <i class="fas fa-search absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 text-sm"></i>
            </div>
            <div class="space-y-2" id="siswa-list">
              <div class="text-center py-6 text-gray-500">
                <i class="fas fa-spinner fa-spin text-xl mb-2"></i>
                <p class="text-sm">Memuat data siswa...</p>
              </div>
            </div>
          </div>
        </section>

        <section id="section-reward" class="section-content hidden">
          <div class="flex gap-2 mb-4">
            <button class="reward-tab-btn active flex-1 py-2 px-3 rounded-lg bg-purple-500/20 text-purple-400 text-sm font-medium" data-tab="wheel">
              <i class="fas fa-circle-notch mr-1"></i>Lucky Wheel
            </button>
            <button class="reward-tab-btn flex-1 py-2 px-3 rounded-lg bg-white/5 text-gray-400 text-sm font-medium" data-tab="voucher">
              <i class="fas fa-ticket-alt mr-1"></i>Voucher
            </button>
            <button class="reward-tab-btn flex-1 py-2 px-3 rounded-lg bg-white/5 text-gray-400 text-sm font-medium" data-tab="history">
              <i class="fas fa-history mr-1"></i>History
            </button>
          </div>

          <div id="reward-wheel" class="reward-content">
            <div class="glass-card p-4 mb-4 animate-fade-in-up">
              <div class="flex items-center justify-between mb-3">
                <h3 class="text-sm font-bold">Lucky Wheel Configuration</h3>
                <button id="edit-wheel-btn" class="btn btn-secondary text-xs py-1 px-2">
                  <i class="fas fa-edit"></i>Edit
                </button>
              </div>
              <div class="space-y-2" id="wheel-slices">
                <div class="text-center py-4 text-gray-500">
                  <i class="fas fa-spinner fa-spin text-lg mb-2"></i>
                  <p class="text-xs">Memuat konfigurasi wheel...</p>
                </div>
              </div>
            </div>
          </div>

          <div id="reward-voucher" class="reward-content hidden">
            <div class="glass-card p-4 mb-4 animate-fade-in-up">
              <div class="flex items-center justify-between mb-3">
                <h3 class="text-sm font-bold">Voucher Management</h3>
                <button id="add-voucher-btn" class="btn btn-primary text-xs py-1 px-2">
                  <i class="fas fa-plus"></i>Tambah
                </button>
              </div>
              <div class="space-y-2" id="voucher-list">
                <div class="text-center py-4 text-gray-500">
                  <i class="fas fa-spinner fa-spin text-lg mb-2"></i>
                  <p class="text-xs">Memuat voucher...</p>
                </div>
              </div>
            </div>
          </div>

          <div id="reward-history" class="reward-content hidden">
            <div class="glass-card p-4 animate-fade-in-up">
              <h3 class="text-sm font-bold mb-3 flex items-center gap-2">
                <i class="fas fa-history text-cyan-400"></i>
                Riwayat Reward
              </h3>
              <div class="space-y-2" id="voucher-history">
                <div class="text-center py-4 text-gray-500">
                  <i class="fas fa-spinner fa-spin text-lg mb-2"></i>
                  <p class="text-xs">Memuat history...</p>
                </div>
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
                <span class="badge badge-primary text-xs">Guru</span>
              </div>
            </div>
          </div>

          <div class="glass-card p-4 mb-4 animate-fade-in-up delay-1">
            <h3 class="text-sm font-bold mb-3 flex items-center gap-2">
              <i class="fas fa-school text-purple-400"></i>
              Info Kelas
            </h3>
            <div class="space-y-3">
              <div class="flex items-center justify-between p-3 bg-white/5 rounded-lg">
                <span class="text-sm">Nama Kelas</span>
                <span class="text-sm text-gray-300" id="kelas-nama">-</span>
              </div>
              <div class="flex items-center justify-between p-3 bg-white/5 rounded-lg">
                <span class="text-sm">Total Siswa</span>
                <span class="text-sm text-gray-300" id="kelas-siswa">-</span>
              </div>
              <div class="flex items-center justify-between p-3 bg-white/5 rounded-lg">
                <span class="text-sm">Total Spin</span>
                <span class="text-sm text-gray-300" id="kelas-spin">-</span>
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

          <button class="bottom-nav-item flex flex-col items-center justify-center py-2 px-3 rounded-xl transition-all text-gray-400" data-section="siswa">
            <i class="fas fa-users text-lg mb-1"></i>
            <span class="text-xs">Siswa</span>
          </button>

          <button class="bottom-nav-item flex flex-col items-center justify-center py-2 px-3 rounded-xl transition-all text-gray-400" data-section="reward">
            <i class="fas fa-gift text-lg mb-1"></i>
            <span class="text-xs">Reward</span>
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
   * Initialize guru dashboard
   */
  async init() {
    // Render the dashboard shell first
    if (!this.renderDashboardShell()) {
      console.error('[GuruDashboard] Failed to render dashboard shell');
      return;
    }

    // Auth protection - guru role only
    const authResult = authGuard.init('guru', {
      avatarId: 'user-avatar',
      nameId: 'user-name',
      welcomeId: 'welcome-name',
      logoutId: 'logout-btn'
    });
    if (!authResult) return;

    this.currentUser = authGuard.getUser();
    
    // Final subscription check
    try {
      await window.SubscriptionGuard?.verify?.(this.currentUser);
    } catch (error) {
      // Guard handles toast/redirect
      return;
    }
    
    this.kelasId = this.currentUser.kelasId || this.currentUser.kelas;
    
    themeManager.init();
    this.setupProfile();
    this.setupNavigation();
    this.setupEventListeners();
    this.setCurrentDate();
    this.showInitialSkeletons();
    
    DOMUtils.setText('kelas-name', this.currentUser.kelasName || 'Kelas');

    await this.loadDashboardData();
    await this.loadAkunData();
  }

  setupProfile() {
    // Avatar and name are handled by authGuard.init()
    // Only set profile section data
    DOMUtils.setText('profile-name', this.currentUser.name);
    DOMUtils.setText('profile-email', this.currentUser.email);
  }

  setupNavigation() {
    initSectionNavigation(
      (section) => this.switchSection(section),
      {
        activeClasses: ['active', 'text-purple-400'],
        inactiveClasses: ['text-gray-400']
      }
    );
  }

  switchSection(section) {
    this.currentSection = section;

    switchSection(section, {
      activeClasses: ['active', 'text-purple-400'],
      inactiveClasses: ['text-gray-400']
    });

    this.loadSectionData(section);
  }

  setupEventListeners() {
    DOMUtils.bindClick('logout-btn', () => this.handleLogout());

    document.querySelectorAll('.reward-tab-btn').forEach(btn => {
      btn.addEventListener('click', () => this.switchRewardTab(btn.dataset.tab));
    });

    DOMUtils.bindInput('siswa-search', (e) => this.filterSiswa(e.target.value));

    // Reward buttons (placeholders - implement API calls)
    DOMUtils.bindClick('beri-spin-btn', () => this.giveReward('spin'));
    DOMUtils.bindClick('beri-voucher-btn', () => this.giveReward('voucher'));
    DOMUtils.bindClick('beri-poin-btn', () => this.giveReward('poin'));
  }

  setCurrentDate() {
    DOMUtils.setText('current-date', new Date().toLocaleDateString('id-ID', {
      weekday: 'long', day: 'numeric', month: 'long'
    }));
  }

  showInitialSkeletons() {
    applyTextSkeleton([
      { target: 'stat-siswa-kelas', width: '58px' },
      { target: 'stat-spin-kelas', width: '58px' },
      { target: 'stat-voucher-kelas', width: '58px' },
      { target: 'stat-siswa-aktif', width: '58px' },
      { target: 'stat-hadir', width: '58px' }
    ]);
    renderListSkeleton('top-siswa-kelas', { items: 4, avatar: 'circle' });
    renderListSkeleton('aktivitas-terbaru', { items: 4, avatar: 'circle', trailing: 'none' });
    renderListSkeleton('siswa-list', { items: 4, avatar: 'circle', trailing: 'icon' });
  }

  switchRewardTab(tab) {
    switchTab(tab, {
      tabSelector: '.reward-tab-btn',
      contentSelector: '.reward-content',
      activeClasses: ['active'],
      inactiveClasses: [],
      contentPrefix: 'reward-',
      hiddenClass: 'hidden'
    });
  }

  filterSiswa(query) {
    const filtered = this.data.siswa.filter(siswa => 
      siswa.nama.toLowerCase().includes(query.toLowerCase()) ||
      siswa.nis.toLowerCase().includes(query.toLowerCase())
    );
    this.renderSiswaList(filtered);
  }

  async loadSectionData(section) {
    switch (section) {
      case 'siswa':
        if (this.data.siswa.length === 0) await this.loadSiswa();
        break;
      case 'reward':
        await this.loadRewardData();
        break;
      case 'akun':
        this.loadAkunData();
        break;
    }
  }

async loadDashboardData() {
    applyTextSkeleton([
      { target: 'stat-siswa-kelas', width: '58px' },
      { target: 'stat-spin-kelas', width: '58px' },
      { target: 'stat-voucher-kelas', width: '58px' },
      { target: 'stat-siswa-aktif', width: '58px' },
      { target: 'stat-hadir', width: '58px' }
    ]);
    renderListSkeleton('top-siswa-kelas', { items: 4, avatar: 'circle' });
    renderListSkeleton('aktivitas-terbaru', { items: 4, avatar: 'circle', trailing: 'none' });

    try {
      const result = await authApi.call('getgurudashboard', { kelasId: this.kelasId }, false);
      if (result.success) {
        this.data.stats = result.stats;
        this.updateDashboardStats();
        this.renderTopSiswa(result.topSiswa || []);
        this.renderAktivitas(result.aktivitas || []);
      } else {
        this.data.stats = {};
        this.updateDashboardStats();
        this.renderTopSiswa([]);
        this.renderAktivitas([]);
      }
    } catch (error) {
      console.error(error);
      this.data.stats = {};
      this.updateDashboardStats();
      this.renderTopSiswa([]);
      this.renderAktivitas([]);
      window.Toast?.error('Error', 'Gagal memuat dashboard');
    }
  }

  updateDashboardStats() {
    const stats = this.data.stats;
    clearTextSkeleton([
      'stat-siswa-kelas',
      'stat-spin-kelas',
      'stat-voucher-kelas',
      'stat-siswa-aktif',
      'stat-hadir'
    ]);
    DOMUtils.setText('stat-siswa-kelas', stats.siswaKelas || 0);
    DOMUtils.setText('stat-spin-kelas', stats.spinKelas || 0);
    DOMUtils.setText('stat-voucher-kelas', stats.voucherKelas || 0);
    DOMUtils.setText('stat-siswa-aktif', stats.siswaAktif || 0);
    DOMUtils.setText('stat-hadir', stats.hadir || 0);
  }

  renderTopSiswa(siswa) {
    const container = document.getElementById('top-siswa-kelas');
    clearContainerSkeleton(container);
    if (siswa.length === 0) {
      container.innerHTML = '<div class="text-center py-4 text-gray-500"><i class="fas fa-trophy text-lg mb-2"></i><p class="text-xs">Belum ada data</p></div>';
      return;
    }
    container.innerHTML = siswa.slice(0, 5).map((s, idx) => `
      <div class="flex items-center gap-3 p-2 bg-white/5 rounded-lg">
        <span class="text-lg font-bold text-yellow-400">${idx+1}</span>
        <div class="flex-1">
          <div class="font-medium text-xs">${s.nama}</div>
          <div class="text-xs text-gray-500">${s.nis}</div>
        </div>
        <span class="text-xs text-purple-400">${s.spin} spin</span>
      </div>
    `).join('');
  }

  renderAktivitas(activities) {
    const container = document.getElementById('aktivitas-terbaru');
    clearContainerSkeleton(container);
    if (activities.length === 0) {
      container.innerHTML = '<div class="text-center py-4 text-gray-500"><i class="fas fa-history text-lg mb-2"></i><p class="text-xs">Belum ada aktivitas</p></div>';
      return;
    }
    container.innerHTML = activities.slice(0, 10).map(a => `
      <div class="flex items-center gap-3 p-3 bg-white/5 rounded-lg">
        <div class="w-8 h-8 bg-blue-500/20 rounded-full flex items-center justify-center">
          <i class="fas fa-user text-blue-400 text-xs"></i>
        </div>
        <div class="flex-1">
          <div class="font-medium text-xs">${a.siswa}</div>
          <div class="text-xs text-gray-500">${a.aktivitas}</div>
        </div>
        <div class="text-xs text-gray-500">${a.waktu}</div>
      </div>
    `).join('');
  }

async loadSiswa() {
    renderListSkeleton('siswa-list', { items: 4, avatar: 'circle', trailing: 'icon' });
    try {
      const result = await authApi.call('getsiswakelas', { kelasId: this.kelasId }, false);
      if (result.success) {
        this.data.siswa = result.siswa;
        this.renderSiswaList(result.siswa);
      } else {
        this.data.siswa = [];
        this.renderSiswaList([]);
      }
    } catch (error) {
      console.error(error);
      this.data.siswa = [];
      this.renderSiswaList([]);
      Toast.error('Error', 'Gagal memuat siswa');
    }
  }

  renderSiswaList(siswa) {
    const container = document.getElementById('siswa-list');
    clearContainerSkeleton(container);
    if (siswa.length === 0) {
      container.innerHTML = '<div class="text-center py-6 text-gray-500"><i class="fas fa-user-graduate text-xl mb-2"></i><p class="text-sm">Belum ada siswa</p></div>';
      return;
    }
    container.innerHTML = siswa.map(s => `
      <div class="glass-card p-3 flex items-center gap-3 hover:bg-white/10 cursor-pointer" onclick="window.dashboard.showSiswaDetail('${s.id}')">
        <div class="w-12 h-12 rounded-full bg-gradient-to-r from-blue-400 to-cyan-400 flex items-center justify-center text-white font-bold text-sm">${s.nama.charAt(0)}</div>
        <div class="flex-1 min-w-0">
          <div class="font-medium text-sm">${s.nama}</div>
          <div class="text-xs text-gray-500">${s.nis} • ${s.status}</div>
        </div>
        <i class="fas fa-chevron-right text-gray-500"></i>
      </div>
    `).join('');
  }

  showSiswaDetail(id) {
    Toast.info('Detail Siswa', `Show history reward for siswa ${id}`);
    // Implement modal/detail
  }

  async loadRewardData() {
    // Load siswa dropdowns for rewards
    const siswaOptions = [{value: '', text: 'Pilih Siswa'}].concat(
      this.data.siswa.map(s => ({value: s.id, text: s.nama}))
    );
    ['spin-siswa', 'voucher-siswa', 'poin-siswa'].forEach(id => {
      const select = document.getElementById(id);
      if (select) select.innerHTML = siswaOptions.map(opt => `<option value="${opt.value}">${opt.text}</option>`).join('');
    });
  }

  giveReward(type) {
    const siswaId = document.getElementById(`${type}-siswa`)?.value;
    if (!siswaId) {
      window.Toast?.warning('Pilih Siswa', 'Harap pilih siswa terlebih dahulu');
      return;
    }
    
    let jumlah;
    if (type === 'voucher') {
      jumlah = document.getElementById('voucher-kode')?.value;
    } else {
      jumlah = parseInt(document.getElementById(`${type}-jumlah`)?.value) || 0;
      if (!jumlah) {
        window.Toast?.warning('Jumlah', 'Masukkan jumlah yang valid');
        return;
      }
    }
    
window.Toast?.loading('Memberikan reward...');
    // Call API: authApi.call('givereward', {kelasId, siswaId, type, jumlah})
    setTimeout(() => { // Simulate
window.Toast?.closeLoading();
      Toast.success('Berhasil', `Reward ${type} diberikan!`);
      // Refresh lists
      this.loadDashboardData();
    }, 1500);
  }

  async loadAkunData() {
    // Load kelas list
    const container = document.getElementById('kelas-list');
    container.innerHTML = `
      <div class="p-3 bg-white/5 rounded-lg cursor-pointer hover:bg-white/10" onclick="window.dashboard.manageKelas()">
        <div class="font-medium">XII IPA 1</div>
        <div class="text-xs text-gray-400">25 siswa • Aktif</div>
      </div>
    `;
  }

  manageKelas() {
    Toast.info('Kelola Kelas', 'Manage kelas interface');
  }

  handleLogout() {
    Toast.fire({
      title: 'Logout?',
      icon: 'warning',
      showCancelButton: true
    }).then(r => r.isConfirmed && authGuard.logout());
  }
}

// Export
export { GuruDashboard };

// Auto-init when DOM ready
document.addEventListener('DOMContentLoaded', () => {
  const dashboard = new GuruDashboard();
  window.dashboard = dashboard;
  dashboard.init();
});

