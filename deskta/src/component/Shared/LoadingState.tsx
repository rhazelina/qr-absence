import React from 'react';

interface LoadingStateProps {
  message?: string;
}

const LoadingState: React.FC<LoadingStateProps> = ({ message = "Memuat data..." }) => {
  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: '300px',
      padding: '2rem',
      textAlign: 'center'
    }}>
      <div style={{
        width: '48px',
        height: '48px',
        marginBottom: '1rem',
        borderRadius: '50%',
        border: '4px solid #BFDBFE', // blue-200
        borderTopColor: '#2563EB', // blue-600
        animation: 'spin 1s linear infinite'
      }} />
      <style>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
      <h3 style={{ fontSize: '1.125rem', fontWeight: 500, color: '#374151' }}>{message}</h3>
    </div>
  );
};

export default LoadingState;
