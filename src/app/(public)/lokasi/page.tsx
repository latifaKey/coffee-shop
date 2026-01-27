"use client";

import { useMemo } from "react";
import Link from "next/link";
import { useLanguage } from "@/context/LanguageContext";
import "./lokasi.css";

const COPIES = {
  id: {
    breadcrumb: "Lokasi",
    title: "Lokasi",
    tagline: "Alamat resmi, jam operasional, dan peta untuk berkunjung ke BARIZTA.",
    beranda: "Beranda",
    addressHeading: "Alamat",
    hoursHeading: "Jam Operasional",
    hoursValue: "Senin - Minggu: 11.00 - 23.00 WIB",
    openMaps: "Buka di Google Maps",
    iframeTitle: "Lokasi BARIZTA di Google Maps",
    addressLine1: "BARIZTA SPECIALTY COFFEE",
    addressLine2: "Jl. Dr. Moh. Hatta No.31, Ps. Ambacang,",
    addressLine3: "Kec. Kuranji, Kota Padang, Sumatera Barat 25212",
  },
  en: {
    breadcrumb: "Location",
    title: "Location",
    tagline: "Official address, opening hours, and map to visit BARIZTA.",
    beranda: "Home",
    addressHeading: "Address",
    hoursHeading: "Opening Hours",
    hoursValue: "Monday - Sunday: 11.00 AM - 11.00 PM WIB",
    openMaps: "Open in Google Maps",
    iframeTitle: "BARIZTA Location on Google Maps",
    addressLine1: "BARIZTA SPECIALTY COFFEE",
    addressLine2: "Jl. Dr. Moh. Hatta No.31, Ps. Ambacang,",
    addressLine3: "Kuranji District, Padang City, West Sumatra 25212",
  },
};

export default function LokasiPage() {
  const { lang } = useLanguage();
  const copy = COPIES[lang];
  const fullAddress = `${copy.addressLine1}, ${copy.addressLine2} ${copy.addressLine3}`;
  const q = encodeURIComponent(fullAddress);
  const mapsLink = `https://www.google.com/maps?q=${q}`;
  const embedSrc = `https://www.google.com/maps?&q=${q}&z=16&output=embed`;

  return (
    <main className="lokasi-page">
      {/* Hero Section */}
      <section className="lokasi-hero">
        <div className="lokasi-hero-overlay"></div>
        <div className="lokasi-hero-content">
          <span className="lokasi-breadcrumb">
            <Link href="/">{copy.beranda}</Link> <span className="separator">›</span>
            <span className="active">{copy.breadcrumb}</span>
          </span>
          <h1>{copy.title}</h1>
          <p>{copy.tagline}</p>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <div className="contact-info" style={{ marginBottom: "1rem" }}>
            <h3 className="h3" style={{ marginBottom: ".25rem" }}>{copy.addressHeading}</h3>
            <p style={{ fontWeight: 600, marginBottom: 4 }}>{copy.addressLine1}</p>
            <p className="muted">{copy.addressLine2}</p>
            <p className="muted">{copy.addressLine3}</p>
            <div style={{ marginTop: 8 }}>
              <h4 className="h4" style={{ margin: "8px 0 4px" }}>{copy.hoursHeading}</h4>
              <p className="muted">{copy.hoursValue}</p>
            </div>
            <p className="muted" style={{ marginTop: ".5rem" }}>
              <a href={mapsLink} target="_blank" rel="noopener noreferrer">
                {copy.openMaps}
              </a>
            </p>
          </div>

          <div style={{ borderRadius: "12px", overflow: "hidden", boxShadow: "0 1px 4px rgba(0,0,0,.08)" }}>
            <iframe
              title={copy.iframeTitle}
              src={embedSrc}
              width="100%"
              height="420"
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            />
          </div>
        </div>
      </section>
    </main>
  );
}
