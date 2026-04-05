/**
 * RegisterModal Component (Refactored)
 * Reusable modal for school registration on landing page
 * Uses Modal.custom() for consistent SweetAlert2 integration
 * 
 * Usage:
 *   import { showRegisterModal } from './modals/RegisterModal.js';
 *   const result = await showRegisterModal('Starter - Gratis', {
 *     onSuccess: handleSuccess,
 *     onError: handleError
 *   });
 */

import { authApi } from '../../auth/AuthApi.js';
import AuthRouter from '../../auth/utils/AuthRouter.js';
import { showCustomModal } from '../utils/Modal.js';
import { fireToast } from '../utils/Toast.js';

/**
 * Generate registration form HTML
 * @param {string} planName - Selected plan name
 * @returns {string} HTML form content
 */
function generateRegisterHTML(planName = 'Starter - Gratis') {
  return `
    <form id="register-form" class="space-y-4">
      <div class="form-group">
        <label class="block text-sm font-medium text-gray-300 mb-2">Nama Sekolah</label>
        <input
          type="text"
          id="school-name"
          required
          placeholder="SMA Negeri 1 Jakarta"
          class="w-full px-3 py-2 bg-white/5 border border-white/20 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-blue-400"
        >
      </div>

      <div class="form-group">
        <label class="block text-sm font-medium text-gray-300 mb-2">Email Admin</label>
        <input
          type="email"
          id="school-email"
          required
          placeholder="admin@sekolah.sch.id"
          class="w-full px-3 py-2 bg-white/5 border border-white/20 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-blue-400"
        >
      </div>

      <div class="form-group">
        <label class="block text-sm font-medium text-gray-300 mb-2">No. WhatsApp</label>
        <input
          type="tel"
          id="school-phone"
          required
          placeholder="081234567890"
          class="w-full px-3 py-2 bg-white/5 border border-white/20 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-blue-400"
        >
      </div>

      <div class="form-group">
        <label class="block text-sm font-medium text-gray-300 mb-2">Paket yang dipilih</label>
        <div class="px-3 py-2 bg-blue-500/20 border border-blue-500/30 rounded-lg text-blue-300 text-sm font-500">
          <i class="fas fa-check-circle mr-2"></i>${planName}
        </div>
        <input type="hidden" id="selected-plan" value="starter">
      </div>
    </form>
  `;
}

/**
 * Show registration modal
 * @param {string} planName - Selected plan name
 * @param {Object} options - { onSuccess, onError }
 * @returns {Promise<Object>} Modal result
 */
export async function showRegisterModal(planName = 'Starter - Gratis', options = {}) {
  const {
    onSuccess = null,
    onError = null
  } = options;

  const result = await showCustomModal({
    title: 'Lengkapi Data Admin Sekolah',
    html: generateRegisterHTML(planName),
    confirmButtonText: 'Kirim Data Sekolah',
    showCancelButton: true,
    cancelButtonText: 'Batal',
    allowEscapeKey: true,
    allowOutsideClick: false,
    didOpen: (modal) => {
      setupFormValidation(modal);
    },
    preConfirm: async () => {
      const schoolName = document.getElementById('school-name')?.value;
      const email = document.getElementById('school-email')?.value;
      const phone = document.getElementById('school-phone')?.value;

      if (!schoolName) {
        return Promise.reject('Nama sekolah harus diisi');
      }
      if (!email) {
        return Promise.reject('Email harus diisi');
      }
      if (!phone) {
        return Promise.reject('No. WhatsApp harus diisi');
      }

      return {
        schoolName,
        email,
        phone,
        plan: 'starter'
      };
    }
  });

  if (result.isConfirmed && result.value) {
    await handleFormSubmit(result.value, { onSuccess, onError });
  }

  return result;
}

/**
 * Setup form validation and interactions
 * @private
 */
function setupFormValidation(modal) {
  const form = document.getElementById('register-form');
  
  if (form) {
    // Add real-time validation feedback
    const inputs = form.querySelectorAll('input[type="text"], input[type="email"], input[type="tel"]');
    
    inputs.forEach(input => {
      input.addEventListener('blur', () => {
        validateField(input);
      });

      input.addEventListener('input', () => {
        if (input.classList.contains('error')) {
          validateField(input);
        }
      });
    });
  }
}

/**
 * Validate a single form field
 * @private
 */
function validateField(input) {
  const value = input.value?.trim();
  const isValid = value && (
    input.type === 'email' 
      ? /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)
      : true
  );

  if (isValid) {
    input.classList.remove('error');
    input.classList.add('valid');
  } else {
    input.classList.add('error');
    input.classList.remove('valid');
  }
}

/**
 * Handle form submission
 * @private
 */
async function handleFormSubmit(formData, callbacks = {}) {
  const { onSuccess, onError } = callbacks;

  try {
    const result = await authApi.registerSchoolPending(formData, false);

    if (result.success) {
      // Show success toast
      fireToast({
        title: '✅ Berhasil!',
        html: result.message || 'Pendaftaran berhasil. Silakan login untuk melanjutkan.',
        icon: 'success',
        timer: 2000
      });

      if (onSuccess) {
        onSuccess('Berhasil', result.message || 'Pendaftaran berhasil.');
      }

      // Redirect to login after a short delay
      setTimeout(() => {
        AuthRouter.routeToLogin('admin-sekolah');
      }, 500);
    } else {
      const errorMsg = result.message || 'Terjadi kesalahan saat mengirim data.';
      
      fireToast({
        title: '❌ Gagal',
        html: errorMsg,
        icon: 'error',
        timer: 3000
      });

      if (onError) {
        onError('Gagal', errorMsg);
      }
    }
  } catch (error) {
    const errorMsg = 'Koneksi bermasalah. Silakan coba lagi.';
    
    fireToast({
      title: '❌ Error',
      html: errorMsg,
      icon: 'error',
      timer: 3000
    });

    if (onError) {
      onError('Error', errorMsg);
    }

    console.error('Registration error:', error);
  }
}

export default {
  showRegisterModal
};
