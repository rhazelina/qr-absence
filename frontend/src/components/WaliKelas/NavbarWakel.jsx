import { useSchool } from '../../context/SchoolContext';
import defaultLogo from '../../assets/logo.png';

function NavbarWakel() {
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