import { query, mutation } from "./_generated/server";
import { v } from "convex/values";
import { api } from "./_generated/api";

function getReminderTime(date: string, timeSlot: string) {
  if (timeSlot.startsWith('Waiting')) return null;
  try {
    const timeMatch = timeSlot.match(/(\d+):(\d+)\s*(AM|PM)?/i);
    if (!timeMatch) return null;
    let hours = parseInt(timeMatch[1]);
    const mins = parseInt(timeMatch[2]);
    const period = timeMatch[3]?.toUpperCase();
    if (period === 'PM' && hours !== 12) hours += 12;
    if (period === 'AM' && hours === 12) hours = 0;
    
    // date is YYYY-MM-DD. We assume Egypt time (UTC+3)
    // To handle this correctly in Convex (which uses UTC), we should construct the date 
    // and then subtract 3 hours to get UTC, then subtract 15 mins.
    const [year, month, day] = date.split('-').map(Number);
    const targetDate = new Date(Date.UTC(year, month - 1, day, hours, mins));
    // Egypt is UTC+3, so we subtract 3 hours from the Target (which is Egypt time) to get UTC
    const utcTarget = targetDate.getTime() - (3 * 60 * 60 * 1000);
    
    return utcTarget - (15 * 60 * 1000);
  } catch (e) {
    return null;
  }
}

export const getSlots = query({
// ... (rest of getSlots)
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

    // Get blocks for this barber on this date
    const blocks = await ctx.db
      .query("blocks")
      .withIndex("by_barber_date", (q) =>
        q.eq("barberId", barberId).eq("date", date)
      )
      .collect();

    const isDayBlocked = blocks.some(b => !b.timeSlot);
    const blockedSlots = new Set(blocks.filter(b => b.timeSlot).map(b => b.timeSlot));

    const bookedMap = new Map(
      appointments.map((a) => [a.timeSlot, a.status])
    );

    // Generate 30-min slots within working hours
    const slots: { time: string; status: "available" | "booked" | "blocked" | "confirmed" | "pending" | "outside" }[] = [];
    
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
      const isBlocked = isDayBlocked || blockedSlots.has(time);

      let status: "available" | "booked" | "blocked" | "confirmed" | "pending" | "outside" = isBlocked 
        ? "blocked"
        : (existingStatus === "booked" || existingStatus === "blocked" || existingStatus === "confirmed" || existingStatus === "pending")
          ? existingStatus as any
          : "available";

      // T-Fix: Block past slots if date is today (Assume Egypt Time UTC+3)
      const nowEgypt = new Date(Date.now() + 3 * 60 * 60 * 1000);
      const todayEgypt = nowEgypt.toISOString().split('T')[0];
      
      if (status === "available" && date === todayEgypt) {
        const slotTime = new Date(date);
        let h = actualHours;
        // T-Fix: If slot is 12 AM and we're looking at a day that starts in the morning,
        // it's actually midnight TONIGHT (start of next day), not the past midnight.
        if (h === 0) {
            slotTime.setDate(slotTime.getDate() + 1);
        }
        slotTime.setHours(h, mins, 0, 0);

        // T-Fix: Allow booking the current hour slot until the next hour begins
        const slotEndTime = slotTime.getTime() + 60 * 60 * 1000;
        if (nowEgypt.getTime() >= slotEndTime) {
          status = "blocked";
        }
      }

      slots.push({
        time,
        status,
      });

      current += 60; // 60-minute slots
    }

    // Add 6 Waiting List slots
    for (let i = 1; i <= 6; i++) {
      const time = `Waiting ${i}`;
      const existingStatus = bookedMap.get(time);
      const isBlocked = isDayBlocked || blockedSlots.has(time);

      slots.push({
        time,
        status: isBlocked
          ? "blocked"
          : (existingStatus === "booked" || existingStatus === "blocked" || existingStatus === "confirmed" || existingStatus === "pending")
            ? existingStatus as any
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
    customerEmail: v.optional(v.string()),
    userId: v.optional(v.id("users")),
    wantsReminder: v.optional(v.boolean()),
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

    if (existing && (existing.status === "booked" || existing.status === "blocked" || existing.status === "confirmed" || existing.status === "pending")) {
      throw new Error("SLOT_TAKEN");
    }

    // Check if customer is blocked by email or phone
    const emailToCheck = args.customerEmail?.trim().toLowerCase();
    const phoneToCheck = args.customerPhone.replace(/\s/g, '');

    const isBlocked = await ctx.db
      .query("userBlacklist")
      .filter((q) => 
        q.or(
          q.eq(q.field("value"), emailToCheck),
          q.eq(q.field("value"), phoneToCheck)
        )
      )
      .first();

    if (isBlocked) {
      throw new Error("USER_BLOCKED");
    }

    const id = await ctx.db.insert("appointments", {
      barberId: args.barberId,
      date: args.date,
      timeSlot: args.timeSlot,
      status: "pending",
      customerName: args.customerName,
      customerAge: args.customerAge,
      customerPhone: args.customerPhone,
      customerEmail: args.customerEmail,
      userId: args.userId,
      wantsReminder: args.wantsReminder,
      createdAt: Date.now(),
    });

    // Automatically schedule email reminder 15 mins before
    if (args.customerEmail) {
      const reminderTime = getReminderTime(args.date, args.timeSlot);
      if (reminderTime && reminderTime > Date.now()) {
        await ctx.scheduler.runAt(reminderTime, api.reminders.sendReminder, {
          email: args.customerEmail,
          customerName: args.customerName,
          title: "⏰ تذكير بموعد حلاقتك - صالون عمرو صلاح",
          body: `باقي 15 دقيقة على موعد حجزك (${args.timeSlot}) يوم ${args.date}. ننتظرك بكل حب!`,
        });
      }
    }

    return id;
  },
});


