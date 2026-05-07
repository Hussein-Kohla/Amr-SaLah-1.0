import { mutation, action } from "./_generated/server";
import { v } from "convex/values";
import { api } from "./_generated/api";
import { Resend } from "resend";

export const generateOtp = mutation({
  args: {
    email: v.string(),
    phone: v.string(),
  },
  handler: async (ctx, args) => {
    // Check if user has an active OTP (optional, could just invalidate old ones)
    const existing = await ctx.db
      .query("otps")
      .withIndex("by_email_code", (q) => q.eq("email", args.email))
      .filter((q) => q.eq(q.field("used"), false))
      .collect();
      
    for (const otp of existing) {
      await ctx.db.patch(otp._id, { used: true });
    }

    // Generate 6 digit OTP
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = Date.now() + 5 * 60 * 1000; // 5 minutes

    const otpId = await ctx.db.insert("otps", {
      email: args.email,
      phone: args.phone,
      code,
      expiresAt,
      used: false,
    });

    return { otpId, code };
  },
});

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

    const resendApiKey = process.env.RESEND_API_KEY;
    if (!resendApiKey) {
      console.warn(`[DEV] No RESEND_API_KEY found. OTP for ${args.email}: ${code}`);
      return; // Mock success in dev if no key
    }

    const resend = new Resend(resendApiKey);

    try {
      await resend.emails.send({
        from: "Amr Salah _ Barber Shop <onboarding@resend.dev>",
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

export const verifyOtp = mutation({
  args: {
    email: v.string(),
    code: v.string(),
    phone: v.string(),
  },
  handler: async (ctx, args) => {
    const existingOtp = await ctx.db
      .query("otps")
      .withIndex("by_email_code", (q) =>
        q.eq("email", args.email).eq("code", args.code)
      )
      .filter((q) => q.eq(q.field("used"), false))
      .first();

    if (!existingOtp) {
      throw new Error("INVALID_OTP");
    }

    if (Date.now() > existingOtp.expiresAt) {
      throw new Error("EXPIRED_OTP");
    }

    // Mark as used
    await ctx.db.patch(existingOtp._id, { used: true });

    // Find or create user
    let user = await ctx.db
      .query("users")
      .withIndex("by_email", (q) => q.eq("email", args.email))
      .first();

    if (!user) {
      const userId = await ctx.db.insert("users", {
        email: args.email,
        phone: args.phone,
        verified: true,
        createdAt: Date.now(),
      });
      user = await ctx.db.get(userId);
    } else {
      await ctx.db.patch(user._id, { verified: true, phone: args.phone });
    }

    return user?._id;
  },
});
