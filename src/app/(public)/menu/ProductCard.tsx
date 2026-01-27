"use client";

import Image from "next/image";
import { useMemo } from "react";
import { useLanguage } from "@/context/LanguageContext";

// Helper to normalize image path
const normalizeImagePath = (imagePath: string | null | undefined): string => {
  if (!imagePath || imagePath.trim() === "") {
    return "/images/default-product.jpg";
  }
  if (imagePath.startsWith("/")) {
    return imagePath;
  }
  return `/uploads/${imagePath}`;
};

export type Category = {
  id: number;
  name: string;
  slug: string;
  type: "MINUMAN" | "MAKANAN";
  imageFolder: string | null;
};

export type Product = {
  id: number;
  name: string;
  slug: string;
  description?: string | null;
  price: number; // in Rupiah
  categoryId: number | null;
  category?: Category | null;
  image: string;
  isAvailable: boolean;
};

type ProductCardProps = {
  p: Product;
  onDetailClick?: (product: Product) => void;
  priority?: boolean; // For LCP optimization - first 3 images
};

export default function ProductCard({ p, onDetailClick, priority = false }: ProductCardProps) {
  const { lang, t } = useLanguage();
  const menuCopy = t.publicPages.menu;
  const formatter = useMemo(() => new Intl.NumberFormat(lang === "id" ? "id-ID" : "en-US", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }), [lang]);

  return (
    <article className="product-card">
      <div className="product-card__image">
        <Image 
          src={normalizeImagePath(p.image)} 
          alt={p.name} 
          fill 
          style={{ objectFit: "cover" }} 
          sizes="(max-width: 768px) 100vw, 33vw"
          priority={priority} // First 3 images load immediately
          loading={priority ? undefined : "lazy"} // Rest load lazily
          quality={85} // Balanced quality/size
        />
        {!p.isAvailable && (
          <span className="product-card__badge">{menuCopy.productCard.soldOut}</span>
        )}
      </div>
      <div className="product-card__body">
        <h3 className="product-card__title">{p.name}</h3>
        {p.description && (
          <p className="product-card__desc">{p.description}</p>
        )}
      </div>
      <div className="product-card__footer">
        <span className="product-card__price">{formatter.format(p.price)}</span>
        <button 
          type="button"
          className="btn-barizta btn-barizta-sm"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            if (onDetailClick) {
              onDetailClick(p);
            }
          }}
          
        >
          {menuCopy.productCard.detail}
        </button>
      </div>
    </article>
  );
}
