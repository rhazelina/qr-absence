import { NavLink } from 'react-router-dom';
import { useSchool } from '../../context/SchoolContext';
import defaultLogo from '../../assets/logo.png';  

function NavbarSiswa() {
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
        <NavLink to="/siswa/dashboard" className={({ isActive }) => isActive ? 'active' : ''}>
          Beranda
        </NavLink>
        <NavLink to="/siswa/riwayat" className={({ isActive }) => isActive ? 'active' : ''}>
          Riwayat Kehadiran
        </NavLink>
      </div>
    </nav>
  );
}

export default NavbarSiswa;