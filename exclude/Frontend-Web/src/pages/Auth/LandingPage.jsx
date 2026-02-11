import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './LandingPage.css';

// Import gambar dari src/assets
import logo from "../../assets/logo.png";
import ino from "../../assets/ino.png";
import rasi from "../../assets/rasi.png";

const LandingPage = () => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const navigate = useNavigate();

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
      {/* Logo sekolah */}
      <img src={logo} alt="SMKN 2 Singosari Logo" className="school-logo" />

      <div className="title">
        <h1>PRESENSI PEMBELAJARAN</h1>
        <h2>DIGITAL SMKN 2 SINGOSARI</h2>
      </div>

      <div className="characters-container">
        <div className="character left">
          <div className="circle orange-circle"></div>
          <img src={rasi} alt="Rasi" className="character-img" />
        </div>

        <div className="character right">
          <div className="circle blue-circle"></div>
          <img src={ino} alt="Ino" className="character-img" />
        </div>
      </div>

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

      <div className="footer">@SMKN 2 SINGOSARI</div>
    </div>
  );
};

export default LandingPage;