import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

export const list = query({
  handler: async (ctx) => {
    return await ctx.db.query("userBlacklist").order("desc").collect();
  },
});

export const block = mutation({
  args: {
    type: v.union(v.literal("email"), v.literal("phone")),
    value: v.string(),
    reason: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    // Check if already blocked
    const existing = await ctx.db
      .query("userBlacklist")
      .withIndex("by_value", (q) => q.eq("value", args.value))
      .first();
    
    if (existing) return existing._id;

    return await ctx.db.insert("userBlacklist", {
      type: args.type,
      value: args.value,
      reason: args.reason,
      createdAt: Date.now(),
    });
  },
});

export const unblock = mutation({
  args: { id: v.id("userBlacklist") },
  handler: async (ctx, args) => {
    await ctx.db.delete(args.id);
  },
});

export const checkBlocked = query({
  args: { email: v.optional(v.string()), phone: v.optional(v.string()) },
  handler: async (ctx, args) => {
    if (args.email) {
      const blocked = await ctx.db
        .query("userBlacklist")
        .withIndex("by_value", (q) => q.eq("value", args.email))
        .first();
      if (blocked) return { blocked: true, type: "email", reason: blocked.reason };
    }
    if (args.phone) {
      const blocked = await ctx.db
        .query("userBlacklist")
        .withIndex("by_value", (q) => q.eq("value", args.phone))
        .first();
      if (blocked) return { blocked: true, type: "phone", reason: blocked.reason };
    }
    return { blocked: false };
  },
});
