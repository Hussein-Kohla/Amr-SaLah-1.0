import { mutation } from "./_generated/server";
import { v } from "convex/values";
import { api } from "./_generated/api";

export const saveSubscription = mutation({
  args: {
    userId: v.optional(v.id("users")),
    appointmentId: v.optional(v.id("appointments")),
    subscription: v.any(),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("pushSubscriptions", {
      userId: args.userId,
      appointmentId: args.appointmentId,
      subscription: args.subscription,
      createdAt: Date.now(),
    });
  },
});

export const saveAndScheduleReminder = mutation({
  args: {
    appointmentId: v.id("appointments"),
    subscription: v.any(),
    scheduledTime: v.number(),
    title: v.string(),
    body: v.string(),
    email: v.optional(v.string()),
    customerName: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    await ctx.db.insert("pushSubscriptions", {
      appointmentId: args.appointmentId,
      subscription: args.subscription,
      createdAt: Date.now(),
    });

    // Schedule the unified reminder (Push + Email)
    await ctx.scheduler.runAt(args.scheduledTime, api.reminders.sendReminder, {
      subscription: args.subscription,
      email: args.email,
      customerName: args.customerName,
      title: args.title,
      body: args.body,
    });
  },
});
