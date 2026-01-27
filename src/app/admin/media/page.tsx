"use client";

import { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import DeleteConfirmModal from "@/components/ui/DeleteConfirmModal";
import "./media.css";

interface MediaFile {
  id: number;
  name: string;
  path: string;
  size: number;
  type: string;
  folder: string;
  caption?: string;
  createdAt: string;
}

export default function GaleriMedia() {
  const [files, setFiles] = useState<MediaFile[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [selectedFolder, setSelectedFolder] = useState("all");
  const [uploading, setUploading] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedFile, setSelectedFile] = useState<MediaFile | null>(null);
  const [editCaption, setEditCaption] = useState("");
  const [deletingFile, setDeletingFile] = useState<MediaFile | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const folders = [
    { value: "all", label: "Semua" },
    { value: "hero", label: "Hero" },
    { value: "instagram", label: "Instagram" },
    { value: "news", label: "Berita" },
    { value: "promo", label: "Promo" },
    { value: "about", label: "Tentang Kami" },
    { value: "menu", label: "Menu" },
    { value: "uploads", label: "Uploads" }
  ];

  // Fetch files from API
  const fetchFiles = useCallback(async () => {
    try {
      setLoading(true);
      const url = selectedFolder === "all" 
        ? "/api/media" 
        : `/api/media?folder=${selectedFolder}`;
      
      const response = await fetch(url);
      if (!response.ok) throw new Error("Failed to fetch media");
      
      const result = await response.json();
      // Handle both array and paginated response
      const data = Array.isArray(result) ? result : (result.data || []);
      setFiles(data);
      setError("");
    } catch (err) {
      console.error("Error loading files:", err);
      setError("Gagal memuat file media");
    } finally {
      setLoading(false);
    }
  }, [selectedFolder]);

  useEffect(() => {
    fetchFiles();
  }, [fetchFiles]);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setUploading(true);
      setError("");

      const formData = new FormData();
      formData.append("file", file);
      formData.append("folder", selectedFolder !== "all" ? selectedFolder : "uploads");

      const response = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Upload failed");
      }

      const result = await response.json();
      
      // Save to database
      await fetch("/api/media", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: result.fileName || file.name,
          path: result.filePath || `/uploads/${result.fileName}`,
          type: file.type,
          folder: selectedFolder !== "all" ? selectedFolder : "uploads",
          size: file.size,
        }),
      });

      setSuccess(`File ${result.fileName || file.name} berhasil diupload!`);
      await fetchFiles();
      setTimeout(() => setSuccess(""), 3000);
    } catch (err) {
      console.error("Upload error:", err);
      setError(err instanceof Error ? err.message : "Gagal mengupload file");
      setTimeout(() => setError(""), 3000);
    } finally {
      setUploading(false);
      // Reset input
      e.target.value = "";
    }
  };

  const handleDeleteClick = (file: MediaFile) => {
    setDeletingFile(file);
  };

  const handleDeleteConfirm = async () => {
    if (!deletingFile) return;

    setIsDeleting(true);
    try {
      const response = await fetch(`/api/media/${deletingFile.id}`, {
        method: "DELETE",
      });

      if (!response.ok) throw new Error("Failed to delete");

      setSuccess("File berhasil dihapus");
      setDeletingFile(null);
      await fetchFiles();
      setTimeout(() => setSuccess(""), 3000);
    } catch (err) {
      console.error("Delete error:", err);
      setError("Gagal menghapus file");
      setTimeout(() => setError(""), 3000);
    } finally {
      setIsDeleting(false);
    }
  };

  const handleEditCaption = (file: MediaFile) => {
    setSelectedFile(file);
    setEditCaption(file.caption || "");
    setShowEditModal(true);
  };

  const handleSaveCaption = async () => {
    if (!selectedFile) return;

    try {
      const response = await fetch(`/api/media/${selectedFile.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ caption: editCaption }),
      });

      if (!response.ok) throw new Error("Failed to update");

      setSuccess("Caption berhasil diupdate");
      setShowEditModal(false);
      await fetchFiles();
      setTimeout(() => setSuccess(""), 3000);
    } catch (err) {
      console.error("Update error:", err);
      setError("Gagal mengupdate caption");
      setTimeout(() => setError(""), 3000);
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + " B";
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB";
    return (bytes / (1024 * 1024)).toFixed(1) + " MB";
  };

  const copyToClipboard = (path: string) => {
    navigator.clipboard.writeText(path);
    setSuccess("Path disalin ke clipboard!");
    setTimeout(() => setSuccess(""), 2000);
  };

  return (
    <div className="media-container" style={{ padding: "1.5rem" }}>
      {/* Page Header */}
      <div className="page-header" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem" }}>
        <div>
          <h1 style={{ color: "#ffd7a8", margin: 0 }}>🖼️ Galeri Media</h1>
          <p style={{ color: "#a0a0a0", margin: "0.5rem 0 0 0" }}>Upload dan kelola gambar untuk website</p>
        </div>
        <label 
          className="btn-primary" 
          style={{ 
            background: "linear-gradient(180deg, #8B4513, #6B3A19)", 
            color: "#fff", 
            padding: "0.75rem 1.5rem", 
            borderRadius: "8px", 
            cursor: "pointer",
            display: "inline-flex",
            alignItems: "center",
            gap: "0.5rem"
          }}
        >
          {uploading ? "Mengupload..." : "📤 Upload Gambar"}
          <input 
            type="file" 
            accept="image/*" 
            onChange={handleUpload}
            style={{ display: "none" }}
            disabled={uploading}
          />
        </label>
      </div>

      {/* Alerts */}
      {success && (
        <div className="alert alert-success">
          {success}
        </div>
      )}
      {error && (
        <div className="alert alert-error">
          {error}
        </div>
      )}

      {/* Filter */}
      <div style={{ marginBottom: "1.5rem" }}>
        <select 
          value={selectedFolder}
          onChange={(e) => setSelectedFolder(e.target.value)}
          style={{ 
            padding: "0.75rem 1rem", 
            background: "#3e2723", 
            color: "#fff", 
            border: "1px solid #5d4037", 
            borderRadius: "6px",
            minWidth: "200px"
          }}
        >
          {folders.map(f => (
            <option key={f.value} value={f.value}>{f.label}</option>
          ))}
        </select>
      </div>

      {/* File Grid */}
      {loading ? (
        <div style={{ textAlign: "center", padding: "3rem", color: "#a0a0a0" }}>
          Memuat file...
        </div>
      ) : files.length === 0 ? (
        <div style={{ textAlign: "center", padding: "3rem", color: "#a0a0a0" }}>
          Tidak ada file media
        </div>
      ) : (
        <div style={{ 
          display: "grid", 
          gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))", 
          gap: "1.5rem" 
        }}>
          {files.map((file) => (
            <div 
              key={file.id}
              style={{ 
                background: "linear-gradient(145deg, #3e2723, #2c1810)", 
                border: "2px solid #5d4037", 
                borderRadius: "12px",
                overflow: "hidden"
              }}
            >
              <div style={{ position: "relative", height: "150px", background: "#1a0e0a" }}>
                <Image
                  src={file.path}
                  alt={file.name}
                  fill
                  style={{ objectFit: "cover" }}
                  unoptimized
                />
                <span style={{
                  position: "absolute",
                  top: "8px",
                  right: "8px",
                  background: "rgba(0,0,0,0.7)",
                  color: "#d4a574",
                  padding: "4px 8px",
                  borderRadius: "4px",
                  fontSize: "0.7rem"
                }}>
                  {file.folder}
                </span>
              </div>
              <div style={{ padding: "1rem" }}>
                <p style={{ 
                  color: "#fff", 
                  margin: "0 0 0.25rem 0", 
                  fontSize: "0.9rem",
                  whiteSpace: "nowrap",
                  overflow: "hidden",
                  textOverflow: "ellipsis"
                }}>
                  {file.name}
                </p>
                {file.caption && (
                  <p style={{ color: "#a0a0a0", margin: "0 0 0.5rem 0", fontSize: "0.75rem", fontStyle: "italic" }}>
                    {file.caption}
                  </p>
                )}
                <p style={{ color: "#a0a0a0", margin: "0 0 0.75rem 0", fontSize: "0.8rem" }}>
                  {formatFileSize(file.size)}
                </p>
                <div style={{ display: "flex", gap: "0.5rem" }}>
                  <button
                    onClick={() => copyToClipboard(file.path)}
                    style={{
                      flex: 1,
                      padding: "0.5rem",
                      background: "rgba(139, 69, 19, 0.3)",
                      border: "1px solid #8B4513",
                      color: "#d4a574",
                      borderRadius: "6px",
                      cursor: "pointer",
                      fontSize: "0.75rem"
                    }}
                  >
                    📋 Salin
                  </button>
                  <button
                    onClick={() => handleEditCaption(file)}
                    style={{
                      padding: "0.5rem",
                      background: "rgba(33, 150, 243, 0.2)",
                      border: "1px solid #2196F3",
                      color: "#64b5f6",
                      borderRadius: "6px",
                      cursor: "pointer",
                      fontSize: "0.75rem"
                    }}
                  >
                    ✏️
                  </button>
                  <button
                    onClick={() => handleDeleteClick(file)}
                    style={{
                      padding: "0.5rem",
                      background: "rgba(244, 67, 54, 0.2)",
                      border: "1px solid #f44336",
                      color: "#ef5350",
                      borderRadius: "6px",
                      cursor: "pointer",
                      fontSize: "0.75rem"
                    }}
                  >
                    🗑️
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Edit Caption Modal */}
      {showEditModal && selectedFile && (
        <div style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: "rgba(0,0,0,0.8)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          zIndex: 1000
        }}>
          <div style={{
            background: "linear-gradient(145deg, #3e2723, #2c1810)",
            border: "2px solid #5d4037",
            borderRadius: "12px",
            padding: "2rem",
            width: "90%",
            maxWidth: "500px"
          }}>
            <h3 style={{ color: "#ffd7a8", margin: "0 0 1.5rem 0" }}>✏️ Edit Caption</h3>
            <p style={{ color: "#a0a0a0", marginBottom: "1rem" }}>{selectedFile.name}</p>
            <textarea
              value={editCaption}
              onChange={(e) => setEditCaption(e.target.value)}
              placeholder="Masukkan caption..."
              style={{
                width: "100%",
                padding: "0.75rem",
                background: "#1a0e0a",
                border: "1px solid #5d4037",
                color: "#fff",
                borderRadius: "8px",
                minHeight: "100px",
                resize: "vertical"
              }}
            />
            <div style={{ display: "flex", gap: "1rem", marginTop: "1.5rem", justifyContent: "flex-end" }}>
              <button
                onClick={() => setShowEditModal(false)}
                style={{
                  padding: "0.75rem 1.5rem",
                  background: "transparent",
                  border: "1px solid #5d4037",
                  color: "#a0a0a0",
                  borderRadius: "8px",
                  cursor: "pointer"
                }}
              >
                Batal
              </button>
              <button
                onClick={handleSaveCaption}
                style={{
                  padding: "0.75rem 1.5rem",
                  background: "linear-gradient(180deg, #8B4513, #6B3A19)",
                  border: "none",
                  color: "#fff",
                  borderRadius: "8px",
                  cursor: "pointer"
                }}
              >
                Simpan
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Usage Tips */}
      <div style={{ 
        marginTop: "2rem", 
        padding: "1.5rem", 
        background: "rgba(139, 69, 19, 0.1)", 
        border: "1px solid #5d4037", 
        borderRadius: "12px" 
      }}>
        <h3 style={{ color: "#ffd7a8", margin: "0 0 1rem 0" }}>💡 Tips Penggunaan</h3>
        <ul style={{ color: "#a0a0a0", margin: 0, paddingLeft: "1.5rem" }}>
          <li>Klik &quot;Salin&quot; untuk mendapatkan path gambar</li>
          <li>Gunakan path tersebut di form produk, berita, atau halaman lainnya</li>
          <li>Format yang didukung: JPG, PNG, WebP, GIF</li>
          <li>Tidak ada batasan ukuran file</li>
        </ul>
      </div>

      {/* Delete Confirmation Modal */}
      <DeleteConfirmModal
        isOpen={!!deletingFile}
        onClose={() => setDeletingFile(null)}
        onConfirm={handleDeleteConfirm}
        itemName={deletingFile?.name || ""}
        itemType="file"
        isLoading={isDeleting}
      />
    </div>
  );
}
