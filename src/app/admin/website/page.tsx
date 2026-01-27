"use client";

import { useState, useEffect, useCallback } from "react";
import "./website.css";

interface WebsiteSettings {
  address: string;
  phone: string;
  email: string;
  whatsapp: string;
  instagram: string;
  facebook: string;
  youtube: string;
  tiktok: string;
  mapsUrl: string;
  operatingHours: string;
}

const defaultSettings: WebsiteSettings = {
  address: "BARIZTA SPECIALTY COFFEE\nJl. Dr. Moh. Hatta No.31, Ps. Ambacang,\nKec. Kuranji, Kota Padang, Sumatera Barat 25212",
  phone: "0813 6823 6245",
  email: "Bariztaruangkreatif@gmail.com",
  whatsapp: "6281368236245",
  instagram: "@bariztaspecialtycoffee",
  facebook: "BARIZTA Specialty Coffee",
  youtube: "",
  tiktok: "",
  mapsUrl: "https://www.google.com/maps?q=BARIZTA+SPECIALTY+COFFEE,+Jl.+Dr.+Moh.+Hatta+No.31,+Ps.+Ambacang,+Kec.+Kuranji,+Kota+Padang,+Sumatera+Barat+25212",
  operatingHours: "Senin - Minggu: 08.00 - 23.00 WIB"
};

export default function Website() {
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");
  
  const [savedSettings, setSavedSettings] = useState<WebsiteSettings>(defaultSettings);
  const [formData, setFormData] = useState<WebsiteSettings>(defaultSettings);

  // Fetch settings from API
  const fetchSettings = useCallback(async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/website");
      if (!response.ok) throw new Error("Failed to fetch settings");
      
      const data = await response.json();
      
      // Merge with defaults for any missing keys
      const mergedSettings: WebsiteSettings = {
        address: data.address || defaultSettings.address,
        phone: data.phone || defaultSettings.phone,
        email: data.email || defaultSettings.email,
        whatsapp: data.whatsapp || defaultSettings.whatsapp,
        instagram: data.instagram || defaultSettings.instagram,
        facebook: data.facebook || defaultSettings.facebook,
        youtube: data.youtube || defaultSettings.youtube,
        tiktok: data.tiktok || defaultSettings.tiktok,
        mapsUrl: data.mapsUrl || defaultSettings.mapsUrl,
        operatingHours: data.operatingHours || defaultSettings.operatingHours,
      };
      
      setSavedSettings(mergedSettings);
      setFormData(mergedSettings);
    } catch (err) {
      console.error("Fetch error:", err);
      // Use defaults on error
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSettings();
  }, [fetchSettings]);

  const handleSave = async () => {
    setIsSaving(true);
    setError("");
    setSuccess("");
    
    try {
      const response = await fetch("/api/website", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData)
      });
      
      if (!response.ok) throw new Error("Failed to save settings");
      
      setSavedSettings(formData);
      setSuccess("Perubahan berhasil disimpan!");
      setTimeout(() => setSuccess(""), 3000);
    } catch (err) {
      console.error("Save error:", err);
      setError("Gagal menyimpan perubahan");
      setTimeout(() => setError(""), 3000);
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    setFormData(savedSettings);
  };

  const hasChanges = JSON.stringify(savedSettings) !== JSON.stringify(formData);

  if (loading) return null;

  return (
    <div className="website-container">
      <div className="page-header">
        <div>
          <h1>🌐 Kelola Website</h1>
          <p>Edit konten lokasi & kontak BARIZTA</p>
        </div>
        {hasChanges && (
          <div className="action-buttons">
            <button className="btn-secondary" onClick={handleCancel}>
              ❌ Batal
            </button>
            <button className="btn-primary" onClick={handleSave} disabled={isSaving}>
              {isSaving ? "💾 Menyimpan..." : "💾 Simpan Perubahan"}
            </button>
          </div>
        )}
      </div>

      {/* Alerts */}
      {success && (
        <div className="alert alert-success">
          ✓ {success}
        </div>
      )}
      {error && (
        <div className="alert alert-error">
          ✗ {error}
        </div>
      )}

      {/* Contact Section */}
      <div className="content-section">
        <h2>📍 Informasi Kontak</h2>
        
        <div className="form-group">
          <label>Alamat Lengkap *</label>
          <textarea
            value={formData.address}
            onChange={(e) => setFormData({ ...formData, address: e.target.value })}
            rows={3}
            placeholder="Alamat lengkap coffee shop..."
          />
        </div>

        <div className="form-row">
          <div className="form-group">
            <label>Telepon *</label>
            <input
              type="tel"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              placeholder="021-12345678"
            />
          </div>
          <div className="form-group">
            <label>WhatsApp *</label>
            <input
              type="tel"
              value={formData.whatsapp}
              onChange={(e) => setFormData({ ...formData, whatsapp: e.target.value })}
              placeholder="081234567890"
            />
          </div>
        </div>

        <div className="form-group">
          <label>Email *</label>
          <input
            type="email"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            placeholder="info@barizta.com"
          />
        </div>

        <div className="form-row">
          <div className="form-group">
            <label>Instagram</label>
            <input
              type="text"
              value={formData.instagram}
              onChange={(e) => setFormData({ ...formData, instagram: e.target.value })}
              placeholder="@bariztacoffee"
            />
          </div>
          <div className="form-group">
            <label>Facebook</label>
            <input
              type="text"
              value={formData.facebook}
              onChange={(e) => setFormData({ ...formData, facebook: e.target.value })}
              placeholder="BARIZTA Coffee Official"
            />
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label>YouTube</label>
            <input
              type="text"
              value={formData.youtube}
              onChange={(e) => setFormData({ ...formData, youtube: e.target.value })}
              placeholder="@BARIZTACoffee atau URL channel"
            />
          </div>
          <div className="form-group">
            <label>TikTok</label>
            <input
              type="text"
              value={formData.tiktok}
              onChange={(e) => setFormData({ ...formData, tiktok: e.target.value })}
              placeholder="@bariztacoffee"
            />
          </div>
        </div>

        <div className="form-group">
          <label>Google Maps URL *</label>
          <input
            type="url"
            value={formData.mapsUrl}
            onChange={(e) => setFormData({ ...formData, mapsUrl: e.target.value })}
            placeholder="https://maps.google.com/?q=..."
          />
        </div>

        <div className="form-group">
          <label>Jam Operasional *</label>
          <textarea
            value={formData.operatingHours}
            onChange={(e) => setFormData({ ...formData, operatingHours: e.target.value })}
            rows={3}
            placeholder="Senin - Jumat: 08:00 - 22:00"
          />
        </div>

        {/* Preview */}
        <div className="preview-section">
          <h3>👁️ Preview</h3>
          <div className="preview-content">
            <div className="contact-preview">
              <div className="contact-item">
                <span className="icon">📍</span>
                <div>
                  <strong>Alamat</strong>
                  <p>{formData.address}</p>
                </div>
              </div>
              <div className="contact-item">
                <span className="icon">📞</span>
                <div>
                  <strong>Telepon</strong>
                  <p>{formData.phone}</p>
                </div>
              </div>
              <div className="contact-item">
                <span className="icon">💬</span>
                <div>
                  <strong>WhatsApp</strong>
                  <p>{formData.whatsapp}</p>
                </div>
              </div>
              <div className="contact-item">
                <span className="icon">📧</span>
                <div>
                  <strong>Email</strong>
                  <p>{formData.email}</p>
                </div>
              </div>
              <div className="contact-item">
                <span className="icon">📱</span>
                <div>
                  <strong>Social Media</strong>
                  <p>Instagram: {formData.instagram}</p>
                  <p>Facebook: {formData.facebook}</p>
                  {formData.youtube && <p>YouTube: {formData.youtube}</p>}
                  {formData.tiktok && <p>TikTok: {formData.tiktok}</p>}
                </div>
              </div>
              <div className="contact-item">
                <span className="icon">🕐</span>
                <div>
                  <strong>Jam Operasional</strong>
                  <p style={{ whiteSpace: 'pre-line' }}>{formData.operatingHours}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
