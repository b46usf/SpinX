/**
 * Toast Utilities - Centralized toast management
 * Reduces duplication across components
 */

import { showSuccess, showError, showWarning, showInfo } from '../components/utils/Toast.js';

export const ToastUtils = {
  /**
   * Show success toast
   */
  success(title, message) {
    showSuccess(title, message);
  },

  /**
   * Show error toast
   */
  error(title, message) {
    showError(title, message);
  },

  /**
   * Show warning toast
   */
  warning(title, message) {
    showWarning(title, message);
  },

  /**
   * Show info toast
   */
  info(title, message) {
    showInfo(title, message);
  },

  /**
   * Show loading toast
   */
  loading(message) {
    // Assuming Toast.js has loading functionality
    if (window.Toast && window.Toast.loading) {
      window.Toast.loading(message);
    }
  },

  /**
   * Close loading toast
   */
  closeLoading() {
    if (window.Toast && window.Toast.closeLoading) {
      window.Toast.closeLoading();
    }
  }
};

// Legacy alias for backward compatibility
export const getToast = () => window.Toast || null;