import React, { useState, useEffect } from 'react';
import {
  FaCalendarAlt,
  FaClock,
  FaBookOpen,
  FaArrowLeft,
  FaSignOutAlt,
  FaChartPie,
  FaChartLine,
  FaUser,
  FaCamera,
  FaCheckCircle,
  FaExclamationTriangle,
  FaInfoCircle,
  FaProcedures,
  FaTimesCircle
} from 'react-icons/fa';
import PageWrapper from '../../components/ui/PageWrapper';
import CustomAlert from '../../components/Common/CustomAlert';
import QRScanButton from '../../components/Siswa/QRScanButton';
import { getMyAttendanceSummary } from '../../services/attendance';
import { STATUS_COLORS_HEX } from '../../utils/statusMapping';

// Subjects Modal Component
const SubjectsModal = ({ isOpen, onClose, schedules = [], isLoading }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4" onClick={onClose}>
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden animate-in fade-in zoom-in duration-300" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center gap-4 p-5 border-b border-gray-100">
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-xl transition-colors text-gray-400">
            <FaArrowLeft size={20} />
          </button>
          <h2 className="text-xl font-black text-gray-800 tracking-tight">Jadwal Hari Ini</h2>
        </div>

        <div className="p-6 overflow-y-auto max-h-[70vh] bg-gray-50/50">
          {isLoading ? (
            <div className="flex justify-center py-20">
              <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600"></div>
            </div>
          ) : schedules.length > 0 ? (
            <div className="space-y-4">
              {schedules.map((item, index) => (
                <div key={index} className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex items-center justify-between group hover:border-blue-200 transition-all">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center text-xl font-black">
                      {index + 1}
                    </div>
                    <div>
                      <h4 className="font-black text-gray-800 leading-tight">{item.subject}</h4>
                      <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mt-1">{item.teacher}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-black text-blue-600 tracking-tighter">{item.start_time} - {item.end_time}</p>
                    <p className="text-[9px] font-black text-gray-300 uppercase tracking-widest mt-1">WIB</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <div className="w-24 h-24 bg-gray-100 rounded-3xl flex items-center justify-center mb-6 text-gray-300 shadow-inner">
                <FaBookOpen size={48} />
              </div>
              <h3 className="text-xl font-black text-gray-800 mb-2">Belum Ada Jadwal</h3>
              <p className="text-gray-500 text-sm max-w-xs leading-relaxed">Tidak ada jadwal pembelajaran yang tercatat untuk hari ini.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// Line Chart Component (Simplified SVG version)
const AttendanceTrend = ({ data = [] }) => {
  if (!data || data.length === 0) {
    return (
      <div className="w-full h-48 bg-gray-50 rounded-2xl flex items-center justify-center text-gray-400 text-sm italic">
        Menunggu data tren...
      </div>
    );
  }

  return (
    <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 flex flex-col h-full">
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center text-lg shadow-sm">
            <FaChartLine />
          </div>
          <div>
            <h3 className="font-black text-gray-800 leading-tight">Tren Kehadiran</h3>
            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Statistik 6 Bulan Terakhir</p>
          </div>
        </div>
      </div>

      <div className="flex-1 flex items-end gap-2 md:gap-4 pt-4 pb-2">
        {data.map((item, i) => (
          <div key={i} className="flex-1 flex flex-col items-center gap-3 group">
            <div className="w-full relative flex flex-col items-center">
              <div className="absolute -top-6 opacity-0 group-hover:opacity-100 transition-opacity bg-gray-800 text-white text-[10px] px-2 py-1 rounded-md font-bold mb-1 z-10">
                {item.percentage}%
              </div>
              <div
                className="w-full bg-gradient-to-t from-blue-600 to-indigo-500 rounded-t-lg transition-all duration-500 hover:from-blue-500 hover:to-indigo-400 group-hover:shadow-lg group-hover:shadow-blue-200"
                style={{ height: `${item.percentage}%`, minHeight: '8px' }}
              ></div>
            </div>
            <span className="text-[10px] font-black text-gray-400 uppercase tracking-tighter">{item.month}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

// Donut Chart Component (Simplified SVG version)
const WeeklyStats = ({ data = {} }) => {
  const total = Object.values(data).reduce((sum, val) => sum + (val || 0), 0);

  if (total === 0) {
    return (
      <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 h-full flex items-center justify-center">
        <div className="text-center">
          <div className="text-gray-300 mb-2"><FaChartPie size={40} className="mx-auto" /></div>
          <p className="text-gray-400 text-sm font-medium">Belum ada data minggu ini</p>
        </div>
      </div>
    );
  }

  const items = [
    { label: 'Hadir', value: data.hadir, color: 'bg-emerald-500', icon: <FaCheckCircle /> },
    { label: 'Izin', value: data.izin, color: 'bg-blue-500', icon: <FaInfoCircle /> },
    { label: 'Sakit', value: data.sakit, color: 'bg-violet-500', icon: <FaProcedures /> },
    { label: 'Alpha', value: data.alpha, color: 'bg-red-500', icon: <FaTimesCircle /> },
  ];

  return (
    <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 flex flex-col h-full">
      <div className="flex items-center gap-3 mb-8">
        <div className="w-10 h-10 bg-emerald-50 text-emerald-600 rounded-xl flex items-center justify-center text-lg shadow-sm">
          <FaChartPie />
        </div>
        <div>
          <h3 className="font-black text-gray-800 leading-tight">Statistik Kehadiran</h3>
          <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Akumulasi Seluruh Data</p>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row items-center justify-between gap-8 flex-1">
        <div className="relative w-32 h-32 flex items-center justify-center">
          {/* Simple CSS-based donut for layout */}
          <div className="absolute inset-0 rounded-full border-[12px] border-gray-100"></div>
          <div className="flex flex-col items-center">
            <span className="text-3xl font-black text-gray-800 tracking-tighter">{total}</span>
            <span className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Hari</span>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-x-6 gap-y-4 w-full sm:w-auto">
          {items.map((item, i) => (
            <div key={i} className="flex items-center gap-3">
              <div className={`w-3 h-3 rounded-full ${item.color} shadow-sm`}></div>
              <div>
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest leading-none">{item.label}</p>
                <p className="text-lg font-black text-gray-800 tracking-tighter">{item.value}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

// Profile Modal Component
const ProfileModal = ({ isOpen, onClose, profile, onLogout, profileImage, onUpdateProfileImage, onShowAlert }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4" onClick={onClose}>
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in duration-300" onClick={(e) => e.stopPropagation()}>
        <div className="p-6 border-b border-gray-100 flex items-center gap-4">
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-xl transition-colors text-gray-400">
            <FaArrowLeft size={20} />
          </button>
          <h2 className="text-xl font-black text-gray-800 tracking-tight">Informasi Akun</h2>
        </div>

        <div className="p-8">
          <div className="flex flex-col items-center mb-8">
            <div className="relative group">
              <div className="w-28 h-28 rounded-3xl overflow-hidden border-4 border-white shadow-xl mb-4 bg-gray-100 flex items-center justify-center text-gray-300 transition-transform hover:scale-105 duration-300">
                {profileImage ? (
                  <img src={profileImage} alt="Profile" className="w-full h-full object-cover" />
                ) : (
                  <FaUser size={48} />
                )}
              </div>
              <label htmlFor="profile-upload" className="absolute -bottom-2 -right-2 bg-blue-600 text-white p-3 rounded-2xl cursor-pointer hover:bg-blue-700 transition-all shadow-lg hover:shadow-blue-200">
                <FaCamera size={16} />
              </label>
              <input id="profile-upload" type="file" accept="image/*" onChange={(e) => {
                const file = e.target.files[0];
                if (file) {
                  const reader = new FileReader();
                  reader.onloadend = () => onUpdateProfileImage(reader.result);
                  reader.readAsDataURL(file);
                  onShowAlert('success', 'Berhasil', 'Foto profil diperbarui!');
                }
              }} className="hidden" />
            </div>
            <h3 className="text-xl font-black text-gray-800 mt-2">{profile.name}</h3>
            <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">{profile.kelas}</p>
          </div>

          <div className="space-y-4 mb-10">
            <InfoItem label="Nama Lengkap" value={profile.name} icon={<FaUser />} />
            <InfoItem label="Kelas & Jurusan" value={profile.kelas} icon={<FaBookOpen />} />
            <InfoItem label="Nomor Induk Siswa" value={profile.id} icon={<FaIdCard className="hidden" />} />
          </div>

          <button
            onClick={onLogout}
            className="w-full flex items-center justify-center gap-3 py-4 bg-red-50 text-red-600 rounded-2xl hover:bg-red-100 transition-all font-black text-sm uppercase tracking-widest shadow-sm"
          >
            <FaSignOutAlt className="text-lg" />
            Keluar Aplikasi
          </button>
        </div>
      </div>
    </div>
  );
};

const InfoItem = ({ label, value, icon }) => (
  <div className="bg-gray-50/80 p-4 rounded-2xl border border-gray-100 shadow-inner flex items-center gap-4 group hover:bg-white hover:shadow-sm transition-all duration-300">
    <div className="w-10 h-10 bg-white rounded-xl shadow-sm flex items-center justify-center text-gray-400 group-hover:text-blue-500 transition-colors">
      {icon}
    </div>
    <div>
      <span className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-0.5">{label}</span>
      <span className="block text-sm font-black text-gray-700 tracking-tight">{value}</span>
    </div>
  </div>
);

// Main Dashboard Component
const DashboardSiswa = () => {
  const [showSubjects, setShowSubjects] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const [currentDateTime, setCurrentDateTime] = useState(new Date());
  const [profileImage, setProfileImage] = useState(null);
  const [alertState, setAlertState] = useState({ show: false, type: '', title: '', message: '', action: null });

  const [profile] = useState(() => {
    const userData = JSON.parse(localStorage.getItem('user_data') || '{}');
    return {
      name: userData.name || 'Siswa',
      kelas: typeof userData.class_name === 'object' ? userData.class_name?.name : (userData.class_name || '-'),
      id: userData.nisn || '-'
    };
  });
  const [weeklyStats, setWeeklyStats] = useState({ hadir: 0, izin: 0, sakit: 0, alpha: 0 });
  const [monthlyTrend, setMonthlyTrend] = useState([]);
  const [scheduleImage, setScheduleImage] = useState(null);
  const [todaySchedule, setScheduleToday] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingSchedule, setIsLoadingSchedule] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const timer = setInterval(() => setCurrentDateTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const controller = new AbortController();

    const fetchDashboardData = async () => {
      try {
        setIsLoading(true);
        setError(null);
        // Fetch Attendance Summary
        const summaryResponse = await getMyAttendanceSummary({ signal: controller.signal });
        const summaryData = summaryResponse.data;
        if (summaryData.status_summary) {
          const stats = summaryData.status_summary.reduce((acc, item) => {
            const status = item.status.toLowerCase();
            if (status === 'present') acc.hadir = item.total;
            else if (status === 'excused' || status === 'izin') acc.izin = item.total;
            else if (status === 'sick' || status === 'sakit') acc.sakit = item.total;
            else if (status === 'absent' || status === 'alpha') acc.alpha = item.total;
            return acc;
          }, { hadir: 0, izin: 0, sakit: 0, alpha: 0 });
          setWeeklyStats(stats);
        }

        if (summaryData.daily_summary) {
          const monthlyData = summaryData.daily_summary.reduce((acc, item) => {
            const date = new Date(item.day);
            const monthName = date.toLocaleString('id-ID', { month: 'short' });
            if (!acc[monthName]) acc[monthName] = { present: 0, total: 0 };
            acc[monthName].total += item.total;
            if (item.status === 'present' || item.status === 'late') acc[monthName].present += item.total;
            return acc;
          }, {});

          const monthlyArray = Object.keys(monthlyData).map(month => ({
            month: month,
            percentage: Math.round((monthlyData[month].present / monthlyData[month].total) * 100)
          })).slice(-6);

          if (monthlyArray.length > 0) setMonthlyTrend(monthlyArray);
        }

        // Fetch Today's Schedule
        setIsLoadingSchedule(true);
        const { default: apiClient } = await import('../../services/api');
        const scheduleRes = await apiClient.get('/me/dashboard/summary', { signal: controller.signal });
        setScheduleToday(scheduleRes.data.schedule_today || []);

      } catch (error) {
        if (error.name !== 'AbortError') {
          console.error('Error fetching dashboard data:', error);
          setError('Gagal memuat data dashboard. Silakan coba lagi.');
        }
      } finally {
        setIsLoading(false);
        setIsLoadingSchedule(false);
      }
    };

    fetchDashboardData();
    return () => controller.abort();
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('auth_token');
    localStorage.removeItem('user_data');
    localStorage.removeItem('user_role');
    window.location.href = '/';
  };

  return (
    <PageWrapper className="min-h-screen bg-gray-50 pb-28 font-sans">
      <CustomAlert
        isOpen={alertState.show}
        onClose={() => setAlertState({ ...alertState, show: false })}
        title={alertState.title}
        message={alertState.message}
        type={alertState.type}
        onConfirm={alertState.action === 'logout' ? handleLogout : () => setAlertState({ ...alertState, show: false })}
        confirmLabel="Ya"
        cancelLabel="Batal"
      />

      {/* HERO HEADER */}
      <div className="bg-gradient-to-br from-blue-700 via-indigo-700 to-indigo-900 text-white pt-10 pb-24 px-6 rounded-b-[3.5rem] shadow-2xl relative overflow-hidden">
        {/* Background Decor */}
        <div className="absolute top-0 right-0 w-80 h-80 bg-white/10 rounded-full blur-3xl -mr-20 -mt-20"></div>
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-indigo-500/20 rounded-full blur-3xl -ml-20 -mb-20"></div>

        <div className="max-w-5xl mx-auto flex items-center justify-between relative z-10">
          <div className="flex items-center gap-6 cursor-pointer group" onClick={() => setShowProfile(true)}>
            <div className="w-20 h-20 rounded-3xl bg-white/20 backdrop-blur-md p-1 shadow-2xl border border-white/30 transform transition-transform group-hover:scale-105 duration-300 overflow-hidden">
              {profileImage ? (
                <img src={profileImage} alt="Profile" className="w-full h-full object-cover rounded-2xl" />
              ) : (
                <div className="w-full h-full rounded-2xl bg-white flex items-center justify-center text-blue-600 shadow-inner">
                  <FaUser size={36} />
                </div>
              )}
            </div>
            <div>
              <p className="text-blue-100 text-xs font-bold uppercase tracking-widest mb-1 opacity-80">Selamat Datang,</p>
              <h1 className="text-2xl font-black text-white leading-tight tracking-tight drop-shadow-md">{profile.name}</h1>
              <div className="flex items-center gap-2 mt-2">
                <span className="bg-white/20 backdrop-blur-md px-3 py-1 rounded-full text-[10px] font-black border border-white/20 uppercase tracking-widest">
                  {profile.kelas}
                </span>
                <span className="bg-emerald-400 w-2 h-2 rounded-full animate-pulse shadow-[0_0_8px_rgba(52,211,153,0.8)]"></span>
                <span className="text-[10px] font-bold text-blue-100">Aktif</span>
              </div>
            </div>
          </div>

          <button
            onClick={() => setAlertState({ show: true, type: 'confirm', title: 'Logout', message: 'Keluar dari aplikasi?', action: 'logout' })}
            className="w-12 h-12 bg-white/10 hover:bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center text-white transition-all shadow-lg border border-white/10 group"
          >
            <FaSignOutAlt className="group-hover:translate-x-1 transition-transform" />
          </button>
        </div>
      </div>

      {/* DASHBOARD CONTENT */}
      <main className="px-6 -mt-12 relative z-20 space-y-6 max-w-5xl mx-auto">

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-pulse">
            <div className="bg-gray-100 h-64 rounded-[2rem]"></div>
            <div className="bg-gray-100 h-64 rounded-[2rem]"></div>
          </div>
        ) : error ? (
          <div className="bg-red-50 border border-red-100 text-red-600 p-8 rounded-[2rem] flex items-center gap-4 shadow-sm">
            <FaInfoCircle className="shrink-0 text-2xl" />
            <p className="font-bold">{error}</p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Card: Waktu Real-time */}
              <div className="bg-white rounded-[2rem] shadow-sm border border-gray-100 p-8 flex flex-col justify-between hover:shadow-md transition-shadow">
                <div className="flex justify-between items-start mb-6">
                  <div>
                    <h3 className="text-lg font-black text-gray-800 tracking-tight flex items-center gap-2">
                      <FaClock className="text-blue-600" /> Waktu Saat Ini
                    </h3>
                    <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mt-1">Gunakan untuk patokan presensi</p>
                  </div>
                </div>

                <div className="flex flex-col items-center justify-center py-4">
                  <div className="text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-gray-800 to-gray-500 font-mono tracking-tighter">
                    {currentDateTime.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                  </div>
                  <div className="flex items-center gap-2 text-gray-500 font-bold text-sm mt-3 bg-gray-50 px-4 py-1.5 rounded-full border border-gray-100">
                    <FaCalendarAlt size={12} className="text-blue-500" />
                    {currentDateTime.toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
                  </div>
                </div>

                <div className="mt-8 grid grid-cols-2 gap-3">
                  <div className="bg-emerald-50/50 p-3 rounded-2xl border border-emerald-100/50 text-center">
                    <span className="text-[9px] font-black text-emerald-400 uppercase tracking-widest block mb-1">Masuk</span>
                    <span className="text-sm font-black text-emerald-700">07:00 WIB</span>
                  </div>
                  <div className="bg-red-50/50 p-3 rounded-2xl border border-red-100/50 text-center">
                    <span className="text-[9px] font-black text-red-400 uppercase tracking-widest block mb-1">Pulang</span>
                    <span className="text-sm font-black text-red-700">15:00 WIB</span>
                  </div>
                </div>
              </div>

              {/* Card: Pintasan Jadwal */}
              <div className="bg-white rounded-[2rem] shadow-sm border border-gray-100 p-8 flex flex-col hover:shadow-md transition-shadow">
                <h3 className="text-lg font-black text-gray-800 tracking-tight flex items-center gap-2 mb-6">
                  <FaBookOpen className="text-indigo-600" /> Jadwal Pelajaran
                </h3>

                <div className="bg-gradient-to-br from-indigo-50 to-blue-50 rounded-[1.5rem] p-6 mb-6 border border-indigo-100 relative overflow-hidden flex-1 flex flex-col justify-center">
                  <div className="relative z-10">
                    <p className="text-[10px] text-indigo-400 font-black uppercase tracking-widest mb-1">
                      {todaySchedule.length > 0 ? 'Pelajaran Hari Ini' : 'Tidak Ada Jadwal'}
                    </p>
                    <h4 className="text-2xl font-black text-indigo-900 leading-tight">
                      {todaySchedule.length > 0
                        ? (todaySchedule.find(s => {
                          const now = new Date();
                          const start = new Date(now.toDateString() + ' ' + s.start_time);
                          const end = new Date(now.toDateString() + ' ' + s.end_time);
                          return now >= start && now <= end;
                        })?.subject || todaySchedule[0].subject)
                        : 'Mata Pelajaran Belum Tersedia'}
                    </h4>
                  </div>
                  <FaBookOpen size={80} className="absolute right-[-10px] bottom-[-10px] text-indigo-200/50 transform rotate-12" />
                </div>

                <button
                  onClick={() => setShowSubjects(true)}
                  className="w-full py-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl font-black text-sm uppercase tracking-widest transition-all shadow-lg shadow-indigo-200 hover:-translate-y-1 active:scale-95 flex items-center justify-center gap-3"
                >
                  <FaBookOpen /> Lihat Detail Jadwal
                </button>
              </div>
            </div>

            {/* STATS SECTION */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <AttendanceTrend data={monthlyTrend} />
              <WeeklyStats data={weeklyStats} />
            </div>
          </>
        )}
      </main>

      <SubjectsModal
        isOpen={showSubjects}
        onClose={() => setShowSubjects(false)}
        schedules={todaySchedule}
        isLoading={isLoadingSchedule}
      />

      <ProfileModal
        isOpen={showProfile}
        onClose={() => setShowProfile(false)}
        profile={profile}
        profileImage={profileImage}
        onUpdateProfileImage={setProfileImage}
        onLogout={() => setAlertState({ show: true, type: 'confirm', title: 'Logout', message: 'Keluar dari aplikasi?', action: 'logout' })}
        onShowAlert={(type, title, message) => setAlertState({ show: true, type, title, message })}
      />

      {/* QR SCAN BUTTON - Fixed Position by component */}
      <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-40 transform active:scale-90 transition-transform">
        <QRScanButton onSuccess={() => window.location.reload()} />
      </div>

    </PageWrapper>
  );
};

export default DashboardSiswa;