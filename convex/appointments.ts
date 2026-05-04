import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

export const getSlots = query({
  args: {
    barberId: v.id("barbers"),
    date: v.string(),
  },
  handler: async (ctx, { barberId, date }) => {
    // Get barber working hours
    const barber = await ctx.db.get(barberId);
    if (!barber) return [];

    // Get existing appointments for this barber on this date
    const appointments = await ctx.db
      .query("appointments")
      .withIndex("by_barber_date", (q) =>
        q.eq("barberId", barberId).eq("date", date)
      )
      .collect();

    const bookedMap = new Map(
      appointments.map((a) => [a.timeSlot, a.status])
    );

    // Generate 30-min slots within working hours
    const slots: { time: string; status: "available" | "booked" | "blocked" | "confirmed" | "outside" }[] = [];
    
    let startH = 10, startM = 0;
    let endH = 22, endM = 0;

    try {
      const cleanStart = barber.workingHours.start.trim();
      const cleanEnd = barber.workingHours.end.trim();
      
      const startParts = cleanStart.replace(/[^0-9:]/g, '').split(":");
      const endParts = cleanEnd.replace(/[^0-9:]/g, '').split(":");
      
      startH = Number(startParts[0] || 10);
      startM = Number(startParts[1] || 0);
      endH = Number(endParts[0] || 22);
      endM = Number(endParts[1] || 0);

      if (cleanStart.toLowerCase().includes('pm') && startH !== 12) startH += 12;
      if (cleanEnd.toLowerCase().includes('pm') && endH !== 12) endH += 12;
      if (cleanStart.toLowerCase().includes('am') && startH === 12) startH = 0;
      if (cleanEnd.toLowerCase().includes('am') && endH === 12) endH = 0;
      if (endH < startH) {
        endH += 24;
      }
    } catch (e) {
      console.error("Error parsing time", e);
    }

    let current = startH * 60 + startM;
    const end = endH * 60 + endM;

    while (current < end) {
      const hours = Math.floor(current / 60);
      const mins = current % 60;
      
      const hours12 = hours % 12 || 12;
      const actualHours = hours % 24;
      const ampm = actualHours < 12 ? 'AM' : 'PM';
      const time = `${String(hours12).padStart(2, "0")}:${String(mins).padStart(2, "0")} ${ampm}`;

      const existingStatus = bookedMap.get(time);
      slots.push({
        time,
        status: existingStatus === "booked" || existingStatus === "blocked" || existingStatus === "confirmed"
          ? existingStatus
          : "available",
      });

      current += 60; // 60-minute slots
    }

    // Add 6 Waiting List slots
    for (let i = 1; i <= 6; i++) {
      const time = `Waiting ${i}`;
      const existingStatus = bookedMap.get(time);
      slots.push({
        time,
        status: existingStatus === "booked" || existingStatus === "blocked" || existingStatus === "confirmed"
          ? existingStatus
          : "available",
      });
    }

    return slots;
  },
});

export const createAppointment = mutation({
  args: {
    barberId: v.id("barbers"),
    date: v.string(),
    timeSlot: v.string(),
    customerName: v.string(),
    customerAge: v.number(),
    customerPhone: v.string(),
  },
  handler: async (ctx, args) => {
    // Check if slot is still available
    const existing = await ctx.db
      .query("appointments")
      .withIndex("by_barber_date", (q) =>
        q.eq("barberId", args.barberId).eq("date", args.date)
      )
      .filter((q) => q.eq(q.field("timeSlot"), args.timeSlot))
      .first();

    if (existing && (existing.status === "booked" || existing.status === "blocked" || existing.status === "confirmed")) {
      throw new Error("SLOT_TAKEN");
    }

    const id = await ctx.db.insert("appointments", {
      barberId: args.barberId,
      date: args.date,
      timeSlot: args.timeSlot,
      status: "booked",
      customerName: args.customerName,
      customerAge: args.customerAge,
      customerPhone: args.customerPhone,
      createdAt: Date.now(),
    });

    return id;
  },
});

