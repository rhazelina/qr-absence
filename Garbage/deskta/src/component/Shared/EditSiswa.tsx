import { useState } from "react";
import { FormModal } from "./FormModal";
import { Select } from "./Select";

interface EditSiswaFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: {
    jenisKelamin: string;
    noTelp: string;
    tahunAngkatan: string;
    password: string;
  }) => void;
  initialData: {
    jenisKelamin: string;
    noTelp: string;
    tahunAngkatan: string;
    password: string;
  };
}

export function EditSiswaForm({
  isOpen,
  onClose,
  onSubmit,
  initialData,
}: EditSiswaFormProps) {
  const [jenisKelamin, setJenisKelamin] = useState(initialData.jenisKelamin);
  const [noTelp, setNoTelp] = useState(initialData.noTelp);
  const [tahunAngkatan, setTahunAngkatan] = useState(initialData.tahunAngkatan);
  const [password, setPassword] = useState(initialData.password);
  const [errors, setErrors] = useState<{
    jenisKelamin?: string;
    noTelp?: string;
    tahunAngkatan?: string;
    password?: string;
  }>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleReset = () => {
    setJenisKelamin(initialData.jenisKelamin);
    setNoTelp(initialData.noTelp);
    setTahunAngkatan(initialData.tahunAngkatan);
    setPassword(initialData.password);
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
    if (!tahunAngkatan.trim()) {
      newErrors.tahunAngkatan = "Tahun angkatan harus diisi";
    }
    if (!password.trim()) {
      newErrors.password = "Kata sandi harus diisi";
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
          tahunAngkatan: tahunAngkatan.trim(),
          password: password.trim(),
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

  const handlePasswordChange = (value: string) => {
    setPassword(value);
    if (errors.password) {
      setErrors({ ...errors, password: undefined });
    }
  };

  const jenisKelaminOptions = [
    { label: "Laki-Laki", value: "Laki-Laki" },
    { label: "Perempuan", value: "Perempuan" },
  ];

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
      title="Ubah Data Siswa"
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

        {/* Kata Sandi */}
        <div>
          <label htmlFor="password" style={labelStyle}>
            Kata Sandi
          </label>
          <input
            id="password"
            type="text"
            placeholder="Masukkan kata sandi"
            value={password}
            onChange={(e) => handlePasswordChange(e.target.value)}
            style={inputStyle(!!errors.password)}
            disabled={isSubmitting}
          />
          {errors.password && <p style={errorStyle}>{errors.password}</p>}
        </div>
      </div>
    </FormModal>
  );
}