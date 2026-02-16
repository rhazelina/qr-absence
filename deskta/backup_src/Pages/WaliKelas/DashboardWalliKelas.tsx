import { useState, useEffect } from "react";
import { Calendar, Clock, BookOpen, Users, Eye, QrCode } from "lucide-react";
import WalikelasLayout from "../../component/Walikelas/layoutwakel";
import { JadwalModal } from "../../component/Shared/Form/Jadwal";
import { MetodeGuru } from "../../component/Shared/Form/MetodeGuru";
import { TidakBisaMengajar } from "../../component/Shared/Form/TidakBisaMengajar";
import { InputAbsenWalikelas } from "./InputAbsenWalikelas";
import { KehadiranSiswaWakel } from "./KehadiranSiswaWakel";

// ==================== INTERFACES ====================
interface DashboardWalliKelasProps {
  user: { name: string; role: string };
  onLogout: () => void;
}

type WalikelasPage =
  | "Beranda"
  | "jadwal-anda"
  | "notifikasi"
  | "input-manual"
  | "kehadiran-siswa";

interface ScheduleItem {
  id: string;
  subject: string;
  className: string;
  jurusan?: string;
  jam?: string;
}

const PAGE_TITLES: Record<WalikelasPage, string> = {
  Beranda: "Dashboard",
  "jadwal-anda": "Jadwal Anda",
  notifikasi: "Notifikasi",
  "input-manual": "Input Manual",
  "kehadiran-siswa": "Kehadiran Siswa",
};

const BREAKPOINTS = {
  mobile: 768,
};

// dummy schedule
const DUMMY_SCHEDULE: ScheduleItem[] = [
  {
    id: "1",
    subject: "Matematika",
    className: "X Mekatronika 1",
    jurusan: "Mekatronika",
    jam: "08:00 - 09:00",
  },
  {
    id: "2",
    subject: "Bahasa Indonesia",
    className: "X Mekatronika 2",
    jurusan: "Mekatronika",
    jam: "09:00 - 10:00",
  },
  {
    id: "3",
    subject: "Fisika",
    className: "X Elektronika 1",
    jurusan: "Elektronika",
    jam: "10:00 - 11:00",
  },
];

const styles = {
  mainContainer: (isMobile: boolean) => ({
    position: "relative" as const,
    zIndex: 1,
    display: "flex",
    flexDirection: "column" as const,
    gap: isMobile ? 20 : 28,
    padding: isMobile ? "16px" : "28px",
    backgroundColor: "#F9FAFB",
    minHeight: "100vh",
  }),

  topGrid: (isMobile: boolean) => ({
    display: "grid" as const,
    gridTemplateColumns: isMobile ? "1fr" : "repeat(4, 1fr)",
    gap: isMobile ? 12 : 16,
    marginBottom: 8,
  }),

  userCard: (isMobile: boolean) => ({
    position: "relative" as const,
    padding: isMobile ? "16px" : "20px",
    background: "linear-gradient(135deg, #1E3A8A 0%, #1E40AF 100%)",
    borderRadius: "14px",
    color: "white",
    display: "flex",
    alignItems: "center",
    gap: "16px",
    overflow: "hidden",
    boxShadow: "0 4px 16px rgba(30, 58, 138, 0.3)",
    gridColumn: isMobile ? "1" : "span 2",
  }),

  decorativeCircle: {
    position: "absolute" as const,
    width: "140px",
    height: "140px",
    borderRadius: "50%",
    background: "rgba(255, 255, 255, 0.08)",
    top: "-50px",
    right: "-50px",
  },

  userIcon: (isMobile: boolean) => ({
    position: "relative" as const,
    zIndex: 1,
    width: isMobile ? "44px" : "52px",
    height: isMobile ? "44px" : "52px",
    borderRadius: "12px",
    background: "rgba(255, 255, 255, 0.15)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
    border: "2px solid rgba(255, 255, 255, 0.25)",
  }),

  dateTimeCard: (isMobile: boolean) => ({
    position: "relative" as const,
    padding: isMobile ? "16px" : "20px",
    background: "linear-gradient(135deg, #6366F1 0%, #4F46E5 100%)",
    borderRadius: "14px",
    color: "white",
    display: "flex",
    flexDirection: "column" as const,
    gap: "14px",
    boxShadow: "0 4px 16px rgba(99, 102, 241, 0.3)",
  }),

  infoCard: (isMobile: boolean, color: string) => ({
    position: "relative" as const,
    padding: isMobile ? "16px" : "20px",
    background: color,
    borderRadius: "14px",
    color: "white",
    display: "flex",
    flexDirection: "column" as const,
    justifyContent: "space-between",
    gap: "14px",
    boxShadow: `0 4px 16px rgba(0, 0, 0, 0.1)`,
  }),

  infoBadge: (isMobile: boolean) => ({
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    borderRadius: "10px",
    padding: isMobile ? "8px 14px" : "10px 16px",
    fontSize: isMobile ? "15px" : "17px",
    fontWeight: 700,
    display: "inline-block",
    width: "fit-content",
    border: "1px solid rgba(255, 255, 255, 0.3)",
  }),

  sectionTitle: (isMobile: boolean) => ({
    fontSize: isMobile ? "18px" : "20px",
    fontWeight: 700,
    color: "#111827",
    marginBottom: 16,
  }),

  scheduleCard: (isMobile: boolean) => ({
    display: "flex",
    alignItems: "center",
    gap: isMobile ? "12px" : "16px",
    padding: isMobile ? "14px 16px" : "18px 22px",
    background: "#FFFFFF",
    borderRadius: "12px",
    border: "1px solid #E5E7EB",
    cursor: "pointer",
    transition: "all 0.3s ease",
    boxShadow: "0 1px 4px rgba(0, 0, 0, 0.05)",
  }),

  bookIconWrapper: (isMobile: boolean) => ({
    width: isMobile ? "44px" : "48px",
    height: isMobile ? "44px" : "48px",
    borderRadius: 12,
    background: "linear-gradient(135deg, #2563EB 0%, #1E40AF 100%)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
    boxShadow: "0 2px 8px rgba(37, 99, 235, 0.25)",
  }),

  actionButton: {
    width: 40,
    height: 40,
    borderRadius: 10,
    backgroundColor: "#F3F4F6",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    cursor: "pointer",
    transition: "all 0.3s",
    border: "1px solid #E5E7EB",
  },
};

export default function DashboardWalliKelas({
  user,
  onLogout,
}: DashboardWalliKelasProps) {
  const [currentPage, setCurrentPage] = useState<WalikelasPage>("Beranda");
  const [currentDateStr, setCurrentDateStr] = useState("");
  const [currentTimeStr, setCurrentTimeStr] = useState("");
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);
  const [selectedSchedule, setSelectedSchedule] = useState<ScheduleItem | null>(null);
  const [activeModal, setActiveModal] = useState<"schedule" | "metode" | "tidakBisa" | null>(null);

  // Responsive handler
  useEffect(() => {
    const handleResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const isMobile = windowWidth < BREAKPOINTS.mobile;

  // Real-time Clock
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
        now.toLocaleTimeString("id-ID", {
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
        })
      );
    };

    updateDateTime();
    const interval = setInterval(updateDateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  const handleMenuClick = (page: string) => {
    setCurrentPage(page as WalikelasPage);
  };

  const handleEyeClick = () => {
    setCurrentPage("kehadiran-siswa");
  };

  // ========== MODAL HANDLERS ==========
  const handleQRClick = (e: React.MouseEvent, schedule: ScheduleItem) => {
    e.stopPropagation();
    setSelectedSchedule(schedule);
    setActiveModal("metode");
  };

  const handlePilihQR = () => {
    setActiveModal("schedule");
  };

  const handlePilihManual = () => {
    setActiveModal(null);
    setCurrentPage("input-manual");
  };

  const handleTidakBisaMengajar = () => {
    setActiveModal("tidakBisa");
  };

  const handleMulaiAbsen = () => {
    setActiveModal(null);
    setCurrentPage("input-manual");
  };

  const handleSubmitTidakBisaMengajar = (data: {
    alasan: string;
    keterangan?: string;
    foto1?: File;
  }) => {
    console.log("Data tidak bisa mengajar:", data);
    alert("Laporan berhasil dikirim!");
    setActiveModal(null);
  };

  if (currentPage === "input-manual") {
    return (
      <InputAbsenWalikelas
        user={user}
        onLogout={onLogout}
        currentPage={currentPage}
        onMenuClick={handleMenuClick}
      />
    );
  }

  if (currentPage === "kehadiran-siswa") {
    return (
      <KehadiranSiswaWakel
        user={user}
        onLogout={onLogout}
        currentPage={currentPage}
        onMenuClick={handleMenuClick}
      />
    );
  }

  return (
    <WalikelasLayout
      pageTitle={PAGE_TITLES[currentPage]}
      currentPage={currentPage}
      onMenuClick={handleMenuClick}
      user={user}
      onLogout={onLogout}
    >
      <div style={styles.mainContainer(isMobile)}>
        {/* Top Grid: 4 Column Layout */}
        <div style={styles.topGrid(isMobile)}>
          {/* 1. User Info Card (Spans 2 on desktop) */}
          <div style={styles.userCard(isMobile)}>
            <div style={styles.decorativeCircle} />
            <div style={styles.userIcon(isMobile)}>
              <svg
                width={isMobile ? "28" : "32"}
                height={isMobile ? "28" : "32"}
                viewBox="0 0 24 24"
                fill="none"
                stroke="#FFFFFF"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                <circle cx="12" cy="7" r="4" />
              </svg>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 4, zIndex: 1 }}>
              <span style={{ fontSize: isMobile ? "16px" : "18px", fontWeight: 700, color: "#FFFFFF" }}>
                {user.name}
              </span>
              {/* REMOVED SUBTITLE AS REQUESTED */}
            </div>
          </div>

          {/* 2. Date & Time Card */}
          <div style={styles.dateTimeCard(isMobile)}>
            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              <Calendar size={24} strokeWidth={1.5} />
              <span style={{ fontSize: "14px", fontWeight: "600", color: "rgba(255,255,255,0.95)" }}>
                {currentDateStr || "Memuat..."}
              </span>
            </div>

            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              <Clock size={24} strokeWidth={1.5} />
              <span style={{ fontSize: "20px", fontWeight: "700", letterSpacing: "0.5px", color: "#FFFFFF" }}>
                {currentTimeStr || "00:00:00"}
              </span>
            </div>
          </div>

          {/* 3. Kelas Asuh Card */}
          <div style={styles.infoCard(isMobile, "linear-gradient(135deg, #10B981 0%, #059669 100%)")}>
            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              <BookOpen size={20} />
              <span style={{ fontSize: "13px", fontWeight: "600", color: "rgba(255,255,255,0.95)" }}>
                Wali Kelas
              </span>
            </div>
            <div style={styles.infoBadge(isMobile)}>
              X Mekatronika 1
            </div>
          </div>

          {/* 4. Total Siswa Card */}
          <div style={styles.infoCard(isMobile, "linear-gradient(135deg, #F59E0B 0%, #D97706 100%)")}>
            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              <Users size={20} />
              <span style={{ fontSize: "13px", fontWeight: "600", color: "rgba(255,255,255,0.95)" }}>
                Total Siswa
              </span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', justifyContent: 'space-between' }}>
              <div style={styles.infoBadge(isMobile)}>
                40
              </div>
              <div style={{
                backgroundColor: "rgba(255, 255, 255, 0.2)",
                borderRadius: "10px",
                width: 40,
                height: 40,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                cursor: "pointer",
                transition: "all 0.2s",
                border: "1px solid rgba(255,255,255,0.3)"
              }}
                onClick={handleEyeClick}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = "rgba(255, 255, 255, 0.3)";
                  e.currentTarget.style.transform = "scale(1.08)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = "rgba(255, 255, 255, 0.2)";
                  e.currentTarget.style.transform = "scale(1)";
                }}
              >
                <Eye size={20} color="white" strokeWidth={2} />
              </div>
            </div>
          </div>
        </div>

        {/* Schedule Section */}
        <div>
          <h3 style={styles.sectionTitle(isMobile)}>Jadwal Kelas Anda</h3>
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {DUMMY_SCHEDULE.map((item) => (
              <div
                key={item.id}
                style={styles.scheduleCard(isMobile)}
                onMouseEnter={(e) => {
                  e.currentTarget.style.boxShadow = "0 8px 20px rgba(0, 0, 0, 0.12)";
                  e.currentTarget.style.transform = "translateY(-3px)";
                  e.currentTarget.style.backgroundColor = "#F9FAFB";
                  e.currentTarget.style.borderColor = "#BFDBFE";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.boxShadow = "0 1px 4px rgba(0, 0, 0, 0.05)";
                  e.currentTarget.style.transform = "translateY(0)";
                  e.currentTarget.style.backgroundColor = "#FFFFFF";
                  e.currentTarget.style.borderColor = "#E5E7EB";
                }}
              >
                <div style={styles.bookIconWrapper(isMobile)}>
                  <BookOpen size={isMobile ? 20 : 24} color="white" strokeWidth={2} />
                </div>

                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: "16px", fontWeight: 700, color: "#111827", marginBottom: 4 }}>
                    {item.subject}
                  </div>
                  <div style={{ fontSize: "13px", color: "#6B7280", fontWeight: 500 }}>
                    {item.className} • {item.jam}
                  </div>
                </div>

                {/* Action Icon (QR) */}
                <div
                  onClick={(e) => handleQRClick(e, item)}
                  style={styles.actionButton}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = "#DBEAFE";
                    e.currentTarget.style.transform = "scale(1.1)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = "#F3F4F6";
                    e.currentTarget.style.transform = "scale(1)";
                  }}
                >
                  <QrCode size={20} color="#2563EB" />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Modals */}
        {activeModal === "metode" && (
          <MetodeGuru
            isOpen={true}
            onClose={() => setActiveModal(null)}
            onPilihQR={handlePilihQR}
            onPilihManual={handlePilihManual}
            onTidakBisaMengajar={handleTidakBisaMengajar}
          />
        )}

        {activeModal === "schedule" && (
          <JadwalModal
            isOpen={true}
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
                : { subject: "", className: "" }
            }
            onMulaiAbsen={handleMulaiAbsen}
            onTidakBisaMengajar={handleTidakBisaMengajar}
          />
        )}

        {activeModal === "tidakBisa" && (
          <TidakBisaMengajar
            isOpen={true}
            onClose={() => setActiveModal(null)}
            data={
              selectedSchedule
                ? {
                  subject: selectedSchedule.subject,
                  className: selectedSchedule.className,
                  jurusan: selectedSchedule.jurusan,
                  jam: selectedSchedule.jam,
                }
                : { subject: "", className: "" }
            }
            onSubmit={handleSubmitTidakBisaMengajar}
            onPilihMetode={() => setActiveModal("metode")}
          />
        )}

      </div>
    </WalikelasLayout>
  );
}
