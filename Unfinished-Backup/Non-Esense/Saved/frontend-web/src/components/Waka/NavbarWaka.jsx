import { NavLink, useNavigate } from 'react-router-dom';
import { useSchool } from '../../context/SchoolContext';
import defaultLogo from '../../assets/logo.png';

function NavbarWaka() {
  const navigate = useNavigate();
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