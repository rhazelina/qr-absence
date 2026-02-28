import { useState, useEffect, useMemo } from 'react';
import WalikelasLayout from '../../component/Walikelas/layoutwakel';
import { Button } from '../../component/Shared/Button';
import { FormModal } from '../../component/Shared/FormModal';
import { Select } from '../../component/Shared/Select';
import { Table } from '../../component/Shared/Table';
import { Calendar, BookOpen, FileText, ClipboardPlus, Edit, ChevronDown, X, Upload } from 'lucide-react';
import { valueOrDefault } from 'chart.js/helpers';

// STATUS COLOR PALETTE - High Contrast for Accessibility
const STATUS_COLORS = {
  hadir: '#1FA83D',   // HIJAU - Hadir
  izin: '#ACA40D',    // KUNING - Izin
  sakit: '#520C8F',   // UNGU - Sakit
  alfa: '#D90000',   // MERAH - Alfa
  pulang: '#2F85EB',  // BIRU - Pulang
};

type StatusType = 'hadir' | 'izin' | 'sakit' | 'alfa' | 'pulang';

interface KehadiranRow {
  id: string;
  nisn: string;
  namaSiswa: string;
  mataPelajaran: string;
  namaGuru: string;
  tanggal: string;
  status: StatusType;
  keterangan?: string;
  jamPelajaran?: string;
  waktuHadir?: string;
  buktiFoto1?: string;
  buktiFoto2?: string;
  isPerizinanPulang?: boolean;
}

interface KehadiranSiswaWakelProps {
  user: { name: string; role: string };
  onLogout: () => void;
  currentPage: string;
  onMenuClick: (page: string) => void;
}

export function KehadiranSiswaWakel({
  user,
  onLogout,
  currentPage,
  onMenuClick,
}: KehadiranSiswaWakelProps) {
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const [selectedMapel, setSelectedMapel] = useState('all');
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [selectedDate, setSelectedDate] = useState('');
  const [tempDate, setTempDate] = useState('');
  const [selectedSiswa, setSelectedSiswa] = useState<KehadiranRow | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);

  const currentDate = new Date();
  const formattedDate = `${currentDate.getDate().toString().padStart(2, '0')}-${(currentDate.getMonth() + 1).toString().padStart(2, '0')}-${currentDate.getFullYear()}`;
  
  const kelasInfo = {
    namaKelas: '12 Rekayasa Perangkat Lunak 2',
    tanggal: selectedDate || formattedDate,
  };

  const [rows, setRows] = useState<KehadiranRow[]>(() => {
    const dummyRows: KehadiranRow[] = [
      { id: '1', nisn: '1348576392', namaSiswa: 'LAURA LAVIDA LOCA', mataPelajaran: 'Matematika', namaGuru: 'Solikhah S.pd', tanggal: '25-01-2026', status: 'hadir', jamPelajaran: '1-4', waktuHadir: '07:30 WIB' },
      { id: '2', nisn: '1348576392', namaSiswa: 'LELY SAGITA', mataPelajaran: 'Matematika', namaGuru: 'Solikhah S.pd', tanggal: '25-01-2026', status: 'hadir', jamPelajaran: '1-4', waktuHadir: '07:25 WIB' },
      { id: '3', nisn: '1348576392', namaSiswa: 'MAYA MELINDA WIJAYANTI', mataPelajaran: 'Matematika', namaGuru: 'Solikhah S.pd', tanggal: '25-01-2026', status: 'izin', jamPelajaran: '1-4', keterangan: 'Ijin tidak masuk karena ada keperluan keluarga' },
      { id: '4', nisn: '1348576392', namaSiswa: 'MOCH. ABYL GUSTIAN', mataPelajaran: 'Matematika', namaGuru: 'Solikhah S.pd', tanggal: '25-01-2026', status: 'sakit', jamPelajaran: '1-4', keterangan: 'Demam tinggi dan dokter menyarankan istirahat' },
      { id: '5', nisn: '1348576392', namaSiswa: 'MUHAMMAD AMINULLAH', mataPelajaran: 'Matematika', namaGuru: 'Solikhah S.pd', tanggal: '25-01-2026', status: 'alfa', jamPelajaran: '1-4' },
      { id: '6', nisn: '1348576392', namaSiswa: 'Muhammad Azka Fadli Atthaya', mataPelajaran: 'Matematika', namaGuru: 'Solikhah S.pd', tanggal: '25-01-2026', status: 'alfa', jamPelajaran: '1-4' },
      { id: '7', nisn: '1348576392', namaSiswa: 'MUHAMMAD HADI FIRMANSYAH', mataPelajaran: 'Matematika', namaGuru: 'Solikhah S.pd', tanggal: '25-01-2026', status: 'alfa', jamPelajaran: '1-4' },
      { id: '8', nisn: '1348576393', namaSiswa: 'MUHAMMAD HARRIS MAULANA SAPUTRA', mataPelajaran: 'Matematika', namaGuru: 'Solikhah S.pd', tanggal: '25-01-2026', status: 'hadir', jamPelajaran: '1-4', waktuHadir: '07:28 WIB' },
      { id: '9', nisn: '1348576394', namaSiswa: 'MUHAMMAD IBNU RAFFI AHDAN', mataPelajaran: 'Matematika', namaGuru: 'Solikhah S.pd', tanggal: '25-01-2026', status: 'sakit', jamPelajaran: '1-4', keterangan: 'Batuk pilek dan demam' },
      { id: '10', nisn: '1348576395', namaSiswa: 'MUHAMMAD REYHAN ATHADIANSYAH', mataPelajaran: 'Matematika', namaGuru: 'Solikhah S.pd', tanggal: '25-01-2026', status: 'izin', jamPelajaran: '1-4', keterangan: 'Menghadiri acara keluarga' },
      { id: '11', nisn: '1348576396', namaSiswa: 'MUHAMMAD WISNU DEWANDARU', mataPelajaran: 'Matematika', namaGuru: 'Solikhah S.pd', tanggal: '25-01-2026', status: 'hadir', jamPelajaran: '1-4', waktuHadir: '07:32 WIB' },
      { id: '12', nisn: '1348576397', namaSiswa: 'NABILA RAMADHAN', mataPelajaran: 'Matematika', namaGuru: 'Solikhah S.pd', tanggal: '25-01-2026', status: 'alfa', jamPelajaran: '1-4' },
      { id: '13', nisn: '1348576398', namaSiswa: 'NADIA SINTA DEVI OKTAVIA', mataPelajaran: 'Matematika', namaGuru: 'Solikhah S.pd', tanggal: '25-01-2026', status: 'hadir', jamPelajaran: '1-4', waktuHadir: '07:29 WIB' },
      { id: '14', nisn: '1348576399', namaSiswa: 'NOVITA AZZAHRA', mataPelajaran: 'Matematika', namaGuru: 'Solikhah S.pd', tanggal: '25-01-2026', status: 'sakit', jamPelajaran: '1-4', keterangan: 'Sakit perut' },
      { id: '15', nisn: '1348576400', namaSiswa: 'RAENA WESTI DHEANOFA HERLIANI', mataPelajaran: 'Matematika', namaGuru: 'Solikhah S.pd', tanggal: '25-01-2026', status: 'pulang', jamPelajaran: '1-4', keterangan: 'Pulang lebih awal karena sakit kepala' },
    ];
    
    const perizinanData = localStorage.getItem('perizinanPulangList');
    if (!perizinanData) return dummyRows;
    
    try {
      const perizinanList = JSON.parse(perizinanData);
      
      const perizinanRows: KehadiranRow[] = perizinanList.map((perizinan: any, index: number) => ({
        id: `perizinan-pulang-${perizinan.id || Date.now() + index}`,
        nisn: perizinan.nisn,
        namaSiswa: perizinan.namaSiswa,
        mataPelajaran: perizinan.mapel,
        namaGuru: perizinan.namaGuru,
        tanggal: perizinan.tanggal || perizinan.createdAt,
        status: 'pulang' as StatusType,
        keterangan: perizinan.keterangan,
        jamPelajaran: perizinan.jamPelajaran || '1-4',
        buktiFoto1: perizinan.buktiFoto1,
        buktiFoto2: perizinan.buktiFoto2,
        isPerizinanPulang: true,
      }));
      
      return [...dummyRows, ...perizinanRows];
    } catch (error) {
      console.error('Error parsing perizinan data:', error);
      return dummyRows;
    }
  });

  const guruPerMapel: Record<string, string[]> = {
    'Matematika': ['Solikhah S.pd', 'Budi Santoso S.pd', 'Dewi Lestari S.pd'],
    'Bahasa Indonesia': ['Siti Aminah S.pd', 'Ahmad Fauzi S.pd'],
    'Fisika': ['Dr. Bambang S.pd', 'Rina Kusuma S.pd'],
    'Kimia': ['Arief Budiman S.pd', 'Lina Marlina S.pd'],
    'MPKK': ['Tri Wahyuni S.pd', 'Eko Prasetyo S.pd', 'Yuni Astuti S.pd'],
    'Bahasa Inggris': ['Sarah Johnson S.pd', 'David Brown S.pd'],
    'Sejarah': ['Hendra Gunawan S.pd'],
    'Ekonomi': ['Fitri Handayani S.pd', 'Rudi Hermawan S.pd'],
  };

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', handleResize);
    
    const handleStorageChange = () => {
      const perizinanData = localStorage.getItem('perizinanPulangList');
      if (!perizinanData) return;
      
      try {
        const perizinanList = JSON.parse(perizinanData);
        
        const perizinanRows: KehadiranRow[] = perizinanList.map((perizinan: any, index: number) => ({
          id: `perizinan-pulang-${perizinan.id || Date.now() + index}`,
          nisn: perizinan.nisn,
          namaSiswa: perizinan.namaSiswa,
          mataPelajaran: perizinan.mapel,
          namaGuru: perizinan.namaGuru,
          tanggal: perizinan.tanggal || perizinan.createdAt,
          status: 'pulang' as StatusType,
          keterangan: perizinan.keterangan,
          jamPelajaran: perizinan.jamPelajaran || '1-4',
          buktiFoto1: perizinan.buktiFoto1,
          buktiFoto2: perizinan.buktiFoto2,
          isPerizinanPulang: true,
        }));
        
        const dummyRows: KehadiranRow[] = [
          { id: '1', nisn: '1348576392', namaSiswa: 'Wito Suherman Suhermin', mataPelajaran: 'Matematika', namaGuru: 'Solikhah S.pd', tanggal: '25-01-2026', status: 'hadir', jamPelajaran: '1-4', waktuHadir: '07:30 WIB' },
          { id: '2', nisn: '1348576392', namaSiswa: 'Wito Suherman Suhermin', mataPelajaran: 'Matematika', namaGuru: 'Solikhah S.pd', tanggal: '25-01-2026', status: 'hadir', jamPelajaran: '1-4', waktuHadir: '07:25 WIB' },
          { id: '3', nisn: '1348576392', namaSiswa: 'Wito Suherman Suhermin', mataPelajaran: 'Matematika', namaGuru: 'Solikhah S.pd', tanggal: '25-01-2026', status: 'izin', jamPelajaran: '1-4', keterangan: 'Ijin tidak masuk karena ada keperluan keluarga' },
          { id: '4', nisn: '1348576392', namaSiswa: 'Wito Suherman Suhermin', mataPelajaran: 'Matematika', namaGuru: 'Solikhah S.pd', tanggal: '25-01-2026', status: 'sakit', jamPelajaran: '1-4', keterangan: 'Demam tinggi dan dokter menyarankan istirahat' },
          { id: '5', nisn: '1348576392', namaSiswa: 'Wito Suherman Suhermin', mataPelajaran: 'Matematika', namaGuru: 'Solikhah S.pd', tanggal: '25-01-2026', status: 'alfa', jamPelajaran: '1-4' },
          { id: '6', nisn: '1348576392', namaSiswa: 'Wito Suherman Suhermin', mataPelajaran: 'Matematika', namaGuru: 'Solikhah S.pd', tanggal: '25-01-2026', status: 'alfa', jamPelajaran: '1-4' },
          { id: '7', nisn: '1348576392', namaSiswa: 'Wito Suherman Suhermin', mataPelajaran: 'Matematika', namaGuru: 'Solikhah S.pd', tanggal: '25-01-2026', status: 'alfa', jamPelajaran: '1-4' },
          { id: '8', nisn: '1348576393', namaSiswa: 'Ahmad Fauzi', mataPelajaran: 'Matematika', namaGuru: 'Solikhah S.pd', tanggal: '25-01-2026', status: 'hadir', jamPelajaran: '1-4', waktuHadir: '07:28 WIB' },
          { id: '9', nisn: '1348576394', namaSiswa: 'Siti Nurhaliza', mataPelajaran: 'Matematika', namaGuru: 'Solikhah S.pd', tanggal: '25-01-2026', status: 'sakit', jamPelajaran: '1-4', keterangan: 'Batuk pilek dan demam' },
          { id: '10', nisn: '1348576395', namaSiswa: 'Budi Santoso', mataPelajaran: 'Matematika', namaGuru: 'Solikhah S.pd', tanggal: '25-01-2026', status: 'izin', jamPelajaran: '1-4', keterangan: 'Menghadiri acara keluarga' },
          { id: '11', nisn: '1348576396', namaSiswa: 'Dewi Sartika', mataPelajaran: 'Matematika', namaGuru: 'Solikhah S.pd', tanggal: '25-01-2026', status: 'hadir', jamPelajaran: '1-4', waktuHadir: '07:32 WIB' },
          { id: '12', nisn: '1348576397', namaSiswa: 'Rizki Ramadhan', mataPelajaran: 'Matematika', namaGuru: 'Solikhah S.pd', tanggal: '25-01-2026', status: 'alfa', jamPelajaran: '1-4' },
          { id: '13', nisn: '1348576398', namaSiswa: 'Fitri Handayani', mataPelajaran: 'Matematika', namaGuru: 'Solikhah S.pd', tanggal: '25-01-2026', status: 'hadir', jamPelajaran: '1-4', waktuHadir: '07:29 WIB' },
          { id: '14', nisn: '1348576399', namaSiswa: 'Andi Wijaya', mataPelajaran: 'Matematika', namaGuru: 'Solikhah S.pd', tanggal: '25-01-2026', status: 'sakit', jamPelajaran: '1-4', keterangan: 'Sakit perut' },
          { id: '15', nisn: '1348576400', namaSiswa: 'Rina Pratiwi', mataPelajaran: 'Matematika', namaGuru: 'Solikhah S.pd', tanggal: '25-01-2026', status: 'pulang', jamPelajaran: '1-4', keterangan: 'Pulang lebih awal karena sakit kepala' },
        ];
        
        setRows([...dummyRows, ...perizinanRows]);
      } catch (error) {
        console.error('Error parsing perizinan data:', error);
      }
    };
    
    window.addEventListener('storage', handleStorageChange);
    
    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []);

  const mapelOptions = useMemo(() => {
    const mapelSet = new Set(
      rows.map((r) => r.mataPelajaran).filter((v) => v && v !== '-')
    );
    return [
      { label: 'Semua Mata Pelajaran', value: 'all' },
      ...Array.from(mapelSet).map((mapel) => ({
        label: mapel,
        value: mapel,
      })),
    ];
  }, [rows]);

  const filteredRows = useMemo(() => {
    let filtered = selectedMapel === 'all' 
      ? rows 
      : rows.filter((r) => r.mataPelajaran === selectedMapel);
    
    if (selectedDate) {
      filtered = filtered.filter((r) => r.tanggal === selectedDate);
    }
    
    return filtered.map((row, index) => ({
      ...row,
    }));
  }, [rows, selectedMapel, selectedDate]);

  const totalHadir = filteredRows.filter((r) => r.status === 'hadir').length;
  const totalIzin = filteredRows.filter((r) => r.status === 'izin').length;
  const totalSakit = filteredRows.filter((r) => r.status === 'sakit').length;
  const totalAlfa = filteredRows.filter((r) => r.status === 'alfa').length;
  const totalPulang = filteredRows.filter((r) => r.status === 'pulang').length;

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

  const getMinMaxDateForFilter = () => {
    const startYear = 2026;
    const maxYear = 2030;
    
    return {
      minDate: `${startYear}-01-01`,
      maxDate: `${maxYear}-12-31`
    };
  };

  const handleStatusClick = (siswa: KehadiranRow) => {
    setEditingRow(siswa);
    setEditStatus(siswa.status);
    setEditKeterangan(siswa.keterangan || '');
    setIsEditOpen(true);
  };

  const StatusButton = ({ status, siswa }: { status: StatusType; siswa: KehadiranRow }) => {
    const color = STATUS_COLORS[status as keyof typeof STATUS_COLORS] || '#1FA83D';
    const label = status === 'alfa' ? 'Alfa' :
                  status === 'sakit' ? 'Sakit' :
                  status === 'izin' ? 'Izin' :
                  status === 'hadir' ? 'Hadir' :
                  'Pulang';
    
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
        <Edit size={14} />
        <span>{label}</span>
      </div>
    );
  };

  const getStatusText = (status: string, waktuHadir?: string, keterangan?: string) => {
    switch (status) {
      case "alfa":
        return "Siswa tidak hadir tanpa keterangan";
      case "izin":
        return "Siswa izin dengan keterangan";
      case "sakit":
        return "Siswa sakit dengan surat dokter";
      case "hadir":
        return waktuHadir ? `Siswa hadir tepat waktu pada ${waktuHadir}` : "Siswa hadir tepat waktu";
      case "pulang":
        return keterangan || "Siswa pulang lebih awal karena ada kepentingan";
      default:
        return status;
    }
  };

  const columns = useMemo(() => [
    { 
      key: 'no', 
      label: 'No',
      render: (value: any, row: any, index: number) => index + 1,
      style: { textAlign: 'center' as const, width: '50px' }
    },
    { key: 'nisn', label: 'NISN', style: { width: '120px' } },
    { key: 'namaSiswa', label: 'Nama Siswa', style: { width: '200px' } },
    { key: 'mataPelajaran', label: 'Mata Pelajaran', style: { width: '150px' } },
    { key: 'namaGuru', label: 'Nama Guru', style: { width: '150px' } },
    { 
      key: 'status', 
      label: 'Status',
      style: { textAlign: 'center' as const, width: '150px' },
      render: (value: StatusType, row: KehadiranRow) => (
        <div style={{ display: 'flex', justifyContent: 'center', width: '100%' }}>
          <StatusButton status={value} siswa={row} />
        </div>
      )
    },
  ], []);

  const [editingRow, setEditingRow] = useState<KehadiranRow | null>(null);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [editStatus, setEditStatus] = useState<StatusType>('hadir');
  const [editKeterangan, setEditKeterangan] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const statusOptions = [
    { label: 'Hadir', value: 'hadir' as StatusType },
    { label: 'Sakit', value: 'sakit' as StatusType },
    { label: 'Izin', value: 'izin' as StatusType },
    { label: 'Alfa', value: 'alfa' as StatusType },
    { label: 'Pulang', value: 'pulang' as StatusType },
  ];

  const handleOpenEdit = (row: KehadiranRow) => {
    setEditingRow(row);
    setEditStatus(row.status);
    setEditKeterangan(row.keterangan || '');
    setIsEditOpen(true);
  };

  const handleCloseEdit = () => {
    setIsEditOpen(false);
    setEditingRow(null);
    setEditKeterangan('');
    setIsSubmitting(false);
  };

  const handleSubmitEdit = () => {
    if (!editingRow) return;
    
    setIsSubmitting(true);
    
    if ((editStatus === 'pulang' || editStatus === 'izin' || editStatus === 'sakit') && !editKeterangan.trim()) {
      alert(`⚠️ Mohon isi keterangan untuk status ${editStatus}`);
      setIsSubmitting(false);
      return;
    }
    
    setTimeout(() => {
      setRows((prev) =>
        prev.map((r) =>
          r.id === editingRow.id 
            ? { 
                ...r, 
                status: editStatus,
                keterangan: editKeterangan.trim(),
                waktuHadir: editStatus === 'hadir' ? '07:30 WIB' : undefined
              } 
            : r
        )
      );
      setIsSubmitting(false);
      setIsEditOpen(false);
      setEditingRow(null);
      setEditKeterangan('');
      alert('✅ Status kehadiran berhasil diperbarui!');
    }, 300);
  };

  const handleLihatRekap = () => {
    onMenuClick('rekap-kehadiran-siswa');
  };

  const handleOpenDatePicker = () => {
    setTempDate(selectedDate || formattedDate);
    setShowDatePicker(true);
  };

  const handleCloseDatePicker = () => {
    setShowDatePicker(false);
    setTempDate('');
  };

  const handleApplyDate = () => {
    if (tempDate) {
      setSelectedDate(tempDate);
    }
    setShowDatePicker(false);
  };

  const handleClearDate = () => {
    setSelectedDate('');
    setShowDatePicker(false);
  };

  const formatDateForDisplay = (dateStr: string) => {
    if (!dateStr) return formattedDate;
    return dateStr;
  };

  const parseDateToInput = (dateStr: string) => {
    if (!dateStr) return '';
    const [day, month, year] = dateStr.split('-');
    return `${year}-${month}-${day}`;
  };

  const formatInputToDate = (inputStr: string) => {
    if (!inputStr) return '';
    const [year, month, day] = inputStr.split('-');
    return `${day}-${month}-${year}`;
  };

  const DetailRow = ({ label, value, icon }: { label: string; value: string; icon?: React.ReactNode }) => (
    <div style={{
      display: 'flex',
      justifyContent: 'space-between',
      marginBottom: 16,
      paddingBottom: 12,
      borderBottom: '1px solid #E5E7EB',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        {icon}
        <div style={{ fontWeight: 600, color: '#374151' }}>{label} :</div>
      </div>
      <div style={{ fontWeight: 500, color: '#1F2937', textAlign: 'right' }}>
        {value}
      </div>
    </div>
  );

  const refreshDataFromLocalStorage = () => {
    const perizinanData = localStorage.getItem('perizinanPulangList');
    if (!perizinanData) return;
    
    try {
      const perizinanList = JSON.parse(perizinanData);
      
      const perizinanRows: KehadiranRow[] = perizinanList.map((perizinan: any, index: number) => ({
        id: `perizinan-pulang-${perizinan.id || Date.now() + index}`,
        nisn: perizinan.nisn,
        namaSiswa: perizinan.namaSiswa,
        mataPelajaran: perizinan.mapel,
        namaGuru: perizinan.namaGuru,
        tanggal: perizinan.tanggal || perizinan.createdAt,
        status: 'pulang' as StatusType,
        keterangan: perizinan.keterangan,
        jamPelajaran: perizinan.jamPelajaran || '1-4',
        buktiFoto1: perizinan.buktiFoto1,
        buktiFoto2: perizinan.buktiFoto2,
        isPerizinanPulang: true,
      }));
      
      const dummyRows: KehadiranRow[] = [
        { id: '1', nisn: '1348576392', namaSiswa: 'Wito Suherman Suhermin', mataPelajaran: 'Matematika', namaGuru: 'Solikhah S.pd', tanggal: '25-01-2026', status: 'hadir', jamPelajaran: '1-4', waktuHadir: '07:30 WIB' },
        { id: '2', nisn: '1348576392', namaSiswa: 'Wito Suherman Suhermin', mataPelajaran: 'Matematika', namaGuru: 'Solikhah S.pd', tanggal: '25-01-2026', status: 'hadir', jamPelajaran: '1-4', waktuHadir: '07:25 WIB' },
        { id: '3', nisn: '1348576392', namaSiswa: 'Wito Suherman Suhermin', mataPelajaran: 'Matematika', namaGuru: 'Solikhah S.pd', tanggal: '25-01-2026', status: 'izin', jamPelajaran: '1-4', keterangan: 'Ijin tidak masuk karena ada keperluan keluarga' },
        { id: '4', nisn: '1348576392', namaSiswa: 'Wito Suherman Suhermin', mataPelajaran: 'Matematika', namaGuru: 'Solikhah S.pd', tanggal: '25-01-2026', status: 'sakit', jamPelajaran: '1-4', keterangan: 'Demam tinggi dan dokter menyarankan istirahat' },
        { id: '5', nisn: '1348576392', namaSiswa: 'Wito Suherman Suhermin', mataPelajaran: 'Matematika', namaGuru: 'Solikhah S.pd', tanggal: '25-01-2026', status: 'alfa', jamPelajaran: '1-4' },
        { id: '6', nisn: '1348576392', namaSiswa: 'Wito Suherman Suhermin', mataPelajaran: 'Matematika', namaGuru: 'Solikhah S.pd', tanggal: '25-01-2026', status: 'alfa', jamPelajaran: '1-4' },
        { id: '7', nisn: '1348576392', namaSiswa: 'Wito Suherman Suhermin', mataPelajaran: 'Matematika', namaGuru: 'Solikhah S.pd', tanggal: '25-01-2026', status: 'alfa', jamPelajaran: '1-4' },
        { id: '8', nisn: '1348576393', namaSiswa: 'Ahmad Fauzi', mataPelajaran: 'Matematika', namaGuru: 'Solikhah S.pd', tanggal: '25-01-2026', status: 'hadir', jamPelajaran: '1-4', waktuHadir: '07:28 WIB' },
        { id: '9', nisn: '1348576394', namaSiswa: 'Siti Nurhaliza', mataPelajaran: 'Matematika', namaGuru: 'Solikhah S.pd', tanggal: '25-01-2026', status: 'sakit', jamPelajaran: '1-4', keterangan: 'Batuk pilek dan demam' },
        { id: '10', nisn: '1348576395', namaSiswa: 'Budi Santoso', mataPelajaran: 'Matematika', namaGuru: 'Solikhah S.pd', tanggal: '25-01-2026', status: 'izin', jamPelajaran: '1-4', keterangan: 'Menghadiri acara keluarga' },
        { id: '11', nisn: '1348576396', namaSiswa: 'Dewi Sartika', mataPelajaran: 'Matematika', namaGuru: 'Solikhah S.pd', tanggal: '25-01-2026', status: 'hadir', jamPelajaran: '1-4', waktuHadir: '07:32 WIB' },
        { id: '12', nisn: '1348576397', namaSiswa: 'Rizki Ramadhan', mataPelajaran: 'Matematika', namaGuru: 'Solikhah S.pd', tanggal: '25-01-2026', status: 'alfa', jamPelajaran: '1-4' },
        { id: '13', nisn: '1348576398', namaSiswa: 'Fitri Handayani', mataPelajaran: 'Matematika', namaGuru: 'Solikhah S.pd', tanggal: '25-01-2026', status: 'hadir', jamPelajaran: '1-4', waktuHadir: '07:29 WIB' },
        { id: '14', nisn: '1348576399', namaSiswa: 'Andi Wijaya', mataPelajaran: 'Matematika', namaGuru: 'Solikhah S.pd', tanggal: '25-01-2026', status: 'sakit', jamPelajaran: '1-4', keterangan: 'Sakit perut' },
        { id: '15', nisn: '1348576400', namaSiswa: 'Rina Pratiwi', mataPelajaran: 'Matematika', namaGuru: 'Solikhah S.pd', tanggal: '25-01-2026', status: 'pulang', jamPelajaran: '1-4', keterangan: 'Pulang lebih awal karena sakit kepala' },
      ];
      
      setRows([...dummyRows, ...perizinanRows]);
    } catch (error) {
      console.error('Error parsing perizinan data:', error);
    }
  };

  return (
    <WalikelasLayout
      pageTitle="Kehadiran Siswa"
      currentPage={currentPage as any}
      onMenuClick={onMenuClick}
      user={user}
      onLogout={onLogout}
    >
      <div style={{ 
        position: 'relative',
        minHeight: '100%',
        backgroundColor: '#FFFFFF',
        borderRadius: '12px',
        overflow: 'hidden',
        padding: isMobile ? '16px' : '32px',
        border: '1px solid #E5E7EB',
        boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
      }}>
        <div style={{
          display: 'flex',
          flexDirection: isMobile ? 'column' : 'row',
          alignItems: 'flex-start',
          justifyContent: 'space-between',
          gap: '20px',
          paddingBottom: '20px',
          borderBottom: '1px solid #E5E7EB',
          marginBottom: '20px',
        }}>
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '16px',
            flex: 1,
          }}>
            <div style={{ position: 'relative' }}>
              <button
                onClick={handleOpenDatePicker}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  backgroundColor: '#0F172A',
                  color: 'white',
                  padding: '10px 16px',
                  borderRadius: '8px',
                  border: 'none',
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                  minWidth: '180px',
                  justifyContent: 'space-between',
                  fontSize: '14px',
                  fontWeight: '600',
                  boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                }}
                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#1E293B'}
                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#0F172A'}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Calendar size={18} color="#FFFFFF" />
                  <span>
                    {formatDateForDisplay(selectedDate)}
                  </span>
                </div>
                <ChevronDown size={14} color="#FFFFFF" />
              </button>
            </div>
            
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
              <div style={{
                position: 'absolute',
                left: -10,
                bottom: -20,
                width: 60,
                height: 60,
                backgroundColor: 'rgba(255,255,255,0.05)',
                borderRadius: '50%'
              }} />

              <BookOpen size={24} color="#FFFFFF" />
              <div style={{ zIndex: 1 }}>
                <div style={{ fontSize: '16px', fontWeight: '700' }}>{kelasInfo.namaKelas}</div>
                <div style={{ fontSize: '13px', opacity: 0.8 }}>Semua Mata Pelajaran</div>
              </div>
            </div>
          </div>

          <div style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '16px',
            flex: 1,
            minWidth: isMobile ? '100%' : 'auto',
          }}>
            <div style={{ 
              display: 'flex', 
              gap: '10px', 
              flexWrap: 'wrap',
              justifyContent: isMobile ? 'flex-start' : 'flex-end',
            }}>
              <button
                onClick={() => {
                  refreshDataFromLocalStorage();
                  handleLihatRekap();
                }}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  backgroundColor: '#3B82F6',
                  color: '#FFFFFF',
                  border: 'none',
                  borderRadius: '6px',
                  padding: '8px 14px',
                  fontSize: '13px',
                  fontWeight: '600',
                  cursor: 'pointer',
                  transition: 'background-color 0.2s',
                  boxShadow: '0 4px 6px -1px rgba(37, 99, 235, 0.4)',
                }}
                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#2563EB'}
                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#3B82F6'}
              >
                <FileText size={15} />
                <span>Lihat Rekap</span>
              </button>
            </div>

            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: isMobile ? 'flex-start' : 'flex-end',
              gap: '20px',
              backgroundColor: '#F9FAFB',
              padding: '12px 20px',
              borderRadius: '8px',
              border: '1px solid #E5E7EB',
              maxWidth: 'fit-content',
              marginLeft: isMobile ? '0' : 'auto',
              boxShadow: '0 2px 4px rgba(0,0,0,0.05)',
            }}>
              <div style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                minWidth: '50px',
              }}>
                <span style={{ fontSize: '11px', color: '#6B7280', fontWeight: '500', marginBottom: '2px' }}>Hadir</span>
                <span style={{ fontSize: '20px', color: '#1FA83D', fontWeight: '700' }}>{totalHadir}</span>
              </div>
              
              <div style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                minWidth: '50px',
              }}>
                <span style={{ fontSize: '11px', color: '#6B7280', fontWeight: '500', marginBottom: '2px' }}>Izin</span>
                <span style={{ fontSize: '20px', color: '#ACA40D', fontWeight: '700' }}>{totalIzin}</span>
              </div>
              
              <div style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                minWidth: '50px',
              }}>
                <span style={{ fontSize: '11px', color: '#6B7280', fontWeight: '500', marginBottom: '2px' }}>Sakit</span>
                <span style={{ fontSize: '20px', color: '#520C8F', fontWeight: '700' }}>{totalSakit}</span>
              </div>
              
              <div style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                minWidth: '50px',
              }}>
                <span style={{ fontSize: '11px', color: '#6B7280', fontWeight: '500', marginBottom: '2px' }}>Alfa</span>
                <span style={{ fontSize: '20px', color: '#D90000', fontWeight: '700' }}>{totalAlfa}</span>
              </div>
              
              <div style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                minWidth: '50px',
              }}>
                <span style={{ fontSize: '11px', color: '#6B7280', fontWeight: '500', marginBottom: '2px' }}>Pulang</span>
                <span style={{ fontSize: '20px', color: '#2F85EB', fontWeight: '700' }}>{totalPulang}</span>
              </div>
            </div>
          </div>
        </div>

        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          marginBottom: '20px',
          padding: '12px',
          backgroundColor: '#F9FAFB',
          borderRadius: '8px',
          border: '1px solid #E5E7EB',
        }}>
          <div style={{
            width: '36px',
            height: '36px',
            borderRadius: '8px',
            backgroundColor: '#3B82F6',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
          }}>
            <BookOpen size={18} color="#FFFFFF" />
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', flex: 1 }}>
            <span style={{ fontSize: '12px', color: '#6B7280', fontWeight: '500' }}>
              Filter Mata Pelajaran
            </span>
            <div style={{ width: '200px' }}>
              <Select
                value={selectedMapel}
                onChange={(val) => setSelectedMapel(val)}
                options={mapelOptions}
                placeholder="Pilih mata pelajaran"
              />
            </div>
          </div>
        </div>

        <div style={{
          border: '1px solid #E5E7EB',
          borderRadius: '8px',
          overflow: 'hidden',
          boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
          backgroundColor: 'white',
        }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ backgroundColor: '#F1F5F9' }}>
                <th style={{ ...styles.th, color: 'black' }}>No</th>
                <th style={{ ...styles.th, color: 'black' }}>NISN</th>
                <th style={{ ...styles.th, color: 'black' }}>Nama Siswa</th>
                <th style={{ ...styles.th, color: 'black' }}>Mata Pelajaran</th>
                <th style={{ ...styles.th, color: 'black' }}>Guru</th>
                <th style={{ ...styles.th, textAlign: 'center' as const, color: 'black' }}>Status</th>
              </tr>
            </thead>
            <tbody>
              {filteredRows.map((row, index) => (
                <tr key={row.id} style={{
                  borderBottom: '1px solid #E5E7EB',
                  backgroundColor: index % 2 === 0 ? '#F8FAFC' : 'white'
                }}>
                  <td style={styles.td}>{index + 1}.</td>
                  <td style={{ ...styles.td, fontFamily: 'monospace', fontSize: '15px' }}>{row.nisn}</td>
                  <td style={{ ...styles.td, fontWeight: '700', color: '#111827' }}>{row.namaSiswa}</td>
                  <td style={styles.td}>{row.mataPelajaran}</td>
                  <td style={styles.td}>{row.namaGuru}</td>
                  <td style={{ ...styles.td, textAlign: 'center' }}>
                    <StatusButton status={row.status} siswa={row} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          
          {filteredRows.length === 0 && (
            <div style={{ 
              padding: '40px 20px', 
              textAlign: 'center', 
              backgroundColor: '#F9FAFB', 
              borderRadius: '8px',
              borderTop: '1px solid #E5E7EB'
            }}>
              <p style={{ margin: 0, color: '#6B7280', fontSize: '14px' }}>
                📝 Belum ada data kehadiran siswa.
              </p>
            </div>
          )}
        </div>
      </div>

      {showDatePicker && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
          }}
        >
          <div
            style={{
              backgroundColor: '#FFFFFF',
              borderRadius: '12px',
              padding: '24px',
              width: '90%',
              maxWidth: '400px',
              display: 'flex',
              flexDirection: 'column',
            }}
          >
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                marginBottom: '20px',
              }}
            >
              <h2 style={{ margin: 0, fontSize: '18px', fontWeight: '700', color: '#111827' }}>
                Pilih Tanggal
              </h2>
              <button
                onClick={handleCloseDatePicker}
                style={{
                  background: 'none',
                  border: 'none',
                  fontSize: '20px',
                  cursor: 'pointer',
                  color: '#6B7280',
                  padding: '4px',
                  borderRadius: '4px',
                }}
                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#F3F4F6'}
                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
              >
                <X size={20} />
              </button>
            </div>

            <div style={{ marginBottom: '20px' }}>
              <label style={{
                display: 'block',
                marginBottom: '8px',
                fontSize: '14px',
                fontWeight: '600',
                color: '#111827',
              }}>
                Pilih Tanggal
              </label>
              <input
                type="date"
                value={parseDateToInput(tempDate)}
                onChange={(e) => setTempDate(formatInputToDate(e.target.value))}
                min={getMinMaxDateForFilter().minDate}
                max={getMinMaxDateForFilter().maxDate}
                style={{
                  width: '100%',
                  padding: '10px',
                  border: '1px solid #E5E7EB',
                  borderRadius: '6px',
                  fontSize: '14px',
                  boxSizing: 'border-box',
                  backgroundColor: '#FFFFFF',
                }}
              />
              <p style={{ 
                margin: '4px 0 0 0', 
                fontSize: '11px', 
                color: '#6B7280', 
                fontStyle: 'italic' 
              }}>
              </p>
            </div>

            <div style={{ 
              display: 'flex', 
              justifyContent: 'flex-end',
              gap: '10px',
              marginTop: '20px',
            }}>
              {selectedDate && (
                <button
                  onClick={handleClearDate}
                  style={{
                    padding: '8px 16px',
                    backgroundColor: '#FEE2E2',
                    color: '#991B1B',
                    border: 'none',
                    borderRadius: '6px',
                    cursor: 'pointer',
                    fontSize: '14px',
                    fontWeight: '600',
                    transition: 'all 0.2s',
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#FEF2F2'}
                  onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#FEE2E2'}
                >
                  Hapus Tanggal
                </button>
              )}
              <button
                onClick={handleApplyDate}
                style={{
                  padding: '8px 16px',
                  backgroundColor: '#3B82F6',
                  color: '#FFFFFF',
                  border: 'none',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontSize: '14px',
                  fontWeight: '600',
                  transition: 'all 0.2s',
                }}
                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#2563EB'}
                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#3B82F6'}
              >
                Terapkan
              </button>
            </div>
          </div>
        </div>
      )}

      <FormModal
        isOpen={isEditOpen}
        onClose={handleCloseEdit}
        title="Edit Status Kehadiran"
        onSubmit={handleSubmitEdit}
        submitLabel="Simpan"
        isSubmitting={isSubmitting}
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {editingRow && (
            <>
              <div>
                <p style={{ margin: '0 0 4px 0', fontSize: '12px', color: '#6B7280' }}>
                  Nama Siswa
                </p>
                <p style={{ margin: 0, fontSize: '14px', fontWeight: '600', color: '#111827' }}>
                  {editingRow.namaSiswa}
                </p>
              </div>
              
              <div>
                <p style={{ margin: '0 0 4px 0', fontSize: '12px', color: '#6B7280' }}>
                  Mata Pelajaran
                </p>
                <p style={{ margin: 0, fontSize: '14px', fontWeight: '600', color: '#111827' }}>
                  {editingRow.mataPelajaran}
                </p>
              </div>
              
              <div>
                <p style={{ margin: '0 0 4px 0', fontSize: '12px', color: '#6B7280' }}>
                  Tanggal
                </p>
                <p style={{ margin: 0, fontSize: '14px', fontWeight: '600', color: '#111827' }}>
                  {editingRow.tanggal}
                </p>
              </div>
            </>
          )}
          
          <div>
            <p
              style={{
                margin: 0,
                marginBottom: 8,
                fontSize: 14,
                fontWeight: 600,
                color: '#111827',
              }}
            >
              Ubah Status Kehadiran
            </p>
            <Select
              value={editStatus}
              onChange={(val) => setEditStatus(val as StatusType)}
              options={statusOptions}
              placeholder="Pilih status kehadiran"
            />
          </div>
          
          {(editStatus === 'pulang' || editStatus === 'izin' || editStatus === 'sakit') && (
            <div>
              <p
                style={{
                  margin: 0,
                  marginBottom: 8,
                  fontSize: 14,
                  fontWeight: 600,
                  color: '#111827',
                }}
              >
                Keterangan
              </p>
              <textarea
                value={editKeterangan}
                onChange={(e) => setEditKeterangan(e.target.value)}
                placeholder={`Masukkan keterangan untuk status ${editStatus}`}
                rows={3}
                style={{
                  width: '100%',
                  padding: '10px',
                  border: '1px solid #E5E7EB',
                  borderRadius: '6px',
                  fontSize: '14px',
                  fontFamily: 'inherit',
                  resize: 'vertical',
                  backgroundColor: '#FFFFFF',
                }}
                required
              />
              <p style={{ margin: '4px 0 0 0', fontSize: '11px', color: '#6B7280', fontStyle: 'italic' }}>
                *Keterangan wajib diisi untuk status ini
              </p>
            </div>
          )}
        </div>
      </FormModal>
    </WalikelasLayout>
  );
}

const styles = {
  th: {
    padding: '16px',
    textAlign: 'left' as const,
    fontSize: '14px',
    fontWeight: '600',
    color: '#374151',
    letterSpacing: '0.025em'
  },
  td: {
    padding: '16px',
    fontSize: '14px',
    color: '#1F2937',
    verticalAlign: 'middle'
  }
};