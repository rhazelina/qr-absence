import { useState, useEffect } from "react";
import { BookOpen, Users, Eye, QrCode } from "lucide-react";
import WalikelasLayout from "../../component/Walikelas/layoutwakel";
import { JadwalModal } from "../../component/Shared/Form/Jadwal";
import { MetodeGuru } from "../../component/Shared/Form/MetodeGuru";
import { TidakBisaMengajar } from "../../component/Shared/Form/TidakBisaMengajar";
import { InputAbsenWalikelas } from "./InputAbsenWalikelas";
import { KehadiranSiswaWakel } from "./KehadiranSiswaWakel";
import JadwalPengurus from "./JadwalPengurus";
import { RekapKehadiranSiswa } from "./RekapKehadiranSiswa";
import DaftarKetidakhadiranWaliKelas from "./DaftarKetidakhadiranWaliKelas";
import { usePopup } from "../../component/Shared/Popup/PopupProvider";
import { isCancellation } from "../../utils/errorHelpers";

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
  | "kehadiran-siswa"
  | "jadwal-pengurus"
  | "rekap-kehadiran-siswa"
  | "daftar-ketidakhadiran-walikelas";

type ModalType = "schedule" | "metode" | "tidakBisa" | null;

interface ScheduleItem {
  id: string;
  subject: string;
  className: string;
  jurusan?: string;
  jam?: string;
}

const PAGE_TITLES: Record<WalikelasPage, string> = {
  Beranda: "Beranda",
  "jadwal-anda": "Jadwal Anda",
  notifikasi: "Notifikasi",
  "input-manual": "Input Manual",
  "kehadiran-siswa": "Kehadiran Siswa",
  "jadwal-pengurus": "Jadwal Kelas",
  "rekap-kehadiran-siswa": "Rekap Kehadiran Siswa",
  "daftar-ketidakhadiran-walikelas": "Daftar Ketidakhadiran",
};

const BREAKPOINTS = {
  mobile: 768,
};

// Helper to format schedule from API
const formatScheduleFromAPI = (schedule: any): ScheduleItem => {
  const timeSlot = schedule.time_slot;
  const startTime = timeSlot?.start_time || '00:00';
  const endTime = timeSlot?.end_time || '00:00';

  return {
    id: schedule.id.toString(),
    subject: schedule.subject?.name || 'Mata Pelajaran',
    className: schedule.class?.name || 'Kelas',
    jurusan: schedule.class?.major?.name || '',
    jam: `${startTime} - ${endTime}`,
  };
};

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

  // ===== BAGIAN ATAS BARU (TETAP SEPERTI WALI KELAS) =====
  topInfoCard: (isMobile: boolean) => ({
    background: "white",
    borderRadius: "12px",
    padding: isMobile ? "16px 20px" : "20px 24px",
    display: "flex",
    alignItems: "center",
    gap: "16px",
    boxShadow: "0 4px 12px rgba(0, 0, 0, 0.08)",
    border: "1px solid #E5E7EB",
  }),

  iconContainer: {
    width: "40px",
    height: "40px",
    borderRadius: "8px",
    background: "#06254D",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },

  textContainer: {
    flex: 1,
    textAlign: "left" as const,
  },

  titleText: {
    color: "#06254D",
    fontSize: "18px",
    fontWeight: 700,
    marginBottom: "4px",
  },

  subtitleText: {
    color: "#6B7280",
    fontSize: "14px",
    fontWeight: 500,
  },

  // ===== CARD UNTUK SEMUA (KONSISTEN WARNA #06254D) =====
  dateTimeCard: (isMobile: boolean) => ({
    background: "#06254D",
    borderRadius: "14px",
    padding: isMobile ? "16px" : "20px",
    color: "#fff",
    display: "flex",
    flexDirection: "column" as const,
    gap: "10px",
    boxShadow: "0 4px 12px rgba(6, 37, 77, 0.3)",
  }),

  dateTimeRow: {
    display: "flex",
    gap: "10px",
    alignItems: "center",
  },

  dateTimeText: {
    fontSize: "14px",
    opacity: 0.9,
  },

  statCard: (isMobile: boolean) => ({
    background: "#06254D",
    borderRadius: "14px",
    padding: isMobile ? "16px" : "20px",
    color: "white",
    display: "flex",
    flexDirection: "column" as const,
    justifyContent: "space-between",
    gap: "14px",
    boxShadow: "0 4px 12px rgba(6, 37, 77, 0.3)",
  }),

  statHeader: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
  },

  statIcon: {
    width: "20px",
    height: "20px",
    color: "rgba(255,255,255,0.95)",
  },

  statLabel: {
    fontSize: "13px",
    fontWeight: "600",
    color: "rgba(255,255,255,0.95)",
  },

  statBadge: (isMobile: boolean) => ({
    backgroundColor: "rgba(255, 255, 255, 0.15)",
    borderRadius: "10px",
    padding: isMobile ? "8px 14px" : "10px 16px",
    fontSize: isMobile ? "15px" : "17px",
    fontWeight: 700,
    display: "inline-block",
    width: "fit-content",
    border: "1px solid rgba(255, 255, 255, 0.25)",
  }),

  topGrid: (isMobile: boolean) => ({
    display: "grid",
    gridTemplateColumns: isMobile ? "1fr" : "repeat(3, 1fr)",
    gap: isMobile ? "12px" : "16px",
    marginBottom: "8px",
  }),

  sectionTitle: (isMobile: boolean) => ({
    fontSize: isMobile ? "18px" : "20px",
    fontWeight: 700,
    color: "#06254D",
    marginBottom: "16px",
    textAlign: "left" as const,
  }),

  // ===== CARD JADWAL (KONSISTEN WARNA #06254D) =====
  scheduleCard: (isMobile: boolean) => ({
    display: "flex",
    alignItems: "center",
    gap: isMobile ? "12px" : "16px",
    padding: isMobile ? "14px 16px" : "18px 22px",
    background: "#06254D",
    borderRadius: "12px",
    border: "1px solid rgba(255, 255, 255, 0.1)",
    cursor: "pointer",
    transition: "all 0.3s ease",
    boxShadow: "0 4px 12px rgba(6, 37, 77, 0.3)",
  }),

  scheduleIconWrapper: (isMobile: boolean) => ({
    width: isMobile ? "44px" : "48px",
    height: isMobile ? "44px" : "48px",
    borderRadius: "12px",
    background: "rgba(255, 255, 255, 0.15)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
    border: "1px solid rgba(255, 255, 255, 0.25)",
  }),

  scheduleContent: {
    flex: 1,
    textAlign: "left" as const,
  },

  scheduleSubject: {
    fontSize: "16px",
    fontWeight: 700,
    color: "white",
    marginBottom: "4px",
  },

  scheduleDetail: {
    fontSize: "13px",
    fontWeight: 500,
    color: "rgba(255, 255, 255, 0.85)",
  },

  scheduleActions: {
    display: "flex",
    gap: "8px",
    alignItems: "center",
  },

  actionButton: {
    width: "36px",
    height: "36px",
    borderRadius: "8px",
    background: "rgba(255, 255, 255, 0.15)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    cursor: "pointer",
    transition: "all 0.2s ease",
    border: "1px solid rgba(255, 255, 255, 0.2)",
  },

  eyeButton: {
    width: "36px",
    height: "36px",
    borderRadius: "8px",
    background: "rgba(255, 255, 255, 0.15)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    cursor: "pointer",
    transition: "all 0.2s ease",
    border: "1px solid rgba(255, 255, 255, 0.2)",
  },
};

export default function DashboardWalliKelas({
  user,
  onLogout,
}: DashboardWalliKelasProps) {
  const { alert: popupAlert } = usePopup();
  const [isMobile, setIsMobile] = useState(
    typeof window !== "undefined" && window.innerWidth < BREAKPOINTS.mobile
  );
  const [currentPage, setCurrentPage] = useState<WalikelasPage>("Beranda");
  const [activeModal, setActiveModal] = useState<ModalType>(null);
  const [selectedSchedule, setSelectedSchedule] = useState<ScheduleItem | null>(null);
  const [currentTime, setCurrentTime] = useState<string>("");
  const [currentDate, setCurrentDate] = useState<string>("");
  const [iconStates, setIconStates] = useState<Record<string, "qr" | "eye">>({});

  // State untuk menyimpan data siswa yang dipilih
  const [siswaData, setSiswaData] = useState<{
    siswaName?: string;
    siswaIdentitas?: string;
  } | null>(null);

  // API Data State
  const [homeroomClass, setHomeroomClass] = useState<string>('Memuat...');
  const [totalStudents, setTotalStudents] = useState<number>(0);
  const [schedules, setSchedules] = useState<ScheduleItem[]>([]);
  const [isLoadingData, setIsLoadingData] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < BREAKPOINTS.mobile);
    };

    const updateTime = () => {
      const now = new Date();
      const timeStr = now.toLocaleTimeString("id-ID", {
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
      });
      const dateStr = now.toLocaleDateString("id-ID", {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
      });
      setCurrentTime(timeStr);
      setCurrentDate(dateStr);
    };

    window.addEventListener("resize", handleResize);
    updateTime();
    const timer = setInterval(updateTime, 1000);

    return () => {
      window.removeEventListener("resize", handleResize);
      clearInterval(timer);
    };
  }, []);

  // Fetch homeroom data
  useEffect(() => {
    const controller = new AbortController();

    const fetchHomeroomData = async () => {
      try {
        setIsLoadingData(true);
        setError(null);
        const { dashboardService } = await import('../../services/dashboard');

        // Fetch homeroom class info
        const classData = await dashboardService.getMyHomeroom({ signal: controller.signal });
        setHomeroomClass(classData.name || 'Kelas');

        // Fetch students count
        const students = await dashboardService.getMyHomeroomStudents({ signal: controller.signal });
        setTotalStudents(students.length);

        // Fetch schedules for today
        const today = new Date().toISOString().split('T')[0];
        const schedulesData = await dashboardService.getMyHomeroomSchedules(
          { date: today },
          { signal: controller.signal }
        );
        const formattedSchedules = schedulesData.map(formatScheduleFromAPI);
        setSchedules(formattedSchedules);
      } catch (error: any) {
        if (!isCancellation(error)) {
          console.error('Failed to fetch homeroom data:', error);
          setError('Gagal memuat data wali kelas (kelas/siswa/jadwal).');
        }
      } finally {
        setIsLoadingData(false);
      }
    };

    fetchHomeroomData();

    return () => controller.abort();
  }, []);

  const handleMenuClick = (page: string, payload?: any) => {
    setCurrentPage(page as WalikelasPage);

    // Jika page adalah daftar-ketidakhadiran-walikelas, simpan data siswa
    if (page === "daftar-ketidakhadiran-walikelas" && payload) {
      setSiswaData(payload);
    }

    setActiveModal(null);
  };


  const handleActionClick = (e: React.MouseEvent, item: ScheduleItem) => {
    e.stopPropagation();
    const currentState = iconStates[item.id] || "qr";

    if (currentState === "qr") {
      setIconStates({ ...iconStates, [item.id]: "eye" });
      setSelectedSchedule(item);
      setActiveModal("metode");
    } else {
      console.log("Navigasi ke kehadiran siswa untuk:", item);
      setCurrentPage("kehadiran-siswa");
    }
  };

  const handleEyeClick = () => {
    console.log("Navigasi ke Rekap Kehadiran");
    setCurrentPage("rekap-kehadiran-siswa");
  };

  const handleMulaiAbsen = () => {
    console.log("Mulai Absen diklik");
    setActiveModal("metode");
  };

  const handleTidakBisaMengajar = () => {
    console.log("Tidak Bisa Mengajar diklik");
    setActiveModal("tidakBisa");
  };

  const handlePilihQR = async () => {
    console.log("QR Code dipilih");
    await popupAlert("QR Code Absen akan ditampilkan di sini.");
    setActiveModal(null);
  };

  const handlePilihMetodeDariTidakBisaMengajar = () => {
    setActiveModal("metode");
  };

  const handleSubmitTidakBisaMengajar = async (data: {
    alasan: string;
    keterangan?: string;
    foto1?: File;
  }) => {
    console.log("Data tidak bisa mengajar:", data);
    await popupAlert(
      `Laporan berhasil dikirim!\nAlasan: ${data.alasan}\nKeterangan: ${data.keterangan || "-"}\nFoto: ${data.foto1 ? "Ada" : "Tidak ada"}`
    );
    setActiveModal(null);
  };

  // ========== RENDER HALAMAN BERDASARKAN CURRENT PAGE ==========
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

  if (currentPage === "jadwal-pengurus") {
    return (
      <JadwalPengurus
        user={{ name: user.name, phone: "1234567890" }}
        currentPage="jadwal-pengurus"
        onMenuClick={handleMenuClick}
        onLogout={onLogout}
      />
    );
  }

  if (currentPage === "rekap-kehadiran-siswa") {
    return (
      <RekapKehadiranSiswa
        user={user}
        onLogout={onLogout}
        currentPage={currentPage}
        onMenuClick={handleMenuClick}
      />
    );
  }

  // ========== TAMBAHAN: RENDER HALAMAN DAFTAR KETIDAKHADIRAN ==========
  if (currentPage === "daftar-ketidakhadiran-walikelas") {
    return (
      <DaftarKetidakhadiranWaliKelas
        user={user}
        currentPage={currentPage}
        onMenuClick={handleMenuClick}
        onLogout={onLogout}
        siswaName={siswaData?.siswaName}
        siswaIdentitas={siswaData?.siswaIdentitas}
      />
    );
  }

  // ========== RENDER HALAMAN BERANDA (DEFAULT) ==========
  return (
    <WalikelasLayout
      pageTitle={PAGE_TITLES[currentPage]}
      currentPage={currentPage}
      onMenuClick={handleMenuClick}
      user={user}
      onLogout={onLogout}
    >
      <div style={styles.mainContainer(isMobile)}>
        {/* ===== ERROR ALERT ===== */}
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
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" />
            </svg>
            <span>{error}</span>
          </div>
        )}

        {/* ===== BAGIAN ATAS (SELAMAT DATANG) - TETAP SEPERTI WALI KELAS ===== */}
        <div style={styles.topInfoCard(isMobile)}>
          <div style={styles.iconContainer}>
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M3 21H21M5 21V7L13 2L21 7V21M5 21H9M21 21H17M9 21V13H15V21M9 21H15"
                stroke="white"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>

          <div style={styles.textContainer}>
            <div style={styles.titleText}>
              Selamat Datang di Beranda, {user.name}
            </div>
            <div style={styles.subtitleText}>
              Kelola kelas Anda, pantau kehadiran siswa, dan input jadwal mengajar dengan mudah
            </div>
          </div>
        </div>

        {/* ===== TOP GRID (HARI/TANGGAL, WALI KELAS, TOTAL SISWA) - TETAP SEPERTI WALI KELAS ===== */}
        <div style={styles.topGrid(isMobile)}>
          {/* 1. Date & Time Card */}
          <div style={styles.dateTimeCard(isMobile)}>
            <div style={styles.dateTimeRow}>
              📅 <span style={styles.dateTimeText}>{currentDate || "Memuat..."}</span>
            </div>
            <div style={styles.dateTimeRow}>
              ⏰ <span style={styles.dateTimeText}>{currentTime || "00:00:00"}</span>
            </div>
            <div style={styles.dateTimeRow}>
              🎓 <span style={styles.dateTimeText}>Semester Genap</span>
            </div>
          </div>

          {/* 2. Wali Kelas Card */}
          <div style={styles.statCard(isMobile)}>
            <div style={styles.statHeader}>
              <BookOpen size={20} style={styles.statIcon} />
              <span style={styles.statLabel}>Wali Kelas</span>
            </div>
            <div style={styles.statBadge(isMobile)}>
              {isLoadingData ? 'Memuat...' : homeroomClass}
            </div>
          </div>

          {/* 3. Total Siswa Card */}
          <div style={styles.statCard(isMobile)}>
            <div style={styles.statHeader}>
              <Users size={20} style={styles.statIcon} />
              <span style={styles.statLabel}>Total Siswa</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', justifyContent: 'space-between' }}>
              <div style={styles.statBadge(isMobile)}>
                {isLoadingData ? '...' : totalStudents}
              </div>
              <div
                style={styles.eyeButton}
                onClick={handleEyeClick}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = "rgba(255, 255, 255, 0.25)";
                  e.currentTarget.style.transform = "scale(1.08)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = "rgba(255, 255, 255, 0.15)";
                  e.currentTarget.style.transform = "scale(1)";
                }}
              >
                <Eye size={20} color="white" strokeWidth={2} />
              </div>
            </div>
          </div>
        </div>

        {/* ===== JADWAL KELAS - FLOW SAMA SEPERTI GURU ===== */}
        <div>
          <h3 style={styles.sectionTitle(isMobile)}>Jadwal Kelas Anda</h3>
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {isLoadingData ? (
              <div style={{ textAlign: 'center', padding: '40px', color: '#6B7280' }}>
                Memuat jadwal...
              </div>
            ) : schedules.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '40px', color: '#6B7280' }}>
                Tidak ada jadwal hari ini
              </div>
            ) : (
              schedules.map((item) => (
                <div
                  key={item.id}
                  style={styles.scheduleCard(isMobile)}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.boxShadow = "0 8px 20px rgba(6, 37, 77, 0.4)";
                    e.currentTarget.style.transform = "translateY(-3px)";
                    e.currentTarget.style.backgroundColor = "#0A2E5C";
                    e.currentTarget.style.borderColor = "rgba(255, 255, 255, 0.2)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.boxShadow = "0 4px 12px rgba(6, 37, 77, 0.3)";
                    e.currentTarget.style.transform = "translateY(0)";
                    e.currentTarget.style.backgroundColor = "#06254D";
                    e.currentTarget.style.borderColor = "rgba(255, 255, 255, 0.1)";
                  }}
                >
                  <div style={styles.scheduleIconWrapper(isMobile)}>
                    <BookOpen size={isMobile ? 20 : 24} color="white" strokeWidth={2} />
                  </div>

                  <div style={styles.scheduleContent}>
                    <div style={styles.scheduleSubject}>
                      {item.subject}
                    </div>
                    <div style={styles.scheduleDetail}>
                      {item.className} • {item.jam}
                    </div>
                  </div>

                  {/* Action Icons (Hanya QR/Eye Toggle) */}
                  <div style={styles.scheduleActions}>
                    {/* Icon QR/Eye Toggle - untuk absensi - SAMA SEPERTI GURU */}
                    <div
                      onClick={(e) => handleActionClick(e, item)}
                      style={styles.actionButton}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.backgroundColor = "rgba(255, 255, 255, 0.25)";
                        e.currentTarget.style.transform = "scale(1.1)";
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor = "rgba(255, 255, 255, 0.15)";
                        e.currentTarget.style.transform = "scale(1)";
                      }}
                      title={
                        (iconStates[item.id] || "qr") === "qr"
                          ? "Presensi Kelas"
                          : "Lihat Kehadiran Siswa"
                      }
                    >
                      {(iconStates[item.id] || "qr") === "qr" ? (
                        <QrCode size={20} color="white" />
                      ) : (
                        <Eye size={20} color="white" strokeWidth={2} />
                      )}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* ========== MODALS (SAMA SEPERTI GURU) ========== */}

        {/* Modal Jadwal */}
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

        {/* Modal Metode */}
        <MetodeGuru
          isOpen={activeModal === "metode"}
          onClose={() => setActiveModal(null)}
          onPilihQR={handlePilihQR}
          onTidakBisaMengajar={handleTidakBisaMengajar}
        />

        {/* Modal Tidak Bisa Mengajar */}
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
      </div>
    </WalikelasLayout>
  );
}

