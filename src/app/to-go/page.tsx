import { prisma } from "@/lib/prisma";
import ToGoClient from "./ToGoClient";
import "./to-go.css";

export const dynamic = "force-dynamic";

// Default fallback data
const defaultMenuItems = [
  { id: 1, name: "Kopi Susu Creamy", price: 15000, description: "Espresso dengan susu creamy khas Barizta", icon: "☕", isActive: true, order: 0 },
  { id: 2, name: "Kopi Susu Aren", price: 18000, description: "Kombinasi kopi, susu, dan gula aren asli", icon: "🍯", isActive: true, order: 1 },
  { id: 3, name: "Kopi Strong", price: 12000, description: "Double shot espresso untuk pecinta kopi kuat", icon: "💪", isActive: true, order: 2 },
  { id: 4, name: "Baileys Latte", price: 22000, description: "Latte dengan sentuhan aroma baileys (non-alcohol)", icon: "🥛", isActive: true, order: 3 }
];

const defaultFeatures = [
  "Kopi specialty dengan harga terjangkau",
  "Proses cepat, rasa tetap premium",
  "Lokasi strategis & mudah dijangkau",
  "Barista terlatih & ramah"
];

export default async function ToGoPage() {
  // Dapatkan tanggal 30 hari yang lalu
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
  thirtyDaysAgo.setHours(0, 0, 0, 0);

  // Fetch semua data dari database secara parallel
  const [menusData, galleryData, featuresData, settingsData, schedulesData] = await Promise.all([
    prisma.togomenu.findMany({
      where: { isActive: true },
      orderBy: { order: "asc" },
    }),
    prisma.togogallery.findMany({
      where: { isActive: true },
      orderBy: { order: "asc" },
    }),
    prisma.togofeature.findMany({
      where: { isActive: true },
      orderBy: { order: "asc" },
    }),
    prisma.togosetting.findMany(),
    prisma.schedule.findMany({
      where: {
        status: "scheduled",
        date: { gte: thirtyDaysAgo },
      },
      orderBy: { date: "asc" },
      take: 10,
    }),
  ]);

  // Convert settings array to object with defaults
  const settingsObj: Record<string, string> = {};
  settingsData.forEach((s) => {
    settingsObj[s.key] = s.value;
  });

  // Prepare data dengan defaults
  const menus = menusData.length > 0 ? menusData : defaultMenuItems;
  
  const gallery = galleryData.map(g => ({
    id: g.id,
    image: g.image,
    caption: g.caption,
    isLarge: g.isLarge,
    order: g.order,
    isActive: g.isActive
  }));
  
  const features = featuresData.length > 0 
    ? featuresData.map(f => f.text)
    : defaultFeatures;

  const schedules = schedulesData.map(s => ({
    id: s.id,
    date: s.date.toISOString(),
    location: s.location,
    startTime: s.startTime,
    endTime: s.endTime,
    status: s.status,
    notes: s.notes,
    statusStay: s.statusStay as "SUDAH_STAY" | "BELUM_STAY",
    mapsUrl: s.mapsUrl,
    coordinator: s.coordinator
  }));

  const settings = {
    whatsapp: settingsObj.whatsapp || "6281368236245",
    instagramHandle: settingsObj.instagramHandle || "@barizta",
    operationalHours: settingsObj.operationalHours || "09.00 - 18.00 Setiap Hari",
    targetMarket: settingsObj.targetMarket || "Mahasiswa, Pekerja, Umum",
    heroTitle: settingsObj.heroTitle || "Barizta To Go",
    heroSubtitle: settingsObj.heroSubtitle || "Kopi berkualitas untuk masyarakat aktif",
    aboutLabel: settingsObj.aboutLabel || "KONSEP KAMI",
    aboutTitle: settingsObj.aboutTitle || "Gerobak Kopi Oranye Modern",
    aboutDescription: settingsObj.aboutDescription || "Barizta To Go hadir dengan konsep kopi cepat saji berkualitas. Dengan gerobak oranye yang ikonik, kami membawa pengalaman ngopi premium langsung ke tempat Anda beraktivitas.",
    logoImage: settingsObj.logoImage || "/LOGO-BARIZTA-TOGO.png",
    boothImage: settingsObj.boothImage || "/to-go.jpg",
    boothBadgeText: settingsObj.boothBadgeText || "📍 Booth Kami",
    menuLabel: settingsObj.menuLabel || "MENU",
    menuTitle: settingsObj.menuTitle || "Menu Andalan",
    galleryLabel: settingsObj.galleryLabel || "GALERI",
    galleryTitle: settingsObj.galleryTitle || "Booth Kami",
    ctaTitle: settingsObj.ctaTitle || "Ingin Pesan Kopi?",
    ctaSubtitle: settingsObj.ctaSubtitle || "Hubungi kami untuk informasi lokasi booth hari ini",
    ctaButtonText: settingsObj.ctaButtonText || "☕ Pesan via WhatsApp",
    ctaWhatsappMessage: settingsObj.ctaWhatsappMessage || "Halo Barizta To Go! Saya ingin memesan kopi. Mohon informasi menu dan lokasi booth hari ini. Terima kasih! ☕",
  };

  return (
    <ToGoClient
      menus={menus}
      gallery={gallery}
      features={features}
      schedules={schedules}
      settings={settings}
    />
  );
}

