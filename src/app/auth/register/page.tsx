"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import Image from "next/image";
import Link from "next/link";

export default function RegisterPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    // Validasi
    if (formData.password !== formData.confirmPassword) {
      setError("Password tidak cocok");
      return;
    }

    // Strong password validation
    if (formData.password.length < 8) {
      setError("Password minimal 8 karakter");
      return;
    }
    if (!/[A-Z]/.test(formData.password)) {
      setError("Password harus mengandung huruf besar (A-Z)");
      return;
    }
    if (!/[a-z]/.test(formData.password)) {
      setError("Password harus mengandung huruf kecil (a-z)");
      return;
    }
    if (!/[0-9]/.test(formData.password)) {
      setError("Password harus mengandung angka (0-9)");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          phone: formData.phone,
          password: formData.password,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || "Registrasi gagal");
        setLoading(false);
        return;
      }

      // Redirect to login after successful registration
      router.push("/auth/login?registered=true");
    } catch {
      setError("Terjadi kesalahan. Silakan coba lagi.");
      setLoading(false);
    }
  };

  const handleGoogleRegister = async () => {
    setGoogleLoading(true);
    setError("");
    
    try {
      await signIn("google", {
        callbackUrl: "/member/dashboard",
        redirect: true,
      });
    } catch (err) {
      setError("Gagal mendaftar dengan Google");
      setGoogleLoading(false);
    }
  };

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
          <p>Buat akun BARIZTA baru</p>
        </div>

        {error && (
          <div className="auth-error">
            <span>⚠️</span> {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-group">
            <label htmlFor="name">Nama Lengkap</label>
            <input
              type="text"
              id="name"
              value={formData.name}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
              placeholder="Masukkan nama lengkap"
              required
              disabled={loading}
            />
          </div>

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
            <label htmlFor="phone">Nomor Telepon</label>
            <input
              type="tel"
              id="phone"
              value={formData.phone}
              onChange={(e) =>
                setFormData({ ...formData, phone: e.target.value })
              }
              placeholder="08xxxxxxxxxx"
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
              placeholder="Buat password kuat"
              required
              disabled={loading || googleLoading}
            />
            <div className="password-requirements">
              <p className="requirements-title">Password harus memiliki:</p>
              <ul>
                <li className={formData.password.length >= 8 ? "valid" : ""}>
                  ✓ Minimal 8 karakter
                </li>
                <li className={/[A-Z]/.test(formData.password) ? "valid" : ""}>
                  ✓ Huruf besar (A-Z)
                </li>
                <li className={/[a-z]/.test(formData.password) ? "valid" : ""}>
                  ✓ Huruf kecil (a-z)
                </li>
                <li className={/[0-9]/.test(formData.password) ? "valid" : ""}>
                  ✓ Angka (0-9)
                </li>
              </ul>
            </div>
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
              disabled={loading || googleLoading}
            />
          </div>

          <div className="terms-check">
            <label className="checkbox-label">
              <input type="checkbox" required />
              <span>
                Saya setuju dengan{" "}
                <Link href="/syarat-ketentuan">Syarat & Ketentuan</Link> dan{" "}
                <Link href="/kebijakan-privasi">Kebijakan Privasi</Link>
              </span>
            </label>
          </div>

          <button
            type="submit"
            className="btn-barizta btn-barizta-block btn-barizta-lg"
            disabled={loading || googleLoading}
          >
            {loading ? "Memproses..." : "Daftar Sekarang"}
          </button>
        </form>

        {/* Divider */}
        <div className="auth-divider">
          <span>atau daftar dengan Gmail</span>
        </div>

        {/* Google Sign-Up Button */}
        <button
          type="button"
          onClick={handleGoogleRegister}
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
              Daftar dengan Google
            </>
          )}
        </button>

        <div className="auth-footer">
          <p>
            Sudah punya akun? <Link href="/auth/login">Masuk di sini</Link>
          </p>
          <Link href="/" className="back-link">
            ← Kembali ke Beranda
          </Link>
        </div>
      </div>
    </div>
  );
}
