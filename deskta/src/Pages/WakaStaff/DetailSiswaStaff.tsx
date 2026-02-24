import { useState, useEffect, useMemo } from 'react';
import StaffLayout from '../../component/WakaStaff/StaffLayout';
import { Select } from '../../component/Shared/Select';
import { Table } from '../../component/Shared/Table';
import { Download, FileText, ArrowLeft, Calendar as CalendarIcon, AlertCircle, Eye, X, User, Clock, Shield, BookOpen } from 'lucide-react';
import { jsPDF } from 'jspdf';
import 'jspdf-autotable';
import { attendanceService, type ClassAttendanceResponse } from '../../services/attendanceService';

interface DetailSiswaStaffProps {
  user: {
    name: string;
    role: string;
  };
  onLogout: () => void;
  currentPage: string;
  onMenuClick: (page: string, payload?: any) => void;
  selectedKelas: string;
  payload?: any; // Contains kelasId from JadwalKelasStaff
  onNavigateToRecap?: () => void;
  kelasId?: string;
  onBack?: () => void;
}

// Interface for table row data
interface AttendanceRow {
  no: number;
  nama: string;
  nisn: string;
  status: string;
  waktu: string;
}

export default function DetailSiswaStaff({
  user,
  onLogout,
  currentPage,
  onMenuClick,
  selectedKelas,
  payload,
  onNavigateToRecap,
  kelasId,
}: DetailSiswaStaffProps) {
  const resolvedKelasId = kelasId || payload?.kelasId || undefined;
  // State for data
  const [attendanceData, setAttendanceData] = useState<ClassAttendanceResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [dates, setDates] = useState<string[]>([]); // Array of date strings YYYY-MM-DD
  
  // State for filters
  const [selectedTanggal, setSelectedTanggal] = useState('');
  const [selectedMapel, setSelectedMapel] = useState('');
  const [currentGuru, setCurrentGuru] = useState('');
  
  // State for UI
  const [notification, setNotification] = useState<{
    type: 'error' | 'success';
    message: string;
  } | null>(null);

  // State for Detail Modal
  const [selectedRow, setSelectedRow] = useState<any>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);

  // Status Style Helpers
  const getStatusStyle = (status: string) => {
    const baseStyle: React.CSSProperties = {
      padding: "6px 16px",
      borderRadius: "20px",
      fontSize: "12px",
      fontWeight: "700",
      letterSpacing: "0.5px",
      border: "none",
      minWidth: "90px",
      textAlign: "center",
      display: "inline-flex",
      alignItems: "center",
      justifyContent: "center",
      gap: "6px",
      cursor: "pointer",
      transition: "all 0.2s ease",
      boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
      minHeight: "32px",
    };

    const s = status.toLowerCase();
    if (s === 'present' || s === 'hadir') return { ...baseStyle, backgroundColor: "#1FA83D", color: "#FFF", boxShadow: "0 2px 4px rgba(31, 168, 61, 0.3)" };
    if (s === 'permission' || s === 'izin') return { ...baseStyle, backgroundColor: "#ACA40D", color: "#FFF", boxShadow: "0 2px 4px rgba(172, 164, 13, 0.3)" };
    if (s === 'sick' || s === 'sakit') return { ...baseStyle, backgroundColor: "#520C8F", color: "#FFF", boxShadow: "0 2px 4px rgba(82, 12, 143, 0.3)" };
    if (s === 'alpha' || s === 'alpa' || s === 'tidak-hadir' || s === 'absent') return { ...baseStyle, backgroundColor: "#D90000", color: "#FFF", boxShadow: "0 2px 4px rgba(217, 0, 0, 0.3)" };
    if (s === 'pulang') return { ...baseStyle, backgroundColor: "#2F85EB", color: "#FFF", boxShadow: "0 2px 4px rgba(47, 133, 235, 0.3)" };
    
    return { ...baseStyle, backgroundColor: "#6B7280", color: "#FFF" };
  };

  const getStatusLabel = (status: string) => {
    const s = status.toLowerCase();
    if (s === 'present' || s === 'hadir') return "Hadir";
    if (s === 'permission' || s === 'izin') return "Izin";
    if (s === 'sick' || s === 'sakit') return "Sakit";
    if (s === 'alpha' || s === 'alpa' || s === 'tidak-hadir' || s === 'absent') return "Alfa";
  if (s === 'pulang') return "Pulang";
  return status;
};

// Internal components for clean UI
const DetailRow = ({ label, value, icon }: { label: string; value: string; icon?: React.ReactNode }) => (
  <div style={{ padding: '12px 16px', borderBottom: '1px solid #F3F4F6', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
      {icon && <div style={{ color: '#64748B' }}>{icon}</div>}
      <span style={{ fontSize: '13px', fontWeight: '600', color: '#64748B' }}>{label}</span>
    </div>
    <span style={{ fontSize: '14px', fontWeight: '700', color: '#1E293B' }}>{value}</span>
  </div>
);

  // Generate last 7 days for date filter
  useEffect(() => {
    const today = new Date();
    const dateList = [];
    for (let i = 0; i < 7; i++) {
        const d = new Date(today);
        d.setDate(today.getDate() - i);
        dateList.push(d.toISOString().split('T')[0]);
    }
    setDates(dateList);
    setSelectedTanggal(dateList[0]);
  }, []);

  // Fetch data when date changes
  useEffect(() => {
    if (selectedTanggal && resolvedKelasId) {
        fetchAttendance(resolvedKelasId, selectedTanggal);
    }
  }, [selectedTanggal, resolvedKelasId]);

  const fetchAttendance = async (classId: string, date: string) => {
    setLoading(true);
    setAttendanceData(null);
    try {
        const data = await attendanceService.getDailyClassAttendance(classId, date);
        setAttendanceData(data);
        
        // Reset selected mapel if it doesn't exist in new data
        if (data.items.length > 0) {
            // Select first subject by default if not already selected or invalid
             if (!selectedMapel || !data.items.find(item => item.schedule.subject_name === selectedMapel)) {
                 const firstItem = data.items[0];
                 setSelectedMapel(firstItem.schedule.subject_name);
                 setCurrentGuru(firstItem.schedule.teacher.user.name);
             }
        } else {
            setSelectedMapel('');
            setCurrentGuru('');
        }

    } catch (error) {
        console.error("Failed to fetch attendance:", error);
        showNotification('error', 'Gagal memuat data kehadiran');
    } finally {
        setLoading(false);
    }
  };

  // Update Guru when Mapel changes
  useEffect(() => {
      if (attendanceData && selectedMapel) {
          const scheduleItem = attendanceData.items.find(
              item => item.schedule.subject_name === selectedMapel
          );
          if (scheduleItem) {
              setCurrentGuru(scheduleItem.schedule.teacher.user.name);
          }
      }
  }, [selectedMapel, attendanceData]);


  // Derived Data for Dropdowns
  const tanggalOptions = dates.map(date => ({
      label: new Date(date).toLocaleDateString('id-ID', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }),
      value: date
  }));

  const mapelOptions = useMemo(() => {
      if (!attendanceData) return [];
      return attendanceData.items.map(item => ({
          label: `${item.schedule.subject_name} (${item.schedule.start_time.slice(0, 5)} - ${item.schedule.end_time.slice(0, 5)})`,
          value: item.schedule.subject_name
      }));
  }, [attendanceData]);


  // Filtered Rows for Table
  const filteredRows: AttendanceRow[] = useMemo(() => {
      if (!attendanceData || !selectedMapel) return [];

      const scheduleItem = attendanceData.items.find(
          item => item.schedule.subject_name === selectedMapel
      );

      if (!scheduleItem) return [];

      return scheduleItem.attendances.map((att, index) => ({
          no: index + 1,
          nama: att.student.user.name,
          nisn: att.student.nisn,
          status: att.status,
          waktu: att.checked_in_at ? att.checked_in_at.split(' ')[1].slice(0, 5) : '-'
      }));

  }, [attendanceData, selectedMapel]);


  const showNotification = (type: 'error' | 'success', message: string) => {
    setNotification({ type, message });
    setTimeout(() => {
      setNotification(null);
    }, 3000);
  };

  const handleBack = () => {
    onMenuClick('jadwal-kelas');
  };

  const exportPDF = () => {
    const doc = new jsPDF();
    
    // Header
    doc.setFontSize(18);
    doc.text(`Laporan Kehadiran - ${selectedKelas}`, 14, 20);
    
    doc.setFontSize(12);
    doc.text(`Tanggal: ${new Date(selectedTanggal).toLocaleDateString('id-ID')}`, 14, 30);
    doc.text(`Mata Pelajaran: ${selectedMapel}`, 14, 36);
    doc.text(`Guru: ${currentGuru}`, 14, 42);

    // Table
    (doc as any).autoTable({
      startY: 50,
      head: [['No', 'Nama Siswa', 'NISN', 'Status', 'Waktu Hadir']],
      body: filteredRows.map(row => [
        row.no,
        row.nama,
        row.nisn,
        row.status,
        row.waktu
      ]),
      theme: 'grid',
      headStyles: { fillColor: [41, 128, 185] },
    });

    doc.save(`Presensi_${selectedKelas}_${selectedTanggal}.pdf`);
  };

  const exportCSV = () => {
    const headers = ['No,Nama Siswa,NISN,Status,Waktu Hadir'];
    const rows = filteredRows.map(row => 
      `${row.no},"${row.nama}","${row.nisn}",${row.status},${row.waktu}`
    );
    
    const csvContent = [
        `Kelas: ${selectedKelas}`,
        `Tanggal: ${selectedTanggal}`,
        `Mata Pelajaran: ${selectedMapel}`,
        `Guru: ${currentGuru}`,
        '',
        ...headers, 
        ...rows
    ].join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `Presensi_${selectedKelas}_${selectedTanggal}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const columns = [
    { key: 'no', label: 'No', width: '60px' },
    { key: 'nama', label: 'Nama Siswa' },
    { key: 'nisn', label: 'NISN' },
    { 
      key: 'status', 
      label: 'Status',
      render: (value: string, row: any) => (
        <div style={{ display: 'flex', justifyContent: 'center' }}>
          <div
            onClick={() => {
              setSelectedRow(row);
              setIsDetailModalOpen(true);
            }}
            style={getStatusStyle(value)}
            className="status-badge-hover"
          >
            <Eye size={14} />
            <span>{getStatusLabel(value)}</span>
          </div>
        </div>
      )
    },
    { key: 'waktu', label: 'Waktu Hadir' },
  ];

  return (
    <StaffLayout
      pageTitle="Detail Kehadiran Siswa"
      currentPage={currentPage}
      onMenuClick={onMenuClick}
      user={user}
      onLogout={onLogout}
    >
        {/* Notification */}
        {notification && (
        <div
          style={{
            position: 'fixed',
            top: 20,
            right: 20,
            padding: '16px 20px',
            borderRadius: 8,
            display: 'flex',
            alignItems: 'center',
            gap: 12,
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
            zIndex: 1000,
            animation: 'slideIn 0.3s ease-out',
            backgroundColor: notification.type === 'error' ? '#FEE2E2' : '#ECFDF5',
            border: notification.type === 'error' ? '1px solid #FECACA' : '1px solid #A7F3D0',
          }}
        >
          <AlertCircle
            size={20}
            style={{
              color: notification.type === 'error' ? '#DC2626' : '#059669',
              flexShrink: 0,
            }}
          />
          <span
            style={{
              color: notification.type === 'error' ? '#DC2626' : '#059669',
              fontSize: 14,
              fontWeight: 500,
            }}
          >
            {notification.message}
          </span>
        </div>
      )}

      <style>{`
        @keyframes slideIn {
          from {
            transform: translateX(400px);
            opacity: 0;
          }
          to {
            transform: translateX(0);
            opacity: 1;
          }
        }
      `}</style>

      <div style={{
        backgroundColor: '#FFFFFF',
        borderRadius: 12,
        padding: 32,
        border: '1px solid #E5E7EB',
        boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
      }}>
        {/* Header Section */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          marginBottom: 32,
        }}>
          <div>
            <button
              onClick={handleBack}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                background: 'none',
                border: 'none',
                color: '#6B7280',
                cursor: 'pointer',
                marginBottom: 16,
                fontSize: 14,
                fontWeight: 500
              }}
            >
              <ArrowLeft size={18} />
              Kembali ke Jadwal
            </button>
            <h2 style={{
              fontSize: 24,
              fontWeight: 700,
              color: '#111827',
              margin: 0,
              display: 'flex',
              alignItems: 'center',
              gap: 12
            }}>
              {selectedKelas}
              <span style={{
                fontSize: 14,
                fontWeight: 500,
                color: '#6B7280',
                backgroundColor: '#F3F4F6',
                padding: '4px 12px',
                borderRadius: 6
              }}>
                Wali Kelas: {payload?.waliKelas || '-'}
              </span>
            </h2>
          </div>

          <div style={{ display: 'flex', gap: 12 }}>
            <button
              onClick={() => onNavigateToRecap && onNavigateToRecap()}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                padding: '10px 16px',
                backgroundColor: '#062A4A',
                color: '#FFFFFF',
                border: 'none',
                borderRadius: 8,
                fontSize: 14,
                fontWeight: 500,
                cursor: 'pointer',
                transition: 'all 0.2s',
              }}
            >
              <CalendarIcon size={18} />
              Lihat Rekap Bulanan
            </button>
            <button
              onClick={exportCSV}
              disabled={loading || filteredRows.length === 0}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                padding: '10px 16px',
                backgroundColor: '#FFFFFF',
                border: '1px solid #E5E7EB',
                borderRadius: 8,
                color: '#374151',
                fontSize: 14,
                fontWeight: 500,
                cursor: loading || filteredRows.length === 0 ? 'not-allowed' : 'pointer',
                transition: 'all 0.2s',
                opacity: loading || filteredRows.length === 0 ? 0.6 : 1
              }}
            >
              <FileText size={18} />
              Export CSV
            </button>
            <button
              onClick={exportPDF}
              disabled={loading || filteredRows.length === 0}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                padding: '10px 16px',
                backgroundColor: '#0B2948',
                color: '#FFFFFF',
                border: 'none',
                borderRadius: 8,
                fontSize: 14,
                fontWeight: 500,
                cursor: loading || filteredRows.length === 0 ? 'not-allowed' : 'pointer',
                transition: 'all 0.2s',
                opacity: loading || filteredRows.length === 0 ? 0.6 : 1
              }}
            >
              <Download size={18} />
              Export PDF
            </button>
          </div>
        </div>

        {/* Filters */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
          gap: 20,
          marginBottom: 32,
          backgroundColor: '#F9FAFB',
          padding: 20,
          borderRadius: 8,
          border: '1px solid #F3F4F6'
        }}>
          <Select
            label="Pilih Tanggal"
            value={selectedTanggal}
            onChange={setSelectedTanggal}
            options={tanggalOptions}
            icon={<CalendarIcon size={18} />}
          />
          
          <Select
            label="Mata Pelajaran"
            value={selectedMapel}
            onChange={setSelectedMapel}
            options={mapelOptions}
            placeholder={loading ? "Memuat jadwal..." : "Pilih Mata Pelajaran"}
            disabled={loading || mapelOptions.length === 0}
          />
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            <label style={{ 
              fontSize: 14, 
              fontWeight: 500, 
              color: '#374151',
              display: 'flex',
              alignItems: 'center',
              gap: 8
            }}>
              <div style={{
                color: '#0B2948'
              }}>
                Guru Pengampu
              </div>
            </label>
            <div style={{
              padding: '10px 14px',
              backgroundColor: '#E5E7EB',
              borderRadius: 8,
              color: '#4B5563',
              fontSize: 14,
              border: '1px solid #D1D5DB',
              height: 42,
              display: 'flex',
              alignItems: 'center'
            }}>
              {currentGuru || '-'}
            </div>
          </div>
        </div>

        {/* Table */}
        <Table
          columns={columns}
          data={filteredRows}
          keyField="no"
          emptyMessage={loading ? "Memuat data presensi..." : "Tidak ada data presensi siswa."}
        />

        {/* Detail Modal */}
        {isDetailModalOpen && selectedRow && (
          <div style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(0,0,0,0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
            backdropFilter: 'blur(4px)',
            padding: '16px'
          }}>
            <div style={{
              backgroundColor: 'white',
              borderRadius: '24px',
              width: '100%',
              maxWidth: '450px',
              overflow: 'hidden',
              boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)',
              animation: 'modalFadeIn 0.3s ease-out'
            }}>
              {/* Header Modal with Gradient */}
              <div style={{
                background: 'linear-gradient(135deg, #062A4A 0%, #111827 100%)',
                padding: '24px',
                color: 'white',
                position: 'relative'
              }}>
                <button 
                  onClick={() => setIsDetailModalOpen(false)}
                  style={{
                    position: 'absolute',
                    top: '20px',
                    right: '20px',
                    backgroundColor: 'rgba(255,255,255,0.1)',
                    border: 'none',
                    borderRadius: '50%',
                    width: '32px',
                    height: '32px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                    color: 'white'
                  }}
                >
                  <X size={20} />
                </button>
                <div style={{ marginBottom: '4px', opacity: 0.8, fontSize: '12px', letterSpacing: '1px' }}>DETAIL PRESENSI</div>
                <h3 style={{ fontSize: '18px', fontWeight: '700', margin: 0 }}>{selectedRow.nama}</h3>
                <p style={{ margin: '4px 0 0 0', opacity: 0.7, fontSize: '14px' }}>NISN: {selectedRow.nisn}</p>
              </div>

              {/* Modal Body */}
              <div style={{ padding: '24px' }}>
                <div style={{ display: 'grid', gap: '8px' }}>
                  <DetailRow label="Tanggal" value={new Date(selectedTanggal).toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })} icon={<CalendarIcon size={16} />} />
                  <DetailRow label="Mata Pelajaran" value={selectedMapel} icon={<BookOpen size={16} />} />
                  <DetailRow label="Guru Pengampu" value={currentGuru} icon={<User size={16} />} />
                  <DetailRow label="Status" value={getStatusLabel(selectedRow.status)} icon={<Shield size={16} />} />
                  <DetailRow label="Waktu Absen" value={selectedRow.waktu || '-'} icon={<Clock size={16} />} />
                </div>

                <div style={{ marginTop: '24px', padding: '16px', backgroundColor: '#F8FAFC', borderRadius: '12px', border: '1px solid #E2E8F0' }}>
                  <div style={{ fontSize: '11px', fontWeight: '700', color: '#64748B', marginBottom: '8px', letterSpacing: '0.5px' }}>CATATAN / KETERANGAN</div>
                  <p style={{ margin: 0, fontSize: '13px', color: '#334155', lineHeight: '1.6' }}>
                    {selectedRow.status.toLowerCase() === 'hadir' || selectedRow.status.toLowerCase() === 'present' 
                      ? 'Siswa terkonfirmasi hadir di kelas tepat waktu.' 
                      : selectedRow.status.toLowerCase() === 'pulang' 
                        ? 'Siswa telah meninggalkan sekolah (izin pulang).'
                        : 'Catatan tidak tersedia untuk status ini.'}
                  </p>
                </div>

                <button
                  onClick={() => setIsDetailModalOpen(false)}
                  style={{
                    width: '100%',
                    marginTop: '24px',
                    padding: '14px',
                    backgroundColor: '#062A4A',
                    color: 'white',
                    border: 'none',
                    borderRadius: '12px',
                    fontWeight: '600',
                    cursor: 'pointer',
                    transition: 'all 0.2s'
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#0B2948'}
                  onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#062A4A'}
                >
                  Tutup Detail
                </button>
              </div>
            </div>
          </div>
        )}

        <style>{`
          .status-badge-hover:hover {
            opacity: 0.9;
            transform: translateY(-1px);
            box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
          }
          @keyframes modalFadeIn {
            from { transform: scale(0.95); opacity: 0; }
            to { transform: scale(1); opacity: 1; }
          }
        `}</style>
      </div>
    </StaffLayout>
  );
}
