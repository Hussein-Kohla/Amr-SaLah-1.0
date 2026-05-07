"use node";
import { action } from "./_generated/server";
import { v } from "convex/values";

export const sendPushNotification = action({
  args: {
    subscription: v.any(),
    title: v.string(),
    body: v.string(),
    url: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    // T-Fix: Use dynamic import for Node modules to avoid bundling errors in mixed environments
    const webpushModule = await import("web-push");
    const webpush = (webpushModule as any).default || webpushModule;

    const VAPID_PUBLIC = "BOuRW7k0MYPtbLHvgvrmStKvgN1znLHRr01XFKaYTRmT-C2ED6Nm_lcW-4lx2QTT_zhJ1zYDuDcmE8BvruTSbL0";
    const VAPID_PRIVATE = "II3p2w8_AC1zceZfd-2yoBz0v8TvtU2B75HsWrFuK6Y";

    webpush.setVapidDetails(
      "mailto:example@yourdomain.com",
      VAPID_PUBLIC,
      VAPID_PRIVATE
    );

    try {
      await webpush.sendNotification(
        args.subscription,
        JSON.stringify({
          title: args.title,
          body: args.body,
          url: args.url || "/",
        })
      );
      return { success: true };
    } catch (error) {
      console.error("Error sending push notification:", error);
      return { success: false, error: String(error) };
    }
  },
});
