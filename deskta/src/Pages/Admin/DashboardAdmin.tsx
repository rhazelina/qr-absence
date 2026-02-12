// DashboardAdmin.tsx - Halaman dashboard utama admin
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import AdminLayout from "../../component/Admin/AdminLayout";
import JurusanAdmin from "./JurusanAdmin";
import KelasAdmin from "./KelasAdmin";
import GuruAdmin from "./GuruAdmin";
import SiswaAdmin from "./SiswaAdmin";
import DetailSiswa from "./DetailSiswa";
import DetailGuru from "./DetailGuru";
import ProfilSekolah from "./ProfilSekolah";

// ==================== INTERFACE DEFINITIONS ====================
interface User {
  role: string;
  name: string;
}

interface AdminDashboardProps {
  user: User;
  onLogout: () => void;
}

type AdminPage =
  | "dashboard"
  | "jurusan"
  | "kelas"
  | "siswa"
  | "guru"
  | "notifikasi"
  | "pengaturan"
  | "detail-siswa"
  | "detail-guru"
  | "profil-sekolah";

// ==================== MAIN COMPONENT ====================
export default function AdminDashboard({
  user,
  onLogout,
}: AdminDashboardProps) {
  // ==================== STATE MANAGEMENT ====================
  const [currentPage, setCurrentPage] = useState<AdminPage>("dashboard");
  const navigate = useNavigate();
  const [selectedSiswaId, setSelectedSiswaId] = useState<string | null>(null);
  const [selectedGuruId, setSelectedGuruId] = useState<string | null>(null);
  const [semester, setSemester] = useState("Semester Genap");

  // ==================== DATE & TIME HANDLER ====================
    // Date display is handled in header if needed, but not stored in state here

  // ==================== EFFECT FOR REAL-TIME CLOCK ====================
  useEffect(() => {
    // updateDateTime(); 
    // const interval = setInterval(updateDateTime, 1000); 
    
    const month = new Date().getMonth(); 
    if (month >= 0 && month <= 5) {
      setSemester("Semester Genap");
    } else {
      setSemester("Semester Ganjil");
    }
    
    // return () => clearInterval(interval); 
  }, []);

  // ==================== MENU NAVIGATION HANDLER ====================
  const handleMenuClick = (page: string) => {
    setCurrentPage(page as AdminPage); 
  };

  // ==================== LOGOUT HANDLER ====================
  const handleLogout = () => {
    onLogout();
    navigate("/");
  };

  // ==================== PAGE RENDERER ====================
  const renderPage = () => {
    switch (currentPage) {
      case "dashboard":
      default:
        return (
          <AdminLayout
            pageTitle="Beranda"
            currentPage={currentPage}
            onMenuClick={handleMenuClick}
            user={user}
            onLogout={handleLogout}
            hideBackground={false} 
          >
            <div className="p-4 bg-white rounded-lg shadow-sm">
              <h2 className="text-xl font-bold text-gray-800">Selamat Datang, {user.name}</h2>
              <p className="text-gray-600">Saat ini Anda berada di panel admin {semester}.</p>
            </div>
          </AdminLayout>
        );

      case "jurusan":
        return (
          <JurusanAdmin
            user={user}
            onLogout={handleLogout}
            currentPage={currentPage}
            onMenuClick={handleMenuClick}
          />
        );

      case "kelas":
        return (
          <KelasAdmin
            user={user}
            onLogout={handleLogout}
            currentPage={currentPage}
            onMenuClick={handleMenuClick}
          />
        );

      case "siswa":
        return (
          <SiswaAdmin
            user={user}
            onLogout={handleLogout}
            currentPage={currentPage}
            onMenuClick={handleMenuClick}
            onNavigateToDetail={(id) => {
              setSelectedSiswaId(id); 
              setCurrentPage("detail-siswa"); 
            }}
          />
        );

      case "guru":
        return (
          <GuruAdmin
            user={user}
            onLogout={handleLogout}
            currentPage={currentPage}
            onMenuClick={handleMenuClick}
            onNavigateToDetail={(id) => {
              setSelectedGuruId(id); 
              setCurrentPage("detail-guru"); 
            }}
          />
        );

      case "detail-siswa":
        return selectedSiswaId ? (
          <DetailSiswa
            user={user}
            onLogout={handleLogout}
            currentPage={currentPage}
            onMenuClick={handleMenuClick}
            siswaId={selectedSiswaId} 
          />
        ) : null; 

      case "detail-guru":
        return selectedGuruId ? (
          <DetailGuru
            user={user}
            onLogout={handleLogout}
            currentPage={currentPage}
            onMenuClick={handleMenuClick}
            guruId={selectedGuruId} 
          />
        ) : null; 

      case "profil-sekolah":
        return (
          <ProfilSekolah
            user={user}
            onLogout={handleLogout}
            currentPage={currentPage}
            onMenuClick={handleMenuClick}
          />
        );
    }
  };

  return renderPage();
}