/**
 * Auth Router Utility
 * Handles routing to dashboard pages
 * Uses Toast for notifications (SweetAlert2)
 * 
 * Note: Toast functions are accessed via global window.Toast
 */

// Get Toast from global
const getToast = () => window.Toast || null;

const AuthRouter = {
  // Dashboard mapping by role
  dashboards: {
    'admin-system': 'dashboard-admin-system.html',
    'admin-sekolah': 'dashboard-admin-school.html',
    'siswa': 'dashboard-siswa.html',
    'mitra': 'dashboard-mitra.html',
    'guru': 'dashboard-guru.html'
  },

  userLoginRoles: ['admin-sekolah', 'siswa', 'guru', 'mitra'],

  /**
   * Get dashboard URL for a role
   */
  getDashboardUrl(role) {
    return this.dashboards[role] || 'index.html';
  },

  /**
   * Route to appropriate dashboard based on role
   */
  routeToDashboard(role) {
    const dashboard = this.dashboards[role];
    if (dashboard) {
      window.location.href = dashboard;
    } else {
      // Invalid role - redirect to index with error
      this.showError('Role tidak valid');
      window.location.href = 'index.html';
    }
  },

  /**
   * Safe route with subscription check (bypass admin-system)
   * @param {string} role - User role
   * @param {Object} user - User object (w/ schoolId)
   */
  async safeRouteToDashboard(role, user) {
    try {
      // Validate inputs
      if (!role || !user) {
        throw new Error('Missing role or user for safe routing');
      }
      
      // Bypass admin-system
      if (role === 'admin-system') {
        this.routeToDashboard(role);
        return;
      }
      
      // Null-safe verify call
      if (!window.SubscriptionGuard?.verify) {
        console.warn('SubscriptionGuard.verify not available - bypassing check');
        this.routeToDashboard(role);
        return;
      }
      
      await window.SubscriptionGuard.verify(user);
      this.routeToDashboard(role);
    } catch (error) {
      console.error('SafeRoute failed:', error.message);
      // Don't block routing on verify failure - let dashboard handle
      this.routeToDashboard(role);
    }
  },

  /**
   * Route to login page
   */
  routeToLogin(role = '') {
    const normalizedRole = role ? role.trim().toLowerCase() : '';

    if (normalizedRole && !this.userLoginRoles.includes(normalizedRole)) {
      this.showError('Role login tidak valid');
      return;
    }

    const params = new URLSearchParams();
    params.set('view', 'login');

    if (normalizedRole) {
      params.set('role', normalizedRole);
    }

    const loginUrl = `index.html?${params.toString()}`;
    const currentPage = window.location.pathname.split('/').pop() || 'index.html';
    const openInlineLogin = (window.App && typeof window.App.showLoginSection === 'function')
      || typeof window.showLoginSection === 'function';

    if ((currentPage === 'index.html' || currentPage === '') && openInlineLogin) {
      window.history.pushState({}, '', loginUrl);

      if (window.App?.showLoginSection) {
        window.App.showLoginSection({ role: normalizedRole, updateHistory: false });
      } else {
        window.showLoginSection({ role: normalizedRole, updateHistory: false });
      }
      return;
    }

    window.location.href = loginUrl;
  },

  /**
   * Show error message using Toast
   */
  showError(message) {
    const errorEl = document.getElementById('auth-error');
    if (errorEl) {
      errorEl.textContent = message;
      errorEl.classList.remove('hidden');
      // Auto hide after 5 seconds
      setTimeout(() => {
        errorEl.classList.add('hidden');
        errorEl.textContent = '';
      }, 5000);
    } else {
      // Fallback to Toast if no error element
      const Toast = getToast();
      if (Toast) Toast.error('Error', message);
    }
  },

  /**
   * Hide error message
   */
  hideError() {
    const errorEl = document.getElementById('auth-error');
    if (errorEl) {
      errorEl.textContent = '';
      errorEl.classList.add('hidden');
    }
  }
};

// Export for global use
window.AuthRouter = AuthRouter;

export default AuthRouter;

