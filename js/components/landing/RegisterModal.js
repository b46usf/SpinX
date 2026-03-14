/**
 * Register Modal Component
 * Updated to match the refreshed landing page design.
 */

import { authApi } from '../../auth/AuthApi.js';
import AuthRouter from '../../auth/utils/AuthRouter.js';

export const RegisterModal = {
  render: (planName = 'Starter - Gratis') => `
    <div id="register-modal" class="landing-modal hidden">
      <button
        class="landing-modal__backdrop"
        aria-label="Tutup modal"
        onclick="window.LandingPage.closeRegisterModal()"
      ></button>

      <div class="landing-modal__dialog">
        <div class="landing-modal__panel animate-scale-in">
          <div class="landing-modal__header">
            <div>
              <span class="landing-eyebrow">
                <span class="landing-eyebrow__dot"></span>
                Tinggal satu langkah menuju aktivasi
              </span>
              <h3>Lengkapi data admin sekolah</h3>
              <p>Isi data berikut, nanti tim kami bantu lanjutkan proses aktivasinya.</p>
            </div>

            <button
              class="landing-modal__close"
              aria-label="Tutup modal"
              onclick="window.LandingPage.closeRegisterModal()"
            >
              <i class="fas fa-times"></i>
            </button>
          </div>

          <form id="register-form" class="landing-form">
            <label class="landing-field">
              <span>Nama Sekolah</span>
              <input
                type="text"
                id="school-name"
                required
                placeholder="SMA Negeri 1 Jakarta"
              >
            </label>

            <label class="landing-field">
              <span>Email Admin</span>
              <input
                type="email"
                id="school-email"
                required
                placeholder="admin@sekolah.sch.id"
              >
            </label>

            <label class="landing-field">
              <span>No. WhatsApp</span>
              <input
                type="tel"
                id="school-phone"
                required
                placeholder="081234567890"
              >
            </label>

            <div class="landing-field">
              <span>Paket yang dipilih</span>
              <div id="selected-plan-badge" class="landing-chip">${planName}</div>
              <input type="hidden" id="selected-plan" value="starter">
            </div>

            <button type="submit" class="landing-btn landing-btn--primary landing-btn--block">
              <i class="fas fa-paper-plane"></i>
              <span>Kirim Data Sekolah</span>
            </button>
          </form>
        </div>
      </div>
    </div>
  `,

  initEvents: (callbacks = {}) => {
    const form = document.getElementById('register-form');
    if (!form) return;

    form.addEventListener('submit', async (event) => {
      event.preventDefault();

      const submitBtn = form.querySelector('button[type="submit"]');
      const data = {
        schoolName: document.getElementById('school-name').value,
        email: document.getElementById('school-email').value,
        noWa: document.getElementById('school-phone').value,
        plan: document.getElementById('selected-plan').value
      };

      try {
        if (submitBtn) {
          submitBtn.disabled = true;
          submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i><span>Mengirim data...</span>';
        }

        const result = await authApi.registerSchoolPending(data, false);

        if (result.success) {
          if (callbacks.onSuccess) {
            callbacks.onSuccess('Berhasil', result.message || 'Pendaftaran berhasil.');
          }
          window.LandingPage.closeRegisterModal();
          form.reset();
          window.setTimeout(() => AuthRouter.routeToLogin('admin-sekolah'), 300);
        } else if (callbacks.onError) {
          callbacks.onError('Gagal', result.message || 'Terjadi kesalahan saat mengirim data.');
        }
      } catch (error) {
        if (callbacks.onError) {
          callbacks.onError('Error', 'Koneksi bermasalah. Silakan coba lagi.');
        }
      } finally {
        if (submitBtn) {
          submitBtn.disabled = false;
          submitBtn.innerHTML = '<i class="fas fa-paper-plane"></i><span>Kirim Data Sekolah</span>';
        }
      }
    });
  }
};

export default RegisterModal;
