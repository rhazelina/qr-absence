import { useState, useEffect, useRef } from "react";
import { FormModal } from "../../Shared/FormModal";

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

  const labelStyle: React.CSSProperties = {
    fontWeight: 600,
    fontSize: "14px",
    marginBottom: "8px",
    color: "#374151",
    display: "block",
  };

  const inputStyle: React.CSSProperties = {
    width: "100%",
    padding: "12px 16px",
    borderRadius: "8px",
    border: "1px solid #E5E7EB",
    fontSize: "14px",
    backgroundColor: "#F9FAFB",
    color: "#1F2937",
    outline: "none",
    boxSizing: "border-box",
  };

  return (
    <FormModal
      isOpen={isOpen}
      onClose={onClose}
      title={isEdit ? "Edit Kelas" : "Tambah Kelas"}
      titleStyle={{ textAlign: "center" }}
      submitLabel={isEdit ? "Simpan" : "Tambahkan"}
      onSubmit={() =>
        onSubmit({
          namaKelas,
          jurusanId,
          kelasId,
          waliKelasId,
        })
      }
    >
      <div style={{ display: "flex", flexDirection: "column", gap: 16, marginTop: 16 }}>
        {/* Konsentrasi Keahlian */}
        <div>
          <label style={labelStyle}>Konsentrasi Keahlian</label>
          <select
            value={jurusanId}
            onChange={(e) => setJurusanId(e.target.value)}
            style={inputStyle}
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
          <label style={labelStyle}>Tingkat Kelas</label>
          <select
            value={kelasId}
            onChange={(e) => setKelasId(e.target.value)}
            style={inputStyle}
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
          <label style={labelStyle}>Kelas</label>
          <select
            value={namaKelas}
            onChange={(e) => setNamaKelas(e.target.value)}
            style={inputStyle}
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

        {/* Wali Kelas */}
        <div>
          <label style={labelStyle}>Wali Kelas</label>
          {waliKelasList.length > 0 ? (
            <select
              value={waliKelasId}
              onChange={(e) => setWaliKelasId(e.target.value)}
              style={inputStyle}
            >
              <option value="">Pilih wali kelas</option>
              {waliKelasList
                .filter(t => !takenWaliKelasIds.includes(t.id) || t.id === initialData?.waliKelasId)
                .map((item) => (
                  <option key={item.id} value={item.id}>
                    {item.nama}
                  </option>
                ))}
            </select>
          ) : (
            <input
              type="text"
              placeholder="Masukkan nama guru"
              value={waliKelasId}
              onChange={(e) => setWaliKelasId(e.target.value)}
              style={inputStyle}
            />
          )}
        </div>
      </div>
    </FormModal>
  );
}
