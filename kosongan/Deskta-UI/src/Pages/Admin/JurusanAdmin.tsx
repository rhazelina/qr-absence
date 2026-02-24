// JurusanAdmin.tsx - Halaman admin untuk mengelola data konsentrasi keahlian (jurusan)
import React, { useState, useEffect } from "react";
import AdminLayout from "../../component/Admin/AdminLayout";
import { Button } from "../../component/Shared/Button";
import { SearchBox } from "../../component/Shared/Search";
import AWANKIRI from "../../assets/Icon/AWANKIRI.png";
import AwanBawahkanan from "../../assets/Icon/AwanBawahkanan.png";
import { MoreVertical, Edit, Trash2, X } from "lucide-react";

/* ===================== INTERFACE ===================== */
interface User {
  role: string;
  name: string;
}

interface KonsentrasiKeahlian {
  id: string;
  kode: string;
  nama: string;
}

interface KonsentrasiKeahlianAdminProps {
  user: User;
  onLogout: () => void;
  currentPage: string;
  onMenuClick: (page: string) => void;
}

/* ===================== DUMMY DATA ===================== */
const dummyData: KonsentrasiKeahlian[] = [
  { id: "1", kode: "RPL001", nama: "Rekayasa Perangkat Lunak" },
  { id: "2", kode: "EI002", nama: "Elektronika Industri" },
  { id: "3", kode: "MT003", nama: "Mekatronika" },
  { id: "4", kode: "ANM004", nama: "Animasi" },
  { id: "5", kode: "DKV005", nama: "Desain Komunikasi Visual" },
];

/* ===================== COMPONENT ===================== */
export default function KonsentrasiKeahlianAdmin({
  user,
  onLogout,
  currentPage,
  onMenuClick,
}: KonsentrasiKeahlianAdminProps) {
  const [searchValue, setSearchValue] = useState("");
  const [showPopup, setShowPopup] = useState(false);
  const [konsentrasiKeahlianList, setKonsentrasiKeahlianList] = useState<KonsentrasiKeahlian[]>(dummyData);
  const [editingKonsentrasiKeahlian, setEditingKonsentrasiKeahlian] = useState<KonsentrasiKeahlian | null>(null);
  const [openActionId, setOpenActionId] = useState<string | null>(null);
  const [isEditMode, setIsEditMode] = useState(false);
  const [formData, setFormData] = useState({ namaJurusan: "", kodeJurusan: "" });
  const [errorMessage, setErrorMessage] = useState("");

  /* ===================== FILTER ===================== */
  const filteredData = konsentrasiKeahlianList.filter(
    (k) =>
      k.kode.toLowerCase().includes(searchValue.toLowerCase()) ||
      k.nama.toLowerCase().includes(searchValue.toLowerCase())
  );

  /* ===================== VALIDASI UNIK ===================== */
  const checkDuplicate = (kode: string, nama: string, excludeId?: string) => {
    return konsentrasiKeahlianList.some(
      (k) =>
        (k.kode.toLowerCase() === kode.toLowerCase() || 
         k.nama.toLowerCase() === nama.toLowerCase()) &&
        k.id !== excludeId
    );
  };

  /* ===================== HANDLER FUNCTIONS ===================== */
  const handleDelete = (row: KonsentrasiKeahlian) => {
    if (confirm(`Hapus "${row.nama}"?`)) {
      setKonsentrasiKeahlianList((prev) => prev.filter((k) => k.id !== row.id));
      setOpenActionId(null);
    }
  };

  const handleEditKonsentrasi = (konsentrasi: KonsentrasiKeahlian) => {
    setEditingKonsentrasiKeahlian(konsentrasi);
    setIsEditMode(true);
    setFormData({
      namaJurusan: konsentrasi.nama,
      kodeJurusan: konsentrasi.kode
    });
    setShowPopup(true);
    setErrorMessage("");
    setOpenActionId(null);
  };

  const handleTambahKonsentrasi = () => {
    setEditingKonsentrasiKeahlian(null);
    setIsEditMode(false);
    setFormData({ namaJurusan: "", kodeJurusan: "" });
    setShowPopup(true);
    setErrorMessage("");
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validasi input
    if (!formData.namaJurusan.trim() || !formData.kodeJurusan.trim()) {
      setErrorMessage("Nama dan kode konsentrasi keahlian harus diisi");
      return;
    }

    // Validasi format kode (huruf dan angka saja, maks 10 karakter)
    const kodeRegex = /^[a-zA-Z0-9]{1,10}$/;
    if (!kodeRegex.test(formData.kodeJurusan)) {
      setErrorMessage("Kode hanya boleh berisi huruf dan angka, maksimal 10 karakter");
      return;
    }

    // Validasi duplikasi
    const isDuplicate = checkDuplicate(
      formData.kodeJurusan, 
      formData.namaJurusan, 
      editingKonsentrasiKeahlian?.id
    );

    if (isDuplicate) {
      setErrorMessage("Kode atau nama konsentrasi keahlian sudah ada. Harap gunakan yang berbeda.");
      return;
    }

    if (isEditMode && editingKonsentrasiKeahlian) {
      // Mode edit
      setKonsentrasiKeahlianList((prev) =>
        prev.map((k) =>
          k.id === editingKonsentrasiKeahlian.id
            ? { ...k, nama: formData.namaJurusan, kode: formData.kodeJurusan }
            : k
        )
      );
      alert(`Konsentrasi keahlian "${formData.namaJurusan}" berhasil diperbarui!`);
    } else {
      // Mode tambah
      setKonsentrasiKeahlianList((prev) => [
        ...prev,
        {
          id: Date.now().toString(),
          nama: formData.namaJurusan,
          kode: formData.kodeJurusan,
        },
      ]);
      alert(`Konsentrasi keahlian "${formData.namaJurusan}" berhasil ditambahkan!`);
    }
    
    handleClosePopup();
  };

  const handleClosePopup = () => {
    setShowPopup(false);
    setEditingKonsentrasiKeahlian(null);
    setIsEditMode(false);
    setFormData({ namaJurusan: "", kodeJurusan: "" });
    setErrorMessage("");
  };

  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear error message when user starts typing
    if (errorMessage) {
      setErrorMessage("");
    }
  };

  useEffect(() => {
    if (editingKonsentrasiKeahlian && isEditMode) {
      setFormData({
        namaJurusan: editingKonsentrasiKeahlian.nama,
        kodeJurusan: editingKonsentrasiKeahlian.kode
      });
    }
  }, [editingKonsentrasiKeahlian, isEditMode]);

  return (
    <AdminLayout
      pageTitle="Data Konsentrasi Keahlian"
      currentPage={currentPage}
      onMenuClick={onMenuClick}
      user={user}
      onLogout={onLogout}
      hideBackground
    >
      {/* Background images */}
      <img src={AWANKIRI} style={bgLeft} alt="Background awan kiri" />
      <img src={AwanBawahkanan} style={bgRight} alt="Background awan kanan bawah" />

      {/* Container utama untuk konten */}
      <div
        style={{
          background: "rgba(255,255,255,0.85)",
          backdropFilter: "blur(6px)",
          borderRadius: 16,
          padding: 24,
          boxShadow: "0 10px 30px rgba(0,0,0,0.08)",
          border: "1px solid rgba(255,255,255,0.6)",
          display: "flex",
          flexDirection: "column",
          gap: 24,
          position: "relative",
          zIndex: 1,
          minHeight: "70vh",
        }}
      >
        {/* HEADER dengan search dan tombol tambah */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <div style={{ width: 300 }}>
            <SearchBox
              placeholder="Cari Konsentrasi Keahlian.."
              value={searchValue}
              onChange={setSearchValue}
            />
          </div>
          <Button label="Tambahkan" onClick={handleTambahKonsentrasi} />
        </div>

        {/* TABLE WRAPPER */}
        <div
          style={{
            borderRadius: 12,
            overflow: "hidden",
            boxShadow: "0 0 0 1px #E5E7EB",
          }}
        >
          <table style={{
            width: '100%',
            borderCollapse: 'collapse',
            backgroundColor: '#FFFFFF',
          }}>
            <thead>
              <tr style={{
                backgroundColor: '#F3F4F6',
                borderBottom: '1px solid #E5E7EB',
              }}>
                <th style={{
                  padding: '12px 16px',
                  textAlign: 'center',
                  fontSize: '13px',
                  fontWeight: '600',
                  color: '#374151',
                  borderRight: '1px solid #E5E7EB',
                }}>No</th>
                <th style={{
                  padding: '12px 16px',
                  textAlign: 'center',
                  fontSize: '13px',
                  fontWeight: '600',
                  color: '#374151',
                  borderRight: '1px solid #E5E7EB',
                }}>Kode Konsentrasi Keahlian</th>
                <th style={{
                  padding: '12px 16px',
                  textAlign: 'center',
                  fontSize: '13px',
                  fontWeight: '600',
                  color: '#374151',
                  borderRight: '1px solid #E5E7EB',
                }}>Konsentrasi Keahlian</th>
                <th style={{
                  padding: '12px 16px',
                  textAlign: 'center',
                  fontSize: '13px',
                  fontWeight: '600',
                  color: '#374151',
                }}>Aksi</th>
              </tr>
            </thead>
            <tbody>
              {filteredData.map((row, index) => (
                <tr key={row.id} style={{
                  borderBottom: '1px solid #E5E7EB',
                  backgroundColor: index % 2 === 0 ? '#FFFFFF' : '#F9FAFB',
                  transition: 'background-color 0.2s',
                }}
                onMouseEnter={(e) => {
                  (e.currentTarget as HTMLTableRowElement).style.backgroundColor = '#F0F4FF';
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLTableRowElement).style.backgroundColor = index % 2 === 0 ? '#FFFFFF' : '#F9FAFB';
                }}>
                  <td style={{
                    padding: '12px 16px',
                    fontSize: '13px',
                    color: '#374151',
                    textAlign: 'center',
                    borderRight: '1px solid #E5E7EB',
                  }}>{index + 1}</td>
                  <td style={{
                    padding: '12px 16px',
                    fontSize: '13px',
                    color: '#374151',
                    textAlign: 'center',
                    borderRight: '1px solid #E5E7EB',
                  }}>{row.kode}</td>
                  <td style={{
                    padding: '12px 16px',
                    fontSize: '13px',
                    color: '#374151',
                    textAlign: 'center',
                    borderRight: '1px solid #E5E7EB',
                  }}>{row.nama}</td>
                  <td style={{
                    padding: '12px 16px',
                    fontSize: '13px',
                    color: '#374151',
                    textAlign: 'center',
                    position: 'relative',
                  }}>
                    <button
                      onClick={() => setOpenActionId(openActionId === row.id ? null : row.id)}
                      style={{
                        border: 'none',
                        background: 'transparent',
                        cursor: 'pointer',
                        padding: '4px 8px',
                        borderRadius: '4px',
                        display: 'inline-flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.backgroundColor = '#F3F4F6';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor = 'transparent';
                      }}
                    >
                      <MoreVertical size={20} strokeWidth={1.5} />
                    </button>

                    {openActionId === row.id && (
                      <div
                        style={{
                          position: 'absolute',
                          top: '100%',
                          right: 0,
                          marginTop: 6,
                          background: '#FFFFFF',
                          borderRadius: 8,
                          boxShadow: '0 10px 15px rgba(0,0,0,0.1)',
                          minWidth: 180,
                          zIndex: 10,
                          overflow: 'hidden',
                          border: '1px solid #E2E8F0',
                        }}
                      >
                        <button
                          onClick={() => handleEditKonsentrasi(row)}
                          style={actionItemStyle}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.backgroundColor = '#F0F4FF';
                            e.currentTarget.style.color = '#2563EB';
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.backgroundColor = '#FFFFFF';
                            e.currentTarget.style.color = '#0F172A';
                          }}
                        >
                          <Edit size={16} strokeWidth={2} />
                          Ubah
                        </button>

                        <button
                          onClick={() => handleDelete(row)}
                          style={{ ...actionItemStyle, borderBottom: "none" }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.backgroundColor = '#FEF2F2';
                            e.currentTarget.style.color = '#DC2626';
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.backgroundColor = '#FFFFFF';
                            e.currentTarget.style.color = '#0F172A';
                          }}
                        >
                          <Trash2 size={16} strokeWidth={2} />
                          Hapus
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* POPUP FORM - Header dengan warna #1e293b */}
      {showPopup && (
        <div style={popupOverlayStyle}>
          <div style={popupStyle}>
            {/* Header popup dengan background #1e293b */}
            <div style={popupHeaderStyle}>
              <div style={headerContentStyle}>
                <h2 style={popupTitleStyle}>
                  {isEditMode ? "Ubah Konsentrasi Keahlian" : "Tambah Konsentrasi Keahlian"}
                </h2>
              </div>
              <button
                onClick={handleClosePopup}
                style={closeButtonStyle}
              >
                <X size={20} color="#FFFFFF" />
              </button>
            </div>

            {/* Form content */}
            <form onSubmit={handleSubmit}>
              <div style={popupContentStyle}>
                {/* Nama Konsentrasi Keahlian */}
                <div style={formGroupStyle}>
                  <label style={labelStyle}>
                    Nama Konsentrasi Keahlian<span style={requiredStarStyle}>*</span>
                  </label>
                  <input
                    type="text"
                    name="namaJurusan"
                    value={formData.namaJurusan}
                    onChange={handleFormChange}
                    placeholder="Masukan nama konsentrasi keahlian"
                    style={inputStyle}
                    autoFocus
                  />
                </div>

                {/* Kode Konsentrasi Keahlian */}
                <div style={formGroupStyle}>
                  <label style={labelStyle}>
                    Kode Konsentrasi Keahlian<span style={requiredStarStyle}>*</span>
                  </label>
                  <input
                    type="text"
                    name="kodeJurusan"
                    value={formData.kodeJurusan}
                    onChange={handleFormChange}
                    placeholder="Masukan kode konsentrasi keahlian"
                    style={inputStyle}
                    maxLength={10}
                  />
                  <div style={characterInfoStyle}>
                    <span style={characterHintStyle}>Huruf dan angka saja, maks. 10 karakter</span>
                    <span style={characterCounterStyle}>
                      {formData.kodeJurusan.length}/10
                    </span>
                  </div>
                </div>

                {/* Error message */}
                {errorMessage && (
                  <div style={errorStyle}>
                    {errorMessage}
                  </div>
                )}
              </div>

              {/* Footer popup */}
              <div style={popupFooterStyle}>
                <button
                  type="button"
                  onClick={handleClosePopup}
                  style={cancelButtonStyle}
                >
                  Batal
                </button>
                <button
                  type="submit"
                  style={submitButtonStyle}
                >
                  {isEditMode ? "Perbarui" : "Tambahkan"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <style>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        input:focus {
          outline: none;
          border-color: #2563eb;
          box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.1);
        }

        ${closeButtonStyle}:hover {
          background-color: rgba(255, 255, 255, 0.1);
        }

        ${cancelButtonStyle}:hover {
          background-color: #f3f4f6;
          border-color: #9ca3af;
        }

        ${submitButtonStyle}:hover {
          background-color: #1d4ed8;
          transform: translateY(-1px);
          box-shadow: 0 4px 12px rgba(37, 99, 235, 0.3);
        }
      `}</style>
    </AdminLayout>
  );
}

/* ===================== STYLE ===================== */
const actionItemStyle: React.CSSProperties = {
  width: "100%",
  padding: "12px 16px",
  border: "none",
  background: "none",
  textAlign: "left",
  cursor: "pointer",
  display: "flex",
  alignItems: "center",
  gap: 10,
  color: "#0F172A",
  fontSize: 14,
  fontWeight: 500,
  transition: "all 0.2s ease",
  borderBottom: "1px solid #F1F5F9",
};

const bgLeft: React.CSSProperties = {
  position: "fixed",
  top: 0,
  left: 0,
  width: 220,
  zIndex: 0,
  pointerEvents: "none",
};

const bgRight: React.CSSProperties = {
  position: "fixed",
  bottom: 0,
  right: 0,
  width: 220,
  zIndex: 0,
  pointerEvents: "none",
};

/* ===================== POPUP STYLE ===================== */
const popupOverlayStyle: React.CSSProperties = {
  position: "fixed",
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  backgroundColor: "rgba(0, 0, 0, 0.5)",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  zIndex: 1000,
  backdropFilter: "blur(2px)",
};

const popupStyle: React.CSSProperties = {
  backgroundColor: "#FFFFFF",
  borderRadius: "12px",
  width: "500px",
  maxWidth: "90%",
  boxShadow: "0 20px 40px rgba(0, 0, 0, 0.25)",
  overflow: "hidden",
  animation: "fadeIn 0.2s ease-out",
  border: "1px solid #e5e7eb",
};

const popupHeaderStyle: React.CSSProperties = {
  padding: "24px 32px",
  backgroundColor: "#1e293b",
  color: "#FFFFFF",
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  position: "relative",
};

const headerContentStyle: React.CSSProperties = {
  flex: 1,
};

const popupTitleStyle: React.CSSProperties = {
  margin: 0,
  fontSize: "20px",
  fontWeight: "600",
  color: "#FFFFFF",
  letterSpacing: "0.5px",
};

const closeButtonStyle: React.CSSProperties = {
  background: "transparent",
  border: "none",
  cursor: "pointer",
  padding: "6px",
  borderRadius: "6px",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  transition: "all 0.2s ease",
  marginLeft: "16px",
};

const popupContentStyle: React.CSSProperties = {
  padding: "32px",
  backgroundColor: "#FFFFFF",
};

const formGroupStyle: React.CSSProperties = {
  marginBottom: "28px",
};

const labelStyle: React.CSSProperties = {
  display: "block",
  marginBottom: "10px",
  fontWeight: "600",
  fontSize: "14px",
  color: "#374151",
  fontFamily: "'Inter', sans-serif",
};

const requiredStarStyle: React.CSSProperties = {
  color: "#ef4444",
  marginLeft: "4px",
};

const inputStyle: React.CSSProperties = {
  width: "100%",
  padding: "14px 16px",
  border: "2px solid #d1d5db",
  borderRadius: "8px",
  fontSize: "15px",
  color: "#1f2937",
  boxSizing: "border-box",
  transition: "all 0.2s ease",
  backgroundColor: "#FFFFFF",
  fontFamily: "'Inter', sans-serif",
};

const characterInfoStyle: React.CSSProperties = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  marginTop: "8px",
  fontSize: "13px",
  color: "#6b7280",
  fontFamily: "'Inter', sans-serif",
};

const characterHintStyle: React.CSSProperties = {
  color: "#6b7280",
};

const characterCounterStyle: React.CSSProperties = {
  color: "#6b7280",
  fontWeight: "500",
};

const errorStyle: React.CSSProperties = {
  backgroundColor: "#fef2f2",
  color: "#dc2626",
  padding: "12px 16px",
  borderRadius: "8px",
  fontSize: "14px",
  marginTop: "16px",
  border: "1px solid #fecaca",
  fontFamily: "'Inter', sans-serif",
};

const popupFooterStyle: React.CSSProperties = {
  padding: "24px 32px",
  backgroundColor: "#FFFFFF",
  borderTop: "1px solid #e5e7eb",
  display: "flex",
  justifyContent: "flex-end",
  gap: "16px",
};

const cancelButtonStyle: React.CSSProperties = {
  padding: "12px 28px",
  backgroundColor: "#FFFFFF",
  color: "#374151",
  border: "2px solid #d1d5db",
  borderRadius: "8px",
  fontSize: "15px",
  fontWeight: "600",
  cursor: "pointer",
  transition: "all 0.2s ease",
  fontFamily: "'Inter', sans-serif",
  minWidth: "100px",
};

const submitButtonStyle: React.CSSProperties = {
  padding: "12px 28px",
  backgroundColor: "#2563eb",
  color: "#FFFFFF",
  border: "none",
  borderRadius: "8px",
  fontSize: "15px",
  fontWeight: "600",
  cursor: "pointer",
  transition: "all 0.2s ease",
  fontFamily: "'Inter', sans-serif",
  minWidth: "120px",
  boxShadow: "0 2px 4px rgba(37, 99, 235, 0.2)",
};