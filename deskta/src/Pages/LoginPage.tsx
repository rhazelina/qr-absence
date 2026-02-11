import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import bgLogin from "../assets/Background/bgLogin.png";
import LogoSchool from "../assets/Icon/logo smk.png";
import { storage } from "../utils/storage";

interface LoginPageProps {
  role: string | null;
  onLogin: (role: string, identifier: string, phone: string) => void;
  onBack: () => void;
}

export default function LoginPage({ role, onLogin, onBack }: LoginPageProps) {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [hasRedirected, setHasRedirected] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const [form, setForm] = useState({
    identifier: "",
    password: "",
    phone: "",
  });

  // FIXED: Use a more controlled approach
  useEffect(() => {
    // Only redirect once when role is null
    if (!role && !hasRedirected) {
      setHasRedirected(true);
      onBack();
      navigate("/", { replace: true });
    }
  }, [role, hasRedirected, navigate, onBack]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    // Validation - password not required for siswa and pengurus_kelas
    const isStudentRole = role === 'siswa' || role === 'pengurus_kelas';

    if (!form.identifier.trim()) {
      setError("NISN harus diisi");
      return;
    }

    if (!isStudentRole && !form.password.trim()) {
      setError("Password harus diisi");
      return;
    }

    setIsLoading(true);

    try {
      // Call real API login
      const { authService } = await import('../services/auth');
      const isStudentRole = role === 'siswa' || role === 'pengurus_kelas';

      const response = await authService.login({
        login: form.identifier.trim(), // Backend expects 'login' field
        password: isStudentRole ? '' : form.password.trim(), // Empty password for students (NISN login)
      });

      // Get precise role from API response (already standardized in backend)
      const actualRole = response.user.role || (response.user as any).user_type;

      // Login successful - call onLogin with user data
      if (actualRole) {
        // Store user data in storage using standardized utility
        storage.setRole(actualRole);
        storage.setUserData(response.user);
        storage.setToken(response.token);

        // Call onLogin callback
        onLogin(actualRole, response.user.name, response.user.phone || '');

        // Navigate to appropriate dashboard based on ACTUAL role
        const dashboardRoutes: Record<string, string> = {
          'admin': '/admin/dashboard',
          'waka': '/waka/dashboard',
          'guru': '/guru/dashboard',
          'wakel': '/wakel/dashboard',
          'siswa': '/siswa/dashboard',
          'pengurus_kelas': '/pengurus_kelas/dashboard',
        };

        const dashboardPath = dashboardRoutes[actualRole] || '/';
        navigate(dashboardPath, { replace: true });
      } else {
        setError("Role tidak valid dikembalikan oleh server");
      }
    } catch (err) {
      // Handle login error
      const { getErrorMessage } = await import('../services/api');
      const errorMsg = getErrorMessage(err);
      setError(errorMsg);
    } finally {
      setIsLoading(false);
    }
  };

  const getIdentifierLabel = () => {
    switch (role) {
      case "admin":
      case "waka":
        return "Nama Pengguna";
      case "guru":
      case "wakel":
        return "Kode Guru";
      case "siswa":
      case "pengurus_kelas":
        return "NIS / NISN";
      default:
        return "Identitas";
    }
  };

  const getPlaceholder = () => {
    switch (role) {
      case "admin":
      case "waka":
        return "Masukkan nama pengguna";
      case "guru":
      case "wakel":
        return "Masukkan kode guru";
      case "siswa":
      case "pengurus_kelas":
        return "Masukkan NIS atau NISN";
      default:
        return "Masukkan identitas";
    }
  };

  // ✅ INPUT STYLE (PUTIH)
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

  const handleLogoClick = () => {
    onBack();
    navigate("/");
  };

  return (
    <>
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

      {/* BACKGROUND */}
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

      {/* CONTENT */}
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
        {/* LOGO */}
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
            src={LogoSchool}
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

        <div
          style={{
            width: "100%",
            maxWidth: 420,
            padding: "40px 20px",
            textAlign: "center",
          }}
        >
          {/* TITLE */}
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

          {/* CARD */}
          <div
            style={{
              backgroundColor: "rgba(229,231,235,0.95)",
              borderRadius: 16,
              padding: 32,
              boxShadow: "0 10px 25px rgba(0,0,0,0.1)",
            }}
          >
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

            <form onSubmit={handleSubmit}>
              {/* IDENTIFIER */}
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
                {/* Info for NISN Login */}
                {(role === 'siswa' || role === 'pengurus_kelas') && (
                  <div style={{
                    marginTop: 8,
                    padding: '8px 12px',
                    backgroundColor: '#DBEAFE',
                    border: '1px solid #93C5FD',
                    borderRadius: 6,
                    fontSize: 12,
                    color: '#1E40AF',
                  }}>
                    💡 Masukkan NISN saja untuk login cepat (tanpa password)
                  </div>
                )}
              </div>

              {/* PASSWORD - Hidden for siswa and pengurus_kelas */}
              {role !== 'siswa' && role !== 'pengurus_kelas' && (
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
                    Kata Sandi
                  </label>
                  <div style={{ position: "relative" }}>
                    <input
                      type={showPassword ? "text" : "password"}
                      value={form.password}
                      onChange={(e) =>
                        setForm({ ...form, password: e.target.value })
                      }
                      placeholder="Masukkan kata sandi"
                      style={inputStyle}
                      disabled={isLoading || !role}
                      aria-label="Kata Sandi"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      style={{
                        position: "absolute",
                        right: 12,
                        top: "50%",
                        transform: "translateY(-50%)",
                        background: "none",
                        border: "none",
                        cursor: "pointer",
                        padding: 4,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                      aria-label={showPassword ? "Sembunyikan password" : "Tampilkan password"}
                    >
                      {showPassword ? (
                        <svg
                          width="20"
                          height="20"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="#6B7280"
                          strokeWidth="2"
                        >
                          <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
                          <line x1="1" y1="1" x2="23" y2="23" />
                        </svg>
                      ) : (
                        <svg
                          width="20"
                          height="20"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="#6B7280"
                          strokeWidth="2"
                        >
                          <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                          <circle cx="12" cy="12" r="3" />
                        </svg>
                      )}
                    </button>
                  </div>
                </div>
              )}

              {/* BUTTON */}
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