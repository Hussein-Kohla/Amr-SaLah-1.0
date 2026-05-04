import { mutation } from "./_generated/server";

export const seedBarbers = mutation({
  args: {},
  handler: async (ctx) => {
    const existing = await ctx.db.query("barbers").first();
    if (existing) {
      return "Already seeded";
    }

    const barber1 = await ctx.db.insert("barbers", {
      nameAr: "أحمد محمود",
      nameEn: "Ahmed Mahmoud",
      photoUrl: "https://images.unsplash.com/photo-1621605815971-fbc98d665033?w=400&h=400&fit=crop&crop=face",
      workingHours: { start: "13:00", end: "01:00" },
      isActive: true,
    });

    const barber2 = await ctx.db.insert("barbers", {
      nameAr: "محمد علي",
      nameEn: "Mohammed Ali",
      photoUrl: "https://images.unsplash.com/photo-1622286342621-4bd786c2447c?w=400&h=400&fit=crop&crop=face",
      workingHours: { start: "13:00", end: "01:00" },
      isActive: true,
    });

    const barber3 = await ctx.db.insert("barbers", {
      nameAr: "خالد سعيد",
      nameEn: "Khaled Saeed",
      photoUrl: "https://images.unsplash.com/photo-1503951914875-452162b0f3f1?w=400&h=400&fit=crop&crop=face",
      workingHours: { start: "13:00", end: "01:00" },
      isActive: true,
    });

    // Get today's date in YYYY-MM-DD format
    const today = new Date();
    const todayStr = today.toISOString().split("T")[0];

    // Add some sample booked appointments for today
    await ctx.db.insert("appointments", {
      barberId: barber1,
      date: todayStr,
      timeSlot: "10:00",
      status: "booked",
      customerName: "عمر حسن",
      customerAge: 28,
      customerPhone: "+966501234567",
      createdAt: Date.now(),
    });

    await ctx.db.insert("appointments", {
      barberId: barber1,
      date: todayStr,
      timeSlot: "14:00",
      status: "booked",
      customerName: "سعد الرشيد",
      customerAge: 35,
      customerPhone: "+966509876543",
      createdAt: Date.now(),
    });

    await ctx.db.insert("appointments", {
      barberId: barber2,
      date: todayStr,
      timeSlot: "11:00",
      status: "booked",
      customerName: "فيصل العتيبي",
      customerAge: 22,
      customerPhone: "+966551112233",
      createdAt: Date.now(),
    });

    await ctx.db.insert("appointments", {
      barberId: barber3,
      date: todayStr,
      timeSlot: "15:00",
      status: "blocked",
      customerName: "",
      customerAge: 0,
      customerPhone: "",
      createdAt: Date.now(),
    });

    return "Seeded 3 barbers and 4 sample appointments";
  },
});
