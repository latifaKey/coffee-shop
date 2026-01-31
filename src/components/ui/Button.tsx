import React from 'react';
import { cn } from '@/lib/utils';

// =====================================================
// BUTTON COMPONENT - Menggantikan semua .btn-* classes
// =====================================================
interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'cta' | 'outline' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  children: React.ReactNode;
  asChild?: boolean;
  loading?: boolean;
  icon?: React.ReactNode;
}

export function Button({
  variant = 'primary',
  size = 'md',
  className,
  children,
  loading = false,
  icon,
  disabled,
  ...props
}: ButtonProps) {
  // Base styles - sama untuk semua variant
  const baseStyles = cn(
    "inline-flex items-center justify-center gap-2",
    "font-semibold rounded-xl border border-transparent",
    "cursor-pointer no-underline transition-all duration-300",
    "disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none",
    loading && "opacity-70 cursor-wait"
  );

  // Variant styles - mengikuti design system BARIZTA
  const variantStyles = {
    primary: cn(
      "bg-gradient-to-br from-[#8B4513] to-[#D2B48C]",
      "text-white shadow-[0_8px_25px_rgba(139,69,19,0.25)]",
      "hover:-translate-y-[3px] hover:shadow-[0_12px_35px_rgba(139,69,19,0.35)]",
      "active:translate-y-0 active:shadow-[0_4px_15px_rgba(139,69,19,0.2)]"
    ),
    secondary: cn(
      "bg-[#26201D] text-[#F7F2EE]",
      "border-white/[0.06]",
      "hover:border-[#8B4513] hover:bg-gradient-to-br hover:from-[rgba(139,69,19,0.08)] hover:to-[rgba(212,180,140,0.05)]"
    ),
    ghost: cn(
      "bg-transparent text-[#F7F2EE]",
      "border-white/[0.18]",
      "hover:border-[#8B4513] hover:text-[#D2B48C]"
    ),
    cta: cn(
      "bg-gradient-to-br from-[#8B4513] to-[#D2B48C]",
      "text-white font-bold rounded-full",
      "shadow-[0_10px_30px_rgba(139,69,19,0.3)]",
      "hover:-translate-y-[3px] hover:shadow-[0_15px_40px_rgba(139,69,19,0.4)]"
    ),
    outline: cn(
      "bg-transparent text-[#D2B48C]",
      "border-[2px] border-[#8B4513]",
      "hover:bg-gradient-to-br hover:from-[#8B4513] hover:to-[#D2B48C]",
      "hover:text-white hover:border-transparent"
    ),
    danger: cn(
      "bg-gradient-to-br from-[#EF4444] to-[#DC2626]",
      "text-white shadow-[0_8px_25px_rgba(239,68,68,0.25)]",
      "hover:-translate-y-[3px] hover:shadow-[0_12px_35px_rgba(239,68,68,0.35)]"
    ),
  };

  // Size styles
  const sizeStyles = {
    sm: "px-4 py-2.5 text-sm",
    md: "px-5 py-3 text-base",
    lg: "px-7 py-3.5 text-base",
  };

  return (
    <button
      className={cn(baseStyles, variantStyles[variant], sizeStyles[size], className)}
      disabled={disabled || loading}
      {...props}
    >
      {loading && (
        <svg 
          className="animate-spin h-4 w-4" 
          xmlns="http://www.w3.org/2000/svg" 
          fill="none" 
          viewBox="0 0 24 24"
        >
          <circle 
            className="opacity-25" 
            cx="12" 
            cy="12" 
            r="10" 
            stroke="currentColor" 
            strokeWidth="4"
          />
          <path 
            className="opacity-75" 
            fill="currentColor" 
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
          />
        </svg>
      )}
      {icon && !loading && icon}
      {children}
    </button>
  );
}

// =====================================================
// BUTTON LINK - untuk Link yang terlihat seperti Button
// =====================================================
interface ButtonLinkProps extends React.AnchorHTMLAttributes<HTMLAnchorElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'cta' | 'outline' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  children: React.ReactNode;
  icon?: React.ReactNode;
}

export function ButtonLink({
  variant = 'primary',
  size = 'md',
  className,
  children,
  icon,
  ...props
}: ButtonLinkProps) {
  const baseStyles = cn(
    "inline-flex items-center justify-center gap-2",
    "font-semibold rounded-xl border border-transparent",
    "cursor-pointer no-underline transition-all duration-300"
  );

  const variantStyles = {
    primary: cn(
      "bg-gradient-to-br from-[#8B4513] to-[#D2B48C]",
      "text-white shadow-[0_8px_25px_rgba(139,69,19,0.25)]",
      "hover:-translate-y-[3px] hover:shadow-[0_12px_35px_rgba(139,69,19,0.35)]"
    ),
    secondary: cn(
      "bg-[#26201D] text-[#F7F2EE]",
      "border-white/[0.06]",
      "hover:border-[#8B4513] hover:bg-gradient-to-br hover:from-[rgba(139,69,19,0.08)] hover:to-[rgba(212,180,140,0.05)]"
    ),
    ghost: cn(
      "bg-transparent text-[#F7F2EE]",
      "border-white/[0.18]",
      "hover:border-[#8B4513] hover:text-[#D2B48C]"
    ),
    cta: cn(
      "bg-gradient-to-br from-[#8B4513] to-[#D2B48C]",
      "text-white font-bold rounded-full",
      "shadow-[0_10px_30px_rgba(139,69,19,0.3)]",
      "hover:-translate-y-[3px] hover:shadow-[0_15px_40px_rgba(139,69,19,0.4)]"
    ),
    outline: cn(
      "bg-transparent text-[#D2B48C]",
      "border-[2px] border-[#8B4513]",
      "hover:bg-gradient-to-br hover:from-[#8B4513] hover:to-[#D2B48C]",
      "hover:text-white hover:border-transparent"
    ),
    danger: cn(
      "bg-gradient-to-br from-[#EF4444] to-[#DC2626]",
      "text-white shadow-[0_8px_25px_rgba(239,68,68,0.25)]",
      "hover:-translate-y-[3px] hover:shadow-[0_12px_35px_rgba(239,68,68,0.35)]"
    ),
  };

  const sizeStyles = {
    sm: "px-4 py-2.5 text-sm",
    md: "px-5 py-3 text-base",
    lg: "px-7 py-3.5 text-base",
  };

  return (
    <a
      className={cn(baseStyles, variantStyles[variant], sizeStyles[size], className)}
      {...props}
    >
      {icon && icon}
      {children}
    </a>
  );
}

// =====================================================
// ICON BUTTON - Button dengan icon only, tanpa text
// =====================================================
interface IconButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  icon: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  ariaLabel: string;
}

export function IconButton({
  icon,
  variant = 'ghost',
  size = 'md',
  className,
  ariaLabel,
  ...props
}: IconButtonProps) {
  const baseStyles = cn(
    "inline-flex items-center justify-center",
    "font-semibold rounded-xl border border-transparent",
    "cursor-pointer transition-all duration-300",
    "disabled:opacity-50 disabled:cursor-not-allowed"
  );

  const variantStyles = {
    primary: cn(
      "bg-gradient-to-br from-[#8B4513] to-[#D2B48C]",
      "text-white shadow-[0_8px_25px_rgba(139,69,19,0.25)]",
      "hover:-translate-y-[3px] hover:shadow-[0_12px_35px_rgba(139,69,19,0.35)]"
    ),
    secondary: cn(
      "bg-[#26201D] text-[#F7F2EE]",
      "border-white/[0.06]",
      "hover:border-[#8B4513]"
    ),
    ghost: cn(
      "bg-transparent text-[#F7F2EE]",
      "border-white/[0.18]",
      "hover:border-[#8B4513] hover:text-[#D2B48C]"
    ),
    danger: cn(
      "bg-gradient-to-br from-[#EF4444] to-[#DC2626]",
      "text-white shadow-[0_8px_25px_rgba(239,68,68,0.25)]",
      "hover:-translate-y-[3px] hover:shadow-[0_12px_35px_rgba(239,68,68,0.35)]"
    ),
  };

  const sizeStyles = {
    sm: "w-8 h-8 text-sm",
    md: "w-10 h-10 text-base",
    lg: "w-12 h-12 text-lg",
  };

  return (
    <button
      className={cn(baseStyles, variantStyles[variant], sizeStyles[size], className)}
      aria-label={ariaLabel}
      {...props}
    >
      {icon}
    </button>
  );
}

// =====================================================
// BUTTON GROUP - untuk group multiple buttons
// =====================================================
interface ButtonGroupProps {
  children: React.ReactNode;
  className?: string;
  orientation?: 'horizontal' | 'vertical';
}

export function ButtonGroup({ 
  children, 
  className,
  orientation = 'horizontal' 
}: ButtonGroupProps) {
  return (
    <div 
      className={cn(
        "inline-flex gap-2",
        orientation === 'vertical' && "flex-col",
        className
      )}
    >
      {children}
    </div>
  );
}
