import { useState, useMemo } from 'react';
import GuruLayout from '../../component/Guru/GuruLayout.tsx';
import CalendarIcon from '../../assets/Icon/calender.png';
import EditIcon from '../../assets/Icon/Edit.png';
import ChalkboardIcon from '../../assets/Icon/Chalkboard.png';

// STATUS COLOR PALETTE - High Contrast for Accessibility
const STATUS_COLORS = {
  hadir: '#1FA83D',   // HIJAU - Hadir
  izin: '#ACA40D',    // KUNING - Izin
  sakit: '#520C8F',   // UNGU - Sakit
  alfa: '#D90000',   // MERAH - Tidak Hadir
  pulang: '#2F85EB',  // BIRU - Pulang
};

interface KehadiranSiswaGuruProps {
  user: { name: string; role: string };
  onLogout: () => void;
  currentPage: string;
  onMenuClick: (page: string) => void;
}

interface SiswaData {
  id: string;
  nisn: string;
  nama: string;
  mapel: string;
  status: 'hadir' | 'izin' | 'sakit' | 'alfa' | 'pulang';
  keterangan?: string;
  tanggal?: string;
  jamPelajaran?: string;
  guru?: string;
  waktuHadir?: string;
  suratPulang?: File | null;
}

export default function KehadiranSiswaGuru({
  user,
  onLogout,
  currentPage,
  onMenuClick,
}: KehadiranSiswaGuruProps) {
  const [currentDate] = useState('25-01-2025');
  const [selectedKelas] = useState('XII REKAYASA PERANGKAT LUNAK 2');
  const [selectedMapel] = useState('MPKK (1-4)');
  const [editingSiswa, setEditingSiswa] = useState<SiswaData | null>(null);
  const [selectedSiswa, setSelectedSiswa] = useState<SiswaData | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);

  const [siswaList, setSiswaList] = useState<SiswaData[]>([
    { 
      id: '1', 
      nisn: '0074182519', 
      nama: 'Laura Lavida Loca', 
      mapel: 'MPKK', 
      status: 'hadir',
      tanggal: '25-01-2025',
      jamPelajaran: '1-4',
      guru: 'Alifah Diantebes Aindra S.pd',
      waktuHadir: '07:00 WIB'
    },
    { 
      id: '2', 
      nisn: '0074320819', 
      nama: 'Lely Sagita', 
      mapel: 'MPKK', 
      status: 'hadir',
      tanggal: '25-01-2025',
      jamPelajaran: '1-4',
      guru: 'Alifah Diantebes Aindra S.pd',
      waktuHadir: '08:00 WIB'
    },
    { 
      id: '3', 
      nisn: '0078658367', 
      nama: 'Maya Melinda', 
      mapel: 'MPKK', 
      status: 'izin',
      keterangan: 'Ijin tidak masuk karena ada keperluan keluarga',
      tanggal: '25-01-2025',
      jamPelajaran: '1-4',
      guru: 'Alifah Diantebes Aindra S.pd'
    },
    { 
      id: '4', 
      nisn: '0079292238', 
      nama: 'Moch Abyl Gustian', 
      mapel: 'MPKK', 
      status: 'sakit',
      keterangan: 'Demam tinggi dan dokter menyarankan istirahat',
      tanggal: '25-01-2025',
      jamPelajaran: '1-4',
      guru: 'Alifah Diantebes Aindra S.pd'
    },
    { 
      id: '5', 
      nisn: '0084421457', 
      nama: 'Muhammad Aminullah', 
      mapel: 'MPKK', 
      status: 'alfa',
      tanggal: '25-01-2025',
      jamPelajaran: '1-4',
      guru: 'Alifah Diantebes Aindra S.pd'
    },
    { 
      id: '6', 
      nisn: '0089104721', 
      nama: 'Muhammad Azka Fadli Attaya', 
      mapel: 'MPKK', 
      status: 'alfa',
      tanggal: '25-01-2025',
      jamPelajaran: '1-4',
      guru: 'Alifah Diantebes Aindra S.pd'
    },
    { 
      id: '7', 
      nisn: '0087917739', 
      nama: 'Muhammad Hadi Firmansyah', 
      mapel: 'MPKK', 
      status: 'pulang',
      keterangan: 'Pulang lebih awal karena sakit perut',
      tanggal: '25-01-2025',
      jamPelajaran: '1-4',
      guru: 'Alifah Diantebes Aindra S.pd'
    },
  ]);

  const handleEditClick = (siswa: SiswaData) => {
    setEditingSiswa(siswa);
  };

  const handleSaveStatus = (newStatus: SiswaData['status']) => {
    if (!editingSiswa) return;

    setSiswaList(prevList =>
      prevList.map(s =>
        s.id === editingSiswa.id ? { ...s, status: newStatus } : s
      )
    );
    setEditingSiswa(null);
  };

  // Fungsi untuk membuka modal detail status - SEMUA STATUS BISA DIKLIK
  const handleStatusClick = (siswa: SiswaData) => {
  setSelectedSiswa({ ...siswa }); // clone object
  setIsDetailModalOpen(true);
};

  const handleSaveDetail = () => {
    if (!selectedSiswa) return;
    setSiswaList(prevList =>
      prevList.map(s =>
        s.id === selectedSiswa.id ? selectedSiswa : s
      )
    );
    setIsDetailModalOpen(false);
    setSelectedSiswa(null);
  };

  // Fungsi untuk mendapatkan teks status
  const getStatusText = (status: string, waktuHadir?: string) => {
  switch (status) {
    case "alfa":
      return "Siswa tidak hadir tanpa keterangan";

    case "izin":
      return "Siswa izin dengan keterangan";

    case "sakit":
      return "Siswa sakit dengan surat dokter";

    case "hadir":
      if (!waktuHadir) return "Siswa hadir";

      const jamMasuk = waktuHadir.split(":");
      const jam = parseInt(jamMasuk[0], 10);
      const menit = parseInt(jamMasuk[1], 10);

      // batas jam 07:00
      if (jam > 7 || (jam === 7 && menit > 0)) {
        return `Siswa hadir tetapi terlambat pada ${waktuHadir}`;
      }

      return `Siswa hadir tepat waktu pada ${waktuHadir}`;

    case "pulang":
      return "Siswa pulang lebih awal karena ada kepentingan";

    default:
      return status;
  }
};

  // Custom Status Renderer dengan icon mata untuk SEMUA STATUS
  const StatusButton = ({ status, siswa }: { status: string; siswa: SiswaData }) => {
    const color = STATUS_COLORS[status as keyof typeof STATUS_COLORS] || '#1FA83D';
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
          letterSpacing: '0.5px',
          cursor: 'pointer',
          transition: 'all 0.2s ease',
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.opacity = '0.9';
          e.currentTarget.style.transform = 'translateY(-1px)';
          e.currentTarget.style.boxShadow = '0 6px 8px -1px rgba(0, 0, 0, 0.3)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.opacity = '1';
          e.currentTarget.style.transform = 'translateY(0)';
          e.currentTarget.style.boxShadow = '0 4px 6px -1px rgba(0, 0, 0, 0.2)';
        }}
      >
        <EyeIcon size={14} />
        <span>{label}</span>
      </div>
    );
  };

  // Icon mata untuk lihat detail
  const EyeIcon = ({ size = 16 }: { size?: number }) => (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      style={{ display: 'inline-block', verticalAlign: 'middle' }}
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

  // Icon X untuk tombol close modal
  const XIcon = ({ size = 24 }: { size?: number }) => (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      style={{ display: 'inline-block', verticalAlign: 'middle' }}
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

  // Icon check untuk status hadir
  const CheckIcon = ({ size = 24 }: { size?: number }) => (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      style={{ display: 'inline-block', verticalAlign: 'middle' }}
    >
      <path
        d="M20 6L9 17L4 12"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );

  // Icon time untuk waktu hadir
  const TimeIcon = ({ size = 16 }: { size?: number }) => (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      style={{ display: 'inline-block', verticalAlign: 'middle' }}
    >
      <circle
        cx="12"
        cy="12"
        r="9"
        stroke="currentColor"
        strokeWidth="2"
      />
      <path
        d="M12 7V12L15 15"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  );

  // Fungsi helper untuk DetailRow
  const DetailRow = ({ label, value, icon }: { label: string; value: string; icon?: React.ReactNode }) => (
  <div
    style={{
      display: 'grid',
      gridTemplateColumns: '160px 20px 1fr',
      alignItems: 'center',
      marginBottom: 16,
      paddingBottom: 12,
      borderBottom: '1px solid #E5E7EB',
    }}
  >
    <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontWeight: 600, color: '#374151' }}>
      {icon}
      {label}
    </div>

    <div style={{ textAlign: 'center', fontWeight: 600 }}>:</div>

    <div style={{ fontWeight: 500, color: '#1F2937' }}>
      {value}
    </div>
  </div>
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
            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
            position: 'relative',
            overflow: 'hidden'
          }}>
            {/* Decorative circle */}
            <div style={{
              position: 'absolute',
              left: -10,
              bottom: -20,
              width: 60,
              height: 60,
              backgroundColor: 'rgba(255,255,255,0.05)',
              borderRadius: '50%'
            }} />

            <img src={ChalkboardIcon} alt="Class" style={{ width: 24, height: 24, filter: 'brightness(0) invert(1)', zIndex: 1 }} />
            <div style={{ zIndex: 1 }}>
              <div style={{ fontSize: '16px', fontWeight: '700' }}>{selectedKelas}</div>
              <div style={{ fontSize: '13px', opacity: 0.8 }}>{selectedMapel}</div>
            </div>
          </div>
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
                <tr style={{ backgroundColor: '#1E293B', color: 'black' }}>
                  <th style={{ ...styles.th, color: 'black' }}>No</th>
                  <th style={{ ...styles.th, color: 'black' }}>NISN</th>
                  <th style={{ ...styles.th, color: 'black' }}>Nama Siswa</th>
                  <th style={{ ...styles.th, color: 'black' }}>Mata Pelajaran</th>
                  <th style={{ ...styles.th, color: 'black' }}>Guru</th>
                  <th style={{ ...styles.th, textAlign: 'center', color: 'black' }}>Status</th>
                  <th style={{ ...styles.th, textAlign: 'center', color: 'black' }}>Aksi</th>
                </tr>
              </thead>
              <tbody>
                {siswaList.map((siswa, index) => (
                  <tr key={siswa.id} style={{
                    borderBottom: '1px solid #E2E8F0',
                    backgroundColor: index % 2 === 0 ? '#F8FAFC' : 'white'
                  }}>
                    <td style={styles.td}>{index + 1}.</td>
                    <td style={{ ...styles.td, fontFamily: 'monospace', fontSize: '15px' }}>{siswa.nisn}</td>
                    <td style={{ ...styles.td, fontWeight: '700', color: '#111827' }}>{siswa.nama}</td>
                    <td style={styles.td}>{siswa.mapel}</td>
                    <td style={styles.td}>{siswa.guru || '-'}</td>
                    <td style={{ ...styles.td, textAlign: 'center' }}>
                      <StatusButton status={siswa.status} siswa={siswa} />
                    </td>
                    <td style={{ ...styles.td, textAlign: 'center' }}>
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
                ))}
              </tbody>
            </table>
          </div>
        </div>

      </div>

      {/* Edit Status Modal */}
      {editingSiswa && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(15, 23, 42, 0.6)',
          backdropFilter: 'blur(4px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 50
        }}>
          <div style={{
            backgroundColor: 'white',
            padding: '0',
            borderRadius: '16px',
            width: '90%',
            maxWidth: '400px',
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
            border: '1px solid rgba(255,255,255,0.1)',
            overflow: 'hidden'
          }}>
            {/* Header */}
            <div style={{
              padding: '20px 24px',
              borderBottom: '1px solid #F3F4F6',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}>
              <h3 style={{ fontSize: '18px', fontWeight: '700', color: '#111827', margin: 0 }}>
                Sunting Status Kehadiran
              </h3>
              <button
                onClick={() => setEditingSiswa(null)}
                style={{
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  color: '#9CA3AF',
                  fontSize: '24px',
                  padding: 0,
                  lineHeight: 1,
                  display: 'flex',
                  alignItems: 'center'
                }}
              >
                &times;
              </button>
            </div>

            {/* Content */}
            <div style={{ padding: '24px' }}>
              {/* Nama Siswa Field */}
              <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#6B7280', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                  Nama Siswa
                </label>
                <div style={{
                  backgroundColor: '#F9FAFB',
                  padding: '12px 16px',
                  borderRadius: '8px',
                  border: '1px solid #E5E7EB',
                  color: '#1F2937',
                  fontSize: '15px',
                  fontWeight: '600'
                }}>
                  {editingSiswa.nama}
                </div>
              </div>

              {/* Status Select */}
              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#6B7280', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                  Status Kehadiran
                </label>
                <div style={{ position: 'relative' }}>
                  <select
                    value={editingSiswa.status}
                    onChange={(e) => setEditingSiswa({ ...editingSiswa, status: e.target.value as SiswaData['status'] })}
                    style={{
                      width: '100%',
                      padding: '12px 16px',
                      borderRadius: '8px',
                      border: '1px solid #D1D5DB',
                      fontSize: '15px',
                      color: '#1F2937',
                      backgroundColor: 'white',
                      cursor: 'pointer',
                      outline: 'none',
                      appearance: 'none',
                      backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236B7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e")`,
                      backgroundPosition: 'right 1rem center',
                      backgroundRepeat: 'no-repeat',
                      backgroundSize: '1.5em 1.5em',
                      paddingRight: '2.5rem'
                    }}
                  >
                    <option value="hadir">Hadir</option>
                    <option value="izin">Izin</option>
                    <option value="sakit">Sakit</option>
                    <option value="alfa">Alfa</option>
                    <option value="pulang">Pulang</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Footer Actions */}
            <div style={{
              padding: '20px 24px',
              backgroundColor: '#F9FAFB',
              borderTop: '1px solid #F3F4F6',
              display: 'flex',
              gap: '12px'
            }}>
              <button
                onClick={() => setEditingSiswa(null)}
                style={{
                  flex: 1,
                  padding: '12px',
                  borderRadius: '8px',
                  border: '1px solid #D1D5DB',
                  backgroundColor: 'white',
                  color: '#374151',
                  cursor: 'pointer',
                  fontSize: '14px',
                  fontWeight: '600',
                  transition: 'all 0.2s'
                }}
              >
                Batal
              </button>
              <button
                onClick={() => handleSaveStatus(editingSiswa.status)}
                style={{
                  flex: 1,
                  padding: '12px',
                  borderRadius: '8px',
                  border: 'none',
                  backgroundColor: '#2563EB',
                  color: 'white',
                  cursor: 'pointer',
                  fontSize: '14px',
                  fontWeight: '600',
                  boxShadow: '0 4px 6px -1px rgba(37, 99, 235, 0.4)',
                  transition: 'all 0.2s'
                }}
              >
                Simpan
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Detail Status Modal - UNTUK SEMUA STATUS */}
      {isDetailModalOpen && selectedSiswa && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(15, 23, 42, 0.6)',
          backdropFilter: 'blur(4px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 50
        }}>
          <div style={{
            backgroundColor: '#FFFFFF',
            borderRadius: '12px',
            width: '90%',
            maxWidth: '420px',
            boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)',
            overflow: 'hidden',
            maxHeight: '90vh',
            display: 'flex',
            flexDirection: 'column',
          }}>
            {/* Header Modal */}
            <div style={{
              backgroundColor: '#0B2948',
              padding: '16px 20px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              color: '#FFFFFF',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <EyeIcon size={24} />
                <h3 style={{
                  margin: 0,
                  fontSize: '18px',
                  fontWeight: 700,
                }}>
                  Detail Kehadiran
                </h3>
              </div>
              <button
                onClick={() => setIsDetailModalOpen(false)}
                style={{
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  color: '#FFFFFF',
                  display: 'flex',
                  alignItems: 'center',
                  padding: 0,
                }}
              >
                <XIcon size={24} />
              </button>
            </div>

            {/* Content Modal */}
            <div style={{ 
              padding: 24,
              overflowY: 'auto',
              flex: 1,
              WebkitOverflowScrolling: 'touch', // Smooth scrolling for iOS
            }}>
              {/* Row Tanggal */}
              <DetailRow 
                label="Tanggal" 
                value={selectedSiswa.tanggal || currentDate} 
                icon={<img src={CalendarIcon} alt="Calendar" style={{ width: 16, height: 16, opacity: 0.7 }} />}
              />

            
              {/* Row Nama Siswa */}
             {/* Row Jam Pelajaran (DROPLIST) */}
<div style={{
  display: 'flex',
  justifyContent: 'space-between',
  marginBottom: 16,
  paddingBottom: 12,
  borderBottom: '1px solid #E5E7EB',
}}>
  <div style={{ fontWeight: 600, color: '#374151' }}>
    Jam Pelajaran :
  </div>

  <select
    value={selectedSiswa.jamPelajaran || ""}
    onChange={(e) =>
      setSelectedSiswa({ ...selectedSiswa, jamPelajaran: e.target.value })
    }
    style={{
      padding: '6px 10px',
      borderRadius: 6,
      border: '1px solid #D1D5DB',
      fontSize: 14,
      cursor: 'pointer',
    }}
  >
    <option value="">Pilih Jam</option>
    <option value="1-2">1 - 2</option>
    <option value="3-4">3 - 4</option>
    <option value="5-6">5 - 6</option>
    <option value="7-8">7 - 8</option>
    <option value="9-10">9 - 10</option>
  </select>
</div>
    {/* Row Upload Surat (KHUSUS PULANG) */}
{selectedSiswa.status === 'pulang' && (
  <div style={{
    display: 'flex',
    justifyContent: 'space-between',
    marginBottom: 16,
    paddingBottom: 12,
    borderBottom: '1px solid #E5E7EB',
    alignItems: 'center'
  }}>
    <div style={{ fontWeight: 600, color: '#374151' }}>
      Upload Surat :
    </div>

    <div style={{ textAlign: 'right' }}>
      <input
        type="file"
        accept=".pdf,.jpg,.png"
        onChange={(e) =>
          setSelectedSiswa({
            ...selectedSiswa,
            suratPulang: e.target.files?.[0] || null,
          })
        }
        style={{ fontSize: 13 }}
      />

      {selectedSiswa.suratPulang && (
        <div style={{
          fontSize: 12,
          color: '#2563EB',
          marginTop: 4
        }}>
          {selectedSiswa.suratPulang.name}
        </div>
      )}
    </div>
  </div>
)}



              {/* Row NISN */}
              <DetailRow 
                label="NISN" 
                value={selectedSiswa.nisn} 
              />

              {/* Row Mata Pelajaran */}
              <DetailRow 
                label="Mata Pelajaran" 
                value={selectedSiswa.mapel} 
              />

              {/* Row Guru */}
              <DetailRow 
                label="Guru" 
                value={selectedSiswa.guru || '-'} 
              />

              {/* Row Waktu Hadir (khusus untuk status hadir) */}
              {selectedSiswa.status === 'hadir' && selectedSiswa.waktuHadir && (
                <DetailRow 
                  label="Waktu Hadir" 
                  value={selectedSiswa.waktuHadir} 
                  icon={<TimeIcon size={16} />}
                />
              )}

              {/* Row Status */}
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                marginBottom: 24,
                paddingBottom: 12,
                borderBottom: '1px solid #E5E7EB',
              }}>
                <div style={{ fontWeight: 600, color: '#374151', display: 'flex', alignItems: 'center', gap: 8 }}>
                  {selectedSiswa.status === 'hadir' && <CheckIcon size={18} color="#1FA83D" />}
                  Status :
                </div>
                <div>
                  <span style={{
                    backgroundColor: STATUS_COLORS[selectedSiswa.status],
                    color: '#FFFFFF',
                    padding: '4px 16px',
                    borderRadius: 6,
                    fontSize: 13,
                    fontWeight: 600,
                  }}>
                    {selectedSiswa.status === 'alfa' ? 'alfa' :
                     selectedSiswa.status === 'sakit' ? 'Sakit' :
                     selectedSiswa.status === 'izin' ? 'Izin' :
                     selectedSiswa.status === 'hadir' ? 'Hadir' :
                     'Pulang'}
                  </span>
                </div>
              </div>

              {/* Info Box - Ditampilkan untuk SEMUA status */}
              <div style={{
                backgroundColor: selectedSiswa.status === 'hadir' ? '#F0FDF4' : '#EFF6FF',
                border: `1px solid ${selectedSiswa.status === 'hadir' ? '#BBF7D0' : '#BFDBFE'}`,
                borderRadius: 8,
                padding: 16,
                textAlign: 'center',
                marginBottom: 24,
              }}>
                <div style={{
                  fontSize: 14,
                  fontWeight: 600,
                  color: selectedSiswa.status === 'hadir' ? '#166534' : '#1E40AF',
                }}>
                  {getStatusText(selectedSiswa.status, selectedSiswa.waktuHadir)}
                </div>
              </div>

              {/* Keterangan Editable */}
              <div>
                <div style={{
                  fontSize: 14,
                  fontWeight: 600,
                  color: '#374151',
                  marginBottom: 12,
                }}>
                  Keterangan (Opsional) :
                </div>
                <textarea
                  value={selectedSiswa.keterangan || ''}
                  onChange={(e) => setSelectedSiswa({ ...selectedSiswa, keterangan: e.target.value })}
                  placeholder={
                    selectedSiswa.status === 'hadir' ? "Contoh: Hadir tepat waktu, aktif dalam pembelajaran..." :
                    selectedSiswa.status === 'izin' ? "Contoh: Menghadiri acara keluarga, izin dokter..." :
                    selectedSiswa.status === 'sakit' ? "Contoh: Demam tinggi, flu berat..." :
                    selectedSiswa.status === 'pulang' ? "Contoh: Sakit perut, ada keperluan mendadak..." :
                    "Alasan tidak hadir..."
                  }
                  style={{
                    width: "100%",
                    padding: "12px 16px",
                    backgroundColor: "white",
                    borderRadius: 8,
                    border: "1px solid #D1D5DB",
                    fontSize: 14,
                    color: "#374151",
                    lineHeight: 1.5,
                    resize: "vertical",
                    minHeight: "80px",
                    maxHeight: "200px", // Limit height
                    overflowY: "auto",  // Enable internal scrolling
                    fontFamily: "inherit",
                    outline: "none",
                  }}
                  onFocus={(e) => e.target.style.borderColor = '#3B82F6'}
                  onBlur={(e) => e.target.style.borderColor = '#D1D5DB'}
                />
                <div style={{
                  fontSize: 12,
                  color: "#9CA3AF",
                  marginTop: 4,
                }}>
                  *Keterangan akan tersimpan dalam catatan kehadiran
                </div>
              </div>
            </div>

            {/* Footer Modal - Fixed at bottom */}
            <div style={{
              padding: '16px 24px',
              borderTop: '1px solid #E5E7EB',
              backgroundColor: '#F9FAFB',
              display: 'flex',
              justifyContent: 'flex-end',
            }}>
              <button
                onClick={handleSaveDetail}
                style={{
                  padding: '10px 20px',
                  borderRadius: '8px',
                  border: 'none',
                  backgroundColor: '#2563EB',
                  color: 'white',
                  cursor: 'pointer',
                  fontSize: '14px',
                  fontWeight: '600',
                  boxShadow: '0 4px 6px -1px rgba(37, 99, 235, 0.4)',
                  transition: 'all 0.2s'
                }}
              >
                Simpan Perubahan
              </button>
            </div>
          </div>
        </div>
      )}

      
    </GuruLayout>
  );
}

const styles = {
  th: {
    padding: '16px',
    textAlign: 'left' as const,
    fontSize: '14px',
    fontWeight: '600',
    color: '#FFFFFF',
    letterSpacing: '0.025em'
  },
  td: {
    padding: '16px',
    fontSize: '14px',
    color: '#1F2937',
    verticalAlign: 'middle'
  }

  
};