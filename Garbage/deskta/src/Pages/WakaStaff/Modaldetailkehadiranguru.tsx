// src/component/Shared/ModalDetailKehadiranGuru.tsx
import { X, Eye } from "lucide-react";

interface ModalDetailKehadiranGuruProps {
  isOpen: boolean;
  onClose: () => void;
  data: {
    tanggal: string;
    jamPelajaran: string;
    mataPelajaran: string;
    namaGuru: string;
    status: "Hadir" | "Izin" | "Sakit" | "Alfa";
  };
}

export default function ModalDetailKehadiranGuru({
  isOpen,
  onClose,
  data,
}: ModalDetailKehadiranGuruProps) {
  if (!isOpen) return null;

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Hadir":
        return "#22C55E";
      case "Izin":
        return "#3B82F6";
      case "Sakit":
        return "#FACC15";
      default:
        return "#EF4444";
    }
  };

  const getStatusText = (status: string) => {
    return status === "Alfa" ? "Tidak Hadir" : status;
  };

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
            maxWidth: 420,
            boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1)",
            overflow: "hidden",
          }}
        >
          {/* Header */}
          <div
            style={{
              backgroundColor: "#2563EB",
              padding: "16px 20px",
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
              }}
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
                justifyContent: "space-between",
                marginBottom: 16,
                paddingBottom: 12,
                borderBottom: "1px solid #E5E7EB",
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
                display: "flex",
                justifyContent: "space-between",
                marginBottom: 16,
                paddingBottom: 12,
                borderBottom: "1px solid #E5E7EB",
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
                display: "flex",
                justifyContent: "space-between",
                marginBottom: 16,
                paddingBottom: 12,
                borderBottom: "1px solid #E5E7EB",
              }}
            >
              <div style={{ fontWeight: 600, color: "#374151" }}>
                Mata pelajaran :
              </div>
              <div style={{ fontWeight: 500, color: "#1F2937" }}>
                {data.mataPelajaran}
              </div>
            </div>

            {/* Row Nama Guru */}
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                marginBottom: 16,
                paddingBottom: 12,
                borderBottom: "1px solid #E5E7EB",
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
                display: "flex",
                justifyContent: "space-between",
                marginBottom: 24,
                paddingBottom: 12,
                borderBottom: "1px solid #E5E7EB",
              }}
            >
              <div style={{ fontWeight: 600, color: "#374151" }}>Status :</div>
              <div>
                <span
                  style={{
                    backgroundColor: getStatusColor(data.status),
                    color: "#FFFFFF",
                    padding: "4px 16px",
                    borderRadius: 6,
                    fontSize: 13,
                    fontWeight: 600,
                  }}
                >
                  {getStatusText(data.status)}
                </span>
              </div>
            </div>

            {/* Info Box */}
            <div
              style={{
                backgroundColor: "#EFF6FF",
                border: "1px solid #BFDBFE",
                borderRadius: 8,
                padding: 16,
                textAlign: "center",
              }}
            >
              <div
                style={{
                  fontSize: 14,
                  fontWeight: 600,
                  color: "#1E40AF",
                }}
              >
                {data.status === "Hadir"
                  ? "Siswa hadir tepat waktu"
                  : data.status === "Izin"
                  ? "Siswa izin dengan keterangan"
                  : data.status === "Sakit"
                  ? "Siswa sakit dengan surat dokter"
                  : "Siswa tidak hadir tanpa keterangan"}
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}