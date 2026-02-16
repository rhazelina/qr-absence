import { useState, useEffect } from 'react';
import { FormModal } from '../FormModal';

interface Guru {
  id: string;
  kodeGuru: string;
  namaGuru: string;
  mataPelajaran?: string;
  role: string;
  waliKelasDari?: string;
  noTelp?: string;
  keterangan?: string;
  jenisKelamin?: string;
}

interface TambahGuruFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: Omit<Guru, 'id'>) => void;
  initialData?: Partial<Guru>;
  isEdit?: boolean;
  isLoading?: boolean;
  existingTeachers?: Guru[];
  classList?: string[];
}

const roleOptions = [
  { id: 'guru', nama: 'Guru' },
  { id: 'wali-kelas', nama: 'Wali Kelas' },
  { id: 'staf', nama: 'Staff' },
];

const mataPelajaranOptions = [
  'Matematika',
  'Bahasa Indonesia',
  'Bahasa Inggris',
  'Fisika',
  'Kimia',
  'Biologi',
  'Sejarah',
  'Geografi',
  'Ekonomi',
  'Sosiologi',
  'Seni Budaya',
  'Penjasorkes',
  'PKn',
  'Agama',
  'Informatika',
  'IPAS',
  'Dasar Program Keahlian',
];

const staffDivisions = [
  'Tata Usaha',
  'Administrasi',
  'Perpustakaan',
  'Laboratorium',
  'Keuangan',
];

export function TambahGuruForm({
  isOpen,
  onClose,
  onSubmit,
  initialData,
  isEdit = false,
  isLoading = false,
  existingTeachers = [],
  classList = [],
}: TambahGuruFormProps) {
  const [formData, setFormData] = useState({
    kodeGuru: '',
    namaGuru: '',
    mataPelajaran: '',
    role: '',
    jenisKelamin: 'Laki-Laki',
    waliKelasDari: '',
    noTelp: '',
    keterangan: '', // Shared field for Mapel/Division
  });

  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  useEffect(() => {
    if (isOpen) {
      if (initialData && isEdit) {
        setFormData({
          kodeGuru: initialData.kodeGuru || '',
          namaGuru: initialData.namaGuru || '',
          mataPelajaran: initialData.mataPelajaran || '',
          role: initialData.role || '',
          jenisKelamin: initialData.jenisKelamin || 'Laki-Laki',
          waliKelasDari: initialData.waliKelasDari || '',
          noTelp: initialData.noTelp || '',
          // Map 'keterangan' appropriately
          keterangan: initialData.keterangan || initialData.mataPelajaran || '',
        });
      } else {
        resetForm();
      }
      setErrors({});
    }
  }, [isOpen, initialData, isEdit]);

  const resetForm = () => {
    setFormData({
      kodeGuru: '',
      namaGuru: '',
      mataPelajaran: '',
      role: '',
      jenisKelamin: 'Laki-Laki',
      waliKelasDari: '',
      noTelp: '',
      keterangan: '',
    });
  };

  const validate = (): boolean => {
    const newErrors: { [key: string]: string } = {};

    if (!formData.namaGuru.trim()) newErrors.namaGuru = 'Nama guru wajib diisi';
    if (!formData.kodeGuru.trim()) newErrors.kodeGuru = 'Kode guru wajib diisi';
    else if (!isEdit && existingTeachers.some(g => g.kodeGuru === formData.kodeGuru)) {
      newErrors.kodeGuru = 'Kode guru sudah terdaftar';
    }

    if (!formData.role) newErrors.role = 'Role wajib dipilih';

    if (formData.role === 'Guru') {
      if (!formData.keterangan) newErrors.keterangan = 'Mata pelajaran wajib dipilih';
    } else if (formData.role === 'Wali Kelas') {
      if (!formData.waliKelasDari) newErrors.waliKelasDari = 'Kelas wajib dipilih';
      else {
        // Check if class is occupied
        const occupied = existingTeachers.find(g =>
          g.role === 'Wali Kelas' &&
          g.waliKelasDari === formData.waliKelasDari &&
          g.id !== initialData?.id
        );
        if (occupied) {
          newErrors.waliKelasDari = `Kelas ini sudah memiliki wali kelas (${occupied.namaGuru})`;
        }
      }
    } else if (formData.role === 'Staff') {
      if (!formData.keterangan) newErrors.keterangan = 'Bagian staff wajib dipilih';
    }

    if (formData.noTelp && formData.noTelp.trim()) {
      const cleanTelp = formData.noTelp.replace(/\D/g, '');
      if (cleanTelp.length < 10 || cleanTelp.length > 13) {
        newErrors.noTelp = 'Nomor telepon harus 10-13 digit';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = () => {
    if (validate()) {
      onSubmit({
        ...formData,
        mataPelajaran: formData.role === 'Guru' ? formData.keterangan : '',
      });
    }
  };

  const handleReset = () => {
    resetForm();
    setErrors({});
  }

  const inputStyle = (hasError?: boolean): React.CSSProperties => ({
    width: '100%',
    padding: '12px 14px',
    border: `1px solid ${hasError ? '#ef4444' : '#cbd5e1'}`,
    borderRadius: '8px',
    fontSize: '14px',
    outline: 'none',
    boxSizing: 'border-box',
    backgroundColor: '#ffffff',
    color: '#0f172a',
  });

  const labelStyle: React.CSSProperties = {
    display: 'block',
    fontWeight: 600,
    fontSize: '14px',
    marginBottom: '6px',
    color: '#334155',
  };

  const errorStyle: React.CSSProperties = {
    color: '#ef4444',
    fontSize: '12px',
    marginTop: '4px',
    margin: 0
  };

  return (
    <FormModal
      isOpen={isOpen}
      onClose={onClose}
      title={isEdit ? 'Edit Guru' : 'Tambah Guru'}
      onSubmit={handleSubmit}
      submitLabel={isEdit ? 'Simpan Perubahan' : 'Tambahkan'}
      isSubmitting={isLoading}
      resetLabel="Reset"
      onReset={!isEdit ? handleReset : undefined}
      contentStyle={{ minHeight: '400px' }}
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>

        {/* Nama Guru */}
        <div>
          <label style={labelStyle}>Nama Lengkap <span style={{ color: '#EF4444' }}>*</span></label>
          <input
            type="text"
            value={formData.namaGuru}
            onChange={(e) => setFormData({ ...formData, namaGuru: e.target.value })}
            placeholder="Contoh: Budi Santoso, S.Pd"
            style={inputStyle(!!errors.namaGuru)}
            disabled={isLoading}
          />
          {errors.namaGuru && <p style={errorStyle}>{errors.namaGuru}</p>}
        </div>

        {/* Kode Guru / NIP */}
        <div>
          <label style={labelStyle}>Kode Guru / NIP <span style={{ color: '#EF4444' }}>*</span></label>
          <input
            type="text"
            value={formData.kodeGuru}
            onChange={(e) => setFormData({ ...formData, kodeGuru: e.target.value.replace(/\D/g, '') })}
            placeholder="Nomor Induk Pegawai"
            style={inputStyle(!!errors.kodeGuru)}
            disabled={isLoading}
          />
          {errors.kodeGuru && <p style={errorStyle}>{errors.kodeGuru}</p>}
        </div>

        {/* Jenis Kelamin */}
        <div>
          <label style={labelStyle}>Jenis Kelamin <span style={{ color: '#EF4444' }}>*</span></label>
          <select
            value={formData.jenisKelamin}
            onChange={(e) => setFormData({ ...formData, jenisKelamin: e.target.value })}
            style={inputStyle()}
            disabled={isLoading}
          >
            <option value="Laki-Laki">Laki-Laki</option>
            <option value="Perempuan">Perempuan</option>
          </select>
        </div>

        {/* Role */}
        <div>
          <label style={labelStyle}>Peran <span style={{ color: '#EF4444' }}>*</span></label>
          <select
            value={formData.role}
            onChange={(e) => setFormData({ ...formData, role: e.target.value, keterangan: '', waliKelasDari: '' })}
            style={inputStyle(!!errors.role)}
            disabled={isLoading}
          >
            <option value="">Pilih Peran</option>
            {roleOptions.map((opt) => (
              <option key={opt.id} value={opt.nama}>{opt.nama}</option>
            ))}
          </select>
          {errors.role && <p style={errorStyle}>{errors.role}</p>}
        </div>

        {/* Dynamic Fields based on Role */}
        {formData.role === 'Guru' && (
          <div>
            <label style={labelStyle}>Mata Pelajaran <span style={{ color: '#EF4444' }}>*</span></label>
            <select
              value={formData.keterangan}
              onChange={(e) => setFormData({ ...formData, keterangan: e.target.value })}
              style={inputStyle(!!errors.keterangan)}
              disabled={isLoading}
            >
              <option value="">Pilih Mata Pelajaran</option>
              {mataPelajaranOptions.map((mp) => (
                <option key={mp} value={mp}>{mp}</option>
              ))}
            </select>
            {errors.keterangan && <p style={errorStyle}>{errors.keterangan}</p>}
          </div>
        )}

        {formData.role === 'Wali Kelas' && (
          <div>
            <label style={labelStyle}>Wali Kelas Untuk <span style={{ color: '#EF4444' }}>*</span></label>
            <select
              value={formData.waliKelasDari}
              onChange={(e) => setFormData({ ...formData, waliKelasDari: e.target.value })}
              style={inputStyle(!!errors.waliKelasDari)}
              disabled={isLoading}
            >
              <option value="">Pilih Kelas</option>
              {classList.map((cls) => (
                <option key={cls} value={cls}>{cls}</option>
              ))}
            </select>
            {errors.waliKelasDari && <p style={errorStyle}>{errors.waliKelasDari}</p>}
            <p style={{ fontSize: '11px', color: '#64748B', marginTop: '4px' }}>
              Hanya kelas yang belum memiliki wali kelas yang ditampilkan (kecuali kelas saat ini).
            </p>
          </div>
        )}

        {formData.role === 'Staff' && (
          <div>
            <label style={labelStyle}>Bagian <span style={{ color: '#EF4444' }}>*</span></label>
            <select
              value={formData.keterangan}
              onChange={(e) => setFormData({ ...formData, keterangan: e.target.value })}
              style={inputStyle(!!errors.keterangan)}
              disabled={isLoading}
            >
              <option value="">Pilih Bagian</option>
              {staffDivisions.map((div) => (
                <option key={div} value={div}>{div}</option>
              ))}
            </select>
            {errors.keterangan && <p style={errorStyle}>{errors.keterangan}</p>}
          </div>
        )}

        {/* No Telp */}
        <div>
          <label style={labelStyle}>Nomor Telepon <span style={{ color: '#94a3b8', fontWeight: 'normal' }}>(Opsional)</span></label>
          <input
            type="tel"
            value={formData.noTelp}
            onChange={(e) => setFormData({ ...formData, noTelp: e.target.value.replace(/\D/g, '').slice(0, 13) })}
            placeholder="08xxxxxxxxxx"
            style={inputStyle(!!errors.noTelp)}
            disabled={isLoading}
          />
          {errors.noTelp && <p style={errorStyle}>{errors.noTelp}</p>}
        </div>

      </div>
    </FormModal>
  );
}