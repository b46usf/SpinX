/**
 * Dashboard Integration Bridge
 * Handles navigation and data passing between different admin dashboards
 * Allows AdminDashboard to seamlessly transition to AdminSystemDashboard
 */

class DashboardIntegration {
  /**
   * Navigate to specific dashboard based on role
   * @param {string} role - User role
   * @param {string} section - Optional section to load directly
   */
  static navigateToDashboard(role, section = null) {
    const roleMap = {
      'admin-system': 'dashboard-admin-system.html',
      'admin-sekolah': 'dashboard-admin-school.html'
    };

    const dashboard = roleMap[role];
    if (!dashboard) {
      console.warn(`Unknown role for dashboard navigation: ${role}`);
      return;
    }

    // Include section in query param if provided
    const url = section ? `${dashboard}?section=${section}` : dashboard;
    window.location.href = url;
  }

  /**
   * Parse section from query parameters
   * @returns {string|null}
   */
  static getSectionFromQuery() {
    const params = new URLSearchParams(window.location.search);
    return params.get('section') || null;
  }

  /**
   * Share data between dashboard instances via session storage
   * @param {string} key - Data key
   * @param {any} value - Data to share
   */
  static shareData(key, value) {
    try {
      sessionStorage.setItem(`dashboard_${key}`, JSON.stringify(value));
    } catch (e) {
      console.warn('Failed to store dashboard data:', e);
    }
  }

  /**
   * Retrieve shared data
   * @param {string} key - Data key
   * @returns {any|null}
   */
  static retrieveSharedData(key) {
    try {
      const data = sessionStorage.getItem(`dashboard_${key}`);
      return data ? JSON.parse(data) : null;
    } catch (e) {
      console.warn('Failed to retrieve dashboard data:', e);
      return null;
    }
  }

  /**
   * Broadcast event to other dashboard instances
   * @param {string} eventName - Event name
   * @param {any} data - Event data
   */
  static broadcastEvent(eventName, data = null) {
    const event = new CustomEvent('dashboard:' + eventName, { detail: data });
    window.dispatchEvent(event);
  }

  /**
   * Listen to dashboard events
   * @param {string} eventName - Event name
   * @param {Function} handler - Event handler
   */
  static onDashboardEvent(eventName, handler) {
    window.addEventListener('dashboard:' + eventName, (e) => {
      handler(e.detail);
    });
  }
}

export { DashboardIntegration };
