import { useState, useEffect } from 'react';
import AdminLayout from '../../component/Admin/AdminLayout';
import { User as UserIcon, ArrowLeft, Edit2, Save, X } from 'lucide-react';
import { studentService, type Student } from '../../services/studentService';
import { masterService, type ClassRoom } from '../../services/masterService';

// Mapping nama jurusan lengkap
const MAJOR_NAMES: Record<string, string> = {
  'RPL': 'Rekayasa Perangkat Lunak',
  'DKV': 'Desain Komunikasi Visual',
  'TKJ': 'Teknik Komputer dan Jaringan'
};

const MAJOR_CODE_BY_NAME: Record<string, string> = {
  'Rekayasa Perangkat Lunak': 'RPL',
  'Desain Komunikasi Visual': 'DKV',
  'Teknik Komputer & Jaringan': 'TKJ',
  'Teknik Komputer dan Jaringan': 'TKJ'
};

const ALLOWED_CLASS_LABELS = new Set([
  'RPL 1', 'RPL 2', 'RPL 3',
  'DKV 1', 'DKV 2', 'DKV 3',
  'TAV 1', 'TAV 2',
  'TKJ 1', 'TKJ 2', 'TKJ 3',
  'TMT 1', 'TMT 2', 'TMT 3',
  'TEI 1', 'TEI 2',
  'AN 1', 'AN 2',
  'BC 1', 'BC 2',
]);

const getMajorCode = (raw?: string) => {
  const value = String(raw || '').trim();
  if (!value) return '';
  if (MAJOR_NAMES[value]) return value;
  if (MAJOR_CODE_BY_NAME[value]) return MAJOR_CODE_BY_NAME[value];
  return value;
};

const CLASS_LABELS = [
  'RPL 1', 'RPL 2', 'RPL 3',
  'DKV 1', 'DKV 2', 'DKV 3',
  'TAV 1', 'TAV 2',
  'TKJ 1', 'TKJ 2', 'TKJ 3',
  'TMT 1', 'TMT 2', 'TMT 3',
  'TEI 1', 'TEI 2',
  'AN 1', 'AN 2',
  'BC 1', 'BC 2',
];

// Strict validasi relasi grade dan jurusan
const STRICT_KELAS_MAP: Record<string, string[]> = {
  "12_RPL": ["RPL 1", "RPL 2"],
  "12_TKJ": ["TKJ 1", "TKJ 2"],
  "11_RPL": ["RPL 3"],
  "11_TKJ": ["TKJ 3"],
};

/* ===================== INTERFACE DEFINITIONS ===================== */
// Use Student interface from service, but locally we might extend it for UI state if needed
// or just use it directly.

interface DetailSiswaProps {
  user: any;
  onLogout: () => void;
  currentPage: string;
  onMenuClick: (page: string) => void;
  siswaId: string;
  onUpdateSiswa?: (updatedSiswa: any) => void;
}

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
  const [siswaData, setSiswaData] = useState<Student | null>(null);
  const [originalData, setOriginalData] = useState<Student | null>(null);
  const [isEditMode, setIsEditMode] = useState(false);
  const [formErrors, setFormErrors] = useState<{ [key: string]: string }>({});
  const [loading, setLoading] = useState(true);
  const [errorLocal, setErrorLocal] = useState<string | null>(null);

  const [classes, setClasses] = useState<ClassRoom[]>([]);
  const [majors, setMajors] = useState<any[]>([]);
  const [selectedMajorId, setSelectedMajorId] = useState<string>('');
  const [selectedGrade, setSelectedGrade] = useState<string>('');
  const [selectedClassLabel, setSelectedClassLabel] = useState<string>('');

  const resolveClassIdByLabel = (label: string, majorId?: string, grade?: string) => {
    const trimmed = String(label || '').trim();
    if (!trimmed) return '';
    const found = classes.find((c) => {
      const classLabel = c.label || c.name;
      if (!classLabel) return false;
      const matchesLabel =
        classLabel === trimmed ||
        c.name === trimmed ||
        (c.name && c.name.endsWith(trimmed));
      if (!matchesLabel) return false;
      if (majorId && c.major_id?.toString() !== majorId) return false;
      if (grade && c.grade?.toString() !== grade) return false;
      return true;
    });
    return found ? found.id.toString() : '';
  };

  const filterClassLabels = (majorCode?: string, grade?: string) => {
    if (!majorCode && !grade) return CLASS_LABELS;
    let labels = CLASS_LABELS;
    if (majorCode) {
      labels = labels.filter((l) => l.startsWith(`${majorCode} `));
    }
    if (grade && majorCode) {
      const strictKey = `${grade}_${majorCode}`;
      const allowedKelas = STRICT_KELAS_MAP[strictKey];
      if (allowedKelas) {
        labels = labels.filter((l) => allowedKelas.includes(l));
      }
    }
    return labels;
  };

  // Custom fields not directly in Student interface or needing transformation
  const currentYear = new Date().getFullYear();
  const [tahunMulai, setTahunMulai] = useState<string>(currentYear.toString());
  const [tahunAkhir, setTahunAkhir] = useState<string>((currentYear + 3).toString());


  // ==================== LOAD DATA ====================
  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        // Fetch Master Data first
        const [classesRes, majorsRes] = await Promise.all([
          masterService.getClasses(),
          masterService.getMajors(),
        ]);

        const classesRaw = Array.isArray(classesRes) ? classesRes : (classesRes.data || classesRes.data?.data || []);
        const majorsRaw = Array.isArray(majorsRes) ? majorsRes : (majorsRes.data || majorsRes.data?.data || []);
        setClasses(classesRaw);
        setMajors(majorsRaw);

        // Fetch Student Data
        if (siswaId) {
          const response = await studentService.getStudentById(siswaId);
          const rawStudent = response?.data ?? response;

          if (!rawStudent || !rawStudent.id) {
            throw new Error('Data siswa tidak valid dari server');
          }

          const normalizedStudent: Student = {
            id: String(rawStudent.id),
            name: rawStudent.name || '',
            nisn: rawStudent.nisn || '',
            nis: rawStudent.nis || '',
            email: rawStudent.email || '',
            major: rawStudent.major || '',
            major_name: rawStudent.major_name || '',
            class_id: rawStudent.class_id ? String(rawStudent.class_id) : '',
            class_name: rawStudent.class_name || '',
            class_grade: rawStudent.class_grade || rawStudent.grade || '',
            class_label: rawStudent.class_label || '',
            // grade field kept for compatibility but not used
            grade: rawStudent.grade || '',
            gender: rawStudent.gender || 'L',
            phone: rawStudent.phone || rawStudent.parent_phone || '',
            address: rawStudent.address || '',
            photo_url: rawStudent.photo_url || '',
          };

          setSiswaData(normalizedStudent);
          setOriginalData(normalizedStudent);
          setErrorLocal(null);

          const classFromList = classesRaw.find((c: any) => c.id?.toString() === normalizedStudent.class_id);
          const majorId =
            classFromList?.major_id?.toString()
            || majorsRaw.find((m: any) => m.code === normalizedStudent.major)?.id?.toString()
            || majorsRaw.find((m: any) => m.name === normalizedStudent.major_name)?.id?.toString()
            || '';
          const gradeValue = classFromList?.grade?.toString() || normalizedStudent.class_grade || '';
          setSelectedMajorId(majorId);
          setSelectedGrade(gradeValue);
          setSelectedClassLabel(classFromList?.label || classFromList?.name || normalizedStudent.class_label || '');

          // Parse tahun angkatan if available, otherwise default
          // Assuming backend doesn't send distinct tahunMulai/Akhir, or we parse from 'grade' or add custom fields
          // For now, let's keep defaults or try to parse if a field exists, valid logic:
          // If student has a 'grade' like 'X', 'XI', 'XII', we can guess? 
          // Or just leave as manual input for now until backend supports 'batch_year'

        }
      } catch (err: any) {
        console.error('Error loading data:', err);
        setErrorLocal('Gagal memuat data siswa.');
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [siswaId]);

  useEffect(() => {
    if (!siswaData) return;
    if (!selectedMajorId && siswaData.class_id) {
      const cls = classes.find(c => c.id.toString() === siswaData.class_id);
      if (cls?.major_id) setSelectedMajorId(cls.major_id.toString());
    }
    if (!selectedGrade) {
      const grade = siswaData.class_grade || '';
      if (grade) setSelectedGrade(String(grade));
    }
    if (!selectedClassLabel && siswaData.class_id) {
      const cls = classes.find(c => c.id.toString() === siswaData.class_id);
      if (cls) setSelectedClassLabel(cls.label || cls.name || '');
    }
  }, [siswaData, classes, selectedMajorId, selectedGrade]);

  // ==================== FORM VALIDATION ====================
  const validateField = (field: string, value: string) => {
    const newErrors = { ...formErrors };

    if (field === 'name') {
      if (!value.trim()) {
        newErrors.name = 'Nama siswa harus diisi';
      } else if (value.trim().length < 3) {
        newErrors.name = 'Nama siswa minimal 3 karakter';
      } else {
        delete newErrors.name;
      }
    }

    if (field === 'nisn') {
      if (!value.trim()) {
        newErrors.nisn = 'NISN harus diisi';
      } else if (!/^\d+$/.test(value)) { // Relaxed validation to match other parts
        newErrors.nisn = 'NISN harus berupa angka';
      } else {
        delete newErrors.nisn;
      }
    }

    if (field === 'phone') {
      if (value && value.trim()) {
        if (!/^08\d{8,11}$/.test(value)) {
          newErrors.phone = 'Nomor telepon tidak valid';
        } else {
          delete newErrors.phone;
        }
      } else {
        delete newErrors.phone;
      }
    }

    setFormErrors(newErrors);
  };

  const validateForm = (): boolean => {
    if (!siswaData) return false;

    const errors: { [key: string]: string } = {};

    if (!siswaData.name.trim()) errors.name = 'Nama siswa harus diisi';
    if (!siswaData.nisn.trim()) errors.nisn = 'NISN harus diisi';
    if (!siswaData.class_id) errors.class_id = 'Kelas harus dipilih';

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
  };

  const handleSaveChanges = async () => {
    if (!siswaData) return;

    if (!validateForm()) return;

    // Validasi tahun
    if (parseInt(tahunMulai) >= parseInt(tahunAkhir)) {
      alert('Tahun akhir harus lebih besar dari tahun mulai');
      return;
    }

    try {
      const payload = {
        name: siswaData.name,
        nisn: siswaData.nisn,
        gender: siswaData.gender,
        class_id: siswaData.class_id,
        address: siswaData.address,
        parent_phone: siswaData.phone,
        // Add other fields as needed
      };

      await studentService.updateStudent(siswaData.id, payload);

      setOriginalData(siswaData);

      if (onUpdateSiswa) {
        onUpdateSiswa(siswaData);
      }

      const updatedClass = classes.find(c => c.id.toString() === siswaData.class_id);
      const updatedMajor = updatedClass?.major_id
        ? majors.find(m => m.id.toString() === updatedClass.major_id?.toString())
        : majors.find(m => m.code === siswaData.major || m.name === siswaData.major_name);

      const updateDetail = {
        id: siswaData.id?.toString(),
        namaSiswa: siswaData.name,
        nisn: siswaData.nisn,
        kelasId: siswaData.class_id,
        kelasLabel: updatedClass?.label || updatedClass?.name || selectedClassLabel || siswaData.class_label,
        kelasGrade: updatedClass?.grade?.toString() || siswaData.class_grade || '',
        jurusan: updatedMajor?.code || updatedMajor?.name || siswaData.major || siswaData.major_name,
      };
      window.dispatchEvent(new CustomEvent('siswaUpdated', { detail: updateDetail }));

      setIsEditMode(false);
      alert('✓ Data berhasil diperbarui!');
    } catch (err: any) {
      console.error('Failed to update student:', err);
      alert('Gagal memperbarui data: ' + (err.response?.data?.message || err.message));
    }
  };

  const handleBack = () => {
    if (isEditMode) {
      if (confirm('Anda sedang dalam mode edit. Yakin ingin kembali tanpa menyimpan?')) {
        setIsEditMode(false);
        setSiswaData(originalData);
        onMenuClick('siswa');
      }
    } else {
      onMenuClick('siswa');
    }
  };

  const handleFieldChange = (field: keyof Student, value: string) => {
    if (!siswaData) return;

    const updatedSiswa = { ...siswaData };

    // Handle special cases if any
    if (field === 'class_id') {
      const selectedClass = classes.find(c => c.id.toString() === value);
      if (selectedClass) {
        updatedSiswa.class_name = selectedClass.name;
        updatedSiswa.class_grade = selectedClass.grade;
        updatedSiswa.class_label = selectedClass.label;
        updatedSiswa.grade = selectedClass.grade; // legacy
        if (selectedClass.major_id) {
          const maj = majors.find((m) => m.id.toString() === selectedClass.major_id.toString());
          updatedSiswa.major = maj?.code || updatedSiswa.major;
          updatedSiswa.major_name = maj?.name || updatedSiswa.major_name;
          setSelectedMajorId(selectedClass.major_id.toString());
        }
        setSelectedGrade(String(selectedClass.grade || ''));
      }
    }

    if (field === 'major') {
      // If we change major manually, filter classes?
    }

    (updatedSiswa as any)[field] = value;
    setSiswaData(updatedSiswa);
  };


  // Generate tahun options
  const generateTahunOptions = () => {
    const currentYear = new Date().getFullYear();
    const years = [];
    for (let i = currentYear; i >= currentYear - 20; i--) {
      years.push(i.toString());
    }
    return years;
  };
  const tahunOptions = generateTahunOptions();



  // Actually, allow user to select Major first, then Class?
  // Or just select Class. Class determines Major.
  // In UI, we have "Konsentrasi Keahlian" (Major) dropdown.
  // We should bind it to state.
  // Let's add 'major_id' or 'major_code' to state handling if we want to filter classes.

  // Implementation choice:
  // Prioritize Class selection. Major is derived or can be filtered.
  // Let's allow selecting Major to filter Class options.

  // ==================== RENDER UI ====================
  if (loading || !siswaData) {
    return (
      <AdminLayout
        pageTitle="Detail Siswa"
        currentPage={currentPage}
        onMenuClick={onMenuClick}
        user={user}
        onLogout={onLogout}
        hideBackground={false}
      >
        <div style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          minHeight: '400px',
          color: '#1F2937',
          fontSize: '18px',
        }}>
          {loading ? 'Loading data siswa...' : (errorLocal || 'Data tidak ditemukan')}
        </div>
      </AdminLayout>
    );
  }

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
                    {siswaData.name}
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
                    value={siswaData.name}
                    onChange={(e) => {
                      handleFieldChange('name', e.target.value);
                      validateField('name', e.target.value);
                    }}
                    disabled={!isEditMode}
                    style={{
                      width: '100%',
                      padding: '12px 16px',
                      borderRadius: '8px',
                      border: formErrors.name ? '2px solid #EF4444' : '1px solid #E5E7EB',
                      fontSize: '14px',
                      backgroundColor: '#FFFFFF',
                      color: '#1F2937',
                      outline: 'none',
                      cursor: isEditMode ? 'text' : 'not-allowed',
                      boxSizing: 'border-box',
                    }}
                  />
                  {formErrors.name && isEditMode && (
                    <p style={{ color: '#EF4444', fontSize: '12px', marginTop: '4px' }}>
                      {formErrors.name}
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
                    value={siswaData.gender}
                    onChange={(e) => handleFieldChange('gender', e.target.value as 'L' | 'P')}
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
                    <option value="L">Laki-Laki</option>
                    <option value="P">Perempuan</option>
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
                      value={selectedMajorId}
                      onChange={(e) => {
                        const value = e.target.value;
                        setSelectedMajorId(value);
                        setSelectedGrade('');
                        setSelectedClassLabel('');
                        handleFieldChange('class_id', '');
                      }}
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
                    <option value="">Pilih Konsentrasi Keahlian</option>
                    {majors.map((m) => (
                      <option key={m.id} value={m.id}>{MAJOR_NAMES[m.name] || m.name}</option>
                    ))}
                  </select>
                </div>

                {/* Tingkat Kelas */}
                <div>
                  <label style={{
                    fontSize: '14px',
                    fontWeight: '600',
                    color: '#FFFFFF',
                    display: 'block',
                    marginBottom: '8px',
                  }}>
                    Tingkat Kelas
                  </label>
                    <select
                      value={selectedGrade}
                      onChange={(e) => {
                        setSelectedGrade(e.target.value);
                        setSelectedClassLabel('');
                        handleFieldChange('class_id', '');
                      }}
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
                    <option value="">Pilih Tingkat</option>
                    <option value="10">10</option>
                    <option value="11">11</option>
                    <option value="12">12</option>
                  </select>
                </div>

                {/* Kelas */}
                <div style={{ display: 'flex', gap: '12px' }}>
                  <div style={{ flex: 1 }}>
                    <label style={{
                      fontSize: '14px',
                      fontWeight: '600',
                      color: '#FFFFFF',
                      display: 'block',
                      marginBottom: '8px',
                    }}>
                      Kelas
                    </label>
                    <select
                      value={selectedClassLabel}
                      onChange={(e) => {
                        const label = e.target.value;
                        const classId = resolveClassIdByLabel(label, selectedMajorId, selectedGrade);
                        setSelectedClassLabel(label);
                        handleFieldChange('class_id', classId);
                        validateField('class_id', classId);
                      }}
                      disabled={!isEditMode}
                      style={{
                        width: '100%',
                        padding: '12px 16px',
                        borderRadius: '8px',
                        border: formErrors.class_id ? '2px solid #EF4444' : '1px solid #E5E7EB',
                        fontSize: '14px',
                        backgroundColor: '#FFFFFF',
                        color: '#1F2937',
                        outline: 'none',
                        cursor: isEditMode ? 'pointer' : 'not-allowed',
                        boxSizing: 'border-box',
                      }}
                    >
                      <option value="">Pilih Kelas</option>
                      {filterClassLabels(
                        getMajorCode(majors.find(m => m.id.toString() === selectedMajorId)?.code || majors.find(m => m.id.toString() === selectedMajorId)?.name),
                        selectedGrade
                      ).map((label) => (
                        <option key={label} value={label}>{label}</option>
                      ))}
                    </select>
                    {formErrors.class_id && isEditMode && (
                      <p style={{ color: '#EF4444', fontSize: '12px', marginTop: '4px' }}>
                        {formErrors.class_id}
                      </p>
                    )}
                  </div>
                </div>

                {/* No. Telepon Orang Tua */}
                <div>
                  <label style={{
                    fontSize: '14px',
                    fontWeight: '600',
                    color: '#FFFFFF',
                    display: 'block',
                    marginBottom: '8px',
                  }}>
                    No. Telepon Orang Tua
                  </label>
                  <input
                    type="tel"
                    value={siswaData.phone || ''}
                    onChange={(e) => {
                      const value = e.target.value.replace(/\D/g, '').slice(0, 13);
                      handleFieldChange('phone', value);
                      validateField('phone', value);
                    }}
                    disabled={!isEditMode}
                    placeholder="08xxxxxxxxxx"
                    maxLength={13}
                    style={{
                      width: '100%',
                      padding: '12px 16px',
                      borderRadius: '8px',
                      border: formErrors.phone ? '2px solid #EF4444' : '1px solid #E5E7EB',
                      fontSize: '14px',
                      backgroundColor: '#FFFFFF',
                      color: '#1F2937',
                      outline: 'none',
                      cursor: isEditMode ? 'text' : 'not-allowed',
                      boxSizing: 'border-box',
                    }}
                  />
                  {formErrors.phone && isEditMode && (
                    <p style={{ color: '#EF4444', fontSize: '12px', marginTop: '4px' }}>
                      {formErrors.phone}
                    </p>
                  )}
                </div>

                {/* Alamat */}
                <div style={{ gridColumn: window.innerWidth >= 768 ? 'span 2' : 'span 1' }}>
                  <label style={{
                    fontSize: '14px',
                    fontWeight: '600',
                    color: '#FFFFFF',
                    display: 'block',
                    marginBottom: '8px',
                  }}>
                    Alamat
                  </label>
                  <textarea
                    value={siswaData.address || ''}
                    onChange={(e) => handleFieldChange('address', e.target.value)}
                    disabled={!isEditMode}
                    rows={3}
                    style={{
                      width: '100%',
                      padding: '12px 16px',
                      borderRadius: '8px',
                      border: '1px solid #E5E7EB',
                      fontSize: '14px',
                      backgroundColor: '#FFFFFF',
                      color: '#1F2937',
                      outline: 'none',
                      cursor: isEditMode ? 'text' : 'not-allowed',
                      boxSizing: 'border-box',
                      resize: 'vertical'
                    }}
                  />
                </div>

                {/* Tahun Angkatan */}
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

                    {/* Separator */}
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
