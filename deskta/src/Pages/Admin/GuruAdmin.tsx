// FILE: GuruAdmin.tsx - Halaman Admin untuk mengelola data guru
import { useState, useRef, useEffect } from 'react';
import AdminLayout from '../../component/Admin/AdminLayout';
import { Button } from '../../component/Shared/Button';
import { Select } from '../../component/Shared/Select';
import {
  MoreVertical,
  Trash2,
  Eye,
  FileDown,
  Upload,
  Download,
  X,
  Search
} from 'lucide-react';
// import * as XLSX from 'xlsx';
import { teacherService } from '../../services/teacherService';
import { masterService, type Subject, type ClassRoom } from '../../services/masterService';

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
  nip: string;
  name: string;
  role: string; // Akan menyimpan string gabungan: "Guru | Wali Kelas"
  phone?: string;
  subject?: string | string[];
  waka_field?: string;
  homeroom_class?: {
    id: number;
    name: string;
  };
  keterangan: string; // Computed for display: "Matematika | 10 RPL 1"
  email?: string;
  gender?: string;
}

interface GuruAdminProps {
  user: User;
  onLogout: () => void;
  currentPage: string;
  onMenuClick: (page: string) => void;
  onNavigateToDetail?: (guruId: string) => void;
}

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

  const [guruList, setGuruList] = useState<Guru[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [classes, setClasses] = useState<ClassRoom[]>([]);
  const [majors, setMajors] = useState<any[]>([]);

  const [openActionId, setOpenActionId] = useState<string | null>(null);

  // Pagination State
  const [pageIndex, setPageIndex] = useState(1);
  const [itemsPerPage] = useState(10);
  const [totalPages, setTotalPages] = useState(1);

  // State Form dengan Multi-Role Support
  const [formData, setFormData] = useState({
    namaGuru: '',
    kodeGuru: '',
    jenisKelamin: 'Laki-Laki',
    roles: [] as string[],
    subjects: [] as string[], // Bisa lebih dari 1 jika pakai multi-select nanti
    waliGrade: '',
    waliKelasId: '',
    wakaField: '',
    kaproField: '',
    noTelp: '',
    email: '',
    password: ''
  });

  const [formErrors, setFormErrors] = useState<{ [key: string]: string }>({});
  const [showDuplicateWarning, setShowDuplicateWarning] = useState(false);
  const [duplicateWarningMessage, setDuplicateWarningMessage] = useState('');

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Helper normalisasi untuk Import


  // ==================== FETCH DATA ====================
  const fetchTeachers = async () => {
    setLoading(true);
    try {
      const response = await teacherService.getTeachers({
        page: pageIndex,
        per_page: itemsPerPage,
        search: searchValue
      });

      const mappedGuru = response.data.map((t: any) => {
        // Antisipasi jika backend sudah mengirimkan array jabatan
        const rolesArray = Array.isArray(t.jabatan) ? t.jabatan : (t.jabatan ? [t.jabatan] : ['Guru']);
        const hasRole = (prefix: string) =>
          rolesArray.some((r) => r.toLowerCase().startsWith(prefix.toLowerCase()));

        // Buat string keterangan gabungan
        const detailKeterangan = [];
        if (hasRole('Guru') && t.subject) {
          detailKeterangan.push(Array.isArray(t.subject) ? t.subject.join(', ') : t.subject);
        }
        if (hasRole('Wali Kelas') && t.homeroom_class) {
          detailKeterangan.push(t.homeroom_class.name);
        }
        if (hasRole('Kapro') && t.konsentrasi_keahlian) {
          detailKeterangan.push(t.konsentrasi_keahlian);
        }
        if (hasRole('Waka') && t.waka_field) {
          detailKeterangan.push(t.waka_field);
        }

        return {
          id: t.id.toString(),
          nip: t.nip,
          name: t.name,
          role: rolesArray.join(' | '), // Gabungkan peran pakai separator pipe
          phone: t.phone,
          subject: t.subject,
          homeroom_class: t.homeroom_class,
          waka_field: t.waka_field,
          email: t.email,
          keterangan: detailKeterangan.length > 0 ? detailKeterangan.join(' | ') : '-',
          gender: t.gender || 'Laki-Laki'
        };
      });

      setGuruList(mappedGuru);
      setTotalPages(response.meta?.last_page || 1);

    } catch (err: any) {
      console.error('Error fetching teachers:', err);
      setError('Gagal memuat data guru.');
    } finally {
      setLoading(false);
    }
  };

  const fetchMasterData = async () => {
    try {
      const [subjectsRes, classesRes, majorsRes] = await Promise.all([
        masterService.getSubjects(),
        masterService.getClasses(),
        masterService.getMajors()
      ]);
      setSubjects(subjectsRes.data || []);
      setClasses(classesRes.data || []);
      setMajors(majorsRes.data || []);
    } catch (err) {
      console.error('Error fetching master data:', err);
    }
  };

  useEffect(() => {
    fetchMasterData();
  }, []);

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      fetchTeachers();
    }, 500);
    return () => clearTimeout(timeoutId);
  }, [pageIndex, searchValue]);

  // ==================== EVENT HANDLERS ====================
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    // Hapus error saat user mengetik
    setFormErrors(prev => ({ ...prev, [name]: '' }));
  };

  const handleRoleToggle = (roleValue: string) => {
    setFormData(prev => {
      const currentRoles = prev.roles;
      if (currentRoles.includes(roleValue)) {
        return { ...prev, roles: currentRoles.filter(r => r !== roleValue) };
      } else {
        return { ...prev, roles: [...currentRoles, roleValue] };
      }
    });
    setFormErrors(prev => ({ ...prev, roles: '' }));
  };

  const validateForm = () => {
    const errors: { [key: string]: string } = {};

    if (!formData.namaGuru.trim()) errors.namaGuru = 'Nama guru harus diisi';
    if (!formData.kodeGuru.trim()) errors.kodeGuru = 'NIP/Kode guru harus diisi';

    if (formData.roles.length === 0) {
      errors.roles = 'Pilih minimal satu peran';
    }

    if (formData.roles.includes('Guru') && formData.subjects.length === 0) {
      errors.subjects = 'Mata pelajaran harus dipilih';
    }
    if (formData.roles.includes('Wali Kelas')) {
      if (!formData.waliGrade) errors.waliGrade = 'Tingkatan binaan harus dipilih';
      if (!formData.waliKelasId) errors.waliKelasId = 'Kelas binaan harus dipilih';
    }
    if (formData.roles.includes('Kapro') && !formData.kaproField) {
      errors.kaproField = 'Program keahlian harus dipilih';
    }
    if (formData.roles.includes('Waka') && !formData.wakaField) {
      errors.wakaField = 'Jabatan Waka harus dipilih';
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleTambahGuru = () => {
    setFormData({
      namaGuru: '',
      kodeGuru: '',
      jenisKelamin: 'Laki-Laki',
      roles: [],
      subjects: [],
      waliGrade: '',
      waliKelasId: '',
      wakaField: '',
      kaproField: '',
      noTelp: '',
      email: '',
      password: ''
    });
    setFormErrors({});
    setShowDuplicateWarning(false);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setShowDuplicateWarning(false);
  };

  const handleSubmitForm = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    // Peringatan NIP Duplikat (Frontend check)
    if (guruList.some(g => g.nip === formData.kodeGuru)) {
      setDuplicateWarningMessage(`NIP/Kode "${formData.kodeGuru}" sudah terdaftar.`);
      setShowDuplicateWarning(true);
      return;
    }

    try {
      const payload: any = {
        name: formData.namaGuru,
        nip: formData.kodeGuru,
        jabatan: formData.roles, // Kirim sebagai Array
        phone: formData.noTelp,
        email: formData.email || `${formData.kodeGuru}@deskta.com`,
        password: formData.password || 'password123',

        // Kirim properti opsional sesuai peran yang dipilih
        subject: formData.roles.includes('Guru') ? formData.subjects : null,
        homeroom_class_id: formData.roles.includes('Wali Kelas')
          ? formData.waliKelasId
          : null,
        bidang: formData.roles.includes('Waka') ? formData.wakaField : null,
        konsentrasi_keahlian: formData.roles.includes('Kapro') ? formData.kaproField : null,
      };

      await teacherService.createTeacher(payload);
      alert('✓ Data guru berhasil ditambahkan!');
      handleCloseModal();
      fetchTeachers();
    } catch (err: any) {
      console.error(err);
      alert('Gagal menambahkan guru: ' + (err.message || 'Unknown error'));
    }
  };

  // ==================== OPTIONS ====================
  const roleOptions = [
    { label: 'Guru', value: 'Guru' },
    { label: 'Wali Kelas', value: 'Wali Kelas' },
    { label: 'Kapro', value: 'Kapro' },
    { label: 'Waka', value: 'Waka' },
  ];

  const wakaOptions = [
    { label: 'Waka Kesiswaan', value: 'Waka Kesiswaan' },
    { label: 'Waka Kurikulum', value: 'Waka Kurikulum' },
    { label: 'Waka Humas', value: 'Waka Humas' },
    { label: 'Waka Sarpras', value: 'Waka Sarpras' },
  ];

  const mataPelajaranOptions = subjects.map(s => ({ label: s.name, value: s.name }));
  const kelasOptions = classes.map(c => ({ label: c.name, value: c.name }));

  // ==================== DATA FILTERING & ACTIONS ====================
  const filteredData = guruList.filter((item) => {
    const matchRole = selectedRole ? item.role.includes(selectedRole) : true;
    const matchKeterangan = selectedKeterangan ? item.keterangan.includes(selectedKeterangan) : true;
    return matchRole && matchKeterangan;
  });

  const getFilteredKeteranganOptions = () => {
    if (selectedRole === 'Guru') return mataPelajaranOptions;
    // use major list for both wali kelas and kapro as per new requirements
    if (selectedRole === 'Wali Kelas' || selectedRole === 'Kapro')
      return majors.map(m => ({ label: m.name, value: m.name }));
    if (selectedRole === 'Waka') return wakaOptions;
    return [];
  };

  const handleNavigateToDetail = (guruId: string) => {
    if (onNavigateToDetail) {
      onNavigateToDetail(guruId);
    } else {
      localStorage.setItem('selectedGuruId', guruId);
      onMenuClick('detail-guru');
    }
  };

  const handleDeleteGuru = async (id: string) => {
    if (confirm('Apakah Anda yakin ingin menghapus data guru ini?')) {
      try {
        await teacherService.deleteTeacher(id);
        alert('✓ Data guru berhasil dihapus!');
        setOpenActionId(null);
        fetchTeachers();
      } catch (err: any) {
        console.error(err);
        alert('Gagal menghapus guru: ' + err.message);
      }
    }
  };

  /* ... Biarkan Handle Export dan Import persis sama dengan kode sebelumnya ... */
  // (Fungsi Export/Import bisa kamu paste dari kodemu sebelumnya agar file tidak terlalu raksasa)

  const handleExportPDF = () => { /* Logika PDF mu */ };
  const handleExportExcel = () => { /* Logika Excel mu */ };
  const handleDownloadFormatExcel = () => { /* Logika Format mu */ };
  const handleImport = () => { fileInputRef.current?.click(); };
  const handleFileSelect = async (_e: React.ChangeEvent<HTMLInputElement>) => { /* Logika Import mu */ };


  /* ===================== RENDER ===================== */
  return (
    <AdminLayout
      pageTitle="Data Guru"
      currentPage={currentPage}
      onMenuClick={onMenuClick}
      user={user}
      onLogout={onLogout}
      hideBackground
    >
      <img src={AWANKIRI} style={{ position: "fixed", top: 0, left: 0, width: 220, zIndex: 0, pointerEvents: "none" }} alt="cloud" />
      <img src={AwanBawahkanan} style={{ position: "fixed", bottom: 0, right: 0, width: 220, zIndex: 0, pointerEvents: "none" }} alt="cloud" />

      <div style={{
        background: "rgba(255,255,255,0.85)", backdropFilter: "blur(6px)", borderRadius: 16, padding: '16px',
        boxShadow: "0 10px 30px rgba(0,0,0,0.08)", border: "1px solid rgba(255,255,255,0.6)",
        display: "flex", flexDirection: "column", gap: 14, position: "relative", zIndex: 1, minHeight: "70vh",
      }}>

        {/* FILTERS & ACTIONS */}
        <div style={{ display: 'grid', gridTemplateColumns: '200px 200px 1fr auto auto auto auto', gap: '12px', alignItems: 'flex-end' }}>
          <Select label="Peran" value={selectedRole} onChange={(v) => { setSelectedRole(v); setSelectedKeterangan(''); }} options={roleOptions} placeholder="Semua" />
          <Select
            label="Detail"
            value={selectedKeterangan}
            onChange={setSelectedKeterangan}
            options={getFilteredKeteranganOptions()}
            placeholder="Semua"
            disabled={!selectedRole}
          />

          <div style={{ position: 'relative' }}>
            <Search size={18} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: '#94A3B8' }} />
            <input
              type="text"
              placeholder="Cari Guru..."
              value={searchValue}
              onChange={(e) => setSearchValue(e.target.value)}
              style={{ width: '100%', padding: '10px 10px 10px 36px', borderRadius: '6px', border: '1px solid #E2E8F0', outline: 'none' }}
            />
          </div>

          <Button label="Tambahkan" onClick={handleTambahGuru} variant="primary" />

          <button onClick={handleDownloadFormatExcel} style={{ padding: '6px 12px', borderRadius: '6px', border: 'none', background: '#10B981', color: 'white', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}><Download size={14} /> Format Excel</button>
          <button onClick={handleImport} style={{ padding: '6px 12px', borderRadius: '6px', border: 'none', background: '#0B1221', color: 'white', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}><Upload size={14} /> Impor</button>
          <div style={{ position: 'relative' }}>
            <button onClick={() => setIsEksporDropdownOpen(!isEksporDropdownOpen)} style={{ padding: '6px 12px', borderRadius: '6px', border: 'none', background: '#0B1221', color: 'white', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}><FileDown size={14} /> Ekspor</button>
            {isEksporDropdownOpen && (
              <div style={{ position: 'absolute', top: '100%', right: 0, marginTop: 4, background: 'white', borderRadius: 8, boxShadow: '0 4px 6px rgba(0,0,0,0.1)', zIndex: 20 }}>
                <button onClick={() => { setIsEksporDropdownOpen(false); handleExportExcel(); }} style={{ padding: '8px 12px', width: '100%', textAlign: 'left', background: 'none', border: 'none', cursor: 'pointer' }}>Excel</button>
                <button onClick={() => { setIsEksporDropdownOpen(false); handleExportPDF(); }} style={{ padding: '8px 12px', width: '100%', textAlign: 'left', background: 'none', border: 'none', cursor: 'pointer' }}>PDF</button>
              </div>
            )}
          </div>
        </div>

        {/* LOADING / ERROR / TABLE */}
        {loading ? (
          <div style={{ textAlign: 'center', padding: '40px' }}>Loading...</div>
        ) : error ? (
          <div style={{ textAlign: 'center', color: 'red', padding: '40px' }}>{error}</div>
        ) : (
          <div style={{ flex: 1, overflow: 'auto', borderRadius: '12px', border: '1px solid #E2E8F0' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead style={{ position: 'sticky', top: 0, zIndex: 10 }}>
                <tr>
                  <th style={{ padding: '12px 16px', textAlign: 'left', background: '#F8FAFC', color: '#64748B', fontSize: '12px', fontWeight: '600', borderBottom: '1px solid #E2E8F0' }}>No</th>
                  <th style={{ padding: '12px 16px', textAlign: 'left', background: '#F8FAFC', color: '#64748B', fontSize: '12px', fontWeight: '600', borderBottom: '1px solid #E2E8F0' }}>Kode Guru / NIP</th>
                  <th style={{ padding: '12px 16px', textAlign: 'left', background: '#F8FAFC', color: '#64748B', fontSize: '12px', fontWeight: '600', borderBottom: '1px solid #E2E8F0' }}>Nama Guru</th>
                  <th style={{ padding: '12px 16px', textAlign: 'left', background: '#F8FAFC', color: '#64748B', fontSize: '12px', fontWeight: '600', borderBottom: '1px solid #E2E8F0' }}>Peran</th>
                  <th style={{ padding: '12px 16px', textAlign: 'left', background: '#F8FAFC', color: '#64748B', fontSize: '12px', fontWeight: '600', borderBottom: '1px solid #E2E8F0' }}>Keterangan</th>
                  <th style={{ padding: '12px 16px', textAlign: 'center', background: '#F8FAFC', color: '#64748B', fontSize: '12px', fontWeight: '600', borderBottom: '1px solid #E2E8F0', width: '80px' }}>Aksi</th>
                </tr>
              </thead>
              <tbody>
                {filteredData.length > 0 ? (
                  filteredData.map((guru, index) => (
                    <tr key={guru.id} style={{ borderBottom: '1px solid #F1F5F9' }}>
                      <td style={{ padding: '12px 16px', fontSize: '13px', color: '#334155' }}>{(pageIndex - 1) * itemsPerPage + index + 1}</td>
                      <td style={{ padding: '12px 16px', fontSize: '13px', color: '#334155' }}>{guru.nip}</td>
                      <td style={{ padding: '12px 16px', fontSize: '13px', color: '#334155' }}>{guru.name}</td>

                      {/* KOLOM PERAN DENGAN MULTI-ROLE STYLE */}
                      <td style={{ padding: '12px 16px' }}>
                        <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
                          {guru.role.split(' | ').map((r, i) => (
                            <span key={i} style={{
                              padding: '2px 8px', borderRadius: '12px', fontSize: '11px', fontWeight: 600,
                              backgroundColor: r === 'Wali Kelas' ? '#DBEAFE' : r === 'Guru' ? '#DCFCE7' : '#F3E8FF',
                              color: r === 'Wali Kelas' ? '#1E40AF' : r === 'Guru' ? '#166534' : '#6B21A8',
                            }}>
                              {r}
                            </span>
                          ))}
                        </div>
                      </td>

                      <td style={{ padding: '12px 16px', fontSize: '13px', color: '#334155' }}>{guru.keterangan}</td>

                      <td style={{ padding: '12px 16px', textAlign: 'center' }}>
                        <div style={{ position: 'relative' }}>
                          <button onClick={() => setOpenActionId(openActionId === guru.id ? null : guru.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '4px' }}>
                            <MoreVertical size={16} color="#64748B" />
                          </button>
                          {openActionId === guru.id && (
                            <div style={{ position: 'absolute', right: '100%', top: 0, background: 'white', borderRadius: '8px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)', border: '1px solid #E2E8F0', zIndex: 50, minWidth: '120px', overflow: 'hidden' }}>
                              <button onClick={() => handleNavigateToDetail(guru.id)} style={{ width: '100%', padding: '8px 12px', textAlign: 'left', background: 'none', border: 'none', fontSize: '13px', color: '#334155', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <Eye size={14} /> Detail
                              </button>
                              <button onClick={() => handleDeleteGuru(guru.id)} style={{ width: '100%', padding: '8px 12px', textAlign: 'left', background: 'none', border: 'none', fontSize: '13px', color: '#EF4444', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <Trash2 size={14} /> Hapus
                              </button>
                            </div>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={6} style={{ padding: '32px', textAlign: 'center', color: '#94A3B8' }}>Tidak ada data guru.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}

        {/* PAGINATION */}
        <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '10px' }}>
          <div style={{ display: 'flex', gap: '8px' }}>
            <Button label="Previous" onClick={() => setPageIndex(Math.max(1, pageIndex - 1))} disabled={pageIndex === 1} variant="secondary" />
            <span style={{ display: 'flex', alignItems: 'center' }}>Page {pageIndex} of {totalPages}</span>
            <Button label="Next" onClick={() => setPageIndex(Math.min(totalPages, pageIndex + 1))} disabled={pageIndex === totalPages} variant="secondary" />
          </div>
        </div>
      </div>

      {/* MODAL TAMBAH GURU MULTI-ROLE */}
      {isModalOpen && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100 }}>
          <div style={{ background: 'white', padding: '24px', borderRadius: '12px', width: '500px', maxHeight: '90vh', overflow: 'auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px' }}>
              <h3 style={{ margin: 0 }}>Tambah Guru Baru</h3>
              <button onClick={handleCloseModal} style={{ background: 'none', border: 'none', cursor: 'pointer' }}><X size={20} /></button>
            </div>

            {showDuplicateWarning && (
              <div style={{ backgroundColor: '#FEF2F2', border: '1px solid #FECACA', borderRadius: '8px', padding: '12px', marginBottom: '16px', display: 'flex', alignItems: 'flex-start', gap: '8px' }}>
                <div style={{ flex: 1 }}>
                  <div style={{ color: '#991B1B', fontWeight: '700', fontSize: '13px' }}>Peringatan</div>
                  <p style={{ margin: 0, color: '#B91C1C', fontSize: '12px' }}>{duplicateWarningMessage}</p>
                </div>
                <button onClick={() => setShowDuplicateWarning(false)} style={{ background: 'none', border: 'none', color: '#991B1B', cursor: 'pointer' }}><X size={14} /></button>
              </div>
            )}

            <form onSubmit={handleSubmitForm} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <label>Nama Lengkap (Beserta Gelar)</label>
                <input type="text" name="namaGuru" value={formData.namaGuru} onChange={handleInputChange} style={{ width: '100%', padding: '8px', marginTop: '4px', borderRadius: '4px', border: '1px solid #ccc' }} />
                {formErrors.namaGuru && <span style={{ color: 'red', fontSize: '12px' }}>{formErrors.namaGuru}</span>}
              </div>

              <div>
                <label>NIP / Kode Guru</label>
                <input type="text" name="kodeGuru" value={formData.kodeGuru} onChange={handleInputChange} style={{ width: '100%', padding: '8px', marginTop: '4px', borderRadius: '4px', border: '1px solid #ccc' }} />
                {formErrors.kodeGuru && <span style={{ color: 'red', fontSize: '12px' }}>{formErrors.kodeGuru}</span>}
              </div>

              {/* SEKSI PERAN - MULTIPLE CHECKBOX */}
              <div>
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: 600 }}>Pilih Peran (Bisa lebih dari satu)</label>
                <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                  {roleOptions.map(opt => (
                    <label key={opt.value} style={{ display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer' }}>
                      <input
                        type="checkbox"
                        checked={formData.roles.includes(opt.value)}
                        onChange={() => handleRoleToggle(opt.value)}
                      />
                      {opt.label}
                    </label>
                  ))}
                </div>
                {formErrors.roles && <span style={{ color: 'red', fontSize: '12px' }}>{formErrors.roles}</span>}
              </div>

              {/* DYNAMIC FIELDS BERDASARKAN PERAN */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', padding: '12px', backgroundColor: '#F8FAFC', borderRadius: '8px', border: '1px solid #E2E8F0' }}>
                {formData.roles.length === 0 && (
                  <span style={{ fontSize: '12px', color: '#64748B', fontStyle: 'italic' }}>Pilih peran di atas untuk mengisi detail...</span>
                )}

                {formData.roles.includes('Guru') && (
                  <div>
                    <label style={{ fontSize: '13px', fontWeight: 600 }}>Mata Pelajaran</label>
                    <select
                      name="subjects"
                      multiple
                      value={formData.subjects}
                      onChange={(e) => {
                        const opts = Array.from(e.target.selectedOptions).map(o => o.value);
                        setFormData(p => ({ ...p, subjects: opts }));
                      }}
                      style={{ width: '100%', padding: '8px', marginTop: '4px', borderRadius: '4px', border: '1px solid #ccc', minHeight: '120px' }}
                    >
                      {mataPelajaranOptions.map((opt: { label: string; value: string }) => (
                        <option key={opt.value} value={opt.label}>{opt.label}</option>
                      ))}
                    </select>
                    {formErrors.subjects && <span style={{ color: 'red', fontSize: '12px' }}>{formErrors.subjects}</span>}
                  </div>
                )}

                {formData.roles.includes('Wali Kelas') && (
                  <div style={{ display: 'flex', gap: '12px' }}>
                    <div style={{ flex: 1 }}>
                      <label style={{ fontSize: '13px', fontWeight: 600 }}>Tingkatan Binaan</label>
                      <select
                        name="waliGrade"
                        value={formData.waliGrade}
                        onChange={(e) => {
                          handleInputChange(e);
                          // clear class id when grade changes
                          setFormData(p => ({ ...p, waliKelasId: '' }));
                        }}
                        style={{ width: '100%', padding: '8px', marginTop: '4px', borderRadius: '4px', border: '1px solid #ccc' }}
                      >
                        <option value="">Pilih Tingkatan</option>
                        <option value="10">10</option>
                        <option value="11">11</option>
                        <option value="12">12</option>
                      </select>
                      {formErrors.waliGrade && <span style={{ color: 'red', fontSize: '12px' }}>{formErrors.waliGrade}</span>}
                    </div>
                    <div style={{ flex: 2 }}>
                      <label style={{ fontSize: '13px', fontWeight: 600 }}>Kelas Binaan (Wali Kelas)</label>
                      <select
                        name="waliKelasId"
                        value={formData.waliKelasId}
                        onChange={handleInputChange}
                        style={{ width: '100%', padding: '8px', marginTop: '4px', borderRadius: '4px', border: '1px solid #ccc' }}
                      >
                        <option value="">Pilih Kelas</option>
                        {kelasOptions
                          .filter(o => !formData.waliGrade || classes.find(c => c.id.toString() === o.value)?.grade === formData.waliGrade)
                          .map((opt: { label: string; value: string }) => (
                            <option key={opt.value} value={opt.value}>{opt.label}</option>
                          ))}
                      </select>
                      {formErrors.waliKelasId && <span style={{ color: 'red', fontSize: '12px' }}>{formErrors.waliKelasId}</span>}
                    </div>
                  </div>
                )}

                {formData.roles.includes('Kapro') && (
                  <div>
                    <label style={{ fontSize: '13px', fontWeight: 600 }}>Program Keahlian (Kapro)</label>
                    <select name="kaproField" value={formData.kaproField} onChange={handleInputChange} style={{ width: '100%', padding: '8px', marginTop: '4px', borderRadius: '4px', border: '1px solid #ccc' }}>
                      <option value="">Pilih Program Keahlian</option>
                      {majors.map(m => <option key={m.id} value={m.name}>{m.name}</option>)}
                    </select>
                    {formErrors.kaproField && <span style={{ color: 'red', fontSize: '12px' }}>{formErrors.kaproField}</span>}
                  </div>
                )}

                {formData.roles.includes('Waka') && (
                  <div>
                    <label style={{ fontSize: '13px', fontWeight: 600 }}>Jabatan Waka</label>
                    <select name="wakaField" value={formData.wakaField} onChange={handleInputChange} style={{ width: '100%', padding: '8px', marginTop: '4px', borderRadius: '4px', border: '1px solid #ccc' }}>
                      <option value="">Pilih Jabatan</option>
                      {wakaOptions.map(opt => <option key={opt.value} value={opt.label}>{opt.label}</option>)}
                    </select>
                    {formErrors.wakaField && <span style={{ color: 'red', fontSize: '12px' }}>{formErrors.wakaField}</span>}
                  </div>
                )}
              </div>

              <div>
                <label>Nomor Telepon (Opsional)</label>
                <input
                  type="text"
                  name="noTelp"
                  value={formData.noTelp}
                  onChange={(e) => {
                    const val = e.target.value.replace(/\D/g, '').slice(0, 15);
                    setFormData(prev => ({ ...prev, noTelp: val }));
                  }}
                  placeholder="08xxxxxxxxxxxx"
                  style={{ width: '100%', padding: '8px', marginTop: '4px', borderRadius: '4px', border: '1px solid #ccc' }}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '20px' }}>
                <Button label="Batal" onClick={handleCloseModal} variant="secondary" type="button" />
                <Button label="Simpan" type="submit" variant="primary" />
              </div>
            </form>
          </div>
        </div>
      )}

      {/* HIDDEN INPUT IMPORT */}
      <input type="file" ref={fileInputRef} hidden onChange={handleFileSelect} accept=".xlsx,.xls,.csv" />
    </AdminLayout>
  );
}
