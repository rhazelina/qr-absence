// FILE: DetailGuru.tsx - Halaman Detail Guru Refactored
import { useState, useEffect } from 'react';
import AdminLayout from '../../component/Admin/AdminLayout';
import { User as UserIcon, Edit2, Save, X, ArrowLeft } from 'lucide-react';
import { teacherService } from '../../services/teacherService';
import { masterService, type Subject, type ClassRoom } from '../../services/masterService';

/* ===================== INTERFACE DEFINITIONS ===================== */
interface User {
  role: string;
  name: string;
}

interface Guru {
  id: string;
  namaGuru: string; // name
  kodeGuru: string; // nip
  jenisKelamin: string;
  roles: string[]; // roles array
  noTelp: string; // phone
  keterangan: string; // subject or wali class name or staff bagian
  subjects: string[]; // subjects array
  waliGrade?: string;        // 10/11/12 when wali kelas
  waliKelasId?: string;      // specific class id when wali kelas
  wakaField?: string; // waka field
  kaproField?: string; // kapro field
  password?: string;
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
  { id: 'Guru', nama: 'Guru' },
  { id: 'Wali Kelas', nama: 'Wali Kelas' },
  { id: 'Waka', nama: 'Waka' },
  { id: 'Kapro', nama: 'Kapro' },
  { id: 'Staff', nama: 'Staff' },
];

const staffBagianList = [
  { id: 'Tata Usaha', nama: 'Tata Usaha' },
  { id: 'Administrasi', nama: 'Administrasi' },
  { id: 'Perpustakaan', nama: 'Perpustakaan' },
  { id: 'Laboratorium', nama: 'Laboratorium' },
  { id: 'Keuangan', nama: 'Keuangan' },
];

const wakaOptions = [
  { id: 'Waka Kesiswaan', nama: 'Waka Kesiswaan' },
  { id: 'Waka Kurikulum', nama: 'Waka Kurikulum' },
  { id: 'Waka Humas', nama: 'Waka Humas' },
  { id: 'Waka Sarpras', nama: 'Waka Sarpras' },
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
  const [formErrors, setFormErrors] = useState<{ [key: string]: string }>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showDuplicateWarning, setShowDuplicateWarning] = useState(false);
  const [duplicateWarningMessage, setDuplicateWarningMessage] = useState('');

  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [classes, setClasses] = useState<ClassRoom[]>([]);
  const [majors, setMajors] = useState<any[]>([]);

  // temporary variables for form
  const [tempStaffBagian, setTempStaffBagian] = useState('');

  // ==================== FETCH DATA ====================
  const fetchMasterData = async () => {
    try {
      const [subjectsRes, classesRes, majorsRes] = await Promise.all([
        masterService.getSubjects(),
        masterService.getClasses(),
        masterService.getMajors()
      ]);
      const subjectsRaw = Array.isArray(subjectsRes) ? subjectsRes : (subjectsRes.data || subjectsRes.data?.data || []);
      const classesRaw = Array.isArray(classesRes) ? classesRes : (classesRes.data || classesRes.data?.data || []);
      const majorsRaw = Array.isArray(majorsRes) ? majorsRes : (majorsRes.data || majorsRes.data?.data || []);
      setSubjects(subjectsRaw);
      setClasses(classesRaw);
      setMajors(majorsRaw);
    } catch (err) {
      console.error('Error fetching master data:', err);
    }
  };

  const fetchGuruDetail = async () => {
    if (!guruId) {
      // Try fallback to localStorage if guruId prop is missing/empty (backward compatibility)
      const storedId = localStorage.getItem('selectedGuruId');
      if (!storedId) {
        setError('ID Guru tidak ditemukan.');
        setLoading(false);
        return;
      }
      // If we found it in localStorage, we use it next render or just proceed if we could assign to variable.
      // But better to expect guruId prop or handle in parent.
      // For now, let's assume if guruId is empty, we check localStorage.
    }

    const targetId = guruId || localStorage.getItem('selectedGuruId');
    if (!targetId) {
      setError('ID Guru tidak ditemukan.');
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      const response = await teacherService.getTeacherById(targetId);
      const data = response.data;

      const rolesArray = Array.isArray(data.jabatan) ? data.jabatan : (data.jabatan ? [data.jabatan] : ['Guru']);
      const subjectsArray = Array.isArray(data.subject) ? data.subject : (data.subject ? [data.subject] : []);

      const mappedGuru: Guru = {
        id: data.id.toString(),
        namaGuru: data.name,
        kodeGuru: data.nip,
        jenisKelamin: data.gender || 'Laki-Laki',
        roles: rolesArray,
        subjects: subjectsArray,
        noTelp: data.phone || '',
        keterangan: '',
        waliGrade: data.homeroom_class?.grade || '',
        waliKelasId: data.homeroom_class ? data.homeroom_class.id?.toString() : '',
        wakaField: data.waka_field || data.bidang,
        kaproField: data.konsentrasi_keahlian
      };

      // Compute display keterangan
      const detailKeterangan = [];
      if (rolesArray.includes('Guru') && subjectsArray.length > 0) {
        detailKeterangan.push(subjectsArray.join(', '));
      }
      if (rolesArray.includes('Wali Kelas') && data.homeroom_class?.name) {
        // API already returns class name; don’t rely on state here
        detailKeterangan.push(data.homeroom_class.name);
      }
      if (rolesArray.includes('Kapro') && mappedGuru.kaproField) {
        detailKeterangan.push(mappedGuru.kaproField);
      }
      if (rolesArray.includes('Waka') && mappedGuru.wakaField) {
        detailKeterangan.push(mappedGuru.wakaField);
      }

      mappedGuru.keterangan = detailKeterangan.join(' | ');

      setGuruData(mappedGuru);
      setOriginalData(mappedGuru);
      // selected subjects already stored in mappedGuru.subjects
      setTempStaffBagian(mappedGuru.wakaField || mappedGuru.kaproField || '');
    } catch (err: any) {
      console.error('Error fetching teacher detail:', err);
      setError('Gagal memuat data guru.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMasterData();
    fetchGuruDetail();
  }, [guruId]);

  // ==================== FORM VALIDATION ====================
  const validateField = (field: string, value: string) => {
    const newErrors = { ...formErrors };

    if (field === 'namaGuru') {
      if (!value.trim()) newErrors.namaGuru = 'Nama guru harus diisi';
      else if (value.trim().length < 3) newErrors.namaGuru = 'Nama guru minimal 3 karakter';
      else delete newErrors.namaGuru;
    }

    if (field === 'kodeGuru') {
      if (!value.trim()) newErrors.kodeGuru = 'Kode guru harus diisi';
      else delete newErrors.kodeGuru;
    }

    if (field === 'noTelp') {
      if (value && value.trim()) {
        if (!/^08\d{10,11}$/.test(value)) newErrors.noTelp = 'Nomor telepon harus 12-13 digit (08xxxxxxxxxx)';
        else delete newErrors.noTelp;
      } else delete newErrors.noTelp;
    }

    setFormErrors(newErrors);
  };

  const validateForm = (): boolean => {
    if (!guruData) return false;
    const errors: { [key: string]: string } = {};

    if (!guruData.namaGuru.trim()) errors.namaGuru = 'Nama guru harus diisi';
    if (!guruData.kodeGuru.trim()) errors.kodeGuru = 'Kode guru harus diisi';

    if (guruData.noTelp && guruData.noTelp.trim() && !/^08\d{10,11}$/.test(guruData.noTelp)) {
      errors.noTelp = 'Nomor telepon tidak valid';
    }

    if (guruData.roles.includes('Guru') && guruData.subjects.length === 0) errors.mataPelajaran = 'Mata pelajaran harus dipilih';
    if (guruData.roles.includes('Wali Kelas')) {
      if (!guruData.waliGrade) errors.waliGrade = 'Tingkatan harus dipilih';
      if (!guruData.waliKelasId) errors.waliKelasId = 'Kelas harus dipilih';
    }

    const needsStaffBagian = guruData.roles.some(r => ['Staff', 'Waka', 'Kapro'].includes(r));
    if (needsStaffBagian && !tempStaffBagian) errors.staffBagian = 'Bagian harus dipilih';

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
    setGuruData(originalData);
    setFormErrors({});
    if (originalData) {
      const hasStaff = originalData.roles.some(r => ['Staff', 'Waka', 'Kapro'].includes(r));
      setTempStaffBagian(hasStaff ? originalData.keterangan : '');
    }
  };

  const handleSaveChanges = async () => {
    if (!guruData || !validateForm()) return;

    try {
      // Check for Occupied Homeroom Class
      if (guruData.roles.includes('Wali Kelas')) {
        const classesRes = await masterService.getClasses();
        const classesData = classesRes.data || [];
        const selectedClass = classesData.find((c: any) => c.id.toString() === guruData.waliKelasId);

        if (selectedClass && selectedClass.homeroom_teacher && selectedClass.homeroom_teacher.id.toString() !== guruData.id) {
          setDuplicateWarningMessage(`Kelas "${selectedClass.name}" sudah memiliki wali kelas (${selectedClass.homeroom_teacher.name}).`);
          setShowDuplicateWarning(true);
          return;
        }
      }

      const normalizeRoles = (roles: string[]) => {
        const normalized = new Set<string>();
        roles.forEach((r) => {
          if (r.startsWith('Waka')) {
            normalized.add('Waka');
            return;
          }
          if (r.startsWith('Kapro')) {
            normalized.add('Kapro');
            return;
          }
          if (r === 'Wali Kelas') {
            normalized.add('Wali Kelas');
            return;
          }
          if (r === 'Guru') {
            normalized.add('Guru');
            return;
          }
        });
        return Array.from(normalized);
      };

      const normalizedRoles = normalizeRoles(guruData.roles);

      const payload: any = {
        name: guruData.namaGuru,
        nip: guruData.kodeGuru,
        jabatan: normalizedRoles,
        phone: guruData.noTelp,
        // no email field - deleted per requirements

        // Conditional fields
        subject: normalizedRoles.includes('Guru') ? guruData.subjects : [],
        homeroom_class_id: normalizedRoles.includes('Wali Kelas')
          ? guruData.waliKelasId
          : null,
        bidang: normalizedRoles.includes('Waka') ? tempStaffBagian : null,
        waka_field: normalizedRoles.includes('Waka') ? tempStaffBagian : null,
        konsentrasi_keahlian: normalizedRoles.includes('Kapro') ? tempStaffBagian : null,
      };

      await teacherService.updateTeacher(guruData.id, payload);

      // Update local state
      let updatedData = { ...guruData };
      const detailKeterangan: string[] = [];
      if (updatedData.roles.includes('Guru') && updatedData.subjects.length) detailKeterangan.push(updatedData.subjects.join(', '));
      if (updatedData.roles.includes('Wali Kelas') && updatedData.waliKelasId) {
        const cls = classes.find(c => c.id.toString() === updatedData.waliKelasId);
        if (cls) detailKeterangan.push(cls.name);
      }
      if (updatedData.roles.some(r => ['Staff', 'Waka', 'Kapro'].includes(r)) && tempStaffBagian) detailKeterangan.push(tempStaffBagian);

      updatedData.keterangan = detailKeterangan.join(' | ');

      setGuruData(updatedData);
      setOriginalData(updatedData);
      setIsEditMode(false);

      if (onUpdateGuru) onUpdateGuru(updatedData);
      alert('✓ Data berhasil diperbarui!');

    } catch (err: any) {
      console.error(err);
      alert('Gagal menyimpan perubahan: ' + (err.message || 'Unknown error'));
    }
  };

  const handleFieldChange = (field: keyof Guru, value: any) => {
    if (!guruData) return;
    setGuruData({ ...guruData, [field]: value });
  };

  const handleRoleToggle = (roleId: string) => {
    if (!guruData) return;
    const isSelected = guruData.roles.includes(roleId);
    let newRoles = [];
    if (isSelected) {
      newRoles = guruData.roles.filter(r => r !== roleId);
    } else {
      newRoles = [...guruData.roles, roleId];
    }
    setGuruData({ ...guruData, roles: newRoles });
  };

  const handleBack = () => {
    if (isEditMode) {
      if (confirm('Anda sedang dalam mode edit. Yakin ingin kembali tanpa menyimpan?')) {
        setIsEditMode(false);
        onMenuClick('guru');
      }
    } else {
      onMenuClick('guru');
    }
  };

  // ==================== RENDERING ====================
  if (loading || !guruData) {
    return (
      <AdminLayout pageTitle="Detail Guru" currentPage={currentPage} onMenuClick={onMenuClick} user={user} onLogout={onLogout}>
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
          {error ? <span style={{ color: 'red' }}>{error}</span> : <span>Loading...</span>}
        </div>
      </AdminLayout>
    );
  }

  const isMobile = window.innerWidth < 768;

  return (
    <AdminLayout
      pageTitle="Detail Guru"
      currentPage={currentPage}
      onMenuClick={onMenuClick}
      user={user}
      onLogout={onLogout}
      hideBackground
    >
      <div style={{
        backgroundImage: 'url(../src/assets/Background/bgdetailgurusiswa.png)',
        backgroundSize: 'cover', backgroundPosition: 'center', minHeight: '100vh',
        padding: isMobile ? '16px' : '24px', display: 'flex', alignItems: 'flex-start', paddingTop: '40px'
      }}>
        <div style={{ maxWidth: '1000px', width: '100%', margin: '0 auto' }}>

          {/* BACK BUTTON */}
          <button onClick={handleBack} style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'none', border: 'none', color: 'white', fontSize: '16px', fontWeight: 600, cursor: 'pointer', marginBottom: '20px', padding: '8px 12px', backgroundColor: 'rgba(0,0,0,0.3)', borderRadius: '8px' }}>
            <ArrowLeft size={20} />
            Kembali ke Data Guru
          </button>

          <div style={{ backgroundColor: 'rgba(15, 23, 42, 0.95)', borderRadius: '16px', boxShadow: '0 4px 20px rgba(0,0,0,0.3)', overflow: 'hidden', border: '1px solid rgba(255,255,255,0.1)' }}>

            {/* HEADER */}
            <div style={{
              background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)',
              padding: isMobile ? '20px' : '28px 32px',
              display: 'flex',
              flexDirection: isMobile ? 'column' : 'row',
              alignItems: isMobile ? 'flex-start' : 'center',
              gap: '20px',
              position: 'relative',
              overflow: 'hidden'
            }}>
              {/* Decorative Gradient Overlay */}
              <div style={{ position: 'absolute', top: '-50%', right: '-10%', width: '300px', height: '300px', background: 'radial-gradient(circle, rgba(59, 130, 246, 0.15) 0%, transparent 70%)', pointerEvents: 'none' }}></div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '20px', flex: 1, position: 'relative', zIndex: 1 }}>
                <div style={{
                  width: isMobile ? '70px' : '85px',
                  height: isMobile ? '70px' : '85px',
                  borderRadius: '50%',
                  backgroundColor: '#3b82f6',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'white',
                  border: '4px solid rgba(255,255,255,0.15)',
                  boxShadow: '0 8px 16px rgba(0,0,0,0.2)',
                  flexShrink: 0
                }}>
                  <UserIcon size={isMobile ? 32 : 40} />
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '4px' }}>
                    <h2 style={{ margin: 0, fontSize: isMobile ? '20px' : '26px', fontWeight: '800', color: 'white', letterSpacing: '-0.5px' }}>{guruData.namaGuru}</h2>
                    <span style={{ padding: '4px 10px', backgroundColor: 'rgba(59, 130, 246, 0.2)', color: '#60A5FA', borderRadius: '6px', fontSize: '11px', fontWeight: '700', textTransform: 'uppercase' }}>{guruData.roles.join(', ')}</span>
                  </div>
                  <p style={{ margin: 0, fontSize: isMobile ? '13px' : '15px', color: '#94A3B8', fontFamily: 'monospace', opacity: 0.9 }}>NIP/Kode: {guruData.kodeGuru}</p>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '12px', width: isMobile ? '100%' : 'auto', position: 'relative', zIndex: 1 }}>
                {!isEditMode ? (
                  <button
                    onClick={handleEnableEdit}
                    style={{
                      backgroundColor: '#3B82F6',
                      border: 'none',
                      color: 'white',
                      padding: isMobile ? '12px' : '12px 28px',
                      borderRadius: '12px',
                      fontSize: '14px',
                      fontWeight: '700',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      width: isMobile ? '100%' : 'auto',
                      justifyContent: 'center',
                      boxShadow: '0 4px 12px rgba(59, 130, 246, 0.3)',
                      transition: 'all 0.2s'
                    }}
                  >
                    <Edit2 size={16} /> Ubah Data
                  </button>
                ) : (
                  <>
                    <button
                      onClick={handleCancelEdit}
                      style={{
                        backgroundColor: '#475569',
                        border: 'none',
                        color: 'white',
                        padding: isMobile ? '12px' : '12px 24px',
                        borderRadius: '12px',
                        fontSize: '14px',
                        fontWeight: '700',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        flex: isMobile ? 1 : 'auto',
                        justifyContent: 'center',
                        transition: 'all 0.2s'
                      }}
                    >
                      <X size={16} /> Batal
                    </button>
                    <button
                      onClick={handleSaveChanges}
                      style={{
                        backgroundColor: '#10B981',
                        border: 'none',
                        color: 'white',
                        padding: isMobile ? '12px' : '12px 24px',
                        borderRadius: '12px',
                        fontSize: '14px',
                        fontWeight: '700',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        flex: isMobile ? 1 : 'auto',
                        justifyContent: 'center',
                        boxShadow: '0 4px 12px rgba(16, 185, 129, 0.3)',
                        transition: 'all 0.2s'
                      }}
                    >
                      <Save size={16} /> Simpan
                    </button>
                  </>
                )}
              </div>
            </div>

            {/* FORM */}
            <div style={{ padding: isMobile ? '24px' : '40px' }}>
              {showDuplicateWarning && (
                <div style={{ backgroundColor: '#FEF2F2', border: '1px solid #FECACA', borderRadius: '12px', padding: '16px', marginBottom: '32px', display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
                  <div style={{ backgroundColor: '#EF4444', borderRadius: '50%', width: '20px', height: '200px', display: 'none' }}></div>
                  <div style={{ flex: 1 }}>
                    <div style={{ color: '#991B1B', fontWeight: '700', fontSize: '14px', marginBottom: '4px' }}>Duplikasi Wali Kelas Terdeteksi</div>
                    <p style={{ margin: 0, color: '#B91C1C', fontSize: '13px' }}>{duplicateWarningMessage}</p>
                  </div>
                  <button onClick={() => setShowDuplicateWarning(false)} style={{ background: 'none', border: 'none', color: '#991B1B', cursor: 'pointer' }}><X size={18} /></button>
                </div>
              )}

              {/* Nama */}
              <div>
                <label style={{ fontSize: '14px', fontWeight: '600', color: '#FFFFFF', display: 'block', marginBottom: '8px' }}>Nama Guru</label>
                <input type="text" value={guruData.namaGuru} onChange={(e) => { handleFieldChange('namaGuru', e.target.value); validateField('namaGuru', e.target.value); }} disabled={!isEditMode} style={{ width: '100%', padding: '12px 16px', borderRadius: '8px', border: formErrors.namaGuru ? '2px solid #EF4444' : '1px solid #E5E7EB', fontSize: '14px', backgroundColor: '#FFFFFF', color: '#1F2937', outline: 'none', cursor: isEditMode ? 'text' : 'not-allowed', boxSizing: 'border-box' }} />
                {formErrors.namaGuru && isEditMode && <p style={{ color: '#EF4444', fontSize: '12px', marginTop: '4px' }}>{formErrors.namaGuru}</p>}
              </div>

              {/* Kode */}
              <div>
                <label style={{ fontSize: '14px', fontWeight: '600', color: '#FFFFFF', display: 'block', marginBottom: '8px' }}>Kode Guru</label>
                <input type="text" value={guruData.kodeGuru} onChange={(e) => { handleFieldChange('kodeGuru', e.target.value); validateField('kodeGuru', e.target.value); }} disabled={!isEditMode} style={{ width: '100%', padding: '12px 16px', borderRadius: '8px', border: formErrors.kodeGuru ? '2px solid #EF4444' : '1px solid #E5E7EB', fontSize: '14px', backgroundColor: '#FFFFFF', color: '#1F2937', outline: 'none', cursor: isEditMode ? 'text' : 'not-allowed', boxSizing: 'border-box' }} />
                {formErrors.kodeGuru && isEditMode && <p style={{ color: '#EF4444', fontSize: '12px', marginTop: '4px' }}>{formErrors.kodeGuru}</p>}
              </div>

              {/* Roles Checkboxes */}
              <div>
                <label style={{ fontSize: '14px', fontWeight: '600', color: '#FFFFFF', display: 'block', marginBottom: '8px' }}>Peran {isEditMode && '(Bisa pilih lebih dari satu)'}</label>
                {!isEditMode ? (
                  <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                    {guruData.roles.map(r => (
                      <span key={r} style={{ padding: '6px 12px', backgroundColor: '#334155', color: 'white', borderRadius: '6px', fontSize: '13px' }}>{r}</span>
                    ))}
                  </div>
                ) : (
                  <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', padding: '12px', backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.1)' }}>
                    {peranList.map(item => (
                      <label key={item.id} style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', color: 'white', fontSize: '14px' }}>
                        <input
                          type="checkbox"
                          checked={guruData.roles.includes(item.id)}
                          onChange={() => handleRoleToggle(item.id)}
                        />
                        {item.nama}
                      </label>
                    ))}
                  </div>
                )}
              </div>

              {/* Conditional Fields based on Role */}
              {guruData.roles.includes('Guru') && (
                <div>
                  <label style={{ fontSize: '14px', fontWeight: '600', color: '#FFFFFF', display: 'block', marginBottom: '8px' }}>Mata Pelajaran</label>
                  <select
                    multiple
                    value={guruData.subjects}
                    onChange={(e) => handleFieldChange('subjects', Array.from(e.target.selectedOptions, o => o.value))}
                    disabled={!isEditMode}
                    style={{ width: '100%', padding: '12px 16px', borderRadius: '8px', border: formErrors.mataPelajaran ? '2px solid #EF4444' : '1px solid #E5E7EB', fontSize: '14px', backgroundColor: '#FFFFFF', color: '#1F2937', outline: 'none', cursor: isEditMode ? 'pointer' : 'not-allowed', boxSizing: 'border-box', height: 'auto' }}>
                    {subjects.map(item => <option key={item.id} value={item.name}>{item.name}</option>)}
                  </select>
                  {formErrors.mataPelajaran && isEditMode && <p style={{ color: '#EF4444', fontSize: '12px', marginTop: '4px' }}>{formErrors.mataPelajaran}</p>}
                </div>
              )}

              {guruData.roles.includes('Wali Kelas') && (
                <>
                  <div>
                    <label style={{ fontSize: '14px', fontWeight: '600', color: '#FFFFFF', display: 'block', marginBottom: '8px' }}>Tingkatan Kelas</label>
                    <select value={guruData.waliGrade || ''} onChange={(e) => handleFieldChange('waliGrade', e.target.value)} disabled={!isEditMode} style={{ width: '100%', padding: '12px 16px', borderRadius: '8px', border: formErrors.waliGrade ? '2px solid #EF4444' : '1px solid #E5E7EB', fontSize: '14px', backgroundColor: '#FFFFFF', color: '#1F2937', outline: 'none', cursor: isEditMode ? 'pointer' : 'not-allowed', boxSizing: 'border-box' }}>
                      <option value="">Pilih Tingkatan</option>
                      <option value="10">10</option>
                      <option value="11">11</option>
                      <option value="12">12</option>
                    </select>
                    {formErrors.waliGrade && isEditMode && <p style={{ color: '#EF4444', fontSize: '12px', marginTop: '4px' }}>{formErrors.waliGrade}</p>}
                  </div>
                  <div>
                    <label style={{ fontSize: '14px', fontWeight: '600', color: '#FFFFFF', display: 'block', marginBottom: '8px' }}>Kelas</label>
                    <select value={guruData.waliKelasId || ''} onChange={(e) => handleFieldChange('waliKelasId', e.target.value)} disabled={!isEditMode} style={{ width: '100%', padding: '12px 16px', borderRadius: '8px', border: formErrors.waliKelasId ? '2px solid #EF4444' : '1px solid #E5E7EB', fontSize: '14px', backgroundColor: '#FFFFFF', color: '#1F2937', outline: 'none', cursor: isEditMode ? 'pointer' : 'not-allowed', boxSizing: 'border-box' }}>
                      <option value="">Pilih Kelas</option>
                      {classes.filter(c => !guruData.waliGrade || c.grade === guruData.waliGrade).map(item => (
                        <option key={item.id} value={item.id}>{item.name}</option>
                      ))}
                    </select>
                    {formErrors.waliKelasId && isEditMode && <p style={{ color: '#EF4444', fontSize: '12px', marginTop: '4px' }}>{formErrors.waliKelasId}</p>}
                  </div>
                </>
              )}

              {(guruData.roles.some(r => ['Staff', 'Waka', 'Kapro'].includes(r))) && (
                <div>
                  <label style={{ fontSize: '14px', fontWeight: '600', color: '#FFFFFF', display: 'block', marginBottom: '8px' }}>Detail Bagian / Jabatan Khusus</label>
                  <select value={tempStaffBagian} onChange={(e) => setTempStaffBagian(e.target.value)} disabled={!isEditMode} style={{ width: '100%', padding: '12px 16px', borderRadius: '8px', border: formErrors.staffBagian ? '2px solid #EF4444' : '1px solid #E5E7EB', fontSize: '14px', backgroundColor: '#FFFFFF', color: '#1F2937', outline: 'none', cursor: isEditMode ? 'pointer' : 'not-allowed', boxSizing: 'border-box' }}>
                    <option value="">Pilih Detail</option>
                    {guruData.roles.includes('Waka') && wakaOptions.map(item => <option key={item.id} value={item.nama}>{item.nama}</option>)}
                    {guruData.roles.includes('Kapro') && majors.map(item => <option key={item.id} value={item.name}>{item.name}</option>)}
                    {guruData.roles.includes('Staff') && staffBagianList.map(item => <option key={item.id} value={item.nama}>{item.nama}</option>)}
                  </select>
                  {formErrors.staffBagian && isEditMode && <p style={{ color: '#EF4444', fontSize: '12px', marginTop: '4px' }}>{formErrors.staffBagian}</p>}
                </div>
              )}

              {/* No Telp */}
              <div>
                <label style={{ fontSize: '14px', fontWeight: '600', color: '#FFFFFF', display: 'block', marginBottom: '8px' }}>Nomor Telepon</label>
                <input type="text" value={guruData.noTelp} onChange={(e) => { handleFieldChange('noTelp', e.target.value); validateField('noTelp', e.target.value); }} disabled={!isEditMode} style={{ width: '100%', padding: '12px 16px', borderRadius: '8px', border: formErrors.noTelp ? '2px solid #EF4444' : '1px solid #E5E7EB', fontSize: '14px', backgroundColor: '#FFFFFF', color: '#1F2937', outline: 'none', cursor: isEditMode ? 'text' : 'not-allowed', boxSizing: 'border-box' }} />
                {formErrors.noTelp && isEditMode && <p style={{ color: '#EF4444', fontSize: '12px', marginTop: '4px' }}>{formErrors.noTelp}</p>}
              </div>


            </div>
          </div>

        </div>
      </div>
    </AdminLayout>
  );
}
