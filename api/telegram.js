/**
 * Telegram Webhook Handler
 * Receives Telegram updates and processes /start commands
 * Forwards to Google Apps Script for user linking
 */

const TELEGRAM_BOT_TOKEN = process.env.VITE_TELEGRAM_BOT_TOKEN;

/** @type {import('vercel').VercelApiHandler} */
export default async function handler(req, res) {
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
    return res.status(200).json({ ok: true, message: 'Telegram bot is running' });
  }

  // Check if bot token is configured
  if (!TELEGRAM_BOT_TOKEN) {
    console.error('TELEGRAM_BOT_TOKEN not configured');
    return res.status(200).json({ ok: false, error: 'Bot not configured' });
  }

  try {
    // Get the body from Telegram
    const update = req.body;
    
    console.log('Telegram update received:', JSON.stringify(update));
    
    // Check if this is a message update
    if (!update.message) {
      // Handle callback_query (inline keyboard button clicks)
      if (update.callback_query) {
        console.log('Callback query received:', update.callback_query.data);
      }
      return res.status(200).json({ ok: true });
    }

    const message = update.message;
    const chatId = message.chat.id.toString();
    const text = message.text || '';
    const firstName = message.from?.first_name || '';
    const lastName = message.from?.last_name || '';

    console.log(`Message from ${chatId}: ${text}`);

    // Handle /start command
    if (text && text.startsWith('/start')) {
      // Extract user_id from /start command
      const parts = text.split(' ');
      const userId = parts.length > 1 ? parts[1] : null;

      if (userId) {
        console.log(`Linking user ${userId} with chat ${chatId}`);
        
        try {
          // Call GAS directly instead of using proxy to avoid issues
          const GAS_URL = process.env.VITE_GAS_URL;
          
          if (!GAS_URL) {
            await sendTelegramMessage(chatId, '❌ Server configuration error. Hubungi admin.');
            return res.status(200).json({ ok: true, error: 'GAS_URL not set' });
          }
          
          const payload = JSON.stringify({
            action: 'linkTelegram',
            userId: userId,
            chatId: chatId,
            firstName: firstName,
            lastName: lastName
          });

          console.log('Calling GAS:', payload);

          const response = await fetch(GAS_URL, {
            method: 'POST',
            headers: {
              'Content-Type': 'text/plain;charset=utf-8',
              'Accept': 'application/json'
            },
            body: payload
          });

          const resultText = await response.text();
          console.log('GAS raw response:', resultText);
          
          let result;
          try {
            result = JSON.parse(resultText);
          } catch (e) {
            console.error('Failed to parse GAS response:', resultText);
            result = { success: false, message: 'Invalid response from server' };
          }

          console.log('GAS response:', JSON.stringify(result));

          // Send confirmation message to user
          if (result.success) {
            let replyText = '✅ ' + result.message + '\n\n';
            replyText += 'Silakan klik "Kirim OTP" di website untuk mendapatkan kode verifikasi.';
            await sendTelegramMessage(chatId, replyText);
          } else {
            let replyText = '❌ ' + (result.message || 'Terjadi kesalahan');
            if (result.error === 'USER_NOT_FOUND') {
              replyText = '❌ User tidak ditemukan. Silakan registrasi terlebih dahulu di website.';
            }
            await sendTelegramMessage(chatId, replyText);
          }

          return res.status(200).json({ ok: true, linked: true, result });

        } catch (gasError) {
          console.error('GAS error:', gasError);
          await sendTelegramMessage(chatId, '❌ Terjadi kesalahan. Silakan coba lagi.');
          return res.status(200).json({ ok: true, error: gasError.message });
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
    // Return 200 to prevent Telegram from retrying
    return res.status(200).json({ ok: false, error: error.message });
  }
};

/**
 * Send message to Telegram
 */
async function sendTelegramMessage(chatId, text) {
  if (!TELEGRAM_BOT_TOKEN) {
    console.error('Cannot send message: TELEGRAM_BOT_TOKEN not set');
    return;
  }
  
  const url = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`;
  
  try {
    const response = await fetch(url, {
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
    
    const result = await response.json();
    console.log('Telegram send result:', JSON.stringify(result));
    
    if (!result.ok) {
      console.error('Telegram API error:', result.description);
    }
  } catch (error) {
    console.error('Error sending Telegram message:', error);
  }
}

