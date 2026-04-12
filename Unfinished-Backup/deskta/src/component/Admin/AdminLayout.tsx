//AdminLayout.tsx
import { type ReactNode, useState, useEffect } from "react";
import Sidebar from "../../component/Sidebar";
import AWANKANAN from "../../assets/Icon/AWANKANAN.png";
import AWANKIRI from "../../assets/Icon/AWANKIRI.png";
import INO from "../../assets/Icon/InoBlue.svg";
import RASI from "../../assets/Icon/RasiRed.svg";

interface AdminLayoutProps {
  children: ReactNode;
  pageTitle: string;
  currentPage: string;
  onMenuClick: (page: string) => void;
  user: {
    name: string;
    role: string;
  };
  onLogout: () => void;
  hideBackground?: boolean;
}

export default function AdminLayout({
  children,
  pageTitle,
  currentPage,
  onMenuClick,
  user,
  onLogout,
  hideBackground = false,
}: AdminLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(() => {
    const saved = localStorage.getItem("sidebarOpen");
    return saved ? saved === "true" : true;
  });

  // ✅ DIUBAH: State untuk logo_sekolah
  const [logoSekolah, setLogoSekolah] = useState<string>('');

  useEffect(() => {
    localStorage.setItem("sidebarOpen", sidebarOpen.toString());
  }, [sidebarOpen]);

  // ✅ DIUBAH: Load logo_sekolah dari localStorage
  useEffect(() => {
    const loadLogoSekolah = () => {
      const schoolData = localStorage.getItem('schoolData');
      if (schoolData) {
        try {
          const parsed = JSON.parse(schoolData);
          setLogoSekolah(parsed.logo_sekolah || '');
        } catch (error) {
          console.error('Error loading school data:', error);
        }
      }
    };

    loadLogoSekolah();

    // ✅ DIUBAH: Listen untuk update event dari ProfilSekolah
    const handleUpdate = () => {
      loadLogoSekolah();
    };
    window.addEventListener('schoolDataUpdated', handleUpdate);
    window.addEventListener('schoolSettingsUpdated', handleUpdate);
    return () => {
      window.removeEventListener('schoolDataUpdated', handleUpdate);
      window.removeEventListener('schoolSettingsUpdated', handleUpdate);
    };
  }, []);

  const handleToggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  return (
    <div
      style={{
        position: "relative",
        display: "flex",
        height: "100vh",
        width: "100vw",
        backgroundColor: "#FFFFFF",
        overflow: "hidden",
      }}
    >
      {/* BACKGROUND LAYER GLOBAL */}
      {!hideBackground && (
        <div
          className="absolute inset-0 z-0 pointer-events-none overflow-hidden"
        >
          {/* Background warna dengan opacity rendah */}
          <div
            className="absolute inset-0 bg-[#0B2948] bg-opacity-[0.03]"
          />

          {/* Awan dan dekorasi */}
          <img
            src={AWANKIRI}
            alt="Awan Kiri Atas"
            style={{
              position: "absolute",
              top: -20,
              left: -30,
              width: 280,
              height: "auto",
              filter: "brightness(1.1)",
              opacity: 0.15,
            }}
          />
          <img
            src={AWANKANAN}
            alt="Awan Kanan Atas"
            style={{
              position: "absolute",
              top: -30,
              right: -40,
              width: 300,
              height: "auto",
              filter: "brightness(1.1)",
              opacity: 0.15,
            }}
          />
          <img
            src={INO}
            alt="INO"
            style={{
              position: "absolute",
              bottom: -20,
              left: -40,
              width: 260,
              height: "auto",
              opacity: 0.1,
            }}
          />
          <img
            src={RASI}
            alt="RASI"
            style={{
              position: "absolute",
              bottom: -20,
              right: -30,
              width: 220,
              height: "auto",
              opacity: 0.1,
            }}
          />
        </div>
      )}

      {/* Sidebar */}
      <div style={{ position: "relative", zIndex: 20 }}>
        <Sidebar
          currentPage={currentPage}
          onMenuClick={onMenuClick}
          onLogout={onLogout}
          isOpen={sidebarOpen}
          onToggle={handleToggleSidebar}
          userRole={user.role}
        />
      </div>

      {/* Main Content */}
      <div
        style={{
          position: "relative",
          zIndex: 10,
          flex: 1,
          display: "flex",
          flexDirection: "column",
          overflow: "hidden",
          width: "100%",
        }}
      >
        {/* Header - beri background putih solid */}
        <header
          className="bg-white h-[72px] flex items-center justify-between px-7 gap-4 shadow-[0_2px_12px_rgba(11,41,72,0.08)] border-b border-gray-200 shrink-0 relative z-15"
        >
          <div style={{ flex: 1 }}>
            <h1
              style={{
                fontSize: "24px",
                fontWeight: "700",
                color: "#001F3E",
                margin: 0,
                display: "flex",
                alignItems: "center",
                gap: "12px",
              }}
            >
              <div
                className="w-1 h-7 bg-[#0B2948] rounded-sm"
              />
              {pageTitle}
            </h1>
            {pageTitle === "Beranda" && (
              <p style={{ margin: "4px 0 0 16px", fontSize: "14px", color: "#6B7280" }}>
                Selamat datang kembali, {user.name}!
              </p>
            )}
          </div>

          <div style={{
            display: "flex",
            alignItems: "center",
            gap: "16px",
            flexShrink: 0
          }}>
            <div style={{
              textAlign: "right",
              paddingRight: "16px",
              borderRight: "1px solid #E5E7EB"
            }}>
              <div style={{ fontSize: "14px", fontWeight: "600", color: "#001F3E" }}>
                {user.name}
              </div>
              <div style={{ fontSize: "12px", color: "#6B7280", textTransform: "capitalize" }}>
                {user.role.replace('_', ' ')}
              </div>
            </div>
            {/* ✅ DIUBAH: Hanya tampilkan logo jika logo_sekolah tidak kosong */}
            {logoSekolah && (
              <img
                src={logoSekolah}
                alt="Logo SMK"
                style={{
                  width: "48px",
                  height: "48px",
                  borderRadius: "8px",
                  boxShadow: "0 2px 8px rgba(0, 0, 0, 0.1)",
                  padding: "4px",
                  backgroundColor: "white",
                  border: "1px solid #E5E7EB",
                }}
              />
            )}
          </div>
        </header>

        {/* Content Area */}
        <div
          style={{
            flex: 1,
            position: "relative",
            overflow: "hidden",
            backgroundColor: "transparent",
          }}
        >
          {/* Main Content Container */}
          <main
            style={{
              position: "relative",
              zIndex: 5,
              height: "100%",
              overflowY: "auto",
              overflowX: "hidden",
              padding: "28px",
              display: "flex",
              flexDirection: "column",
            }}
          >
            {/* Content Wrapper dengan background putih */}
            <div
              style={{
                position: "relative",
                zIndex: 5,
                maxWidth: "1400px",
                width: "100%",
                margin: "0 auto",
                flex: 1,
              }}
            >
              {/* Konten utama dengan background putih dan sedikit transparansi */}
              <div
                className="relative z-5 bg-white/70 rounded-xl backdrop-blur-md shadow-sm border border-white/50"
              >
                {children}
              </div>
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}