import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { useState, useEffect, useCallback } from "react";
import LandingPage from "./Pages/LandingPage";
import LoginPage from "./Pages/LoginPage";
import AdminDashboard from "./Pages/Admin/DashboardAdmin";
import GuruDashboard from "./Pages/Guru/GuruDashboard";
import WakaDashboard from "./Pages/WakaStaff/DashboardStaff";
import DashboardSiswa from "./Pages/Siswa/DashboardSiswa";
import DashboardPengurusKelas from "./Pages/PengurusKelas/DashboardPengurusKelas";
import DashboardWalliKelas from "./Pages/WaliKelas/DashboardWalliKelas";
import JadwalSiswaEdit from "./Pages/WakaStaff/JadwalSiswaEdit";
import { SmoothScroll } from "./component/Shared/SmoothScroll";
// import { SmoothScroll } from "./Shared/SmoothScroll";

import { authService } from "./services/authService";
import { settingService } from "./services/settingService";

export default function App() {
  const [currentUser, setCurrentUser] = useState<{
    role: string;
    name: string;
    phone: string;
    profile?: any;
  } | null>(null);

  const [selectedRole, setSelectedRole] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Global System Status State
  const [systemStatus, setSystemStatus] = useState<'normal' | 'maintenance' | 'error'>('normal');

  useEffect(() => {
    const handleMaintenance = () => setSystemStatus('maintenance');
    const handleError = () => setSystemStatus('error');

    window.addEventListener('server-maintenance', handleMaintenance);
    window.addEventListener('server-error', handleError);

    return () => {
      window.removeEventListener('server-maintenance', handleMaintenance);
      window.removeEventListener('server-error', handleError);
    };
  }, []);

  const normalizeRole = useCallback((backendRole?: string, userType?: string, isClassOfficer?: boolean, selectionRole?: string) => {
    const b = (backendRole || "").toLowerCase();
    const t = (userType || "").toLowerCase();
    const s = (selectionRole || "").toLowerCase();

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

    // 3. Fallback to valid strings
    const valid = ["admin", "waka", "wakel", "guru", "siswa", "pengurus_kelas"];
    if (valid.includes(b)) return b;
    if (valid.includes(s)) return s;

    return "";
  }, []);

  // Restore user dari localStorage & Sync Profile
  useEffect(() => {
    const storedUserLocal = localStorage.getItem("currentUser");
    const storedUserSession = sessionStorage.getItem("currentUser");
    const storedRole = localStorage.getItem("selectedRole");
    const token = localStorage.getItem("token");
    const hasStoredUser = Boolean(storedUserLocal || storedUserSession);
    const tokenInvalid = !token || token === "null" || token === "undefined";

    if (hasStoredUser && tokenInvalid) {
      localStorage.removeItem("token");
      localStorage.removeItem("currentUser");
      localStorage.removeItem("selectedRole");
      sessionStorage.removeItem("currentUser");
      setCurrentUser(null);
      setSelectedRole(null);
      setIsLoading(false);
      return;
    }

    const syncProfile = async (initialUser: any) => {
      if (!token) {
        setIsLoading(false);
        return;
      }
      try {
        const profile = await authService.me();
        const updatedUser = {
          role: normalizeRole(profile.role, profile.user_type, profile.is_class_officer, initialUser?.role),
          name: profile.name,
          phone: profile.phone || "",
          profile: profile.profile,
        };
        setCurrentUser(updatedUser);
        localStorage.setItem("currentUser", JSON.stringify(updatedUser));
      } catch (e) {
        console.error("Error syncing profile:", e);
        // If sync fails, use initialUser from storage
        setCurrentUser(initialUser);
      } finally {
        setIsLoading(false);
      }
    };

    if (storedUserLocal) {
      try {
        const parsedUser = JSON.parse(storedUserLocal);
        setCurrentUser(parsedUser);
        if (storedRole) {
          setSelectedRole(storedRole);
        }
        syncProfile(parsedUser);
      } catch (e) {
        console.error("Error restoring user from localStorage:", e);
        localStorage.removeItem("currentUser");
        localStorage.removeItem("selectedRole");
        setIsLoading(false);
      }
    } else if (storedUserSession) {
      try {
        const parsedUser = JSON.parse(storedUserSession);
        setCurrentUser(parsedUser);
        localStorage.setItem("currentUser", storedUserSession);
        if (storedRole) {
          localStorage.setItem("selectedRole", storedRole);
        }
        syncProfile(parsedUser);
      } catch (e) {
        console.error("Error restoring user from sessionStorage:", e);
        sessionStorage.removeItem("currentUser");
        setIsLoading(false);
      }
    } else {
      setIsLoading(false);
    }
  }, [normalizeRole]);

  useEffect(() => {
    const syncPublicSchoolSettings = async () => {
      try {
        const settings = await settingService.getPublicSettings();
        const schoolData = {
          nama_sekolah: settings.school_name || "",
          logo_sekolah: settings.school_logo_url || "",
          maskot_sekolah: settings.school_mascot_url || "",
          school_name: settings.school_name || "",
          school_logo_url: settings.school_logo_url || "",
          school_mascot_url: settings.school_mascot_url || "",
        };
        localStorage.setItem("schoolData", JSON.stringify(schoolData));
        window.dispatchEvent(new Event("schoolSettingsUpdated"));
      } catch (error) {
        console.error("Failed to sync school settings:", error);
      }
    };

    syncPublicSchoolSettings();
  }, []);

  const handleRoleSelect = useCallback((role: string) => {
    setSelectedRole(role);
    localStorage.setItem("selectedRole", role);
  }, []);

  const handleLogin = useCallback((role: string, name: string, phone: string, profile?: any, extraData?: { user_type?: string, is_class_officer?: boolean }) => {
    const userData = {
      role: normalizeRole(role, extraData?.user_type, extraData?.is_class_officer, role),
      name,
      phone,
      profile,
    };
    setCurrentUser(userData);
    localStorage.setItem("currentUser", JSON.stringify(userData));
    sessionStorage.setItem("currentUser", JSON.stringify(userData));
    localStorage.setItem("selectedRole", userData.role);
    setSelectedRole(null);
  }, [normalizeRole]);

  const handleLogout = useCallback(() => {
    setCurrentUser(null);
    setSelectedRole(null);
    localStorage.removeItem("currentUser");
    localStorage.removeItem("selectedRole");
    sessionStorage.removeItem("currentUser");
  }, []);

  const handleBackFromLogin = useCallback(() => {
    setSelectedRole(null);
    localStorage.removeItem("selectedRole");
  }, []);

  if (isLoading) {
    return (
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "100vh",
          fontSize: "18px",
          color: "#374151",
          backgroundColor: "#f3f4f6",
        }}
      >
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: "12px",
          }}
        >
          <div
            style={{
              width: "40px",
              height: "40px",
              border: "4px solid #e5e7eb",
              borderTop: "4px solid #3b82f6",
              borderRadius: "50%",
              animation: "spin 1s linear infinite",
            }}
          />
          <span>Loading...</span>
        </div>
        <style>{`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    );
  }

  // Validate currentUser role before redirecting
  const isValidRole = currentUser?.role && [
    'admin', 'guru', 'siswa', 'pengurus_kelas', 'waka', 'wakel'
  ].includes(currentUser.role);

  // Render System Alert if active
  if (systemStatus !== 'normal') {
    return (
      <div style={{
        position: 'fixed', inset: 0, zIndex: 9999,
        display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
        backgroundColor: '#F3F4F6', fontFamily: 'system-ui, sans-serif', textAlign: 'center', padding: '20px'
      }}>
        <div style={{
          backgroundColor: '#FFFFFF', padding: '40px', borderRadius: '16px',
          boxShadow: '0 10px 25px rgba(0,0,0,0.1)', maxWidth: '500px', width: '100%'
        }}>
          <div style={{
            width: '80px', height: '80px', borderRadius: '50%',
            backgroundColor: systemStatus === 'maintenance' ? '#FEF3C7' : '#FEE2E2',
            color: systemStatus === 'maintenance' ? '#D97706' : '#DC2626',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            margin: '0 auto 24px', fontSize: '40px'
          }}>
            {systemStatus === 'maintenance' ? '🛠️' : '⚠️'}
          </div>
          <h1 style={{ fontSize: '24px', fontWeight: 'bold', color: '#111827', marginBottom: '16px' }}>
            {systemStatus === 'maintenance' ? 'Sedang Dalam Pemeliharaan' : 'Terjadi Kesalahan Sistem'}
          </h1>
          <p style={{ color: '#4B5563', fontSize: '16px', lineHeight: '1.6', marginBottom: '32px' }}>
            {systemStatus === 'maintenance'
              ? 'Mohon maaf, sistem saat ini sedang dalam peningkatan performa atau perbaikan rutin. Kami akan segera kembali, mohon tunggu beberapa saat dan coba lagi nanti.'
              : 'Oops! Kami mendeteksi adanya gangguan pada peladen (server). Tim teknis kami sedang berupaya memperbaikinya secepat mungkin.'}
          </p>
          <button
            onClick={() => {
              setSystemStatus('normal');
              window.location.reload();
            }}
            style={{
              padding: '12px 24px', backgroundColor: '#3B82F6', color: 'white',
              border: 'none', borderRadius: '8px', fontSize: '16px', fontWeight: 'bold',
              cursor: 'pointer', transition: 'background-color 0.2s'
            }}
            onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#2563EB'}
            onMouseOut={(e) => e.currentTarget.style.backgroundColor = '#3B82F6'}
          >
            Coba Muat Ulang
          </button>
        </div>
      </div>
    );
  }

  return (
    <Router>
      <SmoothScroll />
      <Routes>
        {/* Role Selector */}
        <Route
          path="/"
          element={
            currentUser && isValidRole ? (
              <Navigate to={`/${currentUser.role}/dashboard`} replace />
            ) : (
              <LandingPage onRoleSelect={handleRoleSelect} />
            )
          }
        />

        {/* Login Page */}
        <Route
          path="/login"
          element={
            currentUser && isValidRole ? (
              <Navigate to={`/${currentUser.role}/dashboard`} replace />
            ) : selectedRole ? (
              <LoginPage
                role={selectedRole}
                onLogin={handleLogin}
                onBack={handleBackFromLogin}
              />
            ) : (
              <Navigate to="/" replace />
            )
          }
        />

        {/* Admin Dashboard */}
        <Route
          path="/admin/dashboard"
          element={
            currentUser?.role === "admin" ? (
              <AdminDashboard user={currentUser} onLogout={handleLogout} />
            ) : (
              <Navigate to="/" replace />
            )
          }
        />

        {/* Guru Dashboard */}
        <Route
          path="/guru/dashboard"
          element={
            currentUser?.role === "guru" ? (
              <GuruDashboard user={currentUser} onLogout={handleLogout} />
            ) : (
              <Navigate to="/" replace />
            )
          }
        />

        {/* Siswa Dashboard */}
        <Route
          path="/siswa/dashboard"
          element={
            currentUser?.role === "siswa" ? (
              <DashboardSiswa user={currentUser} onLogout={handleLogout} />
            ) : (
              <Navigate to="/" replace />
            )
          }
        />

        {/* Pengurus Kelas Dashboard */}
        <Route
          path="/pengurus_kelas/dashboard"
          element={
            currentUser?.role === "pengurus_kelas" ? (
              <DashboardPengurusKelas user={currentUser} onLogout={handleLogout} />
            ) : (
              <Navigate to="/" replace />
            )
          }
        />

        {/* Waka Staff Dashboard */}
        <Route
          path="/waka/dashboard"
          element={
            currentUser?.role === "waka" ? (
              <WakaDashboard user={currentUser} onLogout={handleLogout} />
            ) : (
              <Navigate to="/" replace />
            )
          }
        />

        {/* Dedicated Schedule Creation Route */}
        <Route
          path="/waka/jadwal-siswa/create"
          element={
            currentUser?.role === "waka" ? (
              <div className="bg-[#F9FAFB] min-h-screen">
                <JadwalSiswaEdit
                  user={currentUser}
                  onLogout={handleLogout}
                  onMenuClick={() => window.location.href = '/waka/dashboard'}
                />
              </div>
            ) : (
              <Navigate to="/" replace />
            )
          }
        />

        {/* Wali Kelas Dashboard */}
        <Route
          path="/wakel/dashboard"
          element={
            currentUser?.role === "wakel" ? (
              <DashboardWalliKelas user={currentUser} onLogout={handleLogout} />
            ) : (
              <Navigate to="/" replace />
            )
          }
        />

        {/* 404 - Not Found */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
} 
