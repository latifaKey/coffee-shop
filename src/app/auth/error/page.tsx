"use client";

import { useSearchParams } from "next/navigation";
import Link from "next/link";
import Image from "next/image";

export default function AuthErrorPage() {
  const searchParams = useSearchParams();
  const error = searchParams.get("error");

  const getErrorMessage = (errorType: string | null) => {
    switch (errorType) {
      case "Configuration":
        return {
          title: "Konfigurasi Google OAuth Belum Lengkap",
          description: "Google OAuth credentials belum di-setup dengan benar. Silakan gunakan login dengan email/password untuk saat ini.",
          icon: "⚙️",
        };
      case "AccessDenied":
        return {
          title: "Akses Ditolak",
          description: "Anda menolak akses ke akun Google. Silakan coba lagi atau gunakan login dengan email.",
          icon: "🚫",
        };
      case "Verification":
        return {
          title: "Verifikasi Gagal",
          description: "Token verifikasi tidak valid atau sudah kadaluarsa.",
          icon: "⚠️",
        };
      default:
        return {
          title: "Terjadi Kesalahan",
          description: "Maaf, terjadi kesalahan saat proses autentikasi. Silakan coba lagi.",
          icon: "❌",
        };
    }
  };

  const errorInfo = getErrorMessage(error);

  return (
    <div className="auth-container dark">
      <div className="auth-card">
        <div className="auth-logo">
          <div className="logo-circle">
            <Image
              src="/logo.png"
              alt="BARIZTA Coffee"
              width={100}
              height={100}
              priority
              className="logo-img"
            />
          </div>
        </div>

        <div style={{ textAlign: "center", padding: "2rem 0" }}>
          <div style={{ fontSize: "4rem", marginBottom: "1rem" }}>
            {errorInfo.icon}
          </div>
          <h1 style={{ 
            fontSize: "1.5rem", 
            fontWeight: "600", 
            marginBottom: "1rem",
            color: "var(--barizta-gold)"
          }}>
            {errorInfo.title}
          </h1>
          <p style={{ 
            color: "#94a3b8", 
            marginBottom: "2rem",
            lineHeight: "1.6"
          }}>
            {errorInfo.description}
          </p>

          {error === "Configuration" && (
            <div style={{
              backgroundColor: "rgba(251, 191, 36, 0.1)",
              border: "1px solid rgba(251, 191, 36, 0.3)",
              borderRadius: "8px",
              padding: "1rem",
              marginBottom: "2rem",
              textAlign: "left"
            }}>
              <p style={{ color: "#fbbf24", fontSize: "0.875rem", marginBottom: "0.5rem" }}>
                <strong>Untuk Admin:</strong>
              </p>
              <p style={{ color: "#94a3b8", fontSize: "0.875rem", lineHeight: "1.5" }}>
                Setup Google OAuth credentials di Google Cloud Console dan update file .env dengan GOOGLE_CLIENT_ID dan GOOGLE_CLIENT_SECRET yang valid.
              </p>
            </div>
          )}

          <Link 
            href="/auth/login"
            className="btn-barizta btn-barizta-block btn-barizta-lg"
            style={{ marginBottom: "1rem" }}
          >
            Kembali ke Halaman Login
          </Link>

          <Link 
            href="/"
            className="back-link"
            style={{ display: "block", marginTop: "1rem" }}
          >
            ← Kembali ke Beranda
          </Link>
        </div>
      </div>
    </div>
  );
}
