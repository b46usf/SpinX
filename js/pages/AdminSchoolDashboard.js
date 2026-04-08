/**
 * AdminSchoolDashboard
 * Thin UI shell for admin-school dashboard.
 * All business/data logic is delegated to the orchestrator + services.
 */
import { authGuard } from '../core/AuthGuard.js';
import { themeManager } from '../core/ThemeManager.js';
import { initSectionNavigation, switchSection, initTabNavigation, switchTab } from '../core/NavigationUtils.js';
import { DOMUtils } from '../core/DOMUtils.js';
import { authApi } from '../auth/AuthApi.js';
import { WebSocketClient } from '../core/WebSocketClient.js';
import { NotificationManager } from '../core/NotificationManager.js';
import {
  applyTextSkeleton,
  renderListSkeleton,
  renderInfoSkeleton
} from '../components/utils/DashboardSkeleton.js';
import { createOrchestrator } from './AdminSchoolOrchestrator.js';
import { showImportModal } from '../components/modals/ImportModal.js';

const Toast = window.Toast;

const USER_ROLES = ['siswa', 'guru', 'mitra'];
const LIST_SKELETON_IDS = ['top-siswa-list', 'activity-list', 'siswa-list', 'guru-list', 'mitra-list'];
const TEXT_SKELETON_TARGETS = [
  { target: 'stat-siswa', width: '52px' },
  { target: 'stat-spin', width: '64px' },
  { target: 'stat-voucher', width: '58px' },
  { target: 'stat-siswa-aktif', width: '56px' },
  { target: 'stat-guru-aktif', width: '56px' },
  { target: 'stat-mitra-aktif', width: '56px' },
  { target: 'sekolah-nama', width: '52%' },
  { target: 'sekolah-plan', width: '70px' },
  { target: 'sekolah-users', width: '44px' },
  { target: 'sekolah-guru', width: '44px' },
  { target: 'subscription-plan', width: '70px' },
  { target: 'subscription-status', width: '78px' },
  { target: 'subscription-expired', width: '110px' }
];

function getElement(id) {
  return DOMUtils.getElement(id);
}

function setText(id, value) {
  DOMUtils.setText(id, value);
}

function setHidden(id, hidden) {
  DOMUtils.toggleVisibility(id, !hidden);
}

function bindClick(id, handler) {
  DOMUtils.bindClick(id, handler);
}

export class AdminSchoolDashboard {
  constructor() {
    this.schoolId = null;
    this.currentSection = 'dashboard';
    this.currentImportRole = 'siswa';
    this.orchestrator = null;
    this.webSocketClient = null;
    this.notificationManager = null;
    this.loadedUserTabs = Object.fromEntries(USER_ROLES.map(role => [role, false]));
  }

  renderDashboardShell() {
    const appContainer = document.getElementById('app');
    if (!appContainer) {
      console.error('[AdminSchoolDashboard] #app container not found');
      return false;
    }

    appContainer.innerHTML = `
      <header class="fixed top-0 left-0 right-0 z-40 glass-card border-b border-white/10">
        <div class="flex justify-between items-center px-4 py-3">
          <div class="flex items-center gap-3">
            <div class="w-9 h-9 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
              <i class="fas fa-school text-white text-sm"></i>
            </div>
            <div>
              <h1 class="text-base font-bold text-white">SpinX <span class="text-gradient">Admin</span></h1>
              <p class="text-xs text-gray-400" id="school-name">Sekolah</p>
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
                <h2 class="text-lg font-bold">Welcome, <span id="welcome-name" class="text-gradient"></span>! 🔥</h2>
                <p class="text-xs text-gray-400">Kelola sekolah dengan mudah</p>
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

        <section id="section-users" class="section-content hidden">
          <div class="grid grid-cols-3 gap-3 mb-4">
            <div class="glass-card p-3 text-center animate-fade-in-up">
              <div class="text-lg font-bold text-gradient" id="stat-siswa-aktif">-</div>
              <div class="text-xs text-gray-400">Siswa Aktif</div>
            </div>
            <div class="glass-card p-3 text-center animate-fade-in-up delay-1">
              <div class="text-lg font-bold text-gradient" id="stat-guru-aktif">-</div>
              <div class="text-xs text-gray-400">Guru Aktif</div>
            </div>
            <div class="glass-card p-3 text-center animate-fade-in-up delay-2">
              <div class="text-lg font-bold text-gradient" id="stat-mitra-aktif">-</div>
              <div class="text-xs text-gray-400">Mitra Aktif</div>
            </div>
          </div>

          <div class="flex gap-2 mb-4 overflow-x-auto pb-2">
            <button class="user-tab-btn active flex-shrink-0 py-2 px-4 rounded-lg bg-purple-500/20 text-purple-400 text-sm font-medium" data-tab="siswa">
              <i class="fas fa-user-graduate mr-1"></i>Siswa
            </button>
            <button class="user-tab-btn flex-shrink-0 py-2 px-4 rounded-lg bg-white/5 text-gray-400 text-sm font-medium" data-tab="guru">
              <i class="fas fa-chalkboard-teacher mr-1"></i>Guru
            </button>
            <button class="user-tab-btn flex-shrink-0 py-2 px-4 rounded-lg bg-white/5 text-gray-400 text-sm font-medium" data-tab="mitra">
              <i class="fas fa-store mr-1"></i>Mitra
            </button>
          </div>

          <div class="flex gap-2 mb-4">
            <button id="add-user-btn" class="flex-1 btn btn-primary text-sm py-2">
              <i class="fas fa-plus"></i>Tambah
            </button>
            <button id="import-user-btn" class="btn btn-secondary text-sm py-2 px-3" data-role="siswa">
              <i class="fas fa-file-import"></i>Import XLS
            </button>
          </div>

          <div class="relative mb-4">
            <input type="text" id="user-search" placeholder="Cari user..." class="input text-sm py-2 pl-9">
            <i class="fas fa-search absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 text-sm"></i>
          </div>

          <div id="user-list-siswa" class="user-list-content">
            <div class="space-y-2" id="siswa-list">
              <div class="text-center py-6 text-gray-500">
                <i class="fas fa-spinner fa-spin text-2xl mb-2"></i>
                <p>Memuat data siswa...</p>
              </div>
            </div>
          </div>

          <div id="user-list-guru" class="user-list-content hidden">
            <div class="space-y-2" id="guru-list">
              <div class="text-center py-6 text-gray-500">
                <i class="fas fa-spinner fa-spin text-2xl mb-2"></i>
                <p>Memuat data guru...</p>
              </div>
            </div>
          </div>

          <div id="user-list-mitra" class="user-list-content hidden">
            <div class="space-y-2" id="mitra-list">
              <div class="text-center py-6 text-gray-500">
                <i class="fas fa-spinner fa-spin text-2xl mb-2"></i>
                <p>Memuat data mitra...</p>
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
                <span class="badge badge-primary text-xs">Admin Sekolah</span>
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
                <span class="text-sm">Plan</span>
                <span class="text-sm text-gray-300" id="sekolah-plan">-</span>
              </div>
              <div class="flex items-center justify-between p-3 bg-white/5 rounded-lg">
                <span class="text-sm">Total Siswa</span>
                <span class="text-sm text-gray-300" id="sekolah-users">-</span>
              </div>
              <div class="flex items-center justify-between p-3 bg-white/5 rounded-lg">
                <span class="text-sm">Total Guru</span>
                <span class="text-sm text-gray-300" id="sekolah-guru">-</span>
              </div>
            </div>
          </div>

          <div class="glass-card p-4 mb-4 animate-fade-in-up delay-2">
            <h3 class="text-sm font-bold mb-3 flex items-center gap-2">
              <i class="fas fa-credit-card text-yellow-400"></i>
              Subscription
            </h3>
            <div class="p-4 bg-gradient-to-r from-purple-500/20 to-pink-500/20 rounded-lg">
              <div class="flex items-center justify-between mb-2">
                <span class="font-medium" id="subscription-plan">-</span>
                <span class="badge badge-warning text-xs" id="subscription-status">Aktif</span>
              </div>
              <p class="text-xs text-gray-400" id="subscription-expired">Berakhir: -</p>
            </div>
          </div>

          <div class="glass-card p-2 mb-4 animate-fade-in-up delay-3">
            <button class="menu-item w-full flex items-center gap-3 p-3 rounded-lg hover:bg-white/5 transition-colors" data-action="logo">
              <div class="w-10 h-10 rounded-lg bg-blue-500/20 flex items-center justify-center text-blue-400">
                <i class="fas fa-image"></i>
              </div>
              <div class="flex-1 text-left">
                <div class="font-medium text-sm">Logo Sekolah</div>
                <div class="text-xs text-gray-500">Upload logo sekolah</div>
              </div>
              <i class="fas fa-chevron-right text-gray-500 text-xs"></i>
            </button>

            <button class="menu-item w-full flex items-center gap-3 p-3 rounded-lg hover:bg-white/5 transition-colors" data-action="settings">
              <div class="w-10 h-10 rounded-lg bg-gray-500/20 flex items-center justify-center text-gray-400">
                <i class="fas fa-cog"></i>
              </div>
              <div class="flex-1 text-left">
                <div class="font-medium text-sm">Pengaturan</div>
                <div class="text-xs text-gray-500">Konfigurasi sekolah</div>
              </div>
              <i class="fas fa-chevron-right text-gray-500 text-xs"></i>
            </button>
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

          <button class="bottom-nav-item flex flex-col items-center justify-center py-2 px-3 rounded-xl transition-all text-gray-400" data-section="users">
            <i class="fas fa-users text-lg mb-1"></i>
            <span class="text-xs">Users</span>
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

  async init() {
    // Render the dashboard shell first
    if (!this.renderDashboardShell()) {
      console.error('[AdminSchoolDashboard] Failed to render dashboard shell');
      return;
    }

    const authResult = authGuard.init('admin-sekolah', {
      avatarId: 'user-avatar',
      nameId: 'user-name',
      welcomeId: 'welcome-name',
      logoutId: 'logout-btn'
    });
    if (!authResult) return;


    const currentUser = authGuard.getUser();
    
    // Final subscription check before dashboard load
    try {
      await window.SubscriptionGuard?.verify?.(currentUser);
    } catch (error) {
      // Guard handles toast/redirect to login
      console.warn('Dashboard subscription check failed:', error.message);
      return;
    }
    

    
    this.schoolId = currentUser.schoolId || currentUser.sekolah;

    if (!this.schoolId) {
      Toast?.error?.('School ID not found');
      return;
    }

    setText('school-name', currentUser.schoolName || 'Sekolah');

    themeManager.init();
    this.initWebSocket();
    this.initNotifications();
    this.setupUI(currentUser);

    this.orchestrator = createOrchestrator(this, authApi, this.schoolId);
    await this.orchestrator.init();
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
      case 'school_stats':
        this.updateSchoolStats(update.data);
        break;
      case 'user_update':
        this.updateUserData(update.data);
        break;
      case 'subscription_update':
        this.updateSubscriptionData(update.data);
        break;
    }
  }

  /**
   * Handle session updates
   */
  handleSessionUpdate(update) {
    if (update.type === 'logout' || update.type === 'expired') {
      // Handle session expiry
      Toast?.error?.('Sesi Anda telah berakhir. Silakan login kembali.');
      setTimeout(() => {
        window.location.href = '/';
      }, 2000);
    }
  }

  /**
   * Update school statistics in real-time
   */
  updateSchoolStats(data) {
    if (data.totalSiswa !== undefined) {
      setText('stat-siswa', data.totalSiswa);
    }
    if (data.totalSpin !== undefined) {
      setText('stat-spin', data.totalSpin);
    }
    if (data.totalVoucher !== undefined) {
      setText('stat-voucher', data.totalVoucher);
    }
    if (data.siswaAktif !== undefined) {
      setText('stat-siswa-aktif', data.siswaAktif);
    }
    if (data.guruAktif !== undefined) {
      setText('stat-guru-aktif', data.guruAktif);
    }
    if (data.mitraAktif !== undefined) {
      setText('stat-mitra-aktif', data.mitraAktif);
    }
  }

  /**
   * Update user data in real-time
   */
  updateUserData(data) {
    // Update user lists if currently viewing users section
    if (this.currentSection === 'users') {
      this.orchestrator.loadUsers(this.currentImportRole);
    }
  }

  /**
   * Update subscription data in real-time
   */
  updateSubscriptionData(data) {
    // Update subscription-related UI elements
    if (this.currentSection === 'dashboard') {
      this.orchestrator.loadDashboardData();
    }
  }

  setupUI(currentUser) {
    this.setupProfile(currentUser);
    this.setupNavigation();
    this.setupEventListeners();
    this.setCurrentDate();
    this.showInitialSkeletons();
  }

  setupProfile(currentUser) {
    // Avatar and name are handled by authGuard.init()
    // Only set profile section data
    setText('profile-name', currentUser.name || '-');
    setText('profile-email', currentUser.email || '-');
  }

  setupNavigation() {
    initSectionNavigation(
      (section) => this.switchSection(section),
      {
        activeClasses: ['active', 'text-indigo-400'],
        inactiveClasses: ['text-gray-400']
      }
    );

    document.querySelectorAll('.user-tab-btn').forEach(button => {
      button.addEventListener('click', () => this.switchUserTab(button.dataset.tab));
    });

    initTabNavigation(
      (tab) => this.switchRewardTab(tab),
      {
        tabSelector: '.reward-tab-btn',
        activeClasses: ['active', 'bg-purple-500/20', 'text-purple-400'],
        inactiveClasses: ['bg-white/5', 'text-gray-400'],
        contentPrefix: 'reward-'
      }
    );
  }

  setupEventListeners() {
    bindClick('logout-btn', () => this.handleLogout());

    getElement('user-search')?.addEventListener('input', event => {
      this.filterUsers(event.target.value);
    });

    bindClick('add-user-btn', () => this.showImportModal('siswa'));
    getElement('import-user-btn')?.addEventListener('click', event => {
      this.showImportModal(event.currentTarget?.dataset?.role || this.getActiveUserTab());
    });

    document.querySelectorAll('.menu-item').forEach(item => {
      item.addEventListener('click', () => this.handleMenuAction(item.dataset.action));
    });
  }

  switchSection(section) {
    this.currentSection = section;

    switchSection(section, {
      activeClasses: ['active', 'text-indigo-400'],
      inactiveClasses: ['text-gray-400'],
      sectionPrefix: 'section-'
    });

    this.orchestrator?.loadSection(section);
  }

  switchUserTab(tab) {
    document.querySelectorAll('.user-tab-btn').forEach(button => {
      const isActive = button.dataset.tab === tab;
      button.classList.toggle('active', isActive);
      button.classList.toggle('bg-purple-500/20', isActive);
      button.classList.toggle('text-purple-400', isActive);
      button.classList.toggle('bg-white/5', !isActive);
      button.classList.toggle('text-gray-400', !isActive);
    });

    document.querySelectorAll('.user-list-content').forEach(list => {
      list.classList.toggle('hidden', list.id !== `user-list-${tab}`);
    });

    const importButton = getElement('import-user-btn');
    if (importButton) importButton.dataset.role = tab;

    if (this.orchestrator && !this.loadedUserTabs[tab]) {
      this.loadedUserTabs[tab] = true;
      this.orchestrator.loadUsers(tab);
    }
  }

  switchRewardTab(tab) {
    switchTab(tab, {
      tabSelector: '.reward-tab-btn',
      contentSelector: '.reward-content',
      activeClasses: ['active', 'bg-purple-500/20', 'text-purple-400'],
      inactiveClasses: ['bg-white/5', 'text-gray-400'],
      contentPrefix: 'reward-',
      hiddenClass: 'hidden'
    });
  }

  setCurrentDate() {
    setText(
      'current-date',
      new Date().toLocaleDateString('id-ID', {
        weekday: 'long',
        day: 'numeric',
        month: 'long',
        year: 'numeric'
      })
    );
  }

  showInitialSkeletons() {
    applyTextSkeleton(TEXT_SKELETON_TARGETS);
    LIST_SKELETON_IDS.forEach(id => renderListSkeleton(id, { items: 4, avatar: 'circle' }));
    renderInfoSkeleton('wheel-slices', { rows: 3 });
    renderListSkeleton('voucher-list', { items: 3, avatar: 'square', trailing: 'pill' });
    renderListSkeleton('voucher-history', { items: 3, avatar: 'circle', trailing: 'none' });
  }

  getActiveUserTab() {
    return document.querySelector('.user-tab-btn.active')?.dataset.tab || 'siswa';
  }

  emit(event) {
    console.log(`[Dashboard] ${event}`);
  }

  async showImportModal(role = 'siswa') {
    this.currentImportRole = role;
    
    await showImportModal(role, {
      onConfirm: (data) => this.handleImportConfirm(data),
      onCancel: () => this.handleImportCancel(),
      onDownload: (role) => this.downloadTemplate(role)
    });
  }

  async handleImportConfirm(data) {
    const { file, role } = data;
    if (!file || !this.orchestrator) return;

    await this.orchestrator.handleImportConfirm(file, role);
    this.loadedUserTabs[role] = false;
  }

  handleImportCancel() {
    // Optional: Handle cancel action if needed
    console.log('Import cancelled');
  }

  async downloadTemplate(role) {
    if (!this.orchestrator || !role) return;
    this.currentImportRole = role;
    await this.orchestrator.handlePDFDownload(role);
  }

  filterUsers(query) {
    if (!this.orchestrator?.filterUsers) return;
    this.orchestrator.filterUsers(this.getActiveUserTab(), query);
  }

  handleLogout() {
    Toast?.fire?.({
      title: 'Logout?',
      icon: 'warning',
      showCancelButton: true
    }).then(({ isConfirmed }) => {
      if (isConfirmed) authGuard.logout();
    });
  }

  handleMenuAction(action) {
    Toast?.info?.(`${action} Settings`, 'Coming soon');
  }
}

document.addEventListener('DOMContentLoaded', () => {
  window.dashboard = new AdminSchoolDashboard();
  window.dashboard.init();
});
