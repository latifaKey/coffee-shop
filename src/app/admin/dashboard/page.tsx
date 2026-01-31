import Link from "next/link";
import { prisma } from "@/lib/prisma";
import type { Metadata } from "next";
import { StatCard, ActionCard, InfoCard, ActivityCard } from "@/components/ui";
import { getGreeting, formatDate } from "@/lib/utils";
import "./dashboard.css";

// Metadata untuk SEO
export const metadata: Metadata = {
  title: 'Dashboard Admin | BARIZTA Coffee',
  description: 'Admin dashboard untuk mengelola BARIZTA Coffee Shop',
};

// Revalidate setiap 60 detik untuk data fresh tanpa client-side fetching
export const revalidate = 60;

interface DashboardStats {
  totalProducts: number;
  activeNews: number;
  unreadMessages: number;
  totalMembers: number;
  activeClasses: number;
  totalPartnerships: number;
  scheduledBTG: number;
  recentEnrollments: number;
}

interface RecentMessage {
  id: number;
  name: string;
  subject: string;
  createdAt: Date;
  isRead: boolean;
}

interface RecentNews {
  id: number;
  title: string;
  status: string;
  createdAt: Date;
}

// Server Component - Data fetching di server
async function getDashboardData() {
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
    
    // Pendaftaran kelas terbaru (30 hari terakhir)
    prisma.classregistration.count({
      where: {
        createdAt: {
          gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
        }
      }
    })
  ]);

  // Get recent activities
  const [recentMessages, recentNews] = await Promise.all([
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
    })
  ]);

  return {
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
    recentMessages,
    recentNews
  };
}

export default async function AdminDashboard() {
  // Fetch data directly in Server Component
  const { stats, recentMessages, recentNews } = await getDashboardData();

  return (
    <div className="admin-dashboard">
      {/* Welcome Section */}
      <div className="welcome-section">
        <div className="welcome-content">
          <span className="welcome-greeting">{getGreeting()},</span>
          <div className="title-row">
            <h1 className="welcome-name">Admin BARIZTA ☕</h1>
            <p className="welcome-subtitle">Kelola seluruh sistem BARIZTA Coffee Shop dengan mudah dan efisien</p>
          </div>
        </div>
      </div>

      {/* Stats Grid - Menggunakan StatCard Component */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard 
          icon="📦"
          label="Total Produk"
          value={stats.totalProducts}
          href="/admin/products"
        />
        <StatCard 
          icon="📰"
          label="Berita Aktif"
          value={stats.activeNews}
          variant="info"
          href="/admin/news"
        />
        <StatCard 
          icon="📩"
          label="Pesan Baru"
          value={stats.unreadMessages}
          variant="warning"
          href="/admin/messages"
        />
        <StatCard 
          icon="👥"
          label="Total Member"
          value={stats.totalMembers}
          variant="success"
        />
        <StatCard 
          icon="📚"
          label="Kelas Aktif"
          value={stats.activeClasses}
          variant="info"
          href="/admin/classes"
        />
        <StatCard 
          icon="🤝"
          label="Kolaborasi"
          value={stats.totalPartnerships}
          href="/admin/partnership"
        />
      </div>

      {/* Quick Actions - Menggunakan ActionCard Component */}
      <div className="section-compact">
        <h2 className="section-title">Menu Cepat</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          <ActionCard icon="📦" label="Kelola Produk" href="/admin/products" />
          <ActionCard icon="📰" label="Kelola Berita" href="/admin/news" />
          <ActionCard icon="📩" label="Pesan Masuk" href="/admin/messages" />
          <ActionCard icon="📚" label="Kelas Edukasi" href="/admin/classes" />
          <ActionCard icon="🚐" label="BARIZTA To Go" href="/admin/btg" />
          <ActionCard icon="🤝" label="Kolaborasi" href="/admin/partnership" />
          <ActionCard icon="ℹ️" label="Tentang Kami" href="/admin/about" />
          <ActionCard icon="🌐" label="Kelola Website" href="/admin/website" />
        </div>
      </div>

      {/* Recent Activities - Menggunakan ActivityCard Component */}
      <div className="section-compact">
        <h2 className="section-title">Aktivitas Terbaru</h2>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <ActivityCard
            icon="📩"
            title="Pesan Terbaru"
            viewAllHref="/admin/messages"
            emptyMessage="Tidak ada pesan"
            items={recentMessages.map(msg => ({
              id: msg.id,
              title: msg.subject,
              subtitle: `dari ${msg.name} · ${formatDate(msg.createdAt)}`,
              isUnread: !msg.isRead,
            }))}
          />
          
          <ActivityCard
            icon="📰"
            title="Berita Terbaru"
            viewAllHref="/admin/news"
            emptyMessage="Tidak ada berita"
            items={recentNews.map(news => ({
              id: news.id,
              title: news.title,
              subtitle: formatDate(news.createdAt),
              badge: {
                text: news.status,
                variant: news.status === 'published' ? 'published' as const : 'draft' as const,
              },
            }))}
          />
        </div>
      </div>

      {/* Info Cards - Menggunakan InfoCard Component */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <InfoCard
          icon="💡"
          title="Tips Admin"
          description="Periksa pesan masuk secara berkala untuk respon cepat kepada customer"
        />
        <InfoCard
          icon="📊"
          title="Statistik"
          description={`Total ${stats.recentEnrollments} pendaftaran kelas baru bulan ini`}
        />
      </div>
    </div>
  );
}