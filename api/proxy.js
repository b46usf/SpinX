/**
 * Vercel API Proxy for Google Apps Script
 * Solves CORS issues by calling GAS from server-side
 */

// Vercel API route
module.exports = async function handler(req, res) {
  // Enhanced CORS headers
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.setHeader('Cross-Origin-Opener-Policy', 'same-origin-allow-popups');
  res.setHeader('Cross-Origin-Embedder-Policy', 'require-corp');

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
    
    // Get GAS URL from environment variable or use default from Config
    const GAS_URL = process.env.GAS_URL || 'https://script.google.com/macros/s/AKfycby-CC0Kvio5cJsA4n4i8-h1XGdAQweITDzMfScw-08u4lufi-CGfPA0kIoxz4JX1JkR/exec';
    
    const payload = JSON.stringify({ action, ...data });
    
    // Make request with redirect follow mode
    const response = await fetch(GAS_URL, {
      method: 'POST',
      redirect: 'follow',
      headers: {
        'Content-Type': 'text/plain;charset=utf-8',
        'Accept': 'application/json'
      },
      body: payload
    });
    
    // Get response status and text
    const status = response.status;
    const text = await response.text();
    
    // Check if response is valid
    if (status >= 400) {
      console.error('GAS returned error:', status, text);
      return res.status(502).json({ 
        error: 'Bad Gateway', 
        message: 'Failed to connect to GAS',
        details: text.substring(0, 500)
      });
    }
    
    try {
      const jsonData = JSON.parse(text);
      return res.status(200).json(jsonData);
    } catch (parseError) {
      console.error('Failed to parse GAS response:', text);
      // Try to return as text if JSON parsing fails
      return res.status(200).json({ 
        success: true, 
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

