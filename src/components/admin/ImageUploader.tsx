"use client";

import React, { useState } from 'react';

type Props = { onUploaded: (filename: string) => void; onUploadError?: (message: string) => void; initialPreview?: string | null };

export default function ImageUploader({ onUploaded, onUploadError, initialPreview = null }: Props) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedFileName, setSelectedFileName] = useState<string>('');

  const handleFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    setError(null);

    // Validate file size (max 5MB)
    if (f.size > 5 * 1024 * 1024) {
      const msg = 'Ukuran file maksimal 5MB';
      setError(msg);
      if (onUploadError) onUploadError(msg);
      return;
    }

    // Validate file type
    const validTypes = ['image/png', 'image/jpeg', 'image/jpg', 'image/webp'];
    if (!validTypes.includes(f.type)) {
      const msg = 'Format file harus PNG, JPG, atau WEBP';
      setError(msg);
      if (onUploadError) onUploadError(msg);
      return;
    }

    setSelectedFileName(f.name);
    const fd = new FormData(); 
    fd.append('file', f);
    
    try {
      setUploading(true);
      const res = await fetch('/api/upload', { method: 'POST', body: fd });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || 'Upload failed');
      // Use filePath for full path, fallback to /uploads/filename if only filename is available
      const imagePath = data.filePath || `/uploads/${data.filename}`;
      onUploaded(imagePath);
      // Do NOT show a global toast for uploads here — parent should decide whether to notify on save.
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Upload error';
      setError(message);
      if (onUploadError) onUploadError(message);
      setSelectedFileName('');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div style={{ width: '100%' }}>
      <input
        type="file"
        accept="image/png,image/jpeg,image/jpg,image/webp"
        onChange={handleFile}
        disabled={uploading}
      />

      <div className="help-text">Format: PNG, JPG, JPEG, WEBP (Maksimum 5MB)</div>

      {initialPreview && !selectedFileName && (
        <div className="help-text">Gambar saat ini sudah ada (tidak diubah jika tidak memilih file baru).</div>
      )}

      {selectedFileName && (
        <div className="help-text">File dipilih: {selectedFileName}</div>
      )}

      {uploading && (
        <div className="help-text">Mengupload...</div>
      )}

      {error && (
        <div className="error-message">⚠️ {error}</div>
      )}
    </div>
  );
}
