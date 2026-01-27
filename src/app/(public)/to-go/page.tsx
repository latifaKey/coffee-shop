"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import "./to-go.css";

interface Menu {
  id: number;
  name: string;
  price: number;
  description: string | null;
  icon: string;
  isActive: boolean;
  order: number;
}

interface Gallery {
  id: number;
  image: string;
  caption: string | null;
  isLarge: boolean;
  order: number;
  isActive: boolean;
}

interface Feature {
  id: number;
  text: string;
  order: number;
  isActive: boolean;
}

// Interface untuk jadwal lokasi
interface Schedule {
  id: number;
  date: string;
  location: string;
  startTime: string;
  endTime: string;
  status: string;
  notes: string | null;
  statusStay: "SUDAH_STAY" | "BELUM_STAY";
  mapsUrl: string | null;
  contactWhatsapp: string;
}

interface ToGoData {
  menus: Menu[];
  gallery: Gallery[];
  features: Feature[];
  schedules: Schedule[]; // Ditambahkan
  settings: {
    // Contact & Social
    whatsapp?: string;
    instagramHandle?: string;
    // Operational Info
    operationalHours?: string;
    targetMarket?: string;
    // Hero Section
    heroTitle?: string;
    heroSubtitle?: string;
    // About Section
    aboutLabel?: string;
    aboutTitle?: string;
    aboutDescription?: string;
    // Images
    logoImage?: string;
    boothImage?: string;
    boothBadgeText?: string;
    // Menu Section
    menuLabel?: string;
    menuTitle?: string;
    // Gallery Section
    galleryLabel?: string;
    galleryTitle?: string;
    // CTA Section
    ctaTitle?: string;
    ctaSubtitle?: string;
    ctaButtonText?: string;
    ctaWhatsappMessage?: string;
  };
}

// Default fallback data
const defaultMenuItems = [
  { name: "Kopi Susu Creamy", price: 15000, description: "Espresso dengan susu creamy khas Barizta", icon: "☕" },
  { name: "Kopi Susu Aren", price: 18000, description: "Kombinasi kopi, susu, dan gula aren asli", icon: "🍯" },
  { name: "Kopi Strong", price: 12000, description: "Double shot espresso untuk pecinta kopi kuat", icon: "💪" },
  { name: "Baileys Latte", price: 22000, description: "Latte dengan sentuhan aroma baileys (non-alcohol)", icon: "🥛" }
];

const defaultFeatures = [
  "Kopi specialty dengan harga terjangkau",
  "Proses cepat, rasa tetap premium",
  "Lokasi strategis & mudah dijangkau",
  "Barista terlatih & ramah"
];

const normalizeWhatsapp = (value?: string) => {
  if (!value) return "";
  const digits = value.replace(/\D/g, "");
  if (!digits) return "";
  if (digits.startsWith("62")) return digits;
  if (digits.startsWith("0")) return `62${digits.slice(1)}`;
  return `62${digits}`;
};

export default function ToGoPage() {
  const [data, setData] = useState<ToGoData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch("/api/togo");
        if (response.ok) {
          const result = await response.json();
          setData(result);
        }
      } catch (error) {
        console.error("Failed to fetch To Go data:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // Extract all settings with defaults
  const defaultWhatsappRaw = data?.settings?.whatsapp || "6281368236245";
  const defaultWhatsapp = normalizeWhatsapp(defaultWhatsappRaw);
  const operationalHours = data?.settings?.operationalHours || "09.00 - 18.00 Setiap Hari";
  const targetMarket = data?.settings?.targetMarket || "Mahasiswa, Pekerja, Umum";
  const instagramHandle = data?.settings?.instagramHandle || "@barizta";
  
  // Hero Section
  const heroTitle = data?.settings?.heroTitle || "Barizta To Go";
  const heroSubtitle = data?.settings?.heroSubtitle || "Kopi berkualitas untuk masyarakat aktif";
  
  // About Section
  const aboutLabel = data?.settings?.aboutLabel || "KONSEP KAMI";
  const aboutTitle = data?.settings?.aboutTitle || "Gerobak Kopi Oranye Modern";
  const aboutDescription = data?.settings?.aboutDescription || "Barizta To Go hadir dengan konsep kopi cepat saji berkualitas. Dengan gerobak oranye yang ikonik, kami membawa pengalaman ngopi premium langsung ke tempat Anda beraktivitas.";
  
  // Images
  const logoImage = data?.settings?.logoImage || "/LOGO-BARIZTA-TOGO.png";
  const boothImage = data?.settings?.boothImage || "/to-go.jpg";
  const boothBadgeText = data?.settings?.boothBadgeText || "📍 Booth Kami";
  
  // Menu Section
  const menuLabel = data?.settings?.menuLabel || "MENU";
  const menuTitle = data?.settings?.menuTitle || "Menu Andalan";
  
  // Gallery Section
  const galleryLabel = data?.settings?.galleryLabel || "GALERI";
  const galleryTitle = data?.settings?.galleryTitle || "Booth Kami";
  
  // CTA Section
  const ctaTitle = data?.settings?.ctaTitle || "Ingin Pesan Kopi?";
  const ctaSubtitle = data?.settings?.ctaSubtitle || "Hubungi kami untuk informasi lokasi booth hari ini";
  const ctaButtonText = data?.settings?.ctaButtonText || "☕ Pesan via WhatsApp";
  const ctaWhatsappMessage = data?.settings?.ctaWhatsappMessage || "Halo Barizta To Go! Saya ingin memesan kopi. Mohon informasi menu dan lokasi booth hari ini. Terima kasih! ☕";

  const menus = data?.menus && data.menus.length > 0 
    ? data.menus.filter(m => m.isActive).sort((a, b) => a.order - b.order)
    : defaultMenuItems.map((m, i) => ({ ...m, id: i, isActive: true, order: i }));

  const gallery = data?.gallery && data.gallery.length > 0
    ? data.gallery.filter(g => g.isActive).sort((a, b) => a.order - b.order)
    : null;

  const features = data?.features && data.features.length > 0
    ? data.features.filter(f => f.isActive).sort((a, b) => a.order - b.order).map(f => f.text)
    : defaultFeatures;

  // Ambil jadwal dari API
  const schedules = data?.schedules || [];

  // Format tanggal untuk jadwal
  const formatScheduleDate = (dateString: string) => {
    const date = new Date(dateString);
    const days = ['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab'];
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'];
    return `${days[date.getDay()]}, ${date.getDate()} ${months[date.getMonth()]} ${date.getFullYear()}`;
  };

  // Ekstrak embed URL dari Google Maps URL
  const getEmbedUrl = (url: string | null): string | null => {
    if (!url) return null;
    // Jika sudah dalam format embed, langsung return
    if (url.includes('maps/embed')) return url;
    // Jika URL Google Maps biasa, konversi ke embed
    if (url.includes('google.com/maps')) {
      // Coba ekstrak koordinat atau place
      const placeMatch = url.match(/place\/([^/]+)/);
      if (placeMatch) {
        return `https://www.google.com/maps/embed/v1/place?key=AIzaSyBFw0Qbyq9zTFTd-tUY6dZWTgaQzuU17R8&q=${encodeURIComponent(placeMatch[1])}`;
      }
      // Return as-is if it's already an embed URL
      return url;
    }
    return url;
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(price);
  };

  const handleOrder = () => {
    if (!defaultWhatsapp) return;
    window.open(`https://wa.me/${defaultWhatsapp}?text=${encodeURIComponent(ctaWhatsappMessage)}`, "_blank");
  };

  return (
    <main className="togo-page">
      {/* Hero */}
      <section className="togo-hero">
        <div className="togo-hero-overlay"></div>
        <div className="togo-hero-content">
          <span className="breadcrumb">
            <Link href="/">Beranda</Link> › <span className="active">Barizta To Go</span>
          </span>
          <h1>{heroTitle}</h1>
          <p>{heroSubtitle}</p>
        </div>
      </section>

      {/* About Section */}
      <section className="togo-about">
        <div className="container">
          <div className="about-grid">
            <div className="about-content">
              <span className="section-label">{aboutLabel}</span>
              <h2>{aboutTitle}</h2>
              <p>
                {aboutDescription}
              </p>
              <ul className="feature-list">
                {features.map((feature, idx) => (
                  <li key={idx}>✓ {feature}</li>
                ))}
              </ul>
            </div>
            <div className="about-image">
              <div className="image-grid-2">
                <div className="image-item logo-display">
                  <Image 
                    src={logoImage}
                    alt="Barizta To Go Logo"
                    width={280}
                    height={280}
                    className="togo-logo"
                    unoptimized
                  />
                </div>
                <div className="image-item booth-photo">
                  <Image 
                    src={boothImage}
                    alt="Gerobak Barizta To Go"
                    width={400}
                    height={280}
                    className="booth-image"
                    style={{ objectFit: 'cover' }}
                    unoptimized
                  />
                  <div className="image-badge">{boothBadgeText}</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Menu Section */}
      <section className="togo-menu">
        <div className="container">
          <div className="section-header">
            <span className="label">{menuLabel}</span>
            <h2>{menuTitle}</h2>
          </div>

          <div className="menu-grid">
            {menus.map((item, idx) => (
              <div key={item.id || idx} className="menu-card">
                <span className="menu-icon">{item.icon}</span>
                <div className="menu-info">
                  <h3>{item.name}</h3>
                  <p>{item.description}</p>
                </div>
                <span className="menu-price">{formatPrice(item.price)}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Target & Info - Compact Version */}
      <section className="togo-info-compact">
        <div className="container">
          <div className="info-row">
            <div className="info-item">
              <span className="info-icon">👥</span>
              <div className="info-text">
                <strong>Target</strong>
                <span>{targetMarket}</span>
              </div>
            </div>
            <div className="info-divider"></div>
            <div className="info-item highlight">
              <span className="info-icon">⏰</span>
              <div className="info-text">
                <strong>Jam Operasional</strong>
                <span>{operationalHours}</span>
              </div>
            </div>
            <div className="info-divider"></div>
            <div className="info-item">
              <span className="info-icon">📍</span>
              <div className="info-text">
                <strong>Lokasi</strong>
                <span>Berpindah • <a href={`https://instagram.com/${instagramHandle.replace('@', '')}`} target="_blank" rel="noopener noreferrer">{instagramHandle}</a></span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Section Jadwal Lokasi - BARU */}
      {schedules.length > 0 && (
        <section className="togo-schedules">
          <div className="container">
            <div className="section-header">
              <span className="label">JADWAL</span>
              <h2>Lokasi Booth Kami</h2>
              <p className="section-desc">Temukan booth Barizta To Go di lokasi berikut</p>
            </div>

            <div className="schedule-cards">
              {schedules.map((schedule) => {
                const contactRaw = schedule.contactWhatsapp || defaultWhatsappRaw;
                const contactNumber = normalizeWhatsapp(contactRaw);
                const canContact = Boolean(contactNumber);

                return (
                  <div key={schedule.id} className="schedule-card">
                    {/* Header Card dengan Tanggal & Badge */}
                    <div className="schedule-card-header">
                      <div className="schedule-brand">
                        <span className="brand-icon">☕</span>
                        <span className="brand-text">Barizta To Go</span>
                      </div>
                      <span className={`schedule-badge ${schedule.statusStay === "SUDAH_STAY" ? "badge-active" : "badge-pending"}`}>
                        {schedule.statusStay === "SUDAH_STAY" ? "✓ Sudah Stay" : "⏳ Belum Stay"}
                      </span>
                    </div>

                    {/* Body Card dengan Lokasi dan Info */}
                    <div className="schedule-card-body">
                      <h3 className="schedule-location">
                        <span className="location-icon">📍</span>
                        {schedule.location}
                      </h3>
                      <div className="schedule-time">
                        <span className="time-icon">⏰</span>
                        <span>{schedule.startTime} - {schedule.endTime}</span>
                      </div>
                      {schedule.notes && (
                        <p className="schedule-notes">{schedule.notes}</p>
                      )}
                    </div>

                    {/* Google Maps Embed - jika ada mapsUrl */}
                    {schedule.mapsUrl && (
                      <div className="schedule-map">
                        <iframe
                          src={getEmbedUrl(schedule.mapsUrl) || undefined}
                          width="100%"
                          height="200"
                          style={{ border: 0, borderRadius: '0 0 16px 16px' }}
                          allowFullScreen
                          loading="lazy"
                          referrerPolicy="no-referrer-when-downgrade"
                          title={`Map: ${schedule.location}`}
                        />
                      </div>
                    )}

                    {/* Footer dengan CTA */}
                    <div className="schedule-card-footer">
                      <button 
                        className="btn-schedule-order"
                        disabled={!canContact}
                        title={!canContact ? "Nomor WhatsApp belum tersedia" : undefined}
                        onClick={() => {
                          if (!canContact) return;
                            const message = `Halo Barizta To Go! Saya melihat jadwal booth di ${schedule.location} pada ${formatScheduleDate(schedule.date)}. Apakah booth sudah ada di lokasi? Terima kasih! ☕`;
                          window.open(`https://wa.me/${contactNumber}?text=${encodeURIComponent(message)}`, "_blank");
                        }}
                      >
                        ☕ Tanya Ketersediaan
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </section>
      )}

      {/* Gallery */}
      <section className="togo-gallery">
        <div className="container">
          <div className="section-header">
            <span className="label">{galleryLabel}</span>
            <h2>{galleryTitle}</h2>
          </div>

          <div className="gallery-grid">
            {gallery && gallery.length > 0 ? (
              gallery.map((item, idx) => (
                <div key={item.id} className={`gallery-item ${item.isLarge ? 'large' : ''}`}>
                  <Image 
                    src={item.image}
                    alt={item.caption || `Gallery ${idx + 1}`}
                    width={item.isLarge ? 600 : 300}
                    height={item.isLarge ? 400 : 200}
                    unoptimized
                    style={{ objectFit: 'cover' }}
                  />
                </div>
              ))
            ) : (
              <>
                <div className="gallery-item large">
                  <Image 
                    src="https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=800"
                    alt="Booth 1"
                    width={600}
                    height={400}
                    unoptimized
                  />
                </div>
                <div className="gallery-item">
                  <Image 
                    src="https://images.unsplash.com/photo-1497935586351-b67a49e012bf?w=400"
                    alt="Booth 2"
                    width={300}
                    height={200}
                    unoptimized
                  />
                </div>
                <div className="gallery-item">
                  <Image 
                    src="https://images.unsplash.com/photo-1461023058943-07fcbe16d735?w=400"
                    alt="Booth 3"
                    width={300}
                    height={200}
                    unoptimized
                  />
                </div>
              </>
            )}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="togo-cta">
        <div className="container">
          <div className="cta-content">
            <h2>{ctaTitle}</h2>
            <p>{ctaSubtitle}</p>
            <button className="btn-barizta" onClick={handleOrder}>
              {ctaButtonText}
            </button>
          </div>
        </div>
      </section>
    </main>
  );
}
