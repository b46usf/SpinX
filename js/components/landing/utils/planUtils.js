/**
 * DRY Plan Utils - Shared across PricingSection + future components
 * Single source of truth for pricing logic
 */

import { authApi } from '../../../auth/AuthApi.js';



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

  // All retries failed → use fallback data
  console.warn('Pricing API failed → using fallback data');
  return getFallbackPlans();
  
/**
 * Fallback pricing plans (hardcoded for resilience)
 */
function getFallbackPlans() {
  return [
    {
      id: 'starter',
      name: 'Starter',
      priceDisplay: 'GRATIS',
      cta: 'Mulai Gratis',
      period: 'SELAYANYA',
      maxStudents: 50,
      popular: false,
      features: [
        { text: '50 Siswa Maksimal', included: true },
        { text: 'Game Wheel Dasar', included: true },
        { text: 'Voucher Terbatas', included: true },
        { text: 'Support Email', included: true }
      ]
    },
    {
      id: 'pro',
      name: 'Pro',
      priceDisplay: 'Rp 150.000',
      cta: 'Pilih Pro',
      period: '/bulan',
      maxStudents: 200,
      popular: true,
      features: [
        { text: '200 Siswa Maksimal', included: true },
        { text: 'Game Wheel Full', included: true },
        { text: 'Voucher Unlimited', included: true },
        { text: 'Support Prioritas', included: true },
        { text: 'Analitik Lengkap', included: true }
      ]
    },
    {
      id: 'enterprise',
      name: 'Enterprise',
      priceDisplay: 'Rp 500.000',
      cta: 'Hubungi Kami',
      period: '/bulan',
      maxStudents: 9999,
      popular: false,
      features: [
        { text: 'Unlimited Students', included: true },
        { text: 'All Pro Features', included: true },
        { text: 'White Label', included: true },
        { text: '24/7 Support', included: true },
        { text: 'Custom API', included: true }
      ]
    }
  ];
}
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
  try {
    console.log('🔍 Parsing plan:', plan);
    
    // Robust features parsing
    let features = plan.features || [];
    if (typeof features === 'string') {
      try {
        features = JSON.parse(features);
      } catch {
        // Try comma-separated
        features = features.split(',').map(f => ({ text: f.trim(), included: true }));
      }
    } else if (Array.isArray(features)) {
      // Ensure correct format
      features = features.map(f => ({
        text: f.text || f || 'Feature',
        included: f.included !== false
      }));
    }
    
    return {
      id: plan.id?.toLowerCase() || plan.plan?.toLowerCase() || 'starter',
      name: plan.name || 'Unknown',
      price: plan.price || 0,
      priceDisplay: plan.priceDisplay || 'Rp 0',
      cta: plan.cta || 'Pilih Plan',
      period: plan.period || '',
      maxStudents: plan.maxStudents || 0,
      popular: plan.popular || false,
      features: features.slice(0, 6) // Limit to 6
    };
  } catch (e) {
    console.error('❌ Plan parsing failed:', e, plan);
    return getFallbackPlans()[0]; // Return starter fallback
  }
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

