"use client";

import { useState } from "react";
import Link from "next/link";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");
  const [devResetLink, setDevResetLink] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const response = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || "Terjadi kesalahan");
        return;
      }
      
      // For development: capture reset link if email sending fails
      if (data.devResetLink) {
        setDevResetLink(data.devResetLink);
      }
      
      setSuccess(true);
    } catch {
      setError("Terjadi kesalahan. Silakan coba lagi.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container dark">
      <div className="auth-card">
        <div className="auth-logo">
          <div className="logo-circle">
            <img
              src="/logo.png"
              alt="Barizta Coffee"
              width={100}
              height={100}
              className="logo-img"
            />
          </div>
          <p>Reset Password Akun Anda</p>
        </div>

        {success ? (
          <div className="success-message">
            <div className="success-icon">✓</div>
            <h3>Email Terkirim!</h3>
            <p>
              Jika email <strong>{email}</strong> terdaftar di sistem kami, 
              Anda akan menerima instruksi untuk mereset password.
            </p>
            <p className="note">
              Periksa folder spam jika tidak menemukan email dalam beberapa menit.
            </p>
            
            {/* Development only: show reset link */}
            {devResetLink && (
              <div style={{ 
                marginTop: '1rem', 
                padding: '1rem', 
                background: 'rgba(139, 69, 19, 0.2)', 
                borderRadius: '8px',
                border: '1px dashed #8B4513'
              }}>
                <p style={{ fontSize: '0.75rem', color: '#D2B48C', marginBottom: '0.5rem' }}>
                  🔧 Development Mode - Link Reset:
                </p>
                <Link 
                  href={devResetLink} 
                  style={{ color: '#D2B48C', fontSize: '0.8rem', wordBreak: 'break-all' }}
                >
                  {devResetLink}
                </Link>
              </div>
            )}
            
            <Link href="/auth/login" className="btn-barizta btn-barizta-block btn-barizta-lg" style={{ marginTop: '1rem' }}>
              Kembali ke Login
            </Link>
          </div>
        ) : (
          <>
            {error && (
              <div className="auth-error">
                <span>⚠</span>
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="auth-form">
              <div className="form-group">
                <label htmlFor="email">Email</label>
                <input
                  type="email"
                  id="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Masukkan email terdaftar"
                  required
                  disabled={loading}
                />
              </div>

              <p className="helper-text">
                Masukkan alamat email yang terdaftar. Kami akan mengirimkan 
                instruksi untuk mereset password Anda.
              </p>

              <button
                type="submit"
                className="btn-barizta btn-barizta-block btn-barizta-lg"
                disabled={loading}
              >
                {loading ? "Mengirim..." : "Kirim Link Reset"}
              </button>
            </form>

            <div className="auth-footer">
              <p>
                Ingat password Anda?{" "}
                <Link href="/auth/login">Masuk di sini</Link>
              </p>
              <Link href="/" className="back-link">
                ← Kembali ke Beranda
              </Link>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
