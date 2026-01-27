"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from '@/components/ui/toast';
import ImageUploader from '@/components/admin/ImageUploader';

interface Category {
  id: number;
  name: string;
  slug: string;
  type: "MINUMAN" | "MAKANAN";
  imageFolder: string | null;
}

type ProductFormProps = {
  initial?: Partial<{ 
    id: number; 
    name: string; 
    categoryId: number | null;
    price: number; 
    image: string; 
    description: string; 
    isAvailable: boolean 
  }>;
  redirectTo?: string;
  onSaved?: () => void;
};

export default function ProductForm({ initial, redirectTo = '/admin/products', onSaved }: ProductFormProps) {
  const router = useRouter();
  const [name, setName] = useState(initial?.name ?? '');
  const [description, setDescription] = useState(initial?.description ?? '');
  const [categoryId, setCategoryId] = useState<number | "">(initial?.categoryId ?? "");
  const [price, setPrice] = useState<string>(initial?.price ? String(initial.price) : '');
  const [image, setImage] = useState<string | null>(initial?.image ?? null);
  const [isAvailable, setIsAvailable] = useState(initial?.isAvailable ?? true);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch('/api/categories')
      .then(res => res.json())
      .then(data => setCategories(data))
      .catch(err => console.error('Failed to fetch categories:', err));
  }, []);

  const handleSuccess = () => {
    onSaved?.();
    if (!onSaved) router.push(redirectTo);
  };

  const handleSave = async () => {
    setError(null);
    
    // Validation
    if (!name.trim()) {
      setError('Nama produk wajib diisi');
      toast('Nama produk wajib diisi', 'error');
      return;
    }
    if (!price || Number(price) <= 0) {
      setError('Harga harus lebih dari 0');
      toast('Harga harus lebih dari 0', 'error');
      return;
    }
    if (!image) {
      setError('Gambar produk wajib diisi');
      toast('Gambar produk wajib diisi', 'error');
      return;
    }

    setLoading(true);
    try {
      const payload = { 
        name: name.trim(), 
        description: description.trim(),
        categoryId: categoryId || null,
        price: Number(price), 
        image: image,
        isAvailable 
      };
      
      const res = initial?.id
        ? await fetch(`/api/products/${initial.id}`, { 
            method: 'PUT', 
            headers: { 'Content-Type': 'application/json' }, 
            body: JSON.stringify(payload) 
          })
        : await fetch('/api/products', { 
            method: 'POST', 
            headers: { 'Content-Type': 'application/json' }, 
            body: JSON.stringify(payload) 
          });

      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || 'Gagal menyimpan produk');

      toast(initial?.id ? 'Perubahan produk disimpan' : 'Produk baru berhasil dibuat', 'success');
      handleSuccess();
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Terjadi kesalahan';
      setError(message);
      toast(message, 'error');
    } finally {
      setLoading(false);
    }
  };

  const formStyle: React.CSSProperties = {
    maxWidth: 600,
    background: 'linear-gradient(145deg, #3e2723, #2c1810)',
    padding: '24px',
    borderRadius: '12px',
    border: '1px solid #5d4037',
  };

  const labelStyle: React.CSSProperties = {
    display: 'block',
    marginBottom: '6px',
    color: '#d4a574',
    fontWeight: 500,
  };

  const inputStyle: React.CSSProperties = {
    width: '100%',
    padding: '10px 12px',
    background: '#1a0e0a',
    color: '#fff',
    border: '1px solid #5d4037',
    borderRadius: '6px',
    fontSize: '14px',
  };

  const selectStyle: React.CSSProperties = {
    ...inputStyle,
    cursor: 'pointer',
  };

  const textareaStyle: React.CSSProperties = {
    ...inputStyle,
    minHeight: '80px',
    resize: 'vertical',
  };

  const buttonStyle: React.CSSProperties = {
    padding: '12px 24px',
    background: 'linear-gradient(180deg, #8B4513, #6B3A19)',
    color: '#fff',
    border: 'none',
    borderRadius: '8px',
    cursor: loading ? 'not-allowed' : 'pointer',
    fontWeight: 600,
    opacity: loading ? 0.7 : 1,
  };

  const cancelStyle: React.CSSProperties = {
    padding: '12px 24px',
    background: 'transparent',
    color: '#a0a0a0',
    border: '1px solid #5d4037',
    borderRadius: '8px',
    cursor: 'pointer',
  };

  // Group categories by type
  const minumanCategories = categories.filter(c => c.type === 'MINUMAN');
  const makananCategories = categories.filter(c => c.type === 'MAKANAN');

  return (
    <div style={formStyle}>
      {error && (
        <div style={{ 
          padding: '12px', 
          background: 'rgba(220, 38, 38, 0.2)', 
          border: '1px solid #DC2626',
          borderRadius: '8px',
          color: '#EF5350',
          marginBottom: '16px'
        }}>
          {error}
        </div>
      )}

      <div style={{ marginBottom: 16 }}>
        <label style={labelStyle}>Nama Produk *</label>
        <input 
          value={name} 
          onChange={(e) => setName(e.target.value)} 
          placeholder="Masukkan nama produk"
          style={inputStyle}
          required 
        />
      </div>

      <div style={{ marginBottom: 16 }}>
        <label style={labelStyle}>Deskripsi</label>
        <textarea 
          value={description} 
          onChange={(e) => setDescription(e.target.value)} 
          placeholder="Deskripsi produk (opsional)"
          style={textareaStyle}
        />
      </div>

      <div style={{ marginBottom: 16 }}>
        <label style={labelStyle}>Kategori</label>
        <select 
          value={categoryId} 
          onChange={(e) => setCategoryId(e.target.value ? Number(e.target.value) : "")}
          style={selectStyle}
        >
          <option value="">-- Pilih Kategori --</option>
          {minumanCategories.length > 0 && (
            <optgroup label="MINUMAN">
              {minumanCategories.map(cat => (
                <option key={cat.id} value={cat.id}>{cat.name}</option>
              ))}
            </optgroup>
          )}
          {makananCategories.length > 0 && (
            <optgroup label="MAKANAN">
              {makananCategories.map(cat => (
                <option key={cat.id} value={cat.id}>{cat.name}</option>
              ))}
            </optgroup>
          )}
        </select>
      </div>

      <div style={{ marginBottom: 16 }}>
        <label style={labelStyle}>Harga (Rp) *</label>
        <input 
          type="number" 
          value={price} 
          onChange={(e) => setPrice(e.target.value)} 
          min="0" 
          placeholder="0"
          style={inputStyle}
          required 
        />
      </div>

      <div style={{ marginBottom: 16 }}>
        <label style={labelStyle}>Gambar *</label>
        <ImageUploader 
          initialPreview={image} 
          onUploaded={(filename: string) => setImage(filename)} 
        />
      </div>

      <div style={{ marginBottom: 20 }}>
        <label style={{ ...labelStyle, display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
          <input 
            type="checkbox" 
            checked={isAvailable} 
            onChange={(e) => setIsAvailable(e.target.checked)}
            style={{ width: 18, height: 18, cursor: 'pointer' }}
          />
          Produk Tersedia
        </label>
      </div>

      <div style={{ display: 'flex', gap: 12 }}>
        <button onClick={handleSave} disabled={loading} style={buttonStyle}>
          {loading ? 'Menyimpan...' : (initial?.id ? 'Simpan Perubahan' : 'Tambah Produk')}
        </button>
        <button 
          type="button"
          onClick={() => router.push(redirectTo)} 
          style={cancelStyle}
        >
          Batal
        </button>
      </div>
    </div>
  );
}
