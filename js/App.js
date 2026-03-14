/**
 * Main Application Entry Point
 * Handles landing, login, register, Telegram, and OTP flows for user roles.
 */

import './components/utils/Toast.js';
import LandingPage from './pages/LandingPage.js';
import { TelegramLinkSection, OtpSection } from './components/auth/index.js';
import { googleAuthInstance } from './auth/GoogleAuth.js';
import AuthRouter from './auth/utils/AuthRouter.js';
import { ThemeToggle } from './components/ThemeToggle.js';
import { LoginTemplates } from './components/templates/LoginTemplates.js';
import { RegisterTemplates } from './components/templates/RegisterTemplates.js';
import { ErrorHandler } from './components/utils/ErrorHandler.js';
import { RoleFields } from './components/config/RoleFields.js';
import { RegisterHandler } from './components/utils/RegisterHandler.js';
import { OtpHandler, OtpTemplates } from './components/utils/OtpHandler.js';
import { LoginComponent } from './components/LoginComponent.js';
import { RegisterComponent } from './components/RegisterComponent.js';

const REGISTERABLE_ROLES = new Set(['siswa', 'guru', 'mitra']);

window.ThemeToggle = ThemeToggle;
window.LoginTemplates = LoginTemplates;
window.RegisterTemplates = RegisterTemplates;
window.ErrorHandler = ErrorHandler;
window.RoleFields = RoleFields;
window.RegisterHandler = RegisterHandler;
window.OtpHandler = OtpHandler;
window.OtpTemplates = OtpTemplates;
window.LoginComponent = LoginComponent;
window.RegisterComponent = RegisterComponent;
window.LandingPage = LandingPage;

class App {
  constructor() {
    this.googleAuth = googleAuthInstance;
    this.appContainer = null;
    this.loginComponent = null;
    this.registerComponent = null;
    this.otpHandler = null;
    this.pendingLoginRole = '';
    this.pendingRegisterContext = null;
  }

  async init() {
    await this.waitForToast();

    this.appContainer = document.getElementById('app');
    if (!this.appContainer) return;

    this.initComponents();
    await this.showLandingPage();
    await this.googleAuth.init();

    window.handleGoogleCredentialResponse = async (response) => {
      await this.googleAuth.handleCredentialResponse(response);
    };

    this.googleAuth.onAuthChange((user, extra) => this.handleAuthChange(user, extra));
    this.handleInitialRoute();
  }

  /**
   * Show landing page.
   */
  async showLandingPage() {
    if (!this.appContainer) return;

    this.cleanup();
    await LandingPage.init('app');
    window.showLoginSection = (options = {}) => this.showLoginSection(options);
  }

  waitForToast() {
    return new Promise((resolve) => {
      let attempts = 0;
      const check = () => {
        if (window.Toast || attempts > 50) {
          resolve();
        } else {
          attempts++;
          setTimeout(check, 100);
        }
      };
      check();
    });
  }

  normalizeLoginRole(role = '') {
    const normalizedRole = typeof role === 'string' ? role.trim().toLowerCase() : '';
    return AuthRouter.userLoginRoles.includes(normalizedRole) ? normalizedRole : '';
  }

  parseRouteState() {
    const params = new URLSearchParams(window.location.search);
    return {
      view: params.get('view') || '',
      role: this.normalizeLoginRole(params.get('role') || '')
    };
  }

  updateRouteState(view = '', role = '') {
    const url = new URL(window.location.href);

    if (view) {
      url.searchParams.set('view', view);
    } else {
      url.searchParams.delete('view');
    }

    if (role) {
      url.searchParams.set('role', role);
    } else {
      url.searchParams.delete('role');
    }

    window.history.replaceState({}, '', `${url.pathname}${url.search}${url.hash}`);
  }

  handleInitialRoute() {
    const routeState = this.parseRouteState();
    if (routeState.view === 'login') {
      this.showLoginSection({
        role: routeState.role,
        updateHistory: false
      });
    }
  }

  showLoginSection(options = {}) {
    const config = typeof options === 'string' ? { role: options } : options;
    const role = this.normalizeLoginRole(config.role || '');

    this.pendingLoginRole = role;

    if (config.updateHistory !== false) {
      this.updateRouteState('login', role);
    }

    this.cleanup();
    this.appContainer.innerHTML = this.loginComponent.render();
    this.loginComponent.initEvents();
  }

  showRegisterSection(googleUser, registerContext = {}) {
    const context = {
      role: this.pendingLoginRole,
      school: null,
      ...registerContext
    };

    this.pendingRegisterContext = context;
    this.cleanup();

    if (context.role === 'admin-sekolah' && context.school) {
      this.appContainer.innerHTML = this.registerComponent.renderAdminSchool();
    } else {
      this.appContainer.innerHTML = this.registerComponent.render();
    }

    this.registerComponent.initEvents();
    this.registerComponent.show(googleUser, {
      mode: context.role === 'admin-sekolah' && context.school ? 'admin-school' : 'standard',
      school: context.school
    });

    if (context.role !== 'admin-sekolah') {
      this.applyPreferredRegisterRole(context.role || this.pendingLoginRole);
    }
  }

  showTelegramLinkSection(extra) {
    this.cleanup();
    this.appContainer.innerHTML = this.renderAuthStage(
      TelegramLinkSection.render(extra),
      'from-sky-900 via-blue-900 to-cyan-900'
    );

    TelegramLinkSection.initEvents({
      onBack: () => this.showLoginSection({ role: this.pendingLoginRole }),
      onRefresh: async () => {
        const result = await this.googleAuth.checkTelegramLink(extra.userId);

        if (result.linked) {
          TelegramLinkSection.updateStatus('success', 'Telegram terhubung. Menyiapkan OTP...');
          this.showOtpSection({
            ...extra,
            otpId: result.otpId
          });
          return;
        }

        if (result.error) {
          TelegramLinkSection.updateStatus('error', result.error);
          return;
        }

        TelegramLinkSection.updateStatus('not_linked', 'Belum terhubung. Klik START di Telegram.');
      }
    });
  }

  showOtpSection(extra) {
    this.cleanup();
    this.appContainer.innerHTML = this.renderAuthStage(
      OtpSection.render(),
      'from-emerald-900 via-green-900 to-teal-900'
    );

    this.otpHandler.setData(extra.userId, extra.email);
    this.otpHandler.setOtpId(extra.otpId);
    this.otpHandler.initEvents({
      onSuccess: () => this.handleOtpSuccess(),
      onResend: () => {
        const input = document.getElementById('otp-code');
        if (input) input.value = '';
      }
    });

    document.getElementById('back-to-login')?.addEventListener('click', () => {
      this.showLoginSection({ role: this.pendingLoginRole });
    });
  }

  handleOtpSuccess() {
    const storedUser = window.jwtManager?.getUser?.() || null;

    if (storedUser) {
      localStorage.setItem('user', JSON.stringify(storedUser));
      AuthRouter.routeToDashboard(storedUser.role);
      return;
    }

    this.showLoginSection({ role: this.pendingLoginRole });
  }

  handleAuthChange(user, extra) {
    if (user && !extra) {
      return;
    }

    if (!extra) {
      return;
    }

    if (extra.needRegister && extra.googleUser) {
      this.showRegisterSection(extra.googleUser, extra.registerContext || { role: this.pendingLoginRole });
      return;
    }

    if (extra.needTelegramLink) {
      this.showTelegramLinkSection(extra);
      return;
    }

    if (extra.needOTPVerification) {
      this.showOtpSection(extra);
    }
  }

  initComponents() {
    this.loginComponent = new LoginComponent({
      googleAuth: this.googleAuth
    });

    this.registerComponent = new RegisterComponent({
      googleAuth: this.googleAuth,
      onSubmit: async (data) => {
        await this.googleAuth.register(data);
      },
      onCancel: () => {
        this.showLoginSection({ role: this.pendingLoginRole });
      }
    });

    this.otpHandler = new OtpHandler({
      onSuccess: () => this.handleOtpSuccess(),
      onResend: () => {
        const input = document.getElementById('otp-code');
        if (input) input.value = '';
      }
    });
  }

  applyPreferredRegisterRole(role) {
    const preferredRole = this.normalizeLoginRole(role);
    if (!REGISTERABLE_ROLES.has(preferredRole)) return;

    const roleSelect = document.getElementById('role');
    if (!roleSelect) return;

    roleSelect.value = preferredRole;
    roleSelect.dispatchEvent(new Event('change', { bubbles: true }));
  }

  renderAuthStage(content, gradientClass) {
    return `
      <div class="min-h-screen flex items-center justify-center p-4 relative overflow-hidden">
        <div class="absolute inset-0 bg-gradient-to-br ${gradientClass} opacity-60"></div>
        <div class="absolute top-1/4 left-1/4 w-96 h-96 bg-white/10 rounded-full blur-3xl animate-pulse"></div>
        <div class="absolute bottom-1/4 right-1/4 w-96 h-96 bg-white/5 rounded-full blur-3xl animate-pulse" style="animation-delay: 1s;"></div>
        <div class="relative w-full">
          ${content}
        </div>
      </div>
    `;
  }

  cleanup() {
    LandingPage.sectionObserver?.disconnect?.();
    if (this.appContainer) {
      this.appContainer.innerHTML = '';
    }
  }
}

// Init
document.addEventListener('DOMContentLoaded', async () => {
  const app = new App();
  window.App = app;
  await app.init();
});

export { App, ThemeToggle };
