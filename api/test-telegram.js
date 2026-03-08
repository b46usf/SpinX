/**
 * Test Telegram Configuration Endpoint
 * Tests if Telegram Bot Token is properly configured
 * 
 * Usage: GET /api/test-telegram
 */

const TELEGRAM_BOT_TOKEN = process.env.VITE_TELEGRAM_BOT_TOKEN;

/** @type {import('vercel').VercelApiHandler} */
export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const result = {
    telegramBotTokenConfigured: !!TELEGRAM_BOT_TOKEN,
    telegramBotTokenPrefix: TELEGRAM_BOT_TOKEN ? TELEGRAM_BOT_TOKEN.substring(0, 15) + '...' : 'NOT SET',
    vercelUrl: process.env.VERCEL_URL || 'NOT SET',
    telegramWebhookUrl: process.env.VERCEL_URL 
      ? `https://${process.env.VERCEL_URL}/api/telegram` 
      : 'NOT SET (VERCEL_URL not set)'
  };

  // Test Telegram Bot API if token is configured
  if (TELEGRAM_BOT_TOKEN) {
    try {
      const botInfoUrl = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/getMe`;
      const botResponse = await fetch(botInfoUrl);
      const botData = await botResponse.json();
      
      result.botApiStatus = botData.ok ? 'OK' : 'ERROR';
      result.botInfo = botData.result ? {
        id: botData.result.id,
        is_bot: botData.result.is_bot,
        first_name: botData.result.first_name,
        username: botData.result.username,
        can_join_groups: botData.result.can_join_groups,
        can_read_all_group_messages: botData.result.can_read_all_group_messages
      } : null;
      
      if (botData.ok) {
        // Check webhook info
        const webhookUrl = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/getWebhookInfo`;
        const webhookResponse = await fetch(webhookUrl);
        const webhookData = await webhookResponse.json();
        
        result.webhookInfo = webhookData.result ? {
          url: webhookData.result.url || 'NOT SET',
          has_custom_certificate: webhookData.result.has_custom_certificate,
          pending_update_count: webhookData.result.pending_update_count,
          last_error_date: webhookData.result.last_error_date,
          last_error_message: webhookData.result.last_error_message
        } : null;
        
        result.webhookConfigured = !!webhookData.result?.url;
      }
      
    } catch (error) {
      result.botApiError = error.message;
    }
  }

  // Add instructions based on results
  result.instructions = [];
  
  if (!TELEGRAM_BOT_TOKEN) {
    result.instructions.push('❌ Set TELEGRAM_BOT_TOKEN in Vercel environment variables');
  }
  
  if (TELEGRAM_BOT_TOKEN && !result.botApiStatus) {
    result.instructions.push('❌ Telegram Bot Token is invalid');
  }
  
  if (TELEGRAM_BOT_TOKEN && result.botApiStatus === 'OK' && !result.webhookConfigured) {
    result.instructions.push('⚠️ Telegram Bot is working but webhook is NOT set');
    result.instructions.push('   To set webhook, use:');
    result.instructions.push(`   https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/setWebhook?url=https://YOUR_VERCEL_URL/api/telegram`);
  }
  
  if (TELEGRAM_BOT_TOKEN && result.webhookConfigured) {
    result.instructions.push('✅ Telegram Bot and webhook are properly configured!');
  }

  return res.status(200).json(result);
};

