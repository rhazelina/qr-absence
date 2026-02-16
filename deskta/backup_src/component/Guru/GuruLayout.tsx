import { useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import Sidebar from '../Sidebar';
import AWANKIRI from '../../assets/Icon/AWANKIRI.png';
import AwanBawahkanan from '../../assets/Icon/AwanBawahkanan.png';
import LogoSchool from '../../assets/Icon/logo smk.png';

interface GuruLayoutProps {
  children: ReactNode;
  pageTitle: string;
  currentPage: string;
  onMenuClick: (page: string) => void;
  user: {
    name: string;
    role: string;
  };
  onLogout: () => void;
}

export default function GuruLayout({
  children,
  pageTitle,
  currentPage,
  onMenuClick,
  user,
  onLogout,
}: GuruLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(() => {
    const saved = localStorage.getItem('guruSidebarOpen');
    return saved ? saved === 'true' : true;
  });

  useEffect(() => {
    localStorage.setItem('guruSidebarOpen', sidebarOpen.toString());
  }, [sidebarOpen]);

  const handleToggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  return (
    <div
      style={{
        position: 'relative',
        display: 'flex',
        height: '100vh',
        width: '100vw',
        backgroundColor: '#FFFFFF',
        overflow: 'hidden',
      }}
    >
      {/* BACKGROUND LAYER - Simple untuk guru */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          zIndex: 0,
          pointerEvents: 'none',
        }}
      >
        <img
          src={AWANKIRI}
          alt="Awan Kiri Atas"
          style={{ position: 'absolute', top: 0, left: 0, width: 215, height: 'auto' }}
        />
        <img
          src={AwanBawahkanan}
          alt="Awan Kanan Bawah"
          style={{ position: 'absolute', bottom: 20, right: 20, width: 'auto', height: 'auto' }}
        />
      </div>

      {/* Sidebar */}
      <div style={{ position: 'relative', zIndex: 1 }}>
        <Sidebar
          currentPage={currentPage}
          onMenuClick={onMenuClick}
          onLogout={onLogout}
          isOpen={sidebarOpen}
          onToggle={handleToggleSidebar}
          userRole="guru"
        />
      </div>

      {/* Main Content */}
      <div style={{ position: 'relative', zIndex: 1, flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', width: '100%' }}>
        {/* Header */}
        <header
          style={{
            backgroundColor: '#001f3e',
            color: 'white',
            height: '64px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            paddingLeft: '24px',
            paddingRight: '24px',
            gap: '16px',
            boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
            flexShrink: 0,
          }}
        >
          <h1 style={{ fontSize: '28px', fontWeight: 'bold', flex: 1, textAlign: 'center' }}>
            {pageTitle}
          </h1>

          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexShrink: 0 }}>
            <span style={{ fontSize: '14px', fontWeight: 600 }}>{user.name}</span>
            <img
              src={LogoSchool}
              alt="Logo SMK"
              style={{
                width: '60px',
                height: 'auto',
                cursor: 'default',
              }}
            />
          </div>
        </header>

        {/* Content */}
        <main
          style={{
            flex: 1,
            overflowY: 'auto',
            overflowX: 'hidden',
            padding: '24px',
            display: 'flex',
            flexDirection: 'column',
          }}
        >
          <div style={{ maxWidth: '100%', width: '100%' }}>
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
