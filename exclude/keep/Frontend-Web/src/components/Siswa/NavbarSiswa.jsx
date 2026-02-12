import React from 'react';
import { NavLink } from 'react-router-dom';
import './NavbarSiswa.css';  
import logo from '../../assets/logo.png';  

function NavbarSiswa() {
  return (
    <nav className="navbar">
      <div className="nav-left">
        <img src={logo} alt="Logo SMK" className="logo" />
        <span className="school-name">SMKN 2 SINGOSARI</span>
      </div>

      <div className="nav-right">
        <NavLink to="/siswa/dashboard" activeClassName="active">
          Beranda
        </NavLink>
        <NavLink to="/siswa/riwayat" activeClassName="active">
          Riwayat Kehadiran
        </NavLink>
      </div>
    </nav>
  );
}

export default NavbarSiswa;