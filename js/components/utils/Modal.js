import { fireToast, ensureSwalInstance } from './Toast.js';

/* ================================
   CORE UTILITIES
================================ */

/**
 * Safely close all modals (idempotent)
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
 * Default modal config
 */
const ModalDefaults = Object.freeze({
  allowOutsideClick: false,
  allowEscapeKey: true,
  scrollbarPadding: false,
  backdrop: 'rgba(0,0,0,0.5)'
});

/**
 * Theme detection
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
   BASE MODAL WRAPPER
================================ */

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

  const { onContact, onClose } = options;

  const expiryDate = new Date(expiresAt).toLocaleDateString('id-ID', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  const html = `
    <div class="modal-subscription-wrapper">
      <h3 class="modal-title">Subscription Expired</h3>
      <p>${schoolName}</p>
      <p>${plan.toUpperCase()} - ${expiryDate}</p>
      <p>Expired ${Math.abs(daysRemaining)} hari</p>
    </div>
  `;

  const result = await showCustomModal({
    html,
    showConfirmButton: true,
    showDenyButton: Boolean(onContact),
    confirmButtonText: 'Tutup',
    denyButtonText: 'Hubungi Admin',
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
   SCHOOL STATUS MODAL
================================ */

export async function showSchoolStatusModal(data = {}, options = {}) {
  await closeAllModals();

  const school = data.school || {};
  const status = (data.schoolStatus || school.status || 'inactive').toLowerCase();

  const map = {
    pending_school: 'Menunggu approval',
    pending_renewal: 'Renewal diproses',
    inactive: 'Belum aktif'
  };

  const html = `
    <div class="modal-status-wrapper">
      <h3>${map[status] || map.inactive}</h3>
      <p>${school.name || 'Sekolah'}</p>
    </div>
  `;

  return showCustomModal({
    html,
    showConfirmButton: true,
    confirmButtonText: 'Mengerti',
    willOpen: appendModalStyles
  });
}

/* ================================
   RENEWAL MODAL (FIXED EVENT BUG)
================================ */

export async function showSubscriptionRenewalModal(
  subscriptionData = {},
  plans = [],
  options = {}
) {
  await closeAllModals();

  const swal = ensureSwalInstance();
  if (!swal) return;

  const { onSelectPlan } = options;

  const filtered = plans.filter(p => p.id !== 'starter');

  const html = `
    <div>
      ${filtered.map(p => `
        <button class="plan-btn" data-id="${p.id}">
          ${p.name}
        </button>
      `).join('')}
    </div>
  `;

  return swal.fire({
    html,
    showConfirmButton: false,
    willOpen: (popup) => {
      appendModalStyles();

      popup.querySelectorAll('.plan-btn').forEach(btn => {
        btn.addEventListener('click', () => {
          const id = btn.dataset.id;
          const selected = filtered.find(p => p.id === id);

          swal.close();
          onSelectPlan?.(selected);
        }, { once: true }); // FIX memory leak
      });
    }
  });
}

/* ================================
   CONFIRM MODAL
================================ */

export async function showConfirmModal(title, message, opts = {}) {
  const swal = ensureSwalInstance();

  const result = await swal.fire({
    title,
    html: message,
    icon: opts.icon || 'question',
    showCancelButton: true
  });

  if (result.isConfirmed) opts.onConfirm?.();
  if (result.isDismissed) opts.onCancel?.();

  return result;
}

/* ================================
   ALERT MODAL
================================ */

export async function showAlertModal(title, message, opts = {}) {
  return showCustomModal({
    title,
    html: message,
    icon: opts.icon || 'info'
  });
}

/* ================================
   STYLE INJECTION (SAFE)
================================ */

function appendModalStyles() {
  if (document.getElementById('modal-style')) return;

  const style = document.createElement('style');
  style.id = 'modal-style';

  style.textContent = `
    .modal-title { font-size: 1.2rem; font-weight: bold; }
    .plan-btn { margin: 5px; padding: 8px 12px; }
  `;

  document.head.appendChild(style);
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
  closeAll: closeAllModals
};

if (typeof window !== 'undefined') {
  window.Modal = ModalApi;
}

export default ModalApi;