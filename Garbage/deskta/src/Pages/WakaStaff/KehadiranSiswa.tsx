import { useEffect, useMemo, useState } from "react";
import StaffLayout from "../../component/WakaStaff/StaffLayout";
import { Table } from "../../component/Shared/Table";

import LoadingState from "../../component/Shared/LoadingState";
import ErrorState from "../../component/Shared/ErrorState";
import { isCancellation } from "../../utils/errorHelpers";

interface KelasRow {
  id: string;
  tingkat: "10" | "11" | "12";
  namaKelas: string;
  namaJurusan: string;
  waliKelas: string;
}

interface KehadiranSiswaProps {
  user: { name: string; role: string };
  onLogout: () => void;
  currentPage: string;
  onMenuClick: (page: string) => void;
  onNavigateToDetail?: (kelasId: string, kelasInfo: { namaKelas: string; waliKelas: string }) => void;
}

const JURUSAN_LIST = [
  "Mekatronika",
  "Rekayasa Perangkat Lunak",
  "Animasi",
  "Broadcasting",
  "Elektronika Industri",
  "Teknik Komputer dan Jaringan",
  "Audio Video",
  "Desain Komunikasi Visual",
];

const KELAS_LIST = ["10", "11", "12"];

export default function KehadiranSiswa({
  user,
  onLogout,
  currentPage,
  onMenuClick,
  onNavigateToDetail,
}: KehadiranSiswaProps) {
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const [selectedJurusan, setSelectedJurusan] = useState("");
  const [selectedKelas, setSelectedKelas] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [kelasData, setKelasData] = useState<KelasRow[]>([]);

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

        const [classes] = await Promise.all([
          dashboardService.getClasses({ signal: controller.signal }),
          dashboardService.getWakaDashboardSummary({ signal: controller.signal })
        ]);

        const mappedData: KelasRow[] = (classes as any).map((c: any) => {
          return {
            id: c.id.toString(),
            tingkat: (c.grade || "10") as any,
            namaKelas: c.name || `${c.grade} ${c.label}`,
            namaJurusan: c.major?.name || "-",
            waliKelas: c.homeroom_teacher?.user?.name || "-",
          };
        });

        setKelasData(mappedData);
      } catch (error: any) {
        if (!isCancellation(error)) {
          console.error("Failed to fetch classes", error);
          setError("Gagal memuat data kelas. Silakan coba lagi.");
        }
      } finally {
        setLoading(false);
      }
    };

    fetchData();
    return () => controller.abort();
  }, []);

  // Filter data sesuai jurusan & kelas
  const filteredData = useMemo(() => {
    return kelasData.filter((item) => {
      const jurusanMatch =
        !selectedJurusan || item.namaJurusan === selectedJurusan;
      const kelasMatch =
        !selectedKelas || item.tingkat === selectedKelas;

      return jurusanMatch && kelasMatch;
    });
  }, [kelasData, selectedJurusan, selectedKelas]);

  // Kolom tabel (tetap)
  const columns = useMemo(
    () => [
      { key: "namaKelas", label: "Nama kelas" },
      { key: "namaJurusan", label: "Nama Konsentrasi Keahlian" },
      { key: "waliKelas", label: "Wali Kelas" },
    ],
    []
  );

  const handleViewDetail = (row: KelasRow) => {
    if (onNavigateToDetail) {
      onNavigateToDetail(row.id, { namaKelas: row.namaKelas, waliKelas: row.waliKelas });
    }
  };

  return (
    <StaffLayout
      pageTitle="Kehadiran Siswa"
      currentPage={currentPage}
      onMenuClick={onMenuClick}
      user={user}
      onLogout={onLogout}
    >
      <div
        style={{
          backgroundColor: "#FFFFFF",
          borderRadius: 12,
          padding: isMobile ? 16 : 24,
          border: "1px solid #E5E7EB",
          boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
        }}
      >
        {/* Filter */}
        <div style={{ marginBottom: 16 }}>
          <p style={{ fontWeight: 600, marginBottom: 8 }}>
            Silahkan Pilih Konsentrasi Keahlian dan Tingkat Kelas :
          </p>

          <div
            style={{
              display: "flex",
              gap: 12,
              flexWrap: "wrap",
            }}
          >
            {/* Dropdown Jurusan */}
            <select
              value={selectedJurusan}
              onChange={(e) => setSelectedJurusan(e.target.value)}
              style={{
                padding: "8px 12px",
                borderRadius: 6,
                border: "1px solid #D1D5DB",
                minWidth: 200,
              }}
            >
              <option value="">Semua Konsentrasi Keahlian</option>
              {JURUSAN_LIST.map((jurusan) => (
                <option key={jurusan} value={jurusan}>
                  {jurusan}
                </option>
              ))}
            </select>

            {/* Dropdown Kelas */}
            <select
              value={selectedKelas}
              onChange={(e) => setSelectedKelas(e.target.value)}
              style={{
                padding: "8px 12px",
                borderRadius: 6,
                border: "1px solid #D1D5DB",
                minWidth: 120,
              }}
            >
              <option value="">Semua Tingkat Kelas</option>
              {KELAS_LIST.map((kelas) => (
                <option key={kelas} value={kelas}>
                  {kelas}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Tabel */}
        {loading ? (
          <LoadingState />
        ) : error ? (
          <ErrorState message={error} onRetry={() => window.location.reload()} />
        ) : (
          <Table
            columns={columns}
            data={filteredData}
            onView={handleViewDetail}
            keyField="id"
            emptyMessage="Belum ada data kelas."
          />
        )}
      </div>
    </StaffLayout>
  );
}
