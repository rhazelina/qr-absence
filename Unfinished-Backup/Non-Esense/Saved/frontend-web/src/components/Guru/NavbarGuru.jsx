import { NavLink, useNavigate } from 'react-router-dom';
import { useSchool } from '../../context/SchoolContext';
import './NavbarGuru.css';
import defaultLogo from '../../assets/logo.png';

function NavbarGuru() {
  const navigate = useNavigate();
  const { school_name, school_logo_url } = useSchool();
  const logo = school_logo_url || defaultLogo;
  const namaSekolah = school_name;

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
        <NavLink to="/guru/dashboard" className={({ isActive }) => isActive ? "active" : ""}>
          Beranda
        </NavLink>
        <NavLink to="/guru/jadwal" className={({ isActive }) => isActive ? "active" : ""}>
          Jadwal
        </NavLink>
        <NavLink to="/guru/presensi" className={({ isActive }) => isActive ? "active" : ""}>
          Kehadiran Siswa
        </NavLink>
        <NavLink to="/guru/pengajuan-izin" className={({ isActive }) => isActive ? "active" : ""}>
          Pengajuan Izin
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