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
}

