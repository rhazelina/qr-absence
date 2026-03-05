import SiswaLayout from "../../component/Siswa/SiswaLayout";

import JadwalImg from "../../assets/Icon/DummyJadwal.png";

type SiswaPage = "dashboard" | "jadwal-anda" | "notifikasi";

interface JadwalSiswaProps {
    user: { name: string; phone: string };
    currentPage: SiswaPage;
    onMenuClick: (page: string) => void;
    onLogout: () => void;
}

/**
 * Catatan:
 * - Pastikan jadwal berupa file: .png / .jpg / .jpeg
 * - Simpan file di /src/assets/jadwal/ (atau folder lain), lalu import seperti di atas
 */
export default function JadwalSiswa({
    user,
    currentPage,
    onMenuClick,
    onLogout,
}: JadwalSiswaProps) {
      const kelasInfo = {
        namaKelas: "XII RPL 2",
        waliKelas: "Triana Ardiane S.pd",
      };

    return (
        <SiswaLayout
            pageTitle="Jadwal Kelas"
            currentPage={currentPage}
            onMenuClick={onMenuClick}
            user={user}
            onLogout={onLogout}
        >
            <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
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
              {kelasInfo.namaKelas}

            </div>
            <div
              style={{
                color: "rgba(255, 255, 255, 0.8)",
                fontSize: "14px",
                fontWeight: 500,
              }}
            >
              {kelasInfo.waliKelas}
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
                            Jadwal Pelajaran
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
                                src={JadwalImg}
                                // alt={`Jadwal ${kelasInfo.namaKelas}`}
                                alt={`Jadwal Kelas`}
                                style={{
                                    display: "block",
                                    width: "100%",
                                    height: "auto",
                                    maxWidth: 1200, // biar tetap enak di desktop
                                    margin: "0 auto",
                                }}
                            /> 
                        </div>

                        {/* tombol opsional: buka gambar full */}
                        <div style={{ marginTop: 12, textAlign: "right" }}>
                            <a
                                href={JadwalImg}
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
        </SiswaLayout>
    );
}
