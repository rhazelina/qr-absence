import React from 'react';
import { NavLink } from 'react-router-dom';
import './NavbarPengurus.css';
import logo from '../../assets/logo.png';

function NavbarPengurus() {
  return (
    <nav className="navbar">
      <div className="nav-left">
        <img src={logo} alt="Logo SMK" className="logo" />
        <span className="school-name">SMKN 2 SINGOSARI</span>
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