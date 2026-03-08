/**
 * Game Script Module
 * Spin Diskon UMKM - Main game logic
 * Uses AuthApi for all API calls - single source of truth
 * Uses Toast for notifications (SweetAlert2)
 */

// Import AuthApi for consistent API calls
import { authApi } from './auth/AuthApi.js';
import { showError, showSuccess, showWarning } from './components/utils/Toast.js';

// Wheel Configuration
const CONFIG = {
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

// Game State
const STATE = {
  spinning: false,
  canvas: null,
  ctx: null
};

// Initialize on DOM ready
document.addEventListener('DOMContentLoaded', init);

/**
 * Initialize the game
 */
function init() {
  STATE.canvas = document.getElementById('wheel');
  STATE.ctx = STATE.canvas.getContext('2d');
  drawWheel();
}

/**
 * Draw the wheel
 */
function drawWheel() {
  const ctx = STATE.ctx;
  const size = CONFIG.size;
  const slices = CONFIG.slices;

  const center = size / 2;
  const arc = (Math.PI * 2) / slices.length;

  ctx.clearRect(0, 0, size, size);

  slices.forEach((slice, i) => {
    const start = i * arc;
    const end = start + arc;

    ctx.beginPath();
    ctx.moveTo(center, center);
    ctx.arc(center, center, center, start, end);

    ctx.fillStyle = CONFIG.colors[i];
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
 * Get or create customer ID
 */
function getCustomerId() {
  let cid = localStorage.getItem('cid');

  if (!cid) {
    cid = 'CUST-' + Math.random().toString(36).substring(2, 8);
    localStorage.setItem('cid', cid);
  }

  return cid;
}

/**
 * Check if user is authenticated
 */
function isAuthenticated() {
  const user = localStorage.getItem('user');
  return !!user;
}

/**
 * Start the game
 */
function startGame() {
  // Check authentication
  if (!isAuthenticated()) {
    showWarning('Login Diperlukan', 'Silakan login terlebih dahulu dengan Google');
    return;
  }

  const wa = document.getElementById('wa').value.trim();

  if (!wa) {
    showWarning('WhatsApp Diperlukan', 'Silakan isi nomor WhatsApp terlebih dahulu');
    return;
  }

  localStorage.setItem('wa', wa);
  showSuccess('Siap Spin!', '🎡 Sekarang Anda bisa memutar roda');
}

/**
 * Spin the wheel
 * Uses AuthApi for consistent API calls
 */
async function spinWheel() {
  // Check authentication
  if (!isAuthenticated()) {
    showWarning('Login Diperlukan', 'Silakan login terlebih dahulu dengan Google');
    return;
  }

  if (STATE.spinning) return;

  const wa = localStorage.getItem('wa');

  if (!wa) {
    showWarning('WhatsApp Diperlukan', 'Silakan isi nomor WhatsApp terlebih dahulu');
    return;
  }

  STATE.spinning = true;

  try {
    // Use AuthApi for spin - single source of truth
    const data = await authApi.spin(wa, getCustomerId());

    if (data.error) {
      showWarning('Tidak Bisa Spin', 'Anda sudah bermain hari ini. Cobain lagi besok ya!');
      STATE.spinning = false;
      return;
    }

    animateSpin(data);

  } catch (err) {
    console.error(err);
    showError('Server Error', 'Terjadi kesalahan. Periksa jaringan Anda.');
    STATE.spinning = false;
  }
}

/**
 * Animate the spin
 * @param {Object} data - Spin result data
 */
function animateSpin(data) {
  const slices = CONFIG.slices;
  const result = data.result;

  const index = slices.indexOf(result);
  const arc = 360 / slices.length;

  const stopAngle = index * arc;
  const spin = 1440 + (360 - stopAngle);
  const duration = 3000;

  let start = null;

  function frame(t) {
    if (!start) start = t;

    const progress = t - start;
    const deg = (spin * progress) / duration;

    drawRotated(deg);

    if (progress < duration) {
      requestAnimationFrame(frame);
    } else {
      showResult(data);
    }
  }

  requestAnimationFrame(frame);
}

/**
 * Draw rotated wheel
 * @param {number} deg - Rotation in degrees
 */
function drawRotated(deg) {
  const ctx = STATE.ctx;
  const size = CONFIG.size;
  const center = size / 2;

  ctx.clearRect(0, 0, size, size);

  ctx.save();

  ctx.translate(center, center);
  ctx.rotate((deg * Math.PI) / 180);
  ctx.translate(-center, -center);

  drawWheel();

  ctx.restore();
}

/**
 * Show the result
 * @param {Object} data - Result data
 */
function showResult(data) {
  const el = document.getElementById('result');

  if (data.result === 'ZONK') {
    el.innerText = '😢 ZONK';
  } else {
    el.innerHTML =
      '🎉 Kamu dapat ' + data.result +
      '<br>Voucher: ' + data.voucher;
  }

  STATE.spinning = false;
}

// Export for module usage
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    CONFIG,
    STATE,
    init,
    drawWheel,
    getCustomerId,
    isAuthenticated,
    startGame,
    spinWheel,
    animateSpin,
    drawRotated,
    showResult
  };
}

