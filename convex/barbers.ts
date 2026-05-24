import { query, mutation } from "./_generated/server";

const DEFAULT_WORKING_HOURS = { start: "13:00", end: "01:00" } as const;

const TEAM_BARBERS = [
  {
    nameAr: "عمرو صالح",
    nameEn: "Amr Saleh",
    photoUrl: "/barber-1.jpeg",
  },
  {
    nameAr: "يوسف عمرو",
    nameEn: "Youssef Amr",
    photoUrl: "/barber-2.jpeg",
  },
  {
    nameAr: "محمد صلاح",
    nameEn: "Mohamed Salah",
    photoUrl: "/barber-3.jpg",
  },
  {
    nameAr: "مصطفى طه",
    nameEn: "Mustafa Taha",
    photoUrl: "/barber-4.jpg",
  },
] as const;

/** Inserts missing team barbers only — never deletes or updates existing rows. */
export const ensureTeamBarbers = mutation({
  args: {},
  handler: async (ctx) => {
    const existing = await ctx.db.query("barbers").collect();
    const existingPhotos = new Set(existing.map((b) => b.photoUrl));
    const inserted: string[] = [];

    for (const barber of TEAM_BARBERS) {
      if (existingPhotos.has(barber.photoUrl)) continue;
      await ctx.db.insert("barbers", {
        ...barber,
        workingHours: { ...DEFAULT_WORKING_HOURS },
        isActive: true,
      });
      inserted.push(barber.nameAr);
    }

    return {
      inserted,
      skipped: TEAM_BARBERS.length - inserted.length,
      totalActive: existing.length + inserted.length,
    };
  },
});

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
    // Re-seed full team (dev only — orphans bookings.barberId if IDs change)
    for (const barber of TEAM_BARBERS) {
      await ctx.db.insert("barbers", {
        ...barber,
        workingHours: { ...DEFAULT_WORKING_HOURS },
        isActive: true,
      });
    }
  },
});
