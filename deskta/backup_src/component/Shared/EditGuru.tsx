import { useState } from "react";
import { FormModal } from "./FormModal";

interface EditGuruFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: {
    role: string;
    password: string;
    noTelp: string;
    waliKelasDari: string;
    mataPelajaran: string;
  }) => void;
  initialData: {
    role: string;
    password: string;
    noTelp: string;
    waliKelasDari: string;
    mataPelajaran: string;
  };
}

export function EditGuruForm({
  isOpen,
  onClose,
  onSubmit,
  initialData,
}: EditGuruFormProps) {
  const [role, setRole] = useState(initialData.role);
  const [password, setPassword] = useState(initialData.password);
  const [noTelp, setNoTelp] = useState(initialData.noTelp);
  const [waliKelasDari, setWaliKelasDari] = useState(initialData.waliKelasDari);
  const [mataPelajaran, setMataPelajaran] = useState(initialData.mataPelajaran);
  const [errors, setErrors] = useState<{
    role?: string;
    password?: string;
    noTelp?: string;
    waliKelasDari?: string;
    mataPelajaran?: string;
  }>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleReset = () => {
    setRole(initialData.role);
    setPassword(initialData.password);
    setNoTelp(initialData.noTelp);
    setWaliKelasDari(initialData.waliKelasDari);
    setMataPelajaran(initialData.mataPelajaran);
    setErrors({});
    setIsSubmitting(false);
  };

  const handleClose = () => {
    handleReset();
    onClose();
  };

  const validate = (): boolean => {
    const newErrors: {
      role?: string;
      password?: string;
      noTelp?: string;
      waliKelasDari?: string;
      mataPelajaran?: string;
    } = {};

    if (!role.trim()) {
      newErrors.role = "Role wajib diisi";
    }

    if (!password.trim()) {
      newErrors.password = "Password wajib diisi";
    } else if (password.length < 6) {
      newErrors.password = "Password minimal 6 karakter";
    }

    if (!noTelp.trim()) {
      newErrors.noTelp = "No. Telepon wajib diisi";
    } else if (!/^\d+$/.test(noTelp)) {
      newErrors.noTelp = "No. Telepon hanya boleh angka";
    } else if (noTelp.length < 10 || noTelp.length > 13) {
      newErrors.noTelp = "No. Telepon harus 10-13 digit";
    }

    if (!waliKelasDari.trim()) {
      newErrors.waliKelasDari = "Wali Kelas dari wajib diisi";
    }

    if (!mataPelajaran.trim()) {
      newErrors.mataPelajaran = "Mata Pelajaran wajib diisi";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = () => {
    if (validate()) {
      setIsSubmitting(true);
      setTimeout(() => {
        onSubmit({
          role: role.trim(),
          password: password.trim(),
          noTelp: noTelp.trim(),
          waliKelasDari: waliKelasDari.trim(),
          mataPelajaran: mataPelajaran.trim(),
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

  return (
    <FormModal
      isOpen={isOpen}
      onClose={handleClose}
      title="Ubah Data Guru"
      onSubmit={handleSubmit}
      submitLabel="Simpan"
      isSubmitting={isSubmitting}
    >
      <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
        {/* Role */}
        <div>
          <label
            htmlFor="role"
            style={{
              display: "block",
              fontWeight: "600",
              fontSize: "14px",
              marginBottom: "8px",
              color: "#1f2937",
            }}
          >
            Role
          </label>
          <input
            id="role"
            type="text"
            placeholder="Masukkan role"
            value={role}
            onChange={(e) => {
              setRole(e.target.value);
              if (errors.role) {
                setErrors({ ...errors, role: undefined });
              }
            }}
            style={{
              width: "100%",
              padding: "10px 12px",
              border: `1px solid ${errors.role ? "#ef4444" : "#d1d5db"}`,
              borderRadius: "8px",
              fontSize: "14px",
              outline: "none",
              boxSizing: "border-box",
            }}
            disabled={isSubmitting}
          />
          {errors.role && (
            <p
              style={{
                color: "#ef4444",
                fontSize: "12px",
                marginTop: "4px",
                margin: "4px 0 0 0",
              }}
            >
              {errors.role}
            </p>
          )}
        </div>

        {/* Password */}
        <div>
          <label
            htmlFor="password"
            style={{
              display: "block",
              fontWeight: "600",
              fontSize: "14px",
              marginBottom: "8px",
              color: "#1f2937",
            }}
          >
            Password
          </label>
          <input
            id="password"
            type="text"
            placeholder="Masukkan password"
            value={password}
            onChange={(e) => {
              setPassword(e.target.value);
              if (errors.password) {
                setErrors({ ...errors, password: undefined });
              }
            }}
            style={{
              width: "100%",
              padding: "10px 12px",
              border: `1px solid ${errors.password ? "#ef4444" : "#d1d5db"}`,
              borderRadius: "8px",
              fontSize: "14px",
              outline: "none",
              boxSizing: "border-box",
            }}
            disabled={isSubmitting}
          />
          {errors.password && (
            <p
              style={{
                color: "#ef4444",
                fontSize: "12px",
                marginTop: "4px",
                margin: "4px 0 0 0",
              }}
            >
              {errors.password}
            </p>
          )}
        </div>

        {/* No. Telp */}
        <div>
          <label
            htmlFor="noTelp"
            style={{
              display: "block",
              fontWeight: "600",
              fontSize: "14px",
              marginBottom: "8px",
              color: "#1f2937",
            }}
          >
            No. Telp
          </label>
          <input
            id="noTelp"
            type="text"
            placeholder="Masukkan nomor telepon"
            value={noTelp}
            onChange={(e) => handleNoTelpChange(e.target.value)}
            maxLength={13}
            style={{
              width: "100%",
              padding: "10px 12px",
              border: `1px solid ${errors.noTelp ? "#ef4444" : "#d1d5db"}`,
              borderRadius: "8px",
              fontSize: "14px",
              outline: "none",
              boxSizing: "border-box",
            }}
            disabled={isSubmitting}
          />
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              marginTop: "4px",
            }}
          >
            {errors.noTelp ? (
              <p style={{ color: "#ef4444", fontSize: "12px", margin: 0 }}>
                {errors.noTelp}
              </p>
            ) : (
              <span style={{ fontSize: "12px", color: "#6b7280" }}>
                Hanya angka, 10-13 digit
              </span>
            )}
            <span style={{ fontSize: "12px", color: "#6b7280" }}>
              {noTelp.length}/13
            </span>
          </div>
        </div>

        {/* Wali Kelas dari */}
        <div>
          <label
            htmlFor="waliKelasDari"
            style={{
              display: "block",
              fontWeight: "600",
              fontSize: "14px",
              marginBottom: "8px",
              color: "#1f2937",
            }}
          >
            Wali Kelas dari
          </label>
          <input
            id="waliKelasDari"
            type="text"
            placeholder="Contoh: XII RPL 2"
            value={waliKelasDari}
            onChange={(e) => {
              setWaliKelasDari(e.target.value);
              if (errors.waliKelasDari) {
                setErrors({ ...errors, waliKelasDari: undefined });
              }
            }}
            style={{
              width: "100%",
              padding: "10px 12px",
              border: `1px solid ${errors.waliKelasDari ? "#ef4444" : "#d1d5db"
                }`,
              borderRadius: "8px",
              fontSize: "14px",
              outline: "none",
              boxSizing: "border-box",
            }}
            disabled={isSubmitting}
          />
          {errors.waliKelasDari && (
            <p
              style={{
                color: "#ef4444",
                fontSize: "12px",
                marginTop: "4px",
                margin: "4px 0 0 0",
              }}
            >
              {errors.waliKelasDari}
            </p>
          )}
        </div>

        {/* Mata Pelajaran */}
        <div>
          <label
            htmlFor="mataPelajaran"
            style={{
              display: "block",
              fontWeight: "600",
              fontSize: "14px",
              marginBottom: "8px",
              color: "#1f2937",
            }}
          >
            Mata Pelajaran
          </label>
          <input
            id="mataPelajaran"
            type="text"
            placeholder="Contoh: MTK, B.Ing"
            value={mataPelajaran}
            onChange={(e) => {
              setMataPelajaran(e.target.value);
              if (errors.mataPelajaran) {
                setErrors({ ...errors, mataPelajaran: undefined });
              }
            }}
            style={{
              width: "100%",
              padding: "10px 12px",
              border: `1px solid ${errors.mataPelajaran ? "#ef4444" : "#d1d5db"
                }`,
              borderRadius: "8px",
              fontSize: "14px",
              outline: "none",
              boxSizing: "border-box",
            }}
            disabled={isSubmitting}
          />
          {errors.mataPelajaran && (
            <p
              style={{
                color: "#ef4444",
                fontSize: "12px",
                marginTop: "4px",
                margin: "4px 0 0 0",
              }}
            >
              {errors.mataPelajaran}
            </p>
          )}
        </div>
      </div>
    </FormModal>
  );
}
