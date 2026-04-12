import { useState, useEffect } from 'react';
import GuruLayout from '../../component/Guru/GuruLayout';
import CalendarIcon from '../../assets/Icon/calender.png';
import EditIcon from '../../assets/Icon/Edit.png';
import ChalkboardIcon from '../../assets/Icon/Chalkboard.png';

import { attendanceService } from '../../services/attendanceService';
// STATUS COLOR PALETTE - High Contrast for Accessibility
const STATUS_COLORS = {
  hadir: '#1FA83D',   // HIJAU - Hadir
  izin: '#ACA40D',    // KUNING - Izin
  sakit: '#520C8F',   // UNGU - Sakit
  alfa: '#D90000',   // MERAH - Tidak Hadir
  pulang: '#2F85EB',  // BIRU - Pulang
  dispen: '#E45A92',  // PINK - Dispen
  unknown: '#9CA3AF'
};

interface KehadiranSiswaGuruProps {
  user: { name: string; role: string };
  onLogout: () => void;
  currentPage: string;
  onMenuClick: (page: string) => void;
  schedule?: any; // The schedule object passed from Dashboard
}

interface SiswaData {
  id: string; // student_id
  nisn: string;
  nama: string;
  mapel: string;
  status: 'hadir' | 'izin' | 'sakit' | 'alfa' | 'pulang' | 'dispen' | 'unknown';
  keterangan?: string;
  tanggal?: string;
  jamPelajaran?: string;
  guru?: string;
  waktuHadir?: string;
  suratPulang?: File | null;
  attendance_id?: string; // ID of the attendance record if exists
}

function KehadiranSiswaGuru({
  user,
  onLogout,
  currentPage,
  onMenuClick,
  schedule
}: KehadiranSiswaGuruProps) {
  const [currentDate, setCurrentDate] = useState('');
  const [siswaList, setSiswaList] = useState<SiswaData[]>([]);
  const [loading, setLoading] = useState(false);
  const [isClosingSession, setIsClosingSession] = useState(false);
  const [pageError, setPageError] = useState<string | null>(null);
  const [pageSuccess, setPageSuccess] = useState<string | null>(null);

  const [editingSiswa, setEditingSiswa] = useState<SiswaData | null>(null);
  const [editReason, setEditReason] = useState('');
  const [isSavingStatus, setIsSavingStatus] = useState(false);
  const [selectedSiswa, setSelectedSiswa] = useState<SiswaData | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);

  // Initialize date
  useEffect(() => {
    const now = new Date();
    const options: Intl.DateTimeFormatOptions = { day: 'numeric', month: 'long', year: 'numeric' };
    setCurrentDate(now.toLocaleDateString('id-ID', options));
  }, []);

  // Fetch Students for Schedule
  useEffect(() => {
    if (schedule?.id) {
      fetchStudents(schedule.id);
    }
  }, [schedule]);

  const fetchStudents = async (scheduleId: string) => {
    setLoading(true);
    setPageError(null);
    try {
      const data = await attendanceService.getScheduleStudents(scheduleId);
      const students = Array.isArray(data?.students)
        ? data.students
        : Array.isArray(data?.eligible_students)
          ? data.eligible_students
          : (Array.isArray(data?.data) ? data.data : []);

      // Map backend data to frontend interface
      // Backend returns list of students with 'attendance' relation if exists
      const mappedStudents = students.map((s: any) => {
        const att = s.attendance || s.latest_attendance || s.last_status_today; // The attendance record for today/session
        // Status mapping
        let status: SiswaData['status'] = 'unknown';
        if (att) {
          if (att.status === 'present') status = 'hadir';
          else if (att.status === 'late') status = 'hadir';
          else if (att.status === 'sick') status = 'sakit';
          else if (att.status === 'permission' || att.status === 'excused' || att.status === 'izin') status = 'izin';
          else if (att.status === 'alpha') status = 'alfa';
          else if (att.status === 'leave_early' || att.status === 'return') status = 'pulang';
          else if (att.status === 'dispensation' || att.status === 'dispen') status = 'dispen';
          else if (att.status === 'absent') status = 'alfa';
        } else {
          // If no attendance record yet, keep it unknown until teacher sets manual status.
          status = 'unknown';
        }

        return {
          id: String(s.id ?? s.student_id ?? ''),
          nisn: s.nisn || s.nis || '-',
          nama: s.name || s.user?.name || '-',
          mapel: schedule?.subject || '-',
          status: status,
          keterangan: att?.reason || att?.description || att?.notes || '',
          attendance_id: att?.id,
          guru: user.name,
          tanggal: currentDate,
          jamPelajaran: schedule?.jam || `${schedule?.startTime || '-'} - ${schedule?.endTime || '-'}`, // e.g. "07:00 - 08:30"
          waktuHadir: att?.checked_in_at ? String(att.checked_in_at).slice(11, 16) : (att?.time || undefined),
        };
      });
      setSiswaList(mappedStudents);
    } catch (error: any) {
      console.error("Error fetching students:", error);
      setPageError(error?.message || "Gagal memuat daftar siswa untuk jadwal ini.");
    } finally {
      setLoading(false);
    }
  };


  const handleEditClick = (siswa: SiswaData) => {
    setEditingSiswa(siswa);
    setEditReason(siswa.keterangan || '');
    setPageError(null);
    setPageSuccess(null);
  };

  const handleSaveStatus = async (newStatus: SiswaData['status']) => {
    if (!editingSiswa || !schedule?.id) return;
    setPageError(null);
    setPageSuccess(null);

    const leaveTypeMap: Record<string, string> = {
      izin: 'permission',
      sakit: 'sick',
      alfa: 'alpha',
      pulang: 'leave_early',
      dispen: 'dispensation',
    };

    try {
      setIsSavingStatus(true);

      if (newStatus === 'hadir') {
        await attendanceService.manualAttendance({
          schedule_id: Number(schedule.id),
          student_id: Number(editingSiswa.id),
          status: 'present',
          date: new Date().toISOString().split('T')[0],
          reason: editReason || undefined
        });
      } else {
        const leaveType = leaveTypeMap[newStatus];
        if (!leaveType) {
          setPageError('Status tidak didukung untuk input manual.');
          return;
        }
        await attendanceService.createStudentLeave(String(schedule.id), editingSiswa.id, {
          type: leaveType,
          reason: editReason || undefined
        });
      }

      setEditingSiswa(null);
      setEditReason('');
      setPageSuccess(`Status ${editingSiswa.nama} berhasil diperbarui.`);
      await fetchStudents(String(schedule.id));
    } catch (error: any) {
      console.error('Error updating status:', error);
      const messages = Array.isArray(error?.validationMessages) && error.validationMessages.length > 0
        ? error.validationMessages.join(', ')
        : (error?.message || "Gagal memperbarui status");
      setPageError(messages);
    } finally {
      setIsSavingStatus(false);
    }
  };

  const handleStatusClick = (siswa: SiswaData) => {
    setSelectedSiswa({ ...siswa });
    setIsDetailModalOpen(true);
  };

  const handleCloseSession = async () => {
    if (!schedule?.id) {
      alert("Pilih jadwal terlebih dahulu.");
      return;
    }

    if (!window.confirm("Tutup sesi ini? Setelah ditutup, siswa tidak bisa absen lagi.")) {
      return;
    }

    setIsClosingSession(true);
    setPageError(null);
    setPageSuccess(null);
    try {
      const response = await attendanceService.closeSchedule(schedule.id);
      setPageSuccess(response?.message || "Sesi berhasil ditutup.");
      await fetchStudents(schedule.id);
    } catch (error: any) {
      setPageError(error?.message || "Gagal menutup sesi.");
    } finally {
      setIsClosingSession(false);
    }
  };

  const getStatusText = (status: string, waktuHadir?: string) => {
    switch (status) {
      case "alfa": return "Siswa tidak hadir tanpa keterangan";
      case "izin": return "Siswa izin dengan keterangan";
      case "sakit": return "Siswa sakit dengan surat dokter";
      case "dispen": return "Siswa dispen lebih awal karena ada kepentingan";
      case "hadir":
        if (!waktuHadir) return "Siswa hadir";
        const [jam, menit] = waktuHadir.split(":").map(Number);
        if (jam > 7 || (jam === 7 && menit > 0)) return `Siswa hadir tetapi terlambat pada ${waktuHadir}`;
        return `Siswa hadir tepat waktu pada ${waktuHadir}`;
      case "pulang": return "Siswa pulang lebih awal karena ada kepentingan";
      default: return status;
    }
  };

  // Custom Status Renderer dengan icon mata untuk SEMUA STATUS
  const StatusButton = ({ status, siswa }: { status: string; siswa: SiswaData }) => {
    const color = STATUS_COLORS[status as keyof typeof STATUS_COLORS] || '#9CA3AF';
    const label = status === 'alfa' ? 'Alfa' : status.charAt(0).toUpperCase() + status.slice(1);

    return (
      <div
        onClick={() => handleStatusClick(siswa)}
        style={{
          backgroundColor: color,
          color: 'white',
          padding: '8px 20px',
          borderRadius: '50px',
          fontSize: '13px',
          fontWeight: '700',
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '6px',
          minWidth: '100px',
          textAlign: 'center',
          boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.2)',
          border: '1px solid rgba(255,255,255,0.2)',
          cursor: 'pointer',
          transition: 'all 0.2s',
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.opacity = '0.9';
          e.currentTarget.style.transform = 'translateY(-1px)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.opacity = '1';
          e.currentTarget.style.transform = 'translateY(0)';
        }}
      >
        <EyeIcon size={14} />
        <span>{label}</span>
      </div>
    );
  };

  const EyeIcon = ({ size = 16 }: { size?: number }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ display: 'inline-block', verticalAlign: 'middle' }}>
      <path d="M15 12C15 13.6569 13.6569 15 12 15C10.3431 15 9 13.6569 9 12C9 10.3431 10.3431 9 12 9C13.6569 9 15 10.3431 15 12Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M2 12C2 12 5 5 12 5C19 5 22 12 22 12C22 12 19 19 12 19C5 19 2 12 2 12Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );


  const TimeIcon = ({ size = 16 }: { size?: number }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ display: 'inline-block', verticalAlign: 'middle' }}>
      <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="2" />
      <path d="M12 7V12L15 15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );

  const DetailRow = ({ label, value, icon }: { label: string; value: string; icon?: React.ReactNode }) => (
    <div style={{ display: 'grid', gridTemplateColumns: '160px 20px 1fr', alignItems: 'center', marginBottom: 16, paddingBottom: 12, borderBottom: '1px solid #E5E7EB' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontWeight: 600, color: '#374151' }}>{icon}{label}</div>
      <div style={{ textAlign: 'center', fontWeight: 600 }}>:</div>
      <div style={{ fontWeight: 500, color: '#1F2937' }}>{value}</div>
    </div>
  );

  // Icon X untuk tombol close modal
  const XIcon = ({ size = 24 }: { size?: number }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ display: 'inline-block', verticalAlign: 'middle' }}>
      <path d="M18 6L6 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M6 6L18 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );

  return (
    <GuruLayout
      pageTitle="Kehadiran Siswa"
      currentPage={currentPage}
      onMenuClick={onMenuClick}
      user={user}
      onLogout={onLogout}
    >
      <div style={{ padding: '0 4px' }}>
        {pageSuccess && (
          <div style={{ marginBottom: 12, padding: '10px 12px', borderRadius: 10, backgroundColor: '#ECFDF5', color: '#065F46', border: '1px solid #A7F3D0', fontWeight: 700, fontSize: 13 }}>
            {pageSuccess}
          </div>
        )}
        {pageError && (
          <div style={{ marginBottom: 12, padding: '10px 12px', borderRadius: 10, backgroundColor: '#FEF2F2', color: '#991B1B', border: '1px solid #FECACA', fontWeight: 700, fontSize: 13 }}>
            {pageError}
          </div>
        )}

        {/* Top Info Section */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginBottom: '24px' }}>

          {/* Date Badge */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            backgroundColor: '#0F172A',
            color: 'white',
            padding: '10px 16px',
            borderRadius: '8px',
            width: 'fit-content',
            fontSize: '14px',
            fontWeight: '600',
            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
          }}>
            <img src={CalendarIcon} alt="Date" style={{ width: 18, height: 18, marginRight: 10, filter: 'brightness(0) invert(1)' }} />
            {currentDate}
          </div>

          {/* Class Info Card */}
          <div style={{
            backgroundColor: '#0F172A',
            color: 'white',
            padding: '16px 20px',
            borderRadius: '12px',
            width: 'fit-content',
            minWidth: '250px',
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)',
            position: 'relative',
            overflow: 'hidden'
          }}>
            <img src={ChalkboardIcon} alt="Class" style={{ width: 24, height: 24, filter: 'brightness(0) invert(1)', zIndex: 1 }} />
            <div style={{ zIndex: 1 }}>
              <div style={{ fontSize: '16px', fontWeight: '700' }}>{schedule?.className || 'Pilih Jadwal'}</div>
              <div style={{ fontSize: '13px', opacity: 0.8 }}>{schedule?.subject || '-'}</div>
            </div>
          </div>

          <button
            type="button"
            onClick={handleCloseSession}
            disabled={!schedule?.id || isClosingSession}
            style={{
              backgroundColor: !schedule?.id || isClosingSession ? '#9CA3AF' : '#DC2626',
              color: '#FFFFFF',
              border: 'none',
              borderRadius: '10px',
              padding: '10px 16px',
              fontWeight: 700,
              fontSize: '13px',
              cursor: !schedule?.id || isClosingSession ? 'not-allowed' : 'pointer',
              width: 'fit-content',
              boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
            }}
            title={!schedule?.id ? 'Pilih jadwal dulu' : 'Kunci absensi sesi ini'}
          >
            {isClosingSession ? 'Menutup Sesi...' : 'Tutup Sesi Absensi'}
          </button>
        </div>

        {/* Table Section */}
        <div style={{
          backgroundColor: 'white',
          borderRadius: '16px',
          overflow: 'hidden',
          boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
          border: '1px solid #E2E8F0'
        }}>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '800px' }}>
              <thead>
                <tr style={{ backgroundColor: '#1E293B', color: 'white' }}>
                  <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: '14px', fontWeight: '600' }}>No</th>
                  <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: '14px', fontWeight: '600' }}>NISN</th>
                  <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: '14px', fontWeight: '600' }}>Nama Siswa</th>
                  <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: '14px', fontWeight: '600' }}>Mata Pelajaran</th>
                  <th style={{ padding: '12px 16px', textAlign: 'center', fontSize: '14px', fontWeight: '600' }}>Status</th>
                  <th style={{ padding: '12px 16px', textAlign: 'center', fontSize: '14px', fontWeight: '600' }}>Aksi</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr><td colSpan={6} style={{ padding: 20, textAlign: 'center' }}>Memuat data siswa...</td></tr>
                ) : siswaList.length === 0 ? (
                  <tr><td colSpan={6} style={{ padding: 20, textAlign: 'center' }}>Tidak ada siswa dalam kelas ini (atau pilih jadwal terlebih dahulu).</td></tr>
                ) : (
                  siswaList.map((siswa, index) => (
                    <tr key={siswa.id} style={{
                      borderBottom: '1px solid #E2E8F0',
                      backgroundColor: index % 2 === 0 ? '#F8FAFC' : 'white'
                    }}>
                      <td style={{ padding: '12px 16px', fontSize: '14px' }}>{index + 1}.</td>
                      <td style={{ padding: '12px 16px', fontSize: '14px', fontFamily: 'monospace' }}>{siswa.nisn}</td>
                      <td style={{ padding: '12px 16px', fontSize: '14px', fontWeight: '600', color: '#111827' }}>{siswa.nama}</td>
                      <td style={{ padding: '12px 16px', fontSize: '14px' }}>{siswa.mapel}</td>
                      <td style={{ padding: '12px 16px', textAlign: 'center' }}>
                        <StatusButton status={siswa.status} siswa={siswa} />
                      </td>
                      <td style={{ padding: '12px 16px', textAlign: 'center' }}>
                        <button
                          onClick={() => handleEditClick(siswa)}
                          style={{
                            background: 'white',
                            border: '1px solid #CBD5E1',
                            borderRadius: '8px',
                            padding: '6px',
                            cursor: 'pointer',
                            display: 'inline-flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
                            transition: 'all 0.2s'
                          }}
                          onMouseOver={(e) => e.currentTarget.style.borderColor = '#3B82F6'}
                          onMouseOut={(e) => e.currentTarget.style.borderColor = '#CBD5E1'}
                        >
                          <img src={EditIcon} alt="Edit" style={{ width: 18, height: 18 }} />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

      </div>

      {/* Edit Status Modal */}
      {editingSiswa && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          backgroundColor: 'rgba(15, 23, 42, 0.6)', backdropFilter: 'blur(4px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 50
        }}>
          <div style={{
            backgroundColor: 'white', borderRadius: '16px', width: '90%', maxWidth: '400px',
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)', overflow: 'hidden'
          }}>
            {/* Header */}
            <div style={{
              padding: '20px 24px', borderBottom: '1px solid #F3F4F6',
              display: 'flex', justifyContent: 'space-between', alignItems: 'center'
            }}>
              <h3 style={{ fontSize: '18px', fontWeight: '700', color: '#111827', margin: 0 }}>
                Sunting Status Kehadiran
              </h3>
              <button onClick={() => setEditingSiswa(null)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
                <XIcon />
              </button>
            </div>

            {/* Content */}
            <div style={{ padding: '24px' }}>
              <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#6B7280', marginBottom: '8px' }}>NAMA SISWA</label>
                <div style={{ backgroundColor: '#F9FAFB', padding: '12px 16px', borderRadius: '8px', border: '1px solid #E5E7EB', fontWeight: '600' }}>
                  {editingSiswa.nama}
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#6B7280', marginBottom: '8px' }}>STATUS KEHADIRAN</label>
                <select
                  value={editingSiswa.status}
                  onChange={(e) => setEditingSiswa({ ...editingSiswa, status: e.target.value as SiswaData['status'] })}
                  style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #D1D5DB' }}
                >
                  <option value="hadir">Hadir</option>
                  <option value="izin">Izin</option>
                  <option value="sakit">Sakit</option>
                  <option value="alfa">Alfa</option>
                  <option value="pulang">Pulang</option>
                  <option value="dispen">Dispen</option>

                </select>
              </div>

              <div style={{ marginTop: '16px' }}>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#6B7280', marginBottom: '8px' }}>KETERANGAN (OPSIONAL)</label>
                <textarea
                  value={editReason}
                  onChange={(e) => setEditReason(e.target.value)}
                  rows={3}
                  placeholder="Tulis alasan jika diperlukan..."
                  style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #D1D5DB', resize: 'vertical' }}
                />
              </div>
            </div>

            {/* Footer */}
            <div style={{ padding: '20px 24px', backgroundColor: '#F9FAFB', display: 'flex', gap: '12px' }}>
              <button onClick={() => setEditingSiswa(null)} style={{ flex: 1, padding: '12px', borderRadius: '8px', border: '1px solid #D1D5DB', backgroundColor: 'white', fontWeight: '600', cursor: 'pointer' }}>
                Batal
              </button>
              <button
                onClick={() => handleSaveStatus(editingSiswa.status)}
                disabled={isSavingStatus}
                style={{ flex: 1, padding: '12px', borderRadius: '8px', border: 'none', backgroundColor: isSavingStatus ? '#93C5FD' : '#2563EB', color: 'white', fontWeight: '600', cursor: isSavingStatus ? 'not-allowed' : 'pointer' }}
              >
                {isSavingStatus ? 'Menyimpan...' : 'Simpan'}
              </button>
            </div>
          </div>
        </div>
      )}
      {/* Detail Status Modal - UNTUK SEMUA STATUS */}
      {isDetailModalOpen && selectedSiswa && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          backgroundColor: 'rgba(15, 23, 42, 0.6)', backdropFilter: 'blur(4px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 60
        }}>
          <div style={{
            backgroundColor: '#FFFFFF', borderRadius: '16px', width: '90%', maxWidth: '420px',
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)', overflow: 'hidden',
            maxHeight: '90vh', display: 'flex', flexDirection: 'column'
          }}>
            {/* Header Modal */}
            <div style={{
              background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)',
              padding: '16px 24px', display: 'flex', alignItems: 'center',
              justifyContent: 'space-between', color: '#FFFFFF'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <EyeIcon size={24} />
                <h3 style={{ margin: 0, fontSize: '18px', fontWeight: 800 }}>Detail Kehadiran</h3>
              </div>
              <button onClick={() => setIsDetailModalOpen(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#FFFFFF' }}>
                <XIcon size={24} />
              </button>
            </div>

            {/* Content */}
            <div style={{ padding: '24px', overflowY: 'auto', flex: 1 }}>
              <DetailRow label="Tanggal" value={selectedSiswa.tanggal || currentDate} icon={<TimeIcon size={18} />} />
              <DetailRow label="Nama Siswa" value={selectedSiswa.nama} />
              <DetailRow label="NISN" value={selectedSiswa.nisn} />
              <DetailRow label="Mata Pelajaran" value={selectedSiswa.mapel} />

              <DetailRow label="Jam Pelajaran" value={selectedSiswa.jamPelajaran || '-'} />
              <DetailRow label="Keterangan" value={selectedSiswa.keterangan || '-'} />

              <div style={{ marginTop: 20 }}>
                <div style={{ padding: '12px 16px', borderRadius: 12, backgroundColor: STATUS_COLORS[selectedSiswa.status as keyof typeof STATUS_COLORS] + '15', border: `1px solid ${STATUS_COLORS[selectedSiswa.status as keyof typeof STATUS_COLORS]}30`, display: 'flex', gap: 12, alignItems: 'center' }}>
                  <div style={{ width: 10, height: 10, borderRadius: '50%', backgroundColor: STATUS_COLORS[selectedSiswa.status as keyof typeof STATUS_COLORS] }}></div>
                  <div style={{ fontSize: 14, color: '#374151', fontWeight: 500 }}>{getStatusText(selectedSiswa.status, selectedSiswa.waktuHadir)}</div>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div style={{ padding: '20px 24px', backgroundColor: '#F9FAFB', borderTop: '1px solid #F3F4F6', display: 'flex', gap: 12 }}>
              <button onClick={() => setIsDetailModalOpen(false)} style={{ flex: 1, padding: '12px', borderRadius: 12, border: '1px solid #D1D5DB', backgroundColor: 'white', fontWeight: '700', cursor: 'pointer' }}>Tutup</button>
            </div>
          </div>
        </div>
      )}
    </GuruLayout>
  );
}

export default KehadiranSiswaGuru;
