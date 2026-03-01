import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSchool } from '../../context/SchoolContext';

// Import gambar default dari src/assets
import defaultLogo from "../../assets/logo.png";

const LandingPage = () => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const navigate = useNavigate();
  const { school_name, school_logo_url, school_mascot_url } = useSchool();
  
  const logo = school_logo_url || defaultLogo;
  const maskot = school_mascot_url;
  const judulAplikasi = 'PRESENSI PEMBELAJARAN DIGITAL';
  const namaSekolah = school_name;

  const toggleDropdown = () => {
    setIsDropdownOpen(!isDropdownOpen);
  };

  const handleRoleSelect = (role) => {
    setIsDropdownOpen(false);
    // Navigate berdasarkan role yang dipilih
    const roleRoutes = {
      'Admin': '/login/admin',
      'Waka': '/login/waka',
      'Peserta Didik': '/login/peserta-didik',
      'Guru': '/login/guru',
      'Wali Kelas': '/login/wali-kelas',
      'Pengurus Kelas': '/login/pengurus-kelas'
    };
    navigate(roleRoutes[role]);
  };

  return (
    <div className="container">
      {/* Logo sekolah - dinamis dari localStorage */}
      <img src={logo} alt="Logo Sekolah" className="school-logo" />

      <div className="title">
        <h2>{judulAplikasi}</h2>
        <h2>{namaSekolah}</h2>
      </div>

      {/* Hanya tampilkan maskot jika sudah di-upload atau ada di localStorage */}
      {maskot && (
        <div className="maskot-container">
          <img 
            src={maskot} 
            alt="Maskot Sekolah" 
            className="maskot-image" 
            onError={(e) => {
              e.target.style.display = 'none';
            }}
          />
        </div>
      )}

      {/* Dropdown Masuk Sebagai */}
      <div className="login-dropdown">
        <button 
          className={`dropdown-button ${isDropdownOpen ? 'active' : ''}`}
          onClick={toggleDropdown}
        >
          Masuk Sebagai
        </button>
        
        {isDropdownOpen && (
          <div className="dropdown-menu">
            <div className="dropdown-item" onClick={() => handleRoleSelect('Admin')}>
              Admin
            </div>
            <div className="dropdown-item" onClick={() => handleRoleSelect('Waka')}>
              Waka
            </div>
            <div className="dropdown-item" onClick={() => handleRoleSelect('Peserta Didik')}>
              Peserta Didik
            </div>
            <div className="dropdown-item" onClick={() => handleRoleSelect('Guru')}>
              Guru
            </div>
            <div className="dropdown-item" onClick={() => handleRoleSelect('Wali Kelas')}>
              Wali Kelas
            </div>
            <div className="dropdown-item" onClick={() => handleRoleSelect('Pengurus Kelas')}>
              Pengurus Kelas
            </div>
          </div>
        )}
      </div>

      <div className="footer">@{namaSekolah}</div>
    </div>
  );
};

export default LandingPage;
