/**
 * Register Form Handler
 * Handles form logic, validation, and NIS verification
 */

class RegisterHandler {
  constructor(options = {}) {
    this.googleAuth = options.googleAuth || window.googleAuth;
  }

  /**
   * Toggle fields based on role
   */
  toggleFields() {
    const role = document.getElementById('role')?.value;
    const allFields = RoleFields.getAllFields();
    const roleFields = RoleFields.getFieldsForRole(role);
    
    // Hide all role-specific fields
    allFields.forEach(fieldId => {
      const field = document.getElementById(fieldId);
      if (field) {
        field.classList.add('hidden');
      }
    });
    
    // Show fields for selected role
    roleFields.forEach(fieldId => {
      const field = document.getElementById(fieldId);
      if (field) {
        field.classList.remove('hidden');
      }
    });
  }

  /**
   * Handle NIS verification
   */
  async handleNISVerification() {
    const nis = document.getElementById('nis')?.value.trim();
    
    if (!nis) {
      this.showNISStatus('Masukkan NIS terlebih dahulu', 'error');
      return;
    }

    this.showNISStatus('Memeriksa NIS...', 'loading');

    try {
      const apiUrl = this.googleAuth?.getScriptUrl();
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'verifyNIS', nis: nis })
      });
      
      const result = await response.json();
      
      if (result.success && result.found) {
        // NIS found - auto-fill the fields
        document.getElementById('nama').value = result.nama || '';
        document.getElementById('kelas').value = result.kelas || '';
        document.getElementById('sekolah-siswa').value = result.sekolah || '';
        
        this.showNISStatus('NIS valid! Data ditemukan.', 'success');
      } else {
        this.showNISStatus(result.message || 'NIS tidak ditemukan', 'error');
      }
    } catch (error) {
      this.showNISStatus('Gagal memverifikasi NIS', 'error');
    }
  }

  /**
   * Show NIS status message
   */
  showNISStatus(message, type) {
    const statusEl = document.getElementById('nis-status');
    if (!statusEl) return;
    
    statusEl.textContent = message;
    statusEl.classList.remove('hidden');
    
    const classMap = {
      loading: 'mt-2 p-2 rounded text-sm bg-blue-500/20 text-blue-400',
      success: 'mt-2 p-2 rounded text-sm bg-green-500/20 text-green-400',
      error: 'mt-2 p-2 rounded text-sm bg-red-500/20 text-red-400'
    };
    
    statusEl.className = classMap[type] || classMap.error;
  }

  /**
   * Get form data
   */
  getFormData() {
    const getValue = (id) => {
      const el = document.getElementById(id);
      return el ? el.value.trim() : '';
    };

    const role = getValue('role');
    const noWa = getValue('noWa');
    const nis = getValue('nis');
    const nama = getValue('nama');
    const kelas = getValue('kelas');
    const sekolahSiswa = getValue('sekolah-siswa');
    const sekolah = getValue('sekolah');
    const namaMitra = getValue('namaMitra');
    const kategori = getValue('kategori');
    const alamat = getValue('alamat');

    return {
      role,
      noWa,
      nis,
      name: nama,
      kelas,
      sekolah: sekolahSiswa || sekolah,
      namaMitra,
      kategori,
      alamat
    };
  }

  /**
   * Validate form data
   */
  validateForm(data) {
    if (!data.role || !data.noWa) {
      return { valid: false, message: 'Mohon lengkapi semua data wajib' };
    }

    if (data.role === 'siswa' && !data.nis) {
      return { valid: false, message: 'Masukkan NIS untuk verifikasi' };
    }

    if (data.role === 'mitra' && (!data.namaMitra || !data.kategori || !data.alamat)) {
      return { valid: false, message: 'Mohon lengkapi data toko' };
    }

    return { valid: true };
  }

  /**
   * Show error message
   */
  showError(message) {
    const errorEl = document.getElementById('register-error');
    if (errorEl) {
      errorEl.textContent = message;
      errorEl.classList.remove('hidden');
    }
  }

  /**
   * Hide error message
   */
  hideError() {
    const errorEl = document.getElementById('register-error');
    if (errorEl) {
      errorEl.textContent = '';
      errorEl.classList.add('hidden');
    }
  }

  /**
   * Reset form
   */
  reset() {
    const form = document.getElementById('register-form');
    if (form) {
      form.reset();
    }
    this.toggleFields();
    this.hideError();
    
    // Hide NIS status
    const statusEl = document.getElementById('nis-status');
    if (statusEl) {
      statusEl.classList.add('hidden');
    }
  }

  /**
   * Initialize event listeners
   */
  initEvents(options = {}) {
    const onSubmit = options.onSubmit || (() => {});
    const onCancel = options.onCancel || (() => {});

    // Role change handler
    const roleSelect = document.getElementById('role');
    if (roleSelect) {
      roleSelect.addEventListener('change', () => this.toggleFields());
    }

    // NIS verification handler
    const verifyBtn = document.getElementById('verify-nis-btn');
    if (verifyBtn) {
      verifyBtn.addEventListener('click', () => this.handleNISVerification());
    }

    // Form submit handler
    const form = document.getElementById('register-form');
    if (form) {
      form.addEventListener('submit', (e) => {
        e.preventDefault();
        
        const formData = this.getFormData();
        const validation = this.validateForm(formData);
        
        if (!validation.valid) {
          this.showError(validation.message);
          return;
        }

        onSubmit(formData);
      });
    }

    // Cancel button handler
    const cancelBtn = document.getElementById('cancel-register');
    if (cancelBtn) {
      cancelBtn.addEventListener('click', () => {
        this.reset();
        onCancel();
      });
    }
  }
}

// Export for global use
window.RegisterHandler = RegisterHandler;

