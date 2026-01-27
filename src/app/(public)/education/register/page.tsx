"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import "./register.css";

const PHONE = "6281368236245";

const programs = [
  { id: "basic", name: "Basic Barista Class", price: "Rp 2.500.000" },
  { id: "latte", name: "Intermediate Latte Art", price: "Rp 1.800.000" },
  { id: "manual", name: "Professional Manual Brew", price: "Rp 2.000.000" },
  { id: "workshop", name: "Workshop 1 Day", price: "Rp 350.000" }
];

const bankInfo = {
  bank: "BCA",
  accountNumber: "1234567890",
  accountName: "BARIZTA RUANG KREATIF"
};

export default function RegisterPage() {
  const [formData, setFormData] = useState({
    fullName: "",
    birthPlace: "",
    birthDate: "",
    gender: "",
    address: "",
    whatsapp: "",
    email: "",
    program: "",
    schedule: "",
    experience: "",
    paymentProof: null as File | null
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setFormData(prev => ({ ...prev, paymentProof: file }));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    const selectedProgram = programs.find(p => p.id === formData.program);
    
    const msg = `🎓 *PENDAFTARAN PELATIHAN BARISTA BARIZTA*\n\n` +
      `📋 *DATA DIRI*\n` +
      `• Nama Lengkap: ${formData.fullName}\n` +
      `• TTL: ${formData.birthPlace}, ${formData.birthDate}\n` +
      `• Jenis Kelamin: ${formData.gender}\n` +
      `• Alamat: ${formData.address}\n` +
      `• WhatsApp: ${formData.whatsapp}\n` +
      `• Email: ${formData.email}\n\n` +
      `📚 *PILIHAN PELATIHAN*\n` +
      `• Program: ${selectedProgram?.name}\n` +
      `• Harga: ${selectedProgram?.price}\n` +
      `• Jadwal: ${formData.schedule}\n` +
      `• Pengalaman: ${formData.experience}\n\n` +
      `💳 *PEMBAYARAN*\n` +
      `Bukti pembayaran akan dikirim menyusul.\n\n` +
      `Mohon konfirmasi pendaftaran saya. Terima kasih! 🙏`;

    const url = `https://wa.me/${PHONE}?text=${encodeURIComponent(msg)}`;
    window.open(url, "_blank");
    
    setIsSubmitting(false);
    setShowSuccess(true);
  };

  if (showSuccess) {
    return (
      <main className="register-page">
        <div className="success-container">
          <div className="success-content">
            <div className="success-icon">✅</div>
            <h1>Pendaftaran Terkirim!</h1>
            <p>Terima kasih telah mendaftar program pelatihan BARIZTA. Tim kami akan segera menghubungi Anda melalui WhatsApp.</p>
            <div className="success-actions">
              <Link href="/education" className="btn-barizta">
                ← Kembali ke Program Pelatihan
              </Link>
            </div>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="register-page">
      {/* Hero */}
      <section className="register-hero">
        <div className="register-hero-overlay"></div>
        <div className="register-hero-content">
          <span className="breadcrumb">
            <Link href="/">Beranda</Link> › 
            <Link href="/education">Program Pelatihan</Link> › 
            <span className="active">Pendaftaran</span>
          </span>
          <h1>Formulir Pendaftaran</h1>
          <p>Lengkapi data di bawah untuk mendaftar program pelatihan barista</p>
        </div>
      </section>

      {/* Form Section */}
      <section className="register-form-section">
        <div className="container">
          <div className="form-layout">
            {/* Main Form */}
            <div className="form-main">
              <form onSubmit={handleSubmit}>
                {/* Data Diri */}
                <div className="form-section">
                  <div className="form-section-header">
                    <span className="section-icon">👤</span>
                    <h2>Data Diri</h2>
                  </div>

                  <div className="form-group">
                    <label htmlFor="fullName">Nama Lengkap *</label>
                    <input
                      type="text"
                      id="fullName"
                      name="fullName"
                      value={formData.fullName}
                      onChange={handleInputChange}
                      placeholder="Masukkan nama lengkap"
                      required
                    />
                  </div>

                  <div className="form-row">
                    <div className="form-group">
                      <label htmlFor="birthPlace">Tempat Lahir *</label>
                      <input
                        type="text"
                        id="birthPlace"
                        name="birthPlace"
                        value={formData.birthPlace}
                        onChange={handleInputChange}
                        placeholder="Kota kelahiran"
                        required
                      />
                    </div>
                    <div className="form-group">
                      <label htmlFor="birthDate">Tanggal Lahir *</label>
                      <input
                        type="date"
                        id="birthDate"
                        name="birthDate"
                        value={formData.birthDate}
                        onChange={handleInputChange}
                        required
                      />
                    </div>
                  </div>

                  <div className="form-group">
                    <label htmlFor="gender">Jenis Kelamin *</label>
                    <select
                      id="gender"
                      name="gender"
                      value={formData.gender}
                      onChange={handleInputChange}
                      required
                    >
                      <option value="">Pilih jenis kelamin</option>
                      <option value="Laki-laki">Laki-laki</option>
                      <option value="Perempuan">Perempuan</option>
                    </select>
                  </div>

                  <div className="form-group">
                    <label htmlFor="address">Alamat Lengkap *</label>
                    <textarea
                      id="address"
                      name="address"
                      value={formData.address}
                      onChange={handleInputChange}
                      placeholder="Masukkan alamat lengkap"
                      rows={3}
                      required
                    />
                  </div>

                  <div className="form-row">
                    <div className="form-group">
                      <label htmlFor="whatsapp">Nomor WhatsApp *</label>
                      <input
                        type="tel"
                        id="whatsapp"
                        name="whatsapp"
                        value={formData.whatsapp}
                        onChange={handleInputChange}
                        placeholder="08123456789"
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
                        placeholder="email@contoh.com"
                        required
                      />
                    </div>
                  </div>
                </div>

                {/* Pilihan Pelatihan */}
                <div className="form-section">
                  <div className="form-section-header">
                    <span className="section-icon">📚</span>
                    <h2>Pilihan Pelatihan</h2>
                  </div>

                  <div className="form-group">
                    <label htmlFor="program">Program Pelatihan *</label>
                    <select
                      id="program"
                      name="program"
                      value={formData.program}
                      onChange={handleInputChange}
                      required
                    >
                      <option value="">Pilih program pelatihan</option>
                      {programs.map(program => (
                        <option key={program.id} value={program.id}>
                          {program.name} - {program.price}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="form-group">
                    <label htmlFor="schedule">Jadwal *</label>
                    <select
                      id="schedule"
                      name="schedule"
                      value={formData.schedule}
                      onChange={handleInputChange}
                      required
                    >
                      <option value="">Pilih jadwal</option>
                      <option value="Weekday">Weekday (Senin - Jumat)</option>
                      <option value="Weekend">Weekend (Sabtu - Minggu)</option>
                    </select>
                  </div>

                  <div className="form-group">
                    <label htmlFor="experience">Pengalaman *</label>
                    <select
                      id="experience"
                      name="experience"
                      value={formData.experience}
                      onChange={handleInputChange}
                      required
                    >
                      <option value="">Pilih pengalaman</option>
                      <option value="Belum ada pengalaman">Belum ada pengalaman</option>
                      <option value="< 6 bulan">Kurang dari 6 bulan</option>
                      <option value="6 bulan - 1 tahun">6 bulan - 1 tahun</option>
                      <option value="> 1 tahun">Lebih dari 1 tahun</option>
                    </select>
                  </div>
                </div>

                {/* Pembayaran */}
                <div className="form-section">
                  <div className="form-section-header">
                    <span className="section-icon">💳</span>
                    <h2>Bukti Pembayaran</h2>
                  </div>

                  <div className="payment-info">
                    <div className="bank-info">
                      <h4>Transfer ke:</h4>
                      <div className="bank-details">
                        <p><strong>Bank {bankInfo.bank}</strong></p>
                        <p className="account-number">{bankInfo.accountNumber}</p>
                        <p>a.n. {bankInfo.accountName}</p>
                      </div>
                    </div>
                    <div className="qris-info">
                      <h4>Atau scan QRIS:</h4>
                      <div className="qris-placeholder">
                        <Image 
                          src="/images/qris-placeholder.png" 
                          alt="QRIS" 
                          width={150} 
                          height={150}
                          unoptimized
                          onError={(e) => {
                            (e.target as HTMLImageElement).src = 'https://via.placeholder.com/150x150?text=QRIS';
                          }}
                        />
                      </div>
                    </div>
                  </div>

                  <div className="form-group">
                    <label htmlFor="paymentProof">Upload Bukti Pembayaran</label>
                    <div className="file-upload">
                      <input
                        type="file"
                        id="paymentProof"
                        name="paymentProof"
                        accept=".jpg,.jpeg,.png,.pdf"
                        onChange={handleFileChange}
                      />
                      <div className="file-upload-label">
                        <span className="upload-icon">📎</span>
                        <span>{formData.paymentProof ? formData.paymentProof.name : 'Pilih file (JPG, PNG, PDF)'}</span>
                      </div>
                    </div>
                    <p className="form-hint">* Bukti pembayaran bisa dikirim via WhatsApp setelah submit</p>
                  </div>
                </div>

                {/* Submit Buttons */}
                <div className="form-actions">
                  <button type="submit" className="btn-barizta" disabled={isSubmitting}>
                    {isSubmitting ? 'Mengirim...' : '📤 Kirim Formulir'}
                  </button>
                  <Link href="/education" className="btn-secondary-barizta">
                    ← Kembali ke Program Pelatihan
                  </Link>
                </div>
              </form>
            </div>

            {/* Sidebar Info */}
            <div className="form-sidebar">
              <div className="sidebar-card">
                <h3>📞 Butuh Bantuan?</h3>
                <p>Hubungi kami jika ada pertanyaan:</p>
                <div className="contact-info">
                  <p><strong>WhatsApp:</strong> 0813 6823 6245</p>
                  <p><strong>Email:</strong> Bariztaruangkreatif@gmail.com</p>
                </div>
              </div>

              <div className="sidebar-card">
                <h3>✨ Fasilitas</h3>
                <ul className="facility-list">
                  <li>📖 Modul Pembelajaran</li>
                  <li>🏆 Sertifikat Resmi</li>
                  <li>☕ Kopi Freeflow</li>
                  <li>👨‍🏫 Mentoring Barista</li>
                </ul>
              </div>

              <div className="sidebar-card highlight">
                <h3>🎯 Tips Pendaftaran</h3>
                <ul className="tips-list">
                  <li>Pastikan data diri sudah benar</li>
                  <li>Pilih jadwal sesuai ketersediaan</li>
                  <li>Simpan bukti pembayaran</li>
                  <li>Cek WhatsApp untuk konfirmasi</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
