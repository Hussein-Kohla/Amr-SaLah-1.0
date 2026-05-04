import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  barbers: defineTable({
    nameAr: v.string(),
    nameEn: v.string(),
    photoUrl: v.string(),
    workingHours: v.object({
      start: v.string(),
      end: v.string(),
    }),
    isActive: v.boolean(),
  }),

  appointments: defineTable({
    barberId: v.id("barbers"),
    date: v.string(),
    timeSlot: v.string(),
    status: v.union(
      v.literal("available"),
      v.literal("booked"),
      v.literal("blocked"),
      v.literal("confirmed")
    ),
    customerName: v.string(),
    customerAge: v.number(),
    customerPhone: v.string(),
    createdAt: v.number(),
  })
    .index("by_barber_date", ["barberId", "date"])
    .index("by_date", ["date"]),

  admins: defineTable({
    password: v.string(),
  }),
});
