import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { cn } from '@/lib/utils';

// =====================================================
// BASE CARD COMPONENT
// =====================================================
interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  hover?: boolean;
  variant?: 'default' | 'glass' | 'gradient';
}

export function Card({ 
  children, 
  className, 
  hover = true,
  variant = 'default',
  ...props 
}: CardProps) {
  const baseStyles = "rounded-2xl border transition-all duration-300";
  
  const variantStyles = {
    default: "bg-gradient-to-b from-white/[0.02] to-transparent border-white/[0.08]",
    glass: "backdrop-blur-sm bg-white/[0.06] border-white/[0.12]",
    gradient: "bg-gradient-to-br from-[#26201D] to-[#1D1714] border-white/[0.06]",
  };
  
  const hoverStyles = hover 
    ? "hover:-translate-y-1 hover:shadow-[0_10px_30px_rgba(0,0,0,0.35)] hover:border-white/[0.18]" 
    : "";

  return (
    <div 
      className={cn(baseStyles, variantStyles[variant], hoverStyles, className)}
      {...props}
    >
      {children}
    </div>
  );
}

// =====================================================
// STAT CARD - untuk dashboard statistics
// =====================================================
interface StatCardProps {
  icon: string;
  label: string;
  value: number | string;
  variant?: 'default' | 'warning' | 'info' | 'success' | 'pending' | 'ongoing' | 'completed';
  href?: string;
  className?: string;
}

export function StatCard({ 
  icon, 
  label, 
  value, 
  variant = 'default',
  href,
  className 
}: StatCardProps) {
  const variantBorderStyles = {
    default: "",
    warning: "border-l-[#FF9800] border-l-[3px]",
    info: "border-l-[#4A90E2] border-l-[3px]",
    success: "border-l-[#4CAF50] border-l-[3px]",
    pending: "border-l-[#FF9800] border-l-[3px]",
    ongoing: "border-l-[#4A90E2] border-l-[3px]",
    completed: "border-l-[#4CAF50] border-l-[3px]",
  };

  const content = (
    <Card 
      className={cn(
        "p-5 flex items-center gap-4 no-underline",
        variantBorderStyles[variant],
        className
      )}
    >
      <div className="text-[1.75rem]">{icon}</div>
      <div className="flex flex-col">
        <span className="text-2xl font-bold text-[#D4A574]">{value}</span>
        <span className="text-[0.8rem] text-[#B6B3AC]">{label}</span>
      </div>
    </Card>
  );

  if (href) {
    return <Link href={href}>{content}</Link>;
  }

  return content;
}

// =====================================================
// ACTION CARD - untuk quick actions menu
// =====================================================
interface ActionCardProps {
  icon: string;
  label: string;
  href: string;
  className?: string;
}

export function ActionCard({ icon, label, href, className }: ActionCardProps) {
  return (
    <Link href={href}>
      <Card 
        className={cn(
          "p-6 flex flex-col items-center gap-3 text-center no-underline group",
          "relative overflow-hidden",
          className
        )}
      >
        {/* Gradient overlay on hover */}
        <div className="absolute inset-0 bg-gradient-to-br from-[#8B4513]/[0.08] to-[#D2B48C]/[0.05] opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        
        <span className="text-3xl relative z-10 group-hover:scale-110 transition-transform duration-300">
          {icon}
        </span>
        <span className="text-sm font-medium relative z-10 text-[#F7F2EE]">
          {label}
        </span>
      </Card>
    </Link>
  );
}

// =====================================================
// INFO CARD - untuk tips & informasi
// =====================================================
interface InfoCardProps {
  icon: string;
  title: string;
  description: string;
  className?: string;
}

export function InfoCard({ icon, title, description, className }: InfoCardProps) {
  return (
    <Card 
      hover={false}
      className={cn(
        "p-5 flex items-start gap-4 border-dashed border-white/[0.1]",
        className
      )}
    >
      <span className="text-3xl flex-shrink-0">{icon}</span>
      <div className="flex flex-col gap-1">
        <h4 className="font-semibold text-base m-0">{title}</h4>
        <p className="text-sm text-[#B6B3AC] m-0">{description}</p>
      </div>
    </Card>
  );
}

// =====================================================
// ACTIVITY CARD - untuk recent activities
// =====================================================
interface ActivityItem {
  id: number;
  title: string;
  subtitle: string;
  isUnread?: boolean;
  badge?: {
    text: string;
    variant: 'published' | 'draft' | 'pending';
  };
}

interface ActivityCardProps {
  title: string;
  icon: string;
  items: ActivityItem[];
  viewAllHref: string;
  emptyMessage?: string;
  className?: string;
}

export function ActivityCard({ 
  title, 
  icon, 
  items, 
  viewAllHref, 
  emptyMessage = "Tidak ada data",
  className 
}: ActivityCardProps) {
  const badgeStyles = {
    published: "bg-green-500/20 text-green-400 border-green-500/30",
    draft: "bg-gray-500/20 text-gray-400 border-gray-500/30",
    pending: "bg-orange-500/20 text-orange-400 border-orange-500/30",
  };

  return (
    <Card hover={false} className={cn("p-5 flex flex-col gap-4", className)}>
      <h4 className="text-base font-semibold m-0 flex items-center gap-2">
        <span>{icon}</span>
        {title}
      </h4>
      
      {items.length > 0 ? (
        <div className="flex flex-col gap-3">
          {items.map((item) => (
            <div 
              key={item.id} 
              className={cn(
                "flex flex-col gap-1 pb-3 border-b border-white/[0.05] last:border-0 last:pb-0",
                item.isUnread && "relative pl-3 before:absolute before:left-0 before:top-1 before:w-2 before:h-2 before:rounded-full before:bg-[#D4A574]"
              )}
            >
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium flex-1">{item.title}</span>
                {item.badge && (
                  <span className={cn(
                    "text-[10px] px-2 py-0.5 rounded-full border font-semibold uppercase",
                    badgeStyles[item.badge.variant]
                  )}>
                    {item.badge.text}
                  </span>
                )}
              </div>
              <span className="text-xs text-[#B6B3AC]">{item.subtitle}</span>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-6 text-sm text-[#B6B3AC]">
          <p className="m-0">{emptyMessage}</p>
        </div>
      )}
      
      <Link 
        href={viewAllHref} 
        className="text-sm text-[#D4A574] hover:text-[#8B4513] transition-colors font-medium no-underline"
      >
        Lihat Semua →
      </Link>
    </Card>
  );
}

// =====================================================
// PRODUCT CARD - untuk menu/produk showcase
// =====================================================
interface ProductCardProps {
  image: string;
  title: string;
  price: string;
  description?: string;
  tone?: 'noir' | 'aurora' | 'verde';
  actions?: React.ReactNode;
  className?: string;
}

export function ProductCard({ 
  image, 
  title, 
  price, 
  description,
  tone = 'noir',
  actions,
  className 
}: ProductCardProps) {
  const toneStyles = {
    noir: "bg-gradient-to-br from-[#1D1714] to-[#0b0c10]",
    aurora: "bg-gradient-to-br from-[#1D1714] to-[#0b0c10]",
    verde: "bg-gradient-to-br from-[#1D1714] to-[#0b0c10]",
  };

  return (
    <Card variant="gradient" className={cn(toneStyles[tone], "p-4", className)}>
      <div className="h-[180px] rounded-xl mb-3.5 border border-white/[0.06] overflow-hidden relative">
        <Image 
          src={image} 
          alt={title}
          fill
          className="object-cover"
        />
      </div>
      
      <div className="flex flex-col gap-2">
        <h3 className="font-playfair text-2xl font-semibold m-0">{title}</h3>
        {description && (
          <p className="text-sm text-[#B6B3AC] m-0">{description}</p>
        )}
        <p className="text-lg font-bold text-[#8B4513] m-0">{price}</p>
        
        {actions && (
          <div className="flex gap-2 flex-wrap mt-2">
            {actions}
          </div>
        )}
      </div>
    </Card>
  );
}
