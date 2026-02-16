import { useEffect, useState } from 'react';
import type { ReactNode } from 'react';
import Sidebar from '../Sidebar';
import AWANKIRI from '../../assets/Icon/AWANKIRI.png';
import AWANKANAN from '../../assets/Icon/AWANKANAN.png';
import INO from '../../assets/Icon/InoBlue.svg';
import RASI from '../../assets/Icon/RasiRed.svg';
import LogoSchool from '../../assets/Icon/logo smk.png';

interface StaffLayoutProps {
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

export default function StaffLayout({
  children,
  pageTitle,
  currentPage,
  onMenuClick,
  user,
  onLogout,
}: StaffLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(() => {
    const saved = localStorage.getItem('wakaSidebarOpen');
    return saved ? saved === 'true' : true;
  });

  useEffect(() => {
    localStorage.setItem('wakaSidebarOpen', sidebarOpen.toString());
  }, [sidebarOpen]);

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
          style={{ position: 'absolute', top: 0, left: 0, width: 215 }}
        />
        <img
          src={AWANKANAN}
          alt="Awan Kanan Atas"
          style={{ position: 'absolute', top: 0, right: 0, width: 239 }}
        />
        <img
          src={INO}
          alt="Maskot Kiri"
          style={{ position: 'absolute', bottom: 0, left: 24, width: 210 }}
        />
        <img
          src={RASI}
          alt="Maskot Kanan"
          style={{ position: 'absolute', bottom: 0, right: 0, width: 170 }}
        />
      </div>

      <div style={{ position: 'relative', zIndex: 1 }}>
        <Sidebar
          currentPage={currentPage}
          onMenuClick={onMenuClick}
          onLogout={onLogout}
          isOpen={sidebarOpen}
          onToggle={() => setSidebarOpen(!sidebarOpen)}
          userRole="waka"
        />
      </div>

      <div
        style={{
          position: 'relative',
          zIndex: 1,
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
          width: '100%',
        }}
      >
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
          <div style={{ textAlign: 'left' }}>
            <p style={{ margin: 0, fontSize: '14px', opacity: 0.8 }}>{user.role}</p>
            <h1 style={{ margin: 0, fontSize: '26px', fontWeight: 700 }}>{pageTitle}</h1>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <span style={{ fontWeight: 600 }}>{user.name}</span>
            <img src={LogoSchool} alt="Logo SMK" style={{ width: '56px', height: 'auto' }} />
          </div>
        </header>

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
          <div style={{ width: '100%', maxWidth: '100%' }}>{children}</div>
        </main>
      </div>
    </div>
  );
}
