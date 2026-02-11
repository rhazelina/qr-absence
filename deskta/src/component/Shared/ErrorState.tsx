import React from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';

interface ErrorStateProps {
  message?: string;
  onRetry?: () => void;
}

const ErrorState: React.FC<ErrorStateProps> = ({ message = "Terjadi kesalahan saat memuat data.", onRetry }) => {
  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: '300px',
      padding: '2rem',
      textAlign: 'center',
      backgroundColor: '#FEF2F2', // red-50
      borderRadius: '0.75rem',
      border: '1px solid #FEE2E2' // red-100
    }}>
      <div style={{
        padding: '0.75rem',
        marginBottom: '1rem',
        backgroundColor: '#FEE2E2', // red-100
        borderRadius: '9999px'
      }}>
        <AlertTriangle size={32} color="#DC2626" />
      </div>
      <h3 style={{ marginBottom: '0.5rem', fontSize: '1.125rem', fontWeight: 700, color: '#991B1B' }}>
        Gagal Memuat Data
      </h3>
      <p style={{ maxWidth: '28rem', marginBottom: '1.5rem', color: '#DC2626' }}>
        {message}
      </p>
      
      {onRetry && (
        <button 
          onClick={onRetry}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            padding: '0.5rem 1rem',
            fontWeight: 500,
            color: 'white',
            backgroundColor: '#DC2626', // red-600
            borderRadius: '0.5rem',
            border: 'none',
            cursor: 'pointer',
            transition: 'background-color 0.2s'
          }}
          onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#B91C1C'}
          onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#DC2626'}
        >
          <RefreshCw size={16} />
          Coba Lagi
        </button>
      )}
    </div>
  );
};

export default ErrorState;
