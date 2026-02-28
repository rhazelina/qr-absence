import React, { useState, useEffect } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import './NavbarWaka.css';
import defaultLogo from '../../assets/logo.png';

function NavbarWaka() {
  const navigate = useNavigate();
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
        <NavLink 
          to="/waka/dashboard" 
          className={({ isActive }) => isActive ? "active" : ""}
        >
          Beranda
        </NavLink>
        <NavLink 
          to="/waka/jadwal-siswa" 
          className={({ isActive }) => isActive ? "active" : ""}
        >
          Jadwal Siswa
        </NavLink>
        <NavLink 
          to="/waka/jadwal-guru" 
          className={({ isActive }) => isActive ? "active" : ""}
        >
          Jadwal Guru
        </NavLink>
        <NavLink 
          to="/waka/kehadiran-guru" 
          className={({ isActive }) => isActive ? "active" : ""}
        >
          Kehadiran Guru
        </NavLink>
        <NavLink 
          to="/waka/kehadiran-siswa" 
          className={({ isActive }) => isActive ? "active" : ""}
        >
          Kehadiran Siswa
        </NavLink>
      </div>
    </nav>
  );
}

export default NavbarWaka;