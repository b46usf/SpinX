/**
 * Dashboard Utilities - Shared helpers for all dashboards
 * Implements DRY principle - centralized formatting, status, time helpers
 */

class DashboardUtils {
  /**
   * Format currency to Rp notation
   * @param {number} amount
   * @returns {string}
   */
  static formatCurrency(amount) {
    if (amount >= 1000000) {
      return `Rp ${(amount / 1000000).toFixed(1)}JT`;
    } else if (amount >= 1000) {
      return `Rp ${(amount / 1000).toFixed(0)}RB`;
    }
    return `Rp ${amount}`;
  }

  /**
   * Format date to locale string
   * @param {string|Date} date - Date to format
   * @param {string} format - 'long' | 'short' | 'datetime' | 'date'
   * @returns {string}
   */
  static formatDate(date, format = 'date') {
    if (!date) return '-';
    
    try {
      const d = new Date(date);
      const options = {
        long: { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' },
        short: { day: '2-digit', month: '2-digit', year: '2-digit' },
        datetime: { day: '2-digit', month: '2-digit', year: '2-digit', hour: '2-digit', minute: '2-digit' },
        date: { day: 'numeric', month: 'short', year: 'numeric' }
      };
      
      return d.toLocaleDateString('id-ID', options[format] || options.date);
    } catch (e) {
      return '-';
    }
  }

  /**
   * Format time ago
   * @param {string} waktu - Time string
   * @returns {string}
   */
  static formatTimeAgo(waktu) {
    if (!waktu) return '-';
    
    try {
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
      
      return this.formatDate(waktu, 'short');
    } catch (e) {
      return '-';
    }
  }

  /**
   * Normalize search value for filtering
   * @param {any} value
   * @returns {string}
   */
  static normalizeSearchValue(value) {
    if (value === null || typeof value === 'undefined') {
      return '';
    }
    return String(value).toLowerCase().trim();
  }

  /**
   * Check if date has passed today
   * @param {string|Date} date
   * @returns {boolean}
   */
  static isDatePassed(date) {
    if (!date) return false;
    
    try {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      const checkDate = new Date(date);
      checkDate.setHours(0, 0, 0, 0);
      
      return checkDate < today;
    } catch (e) {
      return false;
    }
  }

  /**
   * Get role badge class - for activity/user status display
   * @param {string} role
   * @returns {string}
   */
  static getRoleBadge(role) {
    const badges = {
      'admin': 'danger',
      'admin-system': 'danger',
      'admin-sekolah': 'primary',
      'siswa': 'info',
      'student': 'info',
      'mitra': 'success',
      'partner': 'success',
      'guru': 'warning',
      'teacher': 'warning'
    };
    return badges[role?.toLowerCase()] || 'secondary';
  }

  /**
   * Get activity icon based on role
   * @param {string} role
   * @returns {string}
   */
  static getActivityIcon(role) {
    const icons = {
      'admin-system': 'fa-shield-alt',
      'admin-sekolah': 'fa-shield-alt',
      'siswa': 'fa-user-graduate',
      'mitra': 'fa-store',
      'guru': 'fa-chalkboard-teacher'
    };
    return icons[role] || 'fa-user';
  }

  /**
   * Get activity icon background
   * @param {string} role
   * @returns {string}
   */
  static getActivityIconBg(role) {
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
   * Determine actual subscription status (consider expiration)
   * @param {string} status
   * @param {string|Date} expiresAt
   * @returns {string}
   */
  static determineActualStatus(status, expiresAt) {
    if (status !== 'active' || !expiresAt) {
      return status;
    }

    return this.isDatePassed(expiresAt) ? 'expired' : 'active';
  }

  /**
   * Clear text skeleton loaders
   * @param {Array<string>} ids - Element IDs to clear
   */
  static clearTextSkeletons(ids) {
    if (!ids || !Array.isArray(ids)) return;
    ids.forEach(id => {
      const el = document.getElementById(id);
      if (el) {
        el.classList?.remove('animate-pulse', 'bg-gray-700');
      }
    });
  }

  /**
   * Render empty state container
   * @param {HTMLElement} container
   * @param {Object} config - { icon, title, subtitle, action? }
   */
  static renderEmptyState(container, config) {
    if (!container) return;
    
    const { icon = 'fa-inbox', title = 'Tidak ada data', subtitle = '', action = null } = config;
    
    container.innerHTML = `
      <div class="text-center py-8">
        <i class="fas ${icon} text-4xl text-gray-600 mb-3"></i>
        <p class="text-gray-400 font-medium">${title}</p>
        ${subtitle ? `<p class="text-xs text-gray-500 mt-1">${subtitle}</p>` : ''}
        ${action ? `<button type="button" class="btn btn-primary mt-4 text-sm">${action.label}</button>` : ''}
      </div>
    `;
  }
}

export { DashboardUtils };
