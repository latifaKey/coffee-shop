import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { notFound } from "next/navigation";
import "./detail.css";

export const dynamic = "force-dynamic";

type Props = {
  params: Promise<{ id: string }>;
  searchParams?: Promise<{ [key: string]: string | string[] | undefined }>;
};

export default async function NewsDetailPage({ params, searchParams }: Props) {
  const { id } = await params;
  const searchParamsResolved = searchParams ? await searchParams : undefined;
  let news;
  let otherNews: { id: number; title: string; image: string; publishDate: Date }[] = [];
  
  try {
    news = await prisma.news.findUnique({ where: { id: parseInt(id) } });
    if (news) {
      // Increment views count when rendering the public page
      await prisma.news.update({ where: { id: news.id }, data: { views: news.views + 1 } });
      
      // Fetch other published news (exclude current)
      const fetchedNews = await prisma.news.findMany({
        where: { 
          status: 'published',
          id: { not: news.id }
        },
        orderBy: { publishDate: 'desc' },
        take: 5,
        select: { id: true, title: true, image: true, publishDate: true }
      });
      otherNews = fetchedNews;
    }
  } catch {
    // DB not configured or error — allow fallback
    news = undefined;
  }

  const preview = !!(searchParamsResolved && searchParamsResolved.preview === 'true');

  if (!news) {
    // If DB not available or not found, try an in-memory fallback
    // Fallback dummy content
    const dummy = {
      id: parseInt(id),
      title: "Berita tidak ditemukan",
      content: "Berita yang Anda cari tidak ditemukan atau belum dipublikasikan.",
      excerpt: "",
      image: "/images/default-news.jpg",
      author: "Admin",
      publishDate: new Date(),
      status: 'published',
      category: 'News',
      views: 0,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    // If news is truly missing in DB, we show 404 behavior
    if (!process.env.DATABASE_URL) {
      // Show dummy if DB isn't configured (developer mode)
      news = dummy;
    } else {
      notFound();
    }
  }

  // If we have a news entry but it's not published, only render it for preview mode
  if (news && news.status && news.status !== 'published' && !preview) {
    notFound();
  }

  const formattedDate = new Date(news.publishDate).toLocaleDateString("id-ID", { day: "2-digit", month: "long", year: "numeric" });

  // Render content text preserving line breaks
  const renderedContent = news.content?.split("\n").map((line: string, idx: number) => (
    <p key={idx} style={{ marginBottom: 12 }}>{line}</p>
  ));

  return (
    <main className="berita-detail-page">
      {/* Hero Section */}
      <section className="berita-detail-hero">
        <div className="berita-detail-hero-overlay"></div>
        <div className="berita-detail-hero-content">
          <span className="berita-detail-breadcrumb">
            <Link href="/">Beranda</Link> <span className="separator">›</span>
            <Link href="/berita">Berita</Link> <span className="separator">›</span>
            <span className="active">Detail</span>
          </span>
          <h1>{news.title}</h1>
          {news.excerpt && <p>{news.excerpt}</p>}
        </div>
      </section>

      <section className="section">
        <div className="container">
          <div className="news-detail-layout">
            <article className="news-detail-main">
              {news.image ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={news.image} alt={news.title} style={{ width: "100%", height: "auto", borderRadius: 8, marginBottom: 16 }} />
              ) : (
                // fallback to hero image so we don't show broken icon
                // eslint-disable-next-line @next/next/no-img-element
                <img src="/images/hero/slide-menu.jpg" alt={news.title} style={{ width: "100%", height: "auto", borderRadius: 8, marginBottom: 16 }} />
              )}
              <div style={{ display: "flex", gap: 12, alignItems: "center", marginBottom: 8 }}>
                <span className="muted" style={{ fontSize: 13 }}>{formattedDate}</span>
                <span className="muted" style={{ fontSize: 13 }}>•</span>
                <span className="muted" style={{ fontSize: 13 }}>{news.author}</span>
              </div>
              <div style={{ marginTop: 8 }}>
                {renderedContent}
              </div>
            </article>

            {/* Sidebar - Recent / Related */}
            <aside className="news-detail-sidebar">
              <div className="sidebar-box">
                <h4 style={{ marginBottom: 16, fontSize: '1.1rem' }}>Artikel Lainnya</h4>
                {otherNews.length > 0 ? (
                  <div className="sidebar-news-list">
                    {otherNews.map((item) => (
                      <Link key={item.id} href={`/berita/${item.id}`} className="sidebar-news-item">
                        <div className="sidebar-news-thumb">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img 
                            src={item.image || "/images/hero/slide-menu.jpg"} 
                            alt={item.title} 
                          />
                        </div>
                        <div className="sidebar-news-info">
                          <h5>{item.title}</h5>
                          <span className="muted">
                            {new Date(item.publishDate).toLocaleDateString("id-ID", { day: "2-digit", month: "short", year: "numeric" })}
                          </span>
                        </div>
                      </Link>
                    ))}
                  </div>
                ) : (
                  <p className="muted">Tidak ada artikel lainnya saat ini.</p>
                )}
                <p style={{ marginTop: 16 }}>
                  <Link href="/berita" className="btn-secondary-barizta btn-secondary-barizta-sm">
                    ← Semua Berita
                  </Link>
                </p>
              </div>
            </aside>
          </div>
        </div>
      </section>
    </main>
  );
}
