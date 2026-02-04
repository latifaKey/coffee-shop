"use client";

import Image from "next/image";
import Link from "next/link";
import { useLanguage } from "@/context/LanguageContext";
import { useState, useEffect } from "react";
import "./kolaborasi.css";

interface Partner {
  id: number;
  name: string;
  type: string;
  contactPerson: string;
  email: string;
  phone: string;
  address: string;
  status: string;
  startDate: string;
  description: string;
  logo: string;
}

interface KolaborasiType {
  id: number;
  icon: string;
  title: string;
  titleEn: string | null;
  type: string;
  description: string;
  descriptionEn: string | null;
  image: string | null;
  order: number;
  isActive: boolean;
}

interface Settings {
  [key: string]: string;
}

// Default content as fallback
const DEFAULT_CONTENT = {
  id: {
    hero: {
      breadcrumb: "Kolaborasi",
      title: "Kolaborasi Bersama BARIZTA",
      description: "Mari berkolaborasi untuk menciptakan pengalaman kopi yang bermakna",
    },
    intro: {
      badge: "🤝 PARTNERSHIP",
      heading: "Terbuka untuk Kolaborasi",
      body: "BARIZTA percaya bahwa kolaborasi adalah kunci untuk pertumbuhan bersama. Kami membuka kesempatan kerjasama dengan brand, UMKM, dan komunitas yang memiliki visi sejalan dengan kami.",
    },
    types: {
      label: "JENIS KOLABORASI",
      heading: "Bentuk Kerjasama",
    },
    partners: {
      label: "MITRA KAMI",
      heading: "Partner Kolaborasi",
      empty: "Belum ada mitra aktif saat ini",
      loading: "Memuat data mitra...",
    },
    cta: {
      heading: "Tertarik Berkolaborasi?",
      description: "Hubungi kami untuk mendiskusikan ide kolaborasi Anda",
      button: "💬 Hubungi Kami untuk Kolaborasi",
    },
    contactMessage: "Halo Barizta! Saya tertarik untuk berkolaborasi. Mohon informasi lebih lanjut mengenai program kerjasama yang tersedia. Terima kasih!",
  },
  en: {
    hero: {
      breadcrumb: "Collaboration",
      title: "Collaborate with BARIZTA",
      description: "Let's collaborate to create remarkable coffee experiences",
    },
    intro: {
      badge: "🤝 PARTNERSHIP",
      heading: "Open for Collaboration",
      body: "BARIZTA believes collaboration is the key to growing together. We welcome partnerships with brands, local SMEs, and communities that share our vision.",
    },
    types: {
      label: "COLLABORATION TYPES",
      heading: "Ways to Partner",
    },
    partners: {
      label: "OUR PARTNERS",
      heading: "Collaboration Partners",
      empty: "No active partners at the moment",
      loading: "Loading partners...",
    },
    cta: {
      heading: "Ready to Collaborate?",
      description: "Reach out to discuss your collaboration ideas",
      button: "💬 Contact Us for Collaboration",
    },
    contactMessage: "Hi Barizta! I'm interested in collaborating. Please share more information about your partnership programs. Thank you!",
  },
};

// Helper function to get type label
function getTypeLabel(type: string, lang: string): string {
  const labels: Record<string, Record<string, string>> = {
    supplier: { id: "Supplier", en: "Supplier" },
    investor: { id: "Investor", en: "Investor" },
    franchise: { id: "Franchise", en: "Franchise" },
    other: { id: "Lainnya", en: "Other" },
  };
  return labels[type]?.[lang] || type;
}

// Helper function to get type icon
function getTypeIcon(type: string): string {
  const icons: Record<string, string> = {
    supplier: "🛍️",
    investor: "💰",
    franchise: "🏢",
    other: "🤝",
  };
  return icons[type] || "🤝";
}

export default function KolaborasiPage() {
  const { lang, t } = useLanguage();
  const defaultCopy = DEFAULT_CONTENT[lang];
  const breadcrumbHome = t.nav.beranda;

  const [partners, setPartners] = useState<Partner[]>([]);
  const [kolabTypes, setKolabTypes] = useState<KolaborasiType[]>([]);
  const [settings, setSettings] = useState<Settings>({});
  const [loading, setLoading] = useState(true);
  const [typesLoading, setTypesLoading] = useState(true);

  // Fetch all data from API
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch settings, types, and partners in parallel
        const [settingsRes, typesRes, partnersRes] = await Promise.all([
          fetch("/api/kolaborasi/settings"),
          fetch("/api/kolaborasi/types"),
          fetch("/api/partnerships?status=active"),
        ]);

        if (settingsRes.ok) {
          const settingsData = await settingsRes.json();
          setSettings(settingsData);
        }

        if (typesRes.ok) {
          const typesData = await typesRes.json();
          // Filter only active types
          setKolabTypes(typesData.filter((t: KolaborasiType) => t.isActive));
        }
        setTypesLoading(false);

        if (partnersRes.ok) {
          const partnersData = await partnersRes.json();
          // API returns { data: [...], pagination: {...} }
          setPartners(Array.isArray(partnersData) ? partnersData : (partnersData.data || []));
        }
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
        setTypesLoading(false);
      }
    };
    fetchData();
  }, []);

  // Get content with fallback to defaults
  const getContent = (key: string, fallback: string): string => {
    return settings[key] || fallback;
  };

  const handleContact = () => {
    const phone = settings.whatsapp_number || "6281368236245";
    const message = lang === "id" 
      ? getContent("contact_message_id", defaultCopy.contactMessage)
      : getContent("contact_message_en", DEFAULT_CONTENT.en.contactMessage);
    window.open(`https://wa.me/${phone}?text=${encodeURIComponent(message)}`, "_blank");
  };

  return (
    <main className="kolaborasi-page">
      {/* Hero */}
      <section className="kolab-hero">
        <div className="kolab-hero-overlay"></div>
        <div className="kolab-hero-content">
          <span className="breadcrumb">
            <Link href="/">{breadcrumbHome}</Link> &rsaquo; <span className="active">{defaultCopy.hero.breadcrumb}</span>
          </span>
          <h1>{lang === "id" ? getContent("hero_title_id", defaultCopy.hero.title) : getContent("hero_title_en", DEFAULT_CONTENT.en.hero.title)}</h1>
          <p>{lang === "id" ? getContent("hero_description_id", defaultCopy.hero.description) : getContent("hero_description_en", DEFAULT_CONTENT.en.hero.description)}</p>
        </div>
      </section>

      {/* Intro */}
      <section className="kolab-intro">
        <div className="container">
          <div className="intro-badge">{getContent("intro_badge", defaultCopy.intro.badge)}</div>
          <h2>{lang === "id" ? getContent("intro_heading_id", defaultCopy.intro.heading) : getContent("intro_heading_en", DEFAULT_CONTENT.en.intro.heading)}</h2>
          <p>{lang === "id" ? getContent("intro_body_id", defaultCopy.intro.body) : getContent("intro_body_en", DEFAULT_CONTENT.en.intro.body)}</p>
        </div>
      </section>

      {/* Collaboration Types */}
      <section className="kolab-types">
        <div className="container">
          <div className="section-header">
            <span className="label">{lang === "id" ? getContent("types_label_id", defaultCopy.types.label) : getContent("types_label_en", DEFAULT_CONTENT.en.types.label)}</span>
            <h2>{lang === "id" ? getContent("types_heading_id", defaultCopy.types.heading) : getContent("types_heading_en", DEFAULT_CONTENT.en.types.heading)}</h2>
          </div>

          {typesLoading ? (
            <div className="partners-loading">
              <div className="loading-spinner"></div>
              <p>Memuat...</p>
            </div>
          ) : kolabTypes.length > 0 ? (
            <div className="types-grid">
              {kolabTypes.map((type) => (
                <div key={type.id} className="type-card">
                  <div className="type-image">
                    {type.image ? (
                      <Image 
                        src={type.image.startsWith('/') ? type.image : `/uploads/${type.image}`} 
                        alt={lang === "id" ? type.title : (type.titleEn || type.title)}
                        width={400}
                        height={250}
                        unoptimized
                      />
                    ) : (
                      <div className="type-image-placeholder">
                        <span>{type.icon}</span>
                      </div>
                    )}
                  </div>
                  <div className="type-content">
                    <span className="type-icon">{type.icon}</span>
                    <h3>{lang === "id" ? type.title : (type.titleEn || type.title)}</h3>
                    <p>{lang === "id" ? type.description : (type.descriptionEn || type.description)}</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="partners-empty">
              <span className="empty-icon">📋</span>
              <p>{lang === "id" ? "Belum ada jenis kolaborasi" : "No collaboration types yet"}</p>
            </div>
          )}
        </div>
      </section>

      {/* Partners Section - Data from Admin */}
      <section className="kolab-partners">
        <div className="container">
          <div className="section-header">
            <span className="label">{lang === "id" ? getContent("partners_label_id", defaultCopy.partners.label) : getContent("partners_label_en", DEFAULT_CONTENT.en.partners.label)}</span>
            <h2>{lang === "id" ? getContent("partners_heading_id", defaultCopy.partners.heading) : getContent("partners_heading_en", DEFAULT_CONTENT.en.partners.heading)}</h2>
          </div>

          {loading ? (
            <div className="partners-loading">
              <div className="loading-spinner"></div>
              <p>{defaultCopy.partners.loading}</p>
            </div>
          ) : partners.length === 0 ? (
            <div className="partners-empty">
              <span className="empty-icon">🤝</span>
              <p>{defaultCopy.partners.empty}</p>
            </div>
          ) : (
            <div className="partners-grid">
              {partners.map((partner) => (
                <div key={partner.id} className="partner-card">
                  <div className="partner-image">
                    {partner.logo && partner.logo !== "/images/default-partner.jpg" ? (
                      <Image 
                        src={partner.logo.startsWith('/') ? partner.logo : `/uploads/${partner.logo}`} 
                        alt={partner.name}
                        width={400}
                        height={200}
                        unoptimized
                        style={{ objectFit: 'cover' }}
                      />
                    ) : (
                      <div className="partner-image-placeholder">
                        {getTypeIcon(partner.type)}
                      </div>
                    )}
                  </div>
                  <div className="partner-content">
                    <span className="partner-type">
                      {getTypeIcon(partner.type)} {getTypeLabel(partner.type, lang)}
                    </span>
                    <h3>{partner.name}</h3>
                    {partner.description && (
                      <p className="partner-desc">{partner.description}</p>
                    )}
                    <div className="partner-meta">
                      <span className="partner-since">
                        📅 {lang === "id" ? "Sejak" : "Since"} {new Date(partner.startDate).toLocaleDateString(lang === "id" ? "id-ID" : "en-US", { year: "numeric", month: "long" })}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* CTA */}
      <section className="kolab-cta">
        <div className="container">
          <div className="cta-content">
            <h2>{lang === "id" ? getContent("cta_heading_id", defaultCopy.cta.heading) : getContent("cta_heading_en", DEFAULT_CONTENT.en.cta.heading)}</h2>
            <p>{lang === "id" ? getContent("cta_description_id", defaultCopy.cta.description) : getContent("cta_description_en", DEFAULT_CONTENT.en.cta.description)}</p>
            <button className="btn-barizta" onClick={handleContact}>
              {lang === "id" ? getContent("cta_button_id", defaultCopy.cta.button) : getContent("cta_button_en", DEFAULT_CONTENT.en.cta.button)}
            </button>
          </div>
        </div>
      </section>
    </main>
  );
}
