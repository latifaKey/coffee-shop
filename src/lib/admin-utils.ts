/**
 * Utility Functions untuk Admin Pages
 * Helper functions yang sering dipakai di admin dashboard
 */

/**
 * Format angka menjadi format mata uang Rupiah
 * @param amount - Jumlah dalam angka
 * @returns String formatted sebagai IDR
 * 
 * @example
 * formatCurrency(28000) // "Rp 28.000"
 */
export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(amount);
}

/**
 * Format tanggal ke format lokal Indonesia
 * @param date - Date object atau string
 * @returns String formatted date
 * 
 * @example
 * formatDate(new Date()) // "23 November 2025"
 */
export function formatDate(date: Date | string): string {
  const d = typeof date === "string" ? new Date(date) : date;
  return new Intl.DateTimeFormat("id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(d);
}

/**
 * Format tanggal dan waktu lengkap
 * @param date - Date object atau string
 * @returns String formatted datetime
 * 
 * @example
 * formatDateTime(new Date()) // "23 November 2025, 14:30"
 */
export function formatDateTime(date: Date | string): string {
  const d = typeof date === "string" ? new Date(date) : date;
  return new Intl.DateTimeFormat("id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(d);
}

/**
 * Truncate teks panjang dengan ellipsis
 * @param text - Teks yang akan di-truncate
 * @param maxLength - Panjang maksimal karakter
 * @returns Truncated text
 * 
 * @example
 * truncateText("Lorem ipsum dolor sit amet", 10) // "Lorem ipsu..."
 */
export function truncateText(text: string, maxLength: number): string {
  if (!text) return "";
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength) + "...";
}

/**
 * Confirm dialog dengan promise
 * @param message - Pesan konfirmasi
 * @returns Promise<boolean>
 * 
 * @example
 * const confirmed = await confirmDialog("Hapus data?");
 * if (confirmed) { ... }
 */
export function confirmDialog(message: string): Promise<boolean> {
  return new Promise((resolve) => {
    const result = window.confirm(message);
    resolve(result);
  });
}

/**
 * Handle API error dengan format yang konsisten
 * @param error - Error object
 * @returns User-friendly error message
 */
export function handleApiError(error: unknown): string {
  if (error instanceof Error) {
    return error.message;
  }
  if (typeof error === "string") {
    return error;
  }
  return "Terjadi kesalahan yang tidak diketahui";
}

/**
 * Debounce function untuk search/filter
 * @param func - Function yang akan di-debounce
 * @param wait - Delay dalam ms
 * @returns Debounced function
 */
export function debounce<T extends (...args: unknown[]) => unknown>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout | null = null;
  
  return function executedFunction(...args: Parameters<T>) {
    const later = () => {
      timeout = null;
      func(...args);
    };
    
    if (timeout) clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

/**
 * Generate slug dari string
 * @param text - Text yang akan dijadikan slug
 * @returns URL-friendly slug
 * 
 * @example
 * generateSlug("Kopi Signature BARIZTA") // "kopi-signature-barizta"
 */
export function generateSlug(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_-]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

/**
 * Normalize image path untuk memastikan path yang konsisten
 * Menangani berbagai format input: filename saja, path relatif, atau path lengkap
 * @param imagePath - Path atau filename gambar
 * @param defaultImage - Gambar default jika path kosong
 * @returns Normalized image path
 * 
 * @example
 * normalizeImagePath("file.jpg") // "/uploads/file.jpg"
 * normalizeImagePath("/uploads/file.jpg") // "/uploads/file.jpg"
 * normalizeImagePath("/images/menu/file.jpg") // "/images/menu/file.jpg"
 * normalizeImagePath("") // "/images/default-product.jpg"
 */
export function normalizeImagePath(
  imagePath: string | null | undefined, 
  defaultImage: string = "/images/default-product.jpg"
): string {
  if (!imagePath || imagePath.trim() === "") {
    return defaultImage;
  }
  
  // If already starts with /, it's a valid path
  if (imagePath.startsWith("/")) {
    return imagePath;
  }
  
  // If it's just a filename (no path), add /uploads/ prefix
  return `/uploads/${imagePath}`;
}
