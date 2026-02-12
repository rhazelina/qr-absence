// FILE: KelasAdmin.tsx - Halaman Admin untuk mengelola data kelas
// ✅ PERBAIKAN: Layout lebih pendek dan kompak
// ✅ PERBAIKAN: Validasi duplikasi kelas yang lebih ketat
// ✅ PERBAIKAN: Integrasi dengan data Guru & Jurusan
// ✅ PERBAIKAN: UI/UX Modal yang lebih baik
import { useState, useEffect } from 'react';
import AdminLayout from '../../component/Admin/AdminLayout';
import { Button } from '../../component/Shared/Button';
import { Select } from '../../component/Shared/Select';
import { Table } from '../../component/Shared/Table';
import { 
  MoreVertical,
  Trash2,
  Edit,
  Plus, 
  Search,
  X,
  Users,
  School,
  GraduationCap
} from 'lucide-react';

/* ============ IMPORT GAMBAR AWAN ============ */
import AWANKIRI from '../../assets/Icon/AWANKIRI.png';
import AwanBawahkanan from '../../assets/Icon/AwanBawahkanan.png';

/* ============ IMPORT SERVICES ============ */
import { classService } from '../../services/class';
import type { ClassRoom } from '../../services/class';
import { majorService } from '../../services/major';
import type { Major } from '../../services/major';
import { teacherService } from '../../services/teacher';
import type { Teacher } from '../../services/teacher';
import { Loader2 } from 'lucide-react';

/* ===================== INTERFACE DEFINITIONS ===================== */
interface User {
  role: string;
  name: string;
}

interface Kelas {
  id: string;
  namaKelas: string;
  konsentrasiKeahlian: string;
  tingkatKelas: string;
  waliKelas: string;
}

interface KelasAdminProps {
  user: User;
  onLogout: () => void;
  currentPage: string;
  onMenuClick: (page: string) => void;
}

/* ===================== OPTIONS ===================== */
const tingkatKelasOptions = [
  { value: '10', label: 'Kelas 10' },
  { value: '11', label: 'Kelas 11' },
  { value: '12', label: 'Kelas 12' },
];

/* ===================== MAIN COMPONENT ===================== */
export default function KelasAdmin({
  user,
  onLogout,
  currentPage,
  onMenuClick,
}: KelasAdminProps) {
  // ==================== STATE MANAGEMENT ====================
  const [searchValue, setSearchValue] = useState('');
  const [selectedJurusan, setSelectedJurusan] = useState('');
  const [selectedTingkat, setSelectedTingkat] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [kelasList, setKelasList] = useState<Kelas[]>([]);
  const [majors, setMajors] = useState<Major[]>([]);
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [editingKelas, setEditingKelas] = useState<Kelas | null>(null);
  const [openActionId, setOpenActionId] = useState<string | null>(null);
  const [validationError, setValidationError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // ==================== DATA FETCHING ====================
  const fetchData = async () => {
    setIsLoading(true);
    try {
      const [classesData, majorsData, teachersData] = await Promise.all([
        classService.getClasses(),
        majorService.getMajors(),
        teacherService.getTeachers()
      ]);

      const mappedClasses: Kelas[] = classesData.map((c: ClassRoom) => ({
        id: c.id.toString(),
        namaKelas: c.name || `${c.grade} ${c.major?.code || ''} ${c.label}`,
        konsentrasiKeahlian: c.major?.name || '',
        tingkatKelas: c.grade,
        waliKelas: c.homeroom_teacher?.user?.name || '-'
      }));

      setKelasList(mappedClasses);
      setMajors(majorsData);
      setTeachers(teachersData);
    } catch (error) {
      console.error('Error fetching data:', error);
      alert('Gagal mengambil data dari server');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Derived options
  const jurusanOptions = majors.map(m => ({
    value: m.name,
    label: m.name
  }));

  const availableGuruList = teachers.map(t => t.name);

  // ==================== FILTERING DATA ====================
  const filteredKelas = kelasList.filter((kelas) => {
    const matchSearch = 
      kelas.namaKelas.toLowerCase().includes(searchValue.toLowerCase()) ||
      kelas.waliKelas.toLowerCase().includes(searchValue.toLowerCase());
      
    const matchJurusan = selectedJurusan 
      ? kelas.konsentrasiKeahlian === selectedJurusan || kelas.konsentrasiKeahlian.includes(selectedJurusan)
      : true;
      
    const matchTingkat = selectedTingkat ? kelas.tingkatKelas === selectedTingkat : true;
    
    return matchSearch && matchJurusan && matchTingkat;
  });

  // ==================== HELPER FUNCTIONS ====================
  // Mendapatkan daftar wali kelas yang tersedia (belum mengampu kelas lain, kecuali diri sendiri saat edit)
  const getAvailableWaliKelas = (currentWaliKelas?: string) => {
    const occupiedWaliKelas = kelasList
      .map(k => k.waliKelas)
      .filter(w => w !== currentWaliKelas); // Exclude current wali kelas if editing
      
    return availableGuruList.filter(guru => !occupiedWaliKelas.includes(guru));
  };

  const validateKelasData = (data: any, isEdit: boolean, currentId?: string) => {
    // 1. Cek Field Kosong
    if (!data.namaKelas || !data.jurusanId || !data.kelasId) {
      return { isValid: false, message: 'Semua field wajib diisi' };
    }

    // 2. Cek Duplikasi Nama Kelas
    const isDuplicateName = kelasList.some(k => 
      k.namaKelas.toLowerCase() === data.namaKelas.toLowerCase() && 
      k.id !== currentId
    );
    if (isDuplicateName) {
      return { isValid: false, message: `Kelas dengan nama "${data.namaKelas}" sudah ada` };
    }

    // 3. Cek Duplikasi Wali Kelas
    if (data.waliKelas) {
      const isWaliKelasOccupied = kelasList.some(k => 
        k.waliKelas === data.waliKelas && 
        k.id !== currentId
      );
      if (isWaliKelasOccupied) {
        return { isValid: false, message: `Guru tersebut sudah menjadi wali kelas di kelas lain` };
      }
    }

    return { isValid: true, message: '' };
  };

  // ==================== EVENT HANDLERS ====================
  const handleTambahKelas = (data: any) => {
    // Di sini kita hanya membuka modal, logic simpan ada di ModalKelasForm -> handleSubmit
    setEditingKelas(null);
    setValidationError('');
    setIsModalOpen(true);
  };

  const handleEditKelas = (kelas: Kelas) => {
    setEditingKelas(kelas);
    setValidationError('');
    setIsModalOpen(true);
    setOpenActionId(null);
  };

  const handleDeleteKelas = async (id: string) => {
    const kelas = kelasList.find(k => k.id === id);
    if (confirm(`Apakah Anda yakin ingin menghapus kelas "${kelas?.namaKelas}"?`)) {
      try {
        await classService.deleteClass(id);
        alert('✓ Data kelas berhasil dihapus!');
        fetchData();
      } catch (error) {
        console.error('Error deleting class:', error);
        alert('Gagal menghapus kelas');
      }
    }
    setOpenActionId(null);
  };

  // Logic Submit Form ada di dalam komponen ModalKelasForm untuk simplifikasi state
  // Tapi kita butuh fungsi update state list di sini
  const updateKelasList = () => {
    fetchData(); // Just refresh everything from server
    setIsModalOpen(false);
  };

  /* ===================== TABLE CONFIGURATION ===================== */
  const columns = [
    { key: 'namaKelas', label: 'Nama Kelas', width: '20%' },
    { key: 'konsentrasiKeahlian', label: 'Konsentrasi Keahlian', width: '30%' },
    { key: 'tingkatKelas', label: 'Tingkat', width: '15%' },
    { key: 'waliKelas', label: 'Wali Kelas', width: '25%' },
    {
      key: 'aksi',
      label: 'Aksi',
      width: '10%',
      render: (_: any, row: Kelas) => (
        <div style={{ position: 'relative' }}>
          <button
            onClick={() => setOpenActionId(openActionId === row.id ? null : row.id)}
            style={{ 
              border: 'none', 
              background: 'transparent', 
              cursor: 'pointer',
              padding: '4px' 
            }}
          >
            <MoreVertical size={20} strokeWidth={1.5} color="#64748B" />
          </button>

          {openActionId === row.id && (
            <div
              style={{
                position: 'absolute',
                top: '100%',
                right: 0,
                marginTop: 4,
                background: '#FFFFFF',
                borderRadius: 8,
                boxShadow: '0 10px 15px rgba(0,0,0,0.1)',
                minWidth: 160,
                zIndex: 10,
                overflow: 'hidden',
                border: '1px solid #E2E8F0',
              }}
            >
              <button
                onClick={() => handleEditKelas(row)}
                style={{
                  width: '100%',
                  padding: '10px 14px',
                  border: 'none',
                  background: 'none',
                  textAlign: 'left',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  color: '#0F172A',
                  fontSize: '13px',
                  fontWeight: '500',
                  transition: 'all 0.2s',
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
                <Edit size={14} />
                Edit
              </button>
              
              <button
                onClick={() => handleDeleteKelas(row.id)}
                style={{
                  width: '100%',
                  padding: '10px 14px',
                  border: 'none',
                  background: 'none',
                  textAlign: 'left',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  color: '#EF4444',
                  fontSize: '13px',
                  fontWeight: '500',
                  transition: 'all 0.2s',
                }}
                onMouseEnter={(e) => {
                  (e.currentTarget as HTMLButtonElement).style.backgroundColor = '#FEF2F2';
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLButtonElement).style.backgroundColor = '#FFFFFF';
                }}
              >
                <Trash2 size={14} />
                Hapus
              </button>
            </div>
          )}
        </div>
      ),
    },
  ];

  /* ===================== SUB-COMPONENT: MODAL FORM ===================== */
  const ModalKelasForm = ({ 
    isOpen, 
    onClose, 
    editingData, 
    onSave,
    validate 
  }: {
    isOpen: boolean,
    onClose: () => void,
    editingData: Kelas | null,
    onSave: (data: Kelas, isEdit: boolean) => void,
    validate: (data: any, isEdit: boolean, id?: string) => { isValid: boolean, message: string }
  }) => {
    const [localFormData, setLocalFormData] = useState({
      namaKelas: '',
      jurusanId: '',
      kelasId: '',
      waliKelas: ''
    });
    
    useEffect(() => {
      if (editingData) {
        setLocalFormData({
          namaKelas: editingData.namaKelas,
          jurusanId: editingData.konsentrasiKeahlian,
          kelasId: editingData.tingkatKelas,
          waliKelas: editingData.waliKelas
        });
      } else {
        setLocalFormData({ namaKelas: '', jurusanId: '', kelasId: '', waliKelas: '' });
      }
    }, [editingData, isOpen]);

    if (!isOpen) return null;

    const handleSubmit = async (e: React.FormEvent) => {
      e.preventDefault();
      setIsSubmitting(true);
      
      const isEditMode = !!editingData;
      const validation = validate(localFormData, isEditMode, editingData?.id);
      
      if (!validation.isValid) {
        setValidationError(validation.message);
        setIsSubmitting(false);
        return;
      }

      // Build submission data
      const selectedMajor = majors.find(m => m.name === localFormData.jurusanId);
      const selectedTeacher = teachers.find(t => t.name === localFormData.waliKelas);

      const submitData = {
        grade: localFormData.kelasId,
        label: localFormData.namaKelas.split(' ').pop() || '', // Assuming "10 RPL 1" -> "1"
        major_id: selectedMajor?.id,
        homeroom_teacher_id: selectedTeacher?.id || null,
        name: localFormData.namaKelas.trim()
      };
      
      try {
        if (isEditMode && editingData) {
          await classService.updateClass(editingData.id, submitData);
          alert(`✓ Kelas "${localFormData.namaKelas}" berhasil diperbarui!`);
        } else {
          await classService.createClass(submitData);
          alert(`✓ Kelas "${localFormData.namaKelas}" berhasil ditambahkan!`);
        }
        onSave({} as Kelas, isEditMode); // Trigger refresh
      } catch (error: any) {
        console.error('Error saving class:', error);
        setValidationError(error.response?.data?.message || 'Gagal menyimpan data kelas');
      } finally {
        setIsSubmitting(false);
      }
    };

    return (
      <div
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          backdropFilter: 'blur(4px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 9999,
          padding: '20px',
        }}
        onClick={onClose}
      >
        <div
          style={{
            backgroundColor: '#FFFFFF',
            borderRadius: '16px',
            padding: '24px',
            maxWidth: '500px',
            width: '100%',
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
          }}
          onClick={(e) => e.stopPropagation()}
        >
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '20px',
            borderBottom: '1px solid #F1F5F9',
            paddingBottom: '12px',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div style={{
                background: '#F0F9FF',
                padding: '8px',
                borderRadius: '8px',
              }}>
                <School size={22} color="#0EA5E9" />
              </div>
              <h2 style={{
                margin: 0,
                fontSize: '18px',
                fontWeight: '700',
                color: '#0F172A',
              }}>
                {editingData ? 'Edit Data Kelas' : 'Tambah Kelas Baru'}
              </h2>
            </div>
            <button onClick={onClose} style={{ background: 'transparent', border: 'none', cursor: 'pointer' }}>
              <X size={20} color="#64748B" />
            </button>
          </div>

          {validationError && (
            <div style={{
              backgroundColor: '#FEF2F2',
              border: '1px solid #FECACA',
              color: '#EF4444',
              padding: '12px',
              borderRadius: '8px',
              fontSize: '13px',
              marginBottom: '16px',
            }}>
              ⚠️ {validationError}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div style={{ display: 'grid', gap: '16px' }}>
              
              {/* Nama Kelas */}
              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#475569', marginBottom: '6px' }}>
                  Nama Kelas <span style={{ color: '#EF4444' }}>*</span>
                </label>
                <input
                  type="text"
                  value={localFormData.namaKelas}
                  onChange={(e) => setLocalFormData({...localFormData, namaKelas: e.target.value})}
                  placeholder="Contoh: 10 RPL 1"
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    border: '1px solid #CBD5E1',
                    borderRadius: '8px',
                    fontSize: '14px',
                    outline: 'none',
                    boxSizing: 'border-box',
                  }}
                  onFocus={(e) => e.currentTarget.style.borderColor = '#0EA5E9'}
                  onBlur={(e) => e.currentTarget.style.borderColor = '#CBD5E1'}
                />
              </div>

              {/* Tingkat Kelas */}
              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#475569', marginBottom: '6px' }}>
                  Tingkat Kelas <span style={{ color: '#EF4444' }}>*</span>
                </label>
                <div style={{ display: 'flex', gap: '10px' }}>
                  {tingkatKelasOptions.map(opt => (
                    <button
                      key={opt.value}
                      type="button"
                      onClick={() => setLocalFormData({...localFormData, kelasId: opt.value})}
                      style={{
                        flex: 1,
                        padding: '10px',
                        borderRadius: '8px',
                        border: localFormData.kelasId === opt.value ? '2px solid #0EA5E9' : '1px solid #CBD5E1',
                        backgroundColor: localFormData.kelasId === opt.value ? '#F0F9FF' : '#FFFFFF',
                        color: localFormData.kelasId === opt.value ? '#0369A1' : '#64748B',
                        fontWeight: '600',
                        fontSize: '13px',
                        cursor: 'pointer',
                        transition: 'all 0.2s',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '6px',
                      }}
                    >
                      <GraduationCap size={16} />
                      {opt.label.replace('Kelas ', '')}
                    </button>
                  ))}
                </div>
              </div>

              {/* Konsentrasi Keahlian */}
              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#475569', marginBottom: '6px' }}>
                  Konsentrasi Keahlian <span style={{ color: '#EF4444' }}>*</span>
                </label>
                <select
                  value={localFormData.jurusanId}
                  onChange={(e) => setLocalFormData({...localFormData, jurusanId: e.target.value})}
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    border: '1px solid #CBD5E1',
                    borderRadius: '8px',
                    fontSize: '14px',
                    outline: 'none',
                    background: '#FFFFFF',
                    cursor: 'pointer',
                  }}
                >
                  <option value="">Pilih Jurusan</option>
                  {jurusanOptions.map(opt => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                  ))}
                </select>
              </div>

              {/* Wali Kelas */}
              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#475569', marginBottom: '6px' }}>
                  Wali Kelas <span style={{ color: '#94A3B8', fontWeight: '400' }}>(Opsional)</span>
                </label>
                <div style={{ position: 'relative' }}>
                  <Users size={18} color="#94A3B8" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
                  <select
                    value={localFormData.waliKelas}
                    onChange={(e) => setLocalFormData({...localFormData, waliKelas: e.target.value})}
                    style={{
                      width: '100%',
                      padding: '10px 12px 10px 40px',
                      border: '1px solid #CBD5E1',
                      borderRadius: '8px',
                      fontSize: '14px',
                      outline: 'none',
                      background: '#FFFFFF',
                      cursor: 'pointer',
                    }}
                  >
                    <option value="">Belum Ada Wali Kelas</option>
                    {/* Jika sedang edit, pastikan wali kelas saat ini tetap muncul di opsi */}
                    {editingData && editingData.waliKelas && !getAvailableWaliKelas(editingData.waliKelas).includes(editingData.waliKelas) && (
                      <option value={editingData.waliKelas}>{editingData.waliKelas}</option>
                    )}
                    {getAvailableWaliKelas(editingData?.waliKelas).map((guru, idx) => (
                      <option key={idx} value={guru}>{guru}</option>
                    ))}
                  </select>
                </div>
              </div>

            </div>

            <div style={{ display: 'flex', gap: '10px', marginTop: '24px' }}>
              <button
                type="button"
                onClick={onClose}
                style={{
                  flex: 1,
                  padding: '12px',
                  backgroundColor: '#F1F5F9',
                  color: '#475569',
                  border: 'none',
                  borderRadius: '8px',
                  fontSize: '14px',
                  fontWeight: '600',
                  cursor: 'pointer',
                }}
              >
                Batal
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                style={{
                  flex: 1,
                  padding: '12px',
                  backgroundColor: '#0EA5E9',
                  color: '#FFFFFF',
                  border: 'none',
                  borderRadius: '8px',
                  fontSize: '14px',
                  fontWeight: '600',
                  cursor: isSubmitting ? 'not-allowed' : 'pointer',
                  opacity: isSubmitting ? 0.7 : 1,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                }}
              >
                {isSubmitting ? 'Menyimpan...' : (editingData ? 'Simpan Perubahan' : 'Tambahkan Kelas')}
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  };

  return (
    <AdminLayout
      pageTitle="Data Kelas"
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
        {isLoading ? (
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            flex: 1,
            gap: '12px',
          }}>
            <Loader2 size={40} className="animate-spin" color="#0EA5E9" />
            <span style={{ color: '#64748B', fontWeight: '500' }}>Memuat data kelas...</span>
          </div>
        ) : (
          <>
            {/* ============ FILTER & ACTION ============ */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '1fr 0.8fr 0.8fr auto',
            gap: '8px',
            alignItems: 'flex-end',
          }}
        >
          {/* Search */}
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <label style={{ fontSize: '13px', fontWeight: 500, color: '#252525', marginBottom: '4px' }}>
              Cari Kelas / Wali Kelas
            </label>
            <div style={{ position: 'relative' }}>
              <Search
                size={16}
                color="#9CA3AF"
                style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }}
              />
              <input
                type="text"
                placeholder="Cari..."
                value={searchValue}
                onChange={(e) => setSearchValue(e.target.value)}
                style={{
                  width: '100%',
                  padding: '8px 10px 8px 32px',
                  border: '1px solid #D1D5DB',
                  borderRadius: '6px',
                  fontSize: '13px',
                  outline: 'none',
                  backgroundColor: '#FFFFFF',
                  height: '38px',
                }}
              />
            </div>
          </div>

          {/* Filter Jurusan */}
          <div>
            <Select
              label="Konsentrasi Keahlian"
              value={selectedJurusan}
              onChange={setSelectedJurusan}
              options={jurusanOptions}
              placeholder="Semua Jurusan"
            />
          </div>

          {/* Filter Tingkat */}
          <div>
            <Select
              label="Tingkat Kelas"
              value={selectedTingkat}
              onChange={setSelectedTingkat}
              options={tingkatKelasOptions}
              placeholder="Semua Tingkat"
            />
          </div>

          {/* Tombol Tambah */}
          <div style={{ height: '38px' }}>
            <Button
              label="Tambah Kelas"
              icon={<Plus size={16} />}
              onClick={handleTambahKelas}
              variant="primary"
            />
          </div>
        </div>

        {/* ============ INFO STATISTIK ============ */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(4, 1fr)',
          gap: '12px',
        }}>
          {[
            { label: 'Total Kelas', value: kelasList.length, color: '#0EA5E9' },
            { label: 'Kelas 10', value: kelasList.filter(k => k.tingkatKelas === '10').length, color: '#8B5CF6' },
            { label: 'Kelas 11', value: kelasList.filter(k => k.tingkatKelas === '11').length, color: '#F59E0B' },
            { label: 'Kelas 12', value: kelasList.filter(k => k.tingkatKelas === '12').length, color: '#10B981' },
          ].map((stat, idx) => (
            <div key={idx} style={{
              background: '#FFFFFF',
              borderRadius: '12px',
              padding: '12px 16px',
              border: '1px solid #E2E8F0',
              display: 'flex',
              flexDirection: 'column',
              boxShadow: '0 2px 5px rgba(0,0,0,0.03)',
            }}>
              <span style={{ fontSize: '12px', color: '#64748B', fontWeight: '600' }}>{stat.label}</span>
              <span style={{ fontSize: '20px', color: stat.color, fontWeight: '700', marginTop: '4px' }}>{stat.value}</span>
            </div>
          ))}
        </div>

        {/* ============ DATA TABLE ============ */}
        <div style={{ 
          borderRadius: 12, 
          overflow: 'hidden', 
          boxShadow: '0 0 0 1px #E5E7EB',
          background: '#FFFFFF',
        }}>
          <Table columns={columns} data={filteredKelas} keyField="id" />
        </div>
          </>
        )}
      </div>

      <ModalKelasForm 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        editingData={editingKelas}
        onSave={updateKelasList}
        validate={validateKelasData}
      />
    </AdminLayout>
  );
};
