/**
 * Auth Router Utility
 * Handles routing to dashboard pages
 * Uses Toast for notifications (SweetAlert2)
 */

// Import Toast functions
import { showError as showToastError } from '../../components/utils/Toast.js';

const AuthRouter = {
  // Dashboard mapping by role
  dashboards: {
    'admin': 'dashboard-admin.html',
    'siswa': 'dashboard-siswa.html',
    'mitra': 'dashboard-mitra.html',
    'guru': 'dashboard-guru.html'
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
      showToastError('Error', message);
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

