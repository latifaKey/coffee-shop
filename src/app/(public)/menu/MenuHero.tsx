"use client";

import Link from "next/link";
import { useLanguage } from "@/context/LanguageContext";

export default function MenuHero() {
  const { t } = useLanguage();
  const menuCopy = t.publicPages.menu;

  return (
    <div className="hero-content">
      <div className="breadcrumb">
        <Link href="/">{menuCopy.breadcrumb}</Link>
        <span className="separator">›</span>
        <span className="active">{menuCopy.current}</span>
      </div>
      <h1>{menuCopy.title}</h1>
      <p className="muted" style={{ maxWidth: 900, marginInline: "auto" }}>{menuCopy.description}</p>
    </div>
  );
}
