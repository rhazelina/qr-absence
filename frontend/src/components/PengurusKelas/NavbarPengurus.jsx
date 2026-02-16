import React, { useState, useEffect } from 'react';
import { NavLink } from 'react-router-dom';
import './NavbarPengurus.css';
import defaultLogo from '../../assets/logo.png';

function NavbarPengurus() {
  const [logo, setLogo] = useState(defaultLogo);
  const [namaSekolah, setNamaSekolah] = useState('SMKN 2 SINGOSARI');

  useEffect(() => {
    // Load logo dari localStorage
    const savedLogo = localStorage.getItem('logoSekolah');
    if (savedLogo) {
      setLogo(savedLogo);
    }

    // Load nama sekolah dari localStorage
    const savedProfile = localStorage.getItem('profileSekolah');
    if (savedProfile) {
      try {
        const profileData = JSON.parse(savedProfile);
        if (profileData.namaSekolah) {
          setNamaSekolah(profileData.namaSekolah);
        }
      } catch (error) {
        console.error('Error loading profile:', error);
      }
    }
  }, []);

  return (
    <nav className="navbar">
      <div className="nav-left">
        <img src={logo} alt="Logo SMK" className="logo" />
        <span className="school-name">{namaSekolah}</span>
      </div>

      <div className="nav-right">
        <NavLink to="/pengurus-kelas/dashboard" className={({ isActive }) => isActive ? 'active' : ''}>
          Beranda
        </NavLink>
        <NavLink to="/pengurus-kelas/riwayat" className={({ isActive }) => isActive ? 'active' : ''}>
          Riwayat Kehadiran
        </NavLink>
        <NavLink to="/pengurus-kelas/presensi" className={({ isActive }) => isActive ? 'active' : ''}>
          Presensi
        </NavLink>
      </div>
    </nav>
  );
}

export default NavbarPengurus;