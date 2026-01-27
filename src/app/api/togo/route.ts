import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET - Ambil semua data To Go untuk public (termasuk jadwal lokasi)
export async function GET() {
  try {
    // Dapatkan tanggal 30 hari yang lalu (untuk menampilkan jadwal terbaru termasuk yang baru lewat)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    thirtyDaysAgo.setHours(0, 0, 0, 0);

    const [menus, gallery, features, settings, schedules] = await Promise.all([
      prisma.togomenu.findMany({
        where: { isActive: true },
        orderBy: { order: "asc" },
      }),
      prisma.togogallery.findMany({
        where: { isActive: true },
        orderBy: { order: "asc" },
      }),
      prisma.togofeature.findMany({
        where: { isActive: true },
        orderBy: { order: "asc" },
      }),
      prisma.togosetting.findMany(),
      // Ambil jadwal terjadwal dalam 30 hari terakhir hingga mendatang
      prisma.schedule.findMany({
        where: {
          status: "scheduled",
          date: { gte: thirtyDaysAgo },
        },
        orderBy: { date: "asc" },
        take: 10, // Maksimal 10 jadwal
      }),
    ]);

    // Convert settings array to object
    const settingsObj: Record<string, string> = {};
    settings.forEach((s) => {
      settingsObj[s.key] = s.value;
    });

    return NextResponse.json({
      menus,
      gallery,
      features,
      settings: settingsObj,
      schedules,
    });
  } catch (error) {
    console.error("Error fetching togo data:", error);
    return NextResponse.json(
      { error: "Failed to fetch data" },
      { status: 500 }
    );
  }
}
