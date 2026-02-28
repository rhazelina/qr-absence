import { useState, useEffect } from "react";
import StaffLayout from "../../component/WakaStaff/StaffLayout";
import { User, ArrowLeft, Eye, X, Loader2 } from "lucide-react";
import { Modal } from "../../component/Shared/Modal";
import { API_BASE_URL, handleResponse } from "../../services/api";

type StatusKehadiran = "Izin" | "Sakit" | "Alfa" | "Pulang" | "Dispen";

type RowKehadiran = {
  no: number;
  tanggal: string;
  jam: string;
  mapel: string;
  guru: string;
  status: StatusKehadiran;
  keterangan?: string;
  buktiFoto?: string;
  waktuKeluar?: string;
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

const mapBackendStatus = (status: string): StatusKehadiran | null => {
  switch (status) {
    case "excused":
    case "izin": return "Izin";
    case "sick": return "Sakit";
    case "absent": return "Alfa";
    case "dispensation":
    case "dispensasi":
    case "dispen": return "Dispen";
    case "return": return "Pulang";
    default: return null;
  }
};

export default function DaftarKetidakhadiran({
  user = { name: "Admin", role: "waka" },
  currentPage = "daftar-ketidakhadiran",
  onMenuClick = () => { },
  onLogout = () => { },
  onBack = () => { },
  siswaName = "Siswa",
  siswaIdentitas = "",
}: DaftarKetidakhadiranProps) {
  const COLORS = {
    IZIN: "#ACA40D",
    PULANG: "#2F85EB",
    TIDAK_HADIR: "#D90000",
    SAKIT: "#520C8F",
    DISPEN: "#E45A92",
  };

  const [selectedRecord, setSelectedRecord] = useState<RowKehadiran | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [rows, setRows] = useState<RowKehadiran[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchAbsences = async () => {
      if (!siswaIdentitas) {
        setIsLoading(false);
        return;
      }
      try {
        setIsLoading(true);
        const response = await fetch(
          `${API_BASE_URL}/students/${siswaIdentitas}/attendance?per_page=-1`,
          {
            headers: {
              "Authorization": `Bearer ${localStorage.getItem("token")}`,
              "Accept": "application/json",
            }
          }
        );
        const data = await handleResponse(response);
        const items = Array.isArray(data) ? data : (data?.data || []);

        const mapped: RowKehadiran[] = items
          .map((item: any) => {
            const status = mapBackendStatus(item.status);
            if (!status) return null;
            const date = new Date(item.date);
            return {
              no: 0,
              tanggal: date.toLocaleDateString("id-ID", { day: "2-digit", month: "2-digit", year: "numeric" }).replace(/\//g, "-"),
              jam: item.schedule?.start_time?.substring(0, 5) || "-",
              mapel: item.schedule?.subject?.name || "-",
              guru: item.schedule?.teacher?.user?.name || "-",
              status,
              keterangan: item.notes || item.reason || `${status} tanpa keterangan`,
              buktiFoto: item.document_path || undefined,
              waktuKeluar: status === "Pulang" ? item.check_out_time || undefined : undefined,
            };
          })
          .filter(Boolean) as RowKehadiran[];

        mapped.forEach((r, i) => { r.no = i + 1; });
        setRows(mapped);
      } catch (error) {
        console.error("Failed to fetch absences:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchAbsences();
  }, [siswaIdentitas]);

  const stats = {
    izin: rows.filter((r) => r.status === "Izin").length,
    sakit: rows.filter((r) => r.status === "Sakit").length,
    tidakHadir: rows.filter((r) => r.status === "Alfa").length,
    pulang: rows.filter((r) => r.status === "Pulang").length,
    dispen: rows.filter((r) => r.status === "Dispen").length,
  };

  const getStatusColor = (status: StatusKehadiran) => {
    switch (status) {
      case "Izin": return COLORS.IZIN;
      case "Sakit": return COLORS.SAKIT;
      case "Alfa": return COLORS.TIDAK_HADIR;
      case "Pulang": return COLORS.PULANG;
      case "Dispen": return COLORS.DISPEN;
      default: return "#6B7280";
    }
  };

  const handleStatusClick = (record: RowKehadiran, e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    setSelectedRecord(record);
    setIsModalOpen(true);
  };

  const StatusButton = ({ status, row }: { status: StatusKehadiran; row: RowKehadiran }) => (
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
        fontWeight: 700,
        color: "#FFFFFF",
        backgroundColor: getStatusColor(status),
        cursor: "pointer",
        transition: "all 0.2s ease",
        boxShadow: "0 2px 4px rgba(0, 0, 0, 0.1)",
        minHeight: "36px",
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.opacity = "0.9";
        e.currentTarget.style.transform = "translateY(-1px)";
        e.currentTarget.style.boxShadow = "0 4px 6px rgba(0, 0, 0, 0.15)";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.opacity = "1";
        e.currentTarget.style.transform = "translateY(0)";
        e.currentTarget.style.boxShadow = "0 2px 4px rgba(0, 0, 0, 0.1)";
      }}
    >
      <Eye size={14} />
      <span>{status}</span>
    </div>
  );

  const DetailRow = ({ label, value }: { label: string; value: string }) => (
    <div style={{
      display: "flex",
      justifyContent: "space-between",
      marginBottom: 24,
      paddingBottom: 12,
      borderBottom: "1px solid #E5E7EB",
    }}>
      <div style={{ fontWeight: 600, color: "#374151" }}>{label} :</div>
      <div style={{ color: "#6B7280", textAlign: "right", maxWidth: "60%" }}>{value}</div>
    </div>
  );

  return (
    <>
      <StaffLayout
        user={user}
        currentPage={currentPage}
        onMenuClick={onMenuClick}
        onLogout={onLogout}
        pageTitle="Daftar Ketidakhadiran"
      >
        <div style={{ padding: "0 24px" }}>
          {/* Button Kembali di atas sendiri */}
          <div style={{ marginBottom: "24px", display: "flex", justifyContent: "flex-end" }}>
            <button
              onClick={onBack}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "8px",
                padding: "10px 20px",
                backgroundColor: "#FFFFFF",
                border: "2px solid #2F85EB",
                borderRadius: "8px",
                fontSize: "14px",
                fontWeight: 600,
                color: "#2F85EB",
                cursor: "pointer",
                transition: "all 0.2s",
                boxShadow: "0 2px 4px rgba(0, 0, 0, 0.05)",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = "#2F85EB";
                e.currentTarget.style.color = "#FFFFFF";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = "#FFFFFF";
                e.currentTarget.style.color = "#2F85EB";
              }}
            >
              <ArrowLeft size={18} />
              <span>Kembali</span>
            </button>
          </div>

          {/* Card Info Siswa */}
          <div style={{
            backgroundColor: "#0F3A5F",
            borderRadius: "12px",
            padding: "20px 24px",
            marginBottom: "24px",
            boxShadow: "0 2px 8px rgba(0, 0, 0, 0.1)",
            maxWidth: "450px",
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
              <div style={{
                width: "56px",
                height: "56px",
                borderRadius: "50%",
                backgroundColor: "#FFFFFF",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}>
                <User size={32} color="#0F3A5F" />
              </div>
              <div>
                <h2 style={{
                  margin: 0,
                  fontSize: "18px",
                  fontWeight: 700,
                  color: "#FFFFFF",
                  marginBottom: "4px",
                }}>
                  {siswaName}
                </h2>
                <p style={{ margin: 0, fontSize: "14px", color: "#E5E7EB" }}>
                  {siswaIdentitas}
                </p>
              </div>
            </div>
          </div>

          {/* Summary Cards */}
          <div style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))",
            gap: "16px",
            marginBottom: "24px",
            maxWidth: "800px",
          }}>
            <div style={{
              backgroundColor: "#FFFFFF",
              borderRadius: "12px",
              padding: "20px",
              border: `2px solid ${COLORS.IZIN}`,
              boxShadow: "0 2px 4px rgba(0, 0, 0, 0.05)",
            }}>
              <div style={{ fontSize: "14px", color: "#6B7280", marginBottom: "8px", fontWeight: 500 }}>
                Izin
              </div>
              <div style={{ fontSize: "36px", fontWeight: 700, color: COLORS.IZIN }}>
                {stats.izin}
              </div>
            </div>

            <div style={{
              backgroundColor: "#FFFFFF",
              borderRadius: "12px",
              padding: "20px",
              border: `2px solid ${COLORS.SAKIT}`,
              boxShadow: "0 2px 4px rgba(0, 0, 0, 0.05)",
            }}>
              <div style={{ fontSize: "14px", color: "#6B7280", marginBottom: "8px", fontWeight: 500 }}>
                Sakit
              </div>
              <div style={{ fontSize: "36px", fontWeight: 700, color: COLORS.SAKIT }}>
                {stats.sakit}
              </div>
            </div>

            <div style={{
              backgroundColor: "#FFFFFF",
              borderRadius: "12px",
              padding: "20px",
              border: `2px solid ${COLORS.DISPEN}`,
              boxShadow: "0 2px 4px rgba(0, 0, 0, 0.05)",
            }}>
              <div style={{ fontSize: "14px", color: "#6B7280", marginBottom: "8px", fontWeight: 500 }}>
                Dispen
              </div>
              <div style={{ fontSize: "36px", fontWeight: 700, color: COLORS.DISPEN }}>
                {stats.dispen}
              </div>
            </div>

            <div style={{
              backgroundColor: "#FFFFFF",
              borderRadius: "12px",
              padding: "20px",
              border: `2px solid ${COLORS.TIDAK_HADIR}`,
              boxShadow: "0 2px 4px rgba(0, 0, 0, 0.05)",
            }}>
              <div style={{ fontSize: "14px", color: "#6B7280", marginBottom: "8px", fontWeight: 500 }}>
                Alfa
              </div>
              <div style={{ fontSize: "36px", fontWeight: 700, color: COLORS.TIDAK_HADIR }}>
                {stats.tidakHadir}
              </div>
            </div>

            <div style={{
              backgroundColor: "#FFFFFF",
              borderRadius: "12px",
              padding: "20px",
              border: `2px solid ${COLORS.PULANG}`,
              boxShadow: "0 2px 4px rgba(0, 0, 0, 0.05)",
            }}>
              <div style={{ fontSize: "14px", color: "#6B7280", marginBottom: "8px", fontWeight: 500 }}>
                Pulang
              </div>
              <div style={{ fontSize: "36px", fontWeight: 700, color: COLORS.PULANG }}>
                {stats.pulang}
              </div>
            </div>
          </div>

          {/* Tabel */}
          <div style={{
            backgroundColor: "#FFFFFF",
            borderRadius: "12px",
            overflow: "hidden",
            boxShadow: "0 2px 8px rgba(0, 0, 0, 0.1)",
            marginBottom: "24px",
          }}>
            <div style={{ overflowX: "auto" }}>
              {isLoading ? (
                <div style={{ display: "flex", justifyContent: "center", padding: "48px" }}>
                  <Loader2 className="animate-spin" size={32} color="#2F85EB" />
                </div>
              ) : rows.length === 0 ? (
                <div style={{
                  textAlign: "center",
                  padding: "48px 24px",
                  color: "#6B7280",
                  fontSize: "14px",
                }}>
                  Tidak ada data ketidakhadiran
                </div>
              ) : (
                <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "14px" }}>
                  <thead>
                    <tr style={{ backgroundColor: "#F9FAFB", borderBottom: "2px solid #E5E7EB" }}>
                      <th style={{ padding: "16px", textAlign: "left", fontWeight: 600, color: "#374151" }}>No</th>
                      <th style={{ padding: "16px", textAlign: "left", fontWeight: 600, color: "#374151" }}>Tanggal</th>
                      <th style={{ padding: "16px", textAlign: "left", fontWeight: 600, color: "#374151" }}>Jam Pelajaran</th>
                      <th style={{ padding: "16px", textAlign: "left", fontWeight: 600, color: "#374151" }}>Mata Pelajaran</th>
                      <th style={{ padding: "16px", textAlign: "left", fontWeight: 600, color: "#374151" }}>Guru</th>
                      <th style={{ padding: "16px", textAlign: "center", fontWeight: 600, color: "#374151" }}>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {rows.map((row, idx) => (
                      <tr key={row.no} style={{
                        borderBottom: "1px solid #E5E7EB",
                        backgroundColor: idx % 2 === 0 ? "#FFFFFF" : "#F9FAFB",
                      }}>
                        <td style={{ padding: "16px", color: "#6B7280" }}>{row.no}</td>
                        <td style={{ padding: "16px", color: "#374151", fontWeight: 500 }}>{row.tanggal}</td>
                        <td style={{ padding: "16px", color: "#6B7280" }}>{row.jam}</td>
                        <td style={{ padding: "16px", color: "#374151" }}>{row.mapel}</td>
                        <td style={{ padding: "16px", color: "#6B7280" }}>{row.guru}</td>
                        <td style={{ padding: "16px", textAlign: "center" }}>
                          <StatusButton status={row.status} row={row} />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        </div>
      </StaffLayout>

      {/* Modal Detail */}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)}>
        {selectedRecord && (
          <div style={{
            backgroundColor: "#FFFFFF",
            borderRadius: 12,
            width: "90%",
            maxWidth: 600,
            maxHeight: "90vh",
            overflow: "hidden",
            display: "flex",
            flexDirection: "column",
          }}>
            <div style={{
              backgroundColor: "#0B2948",
              padding: "16px 20px",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              color: "#FFFFFF",
            }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <Eye size={24} />
                <h3 style={{ margin: 0, fontSize: "18px", fontWeight: 700 }}>
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
                }}
              >
                <X size={24} />
              </button>
            </div>

            <div style={{ padding: 24, overflowY: "auto", flex: 1 }}>
              <DetailRow label="Tanggal" value={selectedRecord.tanggal} />
              <DetailRow label="Jam Pelajaran" value={selectedRecord.jam} />
              <DetailRow label="Mata pelajaran" value={selectedRecord.mapel} />

              {selectedRecord.status === "Pulang" && selectedRecord.waktuKeluar && (
                <DetailRow label="Waktu Keluar" value={selectedRecord.waktuKeluar} />
              )}

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

              {/* Info Box untuk Alfa */}
              {selectedRecord.status === "Alfa" && (
                <div style={{
                  backgroundColor: "#F3F4F6",
                  borderRadius: 8,
                  padding: "16px 20px",
                  textAlign: "center",
                  marginBottom: 20,
                  border: "1px solid #E5E7EB",
                }}>
                  <div style={{
                    fontSize: 14,
                    fontWeight: 500,
                    color: "#374151",
                  }}>
                    Siswa Alfa tanpa keterangan
                  </div>
                </div>
              )}

              {/* Keterangan dan Bukti Foto - hanya untuk Izin, Sakit, Pulang */}
              {(selectedRecord.status === "Izin" || selectedRecord.status === "Sakit" || selectedRecord.status === "Pulang") && (
                <>
                  {selectedRecord.keterangan && (
                    <div style={{ marginBottom: 20 }}>
                      <div style={{ fontSize: 14, fontWeight: 600, color: "#374151", marginBottom: 12 }}>
                        Keterangan :
                      </div>
                      <div style={{
                        padding: "12px 16px",
                        backgroundColor: "#F9FAFB",
                        borderRadius: 8,
                        border: "1px solid #E5E7EB",
                      }}>
                        <p style={{ margin: 0, fontSize: 14, color: "#4B5563", lineHeight: 1.6 }}>
                          {selectedRecord.keterangan}
                        </p>
                      </div>
                    </div>
                  )}

                  <div>
                    <div style={{ fontSize: 14, fontWeight: 600, color: "#374151", marginBottom: 12 }}>
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
                          <p style={{ margin: 0, fontSize: 14, color: "#6B7280", textAlign: "center", fontWeight: 600 }}>
                            {selectedRecord.buktiFoto}
                          </p>
                          <p style={{ margin: 0, fontSize: 12, color: "#9CA3AF", textAlign: "center" }}>
                            Klik untuk melihat gambar
                          </p>
                        </>
                      ) : (
                        <p style={{ margin: 0, fontSize: 14, color: "#9CA3AF", textAlign: "center" }}>
                          [Belum ada bukti foto yang diupload]
                        </p>
                      )}
                    </div>
                  </div>
                </>
              )}
            </div>

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
                onMouseEnter={(e) => { e.currentTarget.style.opacity = "0.9"; }}
                onMouseLeave={(e) => { e.currentTarget.style.opacity = "1"; }}
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