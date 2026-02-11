import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import AdminLayout from "../../component/Admin/AdminLayout";
import JurusanAdmin from "./JurusanAdmin";
import KelasAdmin from "./KelasAdmin";
import GuruAdmin from "./GuruAdmin";
import SiswaAdmin from "./SiswaAdmin";
import DetailSiswa from "./DetailSiswa";
import DetailGuru from "./DetailGuru";
import { isCancellation } from "../../utils/errorHelpers";

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
  | "detail-guru";

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
  const [currentDate, setCurrentDate] = useState("");
  const [currentTime, setCurrentTime] = useState("");
  const [semester, setSemester] = useState("Semester Genap");

  // API Data State
  const [adminSummary, setAdminSummary] = useState({
    total_classes: 0,
    total_students: 0,
    total_teachers: 0,
    total_rooms: 0,
  });
  const [isLoadingData, setIsLoadingData] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // ==================== DATE & TIME HANDLER ====================
  const updateDateTime = () => {
    const now = new Date();

    // Format tanggal: "Senin, 7 Januari 2026"
    setCurrentDate(
      now.toLocaleDateString("id-ID", {
        weekday: "long",
        day: "numeric",
        month: "long",
        year: "numeric",
      })
    );

    // Format waktu: "08:00:01"
    setCurrentTime(
      now.toLocaleTimeString("id-ID", {
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
        hour12: false,
      })
    );
  };

  // ==================== EFFECT FOR REAL-TIME CLOCK ====================
  useEffect(() => {
    updateDateTime(); // Update pertama kali
    const interval = setInterval(updateDateTime, 1000); // Update setiap detik

    // Set semester berdasarkan bulan
    const month = new Date().getMonth();
    if (month >= 0 && month <= 5) {
      setSemester("Semester Genap");
    } else {
      setSemester("Semester Ganjil");
    }

    return () => clearInterval(interval); // Cleanup interval
  }, []);

  // ==================== FETCH ADMIN SUMMARY ====================
  useEffect(() => {
    const controller = new AbortController();
    const fetchAdminSummary = async () => {
      try {
        setIsLoadingData(true);
        setError(null);
        const { dashboardService } = await import('../../services/dashboard');
        const data = await dashboardService.getAdminSummary({ signal: controller.signal });
        setAdminSummary(data);
      } catch (error: any) {
        if (!isCancellation(error)) {
          console.error('Failed to fetch admin summary:', error);
          setError('Gagal memuat ringkasan data statistik sekolah.');
        }
      } finally {
        setIsLoadingData(false);
      }
    };

    fetchAdminSummary();
    return () => controller.abort();
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
            hideBackground={false} // UBAH INI: dari true ke false
          >
            {/* ============ MAIN DASHBOARD CONTAINER ============ */}
            <div
              style={{
                maxWidth: "1400px",
                margin: "0 auto",
                padding: "0 4px",
                position: "relative",
                minHeight: "calc(100vh - 100px)",
              }}
            >
              {/* ============ CONTENT LAYER ============ */}
              <div style={{ position: "relative", zIndex: 1 }}>
                {/* ============ ERROR ALERT ============ */}
                {error && (
                  <div style={{
                    marginBottom: "20px",
                    padding: "16px 20px",
                    backgroundColor: "#FEF2F2",
                    border: "1px solid #FEE2E2",
                    borderRadius: "12px",
                    color: "#B91C1C",
                    fontSize: "14px",
                    fontWeight: "600",
                    display: "flex",
                    alignItems: "center",
                    gap: "12px"
                  }}>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" />
                    </svg>
                    <span>{error}</span>
                  </div>
                )}

                {/* ============ WELCOME SECTION ============ */}
                <div
                  style={{
                    marginBottom: "32px",
                  }}
                >
                  <div
                    style={{
                      background: "linear-gradient(135deg, #001F3E 0%, #0C4A6E 100%)", // Navy gradient
                      borderRadius: "16px",
                      padding: "28px 32px",
                      boxShadow: "0 8px 32px rgba(0, 31, 62, 0.3)",
                      border: "1px solid rgba(255, 255, 255, 0.1)",
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      color: "white",
                    }}
                  >
                    {/* ============ WELCOME MESSAGE ============ */}
                    <div>
                      <h2
                        style={{
                          fontSize: "24px",
                          fontWeight: "700",
                          color: "white",
                          margin: "0 0 8px 0",
                        }}
                      >
                        Selamat Datang di Beranda, Admin
                      </h2>
                      <p
                        style={{
                          fontSize: "16px",
                          color: "rgba(255, 255, 255, 0.9)",
                          margin: "0",
                          maxWidth: "600px",
                        }}
                      >
                        Kelola data sekolah, monitor aktivitas, dan pantau statistik secara real-time
                      </p>
                    </div>

                    {/* ============ DATE & TIME DISPLAY ============ */}
                    <div
                      style={{
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "flex-end",
                        gap: "8px",
                      }}
                    >
                      <div style={{ textAlign: "right" }}>
                        <div
                          style={{
                            fontSize: "14px",
                            color: "rgba(255, 255, 255, 0.9)",
                            fontWeight: "600",
                          }}
                        >
                          {currentDate}
                        </div>
                        <div
                          style={{
                            fontSize: "28px",
                            color: "white",
                            fontWeight: "700",
                            letterSpacing: "1px",
                          }}
                        >
                          {currentTime}
                        </div>
                        <div
                          style={{
                            fontSize: "14px",
                            color: "rgba(255, 255, 255, 0.8)",
                            fontWeight: "500",
                            marginTop: "4px",
                          }}
                        >
                          {semester}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* ============ STATISTICS CARDS SECTION ============ */}
                <div
                  style={{
                    marginBottom: "32px",
                  }}
                >
                  <h3
                    style={{
                      fontSize: "20px",
                      fontWeight: "600",
                      color: "#001F3E",
                      margin: "0 0 20px 20px",
                    }}
                  >
                    Statistik Sekolah
                  </h3>
                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
                      gap: "24px",
                    }}
                  >
                    {/* ============ STAT CARD 1: TOTAL ROMBEL ============ */}
                    <div
                      style={{
                        background: "linear-gradient(135deg, #001F3E 0%, #0C4A6E 100%)", // Navy
                        borderRadius: "16px",
                        padding: "28px",
                        color: "white",
                        display: "flex",
                        flexDirection: "column",
                        boxShadow: "0 8px 24px rgba(0, 31, 62, 0.3)",
                        border: "1px solid rgba(255, 255, 255, 0.1)",
                        transition: "all 0.3s ease",
                        cursor: "pointer",
                        position: "relative",
                        overflow: "hidden",
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.transform = "translateY(-8px)";
                        e.currentTarget.style.boxShadow = "0 16px 32px rgba(0, 31, 62, 0.4)";
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.transform = "translateY(0)";
                        e.currentTarget.style.boxShadow = "0 8px 24px rgba(0, 31, 62, 0.3)";
                      }}
                    >
                      {/* Background Accent */}
                      <div
                        style={{
                          position: "absolute",
                          top: "-20px",
                          right: "-20px",
                          width: "80px",
                          height: "80px",
                          backgroundColor: "rgba(255, 255, 255, 0.1)",
                          borderRadius: "50%",
                        }}
                      />

                      <div
                        style={{
                          fontSize: "42px",
                          fontWeight: 800,
                          lineHeight: 1.2,
                          color: "white",
                          marginBottom: "8px",
                          textShadow: "0 2px 4px rgba(0, 0, 0, 0.2)",
                        }}
                      >
                        {isLoadingData ? '...' : adminSummary.total_classes}
                      </div>
                      <div
                        style={{
                          fontSize: "16px",
                          color: "rgba(255, 255, 255, 0.9)",
                          fontWeight: "600",
                          marginBottom: "12px",
                        }}
                      >
                        Total Rombel
                      </div>
                      <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                        <div
                          style={{
                            width: "40px",
                            height: "40px",
                            backgroundColor: "rgba(255, 255, 255, 0.2)",
                            borderRadius: "10px",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            fontSize: "20px",
                          }}
                        >
                          🏫
                        </div>
                        <div
                          style={{
                            fontSize: "14px", // Diperbesar dari 12px
                            color: "rgba(255, 255, 255, 0.9)", // Diperjelas
                            fontWeight: "bold", // Ditambahkan bold
                          }}
                        >
                          Rombongan Belajar
                        </div>
                      </div>
                    </div>

                    {/* ============ STAT CARD 2: TOTAL MURID ============ */}
                    <div
                      style={{
                        background: "linear-gradient(135deg, #001F3E 0%, #0C4A6E 100%)", // Navy
                        borderRadius: "16px",
                        padding: "28px",
                        color: "white",
                        display: "flex",
                        flexDirection: "column",
                        boxShadow: "0 8px 24px rgba(0, 31, 62, 0.3)",
                        border: "1px solid rgba(255, 255, 255, 0.1)",
                        transition: "all 0.3s ease",
                        cursor: "pointer",
                        position: "relative",
                        overflow: "hidden",
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.transform = "translateY(-8px)";
                        e.currentTarget.style.boxShadow = "0 16px 32px rgba(0, 31, 62, 0.4)";
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.transform = "translateY(0)";
                        e.currentTarget.style.boxShadow = "0 8px 24px rgba(0, 31, 62, 0.3)";
                      }}
                    >
                      <div
                        style={{
                          position: "absolute",
                          top: "-20px",
                          right: "-20px",
                          width: "80px",
                          height: "80px",
                          backgroundColor: "rgba(255, 255, 255, 0.1)",
                          borderRadius: "50%",
                        }}
                      />

                      <div
                        style={{
                          fontSize: "42px",
                          fontWeight: 800,
                          lineHeight: 1.2,
                          color: "white",
                          marginBottom: "8px",
                          textShadow: "0 2px 4px rgba(0, 0, 0, 0.2)",
                        }}
                      >
                        {isLoadingData ? '...' : (adminSummary.total_students || 0).toLocaleString('id-ID')}
                      </div>
                      <div
                        style={{
                          fontSize: "16px",
                          color: "rgba(255, 255, 255, 0.9)",
                          fontWeight: "600",
                          marginBottom: "12px",
                        }}
                      >
                        Total Murid
                      </div>
                      <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                        <div
                          style={{
                            width: "40px",
                            height: "40px",
                            backgroundColor: "rgba(255, 255, 255, 0.2)",
                            borderRadius: "10px",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            fontSize: "20px",
                          }}
                        >
                          👨‍🎓
                        </div>
                        <div
                          style={{
                            fontSize: "14px", // Diperbesar dari 12px
                            color: "rgba(255, 255, 255, 0.9)", // Diperjelas
                            fontWeight: "bold", // Ditambahkan bold
                          }}
                        >
                          Siswa Aktif
                        </div>
                      </div>
                    </div>

                    {/* ============ STAT CARD 3: TOTAL GURU ============ */}
                    <div
                      style={{
                        background: "linear-gradient(135deg, #001F3E 0%, #0C4A6E 100%)", // Navy
                        borderRadius: "16px",
                        padding: "28px",
                        color: "white",
                        display: "flex",
                        flexDirection: "column",
                        boxShadow: "0 8px 24px rgba(0, 31, 62, 0.3)",
                        border: "1px solid rgba(255, 255, 255, 0.1)",
                        transition: "all 0.3s ease",
                        cursor: "pointer",
                        position: "relative",
                        overflow: "hidden",
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.transform = "translateY(-8px)";
                        e.currentTarget.style.boxShadow = "0 16px 32px rgba(0, 31, 62, 0.4)";
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.transform = "translateY(0)";
                        e.currentTarget.style.boxShadow = "0 8px 24px rgba(0, 31, 62, 0.3)";
                      }}
                    >
                      <div
                        style={{
                          position: "absolute",
                          top: "-20px",
                          right: "-20px",
                          width: "80px",
                          height: "80px",
                          backgroundColor: "rgba(255, 255, 255, 0.1)",
                          borderRadius: "50%",
                        }}
                      />

                      <div
                        style={{
                          fontSize: "42px",
                          fontWeight: 800,
                          lineHeight: 1.2,
                          color: "white",
                          marginBottom: "8px",
                          textShadow: "0 2px 4px rgba(0, 0, 0, 0.2)",
                        }}
                      >
                        {isLoadingData ? '...' : (adminSummary.total_teachers || 0).toLocaleString('id-ID')}
                      </div>
                      <div
                        style={{
                          fontSize: "16px",
                          color: "rgba(255, 255, 255, 0.9)",
                          fontWeight: "600",
                          marginBottom: "12px",
                        }}
                      >
                        Total Guru
                      </div>
                      <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                        <div
                          style={{
                            width: "40px",
                            height: "40px",
                            backgroundColor: "rgba(255, 255, 255, 0.2)",
                            borderRadius: "10px",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            fontSize: "20px",
                          }}
                        >
                          👨‍🏫
                        </div>
                        <div
                          style={{
                            fontSize: "14px", // Diperbesar dari 12px
                            color: "rgba(255, 255, 255, 0.9)", // Diperjelas
                            fontWeight: "bold", // Ditambahkan bold
                          }}
                        >
                          Tenaga Pendidik
                        </div>
                      </div>
                    </div>

                    {/* ============ STAT CARD 4: TOTAL LAB ============ */}
                    <div
                      style={{
                        background: "linear-gradient(135deg, #001F3E 0%, #0C4A6E 100%)", // Navy
                        borderRadius: "16px",
                        padding: "28px",
                        color: "white",
                        display: "flex",
                        flexDirection: "column",
                        boxShadow: "0 8px 24px rgba(0, 31, 62, 0.3)",
                        border: "1px solid rgba(255, 255, 255, 0.1)",
                        transition: "all 0.3s ease",
                        cursor: "pointer",
                        position: "relative",
                        overflow: "hidden",
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.transform = "translateY(-8px)";
                        e.currentTarget.style.boxShadow = "0 16px 32px rgba(0, 31, 62, 0.4)";
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.transform = "translateY(0)";
                        e.currentTarget.style.boxShadow = "0 8px 24px rgba(0, 31, 62, 0.3)";
                      }}
                    >
                      <div
                        style={{
                          position: "absolute",
                          top: "-20px",
                          right: "-20px",
                          width: "80px",
                          height: "80px",
                          backgroundColor: "rgba(255, 255, 255, 0.1)",
                          borderRadius: "50%",
                        }}
                      />

                      <div
                        style={{
                          fontSize: "42px",
                          fontWeight: 800,
                          lineHeight: 1.2,
                          color: "white",
                          marginBottom: "8px",
                          textShadow: "0 2px 4px rgba(0, 0, 0, 0.2)",
                        }}
                      >
                        {isLoadingData ? '...' : adminSummary.total_rooms}
                      </div>
                      <div
                        style={{
                          fontSize: "16px",
                          color: "rgba(255, 255, 255, 0.9)",
                          fontWeight: "600",
                          marginBottom: "12px",
                        }}
                      >
                        Total Lab
                      </div>
                      <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                        <div
                          style={{
                            width: "40px",
                            height: "40px",
                            backgroundColor: "rgba(255, 255, 255, 0.2)",
                            borderRadius: "10px",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            fontSize: "20px",
                          }}
                        >
                          🔬
                        </div>
                        <div
                          style={{
                            fontSize: "14px", // Diperbesar dari 12px
                            color: "rgba(255, 255, 255, 0.9)", // Diperjelas
                            fontWeight: "bold", // Ditambahkan bold
                          }}
                        >
                          Laboratorium
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* ============ QUICK ACCESS SECTION ============ */}
                <div>
                  <h3
                    style={{
                      fontSize: "20px",
                      fontWeight: "600",
                      color: "#001F3E",
                      margin: "0 0 20px 20px",
                    }}
                  >
                    Akses Cepat
                  </h3>
                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))",
                      gap: "24px",
                    }}
                  >
                    {/* ============ QUICK ACCESS 1: DATA SISWA ============ */}
                    <button
                      onClick={() => handleMenuClick("siswa")}
                      style={{
                        background: "linear-gradient(135deg, #FFFFFF 0%, #F8FAFC 100%)", // White gradient
                        borderRadius: "16px",
                        padding: "24px",
                        border: "1px solid #E5E7EB",
                        cursor: "pointer",
                        textAlign: "left",
                        display: "flex",
                        alignItems: "center",
                        gap: "20px",
                        transition: "all 0.3s ease",
                        boxShadow: "0 4px 16px rgba(0, 0, 0, 0.08)",
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.transform = "translateY(-4px)";
                        e.currentTarget.style.boxShadow = "0 8px 32px rgba(0, 0, 0, 0.15)";
                        e.currentTarget.style.borderColor = "#10B981";
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.transform = "translateY(0)";
                        e.currentTarget.style.boxShadow = "0 4px 16px rgba(0, 0, 0, 0.08)";
                        e.currentTarget.style.borderColor = "#E5E7EB";
                      }}
                    >
                      <div
                        style={{
                          width: "56px",
                          height: "56px",
                          background: "linear-gradient(135deg, #10B981 0%, #059669 100%)",
                          borderRadius: "12px",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          fontSize: "24px",
                          color: "white",
                          boxShadow: "0 4px 12px rgba(16, 185, 129, 0.3)",
                        }}
                      >
                        👨‍🎓
                      </div>
                      <div style={{ flex: 1 }}>
                        <div
                          style={{
                            fontSize: "18px",
                            fontWeight: "600",
                            color: "#001F3E",
                            marginBottom: "4px",
                          }}
                        >
                          Data Siswa
                        </div>
                        <div
                          style={{
                            fontSize: "14px",
                            color: "#000000", // Diubah dari #6B7280 menjadi hitam
                            fontWeight: "500",
                          }}
                        >
                          Kelola data siswa dan presensi
                        </div>
                      </div>
                      <div
                        style={{
                          width: "32px",
                          height: "32px",
                          backgroundColor: "#F3F4F6",
                          borderRadius: "8px",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          color: "#6B7280",
                          fontSize: "14px",
                        }}
                      >
                        →
                      </div>
                    </button>

                    {/* ============ QUICK ACCESS 2: DATA GURU ============ */}
                    <button
                      onClick={() => handleMenuClick("guru")}
                      style={{
                        background: "linear-gradient(135deg, #FFFFFF 0%, #F8FAFC 100%)", // White gradient
                        borderRadius: "16px",
                        padding: "24px",
                        border: "1px solid #E5E7EB",
                        cursor: "pointer",
                        textAlign: "left",
                        display: "flex",
                        alignItems: "center",
                        gap: "20px",
                        transition: "all 0.3s ease",
                        boxShadow: "0 4px 16px rgba(0, 0, 0, 0.08)",
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.transform = "translateY(-4px)";
                        e.currentTarget.style.boxShadow = "0 8px 32px rgba(0, 0, 0, 0.15)";
                        e.currentTarget.style.borderColor = "#8B5CF6";
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.transform = "translateY(0)";
                        e.currentTarget.style.boxShadow = "0 4px 16px rgba(0, 0, 0, 0.08)";
                        e.currentTarget.style.borderColor = "#E5E7EB";
                      }}
                    >
                      <div
                        style={{
                          width: "56px",
                          height: "56px",
                          background: "linear-gradient(135deg, #8B5CF6 0%, #7C3AED 100%)",
                          borderRadius: "12px",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          fontSize: "24px",
                          color: "white",
                          boxShadow: "0 4px 12px rgba(139, 92, 246, 0.3)",
                        }}
                      >
                        👨‍🏫
                      </div>
                      <div style={{ flex: 1 }}>
                        <div
                          style={{
                            fontSize: "18px",
                            fontWeight: "600",
                            color: "#001F3E",
                            marginBottom: "4px",
                          }}
                        >
                          Data Guru
                        </div>
                        <div
                          style={{
                            fontSize: "14px",
                            color: "#000000", // Diubah dari #6B7280 menjadi hitam
                            fontWeight: "500",
                          }}
                        >
                          Kelola data guru dan jadwal mengajar
                        </div>
                      </div>
                      <div
                        style={{
                          width: "32px",
                          height: "32px",
                          backgroundColor: "#F3F4F6",
                          borderRadius: "8px",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          color: "#6B7280",
                          fontSize: "14px",
                        }}
                      >
                        →
                      </div>
                    </button>

                    {/* ============ QUICK ACCESS 3: DATA KELAS ============ */}
                    <button
                      onClick={() => handleMenuClick("kelas")}
                      style={{
                        background: "linear-gradient(135deg, #FFFFFF 0%, #F8FAFC 100%)", // White gradient
                        borderRadius: "16px",
                        padding: "24px",
                        border: "1px solid #E5E7EB",
                        cursor: "pointer",
                        textAlign: "left",
                        display: "flex",
                        alignItems: "center",
                        gap: "20px",
                        transition: "all 0.3s ease",
                        boxShadow: "0 4px 16px rgba(0, 0, 0, 0.08)",
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.transform = "translateY(-4px)";
                        e.currentTarget.style.boxShadow = "0 8px 32px rgba(0, 0, 0, 0.15)";
                        e.currentTarget.style.borderColor = "#3B82F6";
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.transform = "translateY(0)";
                        e.currentTarget.style.boxShadow = "0 4px 16px rgba(0, 0, 0, 0.08)";
                        e.currentTarget.style.borderColor = "#E5E7EB";
                      }}
                    >
                      <div
                        style={{
                          width: "56px",
                          height: "56px",
                          background: "linear-gradient(135deg, #3B82F6 0%, #2563EB 100%)",
                          borderRadius: "12px",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          fontSize: "24px",
                          color: "white",
                          boxShadow: "0 4px 12px rgba(59, 130, 246, 0.3)",
                        }}
                      >
                        🏫
                      </div>
                      <div style={{ flex: 1 }}>
                        <div
                          style={{
                            fontSize: "18px",
                            fontWeight: "600",
                            color: "#001F3E",
                            marginBottom: "4px",
                          }}
                        >
                          Data Kelas
                        </div>
                        <div
                          style={{
                            fontSize: "14px",
                            color: "#000000", // Diubah dari #6B7280 menjadi hitam
                            fontWeight: "500",
                          }}
                        >
                          Kelola kelas dan jurusan
                        </div>
                      </div>
                      <div
                        style={{
                          width: "32px",
                          height: "32px",
                          backgroundColor: "#F3F4F6",
                          borderRadius: "8px",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          color: "#6B7280",
                          fontSize: "14px",
                        }}
                      >
                        →
                      </div>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </AdminLayout>
        );

      /* ============ PAGE JURUSAN ============ */
      case "jurusan":
        return (
          <JurusanAdmin
            user={user}
            onLogout={handleLogout}
            currentPage={currentPage}
            onMenuClick={handleMenuClick}
          />
        );

      /* ============ PAGE KELAS ============ */
      case "kelas":
        return (
          <KelasAdmin
            user={user}
            onLogout={handleLogout}
            currentPage={currentPage}
            onMenuClick={handleMenuClick}
          />
        );

      /* ============ PAGE SISWA ============ */
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

      /* ============ PAGE GURU ============ */
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

      /* ============ PAGE DETAIL SISWA ============ */
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

      /* ============ PAGE DETAIL GURU ============ */
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
    }
  };

  return renderPage();
}