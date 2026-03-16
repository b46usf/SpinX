/**
 * Admin School Dashboard Module
 * Mobile-first dashboard with bottom navigation for admin-sekolah role
 * Clean, DRY, best practice, modular
 * Filters data by schoolId from authenticated user
 */

import { authGuard } from '../core/AuthGuard.js';
import { themeManager } from '../core/ThemeManager.js';
import { authApi } from '../auth/AuthApi.js';
import { toastConfig } from '../components/utils/Toast.js';

class AdminSchoolDashboard {
  constructor() {
    this.currentSection = 'dashboard';
    this.currentUser = null;
    this.schoolId = null;
    this.currentImportRole = 'siswa';
    this.data = {
      stats: {},
      users: { siswa: [], guru: [], mitra: [] },
      rewards: { wheel: [], vouchers: [], history: [] },
      schoolInfo: {}
    };
    this.init();
  }

  /**
   * Initialize dashboard
   */
  async init() {
    // Auth protection - admin-sekolah role only
    const authResult = authGuard.init('admin-sekolah', {
      avatarId: 'user-avatar',
      welcomeId: 'welcome-name'
    });
    if (!authResult) return;

    this.currentUser = authGuard.getUser();
    
    // Get schoolId from user data (assuming stored in user profile)
    this.schoolId = this.currentUser.schoolId || this.currentUser.sekolah;
    if (!this.schoolId) {
      Toast.error('School ID not found', 'Please contact system admin');
      return;
    }

    // Initialize theme
    themeManager.init();

    // Setup UI
    this.setupProfile();
    this.setupNavigation();
    this.setupEventListeners();
    this.setCurrentDate();
    document.getElementById('school-name').textContent = this.currentUser.schoolName || 'Sekolah';

    // Load initial data
    await this.loadDashboardData();
    await this.loadAccountData(); // Load school info immediately
  }

  /**
   * Setup profile avatar/name
   */
  setupProfile() {
    if (!this.currentUser) return;

    // Header avatar
    const avatar = document.getElementById('user-avatar');
    if (avatar) {
      avatar.src = this.currentUser.picture || this.currentUser.foto || 
        `https://ui-avatars.com/api/?name=${encodeURIComponent(this.currentUser.name || 'A')}&background=random`;
    }

    // Profile section
    const profileAvatar = document.getElementById('profile-avatar');
    if (profileAvatar) profileAvatar.src = avatar.src;

    const profileName = document.getElementById('profile-name');
    if (profileName) profileName.textContent = this.currentUser.name || '-';

    const profileEmail = document.getElementById('profile-email');
    if (profileEmail) profileEmail.textContent = this.currentUser.email || '-';
  }

  /**
   * Setup bottom navigation
   */
  setupNavigation() {
    document.querySelectorAll('.bottom-nav-item').forEach(item => {
      item.addEventListener('click', () => {
        this.switchSection(item.dataset.section);
      });
    });
  }

  /**
   * Switch section visibility
   * @param {string} section
   */
  switchSection(section) {
    this.currentSection = section;

    // Update nav active state
    document.querySelectorAll('.bottom-nav-item').forEach(item => {
      item.classList.toggle('active', item.dataset.section === section);
      item.classList.toggle('text-indigo-400', item.dataset.section === section);
      item.classList.toggle('text-gray-400', item.dataset.section !== section);
    });

    // Update section visibility
    document.querySelectorAll('.section-content').forEach(sec => {
      sec.classList.toggle('hidden', sec.id !== `section-${section}`); 
    });

    // Load section data
    this.loadSectionData(section);
  }

  /**
   * Setup event listeners
   */
  setupEventListeners() {
    // Logout
    const logoutBtn = document.getElementById('logout-btn');
    if (logoutBtn) {
      logoutBtn.addEventListener('click', () => this.handleLogout());
    }

    // User tabs
    document.querySelectorAll('.user-tab-btn').forEach(btn => {
      btn.addEventListener('click', () => this.switchUserTab(btn.dataset.tab));
    });

    // Reward tabs
    document.querySelectorAll('.reward-tab-btn').forEach(buttonEl => {
      buttonEl.addEventListener('click', () => this.switchRewardTab(buttonEl.dataset.tab));
    });

    // Search
    const userSearch = document.getElementById('user-search');
    if (userSearch) userSearch.addEventListener('input', (e) => this.filterUsers(e.target.value));

    // Menu items
    document.querySelectorAll('.menu-item').forEach(item => {
      item.addEventListener('click', () => this.handleMenuAction(item.dataset.action));
    });

    // Action buttons (add user, etc.)
    document.getElementById('add-user-btn')?.addEventListener('click', () => Toast.info('Add User', 'Feature coming soon'));
    
    // Import XLS button (dynamic per tab)
    const importBtn = document.getElementById('import-user-btn');
    if (importBtn) {
      importBtn.dataset.role = 'siswa'; // default
      importBtn.addEventListener('click', (e) => {
        console.log('🚀 Import XLS button clicked!', importBtn.dataset.role);
        try {
          window.dashboard.handleImportUser(importBtn.dataset.role);
        } catch (err) {
          console.error('Import button error:', err);
        }
      });
    }
    
    // Import modal events
    document.getElementById('close-import-modal')?.addEventListener('click', () => window.dashboard.closeImportModal());
    document.getElementById('cancel-import-btn')?.addEventListener('click', () => window.dashboard.closeImportModal());
    document.getElementById('download-template-btn')?.addEventListener('click', () => window.dashboard.downloadTemplate());
    document.getElementById('import-file-input')?.addEventListener('change', (e) => window.dashboard.handleFilePreview(e.target.files[0]));
    document.getElementById('confirm-import-btn')?.addEventListener('click', () => window.dashboard.confirmImport());
    
    document.getElementById('add-slice-btn')?.addEventListener('click', () => Toast.info('Add Slice', 'Feature coming soon'));
    document.getElementById('add-voucher-btn')?.addEventListener('click', () => Toast.info('Add Voucher', 'Feature coming soon'));
  }

  /**
   * Set current date
   */
  setCurrentDate() {
    const dateEl = document.getElementById('current-date');
    if (dateEl) {
      dateEl.textContent = new Date().toLocaleDateString('id-ID', {
        weekday: 'long', day: 'numeric', month: 'long', year: 'numeric'
      });
    }
  }

  /**
   * Switch user tabs
   * @param {string} tab
   */
  switchUserTab(tab) {
    document.querySelectorAll('.user-tab-btn').forEach(buttonEl => {
      buttonEl.classList.toggle('active', buttonEl.dataset.tab === tab);
      buttonEl.classList.toggle('bg-purple-500/20', buttonEl.dataset.tab === tab);
      buttonEl.classList.toggle('text-purple-400', buttonEl.dataset.tab === tab);
      buttonEl.classList.toggle('bg-white/5', buttonEl.dataset.tab !== tab);
      buttonEl.classList.toggle('text-gray-400', buttonEl.dataset.tab !== tab);
    });

    document.querySelectorAll('.user-list-content').forEach(list => {
      list.classList.toggle('hidden', list.id !== `user-list-${tab}`);
    });
  }

  /**
   * Switch reward tabs
   * @param {string} tab
   */
  switchRewardTab(tab) {
    document.querySelectorAll('.reward-tab-btn').forEach(buttonEl => {
      buttonEl.classList.toggle('active', buttonEl.dataset.tab === tab);
      buttonEl.classList.toggle('bg-purple-500/20', buttonEl.dataset.tab === tab);
      buttonEl.classList.toggle('text-purple-400', buttonEl.dataset.tab === tab);
      buttonEl.classList.toggle('bg-white/5', buttonEl.dataset.tab !== tab);
      buttonEl.classList.toggle('text-gray-400', buttonEl.dataset.tab !== tab);
    });

    document.querySelectorAll('.reward-content').forEach(content => {
      content.classList.toggle('hidden', content.id !== `reward-${tab}`);
    });
  }

  /**
   * Filter users by search
   * @param {string} query
   */
  filterUsers(query) {
    const currentTab = document.querySelector('.user-tab-btn.active').dataset.tab;
    const users = this.data.users[currentTab];
    const filtered = users.filter(user => 
      user.name?.toLowerCase().includes(query.toLowerCase()) ||
      user.email?.toLowerCase().includes(query.toLowerCase())
    );
    this.renderUserList(currentTab, filtered);
  }

  /**
   * Show/hide import modal
   */
  showImportModal(role = 'siswa') {
    this.currentImportRole = role;
    const modal = document.getElementById('import-modal');
    if (!modal) {
      console.error('❌ Import modal not found!');
      return;
    }
    modal.classList.remove('hidden');
    modal.style.display = 'flex';
    document.getElementById('import-title').textContent = `Import ${role === 'siswa' ? 'Siswa' : role.toUpperCase()} XLS`;
    document.getElementById('import-file-input').value = '';
    document.getElementById('file-preview').classList.add('hidden');
    document.getElementById('confirm-import-btn').disabled = true;
  }

  /**
   * Close import modal
   */
  closeImportModal() {
    const modal = document.getElementById('import-modal');
    if (modal) {
      modal.classList.add('hidden');
      modal.style.display = 'none';
    }
  }

  /**
   * Download Template - PDF Format with single row
   */
  downloadTemplate() {
    if (!window.jspdf || !window.jspdf.jsPDF.prototype.autoTable) {
      Toast.error('PDF Plugin Missing', 'Refresh page');
      return;
    }

    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();

    doc.setFontSize(16);
    doc.text('SPINX IMPORT TEMPLATE', 105, 25, { align: 'center' });

    doc.setFontSize(11);
    doc.text('TSV Format (Tab Separated)', 20, 42);
    doc.text('Example:', 20, 52);

    const headers = [['nis', 'nama', 'jenis_kelamin', 'kelas', 'tahun_ajaran', 'asal_sekolah']];
    const schoolId = this.schoolId || 'SCHOOL_ID';
    const exampleRow = ['13925', 'AGHASA ZEYNA PUTRI MUGIONO', 'P', 'x-1', '2025/2026', schoolId];

    doc.autoTable({
      startY: 60,
      head: headers,
      body: [exampleRow],
      styles: { fontSize: 8, cellPadding: 3, halign: 'left', valign: 'middle' },
      headStyles: { fillColor: [54, 162, 235], fontSize: 9, fontStyle: 'bold' },
      columnStyles: { 1: { cellWidth: 50 } },
      margin: { left: 15, right: 15 },
      tableWidth: 'auto'
    });

    const finalY = doc.lastAutoTable.finalY + 10;
    doc.setFontSize(9);
    doc.text('Notes:', 20, finalY);
    doc.setFontSize(8);
    doc.text('• Use this exact table format in TSV', 25, finalY + 8);
    doc.text('• asal_sekolah auto-filled', 25, finalY + 16);

    const filename = `siswa_template_${new Date().toISOString().slice(0,10)}.pdf`;
    doc.save(filename);

    Toast.success('PDF Template Complete', `Ready with schoolId: ${schoolId}`);
  }

  /**
   * Handle file preview
   * @param {File} file
   */
  async handleFilePreview(file) {
    if (!file || file.size > 5 * 1024 * 1024) {
      Toast.warning('File Invalid', 'Max 5MB');
      return;
    }

    try {
      const text = await file.text();
      const rows = text.split('\\n').slice(1).slice(0, 5); // First 5 data rows
      const previewHtml = rows.map(row => {
        const cols = row.split('\\t').slice(0, 6);
        return `<div class="grid grid-cols-6 gap-1 p-1 bg-white/10 rounded mb-1">
          ${cols.map(col => `<div class="text-xs truncate">${col || ''}</div>`).join('')}
        </div>`;
      }).join('');
      
      document.getElementById('preview-table').innerHTML = previewHtml;
      document.getElementById('file-preview').classList.remove('hidden');
      document.getElementById('confirm-import-btn').disabled = false;
      document.getElementById('import-info').classList.remove('hidden');
    } catch (error) {
      Toast.error('Gagal Baca File', 'Format tidak didukung');
    }
  }

  /**
   * Handle import user confirmation
   */
  async confirmImport() {
    const fileInput = document.getElementById('import-file-input');
    const file = fileInput.files[0];
    if (!file) {
      Toast.warning('Pilih File', 'Silakan pilih file XLS');
      return;
    }

    Toast.loading('Mengimpor data...');
    try {
      const text = await file.text();
      const rows = text.split('\\n').slice(1).map(row => {
        const cols = row.split('\\t');
        return {
          nis: cols[0]?.trim(),
          nama: cols[1]?.trim(),
          jenis_kelamin: cols[2]?.trim(),
          kelas: cols[3]?.trim(),
          tahun_ajaran: cols[4]?.trim(),
          asal_sekolah: cols[5]?.trim()
        };
      }).filter(s => s.nis); // Filter valid rows

      if (rows.length === 0) {
        Toast.warning('File Kosong', 'Tidak ada data valid');
        return;
      }

      const result = await authApi.call('importstudentsmaster', { 
        schoolId: this.schoolId, 
        students: rows 
      });

      if (result.success) {
        Toast.success('Import Berhasil', `${rows.length} siswa diimpor`);
        this.closeImportModal();
        await this.loadUsers();
        await this.loadDashboardData();
      } else {
        Toast.error('Import Gagal', result.error || 'Server error');
      }
    } catch (error) {
      console.error('Import error:', error);
      Toast.error('Gagal Proses File', 'Cek format file');
    }
  }

  /**
   * Handle import user (entry point)
   * @param {string} role
   */
  handleImportUser(role) {
    this.showImportModal(role);
  }

  /**
   * Handle menu actions
   * @param {string} action
   */
  handleMenuAction(action) {
    switch (action) {
      case 'logo':
        Toast.info('Logo Sekolah', 'Upload logo sekolah');
        break;
      case 'settings':
        Toast.info('Pengaturan', 'Konfigurasi sekolah');
        break;
    }
  }

  /**
   * Handle logout
   */
  handleLogout() {
    Toast.fire({
      title: 'Logout?',
      text: 'Apakah Anda yakin?',
      icon: 'warning',
      showCancelButton: true
    }).then(result => {
      if (result.isConfirmed) authGuard.logout();
    });
  }

  /**
   * Load section-specific data
   * @param {string} section
   */
  async loadSectionData(section) {
    switch (section) {
      case 'users':
        if (this.data.users.siswa.length === 0) await this.loadUsers();
        break;
      case 'reward':
        if (this.data.rewards.wheel.length === 0) await this.loadRewards();
        break;
    }
  }

  /**
   * Load dashboard stats
   */
async loadDashboardData() {
    try {
      const payload = { schoolId: this.schoolId, action: 'getschoolstats' };
      const result = await authApi.call('getschoolstats', payload, false);

      if (result.success) {
        this.data.stats = result.data;
        this.updateDashboardStats();
        this.renderTopStudents(result.topStudents || []);
        this.renderRecentActivity(result.activities || []);
        this.updateUserStats(result.userStats || {});
      } else {
        Toast.error('Failed to load stats', result.message || 'Unknown error');
      }
    } catch (error) {
      console.error('Load stats error:', error);
      Toast.error('Connection error', 'Please check your connection');
    }
  }

  /**
   * Update dashboard stats UI
   */
  updateDashboardStats() {
    const stats = this.data.stats;
    document.getElementById('stat-siswa').textContent = stats.siswa || 0;
    document.getElementById('stat-spin').textContent = stats.spinsToday || 0;
    document.getElementById('stat-voucher').textContent = stats.vouchers || 0;
  }

  /**
   * Update users stats (users section)
   */
  updateUserStats(stats) {
    document.getElementById('stat-siswa-aktif').textContent = stats.siswaAktif || 0;
    document.getElementById('stat-guru-aktif').textContent = stats.guruAktif || 0;
    document.getElementById('stat-mitra-aktif').textContent = stats.mitraAktif || 0;
  }

  /**
   * Render top students list
   * @param {Array} students
   */
  renderTopStudents(students) {
    const container = document.getElementById('top-siswa-list');
    if (!container) return;

    if (students.length === 0) {
      container.innerHTML = '<div class="text-center py-4 text-gray-500"><i class="fas fa-trophy text-lg mb-2"></i><p class="text-xs">Belum ada data</p></div>';
      return;
    }

    container.innerHTML = students.slice(0, 5).map((student, idx) => `
      <div class="flex items-center gap-3 p-2 bg-white/5 rounded-lg">
        <div class="w-8 h-8 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 text-white flex items-center justify-center text-sm font-bold">${idx + 1}</div>
        <div class="flex-1 min-w-0">
          <div class="font-medium text-xs">${student.name}</div>
          <div class="text-xs text-gray-500">${student.kelas}</div>
        </div>
        <div class="text-xs text-purple-400 font-medium">${student.spins || 0} spin</div>
      </div>
    `).join('');
  }

  /**
   * Render recent activity
   * @param {Array} activities
   */
  renderRecentActivity(activities) {
    const container = document.getElementById('activity-list');
    if (!container) return;

    if (activities.length === 0) {
      container.innerHTML = '<div class="text-center py-4 text-gray-500"><i class="fas fa-history text-lg mb-2"></i><p class="text-xs">Belum ada aktivitas</p></div>';
      return;
    }

    container.innerHTML = activities.slice(0, 10).map(activity => `
      <div class="flex items-center gap-3 p-3 bg-white/5 rounded-lg">
        <div class="w-8 h-8 rounded-full ${this.getRoleColor(activity.role)} flex items-center justify-center">
          <i class="fas fa-user text-xs"></i>
        </div>
        <div class="flex-1">
          <div class="font-medium text-xs">${activity.name || activity.email}</div>
          <div class="text-xs text-gray-500">${activity.action}</div>
        </div>
        <div class="text-xs text-gray-500">${this.formatTimeAgo(new Date(activity.timestamp))}</div>
      </div>
    `).join('');
  }

  /**
   * Load users for school (siswa/guru/mitra)
   */
async loadUsers() {
    try {
      const result = await authApi.call('getschoolusers', { schoolId: this.schoolId, role: '' }, false);

      if (result.success) {
        // Group by role
        const grouped = { siswa: [], guru: [], mitra: [] };
        result.users.forEach(user => {
          if (grouped[user.role]) grouped[user.role].push(user);
        });
        this.data.users = grouped;

        // Render initial tab (siswa)
        this.renderUserList('siswa', grouped.siswa);
        this.switchUserTab('siswa');
      }
    } catch (error) {
      console.error('Load users error:', error);
    }
  }

  /**
   * Render user list for tab
   * @param {string} role
   * @param {Array} users
   */
  renderUserList(role, users) {
    const containerId = `${role}-list`;
    const container = document.getElementById(containerId);
    if (!container) return;

    if (users.length === 0) {
      container.innerHTML = '<div class="text-center py-6 text-gray-500"><i class="fas fa-users text-xl mb-2"></i><p class="text-sm">Belum ada data</p></div>';
      return;
    }

    container.innerHTML = users.map(user => `
      <div class="glass-card p-3 flex items-center gap-3 hover:bg-white/10">
        <img src="${user.foto || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.nama)}`}" class="w-10 h-10 rounded-full">
        <div class="flex-1 min-w-0">
          <div class="font-medium text-sm">${user.nama}</div>
          <div class="text-xs text-gray-500">${user.email || user.no_wa}</div>
        </div>
        <span class="badge badge-primary text-xs">${user.status === 'active' ? 'Aktif' : 'Nonaktif'}</span>
      </div>
    `).join('');
  }

  /**
   * Load rewards data (placeholder for now)
   */
  async loadRewards() {
    document.getElementById('wheel-slices').innerHTML = '<div class="text-center py-4 text-gray-500"><i class="fas fa-cog fa-spin text-lg mb-2"></i><p class="text-xs">Wheel config loading...</p></div>';
    document.getElementById('voucher-list').innerHTML = '<div class="text-center py-4 text-gray-500"><i class="fas fa-ticket-alt text-lg mb-2"></i><p class="text-xs">Vouchers loading...</p></div>';
    document.getElementById('voucher-history').innerHTML = '<div class="text-center py-4 text-gray-500"><i class="fas fa-history text-lg mb-2"></i><p class="text-xs">History loading...</p></div>';
  }

  /**
   * Load account/school info
   */
async loadAccountData() {
    try {
      const result = await authApi.call('checksubscription', { schoolId: this.schoolId }, false);

      if (result.success && result.school) {
        this.data.schoolInfo = result.school;
        this.updateSchoolInfo();
      }
    } catch (error) {
      console.error('Load school info error:', error);
    }
  }

  /**
   * Update school info UI
   */
  updateSchoolInfo() {
    const info = this.data.schoolInfo;
    if (!info) return;

    document.getElementById('sekolah-nama').textContent = info.schoolName;
    document.getElementById('sekolah-plan').textContent = info.plan?.toUpperCase();
    document.getElementById('sekolah-siswa').textContent = info.currentStudents || 0;
    document.getElementById('sekolah-guru').textContent = 'N/A'; // From separate query
    document.getElementById('subscription-plan').textContent = info.plan?.toUpperCase();
    document.getElementById('subscription-status').textContent = info.status === 'active' ? 'Aktif' : 'Expired';
    document.getElementById('subscription-expired').textContent = info.expiresAt ? new Date(info.expiresAt).toLocaleDateString('id-ID') : 'Forever';
  }

  /**
   * Get role color class
   * @param {string} role
   */
  getRoleColor(role) {
    const colors = {
      'siswa': 'bg-blue-500/20 text-blue-400',
      'guru': 'bg-green-500/20 text-green-400',
      'mitra': 'bg-purple-500/20 text-purple-400'
    };
    return colors[role] || 'bg-gray-500/20 text-gray-400';
  }

  /**
   * Format time ago
   * @param {Date} date
   */
  formatTimeAgo(date) {
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    
    if (diffMins < 1) return 'Baru';
    return `${diffMins}m ago`;
  }
}

// Export and auto-init
export { AdminSchoolDashboard };

document.addEventListener('DOMContentLoaded', () => {
  window.dashboard = new AdminSchoolDashboard();
  
// Expose dashboard instance methods globally
  ['handleImportUser', 'closeImportModal', 'downloadTemplate', 'handleFilePreview', 'confirmImport'].forEach(method => {
    window.dashboard[method] = window.dashboard[method].bind(window.dashboard);
  });

  window.startGame = () => Toast.info('Game', 'Student game interface');
  window.spinWheel = () => Toast.info('Wheel', 'Configure wheel first');
});

// Make Toast available globally if needed
window.Toast = Toast;
