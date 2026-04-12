// JurusanAdmin.tsx - Halaman admin untuk mengelola data konsentrasi keahlian (jurusan) - Refactored
import { masterService, type Major } from "../../services/masterService";
import React, { useState, useEffect } from "react";
import AdminLayout from "../../component/Admin/AdminLayout";
import { Button } from "../../component/Shared/Button";
import { SearchBox } from "../../component/Shared/Search";
import AWANKIRI from "../../assets/Icon/AWANKIRI.png";
import AwanBawahkanan from "../../assets/Icon/AwanBawahkanan.png";
import { MoreVertical, Edit, Trash2, X } from "lucide-react";

interface User {
  role: string;
  name: string;
}

interface KonsentrasiKeahlianAdminProps {
  user: User;
  onLogout: () => void;
  currentPage: string;
  onMenuClick: (page: string) => void;
}


/* ===================== COMPONENT ===================== */
export default function KonsentrasiKeahlianAdmin({
  user,
  onLogout,
  currentPage,
  onMenuClick,
}: KonsentrasiKeahlianAdminProps) {
  const [searchValue, setSearchValue] = useState("");
  const [showPopup, setShowPopup] = useState(false);
  const [konsentrasiKeahlianList, setKonsentrasiKeahlianList] = useState<Major[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [editingKonsentrasiKeahlian, setEditingKonsentrasiKeahlian] = useState<Major | null>(null);
  const [openActionId, setOpenActionId] = useState<number | null>(null);
  const [isEditMode, setIsEditMode] = useState(false);
  const [formData, setFormData] = useState({ name: "", code: "", bidang_keahlian: "", program_keahlian: "" });
  const [errorMessage, setErrorMessage] = useState("");

  /* ===================== FETCH DATA ===================== */
  useEffect(() => {
    fetchJurusans();
  }, []);

  const fetchJurusans = async () => {
    setIsLoading(true);
    try {
      const data = await masterService.getMajors();
      setKonsentrasiKeahlianList(Array.isArray(data) ? data : (data.data || []));
    } catch (error) {
      console.error("Failed to fetch majors:", error);
    } finally {
      setIsLoading(false);
    }
  };

  /* ===================== FILTER ===================== */
  const filteredData = konsentrasiKeahlianList.filter(
    (k) =>
      k.code.toLowerCase().includes(searchValue.toLowerCase()) ||
      k.name.toLowerCase().includes(searchValue.toLowerCase()) ||
      (k.bidang_keahlian || "").toLowerCase().includes(searchValue.toLowerCase()) ||
      (k.program_keahlian || "").toLowerCase().includes(searchValue.toLowerCase())
  );

  /* ===================== VALIDASI UNIK ===================== */
  const checkDuplicate = (code: string, name: string, excludeId?: number) => {
    return konsentrasiKeahlianList.some(
      (k) =>
        (k.code.toLowerCase() === code.toLowerCase() ||
          k.name.toLowerCase() === name.toLowerCase()) &&
        k.id !== excludeId
    );
  };

  /* ===================== HANDLER FUNCTIONS ===================== */
  const handleDelete = async (row: Major) => {
    if (confirm(`Hapus "${row.name}"?`)) {
      try {
        await masterService.deleteMajor(row.id);
        setKonsentrasiKeahlianList((prev) => prev.filter((k) => k.id !== row.id));
        setOpenActionId(null);
      } catch (error) {
        console.error("Failed to delete major:", error);
        alert("Gagal menghapus jurusan");
      }
    }
  };

  const handleEditKonsentrasi = (konsentrasi: Major) => {
    setEditingKonsentrasiKeahlian(konsentrasi);
    setIsEditMode(true);
    setFormData({
      name: konsentrasi.name,
      code: konsentrasi.code,
      bidang_keahlian: konsentrasi.bidang_keahlian || "",
      program_keahlian: konsentrasi.program_keahlian || ""
    });
    setShowPopup(true);
    setErrorMessage("");
    setOpenActionId(null);
  };

  const handleTambahKonsentrasi = () => {
    setEditingKonsentrasiKeahlian(null);
    setIsEditMode(false);
    setFormData({ name: "", code: "", bidang_keahlian: "", program_keahlian: "" });
    setShowPopup(true);
    setErrorMessage("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validasi input
    if (!formData.name.trim() || !formData.code.trim() || !formData.bidang_keahlian.trim() || !formData.program_keahlian.trim()) {
      setErrorMessage("Nama, kode, bidang keahlian, dan program keahlian harus diisi");
      return;
    }

    // Validasi format kode (huruf dan angka saja, maks 20 karakter)
    const kodeRegex = /^[a-zA-Z0-9]{1,20}$/;
    if (!kodeRegex.test(formData.code)) {
      setErrorMessage("Kode hanya boleh berisi huruf dan angka, maksimal 20 karakter");
      return;
    }

    // Validasi duplikasi
    const isDuplicate = checkDuplicate(
      formData.code,
      formData.name,
      editingKonsentrasiKeahlian?.id
    );

    if (isDuplicate) {
      setErrorMessage("Kode atau nama konsentrasi keahlian sudah ada. Harap gunakan yang berbeda.");
      return;
    }

    if (isEditMode && editingKonsentrasiKeahlian) {
      // Mode edit
      try {
        const updated = await masterService.updateMajor(editingKonsentrasiKeahlian.id, formData);
        setKonsentrasiKeahlianList((prev) =>
          prev.map((k) => (k.id === editingKonsentrasiKeahlian.id ? updated : k))
        );
        alert(`Konsentrasi keahlian "${formData.name}" berhasil diperbarui!`);
      } catch (error) {
        console.error("Failed to update major:", error);
        setErrorMessage("Gagal memperbarui data");
        return;
      }
    } else {
      // Mode tambah
      try {
        const newItem = await masterService.addMajor(formData);
        setKonsentrasiKeahlianList((prev) => [...prev, newItem]);
        alert(`Konsentrasi keahlian "${formData.name}" berhasil ditambahkan!`);
      } catch (error) {
        console.error("Failed to add major:", error);
        setErrorMessage("Gagal menambahkan data");
        return;
      }
    }

    handleClosePopup();
  };

  const handleClosePopup = () => {
    setShowPopup(false);
    setEditingKonsentrasiKeahlian(null);
    setIsEditMode(false);
    setFormData({ name: "", code: "", bidang_keahlian: "", program_keahlian: "" });
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
        name: editingKonsentrasiKeahlian.name,
        code: editingKonsentrasiKeahlian.code,
        bidang_keahlian: editingKonsentrasiKeahlian.bidang_keahlian || "",
        program_keahlian: editingKonsentrasiKeahlian.program_keahlian || ""
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
        {/* STATS CARDS */}
        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
          gap: "24px",
          marginBottom: "10px",
        }}>
          <div style={{
            backgroundColor: "#FFFFFF",
            borderRadius: "16px",
            padding: "24px",
            display: "flex",
            alignItems: "center",
            gap: "20px",
            boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)",
            transition: "transform 0.2s ease, box-shadow 0.2s ease",
          }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = "translateY(-4px)";
              e.currentTarget.style.boxShadow = "0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = "translateY(0)";
              e.currentTarget.style.boxShadow = "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)";
            }}
          >
            <div style={{
              width: "56px",
              height: "56px",
              borderRadius: "50%",
              backgroundColor: "#EEF2FF",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}>
              <span style={{ fontSize: "28px" }}>🎓</span>
            </div>
            <div>
              <div style={{ fontSize: "28px", fontWeight: "700", color: "#1F2937", lineHeight: "1.2" }}>
                {konsentrasiKeahlianList.length}
              </div>
              <div style={{ fontSize: "14px", color: "#6B7280", fontWeight: "500" }}>Total Konsentrasi</div>
            </div>
          </div>

          <div style={{
            backgroundColor: "#FFFFFF",
            borderRadius: "16px",
            padding: "24px",
            display: "flex",
            alignItems: "center",
            gap: "20px",
            boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)",
            transition: "transform 0.2s ease, box-shadow 0.2s ease",
          }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = "translateY(-4px)";
              e.currentTarget.style.boxShadow = "0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = "translateY(0)";
              e.currentTarget.style.boxShadow = "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)";
            }}
          >
            <div style={{
              width: "56px",
              height: "56px",
              borderRadius: "50%",
              backgroundColor: "#FFF7ED",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}>
              <span style={{ fontSize: "28px" }}>🏷️</span>
            </div>
            <div>
              <div style={{ fontSize: "28px", fontWeight: "700", color: "#1F2937", lineHeight: "1.2" }}>
                {new Set(konsentrasiKeahlianList.map(k => k.bidang_keahlian || k.program_keahlian)).size}
              </div>
              <div style={{ fontSize: "14px", color: "#6B7280", fontWeight: "500" }}>Total Bidang</div>
            </div>
          </div>
        </div>

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
                  borderRight: '1px solid #E5E7EB',
                }}>Bidang Keahlian</th>
                <th style={{
                  padding: '12px 16px',
                  textAlign: 'center',
                  fontSize: '13px',
                  fontWeight: '600',
                  color: '#374151',
                  borderRight: '1px solid #E5E7EB',
                }}>Program Keahlian</th>
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
              {isLoading ? (
                <tr>
                  <td colSpan={6} style={{ padding: '24px', textAlign: 'center', color: '#64748B' }}>
                    Memuat data...
                  </td>
                </tr>
              ) : filteredData.length === 0 ? (
                <tr>
                  <td colSpan={6} style={{ padding: '24px', textAlign: 'center', color: '#64748B' }}>
                    Tidak ada data ditemukan
                  </td>
                </tr>
              ) : (
                filteredData.map((row, index) => (
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
                    }}>{row.code}</td>
                    <td style={{
                      padding: '12px 16px',
                      fontSize: '13px',
                      color: '#374151',
                      textAlign: 'center',
                      borderRight: '1px solid #E5E7EB',
                    }}>{row.name}</td>
                    <td style={{
                      padding: '12px 16px',
                      fontSize: '13px',
                      color: '#374151',
                      textAlign: 'center',
                      borderRight: '1px solid #E5E7EB',
                    }}>{row.bidang_keahlian || '-'}</td>
                    <td style={{
                      padding: '12px 16px',
                      fontSize: '13px',
                      color: '#374151',
                      textAlign: 'center',
                      borderRight: '1px solid #E5E7EB',
                    }}>{row.program_keahlian || '-'}</td>
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
                          >
                            <Edit size={16} strokeWidth={2} />
                            Ubah
                          </button>

                          <button
                            onClick={() => handleDelete(row)}
                            style={{ ...actionItemStyle, borderBottom: "none" }}
                          >
                            <Trash2 size={16} strokeWidth={2} />
                            Hapus
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* POPUP FORM */}
      {showPopup && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          display: 'flex', alignItems: 'flex-start', justifyContent: 'center',
          zIndex: 9999, backdropFilter: 'blur(4px)',
          padding: '20px', paddingTop: '100px', overflowY: 'auto', paddingBottom: '40px',
        }}>
          <div style={{
            backgroundColor: '#FFFFFF', borderRadius: '16px',
            width: '100%', maxWidth: '420px',
            overflow: 'auto', maxHeight: '75vh',
            boxShadow: '0 20px 40px rgba(0, 0, 0, 0.3)',
          }}>
            {/* Header */}
            <div style={{
              padding: '20px 28px', backgroundColor: '#1e293b', color: '#FFFFFF',
              display: 'flex', justifyContent: 'space-between', alignItems: 'center',
              borderRadius: '16px 16px 0 0',
            }}>
              <h2 style={{
                margin: 0, fontSize: '18px', fontWeight: '700', letterSpacing: '-0.3px',
                fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
              }}>
                {isEditMode ? "Ubah Konsentrasi Keahlian" : "Tambah Konsentrasi Keahlian"}
              </h2>
              <button
                onClick={handleClosePopup}
                style={{
                  background: 'transparent', border: 'none', cursor: 'pointer',
                  padding: '6px', borderRadius: '8px', display: 'flex',
                  alignItems: 'center', justifyContent: 'center',
                  transition: 'all 0.2s ease', color: '#FFFFFF',
                }}
                onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.1)'; }}
                onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'transparent'; }}
              >
                <X size={24} strokeWidth={2} />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} style={{ padding: '24px' }}>
              {/* Nama */}
              <div style={{ marginBottom: '18px' }}>
                <label style={{
                  display: 'block', marginBottom: '8px', fontWeight: '700',
                  fontSize: '14px', color: '#1e293b',
                  fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
                }}>
                  Nama Konsentrasi Keahlian<span style={{ color: '#ef4444', marginLeft: '6px', fontWeight: '700' }}>*</span>
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleFormChange}
                  placeholder="Masukan nama konsentrasi keahlian"
                  style={{
                    width: '100%', padding: '10px 12px', border: '2px solid #e2e8f0',
                    borderRadius: '8px', fontSize: '14px', boxSizing: 'border-box',
                    outline: 'none', backgroundColor: '#f8fafc', transition: 'all 0.2s ease',
                    fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
                  }}
                  onFocus={(e) => { e.currentTarget.style.borderColor = '#3b82f6'; e.currentTarget.style.backgroundColor = '#ffffff'; e.currentTarget.style.boxShadow = '0 0 0 3px rgba(59, 130, 246, 0.1)'; }}
                  onBlur={(e) => { e.currentTarget.style.borderColor = '#e2e8f0'; e.currentTarget.style.backgroundColor = '#f8fafc'; e.currentTarget.style.boxShadow = 'none'; }}
                  autoFocus
                />
              </div>

              {/* Kode */}
              <div style={{ marginBottom: '18px' }}>
                <label style={{
                  display: 'block', marginBottom: '8px', fontWeight: '700',
                  fontSize: '14px', color: '#1e293b',
                  fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
                }}>
                  Kode Konsentrasi Keahlian<span style={{ color: '#ef4444', marginLeft: '6px', fontWeight: '700' }}>*</span>
                </label>
                <input
                  type="text"
                  name="code"
                  value={formData.code}
                  onChange={handleFormChange}
                  placeholder="Masukan kode konsentrasi keahlian"
                  style={{
                    width: '100%', padding: '10px 12px', border: '2px solid #e2e8f0',
                    borderRadius: '8px', fontSize: '14px', boxSizing: 'border-box',
                    outline: 'none', backgroundColor: '#f8fafc', transition: 'all 0.2s ease',
                    fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
                  }}
                  onFocus={(e) => { e.currentTarget.style.borderColor = '#3b82f6'; e.currentTarget.style.backgroundColor = '#ffffff'; e.currentTarget.style.boxShadow = '0 0 0 3px rgba(59, 130, 246, 0.1)'; }}
                  onBlur={(e) => { e.currentTarget.style.borderColor = '#e2e8f0'; e.currentTarget.style.backgroundColor = '#f8fafc'; e.currentTarget.style.boxShadow = 'none'; }}
                  maxLength={20}
                />
                <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '4px', fontSize: '11px', color: '#94a3b8' }}>
                  <span>Huruf dan angka saja, maks. 20 karakter</span>
                  <span>{formData.code.length}/20</span>
                </div>
              </div>

              {/* Bidang Keahlian */}
              <div style={{ marginBottom: '18px' }}>
                <label style={{
                  display: 'block', marginBottom: '8px', fontWeight: '700',
                  fontSize: '14px', color: '#1e293b',
                  fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
                }}>
                  Bidang Keahlian<span style={{ color: '#ef4444', marginLeft: '6px', fontWeight: '700' }}>*</span>
                </label>
                <input
                  type="text"
                  name="bidang_keahlian"
                  value={formData.bidang_keahlian}
                  onChange={handleFormChange}
                  placeholder="Masukan bidang keahlian"
                  style={{
                    width: '100%', padding: '10px 12px', border: '2px solid #e2e8f0',
                    borderRadius: '8px', fontSize: '14px', boxSizing: 'border-box',
                    outline: 'none', backgroundColor: '#f8fafc', transition: 'all 0.2s ease',
                    fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
                  }}
                  onFocus={(e) => { e.currentTarget.style.borderColor = '#3b82f6'; e.currentTarget.style.backgroundColor = '#ffffff'; e.currentTarget.style.boxShadow = '0 0 0 3px rgba(59, 130, 246, 0.1)'; }}
                  onBlur={(e) => { e.currentTarget.style.borderColor = '#e2e8f0'; e.currentTarget.style.backgroundColor = '#f8fafc'; e.currentTarget.style.boxShadow = 'none'; }}
                />
              </div>

              {/* Program Keahlian */}
              <div style={{ marginBottom: '24px' }}>
                <label style={{
                  display: 'block', marginBottom: '8px', fontWeight: '700',
                  fontSize: '14px', color: '#1e293b',
                  fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
                }}>
                  Program Keahlian<span style={{ color: '#ef4444', marginLeft: '6px', fontWeight: '700' }}>*</span>
                </label>
                <input
                  type="text"
                  name="program_keahlian"
                  value={formData.program_keahlian}
                  onChange={handleFormChange}
                  placeholder="Masukan program keahlian"
                  style={{
                    width: '100%', padding: '10px 12px', border: '2px solid #e2e8f0',
                    borderRadius: '8px', fontSize: '14px', boxSizing: 'border-box',
                    outline: 'none', backgroundColor: '#f8fafc', transition: 'all 0.2s ease',
                    fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
                  }}
                  onFocus={(e) => { e.currentTarget.style.borderColor = '#3b82f6'; e.currentTarget.style.backgroundColor = '#ffffff'; e.currentTarget.style.boxShadow = '0 0 0 3px rgba(59, 130, 246, 0.1)'; }}
                  onBlur={(e) => { e.currentTarget.style.borderColor = '#e2e8f0'; e.currentTarget.style.backgroundColor = '#f8fafc'; e.currentTarget.style.boxShadow = 'none'; }}
                />
              </div>

              {/* Error */}
              {errorMessage && (
                <div style={{
                  backgroundColor: '#fef2f2', color: '#dc2626', padding: '10px 12px',
                  borderRadius: '6px', fontSize: '12px', marginBottom: '18px',
                  border: '1px solid #fecaca', fontWeight: '500',
                  fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
                }}>
                  {errorMessage}
                </div>
              )}

              {/* Buttons */}
              <div style={{ display: 'flex', gap: '10px', justifyContent: 'center' }}>
                <button
                  type="button"
                  onClick={handleClosePopup}
                  style={{
                    flex: 1, padding: '10px 20px', backgroundColor: '#f1f5f9',
                    color: '#475569', border: '2px solid #e2e8f0', borderRadius: '8px',
                    fontSize: '13px', fontWeight: '700', cursor: 'pointer', transition: 'all 0.2s ease',
                    fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
                  }}
                  onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = '#e2e8f0'; e.currentTarget.style.borderColor = '#cbd5e1'; }}
                  onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = '#f1f5f9'; e.currentTarget.style.borderColor = '#e2e8f0'; }}
                >
                  Batal
                </button>
                <button
                  type="submit"
                  style={{
                    flex: 1, padding: '10px 20px', backgroundColor: '#3b82f6',
                    color: '#FFFFFF', border: 'none', borderRadius: '8px',
                    fontSize: '13px', fontWeight: '700', cursor: 'pointer',
                    transition: 'all 0.2s ease',
                    boxShadow: '0 4px 12px rgba(59, 130, 246, 0.3)',
                    fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
                  }}
                  onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = '#2563eb'; e.currentTarget.style.boxShadow = '0 6px 16px rgba(59, 130, 246, 0.4)'; }}
                  onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = '#3b82f6'; e.currentTarget.style.boxShadow = '0 4px 12px rgba(59, 130, 246, 0.3)'; }}
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