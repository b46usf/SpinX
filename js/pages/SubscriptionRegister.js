/**
 * School Subscription Registration Module
 * New school registration form → pending approval flow
 * Mobile-first, integrates with LandingPage Navbar
 */

import { authApi } from '../auth/AuthApi.js';
import AuthRouter from '../auth/utils/AuthRouter.js';
import { DOMUtils } from '../core/DOMUtils.js';
import { ToastUtils } from '../core/ToastUtils.js';

class SubscriptionRegister {
  constructor(options = {}) {
    this.driveFolderId = '1KpR4CoefAn1_Wq6rk3jhXWhBwvE_-cZj';
    this.driveFolderUrl = 'https://drive.google.com/drive/folders/1KpR4CoefAn1_Wq6rk3jhXWhBwvE_-cZj?usp=sharing';
    this.containerId = options.containerId || 'subscription-register';
    this.isVisible = false;
    this.init();
  }

  init() {
    this.checkRenewalContext();
    this.bindEvents();
  }

  /**
   * Check if this is a renewal registration
   */
  checkRenewalContext() {
    try {
      const renewalData = sessionStorage.getItem('subscriptionRenewal');
      if (renewalData) {
        const renewal = JSON.parse(renewalData);
        
        // Check if renewal data is still valid (within 1 hour)
        const isValid = renewal.timestamp && (Date.now() - renewal.timestamp) < (60 * 60 * 1000);
        
        if (isValid && renewal.isRenewal && renewal.selectedPlan) {
          this.isRenewal = true;
          this.renewalData = renewal;
          
          // Update UI for renewal
          this.setupRenewalUI();
        } else {
          // Clear expired renewal data
          sessionStorage.removeItem('subscriptionRenewal');
        }
      }
    } catch (error) {
      console.warn('Failed to parse renewal context:', error);
      sessionStorage.removeItem('subscriptionRenewal');
    }
  }

  /**
   * Setup UI for renewal registration
   */
  setupRenewalUI() {
    // Update page title and description
    const titleEl = document.querySelector('.register-title');
    const descEl = document.querySelector('.register-description');
    
    if (titleEl) {
      titleEl.textContent = 'Perpanjang Subscription Sekolah';
    }
    
    if (descEl) {
      descEl.innerHTML = `
        <div class="renewal-notice">
          <i class="fas fa-info-circle text-blue-400"></i>
          <span>Perpanjang subscription untuk <strong>${this.renewalData.selectedPlan.name}</strong></span>
        </div>
      `;
    }

    // Pre-select the renewal plan
    const planSelect = document.getElementById('school-plan');
    if (planSelect && this.renewalData.selectedPlan.id) {
      planSelect.value = this.renewalData.selectedPlan.id;
      this.togglePaymentProof(this.renewalData.selectedPlan.id);
    }
  }

  /**
   * Show registration modal
   */
  show() {
    this.isVisible = true;
    DOMUtils.removeClass(this.containerId, 'hidden');
    DOMUtils.addClass(this.containerId, 'animate-slide-in');
  }

  hide() {
    this.isVisible = false;
    DOMUtils.addClass(this.containerId, 'hidden');
    DOMUtils.removeClass(this.containerId, 'animate-slide-in');
    this.resetForm();
  }

  /**
   * Toggle visibility
   */
  toggle() {
    if (this.isVisible) {
      this.hide();
    } else {
      this.show();
    }
  }

  /**
   * Bind form events
   */
  bindEvents() {
    // Form submit
    DOMUtils.bindSubmit('school-register-form', (e) => this.handleSubmit(e));

    // Close button
    DOMUtils.bindClick('close-school-register', () => this.hide());

    // Plan selector
    DOMUtils.bindChange('school-plan', (e) => this.togglePaymentProof(e.target.value));

    // Drive help link
    DOMUtils.bindClick('drive-help', (e) => {
      e.preventDefault();
      window.open(this.driveFolderUrl, '_blank');
    });
  }

  /**
   * Toggle payment proof field (non-starter plans)
   */
  togglePaymentProof(plan) {
    const isPaidPlan = plan !== 'starter';
    
    if (isPaidPlan) {
      DOMUtils.removeClass('bukti-tf-field', 'hidden');
    } else {
      DOMUtils.addClass('bukti-tf-field', 'hidden');
      DOMUtils.setValue('buktiTF_link', '');
    }
  }

  /**
   * Get form data
   */
  getFormData() {
    return {
      schoolName: DOMUtils.getValue('school-name'),
      email: DOMUtils.getValue('school-email'),
      noWa: DOMUtils.getValue('school-nowa'),
      plan: DOMUtils.getValue('school-plan', 'starter'),
      buktiTF_link: DOMUtils.getValue('buktiTF_link')
    };
  }

  /**
   * Validate form
   */
  validateForm(data) {
    const errors = [];

    if (!data.schoolName) errors.push('Nama sekolah wajib diisi');
    if (!data.email || !data.email.includes('@')) errors.push('Email tidak valid');
    if (!data.noWa || !/^\d{10,15}$/.test(data.noWa.replace(/[^0-9]/g, ''))) errors.push('No. WhatsApp tidak valid');
    
    if (data.plan !== 'starter' && !data.buktiTF_link) {
      errors.push('Bukti transfer wajib diisi untuk plan berbayar');
    }

    return {
      valid: errors.length === 0,
      errors
    };
  }

  /**
   * Handle form submit
   */
  async handleSubmit(e) {
    e.preventDefault();
    
    const data = this.getFormData();
    const validation = this.validateForm(data);
    
    if (!validation.valid) {
      ToastUtils.error('Data Tidak Lengkap', validation.errors.join(', '));
      return;
    }

    const submitBtn = e.target.querySelector('button[type=\"submit\"]');
    const originalText = submitBtn.innerHTML;
    submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin mr-2"></i>Mengirim...';
    submitBtn.disabled = true;

    try {
      let result;
      
      if (this.isRenewal) {
        // Handle renewal registration
        result = await this.handleRenewalSubmit(data);
      } else {
        // Handle regular registration
        result = await authApi.registerSchoolPending(data, false);
      }
      
      if (result.success) {
        const successMessage = this.isRenewal 
          ? 'Data perpanjangan berhasil dikirim. Admin akan memproses dalam 1-2 hari kerja.'
          : (result.message || 'Sekolah Anda sedang menunggu persetujuan admin');
          
        ToastUtils.success('Berhasil', successMessage);
        this.hide();
        
        if (!this.isRenewal) {
          window.setTimeout(() => AuthRouter.routeToLogin('admin-sekolah'), 300);
        } else {
          // For renewal, redirect to login or show success message
          window.setTimeout(() => AuthRouter.routeToLogin('admin-sekolah'), 300);
        }
      }
    } catch (error) {
      console.error('Registration failed:', error);
      ToastUtils.error('Gagal', 'Terjadi kesalahan saat mengirim data');
    } finally {
      submitBtn.innerHTML = originalText;
      submitBtn.disabled = false;
    }
  }

  /**
   * Handle renewal submission
   */
  async handleRenewalSubmit(data) {
    // For renewal, we need to include the bukti transfer file
    const buktiFile = document.getElementById('buktiTF_file')?.files[0];
    
    if (!buktiFile) {
      throw new Error('Bukti transfer harus diupload untuk perpanjangan');
    }

    // Convert file to base64
    const buktiTransferBase64 = await this.fileToBase64(buktiFile);

    const renewalData = {
      ...data,
      buktiTransfer: buktiTransferBase64,
      isRenewal: true,
      selectedPlan: this.renewalData.selectedPlan,
      previousPlan: 'starter' // Assuming renewal from starter
    };

    return await authApi.registerSchoolRenewal(renewalData);
  }

  /**
   * Convert file to base64
   */
  fileToBase64(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result);
      reader.onerror = error => reject(error);
    });
  }

  /**
   * Reset form
   */
  resetForm() {
    DOMUtils.resetForm('school-register-form');
    this.togglePaymentProof('starter');
  }
}

// Export + auto-init
export { SubscriptionRegister };

// Global access for navbar onclick
if (typeof window !== 'undefined') {
  window.SubscriptionRegister = SubscriptionRegister;
}

