import React from 'react';
import { cn } from '@/lib/utils';

// =====================================================
// ALERT - Consistent alert messages
// =====================================================
interface AlertProps {
  type: 'success' | 'error' | 'warning' | 'info';
  message: string;
  onClose?: () => void;
  className?: string;
}

export function Alert({ type, message, onClose, className }: AlertProps) {
  const styles = {
    success: {
      bg: 'bg-green-500/10',
      border: 'border-green-500/30',
      text: 'text-green-400',
      icon: '✅'
    },
    error: {
      bg: 'bg-red-500/10',
      border: 'border-red-500/30',
      text: 'text-red-400',
      icon: '❌'
    },
    warning: {
      bg: 'bg-orange-500/10',
      border: 'border-orange-500/30',
      text: 'text-orange-400',
      icon: '⚠️'
    },
    info: {
      bg: 'bg-blue-500/10',
      border: 'border-blue-500/30',
      text: 'text-blue-400',
      icon: 'ℹ️'
    }
  };

  const style = styles[type];

  return (
    <div
      className={cn(
        "flex items-center gap-3 px-4 py-3 rounded-lg border",
        style.bg,
        style.border,
        style.text,
        "animate-in slide-in-from-top-2 duration-300",
        className
      )}
    >
      <span className="text-lg flex-shrink-0">{style.icon}</span>
      <p className="flex-1 text-sm font-medium">{message}</p>
      {onClose && (
        <button
          onClick={onClose}
          className="text-lg hover:opacity-70 transition-opacity flex-shrink-0"
          aria-label="Close alert"
        >
          ×
        </button>
      )}
    </div>
  );
}

// =====================================================
// LOADING SPINNER - Consistent loading indicator
// =====================================================
interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  text?: string;
  className?: string;
}

export function LoadingSpinner({ 
  size = 'md', 
  text, 
  className 
}: LoadingSpinnerProps) {
  const sizes = {
    sm: 'h-6 w-6',
    md: 'h-12 w-12',
    lg: 'h-16 w-16'
  };

  return (
    <div className={cn("flex flex-col items-center justify-center gap-3", className)}>
      <div
        className={cn(
          "animate-spin rounded-full border-b-2 border-[#D4A574]",
          sizes[size]
        )}
      />
      {text && (
        <p className="text-sm text-[#B6B3AC] animate-pulse">{text}</p>
      )}
    </div>
  );
}

// =====================================================
// EMPTY STATE - Consistent empty data display
// =====================================================
interface EmptyStateProps {
  icon?: string;
  title: string;
  description?: string;
  action?: {
    label: string;
    onClick: () => void;
  };
  className?: string;
}

export function EmptyState({ 
  icon = '📭', 
  title, 
  description, 
  action, 
  className 
}: EmptyStateProps) {
  return (
    <div className={cn("flex flex-col items-center justify-center py-12 px-4 text-center", className)}>
      <span className="text-6xl mb-4">{icon}</span>
      <h3 className="text-lg font-semibold text-[#F7F2EE] mb-2">{title}</h3>
      {description && (
        <p className="text-sm text-[#B6B3AC] mb-6 max-w-md">{description}</p>
      )}
      {action && (
        <button
          onClick={action.onClick}
          className="px-5 py-2.5 rounded-lg bg-gradient-to-br from-[#8B4513] to-[#D2B48C] text-white font-medium hover:-translate-y-0.5 transition-transform"
        >
          {action.label}
        </button>
      )}
    </div>
  );
}

// =====================================================
// MODAL - Consistent modal container
// =====================================================
interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}

export function Modal({ 
  isOpen, 
  onClose, 
  title, 
  children, 
  footer,
  size = 'md',
  className 
}: ModalProps) {
  const sizes = {
    sm: 'max-w-md',
    md: 'max-w-2xl',
    lg: 'max-w-4xl',
    xl: 'max-w-6xl'
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className={cn(
          "relative w-full mx-4 bg-gradient-to-b from-[#26201D] to-[#1D1714] rounded-2xl shadow-2xl border border-white/[0.08]",
          "animate-in zoom-in-95 duration-200",
          sizes[size],
          className
        )}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/[0.08]">
          <h2 className="text-xl font-bold text-[#D4A574]">{title}</h2>
          <button
            onClick={onClose}
            className="text-2xl text-[#B6B3AC] hover:text-[#F7F2EE] transition-colors"
            aria-label="Close modal"
          >
            ×
          </button>
        </div>

        {/* Body */}
        <div className="px-6 py-4 max-h-[70vh] overflow-y-auto">
          {children}
        </div>

        {/* Footer */}
        {footer && (
          <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-white/[0.08]">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
}

// =====================================================
// TABS - Consistent tab navigation
// =====================================================
interface Tab {
  key: string;
  label: string;
  icon?: string;
  count?: number;
}

interface TabsProps {
  tabs: Tab[];
  activeTab: string;
  onChange: (key: string) => void;
  className?: string;
}

export function Tabs({ tabs, activeTab, onChange, className }: TabsProps) {
  return (
    <div className={cn("flex gap-2 border-b border-white/[0.08]", className)}>
      {tabs.map((tab) => (
        <button
          key={tab.key}
          onClick={() => onChange(tab.key)}
          className={cn(
            "flex items-center gap-2 px-4 py-3 font-medium transition-all duration-200 border-b-2 -mb-px",
            activeTab === tab.key
              ? "text-[#D4A574] border-[#8B4513]"
              : "text-[#B6B3AC] border-transparent hover:text-[#F7F2EE] hover:border-white/[0.08]"
          )}
        >
          {tab.icon && <span>{tab.icon}</span>}
          <span>{tab.label}</span>
          {typeof tab.count === 'number' && (
            <span className={cn(
              "px-2 py-0.5 text-xs rounded-full",
              activeTab === tab.key
                ? "bg-[#8B4513]/20 text-[#D4A574]"
                : "bg-white/[0.05] text-[#B6B3AC]"
            )}>
              {tab.count}
            </span>
          )}
        </button>
      ))}
    </div>
  );
}

// =====================================================
// SEARCH BAR - Consistent search input
// =====================================================
interface SearchBarProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
}

export function SearchBar({ 
  value, 
  onChange, 
  placeholder = "Cari...",
  className 
}: SearchBarProps) {
  return (
    <div className={cn("relative", className)}>
      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[#B6B3AC]">
        🔍
      </span>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full pl-10 pr-4 py-2.5 rounded-lg bg-white/[0.04] border border-white/[0.14] text-[#F7F2EE] placeholder:text-[#B6B3AC] focus:border-[#8B4513] focus:outline-none transition-colors"
      />
      {value && (
        <button
          onClick={() => onChange('')}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-[#B6B3AC] hover:text-[#F7F2EE]"
        >
          ×
        </button>
      )}
    </div>
  );
}

// =====================================================
// FILTER SELECT - Consistent filter dropdown
// =====================================================
interface FilterSelectProps {
  value: string;
  onChange: (value: string) => void;
  options: Array<{ value: string; label: string }>;
  placeholder?: string;
  className?: string;
}

export function FilterSelect({ 
  value, 
  onChange, 
  options, 
  placeholder = "Filter",
  className 
}: FilterSelectProps) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className={cn(
        "px-4 py-2.5 rounded-lg bg-white/[0.04] border border-white/[0.14] text-[#F7F2EE]",
        "focus:border-[#8B4513] focus:outline-none cursor-pointer transition-colors",
        className
      )}
    >
      <option value="">{placeholder}</option>
      {options.map((option) => (
        <option key={option.value} value={option.value} className="bg-[#1D1714]">
          {option.label}
        </option>
      ))}
    </select>
  );
}
