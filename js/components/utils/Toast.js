/**
 * Toast Notification Module
 * Shared SweetAlert2-backed toast API for all pages.
 *
 * Note: SweetAlert2 is loaded via CDN script tag in each HTML entry.
 */

const getSwalInstance = () => {
  if (typeof window === 'undefined') return null;
  return window.SweetAlert2 || window.Swal || null;
};

const ensureSwalInstance = () => {
  const swal = getSwalInstance();

  if (!swal) {
    throw new Error('SweetAlert2 is not loaded. Load the CDN script before Toast.js.');
  }

  return swal;
};

// Export these for Modal.js and other components
export { ensureSwalInstance, getSwalInstance };

if (typeof document !== 'undefined' && !document.getElementById('swal-above-import-style')) {
  const style = document.createElement('style');
  style.id = 'swal-above-import-style';
  style.textContent = '.swal2-container.swal-above-import{z-index:20050 !important;}';
  document.head.appendChild(style);
}

const ToastDefaults = {
  confirmButtonColor: '#3b82f6',
  cancelButtonColor: '#6b7280',
  background: '#1f2937',
  color: '#f3f4f6',
  confirmButtonText: 'OK',
  cancelButtonText: 'Batal',
  allowOutsideClick: false,
  allowEscapeKey: true,
  showClass: {
    popup: 'animate__animated animate__fadeIn animate__faster'
  },
  hideClass: {
    popup: 'animate__animated animate__fadeOut animate__faster'
  },
  customClass: {
    container: 'swal-above-import'
  }
};

function fireToast(options = {}) {
  const swal = ensureSwalInstance();
  return swal.fire({
    ...ToastDefaults,
    ...options
  });
}

// Export for Modal.js
export { fireToast };

/**
 * Show success toast
 * @param {string} title - Title message
 * @param {string} message - Optional description message
 * @param {number} duration - Duration in milliseconds (default: 3000)
 */
export async function showSuccess(title, message = '', duration = 3000) {
  return fireToast({
    icon: 'success',
    title,
    text: message,
    timer: duration,
    toast: message === '',
    showConfirmButton: message !== '',
    timerProgressBar: duration > 0
  });
}

/**
 * Show error toast
 * @param {string} title - Title message
 * @param {string} message - Optional description message
 */
export async function showError(title, message = '') {
  return fireToast({
    icon: 'error',
    title,
    text: message,
    confirmButtonColor: '#ef4444'
  });
}

/**
 * Show warning toast
 * @param {string} title - Title message
 * @param {string} message - Optional description message
 */
export async function showWarning(title, message = '') {
  return fireToast({
    icon: 'warning',
    title,
    text: message,
    confirmButtonColor: '#f59e0b'
  });
}

/**
 * Show info toast
 * @param {string} title - Title message
 * @param {string} message - Optional description message
 * @param {number} duration - Duration in milliseconds (default: 0 = no auto-close)
 */
export async function showInfo(title, message = '', duration = 0) {
  return fireToast({
    icon: 'info',
    title,
    text: message,
    timer: duration,
    timerProgressBar: duration > 0,
    showConfirmButton: duration === 0,
    toast: message === '' && duration > 0
  });
}

/**
 * Show loading/processing toast
 * @param {string} message - Loading message
 * @returns {Promise} - Swal fire promise
 */
export function showLoading(message = 'Memproses...') {
  const swal = ensureSwalInstance();

  return fireToast({
    title: message,
    allowOutsideClick: false,
    timer: 15000, // Auto close after 15 seconds
    timerProgressBar: true,
    customClass: {
      container: 'swal-above-import',
      popup: 'swal-loading-popup'
    },
    didOpen: () => {
      swal.showLoading();
    }
  });
}

/**
 * Close loading toast
 */
export function closeLoading() {
  const swal = getSwalInstance();
  if (!swal) return;

  const isLoading = typeof swal.isLoading === 'function' ? swal.isLoading() : false;
  const popup = typeof swal.getPopup === 'function' ? swal.getPopup() : null;
  const hasLoadingPopup = Boolean(popup && popup.classList.contains('swal-loading-popup'));

  if (isLoading || hasLoadingPopup) {
    swal.close();
  }
}

/**
 * Show confirmation dialog
 * @param {string} title - Title message
 * @param {string} message - Optional description message
 * @param {string} confirmText - Confirm button text
 * @param {string} cancelText - Cancel button text
 * @param {string} icon - Icon type: 'warning', 'info', 'error', 'success'
 * @returns {Promise<boolean>} - True if confirmed, false if cancelled
 */
export async function showConfirm(
  title, 
  message = '', 
  confirmText = 'Ya, lanjutkan',
  cancelText = 'Batal',
  icon = 'warning'
) {
  const result = await fireToast({
    icon: icon,
    title,
    text: message,
    showCancelButton: true,
    confirmButtonText: confirmText,
    cancelButtonText: cancelText,
    reverseButtons: true
  });
  
  return result.isConfirmed;
}

/**
 * Show input dialog (for simple text input)
 * @param {string} title - Title message
 * @param {string} message - Optional description message
 * @param {string} placeholder - Input placeholder
 * @returns {Promise<string|null>} - Input value or null if cancelled
 */
export async function showInput(title, message = '', placeholder = '') {
  const result = await fireToast({
    title,
    text: message,
    input: 'text',
    inputPlaceholder: placeholder,
    showCancelButton: true,
    confirmButtonText: 'OK',
    inputValidator: (value) => {
      if (!value) {
        return 'Mohon isi input tersebut!';
      }
      return null;
    }
  });
  
  return result.isConfirmed ? result.value : null;
}

/**
 * Generic toast entry point for reusable component-style usage.
 * @param {'success'|'error'|'warning'|'info'|'loading'} type
 * @param {string} title
 * @param {string} message
 * @param {number} duration
 */
export function showToast(type = 'info', title = '', message = '', duration) {
  switch (type) {
    case 'success':
      return showSuccess(title, message, typeof duration === 'number' ? duration : 3000);
    case 'error':
      return showError(title, message);
    case 'warning':
      return showWarning(title, message);
    case 'loading':
      return showLoading(title || message || 'Memproses...');
    case 'info':
    default:
      return showInfo(title, message, typeof duration === 'number' ? duration : 0);
  }
}

const ToastApi = {
  success: showSuccess,
  error: showError,
  warning: showWarning,
  info: showInfo,
  loading: showLoading,
  closeLoading,
  confirm: showConfirm,
  input: showInput,
  show: showToast,
  fire: fireToast,
  get Swal() {
    return getSwalInstance();
  }
};

// Export default configuration
export const toastConfig = ToastDefaults;

// Export Swal for direct access if needed
export const SwalExport = getSwalInstance();

// Also expose to window for non-module scripts
if (typeof window !== 'undefined') {
  window.Toast = ToastApi;
}

export default ToastApi;
