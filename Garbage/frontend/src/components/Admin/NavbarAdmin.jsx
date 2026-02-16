import React, { useState, useEffect } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { authService } from '../../services/auth';
import { settingService } from '../../services/setting';
import './NavbarAdmin.css';
import defaultLogo from '../../assets/logo.png';

function NavbarAdmin() {
  const navigate = useNavigate();
  const [schoolName, setSchoolName] = useState('SMKN 2 SINGOSARI');
  const [schoolLogo, setSchoolLogo] = useState(defaultLogo);

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const settings = await settingService.getSettings();
        if (settings.school_name) {
          setSchoolName(settings.school_name);
        }
        if (settings.school_logo_url) {
          setSchoolLogo(settings.school_logo_url);
        }
      } catch (error) {
        console.error('Error fetching school settings:', error);
      }
    };

    fetchSettings();
  }, []);

  const handleLogout = () => {
    // Konfirmasi logout
    const confirmLogout = window.confirm('Apakah Anda yakin ingin keluar?');
    
    if (confirmLogout) {
      authService.logout();
      
      // Redirect ke halaman login
      navigate('/login');
      
      // Optional: tampilkan pesan
      alert('Anda telah berhasil logout');
    }
  };

  return (
    <nav className="navbar">
      <div className="nav-left">
        <img 
          src={schoolLogo} 
          alt="Logo SMK" 
          className="logo" 
          onError={(e) => { e.target.onerror = null; e.target.src = defaultLogo; }} 
        />
        <span className="school-name">{schoolName}</span>
      </div>

      <div className="nav-right">
        <NavLink to="/admin/dashboard" className={({ isActive }) => (isActive ? "active" : "")}>
          Beranda
        </NavLink>
        <NavLink to="/admin/siswa" className={({ isActive }) => (isActive ? "active" : "")}>
          Data Siswa
        </NavLink>
        <NavLink to="/admin/guru" className={({ isActive }) => (isActive ? "active" : "")}>
          Data Guru
        </NavLink>
        <NavLink to="/admin/kelas" className={({ isActive }) => (isActive ? "active" : "")}>
          Data Kelas
        </NavLink>
        <NavLink to="/admin/jurusan" className={({ isActive }) => (isActive ? "active" : "")}>
          Data Konsentrasi Keahlian
        </NavLink>
        <NavLink to="/admin/profil-sekolah" className={({ isActive }) => (isActive ? "active" : "")}>
          Profil Sekolah
        </NavLink>
        
        {/* Button Logout */}
        <button onClick={handleLogout} className="btn-logoutt">
          <i className="fas fa-sign-out-alt"></i>
          <span>Keluar</span>
        </button>
      </div>
    </nav>
  );
}

export default NavbarAdmin;