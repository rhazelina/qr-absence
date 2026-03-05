// FILE: DetailGuru.tsx - Halaman Detail Guru
import { useState, useEffect } from 'react';
import AdminLayout from '../../component/Admin/AdminLayout';
import { User as UserIcon, ArrowLeft, Edit2, Save, X } from 'lucide-react';

/* ===================== INTERFACE DEFINITIONS ===================== */
interface User {
  role: string;
  name: string;
}

interface Guru {
  id: string;
  namaGuru: string;
  kodeGuru: string;
  jenisKelamin: string;
  role: string;
  noTelp: string;
  keterangan: string;
  waliKelasDari?: string;
}

interface DetailGuruProps {
  user: User;
  onLogout: () => void;
  currentPage: string;
  onMenuClick: (page: string) => void;
  guruId: string;
  onUpdateGuru?: (updatedGuru: Guru) => void;
}

/* ===================== OPTIONS DATA ===================== */
const peranList = [
  { id: 'Wali Kelas', nama: 'Wali Kelas' },
  { id: 'Guru', nama: 'Guru' },
  { id: 'Staff', nama: 'Staff' },
];

const jenisKelaminList = [
  { id: 'Laki-Laki', nama: 'Laki-Laki' },
  { id: 'Perempuan', nama: 'Perempuan' },
];

const mataPelajaranList = [
  { id: 'Matematika', nama: 'Matematika' },
  { id: 'Bahasa Indonesia', nama: 'Bahasa Indonesia' },
  { id: 'Bahasa Inggris', nama: 'Bahasa Inggris' },
  { id: 'Fisika', nama: 'Fisika' },
  { id: 'Kimia', nama: 'Kimia' },
  { id: 'Biologi', nama: 'Biologi' },
  { id: 'Sejarah', nama: 'Sejarah' },
  { id: 'Geografi', nama: 'Geografi' },
];

const staffBagianList = [
  { id: 'Tata Usaha', nama: 'Tata Usaha' },
  { id: 'Administrasi', nama: 'Administrasi' },
  { id: 'Perpustakaan', nama: 'Perpustakaan' },
  { id: 'Laboratorium', nama: 'Laboratorium' },
  { id: 'Keuangan', nama: 'Keuangan' },
];

/* ===================== DUMMY DATA ===================== */
const dummyGuruList: Guru[] = [
  {
    id: '1',
    namaGuru: 'Alifah Diantebes Aindra S.pd',
    kodeGuru: '0918415784',
    jenisKelamin: 'Perempuan',
    role: 'Wali Kelas',
    noTelp: '082183748591',
    keterangan: '12 Rekayasa Perangkat Lunak 2',
    waliKelasDari: '12 Rekayasa Perangkat Lunak 2',
  },
  {
    id: '2',
    namaGuru: 'Budi Santoso S.pd',
    kodeGuru: '1348576392',
    jenisKelamin: 'Laki-Laki',
    role: 'Guru',
    noTelp: '081234567890',
    keterangan: 'Bahasa Inggris',
  },
  {
    id: '3',
    namaGuru: 'Joko Widodo S.pd',
    kodeGuru: '0918415785',
    jenisKelamin: 'Laki-Laki',
    role: 'Wali Kelas',
    noTelp: '082345678901',
    keterangan: '11 Teknik Komputer dan Jaringan 1',
    waliKelasDari: '11 Teknik Komputer dan Jaringan 1',
  },
  {
    id: '4',
    namaGuru: 'Siti Nurhaliza S.pd',
    kodeGuru: '1348576393',
    jenisKelamin: 'Perempuan',
    role: 'Staff',
    noTelp: '083456789012',
    keterangan: 'Tata Usaha',
  },
];

/* ===================== KELAS OPTIONS ===================== */
const semuaKelasOptions = [
  '10 Rekayasa Perangkat Lunak 1',
  '10 Rekayasa Perangkat Lunak 2',
  '10 Teknik Komputer dan Jaringan 1',
  '11 Rekayasa Perangkat Lunak 1',
  '11 Teknik Komputer dan Jaringan 1',
  '12 Rekayasa Perangkat Lunak 1',
  '12 Rekayasa Perangkat Lunak 2',
  '12 Teknik Komputer dan Jaringan 1',
];

/* ===================== MAIN COMPONENT ===================== */
export default function DetailGuru({
  user,
  onLogout,
  currentPage,
  onMenuClick,
  guruId,
  onUpdateGuru,
}: DetailGuruProps) {
  // ==================== STATE MANAGEMENT ====================
  const [guruData, setGuruData] = useState<Guru | null>(null);
  const [originalData, setOriginalData] = useState<Guru | null>(null);
  const [isEditMode, setIsEditMode] = useState(false);
  const [formErrors, setFormErrors] = useState<{[key: string]: string}>({});
  const [allGuruList, setAllGuruList] = useState<Guru[]>(dummyGuruList);
  const [showDuplicateWarning, setShowDuplicateWarning] = useState(false);
  const [duplicateWarningMessage, setDuplicateWarningMessage] = useState('');

  const [tempMataPelajaran, setTempMataPelajaran] = useState('');
  const [tempStaffBagian, setTempStaffBagian] = useState('');

  // ==================== LOAD DATA GURU ====================
  useEffect(() => {
    const savedAllGuru = localStorage.getItem('allGuruData');
    if (savedAllGuru) {
      try {
        const parsedGuruList = JSON.parse(savedAllGuru);
        setAllGuruList(parsedGuruList);
      } catch (error) {
        console.error('Error parsing all guru data:', error);
      }
    }

    const savedGuru = localStorage.getItem('selectedGuru');
    if (savedGuru) {
      try {
        const parsedGuru = JSON.parse(savedGuru);
        if (parsedGuru.id === guruId) {
          setGuruData(parsedGuru);
          setOriginalData(parsedGuru);
          
          if (parsedGuru.role === 'Guru') {
            setTempMataPelajaran(parsedGuru.keterangan);
          } else if (parsedGuru.role === 'Staff') {
            setTempStaffBagian(parsedGuru.keterangan);
          }
          return;
        }
      } catch (error) {
        console.error('Error parsing saved guru:', error);
      }
    }

    const foundGuru = dummyGuruList.find(g => g.id === guruId);
    if (foundGuru) {
      setGuruData(foundGuru);
      setOriginalData(foundGuru);
      localStorage.setItem('selectedGuru', JSON.stringify(foundGuru));
      
      if (foundGuru.role === 'Guru') {
        setTempMataPelajaran(foundGuru.keterangan);
      } else if (foundGuru.role === 'Staff') {
        setTempStaffBagian(foundGuru.keterangan);
      }
    }
  }, [guruId]);

  // ==================== HELPER FUNCTIONS ====================
  const getAvailableKelasOptions = () => {
    const occupiedKelas = allGuruList
      .filter(guru => 
        guru.role === 'Wali Kelas' && 
        guru.waliKelasDari && 
        guru.id !== guruData?.id
      )
      .map(guru => guru.waliKelasDari as string);
    
    return semuaKelasOptions.filter(kelas => !occupiedKelas.includes(kelas));
  };

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
      } else if (allGuruList.some(g => g.kodeGuru === value && g.id !== guruData?.id)) {
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
      if (guruData?.role === 'Wali Kelas' && value) {
        const isKelasOccupied = allGuruList.some(
          guru => 
            guru.role === 'Wali Kelas' && 
            guru.waliKelasDari === value &&
            guru.id !== guruData?.id
        );
        
        if (isKelasOccupied) {
          const waliKelasExist = allGuruList.find(
            guru => 
              guru.role === 'Wali Kelas' && 
              guru.waliKelasDari === value &&
              guru.id !== guruData?.id
          );
          newErrors.waliKelasDari = `Kelas "${value}" sudah memiliki wali kelas (${waliKelasExist?.namaGuru})`;
        } else {
          delete newErrors.waliKelasDari;
        }
      }
    }

    setFormErrors(newErrors);
  };

  const validateForm = (): boolean => {
    if (!guruData) return false;
    
    const errors: {[key: string]: string} = {};
    
    if (!guruData.namaGuru.trim()) {
      errors.namaGuru = 'Nama guru harus diisi';
    } else if (guruData.namaGuru.trim().length < 3) {
      errors.namaGuru = 'Nama guru minimal 3 karakter';
    }
    
    if (!guruData.kodeGuru.trim()) {
      errors.kodeGuru = 'Kode guru harus diisi';
    } else if (allGuruList.some(g => g.kodeGuru === guruData.kodeGuru && g.id !== guruData.id)) {
      errors.kodeGuru = 'Kode guru sudah terdaftar';
    }
    
    if (guruData.noTelp && guruData.noTelp.trim()) {
      if (!/^08\d{10,11}$/.test(guruData.noTelp)) {
        errors.noTelp = 'Nomor telepon harus 12-13 digit (08xxxxxxxxxx)';
      }
    }
    
    if (guruData.role === 'Guru' && !tempMataPelajaran) {
      errors.mataPelajaran = 'Mata pelajaran harus dipilih';
    }
    
    if (guruData.role === 'Wali Kelas') {
      if (!guruData.waliKelasDari) {
        errors.waliKelasDari = 'Wali kelas dari harus dipilih';
      } else {
        const isKelasOccupied = allGuruList.some(
          guru => 
            guru.role === 'Wali Kelas' && 
            guru.waliKelasDari === guruData.waliKelasDari &&
            guru.id !== guruData.id
        );
        
        if (isKelasOccupied) {
          const waliKelasExist = allGuruList.find(
            guru => 
              guru.role === 'Wali Kelas' && 
              guru.waliKelasDari === guruData.waliKelasDari &&
              guru.id !== guruData.id
          );
          errors.waliKelasDari = `Kelas "${guruData.waliKelasDari}" sudah memiliki wali kelas (${waliKelasExist?.namaGuru})`;
        }
      }
    }
    
    if (guruData.role === 'Staff' && !tempStaffBagian) {
      errors.staffBagian = 'Bagian staff harus dipilih';
    }
    
    setFormErrors(errors);
    setShowDuplicateWarning(false);
    return Object.keys(errors).length === 0;
  };

  // ==================== EVENT HANDLERS ====================
  
  const handleEnableEdit = () => {
    setIsEditMode(true);
    setFormErrors({});
    setShowDuplicateWarning(false);
  };

  const handleCancelEdit = () => {
    setIsEditMode(false);
    setGuruData(originalData);
    setFormErrors({});
    setShowDuplicateWarning(false);
    
    if (originalData) {
      if (originalData.role === 'Guru') {
        setTempMataPelajaran(originalData.keterangan);
      } else if (originalData.role === 'Staff') {
        setTempStaffBagian(originalData.keterangan);
      }
    }
  };

  const handleSaveChanges = () => {
    if (!guruData) return;

    if (!validateForm()) {
      return;
    }

    if (guruData.role === 'Wali Kelas' && guruData.waliKelasDari) {
      const isKelasOccupied = allGuruList.some(
        guru => 
          guru.role === 'Wali Kelas' && 
          guru.waliKelasDari === guruData.waliKelasDari &&
          guru.id !== guruData.id
      );
      
      if (isKelasOccupied) {
        const waliKelasExist = allGuruList.find(
          guru => 
            guru.role === 'Wali Kelas' && 
            guru.waliKelasDari === guruData.waliKelasDari &&
            guru.id !== guruData.id
        );
        setDuplicateWarningMessage(`Kelas "${guruData.waliKelasDari}" sudah memiliki wali kelas (${waliKelasExist?.namaGuru}).`);
        setShowDuplicateWarning(true);
        return;
      }
    }

    let updatedGuru = { ...guruData };
    if (guruData.role === 'Guru') {
      updatedGuru.keterangan = tempMataPelajaran;
      updatedGuru.waliKelasDari = undefined;
    } else if (guruData.role === 'Wali Kelas') {
      updatedGuru.keterangan = guruData.waliKelasDari || '';
    } else if (guruData.role === 'Staff') {
      updatedGuru.keterangan = tempStaffBagian;
      updatedGuru.waliKelasDari = undefined;
    }

    const updatedAllGuruList = allGuruList.map(guru => 
      guru.id === updatedGuru.id ? updatedGuru : guru
    );

    localStorage.setItem('selectedGuru', JSON.stringify(updatedGuru));
    localStorage.setItem('allGuruData', JSON.stringify(updatedAllGuruList));
    localStorage.setItem('guruDataUpdated', 'true');
    
    setGuruData(updatedGuru);
    setOriginalData(updatedGuru);
    setAllGuruList(updatedAllGuruList);
    
    if (onUpdateGuru) {
      onUpdateGuru(updatedGuru);
    }
    
    const event = new CustomEvent('guruUpdated', { 
      detail: { updatedGuru: updatedGuru } 
    });
    window.dispatchEvent(event);
    
    setIsEditMode(false);
    setShowDuplicateWarning(false);
    
    alert('✓ Data berhasil diperbarui!');
  };

  const handleBack = () => {
    if (isEditMode) {
      if (confirm('Anda sedang dalam mode edit. Yakin ingin kembali tanpa menyimpan?')) {
        setIsEditMode(false);
        setGuruData(originalData);
        setShowDuplicateWarning(false);
        localStorage.removeItem('guruDataUpdated');
        onMenuClick('guru');
      }
    } else {
      onMenuClick('guru');
    }
  };

  const handleFieldChange = (field: keyof Guru, value: string) => {
    if (!guruData) return;

    const updatedGuru = { ...guruData, [field]: value };
    
    if (field === 'role') {
      setTempMataPelajaran('');
      setTempStaffBagian('');
      updatedGuru.waliKelasDari = '';
      setShowDuplicateWarning(false);
    }

    setGuruData(updatedGuru);
  };

  // ==================== LOADING STATE ====================
  if (!guruData) {
    return (
      <AdminLayout
        pageTitle="Detail Guru"
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
          Loading data guru...
        </div>
      </AdminLayout>
    );
  }

  // ==================== RENDER UI ====================
  return (
    <AdminLayout
      pageTitle="Detail Guru"
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
                    {guruData.namaGuru}
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
                    Kode: {guruData.kodeGuru}
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
              {/* Warning tentang duplikasi wali kelas */}
              {showDuplicateWarning && (
                <div style={{
                  backgroundColor: '#FEF3C7',
                  border: '1px solid #F59E0B',
                  borderRadius: '8px',
                  padding: '12px 16px',
                  marginBottom: '20px',
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: '12px',
                }}>
                  <div style={{
                    backgroundColor: '#F59E0B',
                    borderRadius: '50%',
                    width: '22px',
                    height: '22px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                    marginTop: '1px',
                  }}>
                    <span style={{ color: '#FFFFFF', fontSize: '13px', fontWeight: 'bold' }}>!</span>
                  </div>
                  <div style={{ flex: 1 }}>
                    <p style={{
                      margin: 0,
                      fontSize: '13px',
                      color: '#92400E',
                      fontWeight: '600',
                      lineHeight: '1.4',
                    }}>
                      {duplicateWarningMessage}
                    </p>
                    <p style={{
                      margin: '6px 0 0 0',
                      fontSize: '12px',
                      color: '#92400E',
                      lineHeight: '1.4',
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
                      padding: '4px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0,
                    }}
                  >
                    <X size={16} color="#92400E" />
                  </button>
                </div>
              )}

              {/* Grid untuk form fields */}
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: window.innerWidth < 768 ? '1fr' : 'repeat(auto-fit, minmax(280px, 1fr))',
                  gap: window.innerWidth < 768 ? '16px' : '24px',
                }}
              >
                {/* Nama Guru Field */}
                <div>
                  <label style={{
                    fontSize: '14px',
                    fontWeight: '600',
                    color: '#FFFFFF',
                    display: 'block',
                    marginBottom: '8px',
                  }}>
                    Nama Guru
                  </label>
                  <input
                    type="text"
                    value={guruData.namaGuru}
                    onChange={(e) => {
                      handleFieldChange('namaGuru', e.target.value);
                      validateField('namaGuru', e.target.value);
                    }}
                    disabled={!isEditMode}
                    style={{
                      width: '100%',
                      padding: '12px 16px',
                      borderRadius: '8px',
                      border: formErrors.namaGuru ? '2px solid #EF4444' : '1px solid #E5E7EB',
                      fontSize: '14px',
                      backgroundColor: '#FFFFFF',
                      color: '#1F2937',
                      outline: 'none',
                      cursor: isEditMode ? 'text' : 'not-allowed',
                      boxSizing: 'border-box',
                    }}
                  />
                  {formErrors.namaGuru && isEditMode && (
                    <p style={{ color: '#EF4444', fontSize: '12px', marginTop: '4px' }}>
                      {formErrors.namaGuru}
                    </p>
                  )}
                </div>

                {/* Kode Guru Field */}
                <div>
                  <label style={{
                    fontSize: '14px',
                    fontWeight: '600',
                    color: '#FFFFFF',
                    display: 'block',
                    marginBottom: '8px',
                  }}>
                    Kode Guru
                  </label>
                  <input
                    type="text"
                    value={guruData.kodeGuru}
                    onChange={(e) => {
                      handleFieldChange('kodeGuru', e.target.value);
                      validateField('kodeGuru', e.target.value);
                    }}
                    disabled={!isEditMode}
                    style={{
                      width: '100%',
                      padding: '12px 16px',
                      borderRadius: '8px',
                      border: formErrors.kodeGuru ? '2px solid #EF4444' : '1px solid #E5E7EB',
                      fontSize: '14px',
                      backgroundColor: '#FFFFFF',
                      color: '#1F2937',
                      outline: 'none',
                      cursor: isEditMode ? 'text' : 'not-allowed',
                      boxSizing: 'border-box',
                    }}
                  />
                  {formErrors.kodeGuru && isEditMode && (
                    <p style={{ color: '#EF4444', fontSize: '12px', marginTop: '4px' }}>
                      {formErrors.kodeGuru}
                    </p>
                  )}
                </div>

                {/* Jenis Kelamin Field */}
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
                    value={guruData.jenisKelamin}
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
                    {jenisKelaminList.map(option => (
                      <option key={option.id} value={option.id}>
                        {option.nama}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Peran Field */}
                <div>
                  <label style={{
                    fontSize: '14px',
                    fontWeight: '600',
                    color: '#FFFFFF',
                    display: 'block',
                    marginBottom: '8px',
                  }}>
                    Peran
                  </label>
                  <select
                    value={guruData.role}
                    onChange={(e) => handleFieldChange('role', e.target.value)}
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
                    {peranList.map(option => (
                      <option key={option.id} value={option.id}>
                        {option.nama}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Mata Pelajaran Field (hanya untuk role Guru) */}
                {guruData.role === 'Guru' && isEditMode && (
                  <div>
                    <label style={{
                      fontSize: '14px',
                      fontWeight: '600',
                      color: '#FFFFFF',
                      display: 'block',
                      marginBottom: '8px',
                    }}>
                      Mata Pelajaran
                    </label>
                    <select
                      value={tempMataPelajaran}
                      onChange={(e) => setTempMataPelajaran(e.target.value)}
                      style={{
                        width: '100%',
                        padding: '12px 16px',
                        borderRadius: '8px',
                        border: formErrors.mataPelajaran ? '2px solid #EF4444' : '1px solid #E5E7EB',
                        fontSize: '14px',
                        backgroundColor: '#FFFFFF',
                        color: '#1F2937',
                        outline: 'none',
                        cursor: 'pointer',
                        boxSizing: 'border-box',
                      }}
                    >
                      <option value="">Pilih Mata Pelajaran</option>
                      {mataPelajaranList.map(option => (
                        <option key={option.id} value={option.id}>
                          {option.nama}
                        </option>
                      ))}
                    </select>
                    {formErrors.mataPelajaran && (
                      <p style={{ color: '#EF4444', fontSize: '12px', marginTop: '4px' }}>
                        {formErrors.mataPelajaran}
                      </p>
                    )}
                  </div>
                )}

                {/* View Mode - Mata Pelajaran */}
                {guruData.role === 'Guru' && !isEditMode && (
                  <div>
                    <label style={{
                      fontSize: '14px',
                      fontWeight: '600',
                      color: '#FFFFFF',
                      display: 'block',
                      marginBottom: '8px',
                    }}>
                      Mata Pelajaran
                    </label>
                    <input
                      type="text"
                      value={guruData.keterangan}
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
                        outline: 'none',
                      }}
                    />
                  </div>
                )}

                {/* Wali Kelas Dari Field (hanya untuk role Wali Kelas) */}
                {guruData.role === 'Wali Kelas' && isEditMode && (
                  <div>
                    <label style={{
                      fontSize: '14px',
                      fontWeight: '600',
                      color: '#FFFFFF',
                      display: 'block',
                      marginBottom: '8px',
                    }}>
                      Wali Kelas Dari
                    </label>
                    <select
                      value={guruData.waliKelasDari || ''}
                      onChange={(e) => {
                        handleFieldChange('waliKelasDari', e.target.value);
                        validateField('waliKelasDari', e.target.value);
                      }}
                      style={{
                        width: '100%',
                        padding: '12px 16px',
                        borderRadius: '8px',
                        border: formErrors.waliKelasDari ? '2px solid #EF4444' : '1px solid #E5E7EB',
                        fontSize: '14px',
                        backgroundColor: '#FFFFFF',
                        color: '#1F2937',
                        outline: 'none',
                        cursor: 'pointer',
                        boxSizing: 'border-box',
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
                      <p style={{ color: '#EF4444', fontSize: '12px', marginTop: '4px' }}>
                        {formErrors.waliKelasDari}
                      </p>
                    )}
                    <div style={{
                      marginTop: '6px',
                      padding: '8px 10px',
                      backgroundColor: '#F3F4F6',
                      borderRadius: '6px',
                      fontSize: '11px',
                      color: '#6B7280',
                      border: '1px solid #E5E7EB',
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <span style={{ fontWeight: '600' }}>Catatan:</span>
                        <span>Hanya kelas yang belum memiliki wali kelas yang ditampilkan</span>
                      </div>
                    </div>
                  </div>
                )}

                {/* View Mode - Wali Kelas */}
                {guruData.role === 'Wali Kelas' && !isEditMode && (
                  <div>
                    <label style={{
                      fontSize: '14px',
                      fontWeight: '600',
                      color: '#FFFFFF',
                      display: 'block',
                      marginBottom: '8px',
                    }}>
                      Wali Kelas Dari
                    </label>
                    <input
                      type="text"
                      value={guruData.keterangan}
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
                        outline: 'none',
                      }}
                    />
                  </div>
                )}

                {/* Bagian Staff Field (hanya untuk role Staff) */}
                {guruData.role === 'Staff' && isEditMode && (
                  <div>
                    <label style={{
                      fontSize: '14px',
                      fontWeight: '600',
                      color: '#FFFFFF',
                      display: 'block',
                      marginBottom: '8px',
                    }}>
                      Bagian Staff
                    </label>
                    <select
                      value={tempStaffBagian}
                      onChange={(e) => setTempStaffBagian(e.target.value)}
                      style={{
                        width: '100%',
                        padding: '12px 16px',
                        borderRadius: '8px',
                        border: formErrors.staffBagian ? '2px solid #EF4444' : '1px solid #E5E7EB',
                        fontSize: '14px',
                        backgroundColor: '#FFFFFF',
                        color: '#1F2937',
                        outline: 'none',
                        cursor: 'pointer',
                        boxSizing: 'border-box',
                      }}
                    >
                      <option value="">Pilih Bagian</option>
                      {staffBagianList.map(option => (
                        <option key={option.id} value={option.id}>
                          {option.nama}
                        </option>
                      ))}
                    </select>
                    {formErrors.staffBagian && (
                      <p style={{ color: '#EF4444', fontSize: '12px', marginTop: '4px' }}>
                        {formErrors.staffBagian}
                      </p>
                    )}
                  </div>
                )}

                {/* View Mode - Staff Bagian */}
                {guruData.role === 'Staff' && !isEditMode && (
                  <div>
                    <label style={{
                      fontSize: '14px',
                      fontWeight: '600',
                      color: '#FFFFFF',
                      display: 'block',
                      marginBottom: '8px',
                    }}>
                      Bagian Staff
                    </label>
                    <input
                      type="text"
                      value={guruData.keterangan}
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
                        outline: 'none',
                      }}
                    />
                  </div>
                )}

                {/* No. Telepon Field */}
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
                    value={guruData.noTelp}
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