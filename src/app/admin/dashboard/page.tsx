"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import "./dashboard.css";

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
  createdAt: string;
  isRead: boolean;
}

interface RecentNews {
  id: number;
  title: string;
  status: string;
  createdAt: string;
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<DashboardStats>({
    totalProducts: 0,
    activeNews: 0,
    unreadMessages: 0,
    totalMembers: 0,
    activeClasses: 0,
    totalPartnerships: 0,
    scheduledBTG: 0,
    recentEnrollments: 0
  });
  const [recentMessages, setRecentMessages] = useState<RecentMessage[]>([]);
  const [recentNews, setRecentNews] = useState<RecentNews[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/stats");
      if (!response.ok) throw new Error("Failed to fetch stats");
      
      const data = await response.json();
      setStats(data.stats);
      setRecentMessages(data.recentActivities.messages);
      setRecentNews(data.recentActivities.news);
      setError("");
    } catch (err) {
      console.error("Dashboard fetch error:", err);
      setError("Gagal memuat data dashboard");
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Selamat Pagi";
    if (hour < 15) return "Selamat Siang";
    if (hour < 18) return "Selamat Sore";
    return "Selamat Malam";
  };

  if (loading) return null;

  return (
    <div className="admin-dashboard">
      {/* Welcome Section - Sama dengan Member */}
      <div className="welcome-section">
        <div className="welcome-content">
          <span className="welcome-greeting">{getGreeting()},</span>
          <div className="title-row">
            <h1 className="welcome-name">Admin BARIZTA ☕</h1>
            <p className="welcome-subtitle">Kelola seluruh sistem BARIZTA Coffee Shop dengan mudah dan efisien</p>
          </div>
        </div>
      </div>

      {error && <div className="alert alert-error">{error}</div>}

      {/* Stats Grid - Sama dengan Member */}
      <div className="stats-grid">
        <Link href="/admin/products" className="stat-card">
          <div className="stat-icon">📦</div>
          <div className="stat-info">
            <span className="stat-number">{stats.totalProducts}</span>
            <span className="stat-label">Total Produk</span>
          </div>
        </Link>
        <Link href="/admin/news" className="stat-card info">
          <div className="stat-icon">📰</div>
          <div className="stat-info">
            <span className="stat-number">{stats.activeNews}</span>
            <span className="stat-label">Berita Aktif</span>
          </div>
        </Link>
        <Link href="/admin/messages" className="stat-card warning">
          <div className="stat-icon">📩</div>
          <div className="stat-info">
            <span className="stat-number">{stats.unreadMessages}</span>
            <span className="stat-label">Pesan Baru</span>
          </div>
        </Link>
        <div className="stat-card success">
          <div className="stat-icon">👥</div>
          <div className="stat-info">
            <span className="stat-number">{stats.totalMembers}</span>
            <span className="stat-label">Total Member</span>
          </div>
        </div>
        <Link href="/admin/classes" className="stat-card info">
          <div className="stat-icon">📚</div>
          <div className="stat-info">
            <span className="stat-number">{stats.activeClasses}</span>
            <span className="stat-label">Kelas Aktif</span>
          </div>
        </Link>
        <Link href="/admin/partnership" className="stat-card">
          <div className="stat-icon">🤝</div>
          <div className="stat-info">
            <span className="stat-number">{stats.totalPartnerships}</span>
            <span className="stat-label">Kolaborasi</span>
          </div>
        </Link>
      </div>

      {/* Quick Actions - Sama dengan Member */}
      <div className="section-compact">
        <h2 className="section-title">Menu Cepat</h2>
        <div className="quick-actions">
          <Link href="/admin/products" className="action-card">
            <span className="action-icon">📦</span>
            <span className="action-label">Kelola Produk</span>
          </Link>
          <Link href="/admin/news" className="action-card">
            <span className="action-icon">📰</span>
            <span className="action-label">Kelola Berita</span>
          </Link>
          <Link href="/admin/messages" className="action-card">
            <span className="action-icon">📩</span>
            <span className="action-label">Pesan Masuk</span>
          </Link>
          <Link href="/admin/classes" className="action-card">
            <span className="action-icon">📚</span>
            <span className="action-label">Kelas Edukasi</span>
          </Link>
          <Link href="/admin/btg" className="action-card">
            <span className="action-icon">🚐</span>
            <span className="action-label">BARIZTA To Go</span>
          </Link>
          <Link href="/admin/partnership" className="action-card">
            <span className="action-icon">🤝</span>
            <span className="action-label">Kolaborasi</span>
          </Link>
          <Link href="/admin/about" className="action-card">
            <span className="action-icon">ℹ️</span>
            <span className="action-label">Tentang Kami</span>
          </Link>
          <Link href="/admin/website" className="action-card">
            <span className="action-icon">🌐</span>
            <span className="action-label">Kelola Website</span>
          </Link>
        </div>
      </div>

      {/* Recent Activities - Sama dengan Member */}
      <div className="section-compact">
        <h2 className="section-title">Aktivitas Terbaru</h2>
        <div className="activities-grid">
          {/* Recent Messages */}
          <div className="activity-card">
            <h4>📩 Pesan Terbaru</h4>
            {recentMessages.length > 0 ? (
              <div className="activity-list">
                {recentMessages.map((msg) => (
                  <div key={msg.id} className={`activity-item ${msg.isRead ? "" : "unread"}`}>
                    <div className="activity-info">
                      <span className="activity-program">{msg.subject}</span>
                      <span className="activity-date">dari {msg.name} · {formatDate(msg.createdAt)}</span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="empty-state-mini">
                <p>Tidak ada pesan</p>
              </div>
            )}
            <Link href="/admin/messages" className="view-all">Lihat Semua →</Link>
          </div>

          {/* Recent News */}
          <div className="activity-card">
            <h4>📰 Berita Terbaru</h4>
            {recentNews.length > 0 ? (
              <div className="activity-list">
                {recentNews.map((news) => (
                  <div key={news.id} className="activity-item">
                    <div className="activity-info">
                      <span className="activity-program">{news.title}</span>
                      <span className="activity-date">
                        <span className={`status-badge status-${news.status}`}>{news.status}</span>
                        {" · "}{formatDate(news.createdAt)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="empty-state-mini">
                <p>Tidak ada berita</p>
              </div>
            )}
            <Link href="/admin/news" className="view-all">Lihat Semua →</Link>
          </div>
        </div>
      </div>

      {/* Info Cards - Sama dengan Member */}
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
            <h4>Statistik</h4>
            <p>Total {stats.recentEnrollments} pendaftaran kelas baru bulan ini</p>
          </div>
        </div>
      </div>
    </div>
  );
}
