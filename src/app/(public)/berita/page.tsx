"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import Image from "next/image";
import { useLanguage } from "@/context/LanguageContext";
import "./berita.css";

type NewsItem = { 
  id: number; 
  title: string; 
  category: string;
  publishDate: string; 
  excerpt: string; 
  image: string;
};

type Pagination = {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
};

const FALLBACK_NEWS: NewsItem[] = [
  { 
    id: 1, 
    title: "Grand Opening BARIZTA Coffee", 
    category: "NEWS",
    publishDate: "2024-10-15", 
    excerpt: "BARIZTA resmi membuka pintunya untuk para pecinta kopi di Padang. Dapatkan promo spesial opening!",
    image: "https://images.unsplash.com/photo-1554118811-1e0d58224f24?q=80&w=600"
  },
  { 
    id: 2, 
    title: "Coffee Cupping Workshop", 
    category: "EVENT",
    publishDate: "2024-10-25", 
    excerpt: "Ikuti workshop cupping untuk memahami karakteristik dan cita rasa berbagai jenis kopi.",
    image: "https://images.unsplash.com/photo-1521017432531-fbd92d768814?q=80&w=600"
  },
  { 
    id: 3, 
    title: "Kolaborasi dengan Seniman Lokal", 
    category: "NEWS",
    publishDate: "2024-11-05", 
    excerpt: "Pameran karya seni lokal sambil menikmati kopi. Dukung talenta kreatif daerah!",
    image: "https://images.unsplash.com/photo-1442512595331-e89e73853f31?q=80&w=600"
  },
];

export default function BeritaPage() {
  const { lang } = useLanguage();
  const [newsData, setNewsData] = useState<NewsItem[]>([]);
  const [pagination, setPagination] = useState<Pagination>({ page: 1, limit: 12, total: 0, totalPages: 0 });
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [searchInput, setSearchInput] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  // Localized copy for berita page
  const beritaLocales = {
    id: {
      breadcrumb: "Berita & Acara",
      title: "Berita & Acara",
      tagline: "Update terbaru seputar aktivitas, acara, dan rilis menu BARIZTA.",
      beranda: "Beranda",
      latest: "Berita Terbaru",
      showing: (shown: number, total: number) => `Menampilkan ${shown} dari ${total} berita`
    },
    en: {
      breadcrumb: "News & Events",
      title: "News & Events",
      tagline: "Latest updates on BARIZTA activities, events, and menu releases.",
      beranda: "Home",
      latest: "Latest News",
      showing: (shown: number, total: number) => `Showing ${shown} of ${total} news`
    }
  };
  const beritaCopy = beritaLocales[lang as keyof typeof beritaLocales];

  const fetchNews = useCallback(async (page: number, searchQuery: string) => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: "12",
        status: "published"
      });
      if (searchQuery.trim()) {
        params.set("search", searchQuery.trim());
      }

      const res = await fetch(`/api/news?${params.toString()}`);
      if (!res.ok) throw new Error("Failed to fetch");
      
      const result = await res.json();
      
      if (result.data && Array.isArray(result.data)) {
        const mapped = result.data.map((n: {
          id: number;
          title: string;
          category?: string;
          publishDate: string | Date;
          excerpt?: string;
          content?: string;
          image?: string;
        }) => ({
          id: n.id,
          title: n.title,
          category: n.category || "NEWS",
          publishDate: new Date(n.publishDate).toISOString(),
          excerpt: n.excerpt || (n.content ? n.content.slice(0, 120) + "..." : ""),
          image: n.image || "/images/hero/slide-menu.jpg"
        }));
        setNewsData(mapped.length > 0 ? mapped : FALLBACK_NEWS);
        if (result.pagination) {
          setPagination(result.pagination);
        } else {
          setPagination({ page: 1, limit: 12, total: mapped.length, totalPages: 1 });
        }
      } else {
        setNewsData(FALLBACK_NEWS);
        setPagination({ page: 1, limit: 12, total: FALLBACK_NEWS.length, totalPages: 1 });
      }
    } catch (err) {
      console.error("Failed to load news:", err);
      setNewsData(FALLBACK_NEWS);
      setPagination({ page: 1, limit: 12, total: FALLBACK_NEWS.length, totalPages: 1 });
    } finally {
      setLoading(false);
    }
  }, []);

  // Fetch news when page or search changes
  useEffect(() => {
    fetchNews(currentPage, search);
  }, [currentPage, search, fetchNews]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setSearch(searchInput);
    setCurrentPage(1); // Reset to page 1 when searching
  };

  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= pagination.totalPages) {
      setCurrentPage(newPage);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const formatDate = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleDateString("id-ID", {
        day: "2-digit",
        month: "long",
        year: "numeric"
      });
    } catch {
      return dateString;
    }
  };

  const renderPagination = () => {
    const pages: number[] = [];
    const { totalPages } = pagination;
    
    // Always show first page
    if (totalPages > 0) pages.push(1);
    
    // Show ellipsis if needed
    if (currentPage > 3) pages.push(-1);
    
    // Show pages around current
    for (let i = Math.max(2, currentPage - 1); i <= Math.min(totalPages - 1, currentPage + 1); i++) {
      if (!pages.includes(i)) pages.push(i);
    }
    
    // Show ellipsis if needed
    if (currentPage < totalPages - 2) pages.push(-2);
    
    // Always show last page
    if (totalPages > 1 && !pages.includes(totalPages)) pages.push(totalPages);

    return pages.map((p, idx) => {
      if (p < 0) {
        return <span key={`ellipsis-${idx}`} className="pagination-ellipsis">...</span>;
      }
      return (
        <button
          key={p}
          onClick={() => handlePageChange(p)}
          className={`pagination-btn ${currentPage === p ? 'active' : ''}`}
        >
          {p}
        </button>
      );
    });
  };

  return (
    <main className="berita-page">
      {/* Hero Section */}
      <section className="berita-hero">
        <div className="berita-hero-overlay"></div>
        <div className="berita-hero-content">
          <span className="berita-breadcrumb">
            <Link href="/">{beritaCopy.beranda}</Link> <span className="separator">›</span>
            <span className="active">{beritaCopy.breadcrumb}</span>
          </span>
          <h1>{beritaCopy.title}</h1>
          <p>{beritaCopy.tagline}</p>
        </div>
      </section>
      
      <section className="berita-content">
        <div className="container">
          {/* Header with Search */}
          <div className="berita-header">
            <div className="berita-info">
              <h2>{beritaCopy.latest}</h2>
              <p>{beritaCopy.showing(newsData.length, pagination.total)}</p>
            </div>
            
            <form onSubmit={handleSearch} className="search-form">
              <div className="search-wrapper">
                <input
                  type="text"
                  placeholder="Cari berita..."
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                  className="search-input"
                />
                <button type="submit" className="search-btn">
                  🔍
                </button>
              </div>
              {search && (
                <button 
                  type="button" 
                  onClick={() => { setSearch(""); setSearchInput(""); }}
                  className="clear-search"
                >
                  Hapus filter
                </button>
              )}
            </form>
          </div>

          {/* Loading State */}
          {loading ? null : newsData.length === 0 ? (
            <div className="empty-state">
              <p>Tidak ada berita yang ditemukan.</p>
              {search && (
                <button onClick={() => { setSearch(""); setSearchInput(""); }} className="btn-barizta">
                  Lihat Semua Berita
                </button>
              )}
            </div>
          ) : (
            <>
              {/* News Grid */}
              <div className="news-grid">
                {newsData.map((n) => (
                  <Link key={n.id} href={`/berita/${n.id}`} className="news-card-link">
                    <article className="news-card">
                      <div className="news-card__image">
                        <Image 
                          src={n.image} 
                          alt={n.title} 
                          width={600}
                          height={400}
                          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                          unoptimized
                        />
                        <div className="news-card__category">{n.category}</div>
                      </div>
                      <div className="news-card__content">
                        <span className="news-card__date">{formatDate(n.publishDate)}</span>
                        <h3 className="news-card__title">{n.title}</h3>
                        <p className="news-card__excerpt">{n.excerpt}</p>
                        <span className="news-card__read-more">Baca selengkapnya →</span>
                      </div>
                    </article>
                  </Link>
                ))}
              </div>

              {/* Pagination */}
              {pagination.totalPages > 1 && (
                <div className="pagination">
                  <button 
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                    className="pagination-btn nav"
                  >
                    ← Prev
                  </button>
                  
                  <div className="pagination-numbers">
                    {renderPagination()}
                  </div>
                  
                  <button 
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage === pagination.totalPages}
                    className="pagination-btn nav"
                  >
                    Next →
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </section>
    </main>
  );
}

