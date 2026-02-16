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
import { SmoothScroll } from "./component/Shared/SmoothScroll";
import { PopupProvider } from "./component/Shared/Popup/PopupProvider";
import { storage } from "./utils/storage";
// import { SmoothScroll } from "./Shared/SmoothScroll";


export default function App() {
  const [currentUser, setCurrentUser] = useState<{
    role: string;
    name: string;
    phone: string;
  } | null>(() => {
    const data = storage.getUserData();
    if (data) {
      return {
        role: data.role,
        name: data.name,
        phone: data.phone || '',
      };
    }
    return null;
  });

  const [selectedRole, setSelectedRole] = useState<string | null>(storage.getSelectedRole());
  const [isLoading, setIsLoading] = useState(true);

  // Validate token and restore user on mount
  useEffect(() => {
    const validateAuth = async () => {
      const { authService } = await import('./services/auth');

      // Check if token exists
      if (!authService.isAuthenticated()) {
        setIsLoading(false);
        return;
      }

      try {
        // Validate token by fetching user data
        const user = await authService.getMe();
        const role = user.role || user.user_type || '';
        const userData = {
          role: role,
          name: user.name,
          phone: user.phone || '',
        };
        setCurrentUser(userData);
        storage.setRole(role);
        storage.setUserData(user);
      } catch (error) {
        console.error("Token validation failed:", error);
        // Clear invalid token
        storage.clearAll();
      } finally {
        setIsLoading(false);
      }
    };

    validateAuth();
  }, []);

  const handleRoleSelect = useCallback((role: string) => {
    setSelectedRole(role);
    storage.setSelectedRole(role);
  }, []);

  const handleLogin = useCallback((role: string, name: string, phone: string) => {
    const userData = { role, name, phone };
    setCurrentUser(userData);
    storage.setRole(role);
    storage.setSelectedRole(role);
    setSelectedRole(role);
  }, []);

  const handleLogout = useCallback(async () => {
    const { authService } = await import('./services/auth');
    try {
      await authService.logout();
    } catch (e) {
      console.error("Logout failed:", e);
    }
    storage.clearAll();
    setCurrentUser(null);
    setSelectedRole(null);
  }, []);

  const handleBackFromLogin = useCallback(() => {
    setSelectedRole(null);
    storage.removeSelectedRole();
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

  return (
    <PopupProvider>
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
    </PopupProvider>
  );
} 
