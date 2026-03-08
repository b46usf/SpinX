/**
 * Auth Configuration Module
 * Contains Google Sign-In client ID and app settings
 * SINGLE SOURCE - Import this in all other modules
 * 
 * IMPORTANT: Set environment variables in Vercel Dashboard with prefix 
 * Example: GOOGLE_CLIENT_ID, GAS_URL, etc.
 * 
 * These values are exposed via Vite's import.meta.env
 */

// Helper function to get environment variable (Vite way)
function getEnvVar(name, required = false) {
  // Vite uses import.meta.env with  prefix
  // eslint-disable-next-line no-undef
  const value = import.meta.env[`${name}`];
  
  if (!value && required) {
    console.warn(`⚠️ Warning: ${name} is not set. Please configure in Vercel dashboard (${name})`);
  }
  
  return value;
}

// Google OAuth Client ID (REQUIRED - set in Vercel)
export const CLIENT_ID = getEnvVar('GOOGLE_CLIENT_ID', true) || '';

// Google Apps Script Deployment URL (REQUIRED - set in Vercel)
export const GAS_URL = getEnvVar('GAS_URL', true) || '';

// API endpoint - use Vercel proxy to solve CORS
export const API_URL = '/api/proxy';

// Telegram Bot Username (optional)
export const TELEGRAM_BOT_USERNAME = getEnvVar('TELEGRAM_BOT_USERNAME', false) || '';

// Vercel URL for webhook (optional)
export const VERCEL_URL = getEnvVar('VERCEL_URL', false) || '';

// Full Telegram webhook URL
export const TELEGRAM_WEBHOOK_URL = VERCEL_URL ? `https://${VERCEL_URL}/api/telegram` : '';

// Validate required config
const isConfigured = !!(CLIENT_ID && GAS_URL);

if (!isConfigured) {
  console.error('❌ Error: Missing required environment variables!');
  console.error('Please set GOOGLE_CLIENT_ID and GAS_URL in Vercel dashboard');
}

// Export all config as single object
export const AUTH_CONFIG = {
  CLIENT_ID,
  GAS_URL,
  API_URL,
  TELEGRAM_BOT_USERNAME,
  TELEGRAM_WEBHOOK_URL,
  VERCEL_URL,
  isConfigured
};

// Also expose to window for non-module scripts
if (typeof window !== 'undefined') {
  window.AUTH_CONFIG = AUTH_CONFIG;
}

