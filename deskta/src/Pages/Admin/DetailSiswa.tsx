// FILE: DetailSiswa.tsx - Halaman Detail Siswa dengan Data Lengkap
import { useState, useEffect } from 'react';
import AdminLayout from '../../component/Admin/AdminLayout';
import { User as UserIcon, ArrowLeft, Edit2, Save, X } from 'lucide-react';

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
  noTelp: string;
  jurusan: string;
  jurusanId: string;
  tahunAngkatan: string;
  tahunMulai: string;
  tahunAkhir: string;
  kelas: string;
}

interface DetailSiswaProps {
  user: User;
  onLogout: () => void;
  currentPage: string;
  onMenuClick: (page: string) => void;
  siswaId: string;
  onUpdateSiswa?: (updatedSiswa: Siswa) => void;
}

/* ===================== OPTIONS DATA ===================== */
const jurusanOptions = [
  { value: 'MEK', label: 'Mekatronika' },
  { value: 'RPL', label: 'Rekayasa Perangkat Lunak' },
  { value: 'ANI', label: 'Animasi' },
  { value: 'BC', label: 'Broadcasting' },
  { value: 'EI', label: 'Elektronika Industri' },
  { value: 'TKJ', label: 'Teknik Komputer dan Jaringan' },
  { value: 'AV', label: 'Audio Video' },
  { value: 'DKV', label: 'Desain Komunikasi Visual' },
];

const kelasOptions = [
  { value: '10', label: 'Kelas 10' },
  { value: '11', label: 'Kelas 11' },
  { value: '12', label: 'Kelas 12' },
];

const jenisKelaminOptions = [
  { value: 'L', label: 'Laki-Laki' },
  { value: 'P', label: 'Perempuan' },
];

// Generate tahun options dinamis untuk dropdown
const generateTahunOptions = () => {
  const currentYear = new Date().getFullYear();
  const years = [];
  for (let i = currentYear; i >= currentYear - 20; i--) {
    years.push(i.toString());
  }
  return years;
};

/* ===================== DUMMY DATA ===================== */
const dummySiswaList: Siswa[] = [
  { 
    id: '1', 
    namaSiswa: 'M. Wito Suherman', 
    nisn: '2347839283', 
    jenisKelamin: 'L', 
    noTelp: '082183748591',
    jurusan: 'Mekatronika', 
    jurusanId: 'MEK', 
    tahunAngkatan: '2023-2026',
    tahunMulai: '2023',
    tahunAkhir: '2026',
    kelas: '10',
  },
  { 
    id: '2', 
    namaSiswa: 'Siti Nurhaliza', 
    nisn: '2347839284', 
    jenisKelamin: 'P', 
    noTelp: '081234567890',
    jurusan: 'Rekayasa Perangkat Lunak', 
    jurusanId: 'RPL', 
    tahunAngkatan: '2023-2026',
    tahunMulai: '2023',
    tahunAkhir: '2026',
    kelas: '10',
  },
  { 
    id: '3', 
    namaSiswa: 'Ahmad Rizki', 
    nisn: '2347839285', 
    jenisKelamin: 'L', 
    noTelp: '081345678901',
    jurusan: 'Teknik Komputer dan Jaringan', 
    jurusanId: 'TKJ', 
    tahunAngkatan: '2023-2026',
    tahunMulai: '2023',
    tahunAkhir: '2026',
    kelas: '11',
  },
  { 
    id: '4', 
    namaSiswa: 'Dewi Lestari', 
    nisn: '2347839286', 
    jenisKelamin: 'P', 
    noTelp: '081456789012',
    jurusan: 'Desain Komunikasi Visual', 
    jurusanId: 'DKV', 
    tahunAngkatan: '2023-2026',
    tahunMulai: '2023',
    tahunAkhir: '2026',
    kelas: '12',
  },
];

/* ===================== MAIN COMPONENT ===================== */
export default function DetailSiswa({
  user,
  onLogout,
  currentPage,
  onMenuClick,
  siswaId,
  onUpdateSiswa,
}: DetailSiswaProps) {
  // ==================== STATE MANAGEMENT ====================
  const [siswaData, setSiswaData] = useState<Siswa | null>(null);
  const [originalData, setOriginalData] = useState<Siswa | null>(null);
  const [isEditMode, setIsEditMode] = useState(false);
  const [formErrors, setFormErrors] = useState<{[key: string]: string}>({});
  const [tahunMulai, setTahunMulai] = useState<string>('2023');
  const [tahunAkhir, setTahunAkhir] = useState<string>('2026');

  // ==================== LOAD DATA SISWA ====================
  useEffect(() => {
    const savedSiswa = localStorage.getItem('selectedSiswa');
    if (savedSiswa) {
      try {
        const parsedSiswa = JSON.parse(savedSiswa);
        if (parsedSiswa.id === siswaId) {
          // Ensure new properties exist
          if (!parsedSiswa.tahunMulai) {
            const tahunParts = parsedSiswa.tahunAngkatan.split('-');
            parsedSiswa.tahunMulai = tahunParts[0];
            parsedSiswa.tahunAkhir = tahunParts[1];
          }
          
          setSiswaData(parsedSiswa);
          setOriginalData(parsedSiswa);
          
          // Parse tahun angkatan
          setTahunMulai(parsedSiswa.tahunMulai || parsedSiswa.tahunAngkatan.split('-')[0]);
          setTahunAkhir(parsedSiswa.tahunAkhir || parsedSiswa.tahunAngkatan.split('-')[1]);
          return;
        }
      } catch (error) {
        console.error('Error parsing saved siswa:', error);
      }
    }

    const foundSiswa = dummySiswaList.find(s => s.id === siswaId);
    if (foundSiswa) {
      setSiswaData(foundSiswa);
      setOriginalData(foundSiswa);
      localStorage.setItem('selectedSiswa', JSON.stringify(foundSiswa));
      
      // Parse tahun angkatan
      setTahunMulai(foundSiswa.tahunMulai);
      setTahunAkhir(foundSiswa.tahunAkhir);
    }
  }, [siswaId]);

  // ==================== FORM VALIDATION ====================
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
      } else if (!/^\d{10}$/.test(value)) {
        newErrors.nisn = 'NISN harus 10 digit angka';
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

    setFormErrors(newErrors);
  };

  const validateForm = (): boolean => {
    if (!siswaData) return false;
    
    const errors: {[key: string]: string} = {};
    
    if (!siswaData.namaSiswa.trim()) {
      errors.namaSiswa = 'Nama siswa harus diisi';
    } else if (siswaData.namaSiswa.trim().length < 3) {
      errors.namaSiswa = 'Nama siswa minimal 3 karakter';
    }
    
    if (!siswaData.nisn.trim()) {
      errors.nisn = 'NISN harus diisi';
    } else if (!/^\d{10}$/.test(siswaData.nisn)) {
      errors.nisn = 'NISN harus 10 digit angka';
    }
    
    if (siswaData.noTelp && siswaData.noTelp.trim()) {
      if (!/^08\d{10,11}$/.test(siswaData.noTelp)) {
        errors.noTelp = 'Nomor telepon harus 12-13 digit (08xxxxxxxxxx)';
      }
    }
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // ==================== EVENT HANDLERS ====================
  
  const handleEnableEdit = () => {
    setIsEditMode(true);
    setFormErrors({});
  };

  const handleCancelEdit = () => {
    setIsEditMode(false);
    setSiswaData(originalData);
    setFormErrors({});
    
    // Reset tahun
    if (originalData) {
      setTahunMulai(originalData.tahunMulai);
      setTahunAkhir(originalData.tahunAkhir);
    }
  };

  const handleSaveChanges = () => {
    if (!siswaData) return;

    if (!validateForm()) {
      return;
    }

    // Validasi tahun
    if (parseInt(tahunMulai) >= parseInt(tahunAkhir)) {
      alert('Tahun akhir harus lebih besar dari tahun mulai');
      return;
    }

    // Update tahun angkatan
    const updatedSiswa = {
      ...siswaData,
      tahunMulai: tahunMulai,
      tahunAkhir: tahunAkhir,
      tahunAngkatan: `${tahunMulai}-${tahunAkhir}`
    };

    localStorage.setItem('selectedSiswa', JSON.stringify(updatedSiswa));
    localStorage.setItem('siswaDataUpdated', 'true');
    
    setOriginalData(updatedSiswa);
    setSiswaData(updatedSiswa);
    
    if (onUpdateSiswa) {
      onUpdateSiswa(updatedSiswa);
    }
    
    const event = new CustomEvent('siswaUpdated', { 
      detail: { updatedSiswa: updatedSiswa } 
    });
    window.dispatchEvent(event);
    
    setIsEditMode(false);
    
    alert('✓ Data berhasil diperbarui!');
  };

  const handleBack = () => {
    if (isEditMode) {
      if (confirm('Anda sedang dalam mode edit. Yakin ingin kembali tanpa menyimpan?')) {
        setIsEditMode(false);
        setSiswaData(originalData);
        localStorage.removeItem('siswaDataUpdated');
        onMenuClick('siswa');
      }
    } else {
      onMenuClick('siswa');
    }
  };

  const handleFieldChange = (field: keyof Siswa, value: string) => {
    if (!siswaData) return;

    const updatedSiswa = { ...siswaData };

    if (field === 'jurusanId') {
      const selectedJurusan = jurusanOptions.find(j => j.value === value);
      updatedSiswa.jurusanId = value;
      updatedSiswa.jurusan = selectedJurusan?.label || value;
    } else {
      updatedSiswa[field] = value;
    }

    setSiswaData(updatedSiswa);
  };

  // ==================== LOADING STATE ====================
  if (!siswaData) {
    return (
      <AdminLayout
        pageTitle="Detail Siswa"
        currentPage={currentPage}
        onMenuClick={onMenuClick}
        user={user}
        onLogout={onLogout}
      >
        <div style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          minHeight: '400px',
          color: '#6B7280',
          fontSize: '18px',
        }}>
          Loading data siswa...
        </div>
      </AdminLayout>
    );
  }

  const tahunOptions = generateTahunOptions();

  // ==================== RENDER UI ====================
  return (
    <AdminLayout
      pageTitle="Detail Siswa"
      currentPage={currentPage}
      onMenuClick={onMenuClick}
      user={user}
      onLogout={onLogout}
      hideBackground
    >
      <div
        style={{
          backgroundImage: 'url(../src/assets/Background/bgdetailgurusiswa.png)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat',
          minHeight: '100vh',
          padding: window.innerWidth < 768 ? '16px' : '24px',
          display: 'flex',
          alignItems: 'flex-start',
          paddingTop: '40px',
        }}
      >
        <div
          style={{
            maxWidth: '1000px',
            width: '100%',
            margin: '0 auto',
          }}
        >
          <div
            style={{
              backgroundColor: 'rgba(15, 23, 42, 0.95)',
              borderRadius: '16px',
              boxShadow: '0 4px 20px rgba(0, 0, 0, 0.3)',
              overflow: 'hidden',
              border: '1px solid rgba(255, 255, 255, 0.1)',
            }}
          >
            {/* ============ HEADER WITH PROFILE & EDIT BUTTON ============ */}
            <div
              style={{
                background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)',
                padding: window.innerWidth < 768 ? '20px' : '28px 32px',
                display: 'flex',
                flexDirection: window.innerWidth < 768 ? 'column' : 'row',
                alignItems: window.innerWidth < 768 ? 'flex-start' : 'center',
                gap: '20px',
                position: 'relative',
              }}
            >
              <div style={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: '20px',
                flex: 1,
              }}>
                <div
                  style={{
                    width: window.innerWidth < 768 ? '60px' : '70px',
                    height: window.innerWidth < 768 ? '60px' : '70px',
                    borderRadius: '50%',
                    backgroundColor: '#3b82f6',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'white',
                    border: '3px solid rgba(255, 255, 255, 0.2)',
                    flexShrink: 0,
                  }}
                >
                  <UserIcon size={window.innerWidth < 768 ? 28 : 32} />
                </div>
                
                <div style={{ flex: 1 }}>
                  <h2
                    style={{
                      margin: 0,
                      fontSize: window.innerWidth < 768 ? '18px' : '22px',
                      fontWeight: 'bold',
                      color: 'white',
                      marginBottom: '4px',
                    }}
                  >
                    {siswaData.namaSiswa}
                  </h2>
                  <p
                    style={{
                      margin: 0,
                      fontSize: window.innerWidth < 768 ? '13px' : '15px',
                      color: '#cbd5e1',
                      fontFamily: 'monospace',
                      letterSpacing: '0.5px',
                    }}
                  >
                    NISN: {siswaData.nisn}
                  </p>
                </div>
              </div>

              <div style={{
                display: 'flex',
                gap: '12px',
                width: window.innerWidth < 768 ? '100%' : 'auto',
              }}>
                {!isEditMode ? (
                  <button
                    onClick={handleEnableEdit}
                    style={{
                      backgroundColor: '#2563EB',
                      border: 'none',
                      color: 'white',
                      padding: window.innerWidth < 768 ? '10px 20px' : '10px 24px',
                      borderRadius: '8px',
                      fontSize: '14px',
                      fontWeight: '600',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      transition: 'all 0.2s',
                      width: window.innerWidth < 768 ? '100%' : 'auto',
                      justifyContent: 'center',
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = '#1D4ED8';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = '#2563EB';
                    }}
                  >
                    <Edit2 size={16} />
                    Ubah Data
                  </button>
                ) : (
                  <>
                    <button
                      onClick={handleCancelEdit}
                      style={{
                        backgroundColor: '#6B7280',
                        border: 'none',
                        color: 'white',
                        padding: window.innerWidth < 768 ? '10px 16px' : '10px 20px',
                        borderRadius: '8px',
                        fontSize: '14px',
                        fontWeight: '600',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        transition: 'all 0.2s',
                        flex: window.innerWidth < 768 ? 1 : 'auto',
                        justifyContent: 'center',
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.backgroundColor = '#4B5563';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor = '#6B7280';
                      }}
                    >
                      <X size={16} />
                      Batal
                    </button>
                    <button
                      onClick={handleSaveChanges}
                      style={{
                        backgroundColor: '#10B981',
                        border: 'none',
                        color: 'white',
                        padding: window.innerWidth < 768 ? '10px 16px' : '10px 20px',
                        borderRadius: '8px',
                        fontSize: '14px',
                        fontWeight: '600',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        transition: 'all 0.2s',
                        flex: window.innerWidth < 768 ? 1 : 'auto',
                        justifyContent: 'center',
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.backgroundColor = '#059669';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor = '#10B981';
                      }}
                    >
                      <Save size={16} />
                      Simpan
                    </button>
                  </>
                )}
              </div>
            </div>

            {/* ============ CONTENT - FORM FIELDS ============ */}
            <div style={{ 
              padding: window.innerWidth < 768 ? '20px' : '32px',
            }}>
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: window.innerWidth < 768 ? '1fr' : 'repeat(auto-fit, minmax(280px, 1fr))',
                  gap: window.innerWidth < 768 ? '16px' : '24px',
                }}
              >
                {/* Nama Siswa */}
                <div>
                  <label style={{
                    fontSize: '14px',
                    fontWeight: '600',
                    color: '#FFFFFF',
                    display: 'block',
                    marginBottom: '8px',
                  }}>
                    Nama Siswa
                  </label>
                  <input
                    type="text"
                    value={siswaData.namaSiswa}
                    onChange={(e) => {
                      handleFieldChange('namaSiswa', e.target.value);
                      validateField('namaSiswa', e.target.value);
                    }}
                    disabled={!isEditMode}
                    style={{
                      width: '100%',
                      padding: '12px 16px',
                      borderRadius: '8px',
                      border: formErrors.namaSiswa ? '2px solid #EF4444' : '1px solid #E5E7EB',
                      fontSize: '14px',
                      backgroundColor: '#FFFFFF',
                      color: '#1F2937',
                      outline: 'none',
                      cursor: isEditMode ? 'text' : 'not-allowed',
                      boxSizing: 'border-box',
                    }}
                  />
                  {formErrors.namaSiswa && isEditMode && (
                    <p style={{ color: '#EF4444', fontSize: '12px', marginTop: '4px' }}>
                      {formErrors.namaSiswa}
                    </p>
                  )}
                </div>

                {/* NISN */}
                <div>
                  <label style={{
                    fontSize: '14px',
                    fontWeight: '600',
                    color: '#FFFFFF',
                    display: 'block',
                    marginBottom: '8px',
                  }}>
                    NISN
                  </label>
                  <input
                    type="text"
                    value={siswaData.nisn}
                    onChange={(e) => {
                      const value = e.target.value.replace(/\D/g, '').slice(0, 10);
                      handleFieldChange('nisn', value);
                      validateField('nisn', value);
                    }}
                    disabled={!isEditMode}
                    maxLength={10}
                    style={{
                      width: '100%',
                      padding: '12px 16px',
                      borderRadius: '8px',
                      border: formErrors.nisn ? '2px solid #EF4444' : '1px solid #E5E7EB',
                      fontSize: '14px',
                      backgroundColor: '#FFFFFF',
                      color: '#1F2937',
                      outline: 'none',
                      cursor: isEditMode ? 'text' : 'not-allowed',
                      boxSizing: 'border-box',
                    }}
                  />
                  {formErrors.nisn && isEditMode && (
                    <p style={{ color: '#EF4444', fontSize: '12px', marginTop: '4px' }}>
                      {formErrors.nisn}
                    </p>
                  )}
                </div>

                {/* Jenis Kelamin */}
                <div>
                  <label style={{
                    fontSize: '14px',
                    fontWeight: '600',
                    color: '#FFFFFF',
                    display: 'block',
                    marginBottom: '8px',
                  }}>
                    Jenis Kelamin
                  </label>
                  <select
                    value={siswaData.jenisKelamin}
                    onChange={(e) => handleFieldChange('jenisKelamin', e.target.value)}
                    disabled={!isEditMode}
                    style={{
                      width: '100%',
                      padding: '12px 16px',
                      borderRadius: '8px',
                      border: '1px solid #E5E7EB',
                      fontSize: '14px',
                      backgroundColor: '#FFFFFF',
                      color: '#1F2937',
                      outline: 'none',
                      cursor: isEditMode ? 'pointer' : 'not-allowed',
                      boxSizing: 'border-box',
                    }}
                  >
                    {jenisKelaminOptions.map(option => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Konsentrasi Keahlian */}
                <div>
                  <label style={{
                    fontSize: '14px',
                    fontWeight: '600',
                    color: '#FFFFFF',
                    display: 'block',
                    marginBottom: '8px',
                  }}>
                    Konsentrasi Keahlian
                  </label>
                  <select
                    value={siswaData.jurusanId}
                    onChange={(e) => handleFieldChange('jurusanId', e.target.value)}
                    disabled={!isEditMode}
                    style={{
                      width: '100%',
                      padding: '12px 16px',
                      borderRadius: '8px',
                      border: '1px solid #E5E7EB',
                      fontSize: '14px',
                      backgroundColor: '#FFFFFF',
                      color: '#1F2937',
                      outline: 'none',
                      cursor: isEditMode ? 'pointer' : 'not-allowed',
                      boxSizing: 'border-box',
                    }}
                  >
                    {jurusanOptions.map(option => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Tingkatan Kelas */}
                <div>
                  <label style={{
                    fontSize: '14px',
                    fontWeight: '600',
                    color: '#FFFFFF',
                    display: 'block',
                    marginBottom: '8px',
                  }}>
                    Tingkatan Kelas
                  </label>
                  <select
                    value={siswaData.kelas}
                    onChange={(e) => handleFieldChange('kelas', e.target.value)}
                    disabled={!isEditMode}
                    style={{
                      width: '100%',
                      padding: '12px 16px',
                      borderRadius: '8px',
                      border: '1px solid #E5E7EB',
                      fontSize: '14px',
                      backgroundColor: '#FFFFFF',
                      color: '#1F2937',
                      outline: 'none',
                      cursor: isEditMode ? 'pointer' : 'not-allowed',
                      boxSizing: 'border-box',
                    }}
                  >
                    {kelasOptions.map(option => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>

                {/* No. Telepon */}
                <div>
                  <label style={{
                    fontSize: '14px',
                    fontWeight: '600',
                    color: '#FFFFFF',
                    display: 'block',
                    marginBottom: '8px',
                  }}>
                    No. Telepon
                  </label>
                  <input
                    type="tel"
                    value={siswaData.noTelp}
                    onChange={(e) => {
                      const value = e.target.value.replace(/\D/g, '').slice(0, 13);
                      handleFieldChange('noTelp', value);
                      validateField('noTelp', value);
                    }}
                    disabled={!isEditMode}
                    placeholder="08xxxxxxxxxx"
                    maxLength={13}
                    style={{
                      width: '100%',
                      padding: '12px 16px',
                      borderRadius: '8px',
                      border: formErrors.noTelp ? '2px solid #EF4444' : '1px solid #E5E7EB',
                      fontSize: '14px',
                      backgroundColor: '#FFFFFF',
                      color: '#1F2937',
                      outline: 'none',
                      cursor: isEditMode ? 'text' : 'not-allowed',
                      boxSizing: 'border-box',
                    }}
                  />
                  {formErrors.noTelp && isEditMode && (
                    <p style={{ color: '#EF4444', fontSize: '12px', marginTop: '4px' }}>
                      {formErrors.noTelp}
                    </p>
                  )}
                </div>

                {/* ===== TAHUN ANGKATAN - SEPARATOR PUTIH TANPA KOTAK ===== */}
                <div>
                  <label style={{
                    fontSize: '14px',
                    fontWeight: '600',
                    color: '#FFFFFF',
                    display: 'block',
                    marginBottom: '8px',
                  }}>
                    Tahun Angkatan
                  </label>
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    width: '100%',
                  }}>
                    {/* Tahun Mulai */}
                    <div style={{ flex: 1 }}>
                      {isEditMode ? (
                        <select
                          value={tahunMulai}
                          onChange={(e) => setTahunMulai(e.target.value)}
                          style={{
                            width: '100%',
                            padding: '12px 16px',
                            borderRadius: '8px',
                            border: '1px solid #E5E7EB',
                            fontSize: '14px',
                            backgroundColor: '#FFFFFF',
                            color: '#1F2937',
                            outline: 'none',
                            cursor: 'pointer',
                            boxSizing: 'border-box',
                            textAlign: 'center',
                          }}
                        >
                          {tahunOptions.map(year => (
                            <option key={`mulai-${year}`} value={year}>
                              {year}
                            </option>
                          ))}
                        </select>
                      ) : (
                        <input
                          type="text"
                          value={tahunMulai}
                          disabled
                          style={{
                            width: '100%',
                            padding: '12px 16px',
                            borderRadius: '8px',
                            border: '1px solid #E5E7EB',
                            fontSize: '14px',
                            backgroundColor: '#FFFFFF',
                            color: '#1F2937',
                            cursor: 'not-allowed',
                            boxSizing: 'border-box',
                            textAlign: 'center',
                          }}
                        />
                      )}
                    </div>

                    {/* Separator - TANPA KOTAK, WARNA PUTIH */}
                    <span style={{
                      color: '#FFFFFF',
                      fontSize: '20px',
                      fontWeight: '600',
                      flexShrink: 0,
                    }}>
                      -
                    </span>

                    {/* Tahun Akhir */}
                    <div style={{ flex: 1 }}>
                      {isEditMode ? (
                        <select
                          value={tahunAkhir}
                          onChange={(e) => setTahunAkhir(e.target.value)}
                          style={{
                            width: '100%',
                            padding: '12px 16px',
                            borderRadius: '8px',
                            border: '1px solid #E5E7EB',
                            fontSize: '14px',
                            backgroundColor: '#FFFFFF',
                            color: '#1F2937',
                            outline: 'none',
                            cursor: 'pointer',
                            boxSizing: 'border-box',
                            textAlign: 'center',
                          }}
                        >
                          {tahunOptions.map(year => (
                            <option key={`akhir-${year}`} value={year}>
                              {year}
                            </option>
                          ))}
                        </select>
                      ) : (
                        <input
                          type="text"
                          value={tahunAkhir}
                          disabled
                          style={{
                            width: '100%',
                            padding: '12px 16px',
                            borderRadius: '8px',
                            border: '1px solid #E5E7EB',
                            fontSize: '14px',
                            backgroundColor: '#FFFFFF',
                            color: '#1F2937',
                            cursor: 'not-allowed',
                            boxSizing: 'border-box',
                            textAlign: 'center',
                          }}
                        />
                      )}
                    </div>
                  </div>
                  {isEditMode && parseInt(tahunMulai) >= parseInt(tahunAkhir) && (
                    <p style={{ color: '#EF4444', fontSize: '12px', marginTop: '4px' }}>
                      Tahun akhir harus lebih besar dari tahun mulai
                    </p>
                  )}
                </div>
              </div>

              {/* ============ FOOTER BUTTON ============ */}
              <div
                style={{
                  marginTop: '32px',
                  paddingTop: '24px',
                  borderTop: '1px solid rgba(255, 255, 255, 0.1)',
                  display: 'flex',
                  justifyContent: 'flex-start',
                }}
              >
                <button
                  onClick={handleBack}
                  style={{
                    backgroundColor: '#2563EB',
                    border: 'none',
                    color: 'white',
                    padding: '10px 24px',
                    borderRadius: '8px',
                    fontSize: '14px',
                    fontWeight: '600',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    transition: 'all 0.2s',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = '#1D4ED8';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = '#2563EB';
                  }}
                >
                  <ArrowLeft size={18} />
                  Kembali
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}