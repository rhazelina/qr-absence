import React, { useState, useEffect } from 'react';
import { NavLink } from 'react-router-dom';
import './NavbarWakel.css';
import defaultLogo from '../../assets/logo.png';

function NavbarWakel() {
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
        <NavLink to="/walikelas/dashboard" className={({ isActive }) => isActive ? 'active' : ''}>
          Beranda
        </NavLink>
        <NavLink to="/walikelas/datasiswa" className={({ isActive }) => isActive ? 'active' : ''}>
          Data Siswa
        </NavLink>
        <NavLink to="/walikelas/riwayatkehadiran" className={({ isActive }) => isActive ? 'active' : ''}>
          Riwayat Kehadiran
        </NavLink>
        <NavLink to="/walikelas/jadwalwakel" className={({ isActive }) => isActive ? 'active' : ''}>
          Jadwal
        </NavLink>
      </div>
    </nav>
  );
}

export default NavbarWakel;