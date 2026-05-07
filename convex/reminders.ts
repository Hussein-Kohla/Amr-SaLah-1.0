"use node";
import { action } from "./_generated/server";
import { v } from "convex/values";
import { Resend } from "resend";

export const sendReminder = action({
  args: {
    email: v.optional(v.string()),
    title: v.string(),
    body: v.string(),
    customerName: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const results = { email: false };

    // Send Email Notification
    if (args.email) {
      const resendApiKey = process.env.RESEND_API_KEY;
      if (resendApiKey) {
        const resend = new Resend(resendApiKey);
        try {
          await resend.emails.send({
            from: "Amr Salah _ Barber Shop <onboarding@resend.dev>",
            to: args.email,
            subject: args.title,
            html: `
              <div dir="rtl" style="font-family: Arial, sans-serif; text-align: right; background: #0f0f1a; color: #ffffff; padding: 30px; border-radius: 20px; border: 1px solid #c8a050;">
                <h2 style="color: #c8a050; margin-bottom: 20px;">⏰ تذكير بموعد حلاقتك - صالون عمرو صلاح</h2>
                <p style="font-size: 16px;">مرحباً ${args.customerName || 'عميلنا العزيز'}،</p>
                <p style="font-size: 18px; font-weight: bold; color: #c8a050;">${args.body}</p>
                <p style="margin-top: 30px; border-top: 1px solid #333; pt: 20px; font-size: 14px; color: #888;">
                  نحن بانتظارك في الموعد المحدد. يرجى الحضور قبل الموعد بـ 10 دقائق.
                </p>
                <div style="margin-top: 20px; text-align: center;">
                  <a href="https://amrsalah.vercel.app" style="background: #c8a050; color: #000; padding: 10px 25px; border-radius: 10px; text-decoration: none; font-weight: bold;">زيارة الموقع</a>
                </div>
              </div>
            `,
          });
          results.email = true;
        } catch (error) {
          console.error("Error sending email reminder:", error);
        }
      }
    }

    return results;
  },
});

