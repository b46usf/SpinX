
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
              const schoolName = subscriptionData.schoolName.replace(/\s+/g, '%20');
              window.open(
                `https://wa.me/85161609575?text=Hi%20Admin%20${schoolName}%2C%20subscription%20expired`,
                '_blank'
              );
            },
            onClose: () => {}
          });
        }
      } else {
        Modal.subscription(subscriptionData, {
          onContact: () => {
            const schoolName = subscriptionData.schoolName.replace(/\s+/g, '%20');
            window.open(
              `https://wa.me/85161609575?text=Hi%20Admin%20${schoolName}%2C%20subscription%20expired`,
              '_blank'
            );
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
          const schoolName = (school.schoolName || school.name || 'Sekolah').replace(/\s+/g, '%20');
          window.open(
            `https://wa.me/85161609575?text=Halo%20Admin%2C%20saya%20ingin%20menanyakan%20status%20sekolah%20${schoolName}.`,
            '_blank'
          );
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


