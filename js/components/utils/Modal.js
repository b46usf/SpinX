/**
 * Modal Component - Reusable Modal Dialogs using SweetAlert2
 * Provides a modular, DRY approach to creating modals without hardcoded HTML
 * 
 * Usage:
 * - Modal.subscription() - Show subscription expiry or info modal
 * - Modal.confirm() - Show confirmation dialog
 * - Modal.alert() - Show alert dialog
 * - Modal.custom() - Show fully customized modal
 */

import { fireToast, ensureSwalInstance } from './Toast.js';

/**
 * Configuration defaults for modals
 */
const ModalDefaults = {
  allowOutsideClick: false,
  allowEscapeKey: true,
  scrollbarPadding: false,
  backdrop: 'rgba(0, 0, 0, 0.5)'
};

/**
 * Theme-aware modal styles
 */
const getModalTheme = () => {
  const isDark = document.documentElement.getAttribute('data-theme') === 'dark' || 
                 document.documentElement.classList.contains('dark');
  
  return {
    background: isDark ? '#1f2937' : '#ffffff',
    color: isDark ? '#f3f4f6' : '#1f2937',
    buttonColor: isDark ? '#3b82f6' : '#0066cc',
    borderColor: isDark ? '#374151' : '#e5e7eb'
  };
};

/**
 * Show subscription expiry modal - DRY approach for subscription data
 * @param {Object} subscriptionData - { schoolName, plan, expiresAt, daysRemaining }
 * @param {Object} options - Additional options { onContact, onClose }
 */
export async function showSubscriptionModal(subscriptionData = {}, options = {}) {
  const swal = ensureSwalInstance();
  const theme = getModalTheme();
  
  const {
    schoolName = 'Sekolah Anda',
    plan = 'Starter',
    expiresAt = new Date(),
    daysRemaining = 0
  } = subscriptionData;
  
  const {
    onContact = null,
    onClose = null
  } = options;

  const expiryDate = new Date(expiresAt).toLocaleDateString('id-ID', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  const htmlContent = `
    <div class="modal-subscription-wrapper">
      <div class="modal-section-header">
        <div class="modal-icon-group">
          <div class="modal-icon-primary">
            <i class="fas fa-calendar-xmark"></i>
          </div>
        </div>
        <div class="modal-text-group">
          <h3 class="modal-title">Subscription Expired</h3>
          <p class="modal-subtitle">${schoolName}</p>
        </div>
      </div>

      <div class="modal-section-content">
        <div class="modal-info-box modal-info-plan">
          <div class="modal-info-icon">
            <i class="fas fa-school"></i>
          </div>
          <div class="modal-info-text">
            <span class="modal-info-label">Plan</span>
            <span class="modal-info-value">${plan.toUpperCase()}</span>
          </div>
        </div>
        
        <div class="modal-info-box modal-info-expires">
          <div class="modal-info-icon">
            <i class="fas fa-calendar-times"></i>
          </div>
          <div class="modal-info-text">
            <span class="modal-info-label">Expires</span>
            <span class="modal-info-value">${expiryDate}</span>
          </div>
        </div>

        <div class="modal-warning-box">
          <div class="modal-warning-icon">
            <i class="fas fa-exclamation-triangle"></i>
          </div>
          <div class="modal-warning-text">
            <h4>Action Required</h4>
            <p>Sekolah Anda tidak dapat digunakan karena subscription sudah expired. Hubungi admin sekolah untuk perpanjangan.</p>
            <p class="modal-warning-meta">
              <i class="fas fa-clock"></i>
              <span>Expired ${Math.abs(daysRemaining)} hari</span>
            </p>
          </div>
        </div>
      </div>
    </div>
  `;

  const result = await swal.fire({
    ...ModalDefaults,
    ...theme,
    html: htmlContent,
    showConfirmButton: true,
    showCancelButton: true,
    confirmButtonText: '<i class="fas fa-phone mr-2"></i>Hubungi Admin',
    cancelButtonText: 'Tutup',
    confirmButtonColor: '#4f46e5',
    cancelButtonColor: '#6b7280',
    reverseButtons: true,
    customClass: {
      container: 'swal-modal-container',
      popup: 'swal-modal-popup',
      htmlContainer: 'swal-modal-html',
      confirmButton: 'swal-modal-button-confirm',
      cancelButton: 'swal-modal-button-cancel'
    },
    willOpen: () => {
      appendModalStyles();
    }
  });

  if (result.isConfirmed && onContact) {
    onContact();
  }
  if (result.isDismissed && onClose) {
    onClose();
  }

  return result;
}

/**
 * Show confirmation modal
 * @param {string} title - Modal title
 * @param {string} message - Modal message
 * @param {Object} options - { confirmText, cancelText, icon, onConfirm, onCancel }
 */
export async function showConfirmModal(
  title = 'Konfirmasi',
  message = '',
  options = {}
) {
  const swal = ensureSwalInstance();
  const theme = getModalTheme();
  
  const {
    confirmText = 'Ya, lanjutkan',
    cancelText = 'Batal',
    icon = 'question',
    onConfirm = null,
    onCancel = null
  } = options;

  const result = await swal.fire({
    ...ModalDefaults,
    ...theme,
    title,
    html: message,
    icon,
    showConfirmButton: true,
    showCancelButton: true,
    confirmButtonText: confirmText,
    cancelButtonText: cancelText,
    confirmButtonColor: '#3b82f6',
    cancelButtonColor: '#6b7280',
    reverseButtons: true,
    customClass: {
      container: 'swal-modal-container'
    }
  });

  if (result.isConfirmed && onConfirm) {
    onConfirm();
  }
  if (result.isDismissed && onCancel) {
    onCancel();
  }

  return result;
}

/**
 * Show alert modal
 * @param {string} title - Modal title
 * @param {string} message - Modal message
 * @param {Object} options - { icon, buttonText, onClose }
 */
export async function showAlertModal(
  title = 'Perhatian',
  message = '',
  options = {}
) {
  const swal = ensureSwalInstance();
  const theme = getModalTheme();
  
  const {
    icon = 'info',
    buttonText = 'Mengerti',
    onClose = null
  } = options;

  const result = await swal.fire({
    ...ModalDefaults,
    ...theme,
    title,
    html: message,
    icon,
    confirmButtonText: buttonText,
    confirmButtonColor: '#3b82f6',
    customClass: {
      container: 'swal-modal-container'
    }
  });

  if (onClose) {
    onClose();
  }

  return result;
}

/**
 * Show custom HTML modal with full control
 * @param {Object} options - SweetAlert2 fire options
 */
export async function showCustomModal(options = {}) {
  const swal = ensureSwalInstance();
  const theme = getModalTheme();

  return swal.fire({
    ...ModalDefaults,
    ...theme,
    ...options,
    customClass: {
      container: 'swal-modal-container',
      ...options.customClass
    }
  });
}

/**
 * Append modal-specific styles to document
 * Called once when modals are first used
 */
function appendModalStyles() {
  if (document.getElementById('modal-styles-injected')) return;

  const style = document.createElement('style');
  style.id = 'modal-styles-injected';
  style.textContent = `
    /* Modal Wrapper Styles */
    .modal-subscription-wrapper {
      text-align: center;
      padding: 0;
    }

    .modal-section-header {
      display: flex;
      align-items: center;
      gap: 1rem;
      margin-bottom: 1.5rem;
      text-align: left;
    }

    .modal-icon-group {
      display: flex;
      justify-content: center;
      align-items: center;
    }

    .modal-icon-primary {
      width: 3rem;
      height: 3rem;
      background: linear-gradient(135deg, #ef4444 0%, #ec4899 100%);
      border-radius: 0.75rem;
      display: flex;
      align-items: center;
      justify-content: center;
      box-shadow: 0 10px 25px rgba(239, 68, 68, 0.2);
    }

    .modal-icon-primary i {
      color: white;
      font-size: 1.25rem;
    }

    .modal-text-group {
      flex: 1;
    }

    .modal-title {
      font-size: 1.5rem;
      font-weight: bold;
      margin: 0;
      background: linear-gradient(135deg, #f87171 0%, #f472b6 100%);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
    }

    .modal-subtitle {
      margin: 0.25rem 0 0 0;
      font-size: 1.125rem;
      color: #9ca3af;
      font-weight: 500;
    }

    .modal-section-content {
      display: flex;
      flex-direction: column;
      gap: 1.25rem;
      margin: 1.5rem 0;
      text-align: left;
    }

    .modal-info-box {
      display: flex;
      align-items: center;
      gap: 1rem;
      padding: 1.5rem;
      border-radius: 0.75rem;
      border: 1px solid rgba(148, 163, 184, 0.3);
      background: rgba(15, 23, 42, 0.3);
    }

    .modal-info-icon {
      width: 2.5rem;
      height: 2.5rem;
      border-radius: 0.5rem;
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
    }

    .modal-info-plan .modal-info-icon {
      background: rgba(59, 130, 246, 0.2);
      color: #60a5fa;
    }

    .modal-info-expires .modal-info-icon {
      background: rgba(234, 179, 8, 0.2);
      color: #facc15;
    }

    .modal-info-text {
      display: flex;
      flex-direction: column;
      flex: 1;
    }

    .modal-info-label {
      font-size: 0.75rem;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.05em;
      color: #9ca3af;
      margin-bottom: 0.25rem;
    }

    .modal-info-value {
      font-size: 1.125rem;
      font-weight: bold;
      color: #ffffff;
    }

    .modal-warning-box {
      display: flex;
      align-items: flex-start;
      gap: 1rem;
      padding: 1.25rem;
      border-radius: 0.75rem;
      border: 1px solid rgba(239, 68, 68, 0.3);
      background: linear-gradient(135deg, rgba(239, 68, 68, 0.1) 0%, rgba(244, 114, 182, 0.1) 100%);
    }

    .modal-warning-icon {
      width: 2.5rem;
      height: 2.5rem;
      background: rgba(239, 68, 68, 0.2);
      border-radius: 0.5rem;
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
      color: #f87171;
    }

    .modal-warning-text {
      flex: 1;
      text-align: left;
    }

    .modal-warning-text h4 {
      margin: 0 0 0.5rem 0;
      font-size: 1.125rem;
      font-weight: bold;
      color: #ffffff;
    }

    .modal-warning-text p {
      margin: 0 0 0.5rem 0;
      color: #d1d5db;
      font-size: 0.95rem;
      line-height: 1.5;
    }

    .modal-warning-meta {
      font-size: 0.875rem;
      color: #9ca3af;
      display: flex;
      align-items: center;
      gap: 0.5rem;
      padding-top: 0.75rem;
      border-top: 1px solid rgba(239, 68, 68, 0.2);
    }

    .modal-warning-meta i {
      color: #fbbf24;
    }

    /* SweetAlert2 Modal Container Customization */
    .swal-modal-container {
      z-index: 9999;
    }

    .swal-modal-popup {
      border-radius: 1rem;
      border: 1px solid rgba(100, 116, 139, 0.3);
      box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5);
    }

    .swal-modal-html {
      padding: 0;
      text-align: center;
    }

    .swal-modal-button-confirm,
    .swal-modal-button-cancel {
      padding: 0.75rem 1.5rem !important;
      border-radius: 0.625rem;
      font-weight: 600;
      transition: all 0.3s ease;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
    }

    .swal-modal-button-confirm:hover {
      transform: translateY(-2px);
      box-shadow: 0 8px 16px rgba(63, 81, 181, 0.3);
    }

    .swal-modal-button-cancel:hover {
      background-color: #4b5563 !important;
      transform: translateY(-2px);
    }

    /* Responsive design */
    @media (max-width: 640px) {
      .modal-section-header {
        flex-direction: column;
        text-align: center;
      }

      .modal-text-group {
        text-align: center;
      }

      .modal-info-box,
      .modal-warning-box {
        flex-direction: column;
        text-align: center;
      }

      .modal-warning-text {
        text-align: left;
      }

      .modal-section-content {
        gap: 1rem;
      }
    }

    /* Animation */
    @keyframes slideDown {
      from {
        opacity: 0;
        transform: translateY(-10px);
      }
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }

    .swal-modal-popup {
      animation: slideDown 0.3s ease-out;
    }
  `;

  document.head.appendChild(style);
}

/**
 * Modal API - Exported as main interface
 */
const ModalApi = {
  subscription: showSubscriptionModal,
  confirm: showConfirmModal,
  alert: showAlertModal,
  custom: showCustomModal,
  appendStyles: appendModalStyles
};

// Expose to window for non-module scripts
if (typeof window !== 'undefined') {
  window.Modal = ModalApi;
}

export default ModalApi;
