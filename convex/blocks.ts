import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

export const getBlocks = query({
  args: {
    date: v.optional(v.string()),
    barberId: v.optional(v.id("barbers")),
  },
  handler: async (ctx, args) => {
    let q = ctx.db.query("blocks");
    
    if (args.barberId && args.date) {
      return await ctx.db
        .query("blocks")
        .withIndex("by_barber_date", (q) =>
          q.eq("barberId", args.barberId!).eq("date", args.date!)
        )
        .collect();
    }
    
    if (args.date) {
      return await ctx.db
        .query("blocks")
        .withIndex("by_date", (q) => q.eq("date", args.date!))
        .collect();
    }

    return await q.collect();
  },
});

export const toggleBlock = mutation({
  args: {
    barberId: v.id("barbers"),
    date: v.string(),
    timeSlot: v.optional(v.string()), // if null, toggle whole day
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("blocks")
      .withIndex("by_barber_date", (q) =>
        q.eq("barberId", args.barberId).eq("date", args.date)
      )
      .filter((q) => q.eq(q.field("timeSlot"), args.timeSlot))
      .first();

    if (existing) {
      await ctx.db.delete(existing._id);
      return { action: "unblocked" };
    } else {
      // If we are blocking a whole day, maybe clear individual slot blocks first?
      if (!args.timeSlot) {
        const slots = await ctx.db
          .query("blocks")
          .withIndex("by_barber_date", (q) =>
            q.eq("barberId", args.barberId).eq("date", args.date)
          )
          .collect();
        for (const s of slots) {
          await ctx.db.delete(s._id);
        }
      }

      await ctx.db.insert("blocks", {
        barberId: args.barberId,
        date: args.date,
        timeSlot: args.timeSlot,
        createdAt: Date.now(),
      });
      return { action: "blocked" };
    }
  },
});
