import { LoadingSpinner } from '@/components/ui';

export default function Loading() {
  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'var(--bg)',
    }}>
      <div style={{ textAlign: 'center' }}>
        <LoadingSpinner size="lg" />
        <p style={{ 
          marginTop: '1.5rem', 
          color: 'var(--muted)',
          fontSize: '0.95rem',
        }}>
          Memuat halaman...
        </p>
      </div>
    </div>
  );
}
