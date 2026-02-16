import { useMemo, useState, useEffect } from "react";
import SiswaLayout from "../../component/Siswa/SiswaLayout";
// import openBook from "../../assets/Icon/open-book.png";
import { Modal } from "../../component/Shared/Modal";
import JadwalSiswa from "./JadwalSiswa.tsx";
import AbsensiSiswa from "./AbsensiSiswa";
import {
  Bell,
  Megaphone,
  Clock,
  GraduationCap,
  Target,
  BookOpen,
  BookOpenCheck,
  BarChart3,
  PieChart,
  ArrowRight,
  TrendingUp,
  AlarmClock,
} from "lucide-react";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
} from "chart.js";
import { Bar, Doughnut } from "react-chartjs-2";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
);

type SiswaPage = "dashboard" | "jadwal-anda" | "notifikasi" | "absensi";

interface ScheduleItem {
  id: string;
  mapel: string;
  guru: string;
  start: string;
  end: string;
}

interface DashboardSiswaProps {
  user: { name: string; phone: string };
  onLogout: () => void;
}

// Dummy data untuk statistik
const monthlyTrendData = [
  { month: "Jan", hadir: 20, izin: 5, sakit: 3, alpha: 2 },
  { month: "Feb", hadir: 42, izin: 8, sakit: 2, alpha: 3 },
  { month: "Mar", hadir: 48, izin: 4, sakit: 1, alpha: 2 },
  { month: "Apr", hadir: 46, izin: 6, sakit: 2, alpha: 1 },
  { month: "Mei", hadir: 50, izin: 3, sakit: 1, alpha: 1 },
  { month: "Jun", hadir: 47, izin: 5, sakit: 2, alpha: 1 },
];

const weeklyStats = {
  hadir: 80,
  izin: 25,
  sakit: 20,
  alpha: 40,
};

export default function DashboardSiswa({ user, onLogout }: DashboardSiswaProps) {
  const [currentPage, setCurrentPage] = useState<SiswaPage>("dashboard");
  const [currentDate, setCurrentDate] = useState("");
  const [currentTime, setCurrentTime] = useState("");
  const [selectedSchedule, setSelectedSchedule] = useState<ScheduleItem | null>(null);
  const [isScheduleModalOpen, setIsScheduleModalOpen] = useState(false);

  useEffect(() => {
    const updateDateTime = () => {
      const now = new Date();
      const options: Intl.DateTimeFormatOptions = {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
      };
      setCurrentDate(now.toLocaleDateString("id-ID", options));
      setCurrentTime(now.toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" }));
    };

    updateDateTime();
    const interval = setInterval(updateDateTime, 60000);

    return () => clearInterval(interval);
  }, []);

  const schedules = useMemo<ScheduleItem[]>(
    () => [
      { id: "1", mapel: "Matematika", guru: "Ewit Erniyah S.Pd", start: "07:00", end: "08:30" },
      { id: "2", mapel: "Bahasa Indonesia", guru: "Budi Santoso S.Pd", start: "08:30", end: "10:00" },
      { id: "3", mapel: "Bahasa Inggris", guru: "Siti Nurhaliza S.Pd", start: "10:15", end: "11:45" },
    ],
    []
  );

  const handleMenuClick = (page: string) => {
    setCurrentPage(page as SiswaPage);
  };

  const handleLogout = () => {
    onLogout();
  };

  const handleScheduleClick = (schedule: ScheduleItem) => {
    setSelectedSchedule(schedule);
    setIsScheduleModalOpen(true);
  };

  // Dummy user data
  const userInfo = {
    name: user.name || "Muhammad Wito S.",
    id: "0918415784",
  };

  const renderPage = () => {
    switch (currentPage) {
      case "absensi":
        return (
          <AbsensiSiswa
            user={user}
            currentPage={currentPage}
            onMenuClick={handleMenuClick}
            onLogout={handleLogout}
          />
        );
      case "jadwal-anda":
        return (
          <JadwalSiswa
            user={user}
            currentPage={currentPage}
            onMenuClick={handleMenuClick}
            onLogout={handleLogout}
          />
        );
      case "notifikasi":
        return (
          <SiswaLayout
            pageTitle="Notifikasi"
            currentPage={currentPage}
            onMenuClick={handleMenuClick}
            user={user}
            onLogout={handleLogout}
          >
            <div
              style={{
                width: "100%",
                maxWidth: "1400px",
                margin: "0 auto",
                padding: "32px",
                background: "white",
                borderRadius: "16px",
                boxShadow: "0 4px 20px rgba(0, 31, 62, 0.08)",
                border: "1px solid #E5E7EB",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: "16px", marginBottom: "24px" }}>
                <div style={{
                  width: "48px",
                  height: "48px",
                  backgroundColor: "#F0F9FF",
                  borderRadius: "12px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "20px",
                  color: "#0EA5E9"
                }}>
                  <Bell size={22} />
                </div>
                <h2 style={{ margin: 0, fontSize: "24px", fontWeight: 700, color: "#001F3E" }}>
                  Notifikasi
                </h2>
              </div>
              <div style={{
                textAlign: "center",
                padding: "48px 24px",
                backgroundColor: "#F9FAFB",
                borderRadius: "12px",
                border: "1px dashed #D1D5DB"
              }}>
                <div style={{
                  width: "64px",
                  height: "64px",
                  backgroundColor: "#E5E7EB",
                  borderRadius: "50%",
                  display: "inline-flex",
                  alignItems: "center",
                  justifyContent: "center",
                  marginBottom: "16px",
                  fontSize: "24px",
                  color: "#6B7280"
                }}>
                  <Megaphone size={24} />
                </div>
                <p style={{
                  fontSize: "16px",
                  color: "#6B7280",
                  margin: "0 0 8px 0"
                }}>
                  Tidak ada notifikasi baru
                </p>
                <p style={{
                  fontSize: "14px",
                  color: "#9CA3AF",
                  margin: 0
                }}>
                  Notifikasi akan muncul di sini
                </p>
              </div>
            </div>
          </SiswaLayout>
        );
      case "dashboard":
      default:
        return (
          <SiswaLayout
            pageTitle="Beranda"
            currentPage={currentPage}
            onMenuClick={handleMenuClick}
            user={user}
            onLogout={handleLogout}
          >
            <div
              style={{
                width: "100%",
                maxWidth: "1400px",
                margin: "0 auto",
                display: "flex",
                flexDirection: "column",
                gap: "28px",
              }}
            >
              {/* Welcome Section */}
              <div style={{
                backgroundColor: "white",
                borderRadius: "16px",
                padding: "28px 32px",
                boxShadow: "0 4px 20px rgba(0, 31, 62, 0.08)",
                border: "1px solid #E5E7EB",
              }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "20px" }}>
                  <div>
                    <h2 style={{
                      fontSize: "24px",
                      fontWeight: "700",
                      color: "#001F3E",
                      margin: "0 0 8px 0"
                    }}>
                      Selamat Belajar, {userInfo.name}!
                    </h2>
                    <p style={{
                      fontSize: "16px",
                      color: "#6B7280",
                      margin: 0,
                      maxWidth: "600px"
                    }}>
                      Pantau jadwal, kehadiran, dan statistik belajar Anda hari ini
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
                        {currentDate || "Memuat..."}
                      </div>
                      <div style={{ fontSize: "20px", color: "#0C4A6E", fontWeight: "700" }}>
                        {currentTime || "00:00"}
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
                      <Clock size={22} />
                    </div>
                  </div>
                </div>
              </div>

              {/* Stats Cards */}
              <div style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
                gap: "20px",
              }}>
                {/* User Info Card */}
                <div style={{
                  backgroundColor: "#1E40AF",
                  borderRadius: "16px",
                  padding: "24px",
                  boxShadow: "0 4px 20px rgba(30, 64, 175, 0.2)",
                  border: "1px solid #1E40AF",
                  display: "flex",
                  alignItems: "center",
                  gap: "20px",
                  transition: "all 0.3s ease",
                  cursor: "pointer",
                }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = "translateY(-4px)";
                    e.currentTarget.style.boxShadow = "0 8px 30px rgba(30, 64, 175, 0.3)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = "translateY(0)";
                    e.currentTarget.style.boxShadow = "0 4px 20px rgba(30, 64, 175, 0.2)";
                  }}>
                  <div style={{
                    width: "64px",
                    height: "64px",
                    backgroundColor: "rgba(255, 255, 255, 0.15)",
                    borderRadius: "12px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: "28px",
                    color: "white"
                  }}>
                    <GraduationCap size={28} />
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{
                      fontWeight: 700,
                      fontSize: "18px",
                      color: "white",
                      marginBottom: "4px",
                    }}>
                      {userInfo.name}
                    </div>
                    <div style={{
                      fontWeight: 500,
                      fontSize: "14px",
                      color: "rgba(255, 255, 255, 0.85)",
                      marginBottom: "8px"
                    }}>
                      NISN: {userInfo.id}
                    </div>
                    <div style={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: "8px",
                      padding: "6px 12px",
                      backgroundColor: "rgba(255, 255, 255, 0.15)",
                      borderRadius: "8px",
                      fontSize: "12px",
                      color: "white",
                      fontWeight: "600"
                    }}>
                      <Target size={14} />
                      <span>Siswa Aktif</span>
                    </div>
                  </div>
                </div>

                {/* Schedule Summary Card */}
                <div style={{
                  backgroundColor: "white",
                  borderRadius: "16px",
                  padding: "24px",
                  boxShadow: "0 4px 20px rgba(0, 31, 62, 0.08)",
                  border: "1px solid #E5E7EB",
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "space-between",
                  transition: "all 0.3s ease",
                }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = "translateY(-4px)";
                    e.currentTarget.style.boxShadow = "0 8px 30px rgba(0, 31, 62, 0.12)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = "translateY(0)";
                    e.currentTarget.style.boxShadow = "0 4px 20px rgba(0, 31, 62, 0.08)";
                  }}>
                  <div>
                    <div style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "12px",
                      marginBottom: "16px"
                    }}>
                      <div style={{
                        width: "40px",
                        height: "40px",
                        backgroundColor: "#FEF3C7",
                        borderRadius: "10px",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontSize: "18px"
                      }}>
                        <BookOpen size={18} color="#92400E" />
                      </div>
                      <h3 style={{
                        margin: 0,
                        fontSize: "18px",
                        fontWeight: "600",
                        color: "#001F3E"
                      }}>
                        Ringkasan Hari Ini
                      </h3>
                    </div>
                    <div style={{
                      fontSize: "14px",
                      color: "#6B7280",
                      marginBottom: "20px"
                    }}>
                      {schedules.length} mata pelajaran dijadwalkan
                    </div>
                  </div>
                  <div style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "12px",
                    padding: "12px 16px",
                    backgroundColor: "#F3F4F6",
                    borderRadius: "12px",
                    border: "1px solid #E5E7EB"
                  }}>
                    <TimePill label="07:00" />
                    <span style={{
                      fontWeight: "600",
                      color: "#6B7280",
                      fontSize: "14px"
                    }}>—</span>
                    <TimePill label="15:00" />
                  </div>
                </div>
              </div>

              {/* Today's Schedule Section */}
              <div style={{
                backgroundColor: "white",
                borderRadius: "16px",
                padding: "28px",
                boxShadow: "0 4px 20px rgba(0, 31, 62, 0.08)",
                border: "1px solid #E5E7EB",
              }}>
                <div style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  marginBottom: "24px"
                }}>
                  <h3 style={{
                    margin: 0,
                    fontSize: "20px",
                    fontWeight: "600",
                    color: "#001F3E"
                  }}>
                    Jadwal Hari Ini
                  </h3>
                  <button
                    onClick={() => handleMenuClick("jadwal-anda")}
                    style={{
                      padding: "8px 16px",
                      backgroundColor: "#3B82F6",
                      color: "white",
                      border: "none",
                      borderRadius: "8px",
                      fontSize: "14px",
                      fontWeight: "600",
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      gap: "8px",
                      transition: "all 0.2s"
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = "#2563EB";
                      e.currentTarget.style.transform = "translateY(-1px)";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = "#3B82F6";
                      e.currentTarget.style.transform = "translateY(0)";
                    }}
                  >
                    <span>Lihat Semua</span>
                    <span><ArrowRight size={16} /></span>
                  </button>
                </div>
                <div style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))",
                  gap: "16px",
                }}>
                  {schedules.map((schedule) => (
                    <div
                      key={schedule.id}
                      onClick={() => handleScheduleClick(schedule)}
                      style={{
                        padding: "20px",
                        borderRadius: "12px",
                        border: "1px solid #E5E7EB",
                        backgroundColor: "#F9FAFB",
                        cursor: "pointer",
                        transition: "all 0.3s ease",
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.transform = "translateY(-4px)";
                        e.currentTarget.style.backgroundColor = "#F0F9FF";
                        e.currentTarget.style.borderColor = "#0EA5E9";
                        e.currentTarget.style.boxShadow = "0 8px 24px rgba(14, 165, 233, 0.15)";
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.transform = "translateY(0)";
                        e.currentTarget.style.backgroundColor = "#F9FAFB";
                        e.currentTarget.style.borderColor = "#E5E7EB";
                        e.currentTarget.style.boxShadow = "none";
                      }}
                    >
                      <div style={{
                        display: "flex",
                        alignItems: "flex-start",
                        gap: "16px",
                        marginBottom: "16px"
                      }}>
                        <div style={{
                          width: "48px",
                          height: "48px",
                          backgroundColor: "#EFF6FF",
                          borderRadius: "10px",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          fontSize: "20px"
                        }}>
                          <BookOpenCheck size={20} color="#1D4ED8" />
                        </div>
                        <div style={{ flex: 1 }}>
                          <h4 style={{
                            margin: "0 0 6px 0",
                            fontSize: "17px",
                            fontWeight: "600",
                            color: "#001F3E"
                          }}>
                            {schedule.mapel}
                          </h4>
                          <p style={{
                            margin: "0",
                            fontSize: "14px",
                            color: "#6B7280"
                          }}>
                            {schedule.guru}
                          </p>
                        </div>
                      </div>
                      <div style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "12px",
                        padding: "10px 14px",
                        backgroundColor: "#F3F4F6",
                        borderRadius: "8px",
                        border: "1px solid #E5E7EB"
                      }}>
                        <span style={{
                          fontSize: "14px",
                          color: "#6B7280",
                          fontWeight: "500"
                        }}>
                          <Clock size={14} />
                        </span>
                        <span style={{
                          fontSize: "14px",
                          fontWeight: "600",
                          color: "#111827"
                        }}>
                          {schedule.start} - {schedule.end}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Statistics Section */}
              <div style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(450px, 1fr))",
                gap: "24px",
                width: "100%",
              }}>
                {/* Monthly Trend Chart */}
                <div style={{
                  backgroundColor: "white",
                  borderRadius: "16px",
                  padding: "28px",
                  boxShadow: "0 4px 20px rgba(0, 31, 62, 0.08)",
                  border: "1px solid #E5E7EB",
                  transition: "all 0.3s ease",
                }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = "translateY(-4px)";
                    e.currentTarget.style.boxShadow = "0 8px 30px rgba(0, 31, 62, 0.12)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = "translateY(0)";
                    e.currentTarget.style.boxShadow = "0 4px 20px rgba(0, 31, 62, 0.08)";
                  }}>
                  <div style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "12px",
                    marginBottom: "20px"
                  }}>
                    <div style={{
                      width: "40px",
                      height: "40px",
                      backgroundColor: "#FEF3C7",
                      borderRadius: "10px",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: "18px"
                    }}>
                      <TrendingUp size={18} color="#92400E" />
                    </div>
                    <h3 style={{
                      margin: 0,
                      fontSize: "18px",
                      fontWeight: "600",
                      color: "#001F3E"
                    }}>
                      Tren Kehadiran Bulanan
                    </h3>
                  </div>
                  <MonthlyBarChart data={monthlyTrendData} />
                </div>

                {/* Weekly Statistics */}
                <div style={{
                  backgroundColor: "white",
                  borderRadius: "16px",
                  padding: "28px",
                  boxShadow: "0 4px 20px rgba(0, 31, 62, 0.08)",
                  border: "1px solid #E5E7EB",
                  transition: "all 0.3s ease",
                }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = "translateY(-4px)";
                    e.currentTarget.style.boxShadow = "0 8px 30px rgba(0, 31, 62, 0.12)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = "translateY(0)";
                    e.currentTarget.style.boxShadow = "0 4px 20px rgba(0, 31, 62, 0.08)";
                  }}>
                  <div style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "12px",
                    marginBottom: "20px"
                  }}>
                    <div style={{
                      width: "40px",
                      height: "40px",
                      backgroundColor: "#ECFDF5",
                      borderRadius: "10px",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: "18px"
                    }}>
                      <BarChart3 size={18} color="#1D4ED8" />
                    </div>
                    <h3 style={{
                      margin: 0,
                      fontSize: "18px",
                      fontWeight: "600",
                      color: "#001F3E"
                    }}>
                      Statistik Minggu Ini
                    </h3>
                  </div>
                  <WeeklyDonutChart data={weeklyStats} />
                </div>
              </div>

              {/* Quick Access to Attendance */}
              <button
                onClick={() => handleMenuClick("absensi")}
                style={{
                  backgroundColor: "#1E40AF",
                  color: "white",
                  borderRadius: "12px",
                  padding: "18px 24px",
                  fontWeight: "600",
                  fontSize: "16px",
                  boxShadow: "0 4px 20px rgba(30, 64, 175, 0.2)",
                  textAlign: "center",
                  cursor: "pointer",
                  transition: "all 0.3s ease",
                  border: "none",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "12px"
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = "#1E3A8A";
                  e.currentTarget.style.transform = "translateY(-2px)";
                  e.currentTarget.style.boxShadow = "0 8px 30px rgba(30, 64, 175, 0.3)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = "#1E40AF";
                  e.currentTarget.style.transform = "translateY(0)";
                  e.currentTarget.style.boxShadow = "0 4px 20px rgba(30, 64, 175, 0.2)";
                }}
              >
                <span><PieChart size={18} color="#B91C1C" /></span>
                <span>Lihat Detail Kehadiran</span>
                <ArrowRight size={18} />
              </button>
            </div>

            {/* Modal Jadwal Siswa */}
            <JadwalSiswaModal
              isOpen={isScheduleModalOpen}
              onClose={() => {
                setIsScheduleModalOpen(false);
                setSelectedSchedule(null);
              }}
              data={selectedSchedule}
            />
          </SiswaLayout>
        );
    }
  };

  return renderPage();
}

// Monthly Bar Chart Component
function MonthlyBarChart({
  data,
}: {
  data: Array<{ month: string; hadir: number; izin: number; sakit: number; alpha: number }>;
}) {
  const chartData = {
    labels: data.map((d) => d.month),
    datasets: [
      {
        label: "Hadir",
        data: data.map((d) => d.hadir),
        backgroundColor: "#10B981",
        borderRadius: 4,
      },
      {
        label: "Izin",
        data: data.map((d) => d.izin),
        backgroundColor: "#F59E0B",
        borderRadius: 4,
      },
      {
        label: "Sakit",
        data: data.map((d) => d.sakit),
        backgroundColor: "#3B82F6",
        borderRadius: 4,
      },
      {
        label: "Alpha",
        data: data.map((d) => d.alpha),
        backgroundColor: "#EF4444",
        borderRadius: 4,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: "bottom" as const,
        labels: {
          usePointStyle: true,
          boxWidth: 8,
          padding: 20,
          font: {
            size: 12,
            family: "'Inter', sans-serif",
          },
        },
      },
      tooltip: {
        backgroundColor: "#1F2937",
        padding: 12,
        titleFont: { size: 13, family: "'Inter', sans-serif" },
        bodyFont: { size: 12, family: "'Inter', sans-serif" },
        cornerRadius: 8,
        displayColors: true,
      },
    },
    scales: {
      x: {
        grid: {
          display: false,
        },
        ticks: {
          font: {
            size: 11,
          },
        },
      },
      y: {
        grid: {
          color: "#F3F4F6",
          drawBorder: false,
        },
        border: {
          display: false,
        },
        ticks: {
          font: {
            size: 11,
          },
          padding: 8,
        },
      },
    },
    interaction: {
      mode: "index" as const,
      intersect: false,
    },
  };

  return (
    <div style={{ height: "300px", width: "100%" }}>
      <Bar data={chartData} options={options} />
    </div>
  );
}

// Weekly Donut Chart Component
function WeeklyDonutChart({
  data,
}: {
  data: { hadir: number; izin: number; sakit: number; alpha: number };
}) {
  const chartData = {
    labels: ["Hadir", "Izin", "Sakit", "Alpha"],
    datasets: [
      {
        data: [data.hadir, data.izin, data.sakit, data.alpha],
        backgroundColor: ["#10B981", "#F59E0B", "#3B82F6", "#EF4444"],
        borderColor: "#ffffff",
        borderWidth: 2,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    cutout: "70%",
    plugins: {
      legend: {
        position: "right" as const,
        labels: {
          usePointStyle: true,
          boxWidth: 10,
          padding: 20,
          font: {
            size: 13,
            family: "'Inter', sans-serif",
          },
          generateLabels: (chart: any) => {
            const data = chart.data;
            if (data.labels.length && data.datasets.length) {
              return data.labels.map((label: string, i: number) => {
                const meta = chart.getDatasetMeta(0);
                const style = meta.controller.getStyle(i);
                const value = data.datasets[0].data[i];
                const total = data.datasets[0].data.reduce((a: number, b: number) => a + b, 0);
                const percentage = Math.round((value / total) * 100) + "%";

                return {
                  text: `${label} (${percentage})`,
                  fillStyle: style.backgroundColor,
                  strokeStyle: style.borderColor,
                  lineWidth: style.borderWidth,
                  hidden: isNaN(data.datasets[0].data[i]) || meta.data[i].hidden,
                  index: i
                };
              });
            }
            return [];
          }
        },
      },
    },
  };

  return (
    <div style={{ height: "250px", width: "100%", display: "flex", justifyContent: "center" }}>
      <Doughnut data={chartData} options={options} />
    </div>
  );
}



// Modal Component untuk Siswa
interface JadwalSiswaModalProps {
  isOpen: boolean;
  onClose: () => void;
  data: ScheduleItem | null;
}

function JadwalSiswaModal({ isOpen, onClose, data }: JadwalSiswaModalProps) {
  if (!data) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <div
        style={{
          border: "1px solid #E5E7EB",
          borderRadius: "16px",
          overflow: "hidden",
          backgroundColor: "white",
          maxWidth: "500px",
          width: "100%",
        }}
      >
        <div
          style={{
            backgroundColor: "#1E40AF",
            color: "white",
            padding: "20px 24px",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
            <div style={{
              width: "40px",
              height: "40px",
              backgroundColor: "rgba(255, 255, 255, 0.2)",
              borderRadius: "10px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "20px"
            }}>
              <BookOpen size={18} color="#92400E" />
            </div>
            <h2 style={{ fontSize: "20px", fontWeight: "bold", margin: 0 }}>
              {data.mapel}
            </h2>
          </div>
          <button
            onClick={onClose}
            style={{
              background: "rgba(255, 255, 255, 0.2)",
              border: "none",
              color: "white",
              fontSize: "24px",
              cursor: "pointer",
              padding: "0",
              width: "36px",
              height: "36px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              borderRadius: "8px",
              transition: "background 0.2s"
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = "rgba(255, 255, 255, 0.3)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = "rgba(255, 255, 255, 0.2)";
            }}
            type="button"
          >
            ×
          </button>
        </div>

        <div style={{ padding: "28px" }}>
          <div style={{ marginBottom: "24px" }}>
            <h3
              style={{
                fontSize: "18px",
                fontWeight: "600",
                color: "#111827",
                marginBottom: "20px",
              }}
            >
              Detail Mata Pelajaran
            </h3>
            <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
              <InfoRow label="Mata Pelajaran" value={data.mapel} />
              <InfoRow label="Guru Pengajar" value={data.guru} />
              <InfoRow label="Waktu" value={`${data.start} - ${data.end}`} />
              <InfoRow label="Durasi" value="1 jam 30 menit" />
            </div>
          </div>
        </div>

        <div
          style={{
            padding: "20px 28px",
            backgroundColor: "#F9FAFB",
            borderTop: "1px solid #E5E7EB",
            display: "flex",
            justifyContent: "flex-end",
            gap: "12px",
          }}
        >
          <button
            type="button"
            onClick={onClose}
            style={{
              padding: "12px 28px",
              borderRadius: "10px",
              border: "1px solid #D1D5DB",
              backgroundColor: "white",
              color: "#374151",
              fontWeight: "600",
              cursor: "pointer",
              fontSize: "15px",
              transition: "all 0.2s",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = "#F3F4F6";
              e.currentTarget.style.borderColor = "#9CA3AF";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = "white";
              e.currentTarget.style.borderColor = "#D1D5DB";
            }}
          >
            Tutup
          </button>
          <button
            type="button"
            onClick={() => {
              // Action for reminder
              alert("Pengingat ditambahkan!");
              onClose();
            }}
            style={{
              padding: "12px 28px",
              borderRadius: "10px",
              border: "none",
              backgroundColor: "#3B82F6",
              color: "white",
              fontWeight: "600",
              cursor: "pointer",
              fontSize: "15px",
              transition: "background-color 0.2s",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = "#2563EB";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = "#3B82F6";
            }}
          >
            <AlarmClock size={16} /> Set Pengingat
          </button>
        </div>
      </div>
    </Modal>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div
      style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        gap: "12px",
        background: "#F9FAFB",
        borderRadius: "10px",
        padding: "14px 18px",
        border: "1px solid #E5E7EB",
      }}
    >
      <span style={{ fontWeight: "600", color: "#374151", fontSize: "15px" }}>
        {label}
      </span>
      <span style={{ color: "#111827", fontSize: "15px", fontWeight: "500" }}>
        {value}
      </span>
    </div>
  );
}

function TimePill({ label }: { label: string }) {
  return (
    <div
      style={{
        minWidth: "100px",
        padding: "10px 16px",
        borderRadius: "10px",
        border: "1px solid #D1D5DB",
        background: "white",
        textAlign: "center",
        fontWeight: "600",
        fontSize: "14px",
        color: "#111827",
        boxShadow: "0 1px 2px rgba(0, 0, 0, 0.05)",
      }}
    >
      {label}
    </div>
  );
}


// LEGACY CODE - DO NOT DELETE
// import { useMemo, useState, useEffect } from "react";
// import SiswaLayout from "../../component/Siswa/SiswaLayout";
// import openBook from "../../assets/Icon/open-book.png";
// import { Modal } from "../../component/Shared/Modal";
// import JadwalSiswa from "./JadwalSiswa.tsx";
// import AbsensiSiswa from "./AbsensiSiswa";

// type SiswaPage = "dashboard" | "jadwal-anda" | "notifikasi" | "absensi";

// interface ScheduleItem {
//   id: string;
//   mapel: string;
//   guru: string;
//   start: string;
//   end: string;
// }

// interface DashboardSiswaProps {
//   user: { name: string; phone: string };
//   onLogout: () => void;
// }

// // Dummy data untuk statistik
// const monthlyTrendData = [
//   { month: "Jan", hadir: 20, izin: 5, sakit: 3, alpha: 2 },
//   { month: "Feb", hadir: 42, izin: 8, sakit: 2, alpha: 3 },
//   { month: "Mar", hadir: 48, izin: 4, sakit: 1, alpha: 2 },
//   { month: "Apr", hadir: 46, izin: 6, sakit: 2, alpha: 1 },
//   { month: "Mei", hadir: 50, izin: 3, sakit: 1, alpha: 1 },
//   { month: "Jun", hadir: 47, izin: 5, sakit: 2, alpha: 1 },
// ];

// const weeklyStats = {
//   hadir: 80,
//   izin: 25,
//   sakit: 20,
//   alpha: 40,
// };

// export default function DashboardSiswa({ user, onLogout }: DashboardSiswaProps) {
//   const [currentPage, setCurrentPage] = useState<SiswaPage>("dashboard");
//   const [currentDate, setCurrentDate] = useState("");
//   const [currentTime, setCurrentTime] = useState("");
//   const [selectedSchedule, setSelectedSchedule] = useState<ScheduleItem | null>(null);
//   const [isScheduleModalOpen, setIsScheduleModalOpen] = useState(false);

//   useEffect(() => {
//     const updateDateTime = () => {
//       const now = new Date();
//       const options: Intl.DateTimeFormatOptions = {
//         weekday: "long",
//         year: "numeric",
//         month: "long",
//         day: "numeric",
//       };
//       setCurrentDate(now.toLocaleDateString("id-ID", options));
//       setCurrentTime(now.toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" }));
//     };

//     updateDateTime();
//     const interval = setInterval(updateDateTime, 60000);

//     return () => clearInterval(interval);
//   }, []);

//   const schedules = useMemo<ScheduleItem[]>(
//     () => [
//       { id: "1", mapel: "Matematika", guru: "Ewit Erniyah S.Pd", start: "07:00", end: "08:30" },
//       { id: "2", mapel: "Bahasa Indonesia", guru: "Budi Santoso S.Pd", start: "08:30", end: "10:00" },
//       { id: "3", mapel: "Bahasa Inggris", guru: "Siti Nurhaliza S.Pd", start: "10:15", end: "11:45" },
//     ],
//     []
//   );

//   const handleMenuClick = (page: string) => {
//     setCurrentPage(page as SiswaPage);
//   };

//   const handleLogout = () => {
//     onLogout();
//   };

//   const handleScheduleClick = (schedule: ScheduleItem) => {
//     setSelectedSchedule(schedule);
//     setIsScheduleModalOpen(true);
//   };

//   // Dummy user data - nanti dari props atau API
//   const userInfo = {
//     name: user.name || "Muhammad Wito S.",
//     id: "0918415784",
//   };

//   const renderPage = () => {
//     switch (currentPage) {
//       case "absensi":
//         return (
//           <AbsensiSiswa
//             user={user}
//             currentPage={currentPage}
//             onMenuClick={handleMenuClick}
//             onLogout={handleLogout}
//           />
//         );
//       case "jadwal-anda":
//         return (
//           <JadwalSiswa
//             user={user}
//             currentPage={currentPage}
//             onMenuClick={handleMenuClick}
//             onLogout={handleLogout}
//           />
//         );
//       case "notifikasi":
//         return (
//           <SiswaLayout
//             pageTitle="Notifikasi"
//             currentPage={currentPage}
//             onMenuClick={handleMenuClick}
//             user={user}
//             onLogout={handleLogout}
//           >
//             <div
//               style={{
//                 width: "100%",
//                 maxWidth: "1400px",
//                 margin: "0 auto",
//                 padding: "24px",
//                 background: "#FFFFFF",
//                 borderRadius: "16px",
//                 boxShadow: "0 4px 12px rgba(15, 23, 42, 0.08)",
//                 border: "1px solid #E2E8F0",
//               }}
//             >
//               <h2 style={{ margin: 0, fontSize: "20px", fontWeight: 700, color: "#0F172A" }}>
//                 Notifikasi
//               </h2>
//               <p style={{ marginTop: "16px", color: "#64748B" }}>Coming Soon...</p>
//             </div>
//           </SiswaLayout>
//         );
//       case "dashboard":
//       default:
//         return (
//           <SiswaLayout
//             pageTitle="Dashboard"
//             currentPage={currentPage}
//             onMenuClick={handleMenuClick}
//             user={user}
//             onLogout={handleLogout}
//           >
//             <div
//               style={{
//                 width: "100%",
//                 maxWidth: "1400px",
//                 margin: "0 auto",
//                 display: "flex",
//                 flexDirection: "column",
//                 gap: "24px",
//               }}
//             >
//               {/* Header Cards: User Info, Schedule, Total Mapel */}
//               <div
//                 style={{
//                   display: "grid",
//                   gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
//                   gap: "16px",
//                   width: "100%",
//                 }}
//               >
//                 {/* User Information Card - Dark Blue */}
//                 <div
//                   style={{
//                     background: "#0B2948",
//                     borderRadius: "16px",
//                     padding: "20px",
//                     boxShadow: "0 4px 12px rgba(11, 41, 72, 0.2)",
//                     border: "1px solid #0B2948",
//                     minHeight: "120px",
//                     display: "flex",
//                     alignItems: "center",
//                     gap: "16px",
//                   }}
//                 >
//                   {/* Person Icon */}
//                   <div
//                     style={{
//                       width: "48px",
//                       height: "48px",
//                       borderRadius: "12px",
//                       background: "rgba(255, 255, 255, 0.1)",
//                       display: "flex",
//                       alignItems: "center",
//                       justifyContent: "center",
//                       flexShrink: 0,
//                     }}
//                   >
//                     <svg
//                       width="24"
//                       height="24"
//                       viewBox="0 0 24 24"
//                       fill="none"
//                       style={{ filter: "brightness(0) invert(1)" }}
//                     >
//                       <path
//                         d="M12 12C14.21 12 16 10.21 16 8C16 5.79 14.21 4 12 4C9.79 4 8 5.79 8 8C8 10.21 9.79 12 12 12ZM12 14C9.33 14 4 15.34 4 18V20H20V18C20 15.34 14.67 14 12 14Z"
//                         fill="white"
//                       />
//                     </svg>
//                   </div>

//                   {/* User Info */}
//                   <div style={{ flex: 1, minWidth: 0 }}>
//                     <div
//                       style={{
//                         fontWeight: 700,
//                         fontSize: "16px",
//                         color: "#FFFFFF",
//                         marginBottom: "4px",
//                         whiteSpace: "nowrap",
//                         overflow: "hidden",
//                         textOverflow: "ellipsis",
//                       }}
//                     >
//                       {userInfo.name}
//                     </div>
//                     <div
//                       style={{
//                         fontWeight: 500,
//                         fontSize: "14px",
//                         color: "rgba(255, 255, 255, 0.8)",
//                       }}
//                     >
//                       {userInfo.id}
//                     </div>
//                   </div>
//                 </div>

//                 {/* Card Tanggal & Waktu */}
//                 <div
//                   style={{
//                     background: "#fff",
//                     borderRadius: "16px",
//                     padding: "20px",
//                     boxShadow: "0 4px 12px rgba(15, 23, 42, 0.08)",
//                     border: "1px solid #E2E8F0",
//                     minHeight: "120px",
//                     display: "flex",
//                     flexDirection: "column",
//                     justifyContent: "space-between",
//                   }}
//                 >
//                   <div
//                     style={{
//                       display: "flex",
//                       justifyContent: "space-between",
//                       alignItems: "flex-start",
//                       marginBottom: "16px",
//                       flexWrap: "wrap",
//                       gap: "8px",
//                     }}
//                   >
//                     <span
//                       style={{
//                         fontWeight: 700,
//                         fontSize: "15px",
//                         color: "#0F172A",
//                         lineHeight: "1.4",
//                       }}
//                     >
//                       {currentDate || "Memuat..."}
//                     </span>
//                     <span
//                       style={{
//                         fontWeight: 700,
//                         fontSize: "18px",
//                         color: "#0B2948",
//                         whiteSpace: "nowrap",
//                       }}
//                     >
//                       {currentTime || "00:00"}
//                     </span>
//                   </div>
//                   <div
//                     style={{
//                       display: "flex",
//                       alignItems: "center",
//                       gap: "12px",
//                       flexWrap: "wrap",
//                     }}
//                   >
//                     <TimePill label="07:00:00" />
//                     <span style={{ fontWeight: 700, color: "#64748B" }}>—</span>
//                     <TimePill label="15:00:00" />
//                   </div>
//                 </div>

//                 {/* Card Total Mapel */}
//                 <div
//                   style={{
//                     background: "#fff",
//                     borderRadius: "16px",
//                     padding: "20px",
//                     boxShadow: "0 4px 12px rgba(15, 23, 42, 0.08)",
//                     border: "1px solid #E2E8F0",
//                     minHeight: "120px",
//                     display: "flex",
//                     flexDirection: "column",
//                     justifyContent: "space-between",
//                   }}
//                 >
//                   <div
//                     style={{
//                       fontWeight: 700,
//                       fontSize: "15px",
//                       color: "#0F172A",
//                       marginBottom: "16px",
//                     }}
//                   >
//                     Total Mata Pelajaran Hari Ini
//                   </div>
//                   <div
//                     style={{
//                       display: "inline-flex",
//                       minWidth: "140px",
//                       justifyContent: "center",
//                       padding: "12px 16px",
//                       borderRadius: "12px",
//                       background: "#F8FAFC",
//                       border: "1px solid #E2E8F0",
//                       fontWeight: 800,
//                       fontSize: "18px",
//                       color: "#0B2948",
//                     }}
//                   >
//                     {schedules.length} Mapel
//                   </div>
//                 </div>
//               </div>

//               {/* Jadwal Hari Ini Section */}
//               <div
//                 style={{
//                   backgroundColor: "#FFFFFF",
//                   borderRadius: "16px",
//                   padding: "24px",
//                   boxShadow: "0 4px 12px rgba(15, 23, 42, 0.08)",
//                   border: "1px solid #E2E8F0",
//                 }}
//               >
//                 <h3
//                   style={{
//                     margin: "0 0 16px 0",
//                     fontSize: "18px",
//                     fontWeight: 700,
//                     color: "#0F172A",
//                   }}
//                 >
//                   Jadwal Hari Ini
//                 </h3>
//                 <div
//                   style={{
//                     display: "grid",
//                     gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
//                     gap: "12px",
//                   }}
//                 >
//                   {schedules.map((schedule) => (
//                     <div
//                       key={schedule.id}
//                       onClick={() => handleScheduleClick(schedule)}
//                       style={{
//                         padding: "16px",
//                         borderRadius: "12px",
//                         border: "1px solid #E2E8F0",
//                         backgroundColor: "#F8FAFC",
//                         cursor: "pointer",
//                         transition: "all 0.2s ease",
//                       }}
//                       onMouseEnter={(e) => {
//                         const div = e.currentTarget as HTMLDivElement;
//                         div.style.backgroundColor = "#E0E7FF";
//                         div.style.borderColor = "#2563EB";
//                         div.style.boxShadow = "0 4px 12px rgba(37, 99, 235, 0.1)";
//                       }}
//                       onMouseLeave={(e) => {
//                         const div = e.currentTarget as HTMLDivElement;
//                         div.style.backgroundColor = "#F8FAFC";
//                         div.style.borderColor = "#E2E8F0";
//                         div.style.boxShadow = "none";
//                       }}
//                     >
//                       <div
//                         style={{
//                           display: "flex",
//                           alignItems: "flex-start",
//                           gap: "12px",
//                           marginBottom: "12px",
//                         }}
//                       >
//                         <img
//                           src={openBook}
//                           alt="Book"
//                           style={{
//                             width: "24px",
//                             height: "24px",
//                             objectFit: "contain",
//                             flexShrink: 0,
//                           }}
//                         />
//                         <div style={{ flex: 1 }}>
//                           <h4
//                             style={{
//                               margin: "0 0 4px 0",
//                               fontSize: "16px",
//                               fontWeight: 700,
//                               color: "#0F172A",
//                             }}
//                           >
//                             {schedule.mapel}
//                           </h4>
//                           <p
//                             style={{
//                               margin: "0",
//                               fontSize: "13px",
//                               color: "#64748B",
//                               fontWeight: 500,
//                             }}
//                           >
//                             {schedule.guru}
//                           </p>
//                         </div>
//                       </div>
//                       <div
//                         style={{
//                           display: "flex",
//                           alignItems: "center",
//                           gap: "8px",
//                           padding: "8px 12px",
//                           backgroundColor: "rgba(37, 99, 235, 0.1)",
//                           borderRadius: "8px",
//                           width: "fit-content",
//                         }}
//                       >
//                         <svg
//                           width="16"
//                           height="16"
//                           viewBox="0 0 24 24"
//                           fill="none"
//                           stroke="#2563EB"
//                           strokeWidth="2"
//                           strokeLinecap="round"
//                           strokeLinejoin="round"
//                         >
//                           <circle cx="12" cy="12" r="10" />
//                           <polyline points="12 6 12 12 16 14" />
//                         </svg>
//                         <span
//                           style={{
//                             fontSize: "13px",
//                             fontWeight: 600,
//                             color: "#2563EB",
//                           }}
//                         >
//                           {schedule.start} - {schedule.end}
//                         </span>
//                       </div>
//                     </div>
//                   ))}
//                 </div>
//               </div>

//               {/* Statistik Kehadiran Section */}
//               <div
//                 style={{
//                   background: "#0B2948",
//                   color: "#fff",
//                   borderRadius: "12px",
//                   padding: "16px 24px",
//                   fontWeight: 800,
//                   fontSize: "18px",
//                   boxShadow: "0 4px 12px rgba(11, 41, 72, 0.2)",
//                   textAlign: "center",
//                   cursor: "pointer",
//                   transition: "all 0.2s",
//                 }}
//                 onMouseEnter={(e) => {
//                   (e.currentTarget as HTMLDivElement).style.backgroundColor = "#0A2340";
//                 }}
//                 onMouseLeave={(e) => {
//                   (e.currentTarget as HTMLDivElement).style.backgroundColor = "#0B2948";
//                 }}
//               >
//                 Statistik Kehadiran
//               </div>

//               {/* Charts Grid */}
//               <div
//                 style={{
//                   display: "grid",
//                   gridTemplateColumns: "repeat(auto-fit, minmax(400px, 1fr))",
//                   gap: "24px",
//                   width: "100%",
//                 }}
//               >
//                 {/* Grafik Tren Bulanan */}
//                 <div
//                   style={{
//                     backgroundColor: "#FFFFFF",
//                     borderRadius: "16px",
//                     padding: "24px",
//                     boxShadow: "0 4px 12px rgba(15, 23, 42, 0.08)",
//                     border: "1px solid #E2E8F0",
//                   }}
//                 >
//                   <h3
//                     style={{
//                       margin: "0 0 8px 0",
//                       fontSize: "18px",
//                       fontWeight: 700,
//                       color: "#0F172A",
//                     }}
//                   >
//                     Grafik Tren Bulanan
//                   </h3>
//                   <MonthlyBarChart data={monthlyTrendData} />
//                 </div>

//                 {/* Statistik Minggu Ini */}
//                 <div
//                   style={{
//                     backgroundColor: "#FFFFFF",
//                     borderRadius: "16px",
//                     padding: "24px",
//                     boxShadow: "0 4px 12px rgba(15, 23, 42, 0.08)",
//                     border: "1px solid #E2E8F0",
//                   }}
//                 >
//                   <h3
//                     style={{
//                       margin: "0 0 8px 0",
//                       fontSize: "18px",
//                       fontWeight: 700,
//                       color: "#0F172A",
//                     }}
//                   >
//                     Statistik Minggu Ini
//                   </h3>
//                   <WeeklyDonutChart data={weeklyStats} />
//                 </div>
//               </div>
//             </div>

//             {/* Modal Jadwal Siswa */}
//             <JadwalSiswaModal
//               isOpen={isScheduleModalOpen}
//               onClose={() => {
//                 setIsScheduleModalOpen(false);
//                 setSelectedSchedule(null);
//               }}
//               data={selectedSchedule}
//             />
//           </SiswaLayout>
//         );
//     }
//   };

//   return renderPage();
// }

// // Monthly Bar Chart Component
// function MonthlyBarChart({
//   data,
// }: {
//   data: Array<{ month: string; hadir: number; izin: number; sakit: number; alpha: number }>;
// }) {
//   const maxValue = Math.max(
//     ...data.map((item) => Math.max(item.hadir, item.izin, item.sakit, item.alpha))
//   );

//   return (
//     <div style={{ position: "relative" }}>
//       {/* Y-axis labels */}
//       <div
//         style={{
//           position: "absolute",
//           left: 0,
//           top: 0,
//           bottom: "40px",
//           width: "30px",
//           display: "flex",
//           flexDirection: "column",
//           justifyContent: "space-between",
//           fontSize: "12px",
//           color: "#64748B",
//         }}
//       >
//         <span>60</span>
//         <span>40</span>
//         <span>20</span>
//         <span>0</span>
//       </div>

//       {/* Chart */}
//       <div
//         style={{
//           display: "flex",
//           alignItems: "flex-end",
//           gap: "12px",
//           height: "200px",
//           marginLeft: "40px",
//           marginBottom: "40px",
//           paddingTop: "20px",
//         }}
//       >
//         {data.map((item) => (
//           <div key={item.month} style={{ flex: 1, textAlign: "center" }}>
//             <div
//               style={{
//                 display: "flex",
//                 justifyContent: "center",
//                 alignItems: "flex-end",
//                 gap: "4px",
//                 height: "160px",
//               }}
//             >
//               <div
//                 style={{
//                   width: "18px",
//                   height: `${(item.hadir / maxValue) * 160}px`,
//                   borderRadius: "4px 4px 0 0",
//                   background: "#10B981",
//                 }}
//               />
//               <div
//                 style={{
//                   width: "18px",
//                   height: `${(item.izin / maxValue) * 160}px`,
//                   borderRadius: "4px 4px 0 0",
//                   background: "#F59E0B",
//                 }}
//               />
//               <div
//                 style={{
//                   width: "18px",
//                   height: `${(item.sakit / maxValue) * 160}px`,
//                   borderRadius: "4px 4px 0 0",
//                   background: "#3B82F6",
//                 }}
//               />
//               <div
//                 style={{
//                   width: "18px",
//                   height: `${(item.alpha / maxValue) * 160}px`,
//                   borderRadius: "4px 4px 0 0",
//                   background: "#EF4444",
//                 }}
//               />
//             </div>
//             <p style={{ margin: "8px 0 0", fontSize: "13px", color: "#475569" }}>
//               {item.month}
//             </p>
//           </div>
//         ))}
//       </div>

//       {/* Legend */}
//       <div
//         style={{
//           display: "flex",
//           gap: "16px",
//           justifyContent: "center",
//           flexWrap: "wrap",
//           marginTop: "16px",
//         }}
//       >
//         <LegendDot color="#10B981" label="Hadir" />
//         <LegendDot color="#F59E0B" label="Izin" />
//         <LegendDot color="#3B82F6" label="Sakit" />
//         <LegendDot color="#EF4444" label="Alpha" />
//       </div>
//     </div>
//   );
// }

// // Weekly Donut Chart Component
// function WeeklyDonutChart({
//   data,
// }: {
//   data: { hadir: number; izin: number; sakit: number; alpha: number };
// }) {
//   const total = data.hadir + data.izin + data.sakit + data.alpha;
//   const radius = 80;
//   const centerX = 100;
//   const centerY = 100;
//   let currentAngle = -90;

//   const colors = {
//     hadir: "#10B981",
//     izin: "#F59E0B",
//     sakit: "#3B82F6",
//     alpha: "#EF4444",
//   };

//   const segments = [
//     { key: "hadir", value: data.hadir, label: "Total Kehadiran" },
//     { key: "izin", value: data.izin, label: "Total Izin" },
//     { key: "sakit", value: data.sakit, label: "Total Sakit" },
//     { key: "alpha", value: data.alpha, label: "Total Alpha" },
//   ];

//   const createPath = (startAngle: number, endAngle: number) => {
//     const start = polarToCartesian(centerX, centerY, radius, endAngle);
//     const end = polarToCartesian(centerX, centerY, radius, startAngle);
//     const largeArcFlag = endAngle - startAngle <= 180 ? "0" : "1";

//     return [
//       "M",
//       centerX,
//       centerY,
//       "L",
//       start.x,
//       start.y,
//       "A",
//       radius,
//       radius,
//       0,
//       largeArcFlag,
//       0,
//       end.x,
//       end.y,
//       "Z",
//     ].join(" ");
//   };

//   const polarToCartesian = (
//     centerX: number,
//     centerY: number,
//     radius: number,
//     angleInDegrees: number
//   ) => {
//     const angleInRadians = ((angleInDegrees - 90) * Math.PI) / 180.0;
//     return {
//       x: centerX + radius * Math.cos(angleInRadians),
//       y: centerY + radius * Math.sin(angleInRadians),
//     };
//   };

//   return (
//     <div style={{ display: "flex", gap: "24px", alignItems: "center" }}>
//       {/* Donut Chart */}
//       <div style={{ position: "relative", flexShrink: 0 }}>
//         <svg width="200" height="200" style={{ display: "block" }}>
//           {segments.map((segment) => {
//             const angle = (segment.value / total) * 360;
//             const startAngle = currentAngle;
//             const endAngle = currentAngle + angle;
//             const path = createPath(startAngle, endAngle);
//             currentAngle = endAngle;

//             return (
//               <path
//                 key={segment.key}
//                 d={path}
//                 fill={colors[segment.key as keyof typeof colors]}
//                 stroke="#FFFFFF"
//                 strokeWidth="2"
//               />
//             );
//           })}
//         </svg>
//       </div>

//       {/* Legend */}
//       <div style={{ display: "flex", flexDirection: "column", gap: "12px", flex: 1 }}>
//         {segments.map((segment) => (
//           <div
//             key={segment.key}
//             style={{ display: "flex", alignItems: "center", gap: "8px" }}
//           >
//             <span
//               style={{
//                 width: "12px",
//                 height: "12px",
//                 borderRadius: "999px",
//                 backgroundColor: colors[segment.key as keyof typeof colors],
//                 display: "inline-block",
//               }}
//             />
//             <span style={{ fontSize: "14px", color: "#475569", fontWeight: 500 }}>
//               {segment.label} {segment.value}%
//             </span>
//           </div>
//         ))}
//       </div>
//     </div>
//   );
// }

// function LegendDot({ color, label }: { color: string; label: string }) {
//   return (
//     <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
//       <span
//         style={{
//           width: "12px",
//           height: "12px",
//           borderRadius: "999px",
//           backgroundColor: color,
//           display: "inline-block",
//         }}
//       />
//       <span style={{ fontSize: "13px", color: "#475569" }}>{label}</span>
//     </div>
//   );
// }

// // Modal Component untuk Siswa
// interface JadwalSiswaModalProps {
//   isOpen: boolean;
//   onClose: () => void;
//   data: ScheduleItem | null;
// }

// function JadwalSiswaModal({ isOpen, onClose, data }: JadwalSiswaModalProps) {
//   if (!data) return null;

//   return (
//     <Modal isOpen={isOpen} onClose={onClose}>
//       <div
//         style={{
//           border: "3px solid #1e40af",
//           borderRadius: "16px",
//           overflow: "hidden",
//         }}
//       >
//         <div
//           style={{
//             backgroundColor: "#0f172a",
//             color: "white",
//             padding: "16px 24px",
//             display: "flex",
//             justifyContent: "space-between",
//             alignItems: "center",
//           }}
//         >
//           <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
//             <img
//               src={openBook}
//               alt="Book"
//               style={{
//                 width: "24px",
//                 height: "24px",
//                 objectFit: "contain",
//                 filter: "brightness(0) invert(1)",
//               }}
//             />
//             <h2 style={{ fontSize: "18px", fontWeight: "bold", margin: 0 }}>
//               {data.mapel}
//             </h2>
//           </div>
//           <button
//             onClick={onClose}
//             style={{
//               background: "none",
//               border: "none",
//               color: "white",
//               fontSize: "24px",
//               cursor: "pointer",
//               padding: "0",
//               width: "32px",
//               height: "32px",
//               display: "flex",
//               alignItems: "center",
//               justifyContent: "center",
//             }}
//             type="button"
//           >
//             ×
//           </button>
//         </div>

//         <div style={{ padding: "24px", backgroundColor: "white" }}>
//           <div style={{ marginBottom: "24px" }}>
//             <h3
//               style={{
//                 fontSize: "16px",
//                 fontWeight: "bold",
//                 color: "#111827",
//                 marginBottom: "12px",
//               }}
//             >
//               Keterangan
//             </h3>
//             <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
//               <InfoRow label="Mata Pelajaran" value={data.mapel} />
//               <InfoRow label="Guru Pengajar" value={data.guru} />
//               <InfoRow label="Waktu" value={`${data.start} - ${data.end}`} />
//             </div>
//           </div>
//         </div>

//         <div
//           style={{
//             padding: "16px 24px",
//             backgroundColor: "white",
//             display: "flex",
//             justifyContent: "center",
//           }}
//         >
//           <button
//             type="button"
//             onClick={onClose}
//             style={{
//               padding: "12px 32px",
//               borderRadius: "8px",
//               border: "none",
//               backgroundColor: "#1e40af",
//               color: "white",
//               fontWeight: "600",
//               cursor: "pointer",
//               fontSize: "16px",
//               transition: "background-color 0.2s",
//             }}
//             onMouseEnter={(e) => {
//               (e.currentTarget as HTMLButtonElement).style.backgroundColor = "#1e3a8a";
//             }}
//             onMouseLeave={(e) => {
//               (e.currentTarget as HTMLButtonElement).style.backgroundColor = "#1e40af";
//             }}
//           >
//             Tutup
//           </button>
//         </div>
//       </div>
//     </Modal>
//   );
// }

// function InfoRow({ label, value }: { label: string; value: string }) {
//   return (
//     <div
//       style={{
//         display: "flex",
//         justifyContent: "space-between",
//         alignItems: "center",
//         gap: "12px",
//         background: "#F1F5F9",
//         borderRadius: "8px",
//         padding: "12px 16px",
//         border: "1px solid #E2E8F0",
//       }}
//     >
//       <span style={{ fontWeight: "600", color: "#0f172a", fontSize: "14px" }}>
//         {label}
//       </span>
//       <span style={{ color: "#0f172a", fontSize: "14px", fontWeight: "500" }}>
//         {value}
//       </span>
//     </div>
//   );
// }

// function TimePill({ label }: { label: string }) {
//   return (
//     <div
//       style={{
//         minWidth: "110px",
//         padding: "10px 14px",
//         borderRadius: "12px",
//         border: "1px solid #CBD5E1",
//         background: "#fff",
//         boxShadow: "inset 0 1px 2px rgba(15, 23, 42, 0.04)",
//         textAlign: "center",
//         fontWeight: 800,
//         fontSize: "14px",
//         color: "#0F172A",
//       }}
//     >
//       {label}
//     </div>
//   );
// }


