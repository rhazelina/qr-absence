import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import bgLogin from "../assets/Background/bgLogin.png";
import LogoSchool from "../assets/Icon/logo smk.png";

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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    // Validation
    if (!form.identifier.trim() || !form.password.trim()) {
      setError("Semua field harus diisi");
      return;
    }

    setIsLoading(true);

    // Simulate API call
    setTimeout(() => {
      // Check if role exists before calling onLogin
      if (role) {
        onLogin(role, form.identifier.trim(), form.phone.trim());
      } else {
        setError("Role tidak ditemukan");
      }
      setIsLoading(false);
    }, 500);
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
        return "NISN";
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
        return "Masukkan NISN";
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
              di Absensi Digital
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
              </div>

              {/* PASSWORD */}
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
                <input
                  type="Kata Sandi"
                  value={form.password}
                  onChange={(e) =>
                    setForm({ ...form, password: e.target.value })
                  }
                  placeholder="Kata Sandi"
                  style={inputStyle}
                  disabled={isLoading || !role}
                  aria-label="Password"
                />
              </div>

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