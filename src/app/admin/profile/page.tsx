"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";

interface AdminUser {
  id: number;
  name: string;
  email: string;
  phone?: string;
  role: string;
  createdAt: string;
}

export default function ProfilePage() {
  const router = useRouter();
  const [user, setUser] = useState<AdminUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"info" | "password">("info");
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });

  const [profileForm, setProfileForm] = useState({
    name: "",
    email: "",
    phone: ""
  });

  const [passwordForm, setPasswordForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: ""
  });

  const fetchUser = useCallback(async () => {
    try {
      const res = await fetch("/api/auth/me", { credentials: 'include' });
      if (!res.ok) {
        router.push("/admin/login");
        return;
      }
      const data = await res.json();
      setUser(data.user);
      setProfileForm({
        name: data.user.name || "",
        email: data.user.email || "",
        phone: data.user.phone || ""
      });
    } catch (error) {
      console.error("Failed to fetch user:", error);
      router.push("/admin/login");
    } finally {
      setLoading(false);
    }
  }, [router]);

  useEffect(() => {
    fetchUser();
  }, [fetchUser]);

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMessage({ type: "", text: "" });

    try {
      const res = await fetch("/api/auth/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: 'include',
        body: JSON.stringify({
          name: profileForm.name,
          phone: profileForm.phone
        })
      });

      if (res.ok) {
        const data = await res.json();
        setUser(data.user);
        setMessage({ type: "success", text: "Profil berhasil diperbarui!" });
        // Refresh setelah 1 detik agar header terupdate
        setTimeout(() => {
          window.location.reload();
        }, 1000);
      } else {
        const err = await res.json();
        setMessage({ type: "error", text: err.error || "Gagal memperbarui profil" });
      }
    } catch (error) {
      console.error("Save error:", error);
      setMessage({ type: "error", text: "Terjadi kesalahan" });
    } finally {
      setSaving(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMessage({ type: "", text: "" });

    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setMessage({ type: "error", text: "Konfirmasi password tidak cocok" });
      setSaving(false);
      return;
    }

    if (passwordForm.newPassword.length < 6) {
      setMessage({ type: "error", text: "Password minimal 6 karakter" });
      setSaving(false);
      return;
    }

    try {
      const res = await fetch("/api/auth/change-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: 'include',
        body: JSON.stringify({
          currentPassword: passwordForm.currentPassword,
          newPassword: passwordForm.newPassword
        })
      });

      if (res.ok) {
        setMessage({ type: "success", text: "Password berhasil diubah!" });
        setPasswordForm({
          currentPassword: "",
          newPassword: "",
          confirmPassword: ""
        });
      } else {
        const err = await res.json();
        setMessage({ type: "error", text: err.error || "Gagal mengubah password" });
      }
    } catch (error) {
      console.error("Password change error:", error);
      setMessage({ type: "error", text: "Terjadi kesalahan" });
    } finally {
      setSaving(false);
    }
  };

  if (loading) return null;

  return (
    <>
      <style jsx>{`
        .profile-container {
          padding: 2rem;
          max-width: 900px;
          margin: 0 auto;
        }

        .page-header {
          margin-bottom: 2rem;
        }

        .page-header h1 {
          font-size: 2rem;
          color: #D4A574;
          margin: 0 0 0.5rem 0;
        }

        .page-header p {
          color: #999;
          margin: 0;
        }

        .profile-card {
          background: linear-gradient(145deg, #2a1810 0%, #1f1410 100%);
          border: 1px solid rgba(139, 69, 19, 0.5);
          border-radius: 16px;
          padding: 2rem;
          margin-bottom: 1.5rem;
        }

        .avatar-section {
          display: flex;
          align-items: center;
          gap: 2rem;
          margin-bottom: 2rem;
          padding-bottom: 2rem;
          border-bottom: 1px solid rgba(139, 69, 19, 0.3);
        }

        .large-avatar {
          width: 100px;
          height: 100px;
          border-radius: 50%;
          background: linear-gradient(135deg, #8B4513 0%, #D4A574 100%);
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 2.5rem;
          font-weight: bold;
          color: white;
          border: 3px solid #D4A574;
          box-shadow: 0 4px 15px rgba(139, 69, 19, 0.4);
        }

        .avatar-info h2 {
          font-size: 1.5rem;
          color: #D4A574;
          margin: 0 0 0.5rem 0;
        }

        .role-badge {
          display: inline-block;
          background: linear-gradient(135deg, #c0392b, #e74c3c);
          color: white;
          padding: 0.3rem 1rem;
          border-radius: 20px;
          font-size: 0.85rem;
          font-weight: 600;
        }

        .tabs-container {
          display: flex;
          gap: 1rem;
          margin-bottom: 1.5rem;
        }

        .tab-button {
          padding: 0.8rem 1.5rem;
          background: linear-gradient(135deg, rgba(139, 69, 19, 0.2), rgba(212, 165, 116, 0.1));
          border: 1px solid rgba(139, 69, 19, 0.5);
          border-radius: 10px;
          color: #D4A574;
          cursor: pointer;
          font-size: 1rem;
          transition: all 0.3s;
          position: relative;
          overflow: hidden;
        }

        .tab-button::before {
          content: '';
          position: absolute;
          top: 0;
          left: -100%;
          width: 100%;
          height: 100%;
          background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.1), transparent);
          transition: left 0.5s;
        }

        .tab-button:hover::before {
          left: 100%;
        }

        .tab-button:hover {
          background: linear-gradient(135deg, rgba(139, 69, 19, 0.4), rgba(212, 165, 116, 0.2));
          transform: translateY(-2px);
        }

        .tab-button.active {
          background: linear-gradient(135deg, #8B4513, #D4A574);
          color: white;
          border-color: #D4A574;
          box-shadow: 0 4px 12px rgba(139, 69, 19, 0.4);
        }

        .alert {
          padding: 1rem;
          border-radius: 10px;
          margin-bottom: 1.5rem;
          font-weight: 500;
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }

        .alert-success {
          background: rgba(76, 175, 80, 0.15);
          border: 1px solid rgba(76, 175, 80, 0.4);
          color: #4caf50;
        }

        .alert-error {
          background: rgba(244, 67, 54, 0.15);
          border: 1px solid rgba(244, 67, 54, 0.4);
          color: #f44336;
        }

        .form-group {
          margin-bottom: 1.5rem;
        }

        .form-group label {
          display: block;
          color: #D4A574;
          margin-bottom: 0.5rem;
          font-weight: 600;
        }

        .form-group input,
        .form-group textarea {
          width: 100%;
          padding: 0.9rem 1rem;
          background: rgba(0, 0, 0, 0.3);
          border: 1px solid rgba(139, 69, 19, 0.5);
          border-radius: 10px;
          color: white;
          font-size: 1rem;
          transition: all 0.3s;
        }

        .form-group input:focus,
        .form-group textarea:focus {
          outline: none;
          border-color: #D4A574;
          box-shadow: 0 0 0 3px rgba(212, 165, 116, 0.15);
        }

        .form-group input:disabled {
          opacity: 0.5;
          cursor: not-allowed;
          background: rgba(0, 0, 0, 0.5);
          color: #888;
        }

        .form-group textarea {
          resize: vertical;
          min-height: 100px;
        }

        .form-hint {
          color: #888;
          font-size: 0.85rem;
          margin-top: 0.4rem;
          display: block;
        }

        .info-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 1.5rem;
        }

        .info-grid-full {
          grid-column: 1 / -1;
        }

        .button-group {
          display: flex;
          gap: 1rem;
          margin-top: 2rem;
        }

        .btn-save {
          padding: 0.9rem 2rem;
          background: linear-gradient(135deg, rgba(139, 69, 19, 0.4), rgba(212, 165, 116, 0.3));
          border: 1px solid #8B4513;
          border-radius: 10px;
          color: #D4A574;
          font-size: 1rem;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s;
          position: relative;
          overflow: hidden;
          box-shadow: 0 2px 8px rgba(139, 69, 19, 0.2);
        }

        .btn-save::before {
          content: '';
          position: absolute;
          top: 0;
          left: -100%;
          width: 100%;
          height: 100%;
          background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent);
          transition: left 0.5s;
        }

        .btn-save:hover::before {
          left: 100%;
        }

        .btn-save:hover {
          background: linear-gradient(135deg, rgba(139, 69, 19, 0.6), rgba(212, 165, 116, 0.5));
          border-color: #D4A574;
          transform: translateY(-2px);
          box-shadow: 0 4px 15px rgba(139, 69, 19, 0.4);
        }

        .btn-save:disabled {
          opacity: 0.6;
          cursor: not-allowed;
          transform: none;
        }

        @media (max-width: 768px) {
          .profile-container {
            padding: 1rem;
          }

          .avatar-section {
            flex-direction: column;
            text-align: center;
          }

          .info-grid {
            grid-template-columns: 1fr;
          }

          .tabs-container {
            flex-direction: column;
          }

          .tab-button {
            text-align: center;
          }
        }
      `}</style>

      <div className="profile-container">
        <div className="page-header">
          <h1>👤 Profil Admin</h1>
          <p>Kelola informasi profil dan keamanan akun Anda</p>
        </div>

        <div className="profile-card">
          <div className="avatar-section">
            <div className="large-avatar">
              {user?.name?.charAt(0)?.toUpperCase() || 'A'}
            </div>
            <div className="avatar-info">
              <h2>{user?.name || 'Admin'}</h2>
              <span className="role-badge">Administrator</span>
            </div>
          </div>

          {/* Tabs */}
          <div className="tabs-container">
            <button
              className={`tab-button ${activeTab === "info" ? "active" : ""}`}
              onClick={() => { setActiveTab("info"); setMessage({ type: "", text: "" }); }}
            >
              📝 Informasi Profil
            </button>
            <button
              className={`tab-button ${activeTab === "password" ? "active" : ""}`}
              onClick={() => { setActiveTab("password"); setMessage({ type: "", text: "" }); }}
            >
              🔐 Ubah Password
            </button>
          </div>

          {/* Message */}
          {message.text && (
            <div className={`alert ${message.type === "success" ? "alert-success" : "alert-error"}`}>
              {message.type === "success" ? "✅" : "❌"} {message.text}
            </div>
          )}

          {activeTab === "info" ? (
            <form onSubmit={handleSaveProfile}>
              <div className="info-grid">
                <div className="form-group">
                  <label>Nama Lengkap</label>
                  <input
                    type="text"
                    value={profileForm.name}
                    onChange={(e) => setProfileForm(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="Masukkan nama lengkap"
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Email</label>
                  <input
                    type="email"
                    value={profileForm.email}
                    disabled
                    placeholder="email@example.com"
                  />
                  <span className="form-hint">Email tidak dapat diubah</span>
                </div>

                <div className="form-group">
                  <label>No. Telepon</label>
                  <input
                    type="tel"
                    value={profileForm.phone}
                    onChange={(e) => setProfileForm(prev => ({ ...prev, phone: e.target.value }))}
                    placeholder="08xxxxxxxxxx"
                  />
                </div>

                <div className="form-group">
                  <label>Bergabung Sejak</label>
                  <input
                    type="text"
                    value={user?.createdAt ? new Date(user.createdAt).toLocaleDateString('id-ID', { year: 'numeric', month: 'long', day: 'numeric' }) : '-'}
                    disabled
                  />
                </div>

              </div>

              <div className="button-group">
                <button type="submit" className="btn-save" disabled={saving}>
                  {saving ? "Menyimpan..." : "💾 Simpan Perubahan"}
                </button>
              </div>
            </form>
          ) : (
            <form onSubmit={handleChangePassword}>
              <div className="info-grid">
                <div className="form-group">
                  <label>Password Saat Ini</label>
                  <input
                    type="password"
                    value={passwordForm.currentPassword}
                    onChange={(e) => setPasswordForm(prev => ({ ...prev, currentPassword: e.target.value }))}
                    placeholder="Masukkan password saat ini"
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Password Baru</label>
                  <input
                    type="password"
                    value={passwordForm.newPassword}
                    onChange={(e) => setPasswordForm(prev => ({ ...prev, newPassword: e.target.value }))}
                    placeholder="Masukkan password baru"
                    required
                  />
                  <span className="form-hint">Minimal 6 karakter</span>
                </div>

                <div className="form-group info-grid-full">
                  <label>Konfirmasi Password Baru</label>
                  <input
                    type="password"
                    value={passwordForm.confirmPassword}
                    onChange={(e) => setPasswordForm(prev => ({ ...prev, confirmPassword: e.target.value }))}
                    placeholder="Konfirmasi password baru"
                    required
                  />
                </div>
              </div>

              <div className="button-group">
                <button type="submit" className="btn-save" disabled={saving}>
                  {saving ? "Menyimpan..." : "🔐 Ubah Password"}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </>
  );
}
