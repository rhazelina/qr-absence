import React, { useCallback, useEffect, useState } from 'react';
import NavbarAdmin from '../../components/Admin/NavbarAdmin';
import './Dashboard.css';
import apiService from '../../utils/api';

const getTodayDate = () => new Date().toISOString().split('T')[0];

const normalizeTime = (value, fallback) => {
  if (!value) return fallback;
  const parts = String(value).split(':');
  if (parts.length >= 2) return `${parts[0].padStart(2, '0')}:${parts[1].padStart(2, '0')}:00`;
  return fallback;
};

function Dashboard() {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [loading, setLoading] = useState(true);

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
    alfa: 0
  });

  const [schoolHours, setSchoolHours] = useState({
    start: '07:00:00',
    end: '15:00:00'
  });

  const loadData = useCallback(async () => {
    setLoading(true);

    try {
      const today = getTodayDate();
      const [dashboardResult, attendanceResult, settingsResult] = await Promise.all([
        apiService.get('/admin/summary'),
        apiService.get(`/attendance/summary?from=${today}&to=${today}`).catch(() => null),
        apiService.get('/settings/public').catch(() => null)
      ]);

      setStats({
        totalMurid: dashboardResult?.students_count || 0,
        totalGuru: dashboardResult?.teachers_count || 0,
        totalKelas: dashboardResult?.classes_count || 0,
        totalJurusan: dashboardResult?.majors_count || 0
      });

      const attendanceToday = dashboardResult?.attendance_today || {};
      const fallbackAttendance = attendanceResult || {};

      setAttendanceData({
        tepatWaktu: attendanceToday.hadir ?? fallbackAttendance.present ?? 0,
        terlambat: attendanceToday.terlambat ?? fallbackAttendance.late ?? 0,
        izin: attendanceToday.izin ?? ((fallbackAttendance.excused || 0) + (fallbackAttendance.izin || 0)),
        sakit: attendanceToday.sakit ?? fallbackAttendance.sick ?? 0,
        alfa: attendanceToday.alpha ?? (fallbackAttendance.absent || fallbackAttendance.alpha || 0)
      });

      setSchoolHours({
        start: normalizeTime(settingsResult?.school_start_time, '07:00:00'),
        end: normalizeTime(settingsResult?.school_end_time, '15:00:00')
      });
    } catch (error) {
      console.error('Error loading dashboard data:', error);
      setStats({ totalMurid: 0, totalGuru: 0, totalKelas: 0, totalJurusan: 0 });
      setAttendanceData({ tepatWaktu: 0, terlambat: 0, izin: 0, sakit: 0, alfa: 0 });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  useEffect(() => {
    const statsInterval = setInterval(loadData, 30000);
    return () => clearInterval(statsInterval);
  }, [loadData]);

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
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

  const formatTime = (date) => (
    date.toLocaleTimeString('id-ID', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    })
  );

  if (loading) {
    return (
      <div className="dashboard-wrapper">
        <NavbarAdmin />
        <div
          style={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            minHeight: '60vh',
            fontSize: '18px',
            color: '#6b7280'
          }}
        >
          Memuat data dashboard...
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard-wrapper">
      <NavbarAdmin />

      <div className="dashboard-content">
        <div className="dashboard-header-section">
          <h1 className="page-title">Statistik Sekolah</h1>
        </div>

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

        <div className="attendance-wrapper">
          <h2 className="attendance-title">Riwayat Kehadiran</h2>

          <div className="attendance-grid">
            <div className="attendance-left">
              <div className="date-time-box">
                <div className="date-label">{formatDate(currentTime)}</div>
                <div className="time-label">{formatTime(currentTime)}</div>
              </div>

              <div className="time-range-box">
                <button className="time-range-btn">{schoolHours.start}</button>
                <span className="time-separator">—</span>
                <button className="time-range-btn">{schoolHours.end}</button>
              </div>
            </div>

            <div className="attendance-right">
              <div className="attendance-stats-row">
                <div className="attendance-stat-label">Tepat Waktu</div>
                <div className="attendance-stat-label">Terlambat</div>
                <div className="attendance-stat-label">Izin</div>
                <div className="attendance-stat-label">Sakit</div>
                <div className="attendance-stat-label">Alfa</div>
              </div>

              <div className="attendance-numbers-row">
                <div className="attendance-number-box">{attendanceData.tepatWaktu}</div>
                <div className="attendance-number-box">{attendanceData.terlambat}</div>
                <div className="attendance-number-box">{attendanceData.izin}</div>
                <div className="attendance-number-box">{attendanceData.sakit}</div>
                <div className="attendance-number-box">{attendanceData.alfa}</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
