import { Home, BookOpen, Users, GraduationCap, LogOut, Calendar, Building2 } from 'lucide-react';

interface SidebarProps {
  currentPage: string;
  onMenuClick: (page: string) => void;
  onLogout: () => void;
  isOpen: boolean;
  onToggle: () => void;
  userRole?: string;
}

interface MenuItem {
  id: string;
  label: string;
  icon: React.ReactNode;
}

// Menu untuk Admin
const MENU_ITEMS_ADMIN: MenuItem[] = [
  { id: "dashboard", label: "Beranda", icon: <Home size={20} /> },
  { id: "jurusan", label: "Data Konsentrasi Keahlian", icon: <BookOpen size={20} /> },
  { id: "kelas", label: "Data Kelas", icon: <Users size={20} /> },
  { id: "siswa", label: "Data Siswa", icon: <GraduationCap size={20} /> },
  { id: "guru", label: "Data Guru", icon: <GraduationCap size={20} /> },
  { id: "profil-sekolah", label: "Profil Sekolah", icon: <Building2 size={20} /> },  // ← DIPERBAIKI: dari "ProfilSekolah" menjadi "profil-sekolah" dan menggunakan icon Building2
];

// Waka staff
const MENU_ITEMS_WAKA: MenuItem[] = [
  { id: "dashboard", label: "Beranda", icon: <Home size={20} /> },
  { id: "jadwal-kelas", label: "Jadwal Kelas", icon: <Calendar size={20} /> },
  { id: "jadwal-guru", label: "Jadwal Guru", icon: <Calendar size={20} /> },
  { id: "kehadiran-siswa", label: "Kehadiran Siswa", icon: <Users size={20} /> },
  { id: "kehadiran-guru", label: "Kehadiran Guru", icon: <GraduationCap size={20} /> },
];

// siswa
const MENU_ITEMS_SISWA: MenuItem[] = [
  { id: "dashboard", label: "Beranda", icon: <Home size={20} /> },
  { id: "jadwal-anda", label: "Jadwal", icon: <Calendar size={20} /> },
  { id: "absensi", label: "Daftar Ketidakhadiran", icon: <Users size={20} /> },
];

//pengurus kelas
const MENU_ITEMS_PENGURUS_KELAS: MenuItem[] = [
  { id: "dashboard", label: "Beranda", icon: <Home size={20} /> },
  { id: "daftar-mapel", label: "Daftar Mapel", icon: <BookOpen size={20} /> },
  { id: "jadwal-anda", label: "Jadwal", icon: <Calendar size={20} /> },
  { id: "absensi", label: "Daftar Ketidakhadiran", icon: <Users size={20} /> },
];

//wali kelas
const MENU_ITEMS_WALIKELAS: MenuItem[] = [
  { id: "dashboard", label: "Beranda", icon: <Home size={20} /> },
  { id: "jadwal-pengurus", label: "Jadwal Kelas", icon: <Calendar size={20} /> },
];

// Menu untuk Guru
const MENU_ITEMS_GURU: MenuItem[] = [
  { id: "dashboard", label: "Beranda", icon: <Home size={20} /> },
  { id: "jadwal-anda", label: "Jadwal Anda", icon: <Calendar size={20} /> },
];

export default function Sidebar({
  currentPage,
  onMenuClick,
  onLogout,
  isOpen,
  onToggle,
  userRole = "admin",
}: SidebarProps) {
  const fonts = "'Plus Jakarta Sans', 'Space Grotesk', system-ui, sans-serif";
  let MENU_ITEMS = MENU_ITEMS_ADMIN;
  let roleLabel = "Admin";

  // select menu berdasarkan role
  if (userRole === "guru") {
    MENU_ITEMS = MENU_ITEMS_GURU;
    roleLabel = "Guru";
  } else if (userRole === "waka") {
    MENU_ITEMS = MENU_ITEMS_WAKA;
    roleLabel = "Waka";
  } else if (userRole === "siswa") {
    MENU_ITEMS = MENU_ITEMS_SISWA;
    roleLabel = "Siswa";
  } else if (userRole === "pengurus_kelas") {
    MENU_ITEMS = MENU_ITEMS_PENGURUS_KELAS;
    roleLabel = "Pengurus Kelas";
  } else if (userRole === "wakel" || userRole === "walikelas") {
    MENU_ITEMS = MENU_ITEMS_WALIKELAS;
    roleLabel = "Wali Kelas";
  }

  return (
    <aside
      style={{
        width: isOpen ? "270px" : "86px",
        background:
          "linear-gradient(180deg, #0B1221 0%, #0D1424 55%, #0A1020 100%)",
        color: "white",
        display: "flex",
        flexDirection: "column",
        height: "100vh",
        transition: "width 0.25s ease",
        overflow: "hidden",
        boxShadow: "6px 0 20px rgba(2, 6, 23, 0.35)",
        position: "relative",
        zIndex: 50,
        fontFamily: fonts,
      }}
    >
      <div
        style={{
          position: "absolute",
          inset: 0,
          background:
            "radial-gradient(120px 360px at 0% 20%, rgba(56, 189, 248, 0.12), transparent 60%)",
          pointerEvents: "none",
        }}
      />
      {/* Header */}
      <div
        style={{
          padding: "16px 18px",
          borderBottom: "1px solid rgba(148, 163, 184, 0.2)",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          background:
            "linear-gradient(90deg, rgba(15, 23, 42, 0.95), rgba(30, 41, 59, 0.9))",
          minHeight: "72px",
          flexShrink: 0,
          position: "relative",
          zIndex: 2,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <button
            onClick={onToggle}
            style={{
              backgroundColor: "rgba(15, 23, 42, 0.7)",
              border: "1px solid rgba(148, 163, 184, 0.35)",
              color: "white",
              cursor: "pointer",
              padding: "8px 10px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              borderRadius: "10px",
              fontSize: "14px",
              transition: "all 0.2s",
              boxShadow: "0 8px 16px rgba(15, 23, 42, 0.35)",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = "rgba(30, 41, 59, 0.95)";
              e.currentTarget.style.borderColor = "rgba(148, 163, 184, 0.6)";
              e.currentTarget.style.transform = "translateY(-1px)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = "rgba(15, 23, 42, 0.7)";
              e.currentTarget.style.borderColor = "rgba(148, 163, 184, 0.35)";
              e.currentTarget.style.transform = "translateY(0)";
            }}
            title="Toggle Sidebar"
          >
            {isOpen ? "◀" : "▶"}
          </button>
          
          {isOpen && (
            <div style={{ display: "flex", flexDirection: "column" }}>
              <span
                style={{
                  fontSize: "18px",
                  fontWeight: 800,
                  color: "#E2E8F0",
                  letterSpacing: "0.3px",
                }}
              >
                {roleLabel}
              </span>
            </div>
          )}
        </div>
        
        {!isOpen && (
          <div
            style={{
              fontSize: "12px",
              color: "#94A3B8",
              fontWeight: 800,
              border: "1px solid rgba(148, 163, 184, 0.3)",
              borderRadius: "8px",
              padding: "4px 8px",
              background: "rgba(15, 23, 42, 0.7)",
            }}
          >
            {roleLabel.charAt(0)}
          </div>
        )}
      </div>

      {/* Navigation Menu */}
      <nav
        style={{
          flex: 1,
          padding: "22px 12px",
          overflowY: "auto",
          display: "flex",
          flexDirection: "column",
          gap: "10px",
          position: "relative",
          zIndex: 2,
        }}
      >
        {MENU_ITEMS.map((item) => (
          <button
            key={item.id}
            onClick={() => onMenuClick(item.id)}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "12px",
              padding: isOpen ? "12px 14px" : "12px",
              borderRadius: "14px",
              border: "1px solid rgba(148, 163, 184, 0.12)",
              cursor: "pointer",
              transition: "all 0.2s ease",
              background:
                currentPage === item.id
                  ? "linear-gradient(135deg, #2563EB 0%, #1D4ED8 50%, #0EA5E9 100%)"
                  : "rgba(15, 23, 42, 0.35)",
              color: currentPage === item.id ? "white" : "#CBD5F5",
              fontSize: "14px",
              fontWeight: 600,
              textAlign: "left",
              position: "relative",
              overflow: "hidden",
              boxShadow:
                currentPage === item.id
                  ? "0 12px 18px rgba(37, 99, 235, 0.35)"
                  : "none",
            }}
            onMouseEnter={(e) => {
              if (currentPage !== item.id) {
                e.currentTarget.style.backgroundColor = "rgba(30, 41, 59, 0.7)";
                e.currentTarget.style.borderColor = "rgba(148, 163, 184, 0.35)";
              }
            }}
            onMouseLeave={(e) => {
              if (currentPage !== item.id) {
                e.currentTarget.style.backgroundColor = "rgba(15, 23, 42, 0.35)";
                e.currentTarget.style.borderColor = "rgba(148, 163, 184, 0.12)";
              }
            }}
            title={!isOpen ? item.label : undefined}
          >
            <div
              style={{
                width: "34px",
                height: "34px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0,
                color: currentPage === item.id ? "white" : "#94A3B8",
                background:
                  currentPage === item.id
                    ? "rgba(255, 255, 255, 0.14)"
                    : "rgba(15, 23, 42, 0.35)",
                borderRadius: "10px",
                transition: "color 0.2s",
              }}
            >
              {item.icon}
            </div>
            
            {isOpen && (
              <span
                style={{
                  whiteSpace: "nowrap",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  flex: 1,
                  textAlign: "left",
                }}
              >
                {item.label}
              </span>
            )}
            
            {currentPage === item.id && isOpen && (
              <div style={{
                width: "6px",
                height: "22px",
                backgroundColor: "#7DD3FC",
                borderRadius: "99px",
                marginLeft: "6px",
              }} />
            )}
          </button>
        ))}
      </nav>

      {/* Footer with Logout */}
      <div
        style={{
          padding: "16px 12px",
          borderTop: "1px solid rgba(148, 163, 184, 0.2)",
          background:
            "linear-gradient(90deg, rgba(15, 23, 42, 0.95), rgba(30, 41, 59, 0.9))",
          flexShrink: 0,
          position: "relative",
          zIndex: 2,
        }}
      >
        <button
          onClick={onLogout}
          style={{
            width: "100%",
            display: "flex",
            alignItems: "center",
            gap: "12px",
            padding: "14px 16px",
            background:
              "linear-gradient(135deg, rgba(220, 38, 38, 0.95), rgba(185, 28, 28, 0.95))",
            color: "white",
            border: "none",
            borderRadius: "8px",
            cursor: "pointer",
            fontSize: "15px",
            fontWeight: "600",
            transition: "all 0.2s ease",
            position: "relative",
            overflow: "hidden",
            boxShadow: "0 10px 18px rgba(185, 28, 28, 0.35)",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = "translateY(-1px)";
            e.currentTarget.style.boxShadow =
              "0 14px 22px rgba(220, 38, 38, 0.35)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = "translateY(0)";
            e.currentTarget.style.boxShadow =
              "0 10px 18px rgba(185, 28, 28, 0.35)";
          }}
          title={!isOpen ? "Keluar" : undefined}
        >
          <div style={{
            width: "34px",
            height: "34px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexShrink: 0,
            color: "white",
            background: "rgba(255, 255, 255, 0.15)",
            borderRadius: "10px",
          }}>
            <LogOut size={20} />
          </div>
          
          {isOpen && (
            <>
              <span style={{ flex: 1, textAlign: "left" }}>Keluar</span>
              <span style={{ fontSize: "12px", opacity: 0.8 }}>⏎</span>
            </>
          )}
        </button>
      </div>
    </aside>
  );
}

// import DashboardIcon from "../assets/Icon/home.png";
// import JurusanIcon from "../assets/Icon/Chalkboard.png";
// import KelasIcon from "../assets/Icon/ChalkboardTeacher.png";
// import SiswaIcon from "../assets/Icon/Student.png";
// import GuruIcon from "../assets/Icon/GraduationCap.png";
// import NotifikasiIcon from "../assets/Icon/Bell.png";
// // import PengaturanIcon from "../assets/Icon/settings.png";
// import LogoutIcon from "../assets/Icon/Log out.png";
// import ShiftIcon from "../assets/Icon/Shift.png";
// import CalendarIcon from "../assets/Icon/calender.png";

// interface SidebarProps {
//   currentPage: string;
//   onMenuClick: (page: string) => void;
//   onLogout: () => void;
//   isOpen: boolean;
//   onToggle: () => void;
//   userRole?: string;
// }

// interface MenuItem {
//   id: string;
//   label: string;
//   icon: string;
// }

// // Menu untuk Admin
// const MENU_ITEMS_ADMIN: MenuItem[] = [
//   { id: "dashboard", label: "Dashboard", icon: DashboardIcon },
//   { id: "jurusan", label: "Data Jurusan", icon: JurusanIcon },
//   { id: "kelas", label: "Data Kelas", icon: KelasIcon },
//   { id: "siswa", label: "Data Siswa", icon: SiswaIcon },
//   { id: "guru", label: "Data Guru", icon: GuruIcon },
//   // { id: "notifikasi", label: "Notifikasi", icon: NotifikasiIcon },
//   // { id: "pengaturan", label: "Pengaturan", icon: PengaturanIcon },
// ];

// // Menu untuk Guru
// const MENU_ITEMS_GURU: MenuItem[] = [
//   { id: "dashboard", label: "Dashboard", icon: DashboardIcon },
//   // { id: "jadwal", label: "Jadwal Mengajar", icon: KelasIcon },
//   { id: "presensi", label: "Presensi", icon: CalendarIcon },
//   // { id: "dispensasi", label: "Dispensasi & Izin", icon: JurusanIcon },
//   { id: "kehadiran", label: "Kehadiran Siswa", icon: SiswaIcon },
//   // { id: "pengaturan", label: "Pengaturan", icon: PengaturanIcon },
// ];

// // waka staff
// const MENU_ITEMS_WAKA: MenuItem[] = [
//   { id: "dashboard", label: "Dashboard", icon: DashboardIcon },
//   { id: "jadwal-kelas", label: "Jadwal Kelas", icon: KelasIcon },
//   { id: "jadwal-guru", label: "Jadwal Guru", icon: GuruIcon },
//   { id: "kehadiran-siswa", label: "Kehadiran Siswa", icon: SiswaIcon },
//   { id: "kehadiran-guru", label: "Kehadiran Guru", icon: GuruIcon },
//   { id: "Guru-Pengganti", label: "Guru-Pengganti", icon: ShiftIcon },
//   { id: "Notifikasi", label: "Notifikasi", icon: NotifikasiIcon },
 
// ];

// const MENU_ITEMS_SISWA: MenuItem[] = [
//   { id: "dashboard", label: "Dashboard", icon: DashboardIcon },
//   { id: "jadwal-anda", label: "Jadwal Anda", icon: CalendarIcon },
//   { id: "absensi", label: "Daftar Ketidakhadiran", icon: SiswaIcon },
//   // { id: "notidikasi", label: "Notifikasi", icon: NotifikasiIcon },
// ];

// const MENU_ITEMS_PENGURUS_KELAS: MenuItem[] = [
//   { id: "dashboard", label: "Dashboard", icon: DashboardIcon },
//   { id: "daftar-mapel", label: "Daftar Mapel", icon: JurusanIcon },
//   { id: "absensi", label: "Daftar Ketidakhadiran", icon: SiswaIcon },
//   { id: "laporan", label: "Laporan Kelas", icon: KelasIcon },
// ];

// export default function Sidebar({
//   currentPage,
//   onMenuClick,
//   onLogout,
//   isOpen,
//   onToggle,
//   userRole = "admin", // Default admin
// }: SidebarProps) {
//   // select menu berdasarkan role

//   let MENU_ITEMS = MENU_ITEMS_ADMIN;
//   let roleLabel = "Admin";

//   if (userRole === "guru") {
//     MENU_ITEMS = MENU_ITEMS_GURU;
//     roleLabel = "Guru";
//   } else if (userRole === "waka") {
//     MENU_ITEMS = MENU_ITEMS_WAKA;
//     roleLabel = "Waka Staff";
//   } else if (userRole === "siswa") {
//     MENU_ITEMS = MENU_ITEMS_SISWA;
//     roleLabel = "Siswa";
//   } else if (userRole === "pengurus_kelas") {
//     MENU_ITEMS = MENU_ITEMS_PENGURUS_KELAS;
//     roleLabel = "Pengurus Kelas";
//   }

//   return (
//     <aside
//       style={{
//         width: isOpen ? "256px" : "80px",
//         backgroundColor: "#1F2937",
//         color: "white",
//         display: "flex",
//         flexDirection: "column",
//         height: "100vh",
//         transition: "width 0.3s ease-in-out",
//         overflow: "hidden",
//       }}
//     >
//       {/* Logo */}
//       <div
//         style={{
//           padding: "8px 12px",
//           borderBottom: "none",
//           display: "flex",
//           alignItems: "center",
//           justifyContent: "flex-start",
//           gap: "8px",
//           flexShrink: 0,
//           backgroundColor: "#001f3e",
//           color: "white",
//           height: "48px",
//           minHeight: "48px",
//         }}
//       >
//         {/* Hamburger Button */}
//         <button
//           onClick={onToggle}
//           style={{
//             fontSize: "18px",
//             backgroundColor: "transparent",
//             border: "1.5px solid white",
//             color: "white",
//             cursor: "pointer",
//             padding: "2px 6px",
//             display: "flex",
//             alignItems: "center",
//             justifyContent: "center",
//             borderRadius: "4px",
//           }}
//           title="Toggle Sidebar"
//         >
//           â˜°
//         </button>

//         {/* Role Label */}
//         {isOpen && (
//           <span style={{ fontSize: "18px", fontWeight: "bold", flex: 1 }}>
//             {roleLabel}
//           </span>
//         )}
//       </div>

//       {/* Menu Items */}
//       <nav
//         style={{
//           flex: 1,
//           padding: "12px",
//           overflowY: "auto",
//           display: "flex",
//           flexDirection: "column",
//           gap: "8px",
//         }}
//       >
//         {MENU_ITEMS.map((item) => (
//           <button
//             key={item.id}
//             onClick={() => onMenuClick(item.id)}
//             style={{
//               display: "flex",
//               alignItems: "center",
//               gap: "12px",
//               padding: "12px 16px",
//               borderRadius: "8px",
//               border: "none",
//               cursor: "pointer",
//               transition: "all 0.2s ease",
//               backgroundColor:
//                 currentPage === item.id ? "#2563EB" : "transparent",
//               color: currentPage === item.id ? "white" : "#D1D5DB",
//               fontSize: "14px",
//               fontWeight: "500",
//               textAlign: "left",
//             }}
//             onMouseEnter={(e) => {
//               if (currentPage !== item.id) {
//                 (e.currentTarget as HTMLButtonElement).style.backgroundColor =
//                   "#374151";
//               }
//             }}
//             onMouseLeave={(e) => {
//               if (currentPage !== item.id) {
//                 (e.currentTarget as HTMLButtonElement).style.backgroundColor =
//                   "transparent";
//               }
//             }}
//             title={!isOpen ? item.label : undefined}
//           >
//             <img
//               src={item.icon}
//               alt={item.label}
//               style={{
//                 width: "20px",
//                 height: "20px",
//                 flexShrink: 0,
//                 filter:
//                   currentPage === item.id
//                     ? "brightness(1) invert(0)"
//                     : "brightness(0.8) invert(1)",
//               }}
//             />
//             {isOpen && (
//               <span
//                 style={{
//                   whiteSpace: "nowrap",
//                   overflow: "hidden",
//                   textOverflow: "ellipsis",
//                 }}
//               >
//                 {item.label}
//               </span>
//             )}
//           </button>
//         ))}
//       </nav>

//       {/* Logout */}
//       <div
//         style={{
//           padding: "12px",
//           borderTop: "1px solid #374151",
//           flexShrink: 0,
//         }}
//       >
//         <button
//           onClick={onLogout}
//           style={{
//             width: "100%",
//             display: "flex",
//             alignItems: "center",
//             gap: "12px",
//             padding: "12px 16px",
//             backgroundColor: "#DC2626",
//             color: "white",
//             border: "none",
//             borderRadius: "8px",
//             cursor: "pointer",
//             fontSize: "14px",
//             fontWeight: "600",
//             transition: "background-color 0.2s ease",
//           }}
//           onMouseEnter={(e) => {
//             (e.currentTarget as HTMLButtonElement).style.backgroundColor =
//               "#B91C1C";
//           }}
//           onMouseLeave={(e) => {
//             (e.currentTarget as HTMLButtonElement).style.backgroundColor =
//               "#DC2626";
//           }}
//           title={!isOpen ? "Logout" : undefined}
//         >
//           <img
//             src={LogoutIcon}
//             alt="Logout"
//             style={{
//               width: "20px",
//               height: "20px",
//               flexShrink: 0,
//               backgroundColor: "transparent",
//               filter: "brightness(1) invert(0)",
//             }}
//           />
//           {isOpen && <span>Keluar</span>}
//         </button>
//       </div>
//     </aside>
//   );
// }
