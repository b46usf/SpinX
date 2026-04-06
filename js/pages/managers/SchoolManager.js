/**
 * School Manager Module
 * All school-related logic: loading, filtering, rendering
 * Decoupled from main dashboard for reusability
 */

import { DashboardUtils } from '../../core/DashboardUtils.js';
import { authApi } from '../../auth/AuthApi.js';
import { showConfirm, showError, showSuccess, showLoading, closeLoading } from '../../components/utils/Toast.js';
import { clearContainerSkeleton, renderCardSkeleton, clearTextSkeleton } from '../../components/utils/DashboardSkeleton.js';

class SchoolManager {
  constructor(options = {}) {
    this.listContainerId = options.listContainerId || 'sekolah-list';
    this.statAktifId = options.statAktifId || 'sekolah-aktif';
    this.statNonaktifId = options.statNonaktifId || 'sekolah-nonaktif';
    this.statRevenueId = options.statRevenueId || 'sekolah-revenue';
    this.searchInputId = options.searchInputId || 'sekolah-search';
    this.filterSelectId = options.filterSelectId || 'sekolah-filter';
    
    this.subscriptionStatusMap = options.subscriptionStatusMap || {};
    this.driveFolderUrl = options.driveFolderUrl || '';
    
    this.schools = [];
    this.filters = { query: '', status: '' };
    this.approvingSchoolId = null;
    this.onSchoolAction = options.onSchoolAction || null;
  }

  /**
   * Load all schools
   */
  async loadSchools() {
    const container = document.getElementById(this.listContainerId);
    if (!container) return;
    
    const actifEl = document.getElementById(this.statAktifId);
    const nonaktifEl = document.getElementById(this.statNonaktifId);
    const revenueEl = document.getElementById(this.statRevenueId);
    
    renderCardSkeleton(this.listContainerId, { items: 3, media: 'square', badges: 1, footer: true });
    clearTextSkeleton([this.statAktifId, this.statNonaktifId, this.statRevenueId]);

    try {
      const result = await authApi.call('getAllSchools', {}, false);
      
      if (result.success) {
        this.schools = result.data || [];
        this.applyFilters();
        this.updateStats();
      } else {
        this.renderEmpty();
      }
    } catch (error) {
      console.error('Failed to load schools:', error);
      this.renderEmpty();
    }
  }

  /**
   * Update school statistics
   */
  updateStats() {
    let active = 0;
    let inactive = 0;
    let revenue = 0;
    
    this.schools.forEach(school => {
      const actualStatus = this.determineActualStatus(school);
      revenue += school.revenue || 0;
      
      if (actualStatus === 'active') {
        active++;
      } else {
        inactive++;
      }
    });

    clearTextSkeleton([this.statAktifId, this.statNonaktifId, this.statRevenueId]);
    
    const aktifEl = document.getElementById(this.statAktifId);
    const nonaktifEl = document.getElementById(this.statNonaktifId);
    const revenueEl = document.getElementById(this.statRevenueId);
    
    if (aktifEl) aktifEl.textContent = active;
    if (nonaktifEl) nonaktifEl.textContent = inactive;
    if (revenueEl) revenueEl.textContent = DashboardUtils.formatCurrency(revenue);
  }

  /**
   * Determine actual status considering expiration
   * @private
   */
  determineActualStatus(school) {
    if (!school) return 'unknown';
    
    if (school.status) {
      const status = school.status.toLowerCase();
      
      if (status === 'expired') {
        return 'expired';
      }
      
      if (status === 'active' && school.expiresAt) {
        if (DashboardUtils.isDatePassed(school.expiresAt)) {
          return 'expired';
        }
      }
      
      return status;
    }
    
    return 'pending';
  }

  /**
   * Apply search & status filters
   */
  applyFilters() {
    const query = DashboardUtils.normalizeSearchValue(this.filters.query);
    const status = this.filters.status || '';

    const filtered = this.schools.filter((school) => {
      const name = DashboardUtils.normalizeSearchValue(school.nama || school.name || school.schoolName);
      const email = DashboardUtils.normalizeSearchValue(school.email);
      const phone = DashboardUtils.normalizeSearchValue(school.phone || school.noWa);
      const matchesQuery = !query || name.includes(query) || email.includes(query) || phone.includes(query);

      if (!matchesQuery) return false;

      if (!status) return true;

      const actualStatus = this.determineActualStatus(school);
      return actualStatus === status;
    });

    this.render(filtered);
  }

  /**
   * Render schools list
   * @param {Array} schools - Schools to render
   * @private
   */
  render(schools) {
    const container = document.getElementById(this.listContainerId);
    if (!container) return;
    clearContainerSkeleton(container);

    if (schools.length === 0) {
      this.renderEmpty();
      return;
    }

    container.innerHTML = schools.map((school) => this.renderSchoolCard(school)).join('');
  }

  /**
   * Build single school card HTML
   * @private
   */
  renderSchoolCard(school) {
    const actualStatus = this.determineActualStatus(school);
    const statusMeta = this.subscriptionStatusMap[actualStatus] || this.getDefaultStatusMeta(actualStatus);
    const schoolId = school.id || school.schoolId || '';
    const isApproving = this.approvingSchoolId === schoolId;
    const primaryAction = this.getPrimaryAction(school);
    const showAction = !!primaryAction;
    
    const schoolName = school.nama || school.name || school.schoolName || '-';
    const schoolEmail = school.email || '-';
    const schoolPhone = school.phone || school.noWa || '-';
    const userCount = school.currentUsers || school.users || school.siswa_count || school.siswa || 0;
    const planLabel = this.formatPlanName(school.plan);
    
    const expiresInfo = school.expiresAt && actualStatus === 'expired' 
      ? `<div class="text-xs text-red-400 mt-2"><i class="fas fa-calendar-xmark mr-1"></i>Expired: ${DashboardUtils.formatDate(school.expiresAt, 'date')}</div>`
      : '';

    return `
      <div class="glass-card p-4 hover:bg-white/5 transition-colors" data-id="${schoolId}">
        <div class="flex items-start gap-3">
          <div class="w-12 h-12 rounded-xl ${statusMeta.iconBg} flex items-center justify-center shrink-0">
            <i class="fas ${statusMeta.icon} ${statusMeta.iconColor}"></i>
          </div>
          <div class="flex-1 min-w-0">
            <div class="flex items-start justify-between gap-3">
              <div class="min-w-0">
                <div class="font-medium text-sm truncate">${schoolName}</div>
                <div class="text-xs text-gray-500 truncate">${schoolEmail}</div>
              </div>
              <span class="badge badge-${statusMeta.badge} text-xs whitespace-nowrap">
                ${statusMeta.label}
              </span>
            </div>

            <div class="flex flex-wrap items-center gap-3 mt-3 text-xs text-gray-400">
              <span><i class="fas fa-users mr-1"></i>${userCount} user</span>
              <span><i class="fas fa-tag mr-1"></i>${planLabel}</span>
              <span class="truncate"><i class="fas fa-phone mr-1"></i>${schoolPhone}</span>
            </div>
            
            ${expiresInfo}

            ${showAction ? `
              <div class="mt-3 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 rounded-xl border border-amber-400/20 bg-amber-500/10 px-3 py-3">
                <div class="min-w-0">
                  <div class="text-xs font-semibold text-amber-300">${primaryAction.title}</div>
                  <div class="text-[11px] text-amber-100/70">${primaryAction.description}</div>
                </div>
                <button
                  type="button"
                  data-action="school-status-action"
                  data-school-id="${schoolId}"
                  class="inline-flex items-center justify-center gap-2 rounded-lg bg-emerald-500/20 px-3 py-2 text-xs font-semibold text-emerald-300 transition-colors hover:bg-emerald-500/30 disabled:cursor-not-allowed disabled:opacity-60"
                  ${isApproving ? 'disabled' : ''}
                >
                  <i class="fas ${isApproving ? 'fa-spinner fa-spin' : 'fa-circle-check'}"></i>
                  ${isApproving ? 'Memproses...' : primaryAction.label}
                </button>
              </div>
            ` : ''}
          </div>
        </div>
      </div>
    `;
  }

  /**
   * Get primary action for school
   * @private
   */
  getPrimaryAction(school) {
    if (!school) return null;

    if (this.needsMetadataSync(school)) {
      return {
        type: 'sync',
        label: 'Sinkronkan',
        title: 'Metadata subscription belum lengkap',
        description: 'Kolom expires_at atau approved_by masih kosong. Sinkronkan agar data konsisten.'
      };
    }

    const statusMeta = this.subscriptionStatusMap[school.status];
    return statusMeta?.primaryAction || null;
  }

  /**
   * Check if school needs metadata sync
   * @private
   */
  needsMetadataSync(school) {
    if (!school || school.status !== 'active') {
      return false;
    }
    return !school.expiresAt || !school.approvedBy;
  }

  /**
   * Get default status metadata
   * @private
   */
  getDefaultStatusMeta(status) {
    return {
      label: status || 'Unknown',
      badge: 'warning',
      icon: 'fa-circle-info',
      iconBg: 'bg-slate-500/20',
      iconColor: 'text-slate-300'
    };
  }

  /**
   * Format plan name for display
   * @private
   */
  formatPlanName(plan) {
    if (!plan) return 'Starter';
    const labels = {
      starter: 'Starter',
      pro: 'Pro',
      enterprise: 'Enterprise',
      custom: 'Custom'
    };
    return labels[plan] || plan;
  }

  /**
   * Render empty state
   * @private
   */
  renderEmpty() {
    const container = document.getElementById(this.listContainerId);
    if (!container) return;
    clearContainerSkeleton(container);

    DashboardUtils.renderEmptyState(container, {
      icon: 'fa-school',
      title: 'Belum ada sekolah',
      action: { label: 'Tambah Sekolah Custom' }
    });
  }

  /**
   * Update filter query
   */
  setSearchQuery(query) {
    this.filters.query = query || '';
    this.applyFilters();
  }

  /**
   * Update filter status
   */
  setStatusFilter(status) {
    this.filters.status = status || '';
    this.applyFilters();
  }

  /**
   * Handle school action (approve, sync, activate, etc)
   */
  async handleSchoolAction(schoolId, action) {
    const school = this.schools.find((s) => (s.id || s.schoolId) === schoolId);
    if (!school) return;

    const schoolName = school.nama || school.name || school.schoolName || 'Sekolah';
    const confirmed = await showConfirm(
      action.dialogTitle,
      action.dialogMessage(schoolName, school.plan),
      action.confirmLabel,
      'Batal',
      'info'
    );

    if (!confirmed) return;

    try {
      this.approvingSchoolId = schoolId;
      this.applyFilters();

      const result = await action.execute(schoolId);
      
      if (result.success) {
        showSuccess('Berhasil', action.successMessage);
        if (this.onSchoolAction) {
          await this.onSchoolAction();
        }
      } else {
        showError('Gagal', result.message || action.errorMessage);
      }
    } catch (error) {
      console.error('School action error:', error);
      showError('Gagal', action.errorMessage);
    } finally {
      this.approvingSchoolId = null;
      this.applyFilters();
    }
  }

  /**
   * Setup event listeners for school list
   */
  setupEventListeners(handlers = {}) {
    const searchInput = document.getElementById(this.searchInputId);
    const filterSelect = document.getElementById(this.filterSelectId);
    const listContainer = document.getElementById(this.listContainerId);

    if (searchInput) {
      searchInput.addEventListener('input', (e) => this.setSearchQuery(e.target.value));
    }

    if (filterSelect) {
      filterSelect.addEventListener('change', (e) => this.setStatusFilter(e.target.value));
    }

    if (listContainer) {
      listContainer.addEventListener('click', (event) => {
        const actionBtn = event.target.closest('[data-action="school-status-action"]');
        if (actionBtn) {
          event.preventDefault();
          event.stopPropagation();
          const schoolId = actionBtn.dataset.schoolId;
          if (handlers.onActionClick) {
            handlers.onActionClick(schoolId);
          }
          return;
        }

        const emptyActionBtn = event.target.closest('[data-action="open-add-school-modal"]');
        if (emptyActionBtn) {
          event.preventDefault();
          if (handlers.onAddClick) {
            handlers.onAddClick();
          }
          return;
        }

        const schoolCard = event.target.closest('[data-id]');
        if (schoolCard && handlers.onCardClick) {
          handlers.onCardClick(schoolCard.dataset.id);
        }
      });
    }
  }
}

export { SchoolManager };
