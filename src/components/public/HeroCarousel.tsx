"use client";

import Image from "next/image";
import { useCallback, useEffect, useRef, useState } from "react";

type Slide = {
  image: string;
  eyebrow?: string;
  title: string;
  description?: string;
  ctaText?: string;
  ctaHref?: string;
};

type Props = {
  slides: Slide[];
  height?: number; // px height on desktop
  autoPlayMs?: number; // 0 to disable
};

export default function HeroCarousel({ slides, height = 560, autoPlayMs = 6000 }: Props) {
  const [currentIndex, setCurrentIndex] = useState(1); // Start at 1 (first real slide)
  const [dragX, setDragX] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const startX = useRef<number | null>(null);
  const trackRef = useRef<HTMLDivElement | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const totalSlides = slides.length;
  // Create infinite loop: [last, ...slides, first]
  const extendedSlides = [slides[totalSlides - 1], ...slides, slides[0]];

  const goToSlide = useCallback((index: number) => {
    setIsTransitioning(true);
    setCurrentIndex(index);
  }, []);

  const handleTransitionEnd = useCallback(() => {
    setIsTransitioning(false);
    // Jump to real slide without transition
    if (currentIndex === 0) {
      setCurrentIndex(totalSlides);
    } else if (currentIndex === totalSlides + 1) {
      setCurrentIndex(1);
    }
  }, [currentIndex, totalSlides]);

  const next = useCallback(() => {
    if (!isTransitioning) {
      goToSlide(currentIndex + 1);
    }
  }, [currentIndex, isTransitioning, goToSlide]);

  const prev = useCallback(() => {
    if (!isTransitioning) {
      goToSlide(currentIndex - 1);
    }
  }, [currentIndex, isTransitioning, goToSlide]);

  // autoplay
  useEffect(() => {
    if (!autoPlayMs) return;
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => next(), autoPlayMs);
    return () => { if (timerRef.current) clearTimeout(timerRef.current); };
  }, [currentIndex, autoPlayMs, next]);

  // swipe/drag
  const onStart = (clientX: number) => { 
    if (isTransitioning) return;
    startX.current = clientX; 
    setDragX(0);
  };
  const onMove = (clientX: number) => {
    if (startX.current == null || isTransitioning) return;
    setDragX(clientX - startX.current);
  };
  const onEnd = () => {
    if (startX.current == null) return;
    const dx = dragX;
    startX.current = null;
    setDragX(0);
    const threshold = 50;
    if (dx > threshold) prev();
    else if (dx < -threshold) next();
  };

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowRight") next();
    if (e.key === "ArrowLeft") prev();
  };

  const translate = `translateX(calc(${-currentIndex * 100}% + ${dragX}px))`;
  const transition = isTransitioning ? 'transform 0.8s cubic-bezier(0.25, 0.1, 0.25, 1)' : 'none';

  // Calculate actual slide index for dots (0-based)
  const actualIndex = currentIndex === 0 ? totalSlides - 1 : currentIndex === totalSlides + 1 ? 0 : currentIndex - 1;

  return (
    <section className="hero-slider" style={{ height }} aria-roledescription="carousel">
      <div
        className="hero-slider__viewport"
        role="group"
        tabIndex={0}
        onKeyDown={onKeyDown}
        onMouseDown={(e) => onStart(e.clientX)}
        onMouseMove={(e) => onMove(e.clientX)}
        onMouseUp={onEnd}
        onMouseLeave={onEnd}
        onTouchStart={(e) => onStart(e.touches[0].clientX)}
        onTouchMove={(e) => onMove(e.touches[0].clientX)}
        onTouchEnd={onEnd}
      >
        <div 
          className="hero-slider__track" 
          ref={trackRef} 
          style={{ transform: translate, transition }}
          onTransitionEnd={handleTransitionEnd}
        >
          {extendedSlides.map((s, i) => (
            <article key={i} className="hero-slide" aria-roledescription="slide" aria-label={`${i} dari ${extendedSlides.length}`}>
              <div className="hero-slide__media">
                <Image src={s.image} alt={s.title} fill priority={i === 1} sizes="100vw" style={{ objectFit: "cover" }} />
                <div className="hero-slide__overlay" />
              </div>
              <div className="hero-slide__content container">
                {s.eyebrow && <div className="hero-eyebrow">{s.eyebrow}</div>}
                <h1 className="hero-title">{s.title}</h1>
                {s.description && <p className="hero-desc muted">{s.description}</p>}
                {s.ctaText && s.ctaHref && (
                  <a className="btn-barizta" href={s.ctaHref}>{s.ctaText}</a>
                )}
              </div>
            </article>
          ))}
        </div>
      </div>
      <div className="hero-dots" role="tablist" aria-label="Pindah slide">
        {slides.map((_, i) => (
          <button 
            key={i} 
            role="tab" 
            aria-selected={i === actualIndex} 
            className={`hero-dot ${i === actualIndex ? "active" : ""}`} 
            onClick={() => goToSlide(i + 1)} 
          />
        ))}
      </div>
    </section>
  );
}
