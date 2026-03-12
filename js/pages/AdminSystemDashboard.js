/**
 * Admin System Dashboard Module
 * Mobile-first dashboard with bottom navigation
 * Clean, DRY, best practice, modular
 */

import { authGuard } from '../core/AuthGuard.js';
import { themeManager } from '../core/ThemeManager.js';
import { authApi } from '../auth/AuthApi.js';

class AdminSystemDashboard {
  constructor() {
    this.currentSection = 'dashboard';
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
    const Toast = window.Toast;
    
    switch (action) {
      case 'settings':
        Toast?.info('Pengaturan', 'Halaman pengaturan sistem');
        break;
      case 'activity':
        Toast?.info('Log Aktivitas', 'Melihat riwayat aktivitas');
        break;
      case 'logs':
        Toast?.info('System Logs', 'Melihat log sistem');
        break;
    }
  }

  /**
   * Handle logout
   */
  handleLogout() {
    const Toast = window.Toast;
    
    Toast?.fire({
      title: 'Logout?',
      text: 'Apakah Anda yakin ingin logout?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Ya, Logout',
      cancelButtonText: 'Batal',
      confirmButtonColor: '#ef4444'
    }).then((result) => {
      if (result.isConfirmed) {
        authGuard.logout();
      }
    });
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
        this.updateDashboardStats(result.data);
      }
    } catch (error) {
      console.error('Failed to load dashboard stats:', error);
    }

    // Load recent activity
    this.loadRecentActivity();
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
        this.renderSchools(this.data.schools);
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

    container.innerHTML = schools.map(school => `
      <div class="glass-card p-4 hover:bg-white/5 transition-colors cursor-pointer" data-id="${school.id}">
        <div class="flex items-start gap-3">
          <div class="w-12 h-12 rounded-xl ${school.status === 'active' ? 'bg-green-500/20' : 'bg-red-500/20'} flex items-center justify-center">
            <i class="fas fa-school ${school.status === 'active' ? 'text-green-400' : 'text-red-400'}"></i>
          </div>
          <div class="flex-1 min-w-0">
            <div class="font-medium text-sm">${school.nama || school.name}</div>
            <div class="text-xs text-gray-500">${school.alamat || school.address || '-'}</div>
            <div class="flex items-center gap-3 mt-2">
              <span class="text-xs text-gray-400">
                <i class="fas fa-users mr-1"></i>${school.siswa_count || school.siswa || 0} siswa
              </span>
              <span class="text-xs text-gray-400">
                <i class="fas fa-tag mr-1"></i>${school.plan || 'Starter'}
              </span>
            </div>
          </div>
          <div class="text-right">
            <span class="badge badge-${school.status === 'active' ? 'success' : 'danger'} text-xs">
              ${school.status === 'active' ? 'Aktif' : 'Nonaktif'}
            </span>
          </div>
        </div>
      </div>
    `).join('');
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
    const filtered = this.data.schools.filter(school => {
      const name = (school.nama || school.name || '').toLowerCase();
      const address = (school.alamat || school.address || '').toLowerCase();
      return name.includes(query.toLowerCase()) || address.includes(query.toLowerCase());
    });
    this.renderSchools(filtered);
  }

  /**
   * Filter schools by status
   * @param {string} status - Status filter
   */
  filterSchoolsByStatus(status) {
    if (!status) {
      this.renderSchools(this.data.schools);
      return;
    }
    const filtered = this.data.schools.filter(s => s.status === status);
    this.renderSchools(filtered);
  }

  /**
   * Load subscriptions data
   */
  async loadSubscriptions() {
    try {
      const result = await authApi.call('getSubscriptionStats', {}, false);
      
      if (result.success) {
        this.data.subscriptions = result.data || {};
        this.updateSubscriptionStats();
        this.renderInvoices(result.invoices || []);
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
      'pending': 'bg-yellow-500/20 text-yellow-400',
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
    const icons = {
      'paid': 'fas fa-check',
      'pending': 'fas fa-clock',
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
    const badges = {
      'paid': 'success',
      'pending': 'warning',
      'overdue': 'danger'
    };
    return badges[status] || 'secondary';
  }
}

// Export
export { AdminSystemDashboard };

// Auto-init when DOM ready
document.addEventListener('DOMContentLoaded', () => {
  const dashboard = new AdminSystemDashboard();
});

