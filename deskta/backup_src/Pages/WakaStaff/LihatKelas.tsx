import StaffLayout from "../../component/WakaStaff/StaffLayout";
import DummyJadwal from "../../assets/Icon/DummyJadwal.png";

interface Props {
  user: { name: string; role: string };
  onLogout: () => void;
  currentPage: string;
  onMenuClick: (page: string) => void;
  kelas?: string;
  jurusan?: string;
  onBack?: () => void;
}

export default function LihatKelas({
  user,
  onLogout,
  currentPage,
  onMenuClick,
  kelas = "X Mekatronika 1",
  onBack,
}: Props) {
  return (
    <StaffLayout
      pageTitle="Jadwal Kelas"
      currentPage={currentPage}
      onMenuClick={onMenuClick}
      user={user}
      onLogout={onLogout}
    >
      <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
        {onBack && (
          <button
            type="button"
            onClick={onBack}
            style={{
              alignSelf: "flex-start",
              padding: "10px 16px",
              borderRadius: 8,
              border: "1px solid #E2E8F0",
              backgroundColor: "#FFFFFF",
              color: "#0F172A",
              fontWeight: 600,
              cursor: "pointer",
            }}
          >
            {"\u2190"} Kembali
          </button>
        )}
        {/* Box Informasi Kelas */}
        <div
          style={{
            background: "#0B2948",
            borderRadius: 12,
            padding: "20px 24px",
            display: "flex",
            alignItems: "center",
            gap: 16,
            boxShadow: "0 4px 12px rgba(0, 0, 0, 0.1)",
          }}
        >
          <div
            style={{
              width: 40,
              height: 40,
              borderRadius: 8,
              background: "rgba(255, 255, 255, 0.1)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0,
            }}
          >
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M3 21H21M5 21V7L13 2L21 7V21M5 21H9M21 21H17M9 21V13H15V21M9 21H15"
                stroke="white"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>

          <div style={{ flex: 1 }}>
            <div
              style={{
                color: "#FFFFFF",
                fontSize: "18px",
                fontWeight: 700,
                marginBottom: 4,
              }}
            >
              {kelas}
            </div>
            <div
              style={{
                color: "rgba(255, 255, 255, 0.8)",
                fontSize: "14px",
                fontWeight: 500,
              }}
            >
              Jadwal kelas
            </div>
          </div>
        </div>

        {/* Jadwal sebagai Gambar */}
        <div
          style={{
            background: "#FFFFFF",
            borderRadius: 12,
            boxShadow: "0 4px 12px rgba(0, 0, 0, 0.08)",
            overflow: "hidden",
          }}
        >
          <div style={{ padding: 16, borderBottom: "1px solid #E2E8F0" }}>
            <div style={{ fontWeight: 800, fontSize: 16, color: "#0F172A" }}>
              Jadwal Kelas
            </div>
            <div style={{ marginTop: 6, fontSize: 13, color: "#64748B" }}>
              Jadwal ditampilkan sebagai gambar (PNG/JPG/JPEG).
            </div>
          </div>

          <div style={{ padding: 16 }}>
            <div
              style={{
                width: "100%",
                overflowX: "auto",
                borderRadius: 10,
                border: "1px solid #E2E8F0",
                background: "#F8FAFC",
              }}
            >
              <img
                src={DummyJadwal}
                alt="Jadwal Kelas"
                style={{
                  display: "block",
                  width: "100%",
                  height: "auto",
                  maxWidth: 1200,
                  margin: "0 auto",
                }}
              />
            </div>

            <div style={{ marginTop: 12, textAlign: "right" }}>
              <a
                href={DummyJadwal}
                target="_blank"
                rel="noreferrer"
                style={{
                  display: "inline-block",
                  padding: "10px 12px",
                  borderRadius: 10,
                  border: "1px solid #E2E8F0",
                  background: "#FFFFFF",
                  color: "#0F172A",
                  fontWeight: 700,
                  fontSize: 13,
                  textDecoration: "none",
                }}
              >
                Buka jadwal (tab baru)
              </a>
            </div>
          </div>
        </div>
      </div>
    </StaffLayout>
  );
}
