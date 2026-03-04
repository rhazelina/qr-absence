import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { scheduleService, normalizeScheduleDay } from "../../services/scheduleService";
import { attendanceService } from "../../services/attendanceService";
import { authService } from "../../services/authService";
import { dashboardService } from "../../services/dashboardService";
import GuruLayout from "../../component/Guru/GuruLayout";
import DetailJadwalGuru from "./DetailJadwalGuru";
import InputAbsenGuru from "./InputManualGuru";
import KehadiranSiswaGuru from "./KehadiranSiswaGuru";
import BookIcon from "../../assets/Icon/open-book.png";
import EyeIcon from "../../assets/Icon/Eye.png";
import QRCodeIcon from "../../assets/Icon/qr_code.png";
import { JadwalModal } from "../../component/Shared/Form/Jadwal";
import { Modal } from "../../component/Shared/Modal";
import { MetodeGuru } from "../../component/Shared/Form/MetodeGuru";
import { TidakBisaMengajar } from "../../component/Shared/Form/TidakBisaMengajar";
import { CameraScanner } from "../../component/Shared/CameraScanner";


// Icon Components
function CalendarIconSVG() {
  return (
    <svg
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
      <line x1="16" y1="2" x2="16" y2="6" />
      <line x1="8" y1="2" x2="8" y2="6" />
      <line x1="3" y1="10" x2="21" y2="10" />
    </svg>
  );
}

function ClockIconSVG() {
  return (
    <svg
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="12" cy="12" r="10" />
      <polyline points="12 6 12 12 16 14" />
    </svg>
  );
}

// ==================== INTERFACES ====================
interface DashboardGuruProps {
  user: { name: string; role: string; phone?: string; nip?: string };
  onLogout: () => void;
}

type GuruPage =
  | "dashboard"
  | "jadwal"
  | "jadwal-anda"
  | "kehadiran"
  | "input-manual";

type ModalType = "schedule" | "metode" | "tidakBisa" | null;

interface ScheduleItem {
  id: string;
  subject: string;
  className: string;
  jurusan?: string;
  jam?: string;
  start_time?: string;
  end_time?: string;
  room?: string;
}

interface TeacherDashboardData {
  school_hours?: {
    start_time?: string;
    end_time?: string;
  };
}

const BREAKPOINTS = {
  mobile: 768,
  tablet: 1024,
  desktop: 1400,
};

// ==================== STYLES ==================== //
const styles = {
  // Container Styles
  mainContainer: (isMobile: boolean) => ({
    position: "relative" as const,
    zIndex: 2,
    display: "flex",
    flexDirection: "column" as const,
    gap: 24,
    maxWidth: "1400px",
    margin: "0 auto",
    width: "100%",
    backgroundColor: "#F9FAFB",
    padding: isMobile ? "12px" : "16px",
  }),

  topGrid: (isMobile: boolean) => ({
    display: "grid",
    gridTemplateColumns: isMobile
      ? "1fr"
      : "repeat(auto-fit, minmax(280px, 1fr))",
    gap: 16,
    width: "100%",
    alignItems: "stretch",
  }),

  scheduleGrid: (isMobile: boolean) => ({
    display: "flex",
    flexDirection: "column" as const,
    gap: 16,
    padding: "16px 0",
    alignItems: "center",
    width: isMobile ? "100%" : "75%",
    margin: "0 auto",
  }),

  // Card  Stylingnya //

  // User Info Card
  userCard: (isMobile: boolean) => ({
    backgroundColor: "#0B2948",
    borderRadius: 16,
    padding: isMobile ? "20px" : "24px",
    display: "flex",
    alignItems: "center",
    gap: 16,
    boxShadow: "0 4px 12px rgba(11, 41, 72, 0.2)",
    position: "relative" as const,
    overflow: "hidden" as const,
    minHeight: isMobile ? "auto" : "120px",
  }),

  decorativeCircle: {
    position: "absolute" as const,
    top: -30,
    right: -30,
    width: 120,
    height: 120,
    borderRadius: "50%",
    backgroundColor: "rgba(255, 255, 255, 0.05)",
    zIndex: 0,
  },

  userIcon: (isMobile: boolean) => ({
    width: isMobile ? "48px" : "56px",
    height: isMobile ? "48px" : "56px",
    borderRadius: "50%",
    backgroundColor: "rgba(255, 255, 255, 0.15)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
    position: "relative" as const,
    zIndex: 1,
  }),

  // Date & Time Card
  iconWrapper: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },

  totalMengajarCard: (isMobile: boolean) => ({
    backgroundColor: "#0B2948",
    borderRadius: 16,
    padding: isMobile ? "20px" : "24px",
    boxShadow: "0 4px 12px rgba(11, 41, 72, 0.2)",
    border: "1px solid #0B2948",
    display: "flex",
    flexDirection: "column" as const,
    justifyContent: "space-between",
    minHeight: isMobile ? "auto" : "120px",
    color: "#FFFFFF",
  }),

  totalBadge: (isMobile: boolean) => ({
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: "12px 20px",
    fontSize: isMobile ? "16px" : "18px",
    fontWeight: 700,
    color: "#0B2948",
    textAlign: "center" as const,
    boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
  }),

  titleSection: (isMobile: boolean) => ({
    width: isMobile ? "100%" : "75%",
    backgroundColor: "#0B2948",
    color: "#FFFFFF",
    borderRadius: 12,
    padding: isMobile ? "12px 16px" : "14px 20px",
    fontSize: isMobile ? "16px" : "18px",
    fontWeight: 800,
    margin: "0 auto",
    marginBottom: 0,
    boxShadow: "0 6px 16px rgba(11, 41, 72, 0.35)",
    textAlign: "center" as const,
  }),

  scheduleCard: (isMobile: boolean) => ({
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: isMobile ? "16px" : "18px 24px",
    display: "flex",
    alignItems: "center",
    gap: 14,
    border: "1px solid #D1D5DB",
    boxShadow: "0 2px 8px rgba(0, 0, 0, 0.08)",
    position: "relative" as const,
    transition: "all 0.2s ease",
    cursor: "default",
    width: "100%",
    maxWidth: "100%",
  }),

  bookIconWrapper: (isMobile: boolean) => ({
    width: isMobile ? "40px" : "44px",
    height: isMobile ? "40px" : "44px",
    borderRadius: 10,
    background: "linear-gradient(135deg, #2563EB 0%, #1E40AF 100%)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
    boxShadow: "0 2px 8px rgba(37, 99, 235, 0.3)",
  }),

  actionButton: {
    width: 36,
    height: 36,
    borderRadius: 8,
    backgroundColor: "#F3F4F6",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    cursor: "pointer",
    transition: "all 0.2s",
    border: "1px solid #E5E7EB",
  },

  // Coming Soon
  comingSoon: {
    backgroundColor: "white",
    borderRadius: "8px",
    boxShadow: "0 1px 3px rgba(0, 0, 0, 0.1)",
    padding: "48px 24px",
    textAlign: "center" as const,
  },
};

// ==================== MAIN COMPONENT ====================
export default function DashboardGuru({ user, onLogout }: DashboardGuruProps) {
  // ========== STATE ==========
  const [currentPage, setCurrentPage] = useState<GuruPage>("dashboard");
  const [selectedSchedule, setSelectedSchedule] = useState<ScheduleItem | null>(
    null
  );

  const [todaySchedule, setTodaySchedule] = useState<ScheduleItem[]>([]);
  const [tomorrowSchedule, setTomorrowSchedule] = useState<ScheduleItem[]>([]);
  const [teacherProfile, setTeacherProfile] = useState<any>(null);
  const [teacherDashboard, setTeacherDashboard] = useState<TeacherDashboardData | null>(null);
  const [loadingSchedule, setLoadingSchedule] = useState(true);

  const [activeModal, setActiveModal] = useState<ModalType>(null);
  const [isMobile, setIsMobile] = useState(
    window.innerWidth < BREAKPOINTS.mobile
  );
  const navigate = useNavigate();

  const [currentDateStr, setCurrentDateStr] = useState("");
  const [currentTimeStr, setCurrentTimeStr] = useState("");

  const [iconStates, setIconStates] = useState<Record<string, "qr" | "eye">>({});
  const [isScanning, setIsScanning] = useState(false);
  const [isQrModalOpen, setIsQrModalOpen] = useState(false);
  const [isScheduleImageModalOpen, setIsScheduleImageModalOpen] = useState(false);
  const [isCameraBlocked, setIsCameraBlocked] = useState(false);
  const [qrScanHint, setQrScanHint] = useState("");

  const toMinutes = (time?: string): number | null => {
    if (!time) return null;
    const [hourRaw, minuteRaw] = time.substring(0, 5).split(":");
    const hour = Number(hourRaw);
    const minute = Number(minuteRaw);
    if (Number.isNaN(hour) || Number.isNaN(minute)) return null;
    return hour * 60 + minute;
  };

  const isScanWindowOpen = (schedule: ScheduleItem): boolean => {
    return Boolean(schedule?.start_time && schedule?.end_time);
  };

  const getScanWindowLabel = (schedule: ScheduleItem): string => {
    const startMinutes = toMinutes(schedule.start_time);
    const endMinutes = toMinutes(schedule.end_time);
    if (startMinutes === null || endMinutes === null) {
      return "Waktu jadwal tidak valid";
    }
    if (isScanWindowOpen(schedule)) {
      return "Scan aktif";
    }
    return "Scan aktif";
  };

  const activeSchedule = useMemo(() => {
    return todaySchedule.find((s) => isScanWindowOpen(s));
  }, [todaySchedule, currentTimeStr]);

  const mapScheduleItems = (items: any[]): ScheduleItem[] =>
    items.map((item: any) => ({
      id: item.id.toString(),
      subject: item.subject,
      className: item.class,
      jurusan: item.class,
      jam: `${item.start_time?.substring(0, 5)} - ${item.end_time?.substring(0, 5)}`,
      start_time: item.start_time,
      end_time: item.end_time,
      room: item.room
    }));

  // ========== EFFECTS ==========
  useEffect(() => {
    const updateDateTime = () => {
      const now = new Date();
      const options: Intl.DateTimeFormatOptions = {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
      };
      setCurrentDateStr(now.toLocaleDateString("id-ID", options));
      setCurrentTimeStr(
        now.toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit", second: "2-digit" })
      );
    };

    updateDateTime();
    const interval = setInterval(updateDateTime, 1000);

    const handleResize = () =>
      setIsMobile(window.innerWidth < BREAKPOINTS.mobile);
    window.addEventListener("resize", handleResize);

    // Fetch Teacher Profile and Schedule
    fetchTeacherProfile();
    fetchTeacherDashboard();
    fetchSchedule();

    return () => {
      clearInterval(interval);
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  const fetchTeacherProfile = async () => {
    try {
      const response = await authService.me();
      // /teachers/{id} can be forbidden for teacher role, so use /me payload directly.
      if (response && response.user_type === 'teacher') {
        const withCacheBuster = (url?: string | null) => {
          if (!url) return url || null;
          if (url.includes("t=") || url.includes("v=")) return url;
          return `${url}${url.includes("?") ? "&" : "?"}t=${Date.now()}`;
        };
        setTeacherProfile({
          id: response.id,
          name: response.name,
          ...response.profile,
          schedule_image_url: withCacheBuster((response.profile as any)?.schedule_image_url || null),
        });
      }
    } catch (error) {
      console.error("Error fetching teacher profile:", error);
    }
  };

  const fetchTeacherDashboard = async () => {
    try {
      const data = await dashboardService.getTeacherDashboard();
      setTeacherDashboard(data || null);
    } catch (error) {
      console.error("Error fetching teacher dashboard:", error);
    }
  };

  const fetchSchedule = async () => {
    setLoadingSchedule(true);
    try {
      const [todayResponse, fullResponse] = await Promise.all([
        scheduleService.getMyTodaySchedule(),
        scheduleService.getMySchedule(),
      ]);

      const todayItems = todayResponse.items || [];
      const allItems = fullResponse.items || [];

      const now = new Date();
      const tomorrow = new Date(now);
      tomorrow.setDate(now.getDate() + 1);
      const tomorrowName = normalizeScheduleDay(
        tomorrow.toLocaleDateString("en-US", { weekday: "long" })
      );

      const tomorrowItems = allItems.filter(
        (item: any) => normalizeScheduleDay(item.day) === tomorrowName
      );

      setTodaySchedule(mapScheduleItems(todayItems));
      setTomorrowSchedule(mapScheduleItems(tomorrowItems));
    } catch (error) {
      console.error("Error fetching schedule:", error);
    } finally {
      setLoadingSchedule(false);
    }
  };

  // ========== NAVIGATION HANDLERS ==========
  const handleMenuClick = (page: string) => setCurrentPage(page as GuruPage);

  const handleLogoutClick = () => {
    if (window.confirm("Apakah Anda yakin ingin keluar?")) {
      onLogout();
      navigate("/");
    }
  };

  // ========== SCHEDULE HANDLERS ==========

  const handleActionClick = (e: React.MouseEvent, schedule: ScheduleItem) => {
    e.stopPropagation();
    if (!isScanWindowOpen(schedule)) {
      alert(getScanWindowLabel(schedule));
      return;
    }
    setSelectedSchedule(schedule);
    setIconStates((prev) => ({ ...prev, [schedule.id]: "eye" }));
    setIsCameraBlocked(false);
    setQrScanHint("");
    setIsQrModalOpen(true);
  };

  // ========== MODAL HANDLERS ==========
  const handleMulaiAbsen = () => {
    setActiveModal(null);
    setCurrentPage("input-manual");
  };

  const handleTidakBisaMengajar = () => {
    setActiveModal("tidakBisa");
  };

  const handlePilihMetodeDariTidakBisaMengajar = () => {
    setActiveModal("metode");
  };

  const handlePilihQR = () => {
    setActiveModal(null);
    setIsCameraBlocked(false);
    setQrScanHint("");
    setIsQrModalOpen(true);
  };

  const handlePilihManual = () => {
    setActiveModal(null);
    setCurrentPage("input-manual");
  };

  const closeQrModal = () => {
    setIsQrModalOpen(false);
    setIsCameraBlocked(false);
    setQrScanHint("");
    if (selectedSchedule) {
      setIconStates((prev) => ({ ...prev, [selectedSchedule.id]: "qr" }));
    }
  };

  const handleFallbackToManual = () => {
    closeQrModal();
    setCurrentPage("input-manual");
  };

  const handleSubmitTidakBisaMengajar = (data: {
    alasan: string;
    keterangan?: string;
    foto1?: File;
  }) => {
    console.log("Data tidak bisa mengajar:", data);
    alert(
      `Laporan berhasil dikirim!\nAlasan: ${data.alasan}\nKeterangan: ${data.keterangan || "-"
      }\nFoto: ${data.foto1 ? "Ada" : "Tidak ada"}`
    );
    setActiveModal(null);
  };

  const extractTokenFromScan = (text: string): string => {
    const raw = String(text || "").trim();
    if (!raw) return "";

    try {
      const parsed = JSON.parse(raw);
      if (parsed?.token) {
        return String(parsed.token);
      }
    } catch {
      // Fallback to raw string token
    }

    return raw;
  };

  const handleScanSuccess = async (text: string) => {
    if (!selectedSchedule || isScanning) return;

    const token = extractTokenFromScan(text);
    if (!token) {
      alert("QR tidak valid. Silakan scan ulang QR dari pengurus kelas.");
      return;
    }

    setIsScanning(true);

    try {
      const response = await attendanceService.scanQrToken(token);
      alert(response?.message || "Berhasil mencatat kehadiran guru.");
      setQrScanHint("");
      setIsQrModalOpen(false);
      setIconStates((prev) => ({ ...prev, [selectedSchedule.id]: "qr" }));
      setCurrentPage("kehadiran");
    } catch (error: any) {
      const errorMessage = error?.status === 400
        ? "Anda berada di luar radius lokasi sekolah. Gunakan mode manual jika diperlukan."
        : error?.status === 403
          ? "Token QR sudah kadaluarsa. Minta pengurus kelas membuat QR baru."
          : error?.status === 409
            ? "Presensi sudah tercatat."
            : error?.message || "Gagal scan QR pengurus kelas.";
      setQrScanHint(errorMessage);
      alert(errorMessage);
    } finally {
      setIsScanning(false);
    }
  };

  // ========== RENDER PAGES ==========
  const renderPage = () => {
    switch (currentPage) {
      case "jadwal":
        return (
          <KehadiranSiswaGuru
            user={user}
            onLogout={handleLogoutClick}
            currentPage={currentPage}
            onMenuClick={handleMenuClick}
            schedule={selectedSchedule}
          />
        );
      case "input-manual":
        return (
          <InputAbsenGuru
            user={user}
            onLogout={handleLogoutClick}
            currentPage={currentPage}
            onMenuClick={handleMenuClick}
          />
        );
      case "jadwal-anda":
        return (
          <DetailJadwalGuru
            user={user}
            onLogout={handleLogoutClick}
            currentPage={currentPage}
            onMenuClick={handleMenuClick}
          />
        );
      case "kehadiran":
        return (
          <KehadiranSiswaGuru
            user={user}
            onLogout={handleLogoutClick}
            currentPage={currentPage}
            onMenuClick={handleMenuClick}
            schedule={selectedSchedule}
          />
        );
      case "dashboard":
      default:
        return (
          <GuruLayout
            pageTitle="Beranda"
            currentPage={currentPage}
            onMenuClick={handleMenuClick}
            user={user}
            onLogout={handleLogoutClick}
          >
            <div style={styles.mainContainer(isMobile)}>
              {/* ========== ACTIVE SESSION SECTION ========== */}
              {activeSchedule && (
                <div style={{
                  width: isMobile ? "100%" : "75%",
                  margin: "0 auto",
                  background: "linear-gradient(135deg, #1e40af 0%, #1e3a8a 100%)",
                  borderRadius: "16px",
                  padding: "20px",
                  color: "white",
                  display: "flex",
                  flexDirection: isMobile ? "column" : "row",
                  alignItems: "center",
                  justifyContent: "space-between",
                  gap: "16px",
                  boxShadow: "0 10px 15px -3px rgba(30, 64, 175, 0.4)",
                  marginTop: "8px"
                }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "4px" }}>
                      <div className="active-pulse" style={{ width: "8px", height: "8px", borderRadius: "50%", backgroundColor: "#10B981" }}></div>
                      <span style={{ fontSize: "10px", fontWeight: "800", textTransform: "uppercase", letterSpacing: "1px", opacity: 0.9 }}>Sedang Berlangsung</span>
                    </div>
                    <h3 style={{ margin: 0, fontSize: "18px", fontWeight: "800" }}>{activeSchedule.subject}</h3>
                    <p style={{ margin: 0, fontSize: "14px", opacity: 0.85 }}>{activeSchedule.className} • {activeSchedule.jam}</p>
                  </div>
                  <button
                    onClick={(e) => handleActionClick(e, activeSchedule)}
                    style={{
                      padding: "12px 24px",
                      backgroundColor: "white",
                      color: "#1e40af",
                      border: "none",
                      borderRadius: "10px",
                      fontWeight: "800",
                      fontSize: "14px",
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      gap: "8px",
                      boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
                      whiteSpace: "nowrap"
                    }}
                  >
                    <img src={QRCodeIcon} alt="" style={{ width: "18px", height: "18px" }} />
                    Scan Presensi
                  </button>
                </div>
              )}

              {/* ========== TOP SECTION ========== */}
              <div style={styles.topGrid(isMobile)}>
                {/* User Info Card */}
                <div style={styles.userCard(isMobile)}>
                  <div style={styles.decorativeCircle} />
                  <div style={styles.userIcon(isMobile)}>
                    <svg
                      width={isMobile ? "28" : "32"}
                      height={isMobile ? "28" : "32"}
                      viewBox="0 0 24 24"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        d="M12 12C14.7614 12 17 9.76142 17 7C17 4.23858 14.7614 2 12 2C9.23858 2 7 4.23858 7 7C7 9.76142 9.23858 12 12 12Z"
                        stroke="white"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                      <path
                        d="M20.59 22C20.59 18.13 16.74 15 12 15C7.26 15 3.41 18.13 3.41 22"
                        stroke="white"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </div>
                  <div
                    style={{
                      flex: 1,
                      minWidth: 0,
                      position: "relative",
                      zIndex: 1,
                    }}
                  >
                    <div
                      style={{
                        fontSize: isMobile ? "16px" : "18px",
                        fontWeight: 700,
                        color: "#FFFFFF",
                        marginBottom: 4,
                        whiteSpace: "nowrap",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                      }}
                    >
                      {user.name || "Guru"}
                    </div>
                    <div
                      style={{
                        fontSize: isMobile ? "13px" : "14px",
                        color: "rgba(255, 255, 255, 0.85)",
                        fontWeight: 500,
                        whiteSpace: "nowrap",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                      }}
                    >
                      {user.role === "guru" ? (user.phone || "-") : "ID User"}
                    </div>
                  </div>
                </div>

                {/* Date & Time Card - Same as Siswa */}
                <div
                  style={{
                    background: "#0B2948",
                    borderRadius: "16px",
                    padding: isMobile ? "20px" : "24px",
                    color: "white",
                    position: "relative",
                    overflow: "hidden",
                    boxShadow: "0 4px 12px rgba(11, 41, 72, 0.2)",
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "center",
                    gap: "12px",
                    minHeight: isMobile ? "auto" : "120px",
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                    <div style={{ opacity: 0.8 }}>
                      <CalendarIconSVG />
                    </div>
                    <span style={{ fontSize: "16px", fontWeight: "600" }}>
                      {currentDateStr || "Memuat..."}
                    </span>
                  </div>

                  <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                    <div style={{ opacity: 0.8 }}>
                      <ClockIconSVG />
                    </div>
                    <span
                      style={{
                        fontSize: "20px",
                        fontWeight: "700",
                        letterSpacing: "1px",
                      }}
                    >
                      {currentTimeStr || "00:00:00"}
                    </span>
                  </div>

                  <div
                    style={{
                      marginTop: "4px",
                      paddingTop: "12px",
                      borderTop: "1px solid rgba(255,255,255,0.1)",
                      fontSize: "14px",
                      fontWeight: "500",
                      opacity: 0.9,
                    }}
                  >
                    Jam Sekolah {teacherDashboard?.school_hours?.start_time || "07:00"} - {teacherDashboard?.school_hours?.end_time || "15:00"}
                  </div>
                </div>

                {/* Total Mengajar Card */}
                <div style={styles.totalMengajarCard(isMobile)}>
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 12,
                      marginBottom: 12,
                    }}
                  >
                    <div style={styles.iconWrapper}>
                      <img
                        src={BookIcon}
                        alt="Book"
                        style={{
                          width: 20,
                          height: 20,
                          filter: "brightness(0) invert(1)"
                        }}
                      />
                    </div>
                    <div
                      style={{
                        fontSize: isMobile ? "13px" : "14px",
                        color: "#FFFFFF",
                        fontWeight: 600,
                        flex: 1,
                      }}
                    >
                      Total Mengajar Hari Ini
                    </div>
                  </div>
                  <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
                    <div style={{ ...styles.totalBadge(isMobile), flex: 1 }}>
                      {todaySchedule.length} Kelas
                    </div>
                    <button
                      disabled={!teacherProfile?.schedule_image_url}
                      onClick={() => setIsScheduleImageModalOpen(true)}
                      style={{
                        backgroundColor: teacherProfile?.schedule_image_url ? "#FFFFFF" : "#9CA3AF",
                        borderRadius: 12,
                        padding: "12px 14px",
                        fontSize: isMobile ? "13px" : "14px",
                        fontWeight: 700,
                        color: "#0B2948",
                        cursor: teacherProfile?.schedule_image_url ? "pointer" : "not-allowed",
                        boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
                        border: "none",
                        display: "flex",
                        alignItems: "center",
                        gap: "6px"
                      }}
                    >
                      <img src={EyeIcon} alt="" style={{ width: 16, height: 16 }} />
                      Jadwal
                    </button>
                  </div>
                </div>
              </div>


              {/* ========== JADWAL TITLE ========== */}
              <div style={styles.titleSection(isMobile)}>Jadwal Hari Ini</div>

              {/* ========== SCHEDULE GRID ========== */}
              <div style={styles.scheduleGrid(isMobile)}>
                {loadingSchedule ? (
                  <div style={{ textAlign: "center", padding: 20, color: "#6B7280" }}>Memuat jadwal...</div>
                ) : todaySchedule.length === 0 ? (
                  <div style={{ textAlign: "center", padding: 20, color: "#6B7280" }}>Tidak ada jadwal mengajar hari ini.</div>
                ) : (
                  todaySchedule.map((schedule) => {
                    const canScan = isScanWindowOpen(schedule);
                    // const jamParts = schedule.jam?.split("(") || [];
                    // const jamKe = jamParts[0]?.trim() || schedule.jam;
                    // const jamWaktu = jamParts.length > 1 ? `(${jamParts[1]}` : "";

                    return (
                      <div
                        key={schedule.id}
                        style={styles.scheduleCard(isMobile)}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.boxShadow =
                            "0 6px 14px rgba(0, 0, 0, 0.15)";
                          e.currentTarget.style.transform = "translateY(-2px)";
                          e.currentTarget.style.backgroundColor = "#F9FAFB";
                          e.currentTarget.style.borderColor = "#9CA3AF";
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.boxShadow =
                            "0 2px 8px rgba(0, 0, 0, 0.08)";
                          e.currentTarget.style.transform = "translateY(0)";
                          e.currentTarget.style.backgroundColor = "#FFFFFF";
                          e.currentTarget.style.borderColor = "#D1D5DB";
                        }}
                      >
                        {/* Icon Buku */}
                        <div style={styles.bookIconWrapper(isMobile)}>
                          <img
                            src={BookIcon}
                            alt="Book"
                            style={{
                              width: isMobile ? "18px" : "20px",
                              height: isMobile ? "18px" : "20px",
                              objectFit: "contain",
                              filter: "brightness(0) invert(1)",
                            }}
                          />
                        </div>

                        {/* Mata Pelajaran & Jam */}
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div
                            style={{
                              fontSize: isMobile ? "15px" : "16px",
                              fontWeight: 700,
                              color: "#111827",
                              marginBottom: 4,
                              whiteSpace: "nowrap",
                              overflow: "hidden",
                              textOverflow: "ellipsis",
                            }}
                          >
                            {schedule.subject}
                          </div>
                          <div
                            style={{
                              fontSize: isMobile ? "12px" : "13px",
                              color: "#6B7280",
                              fontWeight: 500,
                              whiteSpace: "nowrap",
                              overflow: "hidden",
                              textOverflow: "ellipsis",
                            }}
                          >
                            {schedule.jam} <br />
                            Ruang: {schedule.room || "-"}
                          </div>
                          <div
                            style={{
                              fontSize: 11,
                              marginTop: 4,
                              color: canScan ? "#059669" : "#DC2626",
                              fontWeight: 700,
                            }}
                          >
                            {canScan ? "Scan aktif sekarang" : "Scan belum aktif"}
                          </div>
                        </div>

                        {/* Kelas & Waktu */}
                        <div
                          style={{
                            flex: 1,
                            textAlign: "left",
                            paddingLeft: "24px",
                            display: isMobile ? "none" : "block",
                          }}
                        >
                          <div
                            style={{
                              fontSize: isMobile ? "14px" : "15px",
                              fontWeight: 700,
                              color: "#111827",
                              marginBottom: 4,
                            }}
                          >
                            {schedule.className}
                          </div>
                        </div>

                        {/* Action Buttons */}
                        <div
                          style={{
                            display: "flex",
                            gap: 8,
                            alignItems: "center",
                            flexShrink: 0,
                          }}
                        >
                          {/* Toggle Button */}
                          <button
                            type="button"
                            onClick={(e) => handleActionClick(e, schedule)}
                            disabled={!canScan}
                            title={getScanWindowLabel(schedule)}
                            style={{
                              ...styles.actionButton,
                              opacity: canScan ? 1 : 0.45,
                              cursor: canScan ? "pointer" : "not-allowed",
                            }}
                            onMouseEnter={(e) => {
                              if (!canScan) return;
                              e.currentTarget.style.backgroundColor = "#E5E7EB";
                              e.currentTarget.style.transform = "scale(1.05)";
                            }}
                            onMouseLeave={(e) => {
                              if (!canScan) return;
                              e.currentTarget.style.backgroundColor = "#F3F4F6";
                              e.currentTarget.style.transform = "scale(1)";
                            }}
                          >
                            <img
                              src={
                                (iconStates[schedule.id] || "qr") === "qr"
                                  ? QRCodeIcon
                                  : EyeIcon
                              }
                              alt="Toggle Mode"
                              style={{
                                width: 20,
                                height: 20,
                                objectFit: "contain",
                              }}
                            />
                          </button>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>

              {/* ========== TOMORROW SCHEDULE ========== */}
              {tomorrowSchedule.length > 0 && (
                <>
                  <div style={{ ...styles.titleSection(isMobile), marginTop: 32, backgroundColor: "#374151" }}>Jadwal Besok</div>
                  <div style={styles.scheduleGrid(isMobile)}>
                    {tomorrowSchedule.map((schedule) => (
                      <div
                        key={`tomorrow-${schedule.id}`}
                        style={{ ...styles.scheduleCard(isMobile), opacity: 0.85, backgroundColor: "#F9FAFB" }}
                      >
                        <div style={{ ...styles.bookIconWrapper(isMobile), background: "linear-gradient(135deg, #6B7280 0%, #374151 100%)" }}>
                          <img
                            src={BookIcon}
                            alt="Book"
                            style={{
                              width: isMobile ? "18px" : "20px",
                              height: isMobile ? "18px" : "20px",
                              objectFit: "contain",
                              filter: "brightness(0) invert(1)",
                            }}
                          />
                        </div>

                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div
                            style={{
                              fontSize: isMobile ? "15px" : "16px",
                              fontWeight: 700,
                              color: "#111827",
                              marginBottom: 4,
                            }}
                          >
                            {schedule.subject}
                          </div>
                          <div
                            style={{
                              fontSize: isMobile ? "12px" : "13px",
                              color: "#6B7280",
                              fontWeight: 500,
                            }}
                          >
                            {schedule.jam} <br />
                            Ruang: {schedule.room || "-"}
                          </div>
                        </div>

                        <div
                          style={{
                            flex: 1,
                            textAlign: "left",
                            paddingLeft: "24px",
                            display: isMobile ? "none" : "block",
                          }}
                        >
                          <div
                            style={{
                              fontSize: isMobile ? "14px" : "15px",
                              fontWeight: 700,
                              color: "#111827",
                            }}
                          >
                            {schedule.className}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </>
              )}
            </div>

            {/* ========== MODALS ========== */}

            {/* Modal Lihat Jadwal Image */}
            <Modal
              isOpen={isScheduleImageModalOpen}
              onClose={() => setIsScheduleImageModalOpen(false)}
            >
              <div style={{ padding: 20, textAlign: "center" }}>
                <h3 style={{ marginBottom: 16, fontSize: 18, fontWeight: 800, color: "#0B2948" }}>Jadwal Saya</h3>
                {teacherProfile?.schedule_image_url ? (
                  <img
                    src={teacherProfile.schedule_image_url}
                    alt="Jadwal Guru"
                    style={{ maxWidth: "100%", borderRadius: 8, boxShadow: "0 4px 12px rgba(0,0,0,0.1)" }}
                  />
                ) : (
                  <div style={{ padding: 40, color: "#6B7280" }}>Jadwal belum diunggah</div>
                )}
                <button
                  onClick={() => setIsScheduleImageModalOpen(false)}
                  style={{
                    marginTop: 20,
                    padding: "10px 24px",
                    backgroundColor: "#0B2948",
                    color: "white",
                    borderRadius: 8,
                    border: "none",
                    fontWeight: 700,
                    cursor: "pointer"
                  }}
                >
                  Tutup
                </button>
              </div>
            </Modal>

            <JadwalModal
              isOpen={activeModal === "schedule"}
              onClose={() => setActiveModal(null)}
              data={
                selectedSchedule
                  ? {
                    subject: selectedSchedule.subject,
                    className: selectedSchedule.className,
                    jurusan: selectedSchedule.jurusan,
                    jam: selectedSchedule.jam,
                    statusGuru: "Hadir",
                  }
                  : null
              }
              onMulaiAbsen={handleMulaiAbsen}
              onTidakBisaMengajar={handleTidakBisaMengajar}
            />

            <MetodeGuru
              isOpen={activeModal === "metode"}
              onClose={() => setActiveModal(null)}
              onPilihQR={handlePilihQR}
              onPilihManual={handlePilihManual}
              onTidakBisaMengajar={handleTidakBisaMengajar}
            />

            <TidakBisaMengajar
              isOpen={activeModal === "tidakBisa"}
              onClose={() => setActiveModal(null)}
              data={
                selectedSchedule
                  ? {
                    subject: selectedSchedule.subject,
                    className: selectedSchedule.className,
                    jurusan: selectedSchedule.jurusan,
                    jam: selectedSchedule.jam,
                  }
                  : null
              }
              onSubmit={handleSubmitTidakBisaMengajar}
              onPilihMetode={handlePilihMetodeDariTidakBisaMengajar}
            />

            {/* Scan QR Pengurus Kelas */}
            <Modal
              isOpen={isQrModalOpen}
              onClose={closeQrModal}
            >
              <div style={{
                backgroundColor: "#FFFFFF",
                borderRadius: 24,
                padding: 28,
                maxWidth: 400,
                width: "100%",
                margin: "0 auto",
                boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1)",
                textAlign: "center"
              }}>
                <h2 style={{ fontSize: 18, fontWeight: 800, color: "#111827", margin: 0, marginBottom: 8 }}>
                  Scan QR Pengurus Kelas
                </h2>
                <p style={{ fontSize: 14, color: "#6B7280", marginTop: 0, marginBottom: 16 }}>
                  {selectedSchedule?.subject} - {selectedSchedule?.className}
                </p>

                <div style={{
                  border: "1px dashed #D1D5DB",
                  borderRadius: 16,
                  padding: 20,
                  marginBottom: 20,
                  background: "#fff"
                }}>
                  {isScanning ? (
                    <div style={{ padding: 40 }}>Memproses hasil scan...</div>
                  ) : (
                    <CameraScanner
                      onScanSuccess={handleScanSuccess}
                      onScanError={(errorMessage) => {
                        if (errorMessage) {
                          setQrScanHint(errorMessage);
                        }
                      }}
                      onCameraBlocked={() => {
                        setIsCameraBlocked(true);
                        setQrScanHint("Akses kamera diblokir browser/perangkat.");
                      }}
                    />
                  )}
                </div>

                {qrScanHint && (
                  <div
                    style={{
                      marginBottom: 12,
                      padding: "10px 12px",
                      borderRadius: 8,
                      backgroundColor: "#FEF2F2",
                      border: "1px solid #FECACA",
                      color: "#991B1B",
                      fontSize: 12,
                      fontWeight: 600,
                    }}
                  >
                    {qrScanHint}
                  </div>
                )}

                <p style={{ fontSize: 12, color: "#9CA3AF", marginBottom: 16 }}>
                  Arahkan kamera ke QR dari Pengurus Kelas.
                </p>

                {isCameraBlocked && (
                  <button
                    onClick={handleFallbackToManual}
                    style={{
                      width: "100%",
                      padding: "12px 24px",
                      background: "#2563EB",
                      color: "#FFFFFF",
                      border: "none",
                      borderRadius: 10,
                      fontWeight: 700,
                      fontSize: 14,
                      cursor: "pointer",
                      marginBottom: 8
                    }}
                  >
                    Fallback ke Mode Manual
                  </button>
                )}

                <button
                  onClick={closeQrModal}
                  style={{
                    width: "100%",
                    padding: "12px 24px",
                    background: "#F3F4F6",
                    color: "#374151",
                    border: "none",
                    borderRadius: 10,
                    fontWeight: 600,
                    fontSize: 14,
                    cursor: "pointer",
                    marginTop: 8
                  }}
                >
                  Tutup
                </button>
              </div>
            </Modal>
            <style>{`
              .active-pulse {
                animation: pulse-ring 2s cubic-bezier(0.455, 0.03, 0.515, 0.955) infinite;
              }
              @keyframes pulse-ring {
                0% { transform: scale(0.8); box-shadow: 0 0 0 0 rgba(16, 185, 129, 0.7); }
                70% { transform: scale(1); box-shadow: 0 0 0 10px rgba(16, 185, 129, 0); }
                100% { transform: scale(0.8); }
              }
            `}</style>
          </GuruLayout>
        );
    }
  };

  return renderPage();
}
