import React, { useState, useEffect } from 'react';
import './JadwalWakel.css';
import NavbarWakel from '../../components/WaliKelas/NavbarWakel';

const baseURL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';

const JadwalWakel = () => {
  const [teacherProfile, setTeacherProfile] = useState({ name: '', nip: '' });
  const [scheduleImage, setScheduleImage] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) return;

    const headers = { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' };

    // Fetch profil wali kelas
    fetch(`${baseURL}/me`, { headers })
      .then(r => r.json())
      .then(data => {
        setTeacherProfile({
          name: data.name || '',
          nip: data.profile?.nip || data.username || ''
        });
        const teacherId = data.profile?.id;
        if (teacherId) {
          return fetch(`${baseURL}/teachers/${teacherId}/schedule-image`, { headers });
        }
        return null;
      })
      .then(r => r ? r.json() : null)
      .then(imgData => {
        if (imgData?.url) setScheduleImage(imgData.url);
      })
      .catch(err => console.error('Error fetching jadwal wakel:', err))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="jadwal-container">
      <NavbarWakel />
      <div className="jadwal-wrapper">
        <div className="jadwal-layout">
          {/* Sidebar Profile */}
          <div className="jadwal-sidebar">
            <div className="jadwal-profile-card">
              <div className="jadwal-avatar">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
                </svg>
              </div>
              <div className="jadwal-teacher-info">
                <h2 className="jadwal-teacher-name">{teacherProfile.name}</h2>
                <p className="jadwal-teacher-nip">{teacherProfile.nip}</p>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="jadwal-main">
            <div className="schedule-image-container">
              {loading ? (
                <div style={{ textAlign: 'center', padding: '40px', color: '#6b7280' }}>
                  Memuat jadwal...
                </div>
              ) : scheduleImage ? (
                <img
                  src={scheduleImage}
                  alt="Jadwal Pembelajaran"
                  style={{ width: '100%', height: 'auto', borderRadius: '8px' }}
                />
              ) : (
                <div style={{ textAlign: 'center', padding: '60px 20px', color: '#9ca3af' }}>
                  <p style={{ fontSize: '16px', fontWeight: '600' }}>Jadwal belum tersedia</p>
                  <p style={{ fontSize: '14px', marginTop: '8px' }}>Silakan hubungi administrator</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default JadwalWakel;