import { useState, useEffect, useRef } from "react";
import { FormModal } from "../FormModal";

interface KelasFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: {
    namaKelas: string;
    jurusanId: string;
    kelasId: string;
    waliKelasId: string;
  }) => void;
  isEdit?: boolean;
  isLoading?: boolean;
  initialData?: {
    namaKelas: string;
    jurusanId: string;
    kelasId: string;
    waliKelasId: string;
  };
  jurusanList: { id: string; nama: string }[];
  kelasList?: { id: string; nama: string }[];
  waliKelasList?: { id: string; nama: string }[];
  takenWaliKelasIds?: string[];
}

export function TambahKelasForm({
  isOpen,
  onClose,
  onSubmit,
  isEdit = false,
  isLoading = false,
  initialData,
  jurusanList,
  kelasList = [],
  waliKelasList = [],
  takenWaliKelasIds = [],
}: KelasFormProps) {
  const [jurusanId, setJurusanId] = useState("");
  const [kelasId, setKelasId] = useState("");
  const [namaKelas, setNamaKelas] = useState("");
  const [waliKelasId, setWaliKelasId] = useState("");

  const initialized = useRef(false);

  useEffect(() => {
    if (isOpen && initialData && !initialized.current) {
      setJurusanId(initialData.jurusanId);
      setKelasId(initialData.kelasId);
      setNamaKelas(initialData.namaKelas);
      setWaliKelasId(initialData.waliKelasId);
      initialized.current = true;
    }

    if (!isOpen) {
      initialized.current = false;
      setJurusanId("");
      setKelasId("");
      setNamaKelas("");
      setWaliKelasId("");
    }
  }, [isOpen, initialData]);

  // Data guru dengan 3 data guru random + Alifah Diantebes
  const defaultWaliKelasList = [
    ...waliKelasList,
    { id: "Alifah Diantebes Aindra S.pd", nama: "Alifah Diantebes Aindra S.pd" },
    { id: "Budi Santoso, S.Pd", nama: "Budi Santoso, S.Pd" },
    { id: "Sri Wulandari, M.Pd", nama: "Sri Wulandari, M.Pd" },
    { id: "Ahmad Fauzi, S.Pd", nama: "Ahmad Fauzi, S.Pd" }
  ];

  // Filter guru yang tersedia (belum menjadi wali kelas atau sedang diedit)
  const availableWaliKelas = defaultWaliKelasList.filter((guru) =>
    !takenWaliKelasIds.includes(guru.id) || guru.id === initialData?.waliKelasId
  );

  return (
    <FormModal
      isOpen={isOpen}
      onClose={onClose}
      title={isEdit ? "Ubah Kelas" : "Tambah Kelas"}
      titleStyle={{
        textAlign: "center",
        fontSize: "20px",
        fontWeight: 600,
        color: "#FFFFFF", // Judul warna putih
        marginBottom: "8px"
      }}
      submitLabel={isEdit ? "Simpan" : "Tambahkan"}
      onSubmit={() =>
        onSubmit({
          namaKelas,
          jurusanId,
          kelasId,
          waliKelasId,
        })
      }
      isSubmitting={isLoading}
      contentStyle={{
        backgroundColor: "rgba(255, 255, 255, 0.95)",
        backdropFilter: "blur(8px)",
        borderRadius: "16px",
        padding: "24px",
        boxShadow: "0 10px 30px rgba(0, 0, 0, 0.08)",
        border: "1px solid rgba(255, 255, 255, 0.6)",
        position: "relative",
        zIndex: 10,
      }}
    >
      <div style={{
        display: "flex",
        flexDirection: "column",
        gap: 20,
        marginTop: 8
      }}>
        {/* Konsentrasi Keahlian */}
        <div>
          <label style={{
            fontWeight: 600,
            fontSize: "14px",
            marginBottom: "10px",
            color: "#374151",
            display: "block",
          }}>
            Konsentrasi Keahlian
          </label>
          <select
            value={jurusanId}
            onChange={(e) => setJurusanId(e.target.value)}
            disabled={isLoading}
            style={{
              width: "100%",
              padding: "14px 16px",
              borderRadius: "10px",
              border: "1px solid #E5E7EB",
              fontSize: "14px",
              backgroundColor: "#FFFFFF",
              color: "#1F2937",
              outline: "none",
              boxSizing: "border-box",
              boxShadow: "0 1px 2px rgba(0, 0, 0, 0.05)",
              transition: "all 0.2s ease",
            }}
            onFocus={(e) => {
              e.currentTarget.style.borderColor = "#3B82F6";
              e.currentTarget.style.boxShadow = "0 0 0 3px rgba(59, 130, 246, 0.1)";
            }}
            onBlur={(e) => {
              e.currentTarget.style.borderColor = "#E5E7EB";
              e.currentTarget.style.boxShadow = "0 1px 2px rgba(0, 0, 0, 0.05)";
            }}
          >
            <option value="">Pilih konsentrasi keahlian</option>
            {jurusanList.map((item) => (
              <option key={item.id} value={item.nama}>
                {item.nama}
              </option>
            ))}
          </select>
        </div>

        {/* Tingkat Kelas */}
        <div>
          <label style={{
            fontWeight: 600,
            fontSize: "14px",
            marginBottom: "10px",
            color: "#374151",
            display: "block",
          }}>
            Tingkat Kelas
          </label>
          <select
            value={kelasId}
            onChange={(e) => setKelasId(e.target.value)}
            disabled={isLoading}
            style={{
              width: "100%",
              padding: "14px 16px",
              borderRadius: "10px",
              border: "1px solid #E5E7EB",
              fontSize: "14px",
              backgroundColor: "#FFFFFF",
              color: "#1F2937",
              outline: "none",
              boxSizing: "border-box",
              boxShadow: "0 1px 2px rgba(0, 0, 0, 0.05)",
              transition: "all 0.2s ease",
            }}
            onFocus={(e) => {
              e.currentTarget.style.borderColor = "#3B82F6";
              e.currentTarget.style.boxShadow = "0 0 0 3px rgba(59, 130, 246, 0.1)";
            }}
            onBlur={(e) => {
              e.currentTarget.style.borderColor = "#E5E7EB";
              e.currentTarget.style.boxShadow = "0 1px 2px rgba(0, 0, 0, 0.05)";
            }}
          >
            <option value="">Pilih tingkat kelas</option>
            {(kelasList.length > 0
              ? kelasList
              : [
                { id: "10", nama: "10" },
                { id: "11", nama: "11" },
                { id: "12", nama: "12" },
              ]
            ).map((item) => (
              <option key={item.id} value={item.nama}>
                {item.nama}
              </option>
            ))}
          </select>
        </div>

        {/* Kelas */}
        <div>
          <label style={{
            fontWeight: 600,
            fontSize: "14px",
            marginBottom: "10px",
            color: "#374151",
            display: "block",
          }}>
            Kelas
          </label>
          <select
            value={namaKelas}
            onChange={(e) => setNamaKelas(e.target.value)}
            disabled={isLoading}
            style={{
              width: "100%",
              padding: "14px 16px",
              borderRadius: "10px",
              border: "1px solid #E5E7EB",
              fontSize: "14px",
              backgroundColor: "#FFFFFF",
              color: "#1F2937",
              outline: "none",
              boxSizing: "border-box",
              boxShadow: "0 1px 2px rgba(0, 0, 0, 0.05)",
              transition: "all 0.2s ease",
            }}
            onFocus={(e) => {
              e.currentTarget.style.borderColor = "#3B82F6";
              e.currentTarget.style.boxShadow = "0 0 0 3px rgba(59, 130, 246, 0.1)";
            }}
            onBlur={(e) => {
              e.currentTarget.style.borderColor = "#E5E7EB";
              e.currentTarget.style.boxShadow = "0 1px 2px rgba(0, 0, 0, 0.05)";
            }}
          >
            <option value="">Pilih kelas</option>
            <option value="Mekatronika 1">Mekatronika 1</option>
            <option value="Mekatronika 2">Mekatronika 2</option>
            <option value="Rekayasa Perangkat Lunak 1">
              Rekayasa Perangkat Lunak 1
            </option>
            <option value="Rekayasa Perangkat Lunak 2">
              Rekayasa Perangkat Lunak 2
            </option>
            <option value="Rekayasa Perangkat Lunak 3">
              Rekayasa Perangkat Lunak 3
            </option>
          </select>
        </div>

        {/* Wali Kelas - DROPDOWN */}
        <div>
          <label style={{
            fontWeight: 600,
            fontSize: "14px",
            marginBottom: "10px",
            color: "#374151",
            display: "block",
          }}>
            Wali Kelas
          </label>
          <select
            value={waliKelasId}
            onChange={(e) => setWaliKelasId(e.target.value)}
            disabled={isLoading}
            style={{
              width: "100%",
              padding: "14px 16px",
              borderRadius: "10px",
              border: "1px solid #E5E7EB",
              fontSize: "14px",
              backgroundColor: "#FFFFFF",
              color: "#1F2937",
              outline: "none",
              boxSizing: "border-box",
              boxShadow: "0 1px 2px rgba(0, 0, 0, 0.05)",
              transition: "all 0.2s ease",
            }}
            onFocus={(e) => {
              e.currentTarget.style.borderColor = "#3B82F6";
              e.currentTarget.style.boxShadow = "0 0 0 3px rgba(59, 130, 246, 0.1)";
            }}
            onBlur={(e) => {
              e.currentTarget.style.borderColor = "#E5E7EB";
              e.currentTarget.style.boxShadow = "0 1px 2px rgba(0, 0, 0, 0.05)";
            }}
          >
            <option value="">Pilih wali kelas</option>
            {availableWaliKelas.map((guru) => (
              <option key={guru.id} value={guru.id}>
                {guru.nama}
              </option>
            ))}
          </select>

          {availableWaliKelas.length === 0 && (
            <div style={{
              marginTop: "10px",
              padding: "12px 16px",
              backgroundColor: "#FEF2F2",
              borderRadius: "8px",
              border: "1px solid #FECACA",
            }}>
              <p style={{
                fontSize: "13px",
                color: "#DC2626",
                margin: 0,
                fontWeight: 500,
              }}>
                {takenWaliKelasIds.length > 0
                  ? "⚠️ Semua guru sudah menjadi wali kelas. Silakan tambah guru baru terlebih dahulu."
                  : "⚠️ Belum ada data guru. Silakan tambah data guru terlebih dahulu."}
              </p>
            </div>
          )}
        </div>
      </div>
    </FormModal>
  );
}