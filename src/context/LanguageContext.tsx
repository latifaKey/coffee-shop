"use client";

import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { publicLocales, type PublicLocales } from "@/locales/public";

export type Lang = "id" | "en";

type BaseDict = {
  nav: {
    beranda: string;
    tentang: string;
    produk: string;
    education: string;
    lokasi: string;
    kolaborasi: string;
    togo: string;
    berita: string;
    hubungi: string;
  };
  hero: {
    slides: Array<{ eyebrow?: string; title: string; description?: string; ctaText?: string; ctaHref: string }>
  };
  aboutBrief: {
    title: string;
    body: string;
  };
  homeTeasers: Array<{ title: string; description: string; ctaText: string; href: string }>;
  footer: {
    quickLinks: string;
    followUs: string;
    contactUs: string;
    address: string;
    rights: string;
  };
};

type Dict = BaseDict & {
  publicPages: PublicLocales;
};

const baseDictionaries: Record<Lang, BaseDict> = {
  id: {
    nav: {
      beranda: "Beranda",
      tentang: "Tentang Kami",
      produk: "Produk",
      education: "Kelas Edukasi",
      lokasi: "Lokasi",
      kolaborasi: "Kolaborasi",
      togo: "BARIZTA To Go",
      berita: "Berita",
      hubungi: "Hubungi Kami",
    },
    hero: {
      slides: [
        {
          eyebrow: "Tempat di mana kopi mempererat koneksi",
          title: "See The Goodness",
          description: "Entah untuk memulai hari atau sekadar rehat sejenak, BARIZTA adalah ruang hangat yang terasa akrab seperti di rumah sendiri.",
          ctaText: "Lihat Menu",
          ctaHref: "/menu",
        },
        {
          eyebrow: "Belajar bersama para ahli",
          title: "Belajar Seni Membuat Kopi",
          description: "Ikuti kelas edukasi kopi kami, dari brewing dasar hingga latte art dan roasting profesional.",
          ctaText: "Daftar Sekarang",
          ctaHref: "/education",
        },
        {
          eyebrow: "Kisah di balik secangkir kopi",
          title: "BARIZTA - Passion for Coffee",
          description: "Kami menghadirkan pengalaman kopi autentik dengan kualitas terbaik dari petani lokal.",
          ctaText: "Pelajari Lebih Lanjut",
          ctaHref: "/tentang-kami",
        },
      ],
    },
    aboutBrief: {
      title: "Tentang BARIZTA",
      body: "BARIZTA lahir dari passion menghadirkan pengalaman kopi autentik dan berkualitas. Kami bekerja sama dengan petani lokal, mengutamakan konsistensi, dan menghadirkan ruang nyaman untuk bekerja, belajar, dan bersosialisasi.",
    },
    homeTeasers: [
      { title: "Tentang Kami", description: "Pelajari lebih lanjut tentang kisah dan visi BARIZTA.", ctaText: "Selengkapnya", href: "/tentang-kami" },
      { title: "Menu Spesial", description: "Temukan beragam pilihan kopi dan minuman favorit kami.", ctaText: "Lihat Menu", href: "/menu" },
      { title: "Lokasi Kami", description: "Kunjungi kedai kami di jantung kota Padang.", ctaText: "Lokasi", href: "/lokasi" },
      { title: "Kolaborasi", description: "Mari berkolaborasi untuk menciptakan pengalaman yang luar biasa.", ctaText: "Bergabung", href: "/kolaborasi" },
      { title: "BARIZTA To Go", description: "Nikmati kopi premium kami di mana pun Anda berada dengan layanan mobile.", ctaText: "Info Layanan", href: "/to-go" },
      { title: "Berita & Event", description: "Ikuti update terbaru dan acara menarik dari BARIZTA.", ctaText: "Berita", href: "/berita" },
    ],
    footer: {
      quickLinks: "Tautan Cepat",
      followUs: "Ikuti Kami",
      contactUs: "Hubungi Kami",
      address: "Jl. Kopi No. 5, Kota Barista",
      rights: "Semua Hak Dilindungi.",
    },
  },
  en: {
    nav: {
      beranda: "Home",
      tentang: "About",
      produk: "Products",
      education: "Education Classes",
      lokasi: "Location",
      kolaborasi: "Collaboration",
      togo: "BARIZTA To Go",
      berita: "News",
      hubungi: "Contact",
    },
    hero: {
      slides: [
        {
          eyebrow: "Where coffee brings people together",
          title: "See The Goodness",
          description: "Whether to start the day or just take a break, BARIZTA is a warm space that feels familiar like home.",
          ctaText: "View Menu",
          ctaHref: "/menu",
        },
        {
          eyebrow: "Learn with the experts",
          title: "Learn the Art of Coffee Making",
          description: "Join our coffee education classes, from basic brewing to professional latte art and roasting.",
          ctaText: "Register Now",
          ctaHref: "/education",
        },
        {
          eyebrow: "The story behind a cup of coffee",
          title: "BARIZTA - Passion for Coffee",
          description: "We present an authentic coffee experience with the best quality from local farmers.",
          ctaText: "Learn More",
          ctaHref: "/tentang-kami",
        },
      ],
    },
    aboutBrief: {
      title: "About BARIZTA",
      body: "BARIZTA is a coffee platform combining quality, innovation, and community. We partner with local farmers, focus on taste consistency, and offer a cozy space to create and grow.",
    },
    homeTeasers: [
      { title: "Get to Know Us", description: "Our story, values, and commitment in every cup.", ctaText: "About Us", href: "/tentang-kami" },
      { title: "Explore the Menu", description: "From bold espresso to creamy latte—find your favorite.", ctaText: "See Products", href: "/menu" },
      { title: "Find Locations", description: "Discover the nearest BARIZTA and plan your visit.", ctaText: "See Locations", href: "/lokasi" },
      { title: "Collaborations", description: "Open to partnering on events, products, or community programs.", ctaText: "Propose Collab", href: "/kolaborasi" },
      { title: "BARIZTA To Go", description: "Enjoy premium coffee anywhere with our mobile service.", ctaText: "Service Info", href: "/to-go" },
      { title: "News & Events", description: "Updates, activities, and behind-the-scenes stories.", ctaText: "Read News", href: "/berita" },
      { title: "Contact Us", description: "Need help? Reach us via WhatsApp or Email.", ctaText: "Contact", href: "/kontak" },
    ],
    footer: {
      quickLinks: "Quick Links",
      followUs: "Follow Us",
      contactUs: "Contact Us",
      address: "Jl. Kopi No. 5, Kota Barista",
      rights: "All rights reserved.",
    },
  },
};

type Ctx = {
  lang: Lang;
  setLang: (l: Lang) => void;
  t: Dict;
};

const LanguageContext = createContext<Ctx | undefined>(undefined);

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [lang, setLangState] = useState<Lang>("id");
  const [mounted, setMounted] = useState(false);

  // Prevent hydration mismatch by setting mounted state
  useEffect(() => {
    setMounted(true);
    const saved = (localStorage.getItem("lang") as Lang) || "id";
    if (saved !== lang) {
      setLangState(saved);
    }
  }, []);

  const setLang = (l: Lang) => {
    setLangState(l);
    if (typeof window !== "undefined") localStorage.setItem("lang", l);
  };

  const t = useMemo<Dict>(() => ({
    ...baseDictionaries[lang],
    publicPages: publicLocales[lang],
  }), [lang]);

  return (
    <LanguageContext.Provider value={{ lang, setLang, t }}>{children}</LanguageContext.Provider>
  );
}

export function useLanguage() {
  const ctx = useContext(LanguageContext);
  if (!ctx) throw new Error("useLanguage must be used within LanguageProvider");
  return ctx;
}
