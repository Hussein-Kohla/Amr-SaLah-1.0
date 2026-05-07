import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  users: defineTable({
    email: v.string(),
    phone: v.string(),
    verified: v.boolean(),
    createdAt: v.number(),
  }).index("by_email", ["email"]).index("by_phone", ["phone"]),

  otps: defineTable({
    email: v.string(),
    phone: v.string(),
    code: v.string(),
    expiresAt: v.number(),
    used: v.boolean(),
  }).index("by_email_code", ["email", "code"]),

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
    userId: v.optional(v.id("users")),
    date: v.string(),
    timeSlot: v.string(),
    status: v.union(
      v.literal("available"),
      v.literal("booked"),
      v.literal("blocked"),
      v.literal("confirmed"),
      v.literal("pending"),
      v.literal("rejected")
    ),
    customerName: v.string(),
    customerAge: v.number(),
    customerPhone: v.string(),
    customerEmail: v.optional(v.string()),
    wantsReminder: v.optional(v.boolean()),
    createdAt: v.number(),
  })
    .index("by_barber_date", ["barberId", "date"])
    .index("by_date", ["date"]),

  admins: defineTable({
    password: v.string(),
  }),

  blocks: defineTable({
    barberId: v.id("barbers"),
    date: v.string(),
    timeSlot: v.optional(v.string()), // if missing, block whole day
    reason: v.optional(v.string()),
    createdAt: v.number(),
  })
    .index("by_barber_date", ["barberId", "date"])
    .index("by_date", ["date"]),

  pushSubscriptions: defineTable({
    userId: v.optional(v.id("users")),
    appointmentId: v.optional(v.id("appointments")),
    subscription: v.any(), // JSON string or object from PushSubscription
    createdAt: v.number(),
  }).index("by_user", ["userId"]),

  userBlacklist: defineTable({
    type: v.union(v.literal("email"), v.literal("phone")),
    value: v.string(), // email or phone
    reason: v.optional(v.string()),
    createdAt: v.number(),
  }).index("by_value", ["value"]),
});
