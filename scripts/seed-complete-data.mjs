import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding complete data to MySQL...\n');

  // ========================================
  // 1. WEBSITE SETTINGS
  // ========================================
  console.log('🌐 Seeding website settings...');
  const websiteSettings = [
    { key: 'address', value: 'Jl. Kopi Susu No. 123, Jakarta Selatan 12345' },
    { key: 'phone', value: '021-12345678' },
    { key: 'email', value: 'info@barizta.com' },
    { key: 'whatsapp', value: '081234567890' },
    { key: 'instagram', value: '@bariztacoffee' },
    { key: 'facebook', value: 'BARIZTA Coffee Official' },
    { key: 'mapsUrl', value: 'https://maps.google.com/?q=-6.2088,106.8456' },
    { key: 'operatingHours', value: 'Senin - Jumat: 08:00 - 22:00\nSabtu - Minggu: 09:00 - 23:00' },
  ];
  
  for (const setting of websiteSettings) {
    await prisma.websiteSetting.upsert({
      where: { key: setting.key },
      update: { value: setting.value },
      create: setting
    });
  }
  console.log('  ✓ Website settings seeded');

  // ========================================
  // 2. CLASSES (KELAS EDUKASI)
  // ========================================
  console.log('\n🎓 Seeding classes...');
  const classes = [
    {
      title: 'Basic Barista Training',
      description: 'Pelatihan dasar untuk menjadi barista profesional. Pelajari teknik dasar espresso, steaming milk, dan latte art.',
      instructor: 'Ahmad Barista',
      schedule: new Date('2025-01-15T09:00:00'),
      price: 500000,
      maxParticipants: 15,
      enrolledCount: 8,
      status: 'active',
      image: '/images/classes/basic-barista.jpg'
    },
    {
      title: 'Advanced Latte Art',
      description: 'Kelas lanjutan untuk menguasai berbagai teknik latte art dari dasar hingga tingkat lanjut.',
      instructor: 'Budi Coffee Master',
      schedule: new Date('2025-01-22T10:00:00'),
      price: 750000,
      maxParticipants: 10,
      enrolledCount: 5,
      status: 'active',
      image: '/images/classes/latte-art.jpg'
    },
    {
      title: 'Coffee Cupping & Tasting',
      description: 'Belajar mengenali karakteristik kopi dari berbagai daerah melalui sesi cupping profesional.',
      instructor: 'Chef Kopi Indonesia',
      schedule: new Date('2025-02-01T14:00:00'),
      price: 350000,
      maxParticipants: 20,
      enrolledCount: 12,
      status: 'active',
      image: '/images/classes/cupping.jpg'
    },
    {
      title: 'Home Brewing Masterclass',
      description: 'Pelajari berbagai metode brewing kopi di rumah: V60, Chemex, French Press, Aeropress.',
      instructor: 'Dewi Homebrew',
      schedule: new Date('2025-02-10T09:00:00'),
      price: 400000,
      maxParticipants: 12,
      enrolledCount: 3,
      status: 'active',
      image: '/images/classes/home-brewing.jpg'
    }
  ];

  for (const classData of classes) {
    const existing = await prisma.class.findFirst({ where: { title: classData.title } });
    if (!existing) {
      await prisma.class.create({ data: classData });
      console.log(`  + Created class: ${classData.title}`);
    } else {
      console.log(`  ✓ Class exists: ${classData.title}`);
    }
  }

  // ========================================
  // 3. BTG SCHEDULES (BARIZTA TO GO)
  // ========================================
  console.log('\n🚚 Seeding BTG schedules...');
  const schedules = [
    {
      date: new Date('2025-01-10'),
      location: 'CFD Sudirman, Jakarta',
      startTime: '06:00',
      endTime: '11:00',
      status: 'scheduled',
      notes: 'Event Car Free Day mingguan',
      coordinator: 'Andi Barista'
    },
    {
      date: new Date('2025-01-12'),
      location: 'Universitas Indonesia, Depok',
      startTime: '08:00',
      endTime: '15:00',
      status: 'scheduled',
      notes: 'Event Wisuda UI',
      coordinator: 'Budi Coffee'
    },
    {
      date: new Date('2025-01-15'),
      location: 'Gedung Sate, Bandung',
      startTime: '09:00',
      endTime: '17:00',
      status: 'scheduled',
      notes: 'Festival Kopi Bandung',
      coordinator: 'Citra Barista'
    },
    {
      date: new Date('2024-12-20'),
      location: 'Mal Kelapa Gading',
      startTime: '10:00',
      endTime: '21:00',
      status: 'completed',
      notes: 'Event Natal & Tahun Baru',
      coordinator: 'Dedi Events'
    }
  ];

  for (const schedule of schedules) {
    const existing = await prisma.schedule.findFirst({ 
      where: { 
        date: schedule.date,
        location: schedule.location 
      } 
    });
    if (!existing) {
      await prisma.schedule.create({ data: schedule });
      console.log(`  + Created schedule: ${schedule.location}`);
    } else {
      console.log(`  ✓ Schedule exists: ${schedule.location}`);
    }
  }

  // ========================================
  // 4. PARTNERSHIPS (KOLABORASI)
  // ========================================
  console.log('\n🤝 Seeding partnerships...');
  const partnerships = [
    {
      name: 'Tokopedia',
      type: 'E-Commerce',
      contactPerson: 'Marketing Team',
      email: 'partner@tokopedia.com',
      phone: '021-12345678',
      address: 'Jakarta',
      status: 'active',
      startDate: new Date('2024-01-01'),
      description: 'Kerjasama penjualan produk kopi melalui platform Tokopedia',
      logo: '/images/partners/tokopedia.png'
    },
    {
      name: 'GoFood',
      type: 'Food Delivery',
      contactPerson: 'Partnership Division',
      email: 'merchant@gofood.co.id',
      phone: '021-87654321',
      address: 'Jakarta',
      status: 'active',
      startDate: new Date('2024-03-15'),
      description: 'Layanan delivery makanan dan minuman melalui GoFood',
      logo: '/images/partners/gofood.png'
    },
    {
      name: 'Bank BCA',
      type: 'Banking',
      contactPerson: 'Merchant Services',
      email: 'merchant@bca.co.id',
      phone: '1500888',
      address: 'Jakarta',
      status: 'active',
      startDate: new Date('2024-02-01'),
      description: 'Kerjasama pembayaran dan promo kartu kredit BCA',
      logo: '/images/partners/bca.png'
    },
    {
      name: 'Universitas Indonesia',
      type: 'Education',
      contactPerson: 'Humas UI',
      email: 'humas@ui.ac.id',
      phone: '021-7867222',
      address: 'Depok, Jawa Barat',
      status: 'active',
      startDate: new Date('2024-06-01'),
      description: 'Kerjasama event kampus dan program magang',
      logo: '/images/partners/ui.png'
    }
  ];

  for (const partner of partnerships) {
    const existing = await prisma.partnership.findFirst({ where: { name: partner.name } });
    if (!existing) {
      await prisma.partnership.create({ data: partner });
      console.log(`  + Created partnership: ${partner.name}`);
    } else {
      console.log(`  ✓ Partnership exists: ${partner.name}`);
    }
  }

  // ========================================
  // 5. ABOUT - MILESTONES
  // ========================================
  console.log('\n📅 Seeding milestones...');
  const milestones = [
    { year: '2018', title: 'Pendirian', description: 'BARIZTA Coffee didirikan di Jakarta dengan konsep specialty coffee', order: 1 },
    { year: '2019', title: 'Ekspansi Pertama', description: 'Membuka cabang kedua di Bandung', order: 2 },
    { year: '2020', title: 'Inovasi Digital', description: 'Meluncurkan layanan order online dan delivery', order: 3 },
    { year: '2021', title: 'BARIZTA To Go', description: 'Memulai layanan coffee truck untuk event dan festival', order: 4 },
    { year: '2022', title: 'Barista Academy', description: 'Membuka pusat pelatihan barista profesional', order: 5 },
    { year: '2023', title: 'Penghargaan', description: 'Meraih penghargaan Best Specialty Coffee Shop', order: 6 },
    { year: '2024', title: '10 Cabang', description: 'Ekspansi menjadi 10 cabang di seluruh Indonesia', order: 7 }
  ];

  for (const milestone of milestones) {
    const existing = await prisma.milestone.findFirst({ where: { year: milestone.year } });
    if (!existing) {
      await prisma.milestone.create({ data: milestone });
      console.log(`  + Created milestone: ${milestone.year}`);
    } else {
      console.log(`  ✓ Milestone exists: ${milestone.year}`);
    }
  }

  // ========================================
  // 6. ABOUT - TEAM
  // ========================================
  console.log('\n👥 Seeding team members...');
  const team = [
    { name: 'Andi Wijaya', position: 'Founder & CEO', photo: '/images/about/TEAM/andi.jpg', bio: 'Pendiri BARIZTA dengan pengalaman 15 tahun di industri kopi', order: 1 },
    { name: 'Sari Dewi', position: 'Head Barista', photo: '/images/about/TEAM/sari.jpg', bio: 'Certified Q Grader dengan passion di specialty coffee', order: 2 },
    { name: 'Budi Santoso', position: 'Operations Manager', photo: '/images/about/TEAM/budi.jpg', bio: 'Mengelola operasional seluruh cabang BARIZTA', order: 3 },
    { name: 'Maya Putri', position: 'Marketing Director', photo: '/images/about/TEAM/maya.jpg', bio: 'Ahli strategi pemasaran digital dan branding', order: 4 }
  ];

  for (const member of team) {
    const existing = await prisma.team.findFirst({ where: { name: member.name } });
    if (!existing) {
      await prisma.team.create({ data: member });
      console.log(`  + Created team member: ${member.name}`);
    } else {
      console.log(`  ✓ Team member exists: ${member.name}`);
    }
  }

  // ========================================
  // 7. NEWS (BERITA)
  // ========================================
  console.log('\n📰 Seeding news...');
  const news = [
    {
      title: 'Grand Opening Cabang Baru di Surabaya',
      category: 'event',
      content: 'BARIZTA Coffee dengan bangga mengumumkan pembukaan cabang baru di Surabaya. Berlokasi di pusat kota, cabang ini menawarkan pengalaman kopi premium dengan interior yang nyaman dan modern.',
      excerpt: 'BARIZTA membuka cabang baru di Surabaya dengan konsep modern.',
      image: '/images/news/surabaya-opening.jpg',
      author: 'Admin BARIZTA',
      publishDate: new Date('2024-12-01'),
      status: 'published',
      views: 150
    },
    {
      title: 'Promo Spesial Natal & Tahun Baru 2025',
      category: 'promo',
      content: 'Rayakan Natal dan Tahun Baru dengan promo spesial dari BARIZTA! Dapatkan diskon 25% untuk semua minuman signature dan gratis upgrade size untuk member.',
      excerpt: 'Diskon 25% untuk semua minuman signature selama periode Natal.',
      image: '/images/news/christmas-promo.jpg',
      author: 'Marketing Team',
      publishDate: new Date('2024-12-15'),
      status: 'published',
      views: 320
    },
    {
      title: 'Workshop Latte Art Bersama Juara Nasional',
      category: 'event',
      content: 'Ikuti workshop latte art eksklusif bersama juara nasional latte art Indonesia. Pelajari teknik-teknik profesional dan tingkatkan skill barista Anda.',
      excerpt: 'Workshop latte art dengan instruktur juara nasional.',
      image: '/images/news/latte-workshop.jpg',
      author: 'Event Team',
      publishDate: new Date('2024-12-20'),
      status: 'published',
      views: 89
    },
    {
      title: 'Menu Baru: Seasonal Winter Collection',
      category: 'info',
      content: 'Memperkenalkan koleksi menu musim dingin kami: Gingerbread Latte, Peppermint Mocha, dan Winter Spice Cappuccino. Tersedia hingga Februari 2025.',
      excerpt: 'Koleksi menu spesial musim dingin telah hadir di BARIZTA.',
      image: '/images/news/winter-menu.jpg',
      author: 'Product Team',
      publishDate: new Date('2024-12-25'),
      status: 'published',
      views: 245
    }
  ];

  for (const item of news) {
    const existing = await prisma.news.findFirst({ where: { title: item.title } });
    if (!existing) {
      await prisma.news.create({ data: item });
      console.log(`  + Created news: ${item.title}`);
    } else {
      console.log(`  ✓ News exists: ${item.title}`);
    }
  }

  // ========================================
  // 8. MESSAGES (Sample)
  // ========================================
  console.log('\n💬 Seeding sample messages...');
  const messages = [
    {
      name: 'John Doe',
      email: 'john@example.com',
      subject: 'Pertanyaan tentang kelas barista',
      message: 'Halo, saya ingin bertanya tentang jadwal kelas barista untuk bulan depan. Apakah masih ada slot tersedia?',
      isRead: false
    },
    {
      name: 'Jane Smith',
      email: 'jane@example.com',
      subject: 'Kerjasama Event',
      message: 'Kami dari perusahaan XYZ tertarik untuk mengundang BARIZTA To Go di acara corporate kami. Mohon informasi lebih lanjut.',
      isRead: true,
      reply: 'Terima kasih atas minat Anda. Tim kami akan menghubungi Anda segera.',
      replyDate: new Date('2024-12-10')
    }
  ];

  for (const msg of messages) {
    const existing = await prisma.message.findFirst({ where: { email: msg.email, subject: msg.subject } });
    if (!existing) {
      await prisma.message.create({ data: msg });
      console.log(`  + Created message from: ${msg.name}`);
    } else {
      console.log(`  ✓ Message exists from: ${msg.name}`);
    }
  }

  // ========================================
  // 9. NOTIFICATIONS (Sample)
  // ========================================
  console.log('\n🔔 Seeding sample notifications...');
  const notifications = [
    {
      title: 'Pesan Baru',
      message: 'Ada 2 pesan baru yang belum dibaca dari customer',
      type: 'info',
      isRead: false
    },
    {
      title: 'Pendaftaran Kelas',
      message: 'Ada 3 pendaftaran baru untuk kelas Basic Barista Training',
      type: 'success',
      isRead: false
    },
    {
      title: 'Event BTG Besok',
      message: 'Reminder: Event BARIZTA To Go di CFD Sudirman besok pukul 06:00',
      type: 'warning',
      isRead: false
    },
    {
      title: 'Kerjasama Baru',
      message: 'Ada proposal kerjasama baru dari Universitas Indonesia',
      type: 'info',
      isRead: true
    }
  ];

  for (const notif of notifications) {
    const existing = await prisma.notification.findFirst({ where: { title: notif.title } });
    if (!existing) {
      await prisma.notification.create({ data: notif });
      console.log(`  + Created notification: ${notif.title}`);
    } else {
      console.log(`  ✓ Notification exists: ${notif.title}`);
    }
  }

  console.log('\n✅ All data seeded successfully!');
  console.log('📊 Summary:');
  console.log(`   - Website Settings: ${websiteSettings.length}`);
  console.log(`   - Classes: ${classes.length}`);
  console.log(`   - Schedules (BTG): ${schedules.length}`);
  console.log(`   - Partnerships: ${partnerships.length}`);
  console.log(`   - Milestones: ${milestones.length}`);
  console.log(`   - Team Members: ${team.length}`);
  console.log(`   - News: ${news.length}`);
  console.log(`   - Messages: ${messages.length}`);
  console.log(`   - Notifications: ${notifications.length}`);
}

main()
  .catch(e => {
    console.error('❌ Error:', e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
