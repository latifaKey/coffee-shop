"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";

function LoginContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  // Load theme preference dan cek registered status
  useEffect(() => {
    // Tampilkan pesan sukses jika baru register
    if (searchParams.get("registered") === "true") {
      setSuccess("Registrasi berhasil! Silakan login dengan akun Anda.");
    }
  }, [searchParams]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...formData,
          loginType: "member", // Ini login untuk member
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || "Login gagal");
        setLoading(false);
        return;
      }

      // Cek redirect URL dari query params
      const redirectUrl = searchParams.get("redirect");

      // Redirect based on role
      if (data.user.role === "admin") {
        // Admin yang login dari halaman member, arahkan ke admin dashboard
        router.push("/admin");
      } else {
        // Member - cek apakah ada redirect URL
        if (redirectUrl && !redirectUrl.startsWith("/admin")) {
          router.push(redirectUrl);
        } else {
          router.push("/member/dashboard");
        }
      }
      router.refresh();
    } catch {
      setError("Terjadi kesalahan. Silakan coba lagi.");
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
              alt="BARIZTA Coffee"
              width={100}
              height={100}
              className="logo-img"
            />
          </div>
          <p>Silakan masuk ke akun Anda</p>
        </div>

        {success && (
          <div className="auth-success">
            <span>✅</span> {success}
          </div>
        )}

        {error && (
          <div className="auth-error">
            <span>⚠️</span> {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input
              type="email"
              id="email"
              value={formData.email}
              onChange={(e) =>
                setFormData({ ...formData, email: e.target.value })
              }
              placeholder="nama@email.com"
              required
              disabled={loading}
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input
              type="password"
              id="password"
              value={formData.password}
              onChange={(e) =>
                setFormData({ ...formData, password: e.target.value })
              }
              placeholder="Masukkan password"
              required
              disabled={loading}
            />
          </div>

          <div className="form-options">
            <Link 
              href="/auth/forgot-password" 
              className="forgot-link"
            >
              Lupa password?
            </Link>
          </div>

          <button 
            type="submit" 
            className="btn-barizta btn-barizta-block btn-barizta-lg" 
            disabled={loading}
          >
            {loading ? "Memproses..." : "Masuk"}
          </button>
        </form>

        <div className="auth-footer">
          <p>
            Belum punya akun?{" "}
            <Link 
              href="/auth/register"
              className="dark"
            >
              Daftar sekarang
            </Link>
          </p>
          <Link 
            href="/" 
            className="back-link"
          >
            ← Kembali ke Beranda
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="auth-loading">Loading...</div>}>
      <LoginContent />
    </Suspense>
  );
}
