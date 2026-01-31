'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import DeleteConfirmModal from '@/components/ui/DeleteConfirmModal';
import { SearchBar, FilterSelect, Alert } from '@/components/ui';
import './kelola-peserta.css';

interface Registration {
  id: number;
  userId: number;
  user?: {
    id: number;
    name: string;
    email: string;
  };
  programId: string;
  programName: string;
  fullName: string;
  birthDate: string;
  gender: string;
  address: string;
  whatsapp: string;
  email?: string;
  selectedPackages: string;
  schedulePreference: string;
  experience: string;
  previousTraining: boolean;
  trainingDetails?: string | null;
  paymentProof?: string | null;
  status: string;
  adminNotes?: string | null;
  certificateUrl?: string | null;
  createdAt: string;
  updatedAt: string;
}

interface GeneratedCertificate {
  code: string;
  url: string;
  recipientName: string;
  programName: string;
  skillName: string;
  completionDate: string;
}

export default function KelolaPesertaPage() {
  const router = useRouter();
  const [participants, setParticipants] = useState<Registration[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedParticipant, setSelectedParticipant] = useState<Registration | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [showGenerateModal, setShowGenerateModal] = useState(false);
  const [showPreviewModal, setShowPreviewModal] = useState(false);
  const [generatingCertificate, setGeneratingCertificate] = useState<number | null>(null);
  const [generatedCertificate, setGeneratedCertificate] = useState<GeneratedCertificate | null>(null);
  const [completionDate, setCompletionDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [alertMessage, setAlertMessage] = useState({ type: '', text: '' });
  const [statusFilter, setStatusFilter] = useState<string>('all'); // 'all', 'approved', 'completed'
  const [markingComplete, setMarkingComplete] = useState<number | null>(null);
  // For confirmation modals
  const [completingParticipant, setCompletingParticipant] = useState<Registration | null>(null);
  const [revertingParticipant, setRevertingParticipant] = useState<Registration | null>(null);

  const fetchParticipants = useCallback(async () => {
    try {
      setLoading(true);
      // Fetch both approved and completed participants
      const res = await fetch('/api/admin/class-registrations?status=all');
      const data = await res.json();
      
      if (data.success) {
        // Filter only approved and completed registrations
        const filtered = data.registrations.filter((r: Registration) => 
          r.status === 'approved' || r.status === 'completed'
        );
        setParticipants(filtered);
      }
    } catch (error) {
      console.error('Error fetching participants:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchParticipants();
  }, [fetchParticipants]);

  const openDetailModal = (participant: Registration) => {
    setSelectedParticipant(participant);
    setShowDetailModal(true);
  };

  const openPaymentModal = (participant: Registration) => {
    setSelectedParticipant(participant);
    setShowPaymentModal(true);
  };

  const openGenerateModal = (participant: Registration) => {
    setSelectedParticipant(participant);
    setCompletionDate(new Date().toISOString().split('T')[0]);
    setShowGenerateModal(true);
  };

  // Handler untuk membuka modal konfirmasi generate sertifikat
  const handleMarkCompleteClick = (participant: Registration) => {
    setCompletingParticipant(participant);
  };

  // Handler untuk konfirmasi generate sertifikat (tandai selesai + generate)
  const handleMarkCompleteConfirm = async () => {
    if (!completingParticipant) return;
    const participant = completingParticipant;
    setCompletingParticipant(null);
    
    try {
      setMarkingComplete(participant.id);
      
      // Step 1: Tandai sebagai completed
      const res = await fetch(`/api/admin/class-registrations/${participant.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ 
          status: 'completed'
        })
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Gagal mengubah status');
      }

      // Step 2: Buka modal generate sertifikat
      setSelectedParticipant({...participant, status: 'completed'});
      setCompletionDate(new Date().toISOString().split('T')[0]);
      setShowGenerateModal(true);
      
      setAlertMessage({ type: 'success', text: `🎓 ${participant.fullName} siap untuk generate sertifikat!` });
      setTimeout(() => setAlertMessage({ type: '', text: '' }), 4000);
      
      fetchParticipants();
    } catch (error) {
      console.error('Error marking as complete:', error);
      setAlertMessage({ 
        type: 'error', 
        text: error instanceof Error ? error.message : 'Gagal mengubah status'
      });
      setTimeout(() => setAlertMessage({ type: '', text: '' }), 4000);
    } finally {
      setMarkingComplete(null);
    }
  };

  // Handler untuk membuka modal konfirmasi revert status
  const handleRevertClick = (participant: Registration) => {
    setRevertingParticipant(participant);
  };

  // Handler untuk konfirmasi mengembalikan ke status approved (jika salah tandai)
  const handleRevertConfirm = async () => {
    if (!revertingParticipant) return;
    const participant = revertingParticipant;
    setRevertingParticipant(null);
    
    try {
      setMarkingComplete(participant.id);
      
      const res = await fetch(`/api/admin/class-registrations/${participant.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ 
          status: 'approved'
        })
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Gagal mengubah status');
      }

      setAlertMessage({ type: 'success', text: `Status ${participant.fullName} berhasil dikembalikan ke "Disetujui"` });
      setTimeout(() => setAlertMessage({ type: '', text: '' }), 4000);
      
      fetchParticipants();
    } catch (error) {
      console.error('Error reverting status:', error);
      setAlertMessage({ 
        type: 'error', 
        text: error instanceof Error ? error.message : 'Gagal mengubah status'
      });
      setTimeout(() => setAlertMessage({ type: '', text: '' }), 4000);
    } finally {
      setMarkingComplete(null);
    }
  };

  const handleGenerateCertificate = async () => {
    if (!selectedParticipant) return;

    try {
      setGeneratingCertificate(selectedParticipant.id);
      
      const res = await fetch('/api/admin/generate-certificate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          registrationId: selectedParticipant.id,
          completionDate: completionDate
        })
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to generate certificate');
      }

      setGeneratedCertificate(data.certificate);
      setShowGenerateModal(false);
      setShowPreviewModal(true);
      
      setAlertMessage({ type: 'success', text: 'Sertifikat berhasil digenerate!' });
      setTimeout(() => setAlertMessage({ type: '', text: '' }), 4000);
      
      fetchParticipants();
    } catch (error) {
      console.error('Error generating certificate:', error);
      setAlertMessage({ 
        type: 'error', 
        text: error instanceof Error ? error.message : 'Gagal generate sertifikat' 
      });
      setTimeout(() => setAlertMessage({ type: '', text: '' }), 4000);
    } finally {
      setGeneratingCertificate(null);
    }
  };

  const handleDownloadCertificate = (url: string, participantName: string) => {
    try {
      const src = new URL(url, window.location.origin).pathname;
      const qs = new URLSearchParams({ src, name: participantName });
      const link = document.createElement('a');
      link.href = `/api/certificates/download?${qs.toString()}`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error('Error downloading certificate PDF:', error);
      setAlertMessage({ type: 'error', text: 'Gagal mengunduh sertifikat (PDF)' });
      setTimeout(() => setAlertMessage({ type: '', text: '' }), 4000);
    }
  };

  const filteredParticipants = participants.filter(p => {
    const matchSearch = 
      p.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (p.email || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.programName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.whatsapp.includes(searchTerm);
    
    // Filter berdasarkan status
    const matchStatus = statusFilter === 'all' || p.status === statusFilter;
    
    return matchSearch && matchStatus;
  });

  const getStats = () => {
    const total = participants.length;
    const approved = participants.filter(p => p.status === 'approved').length;
    const completed = participants.filter(p => p.status === 'completed').length;
    const withCertificate = participants.filter(p => p.certificateUrl).length;
    return { total, approved, completed, withCertificate };
  };

  const stats = getStats();

  const getStatusBadge = (status: string) => {
    const statusMap: Record<string, { label: string; className: string }> = {
      approved: { label: '✅ Disetujui', className: 'status-approved' },
      completed: { label: '🏆 Selesai', className: 'status-completed' }
    };
    
    const statusInfo = statusMap[status] || { label: status, className: 'status-default' };
    return <span className={`status-badge ${statusInfo.className}`}>{statusInfo.label}</span>;
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  };

  if (loading) return null;

  return (
    <div className="kelola-peserta-container">
      <div className="page-header">
        <h1>👥 Kelola Peserta</h1>
        <p>Kelola peserta yang sudah disetujui dan upload sertifikat</p>
      </div>

      {/* Alert Message */}
      {alertMessage.text && (
        <Alert
          type={alertMessage.type as 'success' | 'error'}
          message={alertMessage.text}
          onClose={() => setAlertMessage({ type: '', text: '' })}
        />
      )}

      {/* Tab Navigation */}
      <div className="tab-navigation">
        <button 
          className="tab-btn"
          onClick={() => router.push('/admin/class-registrations')}
        >
          📝 Pendaftaran
        </button>
        <button 
          className="tab-btn active"
          style={{ pointerEvents: 'none' }}
        >
          👥 Kelola Peserta
        </button>
      </div>

      {/* Stats */}
      <div className="stats-grid">
        <div className="stat-card">
          <span className="stat-icon">📊</span>
          <div className="stat-info">
            <span className="stat-number">{stats.total}</span>
            <span className="stat-label">Total Peserta</span>
          </div>
        </div>
        <div className="stat-card approved">
          <span className="stat-icon">✅</span>
          <div className="stat-info">
            <span className="stat-number">{stats.approved}</span>
            <span className="stat-label">Sedang Mengikuti</span>
          </div>
        </div>
        <div className="stat-card completed">
          <span className="stat-icon">🏆</span>
          <div className="stat-info">
            <span className="stat-number">{stats.completed}</span>
            <span className="stat-label">Telah Selesai</span>
          </div>
        </div>
        <div className="stat-card">
          <span className="stat-icon">🎓</span>
          <div className="stat-info">
            <span className="stat-number">{stats.withCertificate}</span>
            <span className="stat-label">Sertifikat Terbit</span>
          </div>
        </div>
      </div>

      {/* Search & Filter */}
      <div className="filters-section">
        <SearchBar
          value={searchTerm}
          onChange={(value) => setSearchTerm(value)}
          placeholder="Cari nama, email, atau program..."
        />
        <div className="filter-tabs">
          {[
            { value: 'all', label: 'Semua' },
            { value: 'approved', label: 'Sedang Mengikuti' },
            { value: 'completed', label: 'Telah Selesai' }
          ].map(tab => (
            <button
              key={tab.value}
              className={`filter-tab ${statusFilter === tab.value ? 'active' : ''}`}
              onClick={() => setStatusFilter(tab.value)}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      {filteredParticipants.length === 0 ? (
        <div className="empty-state">
          <span className="empty-icon">📭</span>
          <h3>Tidak ada peserta</h3>
          <p>Belum ada peserta yang sesuai dengan filter</p>
        </div>
      ) : (
        <div className="table-container">
          <table className="data-table barizta-table">
            <thead>
              <tr>
                <th>Nama</th>
                <th>Email/WhatsApp</th>
                <th>Program</th>
                <th>Status</th>
                <th>Bukti Bayar</th>
                <th>Sertifikat</th>
                <th>Aksi</th>
              </tr>
            </thead>
            <tbody>
              {filteredParticipants.map(participant => (
                <tr key={participant.id} className={participant.status === 'completed' ? 'row-completed' : ''}>
                  <td className="name-cell">
                    <div className="name-info">
                      <span className="participant-name">{participant.fullName}</span>
                      <span className="participant-meta">{formatDate(participant.createdAt)}</span>
                    </div>
                  </td>
                  <td className="email-cell">
                    <div className="contact-info">
                      <span>{participant.email || '-'}</span>
                      <span className="whatsapp-number">{participant.whatsapp}</span>
                    </div>
                  </td>
                  <td className="program-cell">
                    <span className="program-name">{participant.programName}</span>
                    <span className="schedule-preference">{participant.schedulePreference}</span>
                  </td>
                  <td className="status-cell">
                    {getStatusBadge(participant.status)}
                  </td>
                  <td className="payment-cell">
                    {participant.paymentProof ? (
                      <button 
                        className="btn-view-proof"
                        onClick={() => openPaymentModal(participant)}
                      >
                        Lihat Bukti
                      </button>
                    ) : (
                      <span className="badge-no-proof">Belum Upload</span>
                    )}
                  </td>
                  <td className="certificate-cell">
                    {participant.certificateUrl ? (
                      <div className="cert-actions">
                        <button 
                          className="btn-download-cert"
                          onClick={() => handleDownloadCertificate(participant.certificateUrl!, participant.fullName)}
                          title="Download Sertifikat"
                        >
                          📥 Download
                        </button>
                        <a 
                          href={participant.certificateUrl} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="btn-view-cert"
                          title="Lihat Sertifikat"
                        >
                          👁️
                        </a>
                      </div>
                    ) : participant.status === 'completed' ? (
                      <button 
                        className="btn-generate-cert"
                        onClick={() => openGenerateModal(participant)}
                        disabled={generatingCertificate === participant.id}
                      >
                        {generatingCertificate === participant.id ? (
                          <>
                            <span className="btn-spinner"></span>
                            Generating...
                          </>
                        ) : (
                          '🎓 Generate'
                        )}
                      </button>
                    ) : (
                      <span className="badge-pending-cert">Selesaikan dulu</span>
                    )}
                  </td>
                  <td className="actions-cell">
                    <div className="action-buttons">
                      <button 
                        className="btn-detail" 
                        onClick={() => openDetailModal(participant)}
                        title="Lihat Detail"
                      >
                        📄 Detail
                      </button>
                      {participant.status === 'approved' && (
                        <button 
                          className="btn-mark-complete"
                          onClick={() => handleMarkCompleteClick(participant)}
                          disabled={markingComplete === participant.id}
                          title="Generate Sertifikat"
                        >
                          {markingComplete === participant.id ? '...' : '🎓 Generate Sertifikat'}
                        </button>
                      )}
                      {participant.status === 'completed' && !participant.certificateUrl && (
                        <button 
                          className="btn-revert"
                          onClick={() => handleRevertClick(participant)}
                          disabled={markingComplete === participant.id}
                          title="Batalkan Status Selesai"
                        >
                          ↩️
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Generate Certificate Modal */}
      {showGenerateModal && selectedParticipant && (
        <div className="modal-overlay" onClick={() => setShowGenerateModal(false)}>
          <div className="modal-container generate-modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2>🎓 Generate Sertifikat</h2>
              <button className="modal-close" onClick={() => setShowGenerateModal(false)}>×</button>
            </div>
            
            <div className="generate-form">
              <div className="preview-info">
                <div className="preview-item">
                  <label>Nama Peserta:</label>
                  <span className="preview-value">{selectedParticipant.fullName}</span>
                </div>
                <div className="preview-item">
                  <label>Program:</label>
                  <span className="preview-value">{selectedParticipant.programName}</span>
                </div>
                <div className="preview-item">
                  <label>Tanggal Selesai:</label>
                  <input
                    type="date"
                    value={completionDate}
                    onChange={(e) => setCompletionDate(e.target.value)}
                    className="date-input"
                  />
                </div>
              </div>

              <div className="template-preview">
                <p className="preview-label">Template Sertifikat:</p>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img 
                  src="/certificates/sertifikat.jpeg" 
                  alt="Template Sertifikat" 
                  className="template-image"
                />
                <p className="preview-note">
                  * Nama peserta dan skill program akan otomatis ditambahkan ke template
                </p>
              </div>

              <div className="modal-actions">
                <button 
                  className="btn-secondary-barizta"
                  onClick={() => setShowGenerateModal(false)}
                >
                  Batal
                </button>
                <button 
                  className="btn-barizta"
                  onClick={handleGenerateCertificate}
                  disabled={generatingCertificate !== null}
                >
                  {generatingCertificate ? (
                    <>
                      <span className="btn-spinner"></span>
                      Generating...
                    </>
                  ) : (
                    '🎓 Generate Sertifikat'
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Certificate Preview Modal */}
      {showPreviewModal && generatedCertificate && (
        <div className="modal-overlay" onClick={() => setShowPreviewModal(false)}>
          <div className="modal-container preview-modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2>✅ Sertifikat Berhasil Dibuat!</h2>
              <button className="modal-close" onClick={() => setShowPreviewModal(false)}>×</button>
            </div>
            
            <div className="certificate-preview">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img 
                src={generatedCertificate.url} 
                alt="Sertifikat" 
                className="generated-certificate-image"
              />
            </div>

            <div className="certificate-info">
              <div className="info-item">
                <span className="info-label">Kode Sertifikat:</span>
                <span className="info-value code">{generatedCertificate.code}</span>
              </div>
              <div className="info-item">
                <span className="info-label">Nama:</span>
                <span className="info-value">{generatedCertificate.recipientName}</span>
              </div>
              <div className="info-item">
                <span className="info-label">Program:</span>
                <span className="info-value">{generatedCertificate.programName}</span>
              </div>
              <div className="info-item">
                <span className="info-label">Tanggal:</span>
                <span className="info-value">{generatedCertificate.completionDate}</span>
              </div>
            </div>

            <div className="modal-actions">
              <button 
                className="btn-secondary-barizta"
                onClick={() => setShowPreviewModal(false)}
              >
                Tutup
              </button>
              <button 
                className="btn-barizta"
                onClick={() => handleDownloadCertificate(generatedCertificate.url, generatedCertificate.recipientName)}
              >
                📥 Download Sertifikat
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Detail Modal - Comprehensive View */}
      {showDetailModal && selectedParticipant && (
        <div className="modal-overlay" onClick={() => setShowDetailModal(false)}>
          <div className="modal-container detail-modal-full" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2>📋 Detail Pendaftaran #{selectedParticipant.id}</h2>
              <button className="modal-close" onClick={() => setShowDetailModal(false)}>×</button>
            </div>
            
            {/* Status Banner */}
            <div className={`status-banner ${selectedParticipant.status}`}>
              {selectedParticipant.status === 'completed' ? '✅ Telah Selesai' : '📝 Sedang Mengikuti Kelas'}
            </div>
            
            <div className="detail-sections">
              {/* Data Diri */}
              <div className="detail-section">
                <h3>👤 Data Diri</h3>
                <div className="detail-grid">
                  <div className="detail-item">
                    <label>Nama Lengkap:</label>
                    <span>{selectedParticipant.fullName}</span>
                  </div>
                  <div className="detail-item">
                    <label>Tanggal Lahir:</label>
                    <span>{formatDate(selectedParticipant.birthDate)}</span>
                  </div>
                  <div className="detail-item">
                    <label>Jenis Kelamin:</label>
                    <span>{selectedParticipant.gender}</span>
                  </div>
                  <div className="detail-item">
                    <label>Email:</label>
                    <span>{selectedParticipant.email || '-'}</span>
                  </div>
                  <div className="detail-item">
                    <label>WhatsApp:</label>
                    <span className="whatsapp-link">
                      <a href={`https://wa.me/${selectedParticipant.whatsapp.replace(/[^0-9]/g, '')}`} target="_blank" rel="noopener noreferrer">
                        {selectedParticipant.whatsapp}
                      </a>
                    </span>
                  </div>
                  <div className="detail-item full-width">
                    <label>Alamat:</label>
                    <span>{selectedParticipant.address}</span>
                  </div>
                </div>
              </div>

              {/* Program & Jadwal */}
              <div className="detail-section">
                <h3>📚 Program & Jadwal</h3>
                <div className="detail-grid">
                  <div className="detail-item">
                    <label>Program:</label>
                    <span className="program-highlight">{selectedParticipant.programName}</span>
                  </div>
                  <div className="detail-item">
                    <label>Jadwal Preferensi:</label>
                    <span>{selectedParticipant.schedulePreference}</span>
                  </div>
                  <div className="detail-item full-width">
                    <label>Paket Dipilih:</label>
                    <div className="packages-list">
                      {(() => {
                        try {
                          const packages = JSON.parse(selectedParticipant.selectedPackages);
                          return Array.isArray(packages) 
                            ? packages.map((pkg: string, idx: number) => <span key={idx} className="package-tag">{pkg}</span>)
                            : <span className="package-tag">{selectedParticipant.selectedPackages}</span>;
                        } catch {
                          return <span className="package-tag">{selectedParticipant.selectedPackages}</span>;
                        }
                      })()}
                    </div>
                  </div>
                </div>
              </div>

              {/* Pengalaman */}
              <div className="detail-section">
                <h3>☕ Pengalaman Barista</h3>
                <div className="detail-grid">
                  <div className="detail-item">
                    <label>Pengalaman:</label>
                    <span>{selectedParticipant.experience || 'Tidak ada'}</span>
                  </div>
                  <div className="detail-item">
                    <label>Pernah Pelatihan:</label>
                    <span>{selectedParticipant.previousTraining ? 'Ya' : 'Tidak'}</span>
                  </div>
                  {selectedParticipant.trainingDetails && (
                    <div className="detail-item full-width">
                      <label>Detail Pelatihan Sebelumnya:</label>
                      <span>{selectedParticipant.trainingDetails}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Pembayaran */}
              <div className="detail-section">
                <h3>💳 Pembayaran</h3>
                <div className="detail-grid">
                  <div className="detail-item">
                    <label>Bukti Pembayaran:</label>
                    {selectedParticipant.paymentProof ? (
                      <button 
                        className="btn-view-proof-inline"
                        onClick={() => { setShowDetailModal(false); openPaymentModal(selectedParticipant); }}
                      >
                        📄 Lihat Bukti Pembayaran
                      </button>
                    ) : (
                      <span className="badge-no-data">Belum Upload</span>
                    )}
                  </div>
                </div>
              </div>

              {/* Sertifikat */}
              {selectedParticipant.certificateUrl && (
                <div className="detail-section">
                  <h3>🎓 Sertifikat</h3>
                  <div className="detail-grid">
                    <div className="detail-item full-width">
                      <label>Sertifikat:</label>
                      <div className="cert-actions-inline">
                        <button 
                          className="btn-download-cert"
                          onClick={() => handleDownloadCertificate(selectedParticipant.certificateUrl!, selectedParticipant.fullName)}
                        >
                          📥 Download Sertifikat
                        </button>
                        <a 
                          href={selectedParticipant.certificateUrl} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="btn-view-cert"
                        >
                          👁️ Lihat
                        </a>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Catatan Admin */}
              {selectedParticipant.adminNotes && (
                <div className="detail-section">
                  <h3>📝 Catatan Admin</h3>
                  <p className="notes-text">{selectedParticipant.adminNotes}</p>
                </div>
              )}

              {/* Timestamp */}
              <div className="detail-section">
                <h3>🕐 Timestamp</h3>
                <div className="detail-grid">
                  <div className="detail-item">
                    <label>Dibuat:</label>
                    <span>{new Date(selectedParticipant.createdAt).toLocaleString('id-ID')}</span>
                  </div>
                  <div className="detail-item">
                    <label>Terakhir Update:</label>
                    <span>{new Date(selectedParticipant.updatedAt).toLocaleString('id-ID')}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="modal-actions">
              {selectedParticipant.status === 'approved' && (
                <button 
                  className="btn-barizta"
                  onClick={() => { setShowDetailModal(false); handleMarkCompleteClick(selectedParticipant); }}
                >
                  ✅ Tandai Telah Selesai
                </button>
              )}
              {selectedParticipant.status === 'completed' && !selectedParticipant.certificateUrl && (
                <button 
                  className="btn-barizta"
                  onClick={() => { setShowDetailModal(false); openGenerateModal(selectedParticipant); }}
                >
                  🎓 Generate Sertifikat
                </button>
              )}
              <button className="btn-secondary-barizta" onClick={() => setShowDetailModal(false)}>
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Payment Proof Modal */}
      {showPaymentModal && selectedParticipant && selectedParticipant.paymentProof && (
        <div className="modal-overlay" onClick={() => setShowPaymentModal(false)}>
          <div className="modal-container payment-modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Bukti Pembayaran</h2>
              <button className="modal-close" onClick={() => setShowPaymentModal(false)}>×</button>
            </div>
            <div className="payment-proof-container">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img 
                src={selectedParticipant.paymentProof} 
                alt="Bukti Pembayaran" 
                className="payment-proof-image"
              />
            </div>
            <div className="payment-info">
              <p><strong>Peserta:</strong> {selectedParticipant.fullName}</p>
              <p><strong>Program:</strong> {selectedParticipant.programName}</p>
            </div>
          </div>
        </div>
      )}

      {/* Mark Complete Confirmation Modal */}
      <DeleteConfirmModal
        isOpen={!!completingParticipant}
        onClose={() => setCompletingParticipant(null)}
        onConfirm={handleMarkCompleteConfirm}
        itemName={completingParticipant?.fullName || 'Peserta ini'}
        itemType="sertifikat"
        title="Konfirmasi Generate Sertifikat"
        warningText="Peserta akan ditandai sebagai telah selesai dan sertifikat akan digenerate."
        confirmButtonText="🎓 Generate Sertifikat"
        cancelButtonText="Batal"
      />

      {/* Revert Status Confirmation Modal */}
      <DeleteConfirmModal
        isOpen={!!revertingParticipant}
        onClose={() => setRevertingParticipant(null)}
        onConfirm={handleRevertConfirm}
        itemName={revertingParticipant?.fullName || 'Peserta ini'}
        itemType="status selesai"
        title="Konfirmasi Pembatalan Status"
        warningText="Status akan dikembalikan ke 'Disetujui' dan peserta perlu ditandai selesai lagi."
        confirmButtonText="↩️ Batalkan Status"
        cancelButtonText="Batal"
      />
    </div>
  );
}
