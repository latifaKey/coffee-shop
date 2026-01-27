"use client";

import { useState, useEffect, useCallback } from "react";

interface Toast {
  id: string;
  message: string;
  type: "success" | "error" | "info" | "warning";
}

interface ToastEvent extends CustomEvent {
  detail: { message: string; type: Toast["type"] };
}

export default function ToastContainer() {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const addToast = useCallback((message: string, type: Toast["type"] = "info") => {
    const id = `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  }, []);

  useEffect(() => {
    const handler = (e: Event) => {
      const evt = e as ToastEvent;
      addToast(evt.detail.message, evt.detail.type);
    };
    window.addEventListener("show-toast", handler);
    return () => window.removeEventListener("show-toast", handler);
  }, [addToast]);

  if (toasts.length === 0) return null;

  return (
    <div
      style={{
        position: "fixed",
        top: 16,
        right: 16,
        zIndex: 9999,
        display: "flex",
        flexDirection: "column",
        gap: 8,
        pointerEvents: "none",
      }}
    >
      {toasts.map((t) => (
        <div
          key={t.id}
          style={{
            padding: "12px 20px",
            borderRadius: 8,
            color: "#fff",
            fontWeight: 500,
            boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
            pointerEvents: "auto",
            background:
              t.type === "success"
                ? "#22c55e"
                : t.type === "error"
                ? "#ef4444"
                : t.type === "warning"
                ? "#f59e0b"
                : "#3b82f6",
          }}
        >
          {t.message}
        </div>
      ))}
    </div>
  );
}

// Helper to show toast from anywhere
export function showToast(message: string, type: Toast["type"] = "info") {
  if (typeof window !== "undefined") {
    window.dispatchEvent(new CustomEvent("show-toast", { detail: { message, type } }));
  }
}
