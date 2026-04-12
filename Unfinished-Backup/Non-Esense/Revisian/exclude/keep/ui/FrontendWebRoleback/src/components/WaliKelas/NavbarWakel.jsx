import React from 'react';
import { NavLink } from 'react-router-dom';
import './NavbarWakel.css';  // pastikan nama CSS sesuai
import logo from '../../assets/logo.png';  // PERBAIKAN PENTING: path gambar

function NavbarWakel() {
  return (
    <nav className="navbar">
      <div className="nav-left">
        <img src={logo} alt="Logo SMK" className="logo" />
        <span className="school-name">SMKN 2 SINGOSARI</span>
      </div>

      <div className="nav-right">
        {/* Sementara arahkan ke dashboard Guru */}
        <NavLink to="/walikelas/dashboard" activeClassName="active">
          Beranda
        </NavLink>
        <NavLink to="/walikelas/datasiswa" activeClassName="active">
          Data Siswa
        </NavLink>
        <NavLink to="/walikelas/riwayatkehadiran" activeClassName="active">
        Riwayat Kehadiran
        </NavLink>
        <NavLink to="/walikelas/jadwalwakel" activeClassName="active">
        Jadwal
        </NavLink>
      </div>
    </nav>
  );
}

export default NavbarWakel;