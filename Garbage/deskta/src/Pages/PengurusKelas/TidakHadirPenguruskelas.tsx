import { useState, useMemo, useEffect } from "react";
import PengurusKelasLayout from "../../component/PengurusKelas/PengurusKelasLayout";
import { Select } from "../../component/Shared/Select";
import { Modal } from "../../component/Shared/Modal";
import { dashboardService } from "../../services/dashboard";
import { usePopup } from "../../component/Shared/Popup/PopupProvider";

interface AbsensiRecord {
  id: string;
  tanggal: string;
  jamPelajaran: string;
  mataPelajaran: string;
  guru: string;
  status: 'present' | 'absent' | 'sick' | 'excused' | 'late' | 'early_departure';
  keterangan?: string; // Tambahan untuk izin/sakit/pulang
  namaSiswa?: string;
  nis?: string;
}



function CalendarIcon() {
  return (
    <svg
      width="22"
      height="22"
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M8 2V5"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M16 2V5"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M3.5 9.09H20.5"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M21 8.5V17C21 20 19.5 22 16 22H8C4.5 22 3 20 3 17V8.5C3 5.5 4.5 3.5 8 3.5H16C19.5 3.5 21 5.5 21 8.5Z"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

// Icon mata untuk lihat detail
function EyeIcon({ size = 16 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      style={{ display: "inline-block", verticalAlign: "middle" }}
    >
      <path
        d="M15 12C15 13.6569 13.6569 15 12 15C10.3431 15 9 13.6569 9 12C9 10.3431 10.3431 9 12 9C13.6569 9 15 10.3431 15 12Z"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M2 12C2 12 5 5 12 5C19 5 22 12 22 12C22 12 19 19 12 19C5 19 2 12 2 12Z"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

// Icon X untuk tombol close
function XIcon({ size = 24 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      style={{ display: "inline-block", verticalAlign: "middle" }}
    >
      <path
        d="M18 6L6 18"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M6 6L18 18"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

// Interface untuk props
interface TidakHadirPenguruskelasProps {
  user?: { name: string; phone: string; role?: string };
  currentPage?: string;
  onMenuClick?: (page: string) => void;
  onLogout?: () => void;
}

export default function TidakHadirPenguruskelas({
  user = { name: "Pengurus Kelas", phone: "", role: "pengurus-kelas" },
  currentPage = "tidak-hadir",
  onMenuClick = () => { },
  onLogout = () => { },
}: TidakHadirPenguruskelasProps) {
  const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0]);
  const [statusFilter, setStatusFilter] = useState<string>("semua");
  const [selectedRecord, setSelectedRecord] = useState<AbsensiRecord | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [attendanceData, setAttendanceData] = useState<AbsensiRecord[]>([]);
  const { alert: popupAlert } = usePopup();

  const fetchAttendance = async () => {
    try {
      // Fetch attendance separately for start and end date if they are different, or loop?
      // For now, let's just fetch for the start date as 'date' param, 
      // since the API seems to support single date.
      // Ideally backend supports range.
      const response = await dashboardService.getMyClassAttendance({ date: startDate });

      // Transform response to match AbsensiRecord if needed
      // Assuming response is an array of attendance records
      const formattedData: AbsensiRecord[] = response.map((item: any) => ({
        id: item.id.toString(),
        tanggal: item.date, // Assuming YYYY-MM-DD
        jamPelajaran: `${item.schedule?.start_time?.slice(0, 5)} - ${item.schedule?.end_time?.slice(0, 5)} `,
        mataPelajaran: item.schedule?.subject_name || '-',
        guru: item.schedule?.teacher?.user?.name || '-',
        status: item.status,
        keterangan: item.reason,
        namaSiswa: item.student?.user?.name || item.user?.name || '-',
        nis: item.student?.nis || item.user?.nis || '-',
      }));
      setAttendanceData(formattedData);
    } catch (error) {
      console.error("Error fetching attendance:", error);
      popupAlert("Gagal mengambil data kehadiran");
    }
  };

  useEffect(() => {
    fetchAttendance();
  }, [startDate]); // Re-fetch when date changes. Note: logic only supports single date for now based on API.

  // Filter data (Client side filtering for Status, Date Range logic adjustment)
  const filteredData = useMemo(() => {
    // If we only fetch for 'startDate', we don't strictly need date range filtering client side 
    // unless we accumulate data. For now, assuming single date view is acceptable or we'd need loop.

    return attendanceData.filter((item) => {
      let statusMatch = true;
      if (statusFilter !== "semua") {
        if (statusFilter === "excused/sick") {
          statusMatch = item.status === "excused" || item.status === "sick";
        } else if (statusFilter === "absent") {
          statusMatch = item.status === "absent";
        } else {
          statusMatch = item.status === statusFilter;
        }
      }
      return statusMatch;
    });
  }, [attendanceData, statusFilter]);

  // Hitung summary berdasarkan data filtered
  const summary = useMemo(() => {
    const hadir = attendanceData.filter((d) => d.status === "present").length;
    const pulang = attendanceData.filter((d) => d.status === "early_departure").length;
    const izin = attendanceData.filter((d) => d.status === "excused").length;
    const sakit = attendanceData.filter((d) => d.status === "sick").length;
    const alpha = attendanceData.filter((d) => d.status === "absent" || d.status === "late").length; // Treating late as alpha for now? Or separating? Original code mapped absent to alpha.

    return { hadir, pulang, izin, sakit, alpha, total: attendanceData.length };
  }, [attendanceData]);

  // Fungsi untuk membuka modal detail - SEMUA STATUS bisa diklik
  const handleStatusClick = (record: AbsensiRecord, e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    console.log("Status diklik:", record);
    setSelectedRecord(record);
    setIsModalOpen(true);
  };

  // Custom Status Renderer dengan icon mata - SEMUA STATUS bisa diklik
  const StatusButton = ({ status, row }: { status: string; row: AbsensiRecord }) => {
    let bgColor = "#D90000"; // MERAH - Tidak Hadir
    let label = "Tidak Hadir";
    const textColor = "#FFFFFF";

    if (status === "excused") {
      bgColor = "#ACA40D"; // KUNING - Izin
      label = "Izin";
    } else if (status === "sick") {
      bgColor = "#520C8F"; // UNGU - Sakit
      label = "Sakit";
    } else if (status === "early_departure") {
      bgColor = "#2F85EB"; // BIRU - Pulang
      label = "Pulang";
    } else if (status === "present") {
      bgColor = "#1FA83D"; // HIJAU - Hadir
      label = "Hadir";
    } else if (status === "late") {
      bgColor = "#F59E0B"; // ORANGE - Terlambat
      label = "Terlambat";
    }

    return (
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
          fontWeight: 600,
          color: textColor,
          backgroundColor: bgColor,
          cursor: "pointer", // SEMUA STATUS bisa diklik
          transition: "all 0.2s ease",
          border: "none",
          boxShadow: "0 2px 4px rgba(0, 0, 0, 0.1)",
          minHeight: "36px",
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.opacity = "0.9";
          e.currentTarget.style.transform = "translateY(-1px)";
          e.currentTarget.style.boxShadow = "0 4px 8px rgba(0, 0, 0, 0.15)";
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.opacity = "1";
          e.currentTarget.style.transform = "translateY(0)";
          e.currentTarget.style.boxShadow = "0 2px 4px rgba(0, 0, 0, 0.1)";
        }}
      >
        <EyeIcon size={14} /> {/* SEMUA STATUS ada ikon mata */}
        <span>{label}</span>
      </div>
    );
  };

  const columns = [
    {
      key: "no",
      label: "No",
      width: "60px",
      align: "center" as const,
    },
    {
      key: "tanggal",
      label: "Tanggal",
      width: "130px",
      align: "center" as const,
    },
    {
      key: "jamPelajaran",
      label: "Jam Pelajaran",
      width: "130px",
      align: "center" as const,
    },
    {
      key: "mataPelajaran",
      label: "Mata Pelajaran",
      width: "180px",
    },
    {
      key: "guru",
      label: "Guru",
      width: "280px",
      align: "center" as const,
    },
    {
      key: "status",
      label: "Status",
      render: (_: any, row: AbsensiRecord) => <StatusButton status={row.status} row={row} />,
      align: "center" as const,
      width: "140px",
    },
  ];

  // Status filter options - Alpha diubah jadi Tidak Hadir
  const statusOptions = [
    { label: "Semua Status", value: "semua" },
    { label: "Hadir", value: "present" },
    { label: "Tidak Hadir", value: "absent" },
    { label: "Izin/Sakit", value: "excused/sick" },
    { label: "Pulang", value: "early_departure" },
  ];

  // Fungsi untuk mendapatkan teks status
  const getStatusText = (status: string) => {
    switch (status) {
      case "absent":
        return "Siswa tidak hadir tanpa keterangan";
      case "excused":
        return "Siswa izin dengan keterangan";
      case "sick":
        return "Siswa sakit dengan surat dokter";
      case "present":
        return "Siswa hadir tepat waktu";
      case "early_departure":
        return "Siswa pulang lebih awal karena ada kepentingan";
      case "late":
        return "Siswa terlambat hadir";
      default:
        return status;
    }
  };

  // Helper function untuk warna status
  const getStatusColor = (status: string) => {
    switch (status) {
      case "absent": return "#D90000"; // MERAH - Tidak Hadir
      case "excused": return "#ACA40D"; // KUNING - Izin
      case "sick": return "#520C8F"; // UNGU - Sakit
      case "present": return "#1FA83D"; // HIJAU - Hadir
      case "early_departure": return "#2F85EB"; // BIRU - Pulang
      case "late": return "#F59E0B"; // ORANGE - Terlambat
      default: return "#6B7280";
    }
  };

  // Total Card
  const TotalCard = () => (
    <div
      style={{
        background: "#0B2948",
        borderRadius: "12px",
        padding: "12px 24px",
        border: "1px solid #0B2948",
        boxShadow: "0 2px 4px rgba(11, 41, 72, 0.1)",
        minWidth: "120px",
        textAlign: "center",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
      }}
    >
      <div
        style={{
          fontSize: "12px",
          fontWeight: 700,
          color: "#FFFFFF",
          marginBottom: "4px",
        }}
      >
        Total Data
      </div>
      <div
        style={{
          fontSize: "24px",
          fontWeight: 800,
          color: "#FFFFFF",
          lineHeight: 1,
        }}
      >
        {summary.total}
      </div>
    </div>
  );

  return (
    <>
      <PengurusKelasLayout
        pageTitle="Daftar Ketidakhadiran"
        currentPage={currentPage}
        onMenuClick={onMenuClick}
        user={user}
        onLogout={onLogout}
      >
        <div
          style={{
            width: "100%",
            maxWidth: "1400px",
            margin: "0 auto",
            display: "flex",
            flexDirection: "column",
            gap: "24px",
            padding: "20px",
          }}
        >
          {/* Header Section */}
          <div
            style={{
              display: "flex",
              flexWrap: "wrap",
              gap: "24px",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            {/* Date Picker */}
            <div
              style={{
                background: "#0B2948",
                borderRadius: "8px",
                padding: "8px 16px",
                display: "flex",
                alignItems: "center",
                gap: "12px",
                color: "white",
                boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "6px",
                }}
              >
                <CalendarIcon />
              </div>

              <div style={{
                display: "flex",
                alignItems: "center",
                gap: "8px",
              }}>
                <div
                  style={{
                    background: "#FFFFFF",
                    borderRadius: "6px",
                    padding: "6px 10px",
                    color: "#0F172A",
                    fontWeight: "600",
                    fontSize: "14px",
                    display: "flex",
                    alignItems: "center",
                  }}
                >
                  <input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    style={{
                      border: "none",
                      background: "transparent",
                      color: "#0F172A",
                      fontWeight: "600",
                      fontSize: "13px",
                      outline: "none",
                      fontFamily: "inherit",
                      cursor: "pointer",
                      colorScheme: "light",
                    }}
                  />
                </div>
              </div>
            </div>

            {/* Status Filter */}
            <div
              style={{
                background: "#FFFFFF",
                borderRadius: "8px",
                padding: "6px 12px",
                border: "1px solid #E2E8F0",
                boxShadow: "0 2px 4px rgba(0, 0, 0, 0.05)",
                minWidth: "200px",
              }}
            >
              <Select
                value={statusFilter}
                onChange={setStatusFilter}
                options={statusOptions}
                placeholder="Filter Status"
              />
            </div>
          </div>

          {/* Summary Cards */}
          <div
            style={{
              display: "flex",
              gap: "16px",
              flexWrap: "wrap",
              alignItems: "center",
            }}
          >
            <TotalCard />
            <SummaryCard label="Hadir" value={summary.hadir} color="#1FA83D" />
            <SummaryCard label="Tidak Hadir" value={summary.alpha} color="#D90000" />
            <SummaryCard label="Izin" value={summary.izin} color="#ACA40D" />
            <SummaryCard label="Sakit" value={summary.sakit} color="#520C8F" />
            <SummaryCard label="Pulang" value={summary.pulang} color="#2F85EB" />
          </div>

          {/* Tabel Absensi - MAIN CONTENT */}
          <div style={{
            position: "relative",
            backgroundColor: "#FFFFFF",
            borderRadius: "12px",
            overflow: "hidden",
            boxShadow: "0 4px 12px rgba(15, 23, 42, 0.08)",
            border: "1px solid #E2E8F0",
          }}>
            <div style={{
              padding: "20px 24px",
              borderBottom: "1px solid #E2E8F0",
              backgroundColor: "#F8FAFC",
            }}>
              <h3 style={{
                margin: 0,
                fontSize: "18px",
                fontWeight: 700,
                color: "#0F172A",
              }}>
                Daftar Ketidakhadiran
              </h3>
            </div>

            <div style={{ overflowX: "auto" }}>
              <table
                style={{
                  width: "100%",
                  borderCollapse: "collapse",
                  minWidth: "800px", // SAMA PERSIS dengan siswa
                }}
              >
                <thead>
                  <tr style={{ backgroundColor: "#F1F5F9" }}>
                    {columns.map((col) => (
                      <th
                        key={col.key}
                        style={{
                          padding: "16px 24px",
                          textAlign: col.align || "left",
                          fontSize: "14px",
                          fontWeight: 600,
                          color: "#475569",
                          borderBottom: "2px solid #E2E8F0",
                          width: col.width || "auto",
                        }}
                      >
                        {col.label}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filteredData.length > 0 ? (
                    filteredData.map((row, index) => (
                      <tr
                        key={row.id}
                        style={{
                          borderBottom: "1px solid #E2E8F0",
                          transition: "background-color 0.2s",
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.backgroundColor = "#F8FAFC";
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.backgroundColor = "transparent";
                        }}
                      >
                        {columns.map((col) => (
                          <td
                            key={col.key}
                            style={{
                              padding: "16px 24px",
                              fontSize: "14px",
                              color: "#334155",
                              verticalAlign: "middle",
                              textAlign: col.align || "left",
                            }}
                          >
                            {col.key === "no"
                              ? index + 1
                              : col.render
                                ? col.render(row[col.key as keyof AbsensiRecord], row)
                                : row[col.key as keyof AbsensiRecord]}
                          </td>
                        ))}
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td
                        colSpan={columns.length}
                        style={{
                          padding: "60px 24px",
                          textAlign: "center",
                          color: "#64748B",
                          fontSize: "16px",
                        }}
                      >
                        Tidak ada data ketidakhadiran untuk periode yang dipilih
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Footer with pagination info */}
            {filteredData.length > 0 && (
              <div style={{
                padding: "16px 24px",
                borderTop: "1px solid #E2E8F0",
                backgroundColor: "#F8FAFC",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                fontSize: "14px",
                color: "#64748B",
              }}>
                <span>Menampilkan {filteredData.length} data</span>
                <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
                  <button
                    style={{
                      padding: "6px 12px",
                      borderRadius: "6px",
                      border: "1px solid #CBD5E1",
                      background: "#FFFFFF",
                      cursor: "pointer",
                      fontSize: "14px",
                      color: "#475569",
                    }}
                  >
                    Sebelumnya
                  </button>
                  <span style={{ padding: "6px 12px" }}>1</span>
                  <button
                    style={{
                      padding: "6px 12px",
                      borderRadius: "6px",
                      border: "1px solid #CBD5E1",
                      background: "#FFFFFF",
                      cursor: "pointer",
                      fontSize: "14px",
                      color: "#475569",
                    }}
                  >
                    Selanjutnya
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </PengurusKelasLayout>

      {/* Modal Detail Kehadiran */}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)}>
        {selectedRecord && (
          <div style={{
            backgroundColor: "#FFFFFF",
            borderRadius: "12px",
            width: "100%",
            maxWidth: "420px",
            boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1)",
            overflow: "hidden",
            maxHeight: "90vh",
            display: "flex",
            flexDirection: "column",
          }}>
            {/* Header Modal */}
            <div style={{
              backgroundColor: "#0B2948",
              padding: "16px 20px",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              color: "#FFFFFF",
            }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <EyeIcon size={24} />
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
                <XIcon size={24} />
              </button>
            </div>

            {/* Content Modal */}
            <div style={{
              padding: 24,
              overflowY: "auto",
              flex: 1,
            }}>
              {/* Row Nama Siswa */}
              <DetailRow label="Nama Siswa" value={selectedRecord.namaSiswa || "-"} />

              {/* Row NIS */}
              <DetailRow label="NIS" value={selectedRecord.nis || "-"} />

              {/* Row Tanggal */}
              <DetailRow label="Tanggal" value={selectedRecord.tanggal} />

              {/* Row Jam Pelajaran */}
              <DetailRow label="Jam Pelajaran" value={selectedRecord.jamPelajaran} />

              {/* Row Mata Pelajaran */}
              <DetailRow label="Mata pelajaran" value={selectedRecord.mataPelajaran} />

              {/* Row Nama Guru */}
              <DetailRow label="Nama guru" value={selectedRecord.guru} />

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
                    padding: "4px 16px",
                    borderRadius: 6,
                    fontSize: 13,
                    fontWeight: 600,
                  }}>
                    {selectedRecord.status === "absent" ? "Tidak Hadir" :
                      selectedRecord.status === "sick" ? "Sakit" :
                        selectedRecord.status === "excused" ? "Izin" :
                          selectedRecord.status === "present" ? "Hadir" :
                            selectedRecord.status === "late" ? "Terlambat" :
                              "Pulang"}
                  </span>
                </div>
              </div>

              {/* Info Box - Ditampilkan untuk SEMUA status */}
              <div style={{
                backgroundColor: "#EFF6FF",
                border: "1px solid #BFDBFE",
                borderRadius: 8,
                padding: 16,
                textAlign: "center",
                marginBottom: (selectedRecord.status === "excused" || selectedRecord.status === "sick" || selectedRecord.status === "early_departure") && selectedRecord.keterangan ? 24 : 0,
              }}>
                <div style={{
                  fontSize: 14,
                  fontWeight: 600,
                  color: "#1E40AF",
                }}>
                  {getStatusText(selectedRecord.status)}
                </div>
              </div>

              {/* Keterangan untuk izin, sakit, DAN PULANG */}
              {(selectedRecord.status === "excused" || selectedRecord.status === "sick" || selectedRecord.status === "early_departure") && selectedRecord.keterangan && (
                <div>
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
                      color: "#6B7280",
                      lineHeight: 1.5,
                    }}>
                      {selectedRecord.keterangan}
                    </p>
                  </div>
                </div>
              )}

              {/* Area Bukti Foto untuk izin, sakit, DAN PULANG */}
              {(selectedRecord.status === "excused" || selectedRecord.status === "sick" || selectedRecord.status === "early_departure") && (
                <div style={{ marginTop: selectedRecord.keterangan ? 24 : 0 }}>
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
                  }}>
                    <p style={{
                      margin: 0,
                      fontSize: 14,
                      color: "#9CA3AF",
                      textAlign: "center",
                    }}>
                      [Area untuk menampilkan bukti foto]
                    </p>
                  </div>
                </div>
              )}

              {/* Catatan untuk status Hadir */}
              {selectedRecord.status === "present" && (
                <div style={{
                  marginTop: 24,
                  padding: "12px 16px",
                  backgroundColor: "#F0FDF4",
                  borderRadius: 8,
                  border: "1px solid #BBF7D0",
                }}>
                  <p style={{
                    margin: 0,
                    fontSize: 14,
                    color: "#166534",
                    lineHeight: 1.5,
                    textAlign: "center",
                    fontWeight: 500,
                  }}>
                    ✓ Siswa hadir tepat waktu sesuai jadwal pelajaran
                  </p>
                </div>
              )}
            </div>
          </div>
        )}
      </Modal>
    </>
  );
}

function SummaryCard({ label, value, color = "#0B2948" }: { label: string; value: number; color?: string }) {
  return (
    <div
      style={{
        background: "#FFFFFF",
        borderRadius: "12px",
        padding: "12px 24px",
        border: `1px solid ${color} 20`,
        boxShadow: "0 2px 4px rgba(0, 0, 0, 0.05)",
        minWidth: "100px",
        textAlign: "center",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
      }}
    >
      <div
        style={{
          fontSize: "12px",
          fontWeight: 700,
          color: color,
          marginBottom: "4px",
        }}
      >
        {label}
      </div>
      <div
        style={{
          fontSize: "24px",
          fontWeight: 800,
          color: color,
          lineHeight: 1,
        }}
      >
        {value}
      </div>
    </div>
  );
}

function DetailRow({ label, value }: { label: string; value: string }) {
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
}