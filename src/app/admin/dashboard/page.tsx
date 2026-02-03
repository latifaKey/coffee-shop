import Link from "next/link";
import { prisma } from "@/lib/prisma";
import type { Metadata } from "next";
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
      take: 3,
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
      take: 3,
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

// Status badge helper - sama dengan Member
function getStatusBadge(status: string) {
  const statusMap: Record<string, { label: string; className: string }> = {
    published: { label: "Dipublikasi", className: "status-published" },
    draft: { label: "Draft", className: "status-draft" },
  };
  const info = statusMap[status] || { label: status, className: "status-default" };
  return <span className={`status-badge ${info.className}`}>{info.label}</span>;
}

export default async function AdminDashboard() {
  // Fetch data directly in Server Component
  const { stats, recentMessages, recentNews } = await getDashboardData();

  return (
    <div className="admin-dashboard admin-dashboard-spacious">
      {/* Welcome Section - Compact seperti Member */}
      <div className="welcome-section">
        <div className="welcome-content">
          <span className="welcome-greeting">{getGreeting()},</span>
          <h1 className="welcome-name">Admin BARIZTA ☕</h1>
          <p className="welcome-subtitle">Kelola seluruh sistem BARIZTA Coffee Shop</p>
        </div>
      </div>

      {/* Quick Stats - Grid 4 kolom seperti Member */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon">📦</div>
          <div className="stat-info">
            <span className="stat-number">{stats.totalProducts}</span>
            <span className="stat-label">Total Produk</span>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">📰</div>
          <div className="stat-info">
            <span className="stat-number">{stats.activeNews}</span>
            <span className="stat-label">Berita Aktif</span>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">📩</div>
          <div className="stat-info">
            <span className="stat-number">{stats.unreadMessages}</span>
            <span className="stat-label">Pesan Baru</span>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">👥</div>
          <div className="stat-info">
            <span className="stat-number">{stats.totalMembers}</span>
            <span className="stat-label">Total Member</span>
          </div>
        </div>
      </div>

      {/* Quick Actions - Grid 4 kolom seperti Member */}
      <div className="section-compact">
        <h2 className="section-title">Menu Cepat</h2>
        <div className="quick-actions">
          <Link href="/admin/products" className="action-card">
            <span className="action-icon">📦</span>
            <span className="action-label">Kelola Produk</span>
          </Link>
          <Link href="/admin/classes" className="action-card">
            <span className="action-icon">📚</span>
            <span className="action-label">Kelas Edukasi</span>
          </Link>
          <Link href="/admin/messages" className="action-card">
            <span className="action-icon">📩</span>
            <span className="action-label">Pesan Masuk</span>
          </Link>
          <Link href="/admin/news" className="action-card">
            <span className="action-icon">📰</span>
            <span className="action-label">Kelola Berita</span>
          </Link>
        </div>
      </div>

      {/* Recent Activity - Dual Column seperti Member */}
      <div className="activity-grid">
        {/* Pesan Terbaru */}
        <div className="section-compact">
          <div className="section-header">
            <h2 className="section-title">Pesan Terbaru</h2>
            {recentMessages.length > 0 && (
              <Link href="/admin/messages" className="view-all">Lihat Semua →</Link>
            )}
          </div>
          
          {recentMessages.length === 0 ? (
            <div className="empty-state">
              <span className="empty-icon">📭</span>
              <h3>Tidak Ada Pesan Baru</h3>
              <p>Semua pesan sudah ditangani</p>
            </div>
          ) : (
            <div className="activity-list">
              {recentMessages.map((msg) => (
                <div key={msg.id} className={`activity-item ${!msg.isRead ? 'unread' : ''}`}>
                  <div className="activity-info">
                    <span className="activity-program">{msg.subject}</span>
                    <span className="activity-date">dari {msg.name} · {formatDate(msg.createdAt)}</span>
                  </div>
                  {!msg.isRead && <span className="unread-badge">Baru</span>}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Berita Terbaru */}
        <div className="section-compact">
          <div className="section-header">
            <h2 className="section-title">Berita Terbaru</h2>
            {recentNews.length > 0 && (
              <Link href="/admin/news" className="view-all">Lihat Semua →</Link>
            )}
          </div>
          
          {recentNews.length === 0 ? (
            <div className="empty-state">
              <span className="empty-icon">📰</span>
              <h3>Tidak Ada Berita</h3>
              <p>Buat berita baru untuk memulai</p>
            </div>
          ) : (
            <div className="activity-list">
              {recentNews.map((news) => (
                <div key={news.id} className="activity-item">
                  <div className="activity-info">
                    <span className="activity-program">{news.title}</span>
                    <span className="activity-date">{formatDate(news.createdAt)}</span>
                  </div>
                  {getStatusBadge(news.status)}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Info Cards - Dual Column seperti Member */}
      <div className="info-cards">
        <div className="info-card">
          <span className="info-icon">💡</span>
          <div className="info-content">
            <h4>Tips Admin</h4>
            <p>Periksa pesan masuk secara berkala untuk respon cepat kepada customer</p>
          </div>
        </div>
        <div className="info-card">
          <span className="info-icon">📊</span>
          <div className="info-content">
            <h4>Statistik Bulan Ini</h4>
            <p>{stats.recentEnrollments} pendaftaran kelas baru • {stats.activeClasses} kelas aktif</p>
          </div>
        </div>
      </div>
    </div>
  );
}