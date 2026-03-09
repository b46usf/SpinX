/**
 * Siswa Dashboard Module
 * Modular dashboard logic for siswa/student role
 * Clean, DRY, best practice
 * Contains game logic (spin wheel)
 */

import { authGuard } from '../core/AuthGuard.js';
import { themeManager } from '../core/ThemeManager.js';
import { authApi } from '../auth/AuthApi.js';

/**
 * Wheel Configuration
 * Centralized wheel settings - easy to modify
 */
const WHEEL_CONFIG = {
  size: 300,
  slices: [
    'ZONK', 'ZONK', 'ZONK',
    'DISC5',
    'ZONK',
    'DISC10',
    'ZONK',
    'DISC15',
    'ZONK',
    'DISC20'
  ],
  colors: [
    '#ef4444', '#f97316', '#eab308', '#22c55e',
    '#3b82f6', '#6366f1', '#a855f7', '#ec4899',
    '#14b8a6', '#64748b'
  ]
};

/**
 * Game State
 * Manages current game state
 */
const gameState = {
  spinning: false,
  canvas: null,
  ctx: null
};

class SiswaDashboard {
  constructor() {
    this.customerId = null;
  }

  /**
   * Initialize siswa dashboard
   */
  init() {
    // Auth protection
    if (!authGuard.init('siswa', {
      avatarId: 'user-avatar',
      nameId: 'user-name',
      welcomeId: 'welcome-name',
      logoutId: 'logout-btn'
    })) {
      return;
    }

    // Initialize theme
    themeManager.init();

    // Load saved WA
    this.loadSavedWa();

    // Initialize game
    this.initGame();

    // Load user data
    this.loadUserData();
  }

  /**
   * Load saved WhatsApp number
   */
  loadSavedWa() {
    const savedWa = localStorage.getItem('wa');
    const waInput = document.getElementById('wa');
    if (waInput && savedWa) {
      waInput.value = savedWa;
    }
  }

  /**
   * Get or create customer ID
   */
  getCustomerId() {
    if (this.customerId) return this.customerId;

    let cid = localStorage.getItem('cid');
    if (!cid) {
      cid = 'CUST-' + Math.random().toString(36).substring(2, 8);
      localStorage.setItem('cid', cid);
    }
    this.customerId = cid;
    return cid;
  }

  /**
   * Initialize game components
   */
  initGame() {
    gameState.canvas = document.getElementById('wheel');
    if (gameState.canvas) {
      gameState.ctx = gameState.canvas.getContext('2d');
      this.drawWheel();
    }
  }

  /**
   * Draw the wheel
   */
  drawWheel() {
    const ctx = gameState.ctx;
    if (!ctx) return;

    const size = WHEEL_CONFIG.size;
    const slices = WHEEL_CONFIG.slices;
    const center = size / 2;
    const arc = (Math.PI * 2) / slices.length;

    ctx.clearRect(0, 0, size, size);

    slices.forEach((slice, i) => {
      const start = i * arc;
      const end = start + arc;

      ctx.beginPath();
      ctx.moveTo(center, center);
      ctx.arc(center, center, center, start, end);

      ctx.fillStyle = WHEEL_CONFIG.colors[i];
      ctx.fill();

      ctx.strokeStyle = '#fff';
      ctx.stroke();

      ctx.save();
      ctx.translate(center, center);
      ctx.rotate(start + arc / 2);

      ctx.textAlign = 'right';
      ctx.fillStyle = 'white';
      ctx.font = 'bold 16px sans-serif';
      ctx.fillText(slice, center - 20, 5);

      ctx.restore();
    });
  }

  /**
   * Start the game
   */
  startGame() {
    const waInput = document.getElementById('wa');
    const wa = waInput?.value.trim();

    if (!wa) {
      this.showWarning('WhatsApp Diperlukan', 'Silakan isi nomor WhatsApp terlebih dahulu');
      return;
    }

    localStorage.setItem('wa', wa);
    this.showSuccess('Siap Spin!', '🎡 Sekarang Anda bisa memutar roda');

    // Enable spin button
    const spinBtn = document.getElementById('spin-btn');
    if (spinBtn) spinBtn.disabled = false;
  }

  /**
   * Spin the wheel
   */
  async spinWheel() {
    if (gameState.spinning) return;

    const wa = localStorage.getItem('wa');
    if (!wa) {
      this.showWarning('WhatsApp Diperlukan', 'Silakan isi nomor WhatsApp terlebih dahulu');
      return;
    }

    gameState.spinning = true;
    const spinBtn = document.getElementById('spin-btn');
    if (spinBtn) spinBtn.disabled = true;

    try {
      const data = await authApi.spin(wa, this.getCustomerId());

      if (data.error) {
        this.showWarning('Tidak Bisa Spin', 'Anda sudah bermain hari ini. Cobain lagi besok ya!');
        gameState.spinning = false;
        if (spinBtn) spinBtn.disabled = false;
        return;
      }

      this.animateSpin(data);
    } catch (err) {
      console.error(err);
      this.showError('Server Error', 'Terjadi kesalahan. Periksa jaringan Anda.');
      gameState.spinning = false;
      if (spinBtn) spinBtn.disabled = false;
    }
  }

  /**
   * Animate the spin
   * @param {Object} data - Spin result data
   */
  animateSpin(data) {
    const slices = WHEEL_CONFIG.slices;
    const result = data.result;
    const index = slices.indexOf(result);
    const arc = 360 / slices.length;

    const stopAngle = index * arc;
    const spin = 1440 + (360 - stopAngle);
    const duration = 3000;

    let start = null;

    const frame = (t) => {
      if (!start) start = t;

      const progress = t - start;
      const deg = (spin * progress) / duration;

      this.drawRotated(deg);

      if (progress < duration) {
        requestAnimationFrame(frame);
      } else {
        this.showResult(data);
        gameState.spinning = false;
        const spinBtn = document.getElementById('spin-btn');
        if (spinBtn) spinBtn.disabled = false;
      }
    };

    requestAnimationFrame(frame);
  }

  /**
   * Draw rotated wheel
   * @param {number} deg - Rotation in degrees
   */
  drawRotated(deg) {
    const ctx = gameState.ctx;
    if (!ctx) return;

    const size = WHEEL_CONFIG.size;
    const center = size / 2;

    ctx.clearRect(0, 0, size, size);

    ctx.save();
    ctx.translate(center, center);
    ctx.rotate((deg * Math.PI) / 180);
    ctx.translate(-center, -center);

    this.drawWheel();

    ctx.restore();
  }

  /**
   * Show the result
   * @param {Object} data - Result data
   */
  showResult(data) {
    const el = document.getElementById('result');
    if (!el) return;

    if (data.result === 'ZONK') {
      el.innerText = '😢 ZONK';
    } else {
      el.innerHTML = `🎉 Kamu dapat ${data.result}<br>Voucher: ${data.voucher}`;
    }
  }

  /**
   * Load user data (vouchers, play count)
   */
  async loadUserData() {
    try {
      // Get vouchers
      const vouchersResult = await authApi.getVouchers();
      if (vouchersResult.success) {
        this.updateVoucherCount(vouchersResult.data?.length || 0);
      }

      // Get play count
      const playResult = await authApi.getPlayCount();
      if (playResult.success) {
        this.updatePlayCount(playResult.data || 0);
      }
    } catch (error) {
      console.error('Failed to load user data:', error);
    }
  }

  /**
   * Update voucher count display
   * @param {number} count - Number of vouchers
   */
  updateVoucherCount(count) {
    const el = document.getElementById('voucher-count');
    if (el) el.textContent = count;
  }

  /**
   * Update play count display
   * @param {number} count - Number of plays
   */
  updatePlayCount(count) {
    const el = document.getElementById('play-count');
    if (el) el.textContent = count;
  }

  // ==================== Toast Helpers ====================

  showSuccess(title, message) {
    const Toast = window.Toast;
    if (Toast) Toast.success(title, message);
  }

  showWarning(title, message) {
    const Toast = window.Toast;
    if (Toast) Toast.warning(title, message);
  }

  showError(title, message) {
    const Toast = window.Toast;
    if (Toast) Toast.error(title, message);
  }
}

// Export
export { SiswaDashboard, WHEEL_CONFIG, gameState };

// Auto-init when DOM ready
document.addEventListener('DOMContentLoaded', () => {
  const dashboard = new SiswaDashboard();
  dashboard.init();

  // Expose functions globally for inline HTML onclicks
  window.startGame = () => dashboard.startGame();
  window.spinWheel = () => dashboard.spinWheel();
});

