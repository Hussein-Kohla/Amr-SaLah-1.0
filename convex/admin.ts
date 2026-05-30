import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

export const login = mutation({
  args: { password: v.string() },
  handler: async (ctx, args) => {
    const admins = await ctx.db.query("admins").collect();

    // Seed the initial admin password if none exist
    if (admins.length === 0) {
      await ctx.db.insert("admins", { password: "AmrAdmin@1" });
      return args.password === "AmrAdmin@1";
    }

    const admin = admins.find(a => a.password === args.password);
    return !!admin;
  },
});

export const getAppointments = query({
  handler: async (ctx) => {
    const appointments = await ctx.db.query("bookings").order("desc").collect();
    const barbers = await ctx.db.query("barbers").collect();
    
    const barbersMap = new Map(barbers.map(b => [b._id.toString(), b]));

    return appointments.map(app => ({
      ...app,
      barber: barbersMap.get(app.barberId.toString()) || null,
    }));
  },
});

export const updateAppointmentStatus = mutation({
  args: { 
    id: v.id("bookings"),
    status: v.union(v.literal("available"), v.literal("booked"), v.literal("blocked"), v.literal("confirmed"), v.literal("cancelled"))
  },
  handler: async (ctx, args) => {
    const patchData: any = { status: args.status };
    if (args.status === "cancelled") {
      patchData.cancelledBy = "admin";
    }
    await ctx.db.patch(args.id, patchData);
  },
});

export const deleteAppointment = mutation({
  args: { id: v.id("bookings") },
  handler: async (ctx, args) => {
    await ctx.db.delete(args.id);
  },
});

export const adminCreateAppointment = mutation({
  args: {
    barberId: v.id("barbers"),
    date: v.string(),
    timeSlot: v.string(),
    customerName: v.string(),
    customerAge: v.number(),
    customerPhone: v.string(),
    customerEmail: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    // 1. Check for existing booking
    const existingBooking = await ctx.db
      .query("bookings")
      .withIndex("by_barber_date", (q) =>
        q.eq("barberId", args.barberId).eq("date", args.date)
      )
      .filter((q) => q.eq(q.field("timeSlot"), args.timeSlot))
      .first();

    if (existingBooking) {
      await ctx.db.delete(existingBooking._id);
    }

    // 2. Check for existing block
    const existingBlock = await ctx.db
      .query("blocks")
      .withIndex("by_barber_date", (q) =>
        q.eq("barberId", args.barberId).eq("date", args.date)
      )
      .filter((q) => q.eq(q.field("timeSlot"), args.timeSlot))
      .first();

    if (existingBlock) {
      await ctx.db.delete(existingBlock._id);
    }

    // 3. Create new confirmed booking
    return await ctx.db.insert("bookings", {
      barberId: args.barberId,
      date: args.date,
      timeSlot: args.timeSlot,
      status: "confirmed",
      customerName: args.customerName,
      customerAge: args.customerAge,
      customerPhone: args.customerPhone,
      customerEmail: args.customerEmail,
      createdAt: Date.now(),
    });
  },
});

export const updateAppointment = mutation({
  args: {
    id: v.id("bookings"),
    barberId: v.optional(v.id("barbers")),
    customerName: v.string(),
    customerAge: v.number(),
    customerPhone: v.string(),
    customerEmail: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const { id, ...data } = args;
    await ctx.db.patch(id, data);
  },
});
