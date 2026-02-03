"use client";

import React, { memo, useEffect, useCallback, useRef } from "react";
import "./LogoutModal.css";

interface LogoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  isLoading?: boolean;
  userType?: "admin" | "member";
}

/**
 * Reusable Logout Confirmation Modal
 * Konsisten untuk Admin dan Member dengan styling yang sama
 */
const LogoutModal = memo(function LogoutModal({
  isOpen,
  onClose,
  onConfirm,
  isLoading = false,
  userType = "member",
}: LogoutModalProps) {
  const modalRef = useRef<HTMLDivElement>(null);
  const cancelButtonRef = useRef<HTMLButtonElement>(null);

  // Handle escape key press
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === "Escape" && !isLoading) {
        onClose();
      }
      
      // Trap focus within modal
      if (e.key === "Tab" && modalRef.current) {
        const focusableElements = modalRef.current.querySelectorAll(
          'button:not([disabled]), [tabindex]:not([tabindex="-1"])'
        );
        const firstElement = focusableElements[0] as HTMLElement;
        const lastElement = focusableElements[focusableElements.length - 1] as HTMLElement;

        if (e.shiftKey && document.activeElement === firstElement) {
          e.preventDefault();
          lastElement?.focus();
        } else if (!e.shiftKey && document.activeElement === lastElement) {
          e.preventDefault();
          firstElement?.focus();
        }
      }
    },
    [isLoading, onClose]
  );

  useEffect(() => {
    if (isOpen) {
      document.addEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "hidden";
      // Focus on cancel button when modal opens for safety
      requestAnimationFrame(() => {
        cancelButtonRef.current?.focus();
      });
    }

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "";
    };
  }, [isOpen, handleKeyDown]);

  if (!isOpen) return null;

  const handleOverlayClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget && !isLoading) {
      onClose();
    }
  };

  const handleConfirm = () => {
    if (!isLoading) {
      onConfirm();
    }
  };

  const title = userType === "admin" ? "Logout Admin" : "Logout Member";
  const message = userType === "admin" 
    ? "Apakah Anda yakin ingin keluar dari dashboard admin?"
    : "Apakah Anda yakin ingin keluar? Anda perlu login kembali untuk mengakses halaman member.";

  return (
    <div 
      className="logout-modal-overlay" 
      onClick={handleOverlayClick}
      role="dialog"
      aria-modal="true"
      aria-labelledby="logout-modal-title"
    >
      <div 
        ref={modalRef}
        className="logout-modal"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Icon */}
        <div className="logout-modal-icon">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4" />
            <polyline points="16,17 21,12 16,7" />
            <line x1="21" y1="12" x2="9" y2="12" />
          </svg>
        </div>

        {/* Header */}
        <h2 id="logout-modal-title" className="logout-modal-title">{title}</h2>

        {/* Body */}
        <p className="logout-modal-message">{message}</p>

        {/* Actions */}
        <div className="logout-modal-actions">
          <button
            ref={cancelButtonRef}
            className="logout-modal-btn logout-modal-btn-cancel"
            onClick={onClose}
            disabled={isLoading}
            type="button"
          >
            Batal
          </button>
          <button
            className="logout-modal-btn logout-modal-btn-confirm"
            onClick={handleConfirm}
            disabled={isLoading}
            type="button"
          >
            {isLoading ? (
              <>
                <span className="logout-spinner" />
                Keluar...
              </>
            ) : (
              "Ya, Keluar"
            )}
          </button>
        </div>
      </div>
    </div>
  );
});

export default LogoutModal;
