
/**
 * Register Form Handler
 * Handles form logic, validation, and NIS verification
 */

import { RoleFields } from '../config/RoleFields.js';
import { ErrorHandler } from '../utils/ErrorHandler.js';
import { authApi } from '../../auth/AuthApi.js';

export class RegisterHandler {
  constructor(options = {}) {
    this.googleAuth = options.googleAuth || window.GoogleAuth;
    this.kelasLoaded = false;
  }

  toggleFields() {
    const role = document.getElementById('role')?.value;
    const allFields = RoleFields.getAllFields();
    const roleFields = RoleFields.getFieldsForRole(role);
    
    allFields.forEach(fieldId => {
      const field = document.getElementById(fieldId);
      if (field) field.classList.add('hidden');
    });
    
    roleFields.forEach(fieldId => {
      const field = document.getElementById(fieldId);
      if (field) field.classList.remove('hidden');
    });

    // Load kelas options when guru role is selected
    if (role === 'guru' && !this.kelasLoaded) {
      this.loadKelasOptions();
    }
  }

  async loadKelasOptions() {
    const selectEl = document.getElementById('kelas-guru');
    if (!selectEl) return;

    try {
      const result = await authApi.getUniqueKelas();
      
      if (result.success && result.kelas) {
        // Clear existing options except first
        selectEl.innerHTML = '<option value="">Pilih kelas...</option>';
        
        // Add unique kelas options
        result.kelas.forEach(kelas => {
          const option = document.createElement('option');
          option.value = kelas;
          option.textContent = kelas;
          selectEl.appendChild(option);
        });

        // Add "Bukan Walas" option
        const bukanWalasOption = document.createElement('option');
        bukanWalasOption.value = '-';
        bukanWalasOption.textContent = 'Bukan Walas';
        selectEl.appendChild(bukanWalasOption);

        this.kelasLoaded = true;
      }
    } catch (error) {
      console.error('Failed to load kelas options:', error);
    }
  }

  async handleKodeGuruVerification() {
    const kodeGuru = document.getElementById('kode-guru')?.value.trim();
    if (!kodeGuru) { this.showKodeGuruStatus('Masukkan Kode Guru terlebih dahulu', 'error'); return; }

    this.showKodeGuruStatus('Memeriksa Kode Guru...', 'loading');

    try {
      const result = await authApi.verifyKodeGuru(kodeGuru);
      
      if (result.success && result.found) {
        document.getElementById('nama').value = result.nama || '';
        this.showKodeGuruStatus('Kode Guru valid! Data ditemukan.', 'success');
      } else {
        this.showKodeGuruStatus(result.message || 'Kode Guru tidak ditemukan', 'error');
      }
    } catch (error) {
      this.showKodeGuruStatus('Gagal memverifikasi Kode Guru', 'error');
    }
  }

  async handleKelasChange() {
    const kelasSelect = document.getElementById('kelas-guru');
    const sekolahInput = document.getElementById('sekolah-guru');
    
    if (!kelasSelect || !sekolahInput) return;

    const selectedKelas = kelasSelect.value;

    if (!selectedKelas) {
      sekolahInput.value = '';
      return;
    }

    // If "Bukan Walas" is selected
    if (selectedKelas === '-') {
      sekolahInput.value = '-';
      return;
    }

    // Get sekolah by kelas
    try {
      const result = await authApi.getSekolahByKelas(selectedKelas);
      
      if (result.success) {
        sekolahInput.value = result.sekolah || '';
      } else {
        sekolahInput.value = '';
      }
    } catch (error) {
      console.error('Failed to get sekolah:', error);
      sekolahInput.value = '';
    }
  }

  showKodeGuruStatus(message, type) {
    const statusEl = document.getElementById('kode-guru-status');
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

  async handleNISVerification() {
    const nis = document.getElementById('nis')?.value.trim();
    if (!nis) { this.showNISStatus('Masukkan NIS terlebih dahulu', 'error'); return; }

    this.showNISStatus('Memeriksa NIS...', 'loading');

    try {
      // Use AuthApi for NIS verification - single source of truth
      const result = await authApi.verifyNIS(nis);
      
      if (result.success && result.found) {
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

  getFormData() {
    const get = (id) => document.getElementById(id)?.value.trim() || '';
    const role = get('role');
    
    // For guru, get from different field IDs
    const kelasGuru = role === 'guru' ? get('kelas-guru') : '';
    const sekolahGuru = role === 'guru' ? get('sekolah-guru') : '';
    
    // For admin roles, kelas and sekolah are handled specially
    const isAdminSystem = role === 'admin-system';
    const isAdminSchool = role === 'admin-sekolah';
    
    return {
      role: role,
      noWa: get('noWa'),
      nis: get('nis'),
      kodeGuru: get('kode-guru'),
      name: get('nama'),
      kelas: (isAdminSystem || isAdminSchool) ? '-' : (role === 'guru' ? kelasGuru : get('kelas')),
      sekolah: isAdminSystem
        ? '-'
        : (isAdminSchool
          ? get('school-id')
          : (role === 'guru' ? sekolahGuru : (get('sekolah-siswa') || get('sekolah')))),
      namaMitra: get('namaMitra'),
      kategori: get('kategori'),
      alamat: get('alamat')
    };
  }

  validateForm(data) {
    if (!data.role || !data.noWa) return { valid: false, message: 'Mohon lengkapi semua data wajib' };
    // Admin system requires name
    if (data.role === 'admin-system' && !data.name) return { valid: false, message: 'Masukkan nama lengkap' };
    if (data.role === 'admin-sekolah' && !data.name) return { valid: false, message: 'Masukkan nama lengkap admin sekolah' };
    if (data.role === 'admin-sekolah' && !data.sekolah) return { valid: false, message: 'Data sekolah tidak ditemukan. Silakan login ulang.' };
    if (data.role === 'siswa' && !data.nis) return { valid: false, message: 'Masukkan NIS untuk verifikasi' };
    if (data.role === 'guru' && !data.kodeGuru) return { valid: false, message: 'Masukkan Kode Guru untuk verifikasi' };
    if (data.role === 'guru' && !data.kelas) return { valid: false, message: 'Pilih kelas (Wali Kelas) atau "Bukan Walas"' };
    if (data.role === 'mitra' && (!data.namaMitra || !data.kategori || !data.alamat)) return { valid: false, message: 'Mohon lengkapi data toko' };
    return { valid: true };
  }

  showError(message) { ErrorHandler.showRegisterError(message); }
  hideError() { ErrorHandler.hideRegisterError(); }

  reset() {
    const form = document.getElementById('register-form');
    if (form) form.reset();
    this.toggleFields();
    this.hideError();
    
    // Reset NIS status
    const nisStatusEl = document.getElementById('nis-status');
    if (nisStatusEl) nisStatusEl.classList.add('hidden');
    
    // Reset kode guru status
    const kodeGuruStatusEl = document.getElementById('kode-guru-status');
    if (kodeGuruStatusEl) kodeGuruStatusEl.classList.add('hidden');
    
    // Reset kelas loaded flag (will reload on next guru selection)
    this.kelasLoaded = false;
  }

  initEvents(options = {}) {
    const onSubmit = options.onSubmit || (() => {});
    const onCancel = options.onCancel || (() => {});

    document.getElementById('role')?.addEventListener('change', () => this.toggleFields());
    document.getElementById('verify-nis-btn')?.addEventListener('click', () => this.handleNISVerification());
    document.getElementById('verify-kode-guru-btn')?.addEventListener('click', () => this.handleKodeGuruVerification());
    document.getElementById('kelas-guru')?.addEventListener('change', () => this.handleKelasChange());
    
    document.getElementById('register-form')?.addEventListener('submit', (e) => {
      e.preventDefault();
      const formData = this.getFormData();
      const validation = this.validateForm(formData);
      if (!validation.valid) { this.showError(validation.message); return; }
      onSubmit(formData);
    });

    document.getElementById('cancel-register')?.addEventListener('click', () => { this.reset(); onCancel(); });
  }
}


