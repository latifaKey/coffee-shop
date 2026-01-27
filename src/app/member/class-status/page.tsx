"use client";

import { useState, useEffect } from "react";
import "./class-status.css";

interface Registration {
  id: number;
  programId: string;
  programName: string;
  fullName: string;
  birthDate: string;
  gender: string;
  address: string;
  whatsapp: string;
  email: string | null;
  selectedPackages: string;
  schedulePreference: string;
  experience: string;
  previousTraining: boolean;
  trainingDetails: string | null;
  paymentProof: string | null;
  status: string;
  adminNotes: string | null;
  createdAt: string;
}

const trainingPackages: Record<string, string> = {
  "basic-barista": "Basic Barista (Pemula)",
  "intermediate-barista": "Intermediate Barista",
  "advanced-latte-art": "Advanced / Latte Art",
  "brew-class": "Brew Class (Manual Brewing)"
};

export default function ClassStatusPage() {
  const [registrations, setRegistrations] = useState<Registration[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedRegistration, setSelectedRegistration] = useState<Registration | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingRegistration, setEditingRegistration] = useState<Registration | null>(null);
  const [message, setMessage] = useState({ type: "", text: "" });
  const [editFormData, setEditFormData] = useState({
    fullName: '',
    birthDate: '',
    gender: '',
    address: '',
    whatsapp: '',
    email: '',
    schedulePreference: '',
    experience: '',
    previousTraining: false,
    trainingDetails: ''
  });
  const [submittingEdit, setSubmittingEdit] = useState(false);
  const [cancellingId, setCancellingId] = useState<number | null>(null);
  const [filter, setFilter] = useState("all");
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [paymentProofUrl, setPaymentProofUrl] = useState<string | null>(null);
  const [paymentProofIsPdf, setPaymentProofIsPdf] = useState(false);
  const [paymentProofResolved, setPaymentProofResolved] = useState<string | null>(null);
  const [paymentProofError, setPaymentProofError] = useState<string | null>(null);
  const releaseObjectUrl = (url: string | null) => {
    if (url && url.startsWith('blob:')) {
      URL.revokeObjectURL(url);
    }
  };

  const setPaymentProofUrlSafe = (url: string | null) => {
    setPaymentProofUrl(prev => {
      if (prev && prev !== url) {
        releaseObjectUrl(prev);
      }
      return url;
    });
  };


  useEffect(() => {
    fetchRegistrations();
  }, []);

  const fetchRegistrations = async () => {
    try {
      const res = await fetch("/api/member/class-registrations?type=active");
      if (res.ok) {
        const data = await res.json();
        console.debug("[ClassStatus] Registrations fetched", data.map((item: Registration) => ({ id: item.id, paymentProofPreview: item.paymentProof?.slice(0, 60) })));
        setRegistrations(data);
      }
    } catch (error) {
      console.error("Error fetching registrations:", error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "approved":
        return "#8bc34a";
      case "waiting":
        return "#ffc107";
      case "rejected":
        return "#f44336";
      default:
        return "#999";
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "approved":
        return "Disetujui";
      case "waiting":
        return "Menunggu Verifikasi";
      case "rejected":
        return "Ditolak";
      case "completed":
        return "Selesai";
      default:
        return status;
    }
  };



  const parsePackages = (packagesJson: string): string[] => {
    try {
      return JSON.parse(packagesJson);
    } catch {
      return [];
    }
  };

  const normalizeProofString = (proof: string) => {
    let normalized = proof.trim();

    // unwrap simple JSON string values
    if ((normalized.startsWith('{') && normalized.endsWith('}')) || (normalized.startsWith('[') && normalized.endsWith(']'))) {
      try {
        const parsed = JSON.parse(normalized);
        if (typeof parsed === 'string') {
          normalized = parsed;
        } else if (Array.isArray(parsed) && parsed.length > 0 && typeof parsed[0] === 'string') {
          normalized = parsed[0];
        } else if (parsed && typeof parsed === 'object') {
          const maybeUrl = (parsed.url || parsed.path || parsed.file) as string | undefined;
          if (maybeUrl) {
            normalized = maybeUrl;
          }
        }
      } catch {
        // keep original string
      }
    }

    if (normalized.startsWith('"') && normalized.endsWith('"')) {
      normalized = normalized.slice(1, -1);
    }

    // strip surrounding single quotes
    if (normalized.startsWith("'") && normalized.endsWith("'")) {
      normalized = normalized.slice(1, -1);
    }

    return normalized.trim();
  };

  const resolvePaymentProofUrl = (proof: string) => {
    const normalizedInput = normalizeProofString(proof);
    if (!normalizedInput) return proof;

    let normalized = normalizedInput.replace(/\\/g, '/');

    // handle Windows absolute paths and trim to public assets
    if (/^[a-zA-Z]:\//.test(normalized)) {
      const lower = normalized.toLowerCase();
      const publicIdx = lower.indexOf('public/');
      if (publicIdx >= 0) {
        normalized = normalized.slice(publicIdx + 'public/'.length);
      } else {
        const assetIdx = lower.indexOf('payment-proofs/');
        if (assetIdx >= 0) {
          normalized = normalized.slice(assetIdx);
        }
      }
    }

    if (normalized.startsWith('data:')) return normalized;
    if (normalized.startsWith('http://') || normalized.startsWith('https://')) return normalized;

    if (normalized.includes(';base64,') && !normalized.startsWith('data:')) {
      const [metaPart, base64Part] = normalized.split(';base64,');
      const mime = metaPart.includes('/') ? metaPart : 'image/jpeg';
      return `data:${mime};base64,${base64Part}`;
    }

    if (normalized.startsWith('/')) return normalized;

    normalized = normalized.replace(/^\.\//, '');
    normalized = normalized.replace(/^\.\.(\/|\\)/g, '');
    normalized = normalized.replace(/^public\//, '');

    const assetMarkerIdx = normalized.toLowerCase().indexOf('payment-proofs/');
    if (assetMarkerIdx > 0) {
      normalized = normalized.slice(assetMarkerIdx);
    }

    const looksLikeFilename = !normalized.includes('/') || /^[^/]+\.[a-zA-Z0-9]+$/.test(normalized);
    if (!normalized.startsWith('data:') && looksLikeFilename) {
      normalized = `payment-proofs/${normalized.replace(/^\/+/, '')}`;
    }

    if (!normalized.startsWith('/')) {
      normalized = `/${normalized}`;
    }

    return normalized;
  };

  const isPdfProof = (proof: string, resolved: string) => {
    const normalized = normalizeProofString(proof).toLowerCase();
    return normalized.endsWith('.pdf') || resolved.startsWith('data:application/pdf') || resolved.toLowerCase().endsWith('.pdf');
  };

  const handleViewDetail = (registration: Registration) => {
    setSelectedRegistration(registration);
    setShowDetailModal(true);
  };

  const handleViewPaymentProof = (proof: string | null) => {
    if (!proof) return;
    const resolvedUrl = resolvePaymentProofUrl(proof);
    console.debug("[ClassStatus] Payment proof source", { proof, resolvedUrl });
    const pdf = isPdfProof(proof, resolvedUrl);

    setPaymentProofResolved(resolvedUrl);
    setPaymentProofIsPdf(pdf);
    setPaymentProofError(null);
    setPaymentProofUrlSafe(resolvedUrl);
    setShowPaymentModal(true);
  };

  const closePaymentModal = () => {
    setShowPaymentModal(false);
    setPaymentProofUrlSafe(null);
    setPaymentProofIsPdf(false);
    setPaymentProofResolved(null);
    setPaymentProofError(null);
  };

  const handleCancelClick = (id: number) => {
    setCancellingId(id);
    setShowCancelModal(true);
  };

  const handleEditClick = (registration: Registration) => {
    setEditingRegistration(registration);
    setEditFormData({
      fullName: registration.fullName,
      birthDate: registration.birthDate.split('T')[0],
      gender: registration.gender,
      address: registration.address,
      whatsapp: registration.whatsapp,
      email: registration.email || '',
      schedulePreference: registration.schedulePreference,
      experience: registration.experience,
      previousTraining: registration.previousTraining,
      trainingDetails: registration.trainingDetails || ''
    });
    setShowEditModal(true);
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingRegistration) return;

    // Validation
    if (!editFormData.fullName.trim() || !editFormData.birthDate || !editFormData.gender || 
        !editFormData.address.trim() || !editFormData.whatsapp.trim()) {
      setMessage({ type: "error", text: "Mohon lengkapi semua data yang wajib diisi" });
      return;
    }

    setSubmittingEdit(true);
    try {
      const res = await fetch(`/api/member/class-registrations/${editingRegistration.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fullName: editFormData.fullName.trim(),
          birthDate: editFormData.birthDate,
          gender: editFormData.gender,
          address: editFormData.address.trim(),
          whatsapp: editFormData.whatsapp.trim(),
          email: editFormData.email.trim() || null,
          schedulePreference: editFormData.schedulePreference,
          experience: editFormData.experience,
          previousTraining: editFormData.previousTraining,
          trainingDetails: editFormData.previousTraining ? editFormData.trainingDetails.trim() : null
        })
      });

      if (res.ok) {
        await fetchRegistrations();
        setShowEditModal(false);
        setEditingRegistration(null);
        setMessage({ type: "success", text: "Data berhasil diperbarui!" });
      } else {
        const data = await res.json();
        setMessage({ type: "error", text: data.error || "Gagal memperbarui data. Silakan coba lagi." });
      }
    } catch (error) {
      console.error('Error updating registration:', error);
      setMessage({ type: "error", text: "Terjadi kesalahan. Silakan coba lagi." });
    } finally {
      setSubmittingEdit(false);
    }
  };

  const handleConfirmCancel = async () => {
    try {
      const res = await fetch(`/api/member/class-registrations/${cancellingId}`, {
        method: "DELETE",
      });
      
      if (res.ok) {
        setRegistrations(prev => prev.filter(r => r.id !== cancellingId));
        setShowCancelModal(false);
        setCancellingId(null);
        setMessage({ type: "success", text: "Pendaftaran berhasil dibatalkan." });
      } else {
        setShowCancelModal(false);
        setCancellingId(null);
        setMessage({ type: "error", text: "Gagal membatalkan pendaftaran. Silakan coba lagi." });
      }
    } catch (error) {
      console.error("Error cancelling registration:", error);
      setShowCancelModal(false);
      setCancellingId(null);
      setMessage({ type: "error", text: "Terjadi kesalahan. Silakan coba lagi." });
    }
  };

  const filteredRegistrations = registrations.filter(r => {
    if (filter === "all") return true;
    return r.status === filter;
  });

  if (loading) return null;

  return (
    <div className="status-container">
      <div className="page-header">
        <h1>📋 Status Pendaftaran</h1>
        <p>Pantau status pendaftaran kelas edukasi Anda</p>
      </div>

      {/* Alert Message */}
      {message.text && (
        <div className={`alert ${message.type === "success" ? "alert-success" : "alert-error"}`}>
          {message.type === "success" ? "✅" : "❌"} {message.text}
          <button className="alert-close" onClick={() => setMessage({ type: "", text: "" })}>×</button>
        </div>
      )}

      {/* Stats Summary */}
      <div className="stats-summary">
        <div className="stat-card">
          <div className="stat-icon">📝</div>
          <div className="stat-value">{registrations.length}</div>
          <div className="stat-label">Total Pendaftaran</div>
        </div>
        <div className="stat-card approved">
          <div className="stat-icon">✅</div>
          <div className="stat-value">
            {registrations.filter(r => r.status === "approved").length}
          </div>
          <div className="stat-label">Disetujui</div>
        </div>
        <div className="stat-card waiting">
          <div className="stat-icon">⏳</div>
          <div className="stat-value">
            {registrations.filter(r => r.status === "waiting").length}
          </div>
          <div className="stat-label">Menunggu</div>
        </div>
        <div className="stat-card rejected">
          <div className="stat-icon">❌</div>
          <div className="stat-value">
            {registrations.filter(r => r.status === "rejected").length}
          </div>
          <div className="stat-label">Ditolak</div>
        </div>
      </div>

      {/* Filter */}
      <div className="filter-section">
        <label>Filter Status:</label>
        <select value={filter} onChange={(e) => setFilter(e.target.value)}>
          <option value="all">Semua</option>
          <option value="waiting">Menunggu Verifikasi</option>
          <option value="approved">Disetujui</option>
          <option value="rejected">Ditolak</option>
        </select>
      </div>

      {/* Registrations Table */}
      {filteredRegistrations.length === 0 ? (
        <div className="empty-state">
          <span className="empty-icon">📭</span>
          <h3>Belum ada pendaftaran</h3>
          <p>Anda belum mendaftar kelas edukasi apapun. Silakan kunjungi menu Daftar Kelas Edukasi.</p>
        </div>
      ) : (
        <div className="table-container">
          <table className="registrations-table">
            <thead>
              <tr>
                <th>Nama Kelas</th>
                <th>Paket Pelatihan</th>
                <th>Jadwal</th>
                <th>Status Pendaftaran</th>
                <th>Aksi</th>
              </tr>
            </thead>
            <tbody>
              {filteredRegistrations.map((registration) => (
                <tr key={registration.id}>
                  <td>
                    <div className="class-name">{registration.programName}</div>
                    <div className="registered-date">
                      Daftar: {new Date(registration.createdAt).toLocaleDateString('id-ID', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric'
                      })}
                    </div>
                  </td>
                  <td>
                    <div className="packages-list">
                      {parsePackages(registration.selectedPackages).map((pkg, idx) => (
                        <span key={idx} className="package-tag">
                          {trainingPackages[pkg] || pkg}
                        </span>
                      ))}
                    </div>
                  </td>
                  <td>
                    <span className="schedule-badge">
                      {registration.schedulePreference === "Weekday" ? "📅 Senin-Jumat" : "📅 Sabtu-Minggu"}
                    </span>
                  </td>
                  <td>
                    <span 
                      className="status-badge"
                      style={{ 
                        background: `${getStatusColor(registration.status)}20`,
                        color: getStatusColor(registration.status),
                        border: `1px solid ${getStatusColor(registration.status)}`
                      }}
                    >
                      {getStatusLabel(registration.status)}
                    </span>
                  </td>
                  <td>
                    <div className="action-buttons">
                      <button 
                        className="btn-action btn-detail"
                        onClick={() => handleViewDetail(registration)}
                        title="Lihat Detail"
                      >
                        <span className="btn-icon">🔍</span>
                      </button>
                      {registration.status === "waiting" && (
                        <>
                          <button 
                            className="btn-action btn-edit"
                            onClick={() => handleEditClick(registration)}
                            title="Edit Data"
                          >
                            <span className="btn-icon">✏️</span>
                          </button>
                          <button 
                            className="btn-action btn-cancel"
                            onClick={() => handleCancelClick(registration.id)}
                            title="Batalkan Pendaftaran"
                          >
                            <span className="btn-icon">🗑️</span>
                          </button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Detail Modal */}
      {showDetailModal && selectedRegistration && (
        <div className="modal-overlay" onClick={() => setShowDetailModal(false)}>
          <div className="modal-container" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Detail Pendaftaran</h2>
              <button className="modal-close" onClick={() => setShowDetailModal(false)}>×</button>
            </div>
            <div className="modal-body">
              {/* Program Info */}
              <div className="detail-section">
                <h3>📚 Informasi Program</h3>
                <div className="detail-grid">
                  <div className="detail-item">
                    <label>Nama Program</label>
                    <span>{selectedRegistration.programName}</span>
                  </div>
                  <div className="detail-item">
                    <label>Jadwal</label>
                    <span>{selectedRegistration.schedulePreference === "Weekday" ? "Weekday (Senin-Jumat)" : "Weekend (Sabtu-Minggu)"}</span>
                  </div>
                </div>
              </div>

              {/* Status */}
              <div className="detail-section">
                <h3>📊 Status</h3>
                <div className="status-row">
                  <div className="status-item">
                    <label>Status Pendaftaran</label>
                    <span 
                      className="status-badge large"
                      style={{ 
                        background: `${getStatusColor(selectedRegistration.status)}20`,
                        color: getStatusColor(selectedRegistration.status),
                        border: `1px solid ${getStatusColor(selectedRegistration.status)}`
                      }}
                    >
                      {getStatusLabel(selectedRegistration.status)}
                    </span>
                  </div>
                </div>
                {selectedRegistration.adminNotes && (
                  <div className="admin-notes">
                    <label>Catatan Admin:</label>
                    <p>{selectedRegistration.adminNotes}</p>
                  </div>
                )}
              </div>

              {/* Personal Info */}
              <div className="detail-section">
                <h3>👤 Data Diri</h3>
                <div className="detail-grid">
                  <div className="detail-item">
                    <label>Nama Lengkap</label>
                    <span>{selectedRegistration.fullName}</span>
                  </div>
                  <div className="detail-item">
                    <label>Tanggal Lahir</label>
                    <span>{new Date(selectedRegistration.birthDate).toLocaleDateString('id-ID')}</span>
                  </div>
                  <div className="detail-item">
                    <label>Jenis Kelamin</label>
                    <span>{selectedRegistration.gender}</span>
                  </div>
                  <div className="detail-item">
                    <label>WhatsApp</label>
                    <span>{selectedRegistration.whatsapp}</span>
                  </div>
                  <div className="detail-item full-width">
                    <label>Alamat</label>
                    <span>{selectedRegistration.address}</span>
                  </div>
                </div>
              </div>

              {/* Training Packages */}
              <div className="detail-section">
                <h3>📦 Paket Pelatihan</h3>
                <div className="packages-detail">
                  {parsePackages(selectedRegistration.selectedPackages).map((pkg, idx) => (
                    <div key={idx} className="package-item">
                      ✓ {trainingPackages[pkg] || pkg}
                    </div>
                  ))}
                </div>
              </div>

              {/* Experience */}
              <div className="detail-section">
                <h3>📝 Pengalaman</h3>
                <div className="detail-grid">
                  <div className="detail-item">
                    <label>Pengalaman Barista</label>
                    <span>{selectedRegistration.experience}</span>
                  </div>
                  <div className="detail-item">
                    <label>Pernah Pelatihan</label>
                    <span>{selectedRegistration.previousTraining ? "Ya" : "Tidak"}</span>
                  </div>
                  {selectedRegistration.trainingDetails && (
                    <div className="detail-item full-width">
                      <label>Detail Pelatihan Sebelumnya</label>
                      <span>{selectedRegistration.trainingDetails}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Payment */}
              <div className="detail-section">
                <h3>💳 Pembayaran</h3>
                {selectedRegistration.paymentProof ? (
                  <div className="payment-proof">
                    <label>Bukti Pembayaran:</label>
                    <button
                      type="button"
                      className="proof-link"
                      onClick={() => handleViewPaymentProof(selectedRegistration.paymentProof)}
                    >
                      📄 Lihat Bukti Pembayaran
                    </button>
                  </div>
                ) : (
                  <div className="no-payment">
                    <p>Bukti pembayaran belum diunggah</p>
                    <button className="btn-upload">📤 Upload Bukti Pembayaran</button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Cancel Confirmation Modal */}
      {showCancelModal && (
        <div className="modal-overlay" onClick={() => setShowCancelModal(false)}>
          <div className="modal-container cancel-modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2>⚠️ Konfirmasi Pembatalan</h2>
              <button className="modal-close" onClick={() => setShowCancelModal(false)}>×</button>
            </div>
            <div className="modal-body">
              <div className="cancel-warning">
                <span className="warning-icon">🚫</span>
                <p>Apakah Anda yakin ingin membatalkan pendaftaran kelas ini?</p>
                <p className="warning-note">Tindakan ini tidak dapat dibatalkan.</p>
              </div>
              <div className="cancel-actions">
                <button 
                  className="btn-confirm-cancel"
                  onClick={handleConfirmCancel}
                >
                  Ya, Batalkan
                </button>
                <button 
                  className="btn-keep"
                  onClick={() => setShowCancelModal(false)}
                >
                  Tidak, Kembali
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Payment Proof Preview Modal */}
      {showPaymentModal && (
        <div className="modal-overlay" onClick={closePaymentModal}>
          <div className="modal-container proof-modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Bukti Pembayaran</h2>
              <button className="modal-close" onClick={closePaymentModal}>×</button>
            </div>
            <div className="modal-body">
              {paymentProofUrl ? (
                paymentProofIsPdf ? (
                <iframe
                  src={paymentProofUrl}
                  title="Bukti Pembayaran"
                  className="proof-frame"
                />
              ) : (
                <img
                  src={paymentProofUrl}
                  alt="Bukti Pembayaran"
                  className="proof-image"
                  onError={() => {
                    setPaymentProofError("Gagal menampilkan bukti pembayaran.");
                    setPaymentProofUrlSafe(null);
                  }}
                />
              )
              ) : (
                <div className="proof-error">
                  <p>{paymentProofError || "Bukti pembayaran tidak tersedia."}</p>
                  {paymentProofResolved && (
                    <a
                      href={paymentProofResolved}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="proof-fallback-link"
                    >
                      Buka File Asli
                    </a>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {showEditModal && editingRegistration && (
        <div className="modal-overlay" onClick={() => setShowEditModal(false)}>
          <div className="modal-container edit-modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2>✏️ Edit Data Pendaftaran</h2>
              <button className="modal-close" onClick={() => setShowEditModal(false)}>×</button>
            </div>
            <div className="modal-body">
              <div className="edit-program-info">
                <strong>{editingRegistration.programName}</strong>
                <p>Edit data pendaftaran Anda di bawah ini</p>
              </div>

              <form onSubmit={handleEditSubmit}>
                <div className="edit-section">
                  <h4>Data Diri</h4>
                  <div className="edit-row">
                    <div className="edit-group">
                      <label>Nama Lengkap *</label>
                      <input
                        type="text"
                        value={editFormData.fullName}
                        onChange={(e) => setEditFormData({...editFormData, fullName: e.target.value})}
                        required
                      />
                    </div>
                    <div className="edit-group">
                      <label>Tanggal Lahir *</label>
                      <input
                        type="date"
                        value={editFormData.birthDate}
                        onChange={(e) => setEditFormData({...editFormData, birthDate: e.target.value})}
                        required
                      />
                    </div>
                  </div>
                  <div className="edit-row">
                    <div className="edit-group">
                      <label>Jenis Kelamin *</label>
                      <select
                        value={editFormData.gender}
                        onChange={(e) => setEditFormData({...editFormData, gender: e.target.value})}
                        required
                      >
                        <option value="">Pilih...</option>
                        <option value="Laki-laki">Laki-laki</option>
                        <option value="Perempuan">Perempuan</option>
                      </select>
                    </div>
                    <div className="edit-group">
                      <label>No. WhatsApp *</label>
                      <input
                        type="tel"
                        value={editFormData.whatsapp}
                        onChange={(e) => setEditFormData({...editFormData, whatsapp: e.target.value})}
                        required
                      />
                    </div>
                  </div>
                  <div className="edit-group">
                    <label>Email (Opsional)</label>
                    <input
                      type="email"
                      value={editFormData.email}
                      onChange={(e) => setEditFormData({...editFormData, email: e.target.value})}
                    />
                  </div>
                  <div className="edit-group">
                    <label>Alamat Lengkap *</label>
                    <textarea
                      value={editFormData.address}
                      onChange={(e) => setEditFormData({...editFormData, address: e.target.value})}
                      rows={3}
                      required
                    />
                  </div>
                </div>

                <div className="edit-section">
                  <h4>Jadwal Pelatihan</h4>
                  <div className="edit-group">
                    <label>Pilih Jadwal *</label>
                    <select
                      value={editFormData.schedulePreference}
                      onChange={(e) => setEditFormData({...editFormData, schedulePreference: e.target.value})}
                      required
                    >
                      <option value="Weekday">Weekday (Senin-Jumat)</option>
                      <option value="Weekend">Weekend (Sabtu-Minggu)</option>
                    </select>
                  </div>
                </div>

                <div className="edit-section">
                  <h4>Pengalaman</h4>
                  <div className="edit-group">
                    <label>Pengalaman Barista *</label>
                    <select
                      value={editFormData.experience}
                      onChange={(e) => setEditFormData({...editFormData, experience: e.target.value})}
                      required
                    >
                      <option value="Belum Ada">Belum Ada</option>
                      <option value="0-6 bulan">0-6 bulan</option>
                      <option value="6-12 bulan">6-12 bulan</option>
                      <option value="1 tahun ke atas">1 tahun ke atas</option>
                    </select>
                  </div>
                  <div className="edit-group">
                    <label>Pernah Pelatihan Sebelumnya? *</label>
                    <select
                      value={editFormData.previousTraining ? 'yes' : 'no'}
                      onChange={(e) => setEditFormData({
                        ...editFormData, 
                        previousTraining: e.target.value === 'yes',
                        trainingDetails: e.target.value === 'no' ? '' : editFormData.trainingDetails
                      })}
                      required
                    >
                      <option value="no">Tidak</option>
                      <option value="yes">Ya</option>
                    </select>
                  </div>
                  {editFormData.previousTraining && (
                    <div className="edit-group">
                      <label>Detail Pelatihan Sebelumnya *</label>
                      <textarea
                        value={editFormData.trainingDetails}
                        onChange={(e) => setEditFormData({...editFormData, trainingDetails: e.target.value})}
                        rows={2}
                        required
                      />
                    </div>
                  )}
                </div>

                <div className="edit-actions">
                  <button 
                    type="button" 
                    className="btn-cancel-edit"
                    onClick={() => setShowEditModal(false)}
                  >
                    <span>✕</span> Batal
                  </button>
                  <button 
                    type="submit" 
                    className="btn-save-edit"
                    disabled={submittingEdit}
                  >
                    {submittingEdit ? 'Menyimpan...' : '✓ Simpan Perubahan'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
