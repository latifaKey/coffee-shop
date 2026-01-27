"use client";

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import ActionButton, { ActionButtonGroup } from '@/components/admin/ActionButton';
import DeleteConfirmModal from '@/components/ui/DeleteConfirmModal';

interface Category {
  id: number;
  name: string;
  slug: string;
  type: "MINUMAN" | "MAKANAN";
}

interface Product {
  id: number;
  name: string;
  slug: string;
  description: string | null;
  price: number;
  categoryId: number | null;
  category: Category | null;
  image: string;
  isAvailable: boolean;
  createdAt: string;
  updatedAt: string;
}

export default function ProductDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

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

  const handleDeleteClick = () => {
    setShowDeleteModal(true);
  };

  const handleDeleteConfirm = async () => {
    setIsDeleting(true);
    try {
      const res = await fetch(`/api/products/${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Failed to delete');
      router.push('/admin/products');
    } catch {
      setIsDeleting(false);
      setShowDeleteModal(false);
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('id-ID', { 
      style: 'currency', 
      currency: 'IDR',
      minimumFractionDigits: 0 
    }).format(price);
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const containerStyle: React.CSSProperties = {
    padding: '24px',
    maxWidth: '900px',
  };

  const headerStyle: React.CSSProperties = {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '24px',
    flexWrap: 'wrap',
    gap: '16px',
  };

  const cardStyle: React.CSSProperties = {
    background: 'linear-gradient(145deg, #3e2723, #2c1810)',
    border: '1px solid #5d4037',
    borderRadius: '12px',
    overflow: 'hidden',
  };

  const contentStyle: React.CSSProperties = {
    display: 'grid',
    gridTemplateColumns: '300px 1fr',
    gap: '24px',
  };

  const infoRowStyle: React.CSSProperties = {
    display: 'flex',
    justifyContent: 'space-between',
    padding: '12px 0',
    borderBottom: '1px solid #5d4037',
  };

  const labelStyle: React.CSSProperties = {
    color: '#a0a0a0',
    fontSize: '14px',
  };

  const valueStyle: React.CSSProperties = {
    color: '#ffd7a8',
    fontWeight: 500,
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

  return (
    <div style={containerStyle}>
      <div style={headerStyle}>
        <div>
          <Link href="/admin/products" style={{ color: '#d4a574', fontSize: '14px', textDecoration: 'none' }}>
            ← Kembali ke daftar produk
          </Link>
          <h1 style={{ color: '#ffd7a8', margin: '8px 0 0 0', fontSize: '1.5rem' }}>Detail Produk</h1>
        </div>
        <ActionButtonGroup>
          <ActionButton type="edit" href={`/admin/products/${id}/edit`} />
          <ActionButton type="delete" onClick={handleDeleteClick} />
        </ActionButtonGroup>
      </div>

      <div style={cardStyle}>
        <div style={contentStyle}>
          {/* Image Section */}
          <div style={{ padding: '20px' }}>
            <div style={{ 
              position: 'relative', 
              width: '100%', 
              aspectRatio: '1',
              borderRadius: '8px',
              overflow: 'hidden',
              background: '#1a0e0a'
            }}>
              {product.image ? (
                <Image 
                  src={product.image} 
                  alt={product.name} 
                  fill 
                  style={{ objectFit: 'cover' }}
                  unoptimized
                />
              ) : (
                <div style={{ 
                  width: '100%', 
                  height: '100%', 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center',
                  color: '#5d4037'
                }}>
                  No Image
                </div>
              )}
            </div>
            
            {/* Status Badge */}
            <div style={{ marginTop: '12px', textAlign: 'center' }}>
              <span style={{
                padding: '6px 16px',
                borderRadius: '20px',
                fontSize: '12px',
                fontWeight: 600,
                background: product.isAvailable 
                  ? 'rgba(76, 175, 80, 0.2)' 
                  : 'rgba(244, 67, 54, 0.2)',
                color: product.isAvailable ? '#81C784' : '#EF5350',
                border: `1px solid ${product.isAvailable ? '#4CAF50' : '#f44336'}`,
              }}>
                {product.isAvailable ? '✓ Tersedia' : '✕ Tidak Tersedia'}
              </span>
            </div>
          </div>

          {/* Info Section */}
          <div style={{ padding: '20px' }}>
            <h2 style={{ color: '#ffd7a8', margin: '0 0 20px 0', fontSize: '1.3rem' }}>
              {product.name}
            </h2>

            <div style={infoRowStyle}>
              <span style={labelStyle}>Harga</span>
              <span style={{ ...valueStyle, color: '#8B4513', fontSize: '18px' }}>
                {formatPrice(product.price)}
              </span>
            </div>

            <div style={infoRowStyle}>
              <span style={labelStyle}>Kategori</span>
              <span style={valueStyle}>
                {product.category ? (
                  <span style={{
                    padding: '4px 12px',
                    borderRadius: '12px',
                    fontSize: '12px',
                    background: product.category.type === 'MINUMAN' 
                      ? 'rgba(33, 150, 243, 0.2)' 
                      : 'rgba(255, 152, 0, 0.2)',
                    color: product.category.type === 'MINUMAN' ? '#64B5F6' : '#FFB74D',
                    border: `1px solid ${product.category.type === 'MINUMAN' ? '#2196F3' : '#FF9800'}`,
                  }}>
                    {product.category.name}
                  </span>
                ) : (
                  <span style={{ color: '#5d4037' }}>Tidak ada kategori</span>
                )}
              </span>
            </div>

            <div style={infoRowStyle}>
              <span style={labelStyle}>Slug</span>
              <span style={{ ...valueStyle, fontFamily: 'monospace', fontSize: '13px' }}>
                {product.slug}
              </span>
            </div>

            <div style={{ ...infoRowStyle, flexDirection: 'column', gap: '8px' }}>
              <span style={labelStyle}>Deskripsi</span>
              <p style={{ color: '#e0e0e0', margin: 0, lineHeight: 1.6 }}>
                {product.description || 'Tidak ada deskripsi'}
              </p>
            </div>

            <div style={infoRowStyle}>
              <span style={labelStyle}>Dibuat</span>
              <span style={valueStyle}>{formatDate(product.createdAt)}</span>
            </div>

            <div style={{ ...infoRowStyle, border: 'none' }}>
              <span style={labelStyle}>Diperbarui</span>
              <span style={valueStyle}>{formatDate(product.updatedAt)}</span>
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        @media (max-width: 768px) {
          div[style*="grid-template-columns: 300px"] {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>

      {/* Delete Confirmation Modal */}
      <DeleteConfirmModal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={handleDeleteConfirm}
        itemName={product?.name || ""}
        itemType="produk"
        isLoading={isDeleting}
      />
    </div>
  );
}
