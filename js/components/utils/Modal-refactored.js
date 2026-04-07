/**
 * Modal Component - Reusable Modal Dialogs using SweetAlert2
 * Refactored for DRY, modular, and clean code architecture
 */

import { fireToast, ensureSwalInstance } from './Toast.js';

/* ================================
   CORE UTILITIES
================================ */

/**
 * Safely close all modals (idempotent + race-condition safe)
 */
async function closeAllModals() {
  const swal = ensureSwalInstance();
  if (!swal || typeof swal.close !== 'function') return true;

  if (!swal.isVisible?.()) return true;

  swal.close();

  return new Promise((resolve) => {
    let done = false;

    const finish = () => {
      if (done) return;
      done = true;
      resolve(true);
    };

    const timeout = setTimeout(finish, 250);

    const check = () => {
      if (!swal.isVisible?.()) {
        clearTimeout(timeout);
        finish();
        return;
      }
      requestAnimationFrame(check);
    };

    requestAnimationFrame(check);
  });
}

/**
 * Default modal configuration
 */
const ModalDefaults = Object.freeze({
  allowOutsideClick: false,
  allowEscapeKey: true,
  scrollbarPadding: false,
  backdrop: 'rgba(0, 0, 0, 0.5)'
});

/**
 * Theme detection - returns consistent theme object
 */
const getModalTheme = () => {
  const root = document.documentElement;
  const isDark =
    root.getAttribute('data-theme') === 'dark' ||
    root.classList.contains('dark');

  return {
    background: isDark ? '#1f2937' : '#ffffff',
    color: isDark ? '#f3f4f6' : '#1f2937'
  };
};

/* ================================
   STYLE INJECTION (SINGLE GUARD)
================================ */

function appendModalStyles() {
  if (document.getElementById('modal-styles-injected')) return;

  const style = document.createElement('style');
  style.id = 'modal-styles-injected';

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
    .modal-status-wrapper { text-align: center; padding: 0; }
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
    .modal-title { font-size: 1.35rem; font-weight: bold; margin: 0.5rem 0; }
    .modal-subtitle { font-size: 0.95rem; opacity: 0.8; margin: 0; }

    /* Info boxes */
    .modal-info-card {
      display: flex;
      gap: 0.75rem;
      padding: 1rem;
      border-radius: 0.75rem;
      border: 1px solid rgba(100, 116, 139, 0.2);
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
    }
  `;

  document.head.appendChild(style);
}

/* ================================
   BASE MODAL WRAPPER (SINGLE SOURCE)
================================ */

/**
 * Core modal factory - all modals route through here
 */
export async function showCustomModal(options = {}) {
  const swal = ensureSwalInstance();
  if (!swal) return;

  const theme = getModalTheme();

  return swal.fire({
    ...ModalDefaults,
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
}

/* ================================
   SUBSCRIPTION MODAL
================================ */

export async function showSubscriptionModal(data = {}, options = {}) {
  await closeAllModals();

  const {
    schoolName = 'Sekolah Anda',
    plan = 'Starter',
    expiresAt = new Date(),
    daysRemaining = 0
  } = data;

  const { onContact = null, onClose = null } = options;

  const expiryDate = new Date(expiresAt).toLocaleDateString('id-ID', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  const html = `
    <div class="modal-subscription-wrapper">
      <div class="modal-section-header">
        <div style="width: 2.75rem; height: 2.75rem; background: linear-gradient(135deg, #ef4444, #ec4899); border-radius: 0.875rem; display: flex; align-items: center; justify-content: center;">
          <i class="fas fa-calendar-xmark" style="color: white; font-size: 1.25rem;"></i>
        </div>
        <div>
          <h3 class="modal-title">Subscription Expired</h3>
          <p class="modal-subtitle">${schoolName}</p>
        </div>
      </div>
      <div style="text-align: left; margin: 1.5rem 0;">
        <p><strong>Plan:</strong> ${plan.toUpperCase()}</p>
        <p><strong>Expired:</strong> ${expiryDate}</p>
        <p><strong>Sisa:</strong> ${Math.abs(daysRemaining)} hari</p>
      </div>
    </div>
  `;

  const result = await showCustomModal({
    html,
    showConfirmButton: true,
    showDenyButton: Boolean(onContact),
    confirmButtonText: 'Tutup',
    denyButtonText: 'Hubungi Admin',
    confirmButtonColor: '#6b7280',
    denyButtonColor: '#4f46e5',
    reverseButtons: true,
    willOpen: appendModalStyles
  });

  if ((result.isConfirmed || result.isDismissed) && onClose) {
    await onClose(result);
  }

  if (result.isDenied && onContact) {
    await onContact(result);
  }

  return result;
}

/* ================================
   SCHOOL STATUS MODAL (REFACTORED)
================================ */

const StatusMeta = {
  pending_school: {
    title: 'Menunggu Approval Admin Sistem',
    subtitle: 'Data sekolah sudah diterima dan sedang diverifikasi.',
    icon: 'fa-hourglass-half',
    accent: '#f59e0b'
  },
  pending_renewal: {
    title: 'Perpanjangan Sedang Diproses',
    subtitle: 'Bukti transfer renewal sudah dikirim dan sedang dicek.',
    icon: 'fa-receipt',
    accent: '#3b82f6'
  },
  renewal_pending: {
    title: 'Perpanjangan Sedang Diproses',
    subtitle: 'Bukti transfer renewal sudah dikirim dan sedang dicek.',
    icon: 'fa-receipt',
    accent: '#3b82f6'
  },
  inactive: {
    title: 'Status Sekolah Belum Aktif',
    subtitle: 'Akses sekolah belum dapat digunakan.',
    icon: 'fa-circle-info',
    accent: '#6b7280'
  }
};

export async function showSchoolStatusModal(data = {}, options = {}) {
  await closeAllModals();

  const school = data.school || {};
  const statusKey = (data.schoolStatus || school.status || 'inactive').toLowerCase();
  const meta = StatusMeta[statusKey] || StatusMeta.inactive;
  const { onContact = null, onClose = null } = options;

  const submittedAt = school.createdAt
    ? new Date(school.createdAt).toLocaleDateString('id-ID', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      })
    : '-';

  const html = `
    <div class="modal-status-wrapper">
      <div class="modal-section-header">
        <div style="width: 2.75rem; height: 2.75rem; background: ${meta.accent}20; color: ${meta.accent}; border-radius: 0.875rem; display: flex; align-items: center; justify-content: center;">
          <i class="fas ${meta.icon}" style="font-size: 1.25rem;"></i>
        </div>
        <div style="text-align: left;">
          <h3 class="modal-title">${meta.title}</h3>
          <p class="modal-subtitle">${school.schoolName || 'Sekolah Anda'}</p>
          <p style="font-size: 0.85rem; opacity: 0.7; margin-top: 0.25rem;">${meta.subtitle}</p>
        </div>
      </div>
      <div style="text-align: left; margin: 1.5rem 0; display: grid; gap: 0.75rem;">
        <p><strong>Plan:</strong> ${(school.plan || 'starter').toUpperCase()}</p>
        <p><strong>Email:</strong> ${school.email || '-'}</p>
        <p><strong>WhatsApp:</strong> ${school.noWa || school.no_wa || '-'}</p>
        <p><strong>Pengajuan:</strong> ${submittedAt}</p>
      </div>
      <div style="background: ${meta.accent}14; border: 1px solid ${meta.accent}33; border-radius: 0.75rem; padding: 1rem; margin-top: 1rem; text-align: left;">
        <p style="margin: 0; font-size: 0.95rem;">${data.message || 'Silakan hubungi admin sistem untuk informasi lebih lanjut.'}</p>
      </div>
    </div>
  `;

  const result = await showCustomModal({
    html,
    showConfirmButton: true,
    showCloseButton: true,
    showDenyButton: Boolean(onContact),
    confirmButtonText: 'Mengerti',
    denyButtonText: 'Hubungi Admin',
    confirmButtonColor: meta.accent,
    denyButtonColor: '#6b7280',
    reverseButtons: true,
    willOpen: appendModalStyles
  });

  if ((result.isConfirmed || result.isDismissed) && onClose) {
    await onClose(result);
  }

  if (result.isDenied && onContact) {
    await onContact(result);
  }

  return result;
}

/* ================================
   SUBSCRIPTION RENEWAL MODAL (EVENT FIX)
================================ */

export async function showSubscriptionRenewalModal(
  subscriptionData = {},
  plans = [],
  options = {}
) {
  await closeAllModals();

  const swal = ensureSwalInstance();
  if (!swal) return;

  const {
    schoolName = 'Sekolah Anda',
    currentPlan = 'Starter'
  } = subscriptionData;

  const { onSelectPlan = null, onClose = null } = options;

  const filteredPlans = plans.filter(p => p.id !== 'starter' && p.id !== currentPlan.toLowerCase());

  const html = `
    <div style="text-align: center;">
      <h3 class="modal-title">Pilih Plan Perpanjangan</h3>
      <p class="modal-subtitle">${schoolName}</p>
      <div style="display: grid; gap: 1rem; margin-top: 1.5rem;">
        ${filteredPlans.map(p => `
          <button class="plan-btn" data-id="${p.id}" style="padding: 1rem; border: 1px solid #e5e7eb; border-radius: 0.75rem; background: transparent; cursor: pointer; transition: all 0.3s; font-weight: 500;">
            <div style="font-size: 1.1rem; margin-bottom: 0.5rem;">${p.name}</div>
            <div style="font-size: 0.9rem; opacity: 0.7;">Rp ${p.price?.toLocaleString('id-ID') || 'N/A'}/${p.period || 'bulan'}</div>
          </button>
        `).join('')}
      </div>
    </div>
  `;

  return swal.fire({
    ...ModalDefaults,
    ...getModalTheme(),
    html,
    showConfirmButton: false,
    showCancelButton: true,
    cancelButtonText: 'Batal',
    customClass: {
      container: 'swal-modal-container',
      popup: 'swal-modal-popup',
      htmlContainer: 'swal-modal-html'
    },
    willOpen: (popup) => {
      appendModalStyles();

      popup.querySelectorAll('.plan-btn').forEach(btn => {
        btn.addEventListener('click', () => {
          const id = btn.dataset.id;
          const selected = filteredPlans.find(p => p.id === id);

          swal.close();
          onSelectPlan?.(selected);
        }, { once: true }); // MEMORY LEAK FIX
      });
    }
  });
}

/* ================================
   CONFIRM MODAL
================================ */

export async function showConfirmModal(
  title = 'Konfirmasi',
  message = '',
  options = {}
) {
  const swal = ensureSwalInstance();
  if (!swal) return;

  const {
    confirmText = 'Ya, lanjutkan',
    cancelText = 'Batal',
    icon = 'question',
    onConfirm = null,
    onCancel = null
  } = options;

  const result = await swal.fire({
    ...ModalDefaults,
    ...getModalTheme(),
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

  if (result.isConfirmed && onConfirm) onConfirm();
  if (result.isDismissed && onCancel) onCancel();

  return result;
}

/* ================================
   ALERT MODAL
================================ */

export async function showAlertModal(
  title = 'Perhatian',
  message = '',
  options = {}
) {
  const { icon = 'info', buttonText = 'Mengerti', onClose = null } = options;

  const result = await showCustomModal({
    title,
    html: message,
    icon,
    confirmButtonText: buttonText,
    confirmButtonColor: '#3b82f6',
    willOpen: appendModalStyles
  });

  if (onClose) onClose();

  return result;
}

/* ================================
   EXPORT API
================================ */

const ModalApi = {
  subscription: showSubscriptionModal,
  schoolStatus: showSchoolStatusModal,
  subscriptionRenewal: showSubscriptionRenewalModal,
  confirm: showConfirmModal,
  alert: showAlertModal,
  custom: showCustomModal,
  closeAll: closeAllModals,
  appendStyles: appendModalStyles
};

if (typeof window !== 'undefined') {
  window.Modal = ModalApi;
}

export default ModalApi;
