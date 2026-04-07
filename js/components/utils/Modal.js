/**
 * Modal Component - Reusable Modal Dialogs using SweetAlert2
 * FINAL REFACTOR: Simple, atomic, no state management
 * Principles: Single source of truth (Swal), No polling, No global state
 */

import { ensureSwalInstance } from './Toast.js';

/* ================================
   CONSTANTS & CONFIGURATIONS
================================ */

/**
 * Default modal configuration - immutable and safe
 */
const MODAL_DEFAULTS = Object.freeze({
  allowOutsideClick: false,
  allowEscapeKey: true,
  scrollbarPadding: false,
  backdrop: 'rgba(0, 0, 0, 0.5)',
  showClass: {
    popup: 'swal2-noanimation',
    backdrop: 'swal2-noanimation'
  },
  hideClass: {
    popup: '',
    backdrop: ''
  }
});

/**
 * Status metadata for school status modals - immutable
 */
const STATUS_META = Object.freeze({
  pending_school: {
    title: 'Menunggu Approval Admin Sistem',
    subtitle: 'Data sekolah sudah diterima dan sedang diverifikasi.',
    icon: 'fa-hourglass-half',
    accent: '#f59e0b',
    actionLabel: 'Langkah Selanjutnya',
    actionMessage: 'Silakan tunggu persetujuan admin sistem sebelum melanjutkan registrasi admin sekolah.'
  },
  pending_renewal: {
    title: 'Perpanjangan Sedang Diproses',
    subtitle: 'Bukti transfer renewal sudah dikirim dan sedang dicek.',
    icon: 'fa-receipt',
    accent: '#3b82f6',
    actionLabel: 'Status Renewal',
    actionMessage: 'Admin sistem sedang memverifikasi pembayaran renewal. Setelah disetujui, akses sekolah akan aktif kembali.'
  },
  renewal_pending: {
    title: 'Perpanjangan Sedang Diproses',
    subtitle: 'Bukti transfer renewal sudah dikirim dan sedang dicek.',
    icon: 'fa-receipt',
    accent: '#3b82f6',
    actionLabel: 'Status Renewal',
    actionMessage: 'Admin sistem sedang memverifikasi pembayaran renewal. Setelah disetujui, akses sekolah akan aktif kembali.'
  },
  inactive: {
    title: 'Status Sekolah Belum Aktif',
    subtitle: 'Akses sekolah belum dapat digunakan.',
    icon: 'fa-circle-info',
    accent: '#6b7280',
    actionLabel: 'Informasi',
    actionMessage: 'Hubungi admin sistem untuk bantuan aktivasi sekolah.'
  }
});

/* ================================
   UTILITY FUNCTIONS
================================ */

/**
 * Theme detection - returns consistent theme object
 */
const getModalTheme = () => {
  try {
    const root = document.documentElement;
    const isDark =
      root.getAttribute('data-theme') === 'dark' ||
      root.classList.contains('dark');

    return {
      background: isDark ? '#1f2937' : '#ffffff',
      color: isDark ? '#f3f4f6' : '#1f2937'
    };
  } catch (error) {
    // Fallback theme
    return {
      background: '#ffffff',
      color: '#1f2937'
    };
  }
};

/**
 * Sanitize HTML content to prevent injection
 */
const sanitizeHtml = (text) => {
  if (typeof text !== 'string') return '';
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
};

/**
 * Format date to Indonesian locale safely
 */
const formatDateID = (date) => {
  try {
    if (!date) return '-';
    const dateObj = new Date(date);
    if (isNaN(dateObj.getTime())) return '-';
    return dateObj.toLocaleDateString('id-ID', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  } catch (error) {
    return '-';
  }
};

/**
 * Get status metadata safely
 */
const getStatusMeta = (statusKey) => {
  return STATUS_META[statusKey] || STATUS_META.inactive;
};

/* ================================
   STYLE MANAGEMENT
================================ */

/**
 * Append modal-specific styles to document (single guard)
 */
function appendModalStyles() {
  const styleId = 'modal-styles-injected';
  if (document.getElementById(styleId)) return;

  try {
    const style = document.createElement('style');
    style.id = styleId;

    style.textContent = `
      /* Core modal styling */
      .swal-modal-container { z-index: 9999; }
      .swal-modal-popup {
        width: min(92vw, 720px);
        padding: 1.25rem;
        border-radius: 1rem;
        border: 1px solid rgba(100, 116, 139, 0.3);
        box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5);
        animation: slideDown 0.3s ease-out;
      }
      .swal-modal-html { padding: 0; text-align: center; }
      .swal-modal-button-confirm,
      .swal-modal-button-cancel {
        padding: 0.75rem 1.5rem !important;
        border-radius: 0.625rem;
        font-weight: 600;
        transition: all 0.3s ease;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
      }
      .swal-modal-button-confirm:hover { transform: translateY(-2px); }
      .swal-modal-button-cancel:hover { opacity: 0.8; transform: translateY(-2px); }

      /* Content wrappers */
      .modal-subscription-wrapper,
      .modal-status-wrapper,
      .modal-renewal-wrapper { text-align: center; padding: 0; }

      .modal-section-header {
        display: flex;
        align-items: center;
        gap: 1rem;
        margin-bottom: 1rem;
      }

      .modal-icon-primary {
        width: 2.75rem;
        height: 2.75rem;
        background: linear-gradient(135deg, #ef4444 0%, #ec4899 100%);
        border-radius: 0.875rem;
        display: flex;
        align-items: center;
        justify-content: center;
        flex-shrink: 0;
      }
      .modal-icon-primary i { color: white; font-size: 1.25rem; }

      .modal-title {
        font-size: 1.35rem;
        font-weight: bold;
        margin: 0.5rem 0;
      }
      .modal-subtitle {
        font-size: 0.95rem;
        opacity: 0.8;
        margin: 0;
      }

      /* Info boxes */
      .modal-info-box {
        display: flex;
        gap: 0.75rem;
        padding: 1rem;
        border-radius: 0.75rem;
        border: 1px solid rgba(100, 116, 139, 0.2);
        margin-bottom: 0.75rem;
      }
      .modal-info-icon {
        width: 2rem;
        height: 2rem;
        background: rgba(59, 130, 246, 0.1);
        color: #3b82f6;
        border-radius: 0.5rem;
        display: flex;
        align-items: center;
        justify-content: center;
        flex-shrink: 0;
      }
      .modal-info-icon i { font-size: 1rem; }
      .modal-info-text { flex: 1; }
      .modal-info-label {
        display: block;
        font-size: 0.85rem;
        opacity: 0.7;
        margin-bottom: 0.25rem;
      }
      .modal-info-value {
        display: block;
        font-size: 0.95rem;
        font-weight: 500;
      }

      /* Warning boxes */
      .modal-warning-box {
        background: rgba(239, 68, 68, 0.1);
        border: 1px solid rgba(239, 68, 68, 0.3);
        border-radius: 0.75rem;
        padding: 1rem;
        margin-top: 1rem;
        text-align: left;
      }
      .modal-warning-icon {
        width: 2rem;
        height: 2rem;
        background: rgba(239, 68, 68, 0.2);
        color: #ef4444;
        border-radius: 0.5rem;
        display: flex;
        align-items: center;
        justify-content: center;
        margin-bottom: 0.75rem;
      }
      .modal-warning-icon i { font-size: 1rem; }
      .modal-warning-text h4 {
        margin: 0 0 0.5rem 0;
        font-size: 1rem;
        color: #ef4444;
      }
      .modal-warning-text p {
        margin: 0.25rem 0;
        font-size: 0.9rem;
        opacity: 0.9;
      }
      .modal-warning-meta {
        display: flex;
        align-items: center;
        gap: 0.5rem;
        font-size: 0.85rem;
        opacity: 0.7;
        margin-top: 0.5rem;
      }

      /* Plan selection */
      .plan-btn {
        padding: 1rem;
        border: 1px solid #e5e7eb;
        border-radius: 0.75rem;
        background: transparent;
        cursor: pointer;
        transition: all 0.3s;
        font-weight: 500;
        text-align: left;
        width: 100%;
      }
      .plan-btn:hover {
        border-color: #3b82f6;
        background: rgba(59, 130, 246, 0.05);
        transform: translateY(-1px);
      }

      /* Animations */
      @keyframes slideDown {
        from { opacity: 0; transform: translateY(-10px); }
        to { opacity: 1; transform: translateY(0); }
      }

      /* Responsive */
      @media (max-width: 640px) {
        .swal-modal-popup { width: 94vw; padding: 1rem; }
        .modal-section-header { flex-direction: column; }
        .modal-info-box { flex-direction: column; text-align: center; }
      }
    `;

    document.head.appendChild(style);
  } catch (error) {
    console.warn('Error appending modal styles:', error);
  }
}

/* ================================
   TEMPLATE BUILDERS (SAFE HTML)
================================ */

/**
 * Build subscription modal HTML safely
 */
const buildSubscriptionTemplate = (data) => {
  const {
    schoolName = 'Sekolah Anda',
    plan = 'Starter',
    expiresAt = new Date(),
    daysRemaining = 0
  } = data;

  const expiryDate = formatDateID(expiresAt);
  const safeSchoolName = sanitizeHtml(schoolName);
  const safePlan = sanitizeHtml(plan.toUpperCase());
  const safeDays = Math.abs(parseInt(daysRemaining) || 0);

  return `
    <div class="modal-subscription-wrapper">
      <div class="modal-section-header">
        <div class="modal-icon-primary">
          <i class="fas fa-calendar-xmark"></i>
        </div>
        <div>
          <h3 class="modal-title">Subscription Expired</h3>
          <p class="modal-subtitle">${safeSchoolName}</p>
        </div>
      </div>

      <div class="modal-section-content">
        <div class="modal-info-box modal-info-plan">
          <div class="modal-info-icon">
            <i class="fas fa-school"></i>
          </div>
          <div class="modal-info-text">
            <span class="modal-info-label">Plan</span>
            <span class="modal-info-value">${safePlan}</span>
          </div>
        </div>

        <div class="modal-info-box modal-info-expires">
          <div class="modal-info-icon">
            <i class="fas fa-calendar-times"></i>
          </div>
          <div class="modal-info-text">
            <span class="modal-info-label">Expired</span>
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
              <span>Expired ${safeDays} hari</span>
            </p>
          </div>
        </div>
      </div>
    </div>
  `;
};

/**
 * Build school status modal HTML safely
 */
const buildSchoolStatusTemplate = (data) => {
  const school = data.school || {};
  const statusKey = (data.schoolStatus || school.status || 'inactive').toString().toLowerCase();
  const meta = getStatusMeta(statusKey);

  const submittedAt = formatDateID(school.createdAt || school.updatedAt);
  const planLabel = sanitizeHtml((school.plan || 'starter').toUpperCase());
  const schoolName = sanitizeHtml(school.schoolName || school.name || 'Sekolah Anda');
  const schoolEmail = sanitizeHtml(school.email || '-');
  const schoolPhone = sanitizeHtml(school.noWa || school.no_wa || '-');
  const message = sanitizeHtml(data.message || meta.actionMessage);

  return `
    <div class="modal-status-wrapper">
      <div class="modal-section-header">
        <div style="width: 2.75rem; height: 2.75rem; background: ${meta.accent}20; color: ${meta.accent}; border-radius: 0.875rem; display: flex; align-items: center; justify-content: center;">
          <i class="fas ${meta.icon}" style="font-size: 1.25rem;"></i>
        </div>
        <div style="text-align: left;">
          <h3 class="modal-title">${sanitizeHtml(meta.title)}</h3>
          <p class="modal-subtitle">${schoolName}</p>
          <p style="font-size: 0.85rem; opacity: 0.7; margin-top: 0.25rem;">${sanitizeHtml(meta.subtitle)}</p>
        </div>
      </div>
      <div style="text-align: left; margin: 1.5rem 0; display: grid; gap: 0.75rem;">
        <p><strong>Plan:</strong> ${planLabel}</p>
        <p><strong>Email:</strong> ${schoolEmail}</p>
        <p><strong>WhatsApp:</strong> ${schoolPhone}</p>
        <p><strong>Pengajuan:</strong> ${submittedAt}</p>
      </div>
      <div style="background: ${meta.accent}14; border: 1px solid ${meta.accent}33; border-radius: 0.75rem; padding: 1rem; margin-top: 1rem; text-align: left;">
        <p style="margin: 0; font-size: 0.95rem;">${message}</p>
      </div>
    </div>
  `;
};

/**
 * Build subscription renewal modal HTML safely
 */
const buildSubscriptionRenewalTemplate = (subscriptionData, plans) => {
  const { schoolName = 'Sekolah Anda', currentPlan = 'Starter' } = subscriptionData;
  const safeSchoolName = sanitizeHtml(schoolName);

  const filteredPlans = Array.isArray(plans)
    ? plans.filter(p => p && p.id !== 'starter' && p.id !== currentPlan.toLowerCase())
    : [];

  const planButtons = filteredPlans.map(p => {
    const safeName = sanitizeHtml(p.name || 'Unknown Plan');
    const safePrice = p.price ? p.price.toLocaleString('id-ID') : 'N/A';
    const safePeriod = sanitizeHtml(p.period || 'bulan');

    return `
      <button class="plan-btn" data-plan-id="${p.id || ''}">
        <div style="font-size: 1.1rem; margin-bottom: 0.5rem;">${safeName}</div>
        <div style="font-size: 0.9rem; opacity: 0.7;">Rp ${safePrice}/${safePeriod}</div>
      </button>
    `;
  }).join('');

  return `
    <div class="modal-renewal-wrapper">
      <h3 class="modal-title">Pilih Plan Perpanjangan</h3>
      <p class="modal-subtitle">${safeSchoolName}</p>
      <div style="display: grid; gap: 1rem; margin-top: 1.5rem;">
        ${planButtons}
      </div>
    </div>
  `;
};

/* ================================
   MODAL FACTORIES (SAFE & ROBUST)
================================ */

/**
 * Core modal factory with proper error handling and cleanup
 */
export async function showCustomModal(options = {}) {
  try {
    const swal = ensureSwalInstance();
    if (!swal) {
      throw new Error('SweetAlert2 instance not available');
    }

    const theme = getModalTheme();
    appendModalStyles();

    const result = await swal.fire({
      ...MODAL_DEFAULTS,
      ...theme,
      ...options,
      customClass: {
        container: 'swal-modal-container',
        popup: 'swal-modal-popup',
        htmlContainer: 'swal-modal-html',
        confirmButton: 'swal-modal-button-confirm',
        cancelButton: 'swal-modal-button-cancel',
        denyButton: 'swal-modal-button-cancel',
        ...(options.customClass || {})
      }
    });

    return result;
  } catch (error) {
    console.error('Error showing custom modal:', error);
    return { isDismissed: true, dismiss: 'error' };
  }
}

/**
 * Show subscription expiry modal with proper cleanup
 */
export async function showSubscriptionModal(data = {}, options = {}) {
  try {
    const { onContact = null, onClose = null } = options;
    const html = buildSubscriptionTemplate(data);

    const result = await showCustomModal({
      html,
      showConfirmButton: true,
      showDenyButton: Boolean(onContact),
      confirmButtonText: 'Tutup',
      denyButtonText: 'Hubungi Admin',
      confirmButtonColor: '#6b7280',
      denyButtonColor: '#4f46e5',
      reverseButtons: true
    });

    // Handle callbacks safely
    try {
      if ((result.isConfirmed || result.isDismissed) && onClose) {
        await onClose(result);
      }

      if (result.isDenied && onContact) {
        await onContact(result);
      }
    } catch (callbackError) {
      console.warn('Error in modal callback:', callbackError);
    }

    return result;
  } catch (error) {
    console.error('Error showing subscription modal:', error);
    return { isDismissed: true, dismiss: 'error' };
  }
}

/**
 * Show school status modal with proper cleanup
 */
export async function showSchoolStatusModal(data = {}, options = {}) {
  try {
    const { onContact = null, onClose = null } = options;
    const html = buildSchoolStatusTemplate(data);
    const statusKey = (data.schoolStatus || data.school?.status || 'inactive').toString().toLowerCase();
    const meta = getStatusMeta(statusKey);

    const result = await showCustomModal({
      html,
      showConfirmButton: true,
      showCloseButton: true,
      showDenyButton: Boolean(onContact),
      confirmButtonText: 'Mengerti',
      denyButtonText: 'Hubungi Admin',
      confirmButtonColor: meta.accent,
      denyButtonColor: '#6b7280',
      reverseButtons: true
    });

    // Handle callbacks safely
    try {
      if ((result.isConfirmed || result.isDismissed) && onClose) {
        await onClose(result);
      }

      if (result.isDenied && onContact) {
        await onContact(result);
      }
    } catch (callbackError) {
      console.warn('Error in modal callback:', callbackError);
    }

    return result;
  } catch (error) {
    console.error('Error showing school status modal:', error);
    return { isDismissed: true, dismiss: 'error' };
  }
}

/**
 * Show subscription renewal modal with proper event cleanup
 */
export async function showSubscriptionRenewalModal(subscriptionData = {}, plans = [], options = {}) {
  try {
    const { onSelectPlan = null, onClose = null } = options;
    const html = buildSubscriptionRenewalTemplate(subscriptionData, plans);

    const result = await showCustomModal({
      html,
      showConfirmButton: false,
      showCancelButton: true,
      cancelButtonText: 'Batal',
      customClass: {
        container: 'swal-modal-container',
        popup: 'swal-modal-popup',
        htmlContainer: 'swal-modal-html'
      },
      didOpen: (popup) => {
        // Add event listeners
        const planButtons = popup.querySelectorAll('.plan-btn');
        planButtons.forEach(btn => {
          btn.addEventListener('click', () => {
            const planId = btn.dataset.planId;
            const selected = plans.find(p => p.id === planId);

            // Close modal and call callback
            const swal = ensureSwalInstance();
            if (swal) {
              swal.close();
            }

            try {
              if (onSelectPlan) {
                onSelectPlan(selected);
              }
            } catch (callbackError) {
              console.warn('Error in plan selection callback:', callbackError);
            }
          });
        });
      }
    });

    // Handle close callback safely
    try {
      if (result.isDismissed && onClose) {
        await onClose(result);
      }
    } catch (callbackError) {
      console.warn('Error in modal close callback:', callbackError);
    }

    return result;
  } catch (error) {
    console.error('Error showing subscription renewal modal:', error);
    return { isDismissed: true, dismiss: 'error' };
  }
}

/**
 * Show confirmation modal with proper cleanup
 */
export async function showConfirmModal(title = 'Konfirmasi', message = '', options = {}) {
  try {
    const {
      confirmText = 'Ya, lanjutkan',
      cancelText = 'Batal',
      icon = 'question',
      onConfirm = null,
      onCancel = null
    } = options;

    const result = await showCustomModal({
      title: sanitizeHtml(title),
      html: sanitizeHtml(message),
      icon,
      showConfirmButton: true,
      showCancelButton: true,
      confirmButtonText: sanitizeHtml(confirmText),
      cancelButtonText: sanitizeHtml(cancelText),
      confirmButtonColor: '#3b82f6',
      cancelButtonColor: '#6b7280',
      reverseButtons: true
    });

    // Handle callbacks safely
    try {
      if (result.isConfirmed && onConfirm) {
        await onConfirm(result);
      }
      if (result.isDismissed && onCancel) {
        await onCancel(result);
      }
    } catch (callbackError) {
      console.warn('Error in confirm modal callback:', callbackError);
    }

    return result;
  } catch (error) {
    console.error('Error showing confirm modal:', error);
    return { isDismissed: true, dismiss: 'error' };
  }
}

/**
 * Show alert modal with proper cleanup
 */
export async function showAlertModal(title = 'Perhatian', message = '', options = {}) {
  try {
    const { icon = 'info', buttonText = 'Mengerti', onClose = null } = options;

    const result = await showCustomModal({
      title: sanitizeHtml(title),
      html: sanitizeHtml(message),
      icon,
      confirmButtonText: sanitizeHtml(buttonText),
      confirmButtonColor: '#3b82f6'
    });

    // Handle callback safely
    try {
      if (onClose) {
        await onClose(result);
      }
    } catch (callbackError) {
      console.warn('Error in alert modal callback:', callbackError);
    }

    return result;
  } catch (error) {
    console.error('Error showing alert modal:', error);
    return { isDismissed: true, dismiss: 'error' };
  }
}

/* ================================
   MAIN API EXPORT
================================ */

const ModalApi = {
  subscription: showSubscriptionModal,
  schoolStatus: showSchoolStatusModal,
  subscriptionRenewal: showSubscriptionRenewalModal,
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