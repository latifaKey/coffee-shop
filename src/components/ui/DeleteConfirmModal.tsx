"use client";

import React, { useEffect, useCallback, useRef } from "react";
import "./DeleteConfirmModal.css";

interface DeleteConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  itemName: string;
  itemType?: string; // e.g., "kelas", "produk", "berita", etc.
  isLoading?: boolean;
  title?: string;
  warningText?: string;
  confirmButtonText?: string;
  cancelButtonText?: string;
}

export default function DeleteConfirmModal({
  isOpen,
  onClose,
  onConfirm,
  itemName,
  itemType = "item",
  isLoading = false,
  title = "Konfirmasi Hapus",
  warningText = "Tindakan ini tidak dapat dibatalkan!",
  confirmButtonText = "Hapus",
  cancelButtonText = "Batal",
}: DeleteConfirmModalProps) {
  const modalRef = useRef<HTMLDivElement>(null);
  const cancelButtonRef = useRef<HTMLButtonElement>(null);
  const confirmButtonRef = useRef<HTMLButtonElement>(null);

  // Handle escape key
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
      // Focus on cancel button when modal opens
      setTimeout(() => cancelButtonRef.current?.focus(), 100);
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

  return (
    <div 
      className="delete-confirm-overlay" 
      onClick={handleOverlayClick}
      role="dialog"
      aria-modal="true"
      aria-labelledby="delete-modal-title"
    >
      <div 
        ref={modalRef}
        className="delete-confirm-modal"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="delete-confirm-header">
          <h2 id="delete-modal-title">{title}</h2>
          <button 
            className="delete-confirm-close" 
            onClick={onClose}
            disabled={isLoading}
            aria-label="Tutup modal"
            tabIndex={0}
          >
            ×
          </button>
        </div>

        {/* Body */}
        <div className="delete-confirm-body">
          <p className="delete-confirm-message">
            Apakah Anda yakin ingin menghapus {itemType}{" "}
            <strong>{itemName}</strong>?
          </p>
          <p className="delete-confirm-warning">
            <span className="warning-icon">⚠️</span>
            {warningText}
          </p>
        </div>

        {/* Actions */}
        <div className="delete-confirm-actions">
          <button
            ref={cancelButtonRef}
            className="btn-secondary-barizta"
            onClick={onClose}
            disabled={isLoading}
            tabIndex={0}
          >
            {cancelButtonText}
          </button>
          <button
            ref={confirmButtonRef}
            className="btn-danger-barizta"
            onClick={handleConfirm}
            disabled={isLoading}
            tabIndex={0}
          >
            {isLoading ? (
              <>
                <span className="delete-spinner"></span>
                Memproses...
              </>
            ) : (
              confirmButtonText
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
