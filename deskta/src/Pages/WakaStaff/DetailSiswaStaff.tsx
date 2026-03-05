import { useEffect, useMemo, useState } from "react";
import { Calendar, Eye } from "lucide-react";
import StaffLayout from "../../component/WakaStaff/StaffLayout";
import { Table } from "../../component/Shared/Table";
import { Modal } from "../../component/Shared/Modal";
import { attendanceService } from "../../services/attendanceService";

type DetailStatusType =
  | "hadir"
  | "terlambat"
  | "izin"
  | "sakit"
  | "alfa"
  | "pulang"
  | "dispen";

interface KehadiranRow {
  id: string;
  studentId: string;
  nisn: string;
  namaSiswa: string;
  mataPelajaran: string;
  namaGuru: string;
  status: DetailStatusType;
  keterangan?: string;
  waktuMasuk?: string;
  jamPelajaran?: string;
  tanggal?: string;
}

interface DetailSiswaStaffProps {
  user: { name: string; role: string };
  onLogout: () => void;
  currentPage: string;
  onMenuClick: (page: string, payload?: any) => void;
  kelasId?: string;
  namaKelas?: string;
  waliKelas?: string;
  selectedKelas?: string;
  onBack?: () => void;
  onNavigateToRecap?: () => void;
}

const STATUS_COLORS: Record<DetailStatusType, string> = {
  hadir: "#1FA83D",
  terlambat: "#ACA40D",
  izin: "#ACA40D",
  sakit: "#520C8F",
  alfa: "#D90000",
  pulang: "#2F85EB",
  dispen: "#E45A92",
};

const formatDate = (date: string): string => {
  const d = new Date(date);
  if (Number.isNaN(d.getTime())) return date;
  return d.toLocaleDateString("id-ID", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
};

const mapStatus = (status: string): DetailStatusType => {
  const value = String(status || "").toLowerCase();
  if (value === "present") return "hadir";
  if (value === "late") return "terlambat";
  if (value === "sick") return "sakit";
  if (value === "permission" || value === "excused" || value === "izin") return "izin";
  if (value === "return" || value === "leave_early") return "pulang";
  if (value === "dispen" || value === "dispensation" || value === "dispensasi") return "dispen";
  return "alfa";
};

const statusLabel = (status: DetailStatusType): string => {
  if (status === "alfa") return "Alfa";
  if (status === "terlambat") return "Terlambat";
  if (status === "pulang") return "Pulang";
  if (status === "dispen") return "Dispen";
  return status.charAt(0).toUpperCase() + status.slice(1);
};

export default function DetailSiswaStaff({
  user,
  onLogout,
  currentPage,
  onMenuClick,
  kelasId,
  namaKelas = "-",
  waliKelas = "-",
  selectedKelas,
  onBack,
}: DetailSiswaStaffProps) {
  const resolvedNamaKelas = namaKelas !== "-" ? namaKelas : (selectedKelas || "-");
  const resolvedWaliKelas = waliKelas !== "-" ? waliKelas : "-";
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().slice(0, 10));
  const [selectedMapel, setSelectedMapel] = useState("");
  const [selectedGuru, setSelectedGuru] = useState("");
  const [rows, setRows] = useState<KehadiranRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedRow, setSelectedRow] = useState<KehadiranRow | null>(null);

  useEffect(() => {
    if (!kelasId) {
      setRows([]);
      setError("Kelas belum dipilih.");
      return;
    }

    const fetchAttendance = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await attendanceService.getDailyClassAttendance(kelasId, selectedDate);
        const items = Array.isArray(response?.items) ? response.items : [];

        const flatRows: KehadiranRow[] = items.flatMap((item: any) => {
          const schedule = item?.schedule || {};
          const attendances = Array.isArray(item?.attendances) ? item.attendances : [];

          return attendances.map((attendance: any, index: number) => {
            const student = attendance?.student || {};
            const studentUser = student?.user || {};
            const teacherUser = schedule?.teacher?.user || {};
            const id = attendance?.id ? String(attendance.id) : `${schedule?.id || "-"}-${student?.id || index}`;

            return {
              id,
              studentId: student?.id ? String(student.id) : "",
              nisn: student?.nisn || "-",
              namaSiswa: studentUser?.name || "-",
              mataPelajaran: schedule?.subject_name || "-",
              namaGuru: teacherUser?.name || "-",
              status: mapStatus(attendance?.status),
              keterangan: attendance?.reason || attendance?.notes || "-",
              waktuMasuk: attendance?.checked_in_at || "-",
              jamPelajaran: `${(schedule?.start_time || "").substring(0, 5)} - ${(schedule?.end_time || "").substring(0, 5)}`,
              tanggal: attendance?.date || selectedDate,
            };
          });
        });
        const filtered = flatRows.filter((row) => row.nisn !== "-" || row.namaSiswa !== "-" || row.studentId);
        setRows(filtered);
      } catch (err: any) {
        setError(err?.message || "Gagal memuat data kehadiran siswa.");
        setRows([]);
      } finally {
        setLoading(false);
      }
    };

    fetchAttendance();
  }, [kelasId, selectedDate]);

  const availableMapel = useMemo(
    () => Array.from(new Set(rows.map((row) => row.mataPelajaran))).filter(Boolean).sort(),
    [rows]
  );

  const availableGuru = useMemo(() => {
    const source = selectedMapel
      ? rows.filter((row) => row.mataPelajaran === selectedMapel)
      : rows;
    return Array.from(new Set(source.map((row) => row.namaGuru))).filter(Boolean).sort();
  }, [rows, selectedMapel]);

  useEffect(() => {
    setSelectedGuru("");
  }, [selectedMapel]);

  const filteredRows = useMemo(() => {
    return rows.filter((row) => {
      const mapelMatch = !selectedMapel || row.mataPelajaran === selectedMapel;
      const guruMatch = !selectedGuru || row.namaGuru === selectedGuru;
      return mapelMatch && guruMatch;
    });
  }, [rows, selectedMapel, selectedGuru]);

  const summary = useMemo(() => {
    return {
      hadir: filteredRows.filter((row) => row.status === "hadir").length,
      terlambat: filteredRows.filter((row) => row.status === "terlambat").length,
      izin: filteredRows.filter((row) => row.status === "izin").length,
      sakit: filteredRows.filter((row) => row.status === "sakit").length,
      alfa: filteredRows.filter((row) => row.status === "alfa").length,
      pulang: filteredRows.filter((row) => row.status === "pulang").length,
      dispen: filteredRows.filter((row) => row.status === "dispen").length,
    };
  }, [filteredRows]);

  const columns = useMemo(
    () => [
      { key: "nisn", label: "NISN" },
      { key: "namaSiswa", label: "Nama Siswa" },
      { key: "mataPelajaran", label: "Mata Pelajaran" },
      { key: "namaGuru", label: "Nama Guru" },
      {
        key: "status",
        label: <div style={{ textAlign: "center" }}>Status</div>,
        render: (value: DetailStatusType, row: KehadiranRow) => (
          <div style={{ display: "flex", justifyContent: "center" }}>
            <button
              type="button"
              onClick={() => setSelectedRow(row)}
              style={{
                backgroundColor: STATUS_COLORS[value],
                color: "#FFFFFF",
                border: "none",
                borderRadius: 20,
                minWidth: 110,
                minHeight: 34,
                fontWeight: 700,
                fontSize: 12,
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 6,
                cursor: "pointer",
              }}
            >
              <Eye size={14} />
              {statusLabel(value)}
            </button>
          </div>
        ),
      },
    ],
    []
  );

  const handleExportCSV = () => {
    const header = ["No", "NISN", "Nama Siswa", "Mata Pelajaran", "Nama Guru", "Status", "Tanggal", "Jam"];
    const body = filteredRows.map((row, index) => [
      String(index + 1),
      row.nisn,
      row.namaSiswa,
      row.mataPelajaran,
      row.namaGuru,
      statusLabel(row.status),
      formatDate(row.tanggal || selectedDate),
      row.jamPelajaran || "-",
    ]);

    const csvContent = [header, ...body]
      .map((line) => line.map((item) => `"${String(item).replace(/"/g, '""')}"`).join(","))
      .join("\n");

    const blob = new Blob(["\uFEFF" + csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `Kehadiran_${resolvedNamaKelas}_${selectedDate}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <StaffLayout
      pageTitle={`Detail Kehadiran - ${resolvedNamaKelas}`}
      currentPage={currentPage}
      onMenuClick={onMenuClick}
      user={user}
      onLogout={onLogout}
    >
      <div
        style={{
          backgroundColor: "#FFFFFF",
          borderRadius: 12,
          padding: 20,
          border: "1px solid #E5E7EB",
          boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
        }}
      >
        <div style={{ display: "flex", flexWrap: "wrap", gap: 12, justifyContent: "space-between", marginBottom: 16 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, backgroundColor: "#0B2948", color: "#FFFFFF", borderRadius: 8, padding: "8px 12px", fontWeight: 600 }}>
            <Calendar size={16} />
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              style={{ background: "transparent", border: "none", color: "#FFFFFF", fontWeight: 600, outline: "none" }}
            />
          </div>

          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            <button
              type="button"
              onClick={handleExportCSV}
              style={{
                border: "1px solid #D1D5DB",
                borderRadius: 8,
                backgroundColor: "#FFFFFF",
                padding: "8px 12px",
                fontWeight: 600,
                cursor: "pointer",
              }}
            >
              Unduh CSV
            </button>
            <button
              type="button"
              onClick={() => onMenuClick("rekap-kehadiran-siswa")}
              style={{
                border: "1px solid #2563EB",
                borderRadius: 8,
                backgroundColor: "#2563EB",
                color: "#FFFFFF",
                padding: "8px 12px",
                fontWeight: 600,
                cursor: "pointer",
              }}
            >
              Lihat Rekap
            </button>
            {onBack && (
              <button
                type="button"
                onClick={onBack}
                style={{
                  border: "1px solid #D1D5DB",
                  borderRadius: 8,
                  backgroundColor: "#FFFFFF",
                  padding: "8px 12px",
                  fontWeight: 600,
                  cursor: "pointer",
                }}
              >
                Kembali
              </button>
            )}
          </div>
        </div>

        <div style={{ marginBottom: 16, display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 12 }}>
          <div style={{ backgroundColor: "#0B2948", color: "#FFFFFF", borderRadius: 10, padding: 12 }}>
            <div style={{ fontSize: 12, opacity: 0.8 }}>Kelas</div>
            <div style={{ fontWeight: 700 }}>{resolvedNamaKelas}</div>
            <div style={{ fontSize: 12, opacity: 0.8 }}>Wali: {resolvedWaliKelas}</div>
          </div>

          <select
            value={selectedMapel}
            onChange={(e) => setSelectedMapel(e.target.value)}
            style={{ border: "1px solid #D1D5DB", borderRadius: 8, padding: "10px 12px", fontWeight: 500 }}
          >
            <option value="">Semua Mata Pelajaran</option>
            {availableMapel.map((mapel) => (
              <option key={mapel} value={mapel}>{mapel}</option>
            ))}
          </select>

          <select
            value={selectedGuru}
            onChange={(e) => setSelectedGuru(e.target.value)}
            style={{ border: "1px solid #D1D5DB", borderRadius: 8, padding: "10px 12px", fontWeight: 500 }}
          >
            <option value="">Semua Guru</option>
            {availableGuru.map((guru) => (
              <option key={guru} value={guru}>{guru}</option>
            ))}
          </select>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(120px, 1fr))", gap: 10, marginBottom: 16 }}>
          <SummaryCard label="Hadir" value={summary.hadir} color={STATUS_COLORS.hadir} />
          <SummaryCard label="Terlambat" value={summary.terlambat} color={STATUS_COLORS.terlambat} />
          <SummaryCard label="Izin" value={summary.izin} color={STATUS_COLORS.izin} />
          <SummaryCard label="Sakit" value={summary.sakit} color={STATUS_COLORS.sakit} />
          <SummaryCard label="Alfa" value={summary.alfa} color={STATUS_COLORS.alfa} />
          <SummaryCard label="Pulang" value={summary.pulang} color={STATUS_COLORS.pulang} />
          <SummaryCard label="Dispen" value={summary.dispen} color={STATUS_COLORS.dispen} />
        </div>

        {loading ? (
          <div style={{ textAlign: "center", padding: 24, color: "#6B7280" }}>Memuat data kehadiran...</div>
        ) : error ? (
          <div style={{ textAlign: "center", padding: 24, color: "#B91C1C", fontWeight: 600 }}>{error}</div>
        ) : (
          <Table
            columns={columns}
            data={filteredRows}
            keyField="id"
            emptyMessage="Belum ada data kehadiran untuk tanggal ini."
          />
        )}
      </div>

      <Modal isOpen={Boolean(selectedRow)} onClose={() => setSelectedRow(null)}>
        <div style={{ padding: 20, minWidth: 320 }}>
          <h3 style={{ margin: 0, marginBottom: 16, fontSize: 18, fontWeight: 800, color: "#0B2948" }}>Detail Kehadiran</h3>
          <DetailRow label="Tanggal" value={formatDate(selectedRow?.tanggal || selectedDate)} />
          <DetailRow label="Nama Siswa" value={selectedRow?.namaSiswa || "-"} />
          <DetailRow label="NISN" value={selectedRow?.nisn || "-"} />
          <DetailRow label="Mata Pelajaran" value={selectedRow?.mataPelajaran || "-"} />
          <DetailRow label="Nama Guru" value={selectedRow?.namaGuru || "-"} />
          <DetailRow label="Jam" value={selectedRow?.jamPelajaran || "-"} />
          <DetailRow label="Waktu Masuk" value={selectedRow?.waktuMasuk || "-"} />
          <DetailRow label="Status" value={selectedRow ? statusLabel(selectedRow.status) : "-"} />
          <DetailRow label="Keterangan" value={selectedRow?.keterangan || "-"} />
        </div>
      </Modal>
    </StaffLayout>
  );
}

function SummaryCard({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <div style={{ border: `2px solid ${color}`, borderRadius: 10, padding: 10, textAlign: "center", backgroundColor: "#FFFFFF" }}>
      <div style={{ fontSize: 12, color: "#6B7280", marginBottom: 6 }}>{label}</div>
      <div style={{ fontSize: 22, fontWeight: 800, color }}>{value}</div>
    </div>
  );
}

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <div style={{ display: "flex", justifyContent: "space-between", gap: 8, padding: "8px 0", borderBottom: "1px solid #E5E7EB" }}>
      <span style={{ fontWeight: 600, color: "#374151" }}>{label}</span>
      <span style={{ color: "#1F2937", textAlign: "right", maxWidth: 220 }}>{value}</span>
    </div>
  );
}
