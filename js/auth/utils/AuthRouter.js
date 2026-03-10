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
    'admin-system': 'dashboard-admin.html',
    'admin-sekolah': 'dashboard-admin-sekolah.html',
    'siswa': 'dashboard-siswa.html',
    'mitra': 'dashboard-mitra.html',
    'guru': 'dashboard-guru.html'
  },

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
   * Route to login page
   */
  routeToLogin() {
    window.location.href = 'index.html';
  },

  /**
   * Route to admin login page
   */
  routeToAdminLogin() {
    window.location.href = 'adsys.html';
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

