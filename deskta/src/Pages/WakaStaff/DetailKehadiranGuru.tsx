import { useMemo, useState } from "react";
import { User, SquarePen, ArrowLeft, Eye, X } from "lucide-react";
import StaffLayout from "../../component/WakaStaff/StaffLayout";
import { FormModal } from "../../component/Shared/FormModal";
import { Select } from "../../component/Shared/Select";

type StatusKehadiran = "Hadir" | "Izin" | "Sakit" | "Alfa" | "Pulang" | "Tidak Ada Jadwal";

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
}

export default function DetailKehadiranGuru({
  user = { name: "Admin", role: "waka" },
  currentPage = "detail-kehadiran-guru",
  onMenuClick = () => {},
  onLogout = () => {},
  onBack = () => {},
  guruName = "Ewit Emiyah S.pd",
}: DetailKehadiranGuruProps) {
  const [rows, setRows] = useState<RowKehadiran[]>([
    {
      no: 1,
      tanggal: "25-05-2025",
      jam: "1-4",
      mapel: "Matematika",
      kelas: "12 Mekatronika 2",
      status: "Hadir",
    },
    {
      no: 2,
      tanggal: "24-05-2025",
      jam: "5-8",
      mapel: "Matematika",
      kelas: "12 Mekatronika 2",
      status: "Hadir",
    },
    {
      no: 3,
      tanggal: "25-05-2025",
      jam: "9-10",
      mapel: "Matematika",
      kelas: "12 Mekatronika 2",
      status: "Izin",
    },
    {
      no: 4,
      tanggal: "25-05-2025",
      jam: "1-2",
      mapel: "Matematika",
      kelas: "12 Mekatronika 2",
      status: "Pulang",
    },
    {
      no: 5,
      tanggal: "24-05-2025",
      jam: "3-4",
      mapel: "Matematika",
      kelas: "XII Mekatronika 2",
      status: "Sakit",
    },
    {
      no: 6,
      tanggal: "25-05-2025",
      jam: "5-6",
      mapel: "Matematika",
      kelas: "XII Mekatronika 2",
      status: "Alfa",
    },
    {
      no: 7,
      tanggal: "25-05-2025",
      jam: "7-10",
      mapel: "-",
      kelas: "-",
      status: "Tidak Ada Jadwal",
    },
  ]);

  const guruInfo = {
    name: guruName,
    phone: "0918415784",
  };

  const statusOptions = useMemo(
    () => [
      { label: "Hadir", value: "Hadir" },
      { label: "Izin", value: "Izin" },
      { label: "Sakit", value: "Sakit" },
      { label: "Alfa", value: "Alfa" },
      { label: "Pulang", value: "Pulang" },
      { label: "Tidak Ada Jadwal", value: "Tidak Ada Jadwal" },
    ],
    []
  );

  const [editingRow, setEditingRow] = useState<RowKehadiran | null>(null);
  const [editStatus, setEditStatus] = useState<StatusKehadiran>("Hadir");
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // State untuk modal detail
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [selectedDetail, setSelectedDetail] = useState<RowKehadiran | null>(null);

  const handleOpenEdit = (row: RowKehadiran) => {
    setEditingRow(row);
    setEditStatus(row.status);
    setIsEditOpen(true);
  };

  const handleOpenDetail = (row: RowKehadiran) => {
    setSelectedDetail(row);
    setIsDetailOpen(true);
  };

  const handleSubmitEdit = () => {
    if (!editingRow) return;
    setIsSubmitting(true);
    setTimeout(() => {
      setRows((prev) =>
        prev.map((r) =>
          r === editingRow ? { ...r, status: editStatus } : r
        )
      );
      setIsSubmitting(false);
      setIsEditOpen(false);
      setEditingRow(null);
    }, 300);
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
      case "Alfa":
        return { bg: "#D90000", text: "#FFFFFF", border: "#D90000", shadow: "0 1px 3px rgba(217, 0, 0, 0.3)" };
      case "Pulang":
        return { bg: "#2F85EB", text: "#FFFFFF", border: "#2F85EB", shadow: "0 1px 3px rgba(47, 133, 235, 0.3)" };
      case "Tidak Ada Jadwal":
        return { bg: "#9CA3AF", text: "#FFFFFF", border: "#9CA3AF", shadow: "0 1px 3px rgba(156, 163, 175, 0.3)" };
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
            gridTemplateColumns: "80px 140px 100px 160px 250px 180px 100px",
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
          <div style={{ textAlign: "center" }}>Aksi</div>
        </div>

        {/* BODY ROWS - KOLOM LEBIH LEBAR */}
        {rows.map((row) => {
          const statusColor = getStatusColor(row.status);

          return (
            <div
              key={row.no}
              style={{
                display: "grid",
                gridTemplateColumns: "80px 140px 100px 160px 250px 180px 100px",
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

              {/* Status - IKON MATA DI DALAM BUTTON */}
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

              {/* Aksi - HANYA TOMBOL EDIT */}
              <div
                style={{
                  display: "flex",
                  gap: 10,
                  justifyContent: "center",
                  alignItems: "center",
                }}
              >
                <button
                  onClick={() => handleOpenEdit(row)}
                  style={{
                    background: "none",
                    border: "none",
                    cursor: "pointer",
                    padding: 4,
                    borderRadius: 4,
                    display: "flex",
                    alignItems: "center",
                    transition: "background-color 0.2s",
                  }}
                  onMouseEnter={(e) =>
                    (e.currentTarget.style.backgroundColor = "#E5E7EB")
                  }
                  onMouseLeave={(e) =>
                    (e.currentTarget.style.backgroundColor = "transparent")
                  }
                  title="Edit Status"
                >
                  <SquarePen size={18} color="#10B981" />
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* EDIT MODAL */}
      <FormModal
        isOpen={isEditOpen}
        onClose={() => setIsEditOpen(false)}
        title="Edit Status Kehadiran"
        onSubmit={handleSubmitEdit}
        submitLabel="Simpan"
        isSubmitting={isSubmitting}
      >
        <div style={{ marginBottom: 20 }}>
          <label
            style={{
              display: "block",
              fontWeight: 600,
              marginBottom: 8,
              fontSize: 14,
              color: "#374151",
            }}
          >
            Status Kehadiran
          </label>
          <Select
            options={statusOptions}
            value={editStatus}
            onChange={(val) => setEditStatus(val as StatusKehadiran)}
            placeholder="Pilih Status"
          />
        </div>
      </FormModal>

      {/* DETAIL MODAL */}
      {isDetailOpen && selectedDetail && (
        <DetailModal
          data={{
            tanggal: selectedDetail.tanggal,
            jamPelajaran: selectedDetail.jam,
            mataPelajaran: selectedDetail.mapel,
            kelas: selectedDetail.kelas,
            namaGuru: guruInfo.name,
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