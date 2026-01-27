export type PublicLang = "id" | "en";

export type HomeLocale = {
  modalTitle: string;
  modalMessage: string;
  modalClose: string;
  about: {
    eyebrow: string;
    heading: string;
    body: string;
    cta: string;
  };
  news: {
    heading: string;
    description: string;
    cta: string;
    fallback: Array<{ title: string; excerpt: string }>;
  };
  instagram: {
    heading: string;
    description: string;
    buttonLabel: string;
  };
};

export type MenuLocale = {
  breadcrumb: string;
  current: string;
  title: string;
  description: string;
  empty: string;
  sidebar: {
    searchTitle: string;
    searchDescription: string;
    searchPlaceholder: string;
    searchButtonAria: string;
    filterTitle: string;
    filterDescription: string;
  };
  results: {
    none: string;
    range: (start: number, end: number, total: number) => string;
  };
  sorting: {
    label: string;
    options: Array<{ value: "name-asc" | "name-desc" | "price-asc" | "price-desc"; label: string }>;
  };
  emptyState: {
    title: string;
    hint: string;
  };
  pagination: {
    prev: string;
    next: string;
    info: (page: number, totalPages: number) => string;
  };
  productCard: {
    soldOut: string;
    detail: string;
  };
  productModal: {
    fallbackDescription: string;
    orderButton: string;
    unavailableButton: string;
    closeAria: string;
    whatsappMessage: (productName: string, price: string, categoryName: string) => string;
  };
};

export type EducationLocale = {
  hero: {
    breadcrumb: string;
    title: string;
    tagline: string;
  };
  intro: {
    badge: string;
    heading: string;
    description: string;
  };
  programs: {
    label: string;
    heading: string;
    error: string;
    retry: string;
    emptyHeading: string;
    emptyDescription: string;
    contactButton: string;
    perPerson: string;
    statusLabel: string;
    availability: {
      slots: (count: number) => string;
      full: string;
      open: string;
    };
    status: {
      open: string;
      closed: string;
    };
    details: {
      schedule: string;
      duration: string;
      location: string;
      capacity: string;
      flexible: string;
      consult: string;
      close: string;
      view: string;
      register: string;
      full: string;
    };
  };
  facilities: {
    label: string;
    heading: string;
    items: string[];
  };
  cta: {
    heading: string;
    description: string;
    register: string;
    consult: string;
  };
  messages: {
    fetchError: string;
    whatsappGreeting: (program: string) => string;
    schedulePending: string;
    durationFlexible: string;
    durationHours: (hours: number) => string;
    durationMinutes: (minutes: number) => string;
    priceFree: string;
  };
};

export type AboutLocale = {
  hero: {
    breadcrumbHome: string;
    breadcrumbCurrent: string;
    title: string;
  };
  story: {
    label: string;
    title: string;
    introHtml: string;
    visionTitle: string;
    visionBody: string;
    missionTitle: string;
    missions: Array<{ title: string; description: string }>;
  };
  milestones: {
    label: string;
    title: string;
    subtitle: string;
    items: Array<{ year: string; title: string; description: string }>;
  };
  team: {
    title: string;
    subtitle: string;
    members: Array<{ id: string; name: string; position: string; photo: string }>;
  };
  news: {
    title: string;
    subtitle: string;
    loading: string;
    cta: string;
  };
};

export type PublicLocales = {
  home: HomeLocale;
  menu: MenuLocale;
  education: EducationLocale;
  about: AboutLocale;
};

const homeLocales: Record<PublicLang, HomeLocale> = {
  id: {
    modalTitle: "Pesanan Diterima!",
    modalMessage: "Terima kasih! Anda akan diarahkan ke WhatsApp untuk menyelesaikan pesanan Anda.",
    modalClose: "Tutup",
    about: {
      eyebrow: "— KISAH KAMI",
      heading: "See the Goodness",
      body: "Barizta lahir dari kecintaan pada kopi dan semangat berbagi. Lebih dari sekadar kedai, kami hadir sebagai ruang untuk menikmati, belajar, dan bertumbuh bersama. Dari kelas barista hingga Barizta To Go, kami terus berkomitmen menghadirkan kualitas terbaik dan edukasi kopi yang menginspirasi.",
      cta: "Selengkapnya",
    },
    news: {
      heading: "Berita Terbaru",
      description: "Berita dan pembaruan terbaru dari BARIZTA.",
      cta: "Baca Semua Berita →",
      fallback: [
        {
          title: "Rayakan Hari Jadi Ke-7, BARIZTA...",
          excerpt: "BARIZTA merayakan ulang tahun ke-7 dengan acara spesial dan promo menarik untuk pelanggan setia.",
        },
        {
          title: "Bangun Kekompakan, Komunitas Otomotif...",
          excerpt: "Komunitas Riders Weekend Indonesia menggelar acara gathering di BARIZTA dengan antusiasme tinggi.",
        },
        {
          title: "BARIZTA Buka Cabang Cirendeu,...",
          excerpt: "BARIZTA membuka cabang baru di Cirendeu, Jakarta Selatan dengan konsep yang lebih modern.",
        },
        {
          title: "Grand Opening BARIZTA Gununganyar...",
          excerpt: "BARIZTA resmi membuka cabang terbaru di Gununganyar, Surabaya dengan sambutan meriah.",
        },
      ],
    },
    instagram: {
      heading: "Behind the Brew",
      description: "Lihat bagaimana Barizta Specialty Coffee hadir dalam keseharian.",
      buttonLabel: "@bariztaspecialtycoffee",
    },
  },
  en: {
    modalTitle: "Order Received!",
    modalMessage: "Thank you! You will be redirected to WhatsApp to complete your order.",
    modalClose: "Close",
    about: {
      eyebrow: "— OUR STORY",
      heading: "See the Goodness",
      body: "Barizta was born from a love for coffee and a passion for sharing. More than a coffee shop, we are a space to enjoy, learn, and grow together. From barista classes to Barizta To Go, we stay committed to delivering inspiring coffee education and top-notch quality.",
      cta: "Learn More",
    },
    news: {
      heading: "Latest News",
      description: "Latest news and updates from BARIZTA.",
      cta: "Read All News →",
      fallback: [
        {
          title: "Celebrating 7th Anniversary, BARIZTA...",
          excerpt: "BARIZTA celebrates its 7th anniversary with special events and attractive promos for loyal customers.",
        },
        {
          title: "Building Togetherness, Automotive Community...",
          excerpt: "Riders Weekend Indonesia community held a gathering at BARIZTA with high enthusiasm.",
        },
        {
          title: "BARIZTA Opens Cirendeu Branch,...",
          excerpt: "BARIZTA opens a new branch in Cirendeu, South Jakarta with a more modern concept.",
        },
        {
          title: "Grand Opening BARIZTA Gununganyar...",
          excerpt: "BARIZTA officially opens its newest branch in Gununganyar, Surabaya with a festive welcome.",
        },
      ],
    },
    instagram: {
      heading: "Behind the Brew",
      description: "See how Barizta Specialty Coffee is present in everyday life.",
      buttonLabel: "@bariztaspecialtycoffee",
    },
  },
};

const menuLocales: Record<PublicLang, MenuLocale> = {
  id: {
    breadcrumb: "Beranda",
    current: "Menu",
    title: "Temukan Menu Barizta Specialty Coffee",
    description: "Pilihan kopi, minuman, dan makanan ringan yang dikurasi dengan cermat untuk menyesuaikan dengan selera dan suasana hati Anda.",
    empty: "Belum ada menu. Admin dapat menambahkan dari halaman admin.",
    sidebar: {
      searchTitle: "Cari di menu kami",
      searchDescription: "Cari menu, makanan, atau item spesial favoritmu di sini.",
      searchPlaceholder: "Cari menu...",
      searchButtonAria: "Cari",
      filterTitle: "Filter berdasarkan Kategori",
      filterDescription: "Pilih kategori menu favoritmu.",
    },
    results: {
      none: "Tidak ada hasil",
      range: (start, end, total) => `${start} - ${end} dari ${total} hasil`,
    },
    sorting: {
      label: "Urutkan:",
      options: [
        { value: "name-asc", label: "Nama (A–Z)" },
        { value: "name-desc", label: "Nama (Z–A)" },
        { value: "price-asc", label: "Harga (Rendah–Tinggi)" },
        { value: "price-desc", label: "Harga (Tinggi–Rendah)" },
      ],
    },
    emptyState: {
      title: "Tidak ada produk yang ditemukan.",
      hint: "Coba kata kunci lain atau hapus filter.",
    },
    pagination: {
      prev: "‹ Sebelumnya",
      next: "Berikutnya ›",
      info: (page, totalPages) => `Halaman ${page} dari ${totalPages}`,
    },
    productCard: {
      soldOut: "Habis",
      detail: "📋 Detail",
    },
    productModal: {
      fallbackDescription:
        "Nikmati kelezatan produk pilihan kami yang dibuat dengan bahan berkualitas tinggi.",
      orderButton: "🛒 Pesan Sekarang",
      unavailableButton: "Stok Habis",
      closeAria: "Tutup",
      whatsappMessage: (productName, price, categoryName) =>
        `Halo BARIZTA! Saya ingin memesan:\n\nProduk: ${productName}\nHarga: ${price}\nKategori: ${categoryName}\n\nTerima kasih!`,
    },
  },
  en: {
    breadcrumb: "Home",
    current: "Menu",
    title: "Discover the Barizta Specialty Coffee Menu",
    description: "A curated selection of coffee, drinks, and light bites tailored to match your taste and mood.",
    empty: "No menu items yet. Admins can add products from the dashboard.",
    sidebar: {
      searchTitle: "Search our menu",
      searchDescription: "Find your favorite drinks, food, or special items here.",
      searchPlaceholder: "Search menu...",
      searchButtonAria: "Search",
      filterTitle: "Filter by Category",
      filterDescription: "Choose your favorite menu categories.",
    },
    results: {
      none: "No results",
      range: (start, end, total) => `${start} - ${end} of ${total} results`,
    },
    sorting: {
      label: "Sort by:",
      options: [
        { value: "name-asc", label: "Name (A–Z)" },
        { value: "name-desc", label: "Name (Z–A)" },
        { value: "price-asc", label: "Price (Low–High)" },
        { value: "price-desc", label: "Price (High–Low)" },
      ],
    },
    emptyState: {
      title: "No products found.",
      hint: "Try different keywords or clear filters.",
    },
    pagination: {
      prev: "‹ Previous",
      next: "Next ›",
      info: (page, totalPages) => `Page ${page} of ${totalPages}`,
    },
    productCard: {
      soldOut: "Sold Out",
      detail: "📋 Details",
    },
    productModal: {
      fallbackDescription:
        "Enjoy the goodness of our handcrafted products made with quality ingredients.",
      orderButton: "🛒 Order Now",
      unavailableButton: "Out of Stock",
      closeAria: "Close",
      whatsappMessage: (productName, price, categoryName) =>
        `Hi BARIZTA! I'd like to order:\n\nProduct: ${productName}\nPrice: ${price}\nCategory: ${categoryName}\n\nThank you!`,
    },
  },
};

const educationLocales: Record<PublicLang, EducationLocale> = {
  id: {
    hero: {
      breadcrumb: "Program Pelatihan",
      title: "Program Pelatihan Barista",
      tagline: "Tingkatkan skill dan pengetahuan kopi Anda bersama barista profesional BARIZTA",
    },
    intro: {
      badge: "✨ BARIZTA COFFEE EDUCATION",
      heading: "Jadilah Barista Profesional",
      description:
        "BARIZTA menghadirkan program pelatihan barista yang komprehensif, dari dasar hingga tingkat profesional. Dipandu oleh barista berpengalaman dengan kurikulum praktis dan langsung applicable di industri kopi.",
    },
    programs: {
      label: "PILIH PROGRAM",
      heading: "Program Pelatihan Kami",
      error: "Gagal memuat data kelas edukasi. Silakan coba lagi.",
      retry: "Coba Muat Ulang",
      emptyHeading: "Belum ada kelas aktif",
      emptyDescription: "Kelas akan otomatis muncul di sini ketika admin mengaktifkan kelas di panel admin.",
      contactButton: "Hubungi Kami",
      perPerson: "/peserta",
      statusLabel: "Status",
      availability: {
        slots: (count) => `${count} kursi tersisa`,
        full: "Kelas penuh",
        open: "Slot terbuka",
      },
      status: {
        open: "Terbuka",
        closed: "Tutup",
      },
      details: {
        schedule: "Jadwal",
        duration: "Durasi",
        location: "Lokasi",
        capacity: "Kapasitas",
        flexible: "Fleksibel",
        consult: "💬 Tanya via WhatsApp",
        close: "Tutup Detail",
        view: "Lihat Detail",
        register: "Daftar Sekarang",
        full: "Kelas Penuh",
      },
    },
    facilities: {
      label: "FASILITAS",
      heading: "Apa yang Anda Dapatkan",
      items: [
        "Modul Pembelajaran",
        "Sertifikat Resmi",
        "Kopi Freeflow",
        "Mentoring Barista",
      ],
    },
    cta: {
      heading: "Siap Memulai Perjalanan Kopi Anda?",
      description: "Daftar sekarang dan jadilah bagian dari komunitas barista BARIZTA",
      register: "📝 Daftar Kelas Sekarang",
      consult: "💬 Konsultasi via WhatsApp",
    },
    messages: {
      fetchError: "Gagal memuat data kelas edukasi. Silakan coba lagi.",
      whatsappGreeting: (program) =>
        `Halo Barizta! Saya tertarik dengan program *${program}*. Mohon informasi lebih lanjut mengenai jadwal dan proses pendaftaran. Terima kasih! 🙏`,
      schedulePending: "Jadwal menyusul",
      durationFlexible: "Durasi fleksibel",
      durationHours: (hours) => `${hours} jam`,
      durationMinutes: (minutes) => `${minutes} menit`,
      priceFree: "Gratis",
    },
  },
  en: {
    hero: {
      breadcrumb: "Training Programs",
      title: "Barista Training Programs",
      tagline: "Upgrade your coffee skills with BARIZTA professional baristas",
    },
    intro: {
      badge: "✨ BARIZTA COFFEE EDUCATION",
      heading: "Become a Professional Barista",
      description:
        "BARIZTA presents comprehensive barista training programs, from fundamentals to professional levels. Guided by experienced baristas with hands-on curriculum ready for the coffee industry.",
    },
    programs: {
      label: "CHOOSE PROGRAM",
      heading: "Our Training Programs",
      error: "Failed to load education classes. Please try again.",
      retry: "Retry Loading",
      emptyHeading: "No active classes yet",
      emptyDescription: "Classes will appear here automatically once admins activate them from the dashboard.",
      contactButton: "Contact Us",
      perPerson: "/person",
      statusLabel: "Status",
      availability: {
        slots: (count) => `${count} seats left`,
        full: "Class is full",
        open: "Open slots",
      },
      status: {
        open: "Open",
        closed: "Closed",
      },
      details: {
        schedule: "Schedule",
        duration: "Duration",
        location: "Location",
        capacity: "Capacity",
        flexible: "Flexible",
        consult: "💬 Ask via WhatsApp",
        close: "Hide Details",
        view: "View Details",
        register: "Register Now",
        full: "Class Full",
      },
    },
    facilities: {
      label: "FACILITIES",
      heading: "What You'll Get",
      items: [
        "Learning Module",
        "Official Certificate",
        "Bottomless Coffee",
        "Barista Mentoring",
      ],
    },
    cta: {
      heading: "Ready to Start Your Coffee Journey?",
      description: "Register now and be part of the BARIZTA barista community",
      register: "📝 Join a Class Now",
      consult: "💬 Consult via WhatsApp",
    },
    messages: {
      fetchError: "Failed to load education classes. Please try again.",
      whatsappGreeting: (program) =>
        `Hi Barizta! I'm interested in the *${program}* program. Please share more details about the schedule and registration process. Thank you! 🙏`,
      schedulePending: "Schedule to be announced",
      durationFlexible: "Flexible duration",
      durationHours: (hours) => `${hours} ${hours === 1 ? "hour" : "hours"}`,
      durationMinutes: (minutes) => `${minutes} ${minutes === 1 ? "minute" : "minutes"}`,
      priceFree: "Free",
    },
  },
};

const aboutLocales: Record<PublicLang, AboutLocale> = {
  id: {
    hero: {
      breadcrumbHome: "Beranda",
      breadcrumbCurrent: "Tentang Kami",
      title: "Tentang Kami",
    },
    story: {
      label: "TENTANG BARIZTA",
      title: "Cerita Kami",
      introHtml:
        "Lahir dari kecintaan terhadap kopi dan dunia barista, <strong>Barizta</strong> hadir untuk memberikan pengalaman ngopi yang berbeda. Berawal dari semangat seorang barista bernama <strong>Rizal</strong> yang ingin memperkenalkan kopi bukan hanya sebagai minuman, tetapi sebagai cerita, edukasi, dan budaya. Berangkat dari konsep sederhana, Barizta berkembang menjadi ruang yang menghadirkan kopi berkualitas, transparan, dan berkarakter — mulai dari petani, roastery, hingga ke meja pelanggan.",
      visionTitle: "Visi",
      visionBody:
        "Menyajikan cita rasa kopi terbaik, dan menjadi pusat edukasi kopi bagi masyarakat, sehingga kopi dapat dinikmati dengan lebih sadar, bijak, dan berkelanjutan.",
      missionTitle: "Misi",
      missions: [
        {
          title: "Menghadirkan kualitas terbaik",
          description: "Menyajikan kopi dengan standar specialty melalui proses pemilihan biji, teknik penyeduhan, dan pelayanan yang konsisten.",
        },
        {
          title: "Mengembangkan edukasi kopi",
          description: "Menyediakan ruang belajar bagi pelanggan melalui workshop, konten edukatif, dan interaksi langsung di bar.",
        },
        {
          title: "Mendukung petani lokal",
          description: "Menjalin kerja sama dengan petani kopi Indonesia untuk meningkatkan nilai dan keberlanjutan rantai pasok kopi.",
        },
        {
          title: "Menginspirasi gaya hidup sadar kopi",
          description: "Mendorong pelanggan untuk mengenal kopi tidak hanya sebagai minuman, tetapi juga sebagai budaya, cerita, dan karya.",
        },
      ],
    },
    milestones: {
      label: "PERJALANAN KAMI",
      title: "Sejarah BARIZTA",
      subtitle: "Dari ruang kreatif kecil hingga menjadi pusat edukasi kopi",
      items: [
        {
          year: "2021",
          title: "Awal Mula Barizta",
          description:
            "Barizta berdiri sebagai ruang kreatif yang memperkenalkan kopi secara sederhana kepada masyarakat. Mulai menyajikan menu kopi pertama dan membangun komunitas pecinta kopi lokal.",
        },
        {
          year: "2022",
          title: "Pengembangan Produk dan Identitas",
          description:
            "Memperluas varian menu dengan pendekatan specialty coffee. Membentuk identitas brand Barizta sebagai ruang edukasi dan eksplorasi cita rasa.",
        },
        {
          year: "2023",
          title: "Edukasi & Workshop",
          description:
            "Mulai menyelenggarakan kelas dan workshop kopi untuk masyarakat umum. Memperkuat peran Barizta sebagai pusat edukasi kopi.",
        },
        {
          year: "2024",
          title: "Inovasi & Kolaborasi",
          description:
            "Menjalankan program kolaborasi dengan UMKM dan kreator lokal. Mengembangkan Barizta To Go sebagai layanan cepat untuk masyarakat aktif.",
        },
        {
          year: "2025",
          title: "Ekspansi & Digitalisasi",
          description:
            "Meningkatkan layanan digital, pengalaman pelanggan, dan sistem manajemen. Fokus membangun ekosistem edukasi kopi berbasis komunitas dan teknologi.",
        },
      ],
    },
    team: {
      title: "Tim BARIZTA",
      subtitle: "Bertemu dengan orang-orang di balik kesuksesan BARIZTA",
      members: [
        { id: "1", name: "M. Rizal Novianto", position: "Co-Founder & Manager", photo: "/images/about/TEAM/1.png" },
        { id: "2", name: "Tri Putra Rahmadhana", position: "Founder", photo: "/images/about/TEAM/2.png" },
        { id: "3", name: "Surya Dharma", position: "Barista", photo: "/images/about/TEAM/3.png" },
        { id: "4", name: "Syartria Pramana", position: "Head Barista", photo: "/images/about/TEAM/4.png" },
        { id: "5", name: "Maulana Alkahfi", position: "Jr. Barista", photo: "/images/about/TEAM/5.png" },
        { id: "6", name: "Akbar Fuad", position: "Part-timer Barista", photo: "/images/about/TEAM/6.png" },
        { id: "7", name: "Prima Prayoga", position: "Sr. Barista & Roaster", photo: "/images/about/TEAM/7.png" },
        { id: "8", name: "Dinda", position: "Part-timer Barista", photo: "/images/about/TEAM/8.png" },
        { id: "9", name: "Gilang", position: "Photo & Videographer", photo: "/images/about/TEAM/9.png" },
      ],
    },
    news: {
      title: "Berita Terbaru",
      subtitle: "Berita dan pembaruan terbaru dari BARIZTA Coffee",
      loading: "Memuat berita...",
      cta: "Lihat Semua Berita →",
    },
  },
  en: {
    hero: {
      breadcrumbHome: "Home",
      breadcrumbCurrent: "About",
      title: "About Us",
    },
    story: {
      label: "ABOUT BARIZTA",
      title: "Our Story",
      introHtml:
        "Born from a passion for coffee and the barista craft, <strong>Barizta</strong> offers a different coffee experience. Initiated by barista <strong>Rizal</strong>, we introduce coffee not only as a drink but as a story, education, and culture. Starting from a simple concept, Barizta has grown into a space that serves quality, transparent, and characterful coffee—from farmers and roastery to the customer table.",
      visionTitle: "Vision",
      visionBody:
        "Serving the best coffee flavors while becoming an education hub so people can enjoy coffee consciously, responsibly, and sustainably.",
      missionTitle: "Mission",
      missions: [
        {
          title: "Deliver the best quality",
          description: "Serve specialty-grade coffee through careful bean selection, precise brewing techniques, and consistent service standards.",
        },
        {
          title: "Develop coffee education",
          description: "Provide learning spaces through workshops, educational content, and direct interactions at the bar.",
        },
        {
          title: "Support local farmers",
          description: "Collaborate with Indonesian coffee farmers to increase value and sustain the coffee supply chain.",
        },
        {
          title: "Inspire mindful coffee lifestyle",
          description: "Encourage people to see coffee not only as a beverage but as culture, stories, and craftsmanship.",
        },
      ],
    },
    milestones: {
      label: "OUR JOURNEY",
      title: "BARIZTA Timeline",
      subtitle: "From a creative nook to a coffee education hub",
      items: [
        {
          year: "2021",
          title: "Barizta Begins",
          description:
            "Barizta launched as a creative space introducing coffee in an approachable way. We served our first coffee menu and nurtured a local coffee community.",
        },
        {
          year: "2022",
          title: "Product & Identity Growth",
          description:
            "Expanded menu selections with a specialty coffee approach. Strengthened Barizta's identity as a space for education and flavor exploration.",
        },
        {
          year: "2023",
          title: "Education & Workshops",
          description:
            "Hosted public coffee classes and workshops, solidifying Barizta as a coffee education center.",
        },
        {
          year: "2024",
          title: "Innovation & Collaboration",
          description:
            "Collaborated with local SMEs and creators. Launched Barizta To Go as a quick service for active communities.",
        },
        {
          year: "2025",
          title: "Expansion & Digitalization",
          description:
            "Enhanced digital services, customer experience, and management systems while building a community-driven coffee education ecosystem.",
        },
      ],
    },
    team: {
      title: "BARIZTA Team",
      subtitle: "Meet the people behind BARIZTA's journey",
      members: [
        { id: "1", name: "M. Rizal Novianto", position: "Co-Founder & Manager", photo: "/images/about/TEAM/1.png" },
        { id: "2", name: "Tri Putra Rahmadhana", position: "Founder", photo: "/images/about/TEAM/2.png" },
        { id: "3", name: "Surya Dharma", position: "Barista", photo: "/images/about/TEAM/3.png" },
        { id: "4", name: "Syartria Pramana", position: "Head Barista", photo: "/images/about/TEAM/4.png" },
        { id: "5", name: "Maulana Alkahfi", position: "Junior Barista", photo: "/images/about/TEAM/5.png" },
        { id: "6", name: "Akbar Fuad", position: "Part-time Barista", photo: "/images/about/TEAM/6.png" },
        { id: "7", name: "Prima Prayoga", position: "Senior Barista & Roaster", photo: "/images/about/TEAM/7.png" },
        { id: "8", name: "Dinda", position: "Part-time Barista", photo: "/images/about/TEAM/8.png" },
        { id: "9", name: "Gilang", position: "Photo & Videographer", photo: "/images/about/TEAM/9.png" },
      ],
    },
    news: {
      title: "Latest News",
      subtitle: "Latest news and updates from BARIZTA Coffee",
      loading: "Loading news...",
      cta: "Browse All News →",
    },
  },
};

export const publicLocales: Record<PublicLang, PublicLocales> = {
  id: {
    home: homeLocales.id,
    menu: menuLocales.id,
    education: educationLocales.id,
    about: aboutLocales.id,
  },
  en: {
    home: homeLocales.en,
    menu: menuLocales.en,
    education: educationLocales.en,
    about: aboutLocales.en,
  },
};
