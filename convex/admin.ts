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
    status: v.union(v.literal("available"), v.literal("booked"), v.literal("blocked"), v.literal("confirmed"))
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.id, { status: args.status });
  },
});

export const deleteAppointment = mutation({
  args: { id: v.id("bookings") },
  handler: async (ctx, args) => {
    await ctx.db.delete(args.id);
  },
});
