"use client";

import "./LoadingSpinner.css";

interface LoadingSpinnerProps {
  /** Teks yang ditampilkan di bawah spinner */
  text?: string;
  /** Ukuran spinner: sm, md, lg */
  size?: "sm" | "md" | "lg";
  /** Tampilkan fullscreen overlay */
  fullscreen?: boolean;
  /** Warna tema: dark (default), light */
  theme?: "dark" | "light";
}

function LoadingSpinner({
  text = "Memuat...",
  size = "md",
  fullscreen = false,
  theme = "dark",
}: LoadingSpinnerProps) {
  const sizeClass = `loading-${size}`;
  const themeClass = `loading-${theme}`;

  if (fullscreen) {
    return (
      <div className={`loading-overlay ${themeClass}`}>
        <div className="loading-content">
          <div className={`loading-spinner ${sizeClass}`}>
            <span className="coffee-icon">☕</span>
          </div>
          {text && <p className="loading-text">{text}</p>}
        </div>
      </div>
    );
  }

  return (
    <div className={`loading-container ${themeClass}`}>
      <div className={`loading-spinner ${sizeClass}`}>
        <span className="coffee-icon">☕</span>
      </div>
      {text && <p className="loading-text">{text}</p>}
    </div>
  );
}

// Export juga versi inline untuk button loading
function ButtonLoader({ size = "sm" }: { size?: "sm" | "md" }) {
  return (
    <span className={`button-loader ${size === "sm" ? "loader-sm" : "loader-md"}`}>
      <span className="coffee-icon-inline">☕</span>
    </span>
  );
}

// Page loading wrapper
function PageLoading({ text = "Memuat halaman..." }: { text?: string }) {
  return (
    <div className="page-loading">
      <div className="loading-content">
        <div className="loading-spinner loading-lg">
          <span className="coffee-icon">☕</span>
        </div>
        <p className="loading-text">{text}</p>
      </div>
    </div>
  );
}

// Named exports untuk import { LoadingSpinner } from ...
export { LoadingSpinner, ButtonLoader, PageLoading };

// Default export untuk import LoadingSpinner from ...
export default LoadingSpinner;
