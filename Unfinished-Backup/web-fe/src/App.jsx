import { Routes, Route, Navigate } from 'react-router-dom';
import { getDashboardByRole, getUser } from './utils/auth';
import LandingPage from './pages/Auth/LandingPage';
import LoginPage from './pages/Auth/LoginPage';
import Dashboard from './pages/Admin/Dashboard';
import DataSiswa from './pages/Admin/DataSiswa';
import DataGuru from './pages/Admin/DataGuru';
import DataKelas from './pages/Admin/DataKelas';
import DataJurusan from './pages/Admin/DataJurusan';
import ProfileSekolah from './pages/Admin/Profilesekolah';

import DashboardGuru from './pages/Guru/DashboardGuru';
import Jadwal from './pages/Guru/Jadwal';
import PresensiSiswa from './pages/Guru/PresensiSiswa';

import DashboardSiswa from './pages/Siswa/DashboardSiswa';
import Riwayat from './pages/Siswa/Riwayat';

import DashboardKelas from './pages/PengurusKelas/DashboardKelas';
import RiwayatKelas from './pages/PengurusKelas/RiwayatKelas';
import PresensiKelas from './pages/PengurusKelas/PresensiKelas';

import DashboardWakel from './pages/WaliKelas/DashboardWakel';
import Data from './pages/WaliKelas/Data';
import RiwayatKehadiran from './pages/WaliKelas/RiwayatKehadiran';
import JadwalWakel from './pages/WaliKelas/JadwalWakel'; 
import Presensi from './pages/WaliKelas/Presensi';

import DashboardWaka from './pages/Waka/DashboardWaka';
import JadwalGuruIndex from './pages/Waka/JadwalGuruIndex';
import JadwalGuruShow from './pages/Waka/JadwalGuruShow';
import JadwalGuruEdit from './pages/Waka/JadwalGuruEdit';
import JadwalSiswaIndex from './pages/Waka/JadwalSiswaIndex';
import JadwalSiswaShow from './pages/Waka/JadwalSiswaShow';
import JadwalSiswaEdit from './pages/Waka/JadwalSiswaEdit';
import KehadiranSiswaIndex from './pages/Waka/KehadiranSiswaIndex';
import KehadiranSiswaShow from './pages/Waka/KehadiranSiswaShow';
import KehadiranSiswaRekap from './pages/Waka/KehadiranSiswaRekap';
import KehadiranGuruIndex from './pages/Waka/KehadiranGuruIndex';
import KehadiranGuruShow from './pages/Waka/KehadiranGuruShow';

function ProtectedRoute({ children, allowedRoles }) {
  const user = getUser();

  if (!user) {
    return <Navigate to="/" replace />;
  }

  if (!allowedRoles.includes(user.role)) {
    return <Navigate to={getDashboardByRole(user.role)} replace />;
  }

  return children;
}

function App() {
  return (
    <Routes>
      {/* Halaman utama */}
      <Route path="/" element={<LandingPage />} />

      {/* Login dengan parameter role */}
      <Route path="/login/:role" element={<LoginPage />} />
      <Route path="/login" element={<Navigate to="/" replace />} />

      {/* Admin Routes */}
      <Route path="/admin/dashboard" element={<ProtectedRoute allowedRoles={['admin']}><Dashboard /></ProtectedRoute>} />
      <Route path="/admin/siswa" element={<ProtectedRoute allowedRoles={['admin']}><DataSiswa /></ProtectedRoute>} />
      <Route path="/admin/guru" element={<ProtectedRoute allowedRoles={['admin']}><DataGuru /></ProtectedRoute>} />
      <Route path="/admin/kelas" element={<ProtectedRoute allowedRoles={['admin']}><DataKelas /></ProtectedRoute>} />
      <Route path="/admin/jurusan" element={<ProtectedRoute allowedRoles={['admin']}><DataJurusan /></ProtectedRoute>} />
      <Route path="/admin/profil-sekolah" element={<ProtectedRoute allowedRoles={['admin']}><ProfileSekolah /></ProtectedRoute>} />

      {/* Guru Routes */}
      <Route path="/guru/dashboard" element={<ProtectedRoute allowedRoles={['guru', 'wakel']}><DashboardGuru /></ProtectedRoute>} />
      <Route path="/guru/jadwal" element={<ProtectedRoute allowedRoles={['guru', 'wakel']}><Jadwal /></ProtectedRoute>} />
      <Route path="/guru/presensi" element={<ProtectedRoute allowedRoles={['guru', 'wakel']}><PresensiSiswa /></ProtectedRoute>} />

      {/* Siswa Routes */}
      <Route path="/siswa/dashboard" element={<ProtectedRoute allowedRoles={['siswa', 'pengurus_kelas']}><DashboardSiswa /></ProtectedRoute>} />
      <Route path="/siswa/riwayat" element={<ProtectedRoute allowedRoles={['siswa', 'pengurus_kelas']}><Riwayat /></ProtectedRoute>} />
      
      {/* Pengurus Kelas Routes */}
      <Route path="/pengurus-kelas/dashboard" element={<ProtectedRoute allowedRoles={['pengurus_kelas']}><DashboardKelas /></ProtectedRoute>} />
      <Route path="/pengurus-kelas/riwayat" element={<ProtectedRoute allowedRoles={['pengurus_kelas']}><RiwayatKelas /></ProtectedRoute>} />
      <Route path="/pengurus-kelas/presensi" element={<ProtectedRoute allowedRoles={['pengurus_kelas']}><PresensiKelas /></ProtectedRoute>} />

      {/* Wali Kelas Routes */}
      <Route path="/walikelas/dashboard" element={<ProtectedRoute allowedRoles={['wakel']}><DashboardWakel /></ProtectedRoute>} />
      <Route path="/walikelas/datasiswa" element={<ProtectedRoute allowedRoles={['wakel']}><Data /></ProtectedRoute>} />
      <Route path="/walikelas/riwayatkehadiran" element={<ProtectedRoute allowedRoles={['wakel']}><RiwayatKehadiran /></ProtectedRoute>} />
      <Route path="/walikelas/jadwalwakel" element={<ProtectedRoute allowedRoles={['wakel']}><JadwalWakel /></ProtectedRoute>} />
      <Route path="/walikelas/presensi" element={<ProtectedRoute allowedRoles={['wakel']}><Presensi /></ProtectedRoute>} />

      {/* Waka Routes */}
      <Route path="/waka/dashboard" element={<ProtectedRoute allowedRoles={['waka']}><DashboardWaka /></ProtectedRoute>} />
      <Route path="/waka/jadwal-guru" element={<ProtectedRoute allowedRoles={['waka']}><JadwalGuruIndex /></ProtectedRoute>} />
      <Route path="/waka/jadwal-guru/:id" element={<ProtectedRoute allowedRoles={['waka']}><JadwalGuruShow /></ProtectedRoute>} />
      <Route path="/waka/jadwal-guru/:id/edit" element={<ProtectedRoute allowedRoles={['waka']}><JadwalGuruEdit /></ProtectedRoute>} />
      <Route path="/waka/jadwal-siswa" element={<ProtectedRoute allowedRoles={['waka']}><JadwalSiswaIndex /></ProtectedRoute>} />
      <Route path="/waka/jadwal-siswa/:id" element={<ProtectedRoute allowedRoles={['waka']}><JadwalSiswaShow /></ProtectedRoute>} />
      <Route path="/waka/jadwal-siswa/:id/edit" element={<ProtectedRoute allowedRoles={['waka']}><JadwalSiswaEdit /></ProtectedRoute>} />
      <Route path="/waka/kehadiran-siswa" element={<ProtectedRoute allowedRoles={['waka']}><KehadiranSiswaIndex /></ProtectedRoute>} />
      <Route path="/waka/kehadiran-siswa/rekap" element={<ProtectedRoute allowedRoles={['waka']}><KehadiranSiswaRekap /></ProtectedRoute>} />
      <Route path="/waka/kehadiran-siswa/:id" element={<ProtectedRoute allowedRoles={['waka']}><KehadiranSiswaShow /></ProtectedRoute>} />
      <Route path="/waka/kehadiran-guru" element={<ProtectedRoute allowedRoles={['waka']}><KehadiranGuruIndex /></ProtectedRoute>} />
      <Route path="/waka/kehadiran-guru/:id" element={<ProtectedRoute allowedRoles={['waka']}><KehadiranGuruShow /></ProtectedRoute>} />
      

      {/* Route lain yang nggak ada, balik ke landing */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default App;
