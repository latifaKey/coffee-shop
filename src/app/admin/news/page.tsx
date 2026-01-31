"use client";

import { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import ActionButton, { ActionButtonGroup } from "@/components/admin/ActionButton";
import DeleteConfirmModal from "@/components/ui/DeleteConfirmModal";
import { SearchBar, FilterSelect, Alert, Badge, StatusBadge } from '@/components/ui';
import "./news.css";

interface News {
  id: number;
  title: string;
  category: string;
  content: string;
  excerpt: string;
  image: string;
  author: string;
  publishDate: string;
  status: string;
  views: number;
}

export default function KelolaBerita() {
  const [newsList, setNewsList] = useState<News[]>([]);
  const [loading, setLoading] = useState(true);
  const [alertMessage, setAlertMessage] = useState<{ type: string; text: string }>({ type: '', text: '' });
  const [modalAlert, setModalAlert] = useState<{ type: string; text: string }>({ type: '', text: '' });

  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState<"add" | "edit" | "detail">("add");
  const [selectedNews, setSelectedNews] = useState<News | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterCategory, setFilterCategory] = useState<string>("all");
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const [formData, setFormData] = useState({
    title: "",
    category: "info",
    content: "",
    excerpt: "",
    image: "",
    author: "Admin",
    publishDate: new Date().toISOString().split('T')[0],
    status: "draft"
  });
  const [submitting, setSubmitting] = useState(false);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [deletingNews, setDeletingNews] = useState<News | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setAlertMessage({ type: 'error', text: 'Ukuran file maksimal 5MB' });
        setTimeout(() => setAlertMessage({ type: '', text: '' }), 4000);
        return;
      }

      setImageFile(file);
    }
  };

  const uploadImage = async (): Promise<string> => {
    if (!imageFile) return formData.image;

    try {
      setUploading(true);
      const formDataUpload = new FormData();
      formDataUpload.append('file', imageFile);
      formDataUpload.append('folder', 'images/news');

      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formDataUpload
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || 'Failed to upload image');
      }

      const data = await res.json();
      return data.filePath;
    } catch (error) {
      console.error('Error uploading image:', error);
      throw error;
    } finally {
      setUploading(false);
    }
  };

  const fetchNews = useCallback(async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (filterCategory !== "all") params.append("category", filterCategory);
      if (filterStatus !== "all") params.append("status", filterStatus);
      
      const response = await fetch(`/api/news?${params.toString()}`);
      if (!response.ok) throw new Error("Failed to fetch news");
      const result = await response.json();
      const newsData = Array.isArray(result) ? result : (result.data || []);
      setNewsList(newsData);
    } catch (err) {
      console.error("Fetch error:", err);
      setAlertMessage({ type: 'error', text: 'Gagal memuat berita' });
      setTimeout(() => setAlertMessage({ type: '', text: '' }), 4000);
    } finally {
      setLoading(false);
    }
  }, [filterCategory, filterStatus]);

  useEffect(() => {
    fetchNews();
  }, [fetchNews]);

  const filteredNews = newsList.filter(news => {
    const matchesSearch = news.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         news.content.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesSearch;
  });

  const totalPages = Math.ceil(filteredNews.length / itemsPerPage);
  const paginatedNews = filteredNews.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const handleOpenModal = (mode: "add" | "edit" | "detail", news?: News) => {
    setModalMode(mode);
    setAlertMessage({ type: '', text: '' });
    setModalAlert({ type: '', text: '' });
    if (news) {
      setSelectedNews(news);
      setFormData({
        title: news.title,
        category: news.category,
        content: news.content,
        excerpt: news.excerpt || "",
        image: news.image,
        author: news.author,
        publishDate: news.publishDate.split('T')[0],
        status: news.status
      });
      setImageFile(null);
    } else {
      setSelectedNews(null);
      setFormData({
        title: "",
        category: "info",
        content: "",
        excerpt: "",
        image: "",
        author: "Admin",
        publishDate: new Date().toISOString().split('T')[0],
        status: "draft"
      });
      setImageFile(null);
    }
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setSelectedNews(null);
    setModalAlert({ type: '', text: '' });
  };

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setModalAlert({ type: '', text: '' });
    setSubmitting(true);
    
    try {
      const uploadedImagePath = await uploadImage();
      const dataToSubmit = { ...formData, image: uploadedImagePath };

      if (modalMode === "add") {
        const response = await fetch("/api/news", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(dataToSubmit),
        });

        if (!response.ok) {
          const data = await response.json();
          throw new Error(data.error || "Failed to create news");
        }

        setAlertMessage({ type: 'success', text: 'Berita berhasil dibuat!' });
        await fetchNews();
      } else if (modalMode === "edit" && selectedNews) {
        const response = await fetch(`/api/news/${selectedNews.id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(dataToSubmit),
        });

        if (!response.ok) {
          const data = await response.json();
          throw new Error(data.error || "Failed to update news");
        }

        setAlertMessage({ type: 'success', text: 'Berita berhasil diperbarui!' });
        await fetchNews();
      }
      
      setTimeout(() => {
        handleCloseModal();
        setTimeout(() => setAlertMessage({ type: '', text: '' }), 3000);
      }, 1500);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Terjadi kesalahan";
      setModalAlert({ type: 'error', text: message });
      setTimeout(() => setModalAlert({ type: '', text: '' }), 4000);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteClick = (news: News) => {
    setDeletingNews(news);
  };

  const handleDeleteConfirm = async () => {
    if (!deletingNews) return;

    setIsDeleting(true);
    try {
      const response = await fetch(`/api/news/${deletingNews.id}`, { method: "DELETE" });
      if (!response.ok) throw new Error("Failed to delete news");

      setAlertMessage({ type: 'success', text: 'Berita berhasil dihapus!' });
      setDeletingNews(null);
      await fetchNews();
      setTimeout(() => setAlertMessage({ type: '', text: '' }), 4000);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Gagal menghapus berita";
      setAlertMessage({ type: 'error', text: message });
      setTimeout(() => setAlertMessage({ type: '', text: '' }), 4000);
    } finally {
      setIsDeleting(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  };

  if (loading && newsList.length === 0) {
    return (
      <div className="berita-container">
        <div style={{ textAlign: "center", padding: "2rem" }}>Loading...</div>
      </div>
    );
  }

  return (
    <div className="berita-container">
      <div className="page-header">
        <div>
          <h1>Kelola Berita</h1>
          <p>Kelola konten berita dan informasi Barizta</p>
        </div>
        <button type="button" className="btn-barizta" onClick={() => handleOpenModal("add")}>+ Tambah Berita</button>
      </div>

      {alertMessage.text && (
        <Alert
          type={alertMessage.type as 'success' | 'error'}
          message={alertMessage.text}
          onClose={() => setAlertMessage({ type: '', text: '' })}
        />
      )}

      <div className="filter-section">
        <SearchBar
          value={searchTerm}
          onChange={(value) => {
            setSearchTerm(value);
            setCurrentPage(1);
          }}
          placeholder="Cari berita..."
        />

        <FilterSelect
          value={filterCategory}
          onChange={(value) => {
            setFilterCategory(value);
            setCurrentPage(1);
          }}
          placeholder="Kategori"
          options={[
            { value: 'all', label: 'Semua' },
            { value: 'event', label: 'Event' },
            { value: 'promo', label: 'Promo' },
            { value: 'info', label: 'Info' }
          ]}
        />

        <FilterSelect
          value={filterStatus}
          onChange={(value) => {
            setFilterStatus(value);
            setCurrentPage(1);
          }}
          placeholder="Status"
          options={[
            { value: 'all', label: 'Semua' },
            { value: 'published', label: 'Published' },
            { value: 'draft', label: 'Draft' }
          ]}
        />
      </div>

      {/* News Table */}
      <div className="table-container">
        <table className="data-table barizta-table">
          <thead>
            <tr>
              <th>Gambar</th>
              <th>Judul</th>
              <th>Kategori</th>
              <th>Penulis</th>
              <th>Tanggal</th>
              <th>Status</th>
              <th>Aksi</th>
            </tr>
          </thead>
          <tbody>
            {paginatedNews.length > 0 ? (
              paginatedNews.map((news) => (
                <tr key={news.id}>
                  <td>
                    <div className="table-image">
                      <Image 
                        src={news.image || "/images/default-news.jpg"} 
                        alt={news.title}
                        width={60}
                        height={60}
                        style={{ objectFit: 'cover', borderRadius: '4px' }}
                        unoptimized
                      />
                    </div>
                  </td>
                  <td>
                    <strong>{news.title}</strong>
                    <br />
                    <small>{(news.excerpt || "").substring(0, 50)}{news.excerpt && news.excerpt.length > 50 ? '...' : ''}</small>
                  </td>
                  <td>
                    <Badge variant="info">{news.category}</Badge>
                  </td>
                  <td>{news.author}</td>
                  <td>{formatDate(news.publishDate)}</td>
                  <td>
                    <StatusBadge status={news.status === 'published' ? 'published' : 'draft'} />
                  </td>
                  <td>
                    <ActionButtonGroup>
                      <ActionButton type="detail" onClick={() => handleOpenModal("detail", news)} />
                      <ActionButton type="edit" onClick={() => handleOpenModal("edit", news)} />
                      <ActionButton type="delete" onClick={() => handleDeleteClick(news)} />
                    </ActionButtonGroup>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={7} style={{ textAlign: 'center', padding: '2rem' }}>
                  Tidak ada berita yang ditemukan
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {totalPages > 1 && (
        <div className="pagination">
          <button onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1}>
            ‹ Prev
          </button>
          <span className="page-info">Halaman {currentPage} dari {totalPages}</span>
          <button onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages}>
            Next ›
          </button>
        </div>
      )}

      {showModal && (
        <div className="modal-overlay" onClick={handleCloseModal}>
          <div className="modal-container" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>
                {modalMode === "add" && "Tambah Berita Baru"}
                {modalMode === "edit" && "Edit Berita"}
                {modalMode === "detail" && "Detail Berita"}
              </h2>
              <button className="modal-close" onClick={handleCloseModal}>×</button>
            </div>

            {modalMode === "detail" ? (
              <div className="modal-body">
                <div className="detail-grid">
                  <div className="detail-image">
                    <Image 
                      src={selectedNews?.image || '/images/default-news.jpg'} 
                      alt={selectedNews?.title || 'News'}
                      width={300}
                      height={200}
                      style={{ objectFit: 'cover', borderRadius: '8px' }}
                      unoptimized
                    />
                  </div>
                  <div className="detail-info">
                    <h3>{selectedNews?.title}</h3>
                    <div className="detail-row">
                      <span className="detail-label">Kategori:</span>
                      <span className={`badge badge-${selectedNews?.category}`}>{selectedNews?.category}</span>
                    </div>
                    <div className="detail-row">
                      <span className="detail-label">Status:</span>
                      <span className={`status status-${selectedNews?.status === 'published' ? 'active' : 'inactive'}`}>
                        {selectedNews?.status === 'published' ? 'Published' : 'Draft'}
                      </span>
                    </div>
                    <div className="detail-row">
                      <span className="detail-label">Penulis:</span>
                      <span className="detail-value">{selectedNews?.author}</span>
                    </div>
                    <div className="detail-row">
                      <span className="detail-label">Tanggal:</span>
                      <span className="detail-value">{formatDate(selectedNews?.publishDate || "")}</span>
                    </div>
                    <div className="detail-row">
                      <span className="detail-label">Konten:</span>
                    </div>
                    <p className="detail-description">{selectedNews?.content || '-'}</p>
                  </div>
                </div>
                <div className="modal-actions">
                  <button type="button" className="btn-secondary-barizta" onClick={handleCloseModal}>Tutup</button>
                  <button type="button" className="btn-barizta" onClick={() => {
                    if (selectedNews) handleOpenModal("edit", selectedNews);
                  }}>Edit Berita</button>
                </div>
              </div>
            ) : (
              <>
                <div className="modal-body">
                  {modalAlert.text && (
                    <Alert
                      type={modalAlert.type as 'success' | 'error'}
                      message={modalAlert.text}
                      onClose={() => setModalAlert({ type: '', text: '' })}
                    />
                  )}

                  <div className="form-group">
                    <label>Judul Berita <span className="required">*</span></label>
                    <input
                      type="text"
                      value={formData.title}
                      onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                      required
                      placeholder="Masukkan judul berita"
                    />
                  </div>

                  <div className="form-row">
                    <div className="form-group">
                      <label>Kategori <span className="required">*</span></label>
                      <select value={formData.category} onChange={(e) => setFormData({ ...formData, category: e.target.value })} required>
                        <option value="event">Event</option>
                        <option value="promo">Promo</option>
                        <option value="info">Info</option>
                      </select>
                    </div>
                    <div className="form-group">
                      <label>Status <span className="required">*</span></label>
                      <select value={formData.status} onChange={(e) => setFormData({ ...formData, status: e.target.value })} required>
                        <option value="draft">Draft</option>
                        <option value="published">Published</option>
                      </select>
                    </div>
                  </div>

                  <div className="form-row">
                    <div className="form-group">
                      <label>Penulis <span className="required">*</span></label>
                      <input type="text" value={formData.author} onChange={(e) => setFormData({ ...formData, author: e.target.value })} required />
                    </div>
                    <div className="form-group">
                      <label>Tanggal Publish <span className="required">*</span></label>
                      <input type="date" value={formData.publishDate} onChange={(e) => setFormData({ ...formData, publishDate: e.target.value })} required />
                    </div>
                  </div>

                  <div className="form-group">
                    <label>Ringkasan (Excerpt)</label>
                    <input type="text" value={formData.excerpt} onChange={(e) => setFormData({ ...formData, excerpt: e.target.value })} placeholder="Ringkasan singkat berita" />
                  </div>

                  <div className="form-group">
                    <label>Gambar <span className="required">*</span></label>
                    <input
                      type="file"
                      accept="image/png,image/jpeg,image/jpg"
                      onChange={handleImageChange}
                      required={modalMode === "add"}
                    />
                    <small className="form-hint">Format: JPG, PNG (Maksimum 5MB)</small>
                    {imageFile && (
                      <small className="form-hint">File dipilih: {imageFile.name}</small>
                    )}
                    {formData.image && !imageFile && modalMode === "edit" && (
                      <small className="form-hint">Gambar saat ini sudah ada (tidak diubah jika tidak memilih file baru).</small>
                    )}
                  </div>

                  <div className="form-group">
                    <label>Konten Berita <span className="required">*</span></label>
                    <textarea value={formData.content} onChange={(e) => setFormData({ ...formData, content: e.target.value })} required rows={6} placeholder="Tulis konten berita lengkap di sini..." />
                  </div>
                </div>

                <div className="modal-actions">
                  <button type="button" className="btn-secondary-barizta" onClick={handleCloseModal} disabled={submitting || uploading}>Batal</button>
                  <button type="button" className="btn-barizta" disabled={submitting || uploading} onClick={handleSubmit}>
                    {uploading ? 'Mengupload...' : submitting ? "Menyimpan..." : modalMode === "add" ? "Tambah Berita" : "Simpan Perubahan"}
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      <DeleteConfirmModal
        isOpen={!!deletingNews}
        onClose={() => setDeletingNews(null)}
        onConfirm={handleDeleteConfirm}
        itemName={deletingNews?.title || ""}
        itemType="berita"
        isLoading={isDeleting}
      />
    </div>
  );
}
