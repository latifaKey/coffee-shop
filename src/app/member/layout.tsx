"use client";

import { useEffect, useState, useCallback, type ChangeEvent, type FormEvent } from "react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import MemberNotificationBell from "@/components/public/MemberNotificationBell";
import DeleteConfirmModal from "@/components/ui/DeleteConfirmModal";
import "./member.css";

export default function MemberLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const [user, setUser] = useState<{ id?: number; email?: string; name?: string; role?: string } | null>(null);
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

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const response = await fetch("/api/auth/me", { credentials: 'include' });
        if (!response.ok) {
          router.push("/auth/login");
          return;
        }
        const data = await response.json();
        if (data.user.role !== "member") {
          router.push("/admin");
          return;
        }
        setUser(data.user);
      } catch {
        router.push("/auth/login");
      } finally {
        setLoading(false);
      }
    };
    checkAuth();
  }, [router]);

  const loadProfileData = useCallback(async () => {
    setProfileLoading(true);
    setProfileMessage({ type: "", text: "" });
    setPasswordMessage({ type: "", text: "" });
    try {
      const response = await fetch("/api/member/profile", { credentials: "include" });
      if (!response.ok) {
        throw new Error("Gagal memuat profil");
      }
      const data = await response.json();
      setProfileData(data.user || {});
      setProfileForm({
        name: data.user?.name || "",
      });
    } catch (error) {
      console.error("Failed to load profile", error);
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
      const response = await fetch("/api/member/profile", {
        method: "PUT",
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
      setUser((prev) => (prev ? { ...prev, name: data.user?.name || prev.name } : prev));
    } catch (error: unknown) {
      console.error("Update profile failed", error);
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
      console.error("Update password failed", error);
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

  const handleLogoutClick = () => {
    setShowLogoutModal(true);
  };

  const handleLogoutConfirm = async () => {
    setLoggingOut(true);
    try {
      await fetch("/api/auth/logout", { 
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ logoutType: "member" })
      });
      router.push("/auth/login");
      router.refresh();
    } catch (error) {
      console.error("Logout failed:", error);
      setLoggingOut(false);
      setShowLogoutModal(false);
    }
  };

  if (loading) return null;

  const menuItems = [
    { href: "/member/dashboard", icon: "🏠", label: "Dashboard", section: "main" },
    { href: "/member/education-portal", icon: "📚", label: "Daftar Kelas Edukasi", section: "portal" },
    { href: "/member/class-status", icon: "📋", label: "Status Pendaftaran", section: "portal" },
    { href: "/member/classes", icon: "📖", label: "Riwayat Kelas", section: "portal" },
    { href: "/member/notifications", icon: "🔔", label: "Notifikasi", section: "account" },
    { href: "/", icon: "🌐", label: "Web Barizta", section: "other" },
  ];

  const displayName = user?.name?.trim() || "Member";
  const headerInitialSource = (user?.name?.trim() || user?.email || "M").trim();
  const headerInitial = headerInitialSource ? headerInitialSource.charAt(0).toUpperCase() : "M";
  const modalInitialSource = (profileData.name?.trim() || user?.name?.trim() || profileData.email || user?.email || "M").trim();
  const modalInitial = modalInitialSource ? modalInitialSource.charAt(0).toUpperCase() : "M";

  return (
    <div className="member-layout">
      {/* Header */}
      <header className="member-header">
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
            <span className="header-title-text">Member Barizta</span>
          </div>
          <div className="user-section">
            {/* Notification Bell Component */}
            {user?.id && <MemberNotificationBell userId={user.id} />}
            
            <button
              type="button"
              className={`profile-avatar-btn ${profileModalOpen ? "active" : ""}`}
              onClick={openProfileModal}
              aria-haspopup="dialog"
              aria-expanded={profileModalOpen}
              aria-label="Kelola profil member"
              title="Kelola profil"
            >
              <div className="user-avatar">
                {headerInitial}
              </div>
            </button>
            <span className="welcome-text">Halo, {displayName}</span>
            <span className="divider">|</span>
            <button onClick={handleLogoutClick} className="logout-btn">
              Logout
            </button>
          </div>
        </div>
      </header>

      {/* Main Content with Sidebar */}
      <div className="layout-container">
        {/* Sidebar */}
        <aside className="member-sidebar">
          <nav className="member-sidebar-nav">
            {/* Main Section */}
            {menuItems.filter(item => item.section === "main").map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`member-nav-item ${pathname === item.href || (item.href === "/member/dashboard" && pathname === "/member") ? "active" : ""}`}
              >
                <span className="member-nav-icon">{item.icon}</span>
                <span className="member-nav-label">{item.label}</span>
              </Link>
            ))}
            
            {/* Portal Kelas Edukasi Section */}
            <div className="member-nav-section-title">Portal Kelas Edukasi</div>
            {menuItems.filter(item => item.section === "portal").map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`member-nav-item ${pathname === item.href || pathname?.startsWith(item.href + "/") ? "active" : ""}`}
              >
                <span className="member-nav-icon">{item.icon}</span>
                <span className="member-nav-label">{item.label}</span>
              </Link>
            ))}
            
            {/* Account Section */}
            <div className="member-nav-section-title">Akun</div>
            {menuItems.filter(item => item.section === "account").map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`member-nav-item ${pathname === item.href || pathname?.startsWith(item.href + "/") ? "active" : ""}`}
              >
                <span className="member-nav-icon">{item.icon}</span>
                <span className="member-nav-label">{item.label}</span>
              </Link>
            ))}
            
            {/* Other Section */}
            <div className="member-nav-section-title">Lainnya</div>
            {menuItems.filter(item => item.section === "other").map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`member-nav-item ${pathname === item.href ? "active" : ""}`}
              >
                <span className="member-nav-icon">{item.icon}</span>
                <span className="member-nav-label">{item.label}</span>
              </Link>
            ))}
          </nav>
        </aside>

        {/* Main Content */}
        <main className="main-content">{children}</main>
      </div>

      <div
        className={`member-profile-overlay ${profileModalOpen ? "open" : ""}`}
        role="dialog"
        aria-modal="true"
        aria-labelledby="member-profile-modal-title"
        onClick={closeProfileModal}
      >
        <div className="member-profile-modal" onClick={(event) => event.stopPropagation()}>
          <button className="profile-modal-close" onClick={closeProfileModal} aria-label="Tutup modal">
            ×
          </button>
          {profileLoading ? (
            <div className="profile-modal-loading">Memuat data profil...</div>
          ) : (
            <>
              <div className="profile-modal-header">
                <div className="profile-modal-avatar">
                  {modalInitial}
                </div>
                <div>
                  <h3 id="member-profile-modal-title">{profileData.name || displayName}</h3>
                  <p>{profileData.email || user?.email}</p>
                  {profileData.createdAt && (
                    <span className="profile-modal-meta">Bergabung sejak {new Date(profileData.createdAt).toLocaleDateString("id-ID")}</span>
                  )}
                </div>
              </div>

              <div className="profile-modal-body">
                <div className="profile-modal-panel">
                  <h4>Perbarui Nama</h4>
                  <p>Sesuaikan nama yang tampil pada dashboard member.</p>
                  {profileMessage.text && (
                    <div className={`profile-modal-alert ${profileMessage.type === "success" ? "success" : "error"}`}>
                      {profileMessage.text}
                    </div>
                  )}
                  <form className="profile-modal-form" onSubmit={handleProfileSubmit}>
                    <label className="profile-modal-field" htmlFor="profile-name-input">
                      <span>Nama Lengkap</span>
                      <input
                        id="profile-name-input"
                        type="text"
                        name="name"
                        value={profileForm.name}
                        onChange={handleProfileInputChange}
                        placeholder="Nama lengkap"
                        required
                      />
                    </label>
                    <button type="submit" className="profile-modal-submit primary" disabled={profileSaving}>
                      {profileSaving ? "Menyimpan..." : "Simpan Nama"}
                    </button>
                  </form>
                </div>

                <div className="profile-modal-panel">
                  <h4>Ubah Password</h4>
                  <p>Gunakan password yang kuat untuk melindungi akun Anda.</p>
                  {passwordMessage.text && (
                    <div className={`profile-modal-alert ${passwordMessage.type === "success" ? "success" : "error"}`}>
                      {passwordMessage.text}
                    </div>
                  )}
                  <form className="profile-modal-form" onSubmit={handlePasswordSubmit}>
                    <label className="profile-modal-field" htmlFor="profile-current-password">
                      <span>Password Saat Ini</span>
                      <input
                        id="profile-current-password"
                        type="password"
                        name="currentPassword"
                        value={passwordForm.currentPassword}
                        onChange={handlePasswordInputChange}
                        placeholder="Masukkan password saat ini"
                        required
                      />
                    </label>

                    <label className="profile-modal-field" htmlFor="profile-new-password">
                      <span>Password Baru</span>
                      <input
                        id="profile-new-password"
                        type="password"
                        name="newPassword"
                        value={passwordForm.newPassword}
                        onChange={handlePasswordInputChange}
                        placeholder="Minimal 6 karakter"
                        required
                      />
                    </label>

                    <label className="profile-modal-field" htmlFor="profile-confirm-password">
                      <span>Konfirmasi Password Baru</span>
                      <input
                        id="profile-confirm-password"
                        type="password"
                        name="confirmPassword"
                        value={passwordForm.confirmPassword}
                        onChange={handlePasswordInputChange}
                        placeholder="Ulangi password baru"
                        required
                      />
                    </label>

                    <button type="submit" className="profile-modal-submit secondary" disabled={passwordSaving}>
                      {passwordSaving ? "Memproses..." : "Perbarui Password"}
                    </button>
                  </form>
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      <style jsx>{`
        .member-layout {
          min-height: 100vh;
          background: linear-gradient(135deg, #1f1410 0%, #0f0a08 100%);
          display: flex;
          flex-direction: column;
        }

        /* Header Styles */
        .member-header {
          background: linear-gradient(135deg, #2a1810 0%, #1f1410 50%, #1a1210 100%);
          border-bottom: 2px solid #ff6b35;
          padding: 1rem 2rem;
          position: sticky;
          top: 0;
          z-index: 100;
          box-shadow: 0 2px 10px rgba(0, 0, 0, 0.3);
        }

        .header-content {
          width: 100%;
          margin: 0 auto;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .logo-section {
          display: flex;
          align-items: center;
          gap: 1rem;
        }

        .logo-wrapper {
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }

        .logo-image {
          width: 32px;
          height: 32px;
          object-fit: contain;
        }

        .logo-text {
          color: white;
          font-weight: bold;
          font-size: 1.25rem;
          letter-spacing: 1px;
        }

        .header-title-text {
          color: #ddd;
          font-size: 1rem;
          font-weight: 500;
          letter-spacing: 0.02em;
        }

        .user-section {
          display: flex;
          align-items: center;
          gap: 1.2rem;
        }

        .notification-btn {
          position: relative;
          background: linear-gradient(135deg, rgba(139, 69, 19, 0.4), rgba(212, 165, 116, 0.3));
          border: 1px solid #8B4513;
          color: #D4A574;
          padding: 0.6rem;
          border-radius: 50%;
          cursor: pointer;
          font-size: 1.2rem;
          transition: all 0.3s;
          width: 40px;
          height: 40px;
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 2px 8px rgba(139, 69, 19, 0.2);
        }

        .notification-btn:hover {
          background: linear-gradient(135deg, rgba(139, 69, 19, 0.6), rgba(212, 165, 116, 0.5));
          border-color: #D4A574;
          transform: scale(1.05);
          box-shadow: 0 4px 12px rgba(139, 69, 19, 0.3);
        }

        .notification-btn.active {
          background: linear-gradient(135deg, rgba(139, 69, 19, 0.7), rgba(212, 165, 116, 0.6));
          border-color: #D4A574;
          transform: scale(1.05);
          box-shadow: 0 4px 16px rgba(212, 165, 116, 0.4);
        }

        .notification-badge {
          position: absolute;
          top: -5px;
          right: -5px;
          background: linear-gradient(135deg, #cd7f32, #d4956c);
          color: #f5f5dc;
          font-size: 0.65rem;
          padding: 0.15rem 0.35rem;
          border-radius: 10px;
          min-width: 16px;
          text-align: center;
          font-weight: bold;
        }

        .notification-wrapper {
          position: relative;
        }

        .notification-dropdown {
          position: absolute;
          top: calc(100% + 15px);
          right: 0;
          width: 380px;
          background: linear-gradient(135deg, #2a1810 0%, #1f1410 100%);
          border: 1px solid #8B4513;
          border-radius: 12px;
          box-shadow: 0 8px 24px rgba(0, 0, 0, 0.5);
          z-index: 1000;
          overflow: hidden;
        }

        .notification-dropdown::before {
          content: '';
          position: absolute;
          top: -8px;
          right: 10px;
          width: 0;
          height: 0;
          border-left: 8px solid transparent;
          border-right: 8px solid transparent;
          border-bottom: 8px solid #8B4513;
        }

        .notification-dropdown::after {
          content: '';
          position: absolute;
          top: -6px;
          right: 11px;
          width: 0;
          height: 0;
          border-left: 7px solid transparent;
          border-right: 7px solid transparent;
          border-bottom: 7px solid #2a1810;
        }

        .notification-header {
          padding: 1rem 1.25rem;
          background: linear-gradient(135deg, #3e2723, #2a1810);
          border-bottom: 1px solid #5d4037;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .notification-header h4 {
          margin: 0;
          color: #d4a574;
          font-size: 1rem;
          font-weight: 600;
        }

        .notification-count {
          background: linear-gradient(135deg, #cd7f32, #d4956c);
          color: #f5f5dc;
          padding: 0.25rem 0.5rem;
          border-radius: 12px;
          font-size: 0.75rem;
          font-weight: 600;
        }

        .notification-list {
          max-height: 400px;
          overflow-y: auto;
          scrollbar-width: thin;
          scrollbar-color: #8B4513 transparent;
        }

        .notification-list::-webkit-scrollbar {
          width: 6px;
        }

        .notification-list::-webkit-scrollbar-track {
          background: transparent;
        }

        .notification-list::-webkit-scrollbar-thumb {
          background: linear-gradient(135deg, #8B4513, #D4A574);
          border-radius: 3px;
        }

        .notification-list::-webkit-scrollbar-thumb:hover {
          background: linear-gradient(135deg, #D4A574, #e6c39a);
        }

        .notification-item {
          padding: 1rem 1.25rem;
          border-bottom: 1px solid rgba(93, 64, 55, 0.3);
          display: flex;
          gap: 0.75rem;
          transition: all 0.2s;
          cursor: pointer;
        }

        .notification-item:hover {
          background: rgba(62, 39, 35, 0.5);
        }

        .notification-item.unread {
          background: rgba(212, 165, 116, 0.08);
          border-left: 3px solid #d4a574;
        }

        .notification-icon {
          font-size: 1.5rem;
          flex-shrink: 0;
        }

        .notification-content {
          flex: 1;
        }

        .notification-title {
          color: #d4a574;
          font-weight: 600;
          font-size: 0.9rem;
          margin-bottom: 0.25rem;
        }

        .notification-message {
          color: #e6d5c3;
          font-size: 0.85rem;
          line-height: 1.4;
          margin-bottom: 0.5rem;
        }

        .notification-time {
          color: #a1887f;
          font-size: 0.75rem;
        }

        .notification-empty {
          padding: 2rem;
          text-align: center;
          color: #a1887f;
        }

        .notification-footer {
          display: block;
          padding: 0.875rem;
          text-align: center;
          background: linear-gradient(135deg, #3e2723, #2a1810);
          color: #d4a574;
          text-decoration: none;
          font-size: 0.875rem;
          font-weight: 500;
          border-top: 1px solid #5d4037;
          transition: all 0.2s;
        }

        .notification-footer:hover {
          background: linear-gradient(135deg, #4e342e, #3e2723);
          color: #e6c39a;
        }

        .divider {
          color: #666;
          font-size: 1.2rem;
        }

        .profile-avatar-btn {
          border: 1px solid rgba(184, 129, 85, 0.3);
          background: radial-gradient(circle at 35% 25%, rgba(176, 122, 82, 0.32), rgba(54, 32, 22, 0.92));
          padding: 0.28rem;
          border-radius: 50%;
          cursor: pointer;
          transition: all 0.3s ease;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          width: 44px;
          height: 44px;
          appearance: none;
          -webkit-appearance: none;
          -moz-appearance: none;
          box-shadow: inset 0 0 0 1px rgba(24, 13, 9, 0.65), 0 10px 20px rgba(0, 0, 0, 0.32);
        }

        .profile-avatar-btn:hover,
        .profile-avatar-btn:focus-visible,
        .profile-avatar-btn.active {
          border-color: rgba(218, 177, 134, 0.55);
          box-shadow: inset 0 0 0 1px rgba(37, 21, 15, 0.9), 0 14px 26px rgba(0, 0, 0, 0.42);
          outline: none;
          transform: translateY(-1px);
        }

        .user-avatar {
          width: 36px;
          height: 36px;
          border-radius: 50%;
          background: radial-gradient(circle at 30% 25%, #b16f3f 0%, #7a4223 55%, #2b160e 100%);
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 1rem;
          font-weight: 600;
          color: #f9e4ce;
          border: 1px solid rgba(210, 163, 120, 0.45);
          box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.08), 0 10px 18px rgba(0, 0, 0, 0.35);
          letter-spacing: 0.02em;
        }

        .welcome-text {
          color: #ddd;
          font-size: 0.95rem;
          font-weight: 500;
        }

        .logout-btn {
          background: linear-gradient(135deg, rgba(139, 69, 19, 0.4), rgba(212, 165, 116, 0.3));
          border: 1px solid #8B4513;
          color: #D4A574;
          padding: 0.5rem 1.25rem;
          border-radius: 6px;
          cursor: pointer;
          transition: all 0.3s;
          font-size: 0.9rem;
          font-weight: 500;
          box-shadow: 0 2px 8px rgba(139, 69, 19, 0.2);
          position: relative;
          overflow: hidden;
        }

        .logout-btn::before {
          content: '';
          position: absolute;
          top: 0;
          left: -100%;
          width: 100%;
          height: 100%;
          background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent);
          transition: left 0.5s;
        }

        .logout-btn:hover::before {
          left: 100%;
        }

        .logout-btn:hover {
          background: linear-gradient(135deg, rgba(139, 69, 19, 0.6), rgba(212, 165, 116, 0.5));
          border-color: #D4A574;
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(139, 69, 19, 0.4);
        }

        /* Layout Container */
        .layout-container {
          display: flex;
          flex: 1;
          width: 100%;
          align-items: stretch;
          min-height: calc(100vh - 68px);
          position: relative;
        }

        /* Main Content Styles */
        .main-content {
          flex: 1;
          width: 100%;
          padding: 2.25rem 2.5rem;
          background: rgba(26, 18, 14, 0.6);
          min-height: calc(100vh - 68px);
          max-height: calc(100vh - 68px);
          overflow-y: auto;
          max-width: calc(100% - 260px);
        }

        .member-profile-overlay {
          position: fixed;
          inset: 0;
          background: rgba(0, 0, 0, 0.8);
          display: flex;
          align-items: flex-start;
          justify-content: center;
          padding: 2rem 1rem;
          opacity: 0;
          visibility: hidden;
          transition: opacity 0.25s ease, visibility 0.25s ease;
          z-index: 140;
          overflow-y: auto;
          backdrop-filter: blur(6px);
        }

        .member-profile-overlay.open {
          opacity: 1;
          visibility: visible;
        }

        .member-profile-modal {
          width: min(720px, 100%);
          background: linear-gradient(155deg, rgba(28, 18, 14, 0.96), rgba(18, 11, 8, 0.92));
          border: 1px solid rgba(72, 45, 33, 0.7);
          border-radius: 14px;
          position: relative;
          box-shadow: 0 14px 42px rgba(0, 0, 0, 0.55);
          color: #f4dfc8;
          overflow: hidden;
          display: flex;
          flex-direction: column;
          margin: auto;
        }

        .profile-modal-close {
          position: absolute;
          top: 18px;
          right: 18px;
          width: 32px;
          height: 32px;
          border: none;
          background: rgba(134, 52, 42, 0.35);
          color: #f2a49b;
          font-size: 1.25rem;
          border-radius: 50%;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.3s ease;
          box-shadow: 0 6px 14px rgba(0, 0, 0, 0.35);
        }

        .profile-modal-close:hover,
        .profile-modal-close:focus-visible {
          background: rgba(164, 62, 50, 0.5);
          outline: none;
          transform: translateY(-1px);
        }

        .profile-modal-header {
          display: flex;
          align-items: center;
          gap: 1rem;
          padding: 1.35rem 1.5rem 1.1rem;
          border-bottom: 1px solid rgba(76, 48, 35, 0.55);
          background: rgba(18, 10, 7, 0.88);
        }

        .profile-modal-avatar {
          width: 60px;
          height: 60px;
          border-radius: 50%;
          background: radial-gradient(circle at 35% 25%, #c27c49 0%, #874d28 55%, #311b12 100%);
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 1.55rem;
          font-weight: 600;
          color: #f8e4ce;
          border: 1px solid rgba(210, 163, 120, 0.45);
          box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.08), 0 10px 22px rgba(0, 0, 0, 0.4);
        }

        .profile-modal-header h3 {
          margin: 0 0 0.2rem 0;
          color: #e4c79f;
          font-size: 1.26rem;
        }

        .profile-modal-header p {
          margin: 0;
          color: #b99d85;
          font-size: 0.92rem;
        }

        .profile-modal-meta {
          display: inline-block;
          margin-top: 0.35rem;
          font-size: 0.78rem;
          color: #8d725c;
        }

        .profile-modal-body {
          padding: 1.7rem 1.5rem 1.85rem;
          max-height: 70vh;
          overflow-y: auto;
          display: grid;
          grid-template-columns: 1fr;
          gap: 1.4rem;
        }

        .profile-modal-panel {
          background: linear-gradient(160deg, rgba(32, 20, 15, 0.9), rgba(22, 13, 9, 0.94));
          border: 1px solid rgba(105, 67, 46, 0.35);
          border-radius: 12px;
          padding: 1.5rem;
          position: relative;
          overflow: hidden;
          box-shadow: inset 0 0 18px rgba(0, 0, 0, 0.42);
        }

        .profile-modal-panel::before {
          content: "";
          position: absolute;
          inset: 0;
          border-radius: inherit;
          background: linear-gradient(145deg, rgba(163, 113, 77, 0.18), rgba(61, 34, 24, 0.22));
          opacity: 0;
          transition: opacity 0.35s ease;
          pointer-events: none;
        }

        .profile-modal-panel:hover::before {
          opacity: 1;
        }

        .profile-modal-panel > * {
          position: relative;
          z-index: 1;
        }

        .profile-modal-panel h4 {
          margin: 0 0 0.35rem 0;
          color: #dfba8b;
          font-size: 1.08rem;
        }

        .profile-modal-panel p {
          margin: 0 0 1.05rem 0;
          color: #a6846b;
          font-size: 0.88rem;
        }

        .profile-modal-alert {
          padding: 0.9rem 1rem;
          border-radius: 10px;
          margin-bottom: 1rem;
          font-size: 0.9rem;
          font-weight: 500;
        }

        .profile-modal-alert.success {
          background: rgba(46, 109, 64, 0.35);
          border: 1px solid rgba(104, 176, 120, 0.32);
          color: #a4e2b3;
        }

        .profile-modal-alert.error {
          background: rgba(132, 44, 37, 0.32);
          border: 1px solid rgba(209, 110, 100, 0.38);
          color: #f2a7a2;
        }

        .profile-modal-form {
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }

        .profile-modal-field {
          display: flex;
          flex-direction: column;
          gap: 0.4rem;
        }

        .profile-modal-field span {
          font-size: 0.83rem;
          color: #d7b188;
          font-weight: 600;
          letter-spacing: 0.03em;
        }

        .profile-modal-form input {
          padding: 0.85rem 1rem;
          border-radius: 10px;
          border: 1px solid rgba(96, 56, 36, 0.45);
          background: rgba(19, 12, 9, 0.75);
          color: #f1dbc2;
          font-size: 0.95rem;
          transition: border-color 0.2s ease, box-shadow 0.2s ease;
        }

        .profile-modal-form input:focus {
          outline: none;
          border-color: rgba(212, 165, 116, 0.6);
          box-shadow: 0 0 0 3px rgba(145, 94, 64, 0.35);
        }

        .profile-modal-submit {
          padding: 0.55rem 1.3rem;
          border-radius: 8px;
          border: 1px solid rgba(129, 78, 45, 0.6);
          background: linear-gradient(140deg, rgba(118, 72, 42, 0.55), rgba(48, 28, 19, 0.92));
          color: #e8caa6;
          font-weight: 500;
          font-size: 0.92rem;
          cursor: pointer;
          transition: all 0.3s ease;
          position: relative;
          overflow: hidden;
          box-shadow: 0 3px 10px rgba(0, 0, 0, 0.35);
        }

        .profile-modal-submit::before {
          content: '';
          position: absolute;
          top: 0;
          left: -110%;
          width: 120%;
          height: 100%;
          background: linear-gradient(90deg, transparent, rgba(255, 244, 229, 0.18), transparent);
          transition: left 0.5s;
        }

        .profile-modal-submit:hover::before {
          left: 110%;
        }

        .profile-modal-submit:hover:not(:disabled),
        .profile-modal-submit:focus-visible:not(:disabled) {
          background: linear-gradient(140deg, rgba(134, 88, 55, 0.65), rgba(58, 34, 23, 0.95));
          border-color: rgba(212, 165, 116, 0.75);
          color: #fff3de;
          transform: translateY(-2px);
          box-shadow: 0 6px 14px rgba(0, 0, 0, 0.45);
          outline: none;
        }

        .profile-modal-submit.primary {
          font-weight: 600;
        }

        .profile-modal-submit.secondary {
          opacity: 0.95;
        }

        .profile-modal-submit:disabled {
          opacity: 0.6;
          cursor: not-allowed;
          transform: none;
          box-shadow: 0 2px 6px rgba(0, 0, 0, 0.22);
        }

        .profile-modal-loading {
          text-align: center;
          color: #d8b990;
          padding: 2.5rem 0;
        }

        /* Responsive */
        @media (max-width: 768px) {
          .member-header {
            padding: 1rem;
          }

          .header-content {
            flex-direction: column;
            gap: 1rem;
            align-items: flex-start;
          }

          .layout-container {
            flex-direction: column;
          }

          .main-content {
            max-width: 100%;
            padding: 1rem;
            min-height: auto;
            max-height: none;
          }

          .member-profile-modal {
            width: 100%;
          }

          .profile-modal-panel {
            padding: 1.25rem;
          }
        }
      `}</style>

      {/* Logout Confirmation Modal */}
      <DeleteConfirmModal
        isOpen={showLogoutModal}
        onClose={() => setShowLogoutModal(false)}
        onConfirm={handleLogoutConfirm}
        itemName="sesi login"
        itemType="akun"
        title="Konfirmasi Logout"
        warningText="Apakah Anda yakin ingin keluar dari sistem? Anda perlu login kembali untuk mengakses halaman member."
        confirmButtonText="Keluar"
        cancelButtonText="Batal"
        isLoading={loggingOut}
      />
    </div>
  );
}
