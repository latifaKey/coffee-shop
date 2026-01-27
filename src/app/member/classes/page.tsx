"use client";

import { useState, useEffect } from "react";
import "./classes.css";

interface ClassRegistration {
  id: number;
  programId: string;
  programName: string;
  selectedPackages: string;
  schedulePreference: string;
  status: string;
  completedDate: string | null;
  certificateUrl: string | null;
  createdAt: string;
}

const trainingPackages: Record<string, string> = {
  "basic-barista": "Basic Barista (Pemula)",
  "intermediate-barista": "Intermediate Barista",
  "advanced-latte-art": "Advanced / Latte Art",
  "brew-class": "Brew Class (Manual Brewing)"
};

const statusBadge: Record<string, { label: string; className: string }> = {
  pending: { label: "Menunggu Konfirmasi", className: "status-pending" },
  confirmed: { label: "Terkonfirmasi", className: "status-confirmed" },
  ongoing: { label: "Sedang Berlangsung", className: "status-ongoing" },
  completed: { label: "Selesai", className: "status-completed" },
  cancelled: { label: "Dibatalkan", className: "status-cancelled" }
};

export default function ClassesPage() {
  const [activeClasses, setActiveClasses] = useState<ClassRegistration[]>([]);
  const [completedClasses, setCompletedClasses] = useState<ClassRegistration[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"active" | "history">("active");

  useEffect(() => {
    fetchClasses();
  }, []);

  const fetchClasses = async () => {
    try {
      // Fetch active classes
      const activeRes = await fetch("/api/member/class-registrations?type=active");
      if (activeRes.ok) {
        const activeData = await activeRes.json();
        setActiveClasses(activeData);
      }

      // Fetch completed classes
      const historyRes = await fetch("/api/member/class-registrations?type=history");
      if (historyRes.ok) {
        const historyData = await historyRes.json();
        setCompletedClasses(historyData);
      }
    } catch (error) {
      console.error("Error fetching classes:", error);
    } finally {
      setLoading(false);
    }
  };

  const parsePackages = (packagesJson: string): string[] => {
    try {
      return JSON.parse(packagesJson);
    } catch {
      return [];
    }
  };

  const downloadCertificatePdf = (certificateUrl: string, name: string) => {
    try {
      const src = new URL(certificateUrl, window.location.origin).pathname;
      const qs = new URLSearchParams({ src, name });
      const link = document.createElement('a');
      link.href = `/api/certificates/download?${qs.toString()}`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error('Download certificate PDF failed:', error);
    }
  };

  if (loading) return null;

  const displayClasses = activeTab === "active" ? activeClasses : completedClasses;

  return (
    <div className="history-container">
      <div className="page-header">
        <h1>📚 Kelas Saya</h1>
        <p>Kelola dan pantau kelas edukasi Anda</p>
      </div>

      {/* Tabs */}
      <div className="tabs-container">
        <button
          className={`tab-button ${activeTab === "active" ? "active" : ""}`}
          onClick={() => setActiveTab("active")}
        >
          ⏳ Kelas Aktif ({activeClasses.length})
        </button>
        <button
          className={`tab-button ${activeTab === "history" ? "active" : ""}`}
          onClick={() => setActiveTab("history")}
        >
          📖 Riwayat ({completedClasses.length})
        </button>
      </div>

      {/* Stats */}
      <div className="stats-row">
        <div className="stat-item">
          <span className="stat-number">{activeClasses.length}</span>
          <span className="stat-label">Kelas Aktif</span>
        </div>
        <div className="stat-item">
          <span className="stat-number">{completedClasses.length}</span>
          <span className="stat-label">Kelas Selesai</span>
        </div>
        <div className="stat-item">
          <span className="stat-number">{completedClasses.filter(c => c.certificateUrl).length}</span>
          <span className="stat-label">Sertifikat</span>
        </div>
      </div>

      {/* Classes List */}
      {displayClasses.length === 0 ? (
        <div className="empty-state">
          <span className="empty-icon">📭</span>
          <h3>
            {activeTab === "active" 
              ? "Belum ada kelas aktif" 
              : "Belum ada riwayat kelas"}
          </h3>
          <p>
            {activeTab === "active"
              ? "Anda belum mendaftar kelas edukasi apapun. Daftar sekarang di halaman Education!"
              : "Anda belum menyelesaikan kelas edukasi apapun. Setelah menyelesaikan pelatihan, riwayat akan muncul di sini."}
          </p>
        </div>
      ) : (
        <>
        {/* Fixed Schedule Info */}
        <div className="schedule-info-box">
          <div className="schedule-info-header">🕘 Jam Pelaksanaan Kelas (Tetap)</div>
          <div className="schedule-info-content">
            <span>Sesi 1: 09.00–11.30</span>
            <span className="divider">•</span>
            <span>Istirahat: 11.30–13.30</span>
            <span className="divider">•</span>
            <span>Sesi 2: 13.30–16.00</span>
          </div>
          <p className="schedule-info-note">
            * Hari pelaksanaan menyesuaikan pilihan Weekday / Weekend, namun jam kelas mengikuti ketetapan di atas.
          </p>
        </div>
        <div className="table-container">
          <table className="history-table">
            <thead>
              <tr>
                <th>Nama Kelas</th>
                <th>Paket Pelatihan</th>
                <th>Jadwal</th>
                {activeTab === "active" ? (
                  <>
                    <th>Status</th>
                    <th>Tanggal Daftar</th>
                  </>
                ) : (
                  <>
                    <th>Sertifikat</th>
                  </>
                )}
              </tr>
            </thead>
            <tbody>
              {displayClasses.map((classItem) => (
                <tr key={classItem.id}>
                  <td>
                    <div className="class-name">{classItem.programName}</div>
                  </td>
                  <td>
                    <div className="packages-list">
                      {parsePackages(classItem.selectedPackages).map((pkg, idx) => (
                        <span key={idx} className="package-tag">
                          {trainingPackages[pkg] || pkg}
                        </span>
                      ))}
                    </div>
                  </td>
                  <td>
                    <span className="schedule-badge">
                      {classItem.schedulePreference === "Weekday" ? "📅 Senin-Jumat" : "📅 Sabtu-Minggu"}
                    </span>
                  </td>

                  {activeTab === "active" ? (
                    <>
                      <td>
                        <span className={`status-badge ${statusBadge[classItem.status]?.className || "status-pending"}`}>
                          {statusBadge[classItem.status]?.label || classItem.status}
                        </span>
                      </td>
                      <td>
                        <span className="date-text">
                          {new Date(classItem.createdAt).toLocaleDateString('id-ID', {
                            day: 'numeric',
                            month: 'short',
                            year: 'numeric'
                          })}
                        </span>
                      </td>
                    </>
                  ) : (
                    <>
                      <td>
                        {classItem.certificateUrl ? (
                          <button
                            type="button"
                            className="certificate-link"
                            onClick={() => downloadCertificatePdf(classItem.certificateUrl!, classItem.programName || 'Sertifikat')}
                          >
                            🏆 Unduh Sertifikat (PDF)
                          </button>
                        ) : (
                          <span className="no-certificate">Belum tersedia</span>
                        )}
                      </td>
                    </>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        </>
      )}

      {/* Certificate Showcase - Only show in history tab */}
      {activeTab === "history" && completedClasses.filter(c => c.certificateUrl).length > 0 && (
        <div className="certificates-section">
          <h2>🏆 Sertifikat Anda</h2>
          <div className="certificates-grid">
            {completedClasses.filter(c => c.certificateUrl).map((classItem) => (
              <div key={classItem.id} className="certificate-card">
                <div className="certificate-icon">🏅</div>
                <div className="certificate-info">
                  <h4>{classItem.programName}</h4>
                </div>
                <a 
                  href="#"
                  className="btn-download"
                  onClick={(e) => {
                    e.preventDefault();
                    downloadCertificatePdf(classItem.certificateUrl!, classItem.programName || 'Sertifikat');
                  }}
                >
                  📥 Unduh PDF
                </a>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
