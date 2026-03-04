import React, { useState, useEffect } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import './NavbarGuru.css';
import defaultLogo from '../../assets/logo.png';

function NavbarGuru() {
  const navigate = useNavigate();
  const [logo, setLogo] = useState(defaultLogo);
  const [namaSekolah, setNamaSekolah] = useState('SMKN 2 SINGOSARI');

  // Load logo dan nama sekolah dari localStorage
  useEffect(() => {
    const savedLogo = localStorage.getItem('logoSekolah');
    const savedProfile = localStorage.getItem('profileSekolah');
    
    if (savedLogo) {
      setLogo(savedLogo);
    }
    
    if (savedProfile) {
      try {
        const profileData = JSON.parse(savedProfile);
        if (profileData.namaSekolah) {
          setNamaSekolah(profileData.namaSekolah);
        }
      } catch (error) {
        console.error('Error loading profile data:', error);
      }
    }
  }, []);

  const handleLogout = () => {
    const confirmLogout = window.confirm('Apakah Anda yakin ingin keluar?');
    
    if (confirmLogout) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      sessionStorage.clear();
      navigate('/login');
      alert('Anda telah berhasil logout');
    }
  };

  return (
    <nav className="navbar">
      <div className="nav-left">
        <img src={logo} alt="Logo SMK" className="logo" />
        <span className="school-name">{namaSekolah}</span>
      </div>

      <div className="nav-right">
        <NavLink to="/guru/dashboard" activeClassName="active">
          Beranda
        </NavLink>
        <NavLink to="/guru/jadwal" activeClassName="active">
          Jadwal
        </NavLink>
        <NavLink to="/guru/presensi" activeClassName="active">
          Kehadiran Siswa
        </NavLink>
        
        <button onClick={handleLogout} className="btn-logoutt">
          <i className="fas fa-sign-out-alt"></i>
          <span>Keluar</span>
        </button>
      </div>
    </nav>
  );
}

export default NavbarGuru;