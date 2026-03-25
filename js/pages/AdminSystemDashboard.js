/**
 * Admin System Dashboard Module
 * Mobile-first dashboard with bottom navigation
 * Clean, DRY, best practice, modular
 */

import { authGuard } from '../core/AuthGuard.js';
import { themeManager } from '../core/ThemeManager.js';
import { authApi } from '../auth/AuthApi.js';
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
  renderListSkeleton,
  renderCardSkeleton,
  renderChartSkeleton,
  clearContainerSkeleton
} from '../components/utils/DashboardSkeleton.js';

class AdminSystemDashboard {
  constructor() {
    this.currentSection = 'dashboard';
    this.approvingSchoolId = null;
    this.driveFolderUrl = 'https://drive.google.com/drive/folders/1KpR4CoefAn1_Wq6rk3jhXWhBwvE_-cZj?usp=sharing';
    this.subscriptionStatusConfig = this.getDefaultSubscriptionStatusConfig();
    this.subscriptionStatusMap = this.buildSubscriptionStatusMap(this.subscriptionStatusConfig.statuses);
    this.schoolFilters = {
      query: '',
      status: ''
    };
    this.data = {
      stats: {},
      schools: [],
      subscriptions: {},
      invoices: [],
      payments: [],
      activities: []
    };
    this.init();
  }

  /**
   * Initialize dashboard
   */
  init() {
    // Auth protection - admin-system role only
    if (!authGuard.init('admin-system', {
      avatarId: 'user-avatar',
      welcomeId: 'welcome-name'
    })) {
      return;
    }

    // Initialize theme
    themeManager.init();

    // Setup UI
    this.setupProfile();
    this.renderSchoolFilterOptions();
    this.setupNavigation();
    this.setupEventListeners();
    this.setCurrentDate();
    this.showInitialSkeletons();

    // Load initial data
    this.loadSubscriptionStatusConfig();
    this.loadDashboardData();
  }

  /**
   * Setup profile in Akun section
   */
  setupProfile() {
    const user = authGuard.getUser();
    if (!user) return;

    // Set profile avatar
    const profileAvatar = document.getElementById('profile-avatar');
    if (profileAvatar) {
      profileAvatar.src = user.picture || user.foto || 
        `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name || 'A')}&background=random`;
    }

    // Set profile name
    const profileName = document.getElementById('profile-name');
    if (profileName) {
      profileName.textContent = user.name || '-';
    }

    // Set profile email
    const profileEmail = document.getElementById('profile-email');
    if (profileEmail) {
      profileEmail.textContent = user.email || '-';
    }
  }

  /**
   * Setup bottom navigation
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
   * @param {string} section - Section name
   */
  switchSection(section) {
    this.currentSection = section;

    // Update nav items
    const navItems = document.querySelectorAll('.bottom-nav-item');
    navItems.forEach(item => {
      if (item.dataset.section === section) {
        item.classList.add('active', 'text-indigo-400');
        item.classList.remove('text-gray-400');
      } else {
        item.classList.remove('active', 'text-indigo-400');
        item.classList.add('text-gray-400');
      }
    });

    // Update section visibility
    const sections = document.querySelectorAll('.section-content');
    sections.forEach(sec => {
      if (sec.id === `section-${section}`) {
        sec.classList.remove('hidden');
        // Add animation
        sec.classList.add('animate-fade-in-up');
      } else {
        sec.classList.add('hidden');
      }
    });

    // Load section data if needed
    this.loadSectionData(section);
  }

  /**
   * Setup event listeners
   */
  setupEventListeners() {
    // Logout button
    const logoutBtn = document.getElementById('logout-btn');
    if (logoutBtn) {
      logoutBtn.addEventListener('click', () => this.handleLogout());
    }

    // Tab buttons in subscription
    const tabBtns = document.querySelectorAll('.tab-btn');
    tabBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        const tab = btn.dataset.tab;
        this.switchTab(tab);
      });
    });

    // Menu items in Akun section
    const menuItems = document.querySelectorAll('.menu-item');
    menuItems.forEach(item => {
      item.addEventListener('click', () => {
        const action = item.dataset.action;
        this.handleMenuAction(action);
      });
    });

    // Search & filter for schools
    const sekolahSearch = document.getElementById('sekolah-search');
    if (sekolahSearch) {
      sekolahSearch.addEventListener('input', (e) => this.filterSchools(e.target.value));
    }

    const sekolahFilter = document.getElementById('sekolah-filter');
    if (sekolahFilter) {
      sekolahFilter.addEventListener('change', (e) => this.filterSchoolsByStatus(e.target.value));
    }

    const addSekolahBtn = document.getElementById('add-sekolah-btn');
    if (addSekolahBtn) {
      addSekolahBtn.addEventListener('click', () => this.openAddCustomSchoolModal());
    }

    const sekolahList = document.getElementById('sekolah-list');
    if (sekolahList) {
      sekolahList.addEventListener('click', (event) => this.handleSchoolListClick(event));
    }
  }

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
            label: 'Approve',
            title: 'Menunggu approval admin sistem',
            description: 'Setelah di-approve, admin sekolah dapat melanjutkan registrasi menggunakan Google login.'
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
            label: 'Aktifkan',
            title: 'Subscription masih pending',
            description: 'Aktifkan subscription sekolah agar status berubah menjadi aktif untuk periode bulanan berjalan.'
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
            label: 'Perpanjang',
            title: 'Subscription expired',
            description: 'Perpanjang masa aktif sekolah dengan mengaktifkan kembali plan yang sedang dipakai.'
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
            label: 'Aktifkan Ulang',
            title: 'Subscription dibatalkan',
            description: 'Aktifkan kembali sekolah dengan plan yang sama untuk memulai periode layanan baru.'
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

    if (this.data.schools.length > 0) {
      this.applySchoolFilters();
    }
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

  renderSchoolFilterOptions() {
    const select = document.getElementById('sekolah-filter');
    if (!select) return;

    const currentValue = this.schoolFilters.status || select.value || '';
    const availableValues = this.subscriptionStatusConfig.statuses.map((statusMeta) => statusMeta.value);
    const options = ['<option value="">Semua Status</option>']
      .concat(
        this.subscriptionStatusConfig.statuses.map((statusMeta) => (
          `<option value="${statusMeta.value}">${statusMeta.filterLabel || statusMeta.label}</option>`
        ))
      );

    select.innerHTML = options.join('');
    select.value = availableValues.includes(currentValue) ? currentValue : '';
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
   * Switch subscription tab
   * @param {string} tab - Tab name
   */
  switchTab(tab) {
    // Update tab buttons
    const tabBtns = document.querySelectorAll('.tab-btn');
    tabBtns.forEach(btn => {
      if (btn.dataset.tab === tab) {
        btn.classList.add('active', 'bg-indigo-500/20', 'text-indigo-400');
        btn.classList.remove('bg-white/5', 'text-gray-400');
      } else {
        btn.classList.remove('active', 'bg-indigo-500/20', 'text-indigo-400');
        btn.classList.add('bg-white/5', 'text-gray-400');
      }
    });

    // Show/hide content
    const invoiceList = document.getElementById('invoice-list');
    const pembayaranList = document.getElementById('pembayaran-list');

    if (tab === 'invoice') {
      invoiceList?.classList.remove('hidden');
      pembayaranList?.classList.add('hidden');
    } else {
      invoiceList?.classList.add('hidden');
      pembayaranList?.classList.remove('hidden');
    }
  }

  /**
   * Handle menu action
   * @param {string} action - Action name
   */
  handleMenuAction(action) {
    switch (action) {
      case 'settings':
        showInfo('Pengaturan', 'Halaman pengaturan sistem');
        break;
      case 'activity':
        showInfo('Log Aktivitas', 'Melihat riwayat aktivitas');
        break;
      case 'logs':
        showInfo('System Logs', 'Melihat log sistem');
        break;
    }
  }

  showInitialSkeletons() {
    this.showDashboardSkeleton();
    this.showSchoolsSkeleton();
    this.showSubscriptionsSkeleton();
  }

  showDashboardSkeleton() {
    applyTextSkeleton([
      { target: 'stat-sekolah', width: '62px' },
      { target: 'stat-siswa', width: '62px' },
      { target: 'stat-voucher', width: '62px' },
      { target: 'stat-revenue', width: '92px' }
    ]);
    renderChartSkeleton('revenue-chart');
    renderListSkeleton('activity-list', { items: 4, avatar: 'circle', trailing: 'none' });
  }

  showSchoolsSkeleton() {
    applyTextSkeleton([
      { target: 'sekolah-aktif', width: '52px' },
      { target: 'sekolah-nonaktif', width: '52px' },
      { target: 'sekolah-revenue', width: '86px' }
    ]);
    renderCardSkeleton('sekolah-list', { items: 3, media: 'square', badges: 1, footer: true });
  }

  showSubscriptionsSkeleton() {
    applyTextSkeleton([
      { target: 'sub-starter', width: '52px' },
      { target: 'sub-pro', width: '52px' },
      { target: 'sub-enterprise', width: '52px' }
    ]);
    renderListSkeleton('invoice-content', { items: 3, avatar: 'square', trailing: 'pill' });
    renderListSkeleton('payment-content', { items: 3, avatar: 'square', trailing: 'pill' });
  }

  renderRevenueChart(totalRevenue = 0) {
    const container = document.getElementById('revenue-chart');
    if (!container) return;

    const seed = Math.max(Number(totalRevenue) || 0, 1);
    const bars = [0.38, 0.54, 0.47, 0.7, 0.62, 0.84, 1].map((ratio, index) => {
      const variance = ((seed / (index + 3)) % 17) / 100;
      return Math.min(1, Math.max(0.22, ratio - variance));
    });

    container.removeAttribute('aria-busy');
    container.innerHTML = bars.map((height, index) => `
      <div class="flex-1 rounded-t ${index === bars.length - 1 ? 'bg-gradient-to-t from-indigo-500 to-pink-500' : 'bg-indigo-500/35'}" style="height:${Math.round(height * 100)}%"></div>
    `).join('');
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
   * Load data for current section
   * @param {string} section - Section name
   */
  loadSectionData(section) {
    switch (section) {
      case 'sekolah':
        if (this.data.schools.length === 0) {
          this.loadSchools();
        }
        break;
      case 'subscription':
        if (Object.keys(this.data.subscriptions).length === 0) {
          this.loadSubscriptions();
        }
        break;
      case 'akun':
        // Already loaded in setupProfile
        break;
    }
  }

/**
   * Load dashboard data
   */
  async loadDashboardData() {
    this.showDashboardSkeleton();
    try {
      const result = await authApi.call('getAdminStats', {}, false);
      
      if (result.success) {
        this.data.stats = result.data || {};
        this.updateDashboardStats(result.data);
      } else {
        this.data.stats = {};
        this.updateDashboardStats({});
      }
    } catch (error) {
      console.error('Failed to load dashboard stats:', error);
      this.data.stats = {};
      this.updateDashboardStats({});
    }

    // Load recent activity
    await this.loadRecentActivity();
  }

  /**
   * Update dashboard stats
   * @param {Object} data - Stats data
   */
  updateDashboardStats(data) {
    clearTextSkeleton(['stat-sekolah', 'stat-siswa', 'stat-voucher', 'stat-revenue']);
    this.renderRevenueChart(data.revenue || data.revenueSaaS || 0);
    const elements = {
      'stat-sekolah': data.sekolah || data.schools || 0,
      'stat-siswa': data.siswa || data.students || 0,
      'stat-voucher': data.voucher || data.vouchers || 0,
      'stat-revenue': this.formatCurrency(data.revenue || data.revenueSaaS || 0)
    };

    Object.entries(elements).forEach(([id, value]) => {
      const el = document.getElementById(id);
      if (el) el.textContent = value;
    });
  }

  /**
   * Format currency
   * @param {number} amount - Amount
   * @returns {string}
   */
  formatCurrency(amount) {
    if (amount >= 1000000) {
      return `Rp ${(amount / 1000000).toFixed(1)}JT`;
    } else if (amount >= 1000) {
      return `Rp ${(amount / 1000).toFixed(0)}RB`;
    }
    return `Rp ${amount}`;
  }

  /**
   * Load recent activity
   */
  async loadRecentActivity() {
    const container = document.getElementById('activity-list');
    if (!container) return;
    renderListSkeleton(container, { items: 4, avatar: 'circle', trailing: 'none' });

    try {
      const result = await authApi.getRecentActivity();
      
      if (result.success && result.data?.length > 0) {
        this.data.activities = result.data;
        this.renderActivityList(result.data);
      } else {
        this.data.activities = [];
        this.renderEmptyActivity();
      }
    } catch (error) {
      console.error('Failed to load activity:', error);
      this.data.activities = [];
      this.renderEmptyActivity();
    }
  }

  /**
   * Render activity list
   * @param {Array} activities - Activities
   */
  renderActivityList(activities) {
    const container = document.getElementById('activity-list');
    if (!container) return;
    clearContainerSkeleton(container);

    container.innerHTML = activities.slice(0, 5).map(activity => `
      <div class="flex items-center gap-3 p-3 bg-white/5 rounded-lg hover:bg-white/10 transition-colors">
        <div class="w-8 h-8 rounded-full ${this.getActivityIconBg(activity.role)} flex items-center justify-center text-sm">
          <i class="${this.getActivityIcon(activity.role)}"></i>
        </div>
        <div class="flex-1 min-w-0">
          <div class="font-medium text-sm truncate">${activity.email || activity.name}</div>
          <div class="text-xs text-gray-500">${activity.aktivitas}</div>
        </div>
        <div class="text-xs text-gray-500">${this.formatTimeAgo(activity.waktu)}</div>
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

    container.innerHTML = `
      <div class="text-center py-6 text-gray-500">
        <i class="fas fa-inbox text-2xl mb-2"></i>
        <p class="text-sm">Belum ada aktivitas</p>
      </div>
    `;
  }

  /**
   * Get activity icon based on role
   * @param {string} role - Role
   * @returns {string}
   */
  getActivityIcon(role) {
    const icons = {
      'admin-system': 'fa-shield-alt',
      'admin-sekolah': 'fa-school',
      'siswa': 'fa-user-graduate',
      'mitra': 'fa-store',
      'guru': 'fa-chalkboard-teacher'
    };
    return icons[role] || 'fa-user';
  }

  /**
   * Get activity icon background
   * @param {string} role - Role
   * @returns {string}
   */
  getActivityIconBg(role) {
    const bgs = {
      'admin-system': 'bg-indigo-500/20 text-indigo-400',
      'admin-sekolah': 'bg-purple-500/20 text-purple-400',
      'siswa': 'bg-blue-500/20 text-blue-400',
      'mitra': 'bg-green-500/20 text-green-400',
      'guru': 'bg-yellow-500/20 text-yellow-400'
    };
    return bgs[role] || 'bg-gray-500/20 text-gray-400';
  }

  /**
   * Format time ago
   * @param {string} waktu - Time string
   * @returns {string}
   */
  formatTimeAgo(waktu) {
    if (!waktu) return '-';
    
    const date = new Date(waktu);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Baru';
    if (diffMins < 60) return `${diffMins}m`;
    if (diffHours < 24) return `${diffHours}j`;
    if (diffDays < 7) return `${diffDays}h`;
    
    return date.toLocaleDateString('id-ID', { day: 'numeric', month: 'short' });
  }

  /**
   * Load schools data
   */
  async loadSchools() {
    const container = document.getElementById('sekolah-list');
    if (!container) return;
    this.showSchoolsSkeleton();

    try {
      const result = await authApi.call('getAllSchools', {}, false);
      
      if (result.success) {
        this.data.schools = result.data || [];
        this.applySchoolFilters();
        this.updateSchoolStats();
      } else {
        this.renderEmptySchools();
      }
    } catch (error) {
      console.error('Failed to load schools:', error);
      this.renderEmptySchools();
    }
  }

  /**
   * Render schools list
   * @param {Array} schools - Schools array
   */
  renderSchools(schools) {
    const container = document.getElementById('sekolah-list');
    if (!container) return;
    clearContainerSkeleton(container);

    if (schools.length === 0) {
      this.renderEmptySchools();
      return;
    }

    container.innerHTML = schools.map((school) => {
      const statusMeta = this.getSchoolStatusMeta(school.status);
      const schoolId = school.id || school.schoolId || '';
      const isApproving = this.approvingSchoolId === schoolId;
      const primaryAction = this.getSchoolPrimaryAction(school);
      const showAction = !!primaryAction;
      const schoolName = school.nama || school.name || school.schoolName || '-';
      const schoolEmail = school.email || '-';
      const schoolPhone = school.phone || school.noWa || '-';
      const userCount = school.currentUsers || school.users || school.siswa_count || school.siswa || 0;
      const planLabel = this.formatPlanName(school.plan);

      return `
        <div class="glass-card p-4 hover:bg-white/5 transition-colors" data-id="${schoolId}">
          <div class="flex items-start gap-3">
            <div class="w-12 h-12 rounded-xl ${statusMeta.iconBg} flex items-center justify-center shrink-0">
              <i class="fas ${statusMeta.icon} ${statusMeta.iconColor}"></i>
            </div>
            <div class="flex-1 min-w-0">
              <div class="flex items-start justify-between gap-3">
                <div class="min-w-0">
                  <div class="font-medium text-sm truncate">${schoolName}</div>
                  <div class="text-xs text-gray-500 truncate">${schoolEmail}</div>
                </div>
                <span class="badge badge-${statusMeta.badge} text-xs whitespace-nowrap">
                  ${statusMeta.label}
                </span>
              </div>

              <div class="flex flex-wrap items-center gap-3 mt-3 text-xs text-gray-400">
                <span>
                  <i class="fas fa-users mr-1"></i>${userCount} user
                </span>
                <span>
                  <i class="fas fa-tag mr-1"></i>${planLabel}
                </span>
                <span class="truncate">
                  <i class="fas fa-phone mr-1"></i>${schoolPhone}
                </span>
              </div>

              ${showAction ? `
                <div class="mt-3 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 rounded-xl border border-amber-400/20 bg-amber-500/10 px-3 py-3">
                  <div class="min-w-0">
                    <div class="text-xs font-semibold text-amber-300">${primaryAction.title}</div>
                    <div class="text-[11px] text-amber-100/70">${primaryAction.description}</div>
                  </div>
                  <button
                    type="button"
                    data-action="school-status-action"
                    data-school-id="${schoolId}"
                    class="inline-flex items-center justify-center gap-2 rounded-lg bg-emerald-500/20 px-3 py-2 text-xs font-semibold text-emerald-300 transition-colors hover:bg-emerald-500/30 disabled:cursor-not-allowed disabled:opacity-60"
                    ${isApproving ? 'disabled' : ''}
                  >
                    <i class="fas ${isApproving ? 'fa-spinner fa-spin' : 'fa-circle-check'}"></i>
                    ${isApproving ? 'Memproses...' : primaryAction.label}
                  </button>
                </div>
              ` : ''}
            </div>
          </div>
        </div>
      `;
    }).join('');
  }

  /**
   * Render empty schools
   */
  renderEmptySchools() {
    const container = document.getElementById('sekolah-list');
    if (!container) return;
    clearContainerSkeleton(container);

    container.innerHTML = `
      <div class="glass-card p-8 text-center">
        <i class="fas fa-school text-4xl text-gray-600 mb-3"></i>
        <p class="text-gray-400">Belum ada sekolah</p>
        <button type="button" data-action="open-add-school-modal" class="btn btn-primary mt-4 text-sm">
          <i class="fas fa-plus"></i> Tambah Sekolah Custom
        </button>
      </div>
    `;
  }

  getCustomSchoolModalHtml() {
    return `
      <div class="space-y-4 text-left">
        <div class="rounded-2xl border border-cyan-400/20 bg-cyan-500/10 px-4 py-3">
          <div class="flex items-start gap-3">
            <div class="mt-0.5 flex h-10 w-10 items-center justify-center rounded-xl bg-cyan-500/20 text-cyan-300">
              <i class="fas fa-layer-group"></i>
            </div>
            <div class="min-w-0">
              <div class="text-sm font-semibold text-cyan-200">Tambah Sekolah Custom</div>
              <div class="mt-1 text-xs leading-5 text-slate-300">
                Form ini khusus untuk paket custom di luar Starter, Pro, dan Enterprise.
                Status awal tetap <span class="font-semibold text-amber-300">pending approval</span> agar data sekolah, bukti transfer,
                dan subscription tetap konsisten sebelum diaktifkan.
              </div>
            </div>
          </div>
        </div>

        <div class="grid gap-3 md:grid-cols-2">
          <label class="block">
            <span class="mb-1 block text-xs font-semibold uppercase tracking-wide text-slate-300">Nama Sekolah</span>
            <input id="custom-school-name" type="text" class="input w-full text-sm" placeholder="Contoh: SMA Hang Tuah 2 Sidoarjo">
          </label>
          <label class="block">
            <span class="mb-1 block text-xs font-semibold uppercase tracking-wide text-slate-300">Email Admin Sekolah</span>
            <input id="custom-school-email" type="email" class="input w-full text-sm" placeholder="admin@sekolah.sch.id">
          </label>
          <label class="block">
            <span class="mb-1 block text-xs font-semibold uppercase tracking-wide text-slate-300">No. WhatsApp</span>
            <input id="custom-school-phone" type="tel" inputmode="numeric" class="input w-full text-sm" placeholder="08xxxxxxxxxx">
          </label>
          <label class="block">
            <span class="mb-1 block text-xs font-semibold uppercase tracking-wide text-slate-300">Plan Subscription</span>
            <div class="input flex items-center justify-between gap-3 text-sm">
              <span class="font-semibold text-slate-100">Custom</span>
              <span class="rounded-full border border-cyan-400/30 bg-cyan-500/10 px-2 py-1 text-[10px] font-semibold uppercase tracking-wide text-cyan-200">
                Manual
              </span>
            </div>
          </label>
          <label class="block">
            <span class="mb-1 block text-xs font-semibold uppercase tracking-wide text-slate-300">Nominal Tagihan</span>
            <input id="custom-school-amount" type="text" inputmode="numeric" class="input w-full text-sm" placeholder="1500000">
            <span id="custom-school-amount-preview" class="mt-1 block text-[11px] text-slate-400">Masukkan nominal custom bulanan.</span>
          </label>
          <label class="block">
            <span class="mb-1 block text-xs font-semibold uppercase tracking-wide text-slate-300">Kuota Maksimal User</span>
            <input id="custom-school-max-users" type="number" min="1" step="1" class="input w-full text-sm" placeholder="500">
          </label>
        </div>

        <label class="block">
          <span class="mb-1 block text-xs font-semibold uppercase tracking-wide text-slate-300">Link Bukti Transfer</span>
          <input id="custom-school-proof" type="url" class="input w-full text-sm" placeholder="https://drive.google.com/...">
          <div class="mt-2 flex flex-col gap-2 rounded-2xl border border-white/10 bg-white/5 px-3 py-3 text-xs text-slate-300 sm:flex-row sm:items-center sm:justify-between">
            <span>Upload file bukti transfer ke folder Drive tim billing, lalu tempel link file atau folder di atas.</span>
            <button type="button" data-action="open-drive-upload" class="btn btn-secondary shrink-0 text-xs py-2 px-3">
              <i class="fas fa-cloud-upload-alt"></i>
              Buka Folder Upload
            </button>
          </div>
        </label>
      </div>
    `;
  }

  bindCustomSchoolModalEvents() {
    if (!SwalExport) {
      return;
    }

    const popup = SwalExport.getPopup();
    if (!popup) {
      return;
    }

    const uploadButton = popup.querySelector('[data-action="open-drive-upload"]');
    uploadButton?.addEventListener('click', (event) => {
      event.preventDefault();
      window.open(this.driveFolderUrl, '_blank', 'noopener,noreferrer');
    });

    const amountInput = popup.querySelector('#custom-school-amount');
    const amountPreview = popup.querySelector('#custom-school-amount-preview');
    amountInput?.addEventListener('input', () => {
      amountInput.value = amountInput.value.replace(/[^0-9]/g, '');
      if (amountPreview) {
        amountPreview.textContent = amountInput.value
          ? `${this.formatCurrency(Number(amountInput.value))} per bulan`
          : 'Masukkan nominal custom bulanan.';
      }
    });

    const phoneInput = popup.querySelector('#custom-school-phone');
    phoneInput?.addEventListener('input', () => {
      phoneInput.value = phoneInput.value.replace(/[^0-9]/g, '');
    });
  }

  getCustomSchoolFormData() {
    if (!SwalExport) {
      return null;
    }

    const popup = SwalExport.getPopup();
    if (!popup) {
      return null;
    }

    return {
      schoolName: popup.querySelector('#custom-school-name')?.value.trim() || '',
      email: popup.querySelector('#custom-school-email')?.value.trim().toLowerCase() || '',
      noWa: popup.querySelector('#custom-school-phone')?.value.trim() || '',
      amount: popup.querySelector('#custom-school-amount')?.value.trim() || '',
      maxUsers: popup.querySelector('#custom-school-max-users')?.value.trim() || '',
      buktiTF_link: popup.querySelector('#custom-school-proof')?.value.trim() || '',
      plan: 'custom'
    };
  }

  validateCustomSchoolForm(data) {
    if (!data) {
      return 'Form custom tidak dapat dibaca.';
    }

    if (!data.schoolName) {
      return 'Nama sekolah wajib diisi.';
    }

    if (!data.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) {
      return 'Email admin sekolah tidak valid.';
    }

    const sanitizedPhone = data.noWa.replace(/[^0-9]/g, '');
    if (!sanitizedPhone || !/^\d{10,15}$/.test(sanitizedPhone)) {
      return 'No. WhatsApp harus berisi 10-15 digit angka.';
    }

    const amount = Number(data.amount);
    if (!Number.isFinite(amount) || amount <= 0) {
      return 'Nominal tagihan custom wajib diisi dengan angka lebih dari 0.';
    }

    const maxUsers = Number(data.maxUsers);
    if (!Number.isFinite(maxUsers) || maxUsers <= 0) {
      return 'Kuota maksimal user wajib diisi dengan angka lebih dari 0.';
    }

    if (!data.buktiTF_link) {
      return 'Link bukti transfer wajib diisi untuk plan custom.';
    }

    return '';
  }

  async openAddCustomSchoolModal() {
    if (!SwalExport) {
      showError('Popup Tidak Tersedia', 'Komponen popup belum termuat. Muat ulang halaman lalu coba lagi.');
      return;
    }

    const result = await SwalExport.fire({
      title: 'Tambah Sekolah Custom',
      html: this.getCustomSchoolModalHtml(),
      width: 760,
      padding: '1.5rem',
      background: '#0f172a',
      color: '#e2e8f0',
      showCancelButton: true,
      focusConfirm: false,
      confirmButtonText: 'Simpan Pengajuan',
      cancelButtonText: 'Batal',
      reverseButtons: true,
      didOpen: () => this.bindCustomSchoolModalEvents(),
      preConfirm: () => {
        const formData = this.getCustomSchoolFormData();
        const validationMessage = this.validateCustomSchoolForm(formData);

        if (validationMessage) {
          SwalExport.showValidationMessage(validationMessage);
          return false;
        }

        return {
          ...formData,
          noWa: formData.noWa.replace(/[^0-9]/g, ''),
          amount: Number(formData.amount),
          maxUsers: Number(formData.maxUsers)
        };
      }
    });

    if (!result.isConfirmed || !result.value) {
      return;
    }

    showLoading('Menyimpan sekolah custom...');

    try {
      const response = await authApi.registerSchoolPending(result.value, false);
      closeLoading();

      if (!response.success) {
        showError('Gagal Menyimpan', response.message || 'Data sekolah custom belum berhasil disimpan.');
        return;
      }

      await Promise.all([
        this.loadDashboardData(),
        this.loadSchools(),
        this.loadSubscriptions()
      ]);

      showSuccess(
        'Sekolah Custom Ditambahkan',
        response.message || 'Pengajuan sekolah custom berhasil disimpan dan menunggu approval admin sistem.'
      );
    } catch (error) {
      closeLoading();
      console.error('Failed to create custom school:', error);
      showError('Gagal Menyimpan', 'Terjadi kendala saat menambahkan sekolah custom.');
    }
  }

  /**
   * Update school stats
   */
  updateSchoolStats() {
    const schools = this.data.schools;
    const active = schools.filter(s => s.status === 'active').length;
    const inactive = schools.filter(s => s.status !== 'active').length;
    const revenue = schools.reduce((sum, s) => sum + (s.revenue || 0), 0);

    const aktifEl = document.getElementById('sekolah-aktif');
    const nonaktifEl = document.getElementById('sekolah-nonaktif');
    const revenueEl = document.getElementById('sekolah-revenue');

    clearTextSkeleton(['sekolah-aktif', 'sekolah-nonaktif', 'sekolah-revenue']);
    if (aktifEl) aktifEl.textContent = active;
    if (nonaktifEl) nonaktifEl.textContent = inactive;
    if (revenueEl) revenueEl.textContent = this.formatCurrency(revenue);
  }

  /**
   * Filter schools by search
   * @param {string} query - Search query
   */
  filterSchools(query) {
    this.schoolFilters.query = query || '';
    this.applySchoolFilters();
  }

  /**
   * Filter schools by status
   * @param {string} status - Status filter
   */
  filterSchoolsByStatus(status) {
    this.schoolFilters.status = status || '';
    this.applySchoolFilters();
  }

  /**
   * Load subscriptions data
   */
  async loadSubscriptions() {
    this.showSubscriptionsSkeleton();
    try {
      const [result, paymentsResult] = await Promise.all([
        authApi.call('getSubscriptionStats', {}, false),
        authApi.call('getPayments', {}, false)
      ]);
      
      if (result.success) {
        this.data.subscriptions = result.data || {};
        this.data.invoices = result.invoices || [];
        this.data.payments = paymentsResult?.invoices || paymentsResult?.payments || [];
        this.updateSubscriptionStats();
        this.renderInvoices(this.data.invoices);
        this.renderPayments(this.data.payments);
      } else {
        this.data.subscriptions = {};
        this.data.invoices = [];
        this.data.payments = [];
        this.updateSubscriptionStats();
        this.renderInvoices([]);
        this.renderPayments([]);
      }
    } catch (error) {
      console.error('Failed to load subscriptions:', error);
      this.data.subscriptions = {};
      this.data.invoices = [];
      this.data.payments = [];
      this.updateSubscriptionStats();
      this.renderInvoices([]);
      this.renderPayments([]);
    }
  }

  /**
   * Update subscription stats
   */
  updateSubscriptionStats() {
    const subs = this.data.subscriptions;
    
    const starterEl = document.getElementById('sub-starter');
    const proEl = document.getElementById('sub-pro');
    const enterpriseEl = document.getElementById('sub-enterprise');

    clearTextSkeleton(['sub-starter', 'sub-pro', 'sub-enterprise']);
    if (starterEl) starterEl.textContent = subs.starter || 0;
    if (proEl) proEl.textContent = subs.pro || 0;
    if (enterpriseEl) enterpriseEl.textContent = subs.enterprise || 0;
  }

  /**
   * Render invoices
   * @param {Array} invoices - Invoices
   */
  renderInvoices(invoices) {
    const container = document.getElementById('invoice-content');
    if (!container) return;
    clearContainerSkeleton(container);

    if (invoices.length === 0) {
      container.innerHTML = `
        <div class="text-center py-6 text-gray-500">
          <i class="fas fa-file-invoice text-2xl mb-2"></i>
          <p class="text-sm">Belum ada invoice</p>
        </div>
      `;
      return;
    }

    container.innerHTML = invoices.slice(0, 5).map(inv => `
      <div class="flex items-center gap-3 p-3 bg-white/5 rounded-lg">
        <div class="w-10 h-10 rounded-lg ${this.getInvoiceStatusBg(inv.status)} flex items-center justify-center">
          <i class="${this.getInvoiceIcon(inv.status)}"></i>
        </div>
        <div class="flex-1 min-w-0">
          <div class="font-medium text-sm">${inv.sekolah || inv.name}</div>
          <div class="text-xs text-gray-500">${inv.plan} - ${this.formatCurrency(inv.amount)}</div>
        </div>
        <span class="badge badge-${this.getInvoiceStatusBadge(inv.status)} text-xs">${this.getInvoiceStatusLabel(inv.status)}</span>
      </div>
    `).join('');
  }

  renderPayments(payments) {
    const container = document.getElementById('payment-content');
    if (!container) return;
    clearContainerSkeleton(container);

    if (!payments.length) {
      container.innerHTML = `
        <div class="text-center py-6 text-gray-500">
          <i class="fas fa-money-bill-wave text-2xl mb-2"></i>
          <p class="text-sm">Belum ada pembayaran</p>
        </div>
      `;
      return;
    }

    container.innerHTML = payments.slice(0, 5).map(payment => `
      <div class="flex items-center gap-3 p-3 bg-white/5 rounded-lg">
        <div class="w-10 h-10 rounded-lg ${this.getInvoiceStatusBg(payment.status)} flex items-center justify-center">
          <i class="${this.getInvoiceIcon(payment.status)}"></i>
        </div>
        <div class="flex-1 min-w-0">
          <div class="font-medium text-sm">${payment.sekolah || payment.name}</div>
          <div class="text-xs text-gray-500">${payment.plan} - ${this.formatCurrency(payment.amount)}</div>
        </div>
        <span class="badge badge-${this.getInvoiceStatusBadge(payment.status)} text-xs">${this.getInvoiceStatusLabel(payment.status)}</span>
      </div>
    `).join('');
  }

  /**
   * Get invoice status background
   * @param {string} status - Status
   * @returns {string}
   */
  getInvoiceStatusBg(status) {
    if (this.subscriptionStatusMap[status]) {
      const statusMeta = this.getSchoolStatusMeta(status);
      return `${statusMeta.iconBg} ${statusMeta.iconColor}`;
    }

    const bgs = {
      'paid': 'bg-green-500/20 text-green-400',
      'overdue': 'bg-red-500/20 text-red-400'
    };
    return bgs[status] || 'bg-gray-500/20 text-gray-400';
  }

  /**
   * Get invoice icon
   * @param {string} status - Status
   * @returns {string}
   */
  getInvoiceIcon(status) {
    if (this.subscriptionStatusMap[status]) {
      return `fas ${this.getSchoolStatusMeta(status).icon}`;
    }

    const icons = {
      'paid': 'fas fa-check',
      'overdue': 'fas fa-exclamation'
    };
    return icons[status] || 'fas fa-file';
  }

  /**
   * Get invoice status badge
   * @param {string} status - Status
   * @returns {string}
   */
  getInvoiceStatusBadge(status) {
    if (this.subscriptionStatusMap[status]) {
      return this.getSchoolStatusMeta(status).badge;
    }

    const badges = {
      'paid': 'success',
      'overdue': 'danger'
    };
    return badges[status] || 'secondary';
  }

  getInvoiceStatusLabel(status) {
    if (this.subscriptionStatusMap[status]) {
      return this.getSchoolStatusMeta(status).label;
    }

    const labels = {
      paid: 'Paid',
      overdue: 'Overdue'
    };

    return labels[status] || status;
  }

  applySchoolFilters() {
    const query = this.normalizeSearchValue(this.schoolFilters.query).trim();
    const status = this.schoolFilters.status || '';

    const filtered = this.data.schools.filter((school) => {
      const name = this.normalizeSearchValue(school.nama || school.name || school.schoolName);
      const email = this.normalizeSearchValue(school.email);
      const phone = this.normalizeSearchValue(school.phone || school.noWa);
      const matchesQuery = !query || name.includes(query) || email.includes(query) || phone.includes(query);

      if (!matchesQuery) {
        return false;
      }

      if (!status) {
        return true;
      }

      return school.status === status;
    });

    this.renderSchools(filtered);
  }

  normalizeSearchValue(value) {
    if (value === null || typeof value === 'undefined') {
      return '';
    }

    return String(value).toLowerCase();
  }

  getSchoolStatusMeta(status) {
    return this.subscriptionStatusMap[status] || {
      label: status || 'Unknown',
      badge: 'warning',
      icon: 'fa-circle-info',
      iconBg: 'bg-slate-500/20',
      iconColor: 'text-slate-300'
    };
  }

  formatPlanName(plan) {
    if (!plan) return 'Starter';

    const labels = {
      starter: 'Starter',
      pro: 'Pro',
      enterprise: 'Enterprise',
      custom: 'Custom'
    };

    return labels[plan] || plan;
  }

  async handleSchoolListClick(event) {
    const openAddButton = event.target.closest('[data-action="open-add-school-modal"]');
    if (openAddButton) {
      event.preventDefault();
      event.stopPropagation();
      await this.openAddCustomSchoolModal();
      return;
    }

    const approveButton = event.target.closest('[data-action="school-status-action"]');
    if (!approveButton) {
      return;
    }

    event.preventDefault();
    event.stopPropagation();

    const schoolId = approveButton.dataset.schoolId;
    if (!schoolId || this.approvingSchoolId === schoolId) {
      return;
    }

    await this.handleSchoolStatusAction(schoolId);
  }

  getSchoolPrimaryAction(school) {
    if (!school) {
      return null;
    }

    if (this.needsSchoolMetadataSync(school)) {
      return {
        type: 'sync',
        label: 'Sinkronkan',
        title: 'Metadata subscription belum lengkap',
        description: 'Kolom expires_at atau approved_by masih kosong. Sinkronkan agar data sekolah dan subscription konsisten.'
      };
    }

    const statusMeta = this.subscriptionStatusMap[school.status];
    return statusMeta?.primaryAction || null;
  }

  async handleSchoolStatusAction(schoolId) {
    const school = this.data.schools.find((item) => (item.id || item.schoolId) === schoolId);
    if (!school) {
      return;
    }

    const primaryAction = this.getSchoolPrimaryAction(school);
    if (!primaryAction) {
      return;
    }

    const schoolName = school.nama || school.name || school.schoolName || 'Sekolah';
    const confirmed = await showConfirm(
      this.getSchoolActionDialogTitle(primaryAction),
      this.getSchoolActionDialogMessage(primaryAction, schoolName, school.plan),
      this.getSchoolActionConfirmLabel(primaryAction),
      'Batal',
      'info'
    );

    if (!confirmed) {
      return;
    }

    try {
      this.approvingSchoolId = schoolId;
      this.applySchoolFilters();

      const result = await this.executeSchoolPrimaryAction(primaryAction, school);
      if (result.success) {
        await Promise.all([
          this.loadDashboardData(),
          this.loadSchools(),
          this.loadSubscriptions()
        ]);
      }
    } catch (error) {
      console.error('Failed to process school action:', error);
      showError('Gagal', this.getSchoolActionErrorMessage(primaryAction));
    } finally {
      this.approvingSchoolId = null;
      this.applySchoolFilters();
    }
  }

  getSchoolActionDialogTitle(action) {
    const titles = {
      approve: 'Approve sekolah?',
      sync: 'Sinkronkan metadata sekolah?',
      activate: 'Aktifkan sekolah?',
      reactivate: 'Aktifkan ulang subscription?'
    };

    return titles[action.type] || 'Proses sekolah?';
  }

  getSchoolActionDialogMessage(action, schoolName, plan) {
    const planLabel = this.formatPlanName(plan);

    const messages = {
      approve: `${schoolName} akan diaktifkan dan admin sekolah bisa melanjutkan registrasi.`,
      sync: `${schoolName} akan disinkronkan agar kolom expires_at, approved_by, dan subscription aktif terisi lengkap.`,
      activate: `${schoolName} akan diaktifkan menggunakan plan ${planLabel} untuk periode layanan bulanan baru.`,
      reactivate: `${schoolName} akan diaktifkan kembali menggunakan plan ${planLabel} dan masa layanan akan diperpanjang untuk periode bulanan baru.`
    };

    return messages[action.type] || `${schoolName} akan diproses.`;
  }

  getSchoolActionConfirmLabel(action) {
    const labels = {
      approve: 'Ya, Approve',
      sync: 'Ya, Sinkronkan',
      activate: 'Ya, Aktifkan',
      reactivate: 'Ya, Aktifkan Ulang'
    };

    return labels[action.type] || 'Ya, Lanjutkan';
  }

  getSchoolActionErrorMessage(action) {
    const messages = {
      approve: 'Tidak dapat menyetujui sekolah.',
      sync: 'Tidak dapat menyinkronkan metadata sekolah.',
      activate: 'Tidak dapat mengaktifkan sekolah.',
      reactivate: 'Tidak dapat mengaktifkan ulang subscription sekolah.'
    };

    return messages[action.type] || 'Tidak dapat memproses sekolah.';
  }

  executeSchoolPrimaryAction(action, school) {
    switch (action.type) {
      case 'approve':
      case 'sync':
        return authApi.approveSchool(school.id || school.schoolId);
      case 'activate':
      case 'reactivate':
        return authApi.upgradeSchoolPlan(school.id || school.schoolId, school.plan);
      default:
        return Promise.resolve({ success: false, message: 'Aksi status tidak didukung.' });
    }
  }

  needsSchoolMetadataSync(school) {
    if (!school || school.status !== 'active') {
      return false;
    }

    return !school.expiresAt || !school.approvedBy;
  }
}

// Export
export { AdminSystemDashboard };

// Auto-init when DOM ready
document.addEventListener('DOMContentLoaded', () => {
  const dashboard = new AdminSystemDashboard();
});

