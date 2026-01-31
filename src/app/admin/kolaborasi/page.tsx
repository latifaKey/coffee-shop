"use client";

import { useState, useEffect, useCallback } from "react";
import { useSearchParams } from "next/navigation";
import ImageUploader from "@/components/admin/ImageUploader";
import ActionButton, { ActionButtonGroup } from "@/components/admin/ActionButton";
import DeleteConfirmModal from "@/components/ui/DeleteConfirmModal";
import { SearchBar, FilterSelect, Alert } from '@/components/ui';
import "../admin.css";
import "./kolaborasi.css";

interface KolaborasiType {
  id: number;
  icon: string;
  title: string;
  titleEn: string | null;
  type: string;
  description: string;
  descriptionEn: string | null;
  image: string | null;
  order: number;
  isActive: boolean;
}

interface Partner {
  id: number;
  name: string;
  type: "supplier" | "investor" | "franchise" | "other";
  contactPerson: string;
  email: string;
  phone: string;
  address: string;
  status: "active" | "inactive";
  startDate: string;
  description: string;
  logo: string;
}

interface Settings {
  [key: string]: string;
}

// Common emoji icons for collaboration
const ICON_OPTIONS = ["🏢", "🛍️", "💰", "🤝", "☕", "🎓", "📦", "🌱", "🎯", "💼"];

export default function AdminKolaborasiPage() {
  const searchParams = useSearchParams();
  const tabFromUrl = searchParams.get("tab");
  
  const [activeTab, setActiveTab] = useState<"settings" | "types" | "partners">(
    tabFromUrl === "settings" ? "settings" : 
    tabFromUrl === "types" ? "types" : "partners"
  );
  const [settings, setSettings] = useState<Settings>({});
  const [types, setTypes] = useState<KolaborasiType[]>([]);
  const [partners, setPartners] = useState<Partner[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [alertMessage, setAlertMessage] = useState({ type: "", text: "" });
  
  // Modal state for types
  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState<"add" | "edit">("add");
  const [selectedType, setSelectedType] = useState<KolaborasiType | null>(null);
  const [deletingType, setDeletingType] = useState<KolaborasiType | null>(null);
  const [isDeletingType, setIsDeletingType] = useState(false);
  const [typeForm, setTypeForm] = useState({
    icon: "🤝",
    title: "",
    titleEn: "",
    type: "other",
    description: "",
    descriptionEn: "",
    image: "",
    order: 0,
    isActive: true,
  });

  // Partner modal state
  const [showPartnerModal, setShowPartnerModal] = useState(false);
  const [partnerModalMode, setPartnerModalMode] = useState<"add" | "edit" | "detail">("add");
  const [selectedPartner, setSelectedPartner] = useState<Partner | null>(null);
  
  // Set contactPerson default "-" karena inputnya disembunyikan
  const [partnerForm, setPartnerForm] = useState<Partial<Partner>>({
    name: "",
    type: "supplier",
    contactPerson: "-", 
    email: "",
    phone: "",
    address: "",
    status: "active",
    startDate: "",
    description: "",
    logo: ""
  });
  const [submitting, setSubmitting] = useState(false);

  // Partner filters
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState<string>("all");
  const [filterStatus, setFilterStatus] = useState<string>("all");

  // Delete confirmation modal state
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [partnerToDelete, setPartnerToDelete] = useState<Partner | null>(null);
  const [deleting, setDeleting] = useState(false);

  // Fetch settings
  const fetchSettings = useCallback(async () => {
    try {
      const res = await fetch("/api/kolaborasi/settings");
      if (res.ok) {
        const data = await res.json();
        setSettings(data);
      }
    } catch (error) {
      console.error("Error fetching settings:", error);
    }
  }, []);

  // Fetch types
  const fetchTypes = useCallback(async () => {
    try {
      const res = await fetch("/api/kolaborasi/types");
      if (res.ok) {
        const data = await res.json();
        setTypes(data);
      }
    } catch (error) {
      console.error("Error fetching types:", error);
    }
  }, []);

  // Fetch partners
  const fetchPartners = useCallback(async () => {
    try {
      const params = new URLSearchParams();
      if (filterType !== "all") params.append("type", filterType);
      if (filterStatus !== "all") params.append("status", filterStatus);

      const response = await fetch(`/api/partnerships?${params.toString()}`);
      if (response.ok) {
        const data = await response.json();
        // API returns { data: [...], pagination: {...} }
        setPartners(Array.isArray(data) ? data : (data.data || []));
      }
    } catch (error) {
      console.error("Error fetching partners:", error);
    }
  }, [filterType, filterStatus]);

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      await Promise.all([fetchSettings(), fetchTypes(), fetchPartners()]);
      setLoading(false);
    };
    loadData();
  }, [fetchSettings, fetchTypes, fetchPartners]);

  // Save settings
  const handleSaveSettings = async () => {
    setSaving(true);
    try {
      const res = await fetch("/api/kolaborasi/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(settings),
      });
      
      if (res.ok) {
        setAlertMessage({ type: "success", text: "Pengaturan berhasil disimpan!" });
      } else {
        throw new Error("Failed to save");
      }
    } catch {
      setAlertMessage({ type: "error", text: "Gagal menyimpan pengaturan" });
    } finally {
      setSaving(false);
      setTimeout(() => setAlertMessage({ type: "", text: "" }), 3000);
    }
  };

  // Handle setting change
  const handleSettingChange = (key: string, value: string) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };

  // Open modal for add/edit type
  const openTypeModal = (mode: "add" | "edit", type?: KolaborasiType) => {
    setModalMode(mode);
    if (type) {
      setSelectedType(type);
      setTypeForm({
        icon: type.icon,
        title: type.title,
        titleEn: type.titleEn || "",
        type: type.type,
        description: type.description,
        descriptionEn: type.descriptionEn || "",
        image: type.image || "",
        order: type.order,
        isActive: type.isActive,
      });
    } else {
      setSelectedType(null);
      setTypeForm({
        icon: "🤝",
        title: "",
        titleEn: "",
        type: "other",
        description: "",
        descriptionEn: "",
        image: "",
        order: types.length,
        isActive: true,
      });
    }
    setShowModal(true);
  };

  // Save type
  const handleSaveType = async () => {
    if (!typeForm.title || !typeForm.description) {
      setAlertMessage({ type: "error", text: "Judul dan deskripsi wajib diisi" });
      setTimeout(() => setAlertMessage({ type: "", text: "" }), 3000);
      return;
    }

    setSaving(true);
    try {
      const url = modalMode === "add" 
        ? "/api/kolaborasi/types" 
        : `/api/kolaborasi/types/${selectedType?.id}`;
      const method = modalMode === "add" ? "POST" : "PATCH";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(typeForm),
      });

      if (res.ok) {
        setAlertMessage({ 
          type: "success", 
          text: modalMode === "add" ? "Jenis kolaborasi berhasil ditambahkan!" : "Jenis kolaborasi berhasil diupdate!" 
        });
        setShowModal(false);
        fetchTypes();
      } else {
        throw new Error("Failed to save");
      }
    } catch {
      setAlertMessage({ type: "error", text: "Gagal menyimpan jenis kolaborasi" });
    } finally {
      setSaving(false);
      setTimeout(() => setAlertMessage({ type: "", text: "" }), 3000);
    }
  };

  // Delete type
  const handleDeleteTypeClick = (type: KolaborasiType) => {
    setDeletingType(type);
  };

  const handleDeleteTypeConfirm = async () => {
    if (!deletingType) return;

    setIsDeletingType(true);
    try {
      const res = await fetch(`/api/kolaborasi/types/${deletingType.id}`, { method: "DELETE" });
      if (res.ok) {
        setAlertMessage({ type: "success", text: "Jenis kolaborasi berhasil dihapus!" });
        setDeletingType(null);
        fetchTypes();
      } else {
        throw new Error("Failed to delete");
      }
    } catch {
      setAlertMessage({ type: "error", text: "Gagal menghapus jenis kolaborasi" });
    } finally {
      setIsDeletingType(false);
    }
    setTimeout(() => setAlertMessage({ type: "", text: "" }), 3000);
  };

  // Handle image upload for type
  const handleTypeImageUploaded = (filename: string) => {
    // ImageUploader now returns full path, use directly or add prefix if needed
    const imagePath = filename ? (filename.startsWith('/') ? filename : `/uploads/${filename}`) : "";
    setTypeForm(prev => ({ ...prev, image: imagePath }));
  };

  // ============= Partner Functions =============

  // Filter partners based on search term
  const filteredPartners = partners.filter(partner => {
    // Karena contact person disembunyikan, mungkin filter search hanya nama saja, 
    // tapi kalau mau tetap bisa dicari via contact person (meski hidden), biarkan saja.
    const matchesSearch = partner.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          partner.contactPerson.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesSearch;
  });

  // Open partner modal
  const openPartnerModal = (mode: "add" | "edit" | "detail", partner?: Partner) => {
    setPartnerModalMode(mode);
    if (partner) {
      setSelectedPartner(partner);
      setPartnerForm({
        ...partner,
        startDate: partner.startDate ? partner.startDate.split('T')[0] : ""
      });
    } else {
      setSelectedPartner(null);
      setPartnerForm({
        name: "",
        type: "supplier",
        contactPerson: "-", // Default strip saat add new agar tidak error
        email: "",
        phone: "",
        address: "",
        status: "active",
        startDate: "",
        description: "",
        logo: ""
      });
    }
    setShowPartnerModal(true);
  };

  // Close partner modal
  const closePartnerModal = () => {
    setShowPartnerModal(false);
    setSelectedPartner(null);
  };

  // Handle partner logo upload
  const handlePartnerLogoUploaded = (filename: string) => {
    // ImageUploader now returns full path, use directly or add prefix if needed
    const logoPath = filename ? (filename.startsWith('/') ? filename : `/uploads/${filename}`) : "";
    setPartnerForm(prev => ({ ...prev, logo: logoPath }));
  };

  // Save partner
  const handleSavePartner = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setSubmitting(true);
    
    try {
      if (partnerModalMode === "add") {
        const response = await fetch("/api/partnerships", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(partnerForm),
        });

        if (!response.ok) {
          const errData = await response.json();
          throw new Error(errData.error || "Failed to create partnership");
        }

        setAlertMessage({ type: 'success', text: 'Mitra berhasil ditambahkan!' });
        await fetchPartners();
      } else if (partnerModalMode === "edit" && selectedPartner) {
        const response = await fetch(`/api/partnerships/${selectedPartner.id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(partnerForm),
        });

        if (!response.ok) {
          const errData = await response.json();
          throw new Error(errData.error || "Failed to update partnership");
        }

        await fetchPartners();
        setAlertMessage({ type: 'success', text: 'Mitra berhasil diupdate!' });
      }
      
      setTimeout(() => {
        closePartnerModal();
        setAlertMessage({ type: '', text: '' });
      }, 1500);
    } catch (err) {
      console.error("Save error:", err);
      setAlertMessage({ type: 'error', text: err instanceof Error ? err.message : 'Gagal menyimpan data' });
      setTimeout(() => setAlertMessage({ type: '', text: '' }), 4000);
    } finally {
      setSubmitting(false);
    }
  };

  // Open delete confirmation modal
  const openDeleteModal = (partner: Partner) => {
    setPartnerToDelete(partner);
    setShowDeleteModal(true);
  };

  // Close delete confirmation modal
  const closeDeleteModal = () => {
    setShowDeleteModal(false);
    setPartnerToDelete(null);
  };

  // Delete partner - now called from modal
  const handleConfirmDelete = async () => {
    if (!partnerToDelete) return;
    
    setDeleting(true);
    try {
      const response = await fetch(`/api/partnerships/${partnerToDelete.id}`, {
        method: "DELETE",
      });

      if (!response.ok) throw new Error("Failed to delete partnership");

      setAlertMessage({ type: 'success', text: 'Mitra berhasil dihapus' });
      closeDeleteModal();
      await fetchPartners();
      setTimeout(() => setAlertMessage({ type: '', text: '' }), 4000);
    } catch (err) {
      console.error("Delete error:", err);
      setAlertMessage({ type: 'error', text: 'Gagal menghapus mitra' });
      setTimeout(() => setAlertMessage({ type: '', text: '' }), 4000);
    } finally {
      setDeleting(false);
    }
  };

  // Get type badge for partner
  const getPartnerTypeBadge = (type: string) => {
    const badges = {
      supplier: { label: "Supplier", class: "partner-type-supplier" },
      investor: { label: "Investor", class: "partner-type-investor" },
      franchise: { label: "Franchise", class: "partner-type-franchise" },
      other: { label: "Lainnya", class: "partner-type-other" }
    };
    return badges[type as keyof typeof badges] || badges.other;
  };

  // Format date
  const formatPartnerDate = (dateString: string) => {
    if (!dateString) return "-";
    return new Date(dateString).toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  };

  // Truncate text
  const truncateText = (text: string, maxLength: number) => {
    if (!text) return "-";
    return text.length > maxLength ? text.substring(0, maxLength) + "..." : text;
  };

  if (loading) {
    return (
      <div className="admin-page">
        <div className="loading-state">
          <div className="loading-spinner"></div>
          <p>Memuat data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-page">
      <div className="page-header">
        <div className="header-content">
          <h1>🤝 Kelola Kolaborasi</h1>
          <p>Atur konten halaman kolaborasi dan jenis kerjasama</p>
        </div>
      </div>

      {/* Alert - gunakan shared .alert-toast agar konsisten dengan halaman lain */}
      {alertMessage.text && (
        <div style={{ position: 'fixed', top: '80px', right: '20px', zIndex: 9999, minWidth: '300px' }}>
          <Alert
            type={alertMessage.type as 'success' | 'error'}
            message={alertMessage.text}
            onClose={() => setAlertMessage({ type: '', text: '' })}
          />
        </div>
      )}

      {/* Tabs - Like Kelas Edukasi */}
      <div className="kolaborasi-tabs-container">
        
        <button 
          className={`kolaborasi-tab-button ${activeTab === "partners" ? "active" : ""}`}
          onClick={() => setActiveTab("partners")}
        >
          <span>🤝</span>
          Data Mitra
        </button>
        <button 
          className={`kolaborasi-tab-button ${activeTab === "types" ? "active" : ""}`}
          onClick={() => setActiveTab("types")}
        >
          <span>📋</span>
          Jenis Kolaborasi
        </button>
        <button 
          className={`kolaborasi-tab-button ${activeTab === "settings" ? "active" : ""}`}
          onClick={() => setActiveTab("settings")}
        >
          <span>⚙️</span>
          Pengaturan Konten
        </button>
      </div>

      {/* Settings Tab */}
      {activeTab === "settings" && (
        <div className="settings-content">
          {/* Hero Section */}
          <div className="card" style={{ marginBottom: "24px" }}>
            <div className="card-header">
              <h3>🎯 Hero Section</h3>
            </div>
            <div className="card-body">
              <div className="form-row">
                <div className="form-group">
                  <label>Judul (ID)</label>
                  <input
                    type="text"
                    value={settings.hero_title_id || ""}
                    onChange={(e) => handleSettingChange("hero_title_id", e.target.value)}
                  />
                </div>
                <div className="form-group">
                  <label>Judul (EN)</label>
                  <input
                    type="text"
                    value={settings.hero_title_en || ""}
                    onChange={(e) => handleSettingChange("hero_title_en", e.target.value)}
                  />
                </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Deskripsi (ID)</label>
                  <textarea
                    value={settings.hero_description_id || ""}
                    onChange={(e) => handleSettingChange("hero_description_id", e.target.value)}
                    rows={2}
                  />
                </div>
                <div className="form-group">
                  <label>Deskripsi (EN)</label>
                  <textarea
                    value={settings.hero_description_en || ""}
                    onChange={(e) => handleSettingChange("hero_description_en", e.target.value)}
                    rows={2}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Intro Section */}
          <div className="card" style={{ marginBottom: "24px" }}>
            <div className="card-header">
              <h3>📝 Intro Section</h3>
            </div>
            <div className="card-body">
              <div className="form-group">
                <label>Badge</label>
                <input
                  type="text"
                  value={settings.intro_badge || ""}
                  onChange={(e) => handleSettingChange("intro_badge", e.target.value)}
                  placeholder="🤝 PARTNERSHIP"
                />
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Heading (ID)</label>
                  <input
                    type="text"
                    value={settings.intro_heading_id || ""}
                    onChange={(e) => handleSettingChange("intro_heading_id", e.target.value)}
                  />
                </div>
                <div className="form-group">
                  <label>Heading (EN)</label>
                  <input
                    type="text"
                    value={settings.intro_heading_en || ""}
                    onChange={(e) => handleSettingChange("intro_heading_en", e.target.value)}
                  />
                </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Isi (ID)</label>
                  <textarea
                    value={settings.intro_body_id || ""}
                    onChange={(e) => handleSettingChange("intro_body_id", e.target.value)}
                    rows={3}
                  />
                </div>
                <div className="form-group">
                  <label>Isi (EN)</label>
                  <textarea
                    value={settings.intro_body_en || ""}
                    onChange={(e) => handleSettingChange("intro_body_en", e.target.value)}
                    rows={3}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Section Labels */}
          <div className="card" style={{ marginBottom: "24px" }}>
            <div className="card-header">
              <h3>🏷️ Label Section</h3>
            </div>
            <div className="card-body">
              <div className="form-row">
                <div className="form-group">
                  <label>Label Jenis Kolaborasi (ID)</label>
                  <input
                    type="text"
                    value={settings.types_label_id || ""}
                    onChange={(e) => handleSettingChange("types_label_id", e.target.value)}
                  />
                </div>
                <div className="form-group">
                  <label>Label Jenis Kolaborasi (EN)</label>
                  <input
                    type="text"
                    value={settings.types_label_en || ""}
                    onChange={(e) => handleSettingChange("types_label_en", e.target.value)}
                  />
                </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Heading Jenis Kolaborasi (ID)</label>
                  <input
                    type="text"
                    value={settings.types_heading_id || ""}
                    onChange={(e) => handleSettingChange("types_heading_id", e.target.value)}
                  />
                </div>
                <div className="form-group">
                  <label>Heading Jenis Kolaborasi (EN)</label>
                  <input
                    type="text"
                    value={settings.types_heading_en || ""}
                    onChange={(e) => handleSettingChange("types_heading_en", e.target.value)}
                  />
                </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Label Mitra (ID)</label>
                  <input
                    type="text"
                    value={settings.partners_label_id || ""}
                    onChange={(e) => handleSettingChange("partners_label_id", e.target.value)}
                  />
                </div>
                <div className="form-group">
                  <label>Label Mitra (EN)</label>
                  <input
                    type="text"
                    value={settings.partners_label_en || ""}
                    onChange={(e) => handleSettingChange("partners_label_en", e.target.value)}
                  />
                </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Heading Mitra (ID)</label>
                  <input
                    type="text"
                    value={settings.partners_heading_id || ""}
                    onChange={(e) => handleSettingChange("partners_heading_id", e.target.value)}
                  />
                </div>
                <div className="form-group">
                  <label>Heading Mitra (EN)</label>
                  <input
                    type="text"
                    value={settings.partners_heading_en || ""}
                    onChange={(e) => handleSettingChange("partners_heading_en", e.target.value)}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* CTA Section */}
          <div className="card" style={{ marginBottom: "24px" }}>
            <div className="card-header">
              <h3>📢 CTA Section</h3>
            </div>
            <div className="card-body">
              <div className="form-row">
                <div className="form-group">
                  <label>Heading CTA (ID)</label>
                  <input
                    type="text"
                    value={settings.cta_heading_id || ""}
                    onChange={(e) => handleSettingChange("cta_heading_id", e.target.value)}
                  />
                </div>
                <div className="form-group">
                  <label>Heading CTA (EN)</label>
                  <input
                    type="text"
                    value={settings.cta_heading_en || ""}
                    onChange={(e) => handleSettingChange("cta_heading_en", e.target.value)}
                  />
                </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Deskripsi CTA (ID)</label>
                  <input
                    type="text"
                    value={settings.cta_description_id || ""}
                    onChange={(e) => handleSettingChange("cta_description_id", e.target.value)}
                  />
                </div>
                <div className="form-group">
                  <label>Deskripsi CTA (EN)</label>
                  <input
                    type="text"
                    value={settings.cta_description_en || ""}
                    onChange={(e) => handleSettingChange("cta_description_en", e.target.value)}
                  />
                </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Teks Tombol (ID)</label>
                  <input
                    type="text"
                    value={settings.cta_button_id || ""}
                    onChange={(e) => handleSettingChange("cta_button_id", e.target.value)}
                  />
                </div>
                <div className="form-group">
                  <label>Teks Tombol (EN)</label>
                  <input
                    type="text"
                    value={settings.cta_button_en || ""}
                    onChange={(e) => handleSettingChange("cta_button_en", e.target.value)}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Contact Settings */}
          <div className="card" style={{ marginBottom: "24px" }}>
            <div className="card-header">
              <h3>📱 Pengaturan Kontak</h3>
            </div>
            <div className="card-body">
              <div className="form-group">
                <label>Nomor WhatsApp</label>
                <input
                  type="text"
                  value={settings.whatsapp_number || ""}
                  onChange={(e) => handleSettingChange("whatsapp_number", e.target.value)}
                  placeholder="6281234567890"
                />
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Pesan Kontak (ID)</label>
                  <textarea
                    value={settings.contact_message_id || ""}
                    onChange={(e) => handleSettingChange("contact_message_id", e.target.value)}
                    rows={3}
                  />
                </div>
                <div className="form-group">
                  <label>Pesan Kontak (EN)</label>
                  <textarea
                    value={settings.contact_message_en || ""}
                    onChange={(e) => handleSettingChange("contact_message_en", e.target.value)}
                    rows={3}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Save Button */}
          <div style={{ textAlign: "right" }}>
            <button 
              className="btn-barizta"
              onClick={handleSaveSettings}
              disabled={saving}
            >
              <span>💾</span>
              {saving ? "Menyimpan..." : "Simpan Pengaturan"}
            </button>
          </div>
        </div>
      )}

      {/* Types Tab */}
      {activeTab === "types" && (
        <div className="types-content">
          <div className="kolaborasi-section-header">
            <h2>Kelola Jenis Kolaborasi</h2>
            <button className="btn-barizta" onClick={() => openTypeModal("add")}>
              <span>+</span>
              Tambah Jenis
            </button>
          </div>

          {types.length === 0 ? (
            <div className="empty-state">
              <span className="empty-icon">📋</span>
              <h3>Belum ada jenis kolaborasi</h3>
              <p>Tambahkan jenis kolaborasi pertama Anda</p>
              <button className="btn-barizta" onClick={() => openTypeModal("add")}>
                <span>+</span>
                Tambah Jenis Kolaborasi
              </button>
            </div>
          ) : (
            <div className="table-container">
              <table className="data-table barizta-table">
                <thead>
                  <tr>
                    <th>Icon</th>
                    <th>Judul</th>
                    <th>Tipe</th>
                    <th>Gambar</th>
                    <th>Status</th>
                    <th>Aksi</th>
                  </tr>
                </thead>
                <tbody>
                  {types.map((type) => (
                    <tr key={type.id}>
                      <td style={{ fontSize: "1.5rem", textAlign: "center" }}>{type.icon}</td>
                      <td>
                        <div>
                          <strong>{type.title}</strong>
                          {type.titleEn && <div style={{ fontSize: "0.85rem", color: "#999" }}>{type.titleEn}</div>}
                        </div>
                      </td>
                      <td>
                        <span className={`type-badge type-${type.type}`}>
                          {type.type}
                        </span>
                      </td>
                      <td>
                        {type.image ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img 
                            src={type.image} 
                            alt={type.title}
                            style={{ width: "80px", height: "50px", objectFit: "cover", borderRadius: "4px" }}
                          />
                        ) : (
                          <span style={{ color: "#999" }}>-</span>
                        )}
                      </td>
                      <td>
                        <span className={`status-pill ${type.isActive ? "status-active" : "status-inactive"}`}>
                          {type.isActive ? "Aktif" : "Nonaktif"}
                        </span>
                      </td>
                      <td>
                        <ActionButtonGroup>
                          <ActionButton
                            type="edit"
                            onClick={() => openTypeModal("edit", type)}
                          />
                          <ActionButton
                            type="delete"
                            onClick={() => handleDeleteTypeClick(type)}
                          />
                        </ActionButtonGroup>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Partners Tab */}
      {activeTab === "partners" && (
        <div className="partners-content">
          <div className="kolaborasi-section-header">
            <h2>Kelola Data Mitra</h2>
            <button className="btn-barizta" onClick={() => openPartnerModal("add")}>
              <span>+</span>
              Tambah Mitra
            </button>
          </div>

          {/* Partner Filters */}
          <div className="partner-filter-section">
            <SearchBar
              value={searchTerm}
              onChange={(value) => setSearchTerm(value)}
              placeholder="Cari nama mitra..."
            />
            <FilterSelect
              value={filterType}
              onChange={(value) => setFilterType(value)}
              options={[
                { value: 'all', label: 'Semua Tipe' },
                { value: 'supplier', label: 'Supplier' },
                { value: 'investor', label: 'Investor' },
                { value: 'franchise', label: 'Franchise' },
                { value: 'other', label: 'Lainnya' }
              ]}
            />
            <FilterSelect
              value={filterStatus}
              onChange={(value) => setFilterStatus(value)}
              options={[
                { value: 'all', label: 'Semua Status' },
                { value: 'active', label: 'Aktif' },
                { value: 'inactive', label: 'Tidak Aktif' }
              ]}
            />
          </div>

          {/* Partners Table */}
          <div className="partner-table-container">
            <div className="partner-table-wrapper">
              {filteredPartners.length > 0 ? (
                <table className="data-table barizta-table">
                  <thead>
                    <tr>
                      <th style={{ width: "70px" }}>Logo</th>
                      <th>Nama Mitra</th>
                      <th>Tipe</th>
                      {/* <th>Kontak Person</th> */}
                      <th>Email</th>
                      <th>Telepon</th>
                      <th>Mulai</th>
                      <th>Status</th>
                      <th style={{ width: "120px" }}>Aksi</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredPartners.map((partner) => (
                      <tr key={partner.id}>
                        <td>
                          <div className="partner-table-logo">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img 
                              src={partner.logo && partner.logo.startsWith('/') ? partner.logo : partner.logo ? `/uploads/${partner.logo}` : "/images/partners/default-partner.svg"} 
                              alt={partner.name}
                            />
                          </div>
                        </td>
                        <td>
                          <div className="partner-table-title-cell">
                            <span className="partner-table-title">{partner.name}</span>
                            <span className="partner-table-description">
                              {truncateText(partner.description, 40)}
                            </span>
                          </div>
                        </td>
                        <td>
                          <span className={`partner-type-badge ${getPartnerTypeBadge(partner.type).class}`}>
                            {getPartnerTypeBadge(partner.type).label}
                          </span>
                        </td>
                        {/* <td>{partner.contactPerson}</td> */}
                        <td className="partner-email-cell">{partner.email}</td>
                        <td>{partner.phone}</td>
                        <td>{formatPartnerDate(partner.startDate)}</td>
                        <td>
                          <span className={`partner-status-pill ${partner.status === "active" ? "partner-status-active" : "partner-status-inactive"}`}>
                            {partner.status === "active" ? "Aktif" : "Tidak Aktif"}
                          </span>
                        </td>
                        <td>
                          <ActionButtonGroup>
                            <ActionButton type="detail" onClick={() => openPartnerModal("detail", partner)} />
                            <ActionButton type="edit" onClick={() => openPartnerModal("edit", partner)} />
                            <ActionButton type="delete" onClick={() => openDeleteModal(partner)} />
                          </ActionButtonGroup>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <div className="partner-empty-state">
                  {searchTerm || filterType !== "all" || filterStatus !== "all"
                    ? <>
                        <h3>Tidak Ditemukan</h3>
                        <p>Tidak ada mitra yang cocok dengan filter</p>
                      </>
                    : <>
                        <h3>Belum Ada Mitra</h3>
                        <p>Tambahkan mitra baru untuk memulai!</p>
                        <button className="btn-barizta" style={{ marginTop: "1rem" }} onClick={() => openPartnerModal("add")}>
                          <span>+</span>
                          Tambah Mitra
                        </button>
                      </>
                  }
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Modal for Add/Edit Type */}
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-container" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>{modalMode === "add" ? "Tambah Jenis Kolaborasi" : "Edit Jenis Kolaborasi"}</h2>
              <button className="modal-close" onClick={() => setShowModal(false)}>×</button>
            </div>
            <div className="modal-body">
              <div className="form-row">
                <div className="form-group" style={{ flex: "0 0 100px" }}>
                  <label>Icon</label>
                  <select
                    value={typeForm.icon}
                    onChange={(e) => setTypeForm({ ...typeForm, icon: e.target.value })}
                    style={{ fontSize: "1.5rem", textAlign: "center" }}
                  >
                    {ICON_OPTIONS.map((icon) => (
                      <option key={icon} value={icon}>{icon}</option>
                    ))}
                  </select>
                </div>
                <div className="form-group">
                  <label>Tipe Kategori</label>
                  <select
                    value={typeForm.type}
                    onChange={(e) => setTypeForm({ ...typeForm, type: e.target.value })}
                  >
                    <option value="franchise">Franchise/Corporate</option>
                    <option value="supplier">Supplier/UMKM</option>
                    <option value="investor">Investor</option>
                    <option value="other">Lainnya</option>
                  </select>
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Judul (ID) *</label>
                  <input
                    type="text"
                    value={typeForm.title}
                    onChange={(e) => setTypeForm({ ...typeForm, title: e.target.value })}
                    placeholder="Brand & Corporate"
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Judul (EN)</label>
                  <input
                    type="text"
                    value={typeForm.titleEn}
                    onChange={(e) => setTypeForm({ ...typeForm, titleEn: e.target.value })}
                    placeholder="Brand & Corporate"
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Deskripsi (ID) *</label>
                  <textarea
                    value={typeForm.description}
                    onChange={(e) => setTypeForm({ ...typeForm, description: e.target.value })}
                    placeholder="Deskripsi jenis kolaborasi..."
                    rows={3}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Deskripsi (EN)</label>
                  <textarea
                    value={typeForm.descriptionEn}
                    onChange={(e) => setTypeForm({ ...typeForm, descriptionEn: e.target.value })}
                    placeholder="Collaboration type description..."
                    rows={3}
                  />
                </div>
              </div>

              <div className="form-group">
                <label>Gambar</label>
                <ImageUploader
                  initialPreview={typeForm.image || null}
                  onUploaded={handleTypeImageUploaded}
                  onUploadError={(msg) => {
                    setAlertMessage({ type: 'error', text: msg });
                    setTimeout(() => setAlertMessage({ type: '', text: '' }), 4000);
                  }}
                />
              </div>

              <div className="form-row">
                <div className="form-group" style={{ flex: "0 0 100px" }}>
                  <label>Urutan</label>
                  <input
                    type="number"
                    value={typeForm.order}
                    onChange={(e) => setTypeForm({ ...typeForm, order: parseInt(e.target.value) || 0 })}
                    min={0}
                  />
                </div>
                <div className="form-group checkbox-group">
                  <label className="checkbox-label compact">
                    <input
                      type="checkbox"
                      checked={typeForm.isActive}
                      onChange={(e) => setTypeForm({ ...typeForm, isActive: e.target.checked })}
                    />
                    Aktifkan tipe kolaborasi ini
                  </label>
                </div>
              </div>
            </div>
            <div className="modal-actions">
              <button className="btn-secondary-barizta" onClick={() => setShowModal(false)}>
                Batal
              </button>
              <button className="btn-barizta" onClick={handleSaveType} disabled={saving}>
                {saving ? "Menyimpan..." : (modalMode === "add" ? "Tambah" : "Simpan")}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal for Partner Add/Edit/Detail */}
      {showPartnerModal && (
        <div className="modal-overlay" onClick={closePartnerModal}>
          <div className="modal-container" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>
                {partnerModalMode === "add" ? "Tambah Mitra Baru" : 
                 partnerModalMode === "edit" ? "Edit Mitra" : "Detail Mitra"}
              </h2>
              <button className="modal-close" onClick={closePartnerModal}>×</button>
            </div>
            
            {partnerModalMode === "detail" ? (
              <div className="modal-body">
                <div className="partner-detail-grid">
                  <div className="partner-detail-image">
                    {selectedPartner?.logo && (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img 
                        src={selectedPartner.logo.startsWith('/') ? selectedPartner.logo : `/uploads/${selectedPartner.logo}`} 
                        alt={selectedPartner.name}
                        style={{ width: '120px', height: '120px', objectFit: 'contain', borderRadius: '8px' }}
                      />
                    )}
                  </div>
                  <div className="partner-detail-info">
                    <h3>{selectedPartner?.name}</h3>
                    <div className="partner-detail-row">
                      <span className="partner-detail-label">Tipe:</span>
                      <span className={`partner-type-badge ${getPartnerTypeBadge(selectedPartner?.type || '').class}`}>
                        {getPartnerTypeBadge(selectedPartner?.type || '').label}
                      </span>
                    </div>
                    <div className="partner-detail-row">
                      <span className="partner-detail-label">Status:</span>
                      <span className={`partner-status-pill ${selectedPartner?.status === "active" ? "partner-status-active" : "partner-status-inactive"}`}>
                        {selectedPartner?.status === "active" ? "Aktif" : "Tidak Aktif"}
                      </span>
                    </div>
                    {/* <div className="partner-detail-row">
                      <span className="partner-detail-label">Kontak Person:</span>
                      <span className="partner-detail-value">{selectedPartner?.contactPerson}</span>
                    </div> */}
                    <div className="partner-detail-row">
                      <span className="partner-detail-label">Email:</span>
                      <span className="partner-detail-value">{selectedPartner?.email}</span>
                    </div>
                    <div className="partner-detail-row">
                      <span className="partner-detail-label">Telepon:</span>
                      <span className="partner-detail-value">{selectedPartner?.phone}</span>
                    </div>
                    <div className="partner-detail-row">
                      <span className="partner-detail-label">Alamat:</span>
                      <span className="partner-detail-value">{selectedPartner?.address}</span>
                    </div>
                    <div className="partner-detail-row">
                      <span className="partner-detail-label">Mulai Kerja Sama:</span>
                      <span className="partner-detail-value">{formatPartnerDate(selectedPartner?.startDate || "")}</span>
                    </div>
                    <div className="partner-detail-row">
                      <span className="partner-detail-label">Deskripsi:</span>
                    </div>
                    <p className="partner-detail-description">{selectedPartner?.description}</p>
                  </div>
                </div>
                <div className="modal-actions">
                  <button type="button" className="btn-secondary-barizta" onClick={closePartnerModal}>
                    Tutup
                  </button>
                  <button type="button" className="btn-barizta" onClick={() => {
                    if (selectedPartner) openPartnerModal("edit", selectedPartner);
                  }}>
                    Edit Mitra
                  </button>
                </div>
              </div>
            ) : (
              <>
                <div className="modal-body">
                  <div className="form-group">
                    <label>Nama Mitra *</label>
                    <input
                      type="text"
                      value={partnerForm.name}
                      onChange={(e) => setPartnerForm({ ...partnerForm, name: e.target.value })}
                      required
                      placeholder="Nama perusahaan/mitra"
                    />
                  </div>
                  <div className="form-row">
                    <div className="form-group">
                      <label>Tipe Kolaborasi *</label>
                      <select
                        value={partnerForm.type}
                        onChange={(e) => setPartnerForm({ ...partnerForm, type: e.target.value as "supplier" | "investor" | "franchise" | "other" })}
                        required
                      >
                        <option value="supplier">Supplier</option>
                        <option value="investor">Investor</option>
                        <option value="franchise">Franchise</option>
                        <option value="other">Lainnya</option>
                      </select>
                    </div>
                    <div className="form-group">
                      <label>Status *</label>
                      <select
                        value={partnerForm.status}
                        onChange={(e) => setPartnerForm({ ...partnerForm, status: e.target.value as "active" | "inactive" })}
                        required
                      >
                        <option value="active">Aktif</option>
                        <option value="inactive">Tidak Aktif</option>
                      </select>
                    </div>
                  </div>
                  <div className="form-row">
                    {/* <div className="form-group">
                      <label>Kontak Person *</label>
                      <input
                        type="text"
                        value={partnerForm.contactPerson}
                        onChange={(e) => setPartnerForm({ ...partnerForm, contactPerson: e.target.value })}
                        required
                        placeholder="Nama kontak"
                      />
                    </div> */}
                    <div className="form-group">
                      <label>Tanggal Mulai *</label>
                      <input
                        type="date"
                        value={partnerForm.startDate}
                        onChange={(e) => setPartnerForm({ ...partnerForm, startDate: e.target.value })}
                        required
                      />
                    </div>
                  </div>
                  <div className="form-row">
                    <div className="form-group">
                      <label>Email *</label>
                      <input
                        type="email"
                        value={partnerForm.email}
                        onChange={(e) => setPartnerForm({ ...partnerForm, email: e.target.value })}
                        required
                        placeholder="email@example.com"
                      />
                    </div>
                    <div className="form-group">
                      <label>Telepon *</label>
                      <input
                        type="tel"
                        value={partnerForm.phone}
                        onChange={(e) => setPartnerForm({ ...partnerForm, phone: e.target.value })}
                        required
                        placeholder="+62..."
                      />
                    </div>
                  </div>
                  <div className="form-group">
                    <label>Alamat *</label>
                    <input
                      type="text"
                      value={partnerForm.address}
                      onChange={(e) => setPartnerForm({ ...partnerForm, address: e.target.value })}
                      required
                      placeholder="Alamat lengkap"
                    />
                  </div>
                  <div className="form-group">
                    <label>Deskripsi *</label>
                    <textarea
                      value={partnerForm.description}
                      onChange={(e) => setPartnerForm({ ...partnerForm, description: e.target.value })}
                      rows={4}
                      required
                      placeholder="Deskripsi kerjasama..."
                    />
                  </div>
                  <div className="form-group">
                    <label>Logo Mitra</label>
                    <ImageUploader 
                      initialPreview={partnerForm.logo || null}
                      onUploaded={handlePartnerLogoUploaded}
                      onUploadError={(msg) => {
                        setAlertMessage({ type: 'error', text: msg });
                        setTimeout(() => setAlertMessage({ type: '', text: '' }), 4000);
                      }}
                    />
                  </div>
                </div>
                <div className="modal-actions">
                  <button type="button" className="btn-secondary-barizta" onClick={closePartnerModal}>
                    Batal
                  </button>
                  <button type="button" className="btn-barizta" disabled={submitting} onClick={handleSavePartner}>
                    {submitting ? 'Menyimpan...' : (partnerModalMode === "add" ? "Tambah Mitra" : "Simpan Perubahan")}
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* Modal: Delete Confirmation - Standardized */}
      <DeleteConfirmModal
        isOpen={showDeleteModal && !!partnerToDelete}
        onClose={closeDeleteModal}
        onConfirm={handleConfirmDelete}
        itemName={partnerToDelete?.name || ""}
        itemType="mitra"
      />

      {/* Delete Type Confirmation Modal */}
      <DeleteConfirmModal
        isOpen={!!deletingType}
        onClose={() => setDeletingType(null)}
        onConfirm={handleDeleteTypeConfirm}
        itemName={deletingType?.title || ""}
        itemType="jenis kolaborasi"
        isLoading={isDeletingType}
      />
    </div>
  );
}