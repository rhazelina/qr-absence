import { useState, useEffect } from 'react';
import WalikelasLayout from '../../component/Walikelas/layoutwakel';
import CalendarIcon from '../../assets/Icon/calender.png';
import { Modal } from '../../component/Shared/Modal';
import { usePopup } from "../../component/Shared/Popup/PopupProvider";

interface InputAbsenWalikelasProps {
  user: { name: string; role: string };
  onLogout: () => void;
  currentPage: string;
  onMenuClick: (page: string) => void;
}

interface Siswa {
  id: string;
  nisn: string;
  nama: string;
  status: 'hadir' | 'sakit' | 'izin' | 'alpha' | 'pulang' | null;
  keterangan?: string;
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



export function InputAbsenWalikelas({
  user,
  onLogout,
  currentPage,
  onMenuClick,
}: InputAbsenWalikelasProps) {
  const { alert: popupAlert } = usePopup();
  const [selectedKelas, setSelectedKelas] = useState('Memuat...');
  const [selectedMapel] = useState('Wali Kelas');
  const [currentDate, setCurrentDate] = useState(() => {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  });

  const [siswaList, setSiswaList] = useState<Siswa[]>([]);

  const [classId, setClassId] = useState<number | null>(null);
  const [scheduleId, setScheduleId] = useState<number | null>(null);

  // Initial Fetch: Homeroom Info
  useEffect(() => {
    const fetchHomeroom = async () => {
      try {
        const { dashboardService } = await import('../../services/dashboard');
        const myClass = await dashboardService.getMyHomeroom();
        if (myClass) {
          setSelectedKelas(myClass.name || 'Kelas Saya');
          setClassId(myClass.id);
        }
      } catch (e) {
        console.error("Failed to fetch homeroom", e);
      }
    };
    fetchHomeroom();
  }, [popupAlert]);

  // Fetch Students & Attendance logic
  useEffect(() => {
    if (!classId) return;

    const fetchData = async () => {

      try {
        const { attendanceService } = await import('../../services/attendance');
        const { dashboardService } = await import('../../services/dashboard');

        // 1. Get Schedules for today
        const schedules = await dashboardService.getMyHomeroomSchedules();
        if (schedules && schedules.length > 0) {
          setScheduleId(schedules[0].id);
        }

        // 2. Get Students Summary (includes generic student info)
        const studentSummaryRes = await attendanceService.getClassStudentsSummary(classId);
        const rawStudents = studentSummaryRes.data.data || studentSummaryRes.data;

        // 3. Get existing attendance for this date
        const attResponse = await attendanceService.getClassAttendanceByDate(classId, currentDate);
        const attendanceRecords = attResponse.data.data || attResponse.data || [];

        const mapped: Siswa[] = rawStudents.map((s: any) => {
          const record = attendanceRecords.find((r: any) => r.student_id === s.id);

          // Map backend status to frontend
          let status: Siswa['status'] = null;
          if (record) {
            switch (record.status) {
              case 'present': status = 'hadir'; break;
              case 'sick': status = 'sakit'; break;
              case 'permission':
              case 'izin': status = 'izin'; break;
              case 'absent': status = 'alpha'; break;
              case 'late': status = 'hadir'; break;
              case 'return':
              case 'pulang': status = 'pulang'; break;
              default: status = 'hadir';
            }
          }

          return {
            id: String(s.id),
            nisn: s.nisn,
            nama: s.user?.name || s.name || '-',
            status: status,
            keterangan: record?.reason || ''
          };
        });

        setSiswaList(mapped);

      } catch (e) {
        console.error(e);
        void popupAlert("Gagal memuat data siswa");
      } finally {

      }
    };
    fetchData();
  }, [classId, currentDate, popupAlert]);

  const [selectedSiswa, setSelectedSiswa] = useState<Siswa | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editStatus, setEditStatus] = useState<'hadir' | 'sakit' | 'izin' | 'alpha' | 'pulang' | null>(null);
  const [editKeterangan, setEditKeterangan] = useState('');

  const handleStatusChange = (id: string, status: Siswa['status']) => {
    setSiswaList(siswaList.map((s) => (s.id === id ? { ...s, status } : s)));
  };

  const handleStatusClick = (siswa: Siswa, e: React.MouseEvent) => {
    e.stopPropagation();
    // if (siswa.status === null) return; // Allow opening even if null to set status

    setSelectedSiswa(siswa);
    setEditStatus(siswa.status || 'hadir'); // Default to 'hadir' if modifying
    setEditKeterangan(siswa.keterangan || '');
    setIsModalOpen(true);
  };

  const handleSaveEdit = () => {
    if (!selectedSiswa || !editStatus) return;

    setSiswaList(siswaList.map(s =>
      s.id === selectedSiswa.id
        ? {
          ...s,
          status: editStatus,
          keterangan: editKeterangan
        }
        : s
    ));

    setIsModalOpen(false);
    setSelectedSiswa(null);
    setEditKeterangan('');
  };

  const handleSimpan = async () => {
    const siswaWithStatus = siswaList.filter((s) => s.status !== null);
    if (siswaWithStatus.length === 0) {
      await popupAlert("Pilih status untuk minimal satu siswa!");
      return;
    }

    // Usually we try to use the derived scheduleId, or fallback
    const finalScheduleId = scheduleId || 1;

    try {
      const { attendanceService } = await import('../../services/attendance');
      const { STATUS_FRONTEND_TO_BACKEND } = await import('../../utils/statusMapping');

      // Loop through and save each
      const promises = siswaWithStatus.map(s => {
        const backendStatus = STATUS_FRONTEND_TO_BACKEND[s.status!] || 'present';

        let reason = s.keterangan;
        // Basic mapping for returning home/pulang
        if (s.status === 'pulang') {
          // Check if 'pulang' is valid backend status, else map to 'izin' or similar
          // Assuming for now it maps to 'return' or handled by backend logic
          if (!reason) reason = 'Pulang';
        }

        return attendanceService.createManualAttendance({
          attendee_type: 'student',
          student_id: parseInt(s.id),
          schedule_id: finalScheduleId,
          status: backendStatus,
          date: currentDate,
          reason: reason
        });
      });

      await Promise.all(promises);
      await popupAlert(`Data kehadiran berhasil disimpan untuk ${siswaWithStatus.length} siswa!`);
      // onMenuClick('Beranda'); 

    } catch (e: any) {
      console.error(e);
      await popupAlert(`Gagal menyimpan: ${e.response?.data?.message || e.message}`);
    }
  };

  // Warna sesuai permintaan
  const statusColors = {
    hadir: '#1FA83D',
    izin: '#ACA40D',
    pulang: '#2F85EB',
    alpha: '#D90000',
    sakit: '#520C8F',
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case "alpha":
        return "Siswa tidak hadir tanpa keterangan";
      case "izin":
        return "Siswa izin dengan keterangan";
      case "sakit":
        return "Siswa sakit dengan surat dokter";
      case "hadir":
        return "Siswa hadir tepat waktu";
      case "pulang":
        return "Siswa pulang lebih awal karena ada kepentingan";
      default:
        return status;
    }
  };

  // Custom Status Renderer - merged styling
  const StatusButton = ({ siswa }: { siswa: Siswa }) => {
    if (!siswa.status) {
      return <span style={{ color: '#9CA3AF', fontSize: '12px' }}>-</span>;
    }

    const statusConfig = {
      hadir: { label: 'Hadir', color: statusColors.hadir, textColor: '#FFFFFF' },
      sakit: { label: 'Sakit', color: statusColors.sakit, textColor: '#FFFFFF' },
      izin: { label: 'Izin', color: statusColors.izin, textColor: '#FFFFFF' },
      alpha: { label: 'Tidak Hadir', color: statusColors.alpha, textColor: '#FFFFFF' },
      pulang: { label: 'Pulang', color: statusColors.pulang, textColor: '#FFFFFF' },
    };

    const config = statusConfig[siswa.status];

    return (
      <div
        onClick={(e) => handleStatusClick(siswa, e)}
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
          color: config.textColor,
          backgroundColor: config.color,
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
        <EyeIcon size={14} />
        <span>{config.label}</span>
      </div>
    );
  };

  // Fungsi helper untuk DetailRow di modal
  function DetailRow({ label, value, icon }: { label: string; value: string; icon?: React.ReactNode }) {
    return (
      <div style={{
        display: "flex",
        justifyContent: "space-between",
        marginBottom: 16,
        paddingBottom: 12,
        borderBottom: "1px solid #E5E7EB",
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          {icon}
          <div style={{ fontWeight: 600, color: "#374151" }}>{label} :</div>
        </div>
        <div style={{ fontWeight: 500, color: "#1F2937", textAlign: 'right' }}>
          {value}
        </div>
      </div>
    );
  }

  return (
    <>
      <WalikelasLayout
        pageTitle="Input Kehadiran Siswa"
        currentPage={currentPage as any}
        onMenuClick={onMenuClick}
        user={user}
        onLogout={onLogout}
      >
        <div style={{ position: 'relative', zIndex: 2 }}>

          {/* Top Section: Date & Class Info + Save Button */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 20 }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {/* Date Badge */}
              <div style={{
                display: 'inline-flex',
                alignItems: 'center',
                backgroundColor: '#FFFFFF',
                color: '#64748B',
                padding: '6px 12px',
                borderRadius: '100px',
                fontSize: '12px',
                fontWeight: 600,
                width: 'fit-content',
                border: '1px solid #E2E8F0',
                boxShadow: '0 1px 2px rgba(0,0,0,0.05)',
                position: 'relative',
                cursor: 'pointer'
              }}>
                <input
                  type="date"
                  value={currentDate}
                  onChange={(e) => setCurrentDate(e.target.value)}
                  style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    width: '100%',
                    height: '100%',
                    opacity: 0,
                    cursor: 'pointer'
                  }}
                />
                <img src={CalendarIcon} alt="Date" style={{ width: 14, height: 14, marginRight: 6, opacity: 0.7 }} />
                {currentDate.split('-').reverse().join('-')}
              </div>

              {/* Class Info Card */}
              <div style={{
                background: 'linear-gradient(135deg, #1E293B 0%, #0F172A 100%)',
                color: 'white',
                padding: '16px 24px',
                borderRadius: '12px',
                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                minWidth: '240px',
                position: 'relative',
                overflow: 'hidden'
              }}>
                <div style={{
                  position: 'absolute',
                  top: 0,
                  right: 0,
                  width: '50px',
                  height: '50px',
                  background: 'rgba(255,255,255,0.05)',
                  borderRadius: '0 0 0 100%'
                }} />
                <div style={{ fontSize: '18px', fontWeight: '700', marginBottom: 4, letterSpacing: '-0.025em' }}>{selectedKelas}</div>
                <div style={{ fontSize: '13px', opacity: 0.8, fontWeight: 500 }}>{selectedMapel}</div>
              </div>
            </div>

            {/* Simpan Button */}
            <button
              onClick={handleSimpan}
              style={{
                background: 'linear-gradient(to right, #2563EB, #1D4ED8)',
                color: 'white',
                padding: '10px 24px',
                borderRadius: '8px',
                fontSize: '14px',
                fontWeight: '600',
                border: 'none',
                cursor: 'pointer',
                boxShadow: '0 4px 6px -1px rgba(37, 99, 235, 0.3)',
                transition: 'all 0.2s ease',
                height: 'fit-content',
                marginBottom: '2px'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-1px)';
                e.currentTarget.style.boxShadow = '0 6px 8px -1px rgba(37, 99, 235, 0.4)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 4px 6px -1px rgba(37, 99, 235, 0.3)';
              }}
            >
              Simpan
            </button>
          </div>

          {/* Table */}
          <div
            style={{
              backgroundColor: '#FFFFFF',
              borderRadius: '12px',
              boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
              overflow: 'hidden',
              border: '1px solid #E5E7EB',
              marginBottom: '24px',
            }}
          >
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '800px' }}>
                <thead>
                  <tr style={{ backgroundColor: '#F9FAFB', borderBottom: '2px solid #E5E7EB' }}>
                    <th style={{ padding: '16px', textAlign: 'left', fontSize: '14px', fontWeight: '700', color: '#111827', letterSpacing: '0.5px' }}>No</th>
                    <th style={{ padding: '16px', textAlign: 'left', fontSize: '14px', fontWeight: '700', color: '#111827', letterSpacing: '0.5px' }}>NISN</th>
                    <th style={{ padding: '16px', textAlign: 'left', fontSize: '14px', fontWeight: '700', color: '#111827', letterSpacing: '0.5px' }}>Nama Siswa</th>
                    <th style={{ padding: '16px', textAlign: 'center', fontSize: '14px', fontWeight: '700', color: '#111827', letterSpacing: '0.5px', width: '80px' }}>Hadir</th>
                    <th style={{ padding: '16px', textAlign: 'center', fontSize: '14px', fontWeight: '700', color: '#111827', letterSpacing: '0.5px', width: '80px' }}>Sakit</th>
                    <th style={{ padding: '16px', textAlign: 'center', fontSize: '14px', fontWeight: '700', color: '#111827', letterSpacing: '0.5px', width: '80px' }}>Izin</th>
                    <th style={{ padding: '16px', textAlign: 'center', fontSize: '14px', fontWeight: '700', color: '#111827', letterSpacing: '0.5px', width: '90px' }}>Tidak Hadir</th>
                    <th style={{ padding: '16px', textAlign: 'center', fontSize: '14px', fontWeight: '700', color: '#111827', letterSpacing: '0.5px', width: '80px' }}>Pulang</th>
                    <th style={{ padding: '16px', textAlign: 'center', fontSize: '14px', fontWeight: '700', color: '#111827', letterSpacing: '0.5px', width: '120px' }}>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {siswaList.map((siswa, idx) => (
                    <tr
                      key={siswa.id}
                      style={{
                        borderBottom: '1px solid #F3F4F6',
                        transition: 'background-color 0.2s',
                        backgroundColor: idx % 2 === 0 ? '#FFFFFF' : '#F9FAFB',
                      }}
                      onMouseEnter={(e) => { (e.currentTarget as HTMLTableRowElement).style.backgroundColor = '#F3F4F6'; }}
                      onMouseLeave={(e) => { (e.currentTarget as HTMLTableRowElement).style.backgroundColor = idx % 2 === 0 ? '#FFFFFF' : '#F9FAFB'; }}
                    >
                      <td style={{ padding: '16px', fontSize: '14px', color: '#111827', fontWeight: '500' }}>{idx + 1}</td>
                      <td style={{ padding: '16px', fontSize: '14px', color: '#374151', fontWeight: '400' }}>{siswa.nisn}</td>
                      <td style={{ padding: '16px', fontSize: '14px', color: '#111827', fontWeight: '500' }}>{siswa.nama}</td>

                      {/* Radio Button Hadir */}
                      <td style={{ padding: '16px', textAlign: 'center' }}>
                        <input
                          type="radio"
                          name={`status-${siswa.id}`}
                          checked={siswa.status === 'hadir'}
                          onChange={() => handleStatusChange(siswa.id, 'hadir')}
                          style={{
                            width: '18px',
                            height: '18px',
                            cursor: 'pointer',
                            accentColor: statusColors.hadir,
                            border: '2px solid #D1D5DB',
                            borderRadius: '50%',
                          }}
                        />
                      </td>

                      {/* Radio Button Sakit */}
                      <td style={{ padding: '16px', textAlign: 'center' }}>
                        <input
                          type="radio"
                          name={`status-${siswa.id}`}
                          checked={siswa.status === 'sakit'}
                          onChange={() => handleStatusChange(siswa.id, 'sakit')}
                          style={{
                            width: '18px',
                            height: '18px',
                            cursor: 'pointer',
                            accentColor: statusColors.sakit,
                            border: '2px solid #D1D5DB',
                            borderRadius: '50%',
                          }}
                        />
                      </td>

                      {/* Radio Button Izin */}
                      <td style={{ padding: '16px', textAlign: 'center' }}>
                        <input
                          type="radio"
                          name={`status-${siswa.id}`}
                          checked={siswa.status === 'izin'}
                          onChange={() => handleStatusChange(siswa.id, 'izin')}
                          style={{
                            width: '18px',
                            height: '18px',
                            cursor: 'pointer',
                            accentColor: statusColors.izin,
                            border: '2px solid #D1D5DB',
                            borderRadius: '50%',
                          }}
                        />
                      </td>

                      {/* Radio Button Tidak Hadir (Alpha) */}
                      <td style={{ padding: '16px', textAlign: 'center' }}>
                        <input
                          type="radio"
                          name={`status-${siswa.id}`}
                          checked={siswa.status === 'alpha'}
                          onChange={() => handleStatusChange(siswa.id, 'alpha')}
                          style={{
                            width: '18px',
                            height: '18px',
                            cursor: 'pointer',
                            accentColor: statusColors.alpha,
                            border: '2px solid #D1D5DB',
                            borderRadius: '50%',
                          }}
                        />
                      </td>

                      {/* Radio Button Pulang */}
                      <td style={{ padding: '16px', textAlign: 'center' }}>
                        <input
                          type="radio"
                          name={`status-${siswa.id}`}
                          checked={siswa.status === 'pulang'}
                          onChange={() => handleStatusChange(siswa.id, 'pulang')}
                          style={{
                            width: '18px',
                            height: '18px',
                            cursor: 'pointer',
                            accentColor: statusColors.pulang,
                            border: '2px solid #D1D5DB',
                            borderRadius: '50%',
                          }}
                        />
                      </td>

                      {/* Kolom Status */}
                      <td style={{ padding: '16px', textAlign: 'center' }}>
                        <StatusButton siswa={siswa} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

        </div>
      </WalikelasLayout>

      {/* Modal Edit Status (With Merging Style) */}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)}>
        {selectedSiswa && editStatus && (
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
                  {editStatus === 'hadir' ? 'Detail Kehadiran' : 'Edit Status Kehadiran'}
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
              <DetailRow label="Nama Siswa" value={selectedSiswa.nama} />

              {/* Row NISN */}
              <DetailRow label="NISN" value={selectedSiswa.nisn} />

              {/* Status Display */}
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
                    backgroundColor: statusColors[editStatus],
                    color: "#FFFFFF",
                    padding: "4px 16px",
                    borderRadius: 6,
                    fontSize: 13,
                    fontWeight: 600,
                  }}>
                    {editStatus === 'alpha' ? 'Tidak Hadir' :
                      editStatus === 'pulang' ? 'Pulang' :
                        editStatus.charAt(0).toUpperCase() + editStatus.slice(1)}
                  </span>
                </div>
              </div>

              {/* Info Box */}
              <div style={{
                backgroundColor: "#EFF6FF",
                border: "1px solid #BFDBFE",
                borderRadius: 8,
                padding: 16,
                textAlign: "center",
                marginBottom: 24,
              }}>
                <div style={{
                  fontSize: 14,
                  fontWeight: 600,
                  color: "#1E40AF",
                }}>
                  {getStatusText(editStatus)}
                </div>
              </div>

              {/* Keterangan Input untuk SEMUA status */}
              <div>
                <div style={{
                  fontSize: 14,
                  fontWeight: 600,
                  color: "#374151",
                  marginBottom: 12,
                }}>
                  Keterangan {editStatus !== 'hadir' ? '(Opsional)' : '(Opsional)'} :
                </div>
                <textarea
                  value={editKeterangan}
                  onChange={(e) => setEditKeterangan(e.target.value)}
                  placeholder={
                    editStatus === 'hadir' ? "Contoh: Hadir tepat waktu, aktif dalam pembelajaran..." :
                      editStatus === 'izin' ? "Contoh: Menghadiri acara keluarga, izin dokter..." :
                        editStatus === 'sakit' ? "Contoh: Demam tinggi, flu berat..." :
                          editStatus === 'pulang' ? "Contoh: Sakit perut, ada keperluan mendadak..." :
                            "Alasan tidak hadir..."
                  }
                  style={{
                    width: "100%",
                    padding: "12px 16px",
                    backgroundColor: "#F9FAFB",
                    borderRadius: 8,
                    border: "1px solid #E5E7EB",
                    fontSize: 14,
                    color: "#6B7280",
                    lineHeight: 1.5,
                    resize: "vertical",
                    minHeight: "80px",
                    fontFamily: "inherit",
                  }}
                />
                <div style={{
                  fontSize: 12,
                  color: "#9CA3AF",
                  marginTop: 4,
                  marginBottom: 24,
                }}>
                  *Keterangan akan tersimpan dalam catatan kehadiran
                </div>
              </div>

              {/* Status Selection (hanya untuk edit selain view) */}

              {editStatus !== 'hadir' && (
                <div style={{
                  marginBottom: 24,
                  paddingBottom: 12,
                  borderBottom: "1px solid #E5E7EB",
                }}>
                  <div style={{
                    fontWeight: 600,
                    color: "#374151",
                    marginBottom: 12
                  }}>
                    Ubah Status :
                  </div>
                  <div style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(2, 1fr)",
                    gap: "10px",
                  }}>
                    {(['hadir', 'sakit', 'izin', 'alpha', 'pulang'] as const).map((status) => (
                      <button
                        key={status}
                        onClick={() => setEditStatus(status)}
                        style={{
                          padding: "10px",
                          borderRadius: "6px",
                          border: `2px solid ${editStatus === status ? statusColors[status] : '#E5E7EB'}`,
                          backgroundColor: editStatus === status ? `${statusColors[status]}20` : '#FFFFFF',
                          color: editStatus === status ? statusColors[status] : '#374151',
                          fontSize: "14px",
                          fontWeight: 600,
                          cursor: "pointer",
                          transition: "all 0.2s",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                        }}
                      >
                        <div style={{
                          width: "12px",
                          height: "12px",
                          borderRadius: "50%",
                          backgroundColor: editStatus === status ? statusColors[status] : '#D1D5DB',
                          marginRight: "8px",
                        }} />
                        {status === 'alpha' ? 'Tidak Hadir' :
                          status === 'pulang' ? 'Pulang' :
                            status.charAt(0).toUpperCase() + status.slice(1)}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div style={{
                display: "flex",
                gap: "12px",
                marginTop: 24,
              }}>
                <button
                  onClick={handleSaveEdit}
                  style={{
                    flex: 1,
                    padding: "12px",
                    borderRadius: "8px",
                    border: "none",
                    backgroundColor: statusColors[editStatus] || "#2563EB",
                    color: "#FFFFFF",
                    fontSize: "14px",
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
                  Simpan Perubahan
                </button>
              </div>
            </div>
          </div>
        )}
      </Modal>
    </>
  );
}
