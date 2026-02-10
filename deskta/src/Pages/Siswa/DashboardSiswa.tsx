import { useState, useEffect } from "react";
import SiswaLayout, { type MenuKey } from "../../component/Siswa/SiswaLayout";
// import openBook from "../../assets/Icon/open-book.png";
import { Modal } from "../../component/Shared/Modal";
import JadwalSiswa from "./JadwalSiswa.tsx";
import AbsensiSiswa from "./AbsensiSiswa";
import logoSmk from "../../assets/Icon/logo smk.png";
import { usePopup } from "../../component/Shared/Popup/PopupProvider";
import QRScanButton from "../../component/Siswa/QRScanButton";
import {
  Bell,
  Megaphone,
  Clock,
  BookOpen,
  BookOpenCheck,
  BarChart3,
  TrendingUp,
  Target,
  ArrowRight,
  PieChart, // Re-adding because it is used
  AlarmClock, // Re-adding because it is used
} from "lucide-react";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  Filler,
} from "chart.js";
import { Doughnut } from "react-chartjs-2";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  Filler
);

type SiswaPage = MenuKey;

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

// Helper to format schedule from API
const formatScheduleFromAPI = (schedule: any): ScheduleItem => {
  const timeSlot = schedule.time_slot;
  return {
    id: schedule.id.toString(),
    mapel: schedule.subject?.name || 'Mata Pelajaran',
    guru: schedule.teacher?.name || 'Guru',
    start: timeSlot?.start_time || '00:00',
    end: timeSlot?.end_time || '00:00',
  };
};

export default function DashboardSiswa({ user, onLogout }: DashboardSiswaProps) {
  // const { alert: popupAlert } = usePopup();
  const [currentPage, setCurrentPage] = useState<SiswaPage>("dashboard");
  const [currentDate, setCurrentDate] = useState("");
  const [currentTime, setCurrentTime] = useState("");
  const [selectedSchedule, setSelectedSchedule] = useState<ScheduleItem | null>(null);
  const [isScheduleModalOpen, setIsScheduleModalOpen] = useState(false);

  // API Data State
  const [schedules, setSchedules] = useState<ScheduleItem[]>([]);
  const [isLoadingSchedules, setIsLoadingSchedules] = useState(true);
  const [attendanceSummary, setAttendanceSummary] = useState({
    hadir: 0,
    izin: 0,
    sakit: 0,
    alpha: 0,
    dispen: 0,
  });
  const [isLoadingAttendance, setIsLoadingAttendance] = useState(true);
  const [error, setError] = useState<string | null>(null);

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

      // Format waktu dengan jam:menit:detik
      const hours = String(now.getHours()).padStart(2, '0');
      const minutes = String(now.getMinutes()).padStart(2, '0');
      const seconds = String(now.getSeconds()).padStart(2, '0');
      setCurrentTime(`${hours}:${minutes}:${seconds}`);
    };

    updateDateTime();
    const interval = setInterval(updateDateTime, 1000);

    return () => clearInterval(interval);
  }, []);

  // Fetch schedules
  useEffect(() => {
    const fetchSchedules = async () => {
      try {
        setIsLoadingSchedules(true);
        setError(null);
        const { dashboardService } = await import('../../services/dashboard');
        const today = new Date().toISOString().split('T')[0];
        const data = await dashboardService.getMySchedules({ date: today });
        const formattedSchedules = data.map(formatScheduleFromAPI);
        setSchedules(formattedSchedules);
      } catch (error) {
        console.error('Failed to fetch schedules:', error);
        setError('Gagal memuat jadwal pelajaran.');
      } finally {
        setIsLoadingSchedules(false);
      }
    };
    fetchSchedules();
  }, []);

  // Fetch attendance summary
  useEffect(() => {
    const fetchAttendance = async () => {
      try {
        setIsLoadingAttendance(true);
        const { dashboardService } = await import('../../services/dashboard');
        const data = await dashboardService.getMyAttendanceSummary();
        setAttendanceSummary({
          hadir: data.present || 0,
          izin: data.excused || 0,
          sakit: data.sick || 0,
          alpha: data.absent || 0,
          dispen: (data as any).dispensation || 0,
        });
      } catch (error) {
        console.error('Failed to fetch attendance:', error);
        setError((prev) => prev || 'Gagal memuat ringkasan kehadiran.');
      } finally {
        setIsLoadingAttendance(false);
      }
    };
    fetchAttendance();
  }, []);

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

  // User info
  const userInfo = {
    name: user.name || "-",
    id: user.phone || "-", // Assuming phone is used as ID/NISN temporarily or passed prop
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
              {/* Error Alert */}
              {error && (
                <div style={{
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
                  <Megaphone size={20} />
                  <span>{error}</span>
                </div>
              )}

              {/* Welcome Section */}
              <div style={{
                backgroundColor: "white",
                borderRadius: "16px",
                padding: "28px 32px",
                boxShadow: "0 4px 20px rgba(0, 31, 62, 0.08)",
                border: "1px solid #E5E7EB",
                opacity: isLoadingSchedules || isLoadingAttendance ? 0.7 : 1,
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
                        {currentTime || "00:00:00"}
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
                  backgroundColor: "#001F3F",
                  borderRadius: "16px",
                  padding: "24px",
                  boxShadow: "0 4px 20px rgba(0, 31, 63, 0.2)",
                  border: "1px solid #001F3F",
                  display: "flex",
                  alignItems: "center",
                  gap: "20px",
                  transition: "all 0.3s ease",
                  cursor: "pointer",
                }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = "translateY(-4px)";
                    e.currentTarget.style.boxShadow = "0 8px 30px rgba(0, 31, 63, 0.3)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = "translateY(0)";
                    e.currentTarget.style.boxShadow = "0 4px 20px rgba(0, 31, 63, 0.2)";
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
                    color: "white",
                    overflow: "hidden"
                  }}>
                    <img src={logoSmk} alt="Logo SMK" style={{ width: "48px", height: "48px", objectFit: "contain" }} />
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
                      {isLoadingSchedules ? 'Memuat...' : `${schedules.length} mata pelajaran dijadwalkan`}
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
                  {isLoadingSchedules ? (
                    <div style={{ textAlign: 'center', padding: '40px', color: '#6B7280', gridColumn: '1 / -1' }}>
                      Memuat jadwal...
                    </div>
                  ) : schedules.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '40px', color: '#6B7280', gridColumn: '1 / -1' }}>
                      Tidak ada jadwal hari ini
                    </div>
                  ) : (
                    schedules.map((schedule) => (
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
                    ))
                  )}
                </div>
              </div>

              {/* Statistics Section */}
              <div style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(450px, 1fr))",
                gap: "24px",
                width: "100%",
              }}>
                {/* Monthly Trend Chart - CHANGED TO LINE CHART */}
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
                      Grafik Kehadiran Bulanan
                    </h3>
                  </div>
                  {isLoadingAttendance ? (
                    <div style={{ textAlign: 'center', padding: '40px', color: '#6B7280' }}>
                      Memuat data kehadiran...
                    </div>
                  ) : (
                    <WeeklyDonutChart data={attendanceSummary} />
                  )}
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
                  {isLoadingAttendance ? (
                    <div style={{ textAlign: 'center', padding: '40px', color: '#6B7280' }}>
                      Memuat data kehadiran...
                    </div>
                  ) : (
                    <WeeklyDonutChart data={attendanceSummary} />
                  )}
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
            {/* QR Scan Button - Floating Action Button */}
            {currentPage === "dashboard" && (
              <QRScanButton onSuccess={() => {
                // Refresh attendance data after successful scan
                window.location.reload();
              }} />
            )}
          </SiswaLayout>
        );
    }
  };

  return renderPage();
}

// Monthly Line Chart Component - KOMPONEN BARU DENGAN GRAFIK GARIS
// Unused component removed





// Weekly Donut Chart Component
function WeeklyDonutChart({
  data,
}: {
  data: { hadir: number; izin: number; sakit: number; alpha: number; dispen: number };
}) {
  const chartData = {
    labels: ["Hadir", "Izin", "Sakit", "Tidak Hadir", "Pulang"], // Mengganti Dispen dengan Pulang
    datasets: [
      {
        data: [data.hadir, data.izin, data.sakit, data.alpha, data.dispen],
        backgroundColor: [
          "#1FA83D", // REVISI: Hadir > #1FA83D
          "#ACA40D", // REVISI: Izin > #ACA40D
          "#520C8F", // REVISI: Sakit > #520C8F
          "#D90000", // REVISI: Tidak Hadir > #D90000
          "#2F85EB", // REVISI: Pulang > #2F85EB
        ],
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
                const percentage = Math.round((value / total) * 100);

                return {
                  text: `${label} (${percentage}%)`,
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
  const { alert: popupAlert } = usePopup();
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
            onClick={async () => {
              await popupAlert("Pengingat ditambahkan!");
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

