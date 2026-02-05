"use client";

import { useCallback, useEffect, useRef, useState, useMemo } from "react";
import Link from "next/link";
import Image from "next/image";
import NewsCard, { NewsItem } from "@/components/public/NewsCard";
import { useLanguage } from "@/context/LanguageContext";
import "./tentang-kami.css";

interface Milestone {
  id: number;
  year: string;
  title: string;
  description: string;
  order?: number;
}

interface Team {
  id: number;
  name: string;
  position: string;
  photo: string;
  bio?: string;
  order?: number;
}

export default function TentangKamiPage() {
  const { t } = useLanguage();
  const aboutCopy = t.publicPages.about;
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const homeNewsCopy = t.publicPages.home.news;
  const heroCopy = aboutCopy.hero;
  const storyCopy = aboutCopy.story;
  const milestoneCopy = aboutCopy.milestones;
  const teamCopy = aboutCopy.team;
  const newsCopy = aboutCopy.news;
  
  // State untuk data dari database
  const [milestones, setMilestones] = useState<Milestone[]>([]);
  const [teamMembers, setTeamMembers] = useState<Team[]>([]);
  const [loadingMilestones, setLoadingMilestones] = useState(true);
  const [loadingTeam, setLoadingTeam] = useState(true);
  
  const [newsData, setNewsData] = useState<NewsItem[]>([]);
  const [loadingNews, setLoadingNews] = useState(true);
  const sliderRef = useRef<HTMLDivElement>(null);
  const [isAutoPlay, setIsAutoPlay] = useState(true);
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [scrollLeft, setScrollLeft] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(1); // Start at 1 (first real slide)
  const [centerCardIndex, setCenterCardIndex] = useState(1);
  
  const cardWidth = 312; // 280px card + 32px gap
  const totalSlides = teamMembers.length;
  
  // Helper function to calculate scroll position to center a card
  const getScrollPositionForIndex = useCallback((index: number) => {
    if (!sliderRef.current) return index * cardWidth;
    const sliderWidth = sliderRef.current.clientWidth;
    const cardCenterOffset = 280 / 2; // Half of card width (not including gap)
    const viewportCenter = sliderWidth / 2;
    // Position card center at viewport center
    return (index * cardWidth) - (viewportCenter - cardCenterOffset);
  }, [cardWidth]);
  
  // Create infinite loop: [last, ...members, first]
  const extendedMembers = useMemo(() => {
    if (teamMembers.length === 0) return [];
    return [teamMembers[totalSlides - 1], ...teamMembers, teamMembers[0]];
  }, [teamMembers, totalSlides]);
  
  // Jump to real slide when on clone - using currentIndex state directly
  const jumpToRealSlide = useCallback((cloneIndex: number) => {
    if (!sliderRef.current || totalSlides === 0) return;
    
    const slider = sliderRef.current;
    
    // If at clone of last (index 0), jump to real last (index totalSlides)
    if (cloneIndex === 0) {
      slider.style.scrollBehavior = 'auto';
      slider.scrollLeft = getScrollPositionForIndex(totalSlides);
      setCurrentIndex(totalSlides);
      setCenterCardIndex(totalSlides);
      setTimeout(() => {
        slider.style.scrollBehavior = 'smooth';
        setIsTransitioning(false);
      }, 100);
    }
    // If at clone of first (index totalSlides + 1), jump to real first (index 1)
    else if (cloneIndex === totalSlides + 1) {
      slider.style.scrollBehavior = 'auto';
      slider.scrollLeft = getScrollPositionForIndex(1);
      setCurrentIndex(1);
      setCenterCardIndex(1);
      setTimeout(() => {
        slider.style.scrollBehavior = 'smooth';
        setIsTransitioning(false);
      }, 100);
    } else {
      setIsTransitioning(false);
    }
  }, [totalSlides, getScrollPositionForIndex]);

  // Initialize slider position and add scroll listener
  useEffect(() => {
    if (sliderRef.current && extendedMembers.length > 0) {
      const slider = sliderRef.current;
      
      // Start at the first real item (index 1), centered
      slider.style.scrollBehavior = 'auto';
      slider.scrollLeft = getScrollPositionForIndex(1);
      setCurrentIndex(1);
      setCenterCardIndex(1);
      setTimeout(() => {
        slider.style.scrollBehavior = 'smooth';
      }, 100);
      
      // Add scroll listener to update center card highlighting only
      const threshold = 50;
      const handleScroll = () => {
        if (!slider) return;
        
        const sliderRect = slider.getBoundingClientRect();
        const sliderCenter = sliderRect.left + sliderRect.width / 2;
        const cards = slider.querySelectorAll('.team-card-compact');
        let closestIndex = 0;
        let closestDistance = Infinity;
        
        cards.forEach((card, idx) => {
          const cardRect = card.getBoundingClientRect();
          const cardCenter = cardRect.left + cardRect.width / 2;
          const distance = Math.abs(sliderCenter - cardCenter);
          
          if (distance < threshold && distance < closestDistance) {
            closestDistance = distance;
            closestIndex = idx;
          }
        });
        
        if (closestDistance < threshold) {
          setCenterCardIndex(closestIndex);
        }
      };
      
      slider.addEventListener('scroll', handleScroll);
      
      // Initial center detection
      handleScroll();
      
      return () => {
        slider.removeEventListener('scroll', handleScroll);
      };
    }
  }, [extendedMembers.length, getScrollPositionForIndex]);

  // Mouse drag handlers
  const handleMouseDown = (e: React.MouseEvent) => {
    if (!sliderRef.current || isTransitioning) return;
    setIsDragging(true);
    setIsAutoPlay(false);
    setStartX(e.pageX);
    setScrollLeft(sliderRef.current.scrollLeft);
    sliderRef.current.style.cursor = 'grabbing';
    sliderRef.current.style.scrollBehavior = 'auto';
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging || !sliderRef.current) return;
    e.preventDefault();
    const x = e.pageX;
    const walk = (startX - x) * 1.2;
    sliderRef.current.scrollLeft = scrollLeft + walk;
  };

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
    if (sliderRef.current) {
      sliderRef.current.style.cursor = 'grab';
      sliderRef.current.style.scrollBehavior = 'smooth';
    }
    setTimeout(() => setIsAutoPlay(true), 3000);
  }, []);

  const handleMouseLeave = useCallback(() => {
    if (isDragging) {
      setIsDragging(false);
      if (sliderRef.current) {
        sliderRef.current.style.cursor = 'grab';
        sliderRef.current.style.scrollBehavior = 'smooth';
      }
    }
    setTimeout(() => setIsAutoPlay(true), 3000);
  }, [isDragging]);

  // FALLBACK dihapus - hanya menampilkan data dari database admin

  useEffect(() => {
    // Fetch milestones from database
    const fetchMilestones = async () => {
      try {
        const res = await fetch("/api/milestones");
        if (res.ok) {
          const data = await res.json();
          setMilestones(data);
        }
      } catch (error) {
        console.error("Error fetching milestones:", error);
      } finally {
        setLoadingMilestones(false);
      }
    };

    // Fetch team members from database
    const fetchTeam = async () => {
      try {
        const res = await fetch("/api/team");
        if (res.ok) {
          const data = await res.json();
          setTeamMembers(data);
        }
      } catch (error) {
        console.error("Error fetching team:", error);
      } finally {
        setLoadingTeam(false);
      }
    };

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
          setNewsData(latestNews);
        } else {
          setNewsData([]);
        }
      } catch (error) {
        console.error("Error fetching news:", error);
        setNewsData([]);
      } finally {
        setLoadingNews(false);
      }
    };
    
    // Fetch all data
    fetchMilestones();
    fetchTeam();
    fetchNews();
  }, []);

  // Auto-scroll with infinite loop
  useEffect(() => {
    if (!isAutoPlay || !sliderRef.current || isDragging || isTransitioning) return;
    if (extendedMembers.length === 0 || totalSlides === 0) return;
    
    const slider = sliderRef.current;
    
    const timer = setTimeout(() => {
      if (!isTransitioning) {
        setIsTransitioning(true);
        const nextIndex = currentIndex + 1;
        const scrollPos = getScrollPositionForIndex(nextIndex);
        slider.scrollTo({ left: scrollPos, behavior: 'smooth' });
        setCurrentIndex(nextIndex);
        setCenterCardIndex(nextIndex);
        
        // If scrolling to clone, schedule jump to real slide
        if (nextIndex === 0 || nextIndex === totalSlides + 1) {
          setTimeout(() => {
            jumpToRealSlide(nextIndex);
          }, 600); // 600ms for scroll animation to complete
        } else {
          setTimeout(() => {
            setIsTransitioning(false);
          }, 600);
        }
      }
    }, 4000);

    return () => {
      clearTimeout(timer);
    };
  }, [isAutoPlay, isDragging, isTransitioning, currentIndex, cardWidth, extendedMembers.length, totalSlides, jumpToRealSlide, getScrollPositionForIndex]);

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
            {loadingMilestones ? (
              <p className="loading-text">Memuat data...</p>
            ) : milestones.length === 0 ? (
              <p className="loading-text">Belum ada data milestone</p>
            ) : (
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
            )}
          </div>
        </div>
      </section>

      {/* Tim BARIZTA Section */}
      <section className="team-section team-compact">
        <div className="container">
          <h2 className="section-title-center">{teamCopy.title}</h2>
          <p className="section-subtitle">{teamCopy.subtitle}</p>
          
          {loadingTeam ? (
            <p className="loading-text">Memuat data tim...</p>
          ) : teamMembers.length === 0 ? (
            <p className="loading-text">Belum ada data tim</p>
          ) : (
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
                setIsDragging(true);
                setStartX(e.touches[0].clientX);
                setScrollLeft(sliderRef.current?.scrollLeft || 0);
                if (sliderRef.current) {
                  sliderRef.current.style.scrollBehavior = 'auto';
                }
              }}
              onTouchMove={(e) => {
                if (!sliderRef.current) return;
                const x = e.touches[0].clientX;
                const walk = (startX - x) * 1.0; // Natural 1:1 movement
                sliderRef.current.scrollLeft = scrollLeft + walk;
              }}
              onTouchEnd={() => {
                setIsDragging(false);
                if (sliderRef.current) {
                  sliderRef.current.style.scrollBehavior = 'smooth';
                }
                setTimeout(() => setIsAutoPlay(true), 3000);
              }}
            >
              {extendedMembers.map((member, idx) => (
                <div 
                  key={`${member.id}-${idx}`} 
                  className={`team-card-compact ${idx === centerCardIndex ? 'center' : ''}`}
                >
                  <div className="team-photo-compact">
                    <Image 
                      src={member.photo} 
                      alt={member.name} 
                      width={300} 
                      height={400} 
                      style={{ objectFit: 'contain', objectPosition: 'center center' }}
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
              {teamMembers.map((_, idx) => {
                // Calculate actual index from currentIndex (0=clone of last, 1-9=real, 10=clone of first)
                const actualIndex = currentIndex === 0 ? totalSlides - 1 : 
                                  currentIndex === totalSlides + 1 ? 0 : 
                                  currentIndex - 1;
                return (
                  <span 
                    key={idx} 
                    className={`slider-dot ${actualIndex === idx ? 'active' : ''}`}
                    onClick={() => {
                      if (sliderRef.current && !isTransitioning) {
                        setIsTransitioning(true);
                        const targetIndex = idx + 1; // +1 because first real item is at index 1
                        setCurrentIndex(targetIndex);
                        setCenterCardIndex(targetIndex);
                        const scrollPos = getScrollPositionForIndex(targetIndex);
                        sliderRef.current.scrollTo({ left: scrollPos, behavior: 'smooth' });
                        setTimeout(() => setIsTransitioning(false), 600);
                      }
                    }}
                  />
                );
              })}
            </div>
          </div>
          )}
        </div>
      </section>

      {/* Berita Section - Hanya tampil jika ada data dari database */}
      {!loadingNews && newsData.length > 0 && (
        <section className="section" style={{ background: 'var(--bg)' }}>
          <div className="container">
            <div className="news-header">
              <div>
                <h2 className="h2" style={{ marginBottom: '8px' }}>
                  {newsCopy.title}
                </h2>
                <p className="muted">
                  {newsCopy.subtitle}
                </p>
              </div>
              <Link 
                href="/berita" 
                className="btn-barizta btn-barizta-sm"
              >
                {newsCopy.cta}
              </Link>
            </div>
            <div className="news-grid">
              {loadingNews ? null : (
                newsData.map((news) => (
                  <NewsCard key={news.id} news={news} />
                ))
              )}
            </div>
          </div>
        </section>
      )}
    </div>
  );
}
