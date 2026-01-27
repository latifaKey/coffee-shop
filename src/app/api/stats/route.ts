import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET - Fetch dashboard statistics
export async function GET() {
  try {
    // Fetch all stats in parallel for better performance
    const [
      totalProducts,
      activeNews,
      unreadMessages,
      totalMembers,
      activeClasses,
      totalPartnerships,
      scheduledBTG,
      recentEnrollments
    ] = await Promise.all([
      // Total produk
      prisma.product.count(),
      
      // Berita aktif (status = published)
      prisma.news.count({
        where: { status: "published" }
      }),
      
      // Pesan belum dibaca
      prisma.message.count({
        where: { isRead: false }
      }),
      
      // Total member (users dengan role member)
      prisma.user.count({
        where: { role: "member" }
      }),
      
      // Kelas aktif
      prisma.renamedclass.count({
        where: { status: "active" }
      }),
      
      // Total partnership
      prisma.partnership.count(),
      
      // BTG terjadwal
      prisma.schedule.count({
        where: { status: "scheduled" }
      }),
      
      // Pendaftaran kelas terbaru (30 hari terakhir) - menggunakan classregistration
      prisma.classregistration.count({
        where: {
          createdAt: {
            gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
          }
        }
      })
    ]);

    // Get recent activities
    const [recentMessages, recentNews, recentProducts] = await Promise.all([
      prisma.message.findMany({
        take: 5,
        orderBy: { createdAt: "desc" },
        select: {
          id: true,
          name: true,
          subject: true,
          createdAt: true,
          isRead: true
        }
      }),
      
      prisma.news.findMany({
        take: 5,
        orderBy: { createdAt: "desc" },
        select: {
          id: true,
          title: true,
          status: true,
          createdAt: true
        }
      }),
      
      prisma.product.findMany({
        take: 5,
        orderBy: { createdAt: "desc" },
        select: {
          id: true,
          name: true,
          category: true,
          createdAt: true
        }
      })
    ]);

    return NextResponse.json({
      stats: {
        totalProducts,
        activeNews,
        unreadMessages,
        totalMembers,
        activeClasses,
        totalPartnerships,
        scheduledBTG,
        recentEnrollments
      },
      recentActivities: {
        messages: recentMessages,
        news: recentNews,
        products: recentProducts
      }
    });
  } catch (error) {
    console.error("Stats API Error:", error);
    return NextResponse.json(
      { error: "Gagal mengambil statistik" },
      { status: 500 }
    );
  }
}
