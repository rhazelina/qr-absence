import { useState, useEffect } from "react";
import type { ReactNode } from "react";
import Sidebar from "../Sidebar";

interface PengurusKelasLayoutProps {
  user: { name: string; phone: string; role?: string };
  currentPage: string;
  onMenuClick: (key: string) => void;
  onLogout: () => void;
  children: ReactNode;
  pageTitle?: string;
}

export default function PengurusKelasLayout({
  user,
  currentPage,
  onMenuClick,
  onLogout,
  children,
  pageTitle = "Dashboard",
}: PengurusKelasLayoutProps) {
  const [isOpen, setOpen] = useState(() => {
    const saved = localStorage.getItem("sidebarOpenPengurus");
    return saved ? saved === "true" : true;
  });

  useEffect(() => {
    localStorage.setItem("sidebarOpenPengurus", isOpen.toString());
  }, [isOpen]);

  return (
    <div
      style={{
        display: "flex",
        height: "100vh",
        width: "100vw",
        background: "#F8FAFC",
        overflow: "hidden",
        position: "fixed",
        top: 0,
        left: 0,
      }}
    >
      {/* Sidebar */}
      <div style={{ position: "relative", zIndex: 5, flexShrink: 0 }}>
        <Sidebar
          currentPage={currentPage}
          onMenuClick={onMenuClick}
          onLogout={onLogout}
          isOpen={isOpen}
          onToggle={() => setOpen((v) => !v)}
          userRole="pengurus_kelas"
        />
      </div>

      {/* Main Content */}
      <div
        style={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          overflow: "hidden",
          position: "relative",
          zIndex: 1,
          height: "100%",
          minHeight: 0,
        }}
      >
        {/* Header */}
        <header
          style={{
            height: "64px",
            minHeight: "64px",
            background: "#0B2948",
            color: "#fff",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "0 24px",
            boxShadow: "0 2px 8px rgba(0, 0, 0, 0.1)",
            zIndex: 4,
            flexShrink: 0,
          }}
        >
          <div
            style={{
              fontSize: "22px",
              fontWeight: 800,
              color: "#fff",
            }}
          >
            {pageTitle}
          </div>
          <div
            style={{
              fontWeight: 700,
              fontSize: "16px",
              color: "#fff",
              display: "flex",
              alignItems: "center",
              gap: "8px",
            }}
          >
            <span>{user.name}</span>
          </div>
        </header>

        {/* Main Content Area */}
        <main
          style={{
            flex: 1,
            overflowY: "auto",
            overflowX: "hidden",
            padding: "24px",
            display: "flex",
            flexDirection: "column",
            minHeight: 0,
            height: "100%",
          }}
        >
          {children}
        </main>
      </div>
    </div>
  );
}
