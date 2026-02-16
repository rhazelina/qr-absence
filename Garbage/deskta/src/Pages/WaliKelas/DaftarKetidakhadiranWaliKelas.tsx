import { useState, useMemo, useEffect } from "react";
import WalikelasLayout from "../../component/Walikelas/layoutwakel";
import { User, ArrowLeft, Eye } from "lucide-react";
import { Modal } from "../../component/Shared/Modal";
import { attendanceService } from "../../services/attendance";
import { dashboardService } from "../../services/dashboard";

type StatusKehadiran = "Hadir" | "Izin" | "Sakit" | "Alfa" | "Terlambat" | "Pulang";

// Mapping backend status to frontend status
const MAP_STATUS: Record<string, StatusKehadiran> = {
  'present': 'Hadir',
  'late': 'Terlambat',
  'excused': 'Izin',
  'sick': 'Sakit',
  'absent': 'Alfa',
  'alpha': 'Alfa',
  'dinas': 'Izin', // Or separate if needed
  'izin': 'Izin',
  'pulang': 'Pulang'
};

interface RowKehadiran {
  id: number;
  no: number;
  tanggal: string;
  jam: string;
  mapel: string;
  guru: string;
  status: StatusKehadiran;
  keterangan?: string;
  bukti?: string;
}

interface DaftarKetidakhadiranWaliKelasProps {
  user?: { name: string; role: string };
  currentPage?: string;
  onMenuClick?: (page: string, payload?: any) => void;
  onLogout?: () => void;
  siswaName?: string;
  siswaIdentitas?: string;
  studentId?: string; // Added studentId
}

export default function DaftarKetidakhadiranWaliKelas({
  user = { name: "Wali Kelas", role: "walikelas" },
  currentPage = "daftar-ketidakhadiran-walikelas",
  onMenuClick = () => { },
  onLogout = () => { },
  siswaName = "Siswa",
  siswaIdentitas = "-",
  studentId,
}: DaftarKetidakhadiranWaliKelasProps) {

  const [rows, setRows] = useState<RowKehadiran[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState<RowKehadiran | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      if (!studentId) return;
      setIsLoading(true);
      try {
        // 1. Get Class Info (to ensure we have access/id)
        const classData = await dashboardService.getMyHomeroom();

        if (classData.id) {
          // 2. Fetch Absences
          // We use getClassStudentsAbsences. We might need to filter by studentId if the API returns all.
          // Assuming params can take student_id or we filter client side.
          const response = await attendanceService.getClassStudentsAbsences(classData.id, {});
          const allAbsences = (response.data as any).data || response.data;

          if (Array.isArray(allAbsences)) {
            // Filter by studentId
            const studentAbsences = allAbsences.filter((item: any) => item.student_id.toString() === studentId.toString());

            const mappedRows: RowKehadiran[] = studentAbsences.map((item: any, index: number) => ({
              id: item.id,
              no: index + 1,
              tanggal: item.date,
              jam: item.schedule?.start_time ? `${item.schedule.start_time.slice(0, 5)} - ${item.schedule.end_time.slice(0, 5)}` : '-',
              mapel: item.schedule?.subject_name || '-',
              guru: item.schedule?.teacher?.user?.name || '-',
              status: MAP_STATUS[item.status] || 'Alfa',
              keterangan: item.reason || (item.status === 'alpha' ? 'Tanpa Keterangan' : '-'),
              bukti: item.attachment || null // Assuming attachment field exists
            }));
            setRows(mappedRows);
          }
        }
      } catch (error) {
        console.error("Error fetching absence details:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [studentId]);


  // Hitung statistik
  const stats = useMemo(() => ({
    hadir: rows.filter((r) => r.status === "Hadir").length,
    izin: rows.filter((r) => r.status === "Izin").length,
    sakit: rows.filter((r) => r.status === "Sakit").length,
    alfa: rows.filter((r) => r.status === "Alfa").length,
  }), [rows]);

  const handleBack = () => {
    onMenuClick("rekap-kehadiran-siswa");
  };

  const COLORS = {
    HADIR: "#1FA83D",
    IZIN: "#ACA40D",
    SAKIT: "#520C8F",
    ALFA: "#D90000",
    TERLAMBAT: "#F59E0B",
    PULANG: "#2F85EB"
  };

  const handleStatusClick = (record: RowKehadiran, e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    setSelectedRecord(record);
    setIsModalOpen(true);
  };

  const StatusButton = ({ status, row }: { status: StatusKehadiran; row: RowKehadiran }) => {
    let bgColor = COLORS.ALFA;
    const label = status;
    const textColor = "#FFFFFF";

    switch (status) {
      case "Hadir": bgColor = COLORS.HADIR; break;
      case "Izin": bgColor = COLORS.IZIN; break;
      case "Sakit": bgColor = COLORS.SAKIT; break;
      case "Terlambat": bgColor = COLORS.TERLAMBAT; break;
      case "Pulang": bgColor = COLORS.PULANG; break;
      default: bgColor = COLORS.ALFA; break;
    }

    return (
      <div
        onClick={(e) => handleStatusClick(row, e)}
        style={{
          display: "inline-flex",
          alignItems: "center",
          justifyContent: "center",
          gap: "6px",
          minWidth: "100px",
          padding: "8px 14px",
          borderRadius: "20px",
          fontSize: "12px",
          fontWeight: 800,
          color: textColor,
          backgroundColor: bgColor,
          cursor: "pointer",
          transition: "all 0.2s ease",
          border: "none",
          boxShadow: "0 2px 4px rgba(0, 0, 0, 0.1)",
          minHeight: "36px",
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.opacity = "0.9";
          e.currentTarget.style.transform = "translateY(-1px)";
          e.currentTarget.style.boxShadow = "0 4px 8px rgba(0, 0, 0, 0.15)";
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.opacity = "1";
          e.currentTarget.style.transform = "translateY(0)";
          e.currentTarget.style.boxShadow = "0 2px 4px rgba(0, 0, 0, 0.1)";
        }}
      >
        <Eye size={14} />
        <span style={{ fontWeight: 700 }}>{label}</span>
      </div>
    );
  };

  const getStatusText = (status: StatusKehadiran) => {
    switch (status) {
      case "Hadir": return "Siswa hadir tepat waktu";
      case "Izin": return "Siswa izin dengan keterangan";
      case "Sakit": return "Siswa sakit dengan surat dokter";
      case "Alfa": return "Siswa tidak hadir tanpa keterangan";
      case "Terlambat": return "Siswa terlambat hadir";
      case "Pulang": return "Siswa pulang lebih awal";
      default: return status;
    }
  };

  const getStatusColor = (status: StatusKehadiran) => {
    switch (status) {
      case "Hadir": return COLORS.HADIR;
      case "Izin": return COLORS.IZIN;
      case "Sakit": return COLORS.SAKIT;
      case "Alfa": return COLORS.ALFA;
      case "Terlambat": return COLORS.TERLAMBAT;
      case "Pulang": return COLORS.PULANG;
      default: return "#6B7280";
    }
  };

  return (
    <>
      <WalikelasLayout
        pageTitle="Daftar Ketidakhadiran"
        currentPage={currentPage as any}
        onMenuClick={onMenuClick}
        user={user}
        onLogout={onLogout}
      >
        {/* CARD SISWA */}
        <div
          style={{
            width: "100%",
            maxWidth: 420,
            backgroundColor: "#062A4A",
            borderRadius: 10,
            padding: 18,
            display: "flex",
            gap: 16,
            color: "#fff",
            marginBottom: 24,
          }}
        >
          <div
            style={{
              width: 56,
              height: 56,
              borderRadius: "50%",
              backgroundColor: "rgba(255,255,255,0.15)",
              display: "grid",
              placeItems: "center",
            }}
          >
            <User size={30} />
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 20, fontWeight: 900 }}>{siswaName}</div>
            <div style={{ fontSize: 15, opacity: 0.9, fontWeight: 600 }}>NISN: {siswaIdentitas}</div>
          </div>
        </div>

        {/* STATISTIK KEHADIRAN (Hanya Absensi karena endpoint absensi) */}
        {/* Jika endpoint hanya return absen, statistik Hadir akan 0, which is fine for "Daftar Ketidakhadiran" */}
        <div
          style={{
            display: "flex",
            gap: 12,
            marginBottom: 24,
            flexWrap: "wrap",
          }}
        >
          {/* Removed Hadir stats card if we strictly show absences, but keeping logical consistency with 'stats' object */}
          {/* If we want to show all stats, we'd need a summary endpoint for this student. For now, rely on what we have. */}

          <div
            style={{
              backgroundColor: "#FFFFFF",
              border: `2px solid ${COLORS.IZIN}`,
              borderRadius: 10,
              padding: "12px 24px",
              textAlign: "center",
              minWidth: 100,
              flex: 1,
            }}
          >
            <div style={{ fontSize: 14, fontWeight: 700, color: "#6B7280" }}>
              Izin
            </div>
            <div
              style={{
                fontSize: 32,
                fontWeight: 900,
                color: COLORS.IZIN,
                marginTop: 4,
              }}
            >
              {stats.izin}
            </div>
          </div>

          <div
            style={{
              backgroundColor: "#FFFFFF",
              border: `2px solid ${COLORS.SAKIT}`,
              borderRadius: 10,
              padding: "12px 24px",
              textAlign: "center",
              minWidth: 100,
              flex: 1,
            }}
          >
            <div style={{ fontSize: 14, fontWeight: 700, color: "#6B7280" }}>
              Sakit
            </div>
            <div
              style={{
                fontSize: 32,
                fontWeight: 900,
                color: COLORS.SAKIT,
                marginTop: 4,
              }}
            >
              {stats.sakit}
            </div>
          </div>

          <div
            style={{
              backgroundColor: "#FFFFFF",
              border: `2px solid ${COLORS.ALFA}`,
              borderRadius: 10,
              padding: "12px 24px",
              textAlign: "center",
              minWidth: 100,
              flex: 1,
            }}
          >
            <div style={{ fontSize: 14, fontWeight: 700, color: "#6B7280" }}>
              Alfa
            </div>
            <div
              style={{
                fontSize: 32,
                fontWeight: 900,
                color: COLORS.ALFA,
                marginTop: 4,
              }}
            >
              {stats.alfa}
            </div>
          </div>
        </div>

        {/* BUTTON KEMBALI */}
        <div
          style={{
            display: "flex",
            justifyContent: "flex-end",
            marginBottom: 16,
          }}
        >
          <button
            onClick={handleBack}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              padding: "12px 20px",
              borderRadius: 8,
              backgroundColor: "#062A4A",
              color: "#fff",
              border: "none",
              cursor: "pointer",
              fontSize: 14,
              fontWeight: 700,
              transition: "all 0.2s",
              boxShadow: "0 2px 4px rgba(6, 42, 74, 0.2)",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = "#051A2F";
              e.currentTarget.style.transform = "translateY(-1px)";
              e.currentTarget.style.boxShadow = "0 4px 8px rgba(6, 42, 74, 0.3)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = "#062A4A";
              e.currentTarget.style.transform = "translateY(0)";
              e.currentTarget.style.boxShadow = "0 2px 4px rgba(6, 42, 74, 0.2)";
            }}
          >
            <ArrowLeft size={18} />
            Kembali ke Rekap
          </button>
        </div>

        {/* TABLE */}
        <div
          style={{
            border: "1px solid #E5E7EB",
            borderRadius: 10,
            overflow: "hidden",
            backgroundColor: "#fff",
            boxShadow: "0 4px 12px rgba(0, 0, 0, 0.08)",
          }}
        >
          {/* HEADER */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "70px 140px 140px 1fr 1fr 150px",
              backgroundColor: "#F3F4F6",
              padding: "16px 20px",
              fontWeight: 800,
              fontSize: 14,
              color: "#374151",
              borderBottom: "2px solid #E5E7EB",
            }}
          >
            <div style={{ textAlign: "center", fontWeight: 900 }}>No</div>
            <div style={{ textAlign: "center", fontWeight: 900 }}>Tanggal</div>
            <div style={{ textAlign: "center", fontWeight: 900 }}>Jam Pelajaran</div>
            <div style={{ fontWeight: 900 }}>Mata Pelajaran</div>
            <div style={{ fontWeight: 900 }}>Guru</div>
            <div style={{ textAlign: "center", fontWeight: 900 }}>Status</div>
          </div>

          {/* ROWS */}
          {isLoading ? (
            <div style={{ padding: "20px", textAlign: "center", color: "#6B7280" }}>Memuat riwayat...</div>
          ) : rows.length === 0 ? (
            <div style={{ padding: "40px", textAlign: "center", color: "#9CA3AF" }}>Tidak ada data ketidakhadiran.</div>
          ) : (
            rows.map((r, idx) => (
              <div
                key={r.no}
                style={{
                  display: "grid",
                  gridTemplateColumns: "70px 140px 140px 1fr 1fr 150px",
                  padding: "16px 20px",
                  fontSize: 14,
                  alignItems: "center",
                  borderBottom: idx < rows.length - 1 ? "1px solid #F3F4F6" : "none",
                  backgroundColor: idx % 2 === 0 ? "#FFFFFF" : "#FAFBFC",
                  transition: "background-color 0.2s",
                }}
                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = "#F3F4F6"}
                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = idx % 2 === 0 ? "#FFFFFF" : "#FAFBFC"}
              >
                <div style={{ textAlign: "center", color: "#6B7280", fontWeight: "700" }}>{r.no}</div>
                <div style={{ textAlign: "center", color: "#374151", fontWeight: "700" }}>{r.tanggal}</div>
                <div style={{ textAlign: "center", color: "#374151", fontWeight: "700" }}>{r.jam}</div>
                <div style={{ color: "#111827", fontWeight: "800" }}>{r.mapel}</div>
                <div style={{ color: "#374151", fontWeight: "600" }}>{r.guru}</div>
                <div style={{ display: "flex", justifyContent: "center" }}>
                  <StatusButton status={r.status} row={r} />
                </div>
              </div>
            ))
          )}
        </div>

        {/* SUMMARY FOOTER */}
        <div
          style={{
            marginTop: 24,
            padding: "20px",
            backgroundColor: "#F8FAFC",
            borderRadius: "10px",
            border: "2px solid #E2E8F0",
            textAlign: "center",
            boxShadow: "0 2px 8px rgba(0, 0, 0, 0.05)",
          }}
        >
          <div style={{
            fontSize: "16px",
            fontWeight: 900,
            color: "#6B7280",
            marginBottom: "8px",
          }}>
            Total Data Ketidakhadiran
          </div>
          <div style={{
            fontSize: "36px",
            fontWeight: 900,
            color: "#062A4A",
          }}>
            {rows.length}
          </div>
        </div>
      </WalikelasLayout>

      {/* Modal Detail Kehadiran */}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)}>
        {selectedRecord && (
          <div style={{
            backgroundColor: "#FFFFFF",
            borderRadius: "12px",
            width: "100%",
            maxWidth: "420px",
            boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1)",
            overflow: "hidden",
            maxHeight: "90vh",
            display: "flex",
            flexDirection: "column",
          }}>
            {/* Header Modal */}
            <div style={{
              backgroundColor: "#062A4A",
              padding: "18px 24px",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              color: "#FFFFFF",
            }}>
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <Eye size={24} />
                <h3 style={{
                  margin: 0,
                  fontSize: "20px",
                  fontWeight: 900,
                }}>
                  Detail Ketidakhadiran
                </h3>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                style={{
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  color: "#FFFFFF",
                  display: "flex",
                  alignItems: "center",
                  padding: 0,
                  fontWeight: 700,
                }}
              >
                ✕
              </button>
            </div>

            {/* Content Modal */}
            <div style={{
              padding: 24,
              overflowY: "auto",
              flex: 1,
            }}>
              <DetailRow label="Tanggal" value={selectedRecord.tanggal} />
              <DetailRow label="Jam Pelajaran" value={selectedRecord.jam} />
              <DetailRow label="Mata pelajaran" value={selectedRecord.mapel} />
              <DetailRow label="Nama guru" value={selectedRecord.guru} />

              <div style={{
                display: "flex",
                justifyContent: "space-between",
                marginBottom: 24,
                paddingBottom: 12,
                borderBottom: "1px solid #E5E7EB",
              }}>
                <div style={{ fontWeight: 800, color: "#374151" }}>Status :</div>
                <div>
                  <span style={{
                    backgroundColor: getStatusColor(selectedRecord.status),
                    color: "#FFFFFF",
                    padding: "6px 18px",
                    borderRadius: 6,
                    fontSize: 14,
                    fontWeight: 800,
                  }}>
                    {selectedRecord.status}
                  </span>
                </div>
              </div>

              <div style={{
                backgroundColor: "#EFF6FF",
                border: "2px solid #BFDBFE",
                borderRadius: 8,
                padding: 16,
                textAlign: "center",
                marginBottom: (selectedRecord.status !== "Hadir") && selectedRecord.keterangan ? 24 : 0,
              }}>
                <div style={{
                  fontSize: 14,
                  fontWeight: 800,
                  color: "#1E40AF",
                }}>
                  {getStatusText(selectedRecord.status)}
                </div>
              </div>

              {((selectedRecord.status !== "Hadir")) && selectedRecord.keterangan && (
                <div>
                  <div style={{
                    fontSize: 14,
                    fontWeight: 800,
                    color: "#374151",
                    marginBottom: 12,
                  }}>
                    Keterangan :
                  </div>
                  <div style={{
                    padding: "14px 18px",
                    backgroundColor: "#F9FAFB",
                    borderRadius: 8,
                    border: "2px solid #E5E7EB",
                    marginBottom: 24
                  }}>
                    <p style={{
                      margin: 0,
                      fontSize: 14,
                      color: "#6B7280",
                      lineHeight: 1.5,
                      fontWeight: 600,
                    }}>
                      {selectedRecord.keterangan}
                    </p>
                  </div>
                </div>
              )}

              {/* Area Bukti Foto */}
              {selectedRecord.bukti && (
                <div style={{ marginTop: 0 }}>
                  <div style={{
                    fontSize: 14,
                    fontWeight: 800,
                    color: "#374151",
                    marginBottom: 12,
                  }}>
                    Bukti Foto :
                  </div>
                  <div style={{
                    padding: "16px",
                    backgroundColor: "#F9FAFB",
                    borderRadius: 8,
                    border: "2px solid #E5E7EB",
                    minHeight: 100,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}>
                    {/* Placeholder for image */}
                    <div style={{ textAlign: 'center' }}>
                      {/* In real app, render <img src={selectedRecord.bukti} /> */}
                      <p style={{ color: '#9CA3AF' }}>📷 {selectedRecord.bukti}</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </Modal>
    </>
  );
}

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <div style={{
      display: "flex",
      justifyContent: "space-between",
      marginBottom: 16,
      paddingBottom: 12,
      borderBottom: "1px solid #E5E7EB",
    }}>
      <div style={{ fontWeight: 800, color: "#374151" }}>{label} :</div>
      <div style={{ fontWeight: 700, color: "#1F2937" }}>
        {value}
      </div>
    </div>
  );
}