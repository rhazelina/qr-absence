import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import bgLogin from "../assets/Background/bgLogin.png";
import { settingService } from "../services/settingService";
import { authService } from "../services/authService";

// ==================== INTERFACE DEFINITIONS ====================
interface LoginPageProps {
  role: string | null;
  onLogin: (role: string, name: string, phone: string, profile?: any, extraData?: { user_type?: string, is_class_officer?: boolean }) => void;
  onBack: () => void;
}

interface SchoolData {
  nama_sekolah: string;
  logo_sekolah?: string;
}

// ==================== DEFAULT DATA ====================
const DEFAULT_SCHOOL_DATA: SchoolData = {
  nama_sekolah: 'SMKN 2 SINGOSARI',
  logo_sekolah: '',
};

// ==================== MAIN COMPONENT ====================
export default function LoginPage({ role, onLogin, onBack }: LoginPageProps) {
  // ==================== NAVIGATION ====================
  const navigate = useNavigate();

  // ==================== STATE MANAGEMENT ====================
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [hasRedirected, setHasRedirected] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [schoolData, setSchoolData] = useState<SchoolData>(DEFAULT_SCHOOL_DATA);

  const [form, setForm] = useState({
    identifier: "",
    password: "",
    phone: "",
  });

  const normalizeRole = (backendRole?: string, userType?: string, isClassOfficer?: boolean) => {
    const b = (backendRole || "").toLowerCase();
    const t = (userType || "").toLowerCase();
    const s = (role || "").toLowerCase(); // selection role from prop

    // 1. Honor selection if it's a valid base role for the person's status
    if (s === "guru" && (b === "wakel" || b === "walikelas" || b === "guru")) return "guru";
    if (s === "siswa" && (b === "pengurus_kelas" || b === "siswa")) return "siswa";

    // 2. High priority: backend explicit specialized roles (if no specific selection above)
    if (b === "wakel" || b === "walikelas") return "wakel";
    if (b === "pengurus_kelas") return "pengurus_kelas";
    if (b === "waka" || b === "admin") return b;

    // 3. Type-based logic (trusting backend data)
    if (t === "student") {
      return isClassOfficer ? "pengurus_kelas" : "siswa";
    }
    if (t === "teacher") {
      return (b === "wakel" || b === "walikelas") ? "wakel" : "guru";
    }

    // 3. Last fallback
    const valid = ["admin", "waka", "wakel", "guru", "siswa", "pengurus_kelas"];
    if (valid.includes(b)) return b;
    if (valid.includes(s)) return s;

    return role || "siswa";
  };

  // ==================== LOAD SCHOOL DATA FROM STORAGE ====================
  useEffect(() => {
    const loadSchoolData = async () => {
      try {
        const settings = await settingService.getPublicSettings();
        setSchoolData({
          nama_sekolah: settings.school_name || DEFAULT_SCHOOL_DATA.nama_sekolah,
          logo_sekolah: settings.school_logo_url || '',
        });
      } catch (error) {
        console.error('Error loading school data:', error);
        // Fallback to localStorage if API fails
        const savedData = localStorage.getItem('schoolData');
        if (savedData) {
          try {
            const parsedData = JSON.parse(savedData);
            setSchoolData({
              nama_sekolah: parsedData.nama_sekolah || parsedData.school_name || DEFAULT_SCHOOL_DATA.nama_sekolah,
              logo_sekolah: parsedData.logo_sekolah || parsedData.school_logo_url || '',
            });
          } catch (parseErr) {
            console.error('Error parsing localStorage schoolData:', parseErr);
            setSchoolData(DEFAULT_SCHOOL_DATA);
          }
        } else {
          setSchoolData(DEFAULT_SCHOOL_DATA);
        }
      }
    };

    loadSchoolData();

    // ==================== LISTEN FOR SCHOOL DATA UPDATES ====================
    window.addEventListener('schoolDataUpdated', loadSchoolData);
    window.addEventListener('schoolSettingsUpdated', loadSchoolData);

    return () => {
      window.removeEventListener('schoolDataUpdated', loadSchoolData);
      window.removeEventListener('schoolSettingsUpdated', loadSchoolData);
    };
  }, []);

  // ==================== CHECK ROLE & REDIRECT ====================
  useEffect(() => {
    if (!role && !hasRedirected) {
      setHasRedirected(true);
      onBack();
      navigate("/", { replace: true });
    }
  }, [role, hasRedirected, navigate, onBack]);

  // ==================== HANDLE FORM SUBMIT ====================
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    const isStudentRole = role === "siswa" || role === "pengurus_kelas";
    if (!form.identifier.trim()) {
      setError("Identitas wajib diisi");
      return;
    }
    if (!isStudentRole && !form.password.trim()) {
      setError("Kata sandi wajib diisi");
      return;
    }

    setIsLoading(true);

    try {
      const response = await authService.login({
        login: form.identifier.trim(),
        password: form.password.trim(),
      });

      if (response.token) {
        localStorage.setItem("token", response.token);
        // Map the backend role to what the app expects if needed
        // The backend already returns 'role' which is UI-compatible
        const user = response.user;
        onLogin(
          normalizeRole(user.role, user.user_type, user.is_class_officer),
          user.name,
          user.profile?.nis || user.profile?.nip || "",
          user.profile,
          { user_type: user.user_type, is_class_officer: user.is_class_officer }
        );
      } else {
        setError("Gagal masuk: Data tidak valid");
      }
    } catch (err: any) {
      console.error("Login error:", err);
      setError(err.message || "Gagal masuk. Silakan cek kembali identitas dan kata sandi anda.");
    } finally {
      setIsLoading(false);
    }
  };

  // ==================== GET IDENTIFIER LABEL ====================
  const getIdentifierLabel = () => {
    switch (role) {
      case "admin":
      case "waka":
        return "Nama Pengguna";
      case "guru":
      case "wakel":
        return "NIP / Kode Guru";
      case "siswa":
      case "pengurus_kelas":
        return "NISN / NIS";
      default:
        return "Identitas";
    }
  };

  // ==================== GET PLACEHOLDER ====================
  const getPlaceholder = () => {
    switch (role) {
      case "admin":
      case "waka":
        return "Masukkan nama pengguna";
      case "guru":
      case "wakel":
        return "Masukkan NIP atau kode guru";
      case "siswa":
      case "pengurus_kelas":
        return "Masukkan NISN atau NIS";
      default:
        return "Masukkan identitas";
    }
  };

  // ==================== TOGGLE PASSWORD VISIBILITY ====================
  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  // ==================== INPUT STYLE ====================
  const inputStyle: React.CSSProperties = {
    width: "100%",
    padding: "12px 14px",
    border: "2px solid #1E3A8A",
    borderRadius: 12,
    fontSize: 16,
    boxSizing: "border-box",
    backgroundColor: "#FFFFFF",
    color: "#111827",
    outline: "none",
    transition: "border-color 0.2s",
  };

  // ==================== HANDLE LOGO CLICK ====================
  const handleLogoClick = () => {
    onBack();
    navigate("/");
  };

  return (
    <>
      {/* ==================== GLOBAL STYLES ==================== */}
      <style>
        {`
          input,
          input:focus,
          input:not(:focus),
          input:placeholder-shown,
          input:not(:placeholder-shown) {
            background-color: #ffffff !important;
          }

          input:-webkit-autofill,
          input:-webkit-autofill:hover,
          input:-webkit-autofill:focus {
            -webkit-box-shadow: 0 0 0 1000px #ffffff inset !important;
            -webkit-text-fill-color: #111827 !important;
            transition: background-color 5000s ease-in-out 0s;
          }
          
          input:focus {
            border-color: #3B82F6 !important;
            box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
          }

          .password-container {
            position: relative;
            display: flex;
            align-items: center;
          }

          .password-toggle {
            position: absolute;
            right: 12px;
            background: none;
            border: none;
            cursor: pointer;
            padding: 4px;
            display: flex;
            align-items: center;
            justify-content: center;
            color: #6B7280;
            transition: color 0.2s;
          }

          .password-toggle:hover {
            color: #4B5563;
          }

          .password-toggle:disabled {
            cursor: not-allowed;
            color: #9CA3AF;
          }

          .eye-icon {
            width: 20px;
            height: 20px;
          }
        `}
      </style>

      {/* ==================== BACKGROUND ==================== */}
      <div
        style={{
          position: "fixed",
          inset: 0,
          backgroundImage: `url(${bgLogin})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundRepeat: "no-repeat",
          zIndex: 0,
        }}
      />

      {/* ==================== MAIN CONTENT ==================== */}
      <div
        style={{
          position: "relative",
          zIndex: 1,
          minHeight: "100vh",
          width: "100vw",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "20px",
        }}
      >
        {/* ==================== LOGO BUTTON ==================== */}
        {schoolData.logo_sekolah && (
          <button
            onClick={handleLogoClick}
            style={{
              position: "absolute",
              top: 20,
              right: 40,
              background: "none",
              border: "none",
              cursor: "pointer",
              padding: 0,
              zIndex: 2,
            }}
            aria-label="Kembali ke halaman utama"
          >
            <img
              src={schoolData.logo_sekolah}
              alt="Logo SMK"
              style={{
                width: 90,
                height: "auto",
                transition: "transform 0.2s",
              }}
              onMouseEnter={(e) => (e.currentTarget.style.transform = "scale(1.05)")}
              onMouseLeave={(e) => (e.currentTarget.style.transform = "scale(1)")}
            />
          </button>
        )}

        {/* ==================== FORM CONTAINER ==================== */}
        <div
          style={{
            width: "100%",
            maxWidth: 420,
            padding: "40px 20px",
            textAlign: "center",
          }}
        >
          {/* ==================== HEADER SECTION ==================== */}
          <div
            style={{
              color: "#ffffff",
              marginBottom: 36,
              textShadow: "0 3px 8px rgba(0,0,0,0.35)",
            }}
          >
            <h1 style={{ fontSize: 40, fontWeight: 700, margin: 0 }}>
              Selamat Datang
            </h1>
            <h2 style={{ fontSize: 34, fontWeight: 700, margin: "6px 0 0 0" }}>
              di Presensi Pembelajaran Digital
            </h2>
          </div>

          {/* ==================== LOGIN CARD ==================== */}
          <div
            style={{
              backgroundColor: "rgba(229,231,235,0.95)",
              borderRadius: 16,
              padding: 32,
              boxShadow: "0 10px 25px rgba(0,0,0,0.1)",
            }}
          >
            {/* Error Message */}
            {error && (
              <div
                style={{
                  marginBottom: 16,
                  padding: "12px 16px",
                  backgroundColor: "#FEE2E2",
                  color: "#DC2626",
                  borderRadius: 8,
                  fontSize: 14,
                  fontWeight: 500,
                }}
              >
                ⚠️ {error}
              </div>
            )}

            {/* No Role Warning */}
            {!role && (
              <div
                style={{
                  marginBottom: 16,
                  padding: "12px 16px",
                  backgroundColor: "#FEF3C7",
                  color: "#92400E",
                  borderRadius: 8,
                  fontSize: 14,
                  fontWeight: 500,
                }}
              >
                ⚠️ Role tidak ditemukan. Kembali ke halaman utama.
              </div>
            )}

            {/* ==================== LOGIN FORM ==================== */}
            <form onSubmit={handleSubmit}>
              {/* Identifier Input */}
              <div style={{ marginBottom: 20, textAlign: "left" }}>
                <label
                  style={{
                    display: "block",
                    fontWeight: 600,
                    color: "#0a1944",
                    marginBottom: 8,
                    fontSize: 14,
                  }}
                >
                  {getIdentifierLabel()}
                </label>
                <input
                  type="text"
                  value={form.identifier}
                  onChange={(e) =>
                    setForm({ ...form, identifier: e.target.value })
                  }
                  placeholder={getPlaceholder()}
                  style={inputStyle}
                  disabled={isLoading || !role}
                  aria-label={getIdentifierLabel()}
                />
              </div>

              {/* Password Input */}
              <div style={{ marginBottom: 24, textAlign: "left" }}>
                <label
                  style={{
                    display: "block",
                    fontWeight: 600,
                    color: "#0a1944",
                    marginBottom: 8,
                    fontSize: 14,
                  }}
                >
                  {role === "siswa" || role === "pengurus_kelas"
                    ? "Kata Sandi (opsional untuk siswa)"
                    : "Kata Sandi"}
                </label>
                <div className="password-container">
                  <input
                    type={showPassword ? "text" : "password"}
                    value={form.password}
                    onChange={(e) =>
                      setForm({ ...form, password: e.target.value })
                    }
                    placeholder={
                      role === "siswa" || role === "pengurus_kelas"
                        ? "Masukkan kata sandi (opsional)"
                        : "Masukkan kata sandi"
                    }
                    style={inputStyle}
                    disabled={isLoading || !role}
                    aria-label="Password"
                  />
                  <button
                    type="button"
                    className="password-toggle"
                    onClick={togglePasswordVisibility}
                    disabled={isLoading || !role}
                    aria-label={showPassword ? "Sembunyikan password" : "Tampilkan password"}
                  >
                    {showPassword ? (
                      <svg className="eye-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L6.59 6.59m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                      </svg>
                    ) : (
                      <svg className="eye-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                    )}
                  </button>
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isLoading || !role}
                style={{
                  width: "100%",
                  padding: 14,
                  borderRadius: 12,
                  border: "none",
                  backgroundColor: isLoading ? "#93C5FD" : "#2563EB",
                  color: "#fff",
                  fontSize: 18,
                  fontWeight: "bold",
                  cursor: isLoading || !role ? "not-allowed" : "pointer",
                  opacity: isLoading || !role ? 0.7 : 1,
                  transition: "background-color 0.2s, transform 0.1s",
                }}
                onMouseDown={(e) => {
                  if (!isLoading && role) {
                    e.currentTarget.style.transform = "scale(0.98)";
                  }
                }}
                onMouseUp={(e) => {
                  e.currentTarget.style.transform = "scale(1)";
                }}
                onMouseEnter={(e) => {
                  if (!isLoading && role) {
                    e.currentTarget.style.backgroundColor = "#1D4ED8";
                  }
                }}
                onMouseLeave={(e) => {
                  if (!isLoading && role) {
                    e.currentTarget.style.backgroundColor = "#2563EB";
                  }
                }}
              >
                {isLoading ? "Loading..." : "Masuk"}
              </button>
            </form>
          </div>
        </div>
      </div>
    </>
  );
}
