import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './LandingPage.css';

// Import gambar default dari src/assets
import defaultLogo from "../../assets/logo.png";

const LandingPage = () => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const navigate = useNavigate();
  
  // State untuk data dinamis dari localStorage
  const [logo, setLogo] = useState(defaultLogo);
  const [maskot, setMaskot] = useState(null);
  const [judulAplikasi, setJudulAplikasi] = useState('PRESENSI PEMBELAJARAN DIGITAL');
  const [namaSekolah, setNamaSekolah] = useState('SMKN 2 SINGOSARI');

  // Load data dari localStorage
  useEffect(() => {
    const savedLogo = localStorage.getItem('logoSekolah');
    const savedMaskot = localStorage.getItem('maskotSekolah');
    const savedProfile = localStorage.getItem('profileSekolah');
    
    if (savedLogo) {
      setLogo(savedLogo);
    }
    
    // Hanya set maskot jika ada di localStorage
    if (savedMaskot) {
      setMaskot(savedMaskot);
    }
    
    if (savedProfile) {
      try {
        const profileData = JSON.parse(savedProfile);
        if (profileData.judulAplikasi) {
          setJudulAplikasi(profileData.judulAplikasi);
        }
        if (profileData.namaSekolah) {
          setNamaSekolah(profileData.namaSekolah);
        }
      } catch (error) {
        console.error('Error loading profile:', error);
      }
    }
  }, []);

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

      {/* Hanya tampilkan maskot jika sudah di-upload */}
      {maskot && (
        <div className="maskot-container">
          <img 
            src={maskot} 
            alt="Maskot Sekolah" 
            className="maskot-image" 
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