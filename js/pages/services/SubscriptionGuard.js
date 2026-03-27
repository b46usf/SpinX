/**
 * SubscriptionGuard - Ensures active subscription before dashboard access
 * Blocks expired/inactive schools with toast + redirect to login
 * Bypasses admin-system (no subscription required)
 */

import { DashboardDataService } from './DashboardDataService.js';
import { authApi } from '../../auth/AuthApi.js';
import AuthRouter from '../../auth/utils/AuthRouter.js';

const ToastProxy = {
  error(title, message) {
    window.Toast?.error?.(title, message);
  },
  warning(title, message) {
    window.Toast?.warning?.(title, message);
  }
};

export class SubscriptionGuard {
  constructor() {
    this.dataService = new DashboardDataService(authApi);
  }

  /**
   * Check subscription for user
   * @param {Object} user - User object from auth (must have role, userId/schoolId)
   * @returns {Promise<{ok: boolean, data: any}>} - ok:true if active
   */
  async check(user) {
    // Bypass admin-system (no subscription needed)
    if (user.role === 'admin-system') {
      return { ok: true, data: { status: 'system-admin' } };
    }

    try {
      // Require schoolId for school-related roles
      const schoolId = user.schoolId || user.sekolah;
      if (!schoolId) {
        throw new Error('schoolId tidak ditemukan. Hubungi admin sekolah.');
      }

      const result = await this.dataService.loadAccountData(schoolId);
      
      if (result.success !== true || result.status !== 'active') {
        const msg = result.message || `Subscription ${result.status || 'expired'}. Hubungi admin sekolah untuk renew.`;
        throw new Error(msg);
      }

      return { ok: true, data: result };
    } catch (error) {
      await this.handleExpired(error.message);
      return { ok: false, error: error.message };
    }
  }

  /**
   * Handle expired subscription - show toast + redirect
   */
  async handleExpired(message = 'Subscription expired') {
    ToastProxy.error('Subscription Expired', message);
    
    // Clear any stale session
    if (window.jwtManager) window.jwtManager.clearAuthData();
    localStorage.removeItem('user');
    
    // Stay/block at login (update route)
    setTimeout(() => {
      AuthRouter.routeToLogin();
    }, 2000);
  }

  /**
   * Static convenience method
   */
  static async verify(user) {
    const guard = new SubscriptionGuard();
    return await guard.check(user);
  }
}

// Global convenience
if (typeof window !== 'undefined') {
  window.SubscriptionGuard = SubscriptionGuard;
  window.checkSubscription = async (user) => SubscriptionGuard.verify(user);
}

export default SubscriptionGuard;

