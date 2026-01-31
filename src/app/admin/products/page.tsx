"use client";

import { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import ActionButton, { ActionButtonGroup } from "@/components/admin/ActionButton";
import ImageUploader from "@/components/admin/ImageUploader";
import DeleteConfirmModal from "@/components/ui/DeleteConfirmModal";
import { SearchBar, FilterSelect, Badge, StatusBadge, Alert, FormGroup, Input, Textarea, Checkbox } from '@/components/ui';
import { normalizeImagePath } from "@/lib/admin-utils";
import { formatCurrency } from "@/lib/utils";
import "./products.css";

interface Category {
  id: number;
  name: string;
  slug: string;
  type: string;
  imageFolder: string;
  _count?: { products: number };
}

interface Product {
  id: number;
  name: string;
  categoryId: number | null;
  category: Category | null;
  price: number;
  description: string;
  image: string;
  isAvailable: boolean;
}

export default function KelolaProduk() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState<"add" | "edit" | "detail">("add");
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterCategory, setFilterCategory] = useState<string>("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [submitting, setSubmitting] = useState(false);
  const [deletingProduct, setDeletingProduct] = useState<Product | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const itemsPerPage = 10;

  // Form state
  const [formData, setFormData] = useState({
    name: "",
    categoryId: "",
    price: 0,
    description: "",
    image: "",
    isAvailable: true
  });

  // Fetch categories from API
  const fetchCategories = useCallback(async () => {
    try {
      const response = await fetch("/api/categories");
      if (!response.ok) throw new Error("Failed to fetch categories");
      const data = await response.json();
      setCategories(data);
    } catch (err) {
      console.error("Fetch categories error:", err);
    }
  }, []);

  // Fetch products from API
  const fetchProducts = useCallback(async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/products?limit=100");
      if (!response.ok) throw new Error("Failed to fetch products");
      const result = await response.json();
      // Handle both array and paginated response
      const data = Array.isArray(result) ? result : (result.data || []);
      setProducts(data);
    } catch (err) {
      console.error("Fetch error:", err);
      setError("Gagal memuat produk");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCategories();
    fetchProducts();
  }, [fetchCategories, fetchProducts]);

  // Filtered and paginated products
  const filteredProducts = products.filter(product => {
    const name = product.name?.toLowerCase() || "";
    const desc = product.description?.toLowerCase() || "";
    const term = searchTerm.toLowerCase();

    const matchesSearch = name.includes(term) || desc.includes(term);
    const matchesCategory =
      filterCategory === "all" ||
      (product.categoryId?.toString() === filterCategory);

    return matchesSearch && matchesCategory;
  });

  const totalPages = Math.ceil(filteredProducts.length / itemsPerPage);
  const paginatedProducts = filteredProducts.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  // Handlers
  const handleOpenModal = (mode: "add" | "edit" | "detail", product?: Product) => {
    setModalMode(mode);
    setError("");
    setSuccess("");
    if (product) {
      setSelectedProduct(product);
      setFormData({
        name: product.name,
        categoryId: product.categoryId?.toString() || "",
        price: product.price,
        description: product.description || "",
        image: product.image || "",
        isAvailable: product.isAvailable
      });
    } else {
      setSelectedProduct(null);
      setFormData({
        name: "",
        categoryId: "",
        price: 0,
        description: "",
        image: "",
        isAvailable: true
      });
    }
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setSelectedProduct(null);
    setError("");
    setSuccess("");
  };

  const handleImageUploaded = (filename: string) => {
    // Ensure the image path is properly formatted with /uploads/ prefix
    const imagePath = filename.startsWith('/') ? filename : `/uploads/${filename}`;
    setFormData(prev => ({ ...prev, image: imagePath }));
  };

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setError("");
    setSuccess("");
    setSubmitting(true);

    // Validation
    if (!formData.name.trim()) {
      setError("Nama produk wajib diisi");
      setSubmitting(false);
      return;
    }
    if (!formData.price || formData.price <= 0) {
      setError("Harga harus lebih dari 0");
      setSubmitting(false);
      return;
    }
    if (!formData.image) {
      setError("Gambar produk wajib diisi");
      setSubmitting(false);
      return;
    }
    
    try {
      if (modalMode === "add") {
        const response = await fetch("/api/products", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: formData.name.trim(),
            description: formData.description.trim(),
            price: formData.price,
            categoryId: formData.categoryId || null,
            image: formData.image,
            isAvailable: formData.isAvailable
          }),
        });

        if (!response.ok) {
          const data = await response.json();
          throw new Error(data.error || "Failed to create product");
        }

        setSuccess("Produk berhasil ditambahkan!");
        await fetchProducts();
      } else if (modalMode === "edit" && selectedProduct) {
        const response = await fetch(`/api/products/${selectedProduct.id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: formData.name.trim(),
            description: formData.description.trim(),
            price: formData.price,
            categoryId: formData.categoryId || null,
            image: formData.image,
            isAvailable: formData.isAvailable
          }),
        });

        if (!response.ok) {
          const data = await response.json();
          throw new Error(data.error || "Failed to update product");
        }

        setSuccess("Produk berhasil diperbarui!");
        await fetchProducts();
      }
      
      setTimeout(() => {
        handleCloseModal();
      }, 1500);
    } catch (err: unknown) {
      console.error("Submit error:", err);
      setError(err instanceof Error ? err.message : "Terjadi kesalahan");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteClick = (product: Product) => {
    setDeletingProduct(product);
  };

  const handleDeleteConfirm = async () => {
    if (!deletingProduct) return;

    setIsDeleting(true);
    try {
      const response = await fetch(`/api/products/${deletingProduct.id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to delete product");
      }

      setSuccess("Produk berhasil dihapus!");
      setDeletingProduct(null);
      await fetchProducts();
      setTimeout(() => setSuccess(""), 3000);
    } catch (err: unknown) {
      console.error("Delete error:", err);
      setError(err instanceof Error ? err.message : "Gagal menghapus produk");
      setTimeout(() => setError(""), 3000);
    } finally {
      setIsDeleting(false);
    }
  };

  // Group categories by type
  const minumanCategories = categories.filter(c => c.type === 'MINUMAN');
  const makananCategories = categories.filter(c => c.type === 'MAKANAN');

  if (loading) return null;

  return (
    <div className="produk-container">
      {/* Page Header */}
      <div className="page-header">
        <div>
          <h1>Kelola Produk</h1>
          <p>Kelola produk kopi, makanan, dan merchandise</p>
        </div>
        <button className="btn-barizta" onClick={() => handleOpenModal("add")}>
          + Tambah Produk
        </button>
      </div>

      {/* Success/Error Messages */}
      {success && !showModal && (
        <Alert type="success" message={success} onClose={() => setSuccess("")} />
      )}
      {error && !showModal && (
        <Alert type="error" message={error} onClose={() => setError("")} />
      )}

      {/* Filters and Search */}
      <div className="filter-section">
        <SearchBar
          value={searchTerm}
          onChange={setSearchTerm}
          placeholder="Cari nama produk atau deskripsi..."
          className="flex-1"
        />
        <FilterSelect
          value={filterCategory}
          onChange={setFilterCategory}
          options={[
            { value: 'all', label: 'Semua Kategori' },
            ...categories.map(cat => ({
              value: cat.id.toString(),
              label: `${cat.name} (${cat.type})`
            }))
          ]}
          placeholder="Kategori"
        />
      </div>

      {/* Products Table */}
      <div className="table-container">
        <table className="data-table barizta-table">
          <thead>
            <tr>
              <th>Gambar</th>
              <th>Nama Produk</th>
              <th>Kategori</th>
              <th>Harga</th>
              <th>Status</th>
              <th>Aksi</th>
            </tr>
          </thead>
          <tbody>
            {paginatedProducts.length > 0 ? (
              paginatedProducts.map((product) => (
                <tr key={product.id}>
                  <td>
                    <div className="product-image">
                      <Image 
                        src={normalizeImagePath(product.image)} 
                        alt={product.name}
                        width={60}
                        height={60}
                        style={{ objectFit: 'cover', borderRadius: '4px' }}
                        unoptimized
                      />
                    </div>
                  </td>
                  <td>
                    <strong>{product.name}</strong>
                    <br />
                    <small>{(product.description || "").substring(0, 50)}{product.description && product.description.length > 50 ? '...' : ''}</small>
                  </td>
                  <td>
                    <Badge variant="info">
                      {product.category?.name || 'Tanpa Kategori'}
                    </Badge>
                  </td>
                  <td><strong>{formatCurrency(product.price)}</strong></td>
                  <td>
                    <StatusBadge status={product.isAvailable ? 'active' : 'inactive'} />
                  </td>
                  <td>
                    <ActionButtonGroup>
                      <ActionButton 
                        type="detail" 
                        onClick={() => handleOpenModal("detail", product)}
                      />
                      <ActionButton 
                        type="edit" 
                        onClick={() => handleOpenModal("edit", product)}
                      />
                      <ActionButton 
                        type="delete" 
                        onClick={() => handleDeleteClick(product)}
                      />
                    </ActionButtonGroup>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={6} style={{ textAlign: 'center', padding: '2rem' }}>
                  Tidak ada produk yang ditemukan
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="pagination">
          <button 
            onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
            disabled={currentPage === 1}
          >
            ‹ Prev
          </button>
          <span className="page-info">
            Halaman {currentPage} dari {totalPages}
          </span>
          <button 
            onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
            disabled={currentPage === totalPages}
          >
            Next ›
          </button>
        </div>
      )}

      {/* Modal Form */}
      {showModal && (
        <div className="modal-overlay" onClick={handleCloseModal}>
          <div className="modal-container" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>
                {modalMode === "add" && "Tambah Produk Baru"}
                {modalMode === "edit" && "Edit Produk"}
                {modalMode === "detail" && "Detail Produk"}
              </h2>
              <button className="modal-close" onClick={handleCloseModal}>×</button>
            </div>

            {modalMode === "detail" ? (
              // Detail View
              <div className="modal-body">
                <div className="detail-grid">
                  <div className="detail-image">
                    <Image 
                      src={normalizeImagePath(selectedProduct?.image)} 
                      alt={selectedProduct?.name || 'Product'}
                      width={300}
                      height={300}
                      style={{ objectFit: 'cover', borderRadius: '8px' }}
                      unoptimized
                    />
                  </div>
                  <div className="detail-info">
                    <h3>{selectedProduct?.name}</h3>
                    <div className="detail-row">
                      <span className="detail-label">Kategori:</span>
                      <Badge variant="info">
                        {selectedProduct?.category?.name || 'Tanpa Kategori'}
                      </Badge>
                    </div>
                    <div className="detail-row">
                      <span className="detail-label">Harga:</span>
                      <span className="detail-value price">{formatCurrency(selectedProduct?.price || 0)}</span>
                    </div>
                    <div className="detail-row">
                      <span className="detail-label">Status:</span>
                      <StatusBadge status={selectedProduct?.isAvailable ? 'active' : 'inactive'} />
                    </div>
                    <div className="detail-row">
                      <span className="detail-label">Deskripsi:</span>
                    </div>
                    <p className="detail-description">{selectedProduct?.description || '-'}</p>
                  </div>
                </div>
                <div className="modal-actions">
                  <button type="button" className="btn-secondary-barizta" onClick={handleCloseModal}>
                    Tutup
                  </button>
                  <button type="button" className="btn-barizta" onClick={() => {
                    if (selectedProduct) handleOpenModal("edit", selectedProduct);
                  }}>
                    Edit Produk
                  </button>
                </div>
              </div>
            ) : (
              // Add/Edit Form
              <>
                <div className="modal-body">
                  {error && <Alert type="error" message={error} onClose={() => setError("")} />}
                  {success && <Alert type="success" message={success} />}
                  
                  <FormGroup label="Nama Produk" required>
                    <Input
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="Masukkan nama produk"
                    />
                  </FormGroup>

                  <FormGroup label="Deskripsi">
                    <Textarea
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      rows={3}
                      placeholder="Deskripsi produk (opsional)"
                    />
                  </FormGroup>

                  <FormGroup label="Kategori">
                    <select
                      value={formData.categoryId}
                      onChange={(e) => setFormData({ ...formData, categoryId: e.target.value })}
                      className="w-full px-3 py-2.5 rounded-lg bg-white/[0.04] border border-white/[0.14] text-[#F7F2EE] focus:border-[#8B4513] focus:outline-none transition-colors"
                    >
                      <option value="">-- Pilih Kategori --</option>
                      {minumanCategories.length > 0 && (
                        <optgroup label="MINUMAN">
                          {minumanCategories.map((cat) => (
                            <option key={cat.id} value={cat.id.toString()}>
                              {cat.name}
                            </option>
                          ))}
                        </optgroup>
                      )}
                      {makananCategories.length > 0 && (
                        <optgroup label="MAKANAN">
                          {makananCategories.map((cat) => (
                            <option key={cat.id} value={cat.id.toString()}>
                              {cat.name}
                            </option>
                          ))}
                        </optgroup>
                      )}
                    </select>
                  </FormGroup>

                  <FormGroup label="Harga (Rp)" required>
                    <Input
                      type="number"
                      value={formData.price.toString()}
                      onChange={(e) => setFormData({ ...formData, price: parseInt(e.target.value) || 0 })}
                      min="0"
                      placeholder="0"
                    />
                  </FormGroup>

                  <div className="form-group">
                    <label>Gambar <span className="required">*</span></label>
                    <ImageUploader 
                      initialPreview={formData.image || null}
                      onUploaded={handleImageUploaded}
                    />
                  </div>

                  <Checkbox
                    label="Produk Tersedia"
                    checked={formData.isAvailable}
                    onChange={(e) => setFormData({ ...formData, isAvailable: e.target.checked })}
                  />
                </div>

                <div className="modal-actions">
                  <button type="button" className="btn-secondary-barizta" onClick={handleCloseModal}>
                    Batal
                  </button>
                  <button type="button" className="btn-barizta" disabled={submitting} onClick={handleSubmit}>
                    {submitting ? 'Menyimpan...' : (modalMode === "add" ? "Tambah Produk" : "Simpan Perubahan")}
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      <DeleteConfirmModal
        isOpen={!!deletingProduct}
        onClose={() => setDeletingProduct(null)}
        onConfirm={handleDeleteConfirm}
        itemName={deletingProduct?.name || ""}
        itemType="produk"
        isLoading={isDeleting}
      />
    </div>
  );
}
