/**
 * Vercel API Proxy for Google Apps Script
 * Solves CORS issues by calling GAS from server-side
 * 
 * Note: API routes use process.env directly (Node.js context)
 */

// Get GAS_URL from environment - VITE_ prefix for Vercel
const GAS_URL = process.env.VITE_GAS_URL;

/** @type {import('vercel').VercelApiHandler} */
export default async function handler(req, res) {
  // Validate environment
  if (!GAS_URL) {
    console.error('❌ VITE_GAS_URL not configured in Vercel environment variables');
    return res.status(500).json({ 
      error: 'Configuration Error', 
      message: 'VITE_GAS_URL is not configured. Please set it in Vercel dashboard.'
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

