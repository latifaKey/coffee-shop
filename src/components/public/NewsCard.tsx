"use client";

import Image from "next/image";
import Link from "next/link";

export interface NewsItem {
  id: number;
  title: string;
  category: string;
  content?: string;
  excerpt?: string;
  image?: string;
  imageUrl?: string;
  publishDate?: string;
  createdAt?: string;
  slug?: string;
}

interface NewsCardProps {
  news: NewsItem;
  className?: string;
}

export default function NewsCard({ news, className = "" }: NewsCardProps) {
  // Format date
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

  // Get excerpt from content if not available
  const getExcerpt = () => {
    if (news.excerpt) return news.excerpt;
    if (news.content) return news.content.slice(0, 120) + "...";
    return "";
  };

  return (
    <Link href={`/berita/${news.id}`} className={`news-card-link ${className}`}>
      <article className="news-card">
        <div className="news-card__image">
          <Image 
            src={news.image || news.imageUrl || "/images/hero/slide-menu.jpg"} 
            alt={news.title} 
            width={600} 
            height={400}
            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
            unoptimized
          />
          <div className="news-card__category">{news.category || "NEWS"}</div>
        </div>
        <div className="news-card__content">
          <h3 className="news-card__title">{news.title}</h3>
          <p className="news-card__excerpt">{getExcerpt()}</p>
          <span className="news-card__date">{formatDate(news.publishDate || news.createdAt || "")}</span>
        </div>
      </article>
    </Link>
  );
}
