"use client";

import "./menu-skeleton.css";

/**
 * Loading skeleton for menu page
 * Shows placeholder cards while data is loading
 */
export default function MenuSkeleton() {
  return (
    <div className="menu-page">
      {/* Sidebar Skeleton */}
      <div className="menu-sidebar">
        <div className="filter-card">
          <div className="skeleton skeleton-title"></div>
          <div className="skeleton skeleton-text"></div>
          <div className="skeleton skeleton-input"></div>
        </div>

        <div className="filter-card">
          <div className="skeleton skeleton-title"></div>
          <div className="skeleton skeleton-text"></div>
          <div className="skeleton-checkboxes">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="skeleton skeleton-checkbox"></div>
            ))}
          </div>
        </div>
      </div>

      {/* Content Skeleton */}
      <div className="menu-content">
        <div className="menu-top">
          <div className="skeleton skeleton-text" style={{ width: "120px" }}></div>
          <div className="skeleton skeleton-select" style={{ width: "150px" }}></div>
        </div>

        {/* Grid Skeleton */}
        <div className="menu-grid">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="product-card-skeleton">
              <div className="skeleton skeleton-image"></div>
              <div className="skeleton skeleton-title"></div>
              <div className="skeleton skeleton-text"></div>
              <div className="skeleton skeleton-text" style={{ width: "80%" }}></div>
              <div className="product-card-skeleton__footer">
                <div className="skeleton skeleton-price"></div>
                <div className="skeleton skeleton-button"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
