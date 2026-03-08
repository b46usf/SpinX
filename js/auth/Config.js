/**
 * Auth Configuration Module
 * Contains Google Sign-In client ID and app settings
 * SINGLE SOURCE - Import this in all other modules
 * 
 * IMPORTANT: You can override these values by setting window.AUTH_CONFIG
 * before this module is loaded, or configure in Vercel dashboard
 * 
 * Default values are provided as fallback for development
 */

// Default configuration values
const DEFAULT_CONFIG = {
  CLIENT_ID: '88663261491-iermq433pje0kinqderrp9lbar5k6fsk.apps.googleusercontent.com',
  GAS_URL: 'https://script.google.com/macros/s/AKfycby-CC0Kvio5cJsA4n4i8-h1XGdAQweITDzMfScw-08u4lufi-CGfPA0kIoxz4JX1JkR/exec',
  TELEGRAM_BOT_USERNAME: 'spinXsmahada_bot',
  VERCEL_URL: 'spin-x-smahada.vercel.app'
};

// Helper function to get environment variable (works with Vite, webpack, or window override)
function getEnvVar(name, defaultValue) {
  // Check window override first (for manual configuration)
  if (typeof window !== 'undefined' && window.AUTH_CONFIG && window.AUTH_CONFIG[name]) {
    return window.AUTH_CONFIG[name];
  }
  
  // Try to get from import.meta.env (Vite) or process.env (Node.js/build)
  // eslint-disable-next-line no-undef
  const envValue = typeof import.meta !== 'undefined' ? import.meta.env?.[name] : null;
  if (envValue) return envValue;
  
  // Return default value if no override
  return defaultValue;
}

// Google OAuth Client ID
export const CLIENT_ID = getEnvVar('GOOGLE_CLIENT_ID', DEFAULT_CONFIG.CLIENT_ID);

// Google Apps Script Deployment URL
export const GAS_URL = getEnvVar('GAS_URL', DEFAULT_CONFIG.GAS_URL);

// API endpoint - use Vercel proxy to solve CORS
export const API_URL = '/api/proxy';

// Telegram Bot Username (without @)
export const TELEGRAM_BOT_USERNAME = getEnvVar('TELEGRAM_BOT_USERNAME', DEFAULT_CONFIG.TELEGRAM_BOT_USERNAME);

// Vercel URL for webhook
export const VERCEL_URL = getEnvVar('VERCEL_URL', DEFAULT_CONFIG.VERCEL_URL);

// Full Telegram webhook URL (constructed from VERCEL_URL)
export const TELEGRAM_WEBHOOK_URL = 'https://' + VERCEL_URL + '/api/telegram';

// Export all config as single object
export const AUTH_CONFIG = {
  CLIENT_ID,
  GAS_URL,
  API_URL,
  TELEGRAM_BOT_USERNAME,
  TELEGRAM_WEBHOOK_URL,
  VERCEL_URL,
  isConfigured: !!(CLIENT_ID && GAS_URL)
};

// Also expose to window for non-module scripts
if (typeof window !== 'undefined') {
  window.AUTH_CONFIG = AUTH_CONFIG;
}

