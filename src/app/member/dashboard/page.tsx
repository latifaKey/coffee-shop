"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import "./dashboard.css";

interface UserData {
  name: string;
  email: string;
}

interface RegistrationStats {
  total: number;
  pending: number;
  approved: number;
  completed: number;
}

interface RecentRegistration {
  id: number;
  programName: string;
  status: string;
  createdAt: string;
}

export default function MemberDashboard() {
  const [user, setUser] = useState<UserData | null>(null);
  const [stats, setStats] = useState<RegistrationStats>({ total: 0, pending: 0, approved: 0, completed: 0 });
  const [recentRegistrations, setRecentRegistrations] = useState<RecentRegistration[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch user data
        const userRes = await fetch("/api/auth/me");
        if (userRes.ok) {
          const userData = await userRes.json();
          setUser(userData.user);
        }

        // Fetch registrations
        const regRes = await fetch("/api/member/class-registrations");
        if (regRes.ok) {
          const registrations = await regRes.json();
          
          // Calculate stats
          const statsData = {
            total: registrations.length,
            pending: registrations.filter((r: RecentRegistration) => r.status === "waiting").length,
            approved: registrations.filter((r: RecentRegistration) => r.status === "approved").length,
            completed: registrations.filter((r: RecentRegistration) => r.status === "completed").length,
          };
          setStats(statsData);
          
          // Get recent 3 registrations
          setRecentRegistrations(registrations.slice(0, 3));
        }
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Selamat Pagi";
    if (hour < 15) return "Selamat Siang";
    if (hour < 18) return "Selamat Sore";
    return "Selamat Malam";
  };

  const getStatusBadge = (status: string) => {
    const statusMap: Record<string, { label: string; className: string }> = {
      waiting: { label: "Menunggu", className: "status-pending" },
      approved: { label: "Disetujui", className: "status-approved" },
      rejected: { label: "Ditolak", className: "status-rejected" },
      completed: { label: "Selesai", className: "status-completed" },
    };
    const info = statusMap[status] || { label: status, className: "status-default" };
    return <span className={`status-badge ${info.className}`}>{info.label}</span>;
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString("id-ID", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  if (loading) return null;

  return (
    <div className="member-dashboard">
      {/* Welcome Section */}
      <div className="welcome-section">
        <div className="welcome-content">
          <span className="welcome-greeting">{getGreeting()},</span>
          <h1 className="welcome-name">{user?.name || "Member"} ☕</h1>
          <p className="welcome-subtitle">Selamat datang di Dashboard Member Barizta Coffee</p>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon">📚</div>
          <div className="stat-info">
            <span className="stat-number">{stats.total}</span>
            <span className="stat-label">Total Pendaftaran</span>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">⏳</div>
          <div className="stat-info">
            <span className="stat-number">{stats.pending}</span>
            <span className="stat-label">Menunggu</span>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">📖</div>
          <div className="stat-info">
            <span className="stat-number">{stats.approved}</span>
            <span className="stat-label">Disetujui</span>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">🎓</div>
          <div className="stat-info">
            <span className="stat-number">{stats.completed}</span>
            <span className="stat-label">Selesai</span>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="section-compact">
        <h2 className="section-title">Menu Cepat</h2>
        <div className="quick-actions">
          <Link href="/member/education-portal" className="action-card">
            <span className="action-icon">📚</span>
            <span className="action-label">Daftar Kelas</span>
          </Link>
          <Link href="/member/class-status" className="action-card">
            <span className="action-icon">📋</span>
            <span className="action-label">Status Pendaftaran</span>
          </Link>
          <Link href="/member/classes" className="action-card">
            <span className="action-icon">🎓</span>
            <span className="action-label">Riwayat & Sertifikat</span>
          </Link>
          <Link href="/member/profile" className="action-card">
            <span className="action-icon">👤</span>
            <span className="action-label">Kelola Profil</span>
          </Link>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="section-compact">
        <div className="section-header">
          <h2 className="section-title">Aktivitas Terbaru</h2>
          {recentRegistrations.length > 0 && (
            <Link href="/member/class-status" className="view-all">Lihat Semua →</Link>
          )}
        </div>
        
        {recentRegistrations.length === 0 ? (
          <div className="empty-state">
            <span className="empty-icon">📭</span>
            <h3>Belum Ada Pendaftaran</h3>
            <p>Mulai perjalanan kopi Anda dengan mendaftar kelas edukasi</p>
            <Link href="/member/education-portal" className="btn-primary">
              Daftar Kelas Sekarang
            </Link>
          </div>
        ) : (
          <div className="activity-list">
            {recentRegistrations.map((reg) => (
              <div key={reg.id} className="activity-item">
                <div className="activity-info">
                  <span className="activity-program">{reg.programName}</span>
                  <span className="activity-date">{formatDate(reg.createdAt)}</span>
                </div>
                {getStatusBadge(reg.status)}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Info Cards */}
      <div className="info-cards">
        <div className="info-card">
          <span className="info-icon">💡</span>
          <div className="info-content">
            <h4>Tips</h4>
            <p>Lengkapi profil Anda untuk mempercepat proses pendaftaran kelas</p>
          </div>
        </div>
        <div className="info-card">
          <span className="info-icon">📞</span>
          <div className="info-content">
            <h4>Butuh Bantuan?</h4>
            <p>Hubungi kami via WhatsApp di 0812-3456-7890</p>
          </div>
        </div>
      </div>
    </div>
  );
}
