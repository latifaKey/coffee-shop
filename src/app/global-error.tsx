'use client';

import { useEffect } from 'react';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log critical error
    console.error('Critical application error:', error);
  }, [error]);

  return (
    <html lang="id">
      <body>
        <div style={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '20px',
          background: '#1D1714',
          color: '#F7F2EE',
          fontFamily: 'system-ui, sans-serif',
        }}>
          <div style={{
            maxWidth: '500px',
            textAlign: 'center',
            background: '#26201D',
            padding: '3rem 2rem',
            borderRadius: '16px',
            boxShadow: '0 10px 30px rgba(0,0,0,.35)',
          }}>
            <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>💥</div>
            <h2 style={{ fontSize: '1.5rem', marginBottom: '1rem' }}>
              Critical Error
            </h2>
            <p style={{ 
              color: '#B6B3AC', 
              marginBottom: '2rem',
              lineHeight: '1.6',
            }}>
              Terjadi kesalahan kritis pada aplikasi. Silakan refresh halaman atau hubungi administrator.
            </p>
            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
              <button
                onClick={reset}
                style={{
                  padding: '0.75rem 1.5rem',
                  background: 'linear-gradient(to bottom right, #8B4513, #D2B48C)',
                  color: 'white',
                  border: 'none',
                  borderRadius: '12px',
                  cursor: 'pointer',
                  fontWeight: '600',
                }}
              >
                Reset Aplikasi
              </button>
              <button
                onClick={() => window.location.href = '/'}
                style={{
                  padding: '0.75rem 1.5rem',
                  background: 'transparent',
                  color: '#D2B48C',
                  border: '2px solid #8B4513',
                  borderRadius: '12px',
                  cursor: 'pointer',
                  fontWeight: '600',
                }}
              >
                Ke Beranda
              </button>
            </div>
          </div>
        </div>
      </body>
    </html>
  );
}
