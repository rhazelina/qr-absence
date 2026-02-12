// FILE: SiswaAdmin.tsx - Halaman Admin untuk mengelola data siswa
// ✅ PERBAIKAN: Layout lebih pendek dan kompak
// ✅ PERBAIKAN: Form input tahun angkatan dengan dropdown scrollable
// ✅ PERBAIKAN: Validasi real-time pada form
// ✅ PERBAIKAN: Upload file .csv yang lebih user friendly
import { useState, useRef, useEffect } from 'react';
import AdminLayout from '../../component/Admin/AdminLayout';
import { Button } from '../../component/Shared/Button';
import { Select } from '../../component/Shared/Select';
import { Table } from '../../component/Shared/Table';
import { 
  MoreVertical,
  Trash2,
  Eye,
  FileDown,
  Upload,
  FileText,
  Download,
  Search,
  X,
  ChevronUp,
  ChevronDown
} from 'lucide-react';

/* ============ IMPORT GAMBAR AWAN ============ */
import AWANKIRI from '../../assets/Icon/AWANKIRI.png';
import AwanBawahkanan from '../../assets/Icon/AwanBawahkanan.png';

/* ===================== INTERFACE DEFINITIONS ===================== */
interface User {
  role: string;
  name: string;
}

interface Siswa {
  id: string;
  namaSiswa: string;
  nisn: string;
  jenisKelamin: string;
  noTelp?: string;
  jurusan: string;
  jurusanId?: string;
  tahunAngkatan: string;
  kelas: string;
}

interface SiswaAdminProps {
  user: User;
  onLogout: () => void;
  currentPage: string;
  onMenuClick: (page: string) => void;
  onNavigateToDetail?: (siswaId: string) => void;
}

/* ===================== DUMMY DATA ===================== */
const initialSiswaData: Siswa[] = [
  {
    id: '1',
    namaSiswa: 'Abdul',
    nisn: '0075586699',
    jenisKelamin: 'Laki-Laki',
    noTelp: '081234567890',
    jurusan: 'Rekayasa Perangkat Lunak',
    jurusanId: 'rpl',
    tahunAngkatan: '2023-2026',
    kelas: '11',
  },
  {
    id: '2',
    namaSiswa: 'Ahmad',
    nisn: '0075586700',
    jenisKelamin: 'Laki-Laki',
    noTelp: '082345678901',
    jurusan: 'Teknik Komputer dan Jaringan',
    jurusanId: 'tkj',
    tahunAngkatan: '2023-2026',
    kelas: '11',
  },
  {
    id: '3',
    namaSiswa: 'Siti',
    nisn: '0075586701',
    jenisKelamin: 'Perempuan',
    noTelp: '083456789012',
    jurusan: 'Rekayasa Perangkat Lunak',
    jurusanId: 'rpl',
    tahunAngkatan: '2024-2027',
    kelas: '10',
  },
];

/* ===================== OPTIONS & CONSTANTS ===================== */
const jurusanOptions = [
  { value: 'rpl', label: 'Rekayasa Perangkat Lunak' },
  { value: 'tkj', label: 'Teknik Komputer dan Jaringan' },
  { value: 'mm', label: 'Multimedia' },
  { value: 'elektro', label: 'Teknik Elektro' },
  { value: 'mesin', label: 'Teknik Mesin' },
];

const kelasOptions = [
  { value: '10', label: 'Kelas 10' },
  { value: '11', label: 'Kelas 11' },
  { value: '12', label: 'Kelas 12' },
];

const jenisKelaminOptions = [
  { value: 'Laki-Laki', label: 'Laki-Laki' },
  { value: 'Perempuan', label: 'Perempuan' },
];

// Generate tahun angkatan options dari 2018 sampai 2030
const startYear = 2018;
const endYear = 2030;
const tahunOptions = Array.from({ length: endYear - startYear + 1 }, (_, i) => String(startYear + i));

/* ===================== MAIN COMPONENT ===================== */
export default function SiswaAdmin({
  user,
  onLogout,
  currentPage,
  onMenuClick,
  onNavigateToDetail,
}: SiswaAdminProps) {
  // ==================== STATE MANAGEMENT ====================
  const [searchValue, setSearchValue] = useState('');
  const [selectedJurusan, setSelectedJurusan] = useState('');
  const [selectedKelas, setSelectedKelas] = useState('');
  const [isEksporDropdownOpen, setIsEksporDropdownOpen] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [siswaList, setSiswaList] = useState<Siswa[]>(initialSiswaData);
  const [openActionId, setOpenActionId] = useState<string | null>(null);
  
  // State untuk form input tahun angkatan (custom dropdown)
  const [visibleTahunMulai, setVisibleTahunMulai] = useState('2023');
  const [visibleTahunAkhir, setVisibleTahunAkhir] = useState('2026');
  
  const [formData, setFormData] = useState({
    namaSiswa: '',
    nisn: '',
    jenisKelamin: 'Laki-Laki',
    noTelp: '',
    jurusanId: '',
    kelas: '',
    tahunMulai: '2023',
    tahunAkhir: '2026',
  });
  
  const [formErrors, setFormErrors] = useState<{[key: string]: string}>({});
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  // ==================== LISTEN TO UPDATES FROM DETAIL PAGE ====================
  useEffect(() => {
    // Fungsi untuk handle event 'siswaUpdated'
    const handleSiswaUpdate = (event: Event) => {
      const customEvent = event as CustomEvent;
      if (customEvent.detail && customEvent.detail.updatedSiswa) {
        const updatedSiswa = customEvent.detail.updatedSiswa;
        setSiswaList(prevList => 
          prevList.map(siswa => 
            siswa.id === updatedSiswa.id ? {
              ...siswa,
              ...updatedSiswa,
              jurusan: jurusanOptions.find(j => j.value === updatedSiswa.jurusanId)?.label || siswa.jurusan
            } : siswa
          )
        );
      }
    };

    // Fungsi untuk cek localStorage update
    const checkLocalStorageUpdate = () => {
      const savedSiswa = localStorage.getItem('selectedSiswa');
      const updateFlag = localStorage.getItem('siswaDataUpdated');
      
      if (savedSiswa && updateFlag === 'true') {
        try {
          const updatedSiswa = JSON.parse(savedSiswa);
          setSiswaList(prevList => 
            prevList.map(siswa => 
              siswa.id === updatedSiswa.id ? {
                ...siswa,
                ...updatedSiswa,
                jurusan: jurusanOptions.find(j => j.value === updatedSiswa.jurusanId)?.label || siswa.jurusan
              } : siswa
            )
          );
          // Clear flag update tapi jangan hapus data siswa agar detail page tetap bisa akses
          localStorage.removeItem('siswaDataUpdated');
        } catch (error) {
          console.error('Error parsing updated siswa:', error);
        }
      }
    };

    // Initial check
    checkLocalStorageUpdate();

    // Listen to custom event
    window.addEventListener('siswaUpdated', handleSiswaUpdate as EventListener);
    
    // Poll localStorage changes (karena storage event hanya trigger di tab berbeda)
    window.addEventListener('storage', checkLocalStorageUpdate);
    const interval = setInterval(checkLocalStorageUpdate, 500);
    
    return () => {
      window.removeEventListener('siswaUpdated', handleSiswaUpdate as EventListener);
      window.removeEventListener('storage', checkLocalStorageUpdate);
      clearInterval(interval);
    };
  }, []);

  // Update visible years when formData changes (misal saat edit - though here only Add is implemented in this snippet)
  useEffect(() => {
    if (isModalOpen) {
      if (formData.tahunMulai) setVisibleTahunMulai(formData.tahunMulai);
      if (formData.tahunAkhir) setVisibleTahunAkhir(formData.tahunAkhir);
    }
  }, [isModalOpen, formData.tahunMulai, formData.tahunAkhir]);

  // ==================== FORM VALIDATION WITH REAL-TIME ====================
  const validateField = (field: string, value: string) => {
    const newErrors = { ...formErrors };

    if (field === 'namaSiswa') {
      if (!value.trim()) {
        newErrors.namaSiswa = 'Nama siswa harus diisi';
      } else if (value.trim().length < 3) {
        newErrors.namaSiswa = 'Nama siswa minimal 3 karakter';
      } else {
        delete newErrors.namaSiswa;
      }
    }

    if (field === 'nisn') {
      if (!value.trim()) {
        newErrors.nisn = 'NISN harus diisi';
      } else if (!/^\d{10}$/.test(value.trim())) {
        newErrors.nisn = 'NISN harus 10 digit angka';
      } else if (siswaList.some(s => s.nisn === value.trim())) {
        newErrors.nisn = 'NISN sudah terdaftar';
      } else {
        delete newErrors.nisn;
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

    if (field === 'jurusanId') {
      if (!value) {
        newErrors.jurusanId = 'Jurusan harus dipilih';
      } else {
        delete newErrors.jurusanId;
      }
    }

    if (field === 'kelas') {
      if (!value) {
        newErrors.kelas = 'Kelas harus dipilih';
      } else {
        delete newErrors.kelas;
      }
    }

    setFormErrors(newErrors);
  };

  const validateForm = () => {
    const errors: {[key: string]: string} = {};
    
    if (!formData.namaSiswa.trim()) {
      errors.namaSiswa = 'Nama siswa harus diisi';
    } else if (formData.namaSiswa.trim().length < 3) {
      errors.namaSiswa = 'Nama siswa minimal 3 karakter';
    }
    
    if (!formData.nisn.trim()) {
      errors.nisn = 'NISN harus diisi';
    } else if (!/^\d{10}$/.test(formData.nisn.trim())) {
      errors.nisn = 'NISN harus 10 digit angka';
    } else if (siswaList.some(s => s.nisn === formData.nisn.trim())) {
      errors.nisn = 'NISN sudah terdaftar';
    }

    if (formData.noTelp && formData.noTelp.trim()) {
      if (!/^08\d{10,11}$/.test(formData.noTelp)) {
        errors.noTelp = 'Nomor telepon harus 12-13 digit (08xxxxxxxxxx)';
      }
    }

    if (!formData.jurusanId) errors.jurusanId = 'Jurusan harus dipilih';
    if (!formData.kelas) errors.kelas = 'Kelas harus dipilih';
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // ==================== FILTERING DATA ====================
  const filteredData = siswaList.filter((item) => {
    const matchSearch = 
      item.namaSiswa.toLowerCase().includes(searchValue.toLowerCase()) ||
      item.nisn.includes(searchValue) ||
      item.jurusan.toLowerCase().includes(searchValue.toLowerCase());
      
    const matchJurusan = selectedJurusan 
      ? item.jurusanId === selectedJurusan || item.jurusan.toLowerCase().includes(selectedJurusan.toLowerCase())
      : true;
      
    const matchKelas = selectedKelas ? item.kelas === selectedKelas : true;
    
    return matchSearch && matchJurusan && matchKelas;
  });

  // ==================== EVENT HANDLERS ====================
  
  const handleNavigateToDetail = (siswaId: string) => {
    const siswa = siswaList.find(s => s.id === siswaId);
    if (siswa) {
      // Simpan data siswa ke localStorage untuk diambil oleh halaman detail
      localStorage.setItem('selectedSiswa', JSON.stringify(siswa));
      // Reset flag update
      localStorage.removeItem('siswaDataUpdated');
      
      if (onNavigateToDetail) {
        onNavigateToDetail(siswaId);
      } else {
        onMenuClick('detail-siswa');
      }
    }
  };

  const handleTambahSiswa = () => {
    setFormData({
      namaSiswa: '',
      nisn: '',
      jenisKelamin: 'Laki-Laki',
      noTelp: '',
      jurusanId: '',
      kelas: '',
      tahunMulai: '2023',
      tahunAkhir: '2026',
    });
    setFormErrors({});
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setFormErrors({});
  };

  const handleSubmitForm = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    const selectedJurusan = jurusanOptions.find(j => j.value === formData.jurusanId);
    
    const newSiswa: Siswa = {
      id: String(Math.max(0, ...siswaList.map(s => parseInt(s.id) || 0)) + 1),
      namaSiswa: formData.namaSiswa.trim(),
      nisn: formData.nisn.trim(),
      jenisKelamin: formData.jenisKelamin,
      noTelp: formData.noTelp.trim(),
      jurusan: selectedJurusan?.label || '',
      jurusanId: formData.jurusanId,
      tahunAngkatan: `${formData.tahunMulai}-${formData.tahunAkhir}`,
      kelas: formData.kelas,
    };

    setSiswaList([...siswaList, newSiswa]);
    alert(`✓ Siswa "${newSiswa.namaSiswa}" berhasil ditambahkan!`);
    handleCloseModal();
  };

  const handleDeleteSiswa = (id: string) => {
    const siswa = siswaList.find(s => s.id === id);
    if (confirm(`Apakah Anda yakin ingin menghapus data siswa "${siswa?.namaSiswa}"?`)) {
      setSiswaList(prevList => prevList.filter(s => s.id !== id));
      alert('✓ Data siswa berhasil dihapus!');
      setOpenActionId(null);
    }
  };

  // ==================== DOWNLOAD FORMAT EXCEL ====================
  const handleDownloadFormatExcel = () => {
    const link = document.createElement('a');
    link.href = '/Template_Import_Data_Siswa.xlsx';
    link.download = 'Template_Import_Data_Siswa.xlsx';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    setTimeout(() => {
      alert(
        'File: Template_Import_Data_Siswa.xlsx\n\n' +
        'Cara Menggunakan:\n' +
        '1. Buka file dengan Microsoft Excel\n' +
        '3. Isi data di sheet "Template Import Siswa"\n' +
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

    const reader = new FileReader();
    
    reader.onload = (event) => {
      try {
        const text = event.target?.result as string;
        const lines = text.split('\n').filter(line => line.trim());
        const headers = lines[0].split(',').map(h => h.trim().toLowerCase());
        
        // Simple validation mapping
        const namaSiswaIdx = headers.findIndex(h => h.includes('nama'));
        const nisnIdx = headers.findIndex(h => h.includes('nisn'));
        const jenisKelaminIdx = headers.findIndex(h => h.includes('jenis') || h.includes('kelamin'));
        const noTelpIdx = headers.findIndex(h => h.includes('telp') || h.includes('telepon'));
        const jurusanIdx = headers.findIndex(h => h.includes('jurusan') || h.includes('keahlian'));
        const kelasIdx = headers.findIndex(h => h.includes('tingkatan') || h.includes('kelas'));
        const tahunAngkatanIdx = headers.findIndex(h => h.includes('tahun') || h.includes('angkatan'));

        if (namaSiswaIdx === -1 || nisnIdx === -1) {
          alert('❌ File harus memiliki kolom "Nama Siswa" dan "NISN"');
          return;
        }

        const newSiswa: Siswa[] = [];
        const errors: string[] = [];
        
        for (let i = 1; i < lines.length; i++) {
          const values = lines[i].split(',').map(v => v.trim());
          
          if (!values[namaSiswaIdx] || values[namaSiswaIdx].toLowerCase().includes('contoh')) continue;
          
          const nisn = values[nisnIdx];
          
          // Validate NISN 10 digit
          if (!/^\d{10}$/.test(nisn)) {
            errors.push(`Baris ${i + 1}: NISN "${nisn}" tidak valid (harus 10 digit)`);
            continue;
          }
          
          // Check Duplicate
          if (siswaList.some(s => s.nisn === nisn) || newSiswa.some(s => s.nisn === nisn)) {
            errors.push(`Baris ${i + 1}: NISN "${nisn}" sudah terdaftar`);
            continue;
          }

          // Map Jurusan
          const jurusanValue = jurusanIdx !== -1 ? values[jurusanIdx] : '';
          const jurusanId = jurusanOptions.find(j => 
            j.label.toLowerCase().includes(jurusanValue.toLowerCase()) ||
            jurusanValue.toLowerCase().includes(j.value.toLowerCase())
          )?.value || '';

          if (!jurusanId) {
            errors.push(`Baris ${i + 1}: Jurusan "${jurusanValue}" tidak ditemukan`);
            continue;
          }

          // Map Kelas
          const kelasValue = kelasIdx !== -1 ? values[kelasIdx].replace(/\D/g, '') : '';
          if (!['10', '11', '12'].includes(kelasValue)) {
            errors.push(`Baris ${i + 1}: Kelas "${kelasValue}" tidak valid (harus 10, 11, atau 12)`);
            continue;
          }

          // Map Jenis Kelamin
          let jenisKelamin = jenisKelaminIdx !== -1 ? values[jenisKelaminIdx].toUpperCase() : 'L';
          if (jenisKelamin.includes('LAKI') || jenisKelamin === 'L') {
            jenisKelamin = 'L';
          } else if (jenisKelamin.includes('PEREMPUAN') || jenisKelamin === 'P') {
            jenisKelamin = 'P';
          } else {
            jenisKelamin = 'L'; // Default
          }

          const noTelp = noTelpIdx !== -1 ? values[noTelpIdx].replace(/\D/g, '') : '';
          const tahunAngkatan = tahunAngkatanIdx !== -1 ? values[tahunAngkatanIdx] : '2023-2026';

          const newRecord: Siswa = {
            id: String(Math.max(0, ...siswaList.map(s => parseInt(s.id) || 0)) + newSiswa.length + 1),
            namaSiswa: values[namaSiswaIdx],
            nisn: nisn,
            jenisKelamin: jenisKelamin,
            noTelp: noTelp,
            jurusan: jurusanOptions.find(j => j.value === jurusanId)?.label || '',
            jurusanId: jurusanId,
            tahunAngkatan: tahunAngkatan,
            kelas: kelasValue,
          };
          
          newSiswa.push(newRecord);
        }

        if (newSiswa.length > 0) {
          setSiswaList([...siswaList, ...newSiswa]);
          let message = `✓ Berhasil mengimpor ${newSiswa.length} data siswa!`;
          if (errors.length > 0) {
            message += `\n\n⚠️ Terdapat ${errors.length} data yang gagal diimpor:\n` + errors.slice(0, 5).join('\n') + (errors.length > 5 ? '\n...' : '');
          }
          alert(message);
        } else {
          alert('❌ Tidak ada data valid yang dapat diimpor.\n\n' + errors.slice(0, 10).join('\n'));
        }

      } catch (error) {
        console.error('Error parsing CSV:', error);
        alert('❌ Gagal membaca file CSV. Pastikan format file benar.');
      }
    };
    
    reader.readAsText(file);
    e.target.value = ''; // Reset input
  };

  // ==================== EXPORT ====================
  const handleExportPDF = () => {
    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Data Siswa Report</title>
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
        <h1>Laporan Data Siswa</h1>
        <div class="date">Tanggal: ${new Date().toLocaleDateString('id-ID')}</div>
        <table>
          <thead>
            <tr>
              <th>No</th>
              <th>NISN</th>
              <th>Nama Siswa</th>
              <th>Kelas</th>
              <th>Jurusan</th>
              <th>JK</th>
              <th>Thn Angkatan</th>
            </tr>
          </thead>
          <tbody>
            ${filteredData.map((siswa, index) => `
              <tr>
                <td>${index + 1}</td>
                <td>${siswa.nisn}</td>
                <td>${siswa.namaSiswa}</td>
                <td>${siswa.kelas}</td>
                <td>${siswa.jurusan}</td>
                <td>${siswa.jenisKelamin === 'Laki-Laki' ? 'L' : 'P'}</td>
                <td>${siswa.tahunAngkatan}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
        <div class="footer">
          <p>Total Siswa: ${filteredData.length}</p>
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
    const headers = ['NISN', 'Nama Siswa', 'Kelas', 'Jurusan', 'Jenis Kelamin', 'Tahun Angkatan', 'No. Telepon'];
    
    const rows = filteredData.map((siswa) => [
      siswa.nisn,
      siswa.namaSiswa,
      siswa.kelas,
      siswa.jurusan,
      siswa.jenisKelamin,
      siswa.tahunAngkatan,
      siswa.noTelp || '-'
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
    link.download = `Data_Siswa_${new Date().toLocaleDateString('id-ID').replace(/\//g, '-')}.csv`;
    
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

  /* ===================== TABLE CONFIGURATION ===================== */
  const columns = [
    { key: 'namaSiswa', label: 'Nama Siswa' },
    { key: 'nisn', label: 'NISN' },
    { key: 'kelas', label: 'Kelas' },
    { key: 'jurusan', label: 'Jurusan' },
    { 
      key: 'jenisKelamin', 
      label: 'L/P',
      render: (value: string) => value === 'Laki-Laki' ? 'L' : 'P'
    },
    { key: 'tahunAngkatan', label: 'Thn Angkatan' },
    {
      key: 'aksi',
      label: 'Aksi',
      render: (_: any, row: Siswa) => (
        <div style={{ position: 'relative' }}>
          <button
            onClick={() => setOpenActionId(openActionId === row.id ? null : row.id)}
            style={{ 
              border: 'none', 
              background: 'transparent', 
              cursor: 'pointer' 
            }}
          >
            <MoreVertical size={22} strokeWidth={1.5} />
          </button>

          {openActionId === row.id && (
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
                onClick={() => handleNavigateToDetail(row.id)}
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
                onClick={() => handleDeleteSiswa(row.id)}
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
        </div>
      ),
    },
  ];

  return (
    <AdminLayout
      pageTitle="Data Siswa"
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
          padding: 'clamp(12px, 2vw, 20px)',
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
        {/* ============ FILTER, SEARCH, & ACTION BUTTONS ============ */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '0.8fr 0.8fr 1.8fr auto',
            gap: '8px',
            alignItems: 'flex-end',
          }}
        >
          {/* Konsentrasi Keahlian */}
          <div>
            <Select
              label="Konsentrasi Keahlian"
              value={selectedJurusan}
              onChange={setSelectedJurusan}
              options={jurusanOptions}
              placeholder="Semua"
            />
          </div>

          {/* Kelas */}
          <div>
            <Select
              label="Kelas"
              value={selectedKelas}
              onChange={setSelectedKelas}
              options={kelasOptions}
              placeholder="Semua"
            />
          </div>

          {/* Cari Siswa */}
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <label
              style={{
                fontSize: '13px',
                fontWeight: 500,
                color: '#252525',
                display: 'block',
                marginBottom: '4px',
              }}
            >
              Cari siswa
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
                placeholder="Cari siswa"
                value={searchValue}
                onChange={(e) => setSearchValue(e.target.value)}
                style={{
                  width: '100%',
                  padding: '8px 10px 8px 32px',
                  border: '1px solid #D1D5DB',
                  borderRadius: '6px',
                  fontSize: '13px',
                  outline: 'none',
                  transition: 'all 0.2s',
                  backgroundColor: '#D9D9D9',
                  height: '36px',
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

          {/* Buttons Group */}
          <div
            style={{
              display: 'flex',
              gap: '6px',
              justifyContent: 'flex-end',
              height: '36px',
            }}
          >
            <Button
              label="Tambahkan"
              onClick={handleTambahSiswa}
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
        </div>

        {/* ============ DATA TABLE ============ */}
        <div style={{ 
          borderRadius: 12, 
          overflow: 'hidden', 
          boxShadow: '0 0 0 1px #E5E7EB'
        }}>
          <Table columns={columns} data={filteredData} keyField="id" />
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

      {/* ============ MODAL TAMBAH SISWA ============ */}
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
            alignItems: 'flex-start',
            justifyContent: 'center',
            zIndex: 9999,
            padding: '80px 20px 20px',
            overflow: 'auto',
          }}
          onClick={handleCloseModal}
        >
          <div
            style={{
              backgroundColor: '#0B1221',
              borderRadius: '16px',
              padding: '24px',
              maxWidth: '500px',
              width: '100%',
              maxHeight: 'calc(100vh - 100px)',
              display: 'flex',
              flexDirection: 'column',
              boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '16px',
              flexShrink: 0,
            }}>
              <h2 style={{
                margin: 0,
                fontSize: '20px',
                fontWeight: '700',
                color: '#FFFFFF',
                letterSpacing: '-0.3px',
              }}>
                Tambah Data Siswa
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

            {/* Scrollable white card container */}
            <div style={{
              backgroundColor: '#FFFFFF',
              borderRadius: '10px',
              padding: '18px',
              boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
              overflowY: 'auto',
              maxHeight: 'calc(90vh - 100px)',
            }}>
              <form onSubmit={handleSubmitForm}>
                <div style={{ 
                  display: 'grid', 
                  gridTemplateColumns: '1fr 1fr', 
                  gap: '14px' 
                }}>
                  {/* Nama Siswa */}
                  <div style={{ gridColumn: '1 / -1' }}>
                    <label style={{
                      display: 'block',
                      fontSize: '12px',
                      fontWeight: '600',
                      color: '#374151',
                      marginBottom: '5px',
                    }}>
                      Nama Siswa <span style={{ color: '#EF4444' }}>*</span>
                    </label>
                    <input
                      type="text"
                      value={formData.namaSiswa}
                      onChange={(e) => {
                        setFormData({ ...formData, namaSiswa: e.target.value });
                        validateField('namaSiswa', e.target.value);
                      }}
                      placeholder="Masukkan nama lengkap siswa"
                      style={{
                        width: '100%',
                        padding: '9px 12px',
                        border: formErrors.namaSiswa ? '2px solid #EF4444' : '1px solid #D1D5DB',
                        borderRadius: '6px',
                        fontSize: '13px',
                        outline: 'none',
                        boxSizing: 'border-box',
                        backgroundColor: '#FFFFFF',
                      }}
                      onFocus={(e) => {
                        if (!formErrors.namaSiswa) {
                          e.target.style.borderColor = '#3B82F6';
                        }
                      }}
                      onBlur={(e) => {
                        if (!formErrors.namaSiswa) {
                          e.target.style.borderColor = '#D1D5DB';
                        }
                      }}
                    />
                    {formErrors.namaSiswa && (
                      <p style={{ color: '#EF4444', fontSize: '10px', marginTop: '3px', marginBottom: 0 }}>
                        {formErrors.namaSiswa}
                      </p>
                    )}
                  </div>

                  {/* NISN */}
                  <div>
                    <label style={{
                      display: 'block',
                      fontSize: '12px',
                      fontWeight: '600',
                      color: '#374151',
                      marginBottom: '5px',
                    }}>
                      NISN <span style={{ color: '#EF4444' }}>*</span>
                    </label>
                    <input
                      type="text"
                      value={formData.nisn}
                      onChange={(e) => {
                        const value = e.target.value.replace(/\D/g, '').slice(0, 10);
                        setFormData({ ...formData, nisn: value });
                        validateField('nisn', value);
                      }}
                      placeholder="10 digit angka"
                      maxLength={10}
                      style={{
                        width: '100%',
                        padding: '9px 12px',
                        border: formErrors.nisn ? '2px solid #EF4444' : '1px solid #D1D5DB',
                        borderRadius: '6px',
                        fontSize: '13px',
                        outline: 'none',
                        boxSizing: 'border-box',
                        backgroundColor: '#FFFFFF',
                      }}
                      onFocus={(e) => {
                        if (!formErrors.nisn) {
                          e.target.style.borderColor = '#3B82F6';
                        }
                      }}
                      onBlur={(e) => {
                        if (!formErrors.nisn) {
                          e.target.style.borderColor = '#D1D5DB';
                        }
                      }}
                    />
                    {formErrors.nisn && (
                      <p style={{ color: '#EF4444', fontSize: '10px', marginTop: '3px', marginBottom: 0 }}>
                        {formErrors.nisn}
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
                      {jenisKelaminOptions.map(option => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* No. Telp */}
                  <div style={{ gridColumn: '1 / -1' }}>
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
                      onFocus={(e) => {
                        if (!formErrors.noTelp) {
                          e.target.style.borderColor = '#3B82F6';
                        }
                      }}
                      onBlur={(e) => {
                        if (!formErrors.noTelp) {
                          e.target.style.borderColor = '#D1D5DB';
                        }
                      }}
                    />
                    {formErrors.noTelp && (
                      <p style={{ color: '#EF4444', fontSize: '10px', marginTop: '3px', marginBottom: 0 }}>
                        {formErrors.noTelp}
                      </p>
                    )}
                  </div>

                  {/* Jurusan */}
                  <div>
                    <label style={{
                      display: 'block',
                      fontSize: '12px',
                      fontWeight: '600',
                      color: '#374151',
                      marginBottom: '5px',
                    }}>
                      Konsentrasi Keahlian <span style={{ color: '#EF4444' }}>*</span>
                    </label>
                    <select
                      value={formData.jurusanId}
                      onChange={(e) => {
                        setFormData({ ...formData, jurusanId: e.target.value });
                        validateField('jurusanId', e.target.value);
                      }}
                      style={{
                        width: '100%',
                        padding: '9px 12px',
                        border: formErrors.jurusanId ? '2px solid #EF4444' : '1px solid #D1D5DB',
                        borderRadius: '6px',
                        fontSize: '13px',
                        outline: 'none',
                        cursor: 'pointer',
                        boxSizing: 'border-box',
                        backgroundColor: '#FFFFFF',
                      }}
                    >
                      <option value="">Pilih Konsentrasi Keahlian</option>
                      {jurusanOptions.map(option => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                    {formErrors.jurusanId && (
                      <p style={{ color: '#EF4444', fontSize: '10px', marginTop: '3px', marginBottom: 0 }}>
                        {formErrors.jurusanId}
                      </p>
                    )}
                  </div>

                  {/* Kelas */}
                  <div>
                    <label style={{
                      display: 'block',
                      fontSize: '12px',
                      fontWeight: '600',
                      color: '#374151',
                      marginBottom: '5px',
                    }}>
                      Tingkatan Kelas <span style={{ color: '#EF4444' }}>*</span>
                    </label>
                    <select
                      value={formData.kelas}
                      onChange={(e) => {
                        setFormData({ ...formData, kelas: e.target.value });
                        validateField('kelas', e.target.value);
                      }}
                      style={{
                        width: '100%',
                        padding: '9px 12px',
                        border: formErrors.kelas ? '2px solid #EF4444' : '1px solid #D1D5DB',
                        borderRadius: '6px',
                        fontSize: '13px',
                        outline: 'none',
                        cursor: 'pointer',
                        boxSizing: 'border-box',
                        backgroundColor: '#FFFFFF',
                      }}
                    >
                      <option value="">Pilih Kelas</option>
                      {kelasOptions.map(option => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                    {formErrors.kelas && (
                      <p style={{ color: '#EF4444', fontSize: '10px', marginTop: '3px', marginBottom: 0 }}>
                        {formErrors.kelas}
                      </p>
                    )}
                  </div>

                  {/* Tahun Angkatan */}
                  <div style={{ gridColumn: '1 / -1' }}>
                    <label style={{
                      display: 'block',
                      fontSize: '12px',
                      fontWeight: '600',
                      color: '#374151',
                      marginBottom: '5px',
                    }}>
                      Tahun Angkatan
                    </label>
                    <div style={{
                      display: 'flex',
                      gap: '12px',
                      alignItems: 'center',
                    }}>
                      {/* Tahun Mulai */}
                      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '4px' }}>
                        <label style={{ fontSize: '10px', color: '#6B7280', fontWeight: '500' }}>
                          Dari Tahun
                        </label>
                        <div style={{
                          position: 'relative',
                          backgroundColor: '#F3F4F6',
                          borderRadius: '8px',
                          border: '1px solid #D1D5DB',
                          overflow: 'hidden',
                          height: '38px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                        }}>
                          <button
                            type="button"
                            onClick={() => {
                              const newIndex = tahunOptions.indexOf(visibleTahunMulai) - 1;
                              if (newIndex >= 0) {
                                setVisibleTahunMulai(tahunOptions[newIndex]);
                                setFormData({ ...formData, tahunMulai: tahunOptions[newIndex] });
                              }
                            }}
                            style={{
                              position: 'absolute',
                              left: '4px',
                              background: 'transparent',
                              border: 'none',
                              cursor: 'pointer',
                              padding: '4px',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              color: '#6B7280',
                            }}
                          >
                            <ChevronUp size={16} />
                          </button>
                          <span style={{
                            fontSize: '14px',
                            fontWeight: '600',
                            color: '#1F2937',
                          }}>
                            {visibleTahunMulai}
                          </span>
                          <button
                            type="button"
                            onClick={() => {
                              const newIndex = tahunOptions.indexOf(visibleTahunMulai) + 1;
                              if (newIndex < tahunOptions.length) {
                                setVisibleTahunMulai(tahunOptions[newIndex]);
                                setFormData({ ...formData, tahunMulai: tahunOptions[newIndex] });
                              }
                            }}
                            style={{
                              position: 'absolute',
                              right: '4px',
                              background: 'transparent',
                              border: 'none',
                              cursor: 'pointer',
                              padding: '4px',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              color: '#6B7280',
                            }}
                          >
                            <ChevronDown size={16} />
                          </button>
                        </div>
                      </div>

                      {/* Separator */}
                      <div style={{ fontSize: '14px', color: '#D1D5DB', fontWeight: '600' }}>
                        -
                      </div>

                      {/* Tahun Akhir */}
                      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '4px' }}>
                        <label style={{ fontSize: '10px', color: '#6B7280', fontWeight: '500' }}>
                          Sampai Tahun
                        </label>
                        <div style={{
                          position: 'relative',
                          backgroundColor: '#F3F4F6',
                          borderRadius: '8px',
                          border: '1px solid #D1D5DB',
                          overflow: 'hidden',
                          height: '38px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                        }}>
                          <button
                            type="button"
                            onClick={() => {
                              const newIndex = tahunOptions.indexOf(visibleTahunAkhir) - 1;
                              if (newIndex >= 0) {
                                setVisibleTahunAkhir(tahunOptions[newIndex]);
                                setFormData({ ...formData, tahunAkhir: tahunOptions[newIndex] });
                              }
                            }}
                            style={{
                              position: 'absolute',
                              left: '4px',
                              background: 'transparent',
                              border: 'none',
                              cursor: 'pointer',
                              padding: '4px',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              color: '#6B7280',
                            }}
                          >
                            <ChevronUp size={16} />
                          </button>
                          <span style={{
                            fontSize: '14px',
                            fontWeight: '600',
                            color: '#1F2937',
                          }}>
                            {visibleTahunAkhir}
                          </span>
                          <button
                            type="button"
                            onClick={() => {
                              const newIndex = tahunOptions.indexOf(visibleTahunAkhir) + 1;
                              if (newIndex < tahunOptions.length) {
                                setVisibleTahunAkhir(tahunOptions[newIndex]);
                                setFormData({ ...formData, tahunAkhir: tahunOptions[newIndex] });
                              }
                            }}
                            style={{
                              position: 'absolute',
                              right: '4px',
                              background: 'transparent',
                              border: 'none',
                              cursor: 'pointer',
                              padding: '4px',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              color: '#6B7280',
                            }}
                          >
                            <ChevronDown size={16} />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Buttons */}
                <div style={{
                  display: 'flex',
                  gap: '10px',
                  marginTop: '20px',
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
