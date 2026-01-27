/**
 * Custom Hooks untuk Admin Pages
 * Reusable hooks untuk data fetching dan state management
 */

import { useState, useEffect, useCallback } from "react";

/**
 * Generic hook untuk fetch data dari API
 * @param fetchFn - Function yang mengembalikan promise
 * @param dependencies - Dependencies array untuk re-fetch
 * 
 * @example
 * const { data, loading, error, refetch } = useFetch(() => productsApi.getAll());
 */
export function useFetch<T>(
  fetchFn: () => Promise<T>,
  dependencies: unknown[] = []
) {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>("");

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError("");
      const result = await fetchFn();
      setData(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch data");
    } finally {
      setLoading(false);
    }
  }, [fetchFn]);

  useEffect(() => {
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, dependencies);

  return { data, loading, error, refetch: fetchData };
}

/**
 * Hook untuk pagination logic
 * @param items - Array of items to paginate
 * @param itemsPerPage - Number of items per page
 * 
 * @example
 * const { paginatedItems, currentPage, totalPages, setPage } = 
 *   usePagination(products, 10);
 */
export function usePagination<T>(items: T[], itemsPerPage: number = 10) {
  const [currentPage, setCurrentPage] = useState(1);

  const totalPages = Math.ceil(items.length / itemsPerPage);
  
  const paginatedItems = items.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  // Reset ke halaman 1 jika items berubah
  useEffect(() => {
    setCurrentPage(1);
  }, [items.length]);

  const setPage = (page: number) => {
    const validPage = Math.max(1, Math.min(page, totalPages));
    setCurrentPage(validPage);
  };

  return {
    paginatedItems,
    currentPage,
    totalPages,
    setPage,
  };
}

/**
 * Hook untuk search/filter logic
 * @param items - Array of items to filter
 * @param searchTerm - Search term
 * @param filterFn - Custom filter function
 * 
 * @example
 * const filtered = useFilter(products, searchTerm, (item, term) => 
 *   item.name.toLowerCase().includes(term.toLowerCase())
 * );
 */
export function useFilter<T>(
  items: T[],
  searchTerm: string,
  filterFn: (item: T, term: string) => boolean
) {
  return items.filter((item) => filterFn(item, searchTerm));
}

/**
 * Hook untuk modal state management
 * @param initialMode - Initial modal mode
 * 
 * @example
 * const { isOpen, mode, selectedItem, openModal, closeModal } = 
 *   useModal<Product>("add");
 */
export function useModal<T>(initialMode: "add" | "edit" | "detail" = "add") {
  const [isOpen, setIsOpen] = useState(false);
  const [mode, setMode] = useState<"add" | "edit" | "detail">(initialMode);
  const [selectedItem, setSelectedItem] = useState<T | null>(null);

  const openModal = (newMode: "add" | "edit" | "detail", item?: T) => {
    setMode(newMode);
    setSelectedItem(item || null);
    setIsOpen(true);
  };

  const closeModal = () => {
    setIsOpen(false);
    setSelectedItem(null);
  };

  return {
    isOpen,
    mode,
    selectedItem,
    openModal,
    closeModal,
  };
}

/**
 * Hook untuk form state dengan validation
 * @param initialValues - Initial form values
 * @param onSubmit - Submit handler
 * 
 * @example
 * const { values, errors, handleChange, handleSubmit } = 
 *   useForm({ name: "" }, async (data) => { ... });
 */
export function useForm<T extends Record<string, unknown>>(
  initialValues: T,
  onSubmit: (values: T) => Promise<void>
) {
  const [values, setValues] = useState<T>(initialValues);
  const [errors, setErrors] = useState<Partial<Record<keyof T, string>>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (field: keyof T, value: unknown) => {
    setValues((prev) => ({ ...prev, [field]: value }));
    // Clear error saat user mulai mengetik
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrors({});
    
    try {
      await onSubmit(values);
    } catch (error) {
      console.error("Form submission error:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetForm = () => {
    setValues(initialValues);
    setErrors({});
  };

  return {
    values,
    errors,
    isSubmitting,
    handleChange,
    handleSubmit,
    resetForm,
    setValues,
  };
}

/**
 * Hook untuk toast/notification messages
 * 
 * @example
 * const { message, showMessage, hideMessage } = useToast();
 * showMessage("Success!", "success");
 */
export function useToast() {
  const [message, setMessage] = useState<{
    text: string;
    type: "success" | "error" | "info" | "warning";
  } | null>(null);

  const showMessage = (
    text: string,
    type: "success" | "error" | "info" | "warning" = "info",
    duration: number = 3000
  ) => {
    setMessage({ text, type });
    if (duration > 0) {
      setTimeout(() => setMessage(null), duration);
    }
  };

  const hideMessage = () => setMessage(null);

  return { message, showMessage, hideMessage };
}
