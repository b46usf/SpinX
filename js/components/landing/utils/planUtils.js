/**
 * DRY Plan Utils - Shared across PricingSection + future components
 * Single source of truth for pricing logic
 */

import { authApi } from '../../../auth/AuthApi.js';

const PRICING_CACHE_TTL = 5 * 60 * 1000;
const DEFAULT_PERIOD = '/bulan';
const MAX_VISIBLE_FEATURES = 6;

function toNumber(value, fallback = 0) {
  if (typeof value === 'number' && Number.isFinite(value)) return value;
  if (typeof value === 'string') {
    const normalized = value.replace(/[^\d.-]/g, '');
    const parsed = Number(normalized);
    if (Number.isFinite(parsed)) return parsed;
  }
  return fallback;
}

function toBoolean(value) {
  if (typeof value === 'boolean') return value;
  if (typeof value === 'number') return value === 1;
  if (typeof value === 'string') {
    const normalized = value.trim().toLowerCase();
    return ['true', '1', 'yes', 'y', 'popular'].includes(normalized);
  }
  return false;
}

function capitalizeLabel(text = '') {
  return String(text)
    .trim()
    .replace(/\s+/g, ' ')
    .replace(/\b\w/g, char => char.toUpperCase());
}

function detectIncludedFeature(rawFeature) {
  if (typeof rawFeature?.included === 'boolean') return rawFeature.included;
  if (rawFeature?.enabled !== undefined) return toBoolean(rawFeature.enabled);
  if (rawFeature?.available !== undefined) return toBoolean(rawFeature.available);
  if (rawFeature?.value !== undefined && typeof rawFeature.value === 'boolean') return rawFeature.value;

  const text = String(
    rawFeature?.text ??
    rawFeature?.name ??
    rawFeature?.label ??
    rawFeature ??
    ''
  ).trim();

  if (!text) return false;

  const lowered = text.toLowerCase();
  if (
    lowered.startsWith('tidak ') ||
    lowered.startsWith('no ') ||
    lowered.startsWith('tanpa ') ||
    lowered.includes('tidak tersedia') ||
    lowered.includes('not included')
  ) {
    return false;
  }

  return true;
}

function normalizeFeature(rawFeature) {
  if (rawFeature == null) return null;

  if (typeof rawFeature === 'string') {
    const text = rawFeature.trim();
    if (!text) return null;
    return {
      text,
      included: detectIncludedFeature(rawFeature)
    };
  }

  if (typeof rawFeature === 'object') {
    const text = String(
      rawFeature.text ??
      rawFeature.name ??
      rawFeature.label ??
      rawFeature.title ??
      ''
    ).trim();

    if (!text) return null;

    return {
      text,
      included: detectIncludedFeature(rawFeature)
    };
  }

  return null;
}

function parseFeatures(features) {
  if (!features) return [];

  let rawFeatures = features;

  if (typeof rawFeatures === 'string') {
    const trimmed = rawFeatures.trim();

    if (!trimmed) return [];

    try {
      const parsed = JSON.parse(trimmed);
      rawFeatures = parsed;
    } catch {
      rawFeatures = trimmed
        .split(/\r?\n|[,;•]/)
        .map(item => item.trim())
        .filter(Boolean);
    }
  }

  if (!Array.isArray(rawFeatures)) {
    rawFeatures = [rawFeatures];
  }

  return rawFeatures
    .map(normalizeFeature)
    .filter(Boolean)
    .slice(0, MAX_VISIBLE_FEATURES);
}

function formatRupiah(value) {
  if (value <= 0) return 'Gratis';
  return `Rp ${new Intl.NumberFormat('id-ID').format(value)}`;
}

function normalizePeriod(plan, priceValue) {
  const rawPeriod = String(plan.period ?? plan.billingPeriod ?? plan.interval ?? '').trim();
  if (rawPeriod) return rawPeriod.startsWith('/') ? rawPeriod : `/${rawPeriod}`;
  return priceValue > 0 ? DEFAULT_PERIOD : 'Selamanya';
}

function normalizePlanId(plan) {
  const source = String(plan.id ?? plan.plan ?? plan.slug ?? plan.name ?? 'starter')
    .trim()
    .toLowerCase();

  if (source.includes('enterprise')) return 'enterprise';
  if (source.includes('pro')) return 'pro';
  if (source.includes('free') || source.includes('gratis') || source.includes('starter')) return 'starter';

  return source.replace(/\s+/g, '-');
}

function normalizePlanName(plan, id) {
  const rawName = String(plan.name ?? plan.title ?? plan.plan ?? id ?? 'Starter').trim();
  if (!rawName) return 'Starter';
  return capitalizeLabel(rawName);
}

function normalizeStudentLimit(plan) {
  const candidates = [
    plan.maxStudents,
    plan.studentLimit,
    plan.students,
    plan.max_users,
    plan.maxUser
  ];

  for (const candidate of candidates) {
    if (candidate === null || candidate === undefined || candidate === '') continue;
    if (typeof candidate === 'string' && /unlimited|tak terbatas/i.test(candidate)) {
      return Number.POSITIVE_INFINITY;
    }

    const numeric = toNumber(candidate, NaN);
    if (Number.isFinite(numeric)) return numeric;
  }

  return 0;
}

function inferPopular(plan, id, priceValue) {
  if (plan.popular !== undefined) return toBoolean(plan.popular);
  if (plan.isPopular !== undefined) return toBoolean(plan.isPopular);
  return id === 'pro' || (priceValue > 0 && priceValue < 500000);
}

/**
 * Load pricing data from BE (with retry + cache)
 */
export async function loadPricingData(retries = 3) {
  if (
    window._pricingCache &&
    Date.now() - window._pricingCache.timestamp < PRICING_CACHE_TTL
  ) {
    return window._pricingCache.plans;
  }

  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      const result = await authApi.getPricePlans();
      if (result?.success && Array.isArray(result.plans) && result.plans.length > 0) {
        window._pricingCache = {
          plans: result.plans,
          timestamp: Date.now()
        };
        return result.plans;
      }
    } catch (error) {
      console.warn(`Pricing fetch attempt ${attempt} failed:`, error);
    }

    if (attempt < retries) {
      await new Promise(resolve => setTimeout(resolve, 1000 * attempt));
    }
  }

  console.warn('Pricing API failed after retries - using empty');
  return [];
}

/**
 * Generate features HTML (DRY)
 */
export function generateFeaturesHTML(features = []) {
  return features.map(feature => `
    <li class="flex items-start gap-3 rounded-2xl border border-white/6 bg-white/[0.03] px-4 py-3 ${feature.included ? 'text-slate-200' : 'text-slate-500'}">
      <span class="mt-0.5 flex h-5 w-5 items-center justify-center rounded-full ${feature.included ? 'bg-emerald-500/15 text-emerald-400' : 'bg-rose-500/10 text-rose-300'}">
        <i class="fas fa-${feature.included ? 'check' : 'minus'} text-[10px]"></i>
      </span>
      <span class="text-sm leading-6 ${feature.included ? '' : 'line-through decoration-slate-500/60'}">${feature.text}</span>
    </li>
  `).join('');
}

/**
 * Map BE plan to display plan (normalize)
 */
export function mapPlanToDisplay(plan = {}) {
  try {
    const id = normalizePlanId(plan);
    const name = normalizePlanName(plan, id);
    const price = toNumber(plan.price ?? plan.amount ?? plan.monthlyPrice, 0);
    const priceDisplay = String(plan.priceDisplay ?? '').trim() || formatRupiah(price);
    const period = normalizePeriod(plan, price);
    const maxStudents = normalizeStudentLimit(plan);
    const features = parseFeatures(plan.features);
    const popular = inferPopular(plan, id, price);

    return {
      id,
      name,
      price,
      priceDisplay,
      cta: String(plan.cta ?? plan.buttonText ?? 'Pilih Paket').trim() || 'Pilih Paket',
      period,
      maxStudents,
      maxStudentsDisplay: maxStudents === Number.POSITIVE_INFINITY
        ? 'Tak terbatas'
        : `${maxStudents}+ siswa`,
      popular,
      description: String(
        plan.description ??
        plan.subtitle ??
        (price <= 0
          ? 'Mulai gratis untuk mencoba fitur inti.'
          : 'Cocok untuk sekolah yang ingin bertumbuh lebih cepat.')
      ).trim(),
      features
    };
  } catch (error) {
    console.error('❌ Plan parsing failed:', error, plan);

    return {
      id: 'starter',
      name: 'Starter',
      price: 0,
      priceDisplay: 'Gratis',
      cta: 'Pilih Paket',
      period: 'Selamanya',
      maxStudents: 0,
      maxStudentsDisplay: '0 siswa',
      popular: false,
      description: 'Paket dasar untuk mulai mencoba platform.',
      features: []
    };
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
