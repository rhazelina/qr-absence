import React, { useState, useEffect } from 'react';
import NavbarAdmin from '../../components/Admin/NavbarAdmin';
import './Dashboard.css';

// API Configuration
const baseURL = import.meta.env.VITE_API_URL;
const API_BASE_URL = baseURL ? baseURL : 'http://localhost:8000/api';

// API Service
const apiService = {
  // Get dashboard statistics
  getDashboardStats: async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/dashboard/stats`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        }
      });
      if (!response.ok) throw new Error('Failed to fetch dashboard stats');
      return await response.json();
    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
      return { data: null };
    }
  },

  // Get attendance summary
  getAttendanceSummary: async (date = null) => {
    try {
      const url = date 
        ? `${API_BASE_URL}/attendance/summary?date=${date}`
        : `${API_BASE_URL}/attendance/summary`;
        
      const response = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        }
      });
      if (!response.ok) throw new Error('Failed to fetch attendance summary');
      return await response.json();
    } catch (error) {
      console.error('Error fetching attendance summary:', error);
      return { data: null };
    }
  }
};

function Dashboard() {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [loading, setLoading] = useState(true);

  // Dashboard statistics
  const [stats, setStats] = useState({
    totalMurid: 0,
    totalGuru: 0,
    totalKelas: 0,
    totalJurusan: 0
  });

  // Attendance data
  const [attendanceData, setAttendanceData] = useState({
    tepatWaktu: 0,
    terlambat: 0,
    izin: 0,
    sakit: 0,
    alfa: 0
  });

  // Load dashboard stats from API
  const loadDashboardStats = async () => {
    setLoading(true);
    const result = await apiService.getDashboardStats();
    
    if (result.data) {
      setStats({
        totalMurid: result.data.total_students || 0,
        totalGuru: result.data.total_teachers || 0,
        totalKelas: result.data.total_classes || 0,
        totalJurusan: result.data.total_majors || 0
      });
    }
    
    setLoading(false);
  };

  // Load attendance summary from API
  const loadAttendanceSummary = async () => {
    const today = new Date().toISOString().split('T')[0];
    const result = await apiService.getAttendanceSummary(today);
    
    if (result.data) {
      setAttendanceData({
        tepatWaktu: result.data.on_time || result.data.present || 0,
        terlambat: result.data.late || 0,
        izin: result.data.excused || 0,
        sakit: result.data.sick || 0,
        alfa: result.data.absent || result.data.alpha || 0
      });
    }
  };

  // Load data on component mount
  useEffect(() => {
    loadDashboardStats();
    loadAttendanceSummary();
  }, []);

  // Auto-refresh stats every 30 seconds
  useEffect(() => {
    const statsInterval = setInterval(() => {
      loadDashboardStats();
      loadAttendanceSummary();
    }, 30000); // Update every 30 seconds

    return () => clearInterval(statsInterval);
  }, []);

  // Clock update
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

  if (loading) {
    return (
      <div className="dashboard-wrapper">
        <NavbarAdmin />
        <div style={{ 
          display: 'flex', 
          justifyContent: 'center', 
          alignItems: 'center', 
          minHeight: '60vh',
          fontSize: '18px',
          color: '#6b7280'
        }}>
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

        {/* STAT CARDS - DATA DARI API */}
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

        {/* RIWAYAT KEHADIRAN - DATA DARI API */}
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