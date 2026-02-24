import React, { useState, useEffect, useRef } from 'react';
import AdminLayout from '../../component/Admin/AdminLayout';
import { Button } from '../../component/Shared/Button';
import { Select } from '../../component/Shared/Select';
import { 
  MoreVertical, 
  Trash2, 
  Edit,
  FileDown,
  Upload,
  FileText,
  Download,
  Search,
  X
} from 'lucide-react';
import { masterService, type Major, type ClassRoom } from '../../services/masterService';
import { studentService } from '../../services/studentService';
import * as XLSX from 'xlsx';

// Import Assets
import AWANKIRI from '../../assets/Icon/AWANKIRI.png';
import AwanBawahkanan from '../../assets/Icon/AwanBawahkanan.png';

// Interfaces
interface Siswa {
  id: string;
  namaSiswa: string;
  nisn: string;
  nis: string;
  jurusan: string;
  jurusanId?: string;
  kelas: string;
  kelasId?: string;
  jenisKelamin: 'L' | 'P';
  phone?: string;
  address?: string;
  email?: string;
  username?: string;
  tahunMulai?: string;
  tahunAkhir?: string;
}

interface SiswaAdminProps {
  user?: any;
  onLogout?: () => void;
  currentPage?: string;
  onMenuClick?: (page: string) => void;
  onNavigateToDetail?: (id: string) => void;
}

const SiswaAdmin: React.FC<SiswaAdminProps> = ({ 
  user, 
  onLogout, 
  currentPage, 
  onMenuClick, 
  onNavigateToDetail 
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  // State
  const [students, setStudents] = useState<Siswa[]>([]);
  const [loading, setLoading] = useState(true);

  // Master Data State
  const [majors, setMajors] = useState<Major[]>([]);
  const [classes, setClasses] = useState<ClassRoom[]>([]);

  // Search & Filter
  const [searchValue, setSearchValue] = useState('');
  const [selectedJurusan, setSelectedJurusan] = useState('');
  const [selectedKelas, setSelectedKelas] = useState('');

  // Dropdown & Modal State
  const [openActionId, setOpenActionId] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEksporDropdownOpen, setIsEksporDropdownOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  // Form State
  const currentYear = new Date().getFullYear();
  const [formData, setFormData] = useState({
    namaSiswa: '',
    nisn: '',
    nis: '',
    username: '',
    password: '',
    email: '',
    address: '',
    jenisKelamin: 'L',
    jurusanId: '',
    kelas: '',
    noTelp: '',
    tahunMulai: currentYear.toString(),
    tahunAkhir: (currentYear + 3).toString()
  });

  const [formErrors, setFormErrors] = useState<{[key: string]: string}>({});

  // Pagination
  const [pageIndex, setPageIndex] = useState(1);
  const [itemsPerPage] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [, setTotalStudentsCount] = useState(0);

  // Import Preview State
  const [importPreviewData, setImportPreviewData] = useState<any[]>([]);
  const [isImportPreviewOpen, setIsImportPreviewOpen] = useState(false);
  const [importRowErrors, setImportRowErrors] = useState<{[key: number]: string[]}>({});

  const normalizeText = (value: unknown) =>
    String(value ?? '')
      .trim()
      .toLowerCase()
      .replace(/\s+/g, ' ');

  const getRowValue = (row: Record<string, any>, keys: string[]) => {
    const normalizedAliases = keys.map((k) => normalizeText(k).replace(/[^a-z0-9]/g, ''));

    for (const [rawKey, rawValue] of Object.entries(row)) {
      const normalizedKey = normalizeText(rawKey).replace(/[^a-z0-9]/g, '');
      if (!normalizedAliases.includes(normalizedKey)) continue;
      if (rawValue === undefined || rawValue === null) continue;
      if (String(rawValue).trim() === '') continue;
      return rawValue;
    }

    return '';
  };

  const resolveClassIdFromImport = (classInputRaw: string, majorInputRaw: string) => {
    const classInput = String(classInputRaw || '').trim();
    const majorInput = String(majorInputRaw || '').trim();
    if (!classInput) return '';

    const byId = classes.find((c) => c.id.toString() === classInput);
    if (byId) return byId.id.toString();

    const normalizedClass = normalizeText(classInput);
    const normalizedMajor = normalizeText(majorInput);
    const major = majors.find(
      (m) => normalizeText(m.code) === normalizedMajor || normalizeText(m.name) === normalizedMajor
    );

    let candidates = classes.filter((c) => {
      const name = normalizeText(c.name);
      const label = normalizeText(c.label);
      const grade = normalizeText(c.grade);
      return (
        name === normalizedClass ||
        label === normalizedClass ||
        grade === normalizedClass ||
        name.includes(normalizedClass) ||
        label.includes(normalizedClass)
      );
    });

    if (major) {
      const byMajor = candidates.filter((c) => c.major_id === major.id);
      if (byMajor.length > 0) candidates = byMajor;
    }

    if (candidates.length > 0) {
      candidates.sort((a, b) => a.id - b.id);
      return candidates[0].id.toString();
    }

    // Fallback: allow backend resolver (grade/label) to process this string.
    return classInput;
  };

  // Initial Data Fetch
  useEffect(() => {
    fetchMasterData();
  }, []);

  // Fetch students when filters or page changes
  useEffect(() => {
    const controller = new AbortController();
    fetchStudents();
    return () => controller.abort();
  }, [searchValue, pageIndex, selectedJurusan, selectedKelas]);

  const fetchMasterData = async () => {
    try {
      const [majorsRes, classesRes] = await Promise.all([
        masterService.getMajors(),
        masterService.getClasses()
      ]);
      setMajors(majorsRes.data || []);
      setClasses(classesRes.data || []);
    } catch (err) {
      console.error('Failed to fetch master data:', err);
    }
  };

  const fetchStudents = async () => {
    setLoading(true);
    try {
      const params: Record<string, any> = {
        page: pageIndex,
        per_page: itemsPerPage,
        search: searchValue,
      };
      
      if (selectedJurusan) {
        params.major_id = selectedJurusan;
      }
      if (selectedKelas) {
        params.class_id = selectedKelas;
      }
      
      const response = await studentService.getStudents(params as any);
      
      const data = response.data || [];
      const mappedStudents: Siswa[] = data.map((s: any) => ({
        id: s.id.toString(),
        namaSiswa: s.name,
        nisn: s.nisn,
        nis: s.nis || '-',
        jurusan: s.major || '-',
        jurusanId: s.major_id?.toString(),
        kelas: s.class_name || '-',
        kelasId: s.class_id?.toString(),
        jenisKelamin: s.gender,
        phone: s.parent_phone,
        address: s.address,
        email: s.email,
        username: s.username,
        tahunMulai: s.start_year || '2025',
        tahunAkhir: s.end_year || '2026'
      }));

      setStudents(mappedStudents);
      
      if (response.meta) {
        setTotalPages(response.meta.last_page);
        if (response.meta.total) {
          setTotalStudentsCount(response.meta.total);
        }
      }
      
    } catch (err: any) {
      if (err.name === 'AbortError' || err.message === 'canceled') return;
      console.error('Error fetching students:', err);
    } finally {
      setLoading(false);
    }
  };

  // Remote filtering handles this now
  const filteredData = students;

  // Validation
  const validateField = (name: string, value: string) => {
    let error = '';
    if (name === 'noTelp' && value && !/^\d+$/.test(value)) error = 'No. Telepon harus berupa angka';
    if (name === 'noTelp' && value && value.length > 15) error = 'No. Telepon maksimal 15 digit';
    if (name === 'jurusanId' && !value) error = 'Jurusan wajib dipilih';
    if (name === 'kelas' && !value) error = 'Kelas wajib dipilih';
    
    setFormErrors(prev => ({ ...prev, [name]: error }));
    return error;
  };

  const validateForm = () => {
    const errors: {[key: string]: string} = {};
    if (!formData.namaSiswa.trim()) errors.namaSiswa = 'Nama Siswa wajib diisi';
    if (!formData.nisn.trim()) errors.nisn = 'NISN wajib diisi';
    if (formData.noTelp && !/^\d+$/.test(formData.noTelp)) errors.noTelp = 'No. Telepon harus berupa angka';
    if (formData.noTelp && formData.noTelp.length > 15) errors.noTelp = 'No. Telepon maksimal 15 digit';
    if (!formData.jurusanId) errors.jurusanId = 'Jurusan wajib dipilih';
    if (!formData.kelas) errors.kelas = 'Kelas wajib dipilih';
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Handlers
  const handleOpenModal = () => {
    setEditingId(null);
    setFormData({
      namaSiswa: '',
      nisn: '',
      nis: '',
      username: '',
      password: '',
      email: '',
      address: '',
      jenisKelamin: 'L',
      jurusanId: '',
      kelas: '',
      noTelp: '',
      tahunMulai: currentYear.toString(),
      tahunAkhir: (currentYear + 3).toString()
    });
    setFormErrors({});
    setIsModalOpen(true);
  };

  const handleEdit = (student: Siswa) => {
    if (onNavigateToDetail) {
      onNavigateToDetail(student.id);
    } else {
      setEditingId(student.id);
      
      const selectedClass = classes.find(c => c.name === student.kelas || c.id.toString() === student.kelasId);
      const selectedMajor = majors.find(m => m.code === student.jurusan || m.id.toString() === student.jurusanId);

      setFormData({
        namaSiswa: student.namaSiswa,
        nisn: student.nisn,
        nis: student.nis,
        username: student.username || '',
        password: '',
        email: student.email || '',
        address: student.address || '',
        jenisKelamin: student.jenisKelamin,
        jurusanId: selectedMajor ? selectedMajor.id.toString() : '',
        kelas: selectedClass ? selectedClass.id.toString() : '',
        noTelp: student.phone || '',
        tahunMulai: student.tahunMulai || '2023',
        tahunAkhir: student.tahunAkhir || '2026'
      });
      setIsModalOpen(true);
      setOpenActionId(null);
    }
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setFormErrors({});
  };

  const handleSubmitForm = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    try {
      const payload: any = {
        name: formData.namaSiswa,
        nisn: formData.nisn,
        nis: formData.nis,
        username: formData.username,
        email: formData.email || undefined,
        address: formData.address,
        gender: formData.jenisKelamin,
        class_id: formData.kelas,
        parent_phone: formData.noTelp,
      };

      if (!editingId || formData.password) {
        payload.password = formData.password;
      }

      if (editingId) {
        await studentService.updateStudent(editingId, payload);
      } else {
        await studentService.addStudent(payload);
      }
      
      handleCloseModal();
      fetchStudents();
      alert(`Berhasil ${editingId ? 'memperbarui' : 'menambahkan'} data siswa.`);
    } catch (err: any) {
      console.error('Failed to save student:', err);
      alert('Gagal menyimpan data siswa: ' + (err.response?.data?.message || err.message));
    }
  };

  const handleDeleteSiswa = async (id: string) => {
    if (confirm('Apakah Anda yakin ingin menghapus data siswa ini?')) {
      try {
        await studentService.deleteStudent(id);
        fetchStudents();
        setOpenActionId(null);
        alert('Data siswa berhasil dihapus.');
      } catch (err) {
        console.error('Failed to delete student:', err);
        alert('Gagal menghapus siswa.');
      }
    }
  };

  const handleImport = () => {
    fileInputRef.current?.click();
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const data = new Uint8Array(e.target?.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: 'array' });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const jsonData = XLSX.utils.sheet_to_json(worksheet);

        console.log('Raw data from Excel:', jsonData);

        const mappedData = jsonData.map((row: any) => {
          // Sanitization helpers
          const sanitizeGender = (val: string) => {
            if (!val) return 'L';
            const v = val.toString().toUpperCase();
            if (v.startsWith('P')) return 'P';
            return 'L';
          };

          const sanitizeBoolean = (val: any) => {
            if (val === undefined || val === null) return false;
            const v = val.toString().toLowerCase();
            return v === '1' || v === 'true' || v === 'ya' || v === 'yes';
          };

          const name = String(
            getRowValue(row, ['Nama Siswa', 'Nama', 'name', '__EMPTY'])
          ).trim();
          const nisn = String(
            getRowValue(row, ['NISN', 'nisn', '__EMPTY_1'])
          ).trim();
          const majorInput = String(
            getRowValue(row, [
              'Konsentrasi Keahlian',
              'Kode Konsentrasi Keahlian',
              'Jurusan',
              'Konsentrasi',
              'major',
              'major_name'
            ])
          ).trim();
          const tingkatanInput = String(
            getRowValue(row, [
              'Tingkatan Kelas',
              'Tingkatan',
              'Kelas',
              'class_id',
              'ClassID',
              '__EMPTY_2'
            ])
          ).trim();
          const resolvedClassId = resolveClassIdFromImport(tingkatanInput, majorInput);

          return {
            name,
            username: row.Username || row.username || '',
            email: row.Email || row.email || null,
            password: row.Password || row.password || null,
            nisn,
            nis: (row.NIS || row.nis || nisn).toString(),
            gender: sanitizeGender(row['Jenis Kelamin'] || row.gender || row.Gender || row.JK),
            address: row.Alamat || row.address || '',
            class_id: resolvedClassId, // numeric id if resolved; fallback raw text for backend resolver
            major_display: majorInput,
            tingkatan_display: tingkatanInput,
            is_class_officer: sanitizeBoolean(row['Pengurus Kelas'] || row.is_class_officer || row.PengurusKelas || row.Pengurus_Kelas),
            phone: (row.Telepon || row.phone || row.hp || row.Mobile || null)?.toString(),
            contact: row.Kontak || row.contact || null
          };
        });

        console.log('Mapped data ready for preview:', mappedData);
        
        setImportPreviewData(mappedData);
        setIsImportPreviewOpen(true);
        if (event.target) event.target.value = ''; // Clear the file input
      };
      reader.readAsArrayBuffer(file);
    }
  };

  const handleCommitImport = async () => {
    try {
      setLoading(true);
      setImportRowErrors({});
      const result = await studentService.importStudents(importPreviewData);
      
      if (result.total_rows !== undefined) {
        alert(`Berhasil mengimpor ${result.success_count} data siswa dari total ${result.total_rows} baris.`);
      } else {
        alert(`Berhasil mengimpor data siswa.`);
      }
      
      setIsImportPreviewOpen(false);
      setImportPreviewData([]);
      fetchStudents();
    } catch (error: any) {
      console.error('Import failed:', error);
      
      const errData = error.data || error;
      if (errData && errData.errors && Array.isArray(errData.errors)) {
        const rowErrors: {[key: number]: string[]} = {};
        
        errData.errors.forEach((err: any) => {
          if (!rowErrors[err.row]) rowErrors[err.row] = [];
          rowErrors[err.row].push(err.message);
        });
        
        if (Object.keys(rowErrors).length > 0) {
          setImportRowErrors(rowErrors);
          alert(`Gagal mengimpor.\nTotal Baris: ${errData.total_rows}\nBerhasil: ${errData.success_count}\nGagal: ${errData.failed_count}\n\nAda kesalahan data pada baris yang ditandai merah.`);
          return;
        }
      }
      
      alert('Gagal mengimpor data: ' + (error.message || 'Terjadi kesalahan sistem.'));
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadFormatExcel = () => {
    const format = [
      {
        'Nama Siswa': 'Arie',
        'NISN': '00123456789',
        'Konsentrasi Keahlian': 'RPL',
        'Tingkatan Kelas': 'RPL 2',
        'Jenis Kelamin': 'L',

      },
    ];
    const ws = XLSX.utils.json_to_sheet(format);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Format Import Siswa');
    XLSX.writeFile(wb, 'Format_Import_Siswa_Final.xlsx');
  };

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
              <th>Nama Siswa</th>
              <th>NISN</th>
              <th>Kode Konsentrasi Keahlian</th>
              <th>Tingkatan Kelas</th>
              <th>Jenis Kelamin</th>
            </tr>
          </thead>
          <tbody>
            ${filteredData.map((siswa, index) => `
              <tr>
                <td>${index + 1}</td>
                <td>${siswa.namaSiswa}</td>
                <td>${siswa.nisn}</td>
                <td>${siswa.jurusan}</td>
                <td>${siswa.kelas}</td>
                <td>${siswa.jenisKelamin === 'L' ? 'Laki-Laki' : 'Perempuan'}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
        <div class="footer">
          <p>Total Siswa: ${filteredData.length}</p>
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
    const headers = ['Nama Siswa', 'NISN', 'Konsentrasi Keahlian', 'Tingkatan Kelas', 'Jenis Kelamin'];
    const rows = filteredData.map((siswa) => [
      siswa.namaSiswa,
      siswa.nisn,
      siswa.jurusan,
      siswa.kelas,
      siswa.jenisKelamin === 'L' ? 'Laki-Laki' : 'Perempuan'
    ]);

    const ws = XLSX.utils.aoa_to_sheet([headers, ...rows]);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Data Siswa");
    XLSX.writeFile(wb, `Data_Siswa_${new Date().toLocaleDateString('id-ID').replace(/\//g, '-')}.xlsx`);
  };

  // UI Styles & Options
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

  // Options for Select
  const jurusanOptions = majors.map(m => ({ label: m.name, value: m.id.toString() }));
  const kelasOptions = classes.map(c => ({ label: c.name, value: c.id.toString() }));

  return (
    <AdminLayout
      pageTitle="Data Siswa"
      currentPage={currentPage || "siswa"}
      onMenuClick={onMenuClick || (() => {})}
      user={user}
      onLogout={onLogout || (() => {})}
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
          {/* Konsentrasi Keahlian */}
          <div>
            <Select
              label="Konsentrasi Keahlian"
              value={selectedJurusan}
              onChange={setSelectedJurusan}
              options={[{ label: 'Semua', value: '' }, ...jurusanOptions]}
              placeholder="Semua"
            />
          </div>

          {/* Kelas */}
          <div>
            <Select
              label="Tingkatan Kelas"
              value={selectedKelas}
              onChange={setSelectedKelas}
              options={[{ label: 'Semua', value: '' }, ...kelasOptions]}
              placeholder="Semua"
            />
          </div>

          {/* Empty space */}
          <div></div>

          {/* Buttons */}
          <Button
            label="Tambahkan"
            onClick={handleOpenModal}
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
            Cari Siswa
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
              placeholder="Cari Siswa..."
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
            />
          </div>
        </div>

        {/* ============ DATA TABLE ============ */}
        <div style={{ 
          borderRadius: 12, 
          overflow: 'hidden', 
          boxShadow: '0 0 0 1px #E5E7EB'
        }}>
          {loading ? (
             <div style={{ padding: '40px', textAlign: 'center', color: '#6B7280' }}>
               Memuat data...
             </div>
          ) : (
          <div style={{ overflowX: 'auto' }}>
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
                  <th style={{ padding: '12px 16px', textAlign: 'center', fontSize: '13px', fontWeight: '600', color: '#374151', borderRight: '1px solid #E5E7EB' }}>No</th>
                  <th style={{ padding: '12px 16px', textAlign: 'center', fontSize: '13px', fontWeight: '600', color: '#374151', borderRight: '1px solid #E5E7EB' }}>Nama Siswa</th>
                  <th style={{ padding: '12px 16px', textAlign: 'center', fontSize: '13px', fontWeight: '600', color: '#374151', borderRight: '1px solid #E5E7EB' }}>NISN</th>
                  <th style={{ padding: '12px 16px', textAlign: 'center', fontSize: '13px', fontWeight: '600', color: '#374151', borderRight: '1px solid #E5E7EB' }}>Konsentrasi Keahlian</th>
                  <th style={{ padding: '12px 16px', textAlign: 'center', fontSize: '13px', fontWeight: '600', color: '#374151', borderRight: '1px solid #E5E7EB' }}>Tingkatan Kelas</th>
                  <th style={{ padding: '12px 16px', textAlign: 'center', fontSize: '13px', fontWeight: '600', color: '#374151', borderRight: '1px solid #E5E7EB' }}>Jenis Kelamin</th>
                  <th style={{ padding: '12px 16px', textAlign: 'center', fontSize: '13px', fontWeight: '600', color: '#374151' }}>Aksi</th>
                </tr>
              </thead>
              <tbody>
                {filteredData.length === 0 ? (
                  <tr>
                    <td colSpan={7} style={{ padding: '40px', textAlign: 'center', color: '#6B7280' }}>
                      Tidak ada data siswa
                    </td>
                  </tr>
                ) : (
                  filteredData.map((siswa, index) => (
                    <tr key={siswa.id} style={{
                      borderBottom: '1px solid #E5E7EB',
                      backgroundColor: index % 2 === 0 ? '#FFFFFF' : '#F9FAFB',
                    }}>
                      <td style={{ padding: '12px 16px', fontSize: '13px', color: '#374151', textAlign: 'center', borderRight: '1px solid #E5E7EB' }}>{(pageIndex - 1) * 10 + index + 1}</td>
                      <td style={{ padding: '12px 16px', fontSize: '13px', color: '#374151', borderRight: '1px solid #E5E7EB' }}>{siswa.namaSiswa}</td>
                      <td style={{ padding: '12px 16px', fontSize: '13px', color: '#374151', textAlign: 'center', borderRight: '1px solid #E5E7EB' }}>{siswa.nisn}</td>
                      <td style={{ padding: '12px 16px', fontSize: '13px', color: '#374151', textAlign: 'center', borderRight: '1px solid #E5E7EB' }}>
                        <span style={{ backgroundColor: '#EFF6FF', color: '#2563EB', padding: '2px 8px', borderRadius: '9999px', fontSize: '12px' }}>
                          {siswa.jurusan}
                        </span>
                      </td>
                      <td style={{ padding: '12px 16px', fontSize: '13px', color: '#374151', textAlign: 'center', borderRight: '1px solid #E5E7EB' }}>{siswa.kelas}</td>
                      <td style={{ padding: '12px 16px', fontSize: '13px', color: '#374151', borderRight: '1px solid #E5E7EB', textAlign: 'center' }}>{siswa.jenisKelamin === 'L' ? 'Laki-Laki' : 'Perempuan'}</td>
                      <td style={{ padding: '12px 16px', textAlign: 'center', position: 'relative' }}>
                        <div style={{ display: 'flex', justifyContent: 'center' }}>
                            <button
                          onClick={() => setOpenActionId(openActionId === siswa.id ? null : siswa.id)}
                          style={{ border: 'none', background: 'transparent', cursor: 'pointer', padding: '4px' }}
                        >
                          <MoreVertical size={20} strokeWidth={1.5} />
                        </button>
                        </div>
                    
                        {openActionId === siswa.id && (
                          <div style={{
                            position: 'absolute', top: '100%', right: 0, marginTop: 6,
                            background: '#FFFFFF', borderRadius: 8, boxShadow: '0 10px 15px rgba(0,0,0,0.1)',
                            minWidth: 180, zIndex: 10, overflow: 'hidden', border: '1px solid #E2E8F0',
                            textAlign: 'left'
                          }}>
                            <button onClick={() => { if (onNavigateToDetail) onNavigateToDetail(siswa.id); }} style={{ width: '100%', padding: '12px 16px', border: 'none', background: 'none', textAlign: 'left', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '10px', color: '#0F172A', fontSize: '14px' }}>
                              <FileDown size={16} /> Detail
                            </button>
                            <button onClick={() => handleDeleteSiswa(siswa.id)} style={{ width: '100%', padding: '12px 16px', border: 'none', background: 'none', textAlign: 'left', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '10px', color: '#DC2626', fontSize: '14px' }}>
                              <Trash2 size={16} /> Hapus
                            </button>
                          </div>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
          )}
          
          {/* Pagination Controls */}
           <div style={{
             padding: '12px 24px',
             borderTop: '1px solid #E5E7EB',
             display: 'flex',
             justifyContent: 'space-between',
             alignItems: 'center',
             backgroundColor: '#FFFFFF'
          }}>
             <button
                onClick={() => setPageIndex(prev => Math.max(1, prev - 1))}
                disabled={pageIndex === 1}
                style={{
                  padding: '8px 12px',
                  border: '1px solid #D1D5DB',
                  borderRadius: '6px',
                  backgroundColor: pageIndex === 1 ? '#F3F4F6' : '#FFFFFF',
                  color: pageIndex === 1 ? '#9CA3AF' : '#374151',
                  cursor: pageIndex === 1 ? 'not-allowed' : 'pointer',
               }}
             >
               Previous
             </button>
             <span style={{ fontSize: '14px', color: '#6B7280' }}>
               Page {pageIndex} of {totalPages}
             </span>
             <button
                onClick={() => setPageIndex(prev => Math.min(totalPages, prev + 1))}
                disabled={pageIndex >= totalPages}
                style={{
                  padding: '8px 12px',
                  border: '1px solid #D1D5DB',
                  borderRadius: '6px',
                  backgroundColor: pageIndex >= totalPages ? '#F3F4F6' : '#FFFFFF',
                  color: pageIndex >= totalPages ? '#9CA3AF' : '#374151',
                  cursor: pageIndex >= totalPages ? 'not-allowed' : 'pointer',
               }}
             >
               Next
             </button>
          </div>
        </div>
      </div>

      <input type="file" ref={fileInputRef} style={{ display: 'none' }} onChange={handleFileSelect} accept=".csv,.xlsx" />

      {/* MODAL */}
      {isModalOpen && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.7)', backdropFilter: 'blur(4px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999,
          padding: '20px'
        }} onClick={handleCloseModal}>
          <div style={{
            backgroundColor: '#0B1221', borderRadius: '16px', padding: '24px',
            maxWidth: '500px', width: '100%', maxHeight: '90vh', display: 'flex',
            flexDirection: 'column', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)'
          }} onClick={e => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h2 style={{ margin: 0, fontSize: '20px', fontWeight: '700', color: '#FFFFFF' }}>
                {editingId ? 'Edit Data Siswa' : 'Tambah Data Siswa'}
              </h2>
              <button onClick={handleCloseModal} style={{ background: 'rgba(255, 255, 255, 0.1)', border: 'none', cursor: 'pointer', padding: '6px', borderRadius: '6px', display: 'flex' }}>
                <X size={18} color="#FFFFFF" />
              </button>
            </div>
            
            <div style={{ backgroundColor: '#FFFFFF', borderRadius: '10px', padding: '18px', overflowY: 'auto' }}>
              <form onSubmit={handleSubmitForm}>
                 <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
                     <div style={{ gridColumn: '1 / -1' }}>
                        <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', color: '#374151', marginBottom: '5px' }}>Nama Siswa *</label>
                        <input type="text" value={formData.namaSiswa} onChange={e => { setFormData({...formData, namaSiswa: e.target.value}); validateField('namaSiswa', e.target.value) }} style={{ width: '100%', padding: '9px 12px', border: '1px solid #D1D5DB', borderRadius: '6px' }} />
                        {formErrors.namaSiswa && <p style={{ color: '#EF4444', fontSize: '10px' }}>{formErrors.namaSiswa}</p>}
                     </div>

                     <div style={{ gridColumn: '1 / -1' }}>
                        <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', color: '#374151', marginBottom: '5px' }}>NISN *</label>
                        <input type="text" value={formData.nisn} onChange={e => { setFormData({...formData, nisn: e.target.value}); validateField('nisn', e.target.value) }} placeholder="10 digit NISN" style={{ width: '100%', padding: '9px 12px', border: '1px solid #D1D5DB', borderRadius: '6px' }} />
                        {formErrors.nisn && <p style={{ color: '#EF4444', fontSize: '10px' }}>{formErrors.nisn}</p>}
                     </div>

                     <div>
                        <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', color: '#374151', marginBottom: '5px' }}>Jenis Kelamin *</label>
                        <select value={formData.jenisKelamin} onChange={e => setFormData({...formData, jenisKelamin: e.target.value as 'L'|'P'})} style={{ width: '100%', padding: '9px 12px', border: '1px solid #D1D5DB', borderRadius: '6px' }}>
                           <option value="L">Laki-Laki</option>
                           <option value="P">Perempuan</option>
                        </select>
                     </div>

                     <div>
                        <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', color: '#374151', marginBottom: '5px' }}>No. Telepon</label>
                        <input type="text" value={formData.noTelp} onChange={e => { setFormData({...formData, noTelp: e.target.value}); validateField('noTelp', e.target.value) }} placeholder="Maks 15 digit" style={{ width: '100%', padding: '9px 12px', border: '1px solid #D1D5DB', borderRadius: '6px' }} />
                        {formErrors.noTelp && <p style={{ color: '#EF4444', fontSize: '10px' }}>{formErrors.noTelp}</p>}
                     </div>

                     <div>
                        <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', color: '#374151', marginBottom: '5px' }}>Konsentrasi Keahlian *</label>
                        <select value={formData.jurusanId} onChange={e => { setFormData({...formData, jurusanId: e.target.value}); validateField('jurusanId', e.target.value) }} style={{ width: '100%', padding: '9px 12px', border: '1px solid #D1D5DB', borderRadius: '6px' }}>
                           <option value="">Pilih</option>
                           {jurusanOptions.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                        </select>
                        {formErrors.jurusanId && <p style={{ color: '#EF4444', fontSize: '10px' }}>{formErrors.jurusanId}</p>}
                     </div>

                     <div>
                        <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', color: '#374151', marginBottom: '5px' }}>Kelas *</label>
                        <select value={formData.kelas} onChange={e => { setFormData({...formData, kelas: e.target.value}); validateField('kelas', e.target.value) }} style={{ width: '100%', padding: '9px 12px', border: '1px solid #D1D5DB', borderRadius: '6px' }}>
                           <option value="">Pilih</option>
                           {kelasOptions.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                        </select>
                        {formErrors.kelas && <p style={{ color: '#EF4444', fontSize: '10px' }}>{formErrors.kelas}</p>}
                     </div>

                 </div>
                 
                 <div style={{ marginTop: '20px', display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
                    <button type="button" onClick={handleCloseModal} style={{ padding: '8px 16px', borderRadius: '6px', border: '1px solid #D1D5DB', background: '#FFFFFF', cursor: 'pointer' }}>Batal</button>
                    <button type="submit" style={{ padding: '8px 16px', borderRadius: '6px', border: 'none', background: '#2563EB', color: '#FFFFFF', cursor: 'pointer' }}>Simpan</button>
                 </div>
              </form>
            </div>
          </div>
        </div>
      )}
      {/* IMPORT PREVIEW MODAL */}
      {isImportPreviewOpen && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.7)', backdropFilter: 'blur(4px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999,
          padding: '20px'
        }}>
          <div style={{
            backgroundColor: '#0B1221', borderRadius: '16px', padding: '24px',
            maxWidth: '1000px', width: '100%', maxHeight: '90vh', display: 'flex',
            flexDirection: 'column', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)'
          }} onClick={e => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h2 style={{ margin: 0, fontSize: '20px', fontWeight: '700', color: '#FFFFFF' }}>
                Preview Import Siswa ({importPreviewData.length} data)
              </h2>
              <button 
                onClick={() => setIsImportPreviewOpen(false)} 
                style={{ background: 'rgba(255, 255, 255, 0.1)', border: 'none', cursor: 'pointer', padding: '6px', borderRadius: '6px', display: 'flex' }}
              >
                <X size={18} color="#FFFFFF" />
              </button>
            </div>
            
            <div style={{ 
              backgroundColor: '#FFFFFF', 
              borderRadius: '10px', 
              padding: '0', 
              overflowY: 'auto',
              flex: 1
            }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead style={{ position: 'sticky', top: 0, backgroundColor: '#F3F4F6' }}>
                  <tr>
                    <th style={{ padding: '12px', textAlign: 'left', fontSize: '12px', borderBottom: '1px solid #E5E7EB' }}>Nama</th>
                    <th style={{ padding: '12px', textAlign: 'left', fontSize: '12px', borderBottom: '1px solid #E5E7EB' }}>NISN</th>
                    <th style={{ padding: '12px', textAlign: 'left', fontSize: '12px', borderBottom: '1px solid #E5E7EB' }}>Konsentrasi Keahlian</th>
                    <th style={{ padding: '12px', textAlign: 'left', fontSize: '12px', borderBottom: '1px solid #E5E7EB' }}>Tingkatan Kelas</th>
                    <th style={{ padding: '12px', textAlign: 'left', fontSize: '12px', borderBottom: '1px solid #E5E7EB' }}>Jenis Kelamin</th>
                  </tr>
                </thead>
                <tbody>
                  {importPreviewData.map((row, idx) => {
                    const hasError = importRowErrors[idx + 1];
                    return (
                      <tr key={idx} style={{ 
                        borderBottom: '1px solid #F3F4F6',
                        backgroundColor: hasError ? '#FEF2F2' : 'transparent'
                      }}>
                        <td style={{ padding: '10px 12px', fontSize: '12px', position: 'relative' }}>
                          {hasError && (
                            <div title={hasError.join(', ')} style={{ position: 'absolute', left: 2, top: '50%', transform: 'translateY(-50%)' }}>
                              <div style={{ width: 4, height: 4, borderRadius: '50%', backgroundColor: '#EF4444' }} />
                            </div>
                          )}
                          {row.name}
                        </td>
                        <td style={{ padding: '10px 12px', fontSize: '12px', color: hasError?.some(e => e.includes('NISN')) ? '#EF4444' : 'inherit' }}>{row.nisn}</td>
                        <td style={{ padding: '10px 12px', fontSize: '12px', color: hasError?.some(e => /konsentrasi|major/i.test(e)) ? '#EF4444' : 'inherit' }}>{row.major_display || '-'}</td>
                        <td style={{ padding: '10px 12px', fontSize: '12px', color: hasError?.some(e => /tingkatan|kelas|class/i.test(e)) ? '#EF4444' : 'inherit' }}>{row.tingkatan_display || row.class_id || '-'}</td>
                        <td style={{ padding: '10px 12px', fontSize: '12px' }}>{row.gender}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            <div style={{ marginTop: '20px', display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
              <button 
                onClick={() => setIsImportPreviewOpen(false)} 
                style={{ padding: '8px 16px', borderRadius: '6px', border: '1px solid #D1D5DB', background: '#FFFFFF', cursor: 'pointer', fontWeight: 600 }}
              >
                Batal
              </button>
              <button 
                onClick={handleCommitImport} 
                disabled={loading}
                style={{ 
                  padding: '8px 16px', 
                  borderRadius: '6px', 
                  border: 'none', 
                  background: '#10B981', 
                  color: '#FFFFFF', 
                  cursor: loading ? 'not-allowed' : 'pointer',
                  opacity: loading ? 0.7 : 1,
                  fontWeight: 600
                }}
              >
                {loading ? 'Mengimpor...' : 'Konfirmasi & Impor'}
              </button>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
};

export default SiswaAdmin;
