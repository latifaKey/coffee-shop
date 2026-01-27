"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { useLanguage } from "@/context/LanguageContext";
import "./kontak.css";

// Data kontak resmi - STATIC, tidak akan berubah
const CONTACT_INFO = {
  email: "Bariztaruangkreatif@gmail.com",
  whatsapp: "0813-6823-6245",
  whatsappLink: "6281368236245",
  address: {
    name: "BARIZTA SPECIALTY COFFEE",
    street: "Jl. Dr. Moh. Hatta No.31, Ps. Ambacang",
    district: "Kec. Kuranji, Kota Padang",
    region: "Sumatera Barat 25212"
  },
  instagram: "@bariztaspecialtycoffee",
  instagramUrl: "https://www.instagram.com/bariztaspecialtycoffee"
} as const;

export default function KontakPage() {
  const { lang } = useLanguage();
  
  // Memoize untuk stabilitas - tidak akan berubah saat refresh
  const kontakCopy = useMemo(() => {
    return lang === "id" 
      ? {
          breadcrumb: "Hubungi Kami",
          title: "Hubungi Kami",
          tagline: "Punya pertanyaan atau ide kolaborasi? Kami siap terhubung dengan Anda.",
          beranda: "Beranda",
          infoTitle: "Informasi Kontak",
          infoSubtitle: "Hubungi kami melalui channel di bawah ini.",
          whatsapp: "WhatsApp",
          clickToChat: "Klik untuk chat →",
          email: "Email",
          instagram: "Instagram",
          address: "Alamat",
          viewOnMap: "Lihat di Peta →",
          formTitle: "Kirim Pesan",
          formSubtitle: "Isi formulir di bawah ini dan kami akan merespons secepatnya.",
          nameLbl: "Nama Lengkap *",
          namePlaceholder: "Masukkan nama Anda",
          emailLbl: "Email *",
          emailPlaceholder: "nama@email.com",
          subjectLbl: "Subjek *",
          subjectPlaceholder: "Tentang apa pesan Anda?",
          messageLbl: "Pesan *",
          messagePlaceholder: "Tulis pesan Anda di sini...",
          sendBtn: "Kirim Pesan",
          sendingBtn: "Mengirim...",
          errAllFields: "Semua field wajib diisi",
          errInvalidEmail: "Format email tidak valid",
          errGeneral: "Terjadi kesalahan, coba lagi.",
          successMsg: "Pesan berhasil dikirim! Kami akan segera menghubungi Anda."
        }
      : {
          breadcrumb: "Contact Us",
          title: "Contact Us",
          tagline: "Have questions or collaboration ideas? We're ready to connect with you.",
          beranda: "Home",
          infoTitle: "Contact Information",
          infoSubtitle: "Reach us through the channels below.",
          whatsapp: "WhatsApp",
          clickToChat: "Click to chat →",
          email: "Email",
          instagram: "Instagram",
          address: "Address",
          viewOnMap: "View on Map →",
          formTitle: "Send Message",
          formSubtitle: "Fill out the form below and we will respond as soon as possible.",
          nameLbl: "Full Name *",
          namePlaceholder: "Enter your name",
          emailLbl: "Email *",
          emailPlaceholder: "name@email.com",
          subjectLbl: "Subject *",
          subjectPlaceholder: "What is your message about?",
          messageLbl: "Message *",
          messagePlaceholder: "Write your message here...",
          sendBtn: "Send Message",
          sendingBtn: "Sending...",
          errAllFields: "All fields are required",
          errInvalidEmail: "Invalid email format",
          errGeneral: "An error occurred, please try again.",
          successMsg: "Message sent successfully! We will contact you soon."
        };
  }, [lang]);

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: ""
  });
  const [sending, setSending] = useState(false);
  const [status, setStatus] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const validateEmail = (email: string) => /^\S+@\S+\.\S+$/.test(email);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus(null);

    // Validation
    if (!formData.name || !formData.email || !formData.subject || !formData.message) {
      setStatus({ type: 'error', message: kontakCopy.errAllFields });
      return;
    }

    if (!validateEmail(formData.email)) {
      setStatus({ type: 'error', message: kontakCopy.errInvalidEmail });
      return;
    }

    setSending(true);

    try {
      const res = await fetch("/api/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData)
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || kontakCopy.errGeneral);
      }

      setStatus({ type: 'success', message: kontakCopy.successMsg });
      setFormData({ name: "", email: "", subject: "", message: "" });
    } catch (err) {
      setStatus({ 
        type: 'error', 
        message: err instanceof Error ? err.message : kontakCopy.errGeneral
      });
    } finally {
      setSending(false);
    }
  };

  const handleWhatsApp = () => {
    const msg = lang === "id" 
      ? "Halo BARIZTA! Saya ingin bertanya mengenai layanan dan produk Anda."
      : "Hello BARIZTA! I would like to inquire about your services and products.";
    window.open(`https://wa.me/${CONTACT_INFO.whatsappLink}?text=${encodeURIComponent(msg)}`, "_blank");
  };

  return (
    <main className="kontak-page">
      {/* Hero Section */}
      <section className="kontak-hero">
        <div className="kontak-hero-overlay"></div>
        <div className="kontak-hero-content">
          <span className="kontak-breadcrumb">
            <Link href="/">{kontakCopy.beranda}</Link> <span className="separator">›</span>
            <span className="active">{kontakCopy.breadcrumb}</span>
          </span>
          <h1>{kontakCopy.title}</h1>
          <p>{kontakCopy.tagline}</p>
        </div>
      </section>

      <section className="kontak-content">
        <div className="container">
          <div className="kontak-grid">
            {/* Contact Information - Simplified */}
            <div className="kontak-info">
              <h2>{kontakCopy.infoTitle}</h2>
              <p className="info-subtitle">
                {kontakCopy.infoSubtitle}
              </p>

              <div className="info-cards">
                {/* WhatsApp */}
                <div className="info-card clickable" onClick={handleWhatsApp}>
                  <div className="info-icon">💬</div>
                  <div className="info-content">
                    <h3>{kontakCopy.whatsapp}</h3>
                    <p className="highlight">{CONTACT_INFO.whatsapp}</p>
                    <span className="link-hint">{kontakCopy.clickToChat}</span>
                  </div>
                </div>

                {/* Email */}
                <div className="info-card">
                  <div className="info-icon">✉️</div>
                  <div className="info-content">
                    <h3>{kontakCopy.email}</h3>
                    <a href={`mailto:${CONTACT_INFO.email}`} className="email-link">
                      {CONTACT_INFO.email}
                    </a>
                  </div>
                </div>

                {/* Instagram */}
                <div className="info-card">
                  <div className="info-icon">📷</div>
                  <div className="info-content">
                    <h3>{kontakCopy.instagram}</h3>
                    <a 
                      href={CONTACT_INFO.instagramUrl} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="kontak-ig-link"
                    >
                      {CONTACT_INFO.instagram}
                    </a>
                  </div>
                </div>

                {/* Location - With Button */}
                <div className="info-card location-card">
                  <div className="info-icon">📍</div>
                  <div className="info-content">
                    <h3>{kontakCopy.address}</h3>
                    <p>{CONTACT_INFO.address.name}</p>
                    <p className="address-detail">{CONTACT_INFO.address.street}, {CONTACT_INFO.address.district}</p>
                    <a href="/lokasi" className="btn-barizta btn-barizta-sm">
                      {kontakCopy.viewOnMap}
                    </a>
                  </div>
                </div>
              </div>
            </div>

            {/* Contact Form */}
            <div className="kontak-form-wrapper">
              <div className="form-header">
                <h2>{kontakCopy.formTitle}</h2>
                <p>{kontakCopy.formSubtitle}</p>
              </div>

              <form onSubmit={handleSubmit} className="kontak-form">
                <div className="form-group">
                  <label htmlFor="name">{kontakCopy.nameLbl}</label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    placeholder={kontakCopy.namePlaceholder}
                    required
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="email">{kontakCopy.emailLbl}</label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder={kontakCopy.emailPlaceholder}
                    required
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="subject">{kontakCopy.subjectLbl}</label>
                  <input
                    type="text"
                    id="subject"
                    name="subject"
                    value={formData.subject}
                    onChange={handleChange}
                    placeholder={kontakCopy.subjectPlaceholder}
                    required
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="message">{kontakCopy.messageLbl}</label>
                  <textarea
                    id="message"
                    name="message"
                    value={formData.message}
                    onChange={handleChange}
                    rows={5}
                    placeholder={kontakCopy.messagePlaceholder}
                    required
                  />
                </div>

                {status && (
                  <div className={`form-status ${status.type}`}>
                    {status.type === 'success' ? '✅' : '⚠️'} {status.message}
                  </div>
                )}

                <button 
                  type="submit" 
                  className="btn-barizta"
                  disabled={sending}
                >
                  {sending ? kontakCopy.sendingBtn : kontakCopy.sendBtn}
                </button>
              </form>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
