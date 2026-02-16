// src/Pages/WakaStaff/DashboardStaff.tsx
import { useState } from "react";
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
  | "detail-kehadiran-guru";

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
};

// Dummy data updated for Monthly view (Mon-Fri) with 4 categories
const dailyAttendanceData = [
  { day: "Senin", hadir: 42, alpha: 2, izin: 3, sakit: 1 },
  { day: "Selasa", hadir: 38, alpha: 1, izin: 5, sakit: 2 },
  { day: "Rabu", hadir: 45, alpha: 0, izin: 2, sakit: 1 },
  { day: "Kamis", hadir: 40, alpha: 1, izin: 4, sakit: 3 },
  { day: "Jumat", hadir: 44, alpha: 0, izin: 1, sakit: 1 },
];

const monthlyAttendance = [
  { month: "Jan", hadir: 210, izin: 8, alpha: 4 },
  { month: "Feb", hadir: 198, izin: 12, alpha: 6 },
  { month: "Mar", hadir: 215, izin: 10, alpha: 5 },
  { month: "Apr", hadir: 224, izin: 9, alpha: 4 },
  { month: "Mei", hadir: 230, izin: 7, alpha: 3 },
  { month: "Jun", hadir: 218, izin: 11, alpha: 6 },
];

const statCards = [
  { label: "Tepat Waktu", value: "2100" },
  { label: "Terlambat", value: "10" },
  { label: "Izin", value: "18" },
  { label: "Sakit", value: "5" },
  { label: "Alpha", value: "5" },
];

const historyInfo = {
  date: "Senin, 7 Januari 2026",
  start: "07:00:00",
  end: "15:00:00",
  time: "08:00",
};

const cardStyle: React.CSSProperties = {
  backgroundColor: "#FFFFFF",
  borderRadius: "16px",
  padding: "20px",
  boxShadow: "0 1px 3px rgba(0, 0, 0, 0.05), 0 4px 12px rgba(0, 0, 0, 0.08)",
  border: "1px solid #E5E7EB",
};

export default function DashboardStaff({ user, onLogout }: DashboardStaffProps) {
  const [currentPage, setCurrentPage] = useState<WakaPage>("dashboard");
  const [selectedGuru, setSelectedGuru] = useState<string | null>(null);
  const [selectedKelas, setSelectedKelas] = useState<string | null>(null);
  const [selectedKelasId, setSelectedKelasId] = useState<string | null>(null);
  const navigate = useNavigate();

  const handleMenuClick = (page: string) => setCurrentPage(page as WakaPage);

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
            onNavigateToDetail={(kelasId: string) => {
              setSelectedKelasId(kelasId);
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
                    title="Riwayat Kehadiran"
                    subtitle={`${historyInfo.date} • ${historyInfo.time}`}
                  />
                  <HistoryCard
                    start={historyInfo.start}
                    end={historyInfo.end}
                  />
                </div>

                {/* Statistik Kehadiran Card */}
                <div style={cardStyle}>
                  <SectionHeader
                    title="Statistik Kehadiran"
                    subtitle="Rekap keseluruhan"
                  />
                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns: "repeat(auto-fit, minmax(90px, 1fr))",
                      gap: "12px",
                    }}
                  >
                    {statCards.map((item) => (
                      <div
                        key={item.label}
                        style={{
                          border: "1px solid #E5E7EB",
                          borderRadius: "12px",
                          padding: "16px",
                          textAlign: "center",
                          backgroundColor: "#F8FAFC",
                          transition: "all 0.2s ease",
                          cursor: "default",
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.backgroundColor = "#F0F9FF";
                          e.currentTarget.style.borderColor = "#93C5FD";
                          e.currentTarget.style.transform = "translateY(-2px)";
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.backgroundColor = "#F8FAFC";
                          e.currentTarget.style.borderColor = "#E5E7EB";
                          e.currentTarget.style.transform = "translateY(0)";
                        }}
                      >
                        <p
                          style={{
                            margin: 0,
                            fontSize: "12px",
                            color: "#6B7280",
                            fontWeight: 600,
                            marginBottom: "6px",
                          }}
                        >
                          {item.label}
                        </p>
                        <p
                          style={{
                            margin: "0",
                            fontSize: "22px",
                            fontWeight: 700,
                            color: "#1F2937",
                          }}
                        >
                          {item.value}
                        </p>
                      </div>
                    ))}
                  </div>
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
                  <SectionHeader title="Grafik Kehadiran Bulanan" subtitle="Rekap Mingguan (Senin - Jumat)" />
                  <WeeklyBarGraph />
                </div>

                {/* Monthly Chart */}
                <div style={cardStyle}>
                  <SectionHeader
                    title="Grafik Kehadiran Bulanan"
                    subtitle="Periode Jan - Jun"
                  />
                  <MonthlyLineChart />
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

function WeeklyBarGraph() {
  const maxValue =
    dailyAttendanceData.reduce(
      (acc, item) => Math.max(acc, item.hadir, item.alpha, item.izin, item.sakit),
      1
    ) || 1;

  return (
    <div style={{ position: "relative" }}>
      <div
        style={{
          display: "flex",
          alignItems: "flex-end",
          gap: "16px",
          height: "220px",
          marginBottom: "32px",
        }}
      >
        {dailyAttendanceData.map((item) => (
          <div key={item.day} style={{ flex: 1, textAlign: "center" }}>
            <div
              style={{
                display: "flex",
                justifyContent: "center",
                alignItems: "flex-end",
                gap: "4px",
                height: "180px",
              }}
            >
              <div
                title={`Hadir: ${item.hadir}`}
                style={{
                  width: "14px",
                  height: `${(item.hadir / maxValue) * 160}px`,
                  borderRadius: "4px 4px 0 0",
                  background: "linear-gradient(180deg, #1E3A8A 0%, #3B82F6 100%)",
                }}
              />
              <div
                title={`Alpha: ${item.alpha}`}
                style={{
                  width: "14px",
                  height: `${(item.alpha / maxValue) * 160}px`,
                  borderRadius: "4px 4px 0 0",
                  background: "linear-gradient(180deg, #B91C1C 0%, #F87171 100%)",
                }}
              />
              <div
                title={`Izin: ${item.izin}`}
                style={{
                  width: "14px",
                  height: `${(item.izin / maxValue) * 160}px`,
                  borderRadius: "4px 4px 0 0",
                  background: "linear-gradient(180deg, #D97706 0%, #FBBF24 100%)",
                }}
              />
              <div
                title={`Sakit: ${item.sakit}`}
                style={{
                  width: "14px",
                  height: `${(item.sakit / maxValue) * 160}px`,
                  borderRadius: "4px 4px 0 0",
                  background: "linear-gradient(180deg, #059669 0%, #34D399 100%)",
                }}
              />
            </div>
            <p style={{ margin: "8px 0 0", fontSize: "13px", color: "#475569" }}>
              {item.day}
            </p>
          </div>
        ))}
      </div>

      <div
        style={{
          display: "flex",
          gap: "16px",
          justifyContent: "center",
          flexWrap: "wrap",
        }}
      >
        <LegendDot color="#3B82F6" label="Jumlah Guru Hadir" />
        <LegendDot color="#FBBF24" label="Jumlah Guru Izin" />
        <LegendDot color="#34D399" label="Jumlah Guru Sakit" />
        <LegendDot color="#EF4444" label="Jumlah Guru Alpha" />
      </div>
    </div>
  );
}

function MonthlyLineChart() {
  const width = 360;
  const height = 200;
  const padding = 26;
  const maxValue =
    monthlyAttendance.reduce(
      (acc, item) => Math.max(acc, item.hadir, item.izin, item.alpha),
      1
    ) || 1;

  const buildPoints = (key: "hadir" | "izin" | "alpha") =>
    monthlyAttendance
      .map((item, index) => {
        const x =
          padding +
          (monthlyAttendance.length === 1
            ? 0
            : (index / (monthlyAttendance.length - 1)) * (width - 2 * padding));
        const y =
          height - padding - (item[key] / maxValue) * (height - 2 * padding);
        return `${x},${y}`;
      })
      .join(" ");

  return (
    <div style={{ width: "100%", overflowX: "auto" }}>
      <svg width={width} height={height} style={{ display: "block", margin: "0 auto" }}>
        <line
          x1={padding}
          y1={height - padding}
          x2={width - padding}
          y2={height - padding}
          stroke="#CBD5F5"
          strokeWidth={1}
        />
        <line
          x1={padding}
          y1={padding}
          x2={padding}
          y2={height - padding}
          stroke="#CBD5F5"
          strokeWidth={1}
        />

        <polyline
          points={buildPoints("hadir")}
          fill="none"
          stroke="#3B82F6"
          strokeWidth={3}
          strokeLinecap="round"
        />
        <polyline
          points={buildPoints("izin")}
          fill="none"
          stroke="#F59E0B"
          strokeWidth={3}
          strokeLinecap="round"
        />
        <polyline
          points={buildPoints("alpha")}
          fill="none"
          stroke="#EF4444"
          strokeWidth={3}
          strokeLinecap="round"
        />

        {monthlyAttendance.map((item, index) => {
          const x =
            padding +
            (monthlyAttendance.length === 1
              ? 0
              : (index / (monthlyAttendance.length - 1)) * (width - 2 * padding));
          const y = height - padding + 16;
          return (
            <text
              key={item.month}
              x={x}
              y={y}
              textAnchor="middle"
              fontSize="12"
              fill="#475569"
            >
              {item.month}
            </text>
          );
        })}
      </svg>

      <div
        style={{
          marginTop: "12px",
          display: "flex",
          gap: "16px",
          flexWrap: "wrap",
        }}
      >
        <LegendDot color="#3B82F6" label="Jumlah Siswa Hadir" />
        <LegendDot color="#F59E0B" label="Jumlah Siswa Izin/Sakit" />
        <LegendDot color="#EF4444" label="Jumlah Siswa Alpha" />
      </div>
    </div>
  );
}

function HistoryCard({ start, end }: { start: string; end: string }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
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
    </div>
  );
}

function TimeRange({ label, value }: { label: string; value: string }) {
  return (
    <div
      style={{
        flex: 1,
        minWidth: "160px",
        border: "1px solid #E5E7EB",
        borderRadius: "10px",
        padding: "14px 16px",
        display: "flex",
        flexDirection: "column",
        gap: "6px",
        backgroundColor: "#F9FAFB",
        transition: "all 0.2s ease",
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.borderColor = "#3B82F6";
        e.currentTarget.style.backgroundColor = "#F0F9FF";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.borderColor = "#E5E7EB";
        e.currentTarget.style.backgroundColor = "#F9FAFB";
      }}
    >
      <span style={{ fontSize: "11px", color: "#6B7280", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.5px" }}>{label}</span>
      <strong style={{ fontSize: "18px", color: "#111827", fontWeight: 700 }}>{value}</strong>
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
