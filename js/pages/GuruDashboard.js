/**
 * Guru Dashboard Module
 * Modular dashboard logic for guru/teacher role
 * Clean, DRY, best practice
 */

import { authGuard } from '../core/AuthGuard.js';
import { themeManager } from '../core/ThemeManager.js';
import { authApi } from '../auth/AuthApi.js';

class GuruDashboard {
  constructor() {
    this.schoolName = 'SMA Negeri';
  }

  /**
   * Initialize guru dashboard
   */
  init() {
    // Auth protection
    if (!authGuard.init('guru', {
      avatarId: 'user-avatar',
      nameId: 'user-name',
      welcomeId: 'welcome-name',
      logoutId: 'logout-btn'
    })) {
      return;
    }

    // Initialize theme
    themeManager.init();

    // Load school info
    this.loadSchoolInfo();
    this.loadStudentsActivity();
    this.loadTopVouchers();
  }

  /**
   * Load school info from user profile
   */
  loadSchoolInfo() {
    const user = authGuard.getUser();
    if (user?.profile?.sekolah) {
      const schoolEl = document.getElementById('school-name');
      if (schoolEl) schoolEl.textContent = user.profile.sekolah;
    }
  }

  /**
   * Load students activity
   */
  async loadStudentsActivity() {
    try {
      const result = await authApi.getStudentsActivity();
      
      if (result.success) {
        this.renderStudentsActivity(result.data || []);
      }
    } catch (error) {
      console.error('Failed to load students activity:', error);
    }
  }

  /**
   * Render students activity
   * @param {Array} students - Students list
   */
  renderStudentsActivity(students) {
    // Placeholder - implement based on HTML structure
    console.log('Students activity:', students);
  }

  /**
   * Load top vouchers
   */
  async loadTopVouchers() {
    try {
      const result = await authApi.getTopVouchers();
      
      if (result.success) {
        this.renderTopVouchers(result.data || []);
      }
    } catch (error) {
      console.error('Failed to load vouchers:', error);
    }
  }

  /**
   * Render top vouchers
   * @param {Array} vouchers - Vouchers list
   */
  renderTopVouchers(vouchers) {
    // Placeholder - implement based on HTML structure
    console.log('Top vouchers:', vouchers);
  }
}

// Export
export { GuruDashboard };

// Auto-init when DOM ready
document.addEventListener('DOMContentLoaded', () => {
  const dashboard = new GuruDashboard();
  dashboard.init();
});

