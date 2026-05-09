import { httpRouter } from "convex/server";
import { httpAction } from "./_generated/server";
import { api } from "./_generated/api";

const http = httpRouter();

http.route({
  path: "/telegram-webhook",
  method: "POST",
  handler: httpAction(async (ctx, request) => {
    const body = await request.json();
    
    // Check if it's a message
    if (body.message && body.message.text) {
      const text = body.message.text;
      const chatId = body.message.chat.id;

      // Handle /start [phone]
      if (text.startsWith("/start")) {
        const parts = text.split(" ");
        if (parts.length > 1) {
          const phone = parts[1];
          
          // Look up OTP
          const otp = await ctx.runQuery(api.auth.getOtpByPhone, { phone });
          
          if (otp) {
            const message = `مرحباً! كود التحقق الخاص بك هو:\n\n${otp.code}\n\nصالح لمدة 15 دقيقة.`;
            await sendTelegramMessage(message, chatId);
          } else {
            await sendTelegramMessage("عذراً، لم نجد كود فعال لهذا الرقم. يرجى المحاولة مرة أخرى من الموقع.", chatId);
          }
        } else {
          await sendTelegramMessage("مرحباً بك في صالون عمرو صلاح! يرجى استخدام الرابط المرسل لك من الموقع لتلقي الكود.", chatId);
        }
      }
    }

    return new Response(null, { status: 200 });
  }),
});

async function sendTelegramMessage(text: string, chatId: number) {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  if (!token) return;

  const url = `https://api.telegram.org/bot${token}/sendMessage`;
  await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      chat_id: chatId,
      text: text,
    }),
  });
}

export default http;
