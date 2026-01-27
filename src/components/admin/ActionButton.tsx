"use client";

import Link from "next/link";
import { CSSProperties, ReactNode } from "react";

type ActionType = "detail" | "edit" | "delete";

interface ActionButtonProps {
  type: ActionType;
  href?: string;
  onClick?: () => void;
  disabled?: boolean;
  title?: string;
  size?: number;
}

const iconMap: Record<ActionType, ReactNode> = {
  detail: "🔍",
  edit: "✏️",
  delete: "🗑️",
};

const colorMap: Record<ActionType, string> = {
  detail: "#3B82F6", // blue
  edit: "#D97706",   // amber/brown
  delete: "#DC2626", // red
};

const bgColorMap: Record<ActionType, string> = {
  detail: "rgba(59, 130, 246, 0.15)",
  edit: "rgba(217, 119, 6, 0.15)",
  delete: "rgba(220, 38, 38, 0.15)",
};

const titleMap: Record<ActionType, string> = {
  detail: "Lihat Detail",
  edit: "Edit",
  delete: "Hapus",
};

export default function ActionButton({
  type,
  href,
  onClick,
  disabled = false,
  title,
  size = 32,
}: ActionButtonProps) {
  const buttonStyle: CSSProperties = {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    width: size,
    height: size,
    minWidth: size,
    minHeight: size,
    padding: "4px",
    borderRadius: "8px",
    border: `1px solid ${colorMap[type]}`,
    background: bgColorMap[type],
    color: colorMap[type],
    cursor: disabled ? "not-allowed" : "pointer",
    opacity: disabled ? 0.5 : 1,
    transition: "all 0.2s ease",
    fontSize: "14px",
    textDecoration: "none",
  };

  const hoverStyle = `
    .action-btn-${type}:hover:not(:disabled) {
      opacity: 0.8;
      transform: scale(1.05);
      box-shadow: 0 2px 8px ${colorMap[type]}40;
    }
  `;

  const buttonTitle = title || titleMap[type];
  const icon = iconMap[type];

  // If href is provided, render as Link
  if (href && !disabled) {
    return (
      <>
        <style>{hoverStyle}</style>
        <Link
          href={href}
          className={`action-btn-${type}`}
          style={buttonStyle}
          title={buttonTitle}
        >
          {icon}
        </Link>
      </>
    );
  }

  // Otherwise render as button
  return (
    <>
      <style>{hoverStyle}</style>
      <button
        type="button"
        className={`action-btn-${type}`}
        style={buttonStyle}
        onClick={onClick}
        disabled={disabled}
        title={buttonTitle}
      >
        {icon}
      </button>
    </>
  );
}

// Action button group component for consistent layout
interface ActionButtonGroupProps {
  children: ReactNode;
}

export function ActionButtonGroup({ children }: ActionButtonGroupProps) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: "6px",
        flexWrap: "nowrap",
      }}
    >
      {children}
    </div>
  );
}
