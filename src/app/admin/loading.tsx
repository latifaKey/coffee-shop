import { LoadingSpinner } from '@/components/ui';

export default function AdminLoading() {
  return (
    <div className="admin-loading" style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: '60vh',
    }}>
      <div style={{ textAlign: 'center' }}>
        <LoadingSpinner size="lg" />
        <p style={{ 
          marginTop: '1.5rem', 
          color: 'var(--muted)',
          fontSize: '0.95rem',
        }}>
          Memuat data admin...
        </p>
      </div>
    </div>
  );
}
