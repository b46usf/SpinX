/**
 * Admin Dashboard Module
 * Modular dashboard logic for admin role
 * Clean, DRY, best practice
 * Integrated with AdminSystemDashboard via shared utilities
 */

import { authGuard } from '../core/AuthGuard.js';
import { themeManager } from '../core/ThemeManager.js';
import { DashboardUtils } from '../core/DashboardUtils.js';
import { DashboardIntegration } from '../core/DashboardIntegration.js';
import { authApi } from '../auth/AuthApi.js';

class AdminDashboard {
  constructor() {
    this.stats = {
      siswa: 0,
      mitra: 0,
      guru: 0,
      today: 0
    };
    this.user = null;
  }

  /**
   * Initialize admin dashboard
   */
  async init() {
    // Auth protection - accept both admin-system and admin-sekolah roles
    if (!authGuard.init('admin-system', {
      avatarId: 'user-avatar',
      nameId: 'user-name',
      welcomeId: 'welcome-name',
      logoutId: 'logout-btn'
    })) {
      return;
    }

    // Initialize theme
    themeManager.init();

    // Check if user should go to AdminSystemDashboard instead
    this.user = authGuard.getUser();
    if (this.user?.role === 'admin-system') {
      // User is system admin - offer navigation to system dashboard
      this.setupSystemAdminLinks();
    }

    // Load data
    this.loadStats();
    this.loadRecentActivity();
  }

  /**
   * Setup navigation for system admin
   */
  setupSystemAdminLinks() {
    const navBtn = document.querySelector('[data-section="system-admin"]');
    if (navBtn) {
      navBtn.addEventListener('click', () => {
        DashboardIntegration.navigateToDashboard('admin-system');
      });
    }
  }

  /**
   * Load dashboard statistics
   */
  async loadStats() {
    try {
      const result = await authApi.getStats();
      
      if (result.success) {
        this.updateStats(result.data);
      }
    } catch (error) {
      console.error('Failed to load stats:', error);
    }
  }

  /**
   * Update stats display
   * @param {Object} data - Stats data
   */
  updateStats(data) {
    const elements = {
      'stat-siswa': data.siswa,
      'stat-mitra': data.mitra,
      'stat-guru': data.guru,
      'stat-today': data.today
    };

    Object.entries(elements).forEach(([id, value]) => {
      const el = document.getElementById(id);
      if (el) el.textContent = value || 0;
    });
  }

  /**
   * Load recent activity
   */
  async loadRecentActivity() {
    const tableBody = document.getElementById('activity-table');
    if (!tableBody) return;

    try {
      const result = await authApi.getRecentActivity();
      
      if (result.success && result.data?.length > 0) {
        this.renderActivityTable(result.data);
      } else {
        this.renderEmptyActivity();
      }
    } catch (error) {
      console.error('Failed to load activity:', error);
      this.renderEmptyActivity();
    }
  }

  /**
   * Render activity table - uses DashboardUtils for consistency
   * @param {Array} activities - Activity list
   */
  renderActivityTable(activities) {
    const tableBody = document.getElementById('activity-table');
    if (!tableBody) return;

    tableBody.innerHTML = activities.map(activity => `
      <tr class="border-b border-white/10 hover:bg-white/5">
        <td class="py-3 text-sm">${DashboardUtils.formatDate(activity.waktu, 'datetime')}</td>
        <td class="py-3 text-sm">${activity.email}</td>
        <td class="py-3">
          <span class="badge badge-${DashboardUtils.getRoleBadge(activity.role)}">${activity.role}</span>
        </td>
        <td class="py-3 text-sm">${activity.aktivitas}</td>
      </tr>
    `).join('');
  }

  /**
   * Render empty activity state
   */
  renderEmptyActivity() {
    const tableBody = document.getElementById('activity-table');
    if (!tableBody) return;

    tableBody.innerHTML = `
      <tr>
        <td colspan="4" class="py-8 text-center text-muted">
          <i class="fas fa-inbox text-2xl mb-2"></i>
          <p>Belum ada aktivitas</p>
        </td>
      </tr>
    `;
  }
}

// Export
export { AdminDashboard };

// Auto-init when DOM ready
document.addEventListener('DOMContentLoaded', () => {
  const dashboard = new AdminDashboard();
  dashboard.init();
});

