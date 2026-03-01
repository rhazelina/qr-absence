// src/Pages/WakaStaff/LihatKelas.tsx
import { useState } from "react";
import StaffLayout from "../../component/WakaStaff/StaffLayout";
import { ArrowLeft } from "lucide-react";
import DummyJadwal from "../../assets/Icon/DummyJadwal.png";

interface Props {
  user: { name: string; role: string };
  onLogout: () => void;
  currentPage: string;
  onMenuClick: (page: string) => void;
  kelas?: string;
  jadwalImage?: string;
  onBack?: () => void;
}

export default function LihatKelas({
  user,
  onLogout,
  currentPage,
  onMenuClick,
  kelas = "X Mekatronika 1",
  jadwalImage,
  onBack,
}: Props) {
  const [imageError, setImageError] = useState(false);

  const handleImageError = () => {
    setImageError(true);
  };

  return (
    <StaffLayout
      pageTitle="Jadwal Kelas"
      currentPage={currentPage}
      onMenuClick={onMenuClick}
      user={user}
      onLogout={onLogout}
    >
      <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
        {onBack && (
          <div style={{ display: "flex", justifyContent: "flex-end" }}>
            <button
              onClick={onBack}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 8,
                padding: "10px 16px",
                borderRadius: 8,
                border: "2px solid #0B2948",
                background: "#FFFFFF",
                fontWeight: 600,
                fontSize: 14,
                color: "#0B2948",
                cursor: "pointer",
                transition: "all 0.2s",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = "#0B2948";
                e.currentTarget.style.color = "#FFFFFF";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = "#FFFFFF";
                e.currentTarget.style.color = "#0B2948";
              }}
            >
              <ArrowLeft size={18} />
              <span>Kembali</span>
            </button>
          </div>
        )}

        <div
          style={{
            background: "#0B2948",
            borderRadius: 20,
            padding: "22px 28px",
            color: "#FFFFFF",
            fontWeight: 700,
            fontSize: 18,
          }}
        >
          {kelas}
        </div>

        <div style={{ fontSize: 13, color: "#64748B" }}>
          Jadwal ditampilkan sebagai gambar (PNG / JPG / JPEG).
        </div>

        <div style={{ background: "#FFFFFF", borderRadius: 14, padding: 16 }}>
          {imageError || !jadwalImage ? (
            <div
              style={{
                width: "100%",
                maxWidth: 1200,
                margin: "0 auto",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                minHeight: 400,
                backgroundColor: "#F3F4F6",
                borderRadius: 8,
                border: "2px dashed #D1D5DB",
              }}
            >
              <img
                src={DummyJadwal}
                alt="Jadwal Kelas"
                style={{ width: "100%", maxWidth: 1200, display: "block" }}
                onError={handleImageError}
              />
            </div>
          ) : (
            <img
              src={jadwalImage}
              alt="Jadwal Kelas"
              style={{
                width: "100%",
                maxWidth: 1200,
                margin: "0 auto",
                display: "block",
                borderRadius: 8,
              }}
              onError={handleImageError}
            />
          )}
        </div>
      </div>
    </StaffLayout>
  );
}