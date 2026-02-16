// src/component/Shared/Form/JurusanForm.tsx
import { useState, useEffect } from 'react';
import { FormModal } from '../FormModal';

interface JurusanFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: { namaJurusan: string; kodeJurusan: string }) => void;
  initialData?: { namaJurusan: string; kodeJurusan: string };
  isEdit?: boolean;
  isLoading?: boolean;
}

export function JurusanForm({
  isOpen,
  onClose,
  onSubmit,
  initialData,
  isEdit = false,
  isLoading = false,
}: JurusanFormProps) {
  const [kodeJurusan, setKodeJurusan] = useState('');
  const [namaJurusan, setNamaJurusan] = useState('');
  const [errors, setErrors] = useState<{ namaJurusan?: string; kodeJurusan?: string }>({});

  // Reset form ketika modal dibuka/ditutup atau initialData berubah
  useEffect(() => {
    if (isOpen) {
      if (initialData && isEdit) {
        // Mode ubah: isi dengan data yang ada
        setKodeJurusan(initialData.kodeJurusan || '');
        setNamaJurusan(initialData.namaJurusan || '');
      } else {
        // Mode tambah: kosongkan form
        setKodeJurusan('');
        setNamaJurusan('');
      }
      setErrors({});
    }
  }, [isOpen, initialData, isEdit]);

  // Sinkronkan state dengan initialData saat berubah
  useEffect(() => {
    if (initialData && isEdit && isOpen) {
      setKodeJurusan(initialData.kodeJurusan || '');
      setNamaJurusan(initialData.namaJurusan || '');
    }
  }, [initialData, isEdit, isOpen]);

  const handleReset = () => {
    if (initialData && isEdit) {
      // Reset ke data awal (untuk mode ubah)
      setKodeJurusan(initialData.kodeJurusan || '');
      setNamaJurusan(initialData.namaJurusan || '');
    } else {
      // Kosongkan form (untuk mode tambah)
      setKodeJurusan('');
      setNamaJurusan('');
    }
    setErrors({});
  };

  const handleClose = () => {
    handleReset();
    onClose();
  };

  const validate = (): boolean => {
    const newErrors: { namaJurusan?: string; kodeJurusan?: string } = {};

    if (!kodeJurusan.trim()) {
      newErrors.kodeJurusan = 'Kode konsentrasi keahlian wajib diisi';
    }

    if (!namaJurusan.trim()) {
      newErrors.namaJurusan = 'Konsentrasi keahlian wajib diisi';
    } else if (namaJurusan.trim().length < 2) {
      newErrors.namaJurusan = 'Minimal 2 karakter';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = () => {
    if (!validate()) return;

    onSubmit({
      kodeJurusan: kodeJurusan.trim().toUpperCase(),
      namaJurusan: namaJurusan.trim(),
    });
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
    fontWeight: 700,
    fontSize: '14px',
    marginBottom: '8px',
    display: 'block',
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
      title={isEdit ? 'Ubah Konsentrasi Keahlian' : 'Tambah Konsentrasi Keahlian'}
      onSubmit={handleSubmit}
      submitLabel={isEdit ? 'Simpan Perubahan' : 'Tambahkan'}
      isSubmitting={isLoading}
      onReset={isEdit ? handleReset : undefined}
      resetLabel={isEdit ? 'Reset' : undefined}
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
        {/* Nama Konsentrasi Keahlian */}
        <div>
          <label style={labelStyle}>
            Nama Konsentrasi Keahlian
          </label>
          <input
            type="text"
            placeholder="Masukan nama konsentrasi keahlian"
            value={namaJurusan}
            onChange={(e) => {
              setNamaJurusan(e.target.value);
              if (errors.namaJurusan) setErrors({ ...errors, namaJurusan: undefined });
            }}
            style={inputStyle(!!errors.namaJurusan)}
            disabled={isLoading}
          />
          {errors.namaJurusan && <p style={errorStyle}>{errors.namaJurusan}</p>}
        </div>

        {/* Kode Konsentrasi Keahlian */}
        <div>
          <label style={labelStyle}>
            Kode Konsentrasi Keahlian
          </label>
          <input
            type="text"
            placeholder="Masukan kode konsentrasi keahlian"
            value={kodeJurusan}
            onChange={(e) => {
              const value = e.target.value.toUpperCase();
              // Hanya izinkan huruf dan angka
              if (/^[A-Z0-9]*$/.test(value)) {
                setKodeJurusan(value);
                if (errors.kodeJurusan) setErrors({ ...errors, kodeJurusan: undefined });
              }
            }}
            maxLength={10}
            style={inputStyle(!!errors.kodeJurusan)}
            disabled={isLoading}
          />
          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '6px' }}>
            {errors.kodeJurusan ? (
              <p style={errorStyle}>{errors.kodeJurusan}</p>
            ) : (
              <span style={{ fontSize: '12px', color: '#6b7280' }}>Huruf dan angka saja, maks. 10 karakter</span>
            )}
            <span style={{ fontSize: '12px', color: '#6b7280' }}>{kodeJurusan.length}/10</span>
          </div>
        </div>
      </div>
    </FormModal>
  );
}