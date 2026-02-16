import React, { useState, useEffect } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import './NavbarAdmin.css';
import defaultLogo from '../../assets/logo.png';

function NavbarAdmin() {
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
        console.error('Error loading profile:', error);
      }
    }
  }, []);

  const handleLogout = () => {
    // Konfirmasi logout
    const confirmLogout = window.confirm('Apakah Anda yakin ingin keluar?');
    
    if (confirmLogout) {
      // Hapus token atau data session (sesuaikan dengan sistem autentikasi Anda)
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      sessionStorage.clear();
      
      // Redirect ke halaman login
      navigate('/login');
      
      // Optional: tampilkan pesan
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
        <NavLink to="/admin/dashboard" activeClassName="active">
          Beranda
        </NavLink>
        <NavLink to="/admin/siswa" activeClassName="active">
          Data Siswa
        </NavLink>
        <NavLink to="/admin/guru" activeClassName="active">
          Data Guru
        </NavLink>
        <NavLink to="/admin/kelas" activeClassName="active">
          Data Kelas
        </NavLink>
        <NavLink to="/admin/jurusan" activeClassName="active">
          Data Konsentrasi Keahlian
        </NavLink>
        <NavLink to="/admin/profil-sekolah" activeClassName="active">
          Profil Sekolah
        </NavLink>
        
        {/* Button Logout */}
        <button onClick={handleLogout} className="btn-logoutt">
          <i className="fas fa-sign-out-alt"></i>
          <span>Keluar</span>
        </button>
      </div>
    </nav>
  );
}

export default NavbarAdmin;