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
    password: string;
    noTelp: string;
    waliKelasDari: string;
  }) => void;
  initialData?: {
    kodeGuru: string;
    namaGuru: string;
    mataPelajaran: string;
    role: string;
    password: string;
    noTelp: string;
    waliKelasDari: string;
  };
  isEdit?: boolean;
}

const roleOptions = [
  { id: 'wali-kelas', nama: 'Wali Kelas' },
  { id: 'staf', nama: 'Staf' },
  { id: 'guru', nama: 'Guru' },
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
  const [password, setPassword] = useState(initialData?.password || '');
  const [noTelp, setNoTelp] = useState(initialData?.noTelp || '');
  const [waliKelasDari, setWaliKelasDari] = useState(initialData?.waliKelasDari || '');
  const [errors, setErrors] = useState<{
    kodeGuru?: string;
    namaGuru?: string;
    mataPelajaran?: string;
    role?: string;
    password?: string;
    noTelp?: string;
    waliKelasDari?: string;
  }>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleReset = () => {
    setKodeGuru(initialData?.kodeGuru || '');
    setNamaGuru(initialData?.namaGuru || '');
    setMataPelajaran(initialData?.mataPelajaran || '');
    setRole(initialData?.role || '');
    setPassword(initialData?.password || '');
    setNoTelp(initialData?.noTelp || '');
    setWaliKelasDari(initialData?.waliKelasDari || '');
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
      password?: string;
      noTelp?: string;
      waliKelasDari?: string;
    } = {};

    if (!kodeGuru.trim()) newErrors.kodeGuru = 'Kode guru (NIP) wajib diisi';
    else if (!/^\d+$/.test(kodeGuru)) newErrors.kodeGuru = 'Kode guru hanya boleh angka';
    else if (kodeGuru.length !== 10) newErrors.kodeGuru = 'Kode guru harus 10 digit';

    if (!namaGuru.trim()) newErrors.namaGuru = 'Nama guru wajib diisi';
    else if (namaGuru.trim().length < 3) newErrors.namaGuru = 'Nama guru minimal 3 karakter';

    if (!mataPelajaran.trim()) newErrors.mataPelajaran = 'Mata pelajaran wajib diisi';
    if (!role) newErrors.role = 'Role wajib dipilih';

    if (!password.trim()) newErrors.password = 'Kata sandi wajib diisi';
    else if (password.length < 6) newErrors.password = 'Kata sandi minimal 6 karakter';

    if (!noTelp.trim()) newErrors.noTelp = 'No. telepon wajib diisi';
    else if (!/^\d+$/.test(noTelp)) newErrors.noTelp = 'No. telepon hanya boleh angka';
    else if (noTelp.length < 10 || noTelp.length > 13) newErrors.noTelp = 'No. telepon harus 10-13 digit';

    if (role === 'Wali Kelas' && !waliKelasDari.trim()) {
      newErrors.waliKelasDari = 'Wali kelas dari wajib diisi untuk role Wali Kelas';
    }

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
          password: password.trim(),
          noTelp: noTelp.trim(),
          waliKelasDari: waliKelasDari.trim(),
        });
        handleReset();
        setIsSubmitting(false);
      }, 400);
    }
  };

  const handleKodeGuruChange = (value: string) => {
    console.log('handleKodeGuruChange called with:', value);
    if (/^\d*$/.test(value) && value.length <= 10) {
      setKodeGuru(value);
      if (errors.kodeGuru) setErrors({ ...errors, kodeGuru: undefined });
    }
  };

  const inputStyle = (hasError?: boolean): React.CSSProperties => ({
    width: '100%',
    padding: '12px 14px',
    border: `1px solid ${hasError ? '#ef4444' : '#cbd5e1'} `,
    borderRadius: '10px',
    fontSize: '14px',
    outline: 'none',
    boxSizing: 'border-box',
    backgroundColor: '#ffffff',
    color: '#0f172a',
    transition: 'border-color 0.2s, box-shadow 0.2s',
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

        <div>
          <label htmlFor="kodeGuru" style={labelStyle}>Kode Guru (NIP)</label>
          <input
            id="kodeGuru"
            type="text"
            placeholder="Masukkan kode guru"
            value={kodeGuru}
            onChange={(e) => handleKodeGuruChange(e.target.value)}
            maxLength={10}
            style={inputStyle(!!errors.kodeGuru)}
            disabled={isSubmitting}
          />
          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '6px' }}>
            {errors.kodeGuru ? (
              <p style={errorStyle}>{errors.kodeGuru}</p>
            ) : (
              <span style={{ fontSize: '12px', color: '#6b7280' }}>Hanya angka, 10 digit</span>
            )}
            <span style={{ fontSize: '12px', color: '#6b7280' }}>{kodeGuru.length}/10</span>
          </div>
        </div>

        <div>
          <label htmlFor="role" style={labelStyle}>Role</label>
          <select
            id="role"
            value={role}
            onChange={(e) => {
              setRole(e.target.value);
              if (errors.role) setErrors({ ...errors, role: undefined });
            }}
            style={inputStyle(!!errors.role)}
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

        <div>
          <label htmlFor="mataPelajaran" style={labelStyle}>Mata Pelajaran</label>
          <select
            id="mataPelajaran"
            value={mataPelajaran}
            onChange={(e) => {
              setMataPelajaran(e.target.value);
              if (errors.mataPelajaran) setErrors({ ...errors, mataPelajaran: undefined });
            }}
            style={inputStyle(!!errors.mataPelajaran)}
            disabled={isSubmitting}
          >
            <option value="">Pilih Mata Pelajaran</option>
            <option value="Matematika">Matematika</option>
            <option value="Bahasa Indonesia">Bahasa Indonesia</option>
            <option value="Bahasa Inggris">Bahasa Inggris</option>
            <option value="Fisika">Fisika</option>
            <option value="Kimia">Kimia</option>
            <option value="Biologi">Biologi</option>
            <option value="Sejarah">Sejarah</option>
            <option value="Geografi">Geografi</option>
            <option value="Ekonomi">Ekonomi</option>
            <option value="Sosiologi">Sosiologi</option>
            <option value="Seni Budaya">Seni Budaya</option>
            <option value="Penjasorkes">Penjasorkes</option>
            <option value="PKn">PKn</option>
            <option value="Agama">Agama</option>
            <option value="Informatika">Informatika</option>
            <option value="IPAS">IPAS</option>
            <option value="Dasar Program Keahlian">Dasar Program Keahlian</option>
          </select>
          {errors.mataPelajaran && <p style={errorStyle}>{errors.mataPelajaran}</p>}
        </div>

        <div>
          <label htmlFor="password" style={labelStyle}>Kata Sandi</label>
          <input
            id="password"
            type="text"
            placeholder="Masukkan kata sandi"
            value={password}
            onChange={(e) => {
              setPassword(e.target.value);
              if (errors.password) setErrors({ ...errors, password: undefined });
            }}
            style={inputStyle(!!errors.password)}
            disabled={isSubmitting}
          />
          {errors.password && <p style={errorStyle}>{errors.password}</p>}
        </div>

        <div>
          <label htmlFor="noTelp" style={labelStyle}>No Telepon</label>
          <input
            id="noTelp"
            type="text"
            placeholder="Masukkan nomor telepon"
            value={noTelp}
            onChange={(e) => {
              // Allow only numbers
              if (/^\d*$/.test(e.target.value)) {
                setNoTelp(e.target.value);
                if (errors.noTelp) setErrors({ ...errors, noTelp: undefined });
              }
            }}
            style={inputStyle(!!errors.noTelp)}
            disabled={isSubmitting}
            maxLength={13}
          />
          {errors.noTelp && <p style={errorStyle}>{errors.noTelp}</p>}
        </div>
      </div>
    </FormModal>
  );
}
