/**
 * Modal Utilities - Safe helpers & constants
 * Pure functions for sanitization, formatting, theme detection
 * Extracted from Modal.js for DRY & separation of concerns
 */

import { ensureSwalInstance } from './Toast.js';

/* ================================
   CONSTANTS & CONFIGURATIONS
================================ */

/**
 * Default modal configuration - immutable and safe
 */
export const MODAL_DEFAULTS = Object.freeze({
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
export const STATUS_META = Object.freeze({
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
export const getModalTheme = () => {
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
export const sanitizeHtml = (text) => {
  if (typeof text !== 'string') return '';
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
};

/**
 * Format date to Indonesian locale safely
 */
export const formatDateID = (date) => {
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
export const getStatusMeta = (statusKey) => {
  return STATUS_META[statusKey] || STATUS_META.inactive;
};

/**
 * Load modal CSS if not loaded (single execution)
 */
export function loadModalCSS() {
  const linkId = 'modal-css-link';
  if (document.getElementById(linkId)) return;

  const link = document.createElement('link');
  link.id = linkId;
  link.rel = 'stylesheet';
  link.href = '../css/modals.css'; // Relative to FE/js/components/
  document.head.appendChild(link);
}

/**
 * Ensure Swal instance available
 */
export const getSwalInstance = ensureSwalInstance;
