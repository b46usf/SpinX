/**
 * Toast Notification Module
 * Wrapper for SweetAlert2 with customized defaults
 * SINGLE SOURCE - Import this for all toast notifications
 * 
 * Note: SweetAlert2 is loaded via CDN script tag in index.html
 * We access it via the global Swal object
 */

// Access SweetAlert2 from global (loaded via CDN in index.html)
const Swal = window.SweetAlert2 || window.Swal;

// Configure SweetAlert2 defaults
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
  }
};

/**
 * Show success toast
 * @param {string} title - Title message
 * @param {string} message - Optional description message
 * @param {number} duration - Duration in milliseconds (default: 3000)
 */
export async function showSuccess(title, message = '', duration = 3000) {
  return Swal.fire({
    ...ToastDefaults,
    icon: 'success',
    title: title,
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
  return Swal.fire({
    ...ToastDefaults,
    icon: 'error',
    title: title,
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
  return Swal.fire({
    ...ToastDefaults,
    icon: 'warning',
    title: title,
    text: message,
    confirmButtonColor: '#f59e0b'
  });
}

/**
 * Show info toast
 * @param {string} title - Title message
 * @param {string} message - Optional description message
 */
export async function showInfo(title, message = '') {
  return Swal.fire({
    ...ToastDefaults,
    icon: 'info',
    title: title,
    text: message
  });
}

/**
 * Show loading/processing toast
 * @param {string} message - Loading message
 * @returns {Promise} - Swal fire promise
 */
export function showLoading(message = 'Memproses...') {
  return Swal.fire({
    ...ToastDefaults,
    title: message,
    allowOutsideClick: false,
    timer: 15000, // Auto close after 15 seconds
    timerProgressBar: true,
    didOpen: () => {
      Swal.showLoading();
    }
  });
}

/**
 * Close loading toast
 */
export function closeLoading() {
  Swal.close();
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
  const result = await Swal.fire({
    ...ToastDefaults,
    icon: icon,
    title: title,
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
  const result = await Swal.fire({
    ...ToastDefaults,
    title: title,
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

// Export default configuration
export const toastConfig = ToastDefaults;

// Export Swal for direct access if needed (check if Swal is available)
export const SwalExport = Swal || window.Swal;

// Also expose to window for non-module scripts
if (typeof window !== 'undefined') {
  window.Toast = {
    success: showSuccess,
    error: showError,
    warning: showWarning,
    info: showInfo,
    loading: showLoading,
    closeLoading: closeLoading,
    confirm: showConfirm,
    input: showInput,
    Swal: Swal || window.Swal
  };
}

