"use client";

import { useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";
import Image from "next/image";
import { Product } from "./ProductCard";
import "./ProductModal.css";
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

type ProductModalProps = {
  product: Product;
  onClose: () => void;
};

export default function ProductModal({ product, onClose }: ProductModalProps) {
  const { lang, t } = useLanguage();
  const menuCopy = t.publicPages.menu;
  const formatter = useMemo(() => new Intl.NumberFormat(lang === "id" ? "id-ID" : "en-US", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }), [lang]);
  const [portalContainer, setPortalContainer] = useState<HTMLElement | null>(null);
  const categoryName = product.category?.name || menuCopy.current;
  
  // Create portal container on mount
  useEffect(() => {
    // Create a div for portal
    const container = document.createElement('div');
    container.id = 'modal-portal';
    document.body.appendChild(container);
    setPortalContainer(container);
    
    // Prevent body scroll
    document.body.style.overflow = 'hidden';
    
    return () => {
      document.body.style.overflow = '';
      if (container.parentNode) {
        container.parentNode.removeChild(container);
      }
    };
  }, []);
  
  // Handle escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleEscape);
    return () => window.removeEventListener('keydown', handleEscape);
  }, [onClose]);
  
  const handleOrder = () => {
    const waNumber = "6281368236245";
    
    const formattedPrice = formatter.format(product.price);
    const message = encodeURIComponent(
      menuCopy.productModal.whatsappMessage(product.name, formattedPrice, categoryName)
    );
    
    window.open(`https://wa.me/${waNumber}?text=${message}`, "_blank");
  };

  const modalContent = (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close" onClick={onClose} aria-label={menuCopy.productModal.closeAria}>
          ✕
        </button>

        <div className="modal-body">
          <div className="modal-image">
            <Image
              src={normalizeImagePath(product.image)}
              alt={product.name}
              width={400}
              height={400}
              style={{ width: "100%", height: "auto", borderRadius: "12px" }}
              unoptimized
            />
          </div>

          <div className="modal-info">
            <span className="modal-category">{categoryName.toUpperCase()}</span>
            <h2 className="modal-title">{product.name}</h2>
            <p className="modal-description">
              {product.description || menuCopy.productModal.fallbackDescription}
            </p>
            <div className="modal-price">{formatter.format(product.price)}</div>
            
            {product.isAvailable ? (
              <button className="btn-barizta" onClick={handleOrder}>
                {menuCopy.productModal.orderButton}
              </button>
            ) : (
              <button className="btn-barizta" disabled>
                {menuCopy.productModal.unavailableButton}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );

  // Render using portal to body
  if (!portalContainer) {
    return null;
  }
  
  return createPortal(modalContent, portalContainer);
}
