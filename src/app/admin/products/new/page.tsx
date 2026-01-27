"use client";

import Link from 'next/link';
import ProductForm from '@/components/admin/ProductForm';

export default function NewProductPage() {
  const containerStyle: React.CSSProperties = {
    padding: '24px',
    maxWidth: '700px',
  };

  return (
    <div style={containerStyle}>
      <div style={{ marginBottom: '24px' }}>
        <Link href="/admin/products" style={{ color: '#d4a574', fontSize: '14px', textDecoration: 'none' }}>
          ← Kembali ke daftar produk
        </Link>
        <h1 style={{ color: '#ffd7a8', margin: '8px 0 0 0', fontSize: '1.5rem' }}>Tambah Produk Baru</h1>
        <p style={{ color: '#a0a0a0', margin: '4px 0 0 0' }}>Isi form di bawah untuk menambah produk baru</p>
      </div>
      
      <ProductForm redirectTo="/admin/products" />
    </div>
  );
}
