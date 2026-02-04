"use client";

import Link from "next/link";
import "./layanan.css";

const PHONE = "6281368236245";

const layananPaket = [
  {
    id: 1,
    icon: "☕",
    title: "Konsultan Kafe",
    desc: "Kami membantu Anda membangun bisnis kafe dari nol atau meningkatkan kafe yang sudah ada.",
    features: [
      "Konsultasi konsep dan branding kafe",
      "Perencanaan menu dan harga",
      "Training barista dan SOP operasional",
      "Pemilihan peralatan coffee equipment",
      "Pendampingan 1 bulan pasca-opening"
    ],
    price: "Mulai dari Rp 15.000.000"
  },
  {
    id: 2,
    icon: "🏢",
    title: "Workshop Korporat",
    desc: "Aktivitas team building seru dengan tema kopi untuk perusahaan Anda.",
    features: [
      "Sesi brewing interaktif untuk tim",
      "Latte art competition",
      "Coffee cupping experience",
      "Tersedia untuk 10-50 peserta",
      "Sertifikat partisipasi"
    ],
    price: "Mulai dari Rp 5.000.000"
  },
  {
    id: 3,
    icon: "👨‍🍳",
    title: "Pelatihan Tim Internal",
    desc: "Tingkatkan skill barista tim kafe Anda dengan pelatihan private.",
    features: [
      "Training khusus di lokasi Anda",
      "Materi sesuai kebutuhan kafe",
      "Praktik langsung dengan equipment Anda",
      "Evaluasi dan feedback personal",
      "Modul SOP yang bisa digunakan"
    ],
    price: "Mulai dari Rp 8.000.000"
  },
  {
    id: 4,
    icon: "🎉",
    title: "Event Coffee Corner",
    desc: "Hadirkan coffee booth profesional di acara Anda.",
    features: [
      "Setup booth coffee lengkap",
      "Barista profesional standby",
      "Menu pilihan atau custom",
      "Cocok untuk wedding, corporate event, gathering",
      "Tersedia paket 3-8 jam"
    ],
    price: "Mulai dari Rp 3.500.000"
  }
];

const prosesKerjasama = [
  { step: 1, title: "Konsultasi", desc: "Diskusi kebutuhan Anda via WhatsApp atau meeting" },
  { step: 2, title: "Proposal", desc: "Kami kirimkan penawaran sesuai kebutuhan" },
  { step: 3, title: "Deal", desc: "Konfirmasi dan pembayaran DP" },
  { step: 4, title: "Eksekusi", desc: "Tim kami bekerja sesuai timeline" }
];

export default function LayananPage() {
  const handleKonsultasi = (layanan: string) => {
    const msg = `Halo BARIZTA! Saya tertarik dengan layanan "${layanan}". Mohon informasi lebih lanjut mengenai paket dan harga. Terima kasih! ☕`;
    window.open(`https://wa.me/${PHONE}?text=${encodeURIComponent(msg)}`, "_blank");
  };

  return (
    <main className="layanan-page">
      {/* Hero */}
      <section className="layanan-hero">
        <div className="layanan-hero-overlay" />
        <div className="layanan-hero-content">
          <span className="breadcrumb">
            <Link href="/">Beranda</Link> / <span className="active">Layanan Paket</span>
          </span>
          <span className="hero-badge">LAYANAN</span>
          <h1>Layanan Paket BARIZTA</h1>
          <p>Solusi lengkap untuk bisnis kopi dan kebutuhan event Anda</p>
        </div>
      </section>

      {/* Intro */}
      <section className="layanan-intro">
        <div className="container">
          <div className="intro-content">
            <span className="section-label">KENAPA BARIZTA?</span>
            <h2>Partner Terpercaya untuk Bisnis Kopi Anda</h2>
            <p>
              Dengan pengalaman sejak 2021 dan telah meluluskan ratusan barista, 
              BARIZTA siap menjadi partner Anda dalam mengembangkan bisnis kopi. 
              Kami menawarkan berbagai layanan yang dapat disesuaikan dengan kebutuhan Anda.
            </p>
            <div className="stats-row">
              <div className="stat-item">
                <span className="stat-number">300+</span>
                <span className="stat-label">Alumni Barista</span>
              </div>
              <div className="stat-item">
                <span className="stat-number">50+</span>
                <span className="stat-label">Event Terselesaikan</span>
              </div>
              <div className="stat-item">
                <span className="stat-number">20+</span>
                <span className="stat-label">Kafe Klien</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Layanan Cards */}
      <section className="layanan-list">
        <div className="container">
          <div className="section-header">
            <span className="label">PILIHAN LAYANAN</span>
            <h2>Paket Layanan Kami</h2>
          </div>

          <div className="layanan-grid">
            {layananPaket.map((layanan) => (
              <div key={layanan.id} className="layanan-card">
                <div className="layanan-icon">{layanan.icon}</div>
                <h3>{layanan.title}</h3>
                <p className="layanan-desc">{layanan.desc}</p>
                <ul className="feature-list">
                  {layanan.features.map((f, i) => (
                    <li key={i}>✓ {f}</li>
                  ))}
                </ul>
                <div className="layanan-footer">
                  <span className="price">{layanan.price}</span>
                  <button 
                    onClick={() => handleKonsultasi(layanan.title)} 
                    className="btn-barizta btn-barizta-sm"
                  >
                    Konsultasi
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Proses */}
      <section className="layanan-proses">
        <div className="container">
          <div className="section-header">
            <span className="label">ALUR KERJA</span>
            <h2>Proses Kerjasama</h2>
          </div>

          <div className="proses-grid">
            {prosesKerjasama.map((p) => (
              <div key={p.step} className="proses-item">
                <div className="step-number">{p.step}</div>
                <h4>{p.title}</h4>
                <p>{p.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="layanan-cta">
        <div className="container">
          <div className="cta-box">
            <h2>Butuh Layanan Custom?</h2>
            <p>Kami siap menyesuaikan paket sesuai kebutuhan spesifik Anda. Hubungi kami untuk konsultasi gratis!</p>
            <button 
              onClick={() => handleKonsultasi("Layanan Custom")} 
              className="btn-barizta"
            >
              💬 Konsultasi Gratis via WhatsApp
            </button>
          </div>
        </div>
      </section>

      {/* Related Links */}
      <section className="layanan-related">
        <div className="container">
          <h3>Layanan Terkait</h3>
          <div className="related-grid">
            <Link href="/education" className="related-card">
              <span className="related-icon">📚</span>
              <span className="related-title">Program Pelatihan</span>
              <span className="related-desc">Kursus barista 1-5 hari</span>
            </Link>
            <Link href="/to-go" className="related-card">
              <span className="related-icon">🚐</span>
              <span className="related-title">BARIZTA To Go</span>
              <span className="related-desc">Coffee booth keliling</span>
            </Link>
            <Link href="/kolaborasi" className="related-card">
              <span className="related-icon">🤝</span>
              <span className="related-title">Kolaborasi</span>
              <span className="related-desc">Partnership & sponsorship</span>
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
