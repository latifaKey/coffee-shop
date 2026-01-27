"use client";

import Link from "next/link";
import Image from "next/image";
import { useEffect, useState, useMemo } from "react";
import { useLanguage } from "@/context/LanguageContext";
import { usePathname } from "next/navigation";

export default function Nav() {
  const [menuOpen, setMenuOpen] = useState(false);
  const { lang, setLang, t } = useLanguage();
  const pathname = usePathname();
  useEffect(() => {
    const el = document.querySelector(".menu");
    if (!el) return;
    el.classList.toggle("open", menuOpen);
  }, [menuOpen]);

  // Close mobile menu when navigating
  useEffect(() => {
    if (menuOpen) setMenuOpen(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname]);


  const isActive = (href: string) => {
    if (href === "/") return pathname === "/";
    return pathname === href || pathname.startsWith(href + "/");
  };

  const links = useMemo(
    () => [
      { href: "/", label: t.nav.beranda },
      { href: "/tentang-kami", label: t.nav.tentang },
      { href: "/menu", label: t.nav.produk },
      { href: "/education", label: t.nav.education },
      { href: "/lokasi", label: t.nav.lokasi },
      { href: "/kolaborasi", label: t.nav.kolaborasi },
      { href: "/to-go", label: t.nav.togo },
      { href: "/berita", label: t.nav.berita },
      { href: "/kontak", label: t.nav.hubungi },
    ],
    [t]
  );

  return (
    <nav className="nav glass">
      <div className="container nav__inner">
        <Link href="/" className="brand" aria-label="BARIZTA home">
          <div className="brand-logo">
            <Image
              src="/logo-bar.png?v=2"
              alt="BARIZTA Logo"
              width={56}
              height={56}
              style={{ objectFit: "contain" }}
              priority
              unoptimized
            />
          </div>
          {/* <span className="brand-text">BARIZTA</span> */}
        </Link>
        <div className={`menu${menuOpen ? " open" : ""}`}>
          {links.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className={isActive(l.href) ? "link-active" : undefined}
              aria-current={isActive(l.href) ? "page" : undefined}
            >
              {l.label}
            </Link>
          ))}
        </div>

        <div className="nav-controls">
          <span className="divider" aria-hidden="true" />
          <button
            type="button"
            className="btn btn--ghost btn--sm"
            onClick={() => setLang(lang === "id" ? "en" : "id")}
            aria-label="Ganti bahasa"
          >
            {lang.toUpperCase()}
          </button>
          <Link href="/auth/login" className="btn-barizta btn-barizta-sm login-btn">
            Login
          </Link>
        </div>
        <button
          type="button"
          className="hamburger"
          aria-label={menuOpen ? "Tutup menu" : "Buka menu"}
          aria-expanded={menuOpen}
          onClick={() => setMenuOpen((v) => !v)}
        >
          <span></span>
          <span></span>
          <span></span>
        </button>
      </div>
    </nav>
  );
}
