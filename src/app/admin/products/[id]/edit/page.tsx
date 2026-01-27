"use client";

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import ProductForm from '@/components/admin/ProductForm';

interface Product {
  id: number;
  name: string;
  slug: string;
  description: string | null;
  price: number;
  categoryId: number | null;
  image: string;
  isAvailable: boolean;
}

export default function EditProductPage() {
  const params = useParams();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const id = params?.id as string;

  useEffect(() => {
    if (!id) return;
    
    fetch(`/api/products/${id}`)
      .then(res => {
        if (!res.ok) throw new Error('Product not found');
        return res.json();
      })
      .then(data => {
        setProduct(data);
        setLoading(false);
      })
      .catch(err => {
        setError(err.message);
        setLoading(false);
      });
  }, [id]);

  const containerStyle: React.CSSProperties = {
    padding: '24px',
    maxWidth: '700px',
  };

  if (loading) {
    return (
      <div style={containerStyle}>
        <p style={{ color: '#a0a0a0', textAlign: 'center' }}>Memuat...</p>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div style={containerStyle}>
        <div style={{ textAlign: 'center', padding: '40px' }}>
          <p style={{ color: '#EF5350', marginBottom: '16px' }}>{error || 'Produk tidak ditemukan'}</p>
          <Link href="/admin/products" style={{ color: '#d4a574' }}>← Kembali ke daftar produk</Link>
        </div>
      </div>
    );
  }

  const initial = { 
    id: product.id, 
    name: product.name, 
    categoryId: product.categoryId,
    price: product.price, 
    image: product.image,
    description: product.description || '',
    isAvailable: product.isAvailable
  };

  return (
    <div style={containerStyle}>
      <div style={{ marginBottom: '24px' }}>
        <Link href="/admin/products" style={{ color: '#d4a574', fontSize: '14px', textDecoration: 'none' }}>
          ← Kembali ke daftar produk
        </Link>
        <h1 style={{ color: '#ffd7a8', margin: '8px 0 0 0', fontSize: '1.5rem' }}>Edit Produk</h1>
        <p style={{ color: '#a0a0a0', margin: '4px 0 0 0' }}>Ubah informasi produk &quot;{product.name}&quot;</p>
      </div>
      
      <ProductForm initial={initial} redirectTo="/admin/products" />
    </div>
  );
}
