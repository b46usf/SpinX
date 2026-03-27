// DashboardDataService - Stats/Account data

export class DashboardDataService {
  constructor(authApi) {
    this.authApi = authApi;
  }

  async loadStats(schoolId) {
    const payload = { schoolId, action: 'getschoolstats' };
    return await this.authApi.call('getschoolstats', payload, false);
  }

  async loadAccountData(schoolId) {
    return await this.authApi.call('checksubscription', { schoolId }, false);
  }

  /**
   * Generic subscription check for any role
   * Uses schoolId from user - works for guru/siswa/mitra/admin-school
   */
  async checkSubscription(userId, schoolId) {
    // Fallback lookup if no schoolId (but user.schoolId should exist post-login)
    if (!schoolId) {
      const profile = await this.authApi.getProfile(userId);
      if (!profile.success || !profile.schoolId) {
        throw new Error('schoolId tidak ditemukan');
      }
      schoolId = profile.schoolId;
    }
    
    return await this.loadAccountData(schoolId);
  }
}

// Export guard for convenience
export { SubscriptionGuard };

