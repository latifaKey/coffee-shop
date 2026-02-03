'use client';

import { useEffect } from 'react';
import { Button } from '@/components/ui';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log error to error reporting service (e.g., Sentry)
    console.error('Application error:', error);
  }, [error]);

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '20px',
      background: 'var(--bg)',
    }}>
      <div style={{
        maxWidth: '500px',
        textAlign: 'center',
        background: 'var(--surface)',
        padding: '3rem 2rem',
        borderRadius: 'var(--radius)',
        boxShadow: 'var(--shadow)',
      }}>
        <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>⚠️</div>
        <h2 style={{ 
          fontSize: '1.5rem', 
          marginBottom: '1rem',
          color: 'var(--text)',
        }}>
          Oops! Terjadi Kesalahan
        </h2>
        <p style={{ 
          color: 'var(--muted)', 
          marginBottom: '2rem',
          lineHeight: '1.6',
        }}>
          Maaf, terjadi kesalahan yang tidak terduga. Tim kami telah menerima notifikasi dan akan segera memperbaikinya.
        </p>
        {process.env.NODE_ENV === 'development' && (
          <pre style={{
            background: 'rgba(255,255,255,0.05)',
            padding: '1rem',
            borderRadius: '8px',
            textAlign: 'left',
            overflow: 'auto',
            fontSize: '0.85rem',
            marginBottom: '1.5rem',
            color: 'var(--danger)',
          }}>
            {error.message}
          </pre>
        )}
        <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
          <Button onClick={reset} variant="primary">
            Coba Lagi
          </Button>
          <Button onClick={() => window.location.href = '/'} variant="ghost">
            Kembali ke Beranda
          </Button>
        </div>
      </div>
    </div>
  );
}
