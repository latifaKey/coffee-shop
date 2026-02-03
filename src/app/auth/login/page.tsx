"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { signIn } from "next-auth/react";
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
  const [googleLoading, setGoogleLoading] = useState(false);

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

  const handleGoogleLogin = async () => {
    setGoogleLoading(true);
    setError("");
    
    try {
      await signIn("google", {
        callbackUrl: "/member/dashboard",
        redirect: true,
      });
    } catch (err) {
      setError("Gagal login dengan Google");
      setGoogleLoading(false);
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
              disabled={loading || googleLoading}
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
              disabled={loading || googleLoading}
            />
            <p className="password-hint">
              Password: min. 8 karakter, huruf besar, huruf kecil, dan angka
            </p>
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
            disabled={loading || googleLoading}
          >
            {loading ? "Memproses..." : "Masuk"}
          </button>
        </form>

        {/* Divider */}
        <div className="auth-divider">
          <span>atau masuk dengan Gmail</span>
        </div>

        {/* Google Sign-In Button */}
        <button
          type="button"
          onClick={handleGoogleLogin}
          disabled={googleLoading || loading}
          className="btn-google"
        >
          {googleLoading ? (
            <>
              <span className="spinner"></span>
              Menghubungkan...
            </>
          ) : (
            <>
              <svg width="18" height="18" viewBox="0 0 18 18" xmlns="http://www.w3.org/2000/svg">
                <path fill="#4285F4" d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.717v2.258h2.908c1.702-1.567 2.684-3.874 2.684-6.615z"/>
                <path fill="#34A853" d="M9 18c2.43 0 4.467-.806 5.956-2.184l-2.908-2.258c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332C2.438 15.983 5.482 18 9 18z"/>
                <path fill="#FBBC05" d="M3.964 10.707c-.18-.54-.282-1.117-.282-1.707 0-.593.102-1.17.282-1.709V4.958H.957C.347 6.173 0 7.548 0 9c0 1.452.348 2.827.957 4.042l3.007-2.335z"/>
                <path fill="#EA4335" d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0 5.482 0 2.438 2.017.957 4.958L3.964 7.29C4.672 5.163 6.656 3.58 9 3.58z"/>
              </svg>
              Masuk dengan Google
            </>
          )}
        </button>

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
