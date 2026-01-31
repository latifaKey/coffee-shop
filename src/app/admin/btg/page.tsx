"use client";

import { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import "./btg.css";
import ActionButton, { ActionButtonGroup } from "@/components/admin/ActionButton";
import DeleteConfirmModal from "@/components/ui/DeleteConfirmModal";
import { SearchBar, Alert } from '@/components/ui';

// Types
interface Schedule {
  id: number;
  date: string;
  location: string;
  startTime: string;
  endTime: string;
  status: "scheduled" | "completed" | "cancelled";
  notes: string | null;
  contactWhatsapp: string;
  statusStay: "SUDAH_STAY" | "BELUM_STAY"; // Field baru untuk status stay
  mapsUrl: string | null; // Field baru untuk URL Google Maps
}

interface Menu {
  id: number;
  name: string;
  price: number;
  description: string | null;
  icon: string;
  isActive: boolean;
  order: number;
}

interface Gallery {
  id: number;
  image: string;
  caption: string | null;
  isLarge: boolean;
  order: number;
  isActive: boolean;
}

interface Feature {
  id: number;
  text: string;
  order: number;
  isActive: boolean;
}

interface Settings {
  // Contact & Social
  whatsapp: string;
  instagramHandle: string;
  // Operational Info
  operationalHours: string;
  targetMarket: string;
  // Hero Section
  heroTitle: string;
  heroSubtitle: string;
  // About Section
  aboutLabel: string;
  aboutTitle: string;
  aboutDescription: string;
  // Images
  logoImage: string;
  boothImage: string;
  boothBadgeText: string;
  // Menu Section
  menuLabel: string;
  menuTitle: string;
  // Gallery Section
  galleryLabel: string;
  galleryTitle: string;
  // CTA Section
  ctaTitle: string;
  ctaSubtitle: string;
  ctaButtonText: string;
  ctaWhatsappMessage: string;
}

type TabType = "jadwal" | "menu" | "galeri" | "fitur" | "pengaturan";

export default function BariztaToGo() {
  const [activeTab, setActiveTab] = useState<TabType>("jadwal");
  
  // Jadwal state
  const [schedules, setSchedules] = useState<Schedule[]>([]);
  
  // Menu state
  const [menus, setMenus] = useState<Menu[]>([]);
  
  // Gallery state
  const [gallery, setGallery] = useState<Gallery[]>([]);
  
  // Features state
  const [features, setFeatures] = useState<Feature[]>([]);
  
  // Settings state - ALL settings from public page
  const [settings, setSettings] = useState<Settings>({
    // Contact & Social
    whatsapp: "6281368236245",
    instagramHandle: "@barizta",
    // Operational Info
    operationalHours: "09.00 - 18.00 Setiap Hari",
    targetMarket: "Mahasiswa, Pekerja, Umum",
    // Hero Section
    heroTitle: "Barizta To Go",
    heroSubtitle: "Kopi berkualitas untuk masyarakat aktif",
    // About Section
    aboutLabel: "KONSEP KAMI",
    aboutTitle: "Gerobak Kopi Oranye Modern",
    aboutDescription: "Barizta To Go hadir dengan konsep kopi cepat saji berkualitas. Dengan gerobak oranye yang ikonik, kami membawa pengalaman ngopi premium langsung ke tempat Anda beraktivitas.",
    // Images
    logoImage: "/LOGO-BARIZTA-TOGO.png",
    boothImage: "/to-go.jpg",
    boothBadgeText: "📍 Booth Kami",
    // Menu Section
    menuLabel: "MENU",
    menuTitle: "Menu Andalan",
    // Gallery Section
    galleryLabel: "GALERI",
    galleryTitle: "Booth Kami",
    // CTA Section
    ctaTitle: "Ingin Pesan Kopi?",
    ctaSubtitle: "Hubungi kami untuk informasi lokasi booth hari ini",
    ctaButtonText: "☕ Pesan via WhatsApp",
    ctaWhatsappMessage: "Halo Barizta To Go! Saya ingin memesan kopi. Mohon informasi menu dan lokasi booth hari ini. Terima kasih! ☕",
  });

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState<"add" | "edit" | "detail">("add");
  const [selectedItem, setSelectedItem] = useState<Schedule | Menu | Gallery | Feature | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const [submitting, setSubmitting] = useState(false);
  const [deletingItem, setDeletingItem] = useState<{ type: string; item: Schedule | Menu | Gallery | Feature } | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Form states
  const [scheduleForm, setScheduleForm] = useState<Partial<Schedule>>({
    date: "", location: "", startTime: "", endTime: "", status: "scheduled", notes: "", contactWhatsapp: "",
    statusStay: "BELUM_STAY", mapsUrl: ""
  });
  
  const [menuForm, setMenuForm] = useState<Partial<Menu>>({
    name: "", price: 0, description: "", icon: "☕", isActive: true, order: 0
  });
  
  const [galleryForm, setGalleryForm] = useState<{
    caption: string; isLarge: boolean; order: number; isActive: boolean; imageFile: File | null;
  }>({ caption: "", isLarge: false, order: 0, isActive: true, imageFile: null });
  
  const [featureForm, setFeatureForm] = useState<Partial<Feature>>({
    text: "", order: 0, isActive: true
  });

  // Fetch functions
  const fetchSchedules = useCallback(async () => {
    try {
      const response = await fetch("/api/schedules");
      if (!response.ok) throw new Error("Failed to fetch schedules");
      const result = await response.json();
      // Handle both array and paginated response
      const data = Array.isArray(result) ? result : (result.data || []);
      setSchedules(data);
    } catch (err) {
      console.error("Fetch error:", err);
      setError("Gagal memuat jadwal");
    }
  }, []);

  const fetchMenus = useCallback(async () => {
    try {
      const response = await fetch("/api/admin/togo/menu");
      if (!response.ok) throw new Error("Failed to fetch menus");
      const result = await response.json();
      // Handle both array and paginated response
      const data = Array.isArray(result) ? result : (result.data || []);
      setMenus(data);
    } catch (err) {
      console.error("Fetch error:", err);
      setError("Gagal memuat menu");
    }
  }, []);

  const fetchGallery = useCallback(async () => {
    try {
      const response = await fetch("/api/admin/togo/gallery");
      if (!response.ok) throw new Error("Failed to fetch gallery");
      const result = await response.json();
      // Handle both array and paginated response
      const data = Array.isArray(result) ? result : (result.data || []);
      setGallery(data);
    } catch (err) {
      console.error("Fetch error:", err);
      setError("Gagal memuat galeri");
    }
  }, []);

  const fetchFeatures = useCallback(async () => {
    try {
      const response = await fetch("/api/admin/togo/features");
      if (!response.ok) throw new Error("Failed to fetch features");
      const result = await response.json();
      // Handle both array and paginated response
      const data = Array.isArray(result) ? result : (result.data || []);
      setFeatures(data);
    } catch (err) {
      console.error("Fetch error:", err);
      setError("Gagal memuat fitur");
    }
  }, []);

  const fetchSettings = useCallback(async () => {
    try {
      const response = await fetch("/api/admin/togo/settings");
      if (!response.ok) throw new Error("Failed to fetch settings");
      const data = await response.json();
      if (Object.keys(data).length > 0) {
        setSettings(prev => ({ ...prev, ...data }));
      }
    } catch (err) {
      console.error("Fetch error:", err);
    }
  }, []);

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      await Promise.all([
        fetchSchedules(),
        fetchMenus(),
        fetchGallery(),
        fetchFeatures(),
        fetchSettings(),
      ]);
      setLoading(false);
    };
    loadData();
  }, [fetchSchedules, fetchMenus, fetchGallery, fetchFeatures, fetchSettings]);

  // Modal handlers
  const handleOpenModal = (mode: "add" | "edit" | "detail", item?: Schedule | Menu | Gallery | Feature) => {
    setModalMode(mode);
    setError("");
    setSuccess("");
    setSelectedItem(item || null);
    
    if (activeTab === "jadwal") {
      if (item) {
        const s = item as Schedule;
        setScheduleForm({
          date: s.date?.split('T')[0] || "",
          location: s.location,
          startTime: s.startTime,
          endTime: s.endTime,
          status: s.status,
          notes: s.notes || "",
          contactWhatsapp: toLocalWhatsapp(s.contactWhatsapp),
          statusStay: s.statusStay || "BELUM_STAY",
          mapsUrl: s.mapsUrl || ""
        });
      } else {
        setScheduleForm({ date: "", location: "", startTime: "", endTime: "", status: "scheduled", notes: "", contactWhatsapp: "", statusStay: "BELUM_STAY", mapsUrl: "" });
      }
    } else if (activeTab === "menu") {
      if (item) {
        const m = item as Menu;
        setMenuForm({ name: m.name, price: m.price, description: m.description || "", icon: m.icon, isActive: m.isActive, order: m.order });
      } else {
        setMenuForm({ name: "", price: 0, description: "", icon: "☕", isActive: true, order: 0 });
      }
    } else if (activeTab === "galeri") {
      if (item) {
        const g = item as Gallery;
        setGalleryForm({ caption: g.caption || "", isLarge: g.isLarge, order: g.order, isActive: g.isActive, imageFile: null });
      } else {
        setGalleryForm({ caption: "", isLarge: false, order: 0, isActive: true, imageFile: null });
      }
    } else if (activeTab === "fitur") {
      if (item) {
        const f = item as Feature;
        setFeatureForm({ text: f.text, order: f.order, isActive: f.isActive });
      } else {
        setFeatureForm({ text: "", order: 0, isActive: true });
      }
    }
    
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setSelectedItem(null);
    setError("");
    setSuccess("");
  };

  // Save handlers
  const handleSaveSchedule = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setSubmitting(true);
    setError("");
    
    try {
      if (modalMode === "add") {
        const response = await fetch("/api/schedules", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(scheduleForm),
        });
        if (!response.ok) throw new Error("Failed to create schedule");
        setSuccess("Jadwal berhasil ditambahkan!");
      } else if (modalMode === "edit" && selectedItem) {
        const response = await fetch(`/api/schedules/${(selectedItem as Schedule).id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(scheduleForm),
        });
        if (!response.ok) throw new Error("Failed to update schedule");
        setSuccess("Jadwal berhasil diupdate!");
      }
      await fetchSchedules();
      setTimeout(() => handleCloseModal(), 1500);
    } catch (err) {
      console.error("Save error:", err);
      setError("Gagal menyimpan jadwal");
    } finally {
      setSubmitting(false);
    }
  };

  const handleSaveMenu = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setSubmitting(true);
    setError("");
    
    try {
      if (modalMode === "add") {
        const response = await fetch("/api/admin/togo/menu", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(menuForm),
        });
        if (!response.ok) throw new Error("Failed to create menu");
        setSuccess("Menu berhasil ditambahkan!");
      } else if (modalMode === "edit" && selectedItem) {
        const response = await fetch("/api/admin/togo/menu", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ ...menuForm, id: (selectedItem as Menu).id }),
        });
        if (!response.ok) throw new Error("Failed to update menu");
        setSuccess("Menu berhasil diupdate!");
      }
      await fetchMenus();
      setTimeout(() => handleCloseModal(), 1500);
    } catch (err) {
      console.error("Save error:", err);
      setError("Gagal menyimpan menu");
    } finally {
      setSubmitting(false);
    }
  };

  const handleSaveGallery = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setSubmitting(true);
    setError("");
    
    try {
      const formData = new FormData();
      formData.append("caption", galleryForm.caption);
      formData.append("isLarge", String(galleryForm.isLarge));
      formData.append("order", String(galleryForm.order));
      formData.append("isActive", String(galleryForm.isActive));
      if (galleryForm.imageFile) {
        formData.append("image", galleryForm.imageFile);
      }
      
      if (modalMode === "add") {
        if (!galleryForm.imageFile) {
          setError("Gambar wajib diupload");
          setSubmitting(false);
          return;
        }
        const response = await fetch("/api/admin/togo/gallery", {
          method: "POST",
          body: formData,
        });
        if (!response.ok) throw new Error("Failed to create gallery");
        setSuccess("Galeri berhasil ditambahkan!");
      } else if (modalMode === "edit" && selectedItem) {
        formData.append("id", String((selectedItem as Gallery).id));
        const response = await fetch("/api/admin/togo/gallery", {
          method: "PUT",
          body: formData,
        });
        if (!response.ok) throw new Error("Failed to update gallery");
        setSuccess("Galeri berhasil diupdate!");
      }
      await fetchGallery();
      setTimeout(() => handleCloseModal(), 1500);
    } catch (err) {
      console.error("Save error:", err);
      setError("Gagal menyimpan galeri");
    } finally {
      setSubmitting(false);
    }
  };

  const handleSaveFeature = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setSubmitting(true);
    setError("");
    
    try {
      if (modalMode === "add") {
        const response = await fetch("/api/admin/togo/features", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(featureForm),
        });
        if (!response.ok) throw new Error("Failed to create feature");
        setSuccess("Fitur berhasil ditambahkan!");
      } else if (modalMode === "edit" && selectedItem) {
        const response = await fetch("/api/admin/togo/features", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ ...featureForm, id: (selectedItem as Feature).id }),
        });
        if (!response.ok) throw new Error("Failed to update feature");
        setSuccess("Fitur berhasil diupdate!");
      }
      await fetchFeatures();
      setTimeout(() => handleCloseModal(), 1500);
    } catch (err) {
      console.error("Save error:", err);
      setError("Gagal menyimpan fitur");
    } finally {
      setSubmitting(false);
    }
  };

  const handleSaveSettings = async () => {
    setSubmitting(true);
    setError("");
    
    try {
      const response = await fetch("/api/admin/togo/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(settings),
      });
      if (!response.ok) throw new Error("Failed to save settings");
      setSuccess("Pengaturan berhasil disimpan!");
      setTimeout(() => setSuccess(""), 3000);
    } catch (err) {
      console.error("Save error:", err);
      setError("Gagal menyimpan pengaturan");
    } finally {
      setSubmitting(false);
    }
  };

  // Delete handlers
  const handleDeleteClick = (type: string, item: Schedule | Menu | Gallery | Feature) => {
    setDeletingItem({ type, item });
  };

  const handleDeleteConfirm = async () => {
    if (!deletingItem) return;

    setIsDeleting(true);
    const { type, item } = deletingItem;
    try {
      let url = "";
      if (type === "schedule") url = `/api/schedules/${item.id}`;
      else if (type === "menu") url = `/api/admin/togo/menu?id=${item.id}`;
      else if (type === "gallery") url = `/api/admin/togo/gallery?id=${item.id}`;
      else if (type === "feature") url = `/api/admin/togo/features?id=${item.id}`;
      
      const response = await fetch(url, { method: "DELETE" });
      if (!response.ok) throw new Error("Failed to delete");

      setSuccess("Item berhasil dihapus");
      setDeletingItem(null);
      if (type === "schedule") await fetchSchedules();
      else if (type === "menu") await fetchMenus();
      else if (type === "gallery") await fetchGallery();
      else if (type === "feature") await fetchFeatures();
      setTimeout(() => setSuccess(""), 3000);
    } catch (err) {
      console.error("Delete error:", err);
      setError("Gagal menghapus item");
      setTimeout(() => setError(""), 3000);
    } finally {
      setIsDeleting(false);
    }
  };

  const getDeleteItemName = () => {
    if (!deletingItem) return "";
    const { type, item } = deletingItem;
    if (type === "schedule") return `jadwal ${(item as Schedule).location}`;
    if (type === "menu") return `menu ${(item as Menu).name}`;
    if (type === "gallery") return `gambar galeri`;
    if (type === "feature") return `keunggulan "${(item as Feature).text}"`;
    return "item";
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(price);
  };

  const normalizeWhatsapp = (value: string) => {
    const digits = (value || "").replace(/\D/g, "");
    if (!digits) return "";
    if (digits.startsWith("62")) return digits;
    if (digits.startsWith("0")) return `62${digits.slice(1)}`;
    return `62${digits}`;
  };

  const formatWhatsappDisplay = (value: string) => {
    const normalized = normalizeWhatsapp(value);
    if (!normalized) return "-";
    const withoutCode = normalized.replace(/^62/, "");
    if (!withoutCode) return "+62";
    const groups = withoutCode.match(/.{1,4}/g);
    return `+62 ${groups ? groups.join("-") : withoutCode}`;
  };

  const toLocalWhatsapp = (value: string) => {
    const normalized = normalizeWhatsapp(value);
    if (!normalized) return "";
    return `0${normalized.slice(2)}`;
  };

  // Filter data
  const filteredSchedules = schedules
    .filter((s) => {
      const term = searchTerm.toLowerCase();
      const contact = s.contactWhatsapp?.toLowerCase() || "";
      const contactDisplay = formatWhatsappDisplay(s.contactWhatsapp).toLowerCase();
      const normalizedContact = normalizeWhatsapp(s.contactWhatsapp);
      const digitTerm = term.replace(/[^0-9]/g, "");
      const strippedDigitTerm = digitTerm.startsWith("0") ? digitTerm.slice(1) : digitTerm;
      const normalizedMatch = strippedDigitTerm
        ? normalizedContact.includes(strippedDigitTerm)
        : false;
      return (
        s.location.toLowerCase().includes(term) ||
        contact.includes(term) ||
        contactDisplay.includes(term) ||
        normalizedMatch
      );
    })
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  const filteredMenus = menus.filter(m => 
    m.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalPages = Math.ceil(
    (activeTab === "jadwal" ? filteredSchedules : activeTab === "menu" ? filteredMenus : gallery).length / itemsPerPage
  );

  const paginatedSchedules = filteredSchedules.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);
  const paginatedMenus = filteredMenus.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  if (loading) return null;

  return (
    <div className="barizta-container">
      <div className="page-header">
        <div>
          <h1>BARIZTA To Go</h1>
          <p>Kelola konten halaman Barizta To Go</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="tabs-container">
        <button className={`tab-btn ${activeTab === "jadwal" ? "active" : ""}`} onClick={() => { setActiveTab("jadwal"); setCurrentPage(1); setSearchTerm(""); }}>
          📅 Jadwal Lokasi
        </button>
        <button className={`tab-btn ${activeTab === "menu" ? "active" : ""}`} onClick={() => { setActiveTab("menu"); setCurrentPage(1); setSearchTerm(""); }}>
          ☕ Menu Andalan
        </button>
        <button className={`tab-btn ${activeTab === "galeri" ? "active" : ""}`} onClick={() => { setActiveTab("galeri"); setCurrentPage(1); }}>
          🖼️ Galeri
        </button>
        <button className={`tab-btn ${activeTab === "fitur" ? "active" : ""}`} onClick={() => { setActiveTab("fitur"); setCurrentPage(1); }}>
          ✓ Keunggulan
        </button>
        <button className={`tab-btn ${activeTab === "pengaturan" ? "active" : ""}`} onClick={() => setActiveTab("pengaturan")}>
          ⚙️ Pengaturan
        </button>
      </div>

      {success && !showModal && <Alert type="success" message={success} onClose={() => setSuccess("")} />}
      {error && !showModal && <Alert type="error" message={error} onClose={() => setError("")} />}

      {/* JADWAL TAB */}
      {activeTab === "jadwal" && (
        <>
          <div className="filter-section">
            <SearchBar
              value={searchTerm}
              onChange={(value) => setSearchTerm(value)}
              placeholder="Cari lokasi..."
            />
            <button className="btn-barizta" onClick={() => handleOpenModal("add")}>+ Tambah Jadwal</button>
          </div>

          <div className="table-container">
            <table className="data-table barizta-table">
              <thead>
                <tr>
                  <th>Lokasi</th>
                  <th>Waktu</th>
                  <th>Kontak WA</th>
                  <th>Status Stay</th>
                  <th>Aksi</th>
                </tr>
              </thead>
              <tbody>
                {paginatedSchedules.length > 0 ? paginatedSchedules.map((schedule) => (
                  <tr key={schedule.id}>
                    <td>{schedule.location}</td>
                    <td>{schedule.startTime} - {schedule.endTime}</td>
                    <td>
                      {schedule.contactWhatsapp ? (
                        <a
                          href={`https://wa.me/${normalizeWhatsapp(schedule.contactWhatsapp)}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="wa-link-table"
                        >
                          {formatWhatsappDisplay(schedule.contactWhatsapp)}
                        </a>
                      ) : (
                        <span className="muted-text">-</span>
                      )}
                    </td>
                    <td>
                      <span className={`badge-stay ${schedule.statusStay === "SUDAH_STAY" ? "badge-sudah-stay" : "badge-belum-stay"}`}>
                        {schedule.statusStay === "SUDAH_STAY" ? "Sudah Stay" : "Belum Stay"}
                      </span>
                    </td>
                    <td>
                      <ActionButtonGroup>
                        <ActionButton type="detail" onClick={() => handleOpenModal("detail", schedule)} />
                        <ActionButton type="edit" onClick={() => handleOpenModal("edit", schedule)} />
                        <ActionButton type="delete" onClick={() => handleDeleteClick("schedule", schedule)} />
                      </ActionButtonGroup>
                    </td>
                  </tr>
                )) : (
                  <tr><td colSpan={5} style={{ textAlign: 'center', padding: '2rem' }}>Tidak ada jadwal</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </>
      )}

      {/* MENU TAB */}
      {activeTab === "menu" && (
        <>
          <div className="filter-section">
            <SearchBar
              value={searchTerm}
              onChange={(value) => setSearchTerm(value)}
              placeholder="Cari menu..."
            />
            <button className="btn-barizta" onClick={() => handleOpenModal("add")}>+ Tambah Menu</button>
          </div>

          <div className="table-container">
            <table className="data-table barizta-table">
              <thead>
                <tr>
                  <th>Icon</th>
                  <th>Nama Menu</th>
                  <th>Harga</th>
                  <th>Deskripsi</th>
                  <th>Status</th>
                  <th>Urutan</th>
                  <th>Aksi</th>
                </tr>
              </thead>
              <tbody>
                {paginatedMenus.length > 0 ? paginatedMenus.map((menu) => (
                  <tr key={menu.id}>
                    <td style={{ fontSize: "1.5rem" }}>{menu.icon}</td>
                    <td><strong>{menu.name}</strong></td>
                    <td>{formatPrice(menu.price)}</td>
                    <td><small>{menu.description?.substring(0, 40)}{menu.description && menu.description.length > 40 ? '...' : ''}</small></td>
                    <td><span className={`status ${menu.isActive ? 'status-active' : 'status-inactive'}`}>{menu.isActive ? 'Aktif' : 'Nonaktif'}</span></td>
                    <td>{menu.order}</td>
                    <td>
                      <ActionButtonGroup>
                        <ActionButton type="edit" onClick={() => handleOpenModal("edit", menu)} />
                        <ActionButton type="delete" onClick={() => handleDeleteClick("menu", menu)} />
                      </ActionButtonGroup>
                    </td>
                  </tr>
                )) : (
                  <tr><td colSpan={7} style={{ textAlign: 'center', padding: '2rem' }}>Tidak ada menu</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </>
      )}

      {/* GALERI TAB */}
      {activeTab === "galeri" && (
        <>
          <div className="filter-section">
            <button className="btn-barizta" onClick={() => handleOpenModal("add")}>+ Tambah Foto</button>
          </div>

          <div className="gallery-admin-grid">
            {gallery.length > 0 ? gallery.map((item) => (
              <div key={item.id} className={`gallery-admin-card ${item.isLarge ? 'large' : ''} ${!item.isActive ? 'inactive' : ''}`}>
                <div className="gallery-image-wrapper">
                  <Image src={item.image} alt={item.caption || "Gallery"} width={300} height={200} style={{ objectFit: 'cover' }} unoptimized />
                  {!item.isActive && <div className="inactive-overlay">Nonaktif</div>}
                </div>
                <div className="gallery-info">
                  <p>{item.caption || "Tanpa caption"}</p>
                  <small>Urutan: {item.order} | {item.isLarge ? "Besar" : "Normal"}</small>
                </div>
                <div className="gallery-actions">
                  <ActionButton type="edit" onClick={() => handleOpenModal("edit", item)} />
                  <ActionButton type="delete" onClick={() => handleDeleteClick("gallery", item)} />
                </div>
              </div>
            )) : (
              <p style={{ textAlign: 'center', padding: '2rem', gridColumn: '1/-1' }}>Tidak ada foto galeri</p>
            )}
          </div>
        </>
      )}

      {/* FITUR TAB */}
      {activeTab === "fitur" && (
        <>
          <div className="filter-section">
            <button className="btn-barizta" onClick={() => handleOpenModal("add")}>+ Tambah Keunggulan</button>
          </div>

          <div className="table-container">
            <table className="data-table barizta-table">
              <thead>
                <tr>
                  <th>Urutan</th>
                  <th>Teks Keunggulan</th>
                  <th>Status</th>
                  <th>Aksi</th>
                </tr>
              </thead>
              <tbody>
                {features.length > 0 ? features.map((feature) => (
                  <tr key={feature.id}>
                    <td>{feature.order}</td>
                    <td><strong>✓ {feature.text}</strong></td>
                    <td><span className={`status ${feature.isActive ? 'status-active' : 'status-inactive'}`}>{feature.isActive ? 'Aktif' : 'Nonaktif'}</span></td>
                    <td>
                      <ActionButtonGroup>
                        <ActionButton type="edit" onClick={() => handleOpenModal("edit", feature)} />
                        <ActionButton type="delete" onClick={() => handleDeleteClick("feature", feature)} />
                      </ActionButtonGroup>
                    </td>
                  </tr>
                )) : (
                  <tr><td colSpan={4} style={{ textAlign: 'center', padding: '2rem' }}>Tidak ada keunggulan</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </>
      )}

      {/* PENGATURAN TAB */}
      {activeTab === "pengaturan" && (
        <div className="settings-form">
          {/* HERO SECTION */}
          <div className="form-section">
            <h3>🏠 Hero Section</h3>
            <div className="form-group">
              <label>Judul Hero</label>
              <input type="text" value={settings.heroTitle} onChange={(e) => setSettings({...settings, heroTitle: e.target.value})} placeholder="Barizta To Go" />
            </div>
            <div className="form-group">
              <label>Subtitle Hero</label>
              <input type="text" value={settings.heroSubtitle} onChange={(e) => setSettings({...settings, heroSubtitle: e.target.value})} placeholder="Kopi berkualitas untuk masyarakat aktif" />
            </div>
          </div>

          {/* ABOUT SECTION */}
          <div className="form-section">
            <h3>📝 About Section (Konsep Kami)</h3>
            <div className="form-group">
              <label>Label Section</label>
              <input type="text" value={settings.aboutLabel} onChange={(e) => setSettings({...settings, aboutLabel: e.target.value})} placeholder="KONSEP KAMI" />
            </div>
            <div className="form-group">
              <label>Judul About</label>
              <input type="text" value={settings.aboutTitle} onChange={(e) => setSettings({...settings, aboutTitle: e.target.value})} placeholder="Gerobak Kopi Oranye Modern" />
            </div>
            <div className="form-group">
              <label>Deskripsi About</label>
              <textarea value={settings.aboutDescription} onChange={(e) => setSettings({...settings, aboutDescription: e.target.value})} rows={4} placeholder="Deskripsi tentang Barizta To Go..." />
            </div>
          </div>

          {/* IMAGES */}
          <div className="form-section">
            <h3>🖼️ Gambar & Logo</h3>
            <div className="form-row">
              <div className="form-group">
                <label>URL Logo To Go</label>
                <input type="text" value={settings.logoImage} onChange={(e) => setSettings({...settings, logoImage: e.target.value})} placeholder="/LOGO-BARIZTA-TOGO.png" />
                {settings.logoImage && (
                  <div className="image-preview">
                    <Image src={settings.logoImage} alt="Logo Preview" width={100} height={100} style={{ objectFit: 'contain', marginTop: '8px' }} unoptimized />
                  </div>
                )}
              </div>
              <div className="form-group">
                <label>URL Gambar Booth</label>
                <input type="text" value={settings.boothImage} onChange={(e) => setSettings({...settings, boothImage: e.target.value})} placeholder="/to-go.jpg" />
                {settings.boothImage && (
                  <div className="image-preview">
                    <Image src={settings.boothImage} alt="Booth Preview" width={150} height={100} style={{ objectFit: 'cover', marginTop: '8px', borderRadius: '8px' }} unoptimized />
                  </div>
                )}
              </div>
            </div>
            <div className="form-group">
              <label>Teks Badge Booth</label>
              <input type="text" value={settings.boothBadgeText} onChange={(e) => setSettings({...settings, boothBadgeText: e.target.value})} placeholder="📍 Booth Kami" />
            </div>
          </div>

          {/* MENU SECTION LABELS */}
          <div className="form-section">
            <h3>☕ Section Menu</h3>
            <div className="form-row">
              <div className="form-group">
                <label>Label Section Menu</label>
                <input type="text" value={settings.menuLabel} onChange={(e) => setSettings({...settings, menuLabel: e.target.value})} placeholder="MENU" />
              </div>
              <div className="form-group">
                <label>Judul Section Menu</label>
                <input type="text" value={settings.menuTitle} onChange={(e) => setSettings({...settings, menuTitle: e.target.value})} placeholder="Menu Andalan" />
              </div>
            </div>
          </div>

          {/* GALLERY SECTION LABELS */}
          <div className="form-section">
            <h3>📷 Section Galeri</h3>
            <div className="form-row">
              <div className="form-group">
                <label>Label Section Galeri</label>
                <input type="text" value={settings.galleryLabel} onChange={(e) => setSettings({...settings, galleryLabel: e.target.value})} placeholder="GALERI" />
              </div>
              <div className="form-group">
                <label>Judul Section Galeri</label>
                <input type="text" value={settings.galleryTitle} onChange={(e) => setSettings({...settings, galleryTitle: e.target.value})} placeholder="Booth Kami" />
              </div>
            </div>
          </div>

          {/* OPERATIONAL INFO */}
          <div className="form-section">
            <h3>⏰ Informasi Operasional</h3>
            <div className="form-row">
              <div className="form-group">
                <label>Jam Operasional</label>
                <input type="text" value={settings.operationalHours} onChange={(e) => setSettings({...settings, operationalHours: e.target.value})} placeholder="09.00 - 18.00 Setiap Hari" />
              </div>
              <div className="form-group">
                <label>Target Market</label>
                <input type="text" value={settings.targetMarket} onChange={(e) => setSettings({...settings, targetMarket: e.target.value})} placeholder="Mahasiswa, Pekerja, Umum" />
              </div>
            </div>
          </div>

          {/* CONTACT & SOCIAL */}
          <div className="form-section">
            <h3>📱 Kontak & Sosial Media</h3>
            <div className="form-row">
              <div className="form-group">
                <label>Nomor WhatsApp (format: 628xxx)</label>
                <input type="text" value={settings.whatsapp} onChange={(e) => setSettings({...settings, whatsapp: e.target.value})} placeholder="6281368236245" />
              </div>
              <div className="form-group">
                <label>Handle Instagram</label>
                <input type="text" value={settings.instagramHandle} onChange={(e) => setSettings({...settings, instagramHandle: e.target.value})} placeholder="@barizta" />
              </div>
            </div>
          </div>

          {/* CTA SECTION */}
          <div className="form-section">
            <h3>🎯 CTA (Call to Action) Section</h3>
            <div className="form-row">
              <div className="form-group">
                <label>Judul CTA</label>
                <input type="text" value={settings.ctaTitle} onChange={(e) => setSettings({...settings, ctaTitle: e.target.value})} placeholder="Ingin Pesan Kopi?" />
              </div>
              <div className="form-group">
                <label>Subtitle CTA</label>
                <input type="text" value={settings.ctaSubtitle} onChange={(e) => setSettings({...settings, ctaSubtitle: e.target.value})} placeholder="Hubungi kami untuk informasi lokasi booth hari ini" />
              </div>
            </div>
            <div className="form-group">
              <label>Teks Tombol</label>
              <input type="text" value={settings.ctaButtonText} onChange={(e) => setSettings({...settings, ctaButtonText: e.target.value})} placeholder="☕ Pesan via WhatsApp" />
            </div>
            <div className="form-group">
              <label>Pesan WhatsApp Otomatis</label>
              <textarea value={settings.ctaWhatsappMessage} onChange={(e) => setSettings({...settings, ctaWhatsappMessage: e.target.value})} rows={3} placeholder="Halo Barizta To Go! Saya ingin memesan kopi..." />
            </div>
          </div>

          <button className="btn-barizta btn-save-settings" onClick={handleSaveSettings} disabled={submitting}>
            {submitting ? 'Menyimpan...' : '💾 Simpan Semua Pengaturan'}
          </button>
        </div>
      )}

      {/* Pagination */}
      {(activeTab === "jadwal" || activeTab === "menu") && totalPages > 1 && (
        <div className="pagination">
          <button onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1}>‹ Prev</button>
          <span className="page-info">Halaman {currentPage} dari {totalPages}</span>
          <button onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages}>Next ›</button>
        </div>
      )}

      {/* MODAL */}
      {showModal && (
        <div className="modal-overlay" onClick={handleCloseModal}>
          <div className="modal-container" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>
                {modalMode === "add" ? "Tambah " : modalMode === "edit" ? "Edit " : "Detail "}
                {activeTab === "jadwal" ? "Jadwal" : activeTab === "menu" ? "Menu" : activeTab === "galeri" ? "Foto Galeri" : "Keunggulan"}
              </h2>
              <button className="modal-close" onClick={handleCloseModal}>×</button>
            </div>
            
            {/* Schedule Form */}
            {activeTab === "jadwal" && modalMode !== "detail" && (
              <>
                <div className="modal-body">
                  {error && <div className="alert alert-error">{error}</div>}
                  {success && <div className="alert alert-success">{success}</div>}
                  <div className="form-group">
                    <label>Tanggal *</label>
                    <input type="date" value={scheduleForm.date} onChange={(e) => setScheduleForm({...scheduleForm, date: e.target.value})} required />
                  </div>
                  <div className="form-group">
                    <label>Lokasi *</label>
                    <input type="text" value={scheduleForm.location} onChange={(e) => setScheduleForm({...scheduleForm, location: e.target.value})} required placeholder="Masukkan lokasi booth" />
                  </div>
                  <div className="form-row">
                    <div className="form-group">
                      <label>Waktu Mulai *</label>
                      <input type="time" value={scheduleForm.startTime} onChange={(e) => setScheduleForm({...scheduleForm, startTime: e.target.value})} required />
                    </div>
                    <div className="form-group">
                      <label>Waktu Selesai *</label>
                      <input type="time" value={scheduleForm.endTime} onChange={(e) => setScheduleForm({...scheduleForm, endTime: e.target.value})} required />
                    </div>
                  </div>
                  <div className="form-group">
                    <label>Link Google Maps</label>
                    <input 
                      type="url" 
                      value={scheduleForm.mapsUrl || ""} 
                      onChange={(e) => setScheduleForm({...scheduleForm, mapsUrl: e.target.value})} 
                      placeholder="https://www.google.com/maps/embed?pb=..."
                    />
                    <small className="form-hint">Masukkan URL embed Google Maps (buka Google Maps → Share → Embed a map → salin src URL)</small>
                  </div>
                  <div className="form-group">
                    <label>Kontak WhatsApp *</label>
                    <input
                      type="tel"
                      value={scheduleForm.contactWhatsapp || ""}
                      onChange={(e) => setScheduleForm({ ...scheduleForm, contactWhatsapp: e.target.value })}
                      required
                      placeholder="Contoh: 0812 3456 7890"
                    />
                    <small className="form-hint">Nomor akan otomatis dikonversi ke format +62 saat disimpan</small>
                  </div>
                  <div className="form-row">
                    <div className="form-group">
                      <label>Status Jadwal *</label>
                      <select value={scheduleForm.status} onChange={(e) => setScheduleForm({...scheduleForm, status: e.target.value as Schedule["status"]})} required>
                        <option value="scheduled">Terjadwal</option>
                        <option value="completed">Selesai</option>
                        <option value="cancelled">Dibatalkan</option>
                      </select>
                    </div>
                    <div className="form-group">
                      <label>Status Stay *</label>
                      <select 
                        value={scheduleForm.statusStay} 
                        onChange={(e) => setScheduleForm({...scheduleForm, statusStay: e.target.value as Schedule["statusStay"]})} 
                        required
                        className="select-status-stay"
                      >
                        <option value="BELUM_STAY">Belum Stay</option>
                        <option value="SUDAH_STAY">Sudah Stay</option>
                      </select>
                      <small className="form-hint">Pilih &quot;Sudah Stay&quot; jika booth sudah berada di lokasi</small>
                    </div>
                  </div>
                  <div className="form-group">
                    <label>Catatan</label>
                    <textarea value={scheduleForm.notes || ''} onChange={(e) => setScheduleForm({...scheduleForm, notes: e.target.value})} rows={3} placeholder="Catatan tambahan (opsional)" />
                  </div>
                </div>
                <div className="modal-actions">
                  <button type="button" className="btn-secondary-barizta" onClick={handleCloseModal}>Batal</button>
                  <button type="button" className="btn-barizta" disabled={submitting} onClick={handleSaveSchedule}>{submitting ? 'Menyimpan...' : 'Simpan'}</button>
                </div>
              </>
            )}

            {/* Schedule Detail */}
            {activeTab === "jadwal" && modalMode === "detail" && selectedItem && (
              <div className="modal-body">
                <div className="detail-info">
                  <h3>{(selectedItem as Schedule).location}</h3>
                  <div className="detail-row"><span className="detail-label">Waktu:</span><span className="detail-value">{(selectedItem as Schedule).startTime} - {(selectedItem as Schedule).endTime}</span></div>
                  <div className="detail-row">
                    <span className="detail-label">Kontak WA:</span>
                    {(selectedItem as Schedule).contactWhatsapp ? (
                      <a
                        href={`https://wa.me/${normalizeWhatsapp((selectedItem as Schedule).contactWhatsapp)}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="wa-link-detail"
                      >
                        {formatWhatsappDisplay((selectedItem as Schedule).contactWhatsapp)}
                      </a>
                    ) : (
                      <span className="detail-value muted-text">-</span>
                    )}
                  </div>
                  <div className="detail-row">
                    <span className="detail-label">Status Stay:</span>
                    <span className={`badge-stay ${(selectedItem as Schedule).statusStay === "SUDAH_STAY" ? "badge-sudah-stay" : "badge-belum-stay"}`}>
                      {(selectedItem as Schedule).statusStay === "SUDAH_STAY" ? "Sudah Stay" : "Belum Stay"}
                    </span>
                  </div>
                  {(selectedItem as Schedule).mapsUrl && (
                    <div className="detail-row">
                      <span className="detail-label">Google Maps:</span>
                      <a href={(selectedItem as Schedule).mapsUrl || "#"} target="_blank" rel="noopener noreferrer" className="maps-link">
                        🗺️ Lihat di Maps
                      </a>
                    </div>
                  )}
                  {(selectedItem as Schedule).notes && <><div className="detail-row"><span className="detail-label">Catatan:</span></div><p className="detail-description">{(selectedItem as Schedule).notes}</p></>}
                </div>
                <div className="modal-actions">
                  <button type="button" className="btn-secondary-barizta" onClick={handleCloseModal}>Tutup</button>
                  <button type="button" className="btn-barizta" onClick={() => handleOpenModal("edit", selectedItem)}>Edit</button>
                </div>
              </div>
            )}

            {/* Menu Form */}
            {activeTab === "menu" && (
              <>
                <div className="modal-body">
                  {error && <div className="alert alert-error">{error}</div>}
                  {success && <div className="alert alert-success">{success}</div>}
                  <div className="form-row">
                    <div className="form-group" style={{ flex: '0 0 80px' }}>
                      <label>Icon</label>
                      <input type="text" value={menuForm.icon} onChange={(e) => setMenuForm({...menuForm, icon: e.target.value})} style={{ fontSize: '1.5rem', textAlign: 'center' }} />
                    </div>
                    <div className="form-group" style={{ flex: 1 }}>
                      <label>Nama Menu *</label>
                      <input type="text" value={menuForm.name} onChange={(e) => setMenuForm({...menuForm, name: e.target.value})} required placeholder="Nama menu" />
                    </div>
                  </div>
                  <div className="form-row">
                    <div className="form-group">
                      <label>Harga (Rp) *</label>
                      <input type="number" value={menuForm.price} onChange={(e) => setMenuForm({...menuForm, price: parseInt(e.target.value) || 0})} required min="0" />
                    </div>
                    <div className="form-group">
                      <label>Urutan</label>
                      <input type="number" value={menuForm.order} onChange={(e) => setMenuForm({...menuForm, order: parseInt(e.target.value) || 0})} min="0" />
                    </div>
                  </div>
                  <div className="form-group">
                    <label>Deskripsi</label>
                    <textarea value={menuForm.description || ""} onChange={(e) => setMenuForm({...menuForm, description: e.target.value})} rows={2} placeholder="Deskripsi singkat menu" />
                  </div>
                  <div className="form-group">
                    <label className="checkbox-label">
                      <input type="checkbox" checked={menuForm.isActive} onChange={(e) => setMenuForm({...menuForm, isActive: e.target.checked})} />
                      <span>Menu Aktif (tampil di website)</span>
                    </label>
                  </div>
                </div>
                <div className="modal-actions">
                  <button type="button" className="btn-secondary-barizta" onClick={handleCloseModal}>Batal</button>
                  <button type="button" className="btn-barizta" disabled={submitting} onClick={handleSaveMenu}>{submitting ? 'Menyimpan...' : 'Simpan'}</button>
                </div>
              </>
            )}

            {/* Gallery Form */}
            {activeTab === "galeri" && (
              <>
                <div className="modal-body">
                  {error && <div className="alert alert-error">{error}</div>}
                  {success && <div className="alert alert-success">{success}</div>}
                  <div className="form-group">
                    <label>Upload Gambar {modalMode === "add" ? "*" : "(kosongkan jika tidak diubah)"}</label>
                    <input
                      type="file"
                      accept="image/png,image/jpeg,image/jpg,image/webp"
                      onChange={(e) => {
                        const file = e.target.files?.[0] || null;
                        if (file && file.size > 5 * 1024 * 1024) {
                          setError("Ukuran file maksimal 5MB");
                          e.target.value = "";
                          setGalleryForm({ ...galleryForm, imageFile: null });
                          return;
                        }
                        setGalleryForm({ ...galleryForm, imageFile: file });
                      }}
                    />
                    <small className="form-hint">Format: JPG, PNG, WEBP (Maksimum 5MB)</small>
                    {galleryForm.imageFile && (
                      <small className="form-hint">File dipilih: {galleryForm.imageFile.name}</small>
                    )}
                    {modalMode === "edit" && selectedItem && !galleryForm.imageFile && (
                      <small className="form-hint">Gambar saat ini sudah ada (tidak diubah jika tidak memilih file baru).</small>
                    )}
                  </div>
                  <div className="form-group">
                    <label>Caption</label>
                    <input type="text" value={galleryForm.caption} onChange={(e) => setGalleryForm({...galleryForm, caption: e.target.value})} placeholder="Caption foto (opsional)" />
                  </div>
                  <div className="form-row">
                    <div className="form-group">
                      <label>Urutan</label>
                      <input type="number" value={galleryForm.order} onChange={(e) => setGalleryForm({...galleryForm, order: parseInt(e.target.value) || 0})} min="0" />
                    </div>
                    <div className="form-group">
                      <label className="checkbox-label">
                        <input type="checkbox" checked={galleryForm.isLarge} onChange={(e) => setGalleryForm({...galleryForm, isLarge: e.target.checked})} />
                        <span>Tampilan Besar</span>
                      </label>
                    </div>
                  </div>
                  <div className="form-group">
                    <label className="checkbox-label">
                      <input type="checkbox" checked={galleryForm.isActive} onChange={(e) => setGalleryForm({...galleryForm, isActive: e.target.checked})} />
                      <span>Foto Aktif (tampil di website)</span>
                    </label>
                  </div>
                </div>
                <div className="modal-actions">
                  <button type="button" className="btn-secondary-barizta" onClick={handleCloseModal}>Batal</button>
                  <button type="button" className="btn-barizta" disabled={submitting} onClick={handleSaveGallery}>{submitting ? 'Menyimpan...' : 'Simpan'}</button>
                </div>
              </>
            )}

            {/* Feature Form */}
            {activeTab === "fitur" && (
              <>
                <div className="modal-body">
                  {error && <div className="alert alert-error">{error}</div>}
                  {success && <div className="alert alert-success">{success}</div>}
                  <div className="form-group">
                    <label>Teks Keunggulan *</label>
                    <input type="text" value={featureForm.text} onChange={(e) => setFeatureForm({...featureForm, text: e.target.value})} required placeholder="Contoh: Kopi specialty dengan harga terjangkau" />
                  </div>
                  <div className="form-group">
                    <label>Urutan</label>
                    <input type="number" value={featureForm.order} onChange={(e) => setFeatureForm({...featureForm, order: parseInt(e.target.value) || 0})} min="0" />
                  </div>
                  <div className="form-group">
                    <label className="checkbox-label">
                      <input type="checkbox" checked={featureForm.isActive} onChange={(e) => setFeatureForm({...featureForm, isActive: e.target.checked})} />
                      <span>Keunggulan Aktif (tampil di website)</span>
                    </label>
                  </div>
                </div>
                <div className="modal-actions">
                  <button type="button" className="btn-secondary-barizta" onClick={handleCloseModal}>Batal</button>
                  <button type="button" className="btn-barizta" disabled={submitting} onClick={handleSaveFeature}>{submitting ? 'Menyimpan...' : 'Simpan'}</button>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      <DeleteConfirmModal
        isOpen={!!deletingItem}
        onClose={() => setDeletingItem(null)}
        onConfirm={handleDeleteConfirm}
        itemName={getDeleteItemName()}
        itemType=""
        isLoading={isDeleting}
      />
    </div>
  );
}
