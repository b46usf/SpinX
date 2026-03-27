/**
 * SubscriptionGuard - Ensures active subscription before dashboard access
 * Static verify() method - no instantiation needed
 * Blocks expired/inactive schools with toast + login redirect
 * Bypasses admin-system (no subscription required)
 */

import { authApi } from '../../auth/AuthApi.js';
import { DashboardDataService } from './DashboardDataService.js';
import AuthRouter from '../../auth/utils/AuthRouter.js';

const ToastProxy = {
  error(title, message) {
    window.Toast?.error?.(title, message);
  }
};

export class SubscriptionGuard {
  /**
   * Static check - use SubscriptionGuard.verify(user)
   * @param {Object} user - User from authGuard/JWT
   */
  static async verify(user) {
    // Bypass admin-system
    if (user.role === 'admin-system') {
      return { ok: true, status: 'bypassed' };
    }

    try {
      const dataService = new DashboardDataService(authApi);
      const schoolId = user.schoolId || user.sekolah;
      
      if (!schoolId) {
        throw new Error('schoolId tidak ditemukan. Login ulang atau hubungi admin.');
      }

      const result = await dataService.loadAccountData(schoolId);
      
      if (result.success !== true || result.status !== 'active') {
        const msg = result.message || 'Subscription tidak aktif. Hubungi admin sekolah untuk renew.';
        throw new Error(msg);
      }

      return { ok: true, data: result };
    } catch (error) {
      await SubscriptionGuard._handleExpired(error.message);
      return { ok: false, error: error.message };
    }
  }

  static async _handleExpired(message = 'Subscription expired/inactive') {
    ToastProxy.error('Subscription Expired', message);
    
    // Clear session
    if (window.jwtManager) window.jwtManager.clearAuthData();
    localStorage.removeItem('user');
    
    // Redirect to login (stay/block)
    setTimeout(() => {
      AuthRouter.routeToLogin();
    }, 1500);
  }
}

// Global static access
if (typeof window !== 'undefined') {
  window.SubscriptionGuard = SubscriptionGuard;
}
