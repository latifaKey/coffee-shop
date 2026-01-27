/**
 * Script untuk menyinkronkan data dari halaman public ke database
 * 
 * Script ini akan:
 * 1. Menghapus data lama dari tabel Milestone, Team, Schedule, Partnership
 * 2. Memasukkan data yang sesuai dengan halaman public
 * 
 * Jalankan dengan: node scripts/sync-public-data.mjs
 */

import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// ============================================
// DATA MILESTONE (dari halaman tentang-kami)
// ============================================
const MILESTONES_DATA = [
  {
    year: "2021",
    title: "Awal Mula Barizta",
    description: "Barizta berdiri sebagai ruang kreatif yang memperkenalkan kopi secara sederhana kepada masyarakat. Mulai menyajikan menu kopi pertama dan membangun komunitas pecinta kopi lokal.",
    order: 1
  },
  {
    year: "2022",
    title: "Pengembangan Produk dan Identitas",
    description: "Memperluas varian menu dengan pendekatan specialty coffee. Membentuk identitas brand Barizta sebagai ruang edukasi dan eksplorasi cita rasa.",
    order: 2
  },
  {
    year: "2023",
    title: "Edukasi & Workshop",
    description: "Mulai menyelenggarakan kelas dan workshop kopi untuk masyarakat umum. Memperkuat peran Barizta sebagai pusat edukasi kopi.",
    order: 3
  },
  {
    year: "2024",
    title: "Inovasi & Kolaborasi",
    description: "Menjalankan program kolaborasi dengan UMKM dan kreator lokal. Mengembangkan Barizta To Go sebagai layanan cepat untuk masyarakat aktif.",
    order: 4
  },
  {
    year: "2025",
    title: "Ekspansi & Digitalisasi",
    description: "Meningkatkan layanan digital, pengalaman pelanggan, dan sistem manajemen. Fokus membangun ekosistem edukasi kopi berbasis komunitas dan teknologi.",
    order: 5
  }
];

// ============================================
// DATA TIM (dari halaman tentang-kami)
// ============================================
const TEAM_DATA = [
  { name: "M. Rizal Novianto", position: "Co-Founder & Manager", photo: "/images/about/TEAM/1.png", bio: "Co-Founder sekaligus Manager yang mengelola operasional Barizta Coffee.", order: 1 },
  { name: "Tri Putra Rahmadhana", position: "Founder", photo: "/images/about/TEAM/2.png", bio: "Founder Barizta Coffee, visioner yang memulai perjalanan kopi ini.", order: 2 },
  { name: "Surya Dharma", position: "Barista", photo: "/images/about/TEAM/3.png", bio: "Barista profesional yang ahli dalam meracik kopi berkualitas.", order: 3 },
  { name: "Syartria Pramana", position: "Head Barista", photo: "/images/about/TEAM/4.png", bio: "Head Barista yang memimpin tim barista dan menjaga standar kualitas kopi.", order: 4 },
  { name: "Maulana Alkahfi", position: "Jr. Barista", photo: "/images/about/TEAM/5.png", bio: "Junior Barista yang terus belajar dan berkembang dalam seni kopi.", order: 5 },
  { name: "Akbar Fuad", position: "Part-timer Barista", photo: "/images/about/TEAM/6.png", bio: "Part-timer Barista yang membantu operasional di jam sibuk.", order: 6 },
  { name: "Prima Prayoga", position: "Sr. Barista & Roaster", photo: "/images/about/TEAM/7.png", bio: "Senior Barista sekaligus Roaster yang menguasai proses roasting biji kopi.", order: 7 },
  { name: "Dinda", position: "Part-timer Barista", photo: "/images/about/TEAM/8.png", bio: "Part-timer Barista yang ramah dan selalu siap melayani pelanggan.", order: 8 },
  { name: "Gilang", position: "Photo & Videographer", photo: "/images/about/TEAM/9.png", bio: "Photo & Videographer yang mendokumentasikan momen di Barizta.", order: 9 }
];

// ============================================
// DATA JADWAL BTG (Barizta To Go)
// ============================================
const SCHEDULES_DATA = [
  {
    date: new Date("2025-01-20"),
    location: "Kampus UPN Veteran Jakarta",
    startTime: "09:00",
    endTime: "18:00",
    status: "scheduled",
    notes: "Booth di area kantin fakultas",
    coordinator: "Rizal Novianto"
  },
  {
    date: new Date("2025-01-21"),
    location: "Cirendeu, Tangerang Selatan",
    startTime: "08:00",
    endTime: "17:00",
    status: "scheduled",
    notes: "Dekat stasiun MRT Lebak Bulus",
    coordinator: "Tri Putra"
  },
  {
    date: new Date("2025-01-22"),
    location: "BSD City, Serpong",
    startTime: "10:00",
    endTime: "20:00",
    status: "scheduled",
    notes: "Area kuliner BSD",
    coordinator: "Prima Prayoga"
  },
  {
    date: new Date("2025-01-23"),
    location: "Pondok Indah",
    startTime: "09:00",
    endTime: "18:00",
    status: "scheduled",
    notes: "Event komunitas mobil",
    coordinator: "Syartria Pramana"
  }
];

// ============================================
// DATA PARTNERSHIP/KOLABORASI
// ============================================
const PARTNERSHIPS_DATA = [
  {
    name: "Kolaborasi Brand & Corporate",
    type: "Corporate",
    contactPerson: "Tim Partnership Barizta",
    email: "partnership@barizta.com",
    phone: "081368236245",
    address: "Barizta Coffee Shop, Cirendeu",
    status: "active",
    startDate: new Date("2024-01-01"),
    description: "Kolaborasi dengan brand untuk co-branding, product launch, atau corporate event dengan konsep kopi.",
    logo: "/images/default-partner.jpg"
  },
  {
    name: "Program UMKM & Kreator Lokal",
    type: "UMKM",
    contactPerson: "Tim Partnership Barizta",
    email: "partnership@barizta.com",
    phone: "081368236245",
    address: "Barizta Coffee Shop, Cirendeu",
    status: "active",
    startDate: new Date("2024-01-01"),
    description: "Mendukung UMKM dan kreator lokal melalui bazaar, display produk, dan cross-promotion.",
    logo: "/images/default-partner.jpg"
  },
  {
    name: "Komunitas Partner",
    type: "Komunitas",
    contactPerson: "Tim Partnership Barizta",
    email: "partnership@barizta.com",
    phone: "081368236245",
    address: "Barizta Coffee Shop, Cirendeu",
    status: "active",
    startDate: new Date("2024-01-01"),
    description: "Menyediakan ruang untuk kegiatan komunitas, gathering, dan event bersama.",
    logo: "/images/default-partner.jpg"
  }
];

async function syncData() {
  console.log("🔄 Memulai sinkronisasi data...\n");

  try {
    // 1. Sinkronisasi Milestones
    console.log("📅 Sinkronisasi MILESTONES...");
    await prisma.milestone.deleteMany({});
    console.log("   - Data milestone lama dihapus");
    
    for (const milestone of MILESTONES_DATA) {
      await prisma.milestone.create({ data: milestone });
    }
    console.log(`   ✅ ${MILESTONES_DATA.length} milestone berhasil disinkronkan\n`);

    // 2. Sinkronisasi Team Members
    console.log("👥 Sinkronisasi TIM...");
    await prisma.team.deleteMany({});
    console.log("   - Data tim lama dihapus");
    
    for (const member of TEAM_DATA) {
      await prisma.team.create({ data: member });
    }
    console.log(`   ✅ ${TEAM_DATA.length} anggota tim berhasil disinkronkan\n`);

    // 3. Sinkronisasi Schedules (BTG)
    console.log("📍 Sinkronisasi JADWAL BTG...");
    await prisma.schedule.deleteMany({});
    console.log("   - Data jadwal lama dihapus");
    
    for (const schedule of SCHEDULES_DATA) {
      await prisma.schedule.create({ data: schedule });
    }
    console.log(`   ✅ ${SCHEDULES_DATA.length} jadwal berhasil disinkronkan\n`);

    // 4. Sinkronisasi Partnerships
    console.log("🤝 Sinkronisasi PARTNERSHIP...");
    await prisma.partnership.deleteMany({});
    console.log("   - Data partnership lama dihapus");
    
    for (const partnership of PARTNERSHIPS_DATA) {
      await prisma.partnership.create({ data: partnership });
    }
    console.log(`   ✅ ${PARTNERSHIPS_DATA.length} partnership berhasil disinkronkan\n`);

    // Tampilkan ringkasan
    console.log("═══════════════════════════════════════════");
    console.log("✅ SINKRONISASI SELESAI!");
    console.log("═══════════════════════════════════════════");
    console.log(`📅 Milestones  : ${MILESTONES_DATA.length} data`);
    console.log(`👥 Team        : ${TEAM_DATA.length} data`);
    console.log(`📍 Schedules   : ${SCHEDULES_DATA.length} data`);
    console.log(`🤝 Partnerships: ${PARTNERSHIPS_DATA.length} data`);
    console.log("═══════════════════════════════════════════");

  } catch (error) {
    console.error("❌ Error saat sinkronisasi:", error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Jalankan sinkronisasi
syncData()
  .then(() => {
    console.log("\n🎉 Data berhasil disinkronkan dengan halaman public!");
    process.exit(0);
  })
  .catch((error) => {
    console.error("\n💥 Sinkronisasi gagal:", error);
    process.exit(1);
  });
