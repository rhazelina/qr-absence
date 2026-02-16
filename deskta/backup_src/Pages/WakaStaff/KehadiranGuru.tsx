// src/Pages/WakaStaff/KehadiranGuru.tsx
import { useMemo, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import StaffLayout from "../../component/WakaStaff/StaffLayout";
import { Table } from "../../component/Shared/Table";
import { Eye } from "lucide-react";

type StatusType =
  | "hadir"
  | "terlambat"
  | "tidak-hadir"
  | "sakit"
  | "izin"
  | "alpha";

interface KehadiranGuruProps {
  user: { name: string; role: string };
  onLogout: () => void;
  currentPage: string;
  onMenuClick: (page: string) => void;
  onNavigateToDetail?: (guruId: string) => void;
}

interface KehadiranGuruRow {
  id: string;
  namaGuru: string;
  jadwal: string;
  kehadiranJam: StatusType[];
}

export default function KehadiranGuru({
  user,
  onLogout,
  currentPage,
  onMenuClick,
  onNavigateToDetail,
}: KehadiranGuruProps) {
  const navigate = useNavigate();
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  // ✅ KALENDER
  const [selectedTanggal, setSelectedTanggal] = useState(
    new Date().toISOString().slice(0, 10)
  );

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const [rows] = useState<KehadiranGuruRow[]>([
    {
      id: "1",
      namaGuru: "Alifah Diantebes Aindra S.pd",
      jadwal: "XII RPL 2",
      kehadiranJam: [
        "hadir","hadir","hadir","hadir",
        "izin","izin","terlambat","terlambat",
        "tidak-hadir","tidak-hadir",
      ],
    },
    {
      id: "2",
      namaGuru: "Ewit Erniyah S.pd",
      jadwal: "XII RPL 2",
      kehadiranJam: [
        "hadir","hadir","hadir","hadir",
        "hadir","hadir","izin","izin",
        "alpha","alpha",
      ],
    },
  ]);

  // =========================
  // STATUS BAR
  // =========================
  const renderStatusBar = (data: StatusType[]) => (
    <div style={{ display: "flex", justifyContent: "center" }}>
      <div
        style={{
          display: "flex",
          width: 240,
          height: 14,
          borderRadius: 999,
          overflow: "hidden",
          border: "1px solid #1F2937",
        }}
      >
        {Array.from({ length: 10 }).map((_, i) => {
          const status = data[i];
          let color = "#DC2626";

          if (status === "hadir") color = "#22C55E";
          else if (
            status === "izin" ||
            status === "sakit" ||
            status === "terlambat"
          )
            color = "#FACC15";

          return (
            <div
              key={i}
              style={{
                flex: 1,
                backgroundColor: color,
                borderRight: i !== 9 ? "1px solid #1F2937" : "none",
              }}
            />
          );
        })}
      </div>
    </div>
  );

  // =========================
  // AKSI
  // =========================
  const handleView = (row: KehadiranGuruRow) => {
    if (onNavigateToDetail) {
      onNavigateToDetail(row.id);
    } else {
      navigate(`/waka/kehadiran/detail/${row.id}`, { 
        state: { guru: row, selectedTanggal }
      });
    }
  };

  const columns = useMemo(
    () => [
      { key: "namaGuru", label: "Nama Guru" },
      {
        key: "jadwal",
        label: "Jadwal",
        render: (value: string) => (
          <div style={{ textAlign: "center" }}>{value}</div>
        ),
      },
      {
        key: "kehadiranJam",
        label: "Status",
        render: (value: StatusType[]) => renderStatusBar(value),
      },
      {
        key: "aksi",
        label: "Aksi",
        render: (_: unknown, row: KehadiranGuruRow) => (
          <div style={{ display: "flex", justifyContent: "center" }}>
            <button
              onClick={() => handleView(row)}
              style={{
                background: "none",
                border: "none",
                padding: 0,
                cursor: "pointer",
              }}
            >
              <Eye size={20} color="#1F2937" strokeWidth={2} />
            </button>
          </div>
        ),
      },
    ],
    []
  );

  return (
    <StaffLayout
      pageTitle="Kehadiran Guru"
      currentPage={currentPage}
      onMenuClick={onMenuClick}
      user={user}
      onLogout={onLogout}
    >
      {/* HEADER KANAN ATAS (KALENDER) */}
      <div
        style={{
          display: "flex",
          justifyContent: "flex-end",
          marginBottom: 16,
        }}
      >
        <input
          type="date"
          value={selectedTanggal}
          onChange={(e) => setSelectedTanggal(e.target.value)}
          style={{
            padding: "8px 12px",
            borderRadius: 10,
            border: "1px solid #D1D5DB",
            backgroundColor: "#FFFFFF",
            color: "#111827",
            fontWeight: 600,
            fontSize: 14,
            cursor: "pointer",
          }}
        />
      </div>

      {/* TABEL */}
      <div
        style={{
          background: "#FFFFFF",
          borderRadius: 12,
          border: "1px solid #E5E7EB",
          padding: isMobile ? 16 : 32,
        }}
      >
        <Table
          columns={columns}
          data={rows}
          keyField="id"
          emptyMessage="Belum ada data kehadiran guru."
        />
      </div>
    </StaffLayout>
  );
}
