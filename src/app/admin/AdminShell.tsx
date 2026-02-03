"use client";

import React, {
  useState,
  useCallback,
  useMemo,
  memo,
  type ChangeEvent,
  type FormEvent,
} from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import AdminNotificationBell from "@/components/admin/AdminNotificationBell";
import DeleteConfirmModal from "@/components/ui/DeleteConfirmModal";
import "./admin-modern.css";

// ============================================
// TYPES
// ============================================
interface AdminShellProps {
  children: React.ReactNode;
  initialUser: {
    userId: number;
    email: string;
    name: string;
    role: string;
  };
}

interface NavItem {
  href: string;
  label: string;
  icon: string;
  section: "main" | "kelola" | "kelas" | "berita" | "lainnya";
}

// ============================================
// CONSTANTS - Didefinisikan di luar komponen untuk menghindari re-creation
// ============================================
const NAV_ITEMS: NavItem[] = [
  { href: "/admin/dashboard", label: "Dashboard", icon: "🏠", section: "main" },
  { href: "/admin/products", label: "Produk", icon: "☕", section: "kelola" },
  { href: "/admin/users", label: "Users", icon: "👤", section: "kelola" },
  { href: "/admin/about", label: "Tentang Kami", icon: "ℹ️", section: "kelola" },
  { href: "/admin/classes", label: "Kelas Barista", icon: "🎓", section: "kelas" },
  { href: "/admin/btg", label: "Barista To Go", icon: "🚐", section: "kelas" },
  { href: "/admin/news", label: "Berita", icon: "📰", section: "berita" },
  { href: "/admin/kolaborasi", label: "Kolaborasi", icon: "🤝", section: "berita" },
  { href: "/admin/messages", label: "Pesan", icon: "📧", section: "lainnya" },
  { href: "/admin/media", label: "Media", icon: "🖼️", section: "lainnya" },
  { href: "/admin/website", label: "Website", icon: "🌐", section: "lainnya" },
  { href: "/admin/notifications", label: "Notifikasi", icon: "🔔", section: "lainnya" },
];

const NAV_SECTIONS = [
  { key: "main", title: null },
  { key: "kelola", title: "Kelola Data" },
  { key: "kelas", title: "Kelas Barizta" },
  { key: "berita", title: "Berita & Partnership" },
  { key: "lainnya", title: "Lainnya" },
] as const;

// Pre-compute grouped navigation items untuk performa
const GROUPED_NAV_ITEMS = NAV_SECTIONS.map((section) => ({
  ...section,
  items: NAV_ITEMS.filter((item) => item.section === section.key),
}));

// ============================================
// MEMOIZED SUB-COMPONENTS
// ============================================

/** Single Navigation Item - Memoized untuk mencegah re-render */
const NavItemComponent = memo(function NavItemComponent({
  item,
  isActive,
  onClick,
}: {
  item: NavItem;
  isActive: boolean;
  onClick?: () => void;
}) {
  return (
    <Link
      href={item.href}
      className={`admin-nav-item ${isActive ? "active" : ""}`}
      onClick={onClick}
    >
      <span className="admin-nav-icon" aria-hidden="true">{item.icon}</span>
      <span className="admin-nav-label">{item.label}</span>
    </Link>
  );
});

/** Sidebar Navigation - Memoized */
const SidebarNav = memo(function SidebarNav({
  pathname,
  onNavClick,
}: {
  pathname: string;
  onNavClick?: () => void;
}) {
  return (
    <nav className="admin-sidebar-nav">
      {GROUPED_NAV_ITEMS.map((section) => (
        <div key={section.key}>
          {section.title && (
            <div className="admin-nav-section-title">{section.title}</div>
          )}
          {section.items.map((item) => {
            // Active state logic yang lebih robust
            const isActive = 
              pathname === item.href || 
              (item.href === "/admin/dashboard" && (pathname === "/admin" || pathname === "/admin/dashboard")) ||
              (item.href !== "/admin/dashboard" && pathname.startsWith(item.href + "/"));
            
            return (
              <NavItemComponent
                key={item.href}
                item={item}
                isActive={isActive}
                onClick={onNavClick}
              />
            );
          })}
        </div>
      ))}
    </nav>
  );
});

// ============================================
// MAIN COMPONENT
// ============================================
export default function AdminShell({ children, initialUser }: AdminShellProps) {
  const pathname = usePathname();
  
  // UI States
  const [profileModalOpen, setProfileModalOpen] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);

  // Profile States
  const [profileLoading, setProfileLoading] = useState(false);
  const [profileSaving, setProfileSaving] = useState(false);
  const [passwordSaving, setPasswordSaving] = useState(false);
  const [profileMessage, setProfileMessage] = useState<{
    type: "success" | "error" | "";
    text: string;
  }>({ type: "", text: "" });
  const [passwordMessage, setPasswordMessage] = useState<{
    type: "success" | "error" | "";
    text: string;
  }>({ type: "", text: "" });
  const [profileData, setProfileData] = useState<{
    id?: number;
    name?: string;
    email?: string;
    role?: string;
    createdAt?: string;
  }>({});
  const [profileForm, setProfileForm] = useState({ name: "" });
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  // ============================================
  // MEMOIZED CALLBACKS - Untuk mencegah re-render children
  // ============================================

  const handleLogoutClick = useCallback(() => {
    setShowLogoutModal(true);
  }, []);

  const handleLogoutConfirm = useCallback(async () => {
    setLoggingOut(true);
    try {
      await fetch("/api/auth/logout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ logoutType: "admin" }),
      });
      window.location.href = "/auth/login";
    } catch (error) {
      console.error("Logout failed:", error);
      setLoggingOut(false);
      setShowLogoutModal(false);
    }
  }, []);

  const loadProfileData = useCallback(async () => {
    setProfileLoading(true);
    setProfileMessage({ type: "", text: "" });
    setPasswordMessage({ type: "", text: "" });
    try {
      const response = await fetch("/api/auth/me", { credentials: "include" });
      if (!response.ok) throw new Error("Gagal memuat profil");
      const data = await response.json();
      setProfileData(data.user);
      setProfileForm({ name: data.user.name || "" });
    } catch {
      setProfileMessage({ type: "error", text: "Gagal memuat data profil" });
    } finally {
      setProfileLoading(false);
    }
  }, []);

  const openProfileModal = useCallback(() => {
    setProfileModalOpen(true);
    loadProfileData();
  }, [loadProfileData]);

  const closeProfileModal = useCallback(() => {
    setProfileModalOpen(false);
    setProfileMessage({ type: "", text: "" });
    setPasswordMessage({ type: "", text: "" });
  }, []);

  const handleProfileFormChange = useCallback((e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setProfileForm((prev) => ({ ...prev, [name]: value }));
  }, []);

  const handlePasswordFormChange = useCallback((e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setPasswordForm((prev) => ({ ...prev, [name]: value }));
  }, []);

  const handleProfileSubmit = useCallback(async (e: FormEvent) => {
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

      if (!response.ok) throw new Error("Gagal memperbarui profil");

      setProfileMessage({ type: "success", text: "Profil berhasil diperbarui!" });
      loadProfileData();
    } catch {
      setProfileMessage({ type: "error", text: "Gagal memperbarui profil" });
    } finally {
      setProfileSaving(false);
    }
  }, [profileForm.name, loadProfileData]);

  const handlePasswordSubmit = useCallback(async (e: FormEvent) => {
    e.preventDefault();
    setPasswordSaving(true);
    setPasswordMessage({ type: "", text: "" });

    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setPasswordMessage({ type: "error", text: "Password baru dan konfirmasi tidak cocok" });
      setPasswordSaving(false);
      return;
    }

    // Strong password validation
    if (passwordForm.newPassword.length < 8) {
      setPasswordMessage({ type: "error", text: "Password minimal 8 karakter" });
      setPasswordSaving(false);
      return;
    }
    if (!/[A-Z]/.test(passwordForm.newPassword)) {
      setPasswordMessage({ type: "error", text: "Password harus mengandung huruf besar (A-Z)" });
      setPasswordSaving(false);
      return;
    }
    if (!/[a-z]/.test(passwordForm.newPassword)) {
      setPasswordMessage({ type: "error", text: "Password harus mengandung huruf kecil (a-z)" });
      setPasswordSaving(false);
      return;
    }
    if (!/[0-9]/.test(passwordForm.newPassword)) {
      setPasswordMessage({ type: "error", text: "Password harus mengandung angka (0-9)" });
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
      if (!response.ok) throw new Error(data.error || "Gagal mengubah password");

      setPasswordMessage({ type: "success", text: "Password berhasil diubah!" });
      setPasswordForm({ currentPassword: "", newPassword: "", confirmPassword: "" });
    } catch (error) {
      setPasswordMessage({
        type: "error",
        text: error instanceof Error ? error.message : "Gagal mengubah password",
      });
    } finally {
      setPasswordSaving(false);
    }
  }, [passwordForm]);

  // Memoized user info
  const userName = useMemo(() => initialUser?.name || "Admin", [initialUser?.name]);
  const headerInitial = useMemo(() => 
    (userName?.charAt(0) || "A").toUpperCase(), 
    [userName]
  );
  const modalInitial = useMemo(() => 
    (profileData.name?.charAt(0) || userName?.charAt(0) || "A").toUpperCase(),
    [profileData.name, userName]
  );

  return (
    <div className="admin-layout">
      {/* Header - Same style as Member */}
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
              className={`profile-avatar-btn ${profileModalOpen ? "active" : ""}`}
              onClick={openProfileModal}
              aria-haspopup="dialog"
              aria-expanded={profileModalOpen}
              aria-label="Kelola profil admin"
              title="Kelola profil"
            >
              <div className="user-avatar">{headerInitial}</div>
            </button>
            <span className="welcome-text">Halo, {userName}</span>
            <span className="divider">|</span>
            <button 
              type="button" 
              className="logout-btn logout-btn-danger" 
              onClick={handleLogoutClick}
            >
              <svg 
                width="16" 
                height="16" 
                viewBox="0 0 24 24" 
                fill="none" 
                stroke="currentColor" 
                strokeWidth="2" 
                strokeLinecap="round" 
                strokeLinejoin="round"
                className="logout-icon"
              >
                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                <polyline points="16 17 21 12 16 7" />
                <line x1="21" y1="12" x2="9" y2="12" />
              </svg>
              Logout
            </button>
          </div>
        </div>
      </header>

      {/* Layout Container */}
      <div className="layout-container">
        {/* Sidebar - Same style as Member */}
        <aside className="admin-sidebar">
          <SidebarNav pathname={pathname} />
        </aside>

        {/* Main Content */}
        <main className="main-content">{children}</main>
      </div>

      {/* Profile Modal - Same style as Member */}
      <div
        className={`admin-profile-overlay ${profileModalOpen ? "open" : ""}`}
        role="dialog"
        aria-modal="true"
        aria-labelledby="admin-profile-modal-title"
        onClick={closeProfileModal}
      >
        <div className="admin-profile-modal" onClick={(e) => e.stopPropagation()}>
          <button 
            className="profile-modal-close" 
            onClick={closeProfileModal} 
            aria-label="Tutup modal"
          >
            ×
          </button>
          
          {profileLoading ? (
            <div className="profile-modal-loading">Memuat data profil...</div>
          ) : (
            <>
              {/* Header */}
              <div className="profile-modal-header">
                <div className="profile-modal-avatar">{modalInitial}</div>
                <div>
                  <h3 id="admin-profile-modal-title">{profileData.name || userName}</h3>
                  <p>{profileData.email || initialUser?.email}</p>
                  {profileData.createdAt && (
                    <span className="profile-modal-meta">
                      Bergabung sejak {new Date(profileData.createdAt).toLocaleDateString("id-ID")}
                    </span>
                  )}
                </div>
              </div>

              {/* Body */}
              <div className="profile-modal-body">
                {/* Update Name Panel */}
                <div className="profile-modal-panel">
                  <h4>Perbarui Nama</h4>
                  <p>Sesuaikan nama yang tampil pada dashboard admin.</p>
                  {profileMessage.text && (
                    <div className={`profile-modal-alert ${profileMessage.type}`}>
                      {profileMessage.text}
                    </div>
                  )}
                  <form className="profile-modal-form" onSubmit={handleProfileSubmit}>
                    <label className="profile-modal-field" htmlFor="admin-profile-name">
                      <span>Nama Lengkap</span>
                      <input
                        id="admin-profile-name"
                        type="text"
                        name="name"
                        value={profileForm.name}
                        onChange={handleProfileFormChange}
                        placeholder="Nama lengkap"
                        required
                      />
                    </label>
                    <button 
                      type="submit" 
                      className="profile-modal-submit primary" 
                      disabled={profileSaving}
                    >
                      {profileSaving ? "Menyimpan..." : "Simpan Nama"}
                    </button>
                  </form>
                </div>

                {/* Change Password Panel */}
                <div className="profile-modal-panel">
                  <h4>Ubah Password</h4>
                  <p>Gunakan password yang kuat untuk melindungi akun Anda.</p>
                  {passwordMessage.text && (
                    <div className={`profile-modal-alert ${passwordMessage.type}`}>
                      {passwordMessage.text}
                    </div>
                  )}
                  <form className="profile-modal-form" onSubmit={handlePasswordSubmit}>
                    <label className="profile-modal-field" htmlFor="admin-current-password">
                      <span>Password Saat Ini</span>
                      <input
                        id="admin-current-password"
                        type="password"
                        name="currentPassword"
                        value={passwordForm.currentPassword}
                        onChange={handlePasswordFormChange}
                        placeholder="Masukkan password saat ini"
                        required
                      />
                    </label>

                    <label className="profile-modal-field" htmlFor="admin-new-password">
                      <span>Password Baru</span>
                      <input
                        id="admin-new-password"
                        type="password"
                        name="newPassword"
                        value={passwordForm.newPassword}
                        onChange={handlePasswordFormChange}
                        placeholder="Minimal 6 karakter"
                        required
                      />
                    </label>

                    <label className="profile-modal-field" htmlFor="admin-confirm-password">
                      <span>Konfirmasi Password Baru</span>
                      <input
                        id="admin-confirm-password"
                        type="password"
                        name="confirmPassword"
                        value={passwordForm.confirmPassword}
                        onChange={handlePasswordFormChange}
                        placeholder="Ulangi password baru"
                        required
                      />
                    </label>

                    <button 
                      type="submit" 
                      className="profile-modal-submit secondary" 
                      disabled={passwordSaving}
                    >
                      {passwordSaving ? "Memproses..." : "Perbarui Password"}
                    </button>
                  </form>
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Logout Confirmation Modal - Same as Member */}
      <DeleteConfirmModal
        isOpen={showLogoutModal}
        onClose={() => setShowLogoutModal(false)}
        onConfirm={handleLogoutConfirm}
        itemName="sesi login"
        itemType="akun"
        title="Konfirmasi Logout"
        warningText="Apakah Anda yakin ingin keluar dari sistem? Anda perlu login kembali untuk mengakses halaman admin."
        confirmButtonText="Keluar"
        cancelButtonText="Batal"
        isLoading={loggingOut}
      />
    </div>
  );
}
