import { useState } from 'react';
import { FormModal } from '../FormModal';

interface TambahGuruFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: {
    kodeGuru: string;
    namaGuru: string;
    mataPelajaran: string;
    role: string;
  }) => void;
  initialData?: {
    kodeGuru: string;
    namaGuru: string;
    mataPelajaran: string;
    role: string;
  };
  isEdit?: boolean;
}

const roleOptions = [
  { id: 'wali-kelas', nama: 'Wali Kelas' },
  { id: 'staf', nama: 'Staf' },
  { id: 'guru', nama: 'Guru' },
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

export function TambahGuruForm({
  isOpen,
  onClose,
  onSubmit,
  initialData,
  isEdit = false,
}: TambahGuruFormProps) {
  const [kodeGuru, setKodeGuru] = useState(initialData?.kodeGuru || '');
  const [namaGuru, setNamaGuru] = useState(initialData?.namaGuru || '');
  const [mataPelajaran, setMataPelajaran] = useState(initialData?.mataPelajaran || '');
  const [role, setRole] = useState(initialData?.role || '');
  const [errors, setErrors] = useState<{
    kodeGuru?: string;
    namaGuru?: string;
    mataPelajaran?: string;
    role?: string;
  }>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleReset = () => {
    setKodeGuru(initialData?.kodeGuru || '');
    setNamaGuru(initialData?.namaGuru || '');
    setMataPelajaran(initialData?.mataPelajaran || '');
    setRole(initialData?.role || '');
    setErrors({});
    setIsSubmitting(false);
  };

  const handleClose = () => {
    handleReset();
    onClose();
  };

  const validate = (): boolean => {
    const newErrors: {
      kodeGuru?: string;
      namaGuru?: string;
      mataPelajaran?: string;
      role?: string;
    } = {};

    if (!kodeGuru.trim()) newErrors.kodeGuru = 'Kode guru wajib diisi';
    else if (!/^\d+$/.test(kodeGuru)) newErrors.kodeGuru = 'Kode guru hanya boleh angka';

    if (!namaGuru.trim()) newErrors.namaGuru = 'Nama guru wajib diisi';
    if (!mataPelajaran.trim()) newErrors.mataPelajaran = 'Mata pelajaran wajib dipilih';
    if (!role) newErrors.role = 'Role wajib dipilih';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = () => {
    if (validate()) {
      setIsSubmitting(true);
      setTimeout(() => {
        onSubmit({
          kodeGuru: kodeGuru.trim(),
          namaGuru: namaGuru.trim(),
          mataPelajaran: mataPelajaran.trim(),
          role: role.trim(),
        });
        handleReset();
        setIsSubmitting(false);
      }, 400);
    }
  };

  const inputStyle = (hasError?: boolean): React.CSSProperties => ({
    width: '100%',
    padding: '12px 14px',
    border: `1px solid ${hasError ? '#ef4444' : '#cbd5e1'}`,
    borderRadius: '10px',
    fontSize: '14px',
    outline: 'none',
    boxSizing: 'border-box',
    backgroundColor: '#ffffff',
    color: '#0f172a',
    transition: 'border-color 0.2s, box-shadow 0.2s',
  });

  const selectStyle = (hasError?: boolean): React.CSSProperties => ({
    width: '100%',
    padding: '12px 14px',
    border: `1px solid ${hasError ? '#ef4444' : '#cbd5e1'}`,
    borderRadius: '10px',
    fontSize: '14px',
    outline: 'none',
    boxSizing: 'border-box',
    backgroundColor: '#ffffff',
    color: '#0f172a',
    transition: 'border-color 0.2s, box-shadow 0.2s',
    appearance: 'none',
    backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e")`,
    backgroundPosition: 'right 0.5rem center',
    backgroundRepeat: 'no-repeat',
    backgroundSize: '1.5em 1.5em',
    paddingRight: '2.5rem',
  });

  const labelStyle: React.CSSProperties = {
    display: 'block',
    fontWeight: 700,
    fontSize: '14px',
    marginBottom: '8px',
    color: '#0f172a',
  };

  const errorStyle: React.CSSProperties = {
    color: '#ef4444',
    fontSize: '12px',
    marginTop: '6px',
    marginBottom: 0,
  };

  return (
    <FormModal
      isOpen={isOpen}
      onClose={handleClose}
      title={isEdit ? 'Edit Guru' : 'Tambah Guru'}
      onSubmit={handleSubmit}
      submitLabel={isEdit ? 'Simpan' : 'Tambahkan'}
      isSubmitting={isSubmitting}
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
        {/* Nama Guru */}
        <div>
          <label htmlFor="namaGuru" style={labelStyle}>Nama Guru</label>
          <input
            id="namaGuru"
            type="text"
            placeholder="Masukkan nama guru"
            value={namaGuru}
            onChange={(e) => {
              setNamaGuru(e.target.value);
              if (errors.namaGuru) setErrors({ ...errors, namaGuru: undefined });
            }}
            style={inputStyle(!!errors.namaGuru)}
            disabled={isSubmitting}
          />
          {errors.namaGuru && <p style={errorStyle}>{errors.namaGuru}</p>}
        </div>

        {/* Kode Guru */}
        <div>
          <label htmlFor="kodeGuru" style={labelStyle}>Kode Guru</label>
          <input
            id="kodeGuru"
            type="text"
            placeholder="Masukkan kode guru"
            value={kodeGuru}
            onChange={(e) => {
              const value = e.target.value;
              if (/^\d*$/.test(value)) {
                setKodeGuru(value);
                if (errors.kodeGuru) setErrors({ ...errors, kodeGuru: undefined });
              }
            }}
            style={inputStyle(!!errors.kodeGuru)}
            disabled={isSubmitting}
          />
          {errors.kodeGuru && <p style={errorStyle}>{errors.kodeGuru}</p>}
        </div>

        {/* Role */}
        <div>
          <label htmlFor="role" style={labelStyle}>Role</label>
          <select
            id="role"
            value={role}
            onChange={(e) => {
              setRole(e.target.value);
              if (errors.role) setErrors({ ...errors, role: undefined });
            }}
            style={selectStyle(!!errors.role)}
            disabled={isSubmitting}
          >
            <option value="">Pilih Role</option>
            {roleOptions.map((option) => (
              <option key={option.id} value={option.nama}>
                {option.nama}
              </option>
            ))}
          </select>
          {errors.role && <p style={errorStyle}>{errors.role}</p>}
        </div>

        {/* Mata Pelajaran */}
        <div>
          <label htmlFor="mataPelajaran" style={labelStyle}>Mata Pelajaran</label>
          <select
            id="mataPelajaran"
            value={mataPelajaran}
            onChange={(e) => {
              setMataPelajaran(e.target.value);
              if (errors.mataPelajaran) setErrors({ ...errors, mataPelajaran: undefined });
            }}
            style={selectStyle(!!errors.mataPelajaran)}
            disabled={isSubmitting}
          >
            <option value="">Pilih Mata Pelajaran</option>
            {mataPelajaranOptions.map((mapel, index) => (
              <option key={index} value={mapel}>
                {mapel}
              </option>
            ))}
          </select>
          {errors.mataPelajaran && <p style={errorStyle}>{errors.mataPelajaran}</p>}
        </div>
      </div>
    </FormModal>
  );
}