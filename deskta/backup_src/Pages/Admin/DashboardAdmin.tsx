import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
// import bgadmin from "../../assets/Background/";
import AdminLayout from "../../component/Admin/AdminLayout";
import JurusanAdmin from "./JurusanAdmin";
import KelasAdmin from "./KelasAdmin";
import GuruAdmin from "./GuruAdmin";
import SiswaAdmin from "./SiswaAdmin";
import DetailSiswa from "./DetailSiswa";
import DetailGuru from "./DetailGuru";

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

export default function AdminDashboard({
  user,
  onLogout,
}: AdminDashboardProps) {
  const [currentPage, setCurrentPage] = useState<AdminPage>("dashboard");
  const navigate = useNavigate();
  const [selectedSiswaId, setSelectedSiswaId] = useState<string | null>(null);
  const [selectedGuruId, setSelectedGuruId] = useState<string | null>(null);
  const [currentDate, setCurrentDate] = useState("");
  const [currentTime, setCurrentTime] = useState("");

  /* ================= DATE & TIME ================= */
  const updateDateTime = () => {
    const now = new Date();

    setCurrentDate(
      now.toLocaleDateString("id-ID", {
        weekday: "long",
        day: "numeric",
        month: "long",
        year: "numeric",
      })
    );

    setCurrentTime(
      now.toLocaleTimeString("id-ID", {
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
      })
    );
  };

  useEffect(() => {
    updateDateTime();
    const interval = setInterval(updateDateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  const handleMenuClick = (page: string) => {
    setCurrentPage(page as AdminPage);
  };

  const handleLogout = () => {
    onLogout();
    navigate("/");
  };

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
            <div
              style={{
                maxWidth: "1400px",
                margin: "0 auto",
                padding: "0 4px",
                position: "relative",
              }}
            >
              {/* Background Image */}
              <div
                style={{
                  position: "absolute",
                  top: 0,
                  left: 0,
                  right: 0,
                  zIndex: 0,
                  pointerEvents: "none",
                  opacity: 0.05,
                }}
              >
                <img
                  // src={bgadmin}
                  alt="Background"
                  style={{
                    width: "100%",
                    height: "auto",
                    objectFit: "cover",
                  }}
                />
              </div>

              <div style={{ position: "relative", zIndex: 1 }}>
                {/* ===== WELCOME SECTION ===== */}
                <div
                  style={{
                    marginBottom: "32px",
                  }}
                >
                  <div
                    style={{
                      backgroundColor: "white",
                      borderRadius: "16px",
                      padding: "28px 32px",
                      boxShadow: "0 4px 20px rgba(0, 31, 62, 0.08)",
                      border: "1px solid #E5E7EB",
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                    }}
                  >
                    <div>
                      <h2 style={{
                        fontSize: "24px",
                        fontWeight: "700",
                        color: "#001F3E",
                        margin: "0 0 8px 0"
                      }}>
                        Selamat Datang di Beranda, Admin
                      </h2>
                      <p style={{
                        fontSize: "16px",
                        color: "#6B7280",
                        margin: "0",
                        maxWidth: "600px"
                      }}>
                        Kelola data sekolah, monitor aktivitas, dan pantau statistik secara real-time
                      </p>
                    </div>
                    <div style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "16px",
                      padding: "12px 20px",
                      backgroundColor: "#F0F9FF",
                      borderRadius: "12px",
                      border: "1px solid #BAE6FD"
                    }}>
                      <div style={{ textAlign: "right" }}>
                        <div style={{ fontSize: "14px", color: "#0369A1", fontWeight: "600" }}>
                          {currentDate}
                        </div>
                        <div style={{ fontSize: "20px", color: "#0C4A6E", fontWeight: "700" }}>
                          {currentTime}
                        </div>
                      </div>
                      <div style={{
                        width: "48px",
                        height: "48px",
                        backgroundColor: "#0EA5E9",
                        borderRadius: "12px",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        color: "white",
                        fontSize: "20px",
                        fontWeight: "bold"
                      }}>
                        🕒
                      </div>
                    </div>
                  </div>
                </div>

                {/* ===== STATISTICS CARDS ===== */}
                <div
                  style={{
                    marginBottom: "32px",
                  }}
                >
                  <h3 style={{
                    fontSize: "20px",
                    fontWeight: "600",
                    color: "#001F3E",
                    margin: "0 0 20px 20px"
                  }}>
                    Statistik Sekolah
                  </h3>
                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
                      gap: "20px",
                    }}
                  >
                    {[
                      {
                        value: "212",
                        label: "Total Rombel (Rombongan Belajar)",
                        icon: "🏫",
                        color: "#3B82F6",
                        bgColor: "#EFF6FF"
                      },
                      {
                        value: "2,138",
                        label: "Total Murid",
                        icon: "👨‍🎓",
                        color: "#10B981",
                        bgColor: "#ECFDF5"
                      },
                      {
                        value: "515",
                        label: "Total Guru",
                        icon: "👨‍🏫",
                        color: "#8B5CF6",
                        bgColor: "#F5F3FF"
                      },
                      {
                        value: "8",
                        label: "Total Lab",
                        icon: "🔬",
                        color: "#F59E0B",
                        bgColor: "#FFFBEB"
                      },
                      {
                        value: "24",
                        label: "Ruang Teori",
                        icon: "📚",
                        color: "#EF4444",
                        bgColor: "#FEF2F2"
                      },
                    ].map((item, index) => (
                      <div
                        key={index}
                        style={{
                          backgroundColor: "white",
                          borderRadius: "16px",
                          padding: "24px",
                          color: "#1F2937",
                          display: "flex",
                          alignItems: "center",
                          gap: "20px",
                          boxShadow: "0 4px 12px rgba(0, 0, 0, 0.05)",
                          border: "1px solid #E5E7EB",
                          transition: "all 0.3s ease",
                          cursor: "pointer",
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.transform = "translateY(-4px)";
                          e.currentTarget.style.boxShadow = "0 8px 24px rgba(0, 0, 0, 0.12)";
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.transform = "translateY(0)";
                          e.currentTarget.style.boxShadow = "0 4px 12px rgba(0, 0, 0, 0.05)";
                        }}
                      >
                        <div style={{
                          width: "56px",
                          height: "56px",
                          backgroundColor: item.bgColor,
                          borderRadius: "12px",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          fontSize: "24px"
                        }}>
                          {item.icon}
                        </div>
                        <div>
                          <div
                            style={{
                              fontSize: "28px",
                              fontWeight: 700,
                              lineHeight: 1.2,
                              color: item.color,
                              marginBottom: "4px",
                            }}
                          >
                            {item.value}
                          </div>
                          <div style={{
                            fontSize: "14px",
                            color: "#6B7280",
                            fontWeight: "500"
                          }}>
                            {item.label}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* ===== QUICK ACCESS ===== */}
                <div>
                  <h3 style={{
                    fontSize: "20px",
                    fontWeight: "600",
                    color: "#001F3E",
                    margin: "0 0 20px 20px"
                  }}>
                    Akses Cepat
                  </h3>
                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
                      gap: "20px",
                    }}
                  >
                    {[
                      {
                        title: "Data Siswa",
                        description: "Kelola data siswa dan presensi",
                        icon: "👨‍🎓",
                        action: () => handleMenuClick("siswa"),
                        color: "#10B981"
                      },
                      {
                        title: "Data Guru",
                        description: "Kelola data guru dan jadwal mengajar",
                        icon: "👨‍🏫",
                        action: () => handleMenuClick("guru"),
                        color: "#8B5CF6"
                      },
                      {
                        title: "Data Kelas",
                        description: "Kelola kelas dan jurusan",
                        icon: "🏫",
                        action: () => handleMenuClick("kelas"),
                        color: "#3B82F6"
                      },
                    ].map((item, index) => (
                      <button
                        key={index}
                        onClick={item.action}
                        style={{
                          backgroundColor: "white",
                          borderRadius: "16px",
                          padding: "24px",
                          border: "1px solid #E5E7EB",
                          cursor: "pointer",
                          textAlign: "left",
                          display: "flex",
                          alignItems: "center",
                          gap: "20px",
                          transition: "all 0.3s ease",
                          boxShadow: "0 4px 12px rgba(0, 0, 0, 0.05)",
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.transform = "translateY(-4px)";
                          e.currentTarget.style.boxShadow = "0 8px 24px rgba(0, 0, 0, 0.12)";
                          e.currentTarget.style.borderColor = item.color;
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.transform = "translateY(0)";
                          e.currentTarget.style.boxShadow = "0 4px 12px rgba(0, 0, 0, 0.05)";
                          e.currentTarget.style.borderColor = "#E5E7EB";
                        }}
                      >
                        <div style={{
                          width: "56px",
                          height: "56px",
                          backgroundColor: `${item.color}15`,
                          borderRadius: "12px",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          fontSize: "24px",
                          color: item.color
                        }}>
                          {item.icon}
                        </div>
                        <div style={{ flex: 1 }}>
                          <div style={{
                            fontSize: "18px",
                            fontWeight: "600",
                            color: "#001F3E",
                            marginBottom: "4px"
                          }}>
                            {item.title}
                          </div>
                          <div style={{
                            fontSize: "14px",
                            color: "#6B7280"
                          }}>
                            {item.description}
                          </div>
                        </div>
                        <div style={{
                          width: "32px",
                          height: "32px",
                          backgroundColor: "#F3F4F6",
                          borderRadius: "8px",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          color: "#6B7280",
                          fontSize: "14px"
                        }}>
                          →
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </AdminLayout>
        );

      /* ===== PAGE LAIN ===== */
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
    }
  };

  return renderPage();
}