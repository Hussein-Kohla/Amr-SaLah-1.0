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

    const VAPID_PUBLIC = "BB4UntPs40JhTTaJoTi5f-MYKLNxwg7MRKVPW2OgYBKpEeWlSXTFp5NAc1qE75EMo74RLLYJmZR-vvxImZa57-c";
    const VAPID_PRIVATE = "Gkad0jPeREfwBfrdRF2LZKwhpr-5_yw6RO0-AKE7-uI";

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
