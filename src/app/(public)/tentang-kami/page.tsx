"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import NewsCard, { NewsItem } from "@/components/public/NewsCard";
import { useLanguage } from "@/context/LanguageContext";
import "./tentang-kami.css";

interface Milestone {
  id: string;
  year: string;
  title: string;
  description: string;
}

interface Team {
  id: string;
  name: string;
  position: string;
  photo: string;
  bio?: string;
  order?: number;
}

export default function TentangKamiPage() {
  const { t } = useLanguage();
  const aboutCopy = t.publicPages.about;
  const homeNewsCopy = t.publicPages.home.news;
  const heroCopy = aboutCopy.hero;
  const storyCopy = aboutCopy.story;
  const milestoneCopy = aboutCopy.milestones;
  const teamCopy = aboutCopy.team;
  const newsCopy = aboutCopy.news;
  const milestones: Milestone[] = aboutCopy.milestones.items.map((item, index) => ({
    id: `${item.year}-${index}`,
    ...item,
  }));
  const teamMembers: Team[] = aboutCopy.team.members;
  const [newsData, setNewsData] = useState<NewsItem[]>([]);
  const [loadingNews, setLoadingNews] = useState(true);
  const sliderRef = useRef<HTMLDivElement>(null);
  const [isAutoPlay, setIsAutoPlay] = useState(true);
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [scrollLeft, setScrollLeft] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [activeSlide, setActiveSlide] = useState(0);
  
  const infiniteMembers = useMemo(() => {
    if (teamMembers.length === 0) return [];
    const lastMember = { ...teamMembers[teamMembers.length - 1], id: `${teamMembers[teamMembers.length - 1].id}-clone-last` };
    const firstMember = { ...teamMembers[0], id: `${teamMembers[0].id}-clone-first` };
    return [lastMember, ...teamMembers, firstMember];
  }, [teamMembers]);
  
  const cardWidth = 332; // 300px card + 32px gap

  // Handle infinite loop scroll
  const handleScrollEnd = useCallback(() => {
    if (!sliderRef.current || isTransitioning || teamMembers.length === 0) return;
    
    const slider = sliderRef.current;
    const currentScroll = slider.scrollLeft;
    const maxScroll = slider.scrollWidth - slider.clientWidth;
    
    // If scrolled to the clone of last item (at the beginning)
    if (currentScroll <= 0) {
      setIsTransitioning(true);
      // Jump to the real last item
      slider.style.scrollBehavior = 'auto';
      slider.scrollLeft = maxScroll - cardWidth;
      setTimeout(() => {
        slider.style.scrollBehavior = 'smooth';
        setIsTransitioning(false);
      }, 50);
    }
    // If scrolled to the clone of first item (at the end)
    else if (currentScroll >= maxScroll) {
      setIsTransitioning(true);
      // Jump to the real first item
      slider.style.scrollBehavior = 'auto';
      slider.scrollLeft = cardWidth;
      setTimeout(() => {
        slider.style.scrollBehavior = 'smooth';
        setIsTransitioning(false);
      }, 50);
    }
  }, [cardWidth, isTransitioning, teamMembers.length]);

  // Initialize slider position and add scroll listener for active dot
  useEffect(() => {
    if (sliderRef.current && teamMembers.length > 0) {
      // Start at the first real item (after the clone of last)
      sliderRef.current.scrollLeft = cardWidth;
      
      // Add scroll listener to update active dot
      const slider = sliderRef.current;
      const handleScroll = () => {
        if (!slider || isTransitioning) return;
        const scrollPos = slider.scrollLeft;
        // Calculate active index (accounting for clone at start)
        let index = Math.round((scrollPos - cardWidth) / cardWidth);
        // Wrap around for infinite scroll
        if (teamMembers.length > 0) {
          if (index < 0) index = teamMembers.length - 1;
          if (index >= teamMembers.length) index = 0;
          setActiveSlide(index);
        }
      };
      
      slider.addEventListener('scroll', handleScroll);
      return () => slider.removeEventListener('scroll', handleScroll);
    }
  }, [cardWidth, isTransitioning, teamMembers.length]);

  // Mouse drag handlers with infinite loop
  const handleMouseDown = (e: React.MouseEvent) => {
    if (!sliderRef.current) return;
    setIsDragging(true);
    setIsAutoPlay(false);
    setStartX(e.pageX - sliderRef.current.offsetLeft);
    setScrollLeft(sliderRef.current.scrollLeft);
    sliderRef.current.style.cursor = 'grabbing';
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging || !sliderRef.current) return;
    e.preventDefault();
    const x = e.pageX - sliderRef.current.offsetLeft;
    const walk = (x - startX) * 1.5;
    sliderRef.current.scrollLeft = scrollLeft - walk;
  };

  const handleMouseUp = () => {
    setIsDragging(false);
    if (sliderRef.current) {
      sliderRef.current.style.cursor = 'grab';
      handleScrollEnd();
    }
    setTimeout(() => setIsAutoPlay(true), 2000);
  };

  const handleMouseLeave = () => {
    if (isDragging) {
      setIsDragging(false);
      if (sliderRef.current) {
        sliderRef.current.style.cursor = 'grab';
        handleScrollEnd();
      }
    }
    setTimeout(() => setIsAutoPlay(true), 2000);
  };

  // Fallback news - using useCallback to avoid dependency issues
  const fallbackNews = useMemo<NewsItem[]>(() => {
    const fallbackImages = [
      "https://images.unsplash.com/photo-1554118811-1e0d58224f24?q=80&w=600&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1521017432531-fbd92d768814?q=80&w=600&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1442512595331-e89e73853f31?q=80&w=600&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?q=80&w=600&auto=format&fit=crop",
    ];

    return homeNewsCopy.fallback.slice(0, 3).map((item, index) => ({
      id: index + 1,
      title: item.title,
      excerpt: item.excerpt,
      category: "NEWS",
      image: fallbackImages[index % fallbackImages.length],
      publishDate: new Date().toISOString(),
    }));
  }, [homeNewsCopy.fallback]);

  useEffect(() => {
    // Langsung gunakan defaultTeamMembers - tidak perlu fetch API
    // Foto sudah dari folder /images/about/TEAM/

    // Fetch news data from API
    const fetchNews = async () => {
      try {
        // Fetch 3 berita terbaru (sorted by publishDate desc dari API)
        const res = await fetch("/api/news?status=published&limit=3&sort=latest");
        if (res.ok) {
          const response = await res.json();
          // API returns { data: [...], pagination: {...} }
          const newsArray = response.data || response;
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
        setLoadingNews(false);
      }
    };
    fetchNews();
  }, [fallbackNews]);

  // Auto-scroll slider with infinite loop
  useEffect(() => {
    if (!isAutoPlay || !sliderRef.current || isDragging || isTransitioning) return;
    if (teamMembers.length === 0) return;
    
    const slider = sliderRef.current;
    
    const interval = setInterval(() => {
      slider.scrollTo({ left: slider.scrollLeft + cardWidth, behavior: 'smooth' });
      // Check for loop after scroll animation
      setTimeout(() => handleScrollEnd(), 400);
    }, 4000);

    return () => clearInterval(interval);
  }, [isAutoPlay, isDragging, isTransitioning, cardWidth, handleScrollEnd]);

  return (
    <div className="tentang-kami-page">
      {/* Hero Section */}
      <section className="hero-section">
        <div className="hero-overlay"></div>
        <div className="hero-content">
          <div className="breadcrumb">
            <Link href="/">{heroCopy.breadcrumbHome}</Link>
            <span className="separator">›</span>
            <span className="active">{heroCopy.breadcrumbCurrent}</span>
          </div>
          <h1>{heroCopy.title}</h1>
        </div>
      </section>

      {/* Story & Visi Misi Section */}
      <section className="story-section">
        <div className="container">
          <div className="section-label">{storyCopy.label}</div>
          <h2 className="section-title">{storyCopy.title}</h2>
          
          {/* Paragraf Pembuka */}
          <div className="intro-paragraph">
            <p dangerouslySetInnerHTML={{ __html: storyCopy.introHtml }} />
          </div>

          <div className="vision-mission-grid">
            <div className="vm-card visi-card">
              <h3>{storyCopy.visionTitle}</h3>
              <div className="visi-content">
                <div className="visi-item">
                  <p>{storyCopy.visionBody}</p>
                </div>
              </div>
            </div>
            <div className="vm-card misi-card">
              <h3>{storyCopy.missionTitle}</h3>
              <div className="misi-scroll-container">
                <ul>
                  {storyCopy.missions.map((mission, idx) => (
                    <li key={idx}>
                      <strong>{mission.title}</strong>
                      <span>{mission.description}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Milestone Section - Sejarah BARIZTA */}
      <section className="milestone-section">
        <div className="container">
          <div className="section-label-center">{milestoneCopy.label}</div>
          <h2 className="section-title-center">{milestoneCopy.title}</h2>
          <p className="section-subtitle">{milestoneCopy.subtitle}</p>
          
          <div className="milestone-scroll-wrapper">
            <div className="timeline">
              <div className="timeline-line"></div>
              {milestones.map((milestone, index) => (
                <div key={milestone.id} className={`timeline-item ${index % 2 === 0 ? 'left' : 'right'}`}>
                  <div className="timeline-marker">
                    <div className="timeline-year">{milestone.year}</div>
                  </div>
                  <div className="timeline-content">
                    <h3>{milestone.title}</h3>
                    <p>{milestone.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Tim BARIZTA Section */}
      <section className="team-section team-compact">
        <div className="container">
          <h2 className="section-title-center">{teamCopy.title}</h2>
          <p className="section-subtitle">{teamCopy.subtitle}</p>
          
          <div className="team-slider-container">
            <div 
              className={`team-slider ${isDragging ? 'is-dragging' : ''}`}
              ref={sliderRef}
              onMouseDown={handleMouseDown}
              onMouseMove={handleMouseMove}
              onMouseUp={handleMouseUp}
              onMouseLeave={handleMouseLeave}
              onTouchStart={(e) => {
                setIsAutoPlay(false);
                setStartX(e.touches[0].clientX);
                setScrollLeft(sliderRef.current?.scrollLeft || 0);
              }}
              onTouchMove={(e) => {
                if (!sliderRef.current) return;
                const x = e.touches[0].clientX;
                const walk = (startX - x) * 1.2;
                sliderRef.current.scrollLeft = scrollLeft + walk;
              }}
              onTouchEnd={() => {
                handleScrollEnd();
                setTimeout(() => setIsAutoPlay(true), 2000);
              }}
            >
              {infiniteMembers.map((member) => (
                <div key={member.id} className="team-card-compact">
                  <div className="team-photo-compact">
                    <Image 
                      src={member.photo} 
                      alt={member.name} 
                      width={300} 
                      height={400} 
                      style={{ objectFit: 'contain', objectPosition: 'center bottom' }}
                    />
                  </div>
                  <div className="team-info-compact">
                    <h3>{member.name}</h3>
                    <p>{member.position}</p>
                  </div>
                </div>
              ))}
            </div>
            
            {/* Scroll indicator dots */}
            <div className="slider-dots">
              {teamMembers.map((_, idx) => (
                <span 
                  key={idx} 
                  className={`slider-dot ${activeSlide === idx ? 'active' : ''}`}
                  onClick={() => {
                    if (sliderRef.current) {
                      setActiveSlide(idx);
                      // +1 to account for the clone at the beginning
                      sliderRef.current.scrollTo({ left: (idx + 1) * cardWidth, behavior: 'smooth' });
                    }
                  }}
                />
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Berita Section */}
      <section className="news-section">
        <div className="container">
          <div className="news-header">
            <div>
              <h2 className="section-title-center">{newsCopy.title}</h2>
              <p className="section-subtitle">{newsCopy.subtitle}</p>
            </div>
          </div>
          <div className="news-grid">
            {loadingNews ? (
              <p className="loading-text">{newsCopy.loading}</p>
            ) : (
              newsData.map((news) => (
                <NewsCard key={news.id} news={news} />
              ))
            )}
          </div>
          <div className="news-footer">
            <Link href="/berita" className="btn-barizta">{newsCopy.cta}</Link>
          </div>
        </div>
      </section>
    </div>
  );
}
