/**
 * School Subscription Registration Module
 * New school registration form → pending approval flow
 * Mobile-first, integrates with LandingPage Navbar
 */

import { authApi } from '../auth/AuthApi.js';
import AuthRouter from '../auth/utils/AuthRouter.js';

class SubscriptionRegister {
  constructor(options = {}) {
    this.driveFolderId = '1KpR4CoefAn1_Wq6rk3jhXWhBwvE_-cZj';
    this.driveFolderUrl = 'https://drive.google.com/drive/folders/1KpR4CoefAn1_Wq6rk3jhXWhBwvE_-cZj?usp=sharing';
    this.containerId = options.containerId || 'subscription-register';
    this.isVisible = false;
    this.init();
  }

  init() {
    this.bindEvents();
  }

  /**
   * Show registration modal
   */
  show() {
    this.isVisible = true;
    const container = document.getElementById(this.containerId);
    if (container) {
      container.classList.remove('hidden');
      container.classList.add('animate-slide-in');
    }
  }

  hide() {
    this.isVisible = false;
    const container = document.getElementById(this.containerId);
    if (container) {
      container.classList.add('hidden');
      container.classList.remove('animate-slide-in');
    }
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
    const form = document.getElementById('school-register-form');
    if (form) {
      form.addEventListener('submit', (e) => this.handleSubmit(e));
    }

    // Close button
    const closeBtn = document.getElementById('close-school-register');
    if (closeBtn) {
      closeBtn.addEventListener('click', () => this.hide());
    }

    // Plan selector
    const planSelect = document.getElementById('school-plan');
    if (planSelect) {
      planSelect.addEventListener('change', (e) => this.togglePaymentProof(e.target.value));
    }

    // Drive help link
    const driveHelp = document.getElementById('drive-help');
    if (driveHelp) {
      driveHelp.addEventListener('click', (e) => {
        e.preventDefault();
        window.open(this.driveFolderUrl, '_blank');
      });
    }
  }

  /**
   * Toggle payment proof field (non-starter plans)
   */
  togglePaymentProof(plan) {
    const buktiField = document.getElementById('bukti-tf-field');
    const isPaidPlan = plan !== 'starter';
    
    if (buktiField) {
      if (isPaidPlan) {
        buktiField.classList.remove('hidden');
      } else {
        buktiField.classList.add('hidden');
        document.getElementById('buktiTF_link').value = '';
      }
    }
  }

  /**
   * Get form data
   */
  getFormData() {
    return {
      schoolName: document.getElementById('school-name')?.value.trim() || '',
      email: document.getElementById('school-email')?.value.trim() || '',
      noWa: document.getElementById('school-nowa')?.value.trim() || '',
      plan: document.getElementById('school-plan')?.value || 'starter',
      buktiTF_link: document.getElementById('buktiTF_link')?.value.trim() || ''
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
      const Toast = window.Toast;
      Toast?.error('Data Tidak Lengkap', validation.errors.join(', '));
      return;
    }

    const submitBtn = e.target.querySelector('button[type=\"submit\"]');
    const originalText = submitBtn.innerHTML;
    submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin mr-2"></i>Mengirim...';
    submitBtn.disabled = true;

    try {
      const result = await authApi.registerSchoolPending(data, false);
      
      if (result.success) {
        const Toast = window.Toast;
        Toast?.success('Pendaftaran Berhasil', result.message || 'Sekolah Anda sedang menunggu persetujuan admin');
        this.hide();
        window.setTimeout(() => AuthRouter.routeToLogin('admin-sekolah'), 300);
      }
    } catch (error) {
      console.error('Registration failed:', error);
    } finally {
      submitBtn.innerHTML = originalText;
      submitBtn.disabled = false;
    }
  }

  /**
   * Reset form
   */
  resetForm() {
    const form = document.getElementById('school-register-form');
    if (form) form.reset();
    this.togglePaymentProof('starter');
  }
}

// Export + auto-init
export { SubscriptionRegister };

// Global access for navbar onclick
if (typeof window !== 'undefined') {
  window.SubscriptionRegister = SubscriptionRegister;
}

