/**
 * Telegram Webhook Handler
 * Receives Telegram updates and processes /start commands
 * Forwards to Google Apps Script for user linking
 */

module.exports = async function handler(req, res) {
  // CORS headers
  res.setHeader('Access-Control-Allow-Credentials', true);
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
    // Get the body from Telegram
    const update = req.body;
    
    console.log('Telegram update received:', JSON.stringify(update));
    
    // Check if this is a message update
    if (!update.message) {
      return res.status(200).json({ ok: true, no_message: true });
    }

    const message = update.message;
    const chatId = message.chat.id.toString();
    const text = message.text || '';
    const firstName = message.from?.first_name || '';
    const lastName = message.from?.last_name || '';

    // Handle /start command
    if (text && text.startsWith('/start')) {
      // Extract user_id from /start command
      const parts = text.split(' ');
      const userId = parts.length > 1 ? parts[1] : null;

      if (userId) {
        // Forward to GAS via Vercel proxy to avoid CORS issues
        const PROXY_URL = '/api/proxy';
        
        const payload = JSON.stringify({
          action: 'linkTelegram',
          userId: userId,
          chatId: chatId,
          firstName: firstName,
          lastName: lastName
        });

        console.log('Forwarding to GAS:', payload);

        try {
          const response = await fetch(PROXY_URL, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json'
            },
            body: payload
          });

          const result = await response.json();

          console.log('GAS response:', JSON.stringify(result));

          // Send confirmation message to user
          let replyText = '';
          if (result.success) {
            replyText = '✅ ' + result.message + '\n\n';
            if (result.debug_otp) {
              replyText += '📝 *Kode OTP:* `' + result.debug_otp + '` (untuk testing)\n';
            }
            replyText += 'Silakan masukkan kode OTP di website.';
          } else {
            replyText = '❌ ' + (result.message || 'Terjadi kesalahan');
          }

          await sendTelegramMessage(chatId, replyText);

          return res.status(200).json({ ok: true, linked: true });

        } catch (gasError) {
          console.error('GAS error:', gasError);
          
          // Still send error message to user
          await sendTelegramMessage(chatId, '❌ Terjadi kesalahan. Silakan coba lagi.');
          
          return res.status(200).json({ ok: false, error: gasError.message });
        }

      } else {
        // Just /start without user_id
        const welcomeText = '🎮 *Game Spin Diskon UMKM*\n\n';
        welcomeText += 'Selamat datang' + (firstName ? ' ' + firstName : '') + '!\n\n';
        welcomeText += 'Untuk verifikasi akun, silakan klik link dari website kami.';

        await sendTelegramMessage(chatId, welcomeText);

        return res.status(200).json({ ok: true, welcome: true });
      }
    }

    // Handle /help command
    if (text === '/help') {
      const helpText = '🎮 *Game Spin Diskon UMKM*\n\n';
      helpText += '/start - Mulai verifikasi\n';
      helpText += '/help - Lihat bantuan\n';

      await sendTelegramMessage(chatId, helpText);

      return res.status(200).json({ ok: true, help: true });
    }

    // Handle other messages
    const defaultText = '🎮 *Game Spin Diskon UMKM*\n\n';
    defaultText += 'Kirim /start untuk memulai verifikasi akun.\n';
    defaultText += 'Kirim /help untuk melihat bantuan.';

    await sendTelegramMessage(chatId, defaultText);

    return res.status(200).json({ ok: true, default: true });

  } catch (error) {
    console.error('Telegram webhook error:', error);
    return res.status(500).json({ error: 'Internal Server Error', message: error.message });
  }
};

/**
 * Send message to Telegram
 */
async function sendTelegramMessage(chatId, text) {
  const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
  
  if (!TELEGRAM_BOT_TOKEN) {
    console.error('TELEGRAM_BOT_TOKEN not configured');
    return;
  }

  const url = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`;
  
  try {
    await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        chat_id: chatId,
        text: text,
        parse_mode: 'Markdown'
      })
    });
  } catch (error) {
    console.error('Error sending Telegram message:', error);
  }
}

