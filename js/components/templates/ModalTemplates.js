/**
 * Modal Templates - Pure HTML Builders
 * Atomic, composable pure functions returning HTML strings
 * Extracted from Modal.js - NO LOGIC, only templating
 * Usage: buildSubscriptionTemplate(data) → safe HTML string
 */

import { sanitizeHtml, formatDateID, getStatusMeta } from '../utils/modalUtils.js';

/* ================================
   CORE MODAL TEMPLATES
================================ */

/**
 * Build subscription modal HTML safely (pure function)
 */
export function buildSubscriptionTemplate(data = {}) {
  const {
    schoolName = 'Sekolah Anda',
    plan = 'Starter',
    expiresAt = new Date(),
    daysRemaining = 0
  } = data;

  const expiryDate = formatDateID(expiresAt);
  const safeSchoolName = sanitizeHtml(schoolName);
  const safePlan = sanitizeHtml(plan.toUpperCase());
  const safeDays = Math.abs(parseInt(daysRemaining) || 0);

  return `
    <div class="modal-subscription-wrapper">
      <div class="modal-section-header">
        <div class="modal-icon-primary">
          <i class="fas fa-calendar-xmark"></i>
        </div>
        <div>
          <h3 class="modal-title">Subscription Expired</h3>
          <p class="modal-subtitle">${safeSchoolName}</p>
        </div>
      </div>

      <div class="modal-section-content">
        <div class="modal-info-box modal-info-plan">
          <div class="modal-info-icon">
            <i class="fas fa-school"></i>
          </div>
          <div class="modal-info-text">
            <span class="modal-info-label">Plan</span>
            <span class="modal-info-value">${safePlan}</span>
          </div>
        </div>

        <div class="modal-info-box modal-info-expires">
          <div class="modal-info-icon">
            <i class="fas fa-calendar-times"></i>
          </div>
          <div class="modal-info-text">
            <span class="modal-info-label">Expired</span>
            <span class="modal-info-value">${expiryDate}</span>
          </div>
        </div>

        <div class="modal-warning-box">
          <div class="modal-warning-icon">
            <i class="fas fa-exclamation-triangle"></i>
          </div>
          <div class="modal-warning-text">
            <h4>Action Required</h4>
            <p>Sekolah Anda tidak dapat digunakan karena subscription sudah expired. Hubungi admin sekolah untuk perpanjangan.</p>
            <p class="modal-warning-meta">
              <i class="fas fa-clock"></i>
              <span>Expired ${safeDays} hari</span>
            </p>
          </div>
        </div>
      </div>
    </div>
  `;
}

/**
 * Build school status modal HTML safely (pure function)
 */
export function buildSchoolStatusTemplate(data = {}) {
  const school = data.school || {};
  const statusKey = (data.schoolStatus || school.status || 'inactive').toString().toLowerCase();
  const meta = getStatusMeta(statusKey);

  const submittedAt = formatDateID(school.createdAt || school.updatedAt);
  const planLabel = sanitizeHtml((school.plan || 'starter').toUpperCase());
  const schoolName = sanitizeHtml(school.schoolName || school.name || 'Sekolah Anda');
  const schoolEmail = sanitizeHtml(school.email || '-');
  const schoolPhone = sanitizeHtml(school.noWa || school.no_wa || '-');
  const message = sanitizeHtml(data.message || meta.actionMessage);

  return `
    <div class="modal-status-wrapper">
      <div class="modal-section-header">
        <div style="width: 2.75rem; height: 2.75rem; background: ${meta.accent}20; color: ${meta.accent}; border-radius: 0.875rem; display: flex; align-items: center; justify-content: center;">
          <i class="fas ${meta.icon}" style="font-size: 1.25rem;"></i>
        </div>
        <div style="text-align: left;">
          <h3 class="modal-title">${sanitizeHtml(meta.title)}</h3>
          <p class="modal-subtitle">${schoolName}</p>
          <p style="font-size: 0.85rem; opacity: 0.7; margin-top: 0.25rem;">${sanitizeHtml(meta.subtitle)}</p>
        </div>
      </div>
      <div style="text-align: left; margin: 1.5rem 0; display: grid; gap: 0.75rem;">
        <p><strong>Plan:</strong> ${planLabel}</p>
        <p><strong>Email:</strong> ${schoolEmail}</p>
        <p><strong>WhatsApp:</strong> ${schoolPhone}</p>
        <p><strong>Pengajuan:</strong> ${submittedAt}</p>
      </div>
      <div style="background: ${meta.accent}14; border: 1px solid ${meta.accent}33; border-radius: 0.75rem; padding: 1rem; margin-top: 1rem; text-align: left;">
        <p style="margin: 0; font-size: 0.95rem;">${message}</p>
      </div>
    </div>
  `;
}

/**
 * Build subscription renewal modal HTML safely (pure function)
 */
export function buildSubscriptionRenewalTemplate(subscriptionData, plans = []) {
  const { schoolName = 'Sekolah Anda', currentPlan = 'Starter' } = subscriptionData;
  const safeSchoolName = sanitizeHtml(schoolName);

  const filteredPlans = Array.isArray(plans)
    ? plans.filter(p => p && p.id !== 'starter' && p.id !== currentPlan.toLowerCase())
    : [];

  const planButtons = filteredPlans.map(p => {
    const safeName = sanitizeHtml(p.name || 'Unknown Plan');
    const safePrice = p.price ? p.price.toLocaleString('id-ID') : 'N/A';
    const safePeriod = sanitizeHtml(p.period || 'bulan');

    return `
      <button class="plan-btn" data-plan-id="${p.id || ''}">
        <div style="font-size: 1.1rem; margin-bottom: 0.5rem;">${safeName}</div>
        <div style="font-size: 0.9rem; opacity: 0.7;">Rp ${safePrice}/${safePeriod}</div>
      </button>
    `;
  }).join('');

  return `
    <div class="modal-renewal-wrapper">
      <h3 class="modal-title">Pilih Plan Perpanjangan</h3>
      <p class="modal-subtitle">${safeSchoolName}</p>
      <div style="display: grid; gap: 1rem; margin-top: 1.5rem;">
        ${planButtons}
      </div>
    </div>
  `;
}

/* ================================
   UTILITY TEMPLATES
================================ */

/**
 * Generic confirm template
 */
export function buildConfirmTemplate(title, message) {
  return `
    <div style="text-align: center;">
      <h3 style="margin-bottom: 1rem; font-size: 1.2rem;">${sanitizeHtml(title)}</h3>
      <p style="font-size: 1rem; opacity: 0.9;">${sanitizeHtml(message)}</p>
    </div>
  `;
}

/**
 * Generic alert template
 */
export function buildAlertTemplate(title, message) {
  return `
    <div style="text-align: center;">
      <h3 style="margin-bottom: 1rem; font-size: 1.2rem;">${sanitizeHtml(title)}</h3>
      <p style="font-size: 1rem; opacity: 0.9;">${sanitizeHtml(message)}</p>
    </div>
  `;
}

export default {
  buildSubscriptionTemplate,
  buildSchoolStatusTemplate,
  buildSubscriptionRenewalTemplate,
  buildConfirmTemplate,
  buildAlertTemplate
};

