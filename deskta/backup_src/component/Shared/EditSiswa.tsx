import { useState } from "react";
import { FormModal } from "./FormModal";
import { Select } from "./Select";

interface EditSiswaFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: {
    jenisKelamin: string;
    noTelp: string;
    jurusanId: string;
    tahunAngkatan: string;
    kelasId: string;
  }) => void;
  initialData: {
    jenisKelamin: string;
    noTelp: string;
    jurusanId: string;
    tahunAngkatan: string;
    kelasId: string;
  };
  jurusanList?: { id: string; nama: string }[];
  kelasList?: { id: string; nama: string }[];
}

export function EditSiswaForm({
  isOpen,
  onClose,
  onSubmit,
  initialData,
  jurusanList = [],
  kelasList = [],
}: EditSiswaFormProps) {
  const [jenisKelamin, setJenisKelamin] = useState(initialData.jenisKelamin);
  const [noTelp, setNoTelp] = useState(initialData.noTelp);
  const [jurusanId, setJurusanId] = useState(initialData.jurusanId);
  const [tahunAngkatan, setTahunAngkatan] = useState(initialData.tahunAngkatan);
  const [kelasId, setKelasId] = useState(initialData.kelasId);
  const [errors, setErrors] = useState<{
    jenisKelamin?: string;
    noTelp?: string;
    jurusanId?: string;
    tahunAngkatan?: string;
    kelasId?: string;
  }>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleReset = () => {
    setJenisKelamin(initialData.jenisKelamin);
    setNoTelp(initialData.noTelp);
    setJurusanId(initialData.jurusanId);
    setTahunAngkatan(initialData.tahunAngkatan);
    setKelasId(initialData.kelasId);
    setErrors({});
    setIsSubmitting(false);
  };

  const handleClose = () => {
    handleReset();
    onClose();
  };

  const validate = (): boolean => {
    const newErrors: typeof errors = {};

    if (!jenisKelamin.trim()) {
      newErrors.jenisKelamin = "Jenis kelamin harus diisi";
    }
    if (!noTelp.trim()) {
      newErrors.noTelp = "No. Telp harus diisi";
    } else if (!/^\d{10,13}$/.test(noTelp.trim())) {
      newErrors.noTelp = "No. Telp harus 10-13 digit angka";
    }
    if (!jurusanId) {
      newErrors.jurusanId = "Jurusan harus dipilih";
    }
    if (!tahunAngkatan.trim()) {
      newErrors.tahunAngkatan = "Tahun angkatan harus diisi";
    }
    if (!kelasId) {
      newErrors.kelasId = "Kelas harus dipilih";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = () => {
    if (validate()) {
      setIsSubmitting(true);
      setTimeout(() => {
        onSubmit({
          jenisKelamin: jenisKelamin.trim(),
          noTelp: noTelp.trim(),
          jurusanId: jurusanId.trim(),
          tahunAngkatan: tahunAngkatan.trim(),
          kelasId: kelasId.trim(),
        });
        handleReset();
        setIsSubmitting(false);
      }, 500);
    }
  };

  const handleNoTelpChange = (value: string) => {
    if (/^\d*$/.test(value) && value.length <= 13) {
      setNoTelp(value);
      if (errors.noTelp) {
        setErrors({ ...errors, noTelp: undefined });
      }
    }
  };

  const jenisKelaminOptions = [
    { label: "Laki-Laki", value: "Laki-Laki" },
    { label: "Perempuan", value: "Perempuan" },
  ];

  const jurusanOptions = jurusanList.map((j) => ({
    label: j.nama,
    value: j.id,
  }));

  const kelasOptions = kelasList.map((k) => ({
    label: k.nama,
    value: k.id,
  }));

  const inputStyle = (hasError: boolean): React.CSSProperties => ({
    width: "100%",
    padding: "10px 12px",
    border: `1px solid ${hasError ? "#ef4444" : "#d1d5db"}`,
    borderRadius: "8px",
    fontSize: "14px",
    outline: "none",
    boxSizing: "border-box",
  });

  const labelStyle: React.CSSProperties = {
    display: "block",
    fontWeight: "600",
    fontSize: "14px",
    marginBottom: "8px",
    color: "#1f2937",
  };

  const errorStyle: React.CSSProperties = {
    color: "#ef4444",
    fontSize: "12px",
    marginTop: "4px",
    margin: "4px 0 0 0",
  };

  return (
    <FormModal
      isOpen={isOpen}
      onClose={handleClose}
      title="Edit Data Siswa"
      onSubmit={handleSubmit}
      submitLabel="Simpan"
      isSubmitting={isSubmitting}
    >
      <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
        {/* Jenis Kelamin */}
        <div>
          <label style={labelStyle}>Jenis Kelamin</label>
          <Select
            value={jenisKelamin}
            onChange={setJenisKelamin}
            options={jenisKelaminOptions}
            placeholder="Pilih jenis kelamin"
          />
          {errors.jenisKelamin && (
            <p style={errorStyle}>{errors.jenisKelamin}</p>
          )}
        </div>

        {/* No. Telp */}
        <div>
          <label htmlFor="noTelp" style={labelStyle}>
            No. Telp
          </label>
          <input
            id="noTelp"
            type="text"
            placeholder="Masukkan no. telp (10-13 digit)"
            value={noTelp}
            onChange={(e) => handleNoTelpChange(e.target.value)}
            style={inputStyle(!!errors.noTelp)}
            disabled={isSubmitting}
          />
          {errors.noTelp && <p style={errorStyle}>{errors.noTelp}</p>}
        </div>

        {/* Jurusan */}
        <div>
          <label style={labelStyle}>Jurusan</label>
          <Select
            value={jurusanId}
            onChange={setJurusanId}
            options={jurusanOptions}
            placeholder="Pilih jurusan"
          />
          {errors.jurusanId && <p style={errorStyle}>{errors.jurusanId}</p>}
        </div>

        {/* Tahun Angkatan */}
        <div>
          <label htmlFor="tahunAngkatan" style={labelStyle}>
            Tahun Angkatan
          </label>
          <input
            id="tahunAngkatan"
            type="text"
            placeholder="Contoh: 2023 - 2026"
            value={tahunAngkatan}
            onChange={(e) => {
              setTahunAngkatan(e.target.value);
              if (errors.tahunAngkatan) {
                setErrors({ ...errors, tahunAngkatan: undefined });
              }
            }}
            style={inputStyle(!!errors.tahunAngkatan)}
            disabled={isSubmitting}
          />
          {errors.tahunAngkatan && (
            <p style={errorStyle}>{errors.tahunAngkatan}</p>
          )}
        </div>

        {/* Kelas */}
        <div>
          <label style={labelStyle}>Kelas</label>
          <Select
            value={kelasId}
            onChange={setKelasId}
            options={kelasOptions}
            placeholder="Pilih kelas"
          />
          {errors.kelasId && <p style={errorStyle}>{errors.kelasId}</p>}
        </div>
      </div>
    </FormModal>
  );
}
