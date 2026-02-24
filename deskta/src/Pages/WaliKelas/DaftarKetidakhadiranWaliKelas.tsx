import { useState, useMemo, useEffect } from "react";
import WalikelasLayout from "../../component/Walikelas/layoutwakel";
import { User, ArrowLeft, Eye } from "lucide-react";
import { Modal } from "../../component/Shared/Modal";
import { attendanceService } from "../../services/attendanceService";
import classService from "../../services/classService";

type StatusKehadiran = "Izin" | "Sakit" | "Alfa" | "Pulang";

type RowKehadiran = {
  id: number;
  no: number;
  tanggal: string;
  jam: string;
  mapel: string;
  guru: string;
  status: StatusKehadiran;
  keterangan?: string;
  bukti?: string;
  studentId?: string;
  scheduleId?: string;
};

interface DaftarKetidakhadiranWaliKelasProps {
  user?: { name: string; role: string };
  currentPage?: string;
  onMenuClick?: (page: string, payload?: any) => void;
  onLogout?: () => void;
  selectedStudentId?: string;
  siswaName?: string;
  siswaIdentitas?: string;
}

export default function DaftarKetidakhadiranWaliKelas({
  user = { name: "Wali Kelas", role: "wakel" },
  currentPage = "daftar-ketidakhadiran-walikelas",
  onMenuClick = () => { },
  onLogout = () => { },
  selectedStudentId,
  siswaName,
  siswaIdentitas,
}: DaftarKetidakhadiranWaliKelasProps) {
  // Use props or fallback to values from API
  const [studentName] = useState<string>(siswaName || '-');
  const [studentNisn] = useState<string>(siswaIdentitas || '-');

  const [rows, setRows] = useState<RowKehadiran[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch class info and student absence data
  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        setError(null);

        // Get homeroom class info
        const classData = await classService.getMyClass();
        const classId = classData.id;
        // const className = classData.name || classData.class_name || 'Kelas Tidak Diketahui';
        // setKelasInfo({ id: classId, namaKelas: className });

        // Get attendance records for this class
        // If specific student is selected, filter by student
        const params: any = {
          from: '2024-01-01', // Get all records from beginning
          to: new Date().toISOString().split('T')[0]
        };

        if (selectedStudentId) {
          params.student_id = selectedStudentId;
        }

        const response = await attendanceService.getClassStudentsAbsences(classId, params);

        if (response && response.data) {
          const mappedRows: RowKehadiran[] = [];

          const studentsData = response.data;

          studentsData.forEach((studentGroup: any) => {
            const student = studentGroup.student;
            const items = studentGroup.items || [];

            items.forEach((item: any) => {
              const status = item.status?.toLowerCase();
              let mappedStatus: StatusKehadiran = "Alfa";

              if (status === 'permission' || status === 'izin') mappedStatus = "Izin";
              else if (status === 'sick' || status === 'sakit') mappedStatus = "Sakit";
              else if (status === 'early_leave' || status === 'return' || status === 'pulang') mappedStatus = "Pulang";
              else if (status === 'alpha' || status === 'absent' || status === 'alfa') mappedStatus = "Alfa";
              else return; // Skip if status is not one we want to track here

              mappedRows.push({
                id: item.id,
                no: mappedRows.length + 1,
                tanggal: item.date || '-',
                jam: item.schedule?.period || item.jam_ke || '-',
                mapel: item.schedule?.subject_name || item.schedule?.mataPelajaran || '-',
                guru: item.schedule?.teacher?.user?.name || item.schedule?.guru || '-',
                status: mappedStatus,
                keterangan: item.reason || item.keterangan || '-',
                bukti: item.document_path ? `${import.meta.env.VITE_STORAGE_URL}/${item.document_path}` : undefined,
                studentId: student?.id,
                scheduleId: item.schedule_id
              });
            });
          });

          setRows(mappedRows);
        } else {
          setRows([]);
        }
      } catch (err: any) {
        console.error('Error fetching absence data:', err);
        setError(err.message || 'Gagal memuat data ketidakhadiran');
        // Fallback to empty array on error
        setRows([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [selectedStudentId]);

  const [selectedRecord, setSelectedRecord] = useState<RowKehadiran | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editableReason, setEditableReason] = useState("");
  const [isUpdatingReason, setIsUpdatingReason] = useState(false);

  const stats = useMemo(() => ({
    izin: rows.filter((r) => r.status === "Izin").length,
    sakit: rows.filter((r) => r.status === "Sakit").length,
    tidakHadir: rows.filter((r) => r.status === "Alfa").length,
    pulang: rows.filter((r) => r.status === "Pulang").length,
  }), [rows]);

  const handleBack = () => {
    onMenuClick("rekap-kehadiran-siswa");
  };

  const COLORS = {
    IZIN: "#ACA40D",
    SAKIT: "#520C8F",
    TIDAK_HADIR: "#D90000",
    PULANG: "#2F85EB"
  };

  const handleStatusClick = (record: RowKehadiran, e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    setSelectedRecord(record);
    setEditableReason(record.keterangan === '-' ? "" : (record.keterangan || ""));
    setIsModalOpen(true);
  };

  const handleUpdateAttendance = async () => {
    if (!selectedRecord) return;
    try {
      setIsUpdatingReason(true);
      await attendanceService.updateAttendanceStatus(
        selectedRecord.id.toString(),
        selectedRecord.status,
        editableReason
      );

      // Update local state
      setRows(prev => prev.map(r =>
        r.id === selectedRecord.id ? { ...r, keterangan: editableReason || '-' } : r
      ));

      alert("Keterangan berhasil diperbarui");
      setIsModalOpen(false);
    } catch (err: any) {
      console.error("Error updating attendance:", err);
      alert("Gagal memperbarui keterangan: " + (err.message || 'Error'));
    } finally {
      setIsUpdatingReason(false);
    }
  };

  const StatusButton = ({ status, row }: { status: StatusKehadiran; row: RowKehadiran }) => {
    let bgColor = COLORS.TIDAK_HADIR;
    let label = "Alfa";
    let textColor = "#FFFFFF";

    if (status === "Izin") {
      bgColor = COLORS.IZIN;
      label = "Izin";
    } else if (status === "Sakit") {
      bgColor = COLORS.SAKIT;
      label = "Sakit";
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
          fontWeight: 800,
          color: textColor,
          backgroundColor: bgColor,
          cursor: "pointer",
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
        <Eye size={14} />
        <span style={{ fontWeight: 700 }}>{label}</span>
      </div>
    );
  };




  return (
    <>
      <WalikelasLayout
        pageTitle="Daftar Ketidakhadiran"
        currentPage={currentPage as any}
        onMenuClick={onMenuClick}
        user={user}
        onLogout={onLogout}
      >
        {isLoading ? (
          <div style={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            height: "200px",
            fontSize: "18px",
            fontWeight: 700,
            color: "#062A4A"
          }}>
            Memuat data...
          </div>
        ) : error ? (
          <div style={{
            padding: "20px",
            backgroundColor: "#FEF2F2",
            borderRadius: "10px",
            border: "2px solid #FECACA",
            color: "#991B1B",
            textAlign: "center",
            marginBottom: "24px",
            fontWeight: 700
          }}>
            {error}
          </div>
        ) : (
          <>
            <div
              style={{
                display: "flex",
                marginBottom: 24,
              }}
            >
              <button
                onClick={handleBack}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                  padding: "12px 20px",
                  borderRadius: 8,
                  backgroundColor: "#062A4A",
                  color: "#fff",
                  border: "none",
                  cursor: "pointer",
                  fontSize: 14,
                  fontWeight: 700,
                  transition: "all 0.2s",
                  boxShadow: "0 2px 4px rgba(6, 42, 74, 0.2)",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = "#051A2F";
                  e.currentTarget.style.transform = "translateY(-1px)";
                  e.currentTarget.style.boxShadow = "0 4px 8px rgba(6, 42, 74, 0.3)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = "#062A4A";
                  e.currentTarget.style.transform = "translateY(0)";
                  e.currentTarget.style.boxShadow = "0 2px 4px rgba(6, 42, 74, 0.2)";
                }}
              >
                <ArrowLeft size={18} />
                Kembali ke Rekap
              </button>
            </div>

            <div
              style={{
                width: "100%",
                maxWidth: 420,
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
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 20, fontWeight: 900 }}>{studentName}</div>
                <div style={{ fontSize: 15, opacity: 0.9, fontWeight: 600 }}>NISN: {studentNisn}</div>
              </div>
            </div>

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
                  border: `2px solid ${COLORS.IZIN}`,
                  borderRadius: 10,
                  padding: "12px 24px",
                  textAlign: "center",
                  minWidth: 100,
                  flex: 1,
                }}
              >
                <div style={{ fontSize: 14, fontWeight: 700, color: "#6B7280" }}>
                  Izin
                </div>
                <div
                  style={{
                    fontSize: 32,
                    fontWeight: 900,
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
                  flex: 1,
                }}
              >
                <div style={{ fontSize: 14, fontWeight: 700, color: "#6B7280" }}>
                  Sakit
                </div>
                <div
                  style={{
                    fontSize: 32,
                    fontWeight: 900,
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
                  flex: 1,
                }}
              >
                <div style={{ fontSize: 14, fontWeight: 700, color: "#6B7280" }}>
                  Alfa
                </div>
                <div
                  style={{
                    fontSize: 32,
                    fontWeight: 900,
                    color: COLORS.TIDAK_HADIR,
                    marginTop: 4,
                  }}
                >
                  {stats.tidakHadir}
                </div>
              </div>

            </div>

            {/* <div
            style={{
              backgroundColor: "#FFFFFF",
              border: `2px solid ${COLORS.PULANG}`,
              borderRadius: 10,
              padding: "12px 24px",
              textAlign: "center",
              minWidth: 100,
              flex: 1,
            }}
          >
            <div style={{ fontSize: 14, fontWeight: 700, color: "#6B7280" }}>
              Pulang
            </div> */}
            {/* <div
              style={{
                fontSize: 32,
                fontWeight: 900,
                color: COLORS.PULANG,
                marginTop: 4,
              }}
            >
              {stats.pulang}
            </div>
          </div> */}
            {/* </div> */}

            <div
              style={{
                border: "1px solid #E5E7EB",
                borderRadius: 10,
                overflow: "hidden",
                backgroundColor: "#fff",
                boxShadow: "0 4px 12px rgba(0, 0, 0, 0.08)",
              }}
            >
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "70px 140px 140px 1fr 1fr 150px",
                  backgroundColor: "#F3F4F6",
                  padding: "16px 20px",
                  fontWeight: 800,
                  fontSize: 14,
                  color: "#374151",
                  borderBottom: "2px solid #E5E7EB",
                }}
              >
                <div style={{ textAlign: "center", fontWeight: 900 }}>No</div>
                <div style={{ textAlign: "center", fontWeight: 900 }}>Tanggal</div>
                <div style={{ textAlign: "center", fontWeight: 900 }}>Jam Pelajaran</div>
                <div style={{ fontWeight: 900 }}>Mata Pelajaran</div>
                <div style={{ fontWeight: 900 }}>Guru</div>
                <div style={{ textAlign: "center", fontWeight: 900 }}>Status</div>
              </div>

              {rows.map((r, idx) => (
                <div
                  key={r.no}
                  style={{
                    display: "grid",
                    gridTemplateColumns: "70px 140px 140px 1fr 1fr 150px",
                    padding: "16px 20px",
                    fontSize: 14,
                    alignItems: "center",
                    borderBottom: idx < rows.length - 1 ? "1px solid #F3F4F6" : "none",
                    backgroundColor: idx % 2 === 0 ? "#FFFFFF" : "#FAFBFC",
                    transition: "background-color 0.2s",
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.backgroundColor = "#F3F4F6"}
                  onMouseLeave={(e) => e.currentTarget.style.backgroundColor = idx % 2 === 0 ? "#FFFFFF" : "#FAFBFC"}
                >
                  <div style={{ textAlign: "center", color: "#6B7280", fontWeight: "700" }}>{r.no}</div>
                  <div style={{ textAlign: "center", color: "#374151", fontWeight: "700" }}>{r.tanggal}</div>
                  <div style={{ textAlign: "center", color: "#374151", fontWeight: "700" }}>{r.jam}</div>
                  <div style={{ color: "#111827", fontWeight: "800" }}>{r.mapel}</div>
                  <div style={{ color: "#374151", fontWeight: "600" }}>{r.guru}</div>
                  <div style={{ display: "flex", justifyContent: "center" }}>
                    <StatusButton status={r.status} row={r} />
                  </div>
                </div>
              ))}
            </div>

            <div
              style={{
                marginTop: 24,
                padding: "20px",
                backgroundColor: "#F8FAFC",
                borderRadius: "10px",
                border: "2px solid #E2E8F0",
                textAlign: "center",
                boxShadow: "0 2px 8px rgba(0, 0, 0, 0.05)",
              }}
            >
              <div style={{
                fontSize: "16px",
                fontWeight: 900,
                color: "#6B7280",
                marginBottom: "8px",
              }}>
                Total Data Ketidakhadiran
              </div>
              <div style={{
                fontSize: "36px",
                fontWeight: 900,
                color: "#062A4A",
              }}>
                {rows.length}
              </div>
            </div>
          </>
        )
        }
      </WalikelasLayout >

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)}>
        {selectedRecord && (
          <div style={{
            backgroundColor: "#FFFFFF",
            borderRadius: "16px",
            width: "100%",
            maxWidth: "480px",
            boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.25)",
            overflow: "hidden",
            maxHeight: "90vh",
            display: "flex",
            flexDirection: "column",
          }}>
            <div style={{
              backgroundColor: "#062A4A",
              padding: "20px 24px",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              color: "#FFFFFF",
            }}>
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <Eye size={24} />
                <h3 style={{
                  margin: 0,
                  fontSize: "20px",
                  fontWeight: 900,
                  letterSpacing: '0.5px'
                }}>
                  Detail Ketidakhadiran
                </h3>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                style={{
                  background: "rgba(255,255,255,0.1)",
                  border: "none",
                  cursor: "pointer",
                  color: "#FFFFFF",
                  width: 32,
                  height: 32,
                  borderRadius: '50%',
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontWeight: 700,
                  transition: 'all 0.2s'
                }}
                onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.2)'}
                onMouseLeave={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.1)'}
              >
                ✕
              </button>
            </div>

            <div style={{
              padding: "24px",
              overflowY: "auto",
              flex: 1,
            }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <DetailRow label="Tanggal" value={selectedRecord.tanggal} />
                <DetailRow label="Jam Pelajaran" value={selectedRecord.jam} />
                <DetailRow label="Mata Pelajaran" value={selectedRecord.mapel} />
                <DetailRow label="Nama Guru" value={selectedRecord.guru} />
                
                <div style={{
                  display: "flex",
                  justifyContent: "space-between",
                  paddingBottom: 12,
                  borderBottom: "1px solid #E5E7EB",
                  alignItems: 'center'
                }}>
                  <div style={{ fontWeight: 800, color: "#374151" }}>Status :</div>
                  <div style={{ 
                    padding: '4px 16px', 
                    borderRadius: '20px', 
                    backgroundColor: selectedRecord.status === 'Alfa' ? '#FEE2E2' : '#EFF6FF',
                    color: selectedRecord.status === 'Alfa' ? '#B91C1C' : '#1E40AF',
                    fontWeight: 800,
                    fontSize: '13px'
                  }}>
                    {selectedRecord.status}
                  </div>
                </div>

                <div style={{ marginTop: 8 }}>
                  <label style={{
                    display: "block",
                    fontSize: 14,
                    fontWeight: 800,
                    color: "#374151",
                    marginBottom: 8,
                  }}>
                    Keterangan :
                  </label>
                  <textarea
                    value={editableReason}
                    onChange={(e) => setEditableReason(e.target.value)}
                    placeholder="Masukkan keterangan (opsional)..."
                    style={{
                      width: "100%",
                      minHeight: "100px",
                      padding: "12px 16px",
                      backgroundColor: "#F9FAFB",
                      borderRadius: 10,
                      border: "2px solid #E5E7EB",
                      fontSize: 14,
                      color: "#374151",
                      fontWeight: 600,
                      resize: "vertical",
                      outline: 'none',
                      transition: 'border-color 0.2s'
                    }}
                    onFocus={(e) => e.target.style.borderColor = '#062A4A'}
                    onBlur={(e) => e.target.style.borderColor = '#E5E7EB'}
                  />
                </div>

                <div style={{ marginTop: 8 }}>
                  <label style={{
                    display: "block",
                    fontSize: 14,
                    fontWeight: 800,
                    color: "#374151",
                    marginBottom: 8,
                  }}>
                    Bukti Foto :
                  </label>

                  {selectedRecord.bukti ? (
                    <div style={{
                      borderRadius: 12,
                      overflow: "hidden",
                      border: "2px solid #E5E7EB",
                      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                    }}>
                      <img
                        src={selectedRecord.bukti}
                        alt="Bukti Kehadiran"
                        style={{ width: "100%", height: "auto", display: "block" }}
                      />
                    </div>
                  ) : (
                    <div style={{
                      padding: "32px 16px",
                      backgroundColor: "#F9FAFB",
                      borderRadius: 10,
                      border: "2px dashed #D1D5DB",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}>
                      <p style={{
                        margin: 0,
                        fontSize: 13,
                        color: "#9CA3AF",
                        textAlign: "center",
                        fontWeight: 600,
                      }}>
                        Tidak ada bukti foto yang diunggah
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div style={{
              padding: "20px 24px",
              backgroundColor: "#F9FAFB",
              borderTop: "1px solid #E5E7EB",
              display: "flex",
              gap: 12
            }}>
              <button
                onClick={() => setIsModalOpen(false)}
                style={{
                  flex: 1,
                  padding: "12px",
                  backgroundColor: "#FFFFFF",
                  color: "#374151",
                  border: "2px solid #E5E7EB",
                  borderRadius: 10,
                  fontWeight: 700,
                  cursor: "pointer",
                  fontSize: 14,
                  transition: 'all 0.2s'
                }}
                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#F3F4F6'}
                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#FFFFFF'}
              >
                Batal
              </button>
              <button
                onClick={handleUpdateAttendance}
                disabled={isUpdatingReason}
                style={{
                  flex: 2,
                  padding: "12px",
                  backgroundColor: "#062A4A",
                  color: "white",
                  border: "none",
                  borderRadius: 10,
                  fontWeight: 700,
                  cursor: "pointer",
                  fontSize: 14,
                  opacity: isUpdatingReason ? 0.7 : 1,
                  boxShadow: '0 4px 6px -1px rgba(6, 42, 74, 0.2)',
                  transition: 'all 0.2s'
                }}
                onMouseEnter={(e) => {
                  if(!isUpdatingReason) {
                    e.currentTarget.style.backgroundColor = '#051A2F';
                    e.currentTarget.style.transform = 'translateY(-1px)';
                  }
                }}
                onMouseLeave={(e) => {
                  if(!isUpdatingReason) {
                    e.currentTarget.style.backgroundColor = '#062A4A';
                    e.currentTarget.style.transform = 'translateY(0)';
                  }
                }}
              >
                {isUpdatingReason ? "Menyimpan..." : "Simpan Perubahan"}
              </button>
            </div>
          </div>
        )}
      </Modal>
    </>
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
      <div style={{ fontWeight: 800, color: "#374151" }}>{label} :</div>
      <div style={{ fontWeight: 700, color: "#1F2937" }}>
        {value}
      </div>
    </div>
  );
}
