import React from 'react';
import { cn } from '@/lib/utils';

// =====================================================
// BADGE COMPONENT - Menggantikan badge/tag styles
// =====================================================
interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: 'default' | 'primary' | 'success' | 'warning' | 'danger' | 'info' | 'published' | 'draft' | 'pending' | 'approved' | 'rejected';
  size?: 'sm' | 'md' | 'lg';
  children: React.ReactNode;
  dot?: boolean;
}

export function Badge({
  variant = 'default',
  size = 'md',
  className,
  children,
  dot = false,
  ...props
}: BadgeProps) {
  const baseStyles = cn(
    "inline-flex items-center justify-center gap-1.5",
    "font-semibold rounded-full border whitespace-nowrap",
    "transition-all duration-200"
  );

  // Variant styles - mengikuti design system BARIZTA
  const variantStyles = {
    default: cn(
      "bg-white/[0.08] text-[#F7F2EE]",
      "border-white/[0.18]"
    ),
    primary: cn(
      "bg-[rgba(139,69,19,0.14)] text-[#D2B48C]",
      "border-[rgba(139,69,19,0.35)]"
    ),
    success: cn(
      "bg-green-500/20 text-green-400",
      "border-green-500/30"
    ),
    warning: cn(
      "bg-orange-500/20 text-orange-400",
      "border-orange-500/30"
    ),
    danger: cn(
      "bg-red-500/20 text-red-400",
      "border-red-500/30"
    ),
    info: cn(
      "bg-blue-500/20 text-blue-400",
      "border-blue-500/30"
    ),
    published: cn(
      "bg-green-500/20 text-green-400",
      "border-green-500/30"
    ),
    draft: cn(
      "bg-gray-500/20 text-gray-400",
      "border-gray-500/30"
    ),
    pending: cn(
      "bg-orange-500/20 text-orange-400",
      "border-orange-500/30"
    ),
    approved: cn(
      "bg-green-500/20 text-green-400",
      "border-green-500/30"
    ),
    rejected: cn(
      "bg-red-500/20 text-red-400",
      "border-red-500/30"
    ),
  };

  // Size styles
  const sizeStyles = {
    sm: "px-2 py-0.5 text-[10px]",
    md: "px-2.5 py-1 text-xs",
    lg: "px-3 py-1.5 text-sm",
  };

  return (
    <span
      className={cn(baseStyles, variantStyles[variant], sizeStyles[size], className)}
      {...props}
    >
      {dot && (
        <span 
          className={cn(
            "w-1.5 h-1.5 rounded-full",
            variant === 'success' && "bg-green-400",
            variant === 'warning' && "bg-orange-400",
            variant === 'danger' && "bg-red-400",
            variant === 'info' && "bg-blue-400",
            variant === 'primary' && "bg-[#8B4513]",
            variant === 'published' && "bg-green-400",
            variant === 'draft' && "bg-gray-400",
            variant === 'pending' && "bg-orange-400",
            variant === 'approved' && "bg-green-400",
            variant === 'rejected' && "bg-red-400",
            variant === 'default' && "bg-[#F7F2EE]",
          )}
        />
      )}
      {children}
    </span>
  );
}

// =====================================================
// STATUS BADGE - untuk status dengan warna spesifik
// =====================================================
interface StatusBadgeProps {
  status: 'active' | 'inactive' | 'scheduled' | 'cancelled' | 'completed' | 'pending' | 'approved' | 'rejected' | 'published' | 'draft';
  className?: string;
}

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const statusConfig = {
    active: { label: 'Aktif', variant: 'success' as const },
    inactive: { label: 'Tidak Aktif', variant: 'default' as const },
    scheduled: { label: 'Terjadwal', variant: 'info' as const },
    cancelled: { label: 'Dibatalkan', variant: 'danger' as const },
    completed: { label: 'Selesai', variant: 'success' as const },
    pending: { label: 'Menunggu', variant: 'warning' as const },
    approved: { label: 'Disetujui', variant: 'approved' as const },
    rejected: { label: 'Ditolak', variant: 'rejected' as const },
    published: { label: 'Dipublikasi', variant: 'published' as const },
    draft: { label: 'Draft', variant: 'draft' as const },
  };

  const config = statusConfig[status];

  return (
    <Badge variant={config.variant} dot className={className}>
      {config.label}
    </Badge>
  );
}

// =====================================================
// HERO BADGE - badge khusus untuk hero section
// =====================================================
interface HeroBadgeProps {
  children: React.ReactNode;
  className?: string;
}

export function HeroBadge({ children, className }: HeroBadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-2 px-2.5 py-1.5 rounded-full",
        "bg-[rgba(139,69,19,0.14)] text-[#D2B48C]",
        "border border-[rgba(139,69,19,0.35)]",
        "font-semibold text-xs tracking-wider uppercase",
        className
      )}
    >
      {children}
    </span>
  );
}

// =====================================================
// TAG - untuk product/content tags
// =====================================================
interface TagProps extends React.HTMLAttributes<HTMLSpanElement> {
  children: React.ReactNode;
  variant?: 'light' | 'dark';
  removable?: boolean;
  onRemove?: () => void;
}

export function Tag({ 
  children, 
  variant = 'light',
  removable = false,
  onRemove,
  className,
  ...props 
}: TagProps) {
  const variantStyles = {
    light: cn(
      "bg-white/[0.92] text-[rgba(45,33,27,0.85)]",
      "shadow-[0_8px_16px_rgba(0,0,0,0.22)]"
    ),
    dark: cn(
      "bg-[#26201D] text-[#F7F2EE]",
      "border border-white/[0.12]"
    ),
  };

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 px-3 py-1",
        "rounded-full text-xs font-medium",
        "transition-all duration-200",
        variantStyles[variant],
        removable && "pr-1.5",
        className
      )}
      {...props}
    >
      {children}
      {removable && (
        <button
          onClick={onRemove}
          className="ml-1 w-4 h-4 rounded-full hover:bg-black/10 flex items-center justify-center transition-colors"
          aria-label="Remove tag"
        >
          ×
        </button>
      )}
    </span>
  );
}

// =====================================================
// NOTIFICATION BADGE - badge untuk notification count
// =====================================================
interface NotificationBadgeProps {
  count: number;
  max?: number;
  className?: string;
}

export function NotificationBadge({ 
  count, 
  max = 99,
  className 
}: NotificationBadgeProps) {
  const displayCount = count > max ? `${max}+` : count;
  
  if (count === 0) return null;

  return (
    <span
      className={cn(
        "absolute -top-1 -right-1",
        "min-w-[18px] h-[18px] px-1",
        "flex items-center justify-center",
        "bg-gradient-to-br from-[#EF4444] to-[#DC2626]",
        "text-white text-[10px] font-bold",
        "rounded-full border-2 border-[#1D1714]",
        "shadow-[0_2px_8px_rgba(239,68,68,0.4)]",
        className
      )}
    >
      {displayCount}
    </span>
  );
}

// =====================================================
// CATEGORY BADGE - untuk kategori produk/konten
// =====================================================
interface CategoryBadgeProps {
  category: string;
  icon?: string;
  className?: string;
}

export function CategoryBadge({ category, icon, className }: CategoryBadgeProps) {
  return (
    <Badge variant="primary" size="sm" className={className}>
      {icon && <span>{icon}</span>}
      {category}
    </Badge>
  );
}
