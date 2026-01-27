"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import "./register.css";

interface ClassItem {
  id: number;
  title: string;
  description: string;
  instructor: string;
  schedule: string;
  price: number;
  maxParticipants: number;
  enrolledCount: number;
  status: string;
  image: string;
}

export default function MemberClassRegisterPage() {
  const [classes, setClasses] = useState<ClassItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedClass, setSelectedClass] = useState<string>("");
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phone: "",
    notes: ""
  });
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch available classes
  useEffect(() => {
    const fetchClasses = async () => {
      try {
        const res = await fetch("/api/classes?status=active");
        if (res.ok) {
          const data = await res.json();
          setClasses(data.filter((c: ClassItem) => c.enrolledCount < c.maxParticipants));
        }
      } catch (err) {
        console.error("Error fetching classes:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchClasses();
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedClass) {
      setError("Pilih kelas terlebih dahulu");
      return;
    }

    if (!formData.fullName || !formData.email || !formData.phone) {
      setError("Semua field wajib diisi");
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      const res = await fetch("/api/enrollments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          classId: selectedClass,
          studentName: formData.fullName,
          email: formData.email,
          phone: formData.phone
        })
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Gagal mendaftar kelas");
      }

      setSuccess(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Terjadi kesalahan");
    } finally {
      setSubmitting(false);
    }
  };

  if (success) {
    return (
      <div className="member-register-page">
        <div className="success-container">
          <div className="success-icon">✅</div>
          <h1>Pendaftaran Berhasil!</h1>
          <p>Terima kasih telah mendaftar kelas di BARIZTA. Tim kami akan menghubungi Anda untuk konfirmasi pembayaran.</p>
          <div className="success-actions">
            <Link href="/member/classes" className="btn-primary">
              Lihat Kelas Saya
            </Link>
            <Link href="/member/dashboard" className="btn-secondary">
              Kembali ke Dashboard
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="member-register-page">
      <div className="register-header">
        <Link href="/member/classes" className="back-link">← Kembali</Link>
        <h1>Daftar Kelas Baru</h1>
        <p>Pilih kelas dan lengkapi data Anda untuk mendaftar</p>
      </div>

      <div className="register-content">
        <form onSubmit={handleSubmit} className="register-form">
          {/* Class Selection */}
          <div className="form-section">
            <h2>Pilih Kelas</h2>
            {loading ? (
              <p className="loading-text">Memuat kelas...</p>
            ) : classes.length === 0 ? (
              <p className="empty-text">Tidak ada kelas yang tersedia saat ini.</p>
            ) : (
              <div className="class-options">
                {classes.map((classItem) => (
                  <label 
                    key={classItem.id} 
                    className={`class-option ${selectedClass === String(classItem.id) ? 'selected' : ''}`}
                  >
                    <input
                      type="radio"
                      name="classId"
                      value={classItem.id}
                      checked={selectedClass === String(classItem.id)}
                      onChange={(e) => setSelectedClass(e.target.value)}
                    />
                    <div className="class-option-content">
                      <div className="class-info">
                        <h3>{classItem.title}</h3>
                        <p className="instructor">Instruktur: {classItem.instructor}</p>
                        <p className="schedule">
                          Jadwal: {new Date(classItem.schedule).toLocaleDateString('id-ID', {
                            weekday: 'long',
                            day: 'numeric',
                            month: 'long',
                            year: 'numeric'
                          })}
                        </p>
                        <p className="slots">
                          Slot tersedia: {classItem.maxParticipants - classItem.enrolledCount} dari {classItem.maxParticipants}
                        </p>
                      </div>
                      <div className="class-price">
                        Rp {classItem.price.toLocaleString('id-ID')}
                      </div>
                    </div>
                  </label>
                ))}
              </div>
            )}
          </div>

          {/* Personal Information */}
          <div className="form-section">
            <h2>Data Diri</h2>
            <div className="form-grid">
              <div className="form-group">
                <label htmlFor="fullName">Nama Lengkap *</label>
                <input
                  type="text"
                  id="fullName"
                  name="fullName"
                  value={formData.fullName}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div className="form-group">
                <label htmlFor="email">Email *</label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div className="form-group">
                <label htmlFor="phone">Nomor WhatsApp *</label>
                <input
                  type="tel"
                  id="phone"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  placeholder="08xxxxxxxxxx"
                  required
                />
              </div>
              <div className="form-group full-width">
                <label htmlFor="notes">Catatan (opsional)</label>
                <textarea
                  id="notes"
                  name="notes"
                  value={formData.notes}
                  onChange={handleInputChange}
                  rows={3}
                  placeholder="Pengalaman barista, pertanyaan, atau catatan khusus..."
                />
              </div>
            </div>
          </div>

          {/* Payment Info */}
          <div className="form-section payment-info">
            <h2>Informasi Pembayaran</h2>
            <div className="payment-box">
              <p>Setelah pendaftaran dikonfirmasi, lakukan pembayaran ke:</p>
              <div className="bank-info">
                <strong>Bank BCA</strong>
                <span className="account-number">1234567890</span>
                <span className="account-name">a/n BARIZTA RUANG KREATIF</span>
              </div>
              <p className="payment-note">
                Bukti transfer dapat dikirim melalui WhatsApp ke 0813-6823-6245
              </p>
            </div>
          </div>

          {error && (
            <div className="error-alert">
              {error}
            </div>
          )}

          <div className="form-actions">
            <button 
              type="submit" 
              className="btn-submit"
              disabled={submitting || !selectedClass}
            >
              {submitting ? "Mendaftar..." : "Daftar Sekarang"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
