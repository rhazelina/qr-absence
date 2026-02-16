import { useState, useEffect } from "react";
import AdminLayout from "../../component/Admin/AdminLayout";
import { ArrowLeft, Save, User, MapPin, Phone, Mail, BookOpen, Layers, Users } from "lucide-react";
import { teacherService } from "../../services/teacher";
import { classService, type ClassRoom } from "../../services/class";
import { subjectService, type Subject } from "../../services/subject";

// ==================== INTERFACE DEFINITIONS ====================
interface User {
  role: string;
  name: string;
}

interface DetailGuruProps {
  user: User;
  onLogout: () => void;
  currentPage: string;
  onMenuClick: (page: string) => void;
  guruId: string;
}

interface GuruData {
  id: string;
  kodeGuru: string;
  namaGuru: string;
  jenisKelamin: string;
  role: string;
  keterangan: string; // Mapel / Kelas / Bagian
  noTelp: string;
  email: string;
  alamat: string;
  foto: string;
  status: "Aktif" | "Cuti" | "Tidak Aktif";
  tanggalBergabung: string;
}

// ==================== COMPONENT STYLING ====================
// Style object untuk konsistensi UI
const styles = {
  container: {
    maxWidth: "1000px",
    margin: "0 auto",
    padding: "0 4px",
    paddingBottom: "80px", // Ruang untuk fixed footer
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
    background: "linear-gradient(135deg, #001F3E 0%, #0C4A6E 100%)",
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
    backgroundColor: "#10B981", // Green for active
    border: "3px solid white",
  },
  profileName: {
    fontSize: "24px",
    fontWeight: "700",
    marginBottom: "4px",
    textAlign: "center" as const,
  },
  profileRole: {
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
  inputFocus: {
    borderColor: "#3B82F6",
    boxShadow: "0 0 0 3px rgba(59, 130, 246, 0.1)",
    backgroundColor: "white",
    outline: "none",
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
    appearance: "none" as const, // Menghilangkan style default browser
    backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%2364748B'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'%3E%3C/path%3E%3C/svg%3E")`,
    backgroundRepeat: "no-repeat",
    backgroundPosition: "right 16px center",
    backgroundSize: "20px",
  },
  footer: {
    position: "fixed" as const,
    bottom: 0,
    left: "280px", // Sesuaikan dengan lebar sidebar
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

// ==================== DAFTAR BAGIAN STAFF ====================
// TODO: Replace with backend data when available
const BAGIAN_STAFF = [
  "Tata Usaha",
  "Perpustakaan",
  "Laboratorium",
  "Keamanan",
  "Kebersihan",
  "Administrasi",
  "Kesiswaan"
];

export default function DetailGuru({
  user,
  onLogout,
  currentPage,
  onMenuClick,
  guruId,
}: DetailGuruProps) {
  // ==================== STATE MANAGEMENT ====================
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState<GuruData | null>(null);
  const [originalData, setOriginalData] = useState<GuruData | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [availableSubjects, setAvailableSubjects] = useState<Subject[]>([]);
  const [availableClasses, setAvailableClasses] = useState<ClassRoom[]>([]);

  // ==================== DATA FETCHING ====================
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        // Fetch teacher, subjects, and classes in parallel
        const [teacher, subjects, classes] = await Promise.all([
          teacherService.getTeacherById(guruId),
          subjectService.getSubjects(),
          classService.getClasses()
        ]);

        setAvailableSubjects(subjects);
        setAvailableClasses(classes);

        // Map teacher to GuruData format
        const mappedData: GuruData = {
          id: teacher.id.toString(),
          kodeGuru: teacher.nip || "",
          namaGuru: teacher.name || "",
          jenisKelamin: teacher.gender === "L" ? "Laki-Laki" : teacher.gender === "P" ? "Perempuan" : "Laki-Laki",
          role: teacher.homeroom_class_id ? "Wali Kelas" : (teacher.subject ? "Guru Mapel" : "Guru Mapel"),
          keterangan: teacher.homeroom_class_id 
            ? teacher.homeroom_class?.name || "" 
            : teacher.subject || "",
          noTelp: teacher.phone || "",
          email: teacher.email || "",
          alamat: "", // Alamat maybe not in basic teacher profile
          foto: (teacher as any).photo_url || "",
          status: "Aktif", // Default to active if not provided
          tanggalBergabung: (teacher as any).created_at ? new Date((teacher as any).created_at).toISOString().split('T')[0] : "",
        };

        setFormData(mappedData);
        setOriginalData(JSON.parse(JSON.stringify(mappedData)));
      } catch (error) {
        console.error("Error fetching guru details:", error);
        alert("Gagal memuat data guru. Silakan coba lagi.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [guruId]);

  // ==================== INPUT HANDLERS ====================
  const handleInputChange = (field: keyof GuruData, value: string) => {
    if (!formData) return;
    
    // Logic khusus jika role berubah
    if (field === 'role') {
        let defaultKet = '';
        if (value === 'Guru Mapel') defaultKet = availableSubjects[0]?.name || '';
        if (value === 'Wali Kelas') defaultKet = availableClasses[0]?.name || '';
        if (value === 'Staff') defaultKet = BAGIAN_STAFF[0];
        
        setFormData({
            ...formData,
            [field]: value,
            keterangan: defaultKet // Reset keterangan sesuai role baru
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
  const handleSave = async () => {
    // Validasi sederhana
    if (!formData?.namaGuru || !formData?.kodeGuru) {
      alert("Nama dan Kode Guru wajib diisi!");
      return;
    }

    try {
      setLoading(true);
      
      // Find class ID if role is Wali Kelas
      let homeroomClassId = null;
      if (formData.role === "Wali Kelas") {
        const selectedClass = availableClasses.find(c => {
          const className = `${c.grade} ${c.major?.code || ""} ${c.label}`;
          return className === formData.keterangan;
        });
        homeroomClassId = selectedClass?.id || null;
      }

      const updateData = {
        name: formData.namaGuru,
        nip: formData.kodeGuru,
        subject: formData.role === "Guru Mapel" ? formData.keterangan : null,
        homeroom_class_id: homeroomClassId,
        phone: formData.noTelp,
        email: formData.email,
        // Alamat and status might need mapping if backend supports them
      };

      await teacherService.updateTeacher(guruId, updateData);
      
      // Handle photo upload if changed
      if (previewImage && previewImage.startsWith('data:')) {
        // Convert base64 to File object or use a different approach if needed
        // For now, let's assume we need to convert to blob/file
        const response = await fetch(previewImage);
        const blob = await response.blob();
        const file = new File([blob], "profile.png", { type: "image/png" });
        await teacherService.uploadScheduleImage(guruId, file); // Reusing uploadScheduleImage for profile for now if no specific endpoint
      }
      
      setOriginalData(JSON.parse(JSON.stringify(formData)));
      setIsEditing(false);
      alert("Data guru berhasil disimpan!");
      onMenuClick("guru");
    } catch (error) {
      console.error("Error saving teacher data:", error);
      alert("Gagal menyimpan data guru.");
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    if (isEditing) {
      if (window.confirm("Ada perubahan yang belum disimpan. Yakin ingin membatalkan?")) {
        setFormData(JSON.parse(JSON.stringify(originalData)));
        setIsEditing(false);
        setPreviewImage(null);
      }
    } else {
      onMenuClick("guru");
    }
  };

  if (loading || !formData) {
    return (
      <AdminLayout
        pageTitle="Detail Guru"
        currentPage={currentPage}
        onMenuClick={onMenuClick}
        user={user}
        onLogout={onLogout}
        hideBackground={false}
      >
        <div style={{ padding: "40px", textAlign: "center", color: "#64748B" }}>
            Memuat data guru...
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout
      pageTitle="Detail Guru"
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
            Kembali ke Data Guru
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
                            alt={formData.namaGuru} 
                            style={styles.avatar} 
                        />
                    ) : (
                        <div style={styles.avatar}>
                            <User size={64} />
                        </div>
                    )}
                    
                    {/* Upload button overlay - hanya muncul saat hover atau edit mode */}
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
                        backgroundColor: formData.status === "Aktif" ? "#10B981" : 
                                         formData.status === "Cuti" ? "#F59E0B" : "#EF4444"
                    }} />
                </div>
                
                <h2 style={styles.profileName}>{formData.namaGuru}</h2>
                <div style={styles.profileRole}>
                    {formData.role === "Guru Mapel" && <BookOpen size={14} />}
                    {formData.role === "Wali Kelas" && <Users size={14} />}
                    {formData.role === "Staff" && <Layers size={14} />}
                    {formData.role} - {formData.keterangan}
                </div>
            </div>
        </div>

        {/* Form Content */}
        <div style={styles.card}>
            <div style={styles.cardHeader}>
                <h3 style={styles.cardTitle}>Informasi Pribadi & Akun</h3>
            </div>
            <div style={styles.cardBody}>
                <div style={styles.grid}>
                    {/* Kiri */}
                    <div>
                        <div style={styles.sectionTitle}>
                            <User size={18} /> Data Utama
                        </div>
                        
                        <div style={styles.formGroup}>
                            <label style={styles.label}>Nama Lengkap</label>
                            <input
                                type="text"
                                style={styles.input}
                                value={formData.namaGuru}
                                onChange={(e) => handleInputChange("namaGuru", e.target.value)}
                                placeholder="Nama lengkap dengan gelar"
                            />
                        </div>

                        <div style={styles.formGroup}>
                            <label style={styles.label}>NIP / Kode Guru</label>
                            <input
                                type="text"
                                style={styles.input}
                                value={formData.kodeGuru}
                                onChange={(e) => handleInputChange("kodeGuru", e.target.value)}
                                placeholder="Contoh: 19800101..."
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
                                        onChange={(e) => handleInputChange("jenisKelamin", e.target.value)}
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
                                        onChange={(e) => handleInputChange("jenisKelamin", e.target.value)}
                                        style={{ accentColor: "#001F3E" }}
                                    />
                                    Perempuan
                                </label>
                            </div>
                        </div>
                    </div>

                    {/* Kanan */}
                    <div>
                        <div style={styles.sectionTitle}>
                            <Layers size={18} /> Jabatan & Tugas
                        </div>

                        <div style={styles.formGroup}>
                            <label style={styles.label}>Role / Jabatan</label>
                            <select
                                style={styles.select}
                                value={formData.role}
                                onChange={(e) => handleInputChange("role", e.target.value)}
                            >
                                <option value="Guru Mapel">Guru Mata Pelajaran</option>
                                <option value="Wali Kelas">Wali Kelas</option>
                                <option value="Staff">Staff / Karyawan</option>
                            </select>
                        </div>

                        {/* Conditional Input based on Role */}
                        {formData.role === "Guru Mapel" && (
                            <div style={styles.formGroup}>
                                <label style={styles.label}>Mata Pelajaran</label>
                                <select
                                    style={styles.select}
                                    value={formData.keterangan}
                                    onChange={(e) => handleInputChange("keterangan", e.target.value)}
                                >
                                    {availableSubjects.map((mapel) => (
                                        <option key={mapel.id} value={mapel.name}>{mapel.name}</option>
                                    ))}
                                </select>
                            </div>
                        )}

                        {formData.role === "Wali Kelas" && (
                            <div style={styles.formGroup}>
                                <label style={styles.label}>Wali Kelas Dari</label>
                                <select
                                    style={styles.select}
                                    value={formData.keterangan}
                                    onChange={(e) => handleInputChange("keterangan", e.target.value)}
                                >
                                    {availableClasses.map((kelas) => {
                                        const className = `${kelas.grade} ${kelas.major?.code || ""} ${kelas.label}`;
                                        return <option key={kelas.id} value={className}>{className}</option>;
                                    })}
                                </select>
                            </div>
                        )}

                        {formData.role === "Staff" && (
                            <div style={styles.formGroup}>
                                <label style={styles.label}>Bagian</label>
                                <select
                                    style={styles.select}
                                    value={formData.keterangan}
                                    onChange={(e) => handleInputChange("keterangan", e.target.value)}
                                >
                                    {BAGIAN_STAFF.map((bagian) => (
                                        <option key={bagian} value={bagian}>{bagian}</option>
                                    ))}
                                </select>
                            </div>
                        )}

                        <div style={styles.formGroup}>
                            <label style={styles.label}>Status Kepegawaian</label>
                            <select
                                style={styles.select}
                                value={formData.status}
                                onChange={(e) => handleInputChange("status", e.target.value as any)}
                            >
                                <option value="Aktif">Aktif</option>
                                <option value="Cuti">Cuti</option>
                                <option value="Tidak Aktif">Tidak Aktif / Keluar</option>
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
                    
                    <div style={styles.formGroup}>
                        <label style={styles.label}>
                            <Mail size={14} style={{ display: "inline", marginRight: "6px" }} />
                            Email
                        </label>
                        <input
                            type="email"
                            style={styles.input}
                            value={formData.email}
                            onChange={(e) => handleInputChange("email", e.target.value)}
                            placeholder="nama@sekolah.sch.id"
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
