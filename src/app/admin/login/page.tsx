"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function AdminLoginPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...formData,
          loginType: "admin", // Login sebagai admin
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || data.details || "Login gagal");
        setLoading(false);
        return;
      }

      // Cek apakah user adalah admin
      if (data.user.role !== "admin") {
        setError("Anda tidak memiliki akses admin");
        setLoading(false);
        return;
      }

      // Redirect ke admin dashboard
      router.push("/admin");
      router.refresh();
    } catch {
      setError("Terjadi kesalahan. Silakan coba lagi.");
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)",
        padding: "20px",
      }}
    >
      <div
        style={{
          background: "#1e1e2e",
          borderRadius: "16px",
          padding: "40px",
          width: "100%",
          maxWidth: "400px",
          boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.5)",
        }}
      >
        <div style={{ textAlign: "center", marginBottom: "32px" }}>
          <div
            style={{
              width: "80px",
              height: "80px",
              borderRadius: "50%",
              background: "linear-gradient(135deg, #d4a574 0%, #c49b6a 100%)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              margin: "0 auto 16px",
              fontSize: "32px",
            }}
          >
            ☕
          </div>
          <h1
            style={{
              color: "#d4a574",
              fontSize: "24px",
              fontWeight: "600",
              marginBottom: "8px",
            }}
          >
            Admin Login
          </h1>
          <p style={{ color: "#888", fontSize: "14px" }}>
            Masuk ke panel admin BARIZTA
          </p>
        </div>

        {error && (
          <div
            style={{
              background: "rgba(239, 68, 68, 0.1)",
              border: "1px solid rgba(239, 68, 68, 0.3)",
              borderRadius: "8px",
              padding: "12px 16px",
              marginBottom: "20px",
              color: "#ef4444",
              fontSize: "14px",
            }}
          >
            ⚠️ {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: "20px" }}>
            <label
              htmlFor="email"
              style={{
                display: "block",
                color: "#ccc",
                fontSize: "14px",
                marginBottom: "8px",
              }}
            >
              Email
            </label>
            <input
              type="email"
              id="email"
              value={formData.email}
              onChange={(e) =>
                setFormData({ ...formData, email: e.target.value })
              }
              placeholder="admin@barizta.com"
              required
              disabled={loading}
              style={{
                width: "100%",
                padding: "12px 16px",
                background: "#2a2a3e",
                border: "1px solid #3a3a4e",
                borderRadius: "8px",
                color: "#fff",
                fontSize: "14px",
                outline: "none",
                transition: "border-color 0.2s",
              }}
            />
          </div>

          <div style={{ marginBottom: "24px" }}>
            <label
              htmlFor="password"
              style={{
                display: "block",
                color: "#ccc",
                fontSize: "14px",
                marginBottom: "8px",
              }}
            >
              Password
            </label>
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
              style={{
                width: "100%",
                padding: "12px 16px",
                background: "#2a2a3e",
                border: "1px solid #3a3a4e",
                borderRadius: "8px",
                color: "#fff",
                fontSize: "14px",
                outline: "none",
                transition: "border-color 0.2s",
              }}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            style={{
              width: "100%",
              padding: "14px",
              background: loading
                ? "#666"
                : "linear-gradient(135deg, #d4a574 0%, #c49b6a 100%)",
              border: "none",
              borderRadius: "8px",
              color: "#1a1a2e",
              fontSize: "16px",
              fontWeight: "600",
              cursor: loading ? "not-allowed" : "pointer",
              transition: "transform 0.2s, box-shadow 0.2s",
            }}
          >
            {loading ? "Memproses..." : "Masuk"}
          </button>
        </form>

        <div
          style={{
            marginTop: "24px",
            textAlign: "center",
            paddingTop: "20px",
            borderTop: "1px solid #3a3a4e",
          }}
        >
          <Link
            href="/"
            style={{
              color: "#888",
              fontSize: "14px",
              textDecoration: "none",
            }}
          >
            ← Kembali ke Website
          </Link>
        </div>
      </div>
    </div>
  );
}
