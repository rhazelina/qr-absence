import { useEffect, useMemo, useState } from "react";
import StaffLayout from "../../component/WakaStaff/StaffLayout";
import { User, ArrowLeft, Eye } from "lucide-react";
import { Modal } from "../../component/Shared/Modal";
import { attendanceService } from "../../services/attendanceService";

type StatusKehadiran = "Izin" | "Sakit" | "Alfa" | "Pulang" | "Dispen";

type RowKehadiran = {
  id: string;
  tanggal: string;
  jam: string;
  mapel: string;
  guru: string;
  status: StatusKehadiran;
  keterangan?: string;
};

interface DaftarKetidakhadiranProps {
  user?: { name: string; role: string };
  currentPage?: string;
  onMenuClick?: (page: string) => void;
  onLogout?: () => void;
  onBack?: () => void;
  siswaName?: string;
  siswaIdentitas?: string;
  studentId?: string;
  classId?: string;
}

const mapBackendStatus = (status: string): StatusKehadiran | null => {
  const value = String(status || "").toLowerCase();
  if (value === "permission" || value === "excused" || value === "izin") return "Izin";
  if (value === "sick") return "Sakit";
  if (value === "absent" || value === "alpha") return "Alfa";
  if (value === "return" || value === "leave_early") return "Pulang";
  if (value === "dispensation" || value === "dispensasi" || value === "dispen") return "Dispen";
  return null;
};

const formatDate = (date: string): string => {
  const d = new Date(date);
  if (Number.isNaN(d.getTime())) return date;
  return d.toLocaleDateString("id-ID", { day: "2-digit", month: "2-digit", year: "numeric" });
};


export default function DaftarKetidakhadiran({
  user = { name: "Admin", role: "waka" },
  currentPage = "daftar-ketidakhadiran",
  onMenuClick = () => {},
  onLogout = () => {},
  onBack = () => {},
  siswaName = "Siswa",
  siswaIdentitas = "",
  studentId,
  classId,
}: DaftarKetidakhadiranProps) {
  const COLORS = {
    IZIN: "#ACA40D",
    PULANG: "#2F85EB",
    TIDAK_HADIR: "#D90000",
    SAKIT: "#520C8F",
    DISPEN: "#E45A92",
  };

  const [selectedRecord, setSelectedRecord] = useState<RowKehadiran | null>(null);
  const [rows, setRows] = useState<RowKehadiran[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchAbsences = async () => {
      if (!classId) {
        setError("Kelas tidak tersedia untuk memuat ketidakhadiran.");
        setRows([]);
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      setError(null);

      try {
        const response = await attendanceService.getClassStudentsAbsences(classId, { per_page: 200 });
        const groups = Array.isArray(response?.data) ? response.data : (Array.isArray(response) ? response : []);

        const target = groups.find((group: any) => {
          const student = group?.student || {};
          const idMatch = studentId ? String(student.id) === String(studentId) : false;
          const nisnMatch = siswaIdentitas ? String(student.nisn) === String(siswaIdentitas) : false;
          return idMatch || nisnMatch;
        });

        const items = Array.isArray(target?.items) ? target.items : [];
        const mapped = items
          .map((item: any) => {
            const status = mapBackendStatus(item?.status);
            if (!status) return null;
            return {
              id: item?.id ? String(item.id) : `${item?.date || "-"}-${item?.schedule_id || "-"}`,
              tanggal: formatDate(item?.date || "-"),
              jam: item?.schedule?.start_time ? String(item.schedule.start_time).substring(0, 5) : "-",
              mapel: item?.schedule?.subject?.name || item?.schedule?.keterangan || "-",
              guru: item?.schedule?.teacher?.user?.name || "-",
              status,
              keterangan: item?.reason || item?.notes || "-",
            } as RowKehadiran;
          })
          .filter(Boolean) as RowKehadiran[];

        setRows(mapped);
      } catch (err: any) {
        setError(err?.message || "Gagal memuat daftar ketidakhadiran.");
        setRows([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchAbsences();
  }, [classId, studentId, siswaIdentitas]);

  const stats = useMemo(() => {
    return {
      izin: rows.filter((r) => r.status === "Izin").length,
      sakit: rows.filter((r) => r.status === "Sakit").length,
      tidakHadir: rows.filter((r) => r.status === "Alfa").length,
      pulang: rows.filter((r) => r.status === "Pulang").length,
      dispen: rows.filter((r) => r.status === "Dispen").length,
    };
  }, [rows]);

  const getStatusColor = (status: StatusKehadiran) => {
    if (status === "Izin") return COLORS.IZIN;
    if (status === "Sakit") return COLORS.SAKIT;
    if (status === "Pulang") return COLORS.PULANG;
    if (status === "Dispen") return COLORS.DISPEN;
    return COLORS.TIDAK_HADIR;
  };

  const StatusButton = ({ status, row }: { status: StatusKehadiran; row: RowKehadiran }) => (
    <button
      type="button"
      onClick={() => setSelectedRecord(row)}
      style={{
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        gap: "6px",
        minWidth: "100px",
        padding: "8px 14px",
        borderRadius: "20px",
        fontSize: "12px",
        fontWeight: 700,
        color: "#FFFFFF",
        backgroundColor: getStatusColor(status),
        cursor: "pointer",
        border: "none",
      }}
    >
      <Eye size={14} />
      <span>{status}</span>
    </button>
  );

  return (
    <>
      <StaffLayout
        user={user}
        currentPage={currentPage}
        onMenuClick={onMenuClick}
        onLogout={onLogout}
        pageTitle="Daftar Ketidakhadiran"
      >
        <div style={{ padding: "0 24px" }}>
          <div style={{ marginBottom: "24px", display: "flex", justifyContent: "flex-end" }}>
            <button
              onClick={onBack}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "8px",
                padding: "10px 20px",
                backgroundColor: "#FFFFFF",
                border: "2px solid #2F85EB",
                borderRadius: "8px",
                fontSize: "14px",
                fontWeight: 600,
                color: "#2F85EB",
                cursor: "pointer",
              }}
            >
              <ArrowLeft size={18} />
              <span>Kembali</span>
            </button>
          </div>

          <div style={{
            backgroundColor: "#0F3A5F",
            borderRadius: "12px",
            padding: "20px 24px",
            marginBottom: "24px",
            maxWidth: "450px",
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
              <div style={{ width: "56px", height: "56px", borderRadius: "50%", backgroundColor: "#FFFFFF", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <User size={32} color="#0F3A5F" />
              </div>
              <div>
                <h2 style={{ margin: 0, fontSize: "18px", fontWeight: 700, color: "#FFFFFF", marginBottom: "4px" }}>
                  {siswaName}
                </h2>
                <p style={{ margin: 0, fontSize: "14px", color: "#E5E7EB" }}>
                  {siswaIdentitas || "-"}
                </p>
              </div>
            </div>
          </div>

          <div style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))",
            gap: "16px",
            marginBottom: "24px",
            maxWidth: "800px",
          }}>
            <SummaryCard label="Izin" value={stats.izin} color={COLORS.IZIN} />
            <SummaryCard label="Sakit" value={stats.sakit} color={COLORS.SAKIT} />
            <SummaryCard label="Dispen" value={stats.dispen} color={COLORS.DISPEN} />
            <SummaryCard label="Alfa" value={stats.tidakHadir} color={COLORS.TIDAK_HADIR} />
            <SummaryCard label="Pulang" value={stats.pulang} color={COLORS.PULANG} />
          </div>

          <div style={{ backgroundColor: "#FFFFFF", borderRadius: "12px", border: "1px solid #E5E7EB", overflow: "hidden" }}>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr style={{ backgroundColor: "#F9FAFB", borderBottom: "1px solid #E5E7EB" }}>
                  <th style={thStyle}>No</th>
                  <th style={thStyle}>Tanggal</th>
                  <th style={thStyle}>Jam</th>
                  <th style={thStyle}>Mapel</th>
                  <th style={thStyle}>Guru</th>
                  <th style={thStyle}>Status</th>
                </tr>
              </thead>
              <tbody>
                {isLoading ? (
                  <tr><td colSpan={6} style={emptyStyle}>Memuat data ketidakhadiran...</td></tr>
                ) : error ? (
                  <tr><td colSpan={6} style={{ ...emptyStyle, color: "#B91C1C", fontWeight: 700 }}>{error}</td></tr>
                ) : rows.length === 0 ? (
                  <tr><td colSpan={6} style={emptyStyle}>Tidak ada data ketidakhadiran siswa ini.</td></tr>
                ) : (
                  rows.map((row, index) => (
                    <tr key={row.id} style={{ borderBottom: "1px solid #F3F4F6" }}>
                      <td style={tdStyle}>{index + 1}</td>
                      <td style={tdStyle}>{row.tanggal}</td>
                      <td style={tdStyle}>{row.jam}</td>
                      <td style={tdStyle}>{row.mapel}</td>
                      <td style={tdStyle}>{row.guru}</td>
                      <td style={{ ...tdStyle, textAlign: "center" }}>
                        <StatusButton status={row.status} row={row} />
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </StaffLayout>

      <Modal isOpen={Boolean(selectedRecord)} onClose={() => setSelectedRecord(null)}>
        <div style={{ padding: 20, minWidth: 320 }}>
          <h3 style={{ marginTop: 0, marginBottom: 16 }}>Detail Ketidakhadiran</h3>
          <DetailRow label="Tanggal" value={selectedRecord?.tanggal || "-"} />
          <DetailRow label="Jam" value={selectedRecord?.jam || "-"} />
          <DetailRow label="Mata Pelajaran" value={selectedRecord?.mapel || "-"} />
          <DetailRow label="Guru" value={selectedRecord?.guru || "-"} />
          <DetailRow label="Status" value={selectedRecord?.status || "-"} />
          <DetailRow label="Keterangan" value={selectedRecord?.keterangan || "-"} />
        </div>
      </Modal>
    </>
  );
}

function SummaryCard({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <div style={{ backgroundColor: "#FFFFFF", borderRadius: "12px", padding: "16px", border: `2px solid ${color}` }}>
      <div style={{ fontSize: "13px", color: "#6B7280", marginBottom: "6px" }}>{label}</div>
      <div style={{ fontSize: "30px", fontWeight: 700, color }}>{value}</div>
    </div>
  );
}

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 12, paddingBottom: 10, borderBottom: "1px solid #E5E7EB" }}>
      <span style={{ fontWeight: 600 }}>{label}</span>
      <span style={{ maxWidth: 200, textAlign: "right" }}>{value}</span>
    </div>
  );
}

const thStyle: React.CSSProperties = {
  padding: "12px 16px",
  textAlign: "left",
  fontSize: "13px",
  fontWeight: 700,
  color: "#374151",
};

const tdStyle: React.CSSProperties = {
  padding: "12px 16px",
  fontSize: "13px",
  color: "#1F2937",
};

const emptyStyle: React.CSSProperties = {
  padding: "20px",
  textAlign: "center",
  color: "#6B7280",
};
