/**
 * Admin System Dashboard - Refactored
 * Main coordinator that uses SchoolManager, SubscriptionManager modules
 * Reduced from 1618 to ~400 lines via DRY + modular pattern
 */

import { authGuard } from '../core/AuthGuard.js';
import { themeManager } from '../core/ThemeManager.js';
import { DashboardUtils } from '../core/DashboardUtils.js';
import { initSectionNavigation, switchSection } from '../core/NavigationUtils.js';
import { DOMUtils } from '../core/DOMUtils.js';
import { authApi } from '../auth/AuthApi.js';
import { SchoolManager } from './managers/SchoolManager.js';
import { SubscriptionManager } from './managers/SubscriptionManager.js';
import {
  showConfirm,
  showError,
  showInfo,
  showLoading,
  closeLoading,
  showSuccess,
  SwalExport
} from '../components/utils/Toast.js';
import {
  applyTextSkeleton,
  clearTextSkeleton,
  renderChartSkeleton,
  clearContainerSkeleton
} from '../components/utils/DashboardSkeleton.js';

class AdminSystemDashboard {
  constructor() {
    this.currentSection = 'dashboard';
    this.driveFolderUrl = 'https://drive.google.com/drive/folders/1LO3doxMITY5QJN0Z3s5Ar9iczGEqcaxh?usp=sharing';
    
    // Initialize managers
    this.subscriptionStatusConfig = this.getDefaultSubscriptionStatusConfig();
    this.subscriptionStatusMap = this.buildSubscriptionStatusMap(this.subscriptionStatusConfig.statuses);
    
    this.schoolManager = new SchoolManager({
      subscriptionStatusMap: this.subscriptionStatusMap,
      driveFolderUrl: this.driveFolderUrl,
      onSchoolAction: () => this.refreshAllData()
    });

    this.subscriptionManager = new SubscriptionManager({
      subscriptionStatusMap: this.subscriptionStatusMap
    });

    // Data cache
    this.stats = {};

    this.init();
  }

  /**
   * Initialize
   */
  init() {
    if (!authGuard.init('admin-system', {
      avatarId: 'user-avatar',
      nameId: 'user-name',
      welcomeId: 'welcome-name',
      logoutId: 'logout-btn'
    })) {
      return;
    }

    themeManager.init();
    this.renderDashboardShell();
    this.setupProfile();
    this.setupNavigation();
    this.setupEventListeners();
    this.setCurrentDate();

    this.loadSubscriptionStatusConfig();
    this.showInitialSkeletons();
    this.refreshAllData();
  }

  /**
   * Render main dashboard shell
   */
  renderDashboardShell() {
    const appContainer = document.getElementById('app');
    if (!appContainer) {
      console.error('[AdminSystemDashboard] #app container not found');
      return false;
    }

    appContainer.innerHTML = `
      <header class="fixed top-0 left-0 right-0 z-40 glass-card border-b border-white/10">
        <div class="flex justify-between items-center px-4 py-3">
          <div class="flex items-center gap-3">
            <div class="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-500 to-pink-500 flex items-center justify-center">
              <i class="fas fa-shield-alt text-white text-sm"></i>
            </div>
            <div>
              <h1 class="text-base font-bold text-white">SpinX <span class="text-gradient">Admin</span></h1>
              <p class="text-xs text-gray-400">Sistem</p>
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

      <main class="pt-16 px-4 pb-32">
        <!-- Dashboard Section -->
        <section id="section-dashboard" class="section-content">
          <div class="glass-card p-4 mb-4 animate-fade-in-up">
            <div class="flex items-center justify-between">
              <div>
                <h2 class="text-lg font-bold">Welcome, <span id="welcome-name" class="text-gradient"></span>! 🔥</h2>
                <p class="text-xs text-gray-400">Monitoring platform SpinX</p>
              </div>
              <div class="text-right">
                <p class="text-xs text-gray-500" id="current-date"></p>
              </div>
            </div>
          </div>

          <div class="grid grid-cols-2 gap-3 mb-4">
            <div class="glass-card p-4 text-center animate-fade-in-up delay-1">
              <div class="text-2xl mb-1">🏪</div>
              <div class="text-xl font-bold text-gradient" id="stat-sekolah">-</div>
              <div class="text-xs text-gray-400">Total Sekolah</div>
            </div>
            <div class="glass-card p-4 text-center animate-fade-in-up delay-2">
              <div class="text-2xl mb-1">👨‍🎓</div>
              <div class="text-xl font-bold text-gradient" id="stat-siswa">-</div>
              <div class="text-xs text-gray-400">Total Siswa</div>
            </div>
            <div class="glass-card p-4 text-center animate-fade-in-up delay-3">
              <div class="text-2xl mb-1">🎫</div>
              <div class="text-xl font-bold text-gradient" id="stat-voucher">-</div>
              <div class="text-xs text-gray-400">Total Voucher</div>
            </div>
            <div class="glass-card p-4 text-center animate-fade-in-up delay-4">
              <div class="text-2xl mb-1">💰</div>
              <div class="text-xl font-bold text-gradient" id="stat-revenue">-</div>
              <div class="text-xs text-gray-400">Revenue SaaS</div>
            </div>
          </div>

          <div class="glass-card p-4 mb-4">
            <h3 class="text-sm font-bold mb-3"><i class="fas fa-chart-line text-green-400 mr-2"></i>Revenue Trend</h3>
            <div class="h-32 flex items-end justify-between gap-1 w-full" id="revenue-chart"></div>
          </div>

          <div class="glass-card p-4">
            <h3 class="text-sm font-bold mb-3"><i class="fas fa-history text-cyan-400 mr-2"></i>Aktivitas Terbaru</h3>
            <div class="space-y-2" id="activity-list"></div>
          </div>
        </section>

        <!-- Sekolah Section -->
        <section id="section-sekolah" class="section-content hidden">
          <div class="glass-card p-4 mb-4">
            <div class="flex items-center justify-between mb-4">
              <h2 class="text-lg font-bold"><i class="fas fa-school text-purple-400 mr-2"></i>Kelola Sekolah</h2>
              <button id="add-sekolah-btn" class="btn btn-primary text-xs py-2 px-3">
                <i class="fas fa-plus"></i> Tambah
              </button>
            </div>
            <div class="flex gap-2 mb-4">
              <div class="flex-1 relative">
                <input type="text" id="sekolah-search" placeholder="Cari sekolah..." class="input text-sm py-2 pl-9">
                <i class="fas fa-search absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 text-sm"></i>
              </div>
              <select id="sekolah-filter" class="select text-sm py-2 w-auto">
                <option value="">Semua Status</option>
              </select>
            </div>
            <div class="grid grid-cols-3 gap-2 mb-4">
              <div class="bg-green-500/10 rounded-lg p-3 text-center">
                <div class="text-lg font-bold text-green-400" id="sekolah-aktif">-</div>
                <div class="text-xs text-gray-400">Aktif</div>
              </div>
              <div class="bg-red-500/10 rounded-lg p-3 text-center">
                <div class="text-lg font-bold text-red-400" id="sekolah-nonaktif">-</div>
                <div class="text-xs text-gray-400">Nonaktif</div>
              </div>
              <div class="bg-blue-500/10 rounded-lg p-3 text-center">
                <div class="text-lg font-bold text-blue-400" id="sekolah-revenue">-</div>
                <div class="text-xs text-gray-400">Revenue</div>
              </div>
            </div>
          </div>
          <div id="sekolah-list" class="space-y-3"></div>
        </section>

        <!-- Subscription Section -->
        <section id="section-subscription" class="section-content hidden">
          <div class="glass-card p-4 mb-4">
            <h2 class="text-lg font-bold"><i class="fas fa-credit-card text-yellow-400 mr-2"></i>Subscription</h2>
            <div class="grid grid-cols-3 gap-2 mt-4">
              <div class="bg-gray-500/10 rounded-lg p-3 text-center">
                <div class="text-xl mb-1">🚀</div>
                <div class="text-lg font-bold text-gray-300" id="sub-starter">-</div>
                <div class="text-xs text-gray-400">Starter</div>
              </div>
              <div class="bg-indigo-500/10 rounded-lg p-3 text-center">
                <div class="text-xl mb-1">⭐</div>
                <div class="text-lg font-bold text-indigo-400" id="sub-pro">-</div>
                <div class="text-xs text-gray-400">Pro</div>
              </div>
              <div class="bg-gradient-to-br from-yellow-500/20 to-orange-500/20 rounded-lg p-3 text-center">
                <div class="text-xl mb-1">👑</div>
                <div class="text-lg font-bold text-yellow-400" id="sub-enterprise">-</div>
                <div class="text-xs text-gray-400">Enterprise</div>
              </div>
            </div>
          </div>
          <div class="flex gap-2 mb-4">
            <button class="flex-1 py-2 px-3 rounded-lg bg-indigo-500/20 text-indigo-400 text-sm font-medium tab-btn active" data-tab="invoice">
              <i class="fas fa-file-invoice mr-1"></i> Invoice
            </button>
            <button class="flex-1 py-2 px-3 rounded-lg bg-white/5 text-gray-400 text-sm font-medium tab-btn" data-tab="pembayaran">
              <i class="fas fa-money-bill mr-1"></i> Pembayaran
            </button>
          </div>
          <div id="invoice-list" class="glass-card p-4">
            <h3 class="text-sm font-bold mb-3">Invoice Terbaru</h3>
            <div id="invoice-content" class="space-y-2"></div>
          </div>
          <div id="pembayaran-list" class="glass-card p-4 hidden">
            <h3 class="text-sm font-bold mb-3">Riwayat Pembayaran</h3>
            <div id="payment-content" class="space-y-2"></div>
          </div>
        </section>

        <!-- Akun Section (minimal) -->
        <section id="section-akun" class="section-content hidden">
          <div class="glass-card p-4 mb-4">
            <div class="flex items-center gap-4 mb-4">
              <img id="profile-avatar" src="" alt="Profile" class="w-16 h-16 rounded-full border-2 border-indigo-500">
              <div>
                <h2 class="text-lg font-bold" id="profile-name">-</h2>
                <p class="text-sm text-gray-400" id="profile-email">-</p>
                <span class="badge badge-primary text-xs">Admin Sistem</span>
              </div>
            </div>
            <button id="edit-profile-btn" class="btn btn-secondary w-full text-sm">
              <i class="fas fa-edit"></i> Edit Profil
            </button>
          </div>
        </section>
      </main>

      <!-- Bottom Navigation -->
      <nav class="fixed bottom-0 left-0 right-0 glass-card border-t border-white/10">
        <div class="flex justify-around px-4 py-3">
          <button class="bottom-nav-item active" data-section="dashboard">
            <i class="fas fa-chart-line"></i>
            <span class="text-xs">Dashboard</span>
          </button>
          <button class="bottom-nav-item" data-section="sekolah">
            <i class="fas fa-school"></i>
            <span class="text-xs">Sekolah</span>
          </button>
          <button class="bottom-nav-item" data-section="subscription">
            <i class="fas fa-credit-card"></i>
            <span class="text-xs">Subscription</span>
          </button>
          <button class="bottom-nav-item" data-section="akun">
            <i class="fas fa-user"></i>
            <span class="text-xs">Akun</span>
          </button>
        </div>
      </nav>
    `;

    return true;
  }

  /**
   * Setup profile section
   */
  setupProfile() {
    try {
      const user = authGuard.getUser();
      if (user) {
        const profileAvatar = document.getElementById('profile-avatar');
        const profileName = document.getElementById('profile-name');
        const profileEmail = document.getElementById('profile-email');

        if (profileAvatar && user.foto) profileAvatar.src = user.foto;
        if (profileName) profileName.textContent = user.nama || user.email;
        if (profileEmail) profileEmail.textContent = user.email;
      }
    } catch (error) {
      console.error('Failed to setup profile:', error);
    }
  }

  /**
   * Setup navigation
   */
  setupNavigation() {
    const navItems = document.querySelectorAll('.bottom-nav-item');
    navItems.forEach(item => {
      item.addEventListener('click', () => {
        const section = item.dataset.section;
        this.switchSection(section);
      });
    });
  }

  /**
   * Switch section
   */
  switchSection(section) {
    this.currentSection = section;

    switchSection(section, {
      activeClasses: ['active', 'text-indigo-400'],
      inactiveClasses: ['text-gray-400']
    });

    this.loadSectionData(section);
  }

  /**
   * Setup event listeners
   */
  setupEventListeners() {
    // Logout
    const logoutBtn = document.getElementById('logout-btn');
    if (logoutBtn) {
      logoutBtn.addEventListener('click', () => this.handleLogout());
    }

    // Add school
    const addSekolahBtn = document.getElementById('add-sekolah-btn');
    if (addSekolahBtn) {
      addSekolahBtn.addEventListener('click', () => this.openAddCustomSchoolModal());
    }

    // Setup manager listeners
    this.schoolManager.setupEventListeners({
      onActionClick: (schoolId) => this.handleSchoolAction(schoolId),
      onCardClick: (schoolId) => this.handleSchoolAction(schoolId),
      onAddClick: () => this.openAddCustomSchoolModal()
    });

    this.subscriptionManager.setupTabSwitching();
  }

  /**
   * Load data for current section
   */
  loadSectionData(section) {
    switch (section) {
      case 'sekolah':
        if (this.schoolManager.schools.length === 0) {
          this.schoolManager.loadSchools();
        }
        break;
      case 'subscription':
        if (!this.subscriptionManager.invoices.length) {
          this.subscriptionManager.loadSubscriptions();
        }
        break;
    }
  }

  /**
   * Refresh all data
   */
  async refreshAllData() {
    await Promise.all([
      this.loadDashboardData(),
      this.schoolManager.loadSchools(),
      this.subscriptionManager.loadSubscriptions()
    ]);
  }

  /**
   * Load dashboard statistics
   */
  async loadDashboardData() {
    this.showDashboardSkeleton();
    try {
      const result = await authApi.call('getAdminStats', {}, false);
      
      if (result.success) {
        this.stats = result.data || {};
        this.updateDashboardStats(result.data);
      } else {
        this.stats = {};
        this.updateDashboardStats({});
      }
    } catch (error) {
      console.error('Failed to load stats:', error);
      this.stats = {};
      this.updateDashboardStats({});
    }

    await this.loadRecentActivity();
  }

  /**
   * Update dashboard stats display
   */
  updateDashboardStats(data) {
    clearTextSkeleton(['stat-sekolah', 'stat-siswa', 'stat-voucher', 'stat-revenue']);
    
    const elements = {
      'stat-sekolah': data.sekolah || data.schools || 0,
      'stat-siswa': data.siswa || data.students || 0,
      'stat-voucher': data.voucher || data.vouchers || 0,
      'stat-revenue': DashboardUtils.formatCurrency(data.revenue || data.revenueSaaS || 0)
    };

    Object.entries(elements).forEach(([id, value]) => {
      const el = document.getElementById(id);
      if (el) el.textContent = value;
    });

    this.renderRevenueChart(data.revenue || data.revenueSaaS || 0);
  }

  /**
   * Render revenue chart
   */
  renderRevenueChart(totalRevenue = 0) {
    const container = document.getElementById('revenue-chart');
    if (!container) return;

    const seed = Math.max(Number(totalRevenue) || 0, 1);
    const bars = [0.38, 0.54, 0.47, 0.7, 0.62, 0.84, 1].map((ratio, index) => {
      const variance = ((seed / (index + 3)) % 17) / 100;
      return Math.min(1, Math.max(0.22, ratio - variance));
    });

    container.innerHTML = bars.map((height, index) => `
      <div class="flex-1 rounded-t ${index === bars.length - 1 ? 'bg-gradient-to-t from-indigo-500 to-pink-500' : 'bg-indigo-500/35'}" style="height:${Math.round(height * 100)}%"></div>
    `).join('');
  }

  /**
   * Load recent activity
   */
  async loadRecentActivity() {
    const container = document.getElementById('activity-list');
    if (!container) return;

    try {
      const result = await authApi.getRecentActivity();
      
      if (result.success && result.data?.length > 0) {
        this.renderActivityList(result.data);
      } else {
        this.renderEmptyActivity();
      }
    } catch (error) {
      console.error('Failed to load activity:', error);
      this.renderEmptyActivity();
    }
  }

  /**
   * Render activity list
   */
  renderActivityList(activities) {
    const container = document.getElementById('activity-list');
    if (!container) return;
    clearContainerSkeleton(container);

    container.innerHTML = activities.slice(0, 5).map(activity => `
      <div class="flex items-center gap-3 p-3 bg-white/5 rounded-lg hover:bg-white/10 transition-colors">
        <div class="w-8 h-8 rounded-full ${DashboardUtils.getActivityIconBg(activity.role)} flex items-center justify-center text-sm">
          <i class="${DashboardUtils.getActivityIcon(activity.role)}"></i>
        </div>
        <div class="flex-1 min-w-0">
          <div class="font-medium text-sm truncate">${activity.email || activity.name}</div>
          <div class="text-xs text-gray-500">${activity.aktivitas}</div>
        </div>
        <div class="text-xs text-gray-500">${DashboardUtils.formatTimeAgo(activity.waktu)}</div>
      </div>
    `).join('');
  }

  /**
   * Render empty activity
   */
  renderEmptyActivity() {
    const container = document.getElementById('activity-list');
    if (!container) return;
    clearContainerSkeleton(container);

    DashboardUtils.renderEmptyState(container, {
      icon: 'fa-inbox',
      title: 'Belum ada aktivitas'
    });
  }

  /**
   * Handle school status action
   */
  async handleSchoolAction(schoolId) {
    const school = this.schoolManager.schools.find(s => (s.id || s.schoolId) === schoolId);
    if (!school) return;

    const actualStatus = this.schoolManager.determineActualStatus(school);
    const statusMeta = this.subscriptionStatusMap[actualStatus];
    const primaryAction = statusMeta?.primaryAction;

    if (!primaryAction) return;

    const schoolName = school.nama || school.name || school.schoolName || 'Sekolah';
    const planLabel = this.formatPlanName(school.plan);

    try {
      this.schoolManager.approvingSchoolId = schoolId;
      this.schoolManager.applyFilters();

      if (primaryAction.type === 'approve' || primaryAction.type === 'activate') {
        await this.showSchoolRegistrationApprovalModal(school);
        return;
      }

      if (primaryAction.type === 'reactivate') {
        await this.showSubscriptionRenewalModal(school);
        return;
      }

      const confirmed = await showConfirm(
        this.getActionDialogTitle(primaryAction),
        this.getActionDialogMessage(primaryAction, schoolName, planLabel),
        this.getActionConfirmLabel(primaryAction),
        'Batal',
        'info'
      );

      if (!confirmed) return;

      let result;
      if (primaryAction.type === 'sync') {
        result = await authApi.approveSchool({
          schoolId,
          plan: school.plan
        });
      }

      if (result?.success) {
        await this.refreshAllData();
        showSuccess('Berhasil', 'Sekolah berhasil diproses');
      } else {
        showError('Gagal', result?.message || 'Gagal memproses sekolah');
      }
    } catch (error) {
      console.error('School action error:', error);
      showError('Gagal', 'Terjadi kesalahan saat memproses sekolah');
    } finally {
      this.schoolManager.approvingSchoolId = null;
      this.schoolManager.applyFilters();
    }
  }

  async showSchoolRegistrationApprovalModal(school) {
    const modalOptions = {
      onApprove: async () => {
        try {
          showLoading('Memproses approval sekolah...');

          const result = await authApi.approveSchool({
            schoolId: school.id || school.schoolId,
            plan: school.plan
          });

          closeLoading();

          if (result?.success) {
            await this.refreshAllData();
            showSuccess('Berhasil', 'Sekolah berhasil di-approve dan diaktifkan');
          } else {
            showError('Gagal', result?.message || 'Gagal mengaktifkan sekolah');
          }
        } catch (error) {
          closeLoading();
          console.error('School approval error:', error);
          showError('Gagal', 'Terjadi kesalahan saat memproses approval sekolah');
        }
      },
      onReject: () => {}
    };

    const module = await import('../components/utils/Modal.js');
    const Modal = module.default || module.Modal || module;
    Modal.schoolRegistrationDetail(school, modalOptions);
  }

  /**
   * Handlers for school dialog
   */
  getActionDialogTitle(action) {
    const titles = {
      approve: 'Approve sekolah?',
      sync: 'Sinkronkan metadata sekolah?',
      activate: 'Aktifkan sekolah?',
      reactivate: 'Aktifkan ulang subscription?'
    };
    return titles[action.type] || 'Proses sekolah?';
  }

  getActionDialogMessage(action, schoolName, planLabel) {
    const messages = {
      approve: `${schoolName} akan diaktifkan dan admin sekolah bisa melanjutkan registrasi.`,
      sync: `${schoolName} akan disinkronkan agar data subscription terisi lengkap.`,
      activate: `${schoolName} akan diaktifkan menggunakan plan ${planLabel}.`,
      reactivate: `${schoolName} akan diaktifkan kembali menggunakan plan ${planLabel}.`
    };
    return messages[action.type] || `${schoolName} akan diproses.`;
  }

  getActionConfirmLabel(action) {
    const labels = {
      approve: 'Ya, Approve',
      sync: 'Ya, Sinkronkan',
      activate: 'Ya, Aktifkan',
      reactivate: 'Ya, Aktifkan Ulang'
    };
    return labels[action.type] || 'Ya, Lanjutkan';
  }

  /**
   * Show subscription renewal modal for admin approval
   */
  async showSubscriptionRenewalModal(school) {
    const modalOptions = {
      onApprove: async () => {
        try {
          showLoading('Memproses perpanjangan...');
          
          const result = await authApi.upgradeSchoolPlan({
            schoolId: school.id || school.schoolId,
            plan: school.plan
          });
          
          if (result?.success) {
            closeLoading();
            await this.refreshAllData();
            showSuccess('Berhasil', 'Subscription berhasil diperpanjang');
          } else {
            closeLoading();
            showError('Gagal', result?.message || 'Gagal memperpanjang subscription');
          }
        } catch (error) {
          closeLoading();
          console.error('Renewal approval error:', error);
          showError('Gagal', 'Terjadi kesalahan saat memproses perpanjangan');
        }
      },
      onReject: () => {
        // Optional: handle rejection
      }
    };

    // Import modal dynamically
    const module = await import('../components/utils/Modal.js');
    const Modal = module.default || module.Modal || module;
    Modal.subscriptionRenewalDetail(school, modalOptions);
  }

  /**
   * Format plan name
   */
  formatPlanName(plan) {
    const labels = {
      starter: 'Starter',
      pro: 'Pro',
      enterprise: 'Enterprise',
      custom: 'Custom'
    };
    return labels[plan] || plan;
  }

  /**
   * Show initial skeletons
   */
  showInitialSkeletons() {
    applyTextSkeleton([
      { target: 'stat-sekolah', width: '62px' },
      { target: 'stat-siswa', width: '62px' },
      { target: 'stat-voucher', width: '62px' },
      { target: 'stat-revenue', width: '92px' }
    ]);
    renderChartSkeleton('revenue-chart');
  }

  /**
   * Show dashboard skeletons
   */
  showDashboardSkeleton() {
    applyTextSkeleton([
      { target: 'stat-sekolah', width: '62px' },
      { target: 'stat-siswa', width: '62px' },
      { target: 'stat-voucher', width: '62px' },
      { target: 'stat-revenue', width: '92px' }
    ]);
    renderChartSkeleton('revenue-chart');
  }

  /**
   * Set current date
   */
  setCurrentDate() {
    const dateEl = document.getElementById('current-date');
    if (dateEl) {
      const now = new Date();
      const options = { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' };
      dateEl.textContent = now.toLocaleDateString('id-ID', options);
    }
  }

  /**
   * Handle logout
   */
  async handleLogout() {
    const confirmed = await showConfirm(
      'Logout?',
      'Apakah Anda yakin ingin logout?',
      'Ya, Logout',
      'Batal',
      'warning'
    );

    if (confirmed) {
      authGuard.logout();
    }
  }

  /**
   * Subscription status configuration
   */
  getDefaultSubscriptionStatusConfig() {
    return {
      values: {
        ACTIVE: 'active',
        EXPIRED: 'expired',
        CANCELLED: 'cancelled',
        PENDING: 'pending',
        PENDING_SCHOOL: 'pending_school'
      },
      statuses: [
        {
          key: 'PENDING_SCHOOL',
          value: 'pending_school',
          label: 'Pending Approval',
          badge: 'warning',
          icon: 'fa-hourglass-half',
          iconBg: 'bg-amber-500/20',
          iconColor: 'text-amber-300',
          filterLabel: 'Pending Approval',
          primaryAction: {
            type: 'approve',
            label: 'Approve'
          }
        },
        {
          key: 'PENDING_RENEWAL',
          value: 'pending_renewal',
          label: 'Pending Renewal',
          badge: 'info',
          icon: 'fa-sync-alt',
          iconBg: 'bg-blue-500/20',
          iconColor: 'text-blue-300',
          filterLabel: 'Pending Renewal',
          primaryAction: {
            type: 'reactivate',
            label: 'Proses Perpanjangan'
          }
        },
        {
          key: 'PENDING',
          value: 'pending',
          label: 'Pending',
          badge: 'warning',
          icon: 'fa-clock',
          iconBg: 'bg-yellow-500/20',
          iconColor: 'text-yellow-300',
          filterLabel: 'Pending',
          primaryAction: {
            type: 'activate',
            label: 'Aktifkan'
          }
        },
        {
          key: 'ACTIVE',
          value: 'active',
          label: 'Aktif',
          badge: 'success',
          icon: 'fa-circle-check',
          iconBg: 'bg-green-500/20',
          iconColor: 'text-green-400',
          filterLabel: 'Aktif'
        },
        {
          key: 'EXPIRED',
          value: 'expired',
          label: 'Expired',
          badge: 'danger',
          icon: 'fa-calendar-xmark',
          iconBg: 'bg-red-500/20',
          iconColor: 'text-red-400',
          filterLabel: 'Expired',
          primaryAction: {
            type: 'reactivate',
            label: 'Perpanjang'
          }
        },
        {
          key: 'CANCELLED',
          value: 'cancelled',
          label: 'Cancelled',
          badge: 'danger',
          icon: 'fa-ban',
          iconBg: 'bg-red-500/20',
          iconColor: 'text-red-400',
          filterLabel: 'Cancelled',
          primaryAction: {
            type: 'reactivate',
            label: 'Aktifkan Ulang'
          }
        }
      ]
    };
  }

  buildSubscriptionStatusMap(statuses) {
    return (statuses || []).reduce((map, statusMeta) => {
      map[statusMeta.value] = statusMeta;
      return map;
    }, {});
  }

  setSubscriptionStatusConfig(configData) {
    const fallbackConfig = this.getDefaultSubscriptionStatusConfig();
    const statuses = Array.isArray(configData?.statuses) && configData.statuses.length > 0
      ? configData.statuses
      : fallbackConfig.statuses;

    this.subscriptionStatusConfig = {
      values: configData?.values || fallbackConfig.values,
      statuses
    };
    this.subscriptionStatusMap = this.buildSubscriptionStatusMap(statuses);
    this.renderSchoolFilterOptions();

    this.schoolManager.subscriptionStatusMap = this.subscriptionStatusMap;
  }

  renderSchoolFilterOptions() {
    const select = document.getElementById('sekolah-filter');
    if (!select) return;

    const options = ['<option value="">Semua Status</option>']
      .concat(
        this.subscriptionStatusConfig.statuses.map((statusMeta) => (
          `<option value="${statusMeta.value}">${statusMeta.filterLabel || statusMeta.label}</option>`
        ))
      );

    select.innerHTML = options.join('');
  }

  async loadSubscriptionStatusConfig() {
    try {
      const result = await authApi.getSubscriptionStatusConfig();
      if (result.success && result.data) {
        this.setSubscriptionStatusConfig(result.data);
      }
    } catch (error) {
      console.error('Failed to load subscription status config:', error);
    }
  }
}

// Export
export { AdminSystemDashboard };

// Auto-init when DOM ready
document.addEventListener('DOMContentLoaded', () => {
  const dashboard = new AdminSystemDashboard();
});
