"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";

interface CertificateData {
  code: string;
  recipientName: string;
  programName: string;
  completionDate: string;
  issuedBy: string;
}

export default function CertificatePage() {
  const params = useParams();
  const code = params.code as string;
  const [certificate, setCertificate] = useState<CertificateData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (code) {
      verifyCertificate();
    }
  }, [code]);

  const verifyCertificate = async () => {
    try {
      const res = await fetch(`/api/admin/generate-certificate?code=${code}`);
      const data = await res.json();
      
      if (data.success) {
        setCertificate(data.certificate);
      } else {
        setError(data.error || "Sertifikat tidak valid");
      }
    } catch {
      setError("Gagal memverifikasi sertifikat");
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  };

  if (loading) {
    return (
      <div style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "linear-gradient(135deg, #1a0f0a 0%, #2d1810 50%, #1a0f0a 100%)"
      }}>
        <div style={{ color: "#ffd7a8", fontSize: "1.2rem" }}>Memverifikasi sertifikat...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "linear-gradient(135deg, #1a0f0a 0%, #2d1810 50%, #1a0f0a 100%)"
      }}>
        <div style={{
          background: "rgba(244, 67, 54, 0.1)",
          border: "2px solid #f44336",
          borderRadius: "16px",
          padding: "2rem",
          textAlign: "center",
          maxWidth: "500px"
        }}>
          <div style={{ fontSize: "3rem", marginBottom: "1rem" }}>❌</div>
          <h2 style={{ color: "#f44336", marginBottom: "0.5rem" }}>Sertifikat Tidak Valid</h2>
          <p style={{ color: "#e6d5c3" }}>{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div style={{
      minHeight: "100vh",
      padding: "2rem",
      background: "linear-gradient(135deg, #1a0f0a 0%, #2d1810 50%, #1a0f0a 100%)"
    }}>
      <div style={{
        maxWidth: "800px",
        margin: "0 auto",
        background: "linear-gradient(145deg, rgba(62, 39, 35, 0.9), rgba(46, 29, 24, 0.95))",
        borderRadius: "24px",
        border: "3px solid #d4a574",
        overflow: "hidden",
        boxShadow: "0 20px 60px rgba(0,0,0,0.5)"
      }}>
        {/* Header */}
        <div style={{
          background: "linear-gradient(135deg, #d4a574 0%, #8B4513 100%)",
          padding: "2rem",
          textAlign: "center"
        }}>
          <div style={{ fontSize: "3rem", marginBottom: "0.5rem" }}>☕</div>
          <h1 style={{ color: "#1a0f0a", fontSize: "1.8rem", fontWeight: "800", margin: 0 }}>
            BARIZTA COFFEE ACADEMY
          </h1>
          <p style={{ color: "#2d1810", fontSize: "1rem", margin: "0.5rem 0 0" }}>
            Certificate of Completion
          </p>
        </div>

        {/* Verification Badge */}
        <div style={{
          background: "linear-gradient(135deg, #4caf50, #66bb6a)",
          padding: "0.75rem",
          textAlign: "center",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: "0.5rem"
        }}>
          <span style={{ fontSize: "1.2rem" }}>✓</span>
          <span style={{ color: "white", fontWeight: "700" }}>SERTIFIKAT TERVERIFIKASI</span>
        </div>

        {/* Certificate Content */}
        <div style={{ padding: "2.5rem", textAlign: "center" }}>
          <p style={{ color: "#d4a574", fontSize: "1rem", marginBottom: "0.5rem" }}>
            Diberikan kepada
          </p>
          <h2 style={{
            color: "#ffd7a8",
            fontSize: "2.2rem",
            fontWeight: "800",
            marginBottom: "1.5rem",
            textTransform: "uppercase",
            letterSpacing: "2px"
          }}>
            {certificate?.recipientName}
          </h2>

          <p style={{ color: "#e6d5c3", fontSize: "1rem", marginBottom: "0.5rem" }}>
            Telah berhasil menyelesaikan program
          </p>
          <h3 style={{
            color: "#d4a574",
            fontSize: "1.5rem",
            fontWeight: "700",
            marginBottom: "2rem"
          }}>
            {certificate?.programName}
          </h3>

          <div style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: "1.5rem",
            maxWidth: "500px",
            margin: "0 auto 2rem"
          }}>
            <div style={{
              background: "rgba(212, 165, 116, 0.1)",
              borderRadius: "12px",
              padding: "1rem",
              border: "1px solid rgba(212, 165, 116, 0.3)"
            }}>
              <p style={{ color: "#d4a574", fontSize: "0.85rem", marginBottom: "0.25rem" }}>
                Tanggal Selesai
              </p>
              <p style={{ color: "#ffd7a8", fontSize: "1rem", fontWeight: "600" }}>
                {certificate?.completionDate ? formatDate(certificate.completionDate) : '-'}
              </p>
            </div>
            <div style={{
              background: "rgba(212, 165, 116, 0.1)",
              borderRadius: "12px",
              padding: "1rem",
              border: "1px solid rgba(212, 165, 116, 0.3)"
            }}>
              <p style={{ color: "#d4a574", fontSize: "0.85rem", marginBottom: "0.25rem" }}>
                Dikeluarkan oleh
              </p>
              <p style={{ color: "#ffd7a8", fontSize: "1rem", fontWeight: "600" }}>
                {certificate?.issuedBy}
              </p>
            </div>
          </div>

          {/* Certificate Code */}
          <div style={{
            background: "rgba(0,0,0,0.3)",
            borderRadius: "12px",
            padding: "1rem",
            marginTop: "1rem"
          }}>
            <p style={{ color: "#d4a574", fontSize: "0.85rem", marginBottom: "0.5rem" }}>
              Kode Sertifikat
            </p>
            <p style={{
              color: "#ffd7a8",
              fontSize: "1.2rem",
              fontWeight: "700",
              fontFamily: "monospace",
              letterSpacing: "2px"
            }}>
              {certificate?.code}
            </p>
          </div>
        </div>

        {/* Footer */}
        <div style={{
          background: "rgba(0,0,0,0.2)",
          padding: "1rem",
          textAlign: "center"
        }}>
          <p style={{ color: "#d4a574", fontSize: "0.8rem", margin: 0 }}>
            Verifikasi sertifikat ini di: barizta.com/certificates/{certificate?.code}
          </p>
        </div>
      </div>
    </div>
  );
}
