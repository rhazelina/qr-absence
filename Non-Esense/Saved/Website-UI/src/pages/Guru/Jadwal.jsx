import React, { useState, useEffect } from 'react';
import './Jadwal.css';
import NavbarGuru from '../../components/Guru/NavbarGuru';
import api from '../../utils/api';

const Jadwal = () => {
  const [teacherProfile, setTeacherProfile] = useState({ name: '', nip: '' });
  const [scheduleImage, setScheduleImage] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        // Fetch profil guru
        const profile = await api.get('/me');
        setTeacherProfile({
          name: profile.name || '',
          nip: profile.profile?.nip || profile.username || ''
        });

        // Fetch schedule image berdasarkan class info yang terkait
        const teacherId = profile.profile?.id;
        if (teacherId) {
          const imgData = await api.get(`/teachers/${teacherId}/schedule-image`).catch(() => null);
          if (imgData?.url) {
            setScheduleImage(imgData.url);
          }
        }
      } catch (err) {
        console.error('Error fetching jadwal:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  return (
    <div className="jadwal-container">
      <NavbarGuru />

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

export default Jadwal;