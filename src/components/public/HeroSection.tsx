"use client";

import React from "react";
import "./HeroSection.css";

type HeroProps = {
  title: string;
  breadcrumb?: string[]; 
  description?: React.ReactNode;
};

export default function HeroSection({ title, breadcrumb = [], description }: HeroProps) {
  return (
    <header className="hero-section">
      <div className="hero-overlay" />
      <div className="hero-content">
        {breadcrumb.length > 0 && (
          <nav className="breadcrumb" aria-label="Breadcrumb">
            {breadcrumb.map((b, i) => (
              <span key={i} className={i === breadcrumb.length - 1 ? "crumb active" : "crumb"}>
                {b}
                {i < breadcrumb.length - 1 && <span className="sep">›</span>}
              </span>
            ))}
          </nav>
        )}

        <h1 className="hero-title">{title}</h1>
        {description && <p className="hero-desc">{description}</p>}
      </div>
    </header>
  );
}
