import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import GuruLayout from "../../component/Guru/GuruLayout";
import DetailJadwalGuru from "./DetailJadwalGuru";
import AbsenGuru from "./AbsenGuru";
import InputAbsenGuru from "./InputAbsenGuru";
import KehadiranSiswaGuru from "./KehadiranSiswaGuru";
import { Calendar, Clock, BookOpen, Eye, QrCode } from "lucide-react";
import { JadwalModal } from "../../component/Shared/Form/Jadwal";
import { MetodeGuru } from "../../component/Shared/Form/MetodeGuru";
import { TidakBisaMengajar } from "../../component/Shared/Form/TidakBisaMengajar";
import { AbsenGuruModal } from "../../component/Shared/Form/AbsenGuruModal";


// ==================== INTERFACES ====================
interface DashboardGuruProps {
  user: { name: string; role: string };
  onLogout: () => void;
}

type GuruPage =
  | "Beranda"
  | "jadwal"
  | "presensi"
  | "kehadiran"
  | "input-manual"
  | "notifikasi"
  | "pengaturan";

type ModalType = "schedule" | "metode" | "tidakBisa" | null;

interface ScheduleItem {
  id: string;
  subject: string;
  className: string;
  jurusan?: string;
  jam?: string;
}

const PAGE_TITLES: Record<GuruPage, string> = {
  Beranda: "Beranda",
  jadwal: "Detail Jadwal",
  presensi: "Scan QR",
  kehadiran: "Kehadiran Siswa",
  "input-manual": "Input Manual",
  notifikasi: "Notifikasi",
  pengaturan: "Pengaturan",
};

const BREAKPOINTS = {
  mobile: 768,
};

// Dummy data - Nanti diganti dengan API call
const DUMMY_SCHEDULE: ScheduleItem[] = [
  {
    id: "1",
    subject: "Matematika",
    className: "XII Mekatronika 2",
    jurusan: "XII Mekatronika 2",
    jam: "1-4 (07.00-09.40)",
  },
  {
    id: "2",
    subject: "Fisika",
    className: "XII Mekatronika 1",
    jurusan: "XII Mekatronika 1",
    jam: "5-8 (10.00-12.20)",
  },
  {
    id: "3",
    subject: "Kimia",
    className: "XI Mekatronika 2",
    jurusan: "XI Mekatronika 2",
    jam: "9-10 (13.00-14.30)",
  },
  {
    id: "4",
    subject: "Biologi",
    className: "X Mekatronika 1",
    jurusan: "X Mekatronika 1",
    jam: "11-12 (14.40-16.00)",
  },
];

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
  cardBase: {
    borderRadius: 12,
    boxShadow: "0 2px 8px rgba(0, 0, 0, 0.08)",
    border: "1px solid #E5E7EB",
    display: "flex" as const,
    flexDirection: "column" as const,
  },

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
  dateTimeCard: (isMobile: boolean) => ({
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

  timeRangeContainer: {
    display: "flex",
    gap: 8,
    alignItems: "center",
    justifyContent: "center",
  },

  timeBox: (isMobile: boolean) => ({
    padding: "8px 14px",
    border: "2px solid #374151",
    borderRadius: 20,
    fontSize: isMobile ? "12px" : "13px",
    fontWeight: 600,
    color: "#111827",
    backgroundColor: "#FFFFFF",
    whiteSpace: "nowrap" as const,
  }),

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
  const [currentPage, setCurrentPage] = useState<GuruPage>("Beranda");
  const [selectedSchedule, setSelectedSchedule] = useState<ScheduleItem | null>(
    null
  );
  const [showAbsenGuruModal, setShowAbsenGuruModal] = useState(false);
  const [activeModal, setActiveModal] = useState<ModalType>(null);
  const [isMobile, setIsMobile] = useState(
    window.innerWidth < BREAKPOINTS.mobile
  );
  const navigate = useNavigate();

  const [currentDateStr, setCurrentDateStr] = useState("");
  const [currentTimeStr, setCurrentTimeStr] = useState("");

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

    return () => {
      clearInterval(interval);
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  // ========== NAVIGATION HANDLERS ==========
  const handleMenuClick = (page: string) => setCurrentPage(page as GuruPage);

  const handleLogoutClick = () => {
    if (window.confirm("Apakah Anda yakin ingin keluar?")) {
      onLogout();
      navigate("/");
    }
  };

  // ========== SCHEDULE HANDLERS ==========
  const handleScheduleClick = (schedule: ScheduleItem) => {
    setSelectedSchedule(schedule);
    setActiveModal("schedule");
  };

  const handleEyeClick = (e: React.MouseEvent, schedule: ScheduleItem) => {
    e.stopPropagation();
    // Navigasi ke halaman DetailJadwalGuru
    setCurrentPage("jadwal");
    setSelectedSchedule(schedule);
  };

  const handleQRClick = (e: React.MouseEvent, schedule: ScheduleItem) => {
    e.stopPropagation();
    setSelectedSchedule(schedule);
    setActiveModal("metode");
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
    setActiveModal("schedule");
  };

  const handlePilihManual = () => {
    setActiveModal(null);
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

  // ========== DATA ==========
  const handleAbsenGuruSubmit = (file: File) => {
    // Nanri Implement API call
    console.log("File uploaded:", file);
    alert("QR Code berhasil diunggah! Menunggu validasi Pengurus Kelas.");
    setShowAbsenGuruModal(false);
  };

  const handleAbsenGuruManualSubmit = () => {
    // API CALL
    alert(
      "Permintaan absensi manual berhasil dikirim! Menunggu validasi Pengurus Kelas."
    );
    setShowAbsenGuruModal(false);
  };

  // ========== RENDER PAGES ==========
  const renderPage = () => {
    switch (currentPage) {
      case "jadwal":
        return (
          <DetailJadwalGuru
            user={user}
            onLogout={handleLogoutClick}
            currentPage={currentPage}
            onMenuClick={handleMenuClick}
          />
        );
      case "presensi":
        return (
          <AbsenGuru
            user={user}
            onLogout={handleLogoutClick}
            currentPage={currentPage}
            onMenuClick={handleMenuClick}
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
      case "kehadiran":
        return (
          <KehadiranSiswaGuru
            user={user}
            onLogout={handleLogoutClick}
            currentPage={currentPage}
            onMenuClick={handleMenuClick}
          />
        );
      case "notifikasi":
      case "pengaturan":
        return (
          <GuruLayout
            pageTitle={PAGE_TITLES[currentPage]}
            currentPage={currentPage}
            onMenuClick={handleMenuClick}
            user={user}
            onLogout={handleLogoutClick}
          >
            <div style={styles.comingSoon}>
              <h2
                style={{
                  fontSize: "24px",
                  fontWeight: "bold",
                  color: "#1F2937",
                  marginBottom: "8px",
                }}
              >
                Coming Soon
              </h2>
              <p style={{ color: "#6B7280", fontSize: "16px" }}>
                Fitur {PAGE_TITLES[currentPage]} sedang dalam pengembangan
              </p>
            </div>
          </GuruLayout>
        );
      case "Beranda":
      default:
        return (
          <GuruLayout
            pageTitle="Dashboard"
            currentPage={currentPage}
            onMenuClick={handleMenuClick}
            user={user}
            onLogout={handleLogoutClick}
          >
            <div style={styles.mainContainer(isMobile)}>
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
                      {user.name || "Ewit Erniyah S.pd"}
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
                      {user.role === "guru" ? "0918415784" : "ID User"}
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
                      <Calendar size={24} strokeWidth={1.5} />
                    </div>
                    <span style={{ fontSize: "16px", fontWeight: "600" }}>
                      {currentDateStr || "Memuat..."}
                    </span>
                  </div>

                  <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                    <div style={{ opacity: 0.8 }}>
                      <Clock size={24} strokeWidth={1.5} />
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
                    Semester Genap
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
                      <BookOpen size={20} color="white" strokeWidth={2} />
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
                  <div style={styles.totalBadge(isMobile)}>
                    {DUMMY_SCHEDULE.length} Kelas
                  </div>
                </div>
              </div>

              {/* Quick Action Button for Absen Guru */}
              {/* <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '16px' }}>
                <button
                  onClick={() => setShowAbsenGuruModal(true)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px',
                    backgroundColor: '#2563EB',
                    color: 'white',
                    border: 'none',
                    borderRadius: '12px',
                    padding: '12px 24px',
                    fontSize: '14px',
                    fontWeight: '700',
                    cursor: 'pointer',
                    boxShadow: '0 4px 6px -1px rgba(37, 99, 235, 0.2), 0 2px 4px -1px rgba(37, 99, 235, 0.1)',
                    transition: 'all 0.2s'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = '#1D4ED8';
                    e.currentTarget.style.transform = 'translateY(-1px)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = '#2563EB';
                    e.currentTarget.style.transform = 'translateY(0)';
                  }}
                >
                  <div style={{ 
                    backgroundColor: 'rgba(255,255,255,0.2)', 
                    borderRadius: '8px', 
                    padding: '6px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}>
                    <QrCode size={20} color="white" strokeWidth={2} />
                  </div>
                  <span>Absen Kehadiran Guru</span>
                </button>
              </div> */}

              {/* ========== JADWAL TITLE ========== */}
              <div style={styles.titleSection(isMobile)}>Jadwal Hari Ini</div>

              {/* ========== SCHEDULE GRID ========== */}
              <div style={styles.scheduleGrid(isMobile)}>
                {DUMMY_SCHEDULE.map((schedule) => (
                  <div
                    key={schedule.id}
                    style={styles.scheduleCard(isMobile)}
                    onClick={() => handleScheduleClick(schedule)}
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
                      <BookOpen size={isMobile ? 18 : 20} color="white" strokeWidth={2} />
                    </div>

                    {/* Mata Pelajaran & Kelas */}
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
                          fontSize: isMobile ? "13px" : "14px",
                          color: "#4B5563",
                          fontWeight: 500,
                          whiteSpace: "nowrap",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
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
                      {/* Eye Icon */}
                      <div
                        onClick={(e) => handleEyeClick(e, schedule)}
                        style={styles.actionButton}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.backgroundColor = "#E5E7EB";
                          e.currentTarget.style.transform = "scale(1.05)";
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.backgroundColor = "#F3F4F6";
                          e.currentTarget.style.transform = "scale(1)";
                        }}
                      >
                        <Eye size={18} color="#1F2937" strokeWidth={2} />
                      </div>

                      {/* QR Icon */}
                      <div
                        onClick={(e) => handleQRClick(e, schedule)}
                        style={styles.actionButton}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.backgroundColor = "#E5E7EB";
                          e.currentTarget.style.transform = "scale(1.05)";
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.backgroundColor = "#F3F4F6";
                          e.currentTarget.style.transform = "scale(1)";
                        }}
                      >
                        <QrCode size={18} color="#1F2937" strokeWidth={2} />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* ========== MODALS ========== */}
            <AbsenGuruModal
              isOpen={showAbsenGuruModal}
              onClose={() => setShowAbsenGuruModal(false)}
              onSubmit={handleAbsenGuruSubmit}
              onManualSubmit={handleAbsenGuruManualSubmit}
            />

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
          </GuruLayout>
        );
    }
  };

  return renderPage();
}

// ======= lEGACY CODE =======

// import { useState, useEffect } from "react";
// import { useNavigate } from "react-router-dom";
// import GuruLayout from "../../component/Guru/GuruLayout";
// import DetailJadwalGuru from "./DetailJadwalGuru";
// import AbsenGuru from "./AbsenGuru";
// import InputAbsenGuru from "./InputAbsenGuru";
// import KehadiranSiswaGuru from "./KehadiranSiswaGuru";
// import BookIcon from "../../assets/Icon/open-book.png";
// import CalendarIcon from "../../assets/Icon/calender.png";
// import RefreshIcon from "../../assets/Icon/refresh.png";
// import GraduationCapIcon from "../../assets/Icon/GraduationCap.png";
// import EyeIcon from "../../assets/Icon/Eye.png";
// import QRCodeIcon from "../../assets/Icon/qr_code.png";
// import { JadwalModal } from "../../component/Shared/Form/Jadwal";
// import { MetodeGuru } from "../../component/Shared/Form/MetodeGuru";
// import { TidakBisaMengajar } from "../../component/Shared/Form/TidakBisaMengajar";
// import { AbsenGuruModal } from "../../component/Shared/Form/AbsenGuruModal";

// // ==================== INTERFACES ====================
// interface DashboardGuruProps {
//   user: { name: string; role: string };
//   onLogout: () => void;
// }

// type GuruPage =
//   | "dashboard"
//   | "jadwal"
//   | "presensi"
//   | "kehadiran"
//   | "input-manual"
//   | "notifikasi"
//   | "pengaturan";

// type ModalType = "schedule" | "metode" | "tidakBisa" | null;

// interface ScheduleItem {
//   id: string;
//   subject: string;
//   className: string;
//   jurusan?: string;
//   jam?: string;
// }

// const PAGE_TITLES: Record<GuruPage, string> = {
//   dashboard: "Dashboard",
//   jadwal: "Detail Jadwal",
//   presensi: "Scan QR",
//   kehadiran: "Kehadiran Siswa",
//   "input-manual": "Input Manual",
//   notifikasi: "Notifikasi",
//   pengaturan: "Pengaturan",
// };

// const BREAKPOINTS = {
//   mobile: 768,
//   tablet: 1024,
//   desktop: 1400,
// };

// // Dummy data - Nanti diganti dengan API call
// const DUMMY_SCHEDULE: ScheduleItem[] = [
//   {
//     id: "1",
//     subject: "Matematika",
//     className: "XII Mekatronika 2",
//     jurusan: "XII Mekatronika 2",
//     jam: "1-4 (07.00-09.40)",
//   },
//   {
//     id: "2",
//     subject: "Fisika",
//     className: "XII Mekatronika 1",
//     jurusan: "XII Mekatronika 1",
//     jam: "5-8 (10.00-12.20)",
//   },
//   {
//     id: "3",
//     subject: "Kimia",
//     className: "XI Mekatronika 2",
//     jurusan: "XI Mekatronika 2",
//     jam: "9-10 (13.00-14.30)",
//   },
//   {
//     id: "4",
//     subject: "Biologi",
//     className: "X Mekatronika 1",
//     jurusan: "X Mekatronika 1",
//     jam: "11-12 (14.40-16.00)",
//   },
// ];

// // ==================== STYLES ==================== //
// const styles = {
//   // Container Styles
//   mainContainer: (isMobile: boolean) => ({
//     position: "relative" as const,
//     zIndex: 2,
//     display: "flex",
//     flexDirection: "column" as const,
//     gap: 24,
//     maxWidth: "1400px",
//     margin: "0 auto",
//     width: "100%",
//     backgroundColor: "#F9FAFB",
//     padding: isMobile ? "12px" : "16px",
//   }),

//   topGrid: (isMobile: boolean) => ({
//     display: "grid",
//     gridTemplateColumns: isMobile
//       ? "1fr"
//       : "repeat(auto-fit, minmax(280px, 1fr))",
//     gap: 16,
//     width: "100%",
//     alignItems: "stretch",
//   }),

//   scheduleGrid: (isMobile: boolean) => ({
//     display: "flex",
//     flexDirection: "column" as const,
//     gap: 16,
//     padding: "16px 0",
//     alignItems: "center",
//     width: isMobile ? "100%" : "75%",
//     margin: "0 auto",
//   }),

//   // Card  Stylingnya //
//   cardBase: {
//     borderRadius: 12,
//     boxShadow: "0 2px 8px rgba(0, 0, 0, 0.08)",
//     border: "1px solid #E5E7EB",
//     display: "flex" as const,
//     flexDirection: "column" as const,
//   },

//   // User Info Card
//   userCard: (isMobile: boolean) => ({
//     backgroundColor: "#0B2948",
//     borderRadius: 12,
//     padding: isMobile ? "20px" : "24px",
//     display: "flex",
//     alignItems: "center",
//     gap: 16,
//     boxShadow: "0 4px 12px rgba(0, 0, 0, 0.15)",
//     position: "relative" as const,
//     overflow: "hidden" as const,
//     minHeight: isMobile ? "auto" : "120px",
//   }),

//   decorativeCircle: {
//     position: "absolute" as const,
//     top: -30,
//     right: -30,
//     width: 120,
//     height: 120,
//     borderRadius: "50%",
//     backgroundColor: "rgba(255, 255, 255, 0.05)",
//     zIndex: 0,
//   },

//   userIcon: (isMobile: boolean) => ({
//     width: isMobile ? "48px" : "56px",
//     height: isMobile ? "48px" : "56px",
//     borderRadius: "50%",
//     backgroundColor: "rgba(255, 255, 255, 0.15)",
//     display: "flex",
//     alignItems: "center",
//     justifyContent: "center",
//     flexShrink: 0,
//     position: "relative" as const,
//     zIndex: 1,
//   }),

//   // Date & Time Card
//   dateTimeCard: (isMobile: boolean) => ({
//     backgroundColor: "#0B2948",
//     borderRadius: 12,
//     padding: isMobile ? "20px" : "24px",
//     boxShadow: "0 4px 12px rgba(11, 41, 72, 0.2)",
//     border: "1px solid #0B2948",
//     display: "flex",
//     flexDirection: "column" as const,
//     justifyContent: "space-between",
//     minHeight: isMobile ? "auto" : "120px",
//     color: "#FFFFFF",
//   }),

//   iconWrapper: {
//     width: 40,
//     height: 40,
//     borderRadius: 8,
//     backgroundColor: "#F3F4F6",
//     display: "flex",
//     alignItems: "center",
//     justifyContent: "center",
//     flexShrink: 0,
//   },

//   timeRangeContainer: {
//     display: "flex",
//     gap: 8,
//     alignItems: "center",
//     justifyContent: "center",
//   },

//   timeBox: (isMobile: boolean) => ({
//     padding: "8px 14px",
//     border: "2px solid #374151",
//     borderRadius: 20,
//     fontSize: isMobile ? "12px" : "13px",
//     fontWeight: 600,
//     color: "#111827",
//     backgroundColor: "#FFFFFF",
//     whiteSpace: "nowrap" as const,
//   }),

//   totalMengajarCard: (isMobile: boolean) => ({
//     backgroundColor: "#FFFFFF",
//     borderRadius: 12,
//     padding: isMobile ? "20px" : "24px",
//     boxShadow: "0 2px 8px rgba(0, 0, 0, 0.12)",
//     border: "1px solid #D1D5DB",
//     display: "flex",
//     flexDirection: "column" as const,
//     justifyContent: "space-between",
//     minHeight: isMobile ? "auto" : "120px",
//   }),

//   totalBadge: (isMobile: boolean) => ({
//     backgroundColor: "#F9FAFB",
//     borderRadius: 20,
//     padding: "12px 20px",
//     fontSize: isMobile ? "16px" : "18px",
//     fontWeight: 700,
//     color: "#111827",
//     textAlign: "center" as const,
//     border: "2px solid #374151",
//   }),

//   titleSection: (isMobile: boolean) => ({
//     width: isMobile ? "100%" : "75%",
//     backgroundColor: "#0B2948",
//     color: "#FFFFFF",
//     borderRadius: 12,
//     padding: isMobile ? "12px 16px" : "14px 20px",
//     fontSize: isMobile ? "16px" : "18px",
//     fontWeight: 800,
//     margin: "0 auto",
//     marginBottom: 0,
//     boxShadow: "0 6px 16px rgba(11, 41, 72, 0.35)",
//     textAlign: "center" as const,
//   }),

//   scheduleCard: (isMobile: boolean) => ({
//     backgroundColor: "#FFFFFF",
//     borderRadius: 12,
//     padding: isMobile ? "16px" : "18px 24px",
//     display: "flex",
//     alignItems: "center",
//     gap: 14,
//     border: "1px solid #D1D5DB",
//     boxShadow: "0 2px 8px rgba(0, 0, 0, 0.08)",
//     position: "relative" as const,
//     transition: "all 0.2s ease",
//     cursor: "default",
//     width: "100%",
//     maxWidth: "100%",
//   }),

//   bookIconWrapper: (isMobile: boolean) => ({
//     width: isMobile ? "40px" : "44px",
//     height: isMobile ? "40px" : "44px",
//     borderRadius: 10,
//     background: "linear-gradient(135deg, #2563EB 0%, #1E40AF 100%)",
//     display: "flex",
//     alignItems: "center",
//     justifyContent: "center",
//     flexShrink: 0,
//     boxShadow: "0 2px 8px rgba(37, 99, 235, 0.3)",
//   }),

//   actionButton: {
//     width: 36,
//     height: 36,
//     borderRadius: 8,
//     backgroundColor: "#F3F4F6",
//     display: "flex",
//     alignItems: "center",
//     justifyContent: "center",
//     cursor: "pointer",
//     transition: "all 0.2s",
//     border: "1px solid #E5E7EB",
//   },

//   // Coming Soon
//   comingSoon: {
//     backgroundColor: "white",
//     borderRadius: "8px",
//     boxShadow: "0 1px 3px rgba(0, 0, 0, 0.1)",
//     padding: "48px 24px",
//     textAlign: "center" as const,
//   },
// };

// // ==================== MAIN COMPONENT ====================
// export default function DashboardGuru({ user, onLogout }: DashboardGuruProps) {
//   // ========== STATE ==========
//   const [currentPage, setCurrentPage] = useState<GuruPage>("dashboard");
//   const [selectedSchedule, setSelectedSchedule] = useState<ScheduleItem | null>(
//     null
//   );
//   const [showAbsenGuruModal, setShowAbsenGuruModal] = useState(false);
//   const [activeModal, setActiveModal] = useState<ModalType>(null);
//   const [isMobile, setIsMobile] = useState(
//     window.innerWidth < BREAKPOINTS.mobile
//   );
//   const navigate = useNavigate();

//   // ========== EFFECTS ==========
//   useEffect(() => {
//     const handleResize = () =>
//       setIsMobile(window.innerWidth < BREAKPOINTS.mobile);
//     window.addEventListener("resize", handleResize);
//     return () => window.removeEventListener("resize", handleResize);
//   }, []);

//   // ========== NAVIGATION HANDLERS ==========
//   const handleMenuClick = (page: string) => setCurrentPage(page as GuruPage);

//   const handleLogoutClick = () => {
//     if (window.confirm("Apakah Anda yakin ingin keluar?")) {
//       onLogout();
//       navigate("/");
//     }
//   };

//   // ========== SCHEDULE HANDLERS ==========
//   const handleScheduleClick = (schedule: ScheduleItem) => {
//     setSelectedSchedule(schedule);
//     setActiveModal("schedule");
//   };

//   const handleEyeClick = (e: React.MouseEvent, schedule: ScheduleItem) => {
//     e.stopPropagation();
//     // Navigasi ke halaman DetailJadwalGuru
//     setCurrentPage("jadwal");
//     setSelectedSchedule(schedule);
//   };

//   const handleQRClick = (e: React.MouseEvent, schedule: ScheduleItem) => {
//     e.stopPropagation();
//     setSelectedSchedule(schedule);
//     setActiveModal("metode");
//   };

//   // ========== MODAL HANDLERS ==========
//   const handleMulaiAbsen = () => {
//     setActiveModal(null);
//     setCurrentPage("input-manual");
//   };

//   const handleTidakBisaMengajar = () => {
//     setActiveModal("tidakBisa");
//   };

//   const handlePilihMetodeDariTidakBisaMengajar = () => {
//     setActiveModal("metode");
//   };

//   const handleMulaiScan = () => {
//     // Pastikan ada schedule yang dipilih
//     if (!selectedSchedule && DUMMY_SCHEDULE.length > 0) {
//       setSelectedSchedule(DUMMY_SCHEDULE[0]);
//     }
//     setActiveModal("schedule");
//   };

//   const handlePilihQR = () => {
//     setActiveModal("schedule");
//   };

//   const handlePilihManual = () => {
//     setActiveModal(null);
//     setCurrentPage("input-manual");
//   };

//   const handleSubmitTidakBisaMengajar = (data: {
//     alasan: string;
//     keterangan?: string;
//     foto1?: File;
//   }) => {
//     console.log("Data tidak bisa mengajar:", data);
//     alert(
//       `Laporan berhasil dikirim!\nAlasan: ${data.alasan}\nKeterangan: ${
//         data.keterangan || "-"
//       }\nFoto: ${data.foto1 ? "Ada" : "Tidak ada"}`
//     );
//     setActiveModal(null);
//   };

//   // ========== DATA ==========
//   const currentDate = getCurrentDate();
//   const dateString = `${currentDate.day}, ${currentDate.date} ${currentDate.month} ${currentDate.year}`;

//   const handleAbsenGuruSubmit = (file: File) => {
//     // Nanri Implement API call
//     console.log("File uploaded:", file);
//     alert("QR Code berhasil diunggah! Menunggu validasi Pengurus Kelas.");
//     setShowAbsenGuruModal(false);
//   };

//   const handleAbsenGuruManualSubmit = () => {
//     // API CALL
//     alert(
//       "Permintaan absensi manual berhasil dikirim! Menunggu validasi Pengurus Kelas."
//     );
//     setShowAbsenGuruModal(false);
//   };

//   // ========== RENDER PAGES ==========
//   const renderPage = () => {
//     switch (currentPage) {
//       case "jadwal":
//         return (
//           <DetailJadwalGuru
//             user={user}
//             onLogout={handleLogoutClick}
//             currentPage={currentPage}
//             onMenuClick={handleMenuClick}
//           />
//         );
//       case "presensi":
//         return (
//           <AbsenGuru
//             user={user}
//             onLogout={handleLogoutClick}
//             currentPage={currentPage}
//             onMenuClick={handleMenuClick}
//           />
//         );
//       case "input-manual":
//         return (
//           <InputAbsenGuru
//             user={user}
//             onLogout={handleLogoutClick}
//             currentPage={currentPage}
//             onMenuClick={handleMenuClick}
//           />
//         );
//       case "kehadiran":
//         return (
//           <KehadiranSiswaGuru
//             user={user}
//             onLogout={handleLogoutClick}
//             currentPage={currentPage}
//             onMenuClick={handleMenuClick}
//           />
//         );
//       case "notifikasi":
//       case "pengaturan":
//         return (
//           <GuruLayout
//             pageTitle={PAGE_TITLES[currentPage]}
//             currentPage={currentPage}
//             onMenuClick={handleMenuClick}
//             user={user}
//             onLogout={handleLogoutClick}
//           >
//             <div style={styles.comingSoon}>
//               <h2
//                 style={{
//                   fontSize: "24px",
//                   fontWeight: "bold",
//                   color: "#1F2937",
//                   marginBottom: "8px",
//                 }}
//               >
//                 Coming Soon
//               </h2>
//               <p style={{ color: "#6B7280", fontSize: "16px" }}>
//                 Fitur {PAGE_TITLES[currentPage]} sedang dalam pengembangan
//               </p>
//             </div>
//           </GuruLayout>
//         );
//       case "dashboard":
//       default:
//         return (
//           <GuruLayout
//             pageTitle="Dashboard"
//             currentPage={currentPage}
//             onMenuClick={handleMenuClick}
//             user={user}
//             onLogout={handleLogoutClick}
//           >
//             <div style={styles.mainContainer(isMobile)}>
//               {/* ========== TOP SECTION ========== */}
//               <div style={styles.topGrid(isMobile)}>
//                 {/* User Info Card */}
//                 <div style={styles.userCard(isMobile)}>
//                   <div style={styles.decorativeCircle} />
//                   <div style={styles.userIcon(isMobile)}>
//                     <svg
//                       width={isMobile ? "28" : "32"}
//                       height={isMobile ? "28" : "32"}
//                       viewBox="0 0 24 24"
//                       fill="none"
//                       xmlns="http://www.w3.org/2000/svg"
//                     >
//                       <path
//                         d="M12 12C14.7614 12 17 9.76142 17 7C17 4.23858 14.7614 2 12 2C9.23858 2 7 4.23858 7 7C7 9.76142 9.23858 12 12 12Z"
//                         stroke="white"
//                         strokeWidth="2"
//                         strokeLinecap="round"
//                         strokeLinejoin="round"
//                       />
//                       <path
//                         d="M20.59 22C20.59 18.13 16.74 15 12 15C7.26 15 3.41 18.13 3.41 22"
//                         stroke="white"
//                         strokeWidth="2"
//                         strokeLinecap="round"
//                         strokeLinejoin="round"
//                       />
//                     </svg>
//                   </div>
//                   <div
//                     style={{
//                       flex: 1,
//                       minWidth: 0,
//                       position: "relative",
//                       zIndex: 1,
//                     }}
//                   >
//                     <div
//                       style={{
//                         fontSize: isMobile ? "16px" : "18px",
//                         fontWeight: 700,
//                         color: "#FFFFFF",
//                         marginBottom: 4,
//                         whiteSpace: "nowrap",
//                         overflow: "hidden",
//                         textOverflow: "ellipsis",
//                       }}
//                     >
//                       {user.name || "Ewit Erniyah S.pd"}
//                     </div>
//                     <div
//                       style={{
//                         fontSize: isMobile ? "13px" : "14px",
//                         color: "rgba(255, 255, 255, 0.85)",
//                         fontWeight: 500,
//                         whiteSpace: "nowrap",
//                         overflow: "hidden",
//                         textOverflow: "ellipsis",
//                       }}
//                     >
//                       {user.role === "guru" ? "0918415784" : "ID User"}
//                     </div>
//                   </div>
//                 </div>

//                 {/* Date & Time Card */}
//                 <div style={styles.dateTimeCard(isMobile)}>
//                   <div
//                     style={{
//                       fontWeight: 700,
//                       fontSize: isMobile ? "14px" : "15px",
//                       marginBottom: 12,
//                     }}
//                   >
//                     Info Hari Ini
//                   </div>
//                   <div
//                     style={{
//                       display: "flex",
//                       flexDirection: "column",
//                       gap: 10,
//                     }}
//                   >
//                     {/* Tanggal */}
//                     <div
//                       style={{
//                         display: "flex",
//                         alignItems: "center",
//                         gap: 10,
//                       }}
//                     >
//                       <img
//                         src={CalendarIcon}
//                         alt="Tanggal"
//                         style={{ width: 20, height: 20, objectFit: "contain" }}
//                       />
//                       <span style={{ fontSize: isMobile ? "13px" : "14px" }}>
//                         {dateString}
//                       </span>
//                     </div>

//                     {/* Waktu */}
//                     <div
//                       style={{
//                         display: "flex",
//                         alignItems: "center",
//                         gap: 10,
//                       }}
//                     >
//                       <img
//                         src={RefreshIcon}
//                         alt="Waktu"
//                         style={{ width: 20, height: 20, objectFit: "contain" }}
//                       />
//                       <span style={{ fontSize: isMobile ? "13px" : "14px" }}>
//                         {currentDate.time}
//                       </span>
//                     </div>

//                     {/* Semester */}
//                     <div
//                       style={{
//                         display: "flex",
//                         alignItems: "center",
//                         gap: 10,
//                       }}
//                     >
//                       <img
//                         src={GraduationCapIcon}
//                         alt="Semester"
//                         style={{ width: 20, height: 20, objectFit: "contain" }}
//                       />
//                       <span style={{ fontSize: isMobile ? "13px" : "14px" }}>
//                         Semester Genap
//                       </span>
//                     </div>
//                   </div>
//                 </div>

//                 {/* Total Mengajar Card */}
//                 <div style={styles.totalMengajarCard(isMobile)}>
//                   <div
//                     style={{
//                       display: "flex",
//                       alignItems: "center",
//                       gap: 12,
//                       marginBottom: 12,
//                     }}
//                   >
//                     <div style={styles.iconWrapper}>
//                       <img
//                         src={BookIcon}
//                         alt="Book"
//                         style={{ width: 20, height: 20 }}
//                       />
//                     </div>
//                     <div
//                       style={{
//                         fontSize: isMobile ? "13px" : "14px",
//                         color: "#4B5563",
//                         fontWeight: 600,
//                         flex: 1,
//                       }}
//                     >
//                       Total Mengajar Hari Ini
//                     </div>
//                   </div>
//                   <div style={styles.totalBadge(isMobile)}>
//                     {DUMMY_SCHEDULE.length} Kelas
//                   </div>
//                 </div>
//               </div>

//               {/* Quick Action Button for Absen Guru */}
//               {/* <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '16px' }}>
//                 <button
//                   onClick={() => setShowAbsenGuruModal(true)}
//                   style={{
//                     display: 'flex',
//                     alignItems: 'center',
//                     gap: '10px',
//                     backgroundColor: '#2563EB',
//                     color: 'white',
//                     border: 'none',
//                     borderRadius: '12px',
//                     padding: '12px 24px',
//                     fontSize: '14px',
//                     fontWeight: '700',
//                     cursor: 'pointer',
//                     boxShadow: '0 4px 6px -1px rgba(37, 99, 235, 0.2), 0 2px 4px -1px rgba(37, 99, 235, 0.1)',
//                     transition: 'all 0.2s'
//                   }}
//                   onMouseEnter={(e) => {
//                     e.currentTarget.style.backgroundColor = '#1D4ED8';
//                     e.currentTarget.style.transform = 'translateY(-1px)';
//                   }}
//                   onMouseLeave={(e) => {
//                     e.currentTarget.style.backgroundColor = '#2563EB';
//                     e.currentTarget.style.transform = 'translateY(0)';
//                   }}
//                 >
//                   <div style={{ 
//                     backgroundColor: 'rgba(255,255,255,0.2)', 
//                     borderRadius: '8px', 
//                     padding: '6px',
//                     display: 'flex',
//                     alignItems: 'center',
//                     justifyContent: 'center'
//                   }}>
//                     <img 
//                       src={QRCodeIcon} 
//                       alt="QR" 
//                       style={{ width: '20px', height: '20px', filter: 'brightness(0) invert(1)' }} 
//                     />
//                   </div>
//                   <span>Absen Kehadiran Guru</span>
//                 </button>
//               </div> */}

//               {/* ========== JADWAL TITLE ========== */}
//               <div style={styles.titleSection(isMobile)}>Jadwal Hari Ini</div>

//               {/* ========== SCHEDULE GRID ========== */}
//               <div style={styles.scheduleGrid(isMobile)}>
//                 {DUMMY_SCHEDULE.map((schedule) => (
//                   <div
//                     key={schedule.id}
//                     style={styles.scheduleCard(isMobile)}
//                     onMouseEnter={(e) => {
//                       e.currentTarget.style.boxShadow =
//                         "0 6px 14px rgba(0, 0, 0, 0.15)";
//                       e.currentTarget.style.transform = "translateY(-2px)";
//                       e.currentTarget.style.backgroundColor = "#F9FAFB";
//                       e.currentTarget.style.borderColor = "#9CA3AF";
//                     }}
//                     onMouseLeave={(e) => {
//                       e.currentTarget.style.boxShadow =
//                         "0 2px 8px rgba(0, 0, 0, 0.08)";
//                       e.currentTarget.style.transform = "translateY(0)";
//                       e.currentTarget.style.backgroundColor = "#FFFFFF";
//                       e.currentTarget.style.borderColor = "#D1D5DB";
//                     }}
//                   >
//                     {/* Icon Buku */}
//                     <div style={styles.bookIconWrapper(isMobile)}>
//                       <img
//                         src={BookIcon}
//                         alt="Book"
//                         style={{
//                           width: isMobile ? "18px" : "20px",
//                           height: isMobile ? "18px" : "20px",
//                           objectFit: "contain",
//                           filter: "brightness(0) invert(1)",
//                         }}
//                       />
//                     </div>

//                     {/* Mata Pelajaran & Kelas */}
//                     <div style={{ flex: 1, minWidth: 0 }}>
//                       <div
//                         style={{
//                           fontSize: isMobile ? "15px" : "16px",
//                           fontWeight: 700,
//                           color: "#111827",
//                           marginBottom: 4,
//                           whiteSpace: "nowrap",
//                           overflow: "hidden",
//                           textOverflow: "ellipsis",
//                         }}
//                       >
//                         {schedule.subject}
//                       </div>
//                       <div
//                         style={{
//                           fontSize: isMobile ? "13px" : "14px",
//                           color: "#4B5563",
//                           fontWeight: 500,
//                           whiteSpace: "nowrap",
//                           overflow: "hidden",
//                           textOverflow: "ellipsis",
//                         }}
//                       >
//                         {schedule.className}
//                       </div>
//                     </div>

//                     {/* Action Buttons */}
//                     <div
//                       style={{
//                         display: "flex",
//                         gap: 8,
//                         alignItems: "center",
//                         flexShrink: 0,
//                       }}
//                     >
//                       {/* Eye Icon */}
//                       <div
//                         onClick={(e) => handleEyeClick(e, schedule)}
//                         style={styles.actionButton}
//                         onMouseEnter={(e) => {
//                           e.currentTarget.style.backgroundColor = "#E5E7EB";
//                           e.currentTarget.style.transform = "scale(1.05)";
//                         }}
//                         onMouseLeave={(e) => {
//                           e.currentTarget.style.backgroundColor = "#F3F4F6";
//                           e.currentTarget.style.transform = "scale(1)";
//                         }}
//                       >
//                         <img
//                           src={EyeIcon}
//                           alt="View"
//                           style={{ width: 18, height: 18 }}
//                         />
//                       </div>

//                       {/* QR Icon */}
//                       <div
//                         onClick={(e) => handleQRClick(e, schedule)}
//                         style={styles.actionButton}
//                         onMouseEnter={(e) => {
//                           e.currentTarget.style.backgroundColor = "#E5E7EB";
//                           e.currentTarget.style.transform = "scale(1.05)";
//                         }}
//                         onMouseLeave={(e) => {
//                           e.currentTarget.style.backgroundColor = "#F3F4F6";
//                           e.currentTarget.style.transform = "scale(1)";
//                         }}
//                       >
//                         <img
//                           src={QRCodeIcon}
//                           alt="QR Code"
//                           style={{ width: 18, height: 18 }}
//                         />
//                       </div>
//                     </div>
//                   </div>
//                 ))}
//               </div>
//             </div>

//             {/* ========== MODALS ========== */}
//             <AbsenGuruModal
//               isOpen={showAbsenGuruModal}
//               onClose={() => setShowAbsenGuruModal(false)}
//               onSubmit={handleAbsenGuruSubmit}
//               onManualSubmit={handleAbsenGuruManualSubmit}
//             />

//             <JadwalModal
//               isOpen={activeModal === "schedule"}
//               onClose={() => setActiveModal(null)}
//               data={
//                 selectedSchedule
//                   ? {
//                       subject: selectedSchedule.subject,
//                       className: selectedSchedule.className,
//                       jurusan: selectedSchedule.jurusan,
//                       jam: selectedSchedule.jam,
//                       statusGuru: "Hadir",
//                     }
//                   : null
//               }
//               onMulaiAbsen={handleMulaiAbsen}
//               onTidakBisaMengajar={handleTidakBisaMengajar}
//             />

//             <MetodeGuru
//               isOpen={activeModal === "metode"}
//               onClose={() => setActiveModal(null)}
//               onPilihQR={handlePilihQR}
//               onPilihManual={handlePilihManual}
//               onTidakBisaMengajar={handleTidakBisaMengajar}
//             />

//             <TidakBisaMengajar
//               isOpen={activeModal === "tidakBisa"}
//               onClose={() => setActiveModal(null)}
//               data={
//                 selectedSchedule
//                   ? {
//                       subject: selectedSchedule.subject,
//                       className: selectedSchedule.className,
//                       jurusan: selectedSchedule.jurusan,
//                       jam: selectedSchedule.jam,
//                       statusGuru: "Hadir",
//                     }
//                   : null
//               }
//               onSubmit={handleSubmitTidakBisaMengajar}
//               onPilihMetode={handlePilihMetodeDariTidakBisaMengajar}
//             />
//           </GuruLayout>
//         );
//     }
//   };

//   return renderPage();
// }

// // ==================== UTILITY FUNCTIONS ====================
// function getCurrentDate() {
//   const now = new Date();
//   const days = ["Minggu", "Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu"];
//   const months = [
//     "Januari",
//     "Februari",
//     "Maret",
//     "April",
//     "Mei",
//     "Juni",
//     "Juli",
//     "Agustus",
//     "September",
//     "Oktober",
//     "November",
//     "Desember",
//   ];

//   return {
//     day: days[now.getDay()],
//     date: now.getDate(),
//     month: months[now.getMonth()],
//     year: now.getFullYear(),
//     time: now.toLocaleTimeString("id-ID", {
//       hour: "2-digit",
//       minute: "2-digit",
//     }),
//   };
// }
