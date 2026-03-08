/**
 * Debug API Endpoint
 * Used to diagnose Telegram linking issues
 * 
 * Usage: GET /api/debug?userId=xxx
 * Returns user data from Google Sheets
 * 
 * Note: API routes use process.env directly (Node.js context)
 */

// Get GAS_URL from environment - VITE_ prefix for Vercel
const GAS_URL = process.env.VITE_GAS_URL;

/** @type {import('vercel').VercelApiHandler} */
export default async function handler(req, res) {
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (!GAS_URL) {
    return res.status(500).json({ error: 'VITE_GAS_URL not configured' });
  }

  try {
    const userId = req.query.userId;
    const email = req.query.email;

    if (!userId && !email) {
      return res.status(400).json({ error: 'userId or email required' });
    }

    // Try to get user profile from GAS
    const action = userId ? 'getProfile' : 'getProfile';
    const payload = userId 
      ? JSON.stringify({ action, userId })
      : JSON.stringify({ action, email });

    const response = await fetch(GAS_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'text/plain;charset=utf-8',
        'Accept': 'application/json'
      },
      body: payload
    });

    const text = await response.text();
    let userData;
    
    try {
      userData = JSON.parse(text);
    } catch (e) {
      return res.status(500).json({ 
        error: 'Failed to parse GAS response',
        raw: text
      });
    }

    // Return diagnostic info
    const diagnostic = {
      requested: { userId, email },
      userFound: userData.success === true,
      userData: userData.user ? {
        userId: userData.user.userId,
        chatId: userData.user.chatId || '(empty - NOT LINKED)',
        chatIdStatus: userData.user.chatId ? 'LINKED' : 'NOT_LINKED',
        email: userData.user.email,
        name: userData.user.name,
        status: userData.user.status,
        createdAt: userData.user.createdAt
      } : null,
      telegramLink: userId ? `https://t.me/spinXsmahada_bot?start=${userId}` : null,
      instructions: userData.user?.chatId 
        ? 'Telegram is linked! Try generating OTP again.'
        : 'Telegram is NOT linked. Click /start in Telegram first, then wait a few seconds.'
    };

    return res.status(200).json(diagnostic);

  } catch (error) {
    console.error('Debug error:', error);
    return res.status(500).json({ error: error.message });
  }
};

