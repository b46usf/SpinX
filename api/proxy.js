/**
 * Vercel API Proxy for Google Apps Script
 * Solves CORS issues by calling GAS from server-side
 * Note: Uses environment variable for GAS_URL
 */

// Vercel API route - use module.exports for Vercel
module.exports = async function handler(req, res) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,POST');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  // Handle preflight
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // Only allow POST
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { action, ...data } = req.body;
    
    // Get GAS URL from environment variable or use default
    // In production, set VERCEL_GAS_URL in Vercel project settings
    const GAS_URL = process.env.GAS_URL || process.env.GAS_URL || 'https://script.google.com/macros/s/AKfycby-CC0Kvio5cJsA4n4i8-h1XGdAQweITDzMfScw-08u4lufi-CGfPA0kIoxz4JX1JkR/exec';
    
    const payload = JSON.stringify({ action, ...data });
    
    const response = await fetch(GAS_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'text/plain;charset=utf-8'
      },
      body: payload
    });
    
    const text = await response.text();
    
    try {
      const jsonData = JSON.parse(text);
      return res.status(200).json(jsonData);
    } catch (parseError) {
      console.error('Failed to parse GAS response:', text);
      return res.status(502).json({ error: 'Invalid response from GAS', details: text });
    }
    
  } catch (error) {
    console.error('Proxy error:', error);
    return res.status(500).json({ error: 'Internal server error', message: error.message });
  }
};

