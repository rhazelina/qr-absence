import { useState } from "react";
import StaffLayout from "../../component/WakaStaff/StaffLayout";
import { User, ArrowLeft, Eye, X } from "lucide-react";
import { Modal } from "../../component/Shared/Modal";

type StatusKehadiran = "Hadir" | "Izin" | "Sakit" | "Alfa" | "Pulang";

type RowKehadiran = {
  no: number;
  tanggal: string;
  jam: string;
  mapel: string;
  guru: string;
  status: StatusKehadiran;
  keterangan?: string;
  buktiFoto?: string;
  waktuMasuk?: string; // Untuk status Hadir
  waktuKeluar?: string; // Untuk status Pulang
};

interface DaftarKetidakhadiranProps {
  user?: { name: string; role: string };
  currentPage?: string;
  onMenuClick?: (page: string) => void;
  onLogout?: () => void;
  onBack?: () => void;
  siswaName?: string;
  siswaIdentitas?: string;
}

export default function DaftarKetidakhadiran({
  user = { name: "Admin", role: "waka" },
  currentPage = "daftar-ketidakhadiran",
  onMenuClick = () => { },
  onLogout = () => { },
  onBack = () => { },
  siswaName = "Muhammad Wito S.",
  siswaIdentitas = "0918415784",
}: DaftarKetidakhadiranProps) {
  // Warna sesuai revisi untuk semua 5 status
  const COLORS = {
    HADIR: "#1FA83D",
    IZIN: "#ACA40D",
    PULANG: "#2F85EB",
    TIDAK_HADIR: "#D90000",
    SAKIT: "#520C8F"
  };

  // State untuk modal detail
  const [selectedRecord, setSelectedRecord] = useState<RowKehadiran | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Data kosong (menunggu integrasi backend)
  const [rows] = useState<RowKehadiran[]>([]);

  // Hitung statistik dengan semua 5 status
  const stats = {
    hadir: rows.filter((r) => r.status === "Hadir").length,
    izin: rows.filter((r) => r.status === "Izin").length,
    sakit: rows.filter((r) => r.status === "Sakit").length,
    alfa: rows.filter((r) => r.status === "Alfa").length,
    pulang: rows.filter((r) => r.status === "Pulang").length,
  };

  // Fungsi untuk mendapatkan warna berdasarkan status
  const getStatusColor = (status: StatusKehadiran) => {
    switch (status) {
      case "Hadir":
        return COLORS.HADIR;
      case "Izin":
        return COLORS.IZIN;
      case "Sakit":
        return COLORS.SAKIT;
      case "Alfa":
        return COLORS.TIDAK_HADIR;
      case "Pulang":
        return COLORS.PULANG;
      default:
        return "#6B7280";
    }
  };

  // Fungsi untuk mendapatkan teks keterangan berdasarkan status
  const getStatusText = (status: StatusKehadiran) => {
    switch (status) {
      case "Hadir":
        return "Siswa hadir dengan tepat waktu sesuai jadwal";
      case "Izin":
        return "Siswa izin dengan memberikan keterangan yang jelas";
      case "Sakit":
        return "Siswa sakit dengan memberikan surat keterangan";
      case "Alfa":
        return "Siswa tidak hadir tanpa keterangan yang jelas";
      case "Pulang":
        return "Siswa pulang lebih awal dengan izin dan keterangan";
      default:
        return "";
    }
  };

  // Handler untuk klik status (popup detail) - SEMUA status bisa diklik
  const handleStatusClick = (record: RowKehadiran, e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    setSelectedRecord(record);
    setIsModalOpen(true);
  };

  // Komponen Status Button seperti di AbsensiSiswa.tsx
  const StatusButton = ({ status, row }: { status: StatusKehadiran; row: RowKehadiran }) => {
    const bgColor = getStatusColor(status);
    const textColor = "#FFFFFF";

    // SEMUA status bisa diklik untuk melihat detail
    const isClickable = true;

    return (
      <div
        onClick={(e) => isClickable && handleStatusClick(row, e)}
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
          color: textColor,
          backgroundColor: bgColor,
          cursor: "pointer",
          transition: "all 0.2s ease",
          border: "none",
          boxShadow: "0 2px 4px rgba(0, 0, 0, 0.1)",
          minHeight: "36px",
        }}
        onMouseEnter={(e) => {
          if (isClickable) {
            e.currentTarget.style.opacity = "0.9";
            e.currentTarget.style.transform = "translateY(-1px)";
            e.currentTarget.style.boxShadow = "0 4px 8px rgba(0, 0, 0, 0.15)";
          }
        }}
        onMouseLeave={(e) => {
          if (isClickable) {
            e.currentTarget.style.opacity = "1";
            e.currentTarget.style.transform = "translateY(0)";
            e.currentTarget.style.boxShadow = "0 2px 4px rgba(0, 0, 0, 0.1)";
          }
        }}
      >
        <Eye size={14} /> {/* SEMUA status ada ikon mata */}
        <span>{status}</span>
      </div>
    );
  };

  // Komponen untuk row detail dalam modal
  const DetailRow = ({ label, value }: { label: string; value: string }) => {
    return (
      <div style={{
        display: "flex",
        justifyContent: "space-between",
        marginBottom: 16,
        paddingBottom: 12,
        borderBottom: "1px solid #E5E7EB",
      }}>
        <div style={{ fontWeight: 600, color: "#374151" }}>{label} :</div>
        <div style={{ fontWeight: 500, color: "#1F2937" }}>
          {value}
        </div>
      </div>
    );
  };

  return (
    <>
      <StaffLayout
        pageTitle="Daftar Ketidakhadiran"
        currentPage={currentPage}
        onMenuClick={onMenuClick}
        user={user}
        onLogout={onLogout}
      >
        {/* CARD SISWA */}
        <div
          style={{
            width: 420,
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
          <div>
            <div style={{ fontSize: 20, fontWeight: 800 }}>{siswaName}</div>
            <div style={{ fontSize: 15, opacity: 0.9 }}>{siswaIdentitas}</div>
          </div>
        </div>

        {/* STATISTIK KEHADIRAN dengan semua 5 status dan warna revisi */}
        <div
          style={{
            display: "flex",
            gap: 12,
            marginBottom: 24,
            flexWrap: "wrap",
          }}
        >
          <div
            style={{
              backgroundColor: "#FFFFFF",
              border: `2px solid ${COLORS.HADIR}`,
              borderRadius: 10,
              padding: "12px 24px",
              textAlign: "center",
              minWidth: 100,
            }}
          >
            <div style={{ fontSize: 14, fontWeight: 600, color: "#6B7280" }}>
              Hadir
            </div>
            <div
              style={{
                fontSize: 28,
                fontWeight: 800,
                color: COLORS.HADIR,
                marginTop: 4,
              }}
            >
              {stats.hadir}
            </div>
          </div>

          <div
            style={{
              backgroundColor: "#FFFFFF",
              border: `2px solid ${COLORS.IZIN}`,
              borderRadius: 10,
              padding: "12px 24px",
              textAlign: "center",
              minWidth: 100,
            }}
          >
            <div style={{ fontSize: 14, fontWeight: 600, color: "#6B7280" }}>
              Izin
            </div>
            <div
              style={{
                fontSize: 28,
                fontWeight: 800,
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
            }}
          >
            <div style={{ fontSize: 14, fontWeight: 600, color: "#6B7280" }}>
              Sakit
            </div>
            <div
              style={{
                fontSize: 28,
                fontWeight: 800,
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
              border: `2px solid ${COLORS.TIDAK_HADIR}`,
              borderRadius: 10,
              padding: "12px 24px",
              textAlign: "center",
              minWidth: 100,
            }}
          >
            <div style={{ fontSize: 14, fontWeight: 600, color: "#6B7280" }}>
              Tidak Hadir
            </div>
            <div
              style={{
                fontSize: 28,
                fontWeight: 800,
                color: COLORS.TIDAK_HADIR,
                marginTop: 4,
              }}
            >
              {stats.alfa}
            </div>
          </div>

          <div
            style={{
              backgroundColor: "#FFFFFF",
              border: `2px solid ${COLORS.PULANG}`,
              borderRadius: 10,
              padding: "12px 24px",
              textAlign: "center",
              minWidth: 100,
            }}
          >
            <div style={{ fontSize: 14, fontWeight: 600, color: "#6B7280" }}>
              Pulang
            </div>
            <div
              style={{
                fontSize: 28,
                fontWeight: 800,
                color: COLORS.PULANG,
                marginTop: 4,
              }}
            >
              {stats.pulang}
            </div>
          </div>
        </div>

        {/* BUTTON KEMBALI */}
        <div
          style={{
            display: "flex",
            justifyContent: "flex-end",
            marginBottom: 10,
          }}
        >
          <button
            onClick={onBack}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 6,
              padding: "8px 14px",
              borderRadius: 8,
              backgroundColor: "#494a4b",
              color: "#fff",
              border: "none",
              cursor: "pointer",
              fontSize: 14,
              fontWeight: 600,
            }}
          >
            <ArrowLeft size={16} />
            Kembali
          </button>
        </div>

        {/* TABLE */}
        <div
          style={{
            border: "1px solid #E5E7EB",
            borderRadius: 10,
            overflow: "hidden",
            backgroundColor: "#fff",
          }}
        >
          {/* HEADER */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "70px 140px 140px 220px 280px 150px",
              backgroundColor: "#E5E7EB",
              padding: "12px 0",
              fontWeight: 700,
              fontSize: 14,
              textAlign: "center",
            }}
          >
            <div>No</div>
            <div>Tanggal</div>
            <div>Jam Pelajaran</div>
            <div>Mata Pelajaran</div>
            <div>Guru</div>
            <div>Status</div>
          </div>

          {/* ROW */}
          {rows.map((r, i) => (
            <div
              key={i}
              style={{
                display: "grid",
                gridTemplateColumns: "70px 140px 140px 220px 280px 150px",
                padding: "12px 0",
                fontSize: 14,
                alignItems: "center",
                textAlign: "center",
                borderTop: "1px solid #E5E7EB",
                backgroundColor: "#fff",
              }}
            >
              <div>{r.no}</div>
              <div>{r.tanggal}</div>
              <div>{r.jam}</div>
              <div>{r.mapel}</div>
              <div>{r.guru}</div>

              <div style={{ display: "flex", justifyContent: "center" }}>
                {/* Gunakan StatusButton - SEMUA status ada ikon mata dan bisa diklik */}
                <StatusButton status={r.status} row={r} />
              </div>
            </div>
          ))}
        </div>
      </StaffLayout>

      {/* Modal Detail Kehadiran untuk SEMUA status */}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)}>
        {selectedRecord && (
          <div style={{
            backgroundColor: "#FFFFFF",
            borderRadius: "12px",
            width: "100%",
            maxWidth: "450px",
            boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1)",
            overflow: "hidden",
            maxHeight: "90vh",
            display: "flex",
            flexDirection: "column",
          }}>
            {/* Header Modal dengan warna sesuai status */}
            <div style={{
              backgroundColor: getStatusColor(selectedRecord.status),
              padding: "16px 20px",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              color: "#FFFFFF",
            }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <Eye size={24} />
                <h3 style={{
                  margin: 0,
                  fontSize: "18px",
                  fontWeight: 700,
                }}>
                  Detail Kehadiran
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
                }}
              >
                <X size={24} />
              </button>
            </div>

            {/* Content Modal */}
            <div style={{
              padding: 24,
              overflowY: "auto",
              flex: 1,
            }}>
              {/* Row Tanggal */}
              <DetailRow label="Tanggal" value={selectedRecord.tanggal} />

              {/* Row Jam Pelajaran */}
              <DetailRow label="Jam Pelajaran" value={selectedRecord.jam} />

              {/* Row Mata Pelajaran */}
              <DetailRow label="Mata pelajaran" value={selectedRecord.mapel} />

              {/* Row Nama Guru */}
              <DetailRow label="Nama guru" value={selectedRecord.guru} />

              {/* Informasi tambahan berdasarkan status */}
              {selectedRecord.status === "Hadir" && selectedRecord.waktuMasuk && (
                <DetailRow label="Waktu Masuk" value={selectedRecord.waktuMasuk} />
              )}

              {selectedRecord.status === "Pulang" && selectedRecord.waktuKeluar && (
                <DetailRow label="Waktu Keluar" value={selectedRecord.waktuKeluar} />
              )}

              {/* Row Status */}
              <div style={{
                display: "flex",
                justifyContent: "space-between",
                marginBottom: 24,
                paddingBottom: 12,
                borderBottom: "1px solid #E5E7EB",
              }}>
                <div style={{ fontWeight: 600, color: "#374151" }}>Status :</div>
                <div>
                  <span style={{
                    backgroundColor: getStatusColor(selectedRecord.status),
                    color: "#FFFFFF",
                    padding: "6px 20px",
                    borderRadius: "20px",
                    fontSize: "14px",
                    fontWeight: 700,
                  }}>
                    {selectedRecord.status}
                  </span>
                </div>
              </div>

              {/* Info Box - Ditampilkan untuk SEMUA status */}
              <div style={{
                backgroundColor: "#F8FAFC",
                border: "1px solid #E2E8F0",
                borderRadius: 8,
                padding: 16,
                textAlign: "center",
                marginBottom: (selectedRecord.keterangan || selectedRecord.waktuMasuk || selectedRecord.waktuKeluar) ? 20 : 0,
              }}>
                <div style={{
                  fontSize: 14,
                  fontWeight: 700,
                  color: getStatusColor(selectedRecord.status),
                }}>
                  {getStatusText(selectedRecord.status)}
                </div>
              </div>

              {/* Keterangan untuk semua status yang ada */}
              {selectedRecord.keterangan && (
                <div style={{ marginTop: 20 }}>
                  <div style={{
                    fontSize: 14,
                    fontWeight: 600,
                    color: "#374151",
                    marginBottom: 12,
                  }}>
                    Keterangan :
                  </div>
                  <div style={{
                    padding: "12px 16px",
                    backgroundColor: "#F9FAFB",
                    borderRadius: 8,
                    border: "1px solid #E5E7EB",
                  }}>
                    <p style={{
                      margin: 0,
                      fontSize: 14,
                      color: "#4B5563",
                      lineHeight: 1.6,
                    }}>
                      {selectedRecord.keterangan}
                    </p>
                  </div>
                </div>
              )}

              {/* Area Bukti Foto untuk izin, sakit, dan pulang */}
              {(selectedRecord.status === "Izin" || selectedRecord.status === "Sakit" || selectedRecord.status === "Pulang") && (
                <div style={{ marginTop: 20 }}>
                  <div style={{
                    fontSize: 14,
                    fontWeight: 600,
                    color: "#374151",
                    marginBottom: 12,
                  }}>
                    Bukti Foto :
                  </div>
                  <div style={{
                    padding: "40px 16px",
                    backgroundColor: "#F9FAFB",
                    borderRadius: 8,
                    border: "1px solid #E5E7EB",
                    minHeight: 100,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    flexDirection: "column",
                    gap: 8,
                  }}>
                    {selectedRecord.buktiFoto ? (
                      <>
                        <div style={{
                          width: 60,
                          height: 60,
                          backgroundColor: getStatusColor(selectedRecord.status),
                          borderRadius: 8,
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                        }}>
                          <Eye size={24} color="#FFFFFF" />
                        </div>
                        <p style={{
                          margin: 0,
                          fontSize: 14,
                          color: "#6B7280",
                          textAlign: "center",
                          fontWeight: 600,
                        }}>
                          {selectedRecord.buktiFoto}
                        </p>
                        <p style={{
                          margin: 0,
                          fontSize: 12,
                          color: "#9CA3AF",
                          textAlign: "center",
                        }}>
                          Klik untuk melihat gambar
                        </p>
                      </>
                    ) : (
                      <p style={{
                        margin: 0,
                        fontSize: 14,
                        color: "#9CA3AF",
                        textAlign: "center",
                      }}>
                        [Belum ada bukti foto yang diupload]
                      </p>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Footer Modal */}
            <div style={{
              padding: "16px 20px",
              borderTop: "1px solid #E5E7EB",
              backgroundColor: "#F9FAFB",
              display: "flex",
              justifyContent: "flex-end",
            }}>
              <button
                onClick={() => setIsModalOpen(false)}
                style={{
                  padding: "8px 20px",
                  backgroundColor: getStatusColor(selectedRecord.status),
                  color: "#FFFFFF",
                  border: "none",
                  borderRadius: 6,
                  fontSize: 14,
                  fontWeight: 600,
                  cursor: "pointer",
                  transition: "all 0.2s",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.opacity = "0.9";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.opacity = "1";
                }}
              >
                Tutup
              </button>
            </div>
          </div>
        )}
      </Modal>
    </>
  );
}