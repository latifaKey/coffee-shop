import React from 'react';
import { cn } from '@/lib/utils';

// =====================================================
// TABLE COMPONENT - Consistent admin tables
// =====================================================
interface Column<T> {
  key: string;
  label: string;
  render?: (item: T, index: number) => React.ReactNode;
  sortable?: boolean;
  width?: string;
  align?: 'left' | 'center' | 'right';
}

interface TableProps<T> {
  data: T[];
  columns: Column<T>[];
  keyExtractor: (item: T) => string | number;
  loading?: boolean;
  emptyMessage?: string;
  className?: string;
  hoverable?: boolean;
  striped?: boolean;
}

export function Table<T>({ 
  data, 
  columns, 
  keyExtractor, 
  loading = false,
  emptyMessage = "Tidak ada data",
  className,
  hoverable = true,
  striped = true,
}: TableProps<T>) {
  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#D4A574]"></div>
      </div>
    );
  }

  if (data.length === 0) {
    return (
      <div className="text-center py-12 text-[#B6B3AC]">
        <p className="text-lg">{emptyMessage}</p>
      </div>
    );
  }

  return (
    <div className={cn("overflow-x-auto rounded-xl border border-white/[0.08]", className)}>
      <table className="w-full">
        <thead className="bg-gradient-to-b from-white/[0.05] to-transparent border-b border-white/[0.08]">
          <tr>
            {columns.map((column) => (
              <th
                key={column.key}
                className={cn(
                  "px-4 py-3 text-sm font-semibold text-[#D4A574]",
                  column.align === 'center' && "text-center",
                  column.align === 'right' && "text-right",
                  column.align === 'left' && "text-left"
                )}
                style={{ width: column.width }}
              >
                {column.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.map((item, index) => (
            <tr
              key={keyExtractor(item)}
              className={cn(
                "border-b border-white/[0.05] transition-colors",
                hoverable && "hover:bg-white/[0.03]",
                striped && index % 2 === 0 && "bg-white/[0.02]"
              )}
            >
              {columns.map((column) => (
                <td
                  key={column.key}
                  className={cn(
                    "px-4 py-3 text-sm text-[#F7F2EE]",
                    column.align === 'center' && "text-center",
                    column.align === 'right' && "text-right",
                    column.align === 'left' && "text-left"
                  )}
                >
                  {column.render 
                    ? column.render(item, index)
                    : (item as any)[column.key]
                  }
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// =====================================================
// TABLE ACTION BUTTONS - Consistent action buttons
// =====================================================
interface ActionButtonsProps {
  onView?: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
  viewLabel?: string;
  editLabel?: string;
  deleteLabel?: string;
  className?: string;
}

export function TableActionButtons({
  onView,
  onEdit,
  onDelete,
  viewLabel = "Detail",
  editLabel = "Edit",
  deleteLabel = "Hapus",
  className
}: ActionButtonsProps) {
  return (
    <div className={cn("flex items-center gap-2", className)}>
      {onView && (
        <button
          onClick={onView}
          className="px-3 py-1.5 text-xs font-medium rounded-lg bg-blue-500/20 text-blue-400 border border-blue-500/30 hover:bg-blue-500/30 transition-colors"
          title={viewLabel}
        >
          👁️ {viewLabel}
        </button>
      )}
      {onEdit && (
        <button
          onClick={onEdit}
          className="px-3 py-1.5 text-xs font-medium rounded-lg bg-[#8B4513]/20 text-[#D4A574] border border-[#8B4513]/30 hover:bg-[#8B4513]/30 transition-colors"
          title={editLabel}
        >
          ✏️ {editLabel}
        </button>
      )}
      {onDelete && (
        <button
          onClick={onDelete}
          className="px-3 py-1.5 text-xs font-medium rounded-lg bg-red-500/20 text-red-400 border border-red-500/30 hover:bg-red-500/30 transition-colors"
          title={deleteLabel}
        >
          🗑️ {deleteLabel}
        </button>
      )}
    </div>
  );
}

// =====================================================
// PAGINATION - Consistent pagination
// =====================================================
interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  className?: string;
}

export function Pagination({ 
  currentPage, 
  totalPages, 
  onPageChange,
  className 
}: PaginationProps) {
  if (totalPages <= 1) return null;

  const pages = Array.from({ length: totalPages }, (_, i) => i + 1);
  const showPages = pages.filter(p => {
    if (p === 1 || p === totalPages) return true;
    if (p >= currentPage - 1 && p <= currentPage + 1) return true;
    return false;
  });

  return (
    <div className={cn("flex items-center justify-center gap-2 mt-6", className)}>
      <button
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        className="px-3 py-2 rounded-lg bg-white/[0.05] border border-white/[0.08] text-[#F7F2EE] disabled:opacity-50 disabled:cursor-not-allowed hover:bg-white/[0.08] transition-colors"
      >
        ← Prev
      </button>
      
      {showPages.map((page, index) => {
        const prevPage = showPages[index - 1];
        const showDots = prevPage && page - prevPage > 1;
        
        return (
          <React.Fragment key={page}>
            {showDots && (
              <span className="px-2 text-[#B6B3AC]">...</span>
            )}
            <button
              onClick={() => onPageChange(page)}
              className={cn(
                "px-3 py-2 rounded-lg border transition-colors",
                page === currentPage
                  ? "bg-gradient-to-br from-[#8B4513] to-[#D2B48C] text-white border-transparent font-semibold"
                  : "bg-white/[0.05] border-white/[0.08] text-[#F7F2EE] hover:bg-white/[0.08]"
              )}
            >
              {page}
            </button>
          </React.Fragment>
        );
      })}
      
      <button
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        className="px-3 py-2 rounded-lg bg-white/[0.05] border border-white/[0.08] text-[#F7F2EE] disabled:opacity-50 disabled:cursor-not-allowed hover:bg-white/[0.08] transition-colors"
      >
        Next →
      </button>
    </div>
  );
}
