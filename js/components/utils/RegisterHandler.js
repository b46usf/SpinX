
/**
 * Register Form Handler
 * Handles form logic, validation, and NIS verification
 */

import { RoleFields } from '../config/RoleFields.js';
import { ErrorHandler } from '../utils/ErrorHandler.js';

export class RegisterHandler {
  constructor(options = {}) {
    this.googleAuth = options.googleAuth || window.GoogleAuth;
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
  }

  async handleNISVerification() {
    const nis = document.getElementById('nis')?.value.trim();
    if (!nis) { this.showNISStatus('Masukkan NIS terlebih dahulu', 'error'); return; }

    this.showNISStatus('Memeriksa NIS...', 'loading');

    try {
      const response = await fetch(this.googleAuth?.getScriptUrl(), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'verifyNIS', nis })
      });
      const result = await response.json();
      
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
    return {
      role: get('role'),
      noWa: get('noWa'),
      nis: get('nis'),
      name: get('nama'),
      kelas: get('kelas'),
      sekolah: get('sekolah-siswa') || get('sekolah'),
      namaMitra: get('namaMitra'),
      kategori: get('kategori'),
      alamat: get('alamat')
    };
  }

  validateForm(data) {
    if (!data.role || !data.noWa) return { valid: false, message: 'Mohon lengkapi semua data wajib' };
    if (data.role === 'siswa' && !data.nis) return { valid: false, message: 'Masukkan NIS untuk verifikasi' };
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
    const statusEl = document.getElementById('nis-status');
    if (statusEl) statusEl.classList.add('hidden');
  }

  initEvents(options = {}) {
    const onSubmit = options.onSubmit || (() => {});
    const onCancel = options.onCancel || (() => {});

    document.getElementById('role')?.addEventListener('change', () => this.toggleFields());
    document.getElementById('verify-nis-btn')?.addEventListener('click', () => this.handleNISVerification());
    
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


