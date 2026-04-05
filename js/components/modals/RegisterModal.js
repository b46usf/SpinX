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
 * Show renewal registration modal for expired subscriptions
 * @param {Object} renewalData - Renewal context data
 * @param {Object} options - Modal options
 */
export async function showRenewalRegisterModal(renewalData = {}, options = {}) {
  const {
    selectedPlan = {},
    onSuccess = null,
    onError = null
  } = options;

  const planName = `${selectedPlan.name || 'Unknown'} - ${selectedPlan.price ? `Rp ${selectedPlan.price.toLocaleString('id-ID')}` : 'N/A'}`;

  const result = await showCustomModal({
    title: 'Perpanjangan Paket Subscription',
    html: generateRenewalRegisterHTML(planName, renewalData),
    confirmButtonText: 'Kirim Perpanjangan Paket',
    showCancelButton: true,
    cancelButtonText: 'Batal',
    allowEscapeKey: true,
    allowOutsideClick: false,
    didOpen: (modal) => {
      setupFormValidation(modal);
      // Pre-fill form if we have school data
      if (renewalData.schoolData) {
        prefillRenewalForm(renewalData.schoolData);
      }
    },
    preConfirm: async () => {
      const schoolName = document.getElementById('school-name')?.value;
      const email = document.getElementById('school-email')?.value;
      const phone = document.getElementById('school-phone')?.value;
      const buktiTransfer = document.getElementById('bukti-transfer')?.files[0];

      if (!schoolName) {
        return Promise.reject('Nama sekolah harus diisi');
      }
      if (!email) {
        return Promise.reject('Email harus diisi');
      }
      if (!phone) {
        return Promise.reject('No. WhatsApp harus diisi');
      }
      if (!buktiTransfer) {
        return Promise.reject('Bukti transfer harus diupload');
      }

      return {
        schoolName,
        email,
        phone,
        plan: selectedPlan.id || 'unknown',
        buktiTransfer,
        isRenewal: true,
        previousPlan: renewalData.currentPlan
      };
    }
  });

  if (result.isConfirmed && result.value) {
    await handleRenewalSubmit(result.value, { onSuccess, onError });
  }

  return result;
}

/**
 * Generate renewal registration form HTML
 * @param {string} planName - Selected plan name
 * @param {Object} renewalData - Renewal context
 * @returns {string} HTML form content
 */
function generateRenewalRegisterHTML(planName = 'Unknown Plan', renewalData = {}) {
  return `
    <div class="renewal-notice">
      <div class="notice-icon">
        <i class="fas fa-sync-alt"></i>
      </div>
      <div class="notice-text">
        <h4>Perpanjang Subscription</h4>
        <p>Plan sebelumnya: <strong>${renewalData.currentPlan || 'Unknown'}</strong></p>
        <p>Plan baru: <strong>${planName}</strong></p>
      </div>
    </div>

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
        <label class="block text-sm font-medium text-gray-300 mb-2">Bukti Transfer</label>
        <input
          type="file"
          id="bukti-transfer"
          accept="image/*,.pdf"
          required
          class="w-full px-3 py-2 bg-white/5 border border-white/20 rounded-lg text-white file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-blue-600 file:text-white hover:file:bg-blue-700"
        >
        <p class="text-xs text-gray-400 mt-1">Upload bukti transfer pembayaran perpanjangan.
        Transfer ke BCA 3250883497 a.n. Bagus Farouktiawan.</p>
      </div>
    </form>
  `;
}

/**
 * Pre-fill renewal form with existing school data
 * @param {Object} schoolData - Existing school data
 */
function prefillRenewalForm(schoolData) {
  if (schoolData.schoolName) {
    const nameInput = document.getElementById('school-name');
    if (nameInput) nameInput.value = schoolData.schoolName;
  }

  if (schoolData.email) {
    const emailInput = document.getElementById('school-email');
    if (emailInput) emailInput.value = schoolData.email;
  }

  if (schoolData.noWa) {
    const phoneInput = document.getElementById('school-phone');
    if (phoneInput) phoneInput.value = schoolData.noWa;
  }
}

/**
 * Handle renewal form submission
 * @param {Object} formData - Form data
 * @param {Object} options - Submit options
 */
async function handleRenewalSubmit(formData, options = {}) {
  const { onSuccess, onError } = options;

  try {
    fireToast('info', 'Memproses perpanjangan...', 'Mohon tunggu sebentar');

    // Convert file to base64 for upload
    const buktiTransferBase64 = await fileToBase64(formData.buktiTransfer);

    const registerData = {
      schoolName: formData.schoolName,
      email: formData.email,
      phone: formData.phone,
      plan: formData.plan,
      buktiTransfer: buktiTransferBase64,
      isRenewal: true,
      previousPlan: formData.previousPlan
    };

    const result = await authApi.registerSchoolRenewal(registerData);

    if (result.success) {
      fireToast('success', 'Berhasil!', 'Data perpanjangan telah dikirim. Admin akan memproses dalam 1-2 hari kerja.');

      // Clear renewal context
      sessionStorage.removeItem('subscriptionRenewal');

      if (onSuccess) {
        onSuccess(result);
      }
    } else {
      throw new Error(result.message || 'Pendaftaran gagal');
    }
  } catch (error) {
    console.error('Renewal registration error:', error);
    fireToast('error', 'Gagal', error.message || 'Terjadi kesalahan saat mengirim data');

    if (onError) {
      onError(error);
    }
  }
}

/**
 * Convert file to base64
 * @param {File} file - File to convert
 * @returns {Promise<string>} Base64 string
 */
function fileToBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result);
    reader.onerror = error => reject(error);
  });
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
  showRegisterModal,
  showRenewalRegisterModal
};
