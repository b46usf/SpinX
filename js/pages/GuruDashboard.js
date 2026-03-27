/**
 * Guru Dashboard Module
 * Modular dashboard logic for guru/teacher role
 * Clean, DRY, best practice
 */

import { authGuard } from '../core/AuthGuard.js';
import { themeManager } from '../core/ThemeManager.js';
import { authApi } from '../auth/AuthApi.js';
import {
  applyTextSkeleton,
  clearTextSkeleton,
  renderListSkeleton,
  clearContainerSkeleton
} from '../components/utils/DashboardSkeleton.js';

const Toast = new Proxy({}, {
  get(_, prop) {
    if (prop === 'fire') {
      return (...args) => window.Toast?.Swal?.fire?.(...args);
    }

    const value = window.Toast?.[prop];
    return typeof value === 'function' ? value.bind(window.Toast) : value;
  }
});

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

  /**
   * Initialize guru dashboard
   */
  async init() {
    // Auth protection - guru role only
    const authResult = authGuard.init('guru', {
      avatarId: 'user-avatar',
      welcomeId: 'welcome-name'
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
    
    document.getElementById('kelas-name').textContent = this.currentUser.kelasName || 'Kelas';

    await this.loadDashboardData();
    await this.loadAkunData();
  }

  setupProfile() {
    const avatar = document.getElementById('user-avatar');
    if (avatar) {
      avatar.src = this.currentUser.picture || `https://ui-avatars.com/api/?name=${encodeURIComponent(this.currentUser.name)}&background=random`;
    }

    const profileAvatar = document.getElementById('profile-avatar');
    if (profileAvatar) profileAvatar.src = avatar.src;

    document.getElementById('profile-name').textContent = this.currentUser.name;
    document.getElementById('profile-email').textContent = this.currentUser.email;
  }

  setupNavigation() {
    document.querySelectorAll('.bottom-nav-item').forEach(item => {
      item.addEventListener('click', () => this.switchSection(item.dataset.section));
    });
  }

  switchSection(section) {
    this.currentSection = section;

    document.querySelectorAll('.bottom-nav-item').forEach(item => {
      item.classList.toggle('active', item.dataset.section === section);
    });

    document.querySelectorAll('.section-content').forEach(sec => {
      sec.classList.toggle('hidden', sec.id !== `section-${section}`);
    });

    this.loadSectionData(section);
  }

  setupEventListeners() {
    const logoutBtn = document.getElementById('logout-btn');
    if (logoutBtn) logoutBtn.addEventListener('click', () => this.handleLogout());

    document.querySelectorAll('.reward-tab-btn').forEach(btn => {
      btn.addEventListener('click', () => this.switchRewardTab(btn.dataset.tab));
    });

    const siswaSearch = document.getElementById('siswa-search');
    if (siswaSearch) siswaSearch.addEventListener('input', (e) => this.filterSiswa(e.target.value));

    // Reward buttons (placeholders - implement API calls)
    document.getElementById('beri-spin-btn')?.addEventListener('click', () => this.giveReward('spin'));
    document.getElementById('beri-voucher-btn')?.addEventListener('click', () => this.giveReward('voucher'));
    document.getElementById('beri-poin-btn')?.addEventListener('click', () => this.giveReward('poin'));
  }

  setCurrentDate() {
    document.getElementById('current-date').textContent = new Date().toLocaleDateString('id-ID', {
      weekday: 'long', day: 'numeric', month: 'long'
    });
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
    document.querySelectorAll('.reward-tab-btn').forEach(btn => btn.classList.toggle('active', btn.dataset.tab === tab));
    document.querySelectorAll('.reward-content').forEach(content => content.classList.toggle('hidden', content.id !== `reward-${tab}`));
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
    document.getElementById('stat-siswa-kelas').textContent = stats.siswaKelas || 0;
    document.getElementById('stat-spin-kelas').textContent = stats.spinKelas || 0;
    document.getElementById('stat-voucher-kelas').textContent = stats.voucherKelas || 0;
    document.getElementById('stat-siswa-aktif').textContent = stats.siswaAktif || 0;
    document.getElementById('stat-hadir').textContent = stats.hadir || 0;
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

