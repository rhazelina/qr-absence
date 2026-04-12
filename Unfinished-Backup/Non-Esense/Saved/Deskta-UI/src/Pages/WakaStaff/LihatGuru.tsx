// src/Pages/WakaStaff/LihatGuru.tsx
import StaffLayout from "../../component/WakaStaff/StaffLayout";
import DummyJadwal from "../../assets/Icon/DummyJadwal.png";
import { User } from "lucide-react";

interface Props {
  user: { name: string; role: string };
  onLogout: () => void;
  currentPage: string;
  onMenuClick: (page: string) => void;
  namaGuru?: string;
  noIdentitas?: string;
  jadwalImage?: string;
  onBack?: () => void;
}

export default function LihatGuru({
  user,
  onLogout,
  currentPage,
  onMenuClick,
  namaGuru,
  noIdentitas,
  jadwalImage,
  onBack,
}: Props) {
  return (
    <StaffLayout
      pageTitle="Jadwal Guru"
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
                padding: "6px 12px",
                borderRadius: 999,
                border: "1px solid #E2E8F0",
                background: "#FFFFFF",
                fontWeight: 600,
                cursor: "pointer",
              }}
            >
              ← Kembali
            </button>
          </div>
        )}

        <div
          style={{
            background: "#0B2948",
            borderRadius: 20,
            padding: "22px 28px",
            color: "#FFFFFF",
            display: "flex",
            alignItems: "center",
            gap: 16,
            fontWeight: 700,
            fontSize: 18,
          }}
        >
          <User size={22} />
          <div>
            <div>{namaGuru}</div>
            <div style={{ fontSize: 13, opacity: 0.85 }}>{noIdentitas}</div>
          </div>
        </div>

        <div style={{ fontSize: 13, color: "#64748B" }}>
          Jadwal ditampilkan sebagai gambar (PNG / JPG / JPEG).
        </div>

        <div style={{ background: "#FFFFFF", borderRadius: 14, padding: 16 }}>
          <img
            src={jadwalImage || DummyJadwal}
            alt="Jadwal Guru"
            style={{
              width: "100%",
              maxWidth: 1200,
              margin: "0 auto",
              display: "block",
            }}
          />
        </div>
      </div>
    </StaffLayout>
  );
}
