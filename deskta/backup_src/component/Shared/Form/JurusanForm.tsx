// src/component/Shared/Form/JurusanForm.tsx
import { useState } from 'react';
import { FormModal } from '../../Shared/FormModal';

interface TambahJurusanFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: { namaJurusan: string; kodeJurusan: string }) => void;
  initialData?: { namaJurusan: string; kodeJurusan: string };
  isEdit?: boolean;
}

export function TambahJurusanForm({
  isOpen,
  onClose,
  onSubmit,
  initialData,
  isEdit = false,
}: TambahJurusanFormProps) {
  const [kodeJurusan, setKodeJurusan] = useState(initialData?.kodeJurusan || '');
  const [namaJurusan, setNamaJurusan] = useState(initialData?.namaJurusan || '');
  const [errors, setErrors] = useState<{ namaJurusan?: string; kodeJurusan?: string }>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleReset = () => {
    setKodeJurusan(initialData?.kodeJurusan || '');
    setNamaJurusan(initialData?.namaJurusan || '');
    setErrors({});
    setIsSubmitting(false);
  };

  const handleClose = () => {
    handleReset();
    onClose();
  };

  const validate = (): boolean => {
    const newErrors: { namaJurusan?: string; kodeJurusan?: string } = {};

    if (!kodeJurusan.trim()) {
      newErrors.kodeJurusan = 'Kode jurusan wajib diisi';
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
    if (validate()) {
      setIsSubmitting(true);
      setTimeout(() => {
        onSubmit({
          kodeJurusan: kodeJurusan.trim(),
          namaJurusan: namaJurusan.trim(),
        });
        handleReset();
        setIsSubmitting(false);
      }, 500);
    }
  };

  return (
    <FormModal
      isOpen={isOpen}
      onClose={handleClose}
      title={isEdit ? 'Edit Jurusan' : 'Tambah Jurusan'}
      onSubmit={handleSubmit}
      submitLabel={isEdit ? 'Simpan' : 'Tambahkan'}
      isSubmitting={isSubmitting}
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
        {/* Konsentrasi Keahlian */}
        <div>
          <label
            style={{
              fontWeight: 700,
              fontSize: '14px',
              marginBottom: '8px',
              display: 'block',
              color: '#0B2948',
            }}
          >
            Konsentrasi Keahlian
          </label>
          <input
            type="text"
            placeholder="Masukan nama"
            value={namaJurusan}
            onChange={(e) => {
              setNamaJurusan(e.target.value);
              if (errors.namaJurusan) setErrors({ ...errors, namaJurusan: undefined });
            }}
            style={{
              width: '100%',
              padding: '10px 12px',
              border: `1px solid ${errors.namaJurusan ? '#ef4444' : '#d1d5db'}`,
              borderRadius: '8px',
            }}
            disabled={isSubmitting}
          />
          {errors.namaJurusan && (
            <p style={{ color: '#ef4444', fontSize: '12px', marginTop: '4px' }}>
              {errors.namaJurusan}
            </p>
          )}
        </div>

        {/* Kode Jurusan */}
        <div>
          <label
            style={{
              fontWeight: 700,
              fontSize: '14px',
              marginBottom: '8px',
              display: 'block',
              color: '#0B2948',
            }}
          >
            Kode Jurusan
          </label>
          <input
            type="text"
            placeholder="Masukan kode jurusan"
            value={kodeJurusan}
            onChange={(e) => {
              setKodeJurusan(e.target.value.toUpperCase());
              if (errors.kodeJurusan) setErrors({ ...errors, kodeJurusan: undefined });
            }}
            style={{
              width: '100%',
              padding: '10px 12px',
              border: `1px solid ${errors.kodeJurusan ? '#ef4444' : '#d1d5db'}`,
              borderRadius: '8px',
            }}
            disabled={isSubmitting}
          />
          {errors.kodeJurusan && (
            <p style={{ color: '#ef4444', fontSize: '12px', marginTop: '4px' }}>
              {errors.kodeJurusan}
            </p>
          )}
        </div>
      </div>
    </FormModal>
  );
}
