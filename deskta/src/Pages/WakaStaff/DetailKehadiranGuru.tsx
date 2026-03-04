import { useState, useEffect } from "react";
import { User, ArrowLeft, Eye, X } from "lucide-react";
import { useLocation, useParams, useNavigate } from "react-router-dom";
import StaffLayout from "../../component/WakaStaff/StaffLayout";
import { attendanceService } from "../../services/attendanceService";
import { masterService } from "../../services/masterService";

type StatusKehadiran = "Hadir" | "Izin" | "Sakit" | "Alfa" | "Pulang" | "Tidak Ada Jadwal" | "Terlambat" | "Tidak Hadir";

type RowKehadiran = {
  no: number;
  tanggal: string;
  jam: string;
  mapel: string;
  kelas: string;
  status: StatusKehadiran;
  originalStatus?: string; // For storage
};

interface DetailKehadiranGuruProps {
  user: { name: string; role: string };
  onLogout: () => void;
  currentPage: string;
  onMenuClick: (page: string) => void;
  onBack?: () => void;
  teacherId?: string;
  guruName?: string;
}

export default function DetailKehadiranGuru({
  user,
  currentPage,
  onMenuClick,
  onLogout,
  onBack,
  teacherId,
  guruName,
}: DetailKehadiranGuruProps) {
  const { id } = useParams<{ id: string }>();
  const location = useLocation();
  const navigate = useNavigate();

  // Try to get teacher info from state or fallback
  const initialGuruName = location.state?.guruName || guruName || "Nama Guru";
  const resolvedTeacherId =
    location.state?.teacherId || location.state?.guruId || teacherId || id;
  const [currentGuruName, setCurrentGuruName] = useState(initialGuruName);
  
  const [rows, setRows] = useState<RowKehadiran[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Date filter state
  const [startDate, setStartDate] = useState(
    new Date(new Date().setDate(new Date().getDate() - 30)).toISOString().slice(0, 10) // Last 30 days
  );
  const [endDate, setEndDate] = useState(
    new Date().toISOString().slice(0, 10)
  );

  const dateRangeError = startDate > endDate ? "Rentang tanggal tidak valid. Tanggal mulai tidak boleh melebihi tanggal akhir." : null;

  // State untuk modal detail
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [selectedDetail, setSelectedDetail] = useState<RowKehadiran | null>(null);

  useEffect(() => {
    const fallbackName = location.state?.guruName || guruName;
    if (fallbackName) {
      setCurrentGuruName(fallbackName);
    }
  }, [location.state?.guruName, guruName]);

  useEffect(() => {
    if (dateRangeError) {
      setRows([]);
      setLoading(false);
      return;
    }
    if (resolvedTeacherId) {
      fetchData(String(resolvedTeacherId));
    } else {
      setRows([]);
      setLoading(false);
    }
  }, [resolvedTeacherId, startDate, endDate, dateRangeError]);

  const fetchData = async (teacherId: string) => {
    setLoading(true);
    setError(null);
    try {
      const [historyResponse, timeSlotsResponse] = await Promise.all([
        attendanceService.getTeacherAttendanceHistory(teacherId, { from: startDate, to: endDate }),
        masterService.getTimeSlots()
      ]);

      const history = historyResponse.history || [];
      const teacher = historyResponse.teacher;
      
      if (teacher) {
        const fetchedGuruName = teacher.user?.name || teacher.name;
        if (fetchedGuruName) {
          setCurrentGuruName(fetchedGuruName);
        }
      }

      const timeSlots = timeSlotsResponse.data || [];
      // Create map for quick lookup
      // Assuming keys are start_time or we find closest
      
      const newRows = history.map((item: any, index: number) => {
        // Safe navigation for nested properties
        const schedule = item.schedule || {};
        const subject = schedule.subject || {};
        const dailySchedule = schedule.daily_schedule || {};
        const classSchedule = dailySchedule.class_schedule || {};
        const classRoom = classSchedule.class || {}; // 'class' is reserved word in JS but property name in JSON
        // Actually checks response structure. 'class' in JSON is fine.

        // Determine Jam
        let jamStr = "-";
        if (schedule.start_time) {
            // Find slot
            const slot = timeSlots.find((s: any) => s.start_time === schedule.start_time);
            if (slot) {
                jamStr = slot.name; // e.g., "Jam 1"
            } else {
                jamStr = schedule.start_time.substring(0, 5);
            }
            if (schedule.end_time) {
                // jamStr += ` - ${schedule.end_time.substring(0, 5)}`;
            }
        }

        // Map status
        let status: StatusKehadiran = "Tidak Hadir";
        const s = item.status;
        if (s === "present") status = "Hadir";
        else if (s === "late") status = "Terlambat";
        else if (s === "sick") status = "Sakit";
        else if (s === "permission" || s === "izin" || s === "excused") status = "Izin";
        else if (s === "return") status = "Pulang";
        else if (s === "alpha") status = "Alfa";
        else if (s === "absent") status = "Tidak Hadir";

        return {
          no: index + 1,
          tanggal: item.date,
          jam: jamStr,
          mapel: subject.name || schedule.keterangan || "-",
          kelas: classRoom.name || "-",
          status: status,
          originalStatus: s
        };
      });

      setRows(newRows);
    } catch (err: any) {
       console.error("Error fetching detail:", err);
       setError(err?.message || "Gagal memuat riwayat kehadiran guru.");
       setRows([]);
    } finally {
       setLoading(false);
    }
  };

  const handleOpenDetail = (row: RowKehadiran) => {
    setSelectedDetail(row);
    setIsDetailOpen(true);
  };

  const getStatusColor = (status: StatusKehadiran) => {
    switch (status) {
      case "Hadir":
        return { bg: "#1FA83D", text: "#FFFFFF", border: "#1FA83D", shadow: "0 1px 3px rgba(31, 168, 61, 0.3)" };
      case "Izin":
        return { bg: "#ACA40D", text: "#FFFFFF", border: "#ACA40D", shadow: "0 1px 3px rgba(172, 164, 13, 0.3)" };
      case "Sakit":
        return { bg: "#520C8F", text: "#FFFFFF", border: "#520C8F", shadow: "0 1px 3px rgba(82, 12, 143, 0.3)" };
      case "Alfa":
        return { bg: "#D90000", text: "#FFFFFF", border: "#D90000", shadow: "0 1px 3px rgba(217, 0, 0, 0.3)" };
      case "Pulang":
        return { bg: "#2F85EB", text: "#FFFFFF", border: "#2F85EB", shadow: "0 1px 3px rgba(47, 133, 235, 0.3)" };
      case "Terlambat":
        return { bg: "#ACA40D", text: "#FFFFFF", border: "#ACA40D", shadow: "0 1px 3px rgba(172, 164, 13, 0.3)" };
      case "Tidak Ada Jadwal":
        return { bg: "#9CA3AF", text: "#FFFFFF", border: "#9CA3AF", shadow: "0 1px 3px rgba(156, 163, 175, 0.3)" };
      default:
        return { bg: "#6B7280", text: "#FFFFFF", border: "#6B7280", shadow: "0 1px 3px rgba(107, 114, 128, 0.3)" };
    }
  };

  const handleBack = () => {
      if (onBack) {
          onBack();
      } else {
          navigate(-1);
      }
  };

  return (
    <StaffLayout
      pageTitle="Detail Kehadiran Guru"
      currentPage={currentPage}
      onMenuClick={onMenuClick}
      user={user}
      onLogout={onLogout}
    >
      {/* CARD GURU */}
      <div
        style={{
          width: "100%",
          maxWidth: 420,
          backgroundColor: "#062A4A",
          borderRadius: 10,
          padding: "18px 20px",
          display: "flex",
          gap: 16,
          color: "#fff",
          marginBottom: 24,
          boxShadow: "0 2px 8px rgba(0, 0, 0, 0.1)",
        }}
      >
        <div
          style={{
            width: 56,
            height: 56,
            borderRadius: "50%",
            backgroundColor: "rgba(255,255,255,0.2)",
            display: "grid",
            placeItems: "center",
            flexShrink: 0,
          }}
        >
          <User size={30} color="#fff" />
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 20, fontWeight: 800, marginBottom: 4 }}>
            {currentGuruName}
          </div>
          <div style={{ fontSize: 15, opacity: 0.9 }}>
            Guru
          </div>
        </div>
      </div>

      {/* FILTER & BACK */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: 20,
          flexWrap: "wrap",
          gap: 16,
        }}
      >
         <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, backgroundColor: "white", padding: "8px 12px", borderRadius: "8px", border: "1px solid #e5e7eb" }}>
                <span style={{ fontSize: 14, color: "#6b7280" }}>Dari:</span>
                <input 
                    type="date" 
                    value={startDate} 
                    onChange={(e) => setStartDate(e.target.value)}
                    style={{ border: "none", outline: "none", fontSize: 14 }}
                />
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 8, backgroundColor: "white", padding: "8px 12px", borderRadius: "8px", border: "1px solid #e5e7eb" }}>
                <span style={{ fontSize: 14, color: "#6b7280" }}>Sampai:</span>
                <input 
                    type="date" 
                    value={endDate} 
                    onChange={(e) => setEndDate(e.target.value)}
                    style={{ border: "none", outline: "none", fontSize: 14 }}
                />
            </div>
         </div>

        <button
          onClick={handleBack}
          style={{
            display: "flex",
            alignItems: "center",
            gap: 8,
            padding: "10px 16px",
            borderRadius: 8,
            backgroundColor: "#4B5563",
            color: "#fff",
            border: "none",
            cursor: "pointer",
            fontSize: 14,
            fontWeight: 600,
            transition: "background-color 0.2s",
          }}
          onMouseEnter={(e) => e.currentTarget.style.backgroundColor = "#374151"}
          onMouseLeave={(e) => e.currentTarget.style.backgroundColor = "#4B5563"}
        >
          <ArrowLeft size={16} />
          Kembali
        </button>
      </div>

      {/* TABLE CONTAINER - LEBIH LEBAR KE KANAN */}
      <div
        style={{
          border: "1px solid #E5E7EB",
          borderRadius: 10,
          overflow: "hidden",
          backgroundColor: "#fff",
          boxShadow: "0 1px 3px rgba(0, 0, 0, 0.05)",
        }}
      >
        {/* HEADER - KOLOM LEBIH LEBAR */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "60px 140px 100px 160px 150px 200px 80px",
            backgroundColor: "#F9FAFB",
            padding: "16px 24px",
            fontWeight: 700,
            fontSize: 13,
            color: "#374151",
            borderBottom: "2px solid #E5E7EB",
            alignItems: "center",
            gap: "24px",
            letterSpacing: "0.3px",
          }}
        >
          <div style={{ textAlign: "center" }}>No</div>
          <div style={{ textAlign: "center" }}>Tanggal</div>
          <div style={{ textAlign: "center" }}>Jam</div>
          <div style={{ textAlign: "center" }}>Mapel</div>
          <div style={{ textAlign: "center" }}>Kelas</div>
          <div style={{ textAlign: "center" }}>Status</div>
          <div style={{ textAlign: "center" }}>Detail</div>
        </div>

        {/* BODY ROWS */}
        {dateRangeError ? (
             <div style={{ padding: "40px", textAlign: "center", color: "#B91C1C", fontWeight: 700 }}>{dateRangeError}</div>
        ) : loading ? (
             <div style={{ padding: "40px", textAlign: "center", color: "#6b7280" }}>Memuat riwayat kehadiran...</div>
        ) : error ? (
             <div style={{ padding: "40px", textAlign: "center", color: "#B91C1C", fontWeight: 700 }}>{error}</div>
        ) : rows.length === 0 ? (
             <div style={{ padding: "40px", textAlign: "center", color: "#6b7280" }}>Tidak ada data kehadiran pada rentang tanggal ini.</div>
        ) : (
            rows.map((row) => {
            const statusColor = getStatusColor(row.status);

            return (
                <div
                key={row.no}
                style={{
                    display: "grid",
                    gridTemplateColumns: "60px 140px 100px 160px 150px 200px 80px",
                    padding: "14px 24px",
                    borderBottom: "1px solid #F3F4F6",
                    alignItems: "center",
                    gap: "24px",
                    fontSize: 13,
                    transition: "background-color 0.15s",
                }}
                onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#F9FAFB")}
                onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "transparent")}
                >
                {/* No */}
                <div style={{ textAlign: "center", fontWeight: 600, color: "#374151" }}>
                    {row.no}
                </div>

                {/* Tanggal */}
                <div style={{ textAlign: "center", color: "#1F2937" }}>
                    {row.tanggal}
                </div>

                {/* Jam */}
                <div style={{ textAlign: "center", fontWeight: 600, color: "#374151" }}>
                    {row.jam}
                </div>

                {/* Mapel */}
                <div style={{ textAlign: "center", color: "#1F2937" }}>
                    {row.mapel}
                </div>

                {/* Kelas */}
                <div style={{ textAlign: "center", color: "#1F2937" }}>
                    {row.kelas}
                </div>

                {/* Status */}
                <div style={{ display: "flex", justifyContent: "center" }}>
                    <button
                    onClick={() => handleOpenDetail(row)}
                    style={{
                        backgroundColor: statusColor.bg,
                        color: statusColor.text,
                        padding: "6px 14px",
                        borderRadius: 16,
                        fontSize: 12,
                        fontWeight: 700,
                        border: `1px solid ${statusColor.border}`,
                        boxShadow: statusColor.shadow,
                        textAlign: "center",
                        letterSpacing: "0.3px",
                        display: "flex",
                        alignItems: "center",
                        gap: 6,
                        cursor: "pointer",
                        transition: "all 0.2s",
                    }}
                    onMouseEnter={(e) => {
                        e.currentTarget.style.transform = "scale(1.05)";
                        e.currentTarget.style.boxShadow = statusColor.shadow.replace("0.3", "0.5");
                    }}
                    onMouseLeave={(e) => {
                        e.currentTarget.style.transform = "scale(1)";
                        e.currentTarget.style.boxShadow = statusColor.shadow;
                    }}
                    >
                    <Eye size={14} color="#FFFFFF" />
                    <span>{row.status === "Alfa" ? "Alfa" : row.status}</span>
                    </button>
                </div>

                    {/* Detail */}
                    <div
                        style={{
                        display: "flex",
                        gap: 10,
                        justifyContent: "center",
                        alignItems: "center",
                        }}
                    >
                        <button
                          type="button"
                          onClick={() => handleOpenDetail(row)}
                          title="Lihat detail"
                          style={{
                            background: "none",
                            border: "none",
                            cursor: "pointer",
                            padding: 0,
                            display: "inline-flex",
                            alignItems: "center",
                            justifyContent: "center",
                          }}
                        >
                          <Eye size={16} color="#1F2937" />
                        </button>
                    </div>
                </div>
            );
            })
        )}
      </div>

      {/* DETAIL MODAL */}
      {isDetailOpen && selectedDetail && (
        <DetailModal
          data={{
            tanggal: selectedDetail.tanggal,
            jamPelajaran: selectedDetail.jam,
            mataPelajaran: selectedDetail.mapel,
            kelas: selectedDetail.kelas,
            namaGuru: currentGuruName,
            status: selectedDetail.status,
          }}
          onClose={() => setIsDetailOpen(false)}
        />
      )}
    </StaffLayout>
  );
}

// KOMPONEN MODAL DETAIL
type DetailModalProps = {
  data: {
    tanggal: string;
    jamPelajaran: string;
    mataPelajaran: string;
    kelas: string;
    namaGuru: string;
    status: string;
  };
  onClose: () => void;
};

function DetailModal({ data, onClose }: DetailModalProps) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case "Hadir":
        return { bg: "#1FA83D", text: "#FFFFFF", border: "#1FA83D", shadow: "0 1px 3px rgba(31, 168, 61, 0.3)" };
      case "Izin":
        return { bg: "#ACA40D", text: "#FFFFFF", border: "#ACA40D", shadow: "0 1px 3px rgba(172, 164, 13, 0.3)" };
      case "Sakit":
        return { bg: "#520C8F", text: "#FFFFFF", border: "#520C8F", shadow: "0 1px 3px rgba(82, 12, 143, 0.3)" };
      case "Alfa":
        return { bg: "#D90000", text: "#FFFFFF", border: "#D90000", shadow: "0 1px 3px rgba(217, 0, 0, 0.3)" };
      case "Pulang":
        return { bg: "#2F85EB", text: "#FFFFFF", border: "#2F85EB", shadow: "0 1px 3px rgba(47, 133, 235, 0.3)" };
      case "Terlambat":
        return { bg: "#ACA40D", text: "#FFFFFF", border: "#ACA40D", shadow: "0 1px 3px rgba(172, 164, 13, 0.3)" };
      case "Tidak Ada Jadwal":
        return { bg: "#9CA3AF", text: "#FFFFFF", border: "#9CA3AF", shadow: "0 1px 3px rgba(156, 163, 175, 0.3)" };
      default:
        return { bg: "#6B7280", text: "#FFFFFF", border: "#6B7280", shadow: "0 1px 3px rgba(107, 114, 128, 0.3)" };
    }
  };

  const getStatusText = (status: string) => {
    return status === "Alfa" ? "Alfa" : status;
  };

  const getStatusDescription = (status: string) => {
    switch (status) {
      case "Hadir":
        return "Guru hadir tepat waktu";
      case "Izin":
        return "Guru izin dengan keterangan";
      case "Sakit":
        return "Guru sakit dengan surat dokter";
      case "Alfa":
        return "Guru tidak hadir tanpa keterangan";
      case "Pulang":
        return "Guru sudah pulang dari sekolah";
      case "Terlambat":
        return "Guru hadir terlambat";
      case "Tidak Ada Jadwal":
        return "Guru tidak ada jadwal mengajar pada jam ini";
      default:
        return "";
    }
  };

  const statusColor = getStatusColor(data.status);

  return (
    <>
      {/* Overlay */}
      <div
        onClick={onClose}
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: "rgba(0, 0, 0, 0.5)",
          zIndex: 999,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        {/* Modal */}
        <div
          onClick={(e) => e.stopPropagation()}
          style={{
            backgroundColor: "#FFFFFF",
            borderRadius: 12,
            width: "100%",
            maxWidth: 440,
            boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1)",
            overflow: "hidden",
          }}
        >
          {/* Header */}
          <div
            style={{
              backgroundColor: "#1e3a5f",
              padding: "16px 24px",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              color: "#FFFFFF",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <Eye size={24} />
              <h3 style={{ margin: 0, fontSize: 18, fontWeight: 700 }}>
                Detail Kehadiran
              </h3>
            </div>
            <button
              onClick={onClose}
              style={{
                background: "none",
                border: "none",
                cursor: "pointer",
                color: "#FFFFFF",
                display: "flex",
                alignItems: "center",
                padding: 4,
                borderRadius: 4,
                transition: "background-color 0.2s",
              }}
              onMouseEnter={(e) => e.currentTarget.style.backgroundColor = "rgba(255,255,255,0.2)"}
              onMouseLeave={(e) => e.currentTarget.style.backgroundColor = "transparent"}
            >
              <X size={24} />
            </button>
          </div>

          {/* Content */}
          <div style={{ padding: 24 }}>
            {/* Row Tanggal */}
            <div
              style={{
                display: "flex",
                marginBottom: 16,
                paddingBottom: 12,
                borderBottom: "1px solid #E5E7EB",
                alignItems: "center",
              }}
            >
              <div style={{ fontWeight: 600, color: "#374151", minWidth: 120 }}>
                Tanggal
              </div>
              <div style={{ width: "1px", height: "24px", backgroundColor: "#E5E7EB", margin: "0 16px" }}></div>
              <div style={{ fontWeight: 500, color: "#1F2937" }}>
                {data.tanggal}
              </div>
            </div>

            {/* Row Jam Pelajaran */}
            <div
              style={{
                display: "flex",
                marginBottom: 16,
                paddingBottom: 12,
                borderBottom: "1px solid #E5E7EB",
                alignItems: "center",
              }}
            >
              <div style={{ fontWeight: 600, color: "#374151", minWidth: 120 }}>
                Jam Pelajaran
              </div>
              <div style={{ width: "1px", height: "24px", backgroundColor: "#E5E7EB", margin: "0 16px" }}></div>
              <div style={{ fontWeight: 500, color: "#1F2937" }}>
                {data.jamPelajaran}
              </div>
            </div>

            {/* Row Mata Pelajaran */}
            <div
              style={{
                display: "flex",
                marginBottom: 16,
                paddingBottom: 12,
                borderBottom: "1px solid #E5E7EB",
                alignItems: "center",
              }}
            >
              <div style={{ fontWeight: 600, color: "#374151", minWidth: 120 }}>
                Mata Pelajaran
              </div>
              <div style={{ width: "1px", height: "24px", backgroundColor: "#E5E7EB", margin: "0 16px" }}></div>
              <div style={{ fontWeight: 500, color: "#1F2937" }}>
                {data.mataPelajaran}
              </div>
            </div>

            {/* Row Kelas */}
            <div
              style={{
                display: "flex",
                marginBottom: 16,
                paddingBottom: 12,
                borderBottom: "1px solid #E5E7EB",
                alignItems: "center",
              }}
            >
              <div style={{ fontWeight: 600, color: "#374151", minWidth: 120 }}>
                Kelas
              </div>
              <div style={{ width: "1px", height: "24px", backgroundColor: "#E5E7EB", margin: "0 16px" }}></div>
              <div style={{ fontWeight: 500, color: "#1F2937" }}>
                {data.kelas}
              </div>
            </div>

            {/* Row Nama Guru */}
            <div
              style={{
                display: "flex",
                marginBottom: 16,
                paddingBottom: 12,
                borderBottom: "1px solid #E5E7EB",
                alignItems: "center",
              }}
            >
              <div style={{ fontWeight: 600, color: "#374151", minWidth: 120 }}>
                Nama Guru
              </div>
              <div style={{ width: "1px", height: "24px", backgroundColor: "#E5E7EB", margin: "0 16px" }}></div>
              <div style={{ fontWeight: 500, color: "#1F2937" }}>
                {data.namaGuru}
              </div>
            </div>

            {/* Row Status */}
            <div
              style={{
                display: "flex",
                marginBottom: 24,
                paddingBottom: 12,
                borderBottom: "1px solid #E5E7EB",
                alignItems: "center",
              }}
            >
              <div style={{ fontWeight: 600, color: "#374151", minWidth: 120 }}>
                Status
              </div>
              <div style={{ width: "1px", height: "24px", backgroundColor: "#E5E7EB", margin: "0 16px" }}></div>
              <div>
                <div
                  style={{
                    backgroundColor: statusColor.bg,
                    color: statusColor.text,
                    padding: "8px 20px",
                    borderRadius: "20px",
                    fontSize: 14,
                    fontWeight: 700,
                    display: "inline-flex",
                    alignItems: "center",
                    border: `1px solid ${statusColor.border}`,
                    boxShadow: statusColor.shadow,
                    width: "fit-content",
                    letterSpacing: "0.5px",
                  }}
                >
                  {getStatusText(data.status)}
                </div>
              </div>
            </div>

            {/* Info Box */}
            <div
              style={{
                backgroundColor: "#F3F4F6",
                border: "1px solid #E5E7EB",
                borderRadius: 8,
                padding: 16,
                textAlign: "center",
              }}
            >
              <div
                style={{
                  fontSize: 14,
                  fontWeight: 600,
                  color: "#374151",
                }}
              >
                {getStatusDescription(data.status)}
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
