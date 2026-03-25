/**
 * DRY Plan Utils
 * Shared pricing helpers for landing components.
 */

import { authApi } from '../../../auth/AuthApi.js';

const PRICING_CACHE_TTL = 5 * 60 * 1000;
const DEFAULT_PERIOD = 'bulanan';
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
    .replace(/\b\w/g, (char) => char.toUpperCase());
}

function detectIncludedFeature(rawFeature) {
  if (typeof rawFeature?.included === 'boolean') return rawFeature.included;
  if (rawFeature?.enabled !== undefined) return toBoolean(rawFeature.enabled);
  if (rawFeature?.available !== undefined) return toBoolean(rawFeature.available);
  if (rawFeature?.value !== undefined && typeof rawFeature.value === 'boolean') {
    return rawFeature.value;
  }

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
      rawFeatures = JSON.parse(trimmed);
    } catch {
      rawFeatures = trimmed
        .split(/\r?\n|[,;]|\u2022/)
        .map((item) => item.trim())
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

function extractTextValue(value) {
  if (value == null) return '';

  if (Array.isArray(value)) {
    return extractTextValue(value[0]);
  }

  if (typeof value === 'object') {
    return String(value.text ?? value.label ?? value.name ?? '').trim();
  }

  return String(value).trim();
}

function normalizePeriod(plan, priceValue) {
  const rawPeriod = extractTextValue(plan.period ?? plan.billingPeriod ?? plan.interval ?? '');
  return rawPeriod || (priceValue > 0 ? DEFAULT_PERIOD : 'Selamanya');
}

function getFullPriceDisplay(plan, priceValue) {
  const priceStr = String(plan.priceDisplay ?? '').trim();
  if (priceValue <= 0) return priceStr || 'Gratis';
  return priceStr || formatRupiah(priceValue);
}

function normalizePlanId(plan) {
  const source = String(plan.id ?? plan.plan ?? plan.slug ?? plan.name ?? 'starter')
    .trim()
    .toLowerCase();

  if (source.includes('enterprise')) return 'enterprise';
  if (source.includes('pro')) return 'pro';
  if (source.includes('free') || source.includes('gratis') || source.includes('starter')) {
    return 'starter';
  }

  return source.replace(/\s+/g, '-');
}

function normalizePlanName(plan, id) {
  const rawName = String(plan.name ?? plan.title ?? plan.plan ?? id ?? 'Starter').trim();
  if (!rawName) return 'Starter';
  return capitalizeLabel(rawName);
}

function normalizeUserLimit(plan) {
  const candidates = [
    plan.maxUsers,
    plan.max_users,
    plan.maxUser
  ];

  for (const candidate of candidates) {
    if (candidate === null || candidate === undefined || candidate === '') continue;

    if (typeof candidate === 'string' && /unlimited|tak terbatas/i.test(candidate)) {
      return Number.POSITIVE_INFINITY;
    }

    const numeric = toNumber(candidate, Number.NaN);
    if (Number.isFinite(numeric)) return numeric;
  }

  return 0;
}

function normalizeCapacityUnit(plan) {
  const hasUserLimit = [
    plan.maxUsers,
    plan.max_users,
    plan.maxUser
  ].some((value) => value !== null && value !== undefined && value !== '');

  if (hasUserLimit) return 'user';

  const featuresText = JSON.stringify(plan.features ?? '').toLowerCase();
  if (featuresText.includes('user')) return 'user';

  return 'user';
}

function formatCapacityDisplay(value, unit) {
  if (value === Number.POSITIVE_INFINITY) return 'Tak terbatas';
  if (!Number.isFinite(value) || value <= 0) return 'Belum ditentukan';
  return `${value} ${unit} maksimal`;
}

function inferPopular(plan, id, priceValue) {
  if (plan.popular !== undefined) return toBoolean(plan.popular);
  if (plan.isPopular !== undefined) return toBoolean(plan.isPopular);
  return id === 'pro' || (priceValue > 0 && priceValue < 500000);
}

export async function loadPricingData(retries = 3) {
  if (
    window._pricingCache &&
    Date.now() - window._pricingCache.timestamp < PRICING_CACHE_TTL
  ) {
    return window._pricingCache.plans;
  }

  for (let attempt = 1; attempt <= retries; attempt += 1) {
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
      await new Promise((resolve) => setTimeout(resolve, 1000 * attempt));
    }
  }

  console.warn('Pricing API failed after retries - using empty');
  return [];
}

export function generateFeaturesHTML(features = []) {
  return features.map((feature) => `
    <li class="pricing-feature ${feature.included ? 'is-included' : 'is-disabled'}">
      <span class="pricing-feature__icon">
        <i class="fas fa-${feature.included ? 'check' : 'minus'}"></i>
      </span>
      <span class="pricing-feature__text">${feature.text}</span>
    </li>
  `).join('');
}

export function mapPlanToDisplay(plan = {}) {
  try {
    const id = normalizePlanId(plan);
    const name = normalizePlanName(plan, id);
    const price = toNumber(plan.price ?? plan.amount ?? plan.monthlyPrice, 0);
    const priceDisplay = String(plan.priceDisplay ?? '').trim() || formatRupiah(price);
    const period = normalizePeriod(plan, price);
    const fullPriceDisplay = getFullPriceDisplay(plan, price);
    const maxUsers = normalizeUserLimit(plan);
    const capacityUnit = normalizeCapacityUnit(plan);
    const capacityDisplay = formatCapacityDisplay(maxUsers, capacityUnit);
    const features = parseFeatures(plan.features);
    const popular = inferPopular(plan, id, price);

    return {
      id,
      name,
      price,
      priceDisplay,
      fullPriceDisplay,
      cta: String(plan.cta ?? plan.buttonText ?? 'Aktifkan Paket').trim() || 'Aktifkan Paket',
      period,
      maxUsers,
      capacityUnit,
      capacityDisplay,
      maxUsersDisplay: maxUsers === Number.POSITIVE_INFINITY
        ? 'Tak terbatas'
        : capacityDisplay,
      popular,
      description: String(
        plan.description ??
        plan.subtitle ??
        (price <= 0
          ? 'Cocok untuk mulai mencoba alur promo di sekolah.'
          : 'Cocok untuk sekolah yang ingin menjalankan promo dengan lebih rutin.')
      ).trim(),
      features
    };
  } catch (error) {
    console.error('Plan parsing failed:', error, plan);

    return {
      id: 'starter',
      name: 'Starter',
      price: 0,
      priceDisplay: 'Gratis',
      fullPriceDisplay: 'Gratis',
      cta: 'Aktifkan Paket',
      period: 'Selamanya',
      maxUsers: 0,
      capacityUnit: 'user',
      capacityDisplay: 'Belum ditentukan',
      maxUsersDisplay: 'Belum ditentukan',
      popular: false,
      description: 'Paket dasar untuk mulai mencoba platform.',
      features: []
    };
  }
}

export async function preloadPricingData() {
  try {
    await loadPricingData();
    console.log('Pricing data preloaded successfully');
  } catch (error) {
    console.warn('Pricing preload failed (fallback will be used):', error);
  }
}
