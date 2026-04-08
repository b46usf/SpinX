/**
 * Modal Core - Single Execution Point with executeModal()
 * FINAL REFACTOR: executeModal(config) → handleHooks(result)
 * Separation: Templates pure, utils safe, CSS external, handlers centralized
 * Consistent lifecycle: didOpen (scoped listeners), preConfirm, handleHooks
 */

import { 
  MODAL_DEFAULTS, 
  getModalTheme, 
  loadModalCSS, 
  getSwalInstance 
} from './modalUtils.js';
import * as CoreTemplates from '../templates/ModalTemplates.js';
import * as ImportTemplate from '../templates/ImportTemplate.js';
import * as RegisterTemplate from '../templates/RegisterTemplate.js';

/* ================================
   CORE EXECUTION ENGINE
================================ */

/**
 * Single door execution - Atomic & composable
 * @param {Object} config 
 * @param {string|Function} config.template - 'subscription' | buildFunc
 * @param {Object} [config.data] - Template data
 * @param {Object} [config.hooks] - {onConfirm, onClose, onDeny}
 * @param {Function} [config.didOpen] - Scoped setup
 * @param {Function} [config.preConfirm] - Validation
 * @param {Object} [config.options] - Swal options
 */
export async function executeModal(config = {}) {
  try {
    loadModalCSS();
    const swal = getSwalInstance();
    if (!swal) throw new Error('SweetAlert2 not available');

    const theme = getModalTheme();
    const html = await buildHtml(config);
    
    const result = await swal.fire({
      ...MODAL_DEFAULTS,
      ...theme,
      ...config.options,
      html,
      customClass: {
        container: 'swal-modal-container',
        popup: 'swal-modal-popup',
        htmlContainer: 'swal-modal-html',
        confirmButton: 'swal-modal-button-confirm',
        cancelButton: 'swal-modal-button-cancel',
        denyButton: 'swal-modal-button-cancel',
        ...(config.options?.customClass || {})
      },
      ...(config.didOpen && { didOpen: config.didOpen }),
      ...(config.preConfirm && { preConfirm: config.preConfirm })
    });

    return await handleHooks(result, config.hooks || {});
  } catch (error) {
    console.error('Modal execution error:', error);
    return { isDismissed: true, dismiss: 'error', error };
  }
}

/**
 * Centralized hook handler - Error boundary included
 * Consistent lifecycle handling
 */
async function handleHooks(result, hooks = {}) {
  try {
    if (result.isConfirmed && hooks.onConfirm) {
      return await hooks.onConfirm(result.value, result);
    }
    if (result.isDenied && hooks.onDeny) {
      return await hooks.onDeny(result, result.value);
    }
    if ((result.isDismissed || result.isCancelled) && hooks.onClose) {
      return await hooks.onClose(result);
    }
    return result;
  } catch (hookError) {
    console.warn('Hook execution error:', hookError);
    return { ...result, error: hookError };
  }
}

/**
 * Build HTML from template spec (pure → HTML string)
 */
async function buildHtml({ template, data = {} }) {
  // Named templates
  const templates = {
    subscription: () => CoreTemplates.buildSubscriptionTemplate(data),
    schoolStatus: () => CoreTemplates.buildSchoolStatusTemplate(data),
    subscriptionRenewal: () => CoreTemplates.buildSubscriptionRenewalTemplate(data.subscriptionData, data.plans),
    confirm: () => CoreTemplates.buildConfirmTemplate(data.title, data.message),
    alert: () => CoreTemplates.buildAlertTemplate(data.title, data.message)
  };

  if (typeof template === 'function') return template(data);
  if (templates[template]) return templates[template](data);
  
  throw new Error(`Unknown template: ${template}`);
}

/* ================================
   LEGACY API WRAPPERS (Thin)
================================ */

/**
 * showSubscriptionModal → executeModal wrapper (BC)
 */
export async function showSubscriptionModal(data = {}, options = {}) {
  return executeModal({
    template: 'subscription',
    data,
    hooks: {
      onClose: options.onClose,
      onContact: options.onContact // maps to onDeny
    },
    options: {
      showConfirmButton: true,
      showDenyButton: Boolean(options.onContact),
      confirmButtonText: 'Tutup',
      denyButtonText: 'Hubungi Admin',
      confirmButtonColor: '#6b7280',
      denyButtonColor: '#4f46e5',
      reverseButtons: true
    }
  });
}

/**
 * showSchoolStatusModal → executeModal wrapper
 */
export async function showSchoolStatusModal(data = {}, options = {}) {
  const statusKey = (data.schoolStatus || data.school?.status || 'inactive').toLowerCase();
  const meta = CoreTemplates.getStatusMeta(statusKey); // Import if needed

  return executeModal({
    template: 'schoolStatus',
    data,
    hooks: {
      onClose: options.onClose,
      onContact: options.onDeny // maps to onDeny
    },
    options: {
      showConfirmButton: true,
      showDenyButton: Boolean(options.onContact),
      confirmButtonText: 'Mengerti',
      denyButtonText: 'Hubungi Admin',
      confirmButtonColor: meta.accent,
      denyButtonColor: '#6b7280',
      reverseButtons: true
    }
  });
}

/**
 * showSubscriptionRenewalModal → executeModal wrapper
 */
export async function showSubscriptionRenewalModal(subData = {}, plans = [], options = {}) {
  return executeModal({
    template: 'subscriptionRenewal',
    data: { subscriptionData: subData, plans },
    didOpen: (popup) => {
      // Scoped plan button listeners
      popup.querySelectorAll('.plan-btn').forEach(btn => {
        btn.addEventListener('click', () => {
          const planId = btn.dataset.planId;
          const plan = plans.find(p => p.id === planId);
          const swal = getSwalInstance();
          swal?.close();
          options.onSelectPlan?.(plan);
        });
      });
    },
    options: {
      showConfirmButton: false,
      showCancelButton: true,
      cancelButtonText: 'Batal'
    },
    hooks: { onClose: options.onClose }
  });
}

/**
 * showConfirmModal → executeModal wrapper
 */
export async function showConfirmModal(title = 'Konfirmasi', message = '', options = {}) {
  return executeModal({
    template: 'confirm',
    data: { title, message },
    hooks: {
      onConfirm: options.onConfirm,
      onClose: options.onCancel
    },
    options: {
      icon: options.icon || 'question',
      confirmButtonText: options.confirmText || 'Ya, lanjutkan',
      cancelButtonText: options.cancelText || 'Batal',
      confirmButtonColor: '#3b82f6',
      cancelButtonColor: '#6b7280',
      reverseButtons: true
    }
  });
}

/**
 * showAlertModal → executeModal wrapper
 */
export async function showAlertModal(title = 'Perhatian', message = '', options = {}) {
  return executeModal({
    template: 'alert',
    data: { title, message },
    hooks: { onClose: options.onClose },
    options: {
      icon: options.icon || 'info',
      confirmButtonText: options.buttonText || 'Mengerti',
      confirmButtonColor: '#3b82f6',
      showCancelButton: false
    }
  });
}

/**
 * showCustomModal → executeModal wrapper (BC)
 */
export async function showCustomModal(options = {}) {
  return executeModal({
    template: options.html || options.template,
    didOpen: options.didOpen,
    preConfirm: options.preConfirm,
    options: {
      title: options.title,
      confirmButtonText: options.confirmButtonText,
      cancelButtonText: options.cancelButtonText,
      showCancelButton: options.showCancelButton,
      ...options
    }
  });
}

/* ================================
   SPECIALIZED MODAL HELPERS
================================ */

/**
 * Import Modal - Now uses templates + executeModal
 */
export async function showImportModal(role = 'siswa', options = {}) {
  const { onConfirm, onCancel, onDownload } = options;

  return executeModal({
    template: ImportTemplate.generateImportHTML.bind(null, role),
    didOpen: (modal) => {
      ImportTemplate.setupImportHandlers(role, modal, {
        onDownload,
        onFileChange: () => ImportTemplate.updateConfirmButton(modal)
      });
    },
    preConfirm: () => {
      const file = document.getElementById('import-file-input')?.files?.[0];
      if (!file) return Promise.reject('Silakan pilih file untuk diimport');
      if (file.size > 5 * 1024 * 1024) return Promise.reject('File terlalu besar (max 5MB)');
      return { file, role };
    },
    options: {
      title: `Import ${['siswa','guru','mitra'][{siswa:0,guru:1,mitra:2}[role]] || 'User'} XLS`,
      confirmButtonText: 'Import Data',
      cancelButtonText: 'Batal',
      showCancelButton: true,
      allowEscapeKey: true,
      allowOutsideClick: false
    },
    hooks: {
      onConfirm,
      onClose: onCancel
    }
  });
}

/**
 * Register Modal - Now uses templates + executeModal
 */
export async function showRegisterModal(planName = 'Starter - Gratis', options = {}) {
  const planId = RegisterTemplate.inferPlanId(planName);
  
  return executeModal({
    template: RegisterTemplate.generateRegisterHTML.bind(null, planName, planId),
    didOpen: (modal) => RegisterTemplate.setupRegisterHandlers(modal),
    options: {
      title: 'Lengkapi Data Admin Sekolah',
      confirmButtonText: 'Kirim Data Pilihan Paket',
      showCancelButton: true,
      cancelButtonText: 'Batal',
      allowEscapeKey: true,
      allowOutsideClick: false
    }
    // preConfirm & hooks set by caller via wrapper
  });
}

/**
 * Renewal Register Modal
 */
export async function showRenewalRegisterModal(renewalData = {}, options = {}) {
  const selectedPlan = options.selectedPlan || {};
  const planId = selectedPlan.id || RegisterTemplate.inferPlanId(selectedPlan.name);
  const planName = `${selectedPlan.name || 'Unknown'} - ${Number(selectedPlan.price || 0) > 0 ? \`Rp ${Number(selectedPlan.price).toLocaleString('id-ID')}\` : 'Gratis'}`;

  return executeModal({
    template: RegisterTemplate.generateRenewalRegisterHTML.bind(null, planName, renewalData, planId),
    didOpen: (modal) => {
      RegisterTemplate.setupRegisterHandlers(modal, renewalData.schoolData || {});
    },
    options: {
      title: 'Perpanjangan Paket Subscription',
      confirmButtonText: 'Kirim Perpanjangan Paket',
      showCancelButton: true,
      cancelButtonText: 'Batal',
      allowEscapeKey: true,
      allowOutsideClick: false
    }
    // preConfirm & hooks handled by caller
  });
}

/* ================================
   MAIN EXPORT
================================ */

export default {
  executeModal, // Single door
  // Legacy wrappers (BC)
  showCustomModal,
  showSubscriptionModal,
  showSchoolStatusModal,
  showSubscriptionRenewalModal,
  showConfirmModal,
  showAlertModal,
  showImportModal,
  showRegisterModal,
  showRenewalRegisterModal
};

// Global export for non-module
if (typeof window !== 'undefined') {
  window.Modal = { ...window.Modal, executeModal };
}

