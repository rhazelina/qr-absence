// FILE: JurusanAdmin.tsx - Halaman Admin untuk mengelola data konsentrasi keahlian
// ✅ PERBAIKAN: Layout lebih pendek dan kompak
// ✅ PERBAIKAN: Validasi real-time
// ✅ PERBAIKAN: Styling konsisten
import { useState, useEffect } from 'react';
import AdminLayout from '../../component/Admin/AdminLayout';
import { Button } from '../../component/Shared/Button';
import { Table } from '../../component/Shared/Table';
import { 
  MoreVertical,
  Trash2,
  Edit,
  Plus, 
  Search,
  X,
  Briefcase,
  Loader2
} from 'lucide-react';
import { majorService } from '../../services/major';
import type { Major } from '../../services/major';

/* ============ IMPORT GAMBAR AWAN ============ */
import AWANKIRI from '../../assets/Icon/AWANKIRI.png';
import AwanBawahkanan from '../../assets/Icon/AwanBawahkanan.png';

/* ===================== INTERFACE DEFINITIONS ===================== */
interface User {
  role: string;
  name: string;
}



interface JurusanAdminProps {
  user: User;
  onLogout: () => void;
  currentPage: string;
  onMenuClick: (page: string) => void;
}

/* ===================== NO DUMMY DATA ===================== */

/* ===================== MAIN COMPONENT ===================== */
export default function JurusanAdmin({
  user,
  onLogout,
  currentPage,
  onMenuClick,
}: JurusanAdminProps) {
  // ==================== STATE MANAGEMENT ====================
  const [searchValue, setSearchValue] = useState('');
  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const [konsentrasiKeahlianList, setKonsentrasiKeahlianList] = useState<Major[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [editingKonsentrasiKeahlian, setEditingKonsentrasiKeahlian] = useState<Major | null>(null);
  const [formData, setFormData] = useState({ namaJurusan: '', kodeJurusan: '' });
  const [openActionId, setOpenActionId] = useState<number | null>(null);
  const [isEditMode, setIsEditMode] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // ==================== FETCH DATA ====================
  const fetchMajors = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await majorService.getMajors();
      setKonsentrasiKeahlianList(data);
    } catch (err) {
      console.error('Failed to fetch majors:', err);
      setError('Gagal mengambil data konsentrasi keahlian. Silakan coba lagi.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchMajors();
  }, []);

  // ==================== FILTERING DATA ====================
  const filteredData = konsentrasiKeahlianList.filter((item) =>
    item.name.toLowerCase().includes(searchValue.toLowerCase()) ||
    item.code.toLowerCase().includes(searchValue.toLowerCase())
  );

  // ==================== CHECK DUPLICATE ====================
  const checkDuplicate = (kode: string, nama: string, excludeId?: number) => {
    return konsentrasiKeahlianList.some(item => 
      (item.code.toLowerCase() === kode.toLowerCase() || item.name.toLowerCase() === nama.toLowerCase()) &&
      item.id !== excludeId
    );
  };

  // ==================== EVENT HANDLERS ====================
  const handleTambahJurusan = () => {
    setEditingKonsentrasiKeahlian(null);
    setFormData({ namaJurusan: '', kodeJurusan: '' });
    setIsEditMode(false);
    setErrorMessage('');
    setIsPopupOpen(true);
  };

  const handleEditJurusan = (jurusan: Major) => {
    setEditingKonsentrasiKeahlian(jurusan);
    setFormData({ namaJurusan: jurusan.name, kodeJurusan: jurusan.code });
    setIsEditMode(true);
    setErrorMessage('');
    setIsPopupOpen(true);
    setOpenActionId(null);
  };

  const handleDeleteJurusan = async (id: number) => {
    const jurusan = konsentrasiKeahlianList.find(j => j.id === id);
    if (!jurusan) return;

    if (confirm(`Apakah Anda yakin ingin menghapus konsentrasi keahlian "${jurusan.name}"?`)) {
      try {
        await majorService.deleteMajor(id);
        setKonsentrasiKeahlianList((prev) => prev.filter((item) => item.id !== id));
        alert('✓ Data berhasil dihapus!');
      } catch (err) {
        console.error('Failed to delete major:', err);
        alert('Gagal menghapus data. Silakan coba lagi.');
      }
    }
    setOpenActionId(null);
  };

  const handleClosePopup = () => {
    setIsPopupOpen(false);
    setEditingKonsentrasiKeahlian(null);
    setErrorMessage('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validasi input
    if (!formData.namaJurusan.trim() || !formData.kodeJurusan.trim()) {
      setErrorMessage("Nama dan kode konsentrasi keahlian harus diisi");
      return;
    }

    // Validasi format kode (huruf dan angka saja, maks 20 karakter sesuai backend)
    const kodeRegex = /^[a-zA-Z0-9-_\s]{1,20}$/;
    if (!kodeRegex.test(formData.kodeJurusan)) {
      setErrorMessage("Kode hanya boleh berisi huruf, angka, dash, dan underscore, maksimal 20 karakter");
      return;
    }

    // Validasi duplikasi
    const isDuplicate = checkDuplicate(
      formData.kodeJurusan, 
      formData.namaJurusan, 
      editingKonsentrasiKeahlian?.id
    );

    if (isDuplicate) {
      setErrorMessage("Kode atau nama konsentrasi keahlian sudah ada. Harap gunakan yang berbeda.");
      return;
    }

    try {
      setIsSubmitting(true);
      const dataToSave = {
        name: formData.namaJurusan,
        code: formData.kodeJurusan,
      };

      if (isEditMode && editingKonsentrasiKeahlian) {
        const updatedMajor = await majorService.updateMajor(editingKonsentrasiKeahlian.id, dataToSave);
        setKonsentrasiKeahlianList((prev) =>
          prev.map((k) => (k.id === updatedMajor.id ? updatedMajor : k))
        );
        alert(`Konsentrasi keahlian "${formData.namaJurusan}" berhasil diperbarui!`);
      } else {
        const newMajor = await majorService.createMajor(dataToSave);
        setKonsentrasiKeahlianList((prev) => [newMajor, ...prev]);
        alert(`Konsentrasi keahlian "${formData.namaJurusan}" berhasil ditambahkan!`);
      }
      handleClosePopup();
    } catch (err: any) {
      console.error('Failed to save major:', err);
      const errorMsg = err.response?.data?.message || err.message || "Gagal menyimpan data.";
      setErrorMessage(errorMsg);
    } finally {
      setIsSubmitting(false);
    }
  };

  /* ===================== TABLE CONFIGURATION ===================== */
  const columns = [
    { key: 'code', label: 'Kode', width: '20%' },
    { key: 'name', label: 'Nama Konsentrasi Keahlian', width: '60%' },
    {
      key: 'aksi',
      label: 'Aksi',
      width: '20%',
      render: (_: any, row: Major) => (
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
                onClick={() => handleEditJurusan(row)}
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
                onClick={() => handleDeleteJurusan(row.id)}
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

  return (
    <AdminLayout
      pageTitle="Data Konsentrasi Keahlian"
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
          maxWidth: '800px',
          margin: '0 auto',
        }}
      >
        {/* ============ HEADER & ACTION ============ */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            gap: '12px',
          }}
        >
          {/* Search Box */}
          <div style={{ position: 'relative', flex: 1, maxWidth: '300px' }}>
            <Search
              size={16}
              color="#9CA3AF"
              style={{
                position: 'absolute',
                left: '10px',
                top: '50%',
                transform: 'translateY(-50%)',
                pointerEvents: 'none',
              }}
            />
            <input
              type="text"
              placeholder="Cari jurusan..."
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
                height: '36px',
              }}
            />
          </div>

          <Button
            label="Tambahkan"
            icon={<Plus size={16} />}
            onClick={handleTambahJurusan}
            variant="primary"
          />
        </div>

        {/* ============ DATA TABLE ============ */}
        <div style={{ 
          borderRadius: 12, 
          overflow: 'hidden', 
          boxShadow: '0 0 0 1px #E5E7EB',
          background: '#FFFFFF',
          minHeight: '200px',
          display: 'flex',
          flexDirection: 'column',
        }}>
          {isLoading ? (
            <div style={{ 
              flex: 1, 
              display: 'flex', 
              flexDirection: 'column', 
              alignItems: 'center', 
              justifyContent: 'center',
              gap: '12px',
              padding: '40px'
            }}>
              <Loader2 size={32} className="animate-spin" color="#2563EB" />
              <p style={{ color: '#64748B', fontSize: '14px' }}>Memuat data...</p>
            </div>
          ) : error ? (
            <div style={{ 
              flex: 1, 
              display: 'flex', 
              flexDirection: 'column', 
              alignItems: 'center', 
              justifyContent: 'center',
              gap: '12px',
              padding: '40px',
              textAlign: 'center'
            }}>
              <p style={{ color: '#EF4444', fontSize: '14px' }}>{error}</p>
              <Button label="Coba Lagi" onClick={fetchMajors} variant="secondary" />
            </div>
          ) : (
            <Table columns={columns} data={filteredData} keyField="id" />
          )}
        </div>
      </div>

      {/* ============ MODAL TAMBAH/EDIT JURUSAN ============ */}
      {isPopupOpen && (
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
          onClick={handleClosePopup}
        >
          <div
            style={{
              backgroundColor: '#FFFFFF',
              borderRadius: '16px',
              padding: '24px',
              maxWidth: '400px',
              width: '100%',
              boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
              transform: 'scale(1)',
              transition: 'transform 0.2s',
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
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <div style={{
                  background: '#EFF6FF',
                  padding: '8px',
                  borderRadius: '8px',
                }}>
                  <Briefcase size={20} color="#2563EB" />
                </div>
                <h2 style={{
                  margin: 0,
                  fontSize: '16px',
                  fontWeight: '700',
                  color: '#1E293B',
                }}>
                  {isEditMode ? 'Edit Konsentrasi Keahlian' : 'Tambah Konsentrasi Keahlian'}
                </h2>
              </div>
              <button
                onClick={handleClosePopup}
                style={{
                  background: 'transparent',
                  border: 'none',
                  cursor: 'pointer',
                  padding: '4px',
                  borderRadius: '4px',
                  color: '#94A3B8',
                }}
              >
                <X size={20} />
              </button>
            </div>

            {errorMessage && (
              <div style={{
                backgroundColor: '#FEF2F2',
                border: '1px solid #FECACA',
                color: '#EF4444',
                padding: '10px',
                borderRadius: '8px',
                fontSize: '13px',
                marginBottom: '16px',
              }}>
                {errorMessage}
              </div>
            )}

            <form onSubmit={handleSubmit}>
              <div style={{ marginBottom: '16px' }}>
                <label style={{
                  display: 'block',
                  fontSize: '13px',
                  fontWeight: '600',
                  color: '#475569',
                  marginBottom: '6px',
                }}>
                  Nama Konsentrasi Keahlian <span style={{ color: '#EF4444' }}>*</span>
                </label>
                <input
                  type="text"
                  value={formData.namaJurusan}
                  onChange={(e) => setFormData({ ...formData, namaJurusan: e.target.value })}
                  placeholder="Contoh: Rekayasa Perangkat Lunak"
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    border: '1px solid #CBD5E1',
                    borderRadius: '8px',
                    fontSize: '14px',
                    outline: 'none',
                    boxSizing: 'border-box',
                    transition: 'border-color 0.2s',
                  }}
                  onFocus={(e) => e.currentTarget.style.borderColor = '#3B82F6'}
                  onBlur={(e) => e.currentTarget.style.borderColor = '#CBD5E1'}
                />
              </div>

              <div style={{ marginBottom: '24px' }}>
                <label style={{
                  display: 'block',
                  fontSize: '13px',
                  fontWeight: '600',
                  color: '#475569',
                  marginBottom: '6px',
                }}>
                  Kode Singkatan <span style={{ color: '#EF4444' }}>*</span>
                </label>
                <input
                  type="text"
                  value={formData.kodeJurusan}
                  onChange={(e) => setFormData({ ...formData, kodeJurusan: e.target.value.toUpperCase() })}
                  placeholder="Contoh: RPL"
                  maxLength={10}
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    border: '1px solid #CBD5E1',
                    borderRadius: '8px',
                    fontSize: '14px',
                    outline: 'none',
                    boxSizing: 'border-box',
                    transition: 'border-color 0.2s',
                    textTransform: 'uppercase',
                  }}
                  onFocus={(e) => e.currentTarget.style.borderColor = '#3B82F6'}
                  onBlur={(e) => e.currentTarget.style.borderColor = '#CBD5E1'}
                />
                <p style={{ margin: '4px 0 0', fontSize: '11px', color: '#94A3B8' }}>
                  Maksimal 10 karakter huruf atau angka
                </p>
              </div>

              <div style={{ display: 'flex', gap: '10px' }}>
                <button
                  type="button"
                  onClick={handleClosePopup}
                  style={{
                    flex: 1,
                    padding: '10px',
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
                      padding: '10px',
                      backgroundColor: isSubmitting ? '#93C5FD' : '#2563EB',
                      color: '#FFFFFF',
                      border: 'none',
                      borderRadius: '8px',
                      fontSize: '14px',
                      fontWeight: '600',
                      cursor: isSubmitting ? 'not-allowed' : 'pointer',
                      boxShadow: '0 4px 6px -1px rgba(37, 99, 235, 0.2)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '8px'
                    }}
                  >
                    {isSubmitting && <Loader2 size={16} className="animate-spin" />}
                    {isEditMode ? 'Simpan Perubahan' : 'Tambahkan'}
                  </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </AdminLayout>
  );
};
