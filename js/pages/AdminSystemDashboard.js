/**
 * Admin System Dashboard Module
 * Mobile-first dashboard with bottom navigation
 * Clean, DRY, best practice, modular
 */

import { authGuard } from '../core/AuthGuard.js';
import { themeManager } from '../core/ThemeManager.js';
import { authApi } from '../auth/AuthApi.js';
import { showConfirm, showError, showInfo } from '../components/utils/Toast.js';

class AdminSystemDashboard {
  constructor() {
    this.currentSection = 'dashboard';
    this.approvingSchoolId = null;
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
    this.setupNavigation();
    this.setupEventListeners();
    this.setCurrentDate();

    // Load initial data
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

    const sekolahList = document.getElementById('sekolah-list');
    if (sekolahList) {
      sekolahList.addEventListener('click', (event) => this.handleSchoolListClick(event));
    }
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
    try {
      const result = await authApi.call('getAdminStats', {}, false);
      
      if (result.success) {
        this.data.stats = result.data || {};
        this.updateDashboardStats(result.data);
      }
    } catch (error) {
      console.error('Failed to load dashboard stats:', error);
    }

    // Load recent activity
    await this.loadRecentActivity();
  }

  /**
   * Update dashboard stats
   * @param {Object} data - Stats data
   */
  updateDashboardStats(data) {
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

    if (schools.length === 0) {
      this.renderEmptySchools();
      return;
    }

    container.innerHTML = schools.map((school) => {
      const statusMeta = this.getSchoolStatusMeta(school.status);
      const schoolId = school.id || school.schoolId || '';
      const isApproving = this.approvingSchoolId === schoolId;
      const canApprove = school.status === 'pending_school';
      const schoolName = school.nama || school.name || school.schoolName || '-';
      const schoolEmail = school.email || '-';
      const schoolPhone = school.phone || school.noWa || '-';
      const studentCount = school.currentStudents || school.students || school.siswa_count || school.siswa || 0;
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
                  <i class="fas fa-users mr-1"></i>${studentCount} siswa
                </span>
                <span>
                  <i class="fas fa-tag mr-1"></i>${planLabel}
                </span>
                <span class="truncate">
                  <i class="fas fa-phone mr-1"></i>${schoolPhone}
                </span>
              </div>

              ${canApprove ? `
                <div class="mt-3 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 rounded-xl border border-amber-400/20 bg-amber-500/10 px-3 py-3">
                  <div class="min-w-0">
                    <div class="text-xs font-semibold text-amber-300">Menunggu approval admin sistem</div>
                    <div class="text-[11px] text-amber-100/70">Setelah di-approve, admin sekolah dapat melanjutkan registrasi menggunakan Google login.</div>
                  </div>
                  <button
                    type="button"
                    data-action="approve-school"
                    data-school-id="${schoolId}"
                    class="inline-flex items-center justify-center gap-2 rounded-lg bg-emerald-500/20 px-3 py-2 text-xs font-semibold text-emerald-300 transition-colors hover:bg-emerald-500/30 disabled:cursor-not-allowed disabled:opacity-60"
                    ${isApproving ? 'disabled' : ''}
                  >
                    <i class="fas ${isApproving ? 'fa-spinner fa-spin' : 'fa-circle-check'}"></i>
                    ${isApproving ? 'Menyetujui...' : 'Approve'}
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

    container.innerHTML = `
      <div class="glass-card p-8 text-center">
        <i class="fas fa-school text-4xl text-gray-600 mb-3"></i>
        <p class="text-gray-400">Belum ada sekolah</p>
        <button class="btn btn-primary mt-4 text-sm">
          <i class="fas fa-plus"></i> Tambah Sekolah
        </button>
      </div>
    `;
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
    try {
      const result = await authApi.call('getSubscriptionStats', {}, false);
      
      if (result.success) {
        this.data.subscriptions = result.data || {};
        this.data.invoices = result.invoices || [];
        this.updateSubscriptionStats();
        this.renderInvoices(this.data.invoices);
      }
    } catch (error) {
      console.error('Failed to load subscriptions:', error);
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
        <span class="badge badge-${this.getInvoiceStatusBadge(inv.status)} text-xs">${inv.status}</span>
      </div>
    `).join('');
  }

  /**
   * Get invoice status background
   * @param {string} status - Status
   * @returns {string}
   */
  getInvoiceStatusBg(status) {
    const bgs = {
      'paid': 'bg-green-500/20 text-green-400',
      'active': 'bg-green-500/20 text-green-400',
      'pending': 'bg-yellow-500/20 text-yellow-400',
      'pending_school': 'bg-yellow-500/20 text-yellow-400',
      'overdue': 'bg-red-500/20 text-red-400',
      'expired': 'bg-red-500/20 text-red-400'
    };
    return bgs[status] || 'bg-gray-500/20 text-gray-400';
  }

  /**
   * Get invoice icon
   * @param {string} status - Status
   * @returns {string}
   */
  getInvoiceIcon(status) {
    const icons = {
      'paid': 'fas fa-check',
      'active': 'fas fa-check-circle',
      'pending': 'fas fa-clock',
      'pending_school': 'fas fa-hourglass-half',
      'overdue': 'fas fa-exclamation',
      'expired': 'fas fa-calendar-xmark'
    };
    return icons[status] || 'fas fa-file';
  }

  /**
   * Get invoice status badge
   * @param {string} status - Status
   * @returns {string}
   */
  getInvoiceStatusBadge(status) {
    const badges = {
      'paid': 'success',
      'active': 'success',
      'pending': 'warning',
      'pending_school': 'warning',
      'overdue': 'danger',
      'expired': 'danger'
    };
    return badges[status] || 'secondary';
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

      if (status === 'inactive') {
        return school.status !== 'active';
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
    const statusMap = {
      active: {
        label: 'Aktif',
        badge: 'success',
        icon: 'fa-circle-check',
        iconBg: 'bg-green-500/20',
        iconColor: 'text-green-400'
      },
      pending_school: {
        label: 'Pending Approval',
        badge: 'warning',
        icon: 'fa-hourglass-half',
        iconBg: 'bg-amber-500/20',
        iconColor: 'text-amber-300'
      },
      pending: {
        label: 'Pending',
        badge: 'warning',
        icon: 'fa-clock',
        iconBg: 'bg-yellow-500/20',
        iconColor: 'text-yellow-300'
      },
      expired: {
        label: 'Expired',
        badge: 'danger',
        icon: 'fa-calendar-xmark',
        iconBg: 'bg-red-500/20',
        iconColor: 'text-red-400'
      },
      cancelled: {
        label: 'Dibatalkan',
        badge: 'danger',
        icon: 'fa-ban',
        iconBg: 'bg-red-500/20',
        iconColor: 'text-red-400'
      }
    };

    return statusMap[status] || {
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
      enterprise: 'Enterprise'
    };

    return labels[plan] || plan;
  }

  async handleSchoolListClick(event) {
    const approveButton = event.target.closest('[data-action="approve-school"]');
    if (!approveButton) {
      return;
    }

    event.preventDefault();
    event.stopPropagation();

    const schoolId = approveButton.dataset.schoolId;
    if (!schoolId || this.approvingSchoolId === schoolId) {
      return;
    }

    await this.handleApproveSchool(schoolId);
  }

  async handleApproveSchool(schoolId) {
    const school = this.data.schools.find((item) => (item.id || item.schoolId) === schoolId);
    if (!school) {
      return;
    }

    const schoolName = school.nama || school.name || school.schoolName || 'Sekolah';
    const confirmed = await showConfirm(
      'Approve sekolah?',
      `${schoolName} akan diaktifkan dan admin sekolah bisa melanjutkan registrasi.`,
      'Ya, Approve',
      'Batal',
      'info'
    );

    if (!confirmed) {
      return;
    }

    try {
      this.approvingSchoolId = schoolId;
      this.applySchoolFilters();

      const result = await authApi.approveSchool(schoolId);
      if (result.success) {
        await Promise.all([
          this.loadDashboardData(),
          this.loadSchools(),
          this.loadSubscriptions()
        ]);
      }
    } catch (error) {
      console.error('Failed to approve school:', error);
      showError('Gagal', 'Tidak dapat menyetujui sekolah.');
    } finally {
      this.approvingSchoolId = null;
      this.applySchoolFilters();
    }
  }
}

// Export
export { AdminSystemDashboard };

// Auto-init when DOM ready
document.addEventListener('DOMContentLoaded', () => {
  const dashboard = new AdminSystemDashboard();
});

