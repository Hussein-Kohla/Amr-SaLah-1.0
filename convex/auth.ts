import { mutation, action } from "./_generated/server";
import { v } from "convex/values";
import { api } from "./_generated/api";

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
