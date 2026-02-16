// FILE: GuruAdmin.tsx - Halaman Admin untuk mengelola data guru
// ✅ PERBAIKAN: Layout lebih pendek dan kompak
import { useState, useRef, useEffect } from 'react';
import AdminLayout from '../../component/Admin/AdminLayout';
import { Button } from '../../component/Shared/Button';
import { Select } from '../../component/Shared/Select';
import { 
  MoreVertical,
  Trash2,
  Eye,
  Grid,
  FileDown,
  Upload,
  FileText,
  Download,
  Search,
  X,
} from 'lucide-react';

/* ============ IMPORT GAMBAR AWAN ============ */
import AWANKIRI from '../../assets/Icon/AWANKIRI.png';
import AwanBawahkanan from '../../assets/Icon/AwanBawahkanan.png';

/* ===================== INTERFACE DEFINITIONS ===================== */
interface User {
  role: string;
  name: string;
}

interface Guru {
  id: string;
  kodeGuru: string;
  namaGuru: string;
  keterangan: string;
  role: string;
  noTelp?: string;
  waliKelasDari?: string;
  jenisKelamin?: string;
}

interface GuruAdminProps {
  user: User;
  onLogout: () => void;
  currentPage: string;
  onMenuClick: (page: string) => void;
  onNavigateToDetail?: (guruId: string) => void;
}

/* ===================== DUMMY DATA ===================== */
const initialGuruData: Guru[] = [
  {
    id: '1',
    kodeGuru: '0918415784',
    namaGuru: 'TRIANA ARDIANI, S.Pd',
    keterangan: '12 Rekayasa Perangkat Lunak 2',
    role: 'Wali Kelas',
    noTelp: '082183748591',
    waliKelasDari: '12 Rekayasa Perangkat Lunak 2',
    jenisKelamin: 'Perempuan',
  },
  {
    id: '2',
    kodeGuru: '0918417765',
    namaGuru: 'SOLIKAH,S.Pd',
    keterangan: 'Matematika',
    role: 'Guru',
    noTelp: '081234567890',
    waliKelasDari: '',
    jenisKelamin: 'Laki-Laki',
  },
  {
    id: '3',
    kodeGuru: '0918415785',
    namaGuru: 'WIWIN WINANGSIH, S.Pd,M.Pd',
    keterangan: 'Matematika',
    role: 'Guru',
    noTelp: '082345678901',
    waliKelasDari: '11 Teknik Komputer dan Jaringan 1',
    jenisKelamin: 'Perempuan',
  },
  {
    id: '4',
    kodeGuru: '0918775542',
    namaGuru: 'FAJAR NINGTYAS, S.Pd',
    keterangan: 'Bahasa Inggris',
    role: 'Guru',
    noTelp: '083456789012',
    waliKelasDari: '',
    jenisKelamin: 'Perempuan',
  },
  {
    id: '5',
    kodeGuru: '0919765542',
    namaGuru: 'Hj. TITIK MARIYATI, S.Pd',
    keterangan: 'Bahasa Indonesia',
    role: 'Guru',
    noTelp: '083456766543',
    waliKelasDari: '',
    jenisKelamin: 'Perempuan',
  },
];

/* ===================== KELAS OPTIONS ===================== */
const kelasOptions = [
  '10 Rekayasa Perangkat Lunak 1',
  '10 Rekayasa Perangkat Lunak 2',
  '10 Rekayasa Perangkat Lunak 3',
  '11 Rekayasa Perangkat Lunak 1',
  '11 Teknik Komputer dan Jaringan 1',
  '12 Teknik Komputer dan Jaringan 1',
  '12 Rekayasa Perangkat Lunak 1',
  '12 Rekayasa Perangkat Lunak 2',
];

/* ===================== MAIN COMPONENT ===================== */
export default function GuruAdmin({
  user,
  onLogout,
  currentPage,
  onMenuClick,
  onNavigateToDetail,
}: GuruAdminProps) {
  // ==================== STATE MANAGEMENT ====================
  const [searchValue, setSearchValue] = useState('');
  const [selectedRole, setSelectedRole] = useState('');
  const [selectedKeterangan, setSelectedKeterangan] = useState('');
  const [isEksporDropdownOpen, setIsEksporDropdownOpen] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [guruList, setGuruList] = useState<Guru[]>(initialGuruData);
  const [openActionId, setOpenActionId] = useState<string | null>(null);
  const [showDuplicateWarning, setShowDuplicateWarning] = useState(false);
  const [duplicateWarningMessage, setDuplicateWarningMessage] = useState('');
  
  const [formData, setFormData] = useState({
    namaGuru: '',
    kodeGuru: '',
    jenisKelamin: 'Laki-Laki',
    role: '',
    keterangan: '',
    noTelp: '',
    waliKelasDari: '',
  });
  
  const [formErrors, setFormErrors] = useState<{[key: string]: string}>({});
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  // ==================== DYNAMIC OPTIONS BERDASARKAN ROLE ====================
  
  const allKeteranganOptions = Array.from(new Set(guruList.map((g) => g.keterangan)))
    .filter(Boolean)
    .sort()
    .map((m) => ({ value: m, label: m }));

  const getFilteredKeteranganOptions = () => {
    if (!selectedRole) return allKeteranganOptions;
    
    const filtered = guruList
      .filter(g => g.role === selectedRole)
      .map(g => g.keterangan)
      .filter(Boolean);
    
    const unique = Array.from(new Set(filtered)).sort();
    return unique.map(m => ({ value: m, label: m }));
  };

  const roleOptions = [
    { label: 'Guru', value: 'Guru' },
    { label: 'Wali Kelas', value: 'Wali Kelas' },
    { label: 'Staff', value: 'Staff' },
  ];

  // ==================== OPTIONS UNTUK FORM MODAL ====================
  
  const mataPelajaranOptions = [
    { label: 'Matematika', value: 'Matematika' },
    { label: 'Bahasa Indonesia', value: 'Bahasa Indonesia' },
    { label: 'Bahasa Inggris', value: 'Bahasa Inggris' },
    { label: 'Seni Budaya', value: 'Seni Buddaya' },
    { label: 'Sejarah', value: 'Sejarah' },
    { label: 'Bahasa Jawa', value: 'Bahasa Jawa' },
  ];

  const bagianStaffOptions = [
    { label: 'Tata Usaha', value: 'Tata Usaha' },
    { label: 'Administrasi', value: 'Administrasi' },
    { label: 'Perpustakaan', value: 'Perpustakaan' },
    { label: 'Laboratorium', value: 'Laboratorium' },
    { label: 'Keuangan', value: 'Keuangan' },
  ];

  const getAvailableKelasOptions = () => {
    const occupiedKelas = guruList
      .filter(guru => guru.role === 'Wali Kelas' && guru.waliKelasDari)
      .map(guru => guru.waliKelasDari);
    
    return kelasOptions.filter(kelas => !occupiedKelas.includes(kelas));
  };

  // ==================== LISTEN TO UPDATES FROM DETAIL PAGE ====================
  useEffect(() => {
    const handleGuruUpdate = (event: Event) => {
      const customEvent = event as CustomEvent;
      if (customEvent.detail && customEvent.detail.updatedGuru) {
        const updatedGuru = customEvent.detail.updatedGuru;
        setGuruList(prevList => 
          prevList.map(guru => 
            guru.id === updatedGuru.id ? updatedGuru : guru
          )
        );
      }
    };

    const checkLocalStorageUpdate = () => {
      const savedGuru = localStorage.getItem('selectedGuru');
      const updateFlag = localStorage.getItem('guruDataUpdated');
      
      if (savedGuru && updateFlag === 'true') {
        try {
          const updatedGuru = JSON.parse(savedGuru);
          setGuruList(prevList => 
            prevList.map(guru => 
              guru.id === updatedGuru.id ? updatedGuru : guru
            )
          );
          localStorage.removeItem('guruDataUpdated');
        } catch (error) {
          console.error('Error parsing updated guru:', error);
        }
      }
    };

    checkLocalStorageUpdate();
    window.addEventListener('guruUpdated', handleGuruUpdate as EventListener);
    window.addEventListener('storage', checkLocalStorageUpdate);
    const interval = setInterval(checkLocalStorageUpdate, 500);
    
    return () => {
      window.removeEventListener('guruUpdated', handleGuruUpdate as EventListener);
      window.removeEventListener('storage', checkLocalStorageUpdate);
      clearInterval(interval);
    };
  }, []);

  // ==================== FORM VALIDATION WITH REAL-TIME ====================
  const validateField = (field: string, value: string) => {
    const newErrors = { ...formErrors };

    if (field === 'namaGuru') {
      if (!value.trim()) {
        newErrors.namaGuru = 'Nama guru harus diisi';
      } else if (value.trim().length < 3) {
        newErrors.namaGuru = 'Nama guru minimal 3 karakter';
      } else {
        delete newErrors.namaGuru;
      }
    }

    if (field === 'kodeGuru') {
      if (!value.trim()) {
        newErrors.kodeGuru = 'Kode guru harus diisi';
      } else if (guruList.some(g => g.kodeGuru === value)) {
        newErrors.kodeGuru = 'Kode guru sudah terdaftar';
      } else {
        delete newErrors.kodeGuru;
      }
    }

    if (field === 'noTelp') {
      if (value && value.trim()) {
        if (!/^08\d{10,11}$/.test(value)) {
          newErrors.noTelp = 'Nomor telepon harus 12-13 digit (08xxxxxxxxxx)';
        } else {
          delete newErrors.noTelp;
        }
      } else {
        delete newErrors.noTelp;
      }
    }

    if (field === 'waliKelasDari') {
      if (formData.role === 'Wali Kelas' && value) {
        const isKelasOccupied = guruList.some(
          guru => guru.role === 'Wali Kelas' && guru.waliKelasDari === value
        );
        
        if (isKelasOccupied) {
          const waliKelasExist = guruList.find(
            guru => guru.role === 'Wali Kelas' && guru.waliKelasDari === value
          );
          newErrors.waliKelasDari = `Kelas "${value}" sudah memiliki wali kelas (${waliKelasExist?.namaGuru})`;
        } else {
          delete newErrors.waliKelasDari;
        }
      }
    }

    setFormErrors(newErrors);
  };

  const validateForm = () => {
    const errors: {[key: string]: string} = {};
    
    if (!formData.namaGuru.trim()) {
      errors.namaGuru = 'Nama guru harus diisi';
    } else if (formData.namaGuru.trim().length < 3) {
      errors.namaGuru = 'Nama guru minimal 3 karakter';
    }
    
    if (!formData.kodeGuru.trim()) {
      errors.kodeGuru = 'Kode guru harus diisi';
    } else if (guruList.some(g => g.kodeGuru === formData.kodeGuru)) {
      errors.kodeGuru = 'Kode guru sudah terdaftar';
    }

    if (!formData.role) {
      errors.role = 'Peran harus dipilih';
    }
    
    if (formData.role === 'Guru' && !formData.keterangan) {
      errors.keterangan = 'Mata pelajaran harus dipilih';
    }
    
    if (formData.role === 'Wali Kelas') {
      if (!formData.waliKelasDari) {
        errors.waliKelasDari = 'Wali kelas dari harus dipilih';
      } else {
        const isKelasOccupied = guruList.some(
          guru => guru.role === 'Wali Kelas' && guru.waliKelasDari === formData.waliKelasDari
        );
        
        if (isKelasOccupied) {
          const waliKelasExist = guruList.find(
            guru => guru.role === 'Wali Kelas' && guru.waliKelasDari === formData.waliKelasDari
          );
          errors.waliKelasDari = `Kelas "${formData.waliKelasDari}" sudah memiliki wali kelas (${waliKelasExist?.namaGuru})`;
        }
      }
    }
    
    if (formData.role === 'Staff' && !formData.keterangan) {
      errors.keterangan = 'Bagian staff harus dipilih';
    }

    if (formData.noTelp && formData.noTelp.trim()) {
      if (!/^08\d{10,11}$/.test(formData.noTelp)) {
        errors.noTelp = 'Nomor telepon harus 12-13 digit (08xxxxxxxxxx)';
      }
    }
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // ==================== FILTERING DATA ====================
  const filteredData = guruList.filter((item) => {
    const matchSearch = 
      item.kodeGuru.toLowerCase().includes(searchValue.toLowerCase()) ||
      item.namaGuru.toLowerCase().includes(searchValue.toLowerCase()) ||
      item.keterangan.toLowerCase().includes(searchValue.toLowerCase()) ||
      item.role.toLowerCase().includes(searchValue.toLowerCase());
    const matchRole = selectedRole ? item.role === selectedRole : true;
    const matchKeterangan = selectedKeterangan ? item.keterangan === selectedKeterangan : true;
    return matchSearch && matchRole && matchKeterangan;
  });

  // ==================== EVENT HANDLERS ====================
  
  const handleNavigateToDetail = (guruId: string) => {
    const guru = guruList.find(g => g.id === guruId);
    if (guru) {
      localStorage.setItem('selectedGuru', JSON.stringify(guru));
      localStorage.removeItem('guruDataUpdated');
      if (onNavigateToDetail) {
        onNavigateToDetail(guruId);
      } else {
        onMenuClick('detail-guru');
      }
    }
  };

  const handleTambahGuru = () => {
    setFormData({
      namaGuru: '',
      kodeGuru: '',
      jenisKelamin: 'Laki-Laki',
      role: '',
      keterangan: '',
      noTelp: '',
      waliKelasDari: '',
    });
    setFormErrors({});
    setShowDuplicateWarning(false);
    setDuplicateWarningMessage('');
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setFormData({
      namaGuru: '',
      kodeGuru: '',
      jenisKelamin: 'Laki-Laki',
      role: '',
      keterangan: '',
      noTelp: '',
      waliKelasDari: '',
    });
    setFormErrors({});
    setShowDuplicateWarning(false);
    setDuplicateWarningMessage('');
  };

  const handleSubmitForm = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    if (formData.role === 'Wali Kelas') {
      const isKelasOccupied = guruList.some(
        guru => guru.role === 'Wali Kelas' && guru.waliKelasDari === formData.waliKelasDari
      );
      
      if (isKelasOccupied) {
        const waliKelasExist = guruList.find(
          guru => guru.role === 'Wali Kelas' && guru.waliKelasDari === formData.waliKelasDari
        );
        setDuplicateWarningMessage(`Kelas "${formData.waliKelasDari}" sudah memiliki wali kelas (${waliKelasExist?.namaGuru}).`);
        setShowDuplicateWarning(true);
        return;
      }
    }

    let keteranganFinal = formData.keterangan;
    if (formData.role === 'Wali Kelas') {
      keteranganFinal = formData.waliKelasDari;
    }
    
    const newGuru: Guru = {
      id: String(Math.max(0, ...guruList.map(g => parseInt(g.id) || 0)) + 1),
      kodeGuru: formData.kodeGuru.trim(),
      namaGuru: formData.namaGuru.trim(),
      keterangan: keteranganFinal,
      role: formData.role,
      noTelp: formData.noTelp.trim(),
      waliKelasDari: formData.waliKelasDari,
      jenisKelamin: formData.jenisKelamin,
    };

    setGuruList([...guruList, newGuru]);
    alert(`✓ Guru "${newGuru.namaGuru}" berhasil ditambahkan!`);
    handleCloseModal();
  };

  const handleDeleteGuru = (id: string) => {
    const guru = guruList.find(g => g.id === id);
    if (confirm(`Apakah Anda yakin ingin menghapus data guru "${guru?.namaGuru}"?`)) {
      setGuruList(prevList => prevList.filter(guru => guru.id !== id));
      alert('✓ Data guru berhasil dihapus!');
      setOpenActionId(null);
    }
  };

  // ==================== DOWNLOAD FORMAT EXCEL ====================
  const handleDownloadFormatExcel = () => {
    const link = document.createElement('a');
    link.href = '/Template_Import_Data_Guru.xlsx';
    link.download = 'Template_Import_Data_Guru.xlsx';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    setTimeout(() => {
      alert(
        'File: Template_Import_Data_Guru.xlsx\n\n' +
        'Cara Menggunakan:\n' +
        '1. Buka file dengan Microsoft Excel\n' +
        '3. Isi data di sheet "Template Import Guru"\n' +
        '5. Simpan file\n' +
        '6. Klik tombol "Impor" untuk upload'
      );
    }, 100);
  };

  // ==================== IMPORT ====================
  const handleImport = () => {
    fileInputRef.current?.click();
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    alert(`File "${file.name}" siap diimpor!`);
    e.target.value = '';
  };

  // ==================== EXPORT ====================
  const handleExportPDF = () => {
    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Data Guru Report</title>
        <style>
          body { font-family: Arial, sans-serif; margin: 20px; }
          h1 { text-align: center; color: #1E3A8A; }
          .date { text-align: center; color: #666; margin-bottom: 20px; }
          table { width: 100%; border-collapse: collapse; margin-top: 20px; }
          th { background-color: #2563EB; color: white; padding: 10px; text-align: left; }
          td { padding: 10px; border-bottom: 1px solid #ddd; }
          tr:nth-child(even) { background-color: #f5f7fa; }
          .footer { margin-top: 20px; text-align: right; color: #666; }
        </style>
      </head>
      <body>
        <h1>Laporan Data Guru</h1>
        <div class="date">Tanggal: ${new Date().toLocaleDateString('id-ID')}</div>
        <table>
          <thead>
            <tr>
              <th>No</th>
              <th>Kode Guru</th>
              <th>Nama Guru</th>
              <th>Peran</th>
              <th>Keterangan</th>
            </tr>
          </thead>
          <tbody>
            ${filteredData.map((guru, index) => `
              <tr>
                <td>${index + 1}</td>
                <td>${guru.kodeGuru}</td>
                <td>${guru.namaGuru}</td>
                <td>${guru.role}</td>
                <td>${guru.keterangan}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
        <div class="footer">
          <p>Total Guru: ${filteredData.length}</p>
          <p>Tanggal Cetak: ${new Date().toLocaleDateString('id-ID')} ${new Date().toLocaleTimeString('id-ID')}</p>
        </div>
      </body>
      </html>
    `;

    const newWindow = window.open('', '', 'width=900,height=600');
    if (newWindow) {
      newWindow.document.write(htmlContent);
      newWindow.document.close();
      setTimeout(() => {
        newWindow.print();
      }, 250);
    }
  };

  const handleOpenInExcel = () => {
    const headers = ['Kode Guru', 'Nama Guru', 'Peran', 'Keterangan'];
    
    const rows = guruList.map((guru) => [
      guru.kodeGuru,
      guru.namaGuru,
      guru.role,
      guru.keterangan,
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.map(cell => {
        if (typeof cell === 'string' && (cell.includes(',') || cell.includes('"'))) {
          return `"${cell.replace(/"/g, '""')}"`;
        }
        return cell;
      }).join(',')),
    ].join('\n');

    const BOM = '\uFEFF';
    const blob = new Blob([BOM + csvContent], { type: 'application/vnd.ms-excel' });
    const url = window.URL.createObjectURL(blob);
    
    const link = document.createElement('a');
    link.href = url;
    link.download = `Data_Guru_${new Date().toLocaleDateString('id-ID').replace(/\//g, '-')}.csv`;
    
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    setTimeout(() => {
      window.URL.revokeObjectURL(url);
    }, 100);

    setTimeout(() => {
      alert('✓ File Excel telah dibuat!');
    }, 200);
  };

  /* ===================== STYLING ===================== */
  const buttonBaseStyle = {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '6px',
    padding: '6px 12px',
    borderRadius: '6px',
    fontWeight: 600,
    fontSize: '13px',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    height: '36px',
    border: 'none',
  } as const;

  return (
    <AdminLayout
      pageTitle="Data Guru"
      currentPage={currentPage}
      onMenuClick={onMenuClick}
      user={user}
      onLogout={onLogout}
      hideBackground
    >
      {/* BACKGROUND AWAN */}
      <img 
        src={AWANKIRI} 
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          width: 220,
          zIndex: 0,
          pointerEvents: "none",
        }} 
        alt="Background awan kiri" 
      />
      
      <img 
        src={AwanBawahkanan} 
        style={{
          position: "fixed",
          bottom: 0,
          right: 0,
          width: 220,
          zIndex: 0,
          pointerEvents: "none",
        }} 
        alt="Background awan kanan bawah" 
      />

      {/* KONTEN UTAMA */}
      <div
        style={{
          background: "rgba(255,255,255,0.85)",
          backdropFilter: "blur(6px)",
          borderRadius: 16,
          padding: '16px',
          boxShadow: "0 10px 30px rgba(0,0,0,0.08)",
          border: "1px solid rgba(255,255,255,0.6)",
          display: "flex",
          flexDirection: "column",
          gap: 14,
          position: "relative",
          zIndex: 1,
          minHeight: "70vh",
        }}
      >
        {/* ============ FILTER & ACTION BUTTONS ============ */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '200px 200px 1fr auto auto auto auto',
            gap: '12px',
            alignItems: 'flex-end',
          }}
        >
          {/* Peran */}
          <div>
            <Select
              label="Peran"
              value={selectedRole}
              onChange={(value) => {
                setSelectedRole(value);
                setSelectedKeterangan('');
              }}
              options={roleOptions}
              placeholder="Semua"
            />
          </div>

          {/* Keterangan */}
          <div>
            <Select
              label={
                selectedRole === 'Guru' ? 'Mata Pelajaran' :
                selectedRole === 'Wali Kelas' ? 'Kelas' :
                selectedRole === 'Staff' ? 'Bagian' :
                'Keterangan'
              }
              value={selectedKeterangan}
              onChange={setSelectedKeterangan}
              options={getFilteredKeteranganOptions()}
              placeholder="Semua"
            />
          </div>

          {/* Empty space */}
          <div></div>

          {/* Buttons - auto layout */}
          <Button
            label="Tambahkan"
            onClick={handleTambahGuru}
            variant="primary"
          />
          
          <button
            onClick={handleDownloadFormatExcel}
            style={{
              ...buttonBaseStyle,
              backgroundColor: '#10B981',
              color: '#FFFFFF',
              border: '1px solid #10B981',
            }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLButtonElement).style.backgroundColor = '#059669';
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLButtonElement).style.backgroundColor = '#10B981';
            }}
          >
            <Download size={14} color="#FFFFFF" />
            Format Excel
          </button>

          <button
            onClick={handleImport}
            style={{
              ...buttonBaseStyle,
              backgroundColor: '#0B1221',
              color: '#FFFFFF',
              border: '1px solid #0B1221',
            }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLButtonElement).style.backgroundColor = '#1a2332';
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLButtonElement).style.backgroundColor = '#0B1221';
            }}
          >
            <Upload size={14} color="#FFFFFF" />
            Impor
          </button>

          <div style={{ position: 'relative' }}>
            <button
              onClick={() => setIsEksporDropdownOpen(!isEksporDropdownOpen)}
              style={{
                ...buttonBaseStyle,
                backgroundColor: '#0B1221',
                color: '#FFFFFF',
                border: '1px solid #0B1221',
              }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLButtonElement).style.backgroundColor = '#1a2332';
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLButtonElement).style.backgroundColor = '#0B1221';
              }}
            >
              <FileDown size={14} color="#FFFFFF" />
              Ekspor
            </button>

            {isEksporDropdownOpen && (
              <div
                style={{
                  position: 'absolute',
                  top: '100%',
                  right: 0,
                  marginTop: 4,
                  backgroundColor: '#FFFFFF',
                  borderRadius: 8,
                  boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1), 0 4px 6px -2px rgba(0,0,0,0.05)',
                  overflow: 'hidden',
                  zIndex: 20,
                  minWidth: 120,
                  border: '1px solid #E5E7EB',
                }}
              >
                <button
                  onClick={() => {
                    setIsEksporDropdownOpen(false);
                    handleExportPDF();
                  }}
                  style={{
                    width: '100%',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 8,
                    padding: '8px 12px',
                    border: 'none',
                    background: 'white',
                    cursor: 'pointer',
                    fontSize: 13,
                    color: '#111827',
                    textAlign: 'left',
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#F8FAFC')}
                  onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'white')}
                >
                  <FileText size={14} />
                  PDF
                </button>
                
                <button
                  onClick={() => {
                    setIsEksporDropdownOpen(false);
                    handleOpenInExcel();
                  }}
                  style={{
                    width: '100%',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 8,
                    padding: '8px 12px',
                    border: 'none',
                    background: 'white',
                    cursor: 'pointer',
                    fontSize: 13,
                    color: '#111827',
                    textAlign: 'left',
                    borderTop: '1px solid #F1F5F9',
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#F8FAFC')}
                  onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'white')}
                >
                  <Download size={14} />
                  Excel
                </button>
              </div>
            )}
          </div>
        </div>

        {/* ============ SEARCH INPUT ============ */}
        <div style={{ display: 'flex', flexDirection: 'column', maxWidth: '400px' }}>
          <label
            style={{
              fontSize: '13px',
              fontWeight: 500,
              color: '#252525',
              display: 'block',
              marginBottom: '4px',
            }}
          >
            Cari guru
          </label>
          <div
            style={{
              position: 'relative',
              display: 'inline-flex',
              alignItems: 'center',
              width: '100%',
            }}
          >
            <Search
              size={16}
              color="#9CA3AF"
              style={{
                position: 'absolute',
                left: '10px',
                pointerEvents: 'none',
              }}
            />
            <input
              type="text"
              placeholder="Cari guru"
              value={searchValue}
              onChange={(e) => setSearchValue(e.target.value)}
              style={{
                width: '100%',
                padding: '6px 10px 6px 32px',
                border: '1px solid #D1D5DB',
                borderRadius: '6px',
                fontSize: '13px',
                outline: 'none',
                transition: 'all 0.2s',
                backgroundColor: '#D9D9D9',
                height: '32px',
                boxSizing: 'border-box',
              }}
              onFocus={(e) => {
                e.target.style.borderColor = '#3B82F6';
                e.target.style.boxShadow = '0 0 0 3px rgba(59, 130, 246, 0.1)';
              }}
              onBlur={(e) => {
                e.target.style.borderColor = '#D1D5DB';
                e.target.style.boxShadow = 'none';
              }}
            />
          </div>
        </div>

        {/* ============ DATA TABLE ============ */}
        <div style={{ 
          borderRadius: 12, 
          overflow: 'hidden', 
          boxShadow: '0 0 0 1px #E5E7EB'
        }}>
          <table style={{
            width: '100%',
            borderCollapse: 'collapse',
            backgroundColor: '#FFFFFF',
          }}>
            <thead>
              <tr style={{
                backgroundColor: '#F3F4F6',
                borderBottom: '1px solid #E5E7EB',
              }}>
                <th style={{
                  padding: '12px 16px',
                  textAlign: 'center',
                  fontSize: '13px',
                  fontWeight: '600',
                  color: '#374151',
                  borderRight: '1px solid #E5E7EB',
                }}>No</th>
                <th style={{
                  padding: '12px 16px',
                  textAlign: 'center',
                  fontSize: '13px',
                  fontWeight: '600',
                  color: '#374151',
                  borderRight: '1px solid #E5E7EB',
                }}>Kode Guru</th>
                <th style={{
                  padding: '12px 16px',
                  textAlign: 'center',
                  fontSize: '13px',
                  fontWeight: '600',
                  color: '#374151',
                  borderRight: '1px solid #E5E7EB',
                }}>Nama Guru</th>
                <th style={{
                  padding: '12px 16px',
                  textAlign: 'center',
                  fontSize: '13px',
                  fontWeight: '600',
                  color: '#374151',
                  borderRight: '1px solid #E5E7EB',
                }}>Peran</th>
                <th style={{
                  padding: '12px 16px',
                  textAlign: 'center',
                  fontSize: '13px',
                  fontWeight: '600',
                  color: '#374151',
                  borderRight: '1px solid #E5E7EB',
                }}>Keterangan</th>
                <th style={{
                  padding: '12px 16px',
                  textAlign: 'center',
                  fontSize: '13px',
                  fontWeight: '600',
                  color: '#374151',
                }}>Aksi</th>
              </tr>
            </thead>
            <tbody>
              {filteredData.map((guru, index) => (
                <tr key={guru.id} style={{
                  borderBottom: '1px solid #E5E7EB',
                  backgroundColor: index % 2 === 0 ? '#FFFFFF' : '#F9FAFB',
                  transition: 'background-color 0.2s',
                }}
                onMouseEnter={(e) => {
                  (e.currentTarget as HTMLTableRowElement).style.backgroundColor = '#F0F4FF';
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLTableRowElement).style.backgroundColor = index % 2 === 0 ? '#FFFFFF' : '#F9FAFB';
                }}>
                  <td style={{
                    padding: '12px 16px',
                    fontSize: '13px',
                    color: '#374151',
                    textAlign: 'center',
                    borderRight: '1px solid #E5E7EB',
                  }}>{index + 1}</td>
                  <td style={{
                    padding: '12px 16px',
                    fontSize: '13px',
                    color: '#374151',
                    borderRight: '1px solid #E5E7EB',
                  }}>{guru.kodeGuru}</td>
                  <td style={{
                    padding: '12px 16px',
                    fontSize: '13px',
                    color: '#374151',
                    borderRight: '1px solid #E5E7EB',
                  }}>{guru.namaGuru}</td>
                  <td style={{
                    padding: '12px 16px',
                    fontSize: '13px',
                    color: '#374151',
                    borderRight: '1px solid #E5E7EB',
                  }}>{guru.role}</td>
                  <td style={{
                    padding: '12px 16px',
                    fontSize: '13px',
                    color: '#374151',
                    borderRight: '1px solid #E5E7EB',
                  }}>{guru.keterangan}</td>
                  <td style={{
                    padding: '12px 16px',
                    fontSize: '13px',
                    color: '#374151',
                    textAlign: 'center',
                    position: 'relative',
                  }}>
                    <button
                      onClick={() => setOpenActionId(openActionId === guru.id ? null : guru.id)}
                      style={{ 
                        border: 'none', 
                        background: 'transparent', 
                        cursor: 'pointer',
                        padding: '4px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      <MoreVertical size={20} strokeWidth={1.5} />
                    </button>

                    {openActionId === guru.id && (
                      <div
                        style={{
                          position: 'absolute',
                          top: '100%',
                          right: 0,
                          marginTop: 6,
                          background: '#FFFFFF',
                          borderRadius: 8,
                          boxShadow: '0 10px 15px rgba(0,0,0,0.1)',
                          minWidth: 180,
                          zIndex: 10,
                          overflow: 'hidden',
                          border: '1px solid #E2E8F0',
                        }}
                      >
                        <button
                          onClick={() => handleNavigateToDetail(guru.id)}
                          style={{
                            width: '100%',
                            padding: '12px 16px',
                            border: 'none',
                            background: 'none',
                            textAlign: 'left',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '10px',
                            color: '#0F172A',
                            fontSize: '14px',
                            fontWeight: '500',
                            transition: 'all 0.2s ease',
                            borderBottom: '1px solid #F1F5F9',
                          }}
                          onMouseEnter={(e) => {
                            (e.currentTarget as HTMLButtonElement).style.backgroundColor = '#F0F4FF';
                            (e.currentTarget as HTMLButtonElement).style.color = '#2563EB';
                          }}
                          onMouseLeave={(e) => {
                            (e.currentTarget as HTMLButtonElement).style.backgroundColor = '#FFFFFF';
                            (e.currentTarget as HTMLButtonElement).style.color = '#0F172A';
                          }}
                        >
                          <Eye size={16} color="#64748B" strokeWidth={2} />
                          Lihat Detail
                        </button>
                        
                        <button
                          onClick={() => handleDeleteGuru(guru.id)}
                          style={{
                            width: '100%',
                            padding: '12px 16px',
                            border: 'none',
                            background: 'none',
                            textAlign: 'left',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '10px',
                            color: '#0F172A',
                            fontSize: '14px',
                            fontWeight: '500',
                            transition: 'all 0.2s ease',
                          }}
                          onMouseEnter={(e) => {
                            (e.currentTarget as HTMLButtonElement).style.backgroundColor = '#FEF2F2';
                            (e.currentTarget as HTMLButtonElement).style.color = '#DC2626';
                          }}
                          onMouseLeave={(e) => {
                            (e.currentTarget as HTMLButtonElement).style.backgroundColor = '#FFFFFF';
                            (e.currentTarget as HTMLButtonElement).style.color = '#0F172A';
                          }}
                        >
                          <Trash2 size={16} color="#64748B" strokeWidth={2} />
                          Hapus
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* ============ HIDDEN FILE INPUT ============ */}
      <input 
        type="file" 
        ref={fileInputRef} 
        style={{ display: 'none' }}
        onChange={handleFileSelect} 
        accept=".csv"
      />

      {/* ============ MODAL TAMBAH GURU ============ */}
      {isModalOpen && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.7)',
            backdropFilter: 'blur(4px)',
            WebkitBackdropFilter: 'blur(4px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 9999,
            padding: '20px',
            overflow: 'auto',
          }}
          onClick={handleCloseModal}
        >
          <div
            style={{
              backgroundColor: '#0B1221',
              borderRadius: '16px',
              padding: '20px',
              maxWidth: '480px',
              width: '100%',
              maxHeight: 'calc(100vh - 40px)',
              display: 'flex',
              flexDirection: 'column',
              boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
              marginTop: '60px',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '14px',
              flexShrink: 0,
            }}>
              <h2 style={{
                margin: 0,
                fontSize: '18px',
                fontWeight: '700',
                color: '#FFFFFF',
                letterSpacing: '-0.3px',
              }}>
                Tambah Data Guru
              </h2>
              <button
                onClick={handleCloseModal}
                style={{
                  background: 'rgba(255, 255, 255, 0.1)',
                  border: 'none',
                  cursor: 'pointer',
                  padding: '6px',
                  borderRadius: '6px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  transition: 'all 0.2s',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.2)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.1)';
                }}
              >
                <X size={18} color="#FFFFFF" />
              </button>
            </div>

            {/* Warning tentang duplikasi wali kelas */}
            {showDuplicateWarning && (
              <div style={{
                backgroundColor: '#FEF3C7',
                border: '1px solid #F59E0B',
                borderRadius: '8px',
                padding: '10px 14px',
                marginBottom: '14px',
                display: 'flex',
                alignItems: 'flex-start',
                gap: '10px',
              }}>
                <div style={{
                  backgroundColor: '#F59E0B',
                  borderRadius: '50%',
                  width: '20px',
                  height: '20px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                  marginTop: '2px',
                }}>
                  <span style={{ color: '#FFFFFF', fontSize: '12px', fontWeight: 'bold' }}>!</span>
                </div>
                <div style={{ flex: 1 }}>
                  <p style={{
                    margin: 0,
                    fontSize: '12px',
                    color: '#92400E',
                    fontWeight: '500',
                    lineHeight: '1.4',
                  }}>
                    {duplicateWarningMessage}
                  </p>
                  <p style={{
                    margin: '4px 0 0 0',
                    fontSize: '11px',
                    color: '#92400E',
                    lineHeight: '1.3',
                  }}>
                    Setiap kelas hanya boleh memiliki satu wali kelas. Silakan pilih kelas lain atau edit data wali kelas yang sudah ada.
                  </p>
                </div>
                <button
                  onClick={() => setShowDuplicateWarning(false)}
                  style={{
                    background: 'transparent',
                    border: 'none',
                    cursor: 'pointer',
                    padding: '2px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                  }}
                >
                  <X size={14} color="#92400E" />
                </button>
              </div>
            )}

            {/* Scrollable white card container untuk form */}
            <div style={{
              backgroundColor: '#FFFFFF',
              borderRadius: '10px',
              padding: '16px',
              boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
              overflowY: 'auto',
              maxHeight: 'calc(100vh - 180px)',
            }}>
              <form onSubmit={handleSubmitForm}>
                <div style={{ 
                  display: 'grid', 
                  gridTemplateColumns: '1fr', 
                  gap: '12px'
                }}>
                  {/* Nama Guru */}
                  <div>
                    <label style={{
                      display: 'block',
                      fontSize: '12px',
                      fontWeight: '600',
                      color: '#374151',
                      marginBottom: '5px',
                    }}>
                      Nama Guru <span style={{ color: '#EF4444' }}>*</span>
                    </label>
                    <input
                      type="text"
                      value={formData.namaGuru}
                      onChange={(e) => {
                        setFormData({ ...formData, namaGuru: e.target.value });
                        validateField('namaGuru', e.target.value);
                      }}
                      placeholder="Masukkan nama lengkap guru"
                      style={{
                        width: '100%',
                        padding: '9px 12px',
                        border: formErrors.namaGuru ? '2px solid #EF4444' : '1px solid #D1D5DB',
                        borderRadius: '6px',
                        fontSize: '13px',
                        outline: 'none',
                        boxSizing: 'border-box',
                        backgroundColor: '#FFFFFF',
                      }}
                    />
                    {formErrors.namaGuru && (
                      <p style={{ color: '#EF4444', fontSize: '10px', marginTop: '3px', marginBottom: 0 }}>
                        {formErrors.namaGuru}
                      </p>
                    )}
                  </div>

                  {/* Kode Guru */}
                  <div>
                    <label style={{
                      display: 'block',
                      fontSize: '12px',
                      fontWeight: '600',
                      color: '#374151',
                      marginBottom: '5px',
                    }}>
                      Kode Guru <span style={{ color: '#EF4444' }}>*</span>
                    </label>
                    <input
                      type="text"
                      value={formData.kodeGuru}
                      onChange={(e) => {
                        setFormData({ ...formData, kodeGuru: e.target.value });
                        validateField('kodeGuru', e.target.value);
                      }}
                      placeholder="Masukkan kode guru"
                      style={{
                        width: '100%',
                        padding: '9px 12px',
                        border: formErrors.kodeGuru ? '2px solid #EF4444' : '1px solid #D1D5DB',
                        borderRadius: '6px',
                        fontSize: '13px',
                        outline: 'none',
                        boxSizing: 'border-box',
                        backgroundColor: '#FFFFFF',
                      }}
                    />
                    {formErrors.kodeGuru && (
                      <p style={{ color: '#EF4444', fontSize: '10px', marginTop: '3px', marginBottom: 0 }}>
                        {formErrors.kodeGuru}
                      </p>
                    )}
                  </div>

                  {/* Jenis Kelamin */}
                  <div>
                    <label style={{
                      display: 'block',
                      fontSize: '12px',
                      fontWeight: '600',
                      color: '#374151',
                      marginBottom: '5px',
                    }}>
                      Jenis Kelamin <span style={{ color: '#EF4444' }}>*</span>
                    </label>
                    <select
                      value={formData.jenisKelamin}
                      onChange={(e) => setFormData({ ...formData, jenisKelamin: e.target.value })}
                      style={{
                        width: '100%',
                        padding: '9px 12px',
                        border: '1px solid #D1D5DB',
                        borderRadius: '6px',
                        fontSize: '13px',
                        outline: 'none',
                        cursor: 'pointer',
                        boxSizing: 'border-box',
                        backgroundColor: '#FFFFFF',
                      }}
                    >
                      <option value="Laki-Laki">Laki-Laki</option>
                      <option value="Perempuan">Perempuan</option>
                    </select>
                  </div>

                  {/* Peran */}
                  <div>
                    <label style={{
                      display: 'block',
                      fontSize: '12px',
                      fontWeight: '600',
                      color: '#374151',
                      marginBottom: '5px',
                    }}>
                      Peran <span style={{ color: '#EF4444' }}>*</span>
                    </label>
                    <select
                      value={formData.role}
                      onChange={(e) => {
                        setFormData({ 
                          ...formData, 
                          role: e.target.value,
                          keterangan: '',
                          waliKelasDari: ''
                        });
                        setShowDuplicateWarning(false);
                      }}
                      style={{
                        width: '100%',
                        padding: '9px 12px',
                        border: formErrors.role ? '2px solid #EF4444' : '1px solid #D1D5DB',
                        borderRadius: '6px',
                        fontSize: '13px',
                        outline: 'none',
                        cursor: 'pointer',
                        boxSizing: 'border-box',
                        backgroundColor: '#FFFFFF',
                      }}
                    >
                      <option value="">Pilih Peran</option>
                      <option value="Guru">Guru</option>
                      <option value="Wali Kelas">Wali Kelas</option>
                      <option value="Staff">Staff</option>
                    </select>
                    {formErrors.role && (
                      <p style={{ color: '#EF4444', fontSize: '10px', marginTop: '3px', marginBottom: 0 }}>
                        {formErrors.role}
                      </p>
                    )}
                  </div>

                  {/* Mata Pelajaran (hanya untuk Guru) */}
                  {formData.role === 'Guru' && (
                    <div>
                      <label style={{
                        display: 'block',
                        fontSize: '12px',
                        fontWeight: '600',
                        color: '#374151',
                        marginBottom: '5px',
                      }}>
                        Mata Pelajaran <span style={{ color: '#EF4444' }}>*</span>
                      </label>
                      <select
                        value={formData.keterangan}
                        onChange={(e) => setFormData({ ...formData, keterangan: e.target.value })}
                        style={{
                          width: '100%',
                          padding: '9px 12px',
                          border: formErrors.keterangan ? '2px solid #EF4444' : '1px solid #D1D5DB',
                          borderRadius: '6px',
                          fontSize: '13px',
                          outline: 'none',
                          cursor: 'pointer',
                          boxSizing: 'border-box',
                          backgroundColor: '#FFFFFF',
                        }}
                      >
                        <option value="">Pilih Mata Pelajaran</option>
                        {mataPelajaranOptions.map(opt => (
                          <option key={opt.value} value={opt.value}>{opt.label}</option>
                        ))}
                      </select>
                      {formErrors.keterangan && (
                        <p style={{ color: '#EF4444', fontSize: '10px', marginTop: '3px', marginBottom: 0 }}>
                          {formErrors.keterangan}
                        </p>
                      )}
                    </div>
                  )}

                  {/* Wali Kelas (hanya untuk Wali Kelas) */}
                  {formData.role === 'Wali Kelas' && (
                    <div>
                      <label style={{
                        display: 'block',
                        fontSize: '12px',
                        fontWeight: '600',
                        color: '#374151',
                        marginBottom: '5px',
                      }}>
                        Wali Kelas Dari <span style={{ color: '#EF4444' }}>*</span>
                      </label>
                      <select
                        value={formData.waliKelasDari}
                        onChange={(e) => {
                          setFormData({ ...formData, waliKelasDari: e.target.value });
                          validateField('waliKelasDari', e.target.value);
                          setShowDuplicateWarning(false);
                        }}
                        style={{
                          width: '100%',
                          padding: '9px 12px',
                          border: formErrors.waliKelasDari ? '2px solid #EF4444' : '1px solid #D1D5DB',
                          borderRadius: '6px',
                          fontSize: '13px',
                          outline: 'none',
                          cursor: 'pointer',
                          boxSizing: 'border-box',
                          backgroundColor: '#FFFFFF',
                        }}
                      >
                        <option value="">Pilih Kelas</option>
                        {getAvailableKelasOptions().map((kelas, index) => (
                          <option key={index} value={kelas}>
                            {kelas}
                          </option>
                        ))}
                      </select>
                      {formErrors.waliKelasDari && (
                        <p style={{ color: '#EF4444', fontSize: '10px', marginTop: '3px', marginBottom: 0 }}>
                          {formErrors.waliKelasDari}
                        </p>
                      )}
                      <div style={{
                        marginTop: '4px',
                        padding: '6px 8px',
                        backgroundColor: '#F3F4F6',
                        borderRadius: '4px',
                        fontSize: '10px',
                        color: '#6B7280',
                        border: '1px solid #E5E7EB',
                      }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                          <span style={{ fontWeight: '600' }}>Info:</span>
                          <span>Kelas yang sudah memiliki wali kelas tidak akan ditampilkan</span>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Bagian Staff (hanya untuk Staff) */}
                  {formData.role === 'Staff' && (
                    <div>
                      <label style={{
                        display: 'block',
                        fontSize: '12px',
                        fontWeight: '600',
                        color: '#374151',
                        marginBottom: '5px',
                      }}>
                        Bagian Staff <span style={{ color: '#EF4444' }}>*</span>
                      </label>
                      <select
                        value={formData.keterangan}
                        onChange={(e) => setFormData({ ...formData, keterangan: e.target.value })}
                        style={{
                          width: '100%',
                          padding: '9px 12px',
                          border: formErrors.keterangan ? '2px solid #EF4444' : '1px solid #D1D5DB',
                          borderRadius: '6px',
                          fontSize: '13px',
                          outline: 'none',
                          cursor: 'pointer',
                          boxSizing: 'border-box',
                          backgroundColor: '#FFFFFF',
                        }}
                      >
                        <option value="">Pilih Bagian</option>
                        {bagianStaffOptions.map(opt => (
                          <option key={opt.value} value={opt.value}>{opt.label}</option>
                        ))}
                      </select>
                      {formErrors.keterangan && (
                        <p style={{ color: '#EF4444', fontSize: '10px', marginTop: '3px', marginBottom: 0 }}>
                          {formErrors.keterangan}
                        </p>
                      )}
                    </div>
                  )}

                  {/* No. Telepon */}
                  <div>
                    <label style={{
                      display: 'block',
                      fontSize: '12px',
                      fontWeight: '600',
                      color: '#374151',
                      marginBottom: '5px',
                    }}>
                      No. Telepon <span style={{ color: '#9CA3AF', fontSize: '10px' }}>(Opsional)</span>
                    </label>
                    <input
                      type="tel"
                      value={formData.noTelp}
                      onChange={(e) => {
                        const value = e.target.value.replace(/\D/g, '').slice(0, 13);
                        setFormData({ ...formData, noTelp: value });
                        validateField('noTelp', value);
                      }}
                      placeholder="08xxxxxxxxxx (12-13 digit)"
                      maxLength={13}
                      style={{
                        width: '100%',
                        padding: '9px 12px',
                        border: formErrors.noTelp ? '2px solid #EF4444' : '1px solid #D1D5DB',
                        borderRadius: '6px',
                        fontSize: '13px',
                        outline: 'none',
                        boxSizing: 'border-box',
                        backgroundColor: '#FFFFFF',
                      }}
                    />
                    {formErrors.noTelp && (
                      <p style={{ color: '#EF4444', fontSize: '10px', marginTop: '3px', marginBottom: 0 }}>
                        {formErrors.noTelp}
                      </p>
                    )}
                  </div>
                </div>

                {/* Action Buttons */}
                <div style={{
                  display: 'flex',
                  gap: '10px',
                  marginTop: '16px',
                }}>
                  <button
                    type="button"
                    onClick={handleCloseModal}
                    style={{
                      flex: 1,
                      padding: '9px 18px',
                      backgroundColor: '#F3F4F6',
                      color: '#374151',
                      border: 'none',
                      borderRadius: '6px',
                      fontSize: '13px',
                      fontWeight: '600',
                      cursor: 'pointer',
                      transition: 'all 0.2s',
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = '#E5E7EB';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = '#F3F4F6';
                    }}
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    style={{
                      flex: 1,
                      padding: '9px 18px',
                      backgroundColor: '#2563EB',
                      color: '#FFFFFF',
                      border: 'none',
                      borderRadius: '6px',
                      fontSize: '13px',
                      fontWeight: '600',
                      cursor: 'pointer',
                      transition: 'all 0.2s',
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = '#1D4ED8';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = '#2563EB';
                    }}
                  >
                    Simpan Data
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}