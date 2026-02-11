// src/Pages/WakaStaff/KehadiranGuru.tsx
import { useMemo, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import StaffLayout from "../../component/WakaStaff/StaffLayout";
import { Table } from "../../component/Shared/Table";
import { Eye, Search } from "lucide-react";
import { getStatusConfig } from "../../utils/statusMapping";
import LoadingState from "../../component/Shared/LoadingState";
import ErrorState from "../../component/Shared/ErrorState";
import { isCancellation } from "../../utils/errorHelpers";

type StatusType =
  | "hadir"
  | "terlambat"
  | "tidak-hadir"
  | "sakit"
  | "izin"
  | "alpha"
  | "pulang";

interface KehadiranGuruProps {
  user: { name: string; role: string };
  onLogout: () => void;
  currentPage: string;
  onMenuClick: (page: string) => void;
  onNavigateToDetail: (guruId: string, guruName: string, noIdentitas?: string) => void;
}

interface KehadiranGuruRow {
  id: string;
  namaGuru: string;
  jadwal: string;
  noIdentitas?: string;
  nip?: string;
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
  const [search, setSearch] = useState("");

  const [rows, setRows] = useState<KehadiranGuruRow[]>([]);

  const [selectedTanggal, setSelectedTanggal] = useState(
    new Date().toISOString().slice(0, 10)
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    const controller = new AbortController();

    const fetchData = async () => {
      setLoading(true);
      try {
        const { dashboardService } = await import("../../services/dashboard");
        const response: any = await dashboardService.getTeachersDailyAttendance({ date: selectedTanggal }, { signal: controller.signal });

        const apiItems = response.items?.data || response.items || [];

        const mappedRows: KehadiranGuruRow[] = apiItems.map((item: any) => {
          const status = item.status || (item.attendance?.status) || 'absent';
          let displayStatus: StatusType = 'alpha';
          if (status === 'present') displayStatus = 'hadir';
          else if (status === 'late') displayStatus = 'terlambat';
          else if (status === 'sick' || status === 'sakit') displayStatus = 'sakit';
          else if (status === 'excused' || status === 'izin') displayStatus = 'izin';
          else if (status === 'return' || status === 'pulang') displayStatus = 'pulang';

          return {
            id: (item.teacher?.id || item.id).toString(),
            namaGuru: item.teacher?.user?.name || item.teacher?.name || "Guru",
            noIdentitas: item.teacher?.nip || item.teacher?.no_identitas,
            nip: item.teacher?.nip,
            jadwal: item.teacher?.subject || "-",
            kehadiranJam: Array(10).fill(displayStatus),
          };
        });

        setRows(mappedRows);
      } catch (error: any) {
        if (!isCancellation(error)) {
          console.error("Failed to fetch teacher attendance", error);
          setError("Gagal memuat data kehadiran guru. Silakan coba lagi.");
        }
      } finally {
        setLoading(false);
      }
    };

    fetchData();
    return () => controller.abort();
  }, [selectedTanggal]);

  const filteredRows = useMemo(() => {
    if (!search) return rows;
    return rows.filter((r) =>
      r.namaGuru.toLowerCase().includes(search.toLowerCase())
    );
  }, [rows, search]);

  const renderStatusBar = (data: StatusType[]) => {
    // const statusColors removed - using utility

    return (
      <div style={{ display: "flex", justifyContent: "center" }}>
        <div
          style={{
            display: "flex",
            width: 240,
            height: 16,
            borderRadius: 999,
            overflow: "hidden",
            border: "1px solid #1F2937",
          }}
        >
          {Array.from({ length: 10 }).map((_, i) => {
            const status = data[i];
            const color = getStatusConfig(status).color;

            return (
              <div
                key={i}
                style={{
                  flex: 1,
                  backgroundColor: color,
                  borderRight: i !== 9 ? "1px solid #1F2937" : "none",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 10,
                  fontWeight: 700,
                  color: "#000000",
                }}
              >
                {i + 1}
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  const handleView = (row: KehadiranGuruRow) => {
    if (onNavigateToDetail) {
      onNavigateToDetail(row.id, row.namaGuru);
    } else {
      navigate(`/waka/kehadiran/detail/${row.id}`, {
        state: {
          guru: row,
          selectedTanggal,
          guruId: row.id,
          guruName: row.namaGuru
        },
      });
    }
  };

  const columns = useMemo(
    () => [
      { key: "namaGuru", label: "Nama Guru" },
      {
        key: "jadwal",
        label: <div style={{ textAlign: "center" }}>Jadwal</div>,
        render: (value: string) => (
          <div style={{ textAlign: "center" }}>{value}</div>
        ),
      },
      {
        key: "kehadiranJam",
        label: <div style={{ textAlign: "center" }}>Jadwal ke 1-10</div>,
        render: (value: StatusType[]) => renderStatusBar(value),
      },
      {
        key: "aksi",
        label: <div style={{ textAlign: "center" }}>Aksi</div>,
        render: (_: unknown, row: KehadiranGuruRow) => (
          <div style={{ display: "flex", justifyContent: "center" }}>
            <button
              onClick={() => handleView(row)}
              style={{
                background: "none",
                border: "none",
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
      {/* SEARCH + DATE */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          gap: 16,
          marginBottom: 18,
          flexWrap: "wrap",
        }}
      >
        {/* SEARCH */}
        <div style={{ position: "relative", flex: 1, maxWidth: 520 }}>
          <Search
            size={18}
            style={{
              position: "absolute",
              top: "50%",
              left: 14,
              transform: "translateY(-50%)",
              color: "#6B7280",
            }}
          />
          <input
            type="text"
            placeholder="Cari nama guru..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{
              padding: "12px 16px 12px 44px",
              width: "100%",
              borderRadius: 14,
              border: "1px solid #D1D5DB",
              backgroundColor: "#F3F4F6",
              fontWeight: 600,
              fontSize: 14,
            }}
          />
        </div>

        {/* DATE */}
        <input
          type="date"
          value={selectedTanggal}
          onChange={(e) => setSelectedTanggal(e.target.value)}
          style={{
            padding: "12px 16px",
            borderRadius: 14,
            border: "1px solid #D1D5DB",
            fontWeight: 600,
            fontSize: 14,
            cursor: "pointer",
          }}
        />
      </div>

      <div
        style={{
          background: "#FFFFFF",
          borderRadius: 12,
          border: "1px solid #E5E7EB",
          padding: isMobile ? 16 : 32,
          position: "relative"
        }}
      >
        {loading ? (
          <LoadingState />
        ) : error ? (
          <ErrorState message={error} onRetry={() => setSelectedTanggal(selectedTanggal)} />
        ) : (
          <Table
            columns={columns}
            data={filteredRows}
            keyField="id"
            emptyMessage="Belum ada data kehadiran guru."
          />
        )}
      </div>
    </StaffLayout>
  );
}