// DetailSiswa.tsx - Halaman detail dan edit data siswa
import { useState, useEffect } from "react";
import AdminLayout from "../../component/Admin/AdminLayout";
import { ArrowLeft, Save, User, MapPin, Phone, GraduationCap, Calendar, Users, QrCode } from "lucide-react";

// ==================== INTERFACE DEFINITIONS ====================
interface User {
  role: string;
  name: string;
}

interface DetailSiswaProps {
  user: User;
  onLogout: () => void;
  currentPage: string;
  onMenuClick: (page: string) => void;
  siswaId: string;
}

interface SiswaData {
  id: string;
  nisn: string;
  namaSiswa: string;
  jenisKelamin: "Laki-Laki" | "Perempuan";
  kelas: string;
  jurusan: string;
  jurusanId?: string; // Menyimpan ID jurusan untuk mapping
  tahunAngkatan: string; // Format: "2023-2026"
  noTelp: string;
  alamat: string;
  foto: string;
  status: "Aktif" | "Lulus" | "Keluar" | "Skorsing";
  rfid?: string; // Kode kartu RFID/QR
}

// ==================== COMPONENT STYLING ====================
// Menggunakan styling yang sama dengan DetailGuru untuk konsistensi
const styles = {
  container: {
    maxWidth: "1000px",
    margin: "0 auto",
    padding: "0 4px",
    paddingBottom: "80px",
  },
  header: {
    marginBottom: "24px",
  },
  backButton: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    background: "none",
    border: "none",
    color: "#64748B",
    fontSize: "16px",
    fontWeight: "600",
    cursor: "pointer",
    padding: "8px 0",
    marginBottom: "16px",
    transition: "color 0.2s",
  },
  card: {
    background: "white",
    borderRadius: "16px",
    boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)",
    overflow: "hidden",
    marginBottom: "24px",
  },
  cardHeader: {
    padding: "24px",
    borderBottom: "1px solid #E2E8F0",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
  },
  cardTitle: {
    fontSize: "18px",
    fontWeight: "700",
    color: "#1E293B",
  },
  cardBody: {
    padding: "24px",
  },
  profileHeader: {
    display: "flex",
    flexDirection: "column" as const,
    alignItems: "center",
    padding: "40px 24px",
    background: "linear-gradient(135deg, #001F3E 0%, #0C4A6E 100%)", // Navy Theme
    color: "white",
    borderRadius: "16px 16px 0 0",
    position: "relative" as const,
  },
  avatarContainer: {
    position: "relative" as const,
    marginBottom: "16px",
  },
  avatar: {
    width: "120px",
    height: "120px",
    borderRadius: "50%",
    border: "4px solid white",
    backgroundColor: "#E2E8F0",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "48px",
    color: "#64748B",
    overflow: "hidden",
    objectFit: "cover" as const,
  },
  statusBadge: {
    position: "absolute" as const,
    bottom: "4px",
    right: "4px",
    width: "24px",
    height: "24px",
    borderRadius: "50%",
    backgroundColor: "#10B981",
    border: "3px solid white",
  },
  profileName: {
    fontSize: "24px",
    fontWeight: "700",
    marginBottom: "4px",
    textAlign: "center" as const,
  },
  profileSubtitle: {
    fontSize: "16px",
    opacity: 0.9,
    marginBottom: "16px",
    textAlign: "center" as const,
    display: "flex",
    alignItems: "center",
    gap: "6px",
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    padding: "4px 12px",
    borderRadius: "20px",
  },
  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
    gap: "24px",
  },
  formGroup: {
    marginBottom: "20px",
  },
  label: {
    display: "block",
    fontSize: "14px",
    fontWeight: "600",
    color: "#475569",
    marginBottom: "8px",
  },
  input: {
    width: "100%",
    padding: "12px 16px",
    borderRadius: "8px",
    border: "1px solid #E2E8F0",
    fontSize: "14px",
    color: "#1E293B",
    backgroundColor: "#F8FAFC",
    transition: "all 0.2s",
  },
  select: {
    width: "100%",
    padding: "12px 16px",
    borderRadius: "8px",
    border: "1px solid #E2E8F0",
    fontSize: "14px",
    color: "#1E293B",
    backgroundColor: "#F8FAFC",
    cursor: "pointer",
    appearance: "none" as const,
    backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%2364748B'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'%3E%3C/path%3E%3C/svg%3E")`,
    backgroundRepeat: "no-repeat",
    backgroundPosition: "right 16px center",
    backgroundSize: "20px",
  },
  footer: {
    position: "fixed" as const,
    bottom: 0,
    left: "280px",
    right: 0,
    padding: "16px 24px",
    backgroundColor: "white",
    borderTop: "1px solid #E2E8F0",
    display: "flex",
    justifyContent: "flex-end",
    gap: "12px",
    zIndex: 10,
    boxShadow: "0 -4px 6px -1px rgba(0, 0, 0, 0.05)",
  },
  buttonPrimary: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    backgroundColor: "#001F3E",
    color: "white",
    border: "none",
    padding: "12px 24px",
    borderRadius: "8px",
    fontSize: "14px",
    fontWeight: "600",
    cursor: "pointer",
    transition: "all 0.2s",
  },
  buttonSecondary: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    backgroundColor: "white",
    color: "#64748B",
    border: "1px solid #E2E8F0",
    padding: "12px 24px",
    borderRadius: "8px",
    fontSize: "14px",
    fontWeight: "600",
    cursor: "pointer",
    transition: "all 0.2s",
  },
  sectionTitle: {
    fontSize: "16px",
    fontWeight: "700",
    color: "#0F172A",
    marginBottom: "16px",
    display: "flex",
    alignItems: "center",
    gap: "8px",
    borderBottom: "1px solid #E2E8F0",
    paddingBottom: "8px",
  },
};

// ==================== DUMMY DATA SOURCES ====================
const JURUSAN_OPTIONS = [
  { value: "RPL", label: "Rekayasa Perangkat Lunak" },
  { value: "TKJ", label: "Teknik Komputer dan Jaringan" },
];

const KELAS_OPTIONS = [
  "X RPL 1", "X RPL 2", "X TKJ 1", "X TKJ 2",
  "XI RPL 1", "XI RPL 2", "XI TKJ 1", "XI TKJ 2",
  "XII RPL 1", "XII RPL 2", "XII TKJ 1", "XII TKJ 2"
];

const TAHUN_MASUK_OPTIONS = ["2020", "2021", "2022", "2023", "2024", "2025"];

export default function DetailSiswa({
  user,
  onLogout,
  currentPage,
  onMenuClick,
  siswaId,
}: DetailSiswaProps) {
  // ==================== STATE MANAGEMENT ====================
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState<SiswaData | null>(null);
  const [originalData, setOriginalData] = useState<SiswaData | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  
  // State for split input (Tahun Angkatan: "2023-2026")
  const [tahunMulai, setTahunMulai] = useState("");
  const [tahunAkhir, setTahunAkhir] = useState("");

  // ==================== DATA FETCHING ====================
  useEffect(() => {
    // Simulasi fetch data dari "backend" / localStorage
    // GET /api/siswa/:id
    
    setTimeout(() => {
      const dummyData: SiswaData = {
        id: siswaId,
        nisn: "0012345678",
        namaSiswa: "Ahmad Zaky",
        jenisKelamin: "Laki-Laki",
        kelas: "XI RPL 1",
        jurusan: "Rekayasa Perangkat Lunak",
        jurusanId: "RPL",
        tahunAngkatan: "2023-2026",
        noTelp: "08987654321",
        alamat: "Jl. Pendidikan No. 1, Semarang",
        foto: "", // URL foto
        status: "Aktif",
        rfid: "RFID-123456",
      };
      
      setFormData(dummyData);
      setOriginalData(JSON.parse(JSON.stringify(dummyData)));
      
      // Split tahun angkatan
      if (dummyData.tahunAngkatan.includes("-")) {
        const [mulai, akhir] = dummyData.tahunAngkatan.split("-");
        setTahunMulai(mulai);
        setTahunAkhir(akhir);
      }
      
      setLoading(false);
    }, 500);
  }, [siswaId]);

  // Update formData ketika tahun diubah
  useEffect(() => {
    if (tahunMulai && tahunAkhir && formData) {
      setFormData(prev => ({
        ...prev!,
        tahunAngkatan: `${tahunMulai}-${tahunAkhir}`
      }));
      setIsEditing(true);
    }
  }, [tahunMulai, tahunAkhir]);

  // ==================== INPUT HANDLERS ====================
  const handleInputChange = (field: keyof SiswaData, value: string) => {
    if (!formData) return;
    
    // Auto update jurusan label jika id berubah
    if (field === 'jurusanId') {
      const selectedJurusan = JURUSAN_OPTIONS.find(opt => opt.value === value);
      setFormData({
        ...formData,
        jurusanId: value,
        jurusan: selectedJurusan ? selectedJurusan.label : "",
      });
    } else {
      setFormData({
        ...formData,
        [field]: value,
      });
    }
    
    setIsEditing(true);
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewImage(reader.result as string);
        setIsEditing(true);
      };
      reader.readAsDataURL(file);
    }
  };

  // ==================== SAVE HANDLER ====================
  const handleSave = () => {
    // Validasi sederhana
    if (!formData?.namaSiswa || !formData?.nisn) {
      alert("Nama Siswa dan NISN wajib diisi!");
      return;
    }

    // Validasi NISN (harus angka)
    if (!/^\d+$/.test(formData.nisn)) {
      alert("NISN harus berupa angka!");
      return;
    }

    // TODO: BACKEND - Kirim data update ke API
    console.log("Saving data:", { ...formData, foto: previewImage || formData.foto });
    
    // Update original data
    setOriginalData(formData);
    setIsEditing(false);
    alert("Data siswa berhasil disimpan!");
    
    // Kembali ke list
    onMenuClick("siswa");
  };

  const handleCancel = () => {
    if (isEditing) {
      if (window.confirm("Ada perubahan yang belum disimpan. Yakin ingin membatalkan?")) {
        setFormData(JSON.parse(JSON.stringify(originalData)));
        // Reset tahun angkatan states
        if (originalData?.tahunAngkatan.includes("-")) {
            const [mulai, akhir] = originalData.tahunAngkatan.split("-");
            setTahunMulai(mulai);
            setTahunAkhir(akhir);
        }
        setIsEditing(false);
        setPreviewImage(null);
      }
    } else {
      onMenuClick("siswa");
    }
  };

  if (loading || !formData) {
    return (
      <AdminLayout
        pageTitle="Detail Siswa"
        currentPage={currentPage}
        onMenuClick={onMenuClick}
        user={user}
        onLogout={onLogout}
        hideBackground={false}
      >
        <div style={{ padding: "40px", textAlign: "center", color: "#64748B" }}>
            Memuat data siswa...
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout
      pageTitle="Detail Siswa"
      currentPage={currentPage}
      onMenuClick={onMenuClick}
      user={user}
      onLogout={onLogout}
      hideBackground={false}
    >
      <div style={styles.container}>
        {/* Header Navigation */}
        <div style={styles.header}>
          <button style={styles.backButton} onClick={handleCancel}>
            <ArrowLeft size={20} />
            Kembali ke Data Siswa
          </button>
        </div>

        {/* Profile Card Header */}
        <div style={{
            ...styles.card,
            overflow: "visible"
        }}>
            <div style={styles.profileHeader}>
                <div style={styles.avatarContainer}>
                    {previewImage || formData.foto ? (
                        <img 
                            src={previewImage || formData.foto} 
                            alt={formData.namaSiswa} 
                            style={styles.avatar} 
                        />
                    ) : (
                        <div style={styles.avatar}>
                            <User size={64} />
                        </div>
                    )}
                    
                    {/* Upload button overlay */}
                    <label 
                        htmlFor="foto-upload"
                        style={{
                            position: "absolute",
                            bottom: "0",
                            right: "0",
                            backgroundColor: "#3B82F6",
                            width: "32px",
                            height: "32px",
                            borderRadius: "50%",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            cursor: "pointer",
                            boxShadow: "0 2px 4px rgba(0,0,0,0.2)",
                            border: "2px solid white"
                        }}
                    >
                        <div style={{ color: "white", fontSize: "16px" }}>+</div>
                    </label>
                    <input 
                        type="file" 
                        id="foto-upload" 
                        accept="image/*" 
                        onChange={handleImageChange} 
                        style={{ display: "none" }} 
                    />

                    {/* Status Badge */}
                    <div style={{
                        ...styles.statusBadge,
                        backgroundColor: formData.status === "Aktif" ? "#10B981" : "#EF4444"
                    }} />
                </div>
                
                <h2 style={styles.profileName}>{formData.namaSiswa}</h2>
                <div style={styles.profileSubtitle}>
                    <GraduationCap size={14} />
                    {formData.kelas} - {formData.jurusanId}
                </div>
            </div>
        </div>

        {/* Form Content */}
        <div style={styles.card}>
            <div style={styles.cardHeader}>
                <h3 style={styles.cardTitle}>Data Akademik</h3>
            </div>
            <div style={styles.cardBody}>
                <div style={styles.grid}>
                    {/* Kiri - Identitas */}
                    <div>
                        <div style={styles.sectionTitle}>
                            <User size={18} /> Identitas Siswa
                        </div>
                        
                        <div style={styles.formGroup}>
                            <label style={styles.label}>Nama Lengkap</label>
                            <input
                                type="text"
                                style={styles.input}
                                value={formData.namaSiswa}
                                onChange={(e) => handleInputChange("namaSiswa", e.target.value)}
                            />
                        </div>

                        <div style={styles.formGroup}>
                            <label style={styles.label}>NISN</label>
                            <input
                                type="text"
                                style={styles.input}
                                value={formData.nisn}
                                onChange={(e) => handleInputChange("nisn", e.target.value)}
                            />
                        </div>

                        <div style={styles.formGroup}>
                            <label style={styles.label}>Jenis Kelamin</label>
                            <div style={{ display: "flex", gap: "16px", marginTop: "8px" }}>
                                <label style={{ display: "flex", alignItems: "center", gap: "8px", cursor: "pointer", fontSize: "14px" }}>
                                    <input
                                        type="radio"
                                        name="jenisKelamin"
                                        value="Laki-Laki"
                                        checked={formData.jenisKelamin === "Laki-Laki"}
                                        onChange={(e) => handleInputChange("jenisKelamin", e.target.value as any)}
                                        style={{ accentColor: "#001F3E" }}
                                    />
                                    Laki-Laki
                                </label>
                                <label style={{ display: "flex", alignItems: "center", gap: "8px", cursor: "pointer", fontSize: "14px" }}>
                                    <input
                                        type="radio"
                                        name="jenisKelamin"
                                        value="Perempuan"
                                        checked={formData.jenisKelamin === "Perempuan"}
                                        onChange={(e) => handleInputChange("jenisKelamin", e.target.value as any)}
                                        style={{ accentColor: "#001F3E" }}
                                    />
                                    Perempuan
                                </label>
                            </div>
                        </div>
                        
                        <div style={styles.formGroup}>
                            <label style={styles.label}>
                                <QrCode size={14} style={{ display: "inline", marginRight: "6px" }} />
                                Kode RFID
                            </label>
                            <input
                                type="text"
                                style={styles.input}
                                value={formData.rfid || ""}
                                onChange={(e) => handleInputChange("rfid", e.target.value)}
                                placeholder="Scan kartu RFID..."
                            />
                        </div>
                    </div>

                    {/* Kanan - Akademik */}
                    <div>
                        <div style={styles.sectionTitle}>
                            <GraduationCap size={18} /> Informasi Kelas
                        </div>

                        <div style={styles.formGroup}>
                            <label style={styles.label}>Jurusan</label>
                            <select
                                style={styles.select}
                                value={formData.jurusanId}
                                onChange={(e) => handleInputChange("jurusanId", e.target.value)}
                            >
                                <option value="">Pilih Jurusan</option>
                                {JURUSAN_OPTIONS.map((opt) => (
                                    <option key={opt.value} value={opt.value}>
                                        {opt.label}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div style={styles.formGroup}>
                            <label style={styles.label}>Kelas</label>
                            <select
                                style={styles.select}
                                value={formData.kelas}
                                onChange={(e) => handleInputChange("kelas", e.target.value)}
                            >
                                <option value="">Pilih Kelas</option>
                                {KELAS_OPTIONS.map((kls) => (
                                    <option key={kls} value={kls}>{kls}</option>
                                ))}
                            </select>
                        </div>

                         <div style={styles.formGroup}>
                            <label style={styles.label}>
                                <Calendar size={14} style={{ display: "inline", marginRight: "6px" }} />
                                Tahun Angkatan
                            </label>
                            <div style={{ display: "flex", gap: "12px", alignItems: "center" }}>
                                <select
                                    style={styles.select}
                                    value={tahunMulai}
                                    onChange={(e) => setTahunMulai(e.target.value)}
                                >
                                    <option value="">Mulai</option>
                                    {TAHUN_MASUK_OPTIONS.map(th => <option key={th} value={th}>{th}</option>)}
                                </select>
                                <span style={{ color: "#64748B" }}>s/d</span>
                                <input
                                    type="text"
                                    style={{ ...styles.input, backgroundColor: "#E2E8F0", cursor: "not-allowed" }}
                                    value={tahunAkhir}
                                    readOnly
                                    placeholder="Akhir"
                                />
                                {/* Auto-set tahun akhir usually +3 years, but here manual for now or logic elsewhere */}
                            </div>
                        </div>

                        <div style={styles.formGroup}>
                            <label style={styles.label}>Status Siswa</label>
                            <select
                                style={styles.select}
                                value={formData.status}
                                onChange={(e) => handleInputChange("status", e.target.value as any)}
                            >
                                <option value="Aktif">Aktif</option>
                                <option value="Lulus">Lulus</option>
                                <option value="Keluar">Keluar / Pindah</option>
                                <option value="Skorsing">Skorsing</option>
                            </select>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <div style={styles.card}>
            <div style={styles.cardHeader}>
                <h3 style={styles.cardTitle}>Kontak & Alamat</h3>
            </div>
            <div style={styles.cardBody}>
                <div style={styles.grid}>
                    <div style={styles.formGroup}>
                        <label style={styles.label}>
                            <Phone size={14} style={{ display: "inline", marginRight: "6px" }} />
                            Nomor Telepon / WhatsApp
                        </label>
                        <input
                            type="tel"
                            style={styles.input}
                            value={formData.noTelp}
                            onChange={(e) => handleInputChange("noTelp", e.target.value)}
                            placeholder="Contoh: 0812..."
                        />
                    </div>
                    
                    <div style={{ ...styles.formGroup, gridColumn: "1 / -1" }}>
                        <label style={styles.label}>
                            <MapPin size={14} style={{ display: "inline", marginRight: "6px" }} />
                            Alamat Lengkap
                        </label>
                        <textarea
                            style={{ ...styles.input, minHeight: "100px", resize: "vertical" }}
                            value={formData.alamat}
                            onChange={(e) => handleInputChange("alamat", e.target.value)}
                            placeholder="Alamat domisili saat ini..."
                        />
                    </div>
                </div>
            </div>
        </div>
      </div>

      {/* FOOTER ACTIONS */}
      <div style={styles.footer}>
        <button 
            style={styles.buttonSecondary}
            onClick={handleCancel}
        >
            Batal
        </button>
        <button 
            style={{
                ...styles.buttonPrimary,
                opacity: isEditing ? 1 : 0.7,
                cursor: isEditing ? "pointer" : "not-allowed"
            }}
            onClick={handleSave}
            disabled={!isEditing}
        >
            <Save size={18} />
            Simpan Perubahan
        </button>
      </div>
    </AdminLayout>
  );
}
