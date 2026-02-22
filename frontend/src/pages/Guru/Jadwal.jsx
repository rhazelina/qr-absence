import React, { useState, useEffect } from 'react';
import { Calendar, Clock, User } from 'lucide-react';
import './Jadwal.css';
import NavbarGuru from '../../components/Guru/NavbarGuru';
import apiService from '../../utils/api';

const Jadwal = () => {
  const [profile, setProfile] = useState(null);
  const [schedules, setSchedules] = useState([]);
  const [loading, setLoading] = useState(true);

  const API_URL = import.meta.env.VITE_API_URL;

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [meRes, scheduleRes] = await Promise.all([
        apiService.getProfile(),
        apiService.get('/me/schedules')
      ]);

      if (meRes) {
        setProfile(meRes.data || meRes);
      }

      if (scheduleRes) {
        const items = scheduleRes.items || scheduleRes.data || scheduleRes || [];
        setSchedules(items);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
      setSchedules([]);
    } finally {
      setLoading(false);
    }
  };

  // Group items by day
  const dayOrder = { 'Monday': 1, 'Tuesday': 2, 'Wednesday': 3, 'Thursday': 4, 'Friday': 5, 'Saturday': 6, 'Sunday': 7 };
  const dayNameIndo = {
    'Monday': 'Senin',
    'Tuesday': 'Selasa',
    'Wednesday': 'Rabu',
    'Thursday': 'Kamis',
    'Friday': 'Jumat',
    'Saturday': 'Sabtu',
    'Sunday': 'Minggu',
    'Unknown': 'Tidak Diketahui'
  };

  const groupedSchedules = schedules.reduce((acc, item) => {
    const day = item.day || 'Unknown';
    if (!acc[day]) acc[day] = [];
    acc[day].push(item);
    return acc;
  }, {});

  const sortedDays = Object.keys(groupedSchedules).sort((a, b) => (dayOrder[a] || 8) - (dayOrder[b] || 8));

  if (loading) {
    return (
      <div className="jadwal-container">
        <NavbarGuru />
        <div className="flex justify-center items-center h-64 text-white">
          Memuat jadwal...
        </div>
      </div>
    );
  }

  const profilePhoto = profile?.teacher_profile?.profile_photo 
    ? (profile.teacher_profile.profile_photo.startsWith('http') 
        ? profile.teacher_profile.profile_photo 
        : `${API_URL}/storage/${profile.teacher_profile.profile_photo}`)
    : null;

  return (
    <div className="jadwal-container">
      <NavbarGuru />
      
      <h1 className="jadwal-title">Jadwal Mengajar</h1>

      <div className="jadwal-wrapper">
        <div className="jadwal-layout">
          {/* Sidebar Profile */}
          <div className="jadwal-sidebar">
            <div className="jadwal-profile-card">
              <div className="jadwal-avatar">
                {profilePhoto ? (
                  <img src={profilePhoto} alt={profile?.name} />
                ) : (
                  <User size={70} />
                )}
              </div>
              <div className="jadwal-teacher-info">
                <h2 className="jadwal-teacher-name">{profile?.name || 'Nama Guru'}</h2>
                <p className="jadwal-teacher-nip">
                  {profile?.teacher_profile?.nip ? `NIP. ${profile.teacher_profile.nip}` : 'NIP Tidak Tersedia'}
                </p>
                <div style={{ color: 'rgba(255,255,255,0.7)', fontSize: '14px', marginTop: '10px' }}>
                  Kode: {profile?.teacher_profile?.kode_guru || '-'}
                </div>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="jadwal-main">
            <div className="jadwal-header-main">
              <Calendar size={30} />
              <h1>Jadwal Pelajaran</h1>
            </div>

            <div className="schedule-list-container">
              {sortedDays.map(day => (
                <div key={day} className="day-section">
                  <div className="day-header">
                    <Calendar size={18} />
                    {dayNameIndo[day] || day}
                  </div>
                  <div className="schedule-items-wrapper">
                    {groupedSchedules[day].sort((a, b) => a.start_time.localeCompare(b.start_time)).map((item, idx) => (
                      <div key={idx} className="schedule-item">
                        <div className="course-info">
                          <div className="course-class">{item.class}</div>
                          <div className="course-subject">{item.subject}</div>
                        </div>
                        <div className="time-info">
                          <div className="time-range">
                            <Clock size={16} />
                            {item.start_time?.substring(0, 5)} - {item.end_time?.substring(0, 5)}
                          </div>
                          <div className="room-info">
                            Ruang: {item.room || '-'}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}

              {sortedDays.length === 0 && (
                <div className="no-schedules">
                  <p>Belum ada jadwal mengajar yang aktif untuk Anda.</p>
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