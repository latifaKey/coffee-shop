"use client";

import { useLanguage } from "@/context/LanguageContext";

export default function MenuEmptyNotice() {
  const { t } = useLanguage();
  const menuCopy = t.publicPages.menu;

  return (
    <p className="muted" style={{ textAlign: "center", marginTop: 24 }}>{menuCopy.empty}</p>
  );
}
