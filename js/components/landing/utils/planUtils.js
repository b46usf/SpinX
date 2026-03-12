/**
 * DRY Plan Utils - Shared across PricingSection + future components
 * Single source of truth for pricing logic
 */

import { authApi } from '../../../auth/AuthApi.js';

/**
 * Fallback plans - used if BE fails
 */
export const FALLBACK_PLANS = [
  { 
    id: 'starter', 
    plan: 'STARTER',
    name: 'Starter', 
    price: 0, 
    priceDisplay: 'Gratis', 
    cta: 'Mulai Gratis', 
    period: 'Selamanya',
    maxStudents: 50,
    popular: false,
    features: [
      { text: '50 Siswa Maksimal', included: true },
      { text: 'Game Wheel Dasar', included: true },
      { text: 'Voucher Terbatas', included: true },
      { text: 'Support Email', included: true },
      { text: 'Analitik Dasar', included: false },
      { text: 'Custom Branding', included: false }
    ]
  },
  { 
    id: 'pro', 
    plan: 'PRO',
    name: 'Pro', 
    price: 150000, 
    priceDisplay: 'Rp 150rb', 
    cta: 'Pilih Pro', 
    period: '/bulan',
    maxStudents: 200,
    popular: true,
    features: [
      { text: '200 Siswa Maksimal', included: true },
      { text: 'Game Wheel Full', included: true },
      { text: 'Voucher Unlimited', included: true },
      { text: 'Support Prioritas', included: true },
      { text: 'Analitik Lengkap', included: true },
      { text: 'Custom Branding', included: false }
    ]
  },
  { 
    id: 'enterprise', 
    plan: 'ENTERPRISE',
    name: 'Enterprise', 
    price: 500000, 
    priceDisplay: 'Rp 500rb', 
    cta: 'Hubungi Sales', 
    period: '/bulan',
    maxStudents: -1, // unlimited
    popular: false,
    features: [
      { text: 'Siswa Tak Terbatas', included: true },
      { text: 'Semua Fitur Pro', included: true },
      { text: 'White Label', included: true },
      { text: 'Support 24/7', included: true },
      { text: 'API Custom', included: true },
      { text: 'On-premise Option', included: true }
    ]
  }
];

/**
 * Load pricing data from BE (with retry + cache)
 */
export async function loadPricingData(retries = 3) {
  // Check cache first
  if (window._pricingCache && Date.now() - window._pricingCache.timestamp < 300000) { // 5min
    return window._pricingCache.plans;
  }

  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      const result = await authApi.getPricePlans();
      if (result.success && result.plans && result.plans.length > 0) {
        // Cache success
        window._pricingCache = {
          plans: result.plans,
          timestamp: Date.now()
        };
        return result.plans;
      }
    } catch (error) {
      console.warn(`Pricing fetch attempt ${attempt} failed:`, error);
    }

    // Wait before retry (except last attempt)
    if (attempt < retries) {
      await new Promise(resolve => setTimeout(resolve, 1000 * attempt));
    }
  }

  // All retries failed → return fallback
  console.warn('All pricing API attempts failed → using fallback');
  return FALLBACK_PLANS;
}

/**
 * Generate features HTML (DRY)
 */
export function generateFeaturesHTML(features) {
  return features.map(f => `
    <li class="flex items-center gap-3 ${f.included ? 'text-gray-300' : 'text-gray-500 line-through opacity-60'} text-sm">
      <i class="fas fa-${f.included ? 'check-circle' : 'times-circle'} w-4 h-4 ${f.included ? 'text-emerald-400' : 'text-red-400'} flex-shrink-0"></i>
      <span>${f.text}</span>
    </li>
  `).join('');
}

/**
 * Map BE plan to display plan (normalize)
 */
export function mapPlanToDisplay(plan) {
  return {
    id: plan.id?.toLowerCase() || plan.plan?.toLowerCase() || 'starter',
    name: plan.name || 'Unknown',
    price: plan.price || 0,
    priceDisplay: plan.priceDisplay || 'Rp 0',
    cta: plan.cta || 'Pilih Plan',
    period: plan.period || '',
    maxStudents: plan.maxStudents || 0,
    popular: plan.popular || false,
    features: plan.features || []
  };
}

/**
 * Preload pricing data globally
 */
export async function preloadPricingData() {
  try {
    await loadPricingData();
    console.log('✅ Pricing data preloaded successfully');
  } catch (error) {
    console.warn('Pricing preload failed (fallback will be used):', error);
  }
}

