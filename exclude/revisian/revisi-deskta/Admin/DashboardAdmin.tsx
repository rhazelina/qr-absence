// DashboardAdmin.tsx - Halaman dashboard utama admin
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import AdminLayout from "../../component/Admin/AdminLayout";
import JurusanAdmin from "./JurusanAdmin";
import KelasAdmin from "./KelasAdmin";
import GuruAdmin from "./GuruAdmin";
import SiswaAdmin from "./SiswaAdmin";
import DetailSiswa from "./DetailSiswa";
import DetailGuru from "./DetailGuru";
import ProfilSekolah from "./ProfilSekolah";

// ==================== INTERFACE DEFINITIONS ====================
// Interface untuk data user/admin yang login
interface User {
  role: string;
  name: string;
}

// Interface untuk props komponen DashboardAdmin
interface AdminDashboardProps {
  user: User;
  onLogout: () => void;
}

// Tipe data untuk semua halaman yang tersedia di dashboard admin
type AdminPage =
  | "dashboard"
  | "jurusan"
  | "kelas"
  | "siswa"
  | "guru"
  | "notifikasi"
  | "pengaturan"
  | "detail-siswa"
  | "detail-guru"
  | "profil-sekolah";  // ← TAMBAHKAN INI

// ==================== MAIN COMPONENT ====================
export default function AdminDashboard({
  user,
  onLogout,
}: AdminDashboardProps) {
  // ==================== STATE MANAGEMENT ====================
  // State untuk menyimpan halaman yang sedang aktif
  const [currentPage, setCurrentPage] = useState<AdminPage>("dashboard");
  // Hook untuk navigasi antar halaman
  const navigate = useNavigate();
  // State untuk menyimpan ID siswa yang dipilih (untuk halaman detail)
  const [selectedSiswaId, setSelectedSiswaId] = useState<string | null>(null);
  // State untuk menyimpan ID guru yang dipilih (untuk halaman detail)
  const [selectedGuruId, setSelectedGuruId] = useState<string | null>(null);
  // State untuk menyimpan tanggal saat ini dalam format string
  const [currentDate, setCurrentDate] = useState("");
  // State untuk menyimpan waktu saat ini dalam format string
  const [currentTime, setCurrentTime] = useState("");
  // State untuk menyimpan informasi semester saat ini
  const [semester, setSemester] = useState("Semester Genap");

  // ==================== DATE & TIME HANDLER ====================
  // Fungsi untuk update tanggal dan waktu secara real-time
  const updateDateTime = () => {
    const now = new Date();

    // Format tanggal: "Senin, 7 Januari 2026" menggunakan locale Indonesia
    setCurrentDate(
      now.toLocaleDateString("id-ID", {
        weekday: "long",     // Nama hari lengkap
        day: "numeric",      // Tanggal dalam angka
        month: "long",       // Nama bulan lengkap
        year: "numeric",     // Tahun lengkap
      })
    );

    // Format waktu: "08:00:01" dengan format 24 jam
    setCurrentTime(
      now.toLocaleTimeString("id-ID", {
        hour: "2-digit",     // Jam dengan 2 digit
        minute: "2-digit",   // Menit dengan 2 digit
        second: "2-digit",   // Detik dengan 2 digit
        hour12: false,       // Format 24 jam (bukan AM/PM)
      })
    );
  };

  // ==================== EFFECT FOR REAL-TIME CLOCK ====================
  useEffect(() => {
    // Panggil fungsi updateDateTime pertama kali
    updateDateTime(); 
    // Set interval untuk update waktu setiap 1 detik (1000ms)
    const interval = setInterval(updateDateTime, 1000); 
    
    // Set semester berdasarkan bulan saat ini
    const month = new Date().getMonth(); // Ambil bulan (0-11)
    if (month >= 0 && month <= 5) {      // Januari-Juni: Semester Genap
      setSemester("Semester Genap");
    } else {                             // Juli-Desember: Semester Ganjil
      setSemester("Semester Ganjil");
    }
    
    // Cleanup function: hapus interval saat komponen di-unmount
    return () => clearInterval(interval); 
  }, []); // Array kosong artinya hanya dijalankan sekali saat mount

  // ==================== MENU NAVIGATION HANDLER ====================
  // Fungsi untuk menangani klik menu navigasi
  const handleMenuClick = (page: string) => {
    setCurrentPage(page as AdminPage); // Update state halaman aktif
  };

  // ==================== LOGOUT HANDLER ====================
  // Fungsi untuk menangani logout
  const handleLogout = () => {
    onLogout();                // Panggil fungsi logout dari props
    navigate("/");             // Navigasi ke halaman utama
  };

  // ==================== PAGE RENDERER ====================
  // Fungsi untuk merender halaman berdasarkan currentPage
  const renderPage = () => {
    switch (currentPage) {
      case "dashboard":
      default:
        return (
          <AdminLayout
            pageTitle="Beranda"
            currentPage={currentPage}
            onMenuClick={handleMenuClick}
            user={user}
            onLogout={handleLogout}
            hideBackground={false} // Menampilkan background (ubah dari true ke false)
          >
            {/* ============ MAIN DASHBOARD CONTAINER ============ */}
            <div
              style={{
                maxWidth: "1400px",
                margin: "0 auto",
                padding: "0 4px",
                position: "relative",
                minHeight: "calc(100vh - 100px)", // Pastikan konten tidak terlalu pendek
              }}
            >
              {/* ============ CONTENT LAYER ============ */}
              <div style={{ position: "relative", zIndex: 1 }}>
                {/* ============ WELCOME SECTION ============ */}
                <div
                  style={{
                    marginBottom: "32px",
                  }}
                >
                  <div
                    style={{
                      background: "linear-gradient(135deg, #001F3E 0%, #0C4A6E 100%)", // Gradient warna navy
                      borderRadius: "16px",
                      padding: "28px 32px",
                      boxShadow: "0 8px 32px rgba(0, 31, 62, 0.3)", // Bayangan dengan warna navy
                      border: "1px solid rgba(255, 255, 255, 0.1)", // Border putih transparan
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      color: "white",
                    }}
                  >
                    {/* ============ WELCOME MESSAGE ============ */}
                    <div>
                      <h2
                        style={{
                          fontSize: "24px",
                          fontWeight: "700",
                          color: "white",
                          margin: "0 0 8px 0",
                        }}
                      >
                        Selamat Datang di Beranda, Admin
                      </h2>
                      <p
                        style={{
                          fontSize: "16px",
                          color: "rgba(255, 255, 255, 0.9)", // Putih dengan transparansi 90%
                          margin: "0",
                          maxWidth: "600px", // Batas lebar untuk paragraf
                        }}
                      >
                        Kelola data sekolah, monitor aktivitas, dan pantau statistik secara real-time
                      </p>
                    </div>

                    {/* ============ DATE & TIME DISPLAY ============ */}
                    <div
                      style={{
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "flex-end",
                        gap: "8px",
                      }}
                    >
                      <div style={{ textAlign: "right" }}>
                        {/* Tanggal */}
                        <div
                          style={{
                            fontSize: "14px",
                            color: "rgba(255, 255, 255, 0.9)",
                            fontWeight: "600",
                          }}
                        >
                          {currentDate}
                        </div>
                        {/* Waktu */}
                        <div
                          style={{
                            fontSize: "28px",
                            color: "white",
                            fontWeight: "700",
                            letterSpacing: "1px", // Jarak antar karakter untuk tampilan jam
                          }}
                        >
                          {currentTime}
                        </div>
                        {/* Semester */}
                        <div
                          style={{
                            fontSize: "14px",
                            color: "rgba(255, 255, 255, 0.8)",
                            fontWeight: "500",
                            marginTop: "4px",
                          }}
                        >
                          {semester}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* ============ STATISTICS CARDS SECTION ============ */}
                <div
                  style={{
                    marginBottom: "32px",
                  }}
                >
                  <h3
                    style={{
                      fontSize: "20px",
                      fontWeight: "600",
                      color: "#001F3E",
                      margin: "0 0 20px 20px",
                    }}
                  >
                    Statistik Sekolah
                  </h3>
                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", // Responsif grid
                      gap: "24px",
                    }}
                  >
                    {/* ============ STAT CARD 1: TOTAL ROMBEL ============ */}
                    <div
                      style={{
                        background: "linear-gradient(135deg, #001F3E 0%, #0C4A6E 100%)", // Navy gradient
                        borderRadius: "16px",
                        padding: "28px",
                        color: "white",
                        display: "flex",
                        flexDirection: "column",
                        boxShadow: "0 8px 24px rgba(0, 31, 62, 0.3)",
                        border: "1px solid rgba(255, 255, 255, 0.1)",
                        transition: "all 0.3s ease", // Animasi transisi
                        cursor: "pointer", // Pointer cursor untuk interaktif
                        position: "relative",
                        overflow: "hidden",
                      }}
                      // Efek hover untuk card
                      onMouseEnter={(e) => {
                        e.currentTarget.style.transform = "translateY(-8px)"; // Naik sedikit
                        e.currentTarget.style.boxShadow = "0 16px 32px rgba(0, 31, 62, 0.4)"; // Bayangan lebih besar
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.transform = "translateY(0)"; // Kembali ke posisi awal
                        e.currentTarget.style.boxShadow = "0 8px 24px rgba(0, 31, 62, 0.3)"; // Bayangan awal
                      }}
                    >
                      {/* Background Accent - lingkaran dekoratif */}
                      <div
                        style={{
                          position: "absolute",
                          top: "-20px",
                          right: "-20px",
                          width: "80px",
                          height: "80px",
                          backgroundColor: "rgba(255, 255, 255, 0.1)", // Lingkaran transparan
                          borderRadius: "50%",
                        }}
                      />
                      
                      {/* Angka statistik */}
                      <div
                        style={{
                          fontSize: "42px",
                          fontWeight: 800,
                          lineHeight: 1.2,
                          color: "white",
                          marginBottom: "8px",
                          textShadow: "0 2px 4px rgba(0, 0, 0, 0.2)", // Bayangan teks
                        }}
                      >
                        19
                      </div>
                      {/* Label statistik */}
                      <div
                        style={{
                          fontSize: "16px",
                          color: "rgba(255, 255, 255, 0.9)",
                          fontWeight: "600",
                          marginBottom: "12px",
                        }}
                      >
                        Total Rombel
                      </div>
                      {/* Icon dan deskripsi */}
                      <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                        <div
                          style={{
                            width: "40px",
                            height: "40px",
                            backgroundColor: "rgba(255, 255, 255, 0.2)",
                            borderRadius: "10px",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            fontSize: "20px",
                          }}
                        >
                          🏫
                        </div>
                        <div
                          style={{
                            fontSize: "14px",
                            color: "rgba(255, 255, 255, 0.9)",
                            fontWeight: "bold",
                          }}
                        >
                          Rombongan Belajar
                        </div>
                      </div>
                    </div>

                    {/* ============ STAT CARD 2: TOTAL MURID ============ */}
                    <div
                      style={{
                        background: "linear-gradient(135deg, #001F3E 0%, #0C4A6E 100%)",
                        borderRadius: "16px",
                        padding: "28px",
                        color: "white",
                        display: "flex",
                        flexDirection: "column",
                        boxShadow: "0 8px 24px rgba(0, 31, 62, 0.3)",
                        border: "1px solid rgba(255, 255, 255, 0.1)",
                        transition: "all 0.3s ease",
                        cursor: "pointer",
                        position: "relative",
                        overflow: "hidden",
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.transform = "translateY(-8px)";
                        e.currentTarget.style.boxShadow = "0 16px 32px rgba(0, 31, 62, 0.4)";
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.transform = "translateY(0)";
                        e.currentTarget.style.boxShadow = "0 8px 24px rgba(0, 31, 62, 0.3)";
                      }}
                    >
                      <div
                        style={{
                          position: "absolute",
                          top: "-20px",
                          right: "-20px",
                          width: "80px",
                          height: "80px",
                          backgroundColor: "rgba(255, 255, 255, 0.1)",
                          borderRadius: "50%",
                        }}
                      />
                      
                      <div
                        style={{
                          fontSize: "42px",
                          fontWeight: 800,
                          lineHeight: 1.2,
                          color: "white",
                          marginBottom: "8px",
                          textShadow: "0 2px 4px rgba(0, 0, 0, 0.2)",
                        }}
                      >
                        2,138
                      </div>
                      <div
                        style={{
                          fontSize: "16px",
                          color: "rgba(255, 255, 255, 0.9)",
                          fontWeight: "600",
                          marginBottom: "12px",
                        }}
                      >
                        Total Murid
                      </div>
                      <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                        <div
                          style={{
                            width: "40px",
                            height: "40px",
                            backgroundColor: "rgba(255, 255, 255, 0.2)",
                            borderRadius: "10px",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            fontSize: "20px",
                          }}
                        >
                          👨‍🎓
                        </div>
                        <div
                          style={{
                            fontSize: "14px",
                            color: "rgba(255, 255, 255, 0.9)",
                            fontWeight: "bold",
                          }}
                        >
                          Siswa Aktif
                        </div>
                      </div>
                    </div>

                    {/* ============ STAT CARD 3: TOTAL GURU ============ */}
                    <div
                      style={{
                        background: "linear-gradient(135deg, #001F3E 0%, #0C4A6E 100%)",
                        borderRadius: "16px",
                        padding: "28px",
                        color: "white",
                        display: "flex",
                        flexDirection: "column",
                        boxShadow: "0 8px 24px rgba(0, 31, 62, 0.3)",
                        border: "1px solid rgba(255, 255, 255, 0.1)",
                        transition: "all 0.3s ease",
                        cursor: "pointer",
                        position: "relative",
                        overflow: "hidden",
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.transform = "translateY(-8px)";
                        e.currentTarget.style.boxShadow = "0 16px 32px rgba(0, 31, 62, 0.4)";
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.transform = "translateY(0)";
                        e.currentTarget.style.boxShadow = "0 8px 24px rgba(0, 31, 62, 0.3)";
                      }}
                    >
                      <div
                        style={{
                          position: "absolute",
                          top: "-20px",
                          right: "-20px",
                          width: "80px",
                          height: "80px",
                          backgroundColor: "rgba(255, 255, 255, 0.1)",
                          borderRadius: "50%",
                        }}
                      />
                      
                      <div
                        style={{
                          fontSize: "42px",
                          fontWeight: 800,
                          lineHeight: 1.2,
                          color: "white",
                          marginBottom: "8px",
                          textShadow: "0 2px 4px rgba(0, 0, 0, 0.2)",
                        }}
                      >
                        515
                      </div>
                      <div
                        style={{
                          fontSize: "16px",
                          color: "rgba(255, 255, 255, 0.9)",
                          fontWeight: "600",
                          marginBottom: "12px",
                        }}
                      >
                        Total Guru
                      </div>
                      <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                        <div
                          style={{
                            width: "40px",
                            height: "40px",
                            backgroundColor: "rgba(255, 255, 255, 0.2)",
                            borderRadius: "10px",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            fontSize: "20px",
                          }}
                        >
                          👨‍🏫
                        </div>
                        <div
                          style={{
                            fontSize: "14px",
                            color: "rgba(255, 255, 255, 0.9)",
                            fontWeight: "bold",
                          }}
                        >
                          Tenaga Pendidik
                        </div>
                      </div>
                    </div>

                    {/* ============ STAT CARD 4: TOTAL LAB ============ */}
                    <div
                      style={{
                        background: "linear-gradient(135deg, #001F3E 0%, #0C4A6E 100%)",
                        borderRadius: "16px",
                        padding: "28px",
                        color: "white",
                        display: "flex",
                        flexDirection: "column",
                        boxShadow: "0 8px 24px rgba(0, 31, 62, 0.3)",
                        border: "1px solid rgba(255, 255, 255, 0.1)",
                        transition: "all 0.3s ease",
                        cursor: "pointer",
                        position: "relative",
                        overflow: "hidden",
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.transform = "translateY(-8px)";
                        e.currentTarget.style.boxShadow = "0 16px 32px rgba(0, 31, 62, 0.4)";
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.transform = "translateY(0)";
                        e.currentTarget.style.boxShadow = "0 8px 24px rgba(0, 31, 62, 0.3)";
                      }}
                    >
                      <div
                        style={{
                          position: "absolute",
                          top: "-20px",
                          right: "-20px",
                          width: "80px",
                          height: "80px",
                          backgroundColor: "rgba(255, 255, 255, 0.1)",
                          borderRadius: "50%",
                        }}
                      />
                      
                      <div
                        style={{
                          fontSize: "42px",
                          fontWeight: 800,
                          lineHeight: 1.2,
                          color: "white",
                          marginBottom: "8px",
                          textShadow: "0 2px 4px rgba(0, 0, 0, 0.2)",
                        }}
                      >
                        8
                      </div>
                      <div
                        style={{
                          fontSize: "16px",
                          color: "rgba(255, 255, 255, 0.9)",
                          fontWeight: "600",
                          marginBottom: "12px",
                        }}
                      >
                        Total Lab
                      </div>
                      <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                        <div
                          style={{
                            width: "40px",
                            height: "40px",
                            backgroundColor: "rgba(255, 255, 255, 0.2)",
                            borderRadius: "10px",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            fontSize: "20px",
                          }}
                        >
                          🔬
                        </div>
                        <div
                          style={{
                            fontSize: "14px",
                            color: "rgba(255, 255, 255, 0.9)",
                            fontWeight: "bold",
                          }}
                        >
                          Laboratorium
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* ============ QUICK ACCESS SECTION ============ */}
                <div>
                  <h3
                    style={{
                      fontSize: "20px",
                      fontWeight: "600",
                      color: "#001F3E",
                      margin: "0 0 20px 20px",
                    }}
                  >
                    Akses Cepat
                  </h3>
                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))",
                      gap: "24px",
                    }}
                  >
                    {/* ============ QUICK ACCESS 1: DATA SISWA ============ */}
                    <button
                      onClick={() => handleMenuClick("siswa")}
                      style={{
                        background: "linear-gradient(135deg, #FFFFFF 0%, #F8FAFC 100%)", // Gradient putih
                        borderRadius: "16px",
                        padding: "24px",
                        border: "1px solid #E5E7EB", // Border abu-abu
                        cursor: "pointer",
                        textAlign: "left", // Teks rata kiri
                        display: "flex",
                        alignItems: "center",
                        gap: "20px",
                        transition: "all 0.3s ease",
                        boxShadow: "0 4px 16px rgba(0, 0, 0, 0.08)",
                      }}
                      // Efek hover untuk tombol akses cepat
                      onMouseEnter={(e) => {
                        e.currentTarget.style.transform = "translateY(-4px)";
                        e.currentTarget.style.boxShadow = "0 8px 32px rgba(0, 0, 0, 0.15)";
                        e.currentTarget.style.borderColor = "#10B981"; // Border hijau saat hover
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.transform = "translateY(0)";
                        e.currentTarget.style.boxShadow = "0 4px 16px rgba(0, 0, 0, 0.08)";
                        e.currentTarget.style.borderColor = "#E5E7EB"; // Border kembali ke abu-abu
                      }}
                    >
                      {/* Icon dengan background gradient hijau */}
                      <div
                        style={{
                          width: "56px",
                          height: "56px",
                          background: "linear-gradient(135deg, #10B981 0%, #059669 100%)",
                          borderRadius: "12px",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          fontSize: "24px",
                          color: "white",
                          boxShadow: "0 4px 12px rgba(16, 185, 129, 0.3)", // Bayangan hijau
                        }}
                      >
                        👨‍🎓
                      </div>
                      {/* Teks deskripsi */}
                      <div style={{ flex: 1 }}>
                        <div
                          style={{
                            fontSize: "18px",
                            fontWeight: "600",
                            color: "#001F3E", // Warna navy
                            marginBottom: "4px",
                          }}
                        >
                          Data Siswa
                        </div>
                        <div
                          style={{
                            fontSize: "14px",
                            color: "#000000", // Warna hitam untuk kontras
                            fontWeight: "500",
                          }}
                        >
                          Kelola data siswa dan presensi
                        </div>
                      </div>
                      {/* Arrow indicator */}
                      <div
                        style={{
                          width: "32px",
                          height: "32px",
                          backgroundColor: "#F3F4F6", // Background abu-abu muda
                          borderRadius: "8px",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          color: "#6B7280", // Warna abu-abu
                          fontSize: "14px",
                        }}
                      >
                        →
                      </div>
                    </button>

                    {/* ============ QUICK ACCESS 2: DATA GURU ============ */}
                    <button
                      onClick={() => handleMenuClick("guru")}
                      style={{
                        background: "linear-gradient(135deg, #FFFFFF 0%, #F8FAFC 100%)",
                        borderRadius: "16px",
                        padding: "24px",
                        border: "1px solid #E5E7EB",
                        cursor: "pointer",
                        textAlign: "left",
                        display: "flex",
                        alignItems: "center",
                        gap: "20px",
                        transition: "all 0.3s ease",
                        boxShadow: "0 4px 16px rgba(0, 0, 0, 0.08)",
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.transform = "translateY(-4px)";
                        e.currentTarget.style.boxShadow = "0 8px 32px rgba(0, 0, 0, 0.15)";
                        e.currentTarget.style.borderColor = "#8B5CF6"; // Border ungu saat hover
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.transform = "translateY(0)";
                        e.currentTarget.style.boxShadow = "0 4px 16px rgba(0, 0, 0, 0.08)";
                        e.currentTarget.style.borderColor = "#E5E7EB";
                      }}
                    >
                      <div
                        style={{
                          width: "56px",
                          height: "56px",
                          background: "linear-gradient(135deg, #8B5CF6 0%, #7C3AED 100%)", // Gradient ungu
                          borderRadius: "12px",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          fontSize: "24px",
                          color: "white",
                          boxShadow: "0 4px 12px rgba(139, 92, 246, 0.3)", // Bayangan ungu
                        }}
                      >
                        👨‍🏫
                      </div>
                      <div style={{ flex: 1 }}>
                        <div
                          style={{
                            fontSize: "18px",
                            fontWeight: "600",
                            color: "#001F3E",
                            marginBottom: "4px",
                          }}
                        >
                          Data Guru
                        </div>
                        <div
                          style={{
                            fontSize: "14px",
                            color: "#000000",
                            fontWeight: "500",
                          }}
                        >
                          Kelola data guru dan jadwal mengajar
                        </div>
                      </div>
                      <div
                        style={{
                          width: "32px",
                          height: "32px",
                          backgroundColor: "#F3F4F6",
                          borderRadius: "8px",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          color: "#6B7280",
                          fontSize: "14px",
                        }}
                      >
                        →
                      </div>
                    </button>

                    {/* ============ QUICK ACCESS 3: DATA KELAS ============ */}
                    <button
                      onClick={() => handleMenuClick("kelas")}
                      style={{
                        background: "linear-gradient(135deg, #FFFFFF 0%, #F8FAFC 100%)",
                        borderRadius: "16px",
                        padding: "24px",
                        border: "1px solid #E5E7EB",
                        cursor: "pointer",
                        textAlign: "left",
                        display: "flex",
                        alignItems: "center",
                        gap: "20px",
                        transition: "all 0.3s ease",
                        boxShadow: "0 4px 16px rgba(0, 0, 0, 0.08)",
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.transform = "translateY(-4px)";
                        e.currentTarget.style.boxShadow = "0 8px 32px rgba(0, 0, 0, 0.15)";
                        e.currentTarget.style.borderColor = "#3B82F6"; // Border biru saat hover
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.transform = "translateY(0)";
                        e.currentTarget.style.boxShadow = "0 4px 16px rgba(0, 0, 0, 0.08)";
                        e.currentTarget.style.borderColor = "#E5E7EB";
                      }}
                    >
                      <div
                        style={{
                          width: "56px",
                          height: "56px",
                          background: "linear-gradient(135deg, #3B82F6 0%, #2563EB 100%)", // Gradient biru
                          borderRadius: "12px",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          fontSize: "24px",
                          color: "white",
                          boxShadow: "0 4px 12px rgba(59, 130, 246, 0.3)", // Bayangan biru
                        }}
                      >
                        🏫
                      </div>
                      <div style={{ flex: 1 }}>
                        <div
                          style={{
                            fontSize: "18px",
                            fontWeight: "600",
                            color: "#001F3E",
                            marginBottom: "4px",
                          }}
                        >
                          Data Kelas
                        </div>
                        <div
                          style={{
                            fontSize: "14px",
                            color: "#000000",
                            fontWeight: "500",
                          }}
                        >
                          Kelola kelas dan jurusan
                        </div>
                      </div>
                      <div
                        style={{
                          width: "32px",
                          height: "32px",
                          backgroundColor: "#F3F4F6",
                          borderRadius: "8px",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          color: "#6B7280",
                          fontSize: "14px",
                        }}
                      >
                        →
                      </div>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </AdminLayout>
        );

      /* ============ PAGE JURUSAN ============ */
      case "jurusan":
        return (
          <JurusanAdmin
            user={user}
            onLogout={handleLogout}
            currentPage={currentPage}
            onMenuClick={handleMenuClick}
          />
        );

      /* ============ PAGE KELAS ============ */
      case "kelas":
        return (
          <KelasAdmin
            user={user}
            onLogout={handleLogout}
            currentPage={currentPage}
            onMenuClick={handleMenuClick}
          />
        );

      /* ============ PAGE SISWA ============ */
      case "siswa":
        return (
          <SiswaAdmin
            user={user}
            onLogout={handleLogout}
            currentPage={currentPage}
            onMenuClick={handleMenuClick}
            // Fungsi untuk navigasi ke halaman detail siswa
            onNavigateToDetail={(id) => {
              setSelectedSiswaId(id); // Simpan ID siswa yang dipilih
              setCurrentPage("detail-siswa"); // Ganti ke halaman detail
            }}
          />
        );

      /* ============ PAGE GURU ============ */
      case "guru":
        return (
          <GuruAdmin
            user={user}
            onLogout={handleLogout}
            currentPage={currentPage}
            onMenuClick={handleMenuClick}
            // Fungsi untuk navigasi ke halaman detail guru
            onNavigateToDetail={(id) => {
              setSelectedGuruId(id); // Simpan ID guru yang dipilih
              setCurrentPage("detail-guru"); // Ganti ke halaman detail
            }}
          />
        );

      /* ============ PAGE DETAIL SISWA ============ */
      case "detail-siswa":
        // Render halaman detail siswa jika ada ID yang dipilih
        return selectedSiswaId ? (
          <DetailSiswa
            user={user}
            onLogout={handleLogout}
            currentPage={currentPage}
            onMenuClick={handleMenuClick}
            siswaId={selectedSiswaId} // Kirim ID siswa ke komponen detail
          />
        ) : null; // Jika tidak ada ID, render nothing

      /* ============ PAGE DETAIL GURU ============ */
      case "detail-guru":
        // Render halaman detail guru jika ada ID yang dipilih
        return selectedGuruId ? (
          <DetailGuru
            user={user}
            onLogout={handleLogout}
            currentPage={currentPage}
            onMenuClick={handleMenuClick}
            guruId={selectedGuruId} // Kirim ID guru ke komponen detail
          />
        ) : null; // Jika tidak ada ID, render nothing

      /* ============ PAGE PROFIL SEKOLAH ============ */
      case "profil-sekolah":
        return (
          <ProfilSekolah
            user={user}
            onLogout={handleLogout}
            currentPage={currentPage}
            onMenuClick={handleMenuClick}
          />
        );
    }
  };

  // Return hasil render halaman
  return renderPage();
}