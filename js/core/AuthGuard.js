/**
 * Auth Guard - Unified Authentication Protection
 * Replaces duplicate inline auth checking in all dashboard HTMLs
 * Clean, modular, DRY - best practice
 * Now uses JWT for authentication validation
 */

import AuthRouter from '../auth/utils/AuthRouter.js';

// Lazy load JwtManager to avoid circular dependencies
let jwtManager = null;
const getJwtManager = () => {
  if (!jwtManager && typeof window !== 'undefined') {
    // Try to get from window (set by module)
    jwtManager = window.jwtManager;
  }
  return jwtManager;
};

class AuthGuard {
  constructor() {
    this.loginPage = 'index.html';
    this.currentUser = null;
  }

  /**
   * Check if user is logged in (using JWT)
   * @returns {boolean}
   */
  isLoggedIn() {
    // Try JWT Manager first
    const jwt = getJwtManager();
    if (jwt && jwt.isTokenValid()) {
      const user = jwt.getUser();
      if (user) {
        this.currentUser = user;
        return true;
      }
    }
    
    // Fallback to localStorage check
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
   * Check if token is valid (not expired)
   * @returns {boolean}
   */
  isTokenValid() {
    const jwt = getJwtManager();
    if (jwt) {
      return jwt.isTokenValid();
    }
    
    // Fallback: check if localStorage has user
    return this.isLoggedIn();
  }

  /**
   * Check if token is expiring soon
   * @returns {boolean}
   */
  isTokenExpiringSoon() {
    const jwt = getJwtManager();
    if (jwt) {
      return jwt.isTokenExpiringSoon();
    }
    return false;
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

    if (role && AuthRouter.getDashboardUrl(role) !== 'index.html') {
      AuthRouter.routeToDashboard(role);
      return;
    }

    this.redirectToLogin();
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
    return this.currentUser.picture || this.currentUser.foto || '';
  }

  /**
   * Logout user (clear JWT and localStorage)
   */
  logout() {
    // Clear localStorage
    localStorage.removeItem('user');
    localStorage.removeItem('cid');
    localStorage.removeItem('wa');
    localStorage.removeItem('admin_google_user');
    localStorage.removeItem('pending_admin_user');
    
    // Clear JWT Manager if available
    const jwt = getJwtManager();
    if (jwt) {
      jwt.clearAuthData();
    }
    
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
    if (avatarEl) {
      const avatar = this.getAvatar();
      if (avatar) {
        avatarEl.src = avatar;
      } else {
        avatarEl.src = 'https://ui-avatars.com/api/?name=' + encodeURIComponent(this.getDisplayName()) + '&background=random';
      }
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

