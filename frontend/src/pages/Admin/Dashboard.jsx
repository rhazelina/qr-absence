import React, { useState, useEffect } from 'react';
import NavbarAdmin from '../../components/Admin/NavbarAdmin';
import { adminService } from '../../services/admin';
import './Dashboard.css';

function Dashboard() {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [stats, setStats] = useState({
    totalMurid: 0,
    totalGuru: 0,
    totalKelas: 0,
    totalJurusan: 0
  });

  const [attendanceData, setAttendanceData] = useState({
    tepatWaktu: 0,
    terlambat: 0,
    izin: 0,
    sakit: 0,
    alpha: 0
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const data = await adminService.getSummary();
        
        if (data.counts) {
          setStats({
            totalMurid: data.counts.students || 0,
            totalGuru: data.counts.teachers || 0,
            totalKelas: data.counts.classes || 0,
            totalJurusan: data.counts.majors || 0
          });
        }

        if (data.attendance_today) {
          setAttendanceData({
            tepatWaktu: data.attendance_today.present || 0,
            terlambat: data.attendance_today.late || 0,
            izin: data.attendance_today.permission || 0,
            sakit: data.attendance_today.sick || 0,
            alpha: data.attendance_today.absent || 0
          });
        }
      } catch (err) {
        console.error('Error fetching dashboard data:', err);
        setError('Gagal mengambil data statistik.');
      } finally {
        setLoading(false);
      }
    };

    fetchData();

    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const formatDate = (date) => {
    const days = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];
    const months = [
      'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
      'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
    ];
    return `${days[date.getDay()]}, ${date.getDate()} ${months[date.getMonth()]} ${date.getFullYear()}`;
  };

  const formatTime = (date) => {
    return date.toLocaleTimeString('id-ID', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  };

  return (
    <div className="dashboard-wrapper">
      <NavbarAdmin />

      <div className="dashboard-content">
        <div className="dashboard-header-section">
          <h1 className="page-title">Statistik Sekolah</h1>
          {error && <div className="error-badge" style={{ color: 'red', marginBottom: '10px' }}>{error}</div>}
        </div>

        {/* STAT CARDS */}
        <div className="stats-cards-grid">
          <div className="stat-card-item card-blue">
            <div className="stat-dots">⋮</div>
            <div className="stat-number">{loading ? '...' : stats.totalMurid}</div>
            <div className="stat-label">Total Murid</div>
          </div>

          <div className="stat-card-item card-orange">
            <div className="stat-dots">⋮</div>
            <div className="stat-number">{loading ? '...' : stats.totalGuru}</div>
            <div className="stat-label">Total Guru</div>
          </div>

          <div className="stat-card-item card-cyan">
            <div className="stat-dots">⋮</div>
            <div className="stat-number">{loading ? '...' : stats.totalKelas}</div>
            <div className="stat-label">Total Rombel</div>
          </div>

          <div className="stat-card-item card-gray">
            <div className="stat-dots">⋮</div>
            <div className="stat-number">{loading ? '...' : stats.totalJurusan}</div>
            <div className="stat-label">Total Konsentrasi Keahlian</div>
          </div>
        </div>

        {/* RIWAYAT KEHADIRAN */}
        <div className="attendance-wrapper">
          <h2 className="attendance-title">Riwayat Kehadiran</h2>

          <div className="attendance-grid">
            <div className="attendance-left">
              <div className="date-time-box">
                <div className="date-label">{formatDate(currentTime)}</div>
                <div className="time-label">{formatTime(currentTime)}</div>
              </div>

              <div className="time-range-box">
                <button className="time-range-btn">07:00:00</button>
                <span className="time-separator">—</span>
                <button className="time-range-btn">15:00:00</button>
              </div>
            </div>

            <div className="attendance-right">
              <div className="attendance-stats-row">
                <div className="attendance-stat-label">Tepat Waktu</div>
                <div className="attendance-stat-label">Terlambat</div>
                <div className="attendance-stat-label">Izin</div>
                <div className="attendance-stat-label">Sakit</div>
                <div className="attendance-stat-label">Alpha</div>
              </div>

              <div className="attendance-numbers-row">
                <div className="attendance-number-box">{loading ? '...' : attendanceData.tepatWaktu}</div>
                <div className="attendance-number-box">{loading ? '...' : attendanceData.terlambat}</div>
                <div className="attendance-number-box">{loading ? '...' : attendanceData.izin}</div>
                <div className="attendance-number-box">{loading ? '...' : attendanceData.sakit}</div>
                <div className="attendance-number-box">{loading ? '...' : attendanceData.alpha}</div>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}

export default Dashboard;
