/**
 * Register Modal Templates - Pure HTML Builders + Setup Functions
 * Extracted from RegisterModal.js - NO business logic, pure templating
 * Usage: generateRegisterHTML(planName, planId), setupRegisterHandlers(modal)
 */

import { sanitizeHtml } from '../utils/modalUtils.js';

/**
 * Infer plan ID from name (pure utility)
 */
export function inferPlanId(planName = '') {
  const normalized = String(planName).toLowerCase();
  if (normalized.includes('starter') || normalized.includes('gratis') || normalized.includes('free')) {
    return 'starter';
  }
  if (normalized.includes('pro')) {
    return 'pro';
  }
  if (normalized.includes('enterprise')) {
    return 'enterprise';
  }
  return normalized.replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') || 'starter';
}

/**
 * Generate standard registration form HTML (pure function)
 */
export function generateRegisterHTML(planName = 'Starter - Gratis', planId = 'starter') {
  const safePlanName = sanitizeHtml(planName);
  const safePlanId = sanitizeHtml(planId);
  const isPaidPlan = planId !== 'starter';
  const paymentField = isPaidPlan ? getPaymentFieldHTML() : '';

  return `
    <form id="register-form" class="space-y-4">
      <div class="form-group">
        <label class="block text-sm font-medium text-gray-300 mb-2">Nama Sekolah</label>
        <input type="text" id="school-name" required placeholder="SMA Negeri 1 Jakarta"
          class="w-full px-3 py-2 bg-white/5 border border-white/20 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-blue-400">
      </div>

      <div class="form-group">
        <label class="block text-sm font-medium text-gray-300 mb-2">Email Admin</label>
        <input type="email" id="school-email" required placeholder="admin@sekolah.sch.id"
          class="w-full px-3 py-2 bg-white/5 border border-white/20 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-blue-400">
      </div>

      <div class="form-group">
        <label class="block text-sm font-medium text-gray-300 mb-2">No. WhatsApp</label>
        <input type="tel" id="school-phone" required placeholder="081234567890"
          class="w-full px-3 py-2 bg-white/5 border border-white/20 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-blue-400">
      </div>

      <div class="form-group">
        <label class="block text-sm font-medium text-gray-300 mb-2">Paket yang dipilih</label>
        <div class="px-3 py-2 bg-blue-500/20 border border-blue-500/30 rounded-lg text-blue-300 text-sm font-500">
          <i class="fas fa-check-circle mr-2"></i>${safePlanName}
        </div>
        <input type="hidden" id="selected-plan" value="${safePlanId}">
      </div>
      ${paymentField}
    </form>
  `;
}

/**
 * Generate renewal registration form HTML (pure function)
 */
export function generateRenewalRegisterHTML(planName = 'Unknown Plan', renewalData = {}, planId = 'starter') {
  const safePlanName = sanitizeHtml(planName);
  const safePlanId = sanitizeHtml(planId);
  const safeCurrentPlan = sanitizeHtml(renewalData.currentPlan || 'Unknown');
  const isPaidPlan = planId !== 'starter';
  
  const selectedPlanField = !isPaidPlan ? getPlanDisplayField(safePlanName) : '';
  const buktiTransferField = isPaidPlan ? getRenewalPaymentFields(safePlanName) : '';

  return `
    <div class="renewal-notice">
      <div class="notice-icon">
        <i class="fas fa-sync-alt"></i>
      </div>
      <div class="notice-text">
        <h4>Perpanjang Subscription</h4>
        <p>Plan sebelumnya: <strong>${safeCurrentPlan}</strong></p>
        <p>Plan baru: <strong>${safePlanName}</strong></p>
      </div>
    </div>

    <form id="register-form" class="space-y-4">
      <input type="hidden" id="selected-plan" value="${safePlanId}">
      <div class="form-group">
        <label class="block text-sm font-medium text-gray-300 mb-2">Nama Sekolah</label>
        <input type="text" id="school-name" required placeholder="SMA Negeri 1 Jakarta"
          class="w-full px-3 py-2 bg-white/5 border border-white/20 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-blue-400">
      </div>

      <div class="form-group">
        <label class="block text-sm font-medium text-gray-300 mb-2">Email Admin</label>
        <input type="email" id="school-email" required placeholder="admin@sekolah.sch.id"
          class="w-full px-3 py-2 bg-white/5 border border-white/20 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-blue-400">
      </div>

      <div class="form-group">
        <label class="block text-sm font-medium text-gray-300 mb-2">No. WhatsApp</label>
        <input type="tel" id="school-phone" required placeholder="081234567890"
          class="w-full px-3 py-2 bg-white/5 border border-white/20 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-blue-400">
      </div>
      ${selectedPlanField}
      ${buktiTransferField}
    </form>
  `;
}

/**
 * Setup form validation handlers (scoped to didOpen)
 * @param {Element} modal - Swal popup element
 * @param {Object} [prefillData] - Optional data to prefill form
 */
export function setupRegisterHandlers(modal, prefillData = {}) {
  const form = modal.querySelector('#register-form');
  if (!form) return;

  const inputs = form.querySelectorAll('input[type="text"], input[type="email"], input[type="tel"]');
  
  inputs.forEach(input => {
    // Real-time validation
    input.addEventListener('blur', () => validateField(input));
    input.addEventListener('input', () => {
      if (input.classList.contains('error')) validateField(input);
    });
  });

  // Prefill if provided
  if (prefillData.schoolName) document.getElementById('school-name').value = prefillData.schoolName;
  if (prefillData.email) document.getElementById('school-email').value = prefillData.email;
  if (prefillData.noWa) document.getElementById('school-phone').value = prefillData.noWa;
}

/**
 * Validate single field (pure, DOM-based)
 */
function validateField(input) {
  const value = input.value?.trim();
  const isValid = value && (
    input.type === 'email' 
      ? /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)
      : value.length > 0
  );

  input.classList.toggle('error', !isValid);
  input.classList.toggle('valid', isValid);
}

/* ================================
   HELPER TEMPLATES (Private)
================================ */

function getPaymentFieldHTML() {
  return `
    <div class="form-group">
      <label class="block text-sm font-medium text-gray-300 mb-2">Transfer Pembayaran</label>
      <div class="rounded-lg border border-amber-400/30 bg-amber-500/10 px-4 py-3 text-sm text-amber-100">
        <div class="font-semibold text-amber-200">Bank BCA</div>
        <div>No. Rekening 3250883497</div>
        <div>a.n. Bagus Farouktiawan</div>
      </div>
    </div>
    <div class="form-group">
      <label class="block text-sm font-medium text-gray-300 mb-2">Upload Bukti Transfer</label>
      <input type="file" id="payment-proof" accept="image/*,.pdf" required
        class="w-full px-3 py-2 bg-white/5 border border-white/20 rounded-lg text-white file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-blue-600 file:text-white hover:file:bg-blue-700">
      <p class="text-xs text-gray-400 mt-1">Upload gambar atau PDF bukti transfer untuk paket berbayar.</p>
    </div>
  `;
}

function getRenewalPaymentFields(planName) {
  return `
    <div class="form-group">
      <label class="block text-sm font-medium text-gray-300 mb-2">Paket yang dipilih</label>
      <div class="px-3 py-2 bg-blue-500/20 border border-blue-500/30 rounded-lg text-blue-300 text-sm font-500">
        <i class="fas fa-check-circle mr-2"></i>${sanitizeHtml(planName)}
      </div>
    </div>
    <div class="form-group">
      <label class="block text-sm font-medium text-gray-300 mb-2">Transfer Pembayaran Renewal</label>
      <div class="rounded-lg border border-amber-400/30 bg-amber-500/10 px-4 py-3 text-sm text-amber-100">
        <div class="font-semibold text-amber-200">Bank BCA</div>
        <div>No. Rekening 3250883497</div>
        <div>a.n. Bagus Farouktiawan</div>
      </div>
    </div>
    <div class="form-group">
      <label class="block text-sm font-medium text-gray-300 mb-2">Upload Bukti Transfer Renewal</label>
      <input type="file" id="bukti-transfer" accept="image/*,.pdf" required
        class="w-full px-3 py-2 bg-white/5 border border-white/20 rounded-lg text-white file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-blue-600 file:text-white hover:file:bg-blue-700">
      <p class="text-xs text-gray-400 mt-1">Upload gambar atau PDF bukti transfer renewal untuk paket berbayar.</p>
    </div>
  `;
}

function getPlanDisplayField(planName) {
  return `
    <div class="form-group">
      <label class="block text-sm font-medium text-gray-300 mb-2">Paket yang dipilih</label>
      <div class="px-3 py-2 bg-blue-500/20 border border-blue-500/30 rounded-lg text-blue-300 text-sm font-500">
        <i class="fas fa-check-circle mr-2"></i>${sanitizeHtml(planName)}
      </div>
    </div>
  `;
}

export default {
  inferPlanId,
  generateRegisterHTML,
  generateRenewalRegisterHTML,
  setupRegisterHandlers
};

