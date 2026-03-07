/**
 * Auth Configuration Module
 * Contains Google Sign-In client ID and app settings
 * SINGLE SOURCE - Import this in all other modules
 */

// Google OAuth Client ID
export const CLIENT_ID = '88663261491-iermq433pje0kinqderrp9lbar5k6fsk.apps.googleusercontent.com';

// Google Apps Script Deployment URL
// Get from Google Apps Script -> Deploy -> Web app -> Copy URL
export const GAS_URL = 'https://script.google.com/macros/s/AKfycby-CC0Kvio5cJsA4n4i8-h1XGdAQweITDzMfScw-08u4lufi-CGfPA0kIoxz4JX1JkR/exec';

// API endpoint - use Vercel proxy to solve CORS
export const API_URL = '/api/proxy';

// Export all config as single object
export const AUTH_CONFIG = {
  CLIENT_ID,
  GAS_URL,
  API_URL
};

// Also expose to window for non-module scripts
if (typeof window !== 'undefined') {
  window.AUTH_CONFIG = AUTH_CONFIG;
}

