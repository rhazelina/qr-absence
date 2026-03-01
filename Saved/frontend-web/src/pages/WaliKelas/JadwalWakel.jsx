import React, { useState, useEffect } from 'react';
import './JadwalWakel.css';
import NavbarWakel from '../../components/WaliKelas/NavbarWakel';
import { FaSchool, FaCalendarAlt, FaClock } from 'react-icons/fa';
import apiService from '../../utils/api';

const JadwalWakel = () => {
  const [classInfo, setClassInfo] = useState(null);
  const [schedules, setSchedules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploadingImage, setUploadingImage] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [classData, scheduleData] = await Promise.all([
        apiService.getHomeroomInfo().catch(() => null),
        apiService.getHomeroomSchedules().catch(() => null)
      ]);

      if (classData) {
        setClassInfo(classData.data || classData);
      }

      if (scheduleData) {
        setSchedules(scheduleData.items || scheduleData.data || []);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

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

  if (loading) {
    return (
      <div className="jadwal-container">
        <NavbarWakel />
        <div className="flex justify-center items-center h-64 text-white">
          Memuat jadwal kelas...
        </div>
      </div>
    );
  }

  const dayOrder = { 'Monday': 1, 'Tuesday': 2, 'Wednesday': 3, 'Thursday': 4, 'Friday': 5, 'Saturday': 6, 'Sunday': 7 };
  const groupedSchedules = schedules.reduce((acc, item) => {
    const day = item.day || 'Unknown';
    if (!acc[day]) acc[day] = [];
    acc[day].push(item);
    return acc;
  }, {});

  const sortedDays = Object.keys(groupedSchedules).sort((a, b) => (dayOrder[a] || 8) - (dayOrder[b] || 8));

  return (
    <div className="jadwal-container">
      <NavbarWakel />
      <div className="jadwal-wrapper">
        <div className="jadwal-layout">
          {/* Sidebar Profile */}
          <div className="jadwal-sidebar">
            <div className="jadwal-profile-card">
              <div className="jadwal-avatar">
                <FaSchool size={50} style={{ color: '#003d73' }} />
              </div>
              <div className="jadwal-teacher-info">
                <h2 className="jadwal-teacher-name">{classInfo?.name || 'Nama Kelas'}</h2>
                <p className="jadwal-teacher-nip">{classInfo?.major?.name || classInfo?.major_name || '-'}</p>
                {classInfo?.homeroom_teacher?.user?.name && (
                  <p className="text-xs mt-2">Wali: {classInfo.homeroom_teacher.user.name}</p>
                )}
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="jadwal-main">
            {/* Upload controls */}
            <div className="flex gap-4 items-center mb-4">
              {classInfo?.schedule_image_url && (
                <a href={classInfo.schedule_image_url} target="_blank" rel="noopener noreferrer" className="text-sm text-blue-600">Lihat Jadwal</a>
              )}
              <label className="btn btn-sm">
                Unggah Jadwal
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={async (e) => {
                    const file = e.target.files[0];
                    if (!file) return;
                    setUploadingImage(true);
                    try {
                      const form = new FormData();
                      form.append('image', file);
                      const res = await apiService.uploadClassScheduleImage(classInfo.id, form);
                      if (res && res.url) {
                        setClassInfo(prev => ({ ...prev, schedule_image_url: res.url }));
                      }
                    } catch (err) {
                      console.error('upload class image failed', err);
                    } finally {
                      setUploadingImage(false);
                    }
                  }}
                />
              </label>
              {uploadingImage && <span>Uploading...</span>}
            </div>

            {/* Schedule image */}
            <div className="schedule-image-container">
              {classInfo?.schedule_image_url ? (
                <img src={classInfo.schedule_image_url} alt="Jadwal" />
              ) : (
                <p className="text-gray-300">Belum ada gambar jadwal</p>
              )}
            </div>

            {/* Schedule list */}
            <div className="mt-8">
              {sortedDays.map(day => (
                <div key={day} className="day-section">
                  <div className="day-header">
                    <FaCalendarAlt className="inline-block mr-2" />
                    {dayNameIndo[day] || day}
                  </div>
                  <div className="schedule-list-container">
                    {groupedSchedules[day].sort((a, b) => a.start_time.localeCompare(b.start_time)).map((item, idx) => (
                      <div key={idx} className="schedule-item">
                        <div className="course-info">
                          <div className="course-subject">{item.subject}</div>
                          <div className="course-teacher">{item.teacher}</div>
                        </div>
                        <div className="time-info">
                          <div className="time-range">
                            <FaClock className="inline-block mr-1" />
                            {item.start_time?.substring(0, 5)} - {item.end_time?.substring(0, 5)}
                          </div>
                          <div className="room-info">Ruang: {item.room || '-'}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
              {sortedDays.length === 0 && (
                <div className="no-schedules">
                  <p>Belum ada jadwal aktif</p>
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
