import React, { useState, useEffect } from 'react';
import './JadwalWakel.css';
import NavbarWakel from '../../components/WaliKelas/NavbarWakel';
import { FaSchool, FaUsers, FaCalendarAlt, FaClock } from 'react-icons/fa';

const JadwalWakel = () => {
  const [classInfo, setClassInfo] = useState(null);
  const [schedules, setSchedules] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const headers = {
        'Authorization': `Bearer ${token}`,
        'Accept': 'application/json'
      };

      const [classRes, scheduleRes] = await Promise.all([
        fetch('http://localhost:8000/api/me/homeroom', { headers }),
        fetch('http://localhost:8000/api/me/homeroom/schedules', { headers })
      ]);

      if (classRes.ok) {
        const classData = await classRes.json();
        setClassInfo(classData.data || classData);
      }

      if (scheduleRes.ok) {
        const scheduleData = await scheduleRes.json();
        setSchedules(scheduleData.items || []);
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
      <div className="jadwal-container min-h-screen bg-transparent">
        <NavbarWakel />
        <div className="flex justify-center items-center h-[calc(100vh-80px)] text-[#94a3b8] font-bold">
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
    <div className="jadwal-container min-h-screen bg-transparent p-4 md:p-10">
      <NavbarWakel />
      
      <h1 className="text-3xl font-bold text-white mb-8 max-w-7xl mx-auto pl-4">Jadwal Pelajaran</h1>

      <div className="max-w-7xl mx-auto bg-white rounded-[2rem] shadow-2xl overflow-hidden min-h-[600px] flex flex-col md:flex-row">
        {/* Sidebar Profile-like Class Info */}
        <div className="md:w-80 flex-shrink-0 bg-gradient-to-b from-[#003d73] to-[#001a33] p-10 flex flex-col items-center justify-center text-center">
          <div className="w-32 h-32 bg-white/95 rounded-full flex items-center justify-center mb-8 shadow-xl text-[#003d73]">
            <FaSchool size={50} />
          </div>
          <div className="w-full">
            <h2 className="text-2xl font-bold text-white mb-3 leading-tight">{classInfo?.name || 'Kelas Tidak Ditemukan'}</h2>
            <p className="text-white/80 text-lg font-medium">{classInfo?.major?.name || classInfo?.major_name || '-'}</p>
            <div className="mt-8 pt-8 border-t border-white/10">
              <p className="text-white/60 text-[10px] font-bold uppercase tracking-widest mb-2">Wali Kelas</p>
              <p className="text-white font-bold text-lg">{classInfo?.homeroom_teacher?.user?.name || '-'}</p>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 bg-white p-6 md:p-12 overflow-y-auto max-h-[800px]">
          <div className="flex items-center gap-4 mb-10 border-b border-gray-100 pb-6">
            <div className="p-3 bg-blue-50 text-blue-600 rounded-2xl">
              <FaCalendarAlt size={24} />
            </div>
            <h1 className="text-2xl font-black text-gray-900 tracking-tight">Jadwal Kelas Mingguan</h1>
          </div>

          <div className="space-y-12">
            {sortedDays.map(day => (
              <div key={day} className="day-section">
                <div className="flex items-center gap-3 bg-gray-50/80 px-6 py-3 rounded-2xl font-black text-gray-700 uppercase tracking-widest text-xs border border-gray-100 mb-6">
                  <FaCalendarAlt className="text-blue-500" />
                  {dayNameIndo[day] || day}
                </div>
                <div className="schedule-list-container space-y-4">
                  {groupedSchedules[day].sort((a, b) => a.start_time.localeCompare(b.start_time)).map((item, idx) => (
                    <div key={idx} className="schedule-item flex items-center justify-between p-6 bg-white rounded-3xl border border-gray-100 hover:border-blue-200 hover:shadow-xl hover:shadow-blue-500/5 transition-all group">
                      <div className="course-info flex items-center gap-5">
                         <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold text-lg group-hover:bg-blue-600 group-hover:text-white transition-colors">
                            {item.subject?.charAt(0) || 'M'}
                         </div>
                         <div>
                            <div className="course-subject font-black text-gray-900 text-lg leading-tight">{item.subject}</div>
                            <div className="course-teacher text-sm text-gray-500 font-medium mt-1">Oleh: {item.teacher}</div>
                         </div>
                      </div>
                      <div className="time-info text-right flex flex-col items-end gap-2">
                        <div className="time-range flex items-center gap-2 px-4 py-1.5 bg-blue-50 text-blue-700 rounded-full text-xs font-black tracking-wider">
                          <FaClock size={14} className="text-blue-400" />
                          {item.start_time?.substring(0, 5)} - {item.end_time?.substring(0, 5)}
                        </div>
                        <div className="room-info text-[10px] font-bold text-gray-400 uppercase tracking-widest bg-gray-50 px-3 py-1 rounded-lg border border-gray-100">
                          RUANG: {item.room || '-'}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}

            {sortedDays.length === 0 && (
              <div className="no-schedules flex flex-col items-center justify-center py-20 bg-gray-50 rounded-[2.5rem] border-2 border-dashed border-gray-100">
                <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center text-gray-200 text-3xl mb-4 shadow-sm">
                  <FaCalendarAlt />
                </div>
                <p className="text-gray-400 font-bold uppercase tracking-widest text-xs">Belum ada jadwal aktif</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default JadwalWakel;