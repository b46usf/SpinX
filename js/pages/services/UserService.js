export class UserService {
  constructor(api, schoolId) {
    this.api = api;
    this.schoolId = schoolId;
  }

  async loadUsers(role, page = 1, size = 100, append = false) {
    const payload = {
      schoolId: this.schoolId,
      role,
      page,
      size
    };

    let result = await this.api.call('getschoolmasterusers', payload, false);
    if (!result?.success) {
      result = await this.api.call('getschoolusers', payload, false);
    }

    return {
      users: result.data?.data || result.data || [],
      totalCount: result.data?.totalCount,
      hasMore: result.data?.hasMore !== false,
      stats: result.stats || {},
      success: result.success
    };
  }
}

