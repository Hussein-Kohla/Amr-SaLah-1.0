"use node";
import { action } from "./_generated/server";
import { api } from "./_generated/api";
import { v } from "convex/values";
import nodemailer from "nodemailer";

export const sendOtpEmail = action({
  args: {
    email: v.string(),
    phone: v.string(),
  },
  handler: async (ctx, args) => {
    const { code } = await ctx.runMutation(api.auth.generateOtp, {
      email: args.email,
      phone: args.phone,
    });

    const gmailUser = process.env.GMAIL_USER;
    const gmailPass = process.env.GMAIL_PASS;

    if (!gmailUser || !gmailPass) {
      console.warn(`[DEV] No GMAIL_USER/PASS found. OTP for ${args.email}: ${code}`);
      return; 
    }

    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: gmailUser,
        pass: gmailPass,
      },
    });

    try {
      await transporter.sendMail({
        from: `"Amr Salah _ Barber Shop" <${gmailUser}>`,
        to: args.email,
        subject: "Your BarberPro Verification Code",
        html: `
          <div dir="rtl" style="font-family: Arial, sans-serif; text-align: right;">
            <h2>كود التحقق الخاص بك</h2>
            <p>مرحباً، كود التحقق الخاص بك هو:</p>
            <h1 style="color: #4A90E2; letter-spacing: 5px;">${code}</h1>
            <p>هذا الكود صالح لمدة 5 دقائق فقط.</p>
          </div>
        `,
      });
    } catch (e) {
      console.error("Failed to send OTP email:", e);
      throw new Error("Failed to send OTP email");
    }
  },
});

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
      const gmailUser = process.env.GMAIL_USER;
      const gmailPass = process.env.GMAIL_PASS;

      if (gmailUser && gmailPass) {
        const transporter = nodemailer.createTransport({
          service: "gmail",
          auth: {
            user: gmailUser,
            pass: gmailPass,
          },
        });

        try {
          await transporter.sendMail({
            from: `"Amr Salah _ Barber Shop" <${gmailUser}>`,
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
      } else {
        console.warn("GMAIL_USER or GMAIL_PASS not set in environment variables.");
      }
    }

    return results;
  },
});

