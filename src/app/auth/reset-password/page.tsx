"use client";

import { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";

function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  const [formData, setFormData] = useState({
    password: "",
    confirmPassword: "",
  });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (formData.password !== formData.confirmPassword) {
      setError("Password tidak cocok");
      return;
    }

    if (formData.password.length < 6) {
      setError("Password minimal 6 karakter");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          token,
          password: formData.password,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || "Terjadi kesalahan");
        return;
      }

      setSuccess(true);
      
      // Redirect to login after 3 seconds
      setTimeout(() => {
        router.push("/auth/login");
      }, 3000);
    } catch {
      setError("Terjadi kesalahan. Silakan coba lagi.");
    } finally {
      setLoading(false);
    }
  };

  if (!token) {
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
          </div>
          
          <div className="auth-error">
            <span>⚠</span>
            Token tidak ditemukan. Link reset password tidak valid.
          </div>
          
          <div className="auth-footer">
            <Link href="/auth/forgot-password" className="btn-barizta btn-barizta-block btn-barizta-lg">
              Minta Link Reset Baru
            </Link>
          </div>
        </div>
      </div>
    );
  }

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
          <p>Buat Password Baru</p>
        </div>

        {success ? (
          <div className="success-message">
            <div className="success-icon">✓</div>
            <h3>Password Berhasil Diubah!</h3>
            <p>
              Password Anda telah berhasil direset. 
              Anda akan dialihkan ke halaman login...
            </p>
            <Link href="/auth/login" className="btn-barizta btn-barizta-block btn-barizta-lg">
              Login Sekarang
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
                <label htmlFor="password">Password Baru</label>
                <input
                  type="password"
                  id="password"
                  value={formData.password}
                  onChange={(e) =>
                    setFormData({ ...formData, password: e.target.value })
                  }
                  placeholder="Minimal 6 karakter"
                  required
                  disabled={loading}
                />
              </div>

              <div className="form-group">
                <label htmlFor="confirmPassword">Konfirmasi Password</label>
                <input
                  type="password"
                  id="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={(e) =>
                    setFormData({ ...formData, confirmPassword: e.target.value })
                  }
                  placeholder="Masukkan password kembali"
                  required
                  disabled={loading}
                />
              </div>

              <button
                type="submit"
                className="btn-barizta btn-barizta-block btn-barizta-lg"
                disabled={loading}
              >
                {loading ? "Menyimpan..." : "Simpan Password Baru"}
              </button>
            </form>

            <div className="auth-footer">
              <Link href="/auth/login" className="back-link">
                ← Kembali ke Login
              </Link>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={
      <div className="auth-container dark">
        <div className="auth-card">
          <p style={{ textAlign: 'center', color: '#B6B3AC' }}>Loading...</p>
        </div>
      </div>
    }>
      <ResetPasswordForm />
    </Suspense>
  );
}
