"use client";

import { useEffect, useState, useCallback, type ChangeEvent, type FormEvent } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import AdminNotificationBell from "@/components/admin/AdminNotificationBell"; // Brown themed
import DeleteConfirmModal from "@/components/ui/DeleteConfirmModal";
import "./admin.css";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [user, setUser] = useState<{
    id?: number;
    email?: string;
    name?: string;
    role?: string;
    phone?: string;
    address?: string;
    createdAt?: string;
  } | null>(null);
  const [loading, setLoading] = useState(true);
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

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const response = await fetch("/api/auth/me", { credentials: 'include' });
        if (!response.ok) {
          window.location.href = "/auth/login";
          return;
        }
        const data = await response.json();
        if (data.user.role !== "admin") {
          window.location.href = "/member/dashboard";
          return;
        }
        setUser(data.user);
      } catch {
        window.location.href = "/auth/login";
      } finally {
        setLoading(false);
      }
    };
    checkAuth();
  }, []);

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
      setProfileData(data.user || {});
      setProfileForm({
        name: data.user?.name || "",
      });
    } catch (error) {
      console.error("Failed to load admin profile", error);
      setProfileMessage({ type: "error", text: "Gagal memuat data profil." });
    } finally {
      setProfileLoading(false);
    }
  }, []);

  const openProfileModal = useCallback(() => {
    if (profileModalOpen) {
      return;
    }
    setProfileModalOpen(true);
    setPasswordForm({ currentPassword: "", newPassword: "", confirmPassword: "" });
    setProfileMessage({ type: "", text: "" });
    setPasswordMessage({ type: "", text: "" });
    loadProfileData();
  }, [loadProfileData, profileModalOpen]);

  const closeProfileModal = useCallback(() => {
    setProfileModalOpen(false);
    setProfileMessage({ type: "", text: "" });
    setPasswordMessage({ type: "", text: "" });
    setPasswordForm({ currentPassword: "", newPassword: "", confirmPassword: "" });
  }, []);

  const handleProfileInputChange = (event: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target;
    setProfileForm((prev) => ({ ...prev, [name]: value }));
  };

  const handlePasswordInputChange = (event: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target;
    setPasswordForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleProfileSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setProfileSaving(true);
    setProfileMessage({ type: "", text: "" });
    try {
      const response = await fetch("/api/auth/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          name: profileForm.name,
        }),
      });

      if (!response.ok) {
        const error = await response.json().catch(() => ({}));
        throw new Error(error?.error || "Gagal memperbarui profil");
      }

      const data = await response.json();
      setProfileData(data.user || {});
      setProfileMessage({ type: "success", text: "Profil berhasil diperbarui." });
      setUser((prev) => {
        if (prev) {
          return { ...prev, name: data.user?.name ?? prev.name };
        }
        return data.user || prev;
      });
    } catch (error: unknown) {
      console.error("Update admin profile failed", error);
      setProfileMessage({ type: "error", text: error instanceof Error ? error.message : "Gagal memperbarui profil." });
    } finally {
      setProfileSaving(false);
    }
  };

  const handlePasswordSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setPasswordSaving(true);
    setPasswordMessage({ type: "", text: "" });

    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setPasswordMessage({ type: "error", text: "Konfirmasi password tidak cocok." });
      setPasswordSaving(false);
      return;
    }

    if (passwordForm.newPassword.length < 6) {
      setPasswordMessage({ type: "error", text: "Password baru minimal 6 karakter." });
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

      if (!response.ok) {
        const error = await response.json().catch(() => ({}));
        throw new Error(error?.error || "Gagal mengubah password");
      }

      setPasswordMessage({ type: "success", text: "Password berhasil diperbarui." });
      setPasswordForm({ currentPassword: "", newPassword: "", confirmPassword: "" });
    } catch (error: unknown) {
      console.error("Update admin password failed", error);
      setPasswordMessage({ type: "error", text: error instanceof Error ? error.message : "Gagal mengubah password." });
    } finally {
      setPasswordSaving(false);
    }
  };

  useEffect(() => {
    if (!profileModalOpen) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        closeProfileModal();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [profileModalOpen, closeProfileModal]);

  useEffect(() => {
    if (!profileModalOpen) {
      return;
    }

    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = originalOverflow;
    };
  }, [profileModalOpen]);

  // Close sidebar when route changes
  useEffect(() => {
    setSidebarOpen(false);
  }, [pathname]);

  if (loading) return null;

  const isActive = (path: string) => pathname === path;
  const displayName = user?.name?.trim() || "Admin";
  const headerInitialSource = (user?.name?.trim() || user?.email || "A").trim();
  const headerInitial = headerInitialSource ? headerInitialSource.charAt(0).toUpperCase() : "A";
  const modalInitialSource = (profileData.name?.trim() || user?.name?.trim() || profileData.email || user?.email || "A").trim();
  const modalInitial = modalInitialSource ? modalInitialSource.charAt(0).toUpperCase() : "A";

  // Close sidebar when clicking on a link (mobile)
  const handleNavClick = () => {
    if (window.innerWidth <= 768) {
      setSidebarOpen(false);
    }
  };

  return (
    <div className="admin-layout">
      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div className="sidebar-overlay" onClick={() => setSidebarOpen(false)} />
      )}

      {/* Top Header - Full Width */}
      <header className="admin-header">
        <div className="header-content">
          <div className="logo-section">
            {/* Mobile Menu Toggle */}
            <button 
              className="mobile-menu-toggle"
              onClick={() => setSidebarOpen(!sidebarOpen)}
              aria-label="Toggle menu"
            >
              {sidebarOpen ? '✕' : '☰'}
            </button>
            <div className="logo-wrapper">
              <Image src="/logo-bar.png" alt="Barizta" width={32} height={32} className="logo-image" priority />
              <span className="logo-text">BARIZTA</span>
            </div>
            <span className="header-title-text">Admin Panel</span>
          </div>
          <div className="user-section">
            {/* Notification Bell Component */}
            <AdminNotificationBell />

            <button
              type="button"
              className={`profile-avatar-btn ${profileModalOpen ? "active" : ""}`}
              onClick={openProfileModal}
              aria-haspopup="dialog"
              aria-expanded={profileModalOpen}
              aria-label="Kelola profil admin"
              title="Kelola profil"
            >
              <div className="user-avatar">
                {headerInitial}
              </div>
            </button>
            <span className="welcome-text">Halo, {displayName}</span>
            <span className="divider">|</span>
            <button 
              className="logout-btn"
              onClick={handleLogoutClick}
            >
              Logout
            </button>
          </div>
        </div>
      </header>

      {/* Main Content with Sidebar */}
      <div className="layout-container">
        {/* Sidebar - No Brand */}
        <aside className={`admin-sidebar ${sidebarOpen ? 'open' : ''}`}>
          {/* Mobile Sidebar Header */}
          <div className="sidebar-mobile-header">
            <div className="sidebar-brand">
              <Image src="/logo-bar.png" alt="Barizta" width={28} height={28} priority />
              <span>BARIZTA Admin</span>
            </div>
            <button 
              className="sidebar-close-btn"
              onClick={() => setSidebarOpen(false)}
              aria-label="Close menu"
            >
              ✕
            </button>
          </div>
          <nav className="admin-sidebar-nav">
            {/* Dashboard Section */}
            <Link href="/admin/dashboard" className={`admin-nav-item ${isActive('/admin/dashboard') || isActive('/admin') ? 'active' : ''}`} onClick={handleNavClick}>
              <span className="admin-nav-icon">🏠</span>
              <span className="admin-nav-label">Dashboard</span>
            </Link>

            {/* Account Section */}
            <div className="admin-nav-section-title">Akun</div>
            <Link href="/admin/notifications" className={`admin-nav-item ${isActive('/admin/notifications') ? 'active' : ''}`} onClick={handleNavClick}>
              <span className="admin-nav-icon">🔔</span>
              <span className="admin-nav-label">Notifikasi</span>
            </Link>
            <Link href="/admin/users" className={`admin-nav-item ${isActive('/admin/users') ? 'active' : ''}`} onClick={handleNavClick}>
              <span className="admin-nav-icon">👥</span>
              <span className="admin-nav-label">Daftar Pengguna</span>
            </Link>

            {/* Management Section */}
            <div className="admin-nav-section-title">Manajemen</div>
            <Link href="/admin/products" className={`admin-nav-item ${isActive('/admin/products') ? 'active' : ''}`} onClick={handleNavClick}>
              <span className="admin-nav-icon">☕</span>
              <span className="admin-nav-label">Kelola Produk</span>
            </Link>
            <Link href="/admin/classes" className={`admin-nav-item ${isActive('/admin/classes') ? 'active' : ''}`} onClick={handleNavClick}>
              <span className="admin-nav-icon">🎓</span>
              <span className="admin-nav-label">Kelas Edukasi</span>
            </Link>            

            <Link href="/admin/btg" className={`admin-nav-item ${isActive('/admin/btg') ? 'active' : ''}`} onClick={handleNavClick}>
              <span className="admin-nav-icon">🚚</span>
              <span className="admin-nav-label">BARIZTA To Go</span>
            </Link>
            <Link href="/admin/kolaborasi" className={`admin-nav-item ${isActive('/admin/kolaborasi') || isActive('/admin/partnership') ? 'active' : ''}`} onClick={handleNavClick}>
              <span className="admin-nav-icon">🤝</span>
              <span className="admin-nav-label">Kolaborasi</span>
            </Link>
            <Link href="/admin/about" className={`admin-nav-item ${isActive('/admin/about') ? 'active' : ''}`} onClick={handleNavClick}>
              <span className="admin-nav-icon">ℹ️</span>
              <span className="admin-nav-label">Tentang Kami</span>
            </Link>
            <Link href="/admin/news" className={`admin-nav-item ${isActive('/admin/news') ? 'active' : ''}`} onClick={handleNavClick}>
              <span className="admin-nav-icon">📰</span>
              <span className="admin-nav-label">Kelola Berita</span>
            </Link>
            <Link href="/admin/messages" className={`admin-nav-item ${isActive('/admin/messages') ? 'active' : ''}`} onClick={handleNavClick}>
              <span className="admin-nav-icon">✉️</span>
              <span className="admin-nav-label">Pesan Masuk</span>
            </Link>

            {/* Website Section */}
            <div className="admin-nav-section-title">Website</div>
            <Link href="/admin/website" className={`admin-nav-item ${isActive('/admin/website') ? 'active' : ''}`} onClick={handleNavClick}>
              <span className="admin-nav-icon">🌐</span>
              <span className="admin-nav-label">Pengaturan Website</span>
            </Link>

            {/* Others Section */}
            <div className="admin-nav-section-title">Lainnya</div>
            <Link href="/" className="admin-nav-item" onClick={handleNavClick}>
              <span className="admin-nav-icon">🌍</span>
              <span className="admin-nav-label">Web Barizta</span>
            </Link>
          </nav>
        </aside>

        {/* Page Content */}
        <main className="main-content">
          {children}
        </main>
      </div>

      <div
        className={`admin-profile-overlay ${profileModalOpen ? "open" : ""}`}
        role="dialog"
        aria-modal="true"
        aria-labelledby="admin-profile-modal-title"
        onClick={closeProfileModal}
      >
        <div className="admin-profile-modal" onClick={(event) => event.stopPropagation()}>
          <button className="admin-profile-modal-close" onClick={closeProfileModal} aria-label="Tutup modal">
            ×
          </button>
          {profileLoading ? (
            <div className="admin-profile-modal-loading">Memuat data profil...</div>
          ) : (
            <>
              <div className="admin-profile-modal-header">
                <div className="admin-profile-modal-avatar">{modalInitial}</div>
                <div>
                  <h3 id="admin-profile-modal-title">{profileData.name || displayName}</h3>
                  <p>{profileData.email || user?.email}</p>
                  {profileData.createdAt && (
                    <span className="admin-profile-modal-meta">
                      Bergabung sejak {new Date(profileData.createdAt).toLocaleDateString("id-ID")}
                    </span>
                  )}
                </div>
              </div>

              <div className="admin-profile-modal-body">
                <div className="admin-profile-modal-panel">
                  <h4>Perbarui Nama</h4>
                  <p>Sesuaikan nama yang tampil pada dashboard admin.</p>
                  {profileMessage.text && (
                    <div className={`admin-profile-modal-alert ${profileMessage.type === "success" ? "success" : "error"}`}>
                      {profileMessage.text}
                    </div>
                  )}
                  <form className="admin-profile-modal-form" onSubmit={handleProfileSubmit}>
                    <label className="admin-profile-modal-field" htmlFor="admin-profile-name-input">
                      <span>Nama Lengkap</span>
                      <input
                        id="admin-profile-name-input"
                        type="text"
                        name="name"
                        value={profileForm.name}
                        onChange={handleProfileInputChange}
                        placeholder="Nama lengkap"
                        required
                      />
                    </label>
                    <button type="submit" className="admin-profile-modal-submit primary" disabled={profileSaving}>
                      {profileSaving ? "Menyimpan..." : "Simpan Nama"}
                    </button>
                  </form>
                </div>

                <div className="admin-profile-modal-panel">
                  <h4>Ubah Password</h4>
                  <p>Gunakan password yang kuat untuk melindungi akses admin.</p>
                  {passwordMessage.text && (
                    <div className={`admin-profile-modal-alert ${passwordMessage.type === "success" ? "success" : "error"}`}>
                      {passwordMessage.text}
                    </div>
                  )}
                  <form className="admin-profile-modal-form" onSubmit={handlePasswordSubmit}>
                    <label className="admin-profile-modal-field" htmlFor="admin-profile-current-password">
                      <span>Password Saat Ini</span>
                      <input
                        id="admin-profile-current-password"
                        type="password"
                        name="currentPassword"
                        value={passwordForm.currentPassword}
                        onChange={handlePasswordInputChange}
                        placeholder="Masukkan password saat ini"
                        required
                      />
                    </label>

                    <label className="admin-profile-modal-field" htmlFor="admin-profile-new-password">
                      <span>Password Baru</span>
                      <input
                        id="admin-profile-new-password"
                        type="password"
                        name="newPassword"
                        value={passwordForm.newPassword}
                        onChange={handlePasswordInputChange}
                        placeholder="Minimal 6 karakter"
                        required
                      />
                    </label>

                    <label className="admin-profile-modal-field" htmlFor="admin-profile-confirm-password">
                      <span>Konfirmasi Password Baru</span>
                      <input
                        id="admin-profile-confirm-password"
                        type="password"
                        name="confirmPassword"
                        value={passwordForm.confirmPassword}
                        onChange={handlePasswordInputChange}
                        placeholder="Ulangi password baru"
                        required
                      />
                    </label>

                    <button type="submit" className="admin-profile-modal-submit secondary" disabled={passwordSaving}>
                      {passwordSaving ? "Memproses..." : "Perbarui Password"}
                    </button>
                  </form>
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Logout Confirmation Modal */}
      <DeleteConfirmModal
        isOpen={showLogoutModal}
        onClose={() => setShowLogoutModal(false)}
        onConfirm={handleLogoutConfirm}
        itemName="sesi login"
        itemType="akun"
        title="Konfirmasi Logout"
        warningText="Apakah Anda yakin ingin keluar dari sistem? Anda perlu login kembali untuk mengakses panel admin."
        confirmButtonText="Keluar"
        cancelButtonText="Batal"
        isLoading={loggingOut}
      />
    </div>
  );
}
