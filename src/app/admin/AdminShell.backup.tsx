"use client";

import { useState, useCallback, type ChangeEvent, type FormEvent } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import AdminNotificationBell from "@/components/admin/AdminNotificationBell";
import DeleteConfirmModal from "@/components/ui/DeleteConfirmModal";
import "./admin.css";

interface AdminShellProps {
  children: React.ReactNode;
  initialUser: {
    id: number;
    email: string;
    name: string;
    role: string;
  };
}

export default function AdminShell({ children, initialUser }: AdminShellProps) {
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [user] = useState(initialUser);
  const [profileModalOpen, setProfileModalOpen] = useState(false);
  const [profileLoading, setProfileLoading] = useState(false);
  const [profileSaving, setProfileSaving] = useState(false);
  const [passwordSaving, setPasswordSaving] = useState(false);
  const [profileMessage, setProfileMessage] = useState<{ type: "success" | "error" | ""; text: string }>({ type: "", text: "" });
  const [passwordMessage, setPasswordMessage] = useState<{ type: "success" | "error" | ""; text: string }>({ type: "", text: "" });
  const [profileData, setProfileData] = useState<{
    id?: number;
    name?: string;
    email?: string;
    role?: string;
    phone?: string;
    address?: string;
    createdAt?: string;
  }>({});
  const [profileForm, setProfileForm] = useState({
    name: "",
  });
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);

  const handleLogoutClick = () => {
    setShowLogoutModal(true);
  };

  const handleLogoutConfirm = async () => {
    setLoggingOut(true);
    try {
      await fetch("/api/auth/logout", { 
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ logoutType: "admin" })
      });
      window.location.href = "/auth/login";
    } catch (error) {
      console.error("Logout failed:", error);
      setLoggingOut(false);
      setShowLogoutModal(false);
    }
  };

  const loadProfileData = useCallback(async () => {
    setProfileLoading(true);
    setProfileMessage({ type: "", text: "" });
    setPasswordMessage({ type: "", text: "" });
    try {
      const response = await fetch("/api/auth/me", { credentials: "include" });
      if (!response.ok) {
        throw new Error("Gagal memuat profil");
      }
      const data = await response.json();
      setProfileData(data.user);
      setProfileForm({ name: data.user.name || "" });
    } catch (error) {
      setProfileMessage({ type: "error", text: "Gagal memuat data profil" });
    } finally {
      setProfileLoading(false);
    }
  }, []);

  const handleProfileFormChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setProfileForm((prev) => ({ ...prev, [name]: value }));
  };

  const handlePasswordFormChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setPasswordForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleProfileSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setProfileSaving(true);
    setProfileMessage({ type: "", text: "" });

    try {
      const response = await fetch("/api/auth/me", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ name: profileForm.name }),
      });

      if (!response.ok) {
        throw new Error("Gagal memperbarui profil");
      }

      setProfileMessage({ type: "success", text: "Profil berhasil diperbarui!" });
      await loadProfileData();
    } catch (error) {
      setProfileMessage({ type: "error", text: "Gagal memperbarui profil" });
    } finally {
      setProfileSaving(false);
    }
  };

  const handlePasswordSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setPasswordSaving(true);
    setPasswordMessage({ type: "", text: "" });

    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setPasswordMessage({ type: "error", text: "Password baru dan konfirmasi tidak cocok" });
      setPasswordSaving(false);
      return;
    }

    if (passwordForm.newPassword.length < 6) {
      setPasswordMessage({ type: "error", text: "Password baru minimal 6 karakter" });
      setPasswordSaving(false);
      return;
    }

    try {
      const response = await fetch("/api/auth/change-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          currentPassword: passwordForm.currentPassword,
          newPassword: passwordForm.newPassword,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Gagal mengubah password");
      }

      setPasswordMessage({ type: "success", text: "Password berhasil diubah!" });
      setPasswordForm({ currentPassword: "", newPassword: "", confirmPassword: "" });
    } catch (error) {
      setPasswordMessage({ 
        type: "error", 
        text: error instanceof Error ? error.message : "Gagal mengubah password" 
      });
    } finally {
      setPasswordSaving(false);
    }
  };

  const openProfileModal = () => {
    setProfileModalOpen(true);
    loadProfileData();
  };

  const closeProfileModal = () => {
    setProfileModalOpen(false);
    setProfileMessage({ type: "", text: "" });
    setPasswordMessage({ type: "", text: "" });
  };

  const navItems = [
    { href: "/admin", label: "Dashboard", icon: "📊", section: "kelola" },
    { href: "/admin/products", label: "Produk", icon: "☕", section: "kelola" },
    { href: "/admin/users", label: "Users", icon: "👤", section: "kelola" },
    { href: "/admin/classes", label: "Kelas Barista", icon: "🎓", section: "kelas" },
    { href: "/admin/kelola-peserta", label: "Kelola Peserta", icon: "👥", section: "kelas" },
    { href: "/admin/btg", label: "Barista To Go", icon: "🚐", section: "kelas" },
    { href: "/admin/news", label: "Berita", icon: "📰", section: "berita" },
    { href: "/admin/kolaborasi", label: "Kolaborasi", icon: "🤝", section: "berita" },
    { href: "/admin/messages", label: "Pesan", icon: "📧", section: "lainnya" },
    { href: "/admin/media", label: "Media", icon: "🖼️", section: "lainnya" },
    { href: "/admin/website", label: "Website", icon: "🌐", section: "lainnya" },
    { href: "/admin/notifications", label: "Notifikasi", icon: "🔔", section: "lainnya" },
  ];

  return (
    <div className="admin-layout">
      {/* Header - Same as Member */}
      <header className="admin-header">
        <div className="header-content">
          <div className="logo-section">
            <div className="logo-wrapper">
              <Image 
                src="/logo-bar.png" 
                alt="Barizta Logo" 
                width={32} 
                height={32}
                className="logo-image"
                priority
              />
              <span className="logo-text">BARIZTA</span>
            </div>
            <span className="header-title-text">Admin Barizta</span>
          </div>
          <div className="user-section">
            <AdminNotificationBell />
            <button
              type="button"
              className="profile-avatar-btn"
              onClick={openProfileModal}
              aria-label="Kelola profil admin"
              title="Kelola profil"
            >
              <div className="user-avatar">
                {(user?.name?.charAt(0) || "A").toUpperCase()}
              </div>
            </button>
            <span className="welcome-text">Halo, {user?.name || "Admin"}</span>
            <span className="divider">|</span>
            <button onClick={handleLogoutClick} className="logout-btn">
              Logout
            </button>
          </div>
        </div>
      </header>

      {/* Main Content with Sidebar */}
      <div className="layout-container">
        {/* Sidebar - Same structure as Member */}
        <aside className="admin-sidebar">
          <nav className="admin-sidebar-nav">
            {/* Kelola Data */}
            <div className="admin-nav-section-title">Kelola Data</div>
            {navItems.filter(item => item.section === "kelola").map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`admin-nav-item ${pathname === item.href ? "active" : ""}`}
              >
                <span className="admin-nav-icon">{item.icon}</span>
                <span className="admin-nav-label">{item.label}</span>
              </Link>
            ))}
            
            {/* Kelas Barizta */}
            <div className="admin-nav-section-title">Kelas Barizta</div>
            {navItems.filter(item => item.section === "kelas").map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`admin-nav-item ${pathname === item.href ? "active" : ""}`}
              >
                <span className="admin-nav-icon">{item.icon}</span>
                <span className="admin-nav-label">{item.label}</span>
              </Link>
            ))}
            
            {/* Berita & Partnership */}
            <div className="admin-nav-section-title">Berita & Partnership</div>
            {navItems.filter(item => item.section === "berita").map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`admin-nav-item ${pathname === item.href ? "active" : ""}`}
              >
                <span className="admin-nav-icon">{item.icon}</span>
                <span className="admin-nav-label">{item.label}</span>
              </Link>
            ))}
            
            {/* Lainnya */}
            <div className="admin-nav-section-title">Lainnya</div>
            {navItems.filter(item => item.section === "lainnya").map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`admin-nav-item ${pathname === item.href ? "active" : ""}`}
              >
                <span className="admin-nav-icon">{item.icon}</span>
                <span className="admin-nav-label">{item.label}</span>
              </Link>
            ))}
          </nav>
        </aside>

        {/* Main Content */}
        <main className="main-content">
          {children}
        </main>
      </div>

      {/* Profile Modal */}
      {profileModalOpen && (
        <div className="modal-overlay" onClick={closeProfileModal}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Profil Saya</h2>
              <button className="modal-close" onClick={closeProfileModal}>✕</button>
            </div>

            <div className="modal-body">
              {profileLoading ? (
                <div style={{ textAlign: "center", padding: "2rem" }}>Loading...</div>
              ) : (
                <div className="profile-tabs">
                  {/* Profile Info */}
                  <section className="profile-section">
                    <h3>Informasi Profil</h3>
                    {profileMessage.text && (
                      <div className={`alert alert-${profileMessage.type}`}>
                        {profileMessage.text}
                      </div>
                    )}
                    <form onSubmit={handleProfileSubmit}>
                      <div className="form-group">
                        <label>Email</label>
                        <input type="email" value={profileData.email || ""} disabled />
                      </div>
                      <div className="form-group">
                        <label>Nama</label>
                        <input
                          type="text"
                          name="name"
                          value={profileForm.name}
                          onChange={handleProfileFormChange}
                          required
                        />
                      </div>
                      <div className="form-group">
                        <label>Role</label>
                        <input type="text" value={profileData.role || ""} disabled />
                      </div>
                      <button type="submit" className="btn btn-primary" disabled={profileSaving}>
                        {profileSaving ? "Menyimpan..." : "Simpan Perubahan"}
                      </button>
                    </form>
                  </section>

                  {/* Change Password */}
                  <section className="profile-section">
                    <h3>Ubah Password</h3>
                    {passwordMessage.text && (
                      <div className={`alert alert-${passwordMessage.type}`}>
                        {passwordMessage.text}
                      </div>
                    )}
                    <form onSubmit={handlePasswordSubmit}>
                      <div className="form-group">
                        <label>Password Lama</label>
                        <input
                          type="password"
                          name="currentPassword"
                          value={passwordForm.currentPassword}
                          onChange={handlePasswordFormChange}
                          required
                        />
                      </div>
                      <div className="form-group">
                        <label>Password Baru</label>
                        <input
                          type="password"
                          name="newPassword"
                          value={passwordForm.newPassword}
                          onChange={handlePasswordFormChange}
                          required
                          minLength={6}
                        />
                      </div>
                      <div className="form-group">
                        <label>Konfirmasi Password Baru</label>
                        <input
                          type="password"
                          name="confirmPassword"
                          value={passwordForm.confirmPassword}
                          onChange={handlePasswordFormChange}
                          required
                          minLength={6}
                        />
                      </div>
                      <button type="submit" className="btn btn-primary" disabled={passwordSaving}>
                        {passwordSaving ? "Mengubah..." : "Ubah Password"}
                      </button>
                    </form>
                  </section>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Logout Confirmation Modal */}
      <DeleteConfirmModal
        isOpen={showLogoutModal}
        onClose={() => setShowLogoutModal(false)}
        onConfirm={handleLogoutConfirm}
        title="Konfirmasi Logout"
        message="Apakah Anda yakin ingin keluar dari dashboard admin?"
        confirmText={loggingOut ? "Logging out..." : "Ya, Keluar"}
        cancelText="Batal"
        loading={loggingOut}
      />
    </div>
  );
}
