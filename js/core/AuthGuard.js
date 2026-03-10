/**
 * Auth Guard - Unified Authentication Protection
 * Replaces duplicate inline auth checking in all dashboard HTMLs
 * Clean, modular, DRY - best practice
 */

class AuthGuard {
  constructor() {
    this.loginPage = 'index.html';
  }

  /**
   * Check if user is logged in
   * @returns {boolean}
   */
  isLoggedIn() {
    const user = localStorage.getItem('user');
    if (!user) return false;
    
    try {
      this.currentUser = JSON.parse(user);
      return true;
    } catch (e) {
      return false;
    }
  }

  /**
   * Get current user data
   * @returns {Object|null}
   */
  getUser() {
    if (!this.isLoggedIn()) return null;
    return this.currentUser;
  }

  /**
   * Get user role
   * @returns {string|null}
   */
  getRole() {
    if (!this.currentUser) return null;
    return this.currentUser.role;
  }

  /**
   * Check if user has required role
   * @param {string} requiredRole - Role to check
   * @returns {boolean}
   */
  hasRole(requiredRole) {
    const role = this.getRole();
    return role === requiredRole;
  }

  /**
   * Protect page - redirect if not logged in
   * @param {string} requiredRole - Optional role requirement
   */
  protect(requiredRole = null) {
    if (!this.isLoggedIn()) {
      this.redirectToLogin();
      return false;
    }

    if (requiredRole && !this.hasRole(requiredRole)) {
      this.redirectToDashboard();
      return false;
    }

    return true;
  }

  /**
   * Redirect to login page
   */
  redirectToLogin() {
    window.location.href = this.loginPage;
  }

  /**
   * Redirect to appropriate dashboard based on role
   */
  redirectToDashboard() {
    const role = this.getRole();
    const dashboards = {
      'admin-system': 'dashboard-admin.html',
      'admin-sekolah': 'dashboard-admin-sekolah.html',
      'siswa': 'dashboard-siswa.html',
      'mitra': 'dashboard-mitra.html',
      'guru': 'dashboard-guru.html'
    };
    
    if (role && dashboards[role]) {
      window.location.href = dashboards[role];
    } else {
      this.redirectToLogin();
    }
  }

  /**
   * Check if user has admin role (admin-system or admin-sekolah)
   * @returns {boolean}
   */
  isAdmin() {
    const role = this.getRole();
    return role === 'admin-system' || role === 'admin-sekolah';
  }

  /**
   * Get user display name (first name)
   * @returns {string}
   */
  getDisplayName() {
    if (!this.currentUser || !this.currentUser.name) return 'User';
    return this.currentUser.name.split(' ')[0];
  }

  /**
   * Get user avatar URL
   * @returns {string}
   */
  getAvatar() {
    if (!this.currentUser) return '';
    return this.currentUser.picture || '';
  }

  /**
   * Logout user
   */
  logout() {
    localStorage.removeItem('user');
    localStorage.removeItem('cid');
    localStorage.removeItem('wa');
    this.currentUser = null;
    
    // Disable Google auto-select
    if (window.google?.accounts?.id) {
      window.google.accounts.id.disableAutoSelect();
    }
    
    this.redirectToLogin();
  }

  /**
   * Setup UI elements with user data
   * @param {Object} options - Configuration options
   */
  setupUI(options = {}) {
    const {
      avatarId = 'user-avatar',
      nameId = 'user-name',
      welcomeId = 'welcome-name',
      logoutId = 'logout-btn'
    } = options;

    // Set avatar
    const avatarEl = document.getElementById(avatarId);
    if (avatarEl && this.getAvatar()) {
      avatarEl.src = this.getAvatar();
    }

    // Set name
    const nameEl = document.getElementById(nameId);
    if (nameEl) {
      nameEl.textContent = this.currentUser?.name || '';
    }

    // Set welcome message
    const welcomeEl = document.getElementById(welcomeId);
    if (welcomeEl) {
      welcomeEl.textContent = this.getDisplayName();
    }

    // Setup logout button
    const logoutEl = document.getElementById(logoutId);
    if (logoutEl) {
      logoutEl.addEventListener('click', () => this.logout());
    }
  }

  /**
   * Initialize with automatic UI setup
   * @param {string} requiredRole - Role to protect
   * @param {Object} uiOptions - UI setup options
   * @returns {boolean} - Whether protection passed
   */
  init(requiredRole = null, uiOptions = {}) {
    if (!this.protect(requiredRole)) {
      return false;
    }
    
    this.setupUI(uiOptions);
    return true;
  }
}

// Create singleton instance
const authGuard = new AuthGuard();

// Export for modules
export { authGuard };

// Also expose globally
window.authGuard = authGuard;

