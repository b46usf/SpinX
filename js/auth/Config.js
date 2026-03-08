/**
 * Auth Configuration Module
 * SINGLE SOURCE - Import this in all other modules
 * 
 * Environment variables (set in Vercel Dashboard with VITE_ prefix):
 * - VITE_GOOGLE_CLIENT_ID
 * - VITE_GAS_URL
 * - VITE_TELEGRAM_BOT_TOKEN
 * - VITE_TELEGRAM_BOT_USERNAME
 * - VITE_VERCEL_URL
 */

// Access environment variables directly (Vite exposes VITE_ prefix to client)
const ENV = import.meta.env;

// Google OAuth Client ID
export const CLIENT_ID = ENV.VITE_GOOGLE_CLIENT_ID || '';

// Google Apps Script Deployment URL
export const GAS_URL = ENV.VITE_GAS_URL || '';

// Telegram Bot Token (for server-side API routes)
export const TELEGRAM_BOT_TOKEN = ENV.VITE_TELEGRAM_BOT_TOKEN || '';

// Telegram Bot Username
export const TELEGRAM_BOT_USERNAME = ENV.VITE_TELEGRAM_BOT_USERNAME || '';

// Vercel URL for webhook
export const VERCEL_URL = ENV.VITE_VERCEL_URL || '';

// Full Telegram webhook URL
export const TELEGRAM_WEBHOOK_URL = VERCEL_URL ? `https://${VERCEL_URL}/api/telegram` : '';

// API endpoint - use Vercel proxy to solve CORS
export const API_URL = '/api/proxy';

// Validate required config
const isConfigured = !!(CLIENT_ID && GAS_URL);

if (!isConfigured) {
  console.warn('⚠️ Warning: Missing required environment variables!');
  console.warn('Please set VITE_GOOGLE_CLIENT_ID and VITE_GAS_URL in Vercel dashboard');
}

// Export all config as single object
export const AUTH_CONFIG = {
  CLIENT_ID,
  GAS_URL,
  TELEGRAM_BOT_TOKEN,
  TELEGRAM_BOT_USERNAME,
  TELEGRAM_WEBHOOK_URL,
  VERCEL_URL,
  API_URL,
  isConfigured
};

// Also expose to window for non-module scripts
if (typeof window !== 'undefined') {
  window.AUTH_CONFIG = AUTH_CONFIG;
}

