"use client";

import Image from "next/image";
import Link from "next/link";

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
  coordinator: string;
}

interface ToGoClientProps {
  menus: Menu[];
  gallery: Gallery[];
  features: string[];
  schedules: Schedule[];
  settings: {
    whatsapp: string;
    instagramHandle: string;
    operationalHours: string;
    targetMarket: string;
    heroTitle: string;
    heroSubtitle: string;
    aboutLabel: string;
    aboutTitle: string;
    aboutDescription: string;
    logoImage: string;
    boothImage: string;
    boothBadgeText: string;
    menuLabel: string;
    menuTitle: string;
    galleryLabel: string;
    galleryTitle: string;
    ctaTitle: string;
    ctaSubtitle: string;
    ctaButtonText: string;
    ctaWhatsappMessage: string;
  };
}

const normalizeWhatsapp = (value?: string) => {
  if (!value) return "";
  const digits = value.replace(/\D/g, "");
  if (!digits) return "";
  if (digits.startsWith("62")) return digits;
  if (digits.startsWith("0")) return `62${digits.slice(1)}`;
  return `62${digits}`;
};

export default function ToGoClient({ menus, gallery, features, schedules, settings }: ToGoClientProps) {
  const defaultWhatsapp = normalizeWhatsapp(settings.whatsapp);

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
    if (url.includes('maps/embed')) return url;
    if (url.includes('google.com/maps')) {
      const placeMatch = url.match(/place\/([^/]+)/);
      if (placeMatch) {
        return `https://www.google.com/maps/embed/v1/place?key=AIzaSyBFw0Qbyq9zTFTd-tUY6dZWTgaQzuU17R8&q=${encodeURIComponent(placeMatch[1])}`;
      }
      return url;
    }
    return url;
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(price);
  };

  const handleOrder = () => {
    if (!defaultWhatsapp) return;
    window.open(`https://wa.me/${defaultWhatsapp}?text=${encodeURIComponent(settings.ctaWhatsappMessage)}`, "_blank");
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
          <h1>{settings.heroTitle}</h1>
          <p>{settings.heroSubtitle}</p>
        </div>
      </section>

      {/* About Section */}
      <section className="togo-about">
        <div className="container">
          <div className="about-grid">
            <div className="about-content">
              <span className="section-label">{settings.aboutLabel}</span>
              <h2>{settings.aboutTitle}</h2>
              <p>{settings.aboutDescription}</p>
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
                    src={settings.logoImage}
                    alt="Barizta To Go Logo"
                    width={280}
                    height={280}
                    className="togo-logo"
                    unoptimized
                  />
                </div>
                <div className="image-item booth-photo">
                  <Image 
                    src={settings.boothImage}
                    alt="Gerobak Barizta To Go"
                    width={400}
                    height={280}
                    className="booth-image"
                    style={{ objectFit: 'cover' }}
                    unoptimized
                  />
                  <div className="image-badge">{settings.boothBadgeText}</div>
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
            <span className="label">{settings.menuLabel}</span>
            <h2>{settings.menuTitle}</h2>
          </div>

          <div className="menu-grid">
            {menus.map((item) => (
              <div key={item.id} className="menu-card">
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
                <span>{settings.targetMarket}</span>
              </div>
            </div>
            <div className="info-divider"></div>
            <div className="info-item highlight">
              <span className="info-icon">⏰</span>
              <div className="info-text">
                <strong>Jam Operasional</strong>
                <span>{settings.operationalHours}</span>
              </div>
            </div>
            <div className="info-divider"></div>
            <div className="info-item">
              <span className="info-icon">📍</span>
              <div className="info-text">
                <strong>Lokasi</strong>
                <span>Berpindah • <a href={`https://instagram.com/${settings.instagramHandle.replace('@', '')}`} target="_blank" rel="noopener noreferrer">{settings.instagramHandle}</a></span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Section Jadwal Lokasi */}
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
                const contactRaw = schedule.coordinator || settings.whatsapp;
                const contactNumber = normalizeWhatsapp(contactRaw);
                const canContact = Boolean(contactNumber);

                return (
                  <div key={schedule.id} className="schedule-card">
                    <div className="schedule-card-header">
                      <div className="schedule-brand">
                        <span className="brand-icon">☕</span>
                        <span className="brand-text">Barizta To Go</span>
                      </div>
                      <span className={`schedule-badge ${schedule.statusStay === "SUDAH_STAY" ? "badge-active" : "badge-pending"}`}>
                        {schedule.statusStay === "SUDAH_STAY" ? "✓ Sudah Stay" : "⏳ Belum Stay"}
                      </span>
                    </div>

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
            <span className="label">{settings.galleryLabel}</span>
            <h2>{settings.galleryTitle}</h2>
          </div>

          <div className="gallery-grid">
            {gallery.length > 0 ? (
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
            <h2>{settings.ctaTitle}</h2>
            <p>{settings.ctaSubtitle}</p>
            <button className="btn-barizta" onClick={handleOrder}>
              {settings.ctaButtonText}
            </button>
          </div>
        </div>
      </section>
    </main>
  );
}

