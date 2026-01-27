"use client";

import { useState, useEffect, useMemo } from "react";
import Image from "next/image";
import Link from "next/link";
import HeroCarousel from "@/components/public/HeroCarousel";
import NewsCard, { NewsItem } from "@/components/public/NewsCard";
import { useLanguage } from "@/context/LanguageContext";

export default function Home() {
  const { t } = useLanguage();
  const homeCopy = t.publicPages.home;

  // Modal pesanan dihapus karena tidak diperlukan lagi

  return (
    <>
      {/* Hero Carousel (translated) */}
      <HomeHero />

      {/* About Section with Image */}
      <AboutSection />

      {/* Promo Section
      <PromoSection /> */}

      {/* News/Berita Section */}
      <NewsSection />

      {/* Instagram Section */}
      <InstagramSection />
    </>
  );
}

function HomeHero() {
  const { t } = useLanguage();
  // map translated slides into images - Menu, Education, About
  const bgImages = [
    "/images/hero/slide-menu.jpg",
    "/images/hero/slide-kelas-edukasi.jpg",
    "/images/hero/slide-tentang-kami.jpg",
  ];
  const slides = t.hero.slides.map((s, i) => ({ ...s, image: bgImages[i % bgImages.length] }));
  return <HeroCarousel height={680} autoPlayMs={5000} slides={slides} />;
}

function AboutSection() {
  const { t } = useLanguage();
  const copy = t.publicPages.home.about;
  return (
    <section className="section">
      <div className="container">
        <div className="about-grid">
          <div className="about-grid__image">
            <Image 
              src="/images/about/ruang.jpg" 
              alt="BARIZTA Coffee Shop Interior"
              width={800}
              height={600}
              style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '16px' }}
            />
          </div>
          <div className="about-grid__content">
            <div className="eyebrow" style={{ color: 'var(--primary)', fontWeight: 600, fontSize: '13px', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '12px' }}>
              {copy.eyebrow}
            </div>
            <h2 className="h2" style={{ marginBottom: '16px' }}>
              {copy.heading}
            </h2>
            <p className="muted" style={{ lineHeight: 1.8, marginBottom: '24px' }}>
              {copy.body}
            </p>
            <a 
              href="/tentang-kami" 
              className="btn-barizta"
              onMouseEnter={(e) => {
                e.currentTarget.style.background = 'linear-gradient(135deg, rgba(139, 69, 19, 0.6), rgba(212, 165, 116, 0.5))';
                e.currentTarget.style.borderColor = '#D4A574';
                e.currentTarget.style.transform = 'translateY(-2px)';
                e.currentTarget.style.boxShadow = '0 4px 12px rgba(139, 69, 19, 0.4)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'linear-gradient(135deg, rgba(139, 69, 19, 0.4), rgba(212, 165, 116, 0.3))';
                e.currentTarget.style.borderColor = '#8B4513';
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 2px 8px rgba(139, 69, 19, 0.2)';
              }}
              style={{
                background: 'linear-gradient(135deg, rgba(139, 69, 19, 0.4), rgba(212, 165, 116, 0.3))',
                border: '1px solid #8B4513',
                color: '#D4A574',
                padding: '0.5rem 1.25rem',
                borderRadius: '6px',
                fontSize: '0.9rem',
                fontWeight: '500',
                boxShadow: '0 2px 8px rgba(139, 69, 19, 0.2)',
                textDecoration: 'none',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.5rem',
                transition: 'all 0.3s',
                cursor: 'pointer'
              }}
            >
              {copy.cta}
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}

// function PromoSection() {
//   const { lang } = useLanguage();
  
//   const promos = [
//     {
//       id: 1,
//       title: lang === "id" ? "Promo Paket Hemat" : "Value Package Promo",
//       description: lang === "id" ? "Dapatkan diskon 20% untuk pembelian paket kopi pilihan" : "Get 20% off for selected coffee packages",
//       discount: "20%",
//       validUntil: lang === "id" ? "Berlaku hingga 31 Des 2025" : "Valid until Dec 31, 2025",
//       image: "https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?q=80&w=600&auto=format&fit=crop"
//     },
//     {
//       id: 2,
//       title: lang === "id" ? "Happy Hour" : "Happy Hour",
//       description: lang === "id" ? "Beli 2 gratis 1 setiap hari pukul 14:00 - 16:00" : "Buy 2 get 1 free every day 2-4 PM",
//       discount: "Buy 2 Get 1",
//       validUntil: lang === "id" ? "Setiap Hari" : "Every Day",
//       image: "https://images.unsplash.com/photo-1509042239860-f550ce710b93?q=80&w=600&auto=format&fit=crop"
//     },
//     {
//       id: 3,
//       title: lang === "id" ? "Member Spesial" : "Member Special",
//       description: lang === "id" ? "Dapatkan poin reward setiap pembelian dan tukar dengan kopi gratis" : "Get reward points on every purchase and redeem for free coffee",
//       discount: "Poin 2x",
//       validUntil: lang === "id" ? "Untuk Member" : "For Members",
//       image: "https://images.unsplash.com/photo-1511920170033-f8396924c348?q=80&w=600&auto=format&fit=crop"
//     }
//   ];

//   return (
//     <section className="section alt">
//       <div className="container">
//         <div className="section__head">
//           <h2 className="h2">{lang === "id" ? "Promo Spesial" : "Special Promos"}</h2>
//           <p className="muted">{lang === "id" ? "Nikmati berbagai promo menarik dari BARIZTA" : "Enjoy various attractive promos from BARIZTA"}</p>
//         </div>
//         <div className="grid-3">
//           {promos.map((promo) => (
//             <article key={promo.id} className="promo-card">
//               <div className="promo-card__image">
//                 <Image src={promo.image} alt={promo.title} width={600} height={400} style={{ width: '100%', height: 'auto' }} />
//                 <div className="promo-card__badge">{promo.discount}</div>
//               </div>
//               <div className="promo-card__content">
//                 <h3 style={{ marginBottom: '8px', fontSize: '18px' }}>{promo.title}</h3>
//                 <p className="muted" style={{ fontSize: '14px', marginBottom: '12px' }}>{promo.description}</p>
//                 <div style={{ fontSize: '12px', color: 'var(--primary)', fontWeight: 600 }}>
//                   ⏰ {promo.validUntil}
//                 </div>
//               </div>
//             </article>
//           ))}
//         </div>
//       </div>
//     </section>
//   );
// }


//berita section

function NewsSection() {
  const { t } = useLanguage();
  const copy = t.publicPages.home.news;
  const [newsData, setNewsData] = useState<NewsItem[]>([]);
  const [loading, setLoading] = useState(true);

  const fallbackNews = useMemo<NewsItem[]>(() => {
    const fallbackImages = [
      "https://images.unsplash.com/photo-1554118811-1e0d58224f24?q=80&w=600&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1521017432531-fbd92d768814?q=80&w=600&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1442512595331-e89e73853f31?q=80&w=600&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?q=80&w=600&auto=format&fit=crop",
    ];

    return copy.fallback.map((item, index) => ({
      id: index + 1,
      title: item.title,
      excerpt: item.excerpt,
      category: "NEWS",
      image: fallbackImages[index % fallbackImages.length],
      publishDate: new Date().toISOString(),
    }));
  }, [copy.fallback]);

  useEffect(() => {
    const fetchNews = async () => {
      try {
        // Fetch 3 berita terbaru (sorted by publishDate desc dari API)
        const res = await fetch("/api/news?status=published&limit=3&sort=latest");
        if (res.ok) {
          const response = await res.json();
          // API returns { data: [...], pagination: {...} }
          const newsArray = response.data || response;
          // Take only the 3 most recent news
          const latestNews = (Array.isArray(newsArray) ? newsArray : []).slice(0, 3).map((n: NewsItem) => ({
            ...n,
            image: n.image || n.imageUrl || "/images/hero/slide-menu.jpg"
          }));
          setNewsData(latestNews.length > 0 ? latestNews : fallbackNews);
        } else {
          setNewsData(fallbackNews);
        }
      } catch (error) {
        console.error("Error fetching news:", error);
        setNewsData(fallbackNews);
      } finally {
        setLoading(false);
      }
    };
    fetchNews();
  }, [fallbackNews]);

  return (
    <section className="section" style={{ background: 'var(--bg)' }}>
      <div className="container">
        <div className="news-header">
          <div>
            <h2 className="h2" style={{ marginBottom: '8px' }}>
              {copy.heading}
            </h2>
              <p className="muted">
              {copy.description}
            </p>
          </div>
          <Link 
            href="/berita" 
            className="btn-barizta btn-barizta-sm"
          >
            {copy.cta}
          </Link>
        </div>
        <div className="news-grid">
          {loading ? null : (
            newsData.map((item) => (
              <NewsCard key={item.id} news={item} />
            ))
          )}
        </div>
      </div>
    </section>
  );
}

function InstagramSection() {
  const { t } = useLanguage();
  const copy = t.publicPages.home.instagram;
  
  const instagramPosts = [
    { id: 1, image: "/images/instagram/ig_1.jpg", url: "https://www.instagram.com/bariztaspecialtycoffee" },
    { id: 2, image: "/images/instagram/ig_2.jpg", url: "https://www.instagram.com/bariztaspecialtycoffee" },
    { id: 3, image: "/images/instagram/ig_3.jpg", url: "https://www.instagram.com/bariztaspecialtycoffee" },
    { id: 4, image: "/images/instagram/ig_4.jpg", url: "https://www.instagram.com/bariztaspecialtycoffee" },
    { id: 5, image: "/images/instagram/ig_5.jpg", url: "https://www.instagram.com/bariztaspecialtycoffee" },
    { id: 6, image: "/images/instagram/ig_9.jpg", url: "https://www.instagram.com/bariztaspecialtycoffee" },
    { id: 7, image: "/images/instagram/ig_7.jpg", url: "https://www.instagram.com/bariztaspecialtycoffee" },
    { id: 8, image: "/images/instagram/ig_8.jpg", url: "https://www.instagram.com/bariztaspecialtycoffee" },
  ];

  return (
    <section className="section instagram-section">
      <div className="container">
        <div className="instagram-header">
          <h2 className="h2" style={{ marginBottom: '8px' }}>
            {copy.heading}
          </h2>
          <p className="muted" style={{ marginBottom: '20px' }}>
            {copy.description}
          </p>
          <a 
            href="https://www.instagram.com/bariztaspecialtycoffee?utm_source=ig_web_button_share_sheet&igsh=ZDNlZDc0MzIxNw==" 
            target="_blank" 
            rel="noopener noreferrer"
            className="instagram-button"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" style={{ marginRight: '8px' }}>
              <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
            </svg>
            {copy.buttonLabel}
          </a>
        </div>
        <div className="instagram-grid">
          {instagramPosts.map((post) => (
            <a 
              key={post.id} 
              href={post.url} 
              target="_blank" 
              rel="noopener noreferrer"
              className="instagram-post"
            >
              <Image 
                src={post.image} 
                alt={`Instagram post ${post.id}`} 
                width={300} 
                height={300}
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              />
              <div className="instagram-post__overlay">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="white">
                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                </svg>
              </div>
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}
