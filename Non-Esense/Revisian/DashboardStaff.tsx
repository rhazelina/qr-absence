import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import StaffLayout from "../../component/WakaStaff/StaffLayout";
import JadwalKelasStaff from "./JadwalKelasStaff";
import JadwalGuruStaff from "./JadwalGuruStaff";
import DetailGuru from "./LihatGuru";
import DetailKelas from "./LihatKelas";
import KehadiranGuru from "./KehadiranGuru";
import KehadiranSiswa from "./KehadiranSiswa";
import DetailSiswaStaff from "./DetailSiswaStaff";
import DetailKehadiranGuru from "./DetailKehadiranGuru";
import RekapKehadiranSiswa from "./RekapKehadiranSiswa";
import DaftarKetidakhadiran from "./DaftarKetidakhadiran";
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
import { Line, Bar } from "react-chartjs-2";

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

interface DashboardStaffProps {
  user: { name: string; role: string; phone?: string };
  onLogout: () => void;
}

type WakaPage =
  | "dashboard"
  | "jadwal-kelas"
  | "jadwal-guru"
  | "kehadiran-siswa"
  | "kehadiran-guru"
  | "guru-pengganti"
  | "lihat-guru"
  | "lihat-kelas"
  | "detail-siswa-staff"
  | "detail-kehadiran-guru"
  | "rekap-kehadiran-siswa"
  | "daftar-ketidakhadiran";

type StatisticType = "tepat-waktu" | "terlambat" | "izin" | "sakit" | "pulang" | "dispensasi" | null;

const PAGE_TITLES: Record<WakaPage, string> = {
  dashboard: "Dashboard",
  "jadwal-kelas": "Jadwal Kelas",
  "jadwal-guru": "Jadwal Guru",
  "kehadiran-siswa": "Kehadiran Siswa",
  "kehadiran-guru": "Kehadiran Guru",
  "guru-pengganti": "Daftar Guru Pengganti",
  "lihat-guru": "Detail Guru",
  "lihat-kelas": "Detail Kelas",
  "detail-siswa-staff": "Detail Siswa Staff",
  "detail-kehadiran-guru": "Detail Kehadiran Guru",
  "rekap-kehadiran-siswa": "Rekap Kehadiran Siswa",
  "daftar-ketidakhadiran": "Daftar Ketidakhadiran",
};

// Dummy data untuk total guru = 15 per hari
const dailyAttendanceData = [
  { day: "Senin", hadir: 14, tidak_hadir: 0, izin: 1, sakit: 0, pulang: 0 },
  { day: "Selasa", hadir: 14, tidak_hadir: 0, izin: 1, sakit: 0, pulang: 0 },
  { day: "Rabu", hadir: 15, tidak_hadir: 0, izin: 0, sakit: 0, pulang: 0 },
  { day: "Kamis", hadir: 13, tidak_hadir: 1, izin: 1, sakit: 0, pulang: 0 },
  { day: "Jumat", hadir: 14, tidak_hadir: 0, izin: 0, sakit: 1, pulang: 0 },
];

// Dummy data untuk siswa = 360 per hari (dengan dispensasi)
const dailyAttendanceDataSiswa = [
  { day: "Senin",  hadir: 335, tidak_hadir: 5, izin: 8, sakit: 7, pulang: 0, dispensasi: 5 },
  { day: "Selasa", hadir: 340, tidak_hadir: 3, izin: 6, sakit: 6, pulang: 0, dispensasi: 5 },
  { day: "Rabu",   hadir: 344, tidak_hadir: 2, izin: 5, sakit: 3, pulang: 0, dispensasi: 6 },
  { day: "Kamis",  hadir: 330, tidak_hadir: 8, izin: 7, sakit: 7, pulang: 0, dispensasi: 8 },
  { day: "Jumat",  hadir: 336, tidak_hadir: 4, izin: 9, sakit: 5, pulang: 0, dispensasi: 6 },
];

// Monthly data guru
const monthlyAttendance = [
  { month: "Jan", hadir: 70, izin: 3, tidak_hadir: 2, sakit: 2, pulang: 0 },
  { month: "Feb", hadir: 67, izin: 4, tidak_hadir: 3, sakit: 1, pulang: 0 },
  { month: "Mar", hadir: 72, izin: 2, tidak_hadir: 1, sakit: 2, pulang: 1 },
  { month: "Apr", hadir: 73, izin: 2, tidak_hadir: 1, sakit: 2, pulang: 1 },
  { month: "Mei", hadir: 74, izin: 2, tidak_hadir: 1, sakit: 1, pulang: 0 },
  { month: "Jun", hadir: 71, izin: 3, tidak_hadir: 2, sakit: 2, pulang: 0 },
];

// Monthly data siswa (dengan dispensasi)
const monthlyAttendanceSiswa = [
  { month: "Jan", hadir: 1650, izin: 45, tidak_hadir: 30, sakit: 25, pulang: 0, dispensasi: 30 },
  { month: "Feb", hadir: 1620, izin: 50, tidak_hadir: 40, sakit: 20, pulang: 0, dispensasi: 28 },
  { month: "Mar", hadir: 1668, izin: 38, tidak_hadir: 22, sakit: 20, pulang: 0, dispensasi: 32 },
  { month: "Apr", hadir: 1678, izin: 35, tidak_hadir: 18, sakit: 17, pulang: 0, dispensasi: 29 },
  { month: "Mei", hadir: 1690, izin: 30, tidak_hadir: 15, sakit: 15, pulang: 0, dispensasi: 25 },
  { month: "Jun", hadir: 1658, izin: 42, tidak_hadir: 25, sakit: 23, pulang: 0, dispensasi: 27 },
];

const statCardsGuru = [
  { id: "tepat-waktu", label: "Tepat Waktu", value: "425", color: "#1FA83D", icon: "✓" },
  { id: "terlambat", label: "Terlambat", value: "8", color: "#ACA40D", icon: "⏱" },
  { id: "izin", label: "Izin", value: "16", color: "#520C8F", icon: "📋" },
  { id: "sakit", label: "Sakit", value: "10", color: "#D90000", icon: "🏥" },
  { id: "pulang", label: "Pulang", value: "2", color: "#2F85EB", icon: "🚪" },
];

const statCardsSiswa = [
  { id: "tepat-waktu",  label: "Tepat Waktu",  value: "8.520", color: "#1FA83D", icon: "✓"  },
  { id: "terlambat",   label: "Terlambat",     value: "142",   color: "#ACA40D", icon: "⏱"  },
  { id: "izin",        label: "Izin",          value: "240",   color: "#520C8F", icon: "📋" },
  { id: "sakit",       label: "Sakit",         value: "120",   color: "#D90000", icon: "🏥" },
  { id: "dispensasi",  label: "Dispensasi",    value: "30",    color: "#E45A92", icon: "📄" },
  { id: "pulang",      label: "Pulang",        value: "18",    color: "#2F85EB", icon: "🚪" },
];

const statCards = statCardsGuru;

const historyInfo = {
  date: "Senin, 7 Januari 2026",
  start: "07:00:00",
  end: "15:00:00",
  time: "08:00",
};

const cardStyle: React.CSSProperties = {
  backgroundColor: "#FFFFFF",
  borderRadius: "20px",
  padding: "24px",
  boxShadow: "0 2px 8px rgba(0, 0, 0, 0.06), 0 8px 24px rgba(0, 0, 0, 0.08)",
  border: "1px solid rgba(229, 231, 235, 0.8)",
  backdropFilter: "blur(10px)",
  transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
};

const COLORS = {
  HADIR:       "#1FA83D",  // HIJAU  - Hadir
  IZIN:        "#ACA40D",  // KUNING - Izin
  PULANG:      "#2F85EB",  // BIRU   - Pulang
  TIDAK_HADIR: "#D90000",  // MERAH  - Alfa
  SAKIT:       "#520C8F",  // UNGU   - Sakit
  DISPENSASI:  "#E45A92",  // PINK   - Dispensasi
};

export default function DashboardStaff({ user, onLogout }: DashboardStaffProps) {
  const [currentPage, setCurrentPage] = useState<WakaPage>("dashboard");
  const [selectedGuru, setSelectedGuru] = useState<string | null>(null);
  const [selectedKelas, setSelectedKelas] = useState<string | null>(null);
  const [selectedKelasId, setSelectedKelasId] = useState<string | null>(null);
  const [selectedKelasInfo, setSelectedKelasInfo] = useState<{
    namaKelas: string;
    waliKelas: string;
  } | null>(null);
  const [selectedSiswa, setSelectedSiswa] = useState<{
    name: string;
    identitas: string;
  } | null>(null);
  const [selectedStat, setSelectedStat] = useState<StatisticType>(null);
  const [filterMode, setFilterMode] = useState<"guru" | "siswa">("guru");
  const [currentDate, setCurrentDate] = useState("");
  const [currentTime, setCurrentTime] = useState("");

  const navigate = useNavigate();

  useEffect(() => {
    const updateDateTime = () => {
      const now = new Date();
      const options: Intl.DateTimeFormatOptions = {
        weekday: "long",
        day: "numeric",
        month: "long",
        year: "numeric",
      };
      setCurrentDate(now.toLocaleDateString("id-ID", options));
      setCurrentTime(
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

  const handleMenuClick = (page: string, payload?: any) => {
    setCurrentPage(page as WakaPage);
    
    // Handle payload untuk daftar-ketidakhadiran
    if (page === "daftar-ketidakhadiran" && payload) {
      setSelectedSiswa({
        name: payload.siswaName,
        identitas: payload.siswaIdentitas,
      });
    }
  };

  const handleLogout = () => {
    if (window.confirm("Apakah Anda yakin ingin keluar?")) {
      onLogout();
      navigate("/");
    }
  };

  const commonProps = {
    user,
    onLogout: handleLogout,
    currentPage,
    onMenuClick: handleMenuClick,
  };

  const renderPage = () => {
    switch (currentPage) {
      case "jadwal-kelas":
        return (
          <JadwalKelasStaff
            {...commonProps}
            onselectKelas={(kelasId: string) => {
              setSelectedKelas(kelasId);
              handleMenuClick("lihat-kelas");
            }}
          />
        );

      case "jadwal-guru":
        return (
          <JadwalGuruStaff
            {...commonProps}
            onselectGuru={(guruId: string) => {
              setSelectedGuru(guruId);
              handleMenuClick("lihat-guru");
            }}
          />
        );

      case "lihat-guru":
        return (
          <DetailGuru
            {...commonProps}
            namaGuru={selectedGuru || undefined}
            onBack={() => handleMenuClick("jadwal-guru")}
          />
        );

      case "lihat-kelas":
        return (
          <DetailKelas
            {...commonProps}
            kelas={selectedKelas || undefined}
            onBack={() => handleMenuClick("jadwal-kelas")}
          />
        );

      case "kehadiran-siswa":
        return (
          <KehadiranSiswa
            {...commonProps}
            onNavigateToDetail={(kelasId: string, kelasInfo: { namaKelas: string; waliKelas: string }) => {
              setSelectedKelasId(kelasId);
              setSelectedKelasInfo(kelasInfo);
              handleMenuClick("detail-siswa-staff");
            }}
          />
        );

      case "detail-siswa-staff":
        return (
          <DetailSiswaStaff
            {...commonProps}
            kelasId={selectedKelasId || undefined}
            onBack={() => handleMenuClick("kehadiran-siswa")}
          />
        );

      case "kehadiran-guru":
        return (
          <KehadiranGuru
            {...commonProps}
            onNavigateToDetail={() => {
              handleMenuClick("detail-kehadiran-guru");
            }}
          />
        );

      case "detail-kehadiran-guru":
        return (
          <DetailKehadiranGuru
            {...commonProps}
            onBack={() => handleMenuClick("kehadiran-guru")}
          />
        );

      case "rekap-kehadiran-siswa":
        return (
          <RekapKehadiranSiswa
            {...commonProps}
            namaKelas={selectedKelasInfo?.namaKelas || "X Mekatronika 1"}
            waliKelas={selectedKelasInfo?.waliKelas || "Ewit Erniyah S.pd"}
            onBack={() => handleMenuClick("detail-siswa-staff")}
          />
        );

      case "daftar-ketidakhadiran":
        return (
          <DaftarKetidakhadiran
            {...commonProps}
            siswaName={selectedSiswa?.name}
            siswaIdentitas={selectedSiswa?.identitas}
            onBack={() => handleMenuClick("rekap-kehadiran-siswa")}
          />
        );

      case "guru-pengganti":
        return (
          <StaffLayout
            pageTitle={PAGE_TITLES[currentPage]}
            currentPage={currentPage}
            onMenuClick={handleMenuClick}
            user={user}
            onLogout={handleLogout}
          >
            <ComingSoon title={PAGE_TITLES[currentPage]} />
          </StaffLayout>
        );

      case "dashboard":
      default:
        return (
          <StaffLayout
            pageTitle="Beranda"
            currentPage={currentPage}
            onMenuClick={handleMenuClick}
            user={user}
            onLogout={handleLogout}
          >
            <div style={{ display: "flex", flexDirection: "column", gap: "28px", backgroundColor: "#F9FAFB", padding: "4px" }}>
              {/* Welcome Section */}
              <div style={{ marginBottom: "8px" }}>
                <h2 style={{ fontSize: "24px", fontWeight: "700", color: "#111827", margin: 0 }}>
                  Selamat Datang, {user.name}
                </h2>
                <p style={{ fontSize: "14px", color: "#6B7280", margin: "4px 0 0" }}>
                  Ringkasan aktivitas dan data kehadiran {filterMode === "guru" ? "guru" : "siswa"} hari ini
                </p>
              </div>

              {/* Filter Toggle Siswa / Guru */}
              <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                <span style={{ fontSize: "14px", fontWeight: 600, color: "#374151" }}>Tampilkan Data:</span>
                <div
                  style={{
                    display: "flex",
                    backgroundColor: "#F3F4F6",
                    borderRadius: "12px",
                    padding: "4px",
                    gap: "4px",
                  }}
                >
                  {(["guru", "siswa"] as const).map((mode) => (
                    <button
                      key={mode}
                      onClick={() => { setFilterMode(mode); setSelectedStat(null); }}
                      style={{
                        padding: "8px 20px",
                        borderRadius: "8px",
                        border: "none",
                        cursor: "pointer",
                        fontSize: "14px",
                        fontWeight: 600,
                        transition: "all 0.2s ease",
                        backgroundColor: filterMode === mode ? "#1D4ED8" : "transparent",
                        color: filterMode === mode ? "#FFFFFF" : "#6B7280",
                        boxShadow: filterMode === mode ? "0 2px 8px rgba(29,78,216,0.3)" : "none",
                      }}
                    >
                      {mode === "guru" ? "👨‍🏫 Guru" : "🎒 Siswa"}
                    </button>
                  ))}
                </div>
              </div>

              {/* Top Section: History & Statistics */}
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fit, minmax(340px, 1fr))",
                  gap: "24px",
                }}
              >
                {/* Riwayat Kehadiran Card */}
                <div style={cardStyle}>
                  <SectionHeader
                    title={filterMode === "guru" ? "Riwayat Kehadiran" : "Info Kehadiran Hari Ini"}
                    subtitle={`${currentDate} • ${currentTime}`}
                  />
                  <HistoryCard
                    start={historyInfo.start}
                    end={historyInfo.end}
                    mode={filterMode}
                  />
                </div>

                {/* Statistik Kehadiran Card */}
                <div style={cardStyle}>
                  <SectionHeader
                    title={`Statistik Kehadiran ${filterMode === "guru" ? "Guru" : "Siswa"}`}
                    subtitle="Klik untuk melihat detail"
                  />
                  <StatisticsGrid 
                    statCards={filterMode === "guru" ? statCardsGuru : statCardsSiswa} 
                    selectedStat={selectedStat}
                    onSelectStat={setSelectedStat}
                    mode={filterMode}
                  />
                  {selectedStat && (
                    <StatisticDetail stat={selectedStat} mode={filterMode} />
                  )}
                </div>
              </div>

              {/* Grafik Section */}
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))",
                  gap: "24px",
                }}
              >
                {/* Weekly Chart */}
                <div style={cardStyle}>
                  <SectionHeader
                    title={`Grafik Kehadiran ${filterMode === "guru" ? "Guru" : "Siswa"} Harian`}
                    subtitle="Rekap Mingguan (Senin - Jumat)"
                  />
                  <WeeklyBarGraph data={filterMode === "guru" ? dailyAttendanceData : dailyAttendanceDataSiswa} mode={filterMode} />
                </div>

                {/* Monthly Chart */}
                <div style={{
                  ...cardStyle,
                  transition: "all 0.3s ease",
                }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = "translateY(-4px)";
                    e.currentTarget.style.boxShadow = "0 8px 30px rgba(0, 31, 62, 0.12)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = "translateY(0)";
                    e.currentTarget.style.boxShadow = "0 4px 20px rgba(0, 0, 0, 0.08)";
                  }}>
                  <SectionHeader
                    title={`Grafik Kehadiran ${filterMode === "guru" ? "Guru" : "Siswa"} Bulanan`}
                    subtitle="Periode Jan - Jun"
                  />
                  <MonthlyLineChart data={filterMode === "guru" ? monthlyAttendance : monthlyAttendanceSiswa} mode={filterMode} />
                </div>
              </div>

            </div>
          </StaffLayout>
        );
    }
  };

  return renderPage();
}

function SectionHeader({ title, subtitle }: { title: string; subtitle?: string }) {
  return (
    <div style={{ marginBottom: "20px" }}>
      <h2
        style={{
          margin: 0,
          fontSize: "18px",
          fontWeight: 700,
          color: "#111827",
          letterSpacing: "-0.5px",
        }}
      >
        {title}
      </h2>
      {subtitle && (
        <p style={{ margin: "6px 0 0", fontSize: "13px", color: "#6B7280", fontWeight: 500 }}>
          {subtitle}
        </p>
      )}
    </div>
  );
}

function LegendDot({ color, label }: { color: string; label: string }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
      <span
        style={{
          width: "10px",
          height: "10px",
          borderRadius: "999px",
          backgroundColor: color,
          display: "inline-block",
          flexShrink: 0,
        }}
      />
      <span style={{ fontSize: "12px", color: "#4B5563", fontWeight: 500 }}>{label}</span>
    </div>
  );
}

function StatisticsGrid({ 
  statCards, 
  selectedStat,
  onSelectStat,
  mode = "guru",
}: { 
  statCards: typeof statCardsGuru;
  selectedStat: StatisticType;
  onSelectStat: (stat: StatisticType) => void;
  mode?: "guru" | "siswa";
}) {
  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(85px, 1fr))",
        gap: "12px",
        maxWidth: "100%",
        overflow: "hidden",
      }}
    >
      {statCards.map((item) => (
        <div
          key={item.id}
          onClick={() => onSelectStat(selectedStat === item.id ? null : (item.id as StatisticType))}
          style={{
            border: `2px solid ${selectedStat === item.id ? item.color : item.color + "20"}`,
            borderRadius: "12px",
            padding: "14px 12px",
            textAlign: "center",
            backgroundColor: selectedStat === item.id ? item.color + "15" : item.color + "08",
            transition: "all 0.2s ease",
            cursor: "pointer",
            position: "relative",
            overflow: "hidden",
            transform: selectedStat === item.id ? "scale(1.05)" : "scale(1)",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = item.color + "20";
            e.currentTarget.style.borderColor = item.color;
            e.currentTarget.style.transform = "translateY(-2px)";
          }}
          onMouseLeave={(e) => {
            if (selectedStat !== item.id) {
              e.currentTarget.style.backgroundColor = item.color + "08";
              e.currentTarget.style.borderColor = item.color + "20";
            }
            e.currentTarget.style.transform = selectedStat === item.id ? "scale(1.05)" : "translateY(0)";
          }}
        >
          <p
            style={{
              margin: 0,
              fontSize: "11px",
              color: "#6B7280",
              fontWeight: 600,
              marginBottom: "4px",
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
            }}
          >
            {item.label}
          </p>
          <p
            style={{
              margin: "0",
              fontSize: "20px",
              fontWeight: 700,
              color: item.color,
            }}
          >
            {item.icon}
          </p>
          <p
            style={{
              margin: "4px 0 0",
              fontSize: "16px",
              fontWeight: 700,
              color: item.color,
            }}
          >
            {item.value}
          </p>
        </div>
      ))}
    </div>
  );
}

function StatisticDetail({ stat, mode = "guru" }: { stat: StatisticType; mode?: "guru" | "siswa" }) {
  const label = mode === "guru" ? "guru" : "siswa";
  const details: Record<string, { desc: string; color: string }> = {
    "tepat-waktu": { 
      desc: `Total ${label} yang hadir tepat waktu sesuai jadwal`, 
      color: "#1FA83D" 
    },
    "terlambat": { 
      desc: `Total ${label} yang terlambat lebih dari 5 menit`, 
      color: "#ACA40D" 
    },
    "izin": { 
      desc: `Total ${label} yang mengajukan izin dan disetujui`, 
      color: "#520C8F" 
    },
    "sakit": { 
      desc: `Total ${label} yang tidak masuk karena sakit`, 
      color: "#D90000" 
    },
    "pulang": { 
      desc: `Total ${label} yang pulang lebih awal dengan izin`, 
      color: "#2F85EB" 
    },
    "dispensasi": {
      desc: "Total siswa yang mendapat dispensasi resmi dari sekolah (kegiatan lomba, tugas sekolah, dll)",
      color: "#E45A92"
    },
  };

  const detail = details[stat];

  return (
    <div
      style={{
        marginTop: "16px",
        padding: "12px 14px",
        backgroundColor: detail.color + "10",
        border: `1px solid ${detail.color}30`,
        borderRadius: "8px",
        animation: "slideIn 0.3s ease",
      }}
    >
      <p style={{ margin: 0, fontSize: "12px", color: "#4B5563", lineHeight: "1.5" }}>
        {detail.desc}
      </p>
      <style>{`
        @keyframes slideIn {
          from {
            opacity: 0;
            transform: translateY(-8px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  );
}

function WeeklyBarGraph({ data = dailyAttendanceData, mode = "guru" }: {
  data?: (typeof dailyAttendanceData[0] & { dispensasi?: number })[];
  mode?: "guru" | "siswa";
}) {
  const unitLabel = mode === "guru" ? "guru" : "siswa";
  const baseDatasets = [
      {
        label: "Hadir",
        data: data.map((d) => d.hadir),
        backgroundColor: ["rgba(31,168,61,0.9)","rgba(31,168,61,0.85)","rgba(31,168,61,0.95)","rgba(31,168,61,0.88)","rgba(31,168,61,0.92)"],
        borderColor: COLORS.HADIR, borderWidth: 2, borderRadius: 8, borderSkipped: false,
        hoverBackgroundColor: "rgba(31,168,61,1)", hoverBorderColor: COLORS.HADIR, hoverBorderWidth: 3,
      },
      {
        label: "alfa",
        data: data.map((d) => d.tidak_hadir),
        backgroundColor: ["rgba(217,0,0,0.85)","rgba(217,0,0,0.8)","rgba(217,0,0,0.9)","rgba(217,0,0,0.83)","rgba(217,0,0,0.87)"],
        borderColor: COLORS.TIDAK_HADIR, borderWidth: 2, borderRadius: 8, borderSkipped: false,
        hoverBackgroundColor: "rgba(217,0,0,1)", hoverBorderColor: COLORS.TIDAK_HADIR, hoverBorderWidth: 3,
      },
      {
        label: "Izin",
        data: data.map((d) => d.izin),
        backgroundColor: ["rgba(172,164,13,0.85)","rgba(172,164,13,0.8)","rgba(172,164,13,0.9)","rgba(172,164,13,0.83)","rgba(172,164,13,0.87)"],
        borderColor: COLORS.IZIN, borderWidth: 2, borderRadius: 8, borderSkipped: false,
        hoverBackgroundColor: "rgba(172,164,13,1)", hoverBorderColor: COLORS.IZIN, hoverBorderWidth: 3,
      },
      {
        label: "Sakit",
        data: data.map((d) => d.sakit),
        backgroundColor: ["rgba(82,12,143,0.85)","rgba(82,12,143,0.8)","rgba(82,12,143,0.9)","rgba(82,12,143,0.83)","rgba(82,12,143,0.87)"],
        borderColor: COLORS.SAKIT, borderWidth: 2, borderRadius: 8, borderSkipped: false,
        hoverBackgroundColor: "rgba(82,12,143,1)", hoverBorderColor: COLORS.SAKIT, hoverBorderWidth: 3,
      },
      {
        label: "Pulang",
        data: data.map((d) => d.pulang),
        backgroundColor: ["rgba(47,133,235,0.85)","rgba(47,133,235,0.8)","rgba(47,133,235,0.9)","rgba(47,133,235,0.83)","rgba(47,133,235,0.87)"],
        borderColor: COLORS.PULANG, borderWidth: 2, borderRadius: 8, borderSkipped: false,
        hoverBackgroundColor: "rgba(47,133,235,1)", hoverBorderColor: COLORS.PULANG, hoverBorderWidth: 3,
      },
  ];

  // Tambah dataset dispensasi khusus mode siswa
  const dispensasiDataset = mode === "siswa" ? [{
    label: "Dispensasi",
    data: data.map((d) => (d as any).dispensasi ?? 0),
    backgroundColor: ["rgba(228,90,146,0.85)","rgba(228,90,146,0.8)","rgba(228,90,146,0.9)","rgba(228,90,146,0.83)","rgba(228,90,146,0.87)"],
    borderColor: COLORS.DISPENSASI, borderWidth: 2, borderRadius: 8, borderSkipped: false,
    hoverBackgroundColor: "rgba(228,90,146,1)", hoverBorderColor: COLORS.DISPENSASI, hoverBorderWidth: 3,
  }] : [];

  const chartData = {
    labels: data.map((d) => d.day),
    datasets: [...baseDatasets, ...dispensasiDataset],
  };

  const maxVal = mode === "guru" ? 15 : 360;

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    indexAxis: "x" as const,
    plugins: {
      legend: {
        position: "bottom" as const,
        labels: {
          usePointStyle: true,
          boxWidth: 10,
          padding: 20,
          font: {
            size: 13,
            weight: "600" as const,
            family: "'Inter', sans-serif",
          },
          color: "#374151",
        },
      },
      tooltip: {
        backgroundColor: "rgba(31, 41, 55, 0.95)",
        padding: 14,
        titleFont: { size: 14, weight: "600", family: "'Inter', sans-serif" },
        bodyFont: { size: 13, weight: "500", family: "'Inter', sans-serif" },
        cornerRadius: 10,
        displayColors: true,
        borderColor: "#E5E7EB",
        borderWidth: 1,
        boxPadding: 8,
        callbacks: {
          label: function (context: any) {
            let label = context.dataset.label || '';
            if (label) { label += ': '; }
            label += context.parsed.y + ' ' + unitLabel;
            return label;
          },
          afterLabel: function (context: any) {
            const total = context.chart.data.datasets.reduce((sum: number, dataset: any) => {
              return sum + (dataset.data[context.dataIndex] || 0);
            }, 0);
            return `Total: ${total} ${unitLabel}`;
          }
        }
      },
    },
    scales: {
      x: {
        stacked: false,
        grid: { display: false, drawBorder: false },
        ticks: { font: { size: 12, weight: "600" }, color: "#6B7280" },
      },
      y: {
        stacked: false,
        beginAtZero: true,
        max: maxVal,
        grid: { color: "rgba(243, 244, 246, 0.8)", drawBorder: false, lineWidth: 1 },
        border: { display: false },
        ticks: {
          font: { size: 12, weight: "500" },
          color: "#9CA3AF",
          padding: 10,
          callback: function (value: any) {
            return value + ' ' + unitLabel;
          }
        },
      },
    },
    interaction: {
      mode: "index" as const,
      intersect: false,
    },
    animation: {
      duration: 800,
      easing: "easeInOutQuart" as const,
    }
  };

  return (
    <div style={{ height: "350px", width: "100%", padding: "10px 0" }}>
      <Bar data={chartData} options={options} />
    </div>
  );
}

// Monthly Line Chart Component - dengan 5+ kategori
function MonthlyLineChart({
  data,
  mode = "guru",
}: {
  data: Array<{ month: string; hadir: number; izin: number; tidak_hadir: number; sakit: number; pulang: number; dispensasi?: number }>;
  mode?: "guru" | "siswa";
}) {
  const unitLabel = mode === "guru" ? "guru" : "siswa";

  const baseDatasets = [
      {
        label: "Hadir",
        data: data.map((d) => d.hadir),
        borderColor: COLORS.HADIR, backgroundColor: `${COLORS.HADIR}20`,
        borderWidth: 3, pointRadius: 5, pointHoverRadius: 7,
        pointBackgroundColor: COLORS.HADIR, pointBorderColor: "#fff", pointBorderWidth: 2,
        tension: 0.4, fill: true,
      },
      {
        label: "Izin",
        data: data.map((d) => d.izin),
        borderColor: COLORS.IZIN, backgroundColor: `${COLORS.IZIN}20`,
        borderWidth: 3, pointRadius: 5, pointHoverRadius: 7,
        pointBackgroundColor: COLORS.IZIN, pointBorderColor: "#fff", pointBorderWidth: 2,
        tension: 0.4, fill: true,
      },
      {
        label: "Pulang",
        data: data.map((d) => d.pulang),
        borderColor: COLORS.PULANG, backgroundColor: `${COLORS.PULANG}20`,
        borderWidth: 3, pointRadius: 5, pointHoverRadius: 7,
        pointBackgroundColor: COLORS.PULANG, pointBorderColor: "#fff", pointBorderWidth: 2,
        tension: 0.4, fill: true,
      },
      {
        label: "alfa",
        data: data.map((d) => d.tidak_hadir),
        borderColor: COLORS.TIDAK_HADIR, backgroundColor: `${COLORS.TIDAK_HADIR}20`,
        borderWidth: 3, pointRadius: 5, pointHoverRadius: 7,
        pointBackgroundColor: COLORS.TIDAK_HADIR, pointBorderColor: "#fff", pointBorderWidth: 2,
        tension: 0.4, fill: true,
      },
      {
        label: "Sakit",
        data: data.map((d) => d.sakit),
        borderColor: COLORS.SAKIT, backgroundColor: `${COLORS.SAKIT}20`,
        borderWidth: 3, pointRadius: 5, pointHoverRadius: 7,
        pointBackgroundColor: COLORS.SAKIT, pointBorderColor: "#fff", pointBorderWidth: 2,
        tension: 0.4, fill: true,
      },
  ];

  const dispensasiDataset = mode === "siswa" ? [{
    label: "Dispensasi",
    data: data.map((d) => d.dispensasi ?? 0),
    borderColor: COLORS.DISPENSASI, backgroundColor: `${COLORS.DISPENSASI}20`,
    borderWidth: 3, pointRadius: 5, pointHoverRadius: 7,
    pointBackgroundColor: COLORS.DISPENSASI, pointBorderColor: "#fff", pointBorderWidth: 2,
    tension: 0.4, fill: true,
  }] : [];

  const chartData = {
    labels: data.map((d) => d.month),
    datasets: [...baseDatasets, ...dispensasiDataset],
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
        callbacks: {
          label: function (context: any) {
            let label = context.dataset.label || '';
            if (label) {
              label += ': ';
            }
            label += context.parsed.y + ' ' + unitLabel;
            return label;
          }
        }
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
        beginAtZero: true,
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
          stepSize: 20,
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
      <Line data={chartData} options={options} />
    </div>
  );
}

function HistoryCard({ start, end, mode = "guru" }: { start: string; end: string; mode?: "guru" | "siswa" }) {
  // Calculate duration
  const startTime = new Date(`2024-01-01 ${start}`);
  const endTime = new Date(`2024-01-01 ${end}`);
  const durationMs = endTime.getTime() - startTime.getTime();
  const durationHours = Math.floor(durationMs / (1000 * 60 * 60));
  const durationMinutes = Math.floor((durationMs % (1000 * 60 * 60)) / (1000 * 60));

  // Check if on time (before 7:30 AM)
  const isOnTime = start <= "07:30:00";
  const statusColor = isOnTime ? "#10B981" : "#F59E0B";
  const statusText = isOnTime ? "Tepat Waktu" : "Terlambat";
  const statusIcon = isOnTime ? "✓" : "⏱";

  if (mode === "siswa") {
    // Untuk siswa: tampil mirip guru — Mulai/Selesai + Jam Pelajaran + Status Masuk
    const totalMenit = durationHours * 60 + durationMinutes;
    const targetMenit = 480; // 8 jam = jadwal sekolah
    const persen = Math.min((totalMenit / targetMenit) * 100, 100).toFixed(0);

    return (
      <div style={{ display: "flex", flexDirection: "column", gap: "18px" }}>
        {/* Time Range Cards */}
        <div style={{ display: "flex", gap: "12px", flexWrap: "wrap", justifyContent: "space-between" }}>
          <TimeRange label="Mulai" value={start} />
          <TimeRange label="Selesai" value={end} />
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
          {/* Jam Pelajaran - mirip Durasi Kerja */}
          <div
            style={{
              backgroundImage: "linear-gradient(135deg, #FFF7ED 0%, #FFEDD5 100%)",
              borderRadius: "12px",
              padding: "14px 16px",
              border: "1px solid #FED7AA",
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
              <span style={{ fontSize: "12px", fontWeight: 600, color: "#C2410C", textTransform: "uppercase", letterSpacing: "0.5px" }}>
                📚 Jam Pelajaran
              </span>
              <span style={{ fontSize: "14px", fontWeight: 700, color: "#7C2D12" }}>
                {durationHours}h {durationMinutes}m
              </span>
            </div>
            <div style={{ position: "relative", height: "6px", backgroundColor: "rgba(234, 88, 12, 0.15)", borderRadius: "3px", overflow: "hidden" }}>
              <div
                style={{
                  height: "100%",
                  backgroundColor: "#EA580C",
                  borderRadius: "3px",
                  width: `${persen}%`,
                  transition: "width 0.5s ease",
                }}
              />
            </div>
            <div style={{ marginTop: "6px", fontSize: "10px", color: "#C2410C", fontWeight: 500 }}>
              Jadwal: 07:00 – 15:00 | Tercapai: {persen}%
            </div>
          </div>

          {/* Status Masuk Siswa - mirip Status Guru */}
          <div
            style={{
              backgroundColor: statusColor + "15",
              border: `2px solid ${statusColor}`,
              borderRadius: "12px",
              padding: "12px 16px",
              display: "flex",
              alignItems: "center",
              gap: "12px",
            }}
          >
            <div
              style={{
                width: "40px",
                height: "40px",
                borderRadius: "50%",
                backgroundColor: statusColor + "30",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "20px",
              }}
            >
              {statusIcon}
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: "12px", color: "#6B7280", fontWeight: 500 }}>Status Masuk</div>
              <div style={{ fontSize: "14px", fontWeight: 700, color: statusColor }}>
                {statusText}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "18px" }}>
      {/* Time Range Cards */}
      <div
        style={{
          display: "flex",
          gap: "12px",
          flexWrap: "wrap",
          justifyContent: "space-between",
        }}
      >
        <TimeRange label="Mulai" value={start} />
        <TimeRange label="Selesai" value={end} />
      </div>

      {/* Work Duration Section */}
      <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
        {/* Duration Display */}
        <div
          style={{
            backgroundColor: "linear-gradient(135deg, #F0F9FF 0%, #E0F2FE 100%)",
            backgroundImage: "linear-gradient(135deg, #F0F9FF 0%, #E0F2FE 100%)",
            borderRadius: "12px",
            padding: "14px 16px",
            border: "1px solid #BAE6FD",
          }}
        >
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
            <span style={{ fontSize: "12px", fontWeight: 600, color: "#0369A1", textTransform: "uppercase", letterSpacing: "0.5px" }}>
              ⏱ Durasi Kerja
            </span>
            <span style={{ fontSize: "14px", fontWeight: 700, color: "#0C4A6E" }}>
              {durationHours}h {durationMinutes}m
            </span>
          </div>
          
          {/* Progress Bar */}
          <div style={{ position: "relative", height: "6px", backgroundColor: "rgba(2, 132, 199, 0.15)", borderRadius: "3px", overflow: "hidden" }}>
            <div
              style={{
                height: "100%",
                backgroundColor: "#0284C7",
                borderRadius: "3px",
                width: `${Math.min((durationHours * 60 + durationMinutes) / 480 * 100, 100)}%`,
                transition: "width 0.5s ease",
              }}
            />
          </div>
          <div style={{ marginTop: "6px", fontSize: "10px", color: "#0369A1", fontWeight: 500 }}>
            Target: 8 jam | Tercapai: {((durationHours * 60 + durationMinutes) / 480 * 100).toFixed(0)}%
          </div>
        </div>

        {/* Status Indicator */}
        <div
          style={{
            backgroundColor: statusColor + "15",
            border: `2px solid ${statusColor}`,
            borderRadius: "12px",
            padding: "12px 16px",
            display: "flex",
            alignItems: "center",
            gap: "12px",
          }}
        >
          <div
            style={{
              width: "40px",
              height: "40px",
              borderRadius: "50%",
              backgroundColor: statusColor + "30",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "20px",
            }}
          >
            {statusIcon}
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: "12px", color: "#6B7280", fontWeight: 500 }}>Status</div>
            <div style={{ fontSize: "14px", fontWeight: 700, color: statusColor }}>
              {statusText}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function TimeRange({ label, value }: { label: string; value: string }) {
  const isStart = label === "Mulai";
  const gradientStart = isStart ? "#F0FDF4" : "#FEF3C7";
  const gradientEnd = isStart ? "#DCFCE7" : "#FCD34D";
  const borderColor = isStart ? "#86EFAC" : "#FCD34D";
  const textColor = isStart ? "#15803D" : "#92400E";
  const icon = isStart ? "🕖" : "🏁";

  return (
    <div
      style={{
        flex: 1,
        minWidth: "160px",
        backgroundImage: `linear-gradient(135deg, ${gradientStart} 0%, ${gradientEnd} 100%)`,
        border: `2px solid ${borderColor}`,
        borderRadius: "14px",
        padding: "16px 18px",
        display: "flex",
        flexDirection: "column",
        gap: "8px",
        transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
        cursor: "default",
        position: "relative",
        overflow: "hidden",
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = "translateY(-4px)";
        e.currentTarget.style.boxShadow = `0 12px 24px rgba(0, 0, 0, 0.12)`;
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = "translateY(0)";
        e.currentTarget.style.boxShadow = "none";
      }}
    >
      {/* Background decoration */}
      <div
        style={{
          position: "absolute",
          top: "-20px",
          right: "-20px",
          width: "80px",
          height: "80px",
          borderRadius: "50%",
          backgroundColor: borderColor,
          opacity: 0.1,
        }}
      />
      
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", position: "relative", zIndex: 1 }}>
        <span style={{ fontSize: "11px", color: textColor, fontWeight: 700, textTransform: "uppercase", letterSpacing: "1px" }}>
          {label}
        </span>
        <span style={{ fontSize: "18px" }}>{icon}</span>
      </div>
      
      <strong style={{ fontSize: "22px", color: textColor, fontWeight: 800, fontFamily: "'Monaco', 'Courier New', monospace" }}>
        {value}
      </strong>
    </div>
  );
}

function ComingSoon({ title }: { title: string }) {
  return (
    <div
      style={{
        backgroundColor: "white",
        borderRadius: "12px",
        padding: "48px 32px",
        border: "2px dashed #E5E7EB",
        textAlign: "center",
      }}
    >
      <div style={{ fontSize: "48px", marginBottom: "16px" }}>🚀</div>
      <h2
        style={{
          fontSize: "20px",
          marginBottom: "8px",
          color: "#111827",
          fontWeight: 700,
        }}
      >
        {title}
      </h2>
      <p style={{ color: "#6B7280", fontSize: "14px", margin: 0 }}>Konten masih dalam pengembangan.</p>
    </div>
  );
}