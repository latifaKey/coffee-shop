"use client";

import { useMemo, useState } from "react";
import ProductCard, { Product, Category } from "@/app/(public)/menu/ProductCard";
import ProductModal from "@/app/(public)/menu/ProductModal";
import { useLanguage } from "@/context/LanguageContext";

interface MenuClientProps {
  products: Product[];
  categories: Category[];
}

export default function MenuClient({ products, categories }: MenuClientProps) {
  const { t } = useLanguage();
  const menuCopy = t.publicPages.menu;
  const [search, setSearch] = useState("");
  const [selectedCategories, setSelectedCategories] = useState<number[]>([]);
  const [sort, setSort] = useState<"name-asc" | "name-desc" | "price-asc" | "price-desc">("name-asc");
  const [page, setPage] = useState(1);
  const [modalProduct, setModalProduct] = useState<Product | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const perPage = 9;

  const openModal = (product: Product) => {
    console.log('[MenuClient] Opening modal for:', product.name);
    setModalProduct(product);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    console.log('[MenuClient] Closing modal');
    setIsModalOpen(false);
    setModalProduct(null);
  };

  const handleCategoryToggle = (categoryId: number) => {
    setSelectedCategories(prev => {
      if (prev.includes(categoryId)) {
        return prev.filter(id => id !== categoryId);
      } else {
        return [...prev, categoryId];
      }
    });
    setPage(1);
  };

  const filtered = useMemo(() => {
    let result = products;

    // Filter by selected categories (checkbox)
    if (selectedCategories.length > 0) {
      result = result.filter(p => p.categoryId && selectedCategories.includes(p.categoryId));
    }

    // Filter by search
    if (search.trim()) {
      const searchLower = search.trim().toLowerCase();
      result = result.filter((p) => {
        const hay = (p.name + " " + (p.description || "") + " " + (p.category?.name || "")).toLowerCase();
        return hay.includes(searchLower);
      });
    }

    // Sort
    const sorted = [...result].sort((a, b) => {
      if (sort === "name-asc") return (a.name || "").localeCompare(b.name || "");
      if (sort === "name-desc") return (b.name || "").localeCompare(a.name || "");
      if (sort === "price-asc") return (a.price || 0) - (b.price || 0);
      return (b.price || 0) - (a.price || 0);
    });

    return sorted;
  }, [products, selectedCategories, search, sort]);

  const total = filtered.length;
  const totalPages = Math.max(1, Math.ceil(total / perPage));
  const slice = filtered.slice((page - 1) * perPage, page * perPage);

  return (
    <>
    <div className="menu-page">
      <div className="menu-sidebar">
        <div className="filter-card">
          <h3>{menuCopy.sidebar.searchTitle}</h3>
          <p className="muted">{menuCopy.sidebar.searchDescription}</p>
          <div className="search-input">
            <input type="search" placeholder={menuCopy.sidebar.searchPlaceholder} value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }} />
            <button aria-label={menuCopy.sidebar.searchButtonAria}>🔍</button>
          </div>
        </div>

        <div className="filter-card">
          <h3>{menuCopy.sidebar.filterTitle}</h3>
          <p className="muted">{menuCopy.sidebar.filterDescription}</p>
          <div className="category-checkbox-group">
            {categories.map(cat => (
              <label key={cat.id} className="category-checkbox">
                <input
                  type="checkbox"
                  checked={selectedCategories.includes(cat.id)}
                  onChange={() => handleCategoryToggle(cat.id)}
                />
                <span className="checkmark"></span>
                <span className="category-name">{cat.name}</span>
              </label>
            ))}
          </div>
        </div>
      </div>

      <div className="menu-content">
        <div className="menu-top">
          <div className="results">
            {total === 0 
              ? menuCopy.results.none 
              : menuCopy.results.range((page - 1) * perPage + 1, Math.min(page * perPage, total), total)}
          </div>
          <div className="sort-by">
            <label>{menuCopy.sorting.label}</label>
            <div className="sort-select-wrapper">
              <select value={sort} onChange={(e) => { setSort(e.target.value as 'name-asc' | 'name-desc' | 'price-asc' | 'price-desc'); setPage(1); }}>
                {menuCopy.sorting.options.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
              <span className="sort-arrow">›</span>
            </div>
          </div>
        </div>

        {slice.length === 0 ? (
          <div className="empty-state">
            <p>{menuCopy.emptyState.title}</p>
            {search && <p className="muted">{menuCopy.emptyState.hint}</p>}
          </div>
        ) : (
          <div className="menu-grid">
            {slice.map((p, index) => (
              <ProductCard 
                key={p.id} 
                p={p} 
                onDetailClick={openModal}
                priority={index < 3} // First 3 products get priority loading
              />
            ))}
          </div>
        )}

        {totalPages > 1 && (
          <div className="pagination">
            <button onClick={() => setPage((s) => Math.max(1, s - 1))} disabled={page === 1}>{menuCopy.pagination.prev}</button>
            <span className="page-info">{menuCopy.pagination.info(page, totalPages)}</span>
            <button onClick={() => setPage((s) => Math.min(totalPages, s + 1))} disabled={page === totalPages}>{menuCopy.pagination.next}</button>
          </div>
        )}
      </div>

    </div>

    {/* Modal rendered outside menu-page for proper z-index */}
    {isModalOpen && modalProduct && (
      <ProductModal product={modalProduct} onClose={closeModal} />
    )}
    </>
  );
}
