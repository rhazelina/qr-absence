import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import NavbarAdmin from '../../components/Admin/NavbarAdmin';
import './Dashboard.css';

// API Configuration
const baseURL = import.meta.env.VITE_API_URL;
const API_BASE_URL = baseURL ? baseURL : 'http://localhost:8000/api';

// API Service
const apiService = {
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
  }
};

// Quick Access menu items (Beranda dihapus)
const quickAccessItems = [
  {
    label: 'Data Siswa',
    path: '/admin/siswa',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
        <circle cx="9" cy="7" r="4"/>
        <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
        <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
      </svg>
    ),
    color: '#f97316'
  },
  {
    label: 'Data Guru',
    path: '/admin/guru',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="8" r="4"/>
        <path d="M20 21a8 8 0 1 0-16 0"/>
        <line x1="12" y1="12" x2="12" y2="16"/>
        <line x1="10" y1="14" x2="14" y2="14"/>
      </svg>
    ),
    color: '#06b6d4'
  },
  {
    label: 'Data Kelas',
    path: '/admin/kelas',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="3" width="7" height="7"/>
        <rect x="14" y="3" width="7" height="7"/>
        <rect x="14" y="14" width="7" height="7"/>
        <rect x="3" y="14" width="7" height="7"/>
      </svg>
    ),
    color: '#8b5cf6'
  },
  {
    label: 'Data Konsentrasi Keahlian',
    path: '/admin/jurusan',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M22 10v6M2 10l10-5 10 5-10 5z"/>
        <path d="M6 12v5c3 3 9 3 12 0v-5"/>
      </svg>
    ),
    color: '#10b981'
  },
  {
    label: 'Profil Sekolah',
    path: '/admin/profil-sekolah',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
        <rect x="9" y="14" width="6" height="8"/>
        <circle cx="12" cy="6" r="1.5" fill="currentColor" stroke="none"/>
      </svg>
    ),
    color: '#f43f5e'
  }
];

function Dashboard() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);

  const [stats, setStats] = useState({
    totalMurid: 0,
    totalGuru: 0,
    totalKelas: 0,
    totalJurusan: 0
  });

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

  useEffect(() => {
    loadDashboardStats();
  }, []);

  useEffect(() => {
    const statsInterval = setInterval(() => {
      loadDashboardStats();
    }, 30000);
    return () => clearInterval(statsInterval);
  }, []);

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

        {/* AKSES CEPAT */}
        <div className="quick-access-wrapper">
          <h2 className="quick-access-title">Akses Cepat</h2>
          <div className="quick-access-grid">
            {quickAccessItems.map((item) => (
              <button
                key={item.path}
                className="quick-access-card"
                onClick={() => navigate(item.path)}
                style={{ '--accent-color': item.color }}
              >
                <div className="quick-access-icon" style={{ color: item.color }}>
                  {item.icon}
                </div>
                <span className="quick-access-label">{item.label}</span>
                <div className="quick-access-arrow">→</div>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;