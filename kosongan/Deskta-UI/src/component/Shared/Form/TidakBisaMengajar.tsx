import { useEffect, useState, useRef } from 'react';
import { Modal } from '../Modal';
import EditIcon from '../../../assets/Icon/Edit.png';

interface TidakBisaMengajarData {
  subject: string;
  className: string;
  jurusan?: string;
  jam?: string;
}

interface TidakBisaMengajarProps {
  isOpen: boolean;
  onClose: () => void;
  data: TidakBisaMengajarData | null;
  onSubmit?: (data: { alasan: string; keterangan?: string; foto1?: File }) => void;
  onPilihMetode?: () => void; // Tambahkan prop baru
}

const ALASAN_OPTIONS = [
  'Sakit',
  'Izin',
  'Keperluan Keluarga',
  'Keperluan Pribadi',
  'Lainnya',
];

export function TidakBisaMengajar({
  isOpen,
  onClose,
  data,
  onSubmit,
  onPilihMetode, // Tambahkan prop ini
}: TidakBisaMengajarProps) {
  const [alasan, setAlasan] = useState('');
  const [keterangan, setKeterangan] = useState('');
  const [foto1, setFoto1] = useState<File | null>(null);
  const [preview1, setPreview1] = useState<string | null>(null);
  const [errors, setErrors] = useState<{ alasan?: string }>({});
  const fileInput1Ref = useRef<HTMLInputElement>(null);



  const handleFileChange = (
    file: File | null,
    setFile: (file: File | null) => void,
    setPreview: (preview: string | null) => void
  ) => {
    if (file) {
      setFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    } else {
      setFile(null);
      setPreview(null);
    }
  };

  const handleFileInputChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    setFile: (file: File | null) => void,
    setPreview: (preview: string | null) => void
  ) => {
    const file = e.target.files?.[0] || null;
    handleFileChange(file, setFile, setPreview);
  };

  const handleRemoveFile = (
    setFile: (file: File | null) => void,
    setPreview: (preview: string | null) => void,
    inputRef: React.RefObject<HTMLInputElement | null>
  ) => {
    setFile(null);
    setPreview(null);
    if (inputRef.current) {
      inputRef.current.value = '';
    }
  };

  const resetForm = () => {
    setAlasan('');
    setKeterangan('');
    setFoto1(null);
    setPreview1(null);
    setErrors({});
    if (fileInput1Ref.current) {
      fileInput1Ref.current.value = '';
    }
  };

  const handleSubmit = () => {
    const newErrors: { alasan?: string } = {};

    if (!alasan) {
      newErrors.alasan = 'Alasan harus dipilih';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    if (onSubmit) {
      onSubmit({
        alasan,
        keterangan: keterangan || undefined,
        foto1: foto1 || undefined,
      });
    }

    // Reset form
    resetForm();
    onClose();
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const handlePilihMetodeClick = () => {
    handleClose();
    onPilihMetode?.();
  };

  useEffect(() => {
    if (!isOpen) {
      resetForm();
    }
  }, [isOpen]);

  if (!data) return null;

  return (
    <Modal isOpen={isOpen} onClose={handleClose}>
      <div
        style={{
          border: '3px solid #1e40af',
          borderRadius: '16px',
          overflow: 'hidden',
        }}
      >
        {/* Header */}
        <div
          style={{
            backgroundColor: '#0f172a',
            color: 'white',
            padding: '16px 24px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div
              style={{
                width: '32px',
                height: '32px',
                borderRadius: '8px',
                backgroundColor: '#7C3AED',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <img
                src={EditIcon}
                alt="Edit"
                style={{
                  width: '18px',
                  height: '18px',
                  objectFit: 'contain',
                  filter: 'brightness(0) invert(1)',
                }}
              />
            </div>
            <h2 style={{ fontSize: '18px', fontWeight: 'bold', margin: 0 }}>
              Tidak bisa mengajar
            </h2>
          </div>
          <div style={{ fontSize: '14px', fontWeight: '500' }}>
            {data.subject} {data.className}
          </div>
        </div>

        {/* Content */}
        <div style={{ padding: '24px', backgroundColor: 'white' }}>
          {/* Keterangan Section */}
          <div style={{ marginBottom: '24px' }}>
            <h3
              style={{
                fontSize: '16px',
                fontWeight: 'bold',
                color: '#111827',
                marginBottom: '12px',
              }}
            >
              Keterangan
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <InfoRow label="Mata Pelajaran" value={data.subject} />
              <InfoRow
                label="Kelas/Jurusan"
                value={data.jurusan || data.className || '-'}
              />
              <InfoRow label="Jam ke-" value={data.jam || '-'} />
            </div>
          </div>

          {/* Alasan Section */}
          <div style={{ marginBottom: '16px' }}>
            <label
              htmlFor="alasan"
              style={{
                display: 'block',
                fontSize: '16px',
                fontWeight: 'bold',
                color: '#111827',
                marginBottom: '8px',
              }}
            >
              Alasan
            </label>
            <select
              id="alasan"
              value={alasan}
              onChange={(e) => {
                setAlasan(e.target.value);
                if (errors.alasan) {
                  setErrors({ ...errors, alasan: undefined });
                }
              }}
              style={{
                width: '100%',
                padding: '12px',
                border: errors.alasan ? '2px solid #ef4444' : '2px solid #cbd5e1',
                borderRadius: '10px',
                fontSize: '14px',
                backgroundColor: 'white',
                color: '#111827',
                fontWeight: '500',
                cursor: 'pointer',
              }}
            >
              <option value="">Pilih alasan ketidakhadiran</option>
              {ALASAN_OPTIONS.map((option, idx) => (
                <option key={`${option}-${idx}`} value={option}>
                  {option}
                </option>
              ))}
            </select>
            {errors.alasan && (
              <p
                style={{
                  color: '#ef4444',
                  fontSize: '12px',
                  marginTop: '6px',
                  marginBottom: 0,
                }}
              >
                {errors.alasan}
              </p>
            )}
          </div>

          {/* Field Keterangan Tambahan */}
          <div style={{ marginBottom: '24px' }}>
            <label
              htmlFor="keterangan"
              style={{
                display: 'block',
                fontSize: '16px',
                fontWeight: 'bold',
                color: '#111827',
                marginBottom: '8px',
              }}
            >
              Keterangan Tambahan (opsional)
            </label>
            <textarea
              id="keterangan"
              value={keterangan}
              onChange={(e) => setKeterangan(e.target.value)}
              placeholder="Tambahkan keterangan jika perlu"
              rows={3}
              style={{
                width: '100%',
                padding: '12px',
                border: '2px solid #cbd5e1',
                borderRadius: '10px',
                fontSize: '14px',
                backgroundColor: 'white',
                color: '#111827',
                resize: 'vertical',
              }}
            />
          </div>

          {/* Upload Foto Section (opsional, satu file) */}
          <div>
            <label
              style={{
                display: 'block',
                fontSize: '16px',
                fontWeight: 'bold',
                color: '#111827',
                marginBottom: '12px',
              }}
            >
              Upload Foto (opsional)
            </label>
            <input
              ref={fileInput1Ref}
              type="file"
              accept="image/*"
              onChange={(e) => handleFileInputChange(e, setFoto1, setPreview1)}
              style={{ display: 'none' }}
            />
            {preview1 ? (
              <div
                style={{
                  position: 'relative',
                  width: '100%',
                  aspectRatio: '1',
                  borderRadius: '12px',
                  overflow: 'hidden',
                  border: '2px solid #cbd5e1',
                }}
              >
                <img
                  src={preview1}
                  alt="Preview"
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />
                <button
                  type="button"
                  onClick={() => handleRemoveFile(setFoto1, setPreview1, fileInput1Ref)}
                  style={{
                    position: 'absolute',
                    top: '8px',
                    right: '8px',
                    width: '28px',
                    height: '28px',
                    borderRadius: '50%',
                    backgroundColor: '#ef4444',
                    color: 'white',
                    border: 'none',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '16px',
                    fontWeight: 'bold',
                  }}
                >
                  ×
                </button>
              </div>
            ) : (
              <div
                onClick={() => fileInput1Ref.current?.click()}
                style={{
                  width: '100%',
                  aspectRatio: '1',
                  border: '2px dashed #cbd5e1',
                  borderRadius: '12px',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  cursor: 'pointer',
                  backgroundColor: '#F9FAFB',
                  transition: 'all 0.2s',
                }}
                onMouseEnter={(e) => {
                  (e.currentTarget as HTMLDivElement).style.backgroundColor = '#F3F4F6';
                  (e.currentTarget as HTMLDivElement).style.borderColor = '#9CA3AF';
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLDivElement).style.backgroundColor = '#F9FAFB';
                  (e.currentTarget as HTMLDivElement).style.borderColor = '#cbd5e1';
                }}
              >
                <CloudIcon />
                <span style={{ fontSize: '14px', color: '#6B7280', fontWeight: '500' }}>
                  Upload File
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Footer Buttons */}
        <div
          style={{
            padding: '16px 24px',
            backgroundColor: 'white',
            display: 'flex',
            gap: '12px',
            justifyContent: 'center',
            flexDirection: 'column',
          }}
        >
          {/* Tombol Batalkan dan Kirim */}
          <div style={{ display: 'flex', gap: '12px' }}>
            <button
              type="button"
              onClick={handleClose}
              style={{
                flex: 1,
                padding: '12px 24px',
                borderRadius: '8px',
                border: '2px solid #1e40af',
                backgroundColor: 'white',
                color: '#1e40af',
                fontWeight: '600',
                cursor: 'pointer',
                fontSize: '16px',
                transition: 'background-color 0.2s',
              }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLButtonElement).style.backgroundColor = '#EFF6FF';
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLButtonElement).style.backgroundColor = 'white';
              }}
            >
              Batalkan
            </button>
            <button
              type="button"
              onClick={handleSubmit}
              style={{
                flex: 1,
                padding: '12px 24px',
                borderRadius: '8px',
                border: 'none',
                backgroundColor: '#10B981',
                color: 'white',
                fontWeight: '600',
                cursor: 'pointer',
                fontSize: '16px',
                transition: 'background-color 0.2s',
              }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLButtonElement).style.backgroundColor = '#059669';
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLButtonElement).style.backgroundColor = '#10B981';
              }}
            >
              Kirim
            </button>
          </div>

          {/* Tombol Pilih Metode (diposisikan di bawah Kirim) */}
          {onPilihMetode && (
            <button
              type="button"
              onClick={handlePilihMetodeClick}
              style={{
                width: '100%',
                padding: '12px 24px',
                borderRadius: '8px',
                border: 'none',
                backgroundColor: '#1e40af',
                color: 'white',
                fontWeight: '600',
                cursor: 'pointer',
                fontSize: '16px',
                transition: 'background-color 0.2s',
              }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLButtonElement).style.backgroundColor = '#1e3a8a';
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLButtonElement).style.backgroundColor = '#1e40af';
              }}
            >
              Pilih Metode Absen
            </button>
          )}
        </div>
      </div>
    </Modal>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div
      style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        gap: '12px',
        background: '#F1F5F9',
        borderRadius: '8px',
        padding: '12px 16px',
        border: '1px solid #E2E8F0',
      }}
    >
      <span style={{ fontWeight: '600', color: '#0f172a', fontSize: '14px' }}>
        {label}
      </span>
      <span style={{ color: '#0f172a', fontSize: '14px', fontWeight: '500' }}>
        {value}
      </span>
    </div>
  );
}

function CloudIcon() {
  return (
    <svg
      width="32"
      height="32"
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M7 18C4.23858 18 2 15.7614 2 13C2 10.2386 4.23858 8 7 8C7.33962 6.00356 8.99294 4.5 11 4.5C13.0071 4.5 14.6604 6.00356 15 8C17.7614 8 20 10.2386 20 13C20 15.7614 17.7614 18 15 18H7Z"
        stroke="#9CA3AF"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M12 11V15M12 15L10 13M12 15L14 13"
        stroke="#9CA3AF"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
