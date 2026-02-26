import { NavLink, useNavigate } from 'react-router-dom';
import { useSchool } from '../../context/SchoolContext';
import defaultLogo from '../../assets/logo.png';

function NavbarAdmin() {
  const navigate = useNavigate();
  const { school_name, school_logo_url } = useSchool();

  const logo = school_logo_url || defaultLogo;
  const namaSekolah = school_name;

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
        <NavLink 
          to="/admin/dashboard" 
          className={({ isActive }) => isActive ? "active" : ""}
        >
          Beranda
        </NavLink>
        <NavLink 
          to="/admin/siswa" 
          className={({ isActive }) => isActive ? "active" : ""}
        >
          Data Siswa
        </NavLink>
        <NavLink 
          to="/admin/guru" 
          className={({ isActive }) => isActive ? "active" : ""}
        >
          Data Guru
        </NavLink>
        <NavLink 
          to="/admin/kelas" 
          className={({ isActive }) => isActive ? "active" : ""}
        >
          Data Kelas
        </NavLink>
        <NavLink 
          to="/admin/jurusan" 
          className={({ isActive }) => isActive ? "active" : ""}
        >
          Data Konsentrasi Keahlian
        </NavLink>
        <NavLink 
          to="/admin/profil-sekolah" 
          className={({ isActive }) => isActive ? "active" : ""}
        >
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