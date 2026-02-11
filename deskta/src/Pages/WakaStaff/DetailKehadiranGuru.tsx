import { useState, useEffect } from "react";
import { User, ArrowLeft, Eye, X, Loader2 } from "lucide-react";
import StaffLayout from "../../component/WakaStaff/StaffLayout";


type StatusKehadiran = "Hadir" | "Izin" | "Sakit" | "Alfa" | "Tidak Hadir" | "Pulang";

type RowKehadiran = {
  no: number;
  tanggal: string;
  jam: string;
  mapel: string;
  kelas: string;
  status: StatusKehadiran;
};

interface DetailKehadiranGuruProps {
  user: { name: string; role: string };
  onLogout: () => void;
  currentPage: string;
  onMenuClick: (page: string) => void;
  onBack?: () => void;
  guruName?: string;
  teacherId?: string;
}

export default function DetailKehadiranGuru({
  user = { name: "Admin", role: "waka" },
  currentPage = "detail-kehadiran-guru",
  onMenuClick = () => { },
  onLogout = () => { },
  onBack = () => { },
  guruName = "Ewit Emiyah S.pd",
  teacherId,
}: DetailKehadiranGuruProps) {
  const [rows, setRows] = useState<RowKehadiran[]>([]);
  const [loading, setLoading] = useState(false);
  const [guruInfo, setGuruInfo] = useState({
    name: guruName,
    phone: "-",
  });

  useEffect(() => {
    const fetchData = async () => {
      if (!teacherId) return;
      setLoading(true);
      try {
        const { teacherService } = await import("../../services/teacher");

        // 1. Get Teacher Info
        const teacher = await teacherService.getTeacherById(teacherId);
        setGuruInfo({
          name: teacher.name,
          phone: teacher.phone || "-",
        });

        // 2. Get Attendance History
        const response: any = await teacherService.getTeacherAttendance(teacherId);

        const mappedRows: RowKehadiran[] = response.map((item: any, index: number) => {
          const status = item.status === 'present' ? 'Hadir' :
            item.status === 'late' ? 'Hadir' : // Map late to Hadir label but maybe show detail
              item.status === 'excused' ? 'Izin' :
                item.status === 'sick' ? 'Sakit' :
                  item.status === 'absent' ? 'Alfa' :
                    item.status === 'alpha' ? 'Alfa' :
                      item.status === 'dinas' ? 'Izin' :
                        item.status === 'pulang' ? 'Pulang' : 'Alfa';

          return {
            no: index + 1,
            tanggal: item.date,
            jam: item.schedule?.start_time ? `${item.schedule.start_time.slice(0, 5)} - ${item.schedule.end_time.slice(0, 5)}` : "-",
            mapel: item.schedule?.subject?.name || item.schedule?.subject_name || "-",
            kelas: item.schedule?.class?.name || "-",
            status: status as StatusKehadiran,
          };
        });

        setRows(mappedRows);
      } catch (error) {
        console.error("Failed to fetch teacher details:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [teacherId]);

  // State untuk modal detail
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [selectedDetail, setSelectedDetail] = useState<RowKehadiran | null>(null);

  const handleOpenDetail = (row: RowKehadiran) => {
    setSelectedDetail(row);
    setIsDetailOpen(true);
  };

  // Fungsi untuk mendapatkan warna status sesuai format yang diberikan
  const getStatusColor = (status: StatusKehadiran) => {
    switch (status) {
      case "Hadir":
        return { bg: "#1FA83D", text: "#FFFFFF", border: "#1FA83D", shadow: "0 1px 3px rgba(31, 168, 61, 0.3)" };
      case "Izin":
        return { bg: "#ACA40D", text: "#FFFFFF", border: "#ACA40D", shadow: "0 1px 3px rgba(172, 164, 13, 0.3)" };
      case "Sakit":
        return { bg: "#520C8F", text: "#FFFFFF", border: "#520C8F", shadow: "0 1px 3px rgba(82, 12, 143, 0.3)" };
      case "Tidak Hadir":
      case "Alfa":
        return { bg: "#D90000", text: "#FFFFFF", border: "#D90000", shadow: "0 1px 3px rgba(217, 0, 0, 0.3)" };
      case "Pulang":
        return { bg: "#2F85EB", text: "#FFFFFF", border: "#2F85EB", shadow: "0 1px 3px rgba(47, 133, 235, 0.3)" };
      default:
        return { bg: "#6B7280", text: "#FFFFFF", border: "#6B7280", shadow: "0 1px 3px rgba(107, 114, 128, 0.3)" };
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
            {guruInfo.name}
          </div>
          <div style={{ fontSize: 15, opacity: 0.9 }}>
            {guruInfo.phone}
          </div>
        </div>
      </div>

      {/* BUTTON KEMBALI */}
      <div
        style={{
          display: "flex",
          justifyContent: "flex-end",
          marginBottom: 20,
        }}
      >
        <button
          onClick={onBack}
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

      {/* TABLE CONTAINER - LEBIH RAPAT TANPA SPACE KOSONG */}
      <div
        style={{
          border: "1px solid #E5E7EB",
          borderRadius: 10,
          overflow: "hidden",
          backgroundColor: "#fff",
          boxShadow: "0 1px 3px rgba(0, 0, 0, 0.05)",
          position: "relative",
          minHeight: "200px"
        }}
      >
        {/* Loading Overlay */}
        {loading && (
          <div style={{
            position: "absolute",
            top: 0, left: 0, right: 0, bottom: 0,
            backgroundColor: "rgba(255,255,255,0.7)",
            zIndex: 10,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 12,
            fontWeight: 600,
            color: "#062A4A"
          }}>
            <Loader2 className="animate-spin" size={24} />
            Memuat data...
          </div>
        )}

        {/* HEADER - TANPA SPACE KOSONG DI TENGAH */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "50px 100px 120px minmax(160px, 1fr) 180px 130px",
            backgroundColor: "#F9FAFB",
            padding: "14px 8px",
            fontWeight: 700,
            fontSize: 13,
            color: "#374151",
            borderBottom: "2px solid #E5E7EB",
            alignItems: "center",
            gap: "4px",
            letterSpacing: "0.2px",
          }}
        >
          <div style={{ textAlign: "center" }}>No</div>
          <div style={{ textAlign: "left", paddingLeft: "2px" }}>Tanggal</div>
          <div style={{ textAlign: "center" }}>Jadwal Ke</div>
          <div style={{ textAlign: "left", paddingLeft: "2px" }}>Mapel</div>
          <div style={{ textAlign: "left", paddingLeft: "2px" }}>Kelas</div>
          <div style={{ textAlign: "center" }}>Status</div>
        </div>

        {/* ROWS - TANPA SPACE KOSONG DI TENGAH */}
        {rows.map((r, i) => {
          const statusColor = getStatusColor(r.status);
          return (
            <div
              key={i}
              style={{
                display: "grid",
                gridTemplateColumns: "50px 100px 120px minmax(160px, 1fr) 180px 130px",
                padding: "12px 8px",
                fontSize: 13,
                alignItems: "center",
                borderBottom: i === rows.length - 1 ? "none" : "1px solid #F3F4F6",
                backgroundColor: i % 2 === 0 ? "#FFFFFF" : "#F9FAFB",
                transition: "background-color 0.2s",
                gap: "4px",
                minHeight: "48px",
              }}
              onMouseEnter={(e) => e.currentTarget.style.backgroundColor = "#F3F4F6"}
              onMouseLeave={(e) => e.currentTarget.style.backgroundColor = i % 2 === 0 ? "#FFFFFF" : "#F9FAFB"}
            >
              {/* NO */}
              <div style={{
                textAlign: "center",
                fontWeight: 600,
                color: "#374151",
              }}>
                {r.no}
              </div>

              {/* TANGGAL - DIKANANKAN */}
              <div style={{
                fontWeight: 500,
                color: "#1F2937",
                textAlign: "left",
                paddingLeft: "4px",
                whiteSpace: "nowrap",
              }}>
                {r.tanggal}
              </div>

              {/* JAM - DIKANANKAN */}
              <div style={{
                textAlign: "center",
                fontWeight: 500,
                color: "#1F2937",
                paddingLeft: "2px",
              }}>
                {r.jam}
              </div>

              {/* MAPEL - DIKANANKAN */}
              <div style={{
                fontWeight: 500,
                color: "#1F2937",
                textAlign: "left",
                paddingLeft: "4px",
                whiteSpace: "nowrap",
                overflow: "hidden",
                textOverflow: "ellipsis",
              }}>
                {r.mapel}
              </div>

              {/* KELAS */}
              <div style={{
                fontWeight: 500,
                color: "#1F2937",
                textAlign: "left",
                paddingLeft: "4px",
                whiteSpace: "nowrap",
                overflow: "hidden",
                textOverflow: "ellipsis",
              }}>
                {r.kelas}
              </div>

              {/* STATUS DENGAN TOMBOL EYE */}
              <div>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "center",
                  }}
                >
                  <div
                    style={{
                      backgroundColor: statusColor.bg,
                      color: statusColor.text,
                      padding: "5px 12px",
                      borderRadius: "20px", // OVAL
                      fontSize: 12,
                      fontWeight: 700,
                      display: "inline-flex",
                      alignItems: "center",
                      gap: 5,
                      border: `1px solid ${statusColor.border}`,
                      boxShadow: statusColor.shadow,
                      minWidth: 90,
                      maxWidth: 100,
                      justifyContent: "center",
                      cursor: "pointer",
                      transition: "all 0.2s",
                      letterSpacing: "0.2px",
                    }}
                    onClick={() => handleOpenDetail(r)}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.transform = "translateY(-1px)";
                      e.currentTarget.style.boxShadow = "0 3px 6px rgba(0, 0, 0, 0.15)";
                      e.currentTarget.style.filter = "brightness(1.1)";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.transform = "translateY(0)";
                      e.currentTarget.style.boxShadow = statusColor.shadow;
                      e.currentTarget.style.filter = "brightness(1)";
                    }}
                  >
                    <Eye size={12} color="#FFFFFF" />
                    <span>{r.status}</span>
                  </div>
                </div>
              </div>


            </div>
          );
        })}
      </div>



      {/* MODAL DETAIL */}
      {selectedDetail && (
        <ModalDetailKehadiranGuru
          isOpen={isDetailOpen}
          onClose={() => setIsDetailOpen(false)}
          data={{
            tanggal: selectedDetail.tanggal,
            jamPelajaran: selectedDetail.jam,
            mataPelajaran: selectedDetail.mapel,
            namaGuru: guruInfo.name,
            kelas: selectedDetail.kelas,
            status: selectedDetail.status,
          }}
        />
      )}
    </StaffLayout>
  );
}

// Komponen Modal Detail Kehadiran Guru
interface ModalDetailKehadiranGuruProps {
  isOpen: boolean;
  onClose: () => void;
  data: {
    tanggal: string;
    jamPelajaran: string;
    mataPelajaran: string;
    namaGuru: string;
    kelas: string;
    status: "Hadir" | "Izin" | "Sakit" | "Alfa" | "Tidak Hadir" | "Pulang";
  };
}

function ModalDetailKehadiranGuru({
  isOpen,
  onClose,
  data,
}: ModalDetailKehadiranGuruProps) {
  if (!isOpen) return null;

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Hadir":
        return { bg: "#1FA83D", text: "#FFFFFF", border: "#1FA83D", shadow: "0 1px 3px rgba(31, 168, 61, 0.3)" };
      case "Izin":
        return { bg: "#ACA40D", text: "#FFFFFF", border: "#ACA40D", shadow: "0 1px 3px rgba(172, 164, 13, 0.3)" };
      case "Sakit":
        return { bg: "#520C8F", text: "#FFFFFF", border: "#520C8F", shadow: "0 1px 3px rgba(82, 12, 143, 0.3)" };
      case "Tidak Hadir":
      case "Alfa":
        return { bg: "#D90000", text: "#FFFFFF", border: "#D90000", shadow: "0 1px 3px rgba(217, 0, 0, 0.3)" };
      case "Pulang":
        return { bg: "#2F85EB", text: "#FFFFFF", border: "#2F85EB", shadow: "0 1px 3px rgba(47, 133, 235, 0.3)" };
      default:
        return { bg: "#6B7280", text: "#FFFFFF", border: "#6B7280", shadow: "0 1px 3px rgba(107, 114, 128, 0.3)" };
    }
  };

  const getStatusText = (status: string) => {
    return status === "Alfa" ? "Tidak Hadir" : status;
  };

  const getStatusDescription = (status: string) => {
    switch (status) {
      case "Hadir":
        return "Guru hadir tepat waktu";
      case "Izin":
        return "Guru izin dengan keterangan";
      case "Sakit":
        return "Guru sakit dengan surat dokter";
      case "Tidak Hadir":
      case "Alfa":
        return "Guru tidak hadir tanpa keterangan";
      case "Pulang":
        return "Guru sudah pulang dari sekolah";
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
              backgroundColor: "#2563EB",
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
                display: "grid",
                gridTemplateColumns: "140px 1fr",
                marginBottom: 16,
                paddingBottom: 12,
                borderBottom: "1px solid #E5E7EB",
                alignItems: "center",
              }}
            >
              <div style={{ fontWeight: 600, color: "#374151" }}>Tanggal :</div>
              <div style={{ fontWeight: 500, color: "#1F2937" }}>
                {data.tanggal}
              </div>
            </div>

            {/* Row Jam Pelajaran */}
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "140px 1fr",
                marginBottom: 16,
                paddingBottom: 12,
                borderBottom: "1px solid #E5E7EB",
                alignItems: "center",
              }}
            >
              <div style={{ fontWeight: 600, color: "#374151" }}>
                Jam Pelajaran :
              </div>
              <div style={{ fontWeight: 500, color: "#1F2937" }}>
                {data.jamPelajaran}
              </div>
            </div>

            {/* Row Mata Pelajaran */}
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "140px 1fr",
                marginBottom: 16,
                paddingBottom: 12,
                borderBottom: "1px solid #E5E7EB",
                alignItems: "center",
              }}
            >
              <div style={{ fontWeight: 600, color: "#374151" }}>
                Mata pelajaran :
              </div>
              <div style={{ fontWeight: 500, color: "#1F2937" }}>
                {data.mataPelajaran}
              </div>
            </div>

            {/* Row Kelas */}
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "140px 1fr",
                marginBottom: 16,
                paddingBottom: 12,
                borderBottom: "1px solid #E5E7EB",
                alignItems: "center",
              }}
            >
              <div style={{ fontWeight: 600, color: "#374151" }}>
                Kelas :
              </div>
              <div style={{ fontWeight: 500, color: "#1F2937" }}>
                {data.kelas}
              </div>
            </div>

            {/* Row Nama Guru */}
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "140px 1fr",
                marginBottom: 16,
                paddingBottom: 12,
                borderBottom: "1px solid #E5E7EB",
                alignItems: "center",
              }}
            >
              <div style={{ fontWeight: 600, color: "#374151" }}>
                Nama guru :
              </div>
              <div style={{ fontWeight: 500, color: "#1F2937" }}>
                {data.namaGuru}
              </div>
            </div>

            {/* Row Status */}
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "140px 1fr",
                marginBottom: 24,
                paddingBottom: 12,
                borderBottom: "1px solid #E5E7EB",
                alignItems: "center",
              }}
            >
              <div style={{ fontWeight: 600, color: "#374151" }}>Status :</div>
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
                    gap: 8,
                    border: `1px solid ${statusColor.border}`,
                    boxShadow: statusColor.shadow,
                    width: "fit-content",
                    letterSpacing: "0.5px",
                  }}
                >
                  <Eye size={16} color="#FFFFFF" />
                  <span>{getStatusText(data.status)}</span>
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