/**
 * AdminSchoolDashboard
 * Thin UI shell for admin-school dashboard.
 * All business/data logic is delegated to the orchestrator + services.
 */
import { authGuard } from '../core/AuthGuard.js';
import { themeManager } from '../core/ThemeManager.js';
import { authApi } from '../auth/AuthApi.js';
import {
  applyTextSkeleton,
  renderListSkeleton,
  renderInfoSkeleton
} from '../components/utils/DashboardSkeleton.js';
import { createOrchestrator } from './AdminSchoolOrchestrator.js';
import { showImportModal } from '../components/modals/ImportModal.js';

const Toast = window.Toast;

const USER_ROLES = ['siswa', 'guru', 'mitra'];
const LIST_SKELETON_IDS = ['top-siswa-list', 'activity-list', 'siswa-list', 'guru-list', 'mitra-list'];
const TEXT_SKELETON_TARGETS = [
  { target: 'stat-siswa', width: '52px' },
  { target: 'stat-spin', width: '64px' },
  { target: 'stat-voucher', width: '58px' },
  { target: 'stat-siswa-aktif', width: '56px' },
  { target: 'stat-guru-aktif', width: '56px' },
  { target: 'stat-mitra-aktif', width: '56px' },
  { target: 'sekolah-nama', width: '52%' },
  { target: 'sekolah-plan', width: '70px' },
  { target: 'sekolah-users', width: '44px' },
  { target: 'sekolah-guru', width: '44px' },
  { target: 'subscription-plan', width: '70px' },
  { target: 'subscription-status', width: '78px' },
  { target: 'subscription-expired', width: '110px' }
];

function getElement(id) {
  return document.getElementById(id);
}

function setText(id, value) {
  const element = getElement(id);
  if (element) element.textContent = value;
}

function setHidden(id, hidden) {
  const element = getElement(id);
  if (element) element.classList.toggle('hidden', hidden);
}

function bindClick(id, handler) {
  getElement(id)?.addEventListener('click', handler);
}

export class AdminSchoolDashboard {
  constructor() {
    this.schoolId = null;
    this.currentSection = 'dashboard';
    this.currentImportRole = 'siswa';
    this.orchestrator = null;
    this.loadedUserTabs = Object.fromEntries(USER_ROLES.map(role => [role, false]));
  }

  async init() {
    const authResult = authGuard.init('admin-sekolah', {
      avatarId: 'user-avatar',
      welcomeId: 'welcome-name'
    });
    if (!authResult) return;


    const currentUser = authGuard.getUser();
    
    // Final subscription check before dashboard load
    try {
      await window.SubscriptionGuard?.verify?.(currentUser);
    } catch (error) {
      // Guard handles toast/redirect to login
      console.warn('Dashboard subscription check failed:', error.message);
      return;
    }
    

    
    this.schoolId = currentUser.schoolId || currentUser.sekolah;

    if (!this.schoolId) {
      Toast?.error?.('School ID not found');
      return;
    }

    setText('school-name', currentUser.schoolName || 'Sekolah');

    themeManager.init();
    this.setupUI(currentUser);

    this.orchestrator = createOrchestrator(this, authApi, this.schoolId);
    await this.orchestrator.init();
  }

  setupUI(currentUser) {
    this.setupProfile(currentUser);
    this.setupNavigation();
    this.setupEventListeners();
    this.setCurrentDate();
    this.showInitialSkeletons();
  }

  setupProfile(currentUser) {
    const avatarUrl =
      currentUser.picture ||
      currentUser.foto ||
      `https://ui-avatars.com/api/?name=${encodeURIComponent(currentUser.name || 'A')}&background=random`;

    const avatar = getElement('user-avatar');
    if (avatar) avatar.src = avatarUrl;

    const profileAvatar = getElement('profile-avatar');
    if (profileAvatar) profileAvatar.src = avatarUrl;

    setText('profile-name', currentUser.name || '-');
    setText('profile-email', currentUser.email || '-');
  }

  setupNavigation() {
    document.querySelectorAll('.bottom-nav-item').forEach(item => {
      item.addEventListener('click', () => this.switchSection(item.dataset.section));
    });

    document.querySelectorAll('.user-tab-btn').forEach(button => {
      button.addEventListener('click', () => this.switchUserTab(button.dataset.tab));
    });

    document.querySelectorAll('.reward-tab-btn').forEach(button => {
      button.addEventListener('click', () => this.switchRewardTab(button.dataset.tab));
    });
  }

  setupEventListeners() {
    bindClick('logout-btn', () => this.handleLogout());

    getElement('user-search')?.addEventListener('input', event => {
      this.filterUsers(event.target.value);
    });

    bindClick('add-user-btn', () => this.showImportModal('siswa'));
    getElement('import-user-btn')?.addEventListener('click', event => {
      this.showImportModal(event.currentTarget?.dataset?.role || this.getActiveUserTab());
    });

    document.querySelectorAll('.menu-item').forEach(item => {
      item.addEventListener('click', () => this.handleMenuAction(item.dataset.action));
    });
  }

  switchSection(section) {
    this.currentSection = section;

    document.querySelectorAll('.bottom-nav-item').forEach(item => {
      const isActive = item.dataset.section === section;
      item.classList.toggle('active', isActive);
      item.classList.toggle('text-indigo-400', isActive);
      item.classList.toggle('text-gray-400', !isActive);
    });

    document.querySelectorAll('.section-content').forEach(content => {
      content.classList.toggle('hidden', content.id !== `section-${section}`);
    });

    this.orchestrator?.loadSection(section);
  }

  switchUserTab(tab) {
    document.querySelectorAll('.user-tab-btn').forEach(button => {
      const isActive = button.dataset.tab === tab;
      button.classList.toggle('active', isActive);
      button.classList.toggle('bg-purple-500/20', isActive);
      button.classList.toggle('text-purple-400', isActive);
      button.classList.toggle('bg-white/5', !isActive);
      button.classList.toggle('text-gray-400', !isActive);
    });

    document.querySelectorAll('.user-list-content').forEach(list => {
      list.classList.toggle('hidden', list.id !== `user-list-${tab}`);
    });

    const importButton = getElement('import-user-btn');
    if (importButton) importButton.dataset.role = tab;

    if (this.orchestrator && !this.loadedUserTabs[tab]) {
      this.loadedUserTabs[tab] = true;
      this.orchestrator.loadUsers(tab);
    }
  }

  switchRewardTab(tab) {
    document.querySelectorAll('.reward-tab-btn').forEach(button => {
      const isActive = button.dataset.tab === tab;
      button.classList.toggle('active', isActive);
      button.classList.toggle('bg-purple-500/20', isActive);
      button.classList.toggle('text-purple-400', isActive);
      button.classList.toggle('bg-white/5', !isActive);
      button.classList.toggle('text-gray-400', !isActive);
    });

    document.querySelectorAll('.reward-content').forEach(content => {
      content.classList.toggle('hidden', content.id !== `reward-${tab}`);
    });
  }

  setCurrentDate() {
    setText(
      'current-date',
      new Date().toLocaleDateString('id-ID', {
        weekday: 'long',
        day: 'numeric',
        month: 'long',
        year: 'numeric'
      })
    );
  }

  showInitialSkeletons() {
    applyTextSkeleton(TEXT_SKELETON_TARGETS);
    LIST_SKELETON_IDS.forEach(id => renderListSkeleton(id, { items: 4, avatar: 'circle' }));
    renderInfoSkeleton('wheel-slices', { rows: 3 });
    renderListSkeleton('voucher-list', { items: 3, avatar: 'square', trailing: 'pill' });
    renderListSkeleton('voucher-history', { items: 3, avatar: 'circle', trailing: 'none' });
  }

  getActiveUserTab() {
    return document.querySelector('.user-tab-btn.active')?.dataset.tab || 'siswa';
  }

  emit(event) {
    console.log(`[Dashboard] ${event}`);
  }

  async showImportModal(role = 'siswa') {
    this.currentImportRole = role;
    
    await showImportModal(role, {
      onConfirm: (data) => this.handleImportConfirm(data),
      onCancel: () => this.handleImportCancel(),
      onDownload: (role) => this.downloadTemplate(role)
    });
  }

  async handleImportConfirm(data) {
    const { file, role } = data;
    if (!file || !this.orchestrator) return;

    await this.orchestrator.handleImportConfirm(file, role);
    this.loadedUserTabs[role] = false;
  }

  handleImportCancel() {
    // Optional: Handle cancel action if needed
    console.log('Import cancelled');
  }

  async downloadTemplate(role) {
    if (!this.orchestrator || !role) return;
    this.currentImportRole = role;
    await this.orchestrator.handlePDFDownload(role);
  }

  filterUsers(query) {
    if (!this.orchestrator?.filterUsers) return;
    this.orchestrator.filterUsers(this.getActiveUserTab(), query);
  }

  handleLogout() {
    Toast?.fire?.({
      title: 'Logout?',
      icon: 'warning',
      showCancelButton: true
    }).then(({ isConfirmed }) => {
      if (isConfirmed) authGuard.logout();
    });
  }

  handleMenuAction(action) {
    Toast?.info?.(`${action} Settings`, 'Coming soon');
  }
}

document.addEventListener('DOMContentLoaded', () => {
  window.dashboard = new AdminSchoolDashboard();
  window.dashboard.init();
});
