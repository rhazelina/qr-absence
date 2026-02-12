import React, { useState, useEffect } from 'react';
import NavbarAdmin from '../../components/Admin/NavbarAdmin';
import './Dashboard.css';

function Dashboard() {
  const [currentTime, setCurrentTime] = useState(new Date());

  /* =====================
     DATA DUMMY STATISTIK
  ===================== */
  const [stats] = useState({
    totalMurid: 864,
    totalGuru: 52,
    totalKelas: 24,
    totalJurusan: 6
  });

  const [attendanceData] = useState({
    tepatWaktu: 720,
    terlambat: 48,
    izin: 32,
    sakit: 18,
    alpha: 6
  });

  useEffect(() => {
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
        {/* JARAK SUDAH DITURUNKAN */}
        <div className="dashboard-header-section">
          <h1 className="page-title">Statistik Sekolah</h1>
        </div>

        {/* STAT CARDS */}
        <div className="stats-cards-grid">
          <div className="stat-card-item card-blue">
            <div className="stat-dots">⋮</div>
            <div className="stat-number">{stats.totalMurid}</div>
            <div className="stat-label">Total Murid</div>
          </div>

          <div className="stat-card-item card-orange">
            <div className="stat-dots">⋮</div>
            <div className="stat-number">{stats.totalGuru}</div>
            <div className="stat-label">Total Guru</div>
          </div>

          <div className="stat-card-item card-cyan">
            <div className="stat-dots">⋮</div>
            <div className="stat-number">{stats.totalKelas}</div>
            <div className="stat-label">Total Rombel</div>
          </div>

          <div className="stat-card-item card-gray">
            <div className="stat-dots">⋮</div>
            <div className="stat-number">{stats.totalJurusan}</div>
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
                <div className="attendance-number-box">{attendanceData.tepatWaktu}</div>
                <div className="attendance-number-box">{attendanceData.terlambat}</div>
                <div className="attendance-number-box">{attendanceData.izin}</div>
                <div className="attendance-number-box">{attendanceData.sakit}</div>
                <div className="attendance-number-box">{attendanceData.alpha}</div>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}

export default Dashboard;
