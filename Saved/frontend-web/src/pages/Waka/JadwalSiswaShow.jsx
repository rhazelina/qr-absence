import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import './JadwalSiswaShow.css';
import NavbarWaka from '../../components/Waka/NavbarWaka';
import apiService from '../../utils/api';
import {
  FaCalendarAlt,
  FaArrowLeft,
  FaPrint,
  FaEdit,
  FaUserGraduate,
  FaChevronRight,
  FaSpinner,
  FaBook,
  FaMapMarkerAlt,
  FaClock
} from 'react-icons/fa';

function JadwalSiswaShow() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [schedule, setSchedule] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSchedule();
  }, [id]);

  const fetchSchedule = async () => {
    setLoading(true);
    try {
      const result = await apiService.get(`/schedules/${id}`);
      const data = result?.data || result;
      setSchedule(data);
    } catch (error) {
      console.error('Error fetching schedule:', error);
      alert('Gagal memuat data jadwal');
      navigate('/waka/jadwal-siswa');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="jadwal-siswa-show-loading-screen">
        <FaSpinner className="animate-spin text-4xl text-blue-600 mb-4" />
        <p className="font-bold text-gray-500">Memuat data jadwal...</p>
      </div>
    );
  }

  if (!schedule) {
    return (
      <div className="jadwal-siswa-show-loading-screen flex-col">
        <p className="mb-4">Data tidak ditemukan</p>
        <Link to="/waka/jadwal-siswa" className="bg-blue-600 text-white px-4 py-2 rounded-lg">Kembali</Link>
      </div>
    );
  }

  const dayOrder = { 'Senin': 1, 'Selasa': 2, 'Rabu': 3, 'Kamis': 4, 'Jumat': 5, 'Sabtu': 6, 'Minggu': 7 };
  const sortedDays = schedule.daily_schedules?.sort((a, b) => (dayOrder[a.day] || 99) - (dayOrder[b.day] || 99)) || [];

  return (
    <div className="jadwal-siswa-show-root min-h-screen bg-gray-50 pb-20">
      <NavbarWaka />

      <div className="jadwal-siswa-show-container max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
        {/* BREADCRUMB */}
        <div className="jadwal-siswa-show-breadcrumb mb-6 flex items-center text-sm text-gray-500">
          <Link to="/waka/jadwal-siswa" className="flex items-center text-blue-600 font-semibold hover:underline">
            <FaCalendarAlt className="mr-2" />
            <span>Jadwal Siswa</span>
          </Link>
          <FaChevronRight className="mx-2 text-gray-400" />
          <span className="font-medium">{schedule.class?.name || 'Detail Kelas'}</span>
        </div>

        {/* HEADER */}
        <div className="jadwal-siswa-show-header bg-gradient-to-br from-blue-900 to-blue-700 rounded-2xl p-6 mb-8 text-white shadow-lg">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="flex items-center gap-6">
              <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center text-3xl">
                <FaUserGraduate />
              </div>
              <div>
                <h1 className="text-2xl font-extrabold tracking-tight">Jadwal Pembelajaran</h1>
                <p className="text-blue-100 font-medium">
                  {schedule.class?.major?.name || schedule.class?.major_name || 'Kompetensi Keahlian'}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={() => window.print()}
                className="flex items-center gap-2 px-4 py-2.5 bg-white/20 hover:bg-white/30 rounded-xl transition-all font-bold text-sm"
              >
                <FaPrint /> <span>Cetak</span>
              </button>
              <Link
                to={`/waka/jadwal-siswa/${id}/edit`}
                className="flex items-center gap-2 px-4 py-2.5 bg-orange-500 hover:bg-orange-600 rounded-xl transition-all font-bold text-sm shadow-sm"
              >
                <FaEdit /> <span>Ubah Jadwal</span>
              </Link>
              <Link
                to="/waka/jadwal-siswa"
                className="flex items-center gap-2 px-4 py-2.5 bg-white/10 hover:bg-white/20 rounded-xl transition-all font-bold text-sm"
              >
                <FaArrowLeft /> <span>Kembali</span>
              </Link>
            </div>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mt-8">
            <div className="bg-white/10 backdrop-blur-sm p-4 rounded-xl border border-white/5">
              <span className="text-[10px] uppercase tracking-widest text-blue-200 block mb-1 font-bold">Wali Kelas</span>
              <strong className="text-sm block truncate">{schedule.class?.homeroom_teacher?.user?.name || '-'}</strong>
            </div>
            <div className="bg-white/10 backdrop-blur-sm p-4 rounded-xl border border-white/5">
              <span className="text-[10px] uppercase tracking-widest text-blue-200 block mb-1 font-bold">Kelas</span>
              <strong className="text-sm block truncate">{schedule.class?.name || '-'}</strong>
            </div>
            <div className="bg-white/10 backdrop-blur-sm p-4 rounded-xl border border-white/5">
              <span className="text-[10px] uppercase tracking-widest text-blue-200 block mb-1 font-bold">Tahun Ajaran</span>
              <strong className="text-sm block">TA {schedule.year || '-'}</strong>
            </div>
            <div className="bg-white/10 backdrop-blur-sm p-4 rounded-xl border border-white/5">
              <span className="text-[10px] uppercase tracking-widest text-blue-200 block mb-1 font-bold">Status</span>
              <div className="flex items-center gap-2 mt-1">
                <div className={`w-2 h-2 rounded-full ${schedule.is_active ? 'bg-green-400' : 'bg-gray-400'}`}></div>
                <strong className="text-sm">{schedule.is_active ? 'Aktif' : 'Non-Aktif'}</strong>
              </div>
            </div>
          </div>
        </div>

        {/* CONTENT CARD */}
        <div className="jadwal-siswa-show-card bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="px-6 py-5 border-b border-gray-50 bg-gray-50/30 flex items-center justify-between">
            <div>
              <h2 className="text-lg font-extrabold text-gray-900 flex items-center gap-2">
                <FaCalendarAlt className="text-blue-600" /> Matriks Jadwal Pelajaran
              </h2>
              <p className="text-xs text-gray-500 mt-0.5">Daftar mata pelajaran yang diampu oleh setiap tenaga pengajar</p>
            </div>
          </div>

          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {sortedDays.map((day) => (
                <div key={day.id} className="flex flex-col bg-white border border-gray-100 rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-all">
                  <div className="bg-blue-50/50 px-5 py-3 border-b border-gray-100">
                    <h3 className="font-extrabold text-blue-900 uppercase tracking-wider text-sm">{day.day}</h3>
                  </div>
                  <div className="flex-1 divide-y divide-gray-50">
                    {day.schedule_items?.length > 0 ? (
                      day.schedule_items.sort((a, b) => (a.start_time || '').localeCompare(b.start_time || '')).map((item) => (
                        <div key={item.id} className="p-4 hover:bg-blue-50/30 transition-colors group">
                          <div className="flex justify-between items-start mb-2">
                            <h4 className="font-bold text-gray-900 group-hover:text-blue-700 transition-colors flex items-center gap-2">
                              <FaBook className="text-blue-400 text-xs" />
                              {item.subject?.name || 'Unknown Subject'}
                            </h4>
                            <span className="px-2 py-0.5 bg-gray-100 text-gray-600 rounded text-[10px] font-bold flex items-center gap-1">
                              <FaMapMarkerAlt /> {item.room || '-'}
                            </span>
                          </div>
                          <div className="text-sm text-gray-600 mb-3 flex items-center gap-2">
                             <div className="w-5 h-5 bg-gray-200 rounded-full overflow-hidden flex-shrink-0">
                                <FaUserGraduate className="m-auto text-[10px] text-gray-500" />
                             </div>
                             <span className="truncate">{item.teacher?.user?.name || item.teacher?.nama_guru || 'Staff Pengajar'}</span>
                          </div>
                          <div className="flex items-center gap-2 font-bold text-[11px] text-blue-600 bg-blue-50 w-fit px-2 py-1 rounded-lg">
                            <FaClock />
                            {item.start_time?.substring(0, 5)} - {item.end_time?.substring(0, 5)}
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="flex flex-col items-center justify-center py-12 text-gray-400">
                        <FaSpinner className="text-xl mb-2 opacity-20" />
                        <span className="text-xs font-medium italic">Tidak ada jadwal</span>
                      </div>
                    )}
                  </div>
                </div>
              ))}

              {sortedDays.length === 0 && (
                <div className="col-span-full flex flex-col items-center justify-center py-20 bg-gray-50 border-2 border-dashed border-gray-200 rounded-2xl">
                   <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center text-gray-400 text-2xl mb-4">
                      <FaCalendarAlt />
                   </div>
                   <h3 className="text-lg font-bold text-gray-700">Jadwal Masih Kosong</h3>
                   <p className="text-gray-500 mb-6">Silahkan tambahkan jadwal pembelajaran untuk kelas ini</p>
                   <Link to={`/waka/jadwal-siswa/${id}/edit`} className="px-6 py-2 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 transition-all shadow-md">
                      Mulai Atur Jadwal
                   </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default JadwalSiswaShow;
