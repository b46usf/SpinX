/**
 * Subscription Manager Module
 * All subscription/invoice related logic: loading, filtering, rendering
 * Decoupled from main dashboard for reusability
 */

import { DashboardUtils } from '../../core/DashboardUtils.js';
import { authApi } from '../../auth/AuthApi.js';
import { clearContainerSkeleton, renderListSkeleton, clearTextSkeleton } from '../../components/utils/DashboardSkeleton.js';

class SubscriptionManager {
  constructor(options = {}) {
    this.invoiceCounterId = options.invoiceCounterId || 'invoice-content';
    this.paymentCounterId = options.paymentCounterId || 'payment-content';
    this.statStarterId = options.statStarterId || 'sub-starter';
    this.statProId = options.statProId || 'sub-pro';
    this.statEnterpriseId = options.statEnterpriseId || 'sub-enterprise';
    
    this.subscriptionStatusMap = options.subscriptionStatusMap || {};
    
    this.subscriptions = {};
    this.invoices = [];
    this.payments = [];
  }

  /**
   * Load subscriptions data
   */
  async loadSubscriptions() {
    this.showSkeletons();

    try {
      const [result, paymentsResult] = await Promise.all([
        authApi.call('getSubscriptionStats', {}, false),
        authApi.call('getPayments', {}, false)
      ]);
      
      if (result.success) {
        this.subscriptions = result.data || {};
        this.invoices = result.invoices || [];
        this.payments = paymentsResult?.invoices || paymentsResult?.payments || [];
        this.updateStats();
        this.renderInvoices(this.invoices);
        this.renderPayments(this.payments);
      } else {
        this.subscriptions = {};
        this.invoices = [];
        this.payments = [];
        this.updateStats();
        this.renderEmptyInvoices();
        this.renderEmptyPayments();
      }
    } catch (error) {
      console.error('Failed to load subscriptions:', error);
      this.subscriptions = {};
      this.invoices = [];
      this.payments = [];
      this.updateStats();
      this.renderEmptyInvoices();
      this.renderEmptyPayments();
    }
  }

  /**
   * Update subscription statistics
   */
  updateStats() {
    const subs = this.subscriptions;
    
    clearTextSkeleton([this.statStarterId, this.statProId, this.statEnterpriseId]);
    
    const starterEl = document.getElementById(this.statStarterId);
    const proEl = document.getElementById(this.statProId);
    const enterpriseEl = document.getElementById(this.statEnterpriseId);

    if (starterEl) starterEl.textContent = subs.starter || 0;
    if (proEl) proEl.textContent = subs.pro || 0;
    if (enterpriseEl) enterpriseEl.textContent = subs.enterprise || 0;
  }

  /**
   * Render invoices list
   */
  renderInvoices(invoices) {
    const container = document.getElementById(this.invoiceCounterId);
    if (!container) return;
    clearContainerSkeleton(container);

    if (invoices.length === 0) {
      this.renderEmptyInvoices();
      return;
    }

    container.innerHTML = invoices.slice(0, 5).map(inv => this.renderInvoiceItem(inv)).join('');
  }

  /**
   * Render payments list
   */
  renderPayments(payments) {
    const container = document.getElementById(this.paymentCounterId);
    if (!container) return;
    clearContainerSkeleton(container);

    if (!payments.length) {
      this.renderEmptyPayments();
      return;
    }

    container.innerHTML = payments.slice(0, 5).map(payment => this.renderPaymentItem(payment)).join('');
  }

  /**
   * Build invoice item HTML
   * @private
   */
  renderInvoiceItem(inv) {
    const expiresInfo = inv.expiresAt && inv.status === 'expired'
      ? ` • Expired: ${DashboardUtils.formatDate(inv.expiresAt, 'date')}`
      : '';
    
    return `
      <div class="flex items-center gap-3 p-3 bg-white/5 rounded-lg">
        <div class="w-10 h-10 rounded-lg ${this.getStatusBg(inv.status)} flex items-center justify-center">
          <i class="${this.getStatusIcon(inv.status)}"></i>
        </div>
        <div class="flex-1 min-w-0">
          <div class="font-medium text-sm">${inv.sekolah || inv.name}</div>
          <div class="text-xs text-gray-500">${inv.plan} - ${DashboardUtils.formatCurrency(inv.amount)}${expiresInfo}</div>
        </div>
        <span class="badge badge-${this.getStatusBadge(inv.status)} text-xs">${this.getStatusLabel(inv.status)}</span>
      </div>
    `;
  }

  /**
   * Build payment item HTML
   * @private
   */
  renderPaymentItem(payment) {
    const expiresInfo = payment.expiresAt && payment.status === 'expired'
      ? ` • Expired: ${DashboardUtils.formatDate(payment.expiresAt, 'date')}`
      : '';
    
    return `
      <div class="flex items-center gap-3 p-3 bg-white/5 rounded-lg">
        <div class="w-10 h-10 rounded-lg ${this.getStatusBg(payment.status)} flex items-center justify-center">
          <i class="${this.getStatusIcon(payment.status)}"></i>
        </div>
        <div class="flex-1 min-w-0">
          <div class="font-medium text-sm">${payment.sekolah || payment.name}</div>
          <div class="text-xs text-gray-500">${payment.plan} - ${DashboardUtils.formatCurrency(payment.amount)}${expiresInfo}</div>
        </div>
        <span class="badge badge-${this.getStatusBadge(payment.status)} text-xs">${this.getStatusLabel(payment.status)}</span>
      </div>
    `;
  }

  /**
   * Get status background color
   * @private
   */
  getStatusBg(status) {
    if (this.subscriptionStatusMap[status]) {
      const statusMeta = this.subscriptionStatusMap[status];
      return `${statusMeta.iconBg} ${statusMeta.iconColor}`;
    }

    const bgs = {
      'paid': 'bg-green-500/20 text-green-400',
      'overdue': 'bg-red-500/20 text-red-400'
    };
    return bgs[status] || 'bg-gray-500/20 text-gray-400';
  }

  /**
   * Get status icon
   * @private
   */
  getStatusIcon(status) {
    if (this.subscriptionStatusMap[status]) {
      return `fas ${this.subscriptionStatusMap[status].icon}`;
    }

    const icons = {
      'paid': 'fas fa-check',
      'overdue': 'fas fa-exclamation'
    };
    return icons[status] || 'fas fa-file';
  }

  /**
   * Get status badge class
   * @private
   */
  getStatusBadge(status) {
    if (this.subscriptionStatusMap[status]) {
      return this.subscriptionStatusMap[status].badge;
    }

    const badges = {
      'paid': 'success',
      'overdue': 'danger'
    };
    return badges[status] || 'secondary';
  }

  /**
   * Get status label
   * @private
   */
  getStatusLabel(status) {
    if (this.subscriptionStatusMap[status]) {
      return this.subscriptionStatusMap[status].label;
    }

    const labels = {
      paid: 'Paid',
      overdue: 'Overdue'
    };

    return labels[status] || status;
  }

  /**
   * Render empty invoices state
   * @private
   */
  renderEmptyInvoices() {
    const container = document.getElementById(this.invoiceCounterId);
    if (!container) return;
    clearContainerSkeleton(container);

    DashboardUtils.renderEmptyState(container, {
      icon: 'fa-file-invoice',
      title: 'Belum ada invoice'
    });
  }

  /**
   * Render empty payments state
   * @private
   */
  renderEmptyPayments() {
    const container = document.getElementById(this.paymentCounterId);
    if (!container) return;
    clearContainerSkeleton(container);

    DashboardUtils.renderEmptyState(container, {
      icon: 'fa-money-bill-wave',
      title: 'Belum ada pembayaran'
    });
  }

  /**
   * Show skeleton loaders
   * @private
   */
  showSkeletons() {
    clearTextSkeleton([this.statStarterId, this.statProId, this.statEnterpriseId]);
    renderListSkeleton(this.invoiceCounterId, { items: 3, avatar: 'square', trailing: 'pill' });
    renderListSkeleton(this.paymentCounterId, { items: 3, avatar: 'square', trailing: 'pill' });
  }

  /**
   * Setup tab switching
   */
  setupTabSwitching(handlers = {}) {
    const tabBtns = document.querySelectorAll('[data-tab]');
    const invoiceList = document.getElementById('invoice-list');
    const pembayaranList = document.getElementById('pembayaran-list');

    if (!tabBtns.length) return;

    tabBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        const tab = btn.dataset.tab;
        
        // Update buttons
        tabBtns.forEach(b => {
          if (b.dataset.tab === tab) {
            b.classList.add('active', 'bg-indigo-500/20', 'text-indigo-400');
            b.classList.remove('bg-white/5', 'text-gray-400');
          } else {
            b.classList.remove('active', 'bg-indigo-500/20', 'text-indigo-400');
            b.classList.add('bg-white/5', 'text-gray-400');
          }
        });

        // Show/hide content
        if (tab === 'invoice') {
          invoiceList?.classList.remove('hidden');
          pembayaranList?.classList.add('hidden');
        } else {
          invoiceList?.classList.add('hidden');
          pembayaranList?.classList.remove('hidden');
        }

        if (handlers.onTabChange) {
          handlers.onTabChange(tab);
        }
      });
    });
  }
}

export { SubscriptionManager };
