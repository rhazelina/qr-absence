// KelasAdmin.tsx - Halaman admin untuk mengelola data kelas
import React, { useState, useMemo } from "react";
import AdminLayout from "../../component/Admin/AdminLayout";
import { Button } from "../../component/Shared/Button";
import { Table } from "../../component/Shared/Table";
import { TambahKelasForm } from "../../component/Shared/Form/KelasForm";
import AWANKIRI from "../../assets/Icon/AWANKIRI.png";
import AwanBawahkanan from "../../assets/Icon/AwanBawahkanan.png";
import { MoreVertical, Edit, Trash2 } from "lucide-react";

interface User {
  role: string;
  name: string;
}

interface Kelas {
  id: string;
  konsentrasiKeahlian: string;
  tingkatKelas: string;
  namaKelas: string;
  waliKelas: string;
}

interface KelasAdminProps {
  user: User;
  onLogout: () => void;
  currentPage: string;
  onMenuClick: (page: string) => void;
}

// TODO: BACKEND - Ganti dengan fetch dari API
const semuaGuru = [
  { nama: "Budi Santoso S.Pd" },
  { nama: "Siti Aminah S.Kom" },
  { nama: "Ahmad Rifai S.Pd" },
  { nama: "Dewi Lestari S.Pd" },
  { nama: "Eko Prasetyo S.Kom" },
  { nama: "Fajar Setiawan M.Pd" },
  { nama: "Gita Permata S.Kom" },
  { nama: "Hendra Wijaya S.Pd" },
  { nama: "Indah Puspita M.Kom" },
  { nama: "Joko Susanto S.Pd" },
  { nama: "Kartika Sari S.Pd" },
  { nama: "Lukman Hakim S.Kom" },
  { nama: "Maya Puspita S.Sn" },
  { nama: "Nina Kusuma S.Pd" },
  { nama: "Oscar Pratama M.Pd" },
];

// TODO: BACKEND - Ganti dengan fetch dari API
const initialKelasData: Kelas[] = [
  { id: "1", konsentrasiKeahlian: "Rekayasa Perangkat Lunak", tingkatKelas: "10", namaKelas: "Rekayasa Perangkat Lunak 1", waliKelas: "Budi Santoso S.Pd" },
  { id: "2", konsentrasiKeahlian: "Rekayasa Perangkat Lunak", tingkatKelas: "11", namaKelas: "Rekayasa Perangkat Lunak 1", waliKelas: "Siti Aminah S.Kom" },
  { id: "3", konsentrasiKeahlian: "Rekayasa Perangkat Lunak", tingkatKelas: "12", namaKelas: "Rekayasa Perangkat Lunak 1", waliKelas: "Ahmad Rifai S.Pd" },
  { id: "4", konsentrasiKeahlian: "Teknik Komputer dan Jaringan", tingkatKelas: "10", namaKelas: "Teknik Komputer dan Jaringan 1", waliKelas: "Dewi Lestari S.Pd" },
  { id: "5", konsentrasiKeahlian: "Teknik Komputer dan Jaringan", tingkatKelas: "11", namaKelas: "Teknik Komputer dan Jaringan 1", waliKelas: "Eko Prasetyo S.Kom" },
  { id: "6", konsentrasiKeahlian: "Multimedia", tingkatKelas: "10", namaKelas: "Multimedia 1", waliKelas: "Fajar Setiawan M.Pd" },
  { id: "7", konsentrasiKeahlian: "Multimedia", tingkatKelas: "11", namaKelas: "Multimedia 1", waliKelas: "Gita Permata S.Kom" },
  { id: "8", konsentrasiKeahlian: "Desain Komunikasi Visual", tingkatKelas: "10", namaKelas: "Desain Komunikasi Visual 1", waliKelas: "Hendra Wijaya S.Pd" },
];

const konsentrasiKeahlianOptions = [
  "Semua Konsentrasi Keahlian",
  "Rekayasa Perangkat Lunak",
  "Teknik Komputer dan Jaringan",
  "Multimedia",
  "Desain Komunikasi Visual",
  "Teknik Kendaraan Ringan"
];

const tingkatKelasOptions = [
  "Semua Tingkat",
  "10",
  "11",
  "12"
];

const jurusanList = [
  { id: "Rekayasa Perangkat Lunak", nama: "Rekayasa Perangkat Lunak" },
  { id: "Teknik Komputer dan Jaringan", nama: "Teknik Komputer dan Jaringan" },
  { id: "Multimedia", nama: "Multimedia" },
  { id: "Desain Komunikasi Visual", nama: "Desain Komunikasi Visual" },
  { id: "Teknik Kendaraan Ringan", nama: "Teknik Kendaraan Ringan" },
];

export default function KelasAdmin({
  user,
  onLogout,
  currentPage,
  onMenuClick,
}: KelasAdminProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [kelasList, setKelasList] = useState<Kelas[]>(initialKelasData);
  const [editingKelas, setEditingKelas] = useState<Kelas | null>(null);
  const [openActionId, setOpenActionId] = useState<string | null>(null);
  const [selectedKonsentrasi, setSelectedKonsentrasi] = useState("Semua Konsentrasi Keahlian");
  const [selectedTingkat, setSelectedTingkat] = useState("Semua Tingkat");
  const [validationError, setValidationError] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Daftar wali kelas yang sudah digunakan
  const usedWaliKelas = useMemo(() => {
    const waliKelasSet = new Set<string>();
    kelasList.forEach(kelas => {
      waliKelasSet.add(kelas.waliKelas);
    });
    return Array.from(waliKelasSet);
  }, [kelasList]);

  const usedKelasCombinations = useMemo(() => {
    const combinations = new Set<string>();
    kelasList.forEach(kelas => {
      const key = `${kelas.konsentrasiKeahlian}|${kelas.tingkatKelas}|${kelas.namaKelas.toLowerCase()}`;
      combinations.add(key);
    });
    return combinations;
  }, [kelasList]);

  // Wali kelas yang TERSEDIA untuk mode TAMBAH (yang belum dipakai)
  const availableWaliKelas = useMemo(() => {
    return semuaGuru.filter(guru => !usedWaliKelas.includes(guru.nama));
  }, [usedWaliKelas]);

  // Wali kelas yang TERSEDIA untuk mode EDIT
  // Termasuk wali kelas yang sedang diedit + yang belum terpakai
  const availableWaliKelasForEdit = useMemo(() => {
    if (!editingKelas) return availableWaliKelas;
    
    const currentWaliKelas = semuaGuru.find(guru => guru.nama === editingKelas.waliKelas);
    if (currentWaliKelas && !availableWaliKelas.find(g => g.nama === currentWaliKelas.nama)) {
      return [...availableWaliKelas, currentWaliKelas];
    }
    return availableWaliKelas;
  }, [availableWaliKelas, editingKelas]);

  // Statistik
  const stats = useMemo(() => ({
    totalKelas: kelasList.length,
    totalGuru: semuaGuru.length,
    totalWaliKelas: usedWaliKelas.length,
  }), [kelasList.length, usedWaliKelas.length]);

  const validateKelasData = (data: any, isEditMode: boolean, excludeId?: string): { isValid: boolean; message: string } => {
    setValidationError("");

    const inputNamaKelas = data.namaKelas?.trim() || "";
    const inputJurusan = data.jurusanId || data.konsentrasiKeahlian || "";
    const inputTingkat = data.kelasId || data.tingkatKelas || "";
    const inputWaliKelas = data.waliKelas || data.waliKelasId || data.wali_kelas || "";

    if (!inputNamaKelas) {
      return { isValid: false, message: "Nama kelas harus diisi!" };
    }

    if (!inputJurusan) {
      return { isValid: false, message: "Konsentrasi keahlian harus dipilih!" };
    }

    if (!inputTingkat) {
      return { isValid: false, message: "Tingkat kelas harus dipilih!" };
    }

    if (!inputWaliKelas) {
      return { isValid: false, message: "Wali kelas harus dipilih!" };
    }

    const duplicateCombination = kelasList.find((k) => {
      if (isEditMode && k.id === excludeId) return false;
      
      const kelasNama = k.namaKelas.trim().toLowerCase();
      const kelasJurusan = k.konsentrasiKeahlian;
      const kelasTingkat = k.tingkatKelas;
      
      return kelasJurusan === inputJurusan && 
             kelasTingkat === inputTingkat && 
             kelasNama === inputNamaKelas.toLowerCase();
    });

    if (duplicateCombination) {
      return {
        isValid: false,
        message: `Kelas "${inputNamaKelas}" untuk ${inputJurusan} tingkat ${inputTingkat} sudah ada dengan wali kelas "${duplicateCombination.waliKelas}"!`
      };
    }

    const duplicateWaliKelas = kelasList.find((k) => {
      if (isEditMode && k.id === excludeId) return false;
      return k.waliKelas === inputWaliKelas;
    });

    if (duplicateWaliKelas) {
      return {
        isValid: false,
        message: `Wali kelas "${inputWaliKelas}" sudah mengajar kelas "${duplicateWaliKelas.namaKelas}" (${duplicateWaliKelas.konsentrasiKeahlian} tingkat ${duplicateWaliKelas.tingkatKelas})! Pilih wali kelas lain yang tersedia.`
      };
    }

    return { isValid: true, message: "" };
  };

  const filteredData = kelasList.filter((k) => {
    const konsentrasiMatch = 
      selectedKonsentrasi === "Semua Konsentrasi Keahlian" || 
      k.konsentrasiKeahlian === selectedKonsentrasi;
    
    const tingkatMatch = 
      selectedTingkat === "Semua Tingkat" || 
      k.tingkatKelas === selectedTingkat;
    
    return konsentrasiMatch && tingkatMatch;
  });

  const handleDelete = (row: Kelas) => {
    if (confirm(`Hapus kelas "${row.namaKelas}" (${row.konsentrasiKeahlian} tingkat ${row.tingkatKelas})?\n\nWali kelas "${row.waliKelas}" akan tersedia kembali untuk ditugaskan ke kelas lain.`)) {
      // TODO: BACKEND - Panggil API DELETE /api/kelas/:id
      setKelasList((prev) => prev.filter((k) => k.id !== row.id));
      setOpenActionId(null);
      setValidationError("");
    }
  };

  const handleSubmit = async (data: any) => {
    if (isSubmitting) return;
    
    setIsSubmitting(true);
    const isEditMode = !!editingKelas;
    
    const validation = validateKelasData(data, isEditMode, editingKelas?.id);
    
    if (!validation.isValid) {
      alert(validation.message);
      setValidationError(validation.message);
      setIsSubmitting(false);
      return;
    }

    const finalWaliKelas = data.waliKelas || data.waliKelasId || data.wali_kelas || "";

    await new Promise(resolve => setTimeout(resolve, 500));

    if (editingKelas) {
      // TODO: BACKEND - Panggil API PUT /api/kelas/:id
      setKelasList((prev) =>
        prev.map((k) =>
          k.id === editingKelas.id
            ? { 
                ...k,
                namaKelas: data.namaKelas.trim(),
                konsentrasiKeahlian: data.jurusanId || data.konsentrasiKeahlian,
                tingkatKelas: data.kelasId || data.tingkatKelas,
                waliKelas: finalWaliKelas
              }
            : k
        )
      );
    } else {
      // TODO: BACKEND - Panggil API POST /api/kelas
      const newId = `kelas_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      
      setKelasList((prev) => [
        ...prev,
        {
          id: newId,
          namaKelas: data.namaKelas.trim(),
          konsentrasiKeahlian: data.jurusanId || data.konsentrasiKeahlian,
          tingkatKelas: data.kelasId || data.tingkatKelas,
          waliKelas: finalWaliKelas,
        },
      ]);
    }
    
    setIsModalOpen(false);
    setEditingKelas(null);
    setValidationError("");
    setIsSubmitting(false);
  };

  const handleOpenModal = () => {
    setValidationError("");
    setIsModalOpen(true);
  };

  const columns = [
    { key: "konsentrasiKeahlian", label: "Konsentrasi Keahlian" },
    { key: "tingkatKelas", label: "Tingkat Kelas" },
    { key: "namaKelas", label: "Kelas" },
    { key: "waliKelas", label: "Wali Kelas" },
    {
      key: "aksi",
      label: "Aksi",
      render: (_: any, row: Kelas) => (
        <div style={{ position: "relative" }}>
          <button
            onClick={() =>
              setOpenActionId(openActionId === row.id ? null : row.id)
            }
            style={{
              border: "none",
              background: "transparent",
              cursor: "pointer",
              color: "#666",
            }}
          >
            <MoreVertical size={22} strokeWidth={1.5} />
          </button>

          {openActionId === row.id && (
            <div style={dropdownMenuStyle}>
              <button
                onClick={() => {
                  setOpenActionId(null);
                  setEditingKelas(row);
                  setValidationError("");
                  setIsModalOpen(true);
                }}
                style={actionItemStyle}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = "#F0F4FF";
                  e.currentTarget.style.color = "#2563EB";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = "#FFFFFF";
                  e.currentTarget.style.color = "#0F172A";
                }}
              >
                <Edit size={16} strokeWidth={2} />
                Ubah
              </button>

              <button
                onClick={() => handleDelete(row)}
                style={{ ...actionItemStyle, borderBottom: "none" }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = "#FEF2F2";
                  e.currentTarget.style.color = "#DC2626";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = "#FFFFFF";
                  e.currentTarget.style.color = "#0F172A";
                }}
              >
                <Trash2 size={16} strokeWidth={2} />
                Hapus
              </button>
            </div>
          )}
        </div>
      ),
    },
  ];

  return (
    <AdminLayout
      pageTitle="Data Kelas"
      currentPage={currentPage}
      onMenuClick={onMenuClick}
      user={user}
      onLogout={onLogout}
      hideBackground
    >
      <img src={AWANKIRI} style={bgLeft} alt="Background awan kiri" />
      <img src={AwanBawahkanan} style={bgRight} alt="Background awan kanan bawah" />

      <div style={containerStyle}>
        <div style={statsContainerStyle}>
          <div style={statCardStyle} className="stat-card">
            <div style={statIconContainerStyle}>
              <div style={iconCircleStyle} className="icon-circle">
                <span style={iconTextStyle}>🏫</span>
              </div>
            </div>
            
            <div style={statContentStyle}>
              <div style={statNumberStyle}>{stats.totalKelas}</div>
              <div style={statLabelStyle}>Total Kelas</div>
            </div>
          </div>

          <div style={statCardStyle} className="stat-card">
            <div style={statIconContainerStyle}>
              <div style={iconCircleStyle} className="icon-circle">
                <span style={iconTextStyle}>👨‍🏫</span>
              </div>
            </div>
            
            <div style={statContentStyle}>
              <div style={statNumberStyle}>{stats.totalGuru}</div>
              <div style={statLabelStyle}>Total Guru</div>
            </div>
          </div>

          <div style={statCardStyle} className="stat-card">
            <div style={statIconContainerStyle}>
              <div style={iconCircleStyle} className="icon-circle">
                <span style={iconTextStyle}>📚</span>
              </div>
            </div>
            
            <div style={statContentStyle}>
              <div style={statNumberStyle}>{stats.totalWaliKelas}</div>
              <div style={statLabelStyle}>Total Wali Kelas</div>
            </div>
          </div>
        </div>

        <div style={headerStyle}>
          <div style={filterContainerStyle}>
            <div style={{ minWidth: "200px", maxWidth: "250px" }}>
              <select
                value={selectedKonsentrasi}
                onChange={(e) => setSelectedKonsentrasi(e.target.value)}
                style={dropdownStyle}
              >
                {konsentrasiKeahlianOptions.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            </div>
            
            <div style={{ minWidth: "120px", maxWidth: "150px" }}>
              <select
                value={selectedTingkat}
                onChange={(e) => setSelectedTingkat(e.target.value)}
                style={dropdownStyle}
              >
                {tingkatKelasOptions.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div style={buttonContainerStyle}>
            <Button 
              label="Tambahkan" 
              onClick={handleOpenModal}
              style={buttonStyle}
            />
          </div>
        </div>

        {validationError && (
          <div style={errorBannerStyle}>
            ⚠️ {validationError}
          </div>
        )}

        <div style={tableWrapperStyle}>
          <Table columns={columns} data={filteredData} keyField="id" />
        </div>
      </div>

      <div style={{
        ...modalOverlayStyle,
        display: isModalOpen ? "flex" : "none",
      }}>
        <div style={modalContentStyle}>
          <TambahKelasForm
            isOpen={isModalOpen}
            onClose={() => {
              setIsModalOpen(false);
              setEditingKelas(null);
              setValidationError("");
              setIsSubmitting(false);
            }}
            isEdit={!!editingKelas}
            isSubmitting={isSubmitting}
            initialData={
              editingKelas
                ? {
                    namaKelas: editingKelas.namaKelas,
                    jurusanId: editingKelas.konsentrasiKeahlian,
                    kelasId: editingKelas.tingkatKelas,
                    waliKelas: editingKelas.waliKelas,
                  }
                : undefined
            }
            jurusanList={jurusanList}
            waliKelasList={editingKelas ? availableWaliKelasForEdit : availableWaliKelas}
            takenWaliKelasIds={usedWaliKelas}
            takenKelasCombinations={Array.from(usedKelasCombinations)}
            onSubmit={handleSubmit}
            errorMessage={validationError}
          />
        </div>
      </div>
    </AdminLayout>
  );
}

const containerStyle: React.CSSProperties = {
  background: "#FFFFFF",
  borderRadius: 12,
  padding: 20,
  boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
  display: "flex",
  flexDirection: "column",
  gap: 24,
  position: "relative",
  zIndex: 1,
  minHeight: "calc(100vh - 180px)",
};

const statsContainerStyle: React.CSSProperties = {
  display: "flex",
  gap: 20,
  justifyContent: "space-between",
  marginBottom: 8,
};

const statCardStyle: React.CSSProperties = {
  flex: 1,
  background: "linear-gradient(135deg, #001F3E 0%, #0C4A6E 100%)",
  borderRadius: 16,
  padding: "24px",
  display: "flex",
  alignItems: "center",
  gap: 16,
  boxShadow: "0 4px 12px rgba(30, 58, 138, 0.3)",
  border: "1px solid #1e40af",
  minHeight: "120px",
  transition: "all 0.2s ease",
  cursor: "pointer",
};

const statIconContainerStyle: React.CSSProperties = {
  flexShrink: 0,
};

const iconCircleStyle: React.CSSProperties = {
  width: "64px",
  height: "64px",
  borderRadius: "50%",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  backgroundColor: "rgba(255, 255, 255, 0.15)",
  border: "2px solid rgba(255, 255, 255, 0.3)",
  transition: "all 0.2s ease",
};

const iconTextStyle: React.CSSProperties = {
  fontSize: "28px",
  lineHeight: 1,
  color: "#FFFFFF",
};

const statContentStyle: React.CSSProperties = {
  display: "flex",
  flexDirection: "column",
  flex: 1,
  minWidth: 0,
};

const statNumberStyle: React.CSSProperties = {
  color: "#FFFFFF",
  fontSize: "36px",
  fontWeight: 800,
  fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
  lineHeight: 1.2,
  marginBottom: "6px",
  textShadow: "0 1px 3px rgba(0, 0, 0, 0.2)",
};

const statLabelStyle: React.CSSProperties = {
  color: "#dbeafe",
  fontSize: "15px",
  fontWeight: 500,
  fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
  letterSpacing: "0.3px",
};

const headerStyle: React.CSSProperties = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  gap: 20,
  marginTop: 8,
  paddingBottom: 16,
  borderBottom: "1px solid #F3F4F6",
};

const filterContainerStyle: React.CSSProperties = {
  display: "flex",
  alignItems: "center",
  gap: 12,
  flex: 1,
};

const buttonContainerStyle: React.CSSProperties = {
  height: "40px",
  display: "flex",
  alignItems: "center",
};

const buttonStyle: React.CSSProperties = {
  height: "100%",
  padding: "0 20px",
  borderRadius: 8,
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  backgroundColor: "#001F3E",
  color: "#FFFFFF",
  fontWeight: 600,
  fontSize: "14px",
  border: "none",
  cursor: "pointer",
  transition: "background-color 0.2s ease",
};

const tableWrapperStyle: React.CSSProperties = {
  borderRadius: 8,
  overflow: "hidden",
  border: "1px solid #E5E7EB",
  backgroundColor: "#FFFFFF",
  marginTop: 8,
};

const modalOverlayStyle: React.CSSProperties = {
  position: "fixed",
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  backgroundColor: "rgba(0, 0, 0, 0.5)",
  justifyContent: "center",
  alignItems: "center",
  zIndex: 9999,
  backdropFilter: "blur(2px)",
};

const modalContentStyle: React.CSSProperties = {
  position: "relative",
  zIndex: 10000,
  maxWidth: "90vw",
  maxHeight: "90vh",
  overflow: "auto",
  animation: "modalAppear 0.2s ease-out",
};

const dropdownStyle: React.CSSProperties = {
  width: "100%",
  padding: "8px 12px",
  borderRadius: 6,
  border: "1px solid #D1D5DB",
  fontSize: 14,
  backgroundColor: "#FFFFFF",
  color: "#374151",
  outline: "none",
  cursor: "pointer",
  height: "40px",
  boxSizing: "border-box",
  transition: "all 0.2s ease",
};

const dropdownMenuStyle: React.CSSProperties = {
  position: "absolute",
  top: "100%",
  right: 0,
  marginTop: 4,
  background: "#FFFFFF",
  borderRadius: 6,
  boxShadow: "0 4px 6px rgba(0,0,0,0.1)",
  minWidth: 140,
  zIndex: 1000,
  overflow: "hidden",
  border: "1px solid #E5E7EB",
};

const actionItemStyle: React.CSSProperties = {
  width: "100%",
  padding: "8px 12px",
  border: "none",
  background: "none",
  textAlign: "left",
  cursor: "pointer",
  display: "flex",
  alignItems: "center",
  gap: 8,
  color: "#374151",
  fontSize: 14,
  fontWeight: 400,
  transition: "all 0.2s ease",
  borderBottom: "1px solid #F3F4F6",
};

const errorBannerStyle: React.CSSProperties = {
  backgroundColor: "#FEF2F2",
  border: "1px solid #FECACA",
  color: "#DC2626",
  padding: "12px 16px",
  borderRadius: "6px",
  fontSize: "14px",
  display: "flex",
  alignItems: "center",
  gap: "8px",
  fontWeight: 500,
  margin: "8px 0",
};

const bgLeft: React.CSSProperties = {
  position: "fixed",
  top: 0,
  left: 0,
  width: 200,
  zIndex: 0,
  opacity: 0.9,
};

const bgRight: React.CSSProperties = {
  position: "fixed",
  bottom: 0,
  right: 0,
  width: 220,
  zIndex: 0,
  opacity: 0.9,
};

if (typeof document !== 'undefined') {
  const styleSheet = document.createElement("style");
  styleSheet.textContent = `
    .stat-card:hover {
      box-shadow: 0 8px 20px rgba(30, 58, 138, 0.4) !important;
      transform: translateY(-3px);
      background: linear-gradient(135deg, #1e3a8a 0%, #0c4a6e 100%) !important;
      border-color: #3b82f6 !important;
    }
    
    .stat-card:hover .icon-circle {
      background-color: rgba(255, 255, 255, 0.2) !important;
      border-color: rgba(255, 255, 255, 0.4) !important;
      transform: scale(1.05);
    }
  `;
  if (!document.getElementById('stat-card-hover-styles')) {
    styleSheet.id = 'stat-card-hover-styles';
    document.head.appendChild(styleSheet);
  }
}