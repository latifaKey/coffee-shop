"use client";

import { useState, useEffect, useCallback } from "react";
import "./users.css";

interface User {
  id: number;
  name: string;
  email: string;
  role: string;
  phone: string | null;
  createdAt: string;
}

interface PaginationInfo {
  currentPage: number;
  totalPages: number;
  totalUsers: number;
  limit: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

export default function DaftarPengguna() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState<PaginationInfo>({
    currentPage: 1,
    totalPages: 1,
    totalUsers: 0,
    limit: 10,
    hasNextPage: false,
    hasPrevPage: false,
  });

  // Filter & Search state
  const [searchTerm, setSearchTerm] = useState("");
  const [filterRole, setFilterRole] = useState<string>("all");
  const [debouncedSearch, setDebouncedSearch] = useState("");

  // Debounce search input
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchTerm);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  // Fetch users from API
  const fetchUsers = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const params = new URLSearchParams();
      if (debouncedSearch) params.append("search", debouncedSearch);
      if (filterRole !== "all") params.append("role", filterRole);
      params.append("page", pagination.currentPage.toString());
      params.append("limit", "10");

      const response = await fetch(`/api/admin/users?${params.toString()}`);

      if (!response.ok) {
        if (response.status === 403) {
          throw new Error("Akses ditolak. Anda tidak memiliki izin untuk melihat data ini.");
        }
        throw new Error("Gagal memuat data pengguna");
      }

      const result = await response.json();

      if (result.success) {
        setUsers(result.data.users);
        setPagination(result.data.pagination);
      } else {
        throw new Error(result.error || "Gagal memuat data pengguna");
      }
    } catch (err) {
      console.error("Fetch error:", err);
      setError(err instanceof Error ? err.message : "Terjadi kesalahan");
    } finally {
      setLoading(false);
    }
  }, [debouncedSearch, filterRole, pagination.currentPage]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  // Reset to page 1 when filters change
  useEffect(() => {
    setPagination(prev => ({ ...prev, currentPage: 1 }));
  }, [debouncedSearch, filterRole]);

  // Format date helper
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("id-ID", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  // Get role badge class
  const getRoleBadgeClass = (role: string) => {
    switch (role.toLowerCase()) {
      case "admin":
        return "role-badge role-admin";
      case "member":
        return "role-badge role-member";
      default:
        return "role-badge";
    }
  };

  // Handle page change
  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= pagination.totalPages) {
      setPagination(prev => ({ ...prev, currentPage: newPage }));
    }
  };

  return (
    <div className="users-page">
      {/* Page Header */}
      <div className="page-header">
        <div className="header-info">
          <h1 className="page-title">
            <span className="title-icon">👥</span>
            Daftar Pengguna Terdaftar
          </h1>
          <p className="page-subtitle">
            Lihat daftar semua pengguna yang terdaftar di sistem BARIZTA
          </p>
        </div>
        <div className="header-stats">
          <div className="stat-card">
            <span className="stat-number">{pagination.totalUsers}</span>
            <span className="stat-label">Total Pengguna</span>
          </div>
        </div>
      </div>

      {/* Info Banner */}
      <div className="info-banner">
        <span className="info-icon">ℹ️</span>
        <span className="info-text">
          Halaman ini hanya untuk melihat data pengguna. Tidak ada fungsi untuk menambah, mengubah, atau menghapus pengguna.
        </span>
      </div>

      {/* Filters Section */}
      <div className="filters-section">
        <div className="search-box">
          <span className="search-icon">🔍</span>
          <input
            type="text"
            placeholder="Cari nama atau email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
          {searchTerm && (
            <button
              className="clear-search"
              onClick={() => setSearchTerm("")}
              aria-label="Hapus pencarian"
            >
              ✕
            </button>
          )}
        </div>

        <div className="filter-box">
          <label className="filter-label">Role:</label>
          <select
            value={filterRole}
            onChange={(e) => setFilterRole(e.target.value)}
            className="filter-select"
          >
            <option value="all">Semua Role</option>
            <option value="admin">Admin</option>
            <option value="member">Member</option>
          </select>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="error-message">
          <span className="error-icon">⚠️</span>
          <span>{error}</span>
        </div>
      )}

      {/* Users Table */}
      <div className="table-container">
        {loading ? (
          <div className="loading-state">
            <div className="spinner"></div>
            <p>Memuat data pengguna...</p>
          </div>
        ) : users.length === 0 ? (
          <div className="empty-state">
            <span className="empty-icon">📭</span>
            <h3>Tidak Ada Data</h3>
            <p>
              {debouncedSearch || filterRole !== "all"
                ? "Tidak ditemukan pengguna yang sesuai dengan filter."
                : "Belum ada pengguna terdaftar."}
            </p>
          </div>
        ) : (
          <table className="data-table barizta-table">
            <thead>
              <tr>
                <th className="th-no">No</th>
                <th className="th-name">Nama Lengkap</th>
                <th className="th-email">Email</th>
                <th className="th-phone">No. Telepon</th>
                <th className="th-role">Role</th>
                <th className="th-date">Tanggal Daftar</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user, index) => (
                <tr key={user.id}>
                  <td className="td-no">
                    {(pagination.currentPage - 1) * pagination.limit + index + 1}
                  </td>
                  <td className="td-name">
                    <div className="user-info">
                      <div className="user-avatar">
                        {user.name.charAt(0).toUpperCase()}
                      </div>
                      <span className="user-name">{user.name}</span>
                    </div>
                  </td>
                  <td className="td-email">{user.email}</td>
                  <td className="td-phone">{user.phone || "-"}</td>
                  <td className="td-role">
                    <span className={getRoleBadgeClass(user.role)}>
                      {user.role.toUpperCase()}
                    </span>
                  </td>
                  <td className="td-date">{formatDate(user.createdAt)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Pagination */}
      {!loading && users.length > 0 && pagination.totalPages > 1 && (
        <div className="pagination-section">
          <div className="pagination-info">
            Menampilkan {(pagination.currentPage - 1) * pagination.limit + 1} -{" "}
            {Math.min(pagination.currentPage * pagination.limit, pagination.totalUsers)} dari{" "}
            {pagination.totalUsers} pengguna
          </div>
          <div className="pagination-controls">
            <button
              className="pagination-btn"
              onClick={() => handlePageChange(1)}
              disabled={!pagination.hasPrevPage}
              title="Halaman pertama"
            >
              ««
            </button>
            <button
              className="pagination-btn"
              onClick={() => handlePageChange(pagination.currentPage - 1)}
              disabled={!pagination.hasPrevPage}
              title="Halaman sebelumnya"
            >
              «
            </button>

            {/* Page Numbers */}
            {Array.from({ length: pagination.totalPages }, (_, i) => i + 1)
              .filter(page => {
                const current = pagination.currentPage;
                return page === 1 || 
                       page === pagination.totalPages || 
                       (page >= current - 1 && page <= current + 1);
              })
              .map((page, index, arr) => (
                <span key={page}>
                  {index > 0 && arr[index - 1] !== page - 1 && (
                    <span className="pagination-ellipsis">...</span>
                  )}
                  <button
                    className={`pagination-btn ${page === pagination.currentPage ? "active" : ""}`}
                    onClick={() => handlePageChange(page)}
                  >
                    {page}
                  </button>
                </span>
              ))}

            <button
              className="pagination-btn"
              onClick={() => handlePageChange(pagination.currentPage + 1)}
              disabled={!pagination.hasNextPage}
              title="Halaman berikutnya"
            >
              »
            </button>
            <button
              className="pagination-btn"
              onClick={() => handlePageChange(pagination.totalPages)}
              disabled={!pagination.hasNextPage}
              title="Halaman terakhir"
            >
              »»
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
