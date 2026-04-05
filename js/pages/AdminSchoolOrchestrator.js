/**
 * AdminSchoolOrchestrator - Enhanced 150 lines coordinator
 * Delegates to services + pure renderers
 * Single source of data orchestration
 */
import { UserService } from './services/UserService.js';
import { ImportService } from './services/ImportService.js';
import { PDFService } from './services/PDFService.js';
import { DashboardDataService } from './services/DashboardDataService.js';
import { InfiniteScroll } from './components/InfiniteScroll.js';
import { renderUserList } from './components/UserListRenderer.js';
import { renderStats, renderUserStats, renderSchoolInfo } from './components/DashboardStats.js';
import { getRoleColor, getUserSecondaryText, getUserSearchText } from './utils/role.js';
import { clearContainerSkeleton } from '../components/utils/DashboardSkeleton.js';
import { DOMUtils } from '../core/DOMUtils.js';
import { ToastUtils } from '../core/ToastUtils.js';

const Toast = ToastUtils;

export class AdminSchoolOrchestrator {
  constructor(dashboard, authApi, schoolId) {
    this.dashboard = dashboard;
    this.schoolId = schoolId;
    this.authApi = authApi;
    this.userService = new UserService(authApi, schoolId);
    this.importService = new ImportService(authApi, schoolId);
    this.pdfService = PDFService;
    this.dataService = new DashboardDataService(authApi);
    this.infiniteScrolls = {};
    this.pagination = { siswa: {page:1, loading:false, hasMore:true}, guru:{}, mitra:{} };
    this.roleUtils = { getRoleColor, getUserSecondaryText, getUserSearchText };
    this.userData = { siswa: [], guru: [], mitra: [] };
  }

  async init() {
    await Promise.all([
      this.loadDashboardData(),
      this.loadAccountData()
    ]);
    this.dashboard.emit('orchestratorReady');
  }

  async loadSection(section) {
    switch(section) {
      case 'users':
        const activeTab = this.dashboard.getActiveUserTab();
        await this.loadUsers(activeTab);
        break;
      case 'reward':
        await this.loadRewards();
        break;
    }
  }

  async loadDashboardData() {
    try {
      const result = await this.dataService.loadStats(this.schoolId);
      renderStats(result.data || {});
      this.renderTopStudents(result.topStudents || []);
      this.renderRecentActivity(result.activities || []);
      renderUserStats(result.userStats || {});
    } catch(e) {
      Toast.error('Stats load failed', e.message);
    }
  }

  async loadAccountData() {
    try {
      const result = await this.dataService.loadAccountData(this.schoolId);
      renderSchoolInfo(result.school || {});
    } catch(e) {
      console.warn('Account data unavailable');
    }
  }

  async loadUsers(role, append = false) {
    if (this.pagination[role].loading) return;
    
    this.pagination[role].loading = true;
    
    try {
      const result = await this.userService.loadUsers(role, this.pagination[role].page, 100, append);
      const nextUsers = append
        ? [...this.userData[role], ...result.users]
        : result.users;

      this.userData[role] = nextUsers;
      renderUserList(role, nextUsers, this.roleUtils.getUserSecondaryText, this.roleUtils.getRoleColor);
      renderUserStats(result.stats);
      
      if (!append) {
        this.setupInfiniteScroll(role, () => this.loadUsers(role, true));
      }
      
      this.pagination[role].hasMore = result.hasMore;
      this.pagination[role].page = append ? this.pagination[role].page + 1 : 2;
    } catch(e) {
      Toast.error(`Load ${role} failed`, e.message);
    } finally {
      this.pagination[role].loading = false;
    }
  }

  setupInfiniteScroll(role, loadMoreFn) {
    const container = DOMUtils.getElement(`${role}-list`);
    if (container && !this.infiniteScrolls[role]) {
      this.infiniteScrolls[role] = new InfiniteScroll(container, loadMoreFn);
    }
  }

  async handleImportPreview(file) {
    try {
      const rows = await this.importService.parseFile(file);
      // File preview is now handled by ImportModal component
      return true;
    } catch(e) {
      Toast.error('Preview failed', e.message);
      return false;
    }
  }

  async handleImportConfirm(file, role) {
    try {
      Toast.loading(`Importing ${role}...`);
      const result = await this.importService.confirmImport(file, role);
      if (result.success) {
        Toast.success('Import success', `${result.stats?.total || 0} records`);
        await this.loadUsers(role, false);
        // Modal closes automatically via ImportModal component
      } else {
        Toast.error('Import failed', result.error);
      }
    } catch(e) {
      Toast.error('Import error', e.message);
    }
  }

  async handlePDFDownload(role) {
    try {
      await this.pdfService.checkPDFReady();
      await this.pdfService.generateTemplate(this.schoolId, role);
    } catch(e) {
      Toast.error('PDF failed', 'Try refresh (F5)');
    }
  }

  filterUsers(role, query) {
    const normalizedQuery = (query || '').trim().toLowerCase();
    const users = this.userData[role] || [];
    const filteredUsers = !normalizedQuery
      ? users
      : users.filter(user => this.roleUtils.getUserSearchText(user).includes(normalizedQuery));

    renderUserList(role, filteredUsers, this.roleUtils.getUserSecondaryText, this.roleUtils.getRoleColor);
  }

  async loadRewards() {
    // Placeholder - implement when BE ready
    console.log('Rewards data loading...');
  }

  renderTopStudents(students) {
    const container = DOMUtils.getElement('top-siswa-list');
    if (!container) return;
    clearContainerSkeleton(container);

    if (students.length === 0) {
      DOMUtils.setHTML(container, '<div class="text-center py-4 text-gray-500"><i class="fas fa-trophy text-lg mb-2"></i><p class="text-xs">Belum ada data</p></div>');
      return;
    }

    DOMUtils.setHTML(container, students.slice(0, 5).map((student, idx) => `
      <div class="flex items-center gap-3 p-2 bg-white/5 rounded-lg">
        <div class="w-8 h-8 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 text-white flex items-center justify-center text-sm font-bold">${idx + 1}</div>
        <div class="flex-1 min-w-0">
          <div class="font-medium text-xs">${student.name}</div>
          <div class="text-xs text-gray-500">${student.kelas}</div>
        </div>
        <div class="text-xs text-purple-400 font-medium">${student.spins || 0} spin</div>
      </div>
    `).join(''));
  }

  renderRecentActivity(activities) {
    const container = DOMUtils.getElement('activity-list');
    if (!container) return;
    clearContainerSkeleton(container);

    if (activities.length === 0) {
      DOMUtils.setHTML(container, '<div class="text-center py-4 text-gray-500"><i class="fas fa-history text-lg mb-2"></i><p class="text-xs">Belum ada aktivitas</p></div>');
      return;
    }

    DOMUtils.setHTML(container, activities.slice(0, 10).map(activity => `
      <div class="flex items-center gap-3 p-3 bg-white/5 rounded-lg">
        <div class="w-8 h-8 rounded-full ${this.roleUtils.getRoleColor(activity.role)} flex items-center justify-center">
          <i class="fas fa-user text-xs"></i>
        </div>
        <div class="flex-1">
          <div class="font-medium text-xs">${activity.name || activity.email}</div>
          <div class="text-xs text-gray-500">${activity.action}</div>
        </div>
        <div class="text-xs text-gray-500">${this.formatTimeAgo(new Date(activity.timestamp))}</div>
      </div>
    `).join(''));
  }

  formatTimeAgo(date) {
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    if (diffMins < 1) return 'Baru saja';
    return `${diffMins}m lalu`;
  }
}

// Factory
export function createOrchestrator(dashboard, authApi, schoolId) {
  return new AdminSchoolOrchestrator(dashboard, authApi, schoolId);
}
