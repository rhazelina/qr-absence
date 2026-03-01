import { NavLink } from 'react-router-dom';
import { useSchool } from '../../context/SchoolContext';
import './NavbarPengurus.css';
import defaultLogo from '../../assets/logo.png';

function NavbarPengurus() {
  const { school_name, school_logo_url } = useSchool();
  const logo = school_logo_url || defaultLogo;
  const namaSekolah = school_name;

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