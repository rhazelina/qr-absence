import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  FaUser,
  FaClock,
  FaCalendarAlt,
  FaUsers,
  FaLayerGroup,
  FaSignOutAlt,
  FaBook,
  FaArrowRight,
  FaChevronRight,
  FaBell,
  FaInfoCircle
} from 'react-icons/fa';
import CustomAlert from '../../components/Common/CustomAlert';
import { getHomeroomDashboard } from '../../services/attendance';
import PageWrapper from '../../components/ui/PageWrapper';

const DashboardWakel = () => {
  const navigate = useNavigate();
  const [currentTime, setCurrentTime] = useState(new Date());
  const [selectedSchedule, setSelectedSchedule] = useState(null);
  const [alertState, setAlertState] = useState({ show: false, type: 'confirm', title: '', message: '' });

  const [scheduleData, setScheduleData] = useState([]);
  const [stats, setStats] = useState({ totalKelas: 0, totalSiswa: 0 });
  const [completedAbsensi, setCompletedAbsensi] = useState(new Set());
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const controller = new AbortController();

    const fetchDashboardData = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const dashboardData = await getHomeroomDashboard({ signal: controller.signal });

        if (dashboardData.schedules) {
          const formattedSchedules = dashboardData.schedules.map(s => ({
            id: s.id,
            mataPelajaran: s.subject_name,
            kelas: s.class_name,
            classId: s.class_id,
            jamKe: s.time_slot,
            waktu: `${s.start_time} - ${s.end_time}`
          }));
          setScheduleData(formattedSchedules);
        }
        setStats({
          totalKelas: dashboardData.total_classes || 0,
          totalSiswa: dashboardData.total_students || 0
        });
      } catch (error) {
        if (error.name !== 'AbortError') {
          console.error('Failed to fetch dashboard data:', error);
          setError('Gagal memuat data dashboard. Silakan coba lagi.');
          setScheduleData([]);
          setStats({ totalKelas: 0, totalSiswa: 0 });
        }
      } finally {
        setIsLoading(false);
      }
    };
    fetchDashboardData();

    return () => controller.abort();
  }, []);

  const formatTime = (date) => date.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
  const formatDate = (date) => {
    return date.toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
  };


  const handleConfirmLogout = () => {
    localStorage.removeItem('auth_token'); localStorage.removeItem('user_role'); localStorage.removeItem('user_data'); sessionStorage.clear(); navigate('/login');
  };

  return (
    <PageWrapper className="flex min-h-[calc(100vh-80px)] bg-transparent font-sans">

      {/* Main Content */}
      <main className="flex-1 min-w-0">
        <div className="p-6 md:p-10 lg:p-12 max-w-[1400px] mx-auto space-y-10">

          {/* HEADER SECTION */}
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-8 bg-white/80 backdrop-blur-md p-8 md:p-10 rounded-[2.5rem] shadow-sm border border-white/50">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <span className="w-8 h-1.5 bg-indigo-600 rounded-full"></span>
                <h1 className="text-3xl md:text-4xl font-black text-gray-800 tracking-tight">Halo, Wali Kelas!</h1>
              </div>
              <p className="text-gray-500 font-medium ml-11">Monitor kehadiran siswa binaan Anda dalam satu dasbor.</p>
            </div>

            <div className="flex items-center gap-6 bg-gray-50/50 p-6 rounded-3xl border border-gray-100 shadow-inner ml-auto lg:ml-0">
              <div className="text-right">
                <div className="text-3xl font-black text-indigo-600 font-mono tracking-tighter leading-none mb-1">
                  {formatTime(currentTime)}
                </div>
                <div className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
                  {formatDate(currentTime)}
                </div>
              </div>
              <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-indigo-500 shadow-sm border border-gray-100"><FaClock /></div>
            </div>
          </div>

          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 animate-pulse">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="bg-gray-100 h-32 rounded-[2.5rem]"></div>
              ))}
            </div>
          ) : error ? (
            <div className="bg-red-50 border border-red-100 text-red-600 p-6 rounded-3xl flex items-center gap-4 shadow-sm">
              <FaInfoCircle className="shrink-0" />
              <p className="font-bold">{error}</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              <StatCard
                label="Kelas Binaan"
                value={stats.totalKelas}
                unit="Rombel"
                icon={<FaLayerGroup />}
                color="blue"
              />
              <StatCard
                label="Total Siswa"
                value={stats.totalSiswa}
                unit="Peserta"
                icon={<FaUsers />}
                color="emerald"
                onClick={() => navigate('/walikelas/datasiswa')}
              />
              <div className="bg-gradient-to-br from-indigo-600 to-blue-800 rounded-[2.5rem] shadow-xl p-8 text-white relative overflow-hidden group">
                <div className="relative z-10 h-full flex flex-col justify-between">
                  <div>
                    <p className="text-[10px] font-black text-indigo-200 uppercase tracking-[0.2em] mb-2">Status Akun</p>
                    <h4 className="text-2xl font-black italic">Wali Kelas Aktif</h4>
                  </div>
                  <div className="flex items-center gap-2 mt-4 bg-white/10 w-fit px-4 py-2 rounded-xl backdrop-blur-sm border border-white/10">
                    <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse shadow-[0_0_8px_rgba(52,211,153,0.8)]"></div>
                    <span className="text-[10px] font-black uppercase tracking-widest">Verified System</span>
                  </div>
                </div>
                <FaUser size={120} className="absolute -right-8 -bottom-8 text-white/5 transform -rotate-12 group-hover:scale-110 transition-transform duration-1000" />
              </div>
            </div>
          )}

          {/* SCHEDULE SECTION */}
          <div className="space-y-8">
            <div className="flex items-center gap-4 px-4">
              <h3 className="text-2xl font-black text-gray-800 tracking-tight uppercase italic flex items-center gap-3">
                Jadwal Mengajar Anda
              </h3>
              <div className="h-px flex-1 bg-gray-200"></div>
              <div className="p-2 bg-amber-50 text-amber-500 rounded-full animate-pulse border border-amber-100 shadow-sm">
                <FaBell size={14} />
              </div>
            </div>

            <div className="grid gap-6">
              {scheduleData.length > 0 ? (
                scheduleData.map((item) => (
                  <div
                    key={item.id}
                    className="group bg-white flex flex-col sm:flex-row items-center justify-between p-8 rounded-[2.5rem] border border-gray-100 hover:border-indigo-200 hover:shadow-2xl hover:shadow-indigo-100/30 transition-all cursor-pointer relative overflow-hidden"
                    onClick={() => setSelectedSchedule(item)}
                  >
                    <div className="flex items-center gap-8 w-full">
                      <div className="w-16 h-16 rounded-3xl bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0 shadow-inner group-hover:scale-110 transition-transform duration-500">
                        <FaBook size={24} />
                      </div>
                      <div className="flex-1">
                        <div className="flex flex-wrap items-center gap-3 mb-2">
                          <h4 className="text-2xl font-black text-gray-800 group-hover:text-indigo-700 transition-colors leading-tight">{item.mataPelajaran}</h4>
                          <span className="px-4 py-1 bg-gray-100 text-gray-500 rounded-xl text-[10px] font-black uppercase tracking-widest border border-gray-200">{item.kelas}</span>
                        </div>
                        <div className="flex items-center gap-6 text-xs font-black text-gray-400 uppercase tracking-widest">
                          <div className="flex items-center gap-2 text-indigo-400"><FaClock /> Jam ke-{item.jamKe}</div>
                          <div className="flex items-center gap-2">{item.waktu}</div>
                        </div>
                      </div>
                    </div>

                    <div className="mt-6 sm:mt-0 flex items-center gap-6 w-full sm:w-auto">
                      <div className={`text-[10px] font-black uppercase tracking-[0.2em] px-6 py-2.5 rounded-2xl border transition-all
                            ${completedAbsensi.has(item.id)
                          ? 'bg-emerald-50 text-emerald-600 border-emerald-100 shadow-sm'
                          : 'bg-gray-50 text-gray-400 border-gray-100'
                        }`}
                      >
                        {completedAbsensi.has(item.id) ? 'Selesai' : 'Terjadwal'}
                      </div>
                      <div className="w-12 h-12 rounded-2xl bg-indigo-600 text-white flex items-center justify-center shadow-lg shadow-indigo-200 group-hover:translate-x-2 transition-transform duration-500">
                        <FaChevronRight size={16} />
                      </div>
                    </div>
                    <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-50 rounded-bl-[6rem] -mr-12 -mt-12 opacity-0 group-hover:opacity-100 transition-opacity duration-700"></div>
                  </div>
                ))
              ) : (
                <div className="flex flex-col items-center justify-center py-24 bg-white/50 backdrop-blur rounded-[3rem] border-2 border-dashed border-gray-200 shadow-inner">
                  <div className="w-24 h-24 bg-gray-50 rounded-[2rem] flex items-center justify-center text-gray-200 mb-6">
                    <FaBook size={48} />
                  </div>
                  <p className="font-black text-gray-400 uppercase tracking-widest text-sm italic">Tidak ada jadwal hari ini</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>

      {/* MODAL JADWAL */}
      {selectedSchedule && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-md p-4" onClick={() => setSelectedSchedule(null)}>
          <div className="bg-white rounded-[3rem] shadow-2xl w-full max-w-xl overflow-hidden animate-in fade-in zoom-in duration-300" onClick={(e) => e.stopPropagation()}>
            <div className="bg-gradient-to-br from-indigo-600 to-indigo-900 p-10 text-white relative">
              <div className="flex items-center gap-6">
                <div className="w-20 h-20 bg-white/20 backdrop-blur-md rounded-3xl flex items-center justify-center shadow-inner ring-4 ring-white/10">
                  <FaBook size={32} />
                </div>
                <div>
                  <h2 className="text-3xl font-black tracking-tight leading-tight">{selectedSchedule.mataPelajaran}</h2>
                  <p className="text-indigo-100 text-[10px] font-black uppercase tracking-[0.3em] mt-2 opacity-80">Kelas Binaan: {selectedSchedule.kelas}</p>
                </div>
              </div>
              <button onClick={() => setSelectedSchedule(null)} className="absolute top-8 right-8 text-white/60 hover:text-white transition-colors text-4xl leading-none font-light">&times;</button>
            </div>

            <div className="p-10 space-y-10">
              <div className="grid grid-cols-2 gap-6">
                <DetailBox label="Jam Pelajaran" value={`Ke-${selectedSchedule.jamKe}`} icon={<FaClock className="text-indigo-400" />} />
                <DetailBox label="Rentang Waktu" value={selectedSchedule.waktu} icon={<FaCalendarAlt className="text-indigo-400" />} />
              </div>

              <div className="bg-emerald-50 rounded-[2rem] p-8 flex items-center justify-between border border-emerald-100 shadow-inner">
                <div className="flex items-center gap-5">
                  <div className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center text-emerald-500 shadow-sm border border-emerald-50">
                    <FaCheckCircle size={20} />
                  </div>
                  <div>
                    <h3 className="text-emerald-900 font-black text-sm uppercase tracking-widest">Status Anda</h3>
                    <p className="text-emerald-600 text-[10px] font-black mt-1 bg-white/50 px-3 py-1 rounded-full w-fit border border-emerald-100/50">VERIFIKASI HADIR</p>
                  </div>
                </div>
              </div>

              <button
                className="w-full py-6 bg-indigo-600 hover:bg-indigo-700 text-white rounded-[1.5rem] font-black text-sm uppercase tracking-[0.2em] shadow-xl shadow-indigo-200 transition-all hover:-translate-y-1 active:scale-[0.98] flex items-center justify-center gap-4"
                onClick={() => {
                  const data = {
                    mataPelajaran: selectedSchedule.mataPelajaran,
                    jamKe: selectedSchedule.jamKe,
                    kelas: selectedSchedule.kelas,
                    waktu: selectedSchedule.waktu,
                    tanggal: formatDate(currentTime),
                    scheduleId: selectedSchedule.id,
                    classId: selectedSchedule.classId
                  };
                  setCompletedAbsensi(prev => new Set([...prev, selectedSchedule.id]));
                  sessionStorage.setItem('presensiData', JSON.stringify(data));
                  navigate('/walikelas/presensi', { state: data });
                }}
              >
                MULAI SESI PRESENSI <FaArrowRight />
              </button>
            </div>
          </div>
        </div>
      )}

      <CustomAlert
        isOpen={alertState.show}
        onClose={() => setAlertState({ ...alertState, show: false })}
        title={alertState.title}
        message={alertState.message}
        type={alertState.type}
        onConfirm={handleConfirmLogout}
        confirmLabel="Ya, Keluar"
        cancelLabel="Batal"
      />
    </PageWrapper>
  );
};


const StatCard = ({ label, value, unit, icon, color, onClick }) => {
  const configs = {
    blue: "bg-blue-50 text-blue-600 border-blue-100",
    emerald: "bg-emerald-50 text-emerald-600 border-emerald-100",
  };
  const config = configs[color];

  return (
    <div
      onClick={onClick}
      className={`bg-white rounded-[2.5rem] p-10 shadow-sm border border-gray-100 flex items-center gap-8 hover:shadow-2xl hover:-translate-y-2 transition-all cursor-pointer group relative overflow-hidden`}
    >
      <div className={`w-16 h-16 ${config} rounded-[1.5rem] flex items-center justify-center text-2xl shadow-lg group-hover:scale-110 transition-transform duration-500 shrink-0`}>
        {icon}
      </div>
      <div>
        <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-1">{label}</p>
        <div className="flex items-baseline gap-2">
          <span className="text-4xl font-black text-gray-800 tracking-tighter">{value}</span>
          <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{unit}</span>
        </div>
      </div>
      <div className={`absolute -right-4 -bottom-4 w-24 h-24 rounded-full opacity-[0.03] group-hover:opacity-[0.08] transition-opacity duration-500 ${config.split(' ')[0]}`}></div>
    </div>
  );
};

const DetailBox = ({ label, value, icon }) => (
  <div className="bg-gray-50 p-6 rounded-3xl border border-gray-100 shadow-inner flex flex-col items-center text-center group hover:bg-white hover:shadow-md transition-all duration-300">
    <div className="w-10 h-10 bg-white rounded-xl shadow-sm flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">{icon}</div>
    <span className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-1">{label}</span>
    <div className="text-sm font-black text-gray-800 tracking-tight">{value}</div>
  </div>
);

export default DashboardWakel;