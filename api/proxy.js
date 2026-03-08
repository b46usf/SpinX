/**
 * Vercel API Proxy for Google Apps Script
 * Solves CORS issues by calling GAS from server-side
 * 
 * Environment variables (set in Vercel dashboard):
 * - GAS_URL: Google Apps Script deployment URL
 * 
 * Note: This runs on server-side (Vercel Serverless Functions)
 */

// Default fallback for development - HARDCODED HERE FOR NOW
// In production, set this in Vercel Dashboard Environment Variables
const DEFAULT_GAS_URL = 'https://script.google.com/macros/s/AKfycby-CC0Kvio5cJsA4n4i8-h1XGdAQweITDzMfScw-08u4lufi-CGfPA0kIoxz4JX1JkR/exec';

module.exports = async function handler(req, res) {
  // Get GAS_URL from environment - with fallback for development
  const envGAS_URL = process.env.GAS_URL;
  const GAS_URL = envGAS_URL || DEFAULT_GAS_URL;
  
  // Log for debugging
  console.log('=== Vercel API Proxy ===');
  console.log('GAS_URL from env:', !!envGAS_URL);
  console.log('Using GAS_URL:', GAS_URL);
  console.log('Request method:', req.method);
  console.log('Request body:', JSON.stringify(req.body).substring(0, 200));

  // Validate environment
  if (!GAS_URL) {
    console.error('❌ GAS_URL not configured in Vercel environment variables');
    return res.status(500).json({ 
      error: 'Configuration Error', 
      message: 'GAS_URL is not configured. Please set it in Vercel dashboard.'
    });
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
    const body = req.body || {};
    const action = body?.action || 'unknown';
    
    console.log(`Processing action: ${action}`);
    
    // Forward the payload to GAS
    const payload = JSON.stringify(body);
    
    console.log(`Forwarding to GAS: ${GAS_URL}`);
    console.log('Payload:', payload);
    
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
    
    console.log(`GAS response status: ${status}`);
    console.log(`GAS response text: ${text.substring(0, 500)}`);
    
    // Handle error responses from GAS
    if (status >= 400) {
      console.error(`GAS error [${action}]:`, status, text);
      return res.status(502).json({ 
        error: 'Bad Gateway', 
        message: 'Failed to connect to GAS',
        gasStatus: status,
        gasResponse: text.substring(0, 500)
      });
    }
    
    // Parse JSON response
    try {
      const jsonData = JSON.parse(text);
      console.log(`GAS response [${action}]:`, jsonData);
      return res.status(200).json(jsonData);
    } catch (parseError) {
      console.error(`Failed to parse GAS response [${action}]:`, text);
      // Return as raw text if not JSON
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
      message: error.message,
      stack: error.stack
    });
  }
};

