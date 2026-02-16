import { type ReactNode, useState, useEffect } from "react";
import Sidebar from "../Sidebar";

type MenuKey = "dashboard" | "jadwal-anda" | "notifikasi" | "absensi";

interface SiswaLayoutProps {
  user: { name: string; phone: string };
  currentPage: MenuKey;
  onMenuClick: (key: MenuKey) => void;
  onLogout: () => void;
  children: ReactNode;
  pageTitle?: string;
}

export default function SiswaLayout({
  user,
  currentPage,
  onMenuClick,
  onLogout,
  children,
  pageTitle = "Dashboard",
}: SiswaLayoutProps) {
  const [isOpen, setOpen] = useState(() => {
    const saved = localStorage.getItem("sidebarOpenSiswa");
    return saved ? saved === "true" : true;
  });

  useEffect(() => {
    localStorage.setItem("sidebarOpenSiswa", isOpen.toString());
  }, [isOpen]);

  return (
    <div
      style={{
        display: "flex",
        height: "100vh",
        width: "100vw",
        background: "linear-gradient(135deg, #F8FAFC 0%, #F1F5F9 100%)",
        overflow: "hidden",
        position: "fixed",
        top: 0,
        left: 0,
      }}
    >
      {/* Sidebar */}
      <div style={{ position: "relative", zIndex: 10, flexShrink: 0 }}>
        <Sidebar
          currentPage={currentPage}
          onMenuClick={(page) => onMenuClick(page as MenuKey)}
          onLogout={onLogout}
          isOpen={isOpen}
          onToggle={() => setOpen((v) => !v)}
          userRole="siswa"
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
            height: "72px",
            minHeight: "72px",
            background: "white",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "0 28px",
            boxShadow: "0 2px 12px rgba(0, 31, 62, 0.08)",
            borderBottom: "1px solid #E5E7EB",
            zIndex: 5,
            flexShrink: 0,
          }}
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
                style={{
                  width: "4px",
                  height: "28px",
                  backgroundColor: "#2563EB",
                  borderRadius: "2px",
                }}
              />
              {pageTitle}
            </h1>
            {pageTitle === "Dashboard" && (
              <p style={{ margin: "4px 0 0 16px", fontSize: "14px", color: "#6B7280" }}>
                Selamat belajar, {user.name}!
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
              <div style={{ fontSize: "12px", color: "#6B7280" }}>
                Siswa
              </div>
            </div>
            <div style={{
              width: "48px",
              height: "48px",
              backgroundColor: "#3B82F6",
              borderRadius: "12px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "white",
              fontSize: "20px",
              fontWeight: "bold",
              boxShadow: "0 2px 8px rgba(59, 130, 246, 0.3)"
            }}>
              {user.name.charAt(0)}
            </div>
          </div>
        </header>

        {/* Main Content Area */}
        <main
          style={{
            flex: 1,
            overflowY: "auto",
            overflowX: "hidden",
            padding: "28px",
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


// ======= LEGACY CODE =======
// import { ReactNode, useState, useEffect } from "react";
// import Sidebar from "../Sidebar";

// type MenuKey = "dashboard" | "jadwal-anda" | "notifikasi" | "absensi";

// interface SiswaLayoutProps {
//   user: { name: string; phone: string };
//   currentPage: MenuKey;
//   onMenuClick: (key: MenuKey) => void;
//   onLogout: () => void;
//   children: ReactNode;
//   pageTitle?: string;
// }

// export default function SiswaLayout({
//   user,
//   currentPage,
//   onMenuClick,
//   onLogout,
//   children,
//   pageTitle = "Dashboard",
// }: SiswaLayoutProps) {
//   const [isOpen, setOpen] = useState(() => {
//     const saved = localStorage.getItem("sidebarOpenSiswa");
//     return saved ? saved === "true" : true;
//   });

//   useEffect(() => {
//     localStorage.setItem("sidebarOpenSiswa", isOpen.toString());
//   }, [isOpen]);

//   return (
//     <div
//       style={{
//         display: "flex",
//         height: "100vh",
//         width: "100vw",
//         background: "#F8FAFC",
//         overflow: "hidden",
//         position: "fixed",
//         top: 0,
//         left: 0,
//       }}
//     >
//       {/* Sidebar */}
//       <div style={{ position: "relative", zIndex: 5, flexShrink: 0 }}>
//         <Sidebar
//           currentPage={currentPage}
//           onMenuClick={onMenuClick}
//           onLogout={onLogout}
//           isOpen={isOpen}
//           onToggle={() => setOpen((v) => !v)}
//           userRole="siswa"
//         />
//       </div>

//       {/* Main Content */}
//       <div
//         style={{
//           flex: 1,
//           display: "flex",
//           flexDirection: "column",
//           overflow: "hidden",
//           position: "relative",
//           zIndex: 1,
//           height: "100%",
//           minHeight: 0,
//         }}
//       >
//         {/* Header */}
//         <header
//           style={{
//             height: "64px",
//             minHeight: "64px",
//             background: "#0B2948",
//             color: "#fff",
//             display: "flex",
//             alignItems: "center",
//             justifyContent: "space-between",
//             padding: "0 24px",
//             boxShadow: "0 2px 8px rgba(0, 0, 0, 0.1)",
//             zIndex: 4,
//             flexShrink: 0,
//           }}
//         >
//           <div
//             style={{
//               fontSize: "22px",
//               fontWeight: 800,
//               color: "#fff",
//             }}
//           >
//             {pageTitle}
//           </div>
//           <div
//             style={{
//               fontWeight: 700,
//               fontSize: "16px",
//               color: "#fff",
//               display: "flex",
//               alignItems: "center",
//               gap: "8px",
//             }}
//           >
//             <span>{user.name}</span>
//           </div>
//         </header>

//         {/* Main Content Area */}
//         <main
//           style={{
//             flex: 1,
//             overflowY: "auto",
//             overflowX: "hidden",
//             padding: "24px",
//             display: "flex",
//             flexDirection: "column",
//             minHeight: 0,
//             height: "100%",
//           }}
//         >
//           {children}
//         </main>
//       </div>
//     </div>
//   );
// }
