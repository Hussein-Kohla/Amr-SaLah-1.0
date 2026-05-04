import { query, mutation } from "./_generated/server";

export const getBarbers = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db
      .query("barbers")
      .filter((q) => q.eq(q.field("isActive"), true))
      .collect();
  },
});

export const populate = mutation({
  args: {},
  handler: async (ctx) => {
    // Delete all existing barbers
    const barbers = await ctx.db.query("barbers").collect();
    for (const b of barbers) {
      await ctx.db.delete(b._id);
    }
    // Insert only 2 barbers with local photos
    await ctx.db.insert("barbers", {
      nameAr: "عمرو صالح",
      nameEn: "Amr Saleh",
      photoUrl: "/barber-1.jpeg",
      workingHours: { start: "13:00", end: "01:00" },
      isActive: true,
    });
    await ctx.db.insert("barbers", {
      nameAr: "يوسف عمرو",
      nameEn: "Youssef Amr",
      photoUrl: "/barber-2.jpeg",
      workingHours: { start: "13:00", end: "01:00" },
      isActive: true,
    });
  },
});
