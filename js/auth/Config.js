/**
 * Auth Configuration Module
 * Contains Google Sign-In client ID and app settings
 * SINGLE SOURCE - Import this in all other modules
 * 
 * Environment variables can be set in .env file (for local) or Vercel dashboard (for production)
 * 
 * IMPORTANT: Create a .env file based on .env.example and fill in your values
 */

// Helper function to get environment variable
function getEnvVar(name, required = true) {
  const value = process.env[name];
  if (!value && required) {
    console.warn(`⚠️ Warning: ${name} is not set. Please configure .env file or Vercel environment variables.`);
  }
  return value;
}

// Google OAuth Client ID (from environment - REQUIRED)
export const CLIENT_ID = getEnvVar('GOOGLE_CLIENT_ID');

// Google Apps Script Deployment URL (from environment - REQUIRED)
export const GAS_URL = getEnvVar('GAS_URL');

// API endpoint - use Vercel proxy to solve CORS
export const API_URL = '/api/proxy';

// Telegram Bot Username (without @) - from environment
export const TELEGRAM_BOT_USERNAME = getEnvVar('TELEGRAM_BOT_USERNAME', false);

// Vercel URL for webhook (from environment)
export const VERCEL_URL = getEnvVar('VERCEL_URL', false);

// Full Telegram webhook URL (constructed from VERCEL_URL)
export const TELEGRAM_WEBHOOK_URL = 'https://' + VERCEL_URL + '/api/telegram';

// Validate required config on load
if (!CLIENT_ID || !GAS_URL) {
  console.error('❌ Error: Missing required environment variables!');
  console.error('Please copy .env.example to .env and configure the values.');
}

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

