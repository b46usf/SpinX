
/**
 * Login Component
 * Handles login UI rendering and events
 * Now uses reusable Modal component for subscription expiry modal
 */

import { LoginTemplates } from './templates/LoginTemplates.js';
import Modal from './utils/Modal.js';

export class LoginComponent {
  constructor(options = {}) {
    this.googleAuth = options.googleAuth || window.GoogleAuth;
  }

  normalizeWhatsAppNumber(rawNumber = '') {
    const digits = String(rawNumber || '').replace(/\D/g, '');
    if (!digits) return '';
    if (digits.startsWith('62')) return digits;
    if (digits.startsWith('0')) return `62${digits.slice(1)}`;
    if (digits.startsWith('8')) return `62${digits}`;
    return digits;
  }

  getSchoolStatusLabel(status = '') {
    const normalized = String(status || '').toLowerCase();
    const labels = {
      pending_school: 'Menunggu Approval Admin Sistem',
      pending_renewal: 'Perpanjangan Sedang Diproses',
      renewal_pending: 'Perpanjangan Sedang Diproses',
      inactive: 'Status Sekolah Belum Aktif',
      expired: 'Subscription Expired'
    };

    return labels[normalized] || 'Status Sekolah';
  }

  formatSubmissionDate(value) {
    if (!value) return '-';

    const parsed = new Date(value);
    if (Number.isNaN(parsed.getTime())) {
      return '-';
    }

    return parsed.toLocaleDateString('id-ID', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  }

  openAdminWhatsApp(result = {}, message = '') {
    const adminContact = result.adminContact || {};
    const adminWa = this.normalizeWhatsAppNumber(adminContact.noWa || adminContact.no_wa || '');

    if (!adminWa) {
      this.showError('Nomor WhatsApp admin sistem belum tersedia.');
      return;
    }

    window.open(
      `https://wa.me/${adminWa}?text=${encodeURIComponent(message || 'Halo Admin Sistem.')}`,
      '_blank'
    );
  }

  buildSchoolStatusMessage(result = {}, school = {}) {
    const schoolStatus = result.schoolStatus || school.rawStatus || school.status || result.reason || 'inactive';
    const proofLink = school.buktiTFLink || school.buktiTransfer || '-';
    const lines = [
      `Halo ${result.adminContact?.name || 'Admin Sistem'},`,
      '',
      'Saya ingin menanyakan status sekolah berikut:',
      `Status: ${this.getSchoolStatusLabel(schoolStatus)}`,
      `Nama Sekolah: ${school.schoolName || school.name || 'Sekolah'}`,
      `Plan: ${(school.plan || 'starter').toString().toUpperCase()}`,
      `Email Sekolah: ${school.email || '-'}`,
      `No. WhatsApp Sekolah: ${school.noWa || school.no_wa || '-'}`,
      `Tanggal Pengajuan: ${this.formatSubmissionDate(school.updatedAt || school.createdAt)}`,
      `Bukti Transfer: ${proofLink}`,
      '',
      `Catatan: ${result.message || 'Mohon bantu update status sekolah ini.'}`
    ];

    return lines.join('\n');
  }

  buildSubscriptionMessage(result = {}, subscriptionData = {}) {
    const lines = [
      `Halo ${result.adminContact?.name || 'Admin Sistem'},`,
      '',
      'Saya ingin menanyakan status subscription sekolah berikut:',
      `Nama Sekolah: ${subscriptionData.schoolName || 'Sekolah Anda'}`,
      `Plan: ${(subscriptionData.currentPlan || subscriptionData.plan || 'Starter').toString().toUpperCase()}`,
      `Tanggal Expired: ${this.formatSubmissionDate(subscriptionData.expiresAt)}`,
      `Sisa Hari: ${subscriptionData.daysRemaining || 0}`,
      '',
      'Mohon bantu informasikan langkah selanjutnya.'
    ];

    return lines.join('\n');
  }

  render() {
    return LoginTemplates.loginSection();
  }

  initEvents() {
    // Re-render Google button after component is rendered
    if (window.google?.accounts?.id) {
      window.google.accounts.id.renderButton(
        document.getElementById("googleLoginBtn"),
        { theme: 'outline', size: 'large', width: '300' }
      );
    }
    
    const loginBtn = document.getElementById("googleLoginBtn");
    if (loginBtn) {
      loginBtn.addEventListener("click", () => {
        if (window.google?.accounts?.id) {
          window.google.accounts.id.prompt();
        }
      });
    }
  }

  /**
   * Show subscription expiry modal using reusable Modal component
   * @param {Object} result - Subscription result data from API
   * @param {Object} result.school - School information { schoolName, plan }
   * @param {Object} result.details - Subscription details { expiresAt, daysRemaining }
   */
  showSubscriptionModal(result) {
    // Import modal functions dynamically to avoid circular dependencies
    import('./utils/Modal.js').then((module) => {
      const Modal = module.default || module.Modal || module;
      const userRole = result.role || result.user?.role || '';
      const subscriptionData = {
        schoolName: result.school?.schoolName || 'Sekolah Anda',
        currentPlan: result.school?.plan || 'Starter',
        expiresAt: result.details?.expiresAt || new Date(),
        daysRemaining: result.details?.daysRemaining || 0
      };

      if (userRole === 'admin-sekolah') {
        if (window._pricingCache && window._pricingCache.plans) {
          Modal.subscriptionRenewal(subscriptionData, window._pricingCache.plans, {
            onSelectPlan: async (selectedPlan) => {
              await this.openRenewalRegisterModal(selectedPlan, result.school);
            },
            onClose: () => {}
          });
        } else {
          Modal.subscription(subscriptionData, {
            onContact: () => {
              this.openAdminWhatsApp(result, this.buildSubscriptionMessage(result, subscriptionData));
            },
            onClose: () => {}
          });
        }
      } else {
        Modal.subscription(subscriptionData, {
          onContact: () => {
            this.openAdminWhatsApp(result, this.buildSubscriptionMessage(result, subscriptionData));
          },
          onClose: () => {}
        });
      }
    }).catch(error => {
      console.error('Failed to load modal:', error);
      // Fallback error handling
      this.showError('Terjadi kesalahan saat memuat modal');
    });
  }

  /**
   * Show school status modal for pending approval / pending renewal / inactive school.
   * @param {Object} result - Status result data from API
   */
  showSchoolStatusModal(result) {
    import('./utils/Modal.js').then((module) => {
      const Modal = module.default || module.Modal || module;
      const school = result.school || {};

      Modal.schoolStatus({
        schoolStatus: result.schoolStatus || school.rawStatus || school.status || result.reason || 'inactive',
        school,
        message: result.message || ''
      }, {
        onContact: () => {
          this.openAdminWhatsApp(result, this.buildSchoolStatusMessage(result, school));
        },
        onClose: () => {}
      });
    }).catch(error => {
      console.error('Failed to load school status modal:', error);
      this.showError(result.message || 'Status sekolah belum aktif.');
    });
  }

  /**
   * Open renewal registration modal with selected plan
   * @param {Object} selectedPlan - The selected plan for renewal
   * @param {Object} school - Existing school data
   */
  async openRenewalRegisterModal(selectedPlan, school = {}) {
    try {
      const module = await import('./modals/RegisterModal.js');
      const modal = module.default || module;

      await modal.showRenewalRegisterModal({
        currentPlan: school.plan || 'Starter',
        schoolData: {
          schoolName: school.schoolName || school.name || '',
          email: school.email || '',
          noWa: school.noWa || school.no_wa || ''
        }
      }, {
        selectedPlan: selectedPlan,
        onSuccess: () => {
          // Optionally reload or redirect after successful renewal submission
          window.location.reload();
        },
        onError: (error) => {
          console.error('Renewal modal error:', error);
        }
      });
    } catch (error) {
      console.error('Failed to open renewal register modal:', error);
      this.showError('Terjadi kesalahan saat membuka form perpanjangan');
    }
  }

  /**
   * Hide subscription modal (for backward compatibility)
   * Note: Modal component handles closing automatically, kept for API compatibility
   */
  hideSubscriptionModal() {
    // Modal component handles closing via SweetAlert2
    const swal = window.Swal || window.SweetAlert2;
    if (swal) {
      swal.close();
    }
  }

  showError(message) {
    const errorEl = document.getElementById('auth-error');
    if (errorEl) { errorEl.textContent = message; errorEl.classList.remove('hidden'); }
  }

  hideError() {
    const errorEl = document.getElementById('auth-error');
    if (errorEl) { errorEl.textContent = ''; errorEl.classList.add('hidden'); }
  }

  show() {
    const section = document.getElementById('login-section');
    if (section) section.classList.remove('hidden');
    this.hideError();
  }

  hide() {
    const section = document.getElementById('login-section');
    if (section) section.classList.add('hidden');
  }
}

window.LoginComponent = LoginComponent;


