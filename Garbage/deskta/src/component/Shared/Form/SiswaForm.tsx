import { useState, useEffect } from 'react';
import { FormModal } from '../FormModal';

interface SiswaFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: {
    namaSiswa: string;
    nisn: string;
    jurusanId: string;
    kelasId: string;
  }) => void;
  initialData?: {
    namaSiswa: string;
    nisn: string;
    jurusanId: string;
    kelasId: string;
  };
  isEdit?: boolean;
  isLoading?: boolean;
  jurusanList?: { id: string; nama: string }[];
  kelasList?: { id: string; nama: string }[];
}

export function SiswaForm({
  isOpen,
  onClose,
  onSubmit,
  initialData,
  isEdit = false,
  isLoading = false,
  jurusanList = [],
  kelasList = [],
}: SiswaFormProps) {
  const [namaSiswa, setNamaSiswa] = useState('');
  const [nisn, setNisn] = useState('');
  const [jurusanId, setJurusanId] = useState('');
  const [kelasId, setKelasId] = useState('');
  const [errors, setErrors] = useState<{
    namaSiswa?: string;
    nisn?: string;
    jurusanId?: string;
    kelasId?: string;
  }>({});

  // Reset form ketika modal dibuka/ditutup
  useEffect(() => {
    if (isOpen) {
      if (initialData && isEdit) {
        // Mode ubah: isi dengan data yang ada
        console.log('Mode ubah, mengisi data:', initialData);
        setNamaSiswa(initialData.namaSiswa || '');
        setNisn(initialData.nisn || '');
        setJurusanId(initialData.jurusanId || '');
        setKelasId(initialData.kelasId || '');
      } else {
        // Mode tambah: kosongkan form
        console.log('Mode tambah, mengosongkan form');
        setNamaSiswa('');
        setNisn('');
        setJurusanId('');
        setKelasId('');
      }
      setErrors({});
    }
  }, [isOpen, initialData, isEdit]);

  // Sinkronkan state dengan initialData saat berubah (untuk berjaga-jaga)
  useEffect(() => {
    if (initialData && isEdit && isOpen) {
      console.log('Data berubah, update form:', initialData);
      setNamaSiswa(initialData.namaSiswa || '');
      setNisn(initialData.nisn || '');
      setJurusanId(initialData.jurusanId || '');
      setKelasId(initialData.kelasId || '');
    }
  }, [initialData, isEdit, isOpen]);

  const handleReset = () => {
    if (initialData && isEdit) {
      // Reset ke data awal (untuk mode ubah)
      setNamaSiswa(initialData.namaSiswa || '');
      setNisn(initialData.nisn || '');
      setJurusanId(initialData.jurusanId || '');
      setKelasId(initialData.kelasId || '');
    } else {
      // Kosongkan form (untuk mode tambah)
      setNamaSiswa('');
      setNisn('');
      setJurusanId('');
      setKelasId('');
    }
    setErrors({});
  };

  const handleClose = () => {
    handleReset();
    onClose();
  };

  const validate = (): boolean => {
    const newErrors: {
      namaSiswa?: string;
      nisn?: string;
      jurusanId?: string;
      kelasId?: string;
    } = {};

    if (!namaSiswa.trim()) {
      newErrors.namaSiswa = 'Nama siswa wajib diisi';
    } else if (namaSiswa.trim().length < 3) {
      newErrors.namaSiswa = 'Nama siswa minimal 3 karakter';
    }

    if (!nisn.trim()) {
      newErrors.nisn = 'NISN wajib diisi';
    } else if (!/^\d+$/.test(nisn)) {
      newErrors.nisn = 'NISN hanya boleh angka';
    } else if (nisn.length !== 10) {
      newErrors.nisn = 'NISN harus 10 digit';
    }

    if (!jurusanId) newErrors.jurusanId = 'Jurusan wajib dipilih';
    if (!kelasId) newErrors.kelasId = 'Kelas wajib dipilih';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = () => {
    if (!validate()) return;

    onSubmit({
      namaSiswa: namaSiswa.trim(),
      nisn: nisn.trim(),
      jurusanId,
      kelasId,
    });
  };

  const handleNisnChange = (value: string) => {
    if (/^\d*$/.test(value) && value.length <= 10) {
      setNisn(value);
      if (errors.nisn) setErrors({ ...errors, nisn: undefined });
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
      title={isEdit ? 'Ubah Data Siswa' : 'Tambah Siswa'}
      onSubmit={handleSubmit}
      submitLabel={isEdit ? 'Simpan Perubahan' : 'Tambahkan'}
      isSubmitting={isLoading}
      onReset={handleReset}
      resetLabel="Reset"
      contentStyle={{
        minHeight: '400px',
      }}
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
        {/* Nama Siswa */}
        <div>
          <label htmlFor="namaSiswa" style={labelStyle}>
            Nama Siswa
          </label>
          <input
            id="namaSiswa"
            type="text"
            placeholder="Masukkan Nama Siswa"
            value={namaSiswa}
            onChange={(e) => {
              setNamaSiswa(e.target.value);
              if (errors.namaSiswa) setErrors({ ...errors, namaSiswa: undefined });
            }}
            style={inputStyle(!!errors.namaSiswa)}
            disabled={isLoading}
          />
          {errors.namaSiswa && <p style={errorStyle}>{errors.namaSiswa}</p>}
        </div>

        {/* NISN */}
        <div>
          <label htmlFor="nisn" style={labelStyle}>
            NISN
          </label>
          <input
            id="nisn"
            type="text"
            placeholder="Masukkan NISN"
            value={nisn}
            onChange={(e) => handleNisnChange(e.target.value)}
            maxLength={10}
            style={inputStyle(!!errors.nisn)}
            disabled={isLoading}
          />
          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '6px' }}>
            {errors.nisn ? (
              <p style={errorStyle}>{errors.nisn}</p>
            ) : (
              <span style={{ fontSize: '12px', color: '#6b7280' }}>Hanya angka, 10 digit</span>
            )}
            <span style={{ fontSize: '12px', color: '#6b7280' }}>{nisn.length}/10</span>
          </div>
        </div>

        {/* Jurusan */}
        <div>
          <label htmlFor="jurusan" style={labelStyle}>
            Konsentrasi Keahlian
          </label>
          <select
            id="jurusan"
            value={jurusanId}
            onChange={(e) => {
              setJurusanId(e.target.value);
              if (errors.jurusanId) setErrors({ ...errors, jurusanId: undefined });
            }}
            style={inputStyle(!!errors.jurusanId)}
            disabled={isLoading}
          >
            <option value="">Pilih Konsentrasi Keahlian</option>
            {jurusanList.map((jurusan) => (
              <option key={jurusan.id} value={jurusan.id}>
                {jurusan.nama}
              </option>
            ))}
          </select>
          {errors.jurusanId && <p style={errorStyle}>{errors.jurusanId}</p>}
        </div>

        {/* Kelas */}
        <div>
          <label htmlFor="kelas" style={labelStyle}>
            Kelas
          </label>
          <select
            id="kelas"
            value={kelasId}
            onChange={(e) => {
              setKelasId(e.target.value);
              if (errors.kelasId) setErrors({ ...errors, kelasId: undefined });
            }}
            style={inputStyle(!!errors.kelasId)}
            disabled={isLoading}
          >
            <option value="">Pilih Kelas</option>
            {kelasList.map((kelas) => (
              <option key={kelas.id} value={kelas.id}>
                {kelas.nama}
              </option>
            ))}
          </select>
          {errors.kelasId && <p style={errorStyle}>{errors.kelasId}</p>}
        </div>
      </div>
    </FormModal>
  );
}