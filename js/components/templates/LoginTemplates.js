/**
 * Login Form Templates
 * HTML templates for login form - compact layout
 */

import { AUTH_CONFIG } from '../../auth/Config.js';

export const LoginTemplates = {
  getClientId() {
    return AUTH_CONFIG?.CLIENT_ID || window.AUTH_CONFIG?.CLIENT_ID || '';
  },

  loginSection(options = {}) {
    const role = options.role || '';
    const roleConfig = this.getRoleConfig(role);

    return `
      <div class="min-h-screen flex items-center justify-center px-4 py-6 relative overflow-hidden">
        <div class="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(56,189,248,0.18),transparent_34%),linear-gradient(145deg,#0f172a_0%,#111827_48%,#1e1b4b_100%)]"></div>
        <div class="absolute top-[-4rem] left-1/2 h-56 w-56 -translate-x-1/2 rounded-full bg-sky-400/10 blur-3xl"></div>
        <div class="absolute bottom-[-5rem] right-[-4rem] h-64 w-64 rounded-full bg-fuchsia-500/10 blur-3xl"></div>

        <div class="relative w-full max-w-sm">
          <div class="rounded-[28px] border border-slate-700/60 bg-slate-900/85 p-5 shadow-[0_24px_80px_rgba(15,23,42,0.45)] backdrop-blur-xl animate-scale-in sm:p-6">
            <div class="mb-5 flex items-start gap-3">
              <div class="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-sky-500 via-indigo-500 to-fuchsia-500 shadow-lg shadow-sky-500/20">
                <i class="${roleConfig.icon} text-xl text-white"></i>
              </div>
              <div class="min-w-0 flex-1">
                <p class="text-[11px] font-semibold uppercase tracking-[0.24em] text-sky-300/80">${roleConfig.title}</p>
                <h1 class="mt-2 text-2xl font-semibold leading-tight text-white">
                  ${roleConfig.heading}
                </h1>
                <p class="mt-1.5 text-sm leading-6 text-slate-400">
                  ${roleConfig.description}
                </p>
              </div>
            </div>

            <div class="mb-4 grid grid-cols-2 gap-2 text-[11px] text-slate-300">
              <div class="rounded-2xl border border-white/10 bg-white/5 px-3 py-2">
                <span class="block font-semibold text-white">${roleConfig.feature1.title}</span>
                <span class="text-slate-400">${roleConfig.feature1.subtitle}</span>
              </div>
              <div class="rounded-2xl border border-white/10 bg-white/5 px-3 py-2">
                <span class="block font-semibold text-white">${roleConfig.feature2.title}</span>
                <span class="text-slate-400">${roleConfig.feature2.subtitle}</span>
              </div>
            </div>

            <div class="login-card mb-4 rounded-2xl border border-white/10 bg-white/5 p-3">
              <div id="google-login-container">
                <div id="googleLoginBtn" class="flex min-h-[44px] items-center justify-center rounded-2xl border border-white/10 bg-slate-950/40 px-3 text-sm text-slate-400">
                  Menyiapkan tombol Google...
                </div>
              </div>
            </div>

            <div id="auth-error" class="hidden mb-4 rounded-2xl border border-red-500/30 bg-red-500/10 px-3 py-2.5 text-center text-xs text-red-300"></div>

            <div class="border-t border-slate-700/60 pt-4">
              <p class="text-center text-[11px] text-slate-500">
                <i class="fas fa-shield-alt mr-1"></i>Keamanan login mengikuti akun Google Anda
              </p>
            </div>
          </div>

          <p class="mt-3 text-center text-[10px] text-slate-600">v1.0.0</p>
        </div>
      </div>
    `;
  },

  getRoleConfig(role) {
    const configs = {
      'admin-system': {
        title: 'SpinX Admin System',
        heading: 'Login Administrator Sistem',
        description: 'Masuk sebagai administrator sistem untuk mengelola sekolah, pengguna, dan sistem secara keseluruhan.',
        icon: 'fas fa-cog',
        feature1: { title: 'System Management', subtitle: 'Kelola seluruh sistem' },
        feature2: { title: 'User Oversight', subtitle: 'Pantau semua pengguna' }
      },
      'admin-sekolah': {
        title: 'SpinX Admin Sekolah',
        heading: 'Login Administrator Sekolah',
        description: 'Masuk sebagai administrator sekolah untuk mengelola siswa, guru, dan data sekolah.',
        icon: 'fas fa-school',
        feature1: { title: 'School Management', subtitle: 'Kelola data sekolah' },
        feature2: { title: 'User Management', subtitle: 'Kelola siswa & guru' }
      },
      'guru': {
        title: 'SpinX Guru',
        heading: 'Login Guru',
        description: 'Masuk sebagai guru untuk mengakses materi pembelajaran dan mengelola kelas.',
        icon: 'fas fa-chalkboard-teacher',
        feature1: { title: 'Teaching Tools', subtitle: 'Akses materi ajar' },
        feature2: { title: 'Class Management', subtitle: 'Kelola kelas & siswa' }
      },
      'siswa': {
        title: 'SpinX Siswa',
        heading: 'Login Siswa',
        description: 'Masuk sebagai siswa untuk mengakses pembelajaran dan aktivitas interaktif.',
        icon: 'fas fa-graduation-cap',
        feature1: { title: 'Learning Access', subtitle: 'Akses pembelajaran' },
        feature2: { title: 'Interactive Games', subtitle: 'Mainkan game edukatif' }
      },
      'mitra': {
        title: 'SpinX Mitra',
        heading: 'Login Mitra',
        description: 'Masuk sebagai mitra untuk mengelola program kemitraan dan kolaborasi.',
        icon: 'fas fa-handshake',
        feature1: { title: 'Partnership Management', subtitle: 'Kelola kemitraan' },
        feature2: { title: 'Collaboration Tools', subtitle: 'Alat kolaborasi' }
      },
      default: {
        title: 'SpinX Access',
        heading: 'Login ke SpinX',
        description: 'Masuk dengan Google untuk mengakses dashboard dan fitur sesuai peran Anda.',
        icon: 'fas fa-ticket',
        feature1: { title: 'Google Sign-In', subtitle: 'Satu pintu login' },
        feature2: { title: 'Role-Based Access', subtitle: 'Akses sesuai peran' }
      }
    };

    return configs[role] || configs.default;
  }
};

