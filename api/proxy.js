/**
 * Vercel API Proxy for Google Apps Script
 * Solves CORS issues by calling GAS from server-side
 * 
 * Environment variables (set in Vercel dashboard):
 * - GAS_URL: Google Apps Script deployment URL
 * 
 * Note: This runs on server-side, so process.env is available
 */

// Default fallback (for development only - should be set in Vercel)
const DEFAULT_GAS_URL = 'https://script.google.com/macros/s/AKfycby-CC0Kvio5cJsA4n4i8-h1XGdAQweITDzMfScw-08u4lufi-CGfPA0kIoxz4JX1JkR/exec';

module.exports = async function handler(req, res) {
  // Get GAS_URL from environment - try multiple ways for compatibility
  let GAS_URL = process.env.GAS_URL;
  
  // Fallback to default if not set (for development)
  if (!GAS_URL) {
    console.warn('⚠️ GAS_URL not set, using default fallback. Set in Vercel dashboard for production.');
    GAS_URL = DEFAULT_GAS_URL;
  }

  // CORS headers
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  // Handle preflight
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // Only allow POST
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Get the body
    const body = req.body || {};
    
    // Debug log
    console.log('Proxy received:', { action: body?.action, timestamp: new Date().toISOString() });
    
    // Extract action for logging
    const action = body?.action || 'unknown';
    
    // Forward the payload to GAS
    const payload = JSON.stringify(body);
    
    console.log(`Forwarding to GAS [${action}]:`, payload);
    
    // Make request to GAS
    const response = await fetch(GAS_URL, {
      method: 'POST',
      redirect: 'follow',
      headers: {
        'Content-Type': 'text/plain;charset=utf-8',
        'Accept': 'application/json'
      },
      body: payload
    });
    
    // Get response
    const status = response.status;
    const text = await response.text();
    
    // Handle error responses
    if (status >= 400) {
      console.error(`GAS error [${action}]:`, status, text);
      return res.status(502).json({ 
        error: 'Bad Gateway', 
        message: 'Failed to connect to GAS',
        action: action,
        details: text.substring(0, 500)
      });
    }
    
    // Parse JSON response
    try {
      const jsonData = JSON.parse(text);
      console.log(`GAS response [${action}]:`, jsonData);
      return res.status(200).json(jsonData);
    } catch (parseError) {
      console.error(`Failed to parse GAS response [${action}]:`, text);
      return res.status(200).json({ 
        success: true, 
        action: action,
        raw: text 
      });
    }
    
  } catch (error) {
    console.error('Proxy error:', error);
    return res.status(500).json({ 
      error: 'Internal Server Error', 
      message: error.message 
    });
  }
};

